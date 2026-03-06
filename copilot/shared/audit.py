from __future__ import annotations

import json
import os
from pathlib import Path

from shared.schemas import DecisionRecord, TraceEvent

AUDIT_FILE = Path(os.getenv("AUDIT_LOG_PATH", "./data/audit.jsonl"))


def _ensure_dir() -> None:
    AUDIT_FILE.parent.mkdir(parents=True, exist_ok=True)


def append_decision(record: DecisionRecord) -> None:
    _ensure_dir()
    with AUDIT_FILE.open("a") as f:
        f.write(record.model_dump_json() + "\n")


def append_event(event: TraceEvent) -> None:
    _ensure_dir()
    with AUDIT_FILE.open("a") as f:
        f.write(event.model_dump_json() + "\n")


def read_trace(trace_id: str) -> list[dict]:
    if not AUDIT_FILE.exists():
        return []
    results = []
    with AUDIT_FILE.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
                if record.get("trace_id") == trace_id:
                    results.append(record)
            except json.JSONDecodeError:
                continue
    return results


def read_session(session_id: str) -> list[dict]:
    if not AUDIT_FILE.exists():
        return []
    results = []
    with AUDIT_FILE.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
                if record.get("session_id") == session_id:
                    results.append(record)
            except json.JSONDecodeError:
                continue
    return results
