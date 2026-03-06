from pydantic import BaseModel


class DocResult(BaseModel):
    title: str
    content: str
    source: str


class SearchSecurityDocsResponse(BaseModel):
    query: str
    results: list[DocResult]
    total: int
