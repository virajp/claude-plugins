---
name: product-foundations
description: Thirteen foundations with elicited defaults (users, observability,
  audit, change logs, jobs, retention, notifications, settings, rate limits,
  reliability, DR, cost, incidents). Auto-applies when editing
  docs/blueprint/architecture.md or conventions.md.
user-invocable: false
disable-model-invocation: false
paths:
  - "docs/blueprint/architecture.md"
  - "docs/blueprint/conventions.md"
metadata:
  archetype: doctrine
---

# Product Foundations

Thirteen foundations every product hits sooner or later. `/vwf:architecture` and
`/vwf:blueprint` use them. Read the reference for the foundation you decide or
expand.

## Routing

| Doing                                               | Read                                                       | Loads     |
| --------------------------------------------------- | ---------------------------------------------------------- | --------- |
| Walking the checklist in `/vwf:architecture`        | [checklist](references/checklist.md)                       | sometimes |
| Finding what a command does with a foundation token | [consumption](references/consumption.md)                   | sometimes |
| Deciding or expanding users & operators             | [users](references/users.md)                               | sometimes |
| Deciding or expanding observability                 | [observability](references/observability.md)               | sometimes |
| Deciding or expanding audit logs                    | [audit-logs](references/audit-logs.md)                     | sometimes |
| Deciding or expanding change logs                   | [change-logs](references/change-logs.md)                   | sometimes |
| Deciding or expanding background processes          | [background-processes](references/background-processes.md) | sometimes |
| Deciding or expanding data retention & PII          | [data-retention](references/data-retention.md)             | sometimes |
| Deciding or expanding notifications                 | [notifications](references/notifications.md)               | sometimes |
| Deciding or expanding runtime settings              | [runtime-settings](references/runtime-settings.md)         | sometimes |
| Deciding or expanding rate limiting                 | [rate-limiting](references/rate-limiting.md)               | sometimes |
| Deciding or expanding reliability targets           | [reliability-targets](references/reliability-targets.md)   | sometimes |
| Deciding or expanding DR & backup                   | [disaster-recovery](references/disaster-recovery.md)       | sometimes |
| Deciding or expanding cost guardrails               | [cost-guardrails](references/cost-guardrails.md)           | sometimes |
| Deciding or expanding incident response             | [incident-response](references/incident-response.md)       | sometimes |

## Rules that don't wait

- Propose each default per product, and never assume one silently — the product
  decides.
- Keep the contract layer code-independent — each reference points at the
  reference-stack docs for the 95octane realization.
