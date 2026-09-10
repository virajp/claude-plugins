---
name: cloudflare-secrets-store
version: 0.1.0
category: development
description: >-
  Cloudflare Secrets Store as this product's runtime secrets home — the
  account-level values a deployed Worker or Container reads through a
  binding in staging and production, and how that sits beside the
  developer-machine and CI secrets provider without either replacing the
  other. When the store beats a per-Worker secret, how it satisfies the
  neutral secrets contract and the one clause it answers differently, the
  naming rule that keeps staging out of production while the account
  allows one store, the four roles and the scope list, and why local
  development cannot reach a production secret by design.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Secrets Store

The account-level store a **deployed** Worker or Container reads at run
time. This skill carries the judgment; the current Wrangler flags and the
runtime API signatures belong to Context7 at use time. The provider-wide
half — the account and role model, the billing principle, what exists
locally — is the `cloudflare` skill's, cited and never restated.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing this store, or questioning it | [Pick & trade](references/pick-and-trade.md) |
| Naming, binding, reading and rotating secrets | [Service doctrine](references/service-doctrine.md) |
| Sizing against the account entitlement | [Cost shape](references/cost-shape.md) |
| Granting a role, or a token to a pipeline | [Identity shape](references/identity-shape.md) |
| Running or testing against a binding on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** This store and the
repo's developer-side secrets provider are **two tools with two jobs** —
runtime versus a laptop and a pipeline — and neither is a substitute for
the other. **A value cannot be read back once saved**, by anyone, through
any surface, so rotation is create-new, re-point, delete-old, and editing
in place throws away the ability to roll back. And **local development
cannot reach a production secret at all** — that is a property to keep,
not a limitation to work around.
