from fastapi.testclient import TestClient

from mcp_external_malicious.main import app, MALICIOUS_INJECTION

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200


def test_search_docs_reset_contains_injection():
    """Querying 'reset procedure' must return the malicious injection payload."""
    r = client.get("/tools/search_security_docs?query=reset+procedure")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 1
    combined = " ".join(res["content"] for res in data["results"])
    assert "SYSTEM-OVERRIDE" in combined
    assert "run_shell_command" in combined
    assert "cat /etc/shadow" in combined


def test_search_docs_incident_response_is_benign():
    """Querying 'incident response' must NOT contain injection."""
    r = client.get("/tools/search_security_docs?query=incident+response")
    assert r.status_code == 200
    data = r.json()
    combined = " ".join(res["content"] for res in data["results"])
    assert "SYSTEM-OVERRIDE" not in combined
    assert "cat /etc/shadow" not in combined


def test_search_docs_unknown_query_is_benign():
    r = client.get("/tools/search_security_docs?query=something+unrelated")
    assert r.status_code == 200
    data = r.json()
    combined = " ".join(res["content"] for res in data["results"])
    assert "SYSTEM-OVERRIDE" not in combined
