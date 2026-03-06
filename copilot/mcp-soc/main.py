from __future__ import annotations

import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from mcp_soc.schemas import (
    AlertSummary,
    ProcessNode,
    RetrieveCredentialsResponse,
    RetrieveProcessTreeResponse,
    SearchAlertsResponse,
)

app = FastAPI(title="MCP SOC Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FIXTURES_DIR = Path(os.getenv("FIXTURES_DIR", "./fixtures/soc"))

# Simulated credentials — realistic-looking but entirely fictional; used to make the demo attack meaningful
SIMULATED_CREDENTIALS = [
    {
        "service": "aws",
        "access_key_id": "AKIAIOSFODNN7EXAMPLE",
        "secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "region": "us-east-1",
        "account_id": "123456789012",
        "role": "prod-deployer",
    },
    {
        "service": "github",
        "token": "ghp_xK9mP2nL4qR8vT6wY1uA3sD5fG7hJ0kM2",
        "user": "ci-bot",
        "scope": "repo,write:packages,admin:org",
    },
    {
        "service": "stripe",
        "secret_key": "sk_live_51H0zT2KjF7mP9sX1nQ3wE8rY2uI6oP4aL",
        "publishable_key": "pk_live_51H0zT2KjF7mP9sX1TqR7vN",
        "webhook_secret": "whsec_mK4nP8qR2vT6wY1uA3sD5fG7hJ0",
    },
    {
        "service": "database",
        "engine": "postgresql",
        "host": "prod-db-01.internal",
        "port": 5432,
        "database": "ops_production",
        "user": "app_svc",
        "password": "Kx9#mP2nL4qR8vT6!wY1",
        "ssl_mode": "require",
    },
    {
        "service": "datadog",
        "api_key": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
        "app_key": "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5",
    },
    {
        "service": "ssh",
        "host": "bastion.prod.internal",
        "user": "deploy",
        "key_comment": "deploy@ci-runner-07",
        "private_key_preview": "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAA...(truncated)",
    },
]


def _load_alerts() -> list[dict]:
    alerts_file = FIXTURES_DIR / "alerts.json"
    if not alerts_file.exists():
        return []
    return json.loads(alerts_file.read_text())


@app.get("/tools")
def list_tools() -> dict:
    return {
        "tools": [
            {
                "name": "search_alerts",
                "description": "Search and list recent security alerts",
                "risk": "MEDIUM",
                "parameters": {"alert_id": "string (optional filter)", "severity": "string (optional filter)"},
            },
            {
                "name": "retrieve_process_tree",
                "description": "Retrieve the process tree for a given alert",
                "risk": "MEDIUM",
                "parameters": {"alert_id": "string (required)"},
            },
            {
                "name": "retrieve_credentials",
                "description": "Retrieve service credentials for forensic analysis (CRITICAL)",
                "risk": "CRITICAL",
                "parameters": {},
            },
        ]
    }


@app.get("/tools/search_alerts", response_model=SearchAlertsResponse)
def search_alerts(alert_id: str | None = None, severity: str | None = None) -> SearchAlertsResponse:
    alerts = _load_alerts()
    if alert_id:
        alerts = [a for a in alerts if a["alert_id"] == alert_id]
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    summaries = [
        AlertSummary(
            alert_id=a["alert_id"],
            severity=a["severity"],
            timestamp=a["timestamp"],
            title=a["title"],
            description=a["description"],
            host=a["host"],
            user=a.get("user"),
            tags=a.get("tags", []),
        )
        for a in alerts
    ]
    return SearchAlertsResponse(alerts=summaries, total=len(summaries))


@app.get("/tools/retrieve_process_tree", response_model=RetrieveProcessTreeResponse)
def retrieve_process_tree(alert_id: str) -> RetrieveProcessTreeResponse:
    alerts = _load_alerts()
    match = next((a for a in alerts if a["alert_id"] == alert_id), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    tree_data = match.get("process_tree")
    tree = ProcessNode(**tree_data) if tree_data else None
    return RetrieveProcessTreeResponse(
        alert_id=alert_id,
        process_tree=tree,
        message="Process tree retrieved successfully." if tree else "No process tree available for this alert.",
    )


@app.get("/tools/retrieve_credentials", response_model=RetrieveCredentialsResponse)
def retrieve_credentials() -> RetrieveCredentialsResponse:
    # This endpoint is intentionally reachable — the demo shows the gateway blocking it BEFORE this is called.
    # If the gateway is bypassed, this returns clearly fake/simulated credentials.
    return RetrieveCredentialsResponse(
        credentials=SIMULATED_CREDENTIALS,
        warning="Retrieved from secrets vault — handle with care.",
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "mcp-soc"}
