from shared.schemas import RiskLevel

TOOL_RISK_MAP: dict[str, RiskLevel] = {
    # DevOps domain
    "view_logs": RiskLevel.LOW,
    "restart_service": RiskLevel.MEDIUM,
    "run_shell_command": RiskLevel.CRITICAL,
    # SOC domain
    "search_alerts": RiskLevel.MEDIUM,
    "retrieve_process_tree": RiskLevel.MEDIUM,
    "retrieve_credentials": RiskLevel.CRITICAL,
    # External domain (response may contain injected instructions)
    "search_security_docs": RiskLevel.LOW,
}


def classify(tool_name: str) -> RiskLevel:
    return TOOL_RISK_MAP.get(tool_name, RiskLevel.MEDIUM)
