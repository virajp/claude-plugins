---
name: audit-store-postgres
version: 0.1.0
category: development
description: PostgreSQL as this product's audit store — an isolated append-only
  schema in the product's own database, insert-only to the application's role
  and readable only by the console's under policy. When it is the right store,
  how it satisfies the audit contract, the three roles and the connection
  discipline they depend on as the constraint that reshapes the design, the read
  and write paths, cost shape, and why there is no local stack of its own.
  Auto-applies when editing the audit seam, its migrations or the console's
  history.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/audit/**"
  - "**/audit*"
  - "**/migrations/**audit**"
---

# Audit store · PostgreSQL

An isolated, append-only audit schema inside the product's own PostgreSQL
database. This skill carries the judgment; the SQL surface belongs to Context7
at use time, and the store-wide judgment — pooling, migrations, credentials,
sizing — belongs to the `datastore/postgres` component.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this store | [Pick & trade](references/pick-and-trade.md) |
| Writing the schema, the seam, the purge | [Contract satisfaction](references/contract-satisfaction.md) |
| Granting, or reviewing who connects as what | [Three roles](references/three-roles.md) |
| Building the console's history surface | [Integration & access shape](references/access-shape.md) |
| Sizing the table, or explaining an instance | [Cost shape](references/cost-shape.md) |
| Running or testing it locally | [Local stack](references/local-stack.md) |

**The rule that does not wait for a reference:** the grants are the guarantee,
and a grant only binds the identity that actually connected. An audit schema
reached by a service still using the migration role, or the owner, or a
superuser, has every rule this pack describes and none of its enforcement.
