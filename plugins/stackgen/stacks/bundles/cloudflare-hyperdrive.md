---
name: Cloudflare Hyperdrive
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/hyperdrive@0.1.0
---

# Backing — Cloudflare Hyperdrive

A **connection pool and query cache** between Workers and a relational
database that already exists somewhere else. The database stays where it
is — another cloud, a managed provider, a machine you run — and the
Worker stops paying a full TCP + TLS + authentication handshake before
its first row. Pick it when the data is not born at the edge and is not
moving.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services —
the account and role model, the billing shape, what exists on a laptop,
and the networking rule that decides whether a private origin is really
private. The service component carries this one service and **cites**
those rather than restating them, so the account facts are written once
and read from wherever they are needed.

**This bundle is pinned alongside a datastore bundle, never alone.**
Hyperdrive holds no rows: it fronts a database, and the database is a
separate pin — `gcp-cloud-sql`, a generated Postgres, whatever the
product actually runs. A project whose backing axis names this and
nothing else has named a proxy and no data, which is a stack that cannot
answer `relational-datastore` at all.

That pairing is representable because the axis is a list:
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs" (vwf's `vwf-config.md`). Pinning the proxy
beside the datastore is the ordinary use of that shape rather than a
workaround for it.

## What this bundle decides that no component decides alone

**The proxy is not a capability, and the pin must not read as one.**
`database-proxy` realizes no vwf capability token, so both components
leave `capability` unset. The capability on this axis comes from the
datastore pin beside it. A reviewer reading the stack should be able to
see which pin answers the blueprint and which one accelerates it.

**Caching is on by default, which makes it a correctness decision taken
at pin time.** Reads are cached for up to a minute unless the
configuration says otherwise, so the product decides *before* it is
built which reads may be stale and which must not — and the mechanism
for the second kind is a second configuration with caching disabled and
its own binding, not per-query judgment at the call site.

**The origin credential never reaches the Worker.** It is handed to
Cloudflare once, when the configuration is created, and the Worker holds
only a binding. That is the security property this composition buys, and
it is lost the moment a connection string is copied into an environment
variable so something can "talk to the database directly".

**Local development runs against a real database, and exercises neither
half of this bundle.** There is no simulated origin: the binding
resolves to a database you name, and pooling and caching are absent from
every local run. The local stack that runs is the datastore component's,
unchanged by this pin — which is convenient, and is also why connection
exhaustion and staleness are production-only failures here.

**This bundle ships no configuration files.** The wrangler binding block
and the `nodejs_compat` flag belong to the project's own
`wrangler.jsonc`, which the hosting bundle owns; the service component
states the shape to add rather than laying a file down beside it.

Full judgment: the components' own skills and their references.
