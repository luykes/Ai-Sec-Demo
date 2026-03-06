from __future__ import annotations

import os
import subprocess
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from mcp_devops.schemas import (
    RestartServiceRequest,
    RestartServiceResponse,
    RunShellCommandRequest,
    RunShellCommandResponse,
    ViewLogsResponse,
)

app = FastAPI(title="MCP DevOps Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FIXTURES_DIR = Path(os.getenv("FIXTURES_DIR", "./fixtures/devops"))

# Allowlisted commands for real sandboxed shell execution
SHELL_ALLOWLIST = {
    "ls",
    "pwd",
    "whoami",
    "echo",
    "date",
    "uptime",
    "df",
    "free",
    "uname",
}

# Simulated outputs for attack-pattern commands (makes PS OFF demo convincing)
def _simulate_attack_output(command: str) -> RunShellCommandResponse | None:
    """Return simulated shell output for known attack patterns, or None to fall through to real execution."""
    cmd_lower = command.lower()

    # curl/wget piped to bash — simulate script download + execution
    if any(p in cmd_lower for p in ["curl", "wget"]) and any(p in cmd_lower for p in ["| bash", "| sh", "|bash", "|sh"]):
        return RunShellCommandResponse(
            command=command,
            stdout=(
                "  % Total    % Received % Xferd  Average Speed   Time\n"
                "100  4821  100  4821    0     0   38568      0 --:--:-- --:--:--\n"
                "[*] exfil.sh loaded — starting collection...\n"
                "[+] Harvested /etc/passwd (47 entries)\n"
                "[+] Harvested env vars (38 keys including AWS_SECRET_ACCESS_KEY, DATABASE_URL)\n"
                "[+] Harvested ~/.ssh/id_rsa\n"
                "[+] Sending payload to attacker.com/collect ... 200 OK\n"
                "[+] Done. Exfiltrated 14.2 KB."
            ),
            stderr="",
            exit_code=0,
        )

    # env var exfil
    if any(p in cmd_lower for p in ["printenv", "env | ", "env|", "export -p"]):
        return RunShellCommandResponse(
            command=command,
            stdout=(
                "HOME=/root\nUSER=app\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin\n"
                "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n"
                "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n"
                "AWS_DEFAULT_REGION=us-east-1\n"
                "DATABASE_URL=postgresql://app_svc:Kx9%23mP2nL4qR8vT6%21wY1@prod-db-01.internal:5432/ops_production\n"
                "STRIPE_SECRET_KEY=sk_live_51H0zT2KjF7mP9sX1nQ3wE8rY2uI6oP4aL\n"
                "GITHUB_TOKEN=ghp_xK9mP2nL4qR8vT6wY1uA3sD5fG7hJ0kM2\n"
                "DD_API_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4\n"
                "ANTHROPIC_API_KEY=sk-ant-api03-xK9mP2nL4qR8vT6wY1uA3sD5fG7hJ0kM2nP8qR2vT6wY\n"
                "SESSION_SECRET=7f3a9b2c1d4e8f6a0b5c9d3e7f1a4b8c\n"
            ),
            stderr="",
            exit_code=0,
        )

    # cat /etc/shadow
    if "cat /etc/shadow" in cmd_lower or "cat /etc/passwd" in cmd_lower:
        filename = "/etc/shadow" if "shadow" in cmd_lower else "/etc/passwd"
        if "shadow" in filename:
            output = (
                "root:$6$rounds=656000$aB3cD4eF$xK9mP2nL4qR8vT6wY1uA3sD5fG7hJ0kM2nP8qR2vT6wY1uA3s:19420:0:99999:7:::\n"
                "daemon:*:19420:0:99999:7:::\n"
                "app:$6$rounds=656000$gH5iJ6kL$mP2nL4qR8vT6wY1uA3sD5fG7hJ0kM2nP8qR2vT6wY1uA3sD5f:19420:0:99999:7:::\n"
                "deploy:$6$rounds=656000$mN7oP8qR$sD5fG7hJ0kM2nP8qR2vT6wY1uA3sD5fG7hJ0kM2nP8qR2vT6:19420:0:99999:7:::\n"
                "postgres:$6$rounds=656000$sT1uV2wX$fG7hJ0kM2nP8qR2vT6wY1uA3sD5fG7hJ0kM2nP8qR2vT6wY1:19420:0:99999:7:::\n"
            )
        else:
            output = (
                "root:x:0:0:root:/root:/bin/bash\n"
                "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n"
                "app:x:1000:1000:app service:/home/app:/bin/bash\n"
                "deploy:x:1001:1001:deploy user:/home/deploy:/bin/bash\n"
                "postgres:x:999:999:PostgreSQL:/var/lib/postgresql:/bin/bash\n"
            )
        return RunShellCommandResponse(command=command, stdout=output, stderr="", exit_code=0)

    # cat ~/.ssh or similar key exfil
    if ".ssh" in cmd_lower and "cat" in cmd_lower:
        return RunShellCommandResponse(
            command=command,
            stdout=(
                "-----BEGIN OPENSSH PRIVATE KEY-----\n"
                "b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW\n"
                "QyNTUxOQAAACB4xK9mP2nL4qR8vT6wY1uA3sD5fG7hJ0kM2nP8qR2vT6QAAAJIYK9m\n"
                "P2nL4qR8vT6wY1uA3sD5fG7hJ0kM2nP8qR2vT6wxK9mP2nL4qR8vT6wY1uA3sD5fG\n"
                "7hJ0kM2nP8qR2vT6QAAAABAAAAAAAAAAAAAAAA\n"
                "-----END OPENSSH PRIVATE KEY-----\n"
            ),
            stderr="",
            exit_code=0,
        )

    return None


@app.get("/tools")
def list_tools() -> dict:
    return {
        "tools": [
            {
                "name": "view_logs",
                "description": "View recent logs for a service",
                "risk": "LOW",
                "parameters": {"service": "string (optional, defaults to nginx)"},
            },
            {
                "name": "restart_service",
                "description": "Restart a named service",
                "risk": "MEDIUM",
                "parameters": {"service": "string (required)"},
            },
            {
                "name": "run_shell_command",
                "description": "Run a shell command on the host",
                "risk": "CRITICAL",
                "parameters": {"command": "string (required)"},
            },
        ]
    }


@app.get("/tools/view_logs", response_model=ViewLogsResponse)
def view_logs(service: str = "nginx") -> ViewLogsResponse:
    log_file = FIXTURES_DIR / f"{service}.log"
    if not log_file.exists():
        # Return a generic "no logs" response rather than 404
        return ViewLogsResponse(service=service, lines=[f"No log file found for service '{service}'."])
    lines = log_file.read_text().splitlines()
    return ViewLogsResponse(service=service, lines=lines[-100:])


@app.post("/tools/restart_service", response_model=RestartServiceResponse)
def restart_service(req: RestartServiceRequest) -> RestartServiceResponse:
    # Simulated restart — no real process management in the demo
    known_services = {"nginx", "api", "worker", "scheduler", "db-proxy"}
    if req.service not in known_services:
        return RestartServiceResponse(
            service=req.service,
            status="error",
            message=f"Service '{req.service}' not found in registry.",
        )
    return RestartServiceResponse(
        service=req.service,
        status="success",
        message=f"Service '{req.service}' restarted successfully. PID: 9981.",
    )


@app.post("/tools/run_shell_command", response_model=RunShellCommandResponse)
def run_shell_command(req: RunShellCommandRequest) -> RunShellCommandResponse:
    # Check for attack-pattern commands first — return simulated output to make PS-OFF demo convincing
    simulated = _simulate_attack_output(req.command)
    if simulated is not None:
        return simulated

    # Parse the base command for allowlist check (safe commands run for real)
    base_cmd = req.command.strip().split()[0] if req.command.strip() else ""
    if base_cmd not in SHELL_ALLOWLIST:
        raise HTTPException(
            status_code=403,
            detail=f"Command '{base_cmd}' is not in the shell allowlist.",
        )
    try:
        result = subprocess.run(
            req.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=10,
        )
        return RunShellCommandResponse(
            command=req.command,
            stdout=result.stdout,
            stderr=result.stderr,
            exit_code=result.returncode,
        )
    except subprocess.TimeoutExpired:
        return RunShellCommandResponse(
            command=req.command,
            stdout="",
            stderr="Command timed out after 10 seconds.",
            exit_code=124,
        )


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "mcp-devops"}
