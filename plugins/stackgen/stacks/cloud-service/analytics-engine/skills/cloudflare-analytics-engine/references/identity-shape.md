# Analytics Engine — identity shape

The least-privilege grants this service needs. The account-side model —
the roles broader than they look, account-owned scoped tokens over the
Global API Key, one identity per workload — is the `cloudflare` skill's
identity and IAM reference, which this cites and does not restate.

## Writing and reading are two different identities

| Doing | Authenticates with |
| --- | --- |
| Writing a data point | The binding — no credential exists |
| Reading with SQL | An API token with **Account Analytics Read** |

That asymmetry is the whole of this service's identity story, and it is
worth naming because it is unusual.

## The write side has no credential, which is the point

A Worker with the dataset binding configured writes by calling it. There
is no key to issue, hold or rotate: the grant **is** the binding in the
Wrangler config, and the deploy that lands the config is the moment the
grant exists.

Two consequences:

- **Whoever can deploy the Worker can write to the dataset**, so the
  least-privilege boundary for writes is the deploy pipeline's identity,
  not a credential this component issues.
- **A write cannot be revoked in isolation.** Removing the binding and
  redeploying is the revocation. Nothing here can be turned off from the
  dashboard while the code keeps running.

Since a write is also unauthenticated from the product's point of view
and reports no failure, **do not put anything in a data point that would
matter if it were wrong** — it is telemetry, not a record.

## The read side: one token, one permission

The SQL API authenticates with a bearer token, and the permission it
needs is **Account Analytics Read**
([get started](https://developers.cloudflare.com/analytics/analytics-engine/get-started/),
[SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)).
That is the whole grant. A token carrying anything more — write
permissions on other products, an editor role, the Global API Key — is a
token that can change what it is only meant to read.

**The permission is account-scoped, and there is no per-dataset grant.**
A token that can read one dataset can read every dataset in the account,
production's included. Where a reader must not see production's numbers,
the separation is a separate account, not a narrower token — say so
rather than implying a boundary that does not exist.

**It is a secret and gets the ordinary treatment.** Injected as an
environment variable at the process boundary, catalogued by name and
never by value in `docs/blueprint/environment.md`, rotated, and given one
owner per consumer — the reporting job's token is not the dashboard's.

**The query runs server-side.** A browser that holds this token holds an
account credential, so a dashboard reads through the product's own
backend and the product's own authorization decides who sees which
numbers. A read query against this store carries no notion of a tenant.

## The identifiers a query needs

A query addresses the account, so the account identifier is what the
caller must have alongside the token. Both come from the provider's
identity and IAM reference; neither is named or restated here, and
neither belongs in a shipped file.
