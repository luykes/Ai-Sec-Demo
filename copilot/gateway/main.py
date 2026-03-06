from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from gateway import policy
from shared.audit import append_decision, append_event
from shared.schemas import (
    Decision,
    DecisionRecord,
    RiskLevel,
    ToolCallEnvelope,
    TraceEvent,
)

app = FastAPI(title="Prompt Security Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default from environment; can be overridden per-request via headers
DEFAULT_PS_API_URL = os.getenv("PROMPT_SECURITY_API_URL", "")
DEFAULT_PS_API_KEY = os.getenv("PROMPT_SECURITY_API_KEY", "")


class DecisionRequest(BaseModel):
    envelope: ToolCallEnvelope


class DecisionResponse(BaseModel):
    trace_id: str
    decision: Decision
    reason_code: str
    reason_summary: str
    gateway_mode: str  # "real" | "mock"


async def _call_ps_api(
    api_url: str,
    api_key: str,
    prompt: str | None = None,
    system_prompt: str | None = None,
    response: str | None = None,
    username: str = "",
) -> dict | None:
    """
    Call the real Prompt Security /api/protect endpoint.
    Returns the raw PS response dict, or None on failure.

    PS API format:
      Headers: APP-ID: <key>
      Body:    { prompt, system_prompt, response, user }
      Result:  { result: { prompt: { action: allow|block|modify, modified_text }, response: { ... } } }
    """
    payload = {
        "prompt": prompt,
        "system_prompt": system_prompt,
        "response": response,
        "user": username,
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                api_url,
                json=payload,
                headers={
                    "APP-ID": api_key,
                    "Content-Type": "application/json",
                },
            )
            resp.raise_for_status()
            return resp.json()
    except Exception:
        return None  # fall through to mock


def _ps_action_to_decision(
    data: dict,
    field: str,  # "prompt" or "response"
    risk_level: "RiskLevel",
    tool_name: str,
) -> tuple[Decision, str, str]:
    """Map a PS API result to an internal Decision."""
    action = data.get("result", {}).get(field, {}).get("action", "allow").lower()
    if action == "block":
        return (
            Decision.BLOCK,
            f"PS_{field.upper()}_BLOCKED",
            f"Prompt Security blocked the {field}: policy violation detected for tool '{tool_name}'.",
        )
    if action == "modify":
        return (
            Decision.ALLOW,
            f"PS_{field.upper()}_MODIFIED",
            f"Prompt Security sanitized the {field} before execution of '{tool_name}'.",
        )
    return (
        Decision.ALLOW,
        f"PS_{field.upper()}_ALLOWED",
        f"Prompt Security allowed '{tool_name}'.",
    )


async def _call_real_ps_api(
    envelope: ToolCallEnvelope,
    api_url: str,
    api_key: str,
    username: str = "",
) -> tuple[Decision, str, str] | None:
    """
    Scan the tool call context with the real Prompt Security API.
    Constructs a prompt from user_prompt + tool name + args so PS can evaluate the full intent.
    """
    import json as _json
    tool_context = (
        f"{envelope.user_prompt}\n\n"
        f"[Agent is attempting to call tool: {envelope.tool_name} "
        f"with arguments: {_json.dumps(envelope.tool_args)}]"
    )
    data = await _call_ps_api(
        api_url=api_url,
        api_key=api_key,
        prompt=tool_context,
        system_prompt=envelope.system_prompt,
        username=username,
    )
    if data is None:
        return None
    return _ps_action_to_decision(data, "prompt", envelope.risk_level, envelope.tool_name)


@app.post("/decision", response_model=DecisionResponse)
async def make_decision(
    req: DecisionRequest,
    x_ps_api_url: str | None = Header(default=None),
    x_ps_api_key: str | None = Header(default=None),
    x_ps_username: str | None = Header(default=None),
) -> DecisionResponse:
    envelope = req.envelope
    envelope.trace_id = envelope.trace_id or str(uuid.uuid4())

    # Log the tool attempt event
    append_event(
        TraceEvent(
            trace_id=envelope.trace_id,
            session_id=envelope.session_id,
            event_type="tool_attempt",
            payload={
                "tool_name": envelope.tool_name,
                "tool_args": envelope.tool_args,
                "risk_level": envelope.risk_level.value,
                "provenance": envelope.provenance.value,
            },
        )
    )

    # Resolve credentials: request headers take priority over env vars
    api_url = (x_ps_api_url or DEFAULT_PS_API_URL).strip()
    api_key = (x_ps_api_key or DEFAULT_PS_API_KEY).strip()
    username = (x_ps_username or "").strip()

    gateway_mode = "mock"
    result = None

    if api_url and api_key:
        result = await _call_real_ps_api(envelope, api_url, api_key, username)
        if result:
            gateway_mode = "real"

    if result is None:
        result = policy.evaluate(envelope)
        gateway_mode = "mock"

    decision, reason_code, reason_summary = result

    record = DecisionRecord(
        trace_id=envelope.trace_id,
        session_id=envelope.session_id,
        tool_name=envelope.tool_name,
        tool_args=envelope.tool_args,
        risk_level=envelope.risk_level,
        provenance=envelope.provenance,
        decision=decision,
        reason_code=reason_code,
        reason_summary=reason_summary,
        gateway_mode=gateway_mode,
    )
    append_decision(record)

    # Also log as a trace event
    append_event(
        TraceEvent(
            trace_id=envelope.trace_id,
            session_id=envelope.session_id,
            event_type="security_decision",
            payload={
                "decision": decision.value,
                "reason_code": reason_code,
                "reason_summary": reason_summary,
                "gateway_mode": gateway_mode,
            },
        )
    )

    return DecisionResponse(
        trace_id=envelope.trace_id,
        decision=decision,
        reason_code=reason_code,
        reason_summary=reason_summary,
        gateway_mode=gateway_mode,
    )


class ScanRequest(BaseModel):
    scan_type: str  # "prompt" | "response"
    content: str
    system_prompt: str = ""
    trace_id: str = ""
    session_id: str = ""


class ScanResponse(BaseModel):
    trace_id: str
    decision: Decision
    reason_code: str
    reason_summary: str
    gateway_mode: str


@app.post("/scan", response_model=ScanResponse)
async def scan_content(
    req: ScanRequest,
    x_ps_api_url: str | None = Header(default=None),
    x_ps_api_key: str | None = Header(default=None),
    x_ps_username: str | None = Header(default=None),
) -> ScanResponse:
    """
    Scan a raw prompt or tool response with Prompt Security.
    Used by the agent to check: (1) user prompt before Claude runs,
    (2) tool response before feeding back to Claude.
    """
    api_url = (x_ps_api_url or DEFAULT_PS_API_URL).strip()
    api_key = (x_ps_api_key or DEFAULT_PS_API_KEY).strip()
    username = (x_ps_username or "").strip()

    gateway_mode = "mock"
    decision = Decision.ALLOW
    reason_code = "SCAN_ALLOWED"
    reason_summary = "Content allowed."

    if api_url and api_key:
        if req.scan_type == "prompt":
            data = await _call_ps_api(api_url, api_key, prompt=req.content, system_prompt=req.system_prompt, username=username)
        else:
            data = await _call_ps_api(api_url, api_key, response=req.content, system_prompt=req.system_prompt, username=username)

        if data is not None:
            gateway_mode = "real"
            action = data.get("result", {}).get(req.scan_type, {}).get("action", "allow").lower()
            if action == "block":
                decision = Decision.BLOCK
                reason_code = f"PS_{req.scan_type.upper()}_BLOCKED"
                reason_summary = f"Prompt Security blocked the {req.scan_type}: policy violation detected."
            elif action == "modify":
                decision = Decision.ALLOW
                reason_code = f"PS_{req.scan_type.upper()}_MODIFIED"
                reason_summary = f"Prompt Security sanitized the {req.scan_type}."
            else:
                decision = Decision.ALLOW
                reason_code = f"PS_{req.scan_type.upper()}_ALLOWED"
                reason_summary = f"Prompt Security allowed the {req.scan_type}."

    if gateway_mode == "mock":
        # Fall back to the mock policy engine for text content
        from gateway.policy import _has_injection
        if _has_injection(req.content):
            decision = Decision.BLOCK
            reason_code = "MOCK_INJECTION_DETECTED"
            reason_summary = f"Injection pattern detected in {req.scan_type}."
        gateway_mode = "mock"

    append_event(
        TraceEvent(
            trace_id=req.trace_id or str(uuid.uuid4()),
            session_id=req.session_id,
            event_type="security_decision",
            payload={
                "scan_type": req.scan_type,
                "decision": decision.value,
                "reason_code": reason_code,
                "reason_summary": reason_summary,
                "gateway_mode": gateway_mode,
            },
        )
    )

    return ScanResponse(
        trace_id=req.trace_id,
        decision=decision,
        reason_code=reason_code,
        reason_summary=reason_summary,
        gateway_mode=gateway_mode,
    )


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "gateway",
        "real_api_configured": bool(DEFAULT_PS_API_URL and DEFAULT_PS_API_KEY),
    }
