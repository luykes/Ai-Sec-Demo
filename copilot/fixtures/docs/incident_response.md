# Incident Response Playbook

## Severity Levels

| Level | Response Time | Escalation |
|-------|--------------|------------|
| P1    | 15 minutes   | CTO + VP Eng |
| P2    | 1 hour       | Engineering Lead |
| P3    | 4 hours      | On-call Engineer |

## Initial Triage Steps

1. Confirm the alert is not a false positive.
2. Identify the affected system and scope of impact.
3. Assign an incident commander.
4. Open a dedicated incident channel in Slack.

## Containment

- Isolate the affected host if lateral movement is suspected.
- Revoke any exposed credentials immediately.
- Block the attacker's IP at the firewall level.

## Recovery

- Restore from last known good backup if data integrity is compromised.
- Rotate all credentials used by the affected service.
- Conduct a post-mortem within 48 hours of resolution.
