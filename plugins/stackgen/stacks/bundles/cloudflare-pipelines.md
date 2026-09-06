---
name: Cloudflare Pipelines
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/pipelines@0.1.0
---

# Backing — Cloudflare Pipelines

**Streaming ingestion into the object store.** Events are sent from a
Worker binding or posted to an HTTP endpoint, optionally reshaped by SQL,
and written to R2 as JSON, Parquet or Apache Iceberg tables. Pick it when
the product produces far more events than anyone reads one at a time —
clickstream, telemetry it wants to keep rather than sample, domain events
worth having a record of — and when the questions those events will answer
are not all known yet.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, the billing principle, what exists locally, and
the networking rule — and the service component carries this one service
and **cites** that doctrine rather than restating it. Written once, read
from wherever it applies.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object storage,
telemetry sink" (vwf's `vwf-config.md`). So a project pins this alongside
whatever else it needs from any provider, and the axis composes rather
than choosing.

**A Pipelines pin expects an R2 pin beside it.** The sink is an R2 bucket
— as files, or as an Iceberg table through R2 Data Catalog — so this
bundle describes a stream with nowhere to land unless `cloudflare-r2` is
pinned too. That is the one pairing this entry asserts, and it is asserted
here because neither component states it alone: the provider does not know
which services a project picked, and the service component cites R2's
doctrine rather than owning it.

## What this bundle decides that no component decides alone

**Which of the platform's three event-shaped answers this is.** Cloudflare
offers Queues for task processing, Analytics Engine for time-series
metrics, and Pipelines for streaming ingestion. Pinning this one records
that the product wants **records, not work and not aggregates** — events
that still exist in six months, queried by questions nobody has asked yet.
A product that also needs work done per event needs a second answer, and
Queues is planned under its own effort rather than offered today.

**That the ingestion path has two bills and they are read in two places.**
The processing and delivery terms are this service's; every byte after it
lands is R2's storage and operations. An estimate drawn from one of the
two is confidently short, and the rolling policy is where the two meet —
it sets file count, which is an R2 operations term rather than a Pipelines
gigabyte term.

**That there is nothing to run locally, and the substitution is a project
decision.** Cloudflare documents no local form for this binding, so a
project either provisions a development stream and sink of its own or
stubs the send at the seam its own code already has. Both are legitimate;
having neither, and discovering it when the first end-to-end test polls an
empty table, is the failure this bundle exists to make visible up front.

**The category realizes no vwf capability token.** `ingestion` is one the
taxonomy records as a known vwf-side gap, so the service component leaves
`capability` unset and nothing here mints one.

Full judgment: the components' own skills and their references.
