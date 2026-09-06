---
name: Cloudflare R2
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/r2@0.1.0
---

# Backing — Cloudflare R2

**S3-compatible object storage with no egress charge.** The product's
store for anything whose natural unit is a file — user uploads, generated
documents, exports, build artifacts, datasets, archived logs — reached
from a Worker through a binding that carries no credential, or from
anything else through an S3 endpoint that existing SDKs and tools already
speak.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, the billing principle, what exists on a laptop —
and the service component carries R2 alone and **cites** that doctrine
rather than restating it. Two components rather than one because the
provider facts are written once: a second Cloudflare service pinned beside
this one reuses them instead of repeating them, and a fact stated twice is
a fact that will disagree with itself.

**What pinning it gives a project** is the judgment, not a config file.
The key layout as the authorization boundary, one bucket per environment
because policy is bucket-level, the presigned-URL and custom-domain paths
and when each is right, the operation classes that actually drive the bill
now that egress does not, the token permission to grant and the three
that are too broad, and what the local simulation does not reproduce. No
file lands in the repo: the wrangler binding block is a shape the project
adds to the config its own hosting component already owns.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is "A LIST: one slug per capability the project needs —
datastore, identity, queue, object storage, telemetry sink", so a project
that needs a database and an object store records both slugs. This one is
the object-storage element; it realizes `object-file-storage` and nothing
else, and it makes no claim on the rest of the axis.

**R2 Data Catalog and R2 SQL come with the pin and need no second
bundle** — they are features of this service, so a project that later
decides its objects are Iceberg tables has already pinned what it needs.

**What this bundle decides that neither component decides alone** is that
the object store is a **per-project** choice on a per-project axis. Two
projects in one repo may reach different buckets, or one may reach none;
the provider component being shared does not make the storage decision
shared, and recording it per project is what lets `/vwf:doctor` check a
project against what it actually declared.

Full judgment: the components' own skills and their references, and the
neutral contract the service half satisfies clause by clause,
`assets/contracts/object-storage.md`.
