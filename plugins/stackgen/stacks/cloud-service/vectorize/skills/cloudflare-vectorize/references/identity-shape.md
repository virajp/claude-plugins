# Vectorize — identity shape

The least-privilege grants this service needs. The account-side model —
the two identity systems, account-owned tokens over the Global API Key,
why the roles are broader than they look, and the privilege review — is
the `cloudflare` skill's identity and IAM reference, which this cites and
does not restate.

## Two paths reach an index, and only one of them holds a credential

| Path | Authenticated by | Used for |
| --- | --- | --- |
| The Worker at runtime | The binding | Query, upsert, delete on the request path |
| Automation and the CLI | An account-owned API token | Create the index, declare metadata indexes, bulk load, inspect |

**At runtime there is no credential at all.** The binding *is* the
grant: a Worker configured with it reaches that index, and a Worker
without it cannot. Nothing is injected, nothing rotates, and nothing can
leak from the request path — which is the main security argument for
reaching the index by binding rather than over the HTTP API from
somewhere else.

## The token permission, and the two levels of it

The API exposes exactly two permissions for this service:
**`Vectorize Read`** and **`Vectorize Write`**
([API reference](https://developers.cloudflare.com/api/resources/vectorize/subresources/indexes/)).
Read covers listing and inspecting indexes; write covers creating and
deleting them, declaring metadata indexes, and loading vectors.

Give the write permission only to the thing that actually writes. A
pipeline that runs a bulk load needs it; a job that reports on index
state, and a person who wants to know what exists, need read. The
distinction is worth making because these grants are account-scoped —
the provider's reference owns that fact and its consequence, which is
that a write token reaches every index in the account and the way to make
a blast radius smaller than an account is a separate account, not a
cleverer token.

The credential names and how the token reaches a process at all are the
provider's and the hosting component's business, not this one's.

## The binding is not authorization inside the index

**A binding is all-or-nothing over one index.** There is no per-vector,
per-namespace or per-tenant permission — a Worker that can query the
index can query every vector in it, and a Worker that can write can
overwrite any id.

Two things follow, and they are the ones that get missed:

- **Multi-tenant separation is the application's job, or it is the
  index's boundary.** A namespace or a metadata filter separates tenants
  only because the code always passes it; forget it in one query path
  and the query returns another tenant's neighbours with no error. Where
  the separation must not depend on a caller remembering, the boundary
  is a **separate index per tenant** — which the cost shape notes is free
  to create — and then the binding is the enforcement. **That answer has
  a ceiling: 50,000 indexes per account on Workers Paid and 100 on Free**
  ([limits](https://developers.cloudflare.com/vectorize/platform/limits/)),
  so it fits a tenant population that is enumerable and does not fit one
  that grows with sign-ups. Where the tenants outnumber the ceiling, the
  separation goes back to the application and is enforced by making the
  namespace or filter impossible to omit — a single accessor the query
  paths all go through — rather than by remembering it at each call.
- **The id is guessable and the metadata is readable.** Anything in a
  vector's metadata is returned to any caller the Worker serves, if the
  Worker passes it through. Metadata is for filtering and for resolving
  back to a record, not for anything the end user must not see.

## What a query result is, as a privacy question

A nearest-neighbour result is an inference about the corpus, not a row
the caller asked for. Returning ids and letting the product's own
authorization decide which records the caller may actually see keeps the
existing access rules in force; returning metadata straight from the
index to a user bypasses them, because the index has none of its own.
That is the same argument the service doctrine makes for returning ids
rather than values, arrived at from the other direction.

## What this component does not need

**No secret on the request path**, so there is nothing to catalogue in
`docs/blueprint/environment.md` for the runtime. The only credential in
the picture belongs to the pipeline and the CLI, and it is the ordinary
account-owned token the provider's reference already governs.
