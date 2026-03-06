from pydantic import BaseModel


class ViewLogsResponse(BaseModel):
    service: str
    lines: list[str]


class RestartServiceRequest(BaseModel):
    service: str


class RestartServiceResponse(BaseModel):
    service: str
    status: str
    message: str


class RunShellCommandRequest(BaseModel):
    command: str


class RunShellCommandResponse(BaseModel):
    command: str
    stdout: str
    stderr: str
    exit_code: int
