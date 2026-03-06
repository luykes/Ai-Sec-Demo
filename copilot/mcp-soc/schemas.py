from typing import Any

from pydantic import BaseModel


class AlertSummary(BaseModel):
    alert_id: str
    severity: str
    timestamp: str
    title: str
    description: str
    host: str
    user: str | None
    tags: list[str]


class SearchAlertsResponse(BaseModel):
    alerts: list[AlertSummary]
    total: int


class ProcessNode(BaseModel):
    pid: int
    name: str
    cmdline: str
    children: list["ProcessNode"]


class RetrieveProcessTreeResponse(BaseModel):
    alert_id: str
    process_tree: ProcessNode | None
    message: str


class RetrieveCredentialsResponse(BaseModel):
    credentials: list[dict[str, Any]]
    warning: str
