"""
Mock policy engine — used as fallback when the real Prompt Security API is unavailable.
Implements the same input/output contract as the real API.
"""
from __future__ import annotations

import re

from shared.schemas import Decision, Provenance, RiskLevel, ToolCallEnvelope

# Patterns that indicate prompt injection or data exfiltration.
# Mirrors the attack taxonomy: direct injection, jailbreak/roleplay,
# prompt leak, secrets exposure, payload splitting, encoding/evasion.
INJECTION_PATTERNS = [
    # ── Classic direct injection / override ──────────────────────────────────
    r"ignore\s+(previous|prior|all|system)\s+instruct",
    r"system.?override",
    r"you\s+are\s+now\s+in\s+maintenance\s+mode",
    # ── Shell exfil commands ─────────────────────────────────────────────────
    r"curl\s+\S+\s*\|",
    r"wget\s+.*\|\s*(bash|sh)",
    r"\|\s*(bash|sh)\b",
    r"exfil(trate)?",
    r"cat\s+/etc/(shadow|passwd)",
    # ── Data exfiltration via HTTP ───────────────────────────────────────────
    r"\bsend\b.{0,120}https?://",
    r"\bpost\b.{0,120}https?://",
    r"curl\s+.*-[dX].*https?://",
    r"environment\s+variable.{0,60}https?://",
    r"post\s+(them|it|credentials|creds)\s+to",
    r"retrieve\s+all\s+credentials",
    # ── Jailbreak / persona hijack (DAN, roleplay) ───────────────────────────
    r"\bDAN\b.{0,80}(no\s+restrict|broken\s+free|do\s+anything)",
    r"safety\s+guidelines?.{0,30}(suspended|disabled|lifted|removed)",
    r"(playing|acting\s+as).{0,60}unrestricted",
    r"\bunrestricted\s+(ai|agent|assistant|audit\s+agent)\b",
    # ── Prompt leak ──────────────────────────────────────────────────────────
    r"repeat\s+your\s+(full\s+)?(system\s+prompt|instructions?)",
    r"(print|output|show|reveal|display)\s+your\s+(system\s+prompt|instructions?|guidelines?)",
    r"what\s+(are|were)\s+your\s+(original\s+)?(instructions?|system\s+prompt)",
    # ── Logic trap / hypothetical framing ────────────────────────────────────
    r"hypothetical.{0,100}(guardrail|restrict|unrestricted|red.?team)",
    r"(red.?team|authorized.{0,30}test).{0,80}unrestricted",
    r"guardrails?.{0,30}(suspended|disabled)",
    # ── Payload splitting ────────────────────────────────────────────────────
    r"part\s+[ab]\b.{0,150}https?://",
    r"(decode\s+and\s+execute|run.{0,20}encoded.{0,20}command)",
    # ── Secrets patterns (AWS, GitHub, Stripe) — deterministic ───────────────
    r"AKIA[0-9A-Z]{16}",
    r"ghp_[A-Za-z0-9]{36}",
    r"sk_live_[A-Za-z0-9]{24}",
]

_INJECTION_RE = re.compile("|".join(INJECTION_PATTERNS), re.IGNORECASE)


def _has_injection(text: str) -> bool:
    return bool(_INJECTION_RE.search(text))


def evaluate(envelope: ToolCallEnvelope) -> tuple[Decision, str, str]:
    """
    Returns (decision, reason_code, reason_summary).
    """
    combined_text = f"{envelope.user_prompt} {envelope.agent_plan} {str(envelope.tool_args)}"

    # Rule 1: Tool-originated injection (malicious MCP response)
    if envelope.provenance == Provenance.TOOL and _has_injection(combined_text):
        return (
            Decision.BLOCK,
            "TOOL_ORIGINATED_INJECTION",
            f"Prompt injection detected in tool-originated content targeting '{envelope.tool_name}'. "
            "Execution blocked to prevent indirect prompt injection attack.",
        )

    # Rule 2: CRITICAL tools — block if injection detected, allow otherwise
    if envelope.risk_level == RiskLevel.CRITICAL:
        if _has_injection(combined_text):
            return (
                Decision.BLOCK,
                "INJECTION_CRITICAL_TOOL",
                f"Injection pattern detected in prompt targeting CRITICAL tool '{envelope.tool_name}'. "
                "Blocked to prevent tool abuse.",
            )
        return (Decision.ALLOW, "CRITICAL_TOOL_ALLOWED", f"Tool '{envelope.tool_name}' allowed (CRITICAL risk, no injection detected).")

    # Rule 3: MEDIUM tools — check for injection only
    if envelope.risk_level == RiskLevel.MEDIUM:
        if _has_injection(combined_text):
            return (
                Decision.BLOCK,
                "INJECTION_MEDIUM_TOOL",
                f"Injection pattern detected targeting '{envelope.tool_name}'.",
            )
        return (Decision.ALLOW, "MEDIUM_TOOL_ALLOWED", f"Tool '{envelope.tool_name}' allowed (MEDIUM risk, no injection detected).")

    # Rule 4: LOW risk — allow unless injection detected
    if _has_injection(combined_text):
        return (
            Decision.BLOCK,
            "INJECTION_LOW_TOOL",
            f"Injection pattern detected even for low-risk tool '{envelope.tool_name}'.",
        )
    return (Decision.ALLOW, "LOW_TOOL_ALLOWED", f"Tool '{envelope.tool_name}' allowed (LOW risk).")
