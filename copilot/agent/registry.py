"""
Tool registry — describes available MCP tools as Claude API tool definitions.
The agent uses these to decide which tool to call.
"""
from __future__ import annotations

import os

DEVOPS_URL = os.getenv("MCP_DEVOPS_URL", "http://localhost:8002")
SOC_URL = os.getenv("MCP_SOC_URL", "http://localhost:8003")
EXTERNAL_URL = os.getenv("MCP_EXTERNAL_URL", "http://localhost:8004")

# Tool definitions in Claude API format
TOOLS: list[dict] = [
    {
        "name": "view_logs",
        "description": "View recent log entries for a service. Use this to investigate service failures or errors.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {
                    "type": "string",
                    "description": "Name of the service to view logs for (default: nginx)",
                }
            },
        },
        "_meta": {"domain": "devops", "risk": "LOW", "url": f"{DEVOPS_URL}/tools/view_logs"},
    },
    {
        "name": "restart_service",
        "description": "Restart a named service. Use this to recover a failed service.",
        "input_schema": {
            "type": "object",
            "properties": {
                "service": {
                    "type": "string",
                    "description": "Name of the service to restart",
                }
            },
            "required": ["service"],
        },
        "_meta": {"domain": "devops", "risk": "MEDIUM", "url": f"{DEVOPS_URL}/tools/restart_service"},
    },
    {
        "name": "run_shell_command",
        "description": "Run a shell command on the host system.",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "The shell command to execute",
                }
            },
            "required": ["command"],
        },
        "_meta": {"domain": "devops", "risk": "CRITICAL", "url": f"{DEVOPS_URL}/tools/run_shell_command"},
    },
    {
        "name": "search_alerts",
        "description": "Search and list recent security alerts from the SIEM.",
        "input_schema": {
            "type": "object",
            "properties": {
                "alert_id": {
                    "type": "string",
                    "description": "Optional alert ID to filter by",
                },
                "severity": {
                    "type": "string",
                    "description": "Optional severity filter (low, medium, high)",
                },
            },
        },
        "_meta": {"domain": "soc", "risk": "MEDIUM", "url": f"{SOC_URL}/tools/search_alerts"},
    },
    {
        "name": "retrieve_process_tree",
        "description": "Retrieve the process tree associated with a security alert.",
        "input_schema": {
            "type": "object",
            "properties": {
                "alert_id": {
                    "type": "string",
                    "description": "The alert ID to retrieve the process tree for",
                }
            },
            "required": ["alert_id"],
        },
        "_meta": {"domain": "soc", "risk": "MEDIUM", "url": f"{SOC_URL}/tools/retrieve_process_tree"},
    },
    {
        "name": "retrieve_credentials",
        "description": "Retrieve service credentials for forensic analysis.",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
        "_meta": {"domain": "soc", "risk": "CRITICAL", "url": f"{SOC_URL}/tools/retrieve_credentials"},
    },
    {
        "name": "search_security_docs",
        "description": "Search the external security documentation library.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query",
                }
            },
            "required": ["query"],
        },
        "_meta": {"domain": "external", "risk": "LOW", "url": f"{EXTERNAL_URL}/tools/search_security_docs"},
    },
]

# Build a lookup by tool name (strip _meta for Claude API calls)
TOOL_META: dict[str, dict] = {t["name"]: t["_meta"] for t in TOOLS}
CLAUDE_TOOLS: list[dict] = [{k: v for k, v in t.items() if k != "_meta"} for t in TOOLS]

# Tool definitions in OpenAI / Ollama format
OPENAI_TOOLS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": t["name"],
            "description": t["description"],
            "parameters": t["input_schema"],
        },
    }
    for t in TOOLS
]


def get_meta(tool_name: str) -> dict:
    return TOOL_META.get(tool_name, {"domain": "unknown", "risk": "MEDIUM", "url": ""})
