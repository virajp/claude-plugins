---
name: Cloudflare Workers KV
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/kv@0.1.0
---

# Backing — Cloudflare Workers KV

A **global, eventually consistent key-value store**, read from a Worker
through a binding. It is the cache layer a request reads on every hop —
configuration, routing and tenant metadata, a rendered fragment, a
personalization blob — and not the datastore a request writes on every
hop. Pick it when reads outnumber writes by orders of magnitude, when a
stale answer is survivable with a stated ceiling, and when losing the
whole namespace would cost latency rather than truth.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model behind every grant, the billing principle, what
does and does not exist on a laptop, and the scope fence saying which
Cloudflare services this stack offers at all. The service component
carries this one service and **cites** that doctrine rather than
restating it, so the account-level facts are written once.

**What pinning it gives a project** is the doctrine, not a file. This
component ships no configuration: the project's own Workers pack owns
`wrangler.jsonc`, and this says what the `kv_namespaces` entry in it must
contain, how the namespace is created and its id recorded, and why each
environment gets its own namespace under the same binding name. What
comes with the pin is the judgment — key design against the 512-byte key
and 25 MiB value limits, per-object expiry as the only retention
mechanism, the one-write-per-second-per-key ceiling that makes a counter
the wrong design, the per-operation bill in which a `list` costs like a
write rather than like a read, and a local simulation that cannot show
any of the consistency behaviour worth designing against.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink". So a project that needs a cache layer and a
relational store pins this and `cloudflare-d1`, and a project reaching an
existing database through `cloudflare-hyperdrive` pins this beside that.
Nothing here decides which of them the product needs; each entry states
what it is and what it is not.

**What this bundle decides that neither component decides alone** is that
the cache is a **per-project** pin with a per-environment namespace
behind it. The environment split is a correctness boundary rather than a
security one — separate namespaces make a test run writing production
data impossible instead of merely unlikely, while a key prefix in one
shared namespace is a convention the runtime does not enforce.

**The category realizes vwf's `cache-layer` token**, and no
`assets/contracts/` doctrine exists for it — so the service component
states what a cache layer may hold directly rather than citing a contract
that is not there.

Full judgment: the components' own skills and their references.
