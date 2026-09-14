---
name: audit-store-d1
version: 0.1.0
category: development
description: Cloudflare D1 as this product's audit store — a dedicated
  append-only database the console Worker alone binds. When it is the right
  store, how it satisfies the audit contract, the absence of database roles as
  the constraint that reshapes the design, the read and write paths, cost shape,
  and why there is no local stack of its own. Auto-applies when editing the
  audit seam, its migrations or the console's audit history.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/audit/**"
  - "**/audit*"
  - "**/migrations/**audit**"
---

# Audit store · Cloudflare D1

An isolated, append-only audit dataset in a D1 database of its own. This skill
carries the judgment; the D1 API and SQL surface belong to Context7 at use time,
and the store-wide judgment belongs to the `cloud-service/d1` component.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this store | [Pick & trade](references/pick-and-trade.md) |
| Writing the schema, the seam, the purge | [Contract satisfaction](references/contract-satisfaction.md) |
| Deciding who may read what | [No roles](references/no-roles.md) |
| Building the console's history surface | [Integration & access shape](references/access-shape.md) |
| Sizing the table, or explaining a bill | [Cost shape](references/cost-shape.md) |
| Running or testing it locally | [Local stack](references/local-stack.md) |

**The rule that does not wait for a reference:** the audit events live in their
own D1 database, bound by the console Worker alone. On D1 the binding is the
only access boundary there is, so a table beside the product's data is not
isolated — it is unisolated data with a careful name.
