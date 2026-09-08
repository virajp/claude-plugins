---
name: Cloudflare Secrets Store
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/secrets-store@0.1.0
---

# Backing — Cloudflare Secrets Store

**The account-level secrets a deployed Worker or Container reads at run
time.** Staging and production values, held once for the account, reached
through a binding the platform resolves — so the running code carries no
credential, the repo carries no ciphertext, and a value that two services
share is rotated in one place instead of three.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, the billing principle, what exists on a laptop —
and the service component carries this one and **cites** that doctrine
rather than restating it. Two components rather than one because the
provider facts are written once: a second Cloudflare service pinned beside
this one reuses them instead of repeating them, and a fact stated twice is
a fact that will disagree with itself.

**What pinning it gives a project** is the judgment, not a config file.
When the store beats a per-Worker secret and when it does not; the naming
rule that keeps a staging binding out of production's value while the open
beta allows one store per account; the create / re-point / delete rotation
order, and why editing a value in place throws away the rollback; the
Admin-versus-Deployer split that separates holding a secret from deploying
with it, and the deploy-token permission that is broader than the deploy
needs; and the clause-by-clause walk of stackgen's secrets contract,
including the one place a binding answers the contract's cardinal rule
differently from an environment variable. No file lands in the repo: the
`secrets_store_secrets` block is a shape the project adds to the wrangler
config its own hosting component already owns.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is "A LIST: one slug per capability the project needs —
datastore, identity, queue, object storage, telemetry sink"
(`plugins/vwf/assets/vwf-config.md`), so a project that needs a database,
an object store and a runtime secrets home records all three slugs. This
one makes no claim on the rest of the axis.

## What this bundle decides that neither component decides alone

**It is pinned beside whatever hosts the code, never instead of it.** The
store runs nothing: the project still ships however its own deploy entry
says — `cloudflare-workers-ssr` for a Worker, `cloudflare-containers` for
a container image beside one — and this decides where that code's secrets
live once it is running. A repo that pins this and nothing to host has
pinned a store with no reader.

**And it is pinned beside the repo's secrets provider, never instead of
it.** The `capability-provider` pick made when the repo was shaped —
`fnox` in a repo that took the default — holds and injects the secrets a
**developer's machine and CI** need. This component holds the values a
**deployed** Worker or Container reads in staging and production. They
share the `secrets-manager` category name on purpose and neither replaces
the other; a repo running on Cloudflare pins both, on different axes, for
different environments. Treating one as the other in either direction is
the mistake with the largest blast radius available here: reaching the
developer-side provider into production puts a long-lived decryption
identity wherever the product runs, and reaching this store onto a laptop
is the thing Cloudflare refuses outright.

**Environment isolation is a naming decision, and it is per project.**
The open beta allows one store per account, so the store cannot carry the
environment and the secret **name** must. That makes the convention a
recorded per-project fact rather than a habit, which is what lets a review
find a binding pointed at the wrong environment before a deploy does.

**The category realizes no vwf capability token.** `secrets-manager` is
one the taxonomy records as a known vwf-side gap, so both components leave
`capability` unset and nothing here mints one. That the same token also
sits under `capability-provider` is the taxonomy's deliberate choice, not
a collision — one names the runtime binding, the other the developer-side
provider.

Full judgment: the components' own skills and their references, and the
neutral contract the service half walks clause by clause — stackgen's
secrets contract.
