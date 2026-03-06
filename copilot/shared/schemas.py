from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    CRITICAL = "CRITICAL"


class Provenance(str, Enum):
    USER = "user"          # tool call triggered by user prompt
    TOOL = "tool"          # tool call triggered by another tool's response (indirect injection vector)


class Decision(str, Enum):
    ALLOW = "ALLOW"
    BLOCK = "BLOCK"
    REQUIRE_APPROVAL = "REQUIRE_APPROVAL"


class ToolCallEnvelope(BaseModel):
    trace_id: str
    session_id: str
    tool_name: str
    tool_args: dict[str, Any]
    risk_level: RiskLevel
    provenance: Provenance
    user_prompt: str
    system_prompt: str = ""
    agent_plan: str = ""


class DecisionRecord(BaseModel):
    trace_id: str
    session_id: str
    tool_name: str
    tool_args: dict[str, Any]
    risk_level: RiskLevel
    provenance: Provenance
    decision: Decision
    reason_code: str
    reason_summary: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    gateway_mode: str = "mock"  # "real" | "mock"


class TraceEvent(BaseModel):
    trace_id: str
    session_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: str  # "user_prompt" | "agent_plan" | "tool_attempt" | "security_decision" | "tool_response" | "agent_response"
    payload: dict[str, Any]
