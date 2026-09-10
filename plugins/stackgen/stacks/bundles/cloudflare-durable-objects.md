---
name: Cloudflare Durable Objects
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/durable-objects@0.1.0
---

# Backing — Cloudflare Durable Objects

**Stateful serverless**: one addressable object per id, single-threaded,
with its own strongly consistent transactional storage, alarms and
WebSocket coordination. It is where state that must be **correct per key**
lives — a counter, a quota, a lock, a room, a session, a per-tenant ledger.
Pick it when two concurrent requests must not disagree and what they
disagree about has one key; pick something else when the read path is global
and the writes are rare, or when the query is not by the key.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model behind every grant, the billing principle, what does
and does not exist on a laptop, and the scope fence saying which Cloudflare
services this stack offers at all. The service component carries this one
service and **cites** that doctrine rather than restating it, so the
account-level facts are written once.

**What pinning it gives a project** is the doctrine, not a file. This
component ships no configuration: the project's own Workers pack owns
`wrangler.jsonc`, and this says what the `durable_objects.bindings` entry
and its accompanying `migrations` entry in it must contain. What comes with
the pin is the judgment — one responsibility per class, the name handed to
`getByName` as a contract with the data behind it, in-memory state loaded
once behind `blockConcurrencyWhile` and never mistaken for the truth, alarms
as the per-key scheduler, WebSocket hibernation as the difference between an
idle room costing storage and costing duration, a bill that meters wall-clock
time and SQL rows as well as requests, and migrations in which deleting a
class is irreversible.

**The class lives in the project's own Worker, which is the shape difference
from every other backing pin here.** There is no namespace to create, no id
to record and nothing provisioned out of band — the migration travels inside
the deploy. So this pin **expects a Workers deploy pin beside it**:
`cloudflare-workers-ssr`, or `cloudflare-containers` where the project's
compute is a container image running beside the Worker. A Durable Objects
pin with no Workers pin anywhere in the project names a class that has
nowhere to be exported from.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per capability
the project needs — datastore, identity, queue, object storage, telemetry
sink". So a project that needs per-key coordination and a relational store
pins this and `cloudflare-d1`, and one that also caches globally pins
`cloudflare-kv` beside both. Nothing here decides which of them the product
needs; each entry states what it is and what it is not.

**What this bundle decides that neither component decides alone** is that
per-key state is a **per-project** pin whose environment boundary is the
Worker deployment itself. A staging Worker deploys its own class and
therefore has its own objects, so there is no shared namespace to separate
and no id prefix to enforce — and an id prefix is exactly what must not be
reached for, because it is a convention the runtime does not enforce and one
wrong name mutates a production object's storage.

**The category realizes no vwf capability token.** `stateful-compute` is
among the ones the taxonomy records as a known vwf-side gap, so the service
component leaves `capability` unset and nothing here mints one. It is
deliberately not `object-storage`: a per-key durable object is compute that
keeps state, so it is never lined up against a blob store and never asked to
satisfy a blob-storage contract it cannot meet.

Full judgment: the components' own skills and their references.
