---
name: Cloudflare D1
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/d1@0.1.0
---

# Backing — Cloudflare D1

A **relational datastore for a product that already runs on Workers**.
The Worker reaches its database through a binding rather than over a
connection, so there is no pool to size and no connection limit to
design against — and in exchange the database is capped at 10 GB, which
makes "what is one database" a design decision taken before the first
table rather than a limit discovered later.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model behind least-privilege grants, the billing
principle, what does and does not exist on a laptop, and the fence saying
which Cloudflare services this stack offers at all. The service component
carries this one service and **cites** that provider doctrine rather than
restating it, which is what keeps a second Cloudflare service from
repeating the same account-level prose a third time.

**What pinning it gives a project** is the judgment, not a file. This
bundle ships no configuration: the binding block belongs in the
`wrangler.jsonc` the project's own hosting pin already owns, and the
service component states the shape to add. What arrives instead is the
doctrine a reader cannot look up — how the store satisfies the neutral
datastore contract when it has no transaction a request can hold open,
why an index is a cost control before it is a performance control, what
read replication costs in consistency and what the Sessions API buys
back, and which `wrangler` flag is the one that quietly means production.

**It pins beside other backing bundles rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink" (vwf's `vwf-config.md`). So a project taking
its relational data here and its objects from `cloudflare-r2` records
both slugs, and nothing about this entry claims the axis.

## What this bundle decides that neither component decides alone

**An environment is a database id.** The binding selects a database by
`database_id`, so each environment gets its own database and its own id
in that environment's configuration. That is not a deployment detail: a
staging deploy carrying production's id runs its migrations against
production, and nothing about the configuration looks wrong afterwards.

**Sizing is part of the pick.** Because a database is bounded, the seam
the data will split on — per tenant, per bounded context — is chosen when
the store is chosen. Deferring it means migrating data and rewriting
every query that crossed the seam, at the point where the database has
already stopped accepting writes.

**The capability is `relational-datastore`**, so this composition answers
the datastore capability and no other. A product that also needs an
object store, a cache or a vector index pins those services' own bundles
beside this one.

Full judgment: the components' own skills and their references.
