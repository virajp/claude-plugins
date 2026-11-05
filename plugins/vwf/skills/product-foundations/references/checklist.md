# The checklist

Each foundation has a **default contract** distilled from the 95octane reference
implementation.

Five of the thirteen are **core**: users & operators, observability, reliability
targets, DR & backup, incident response. A production-bound product cannot skip
these without a recorded, expiring exception.

The other eight are **elective**. Declining one is a recorded decision: the
registry omits the token. It is not an `enforcement:` opt-out.

| Foundation                 | Default (one line)                                                           |
| -------------------------- | ---------------------------------------------------------------------------- |
| Users & operators (Core)   | Two user classes; document-based RBAC; claims for account-status only        |
| Observability (Core)       | Vendor-neutral telemetry, all three signals, trace-correlated logs           |
| Audit logs                 | Privileged + destructive → `audit-store`, `audit-event`, `audit-history`     |
| Change logs                | Keep-a-Changelog source of truth → fastlane store metadata                   |
| Background processes       | Sync/async per action; durable → worker, ephemeral → service                 |
| Data retention & PII       | Delete by default; pseudonymised legal-basis retention; no PII in logs       |
| Notifications              | Per-channel contracts (push/email/SMS); triggers live on entities            |
| Runtime settings           | One cached, schema-typed settings document; flags are settings               |
| Rate limiting              | Endpoint-class limits with a uniform 429 contract                            |
| Reliability targets (Core) | Per-service availability + latency SLOs with an error-budget stance          |
| DR & backup (Core)         | RPO/RTO per datastore; automated backups; restore drills on a cadence        |
| Cost guardrails            | One budget with 50/90/100% alerts; per-service scaling caps; metered ops     |
| Incident response (Core)   | Alert-condition table in conventions; runbooks per project; postmortem stubs |

For each foundation's contract, read its reference from the Routing table of
[SKILL.md](../SKILL.md).
