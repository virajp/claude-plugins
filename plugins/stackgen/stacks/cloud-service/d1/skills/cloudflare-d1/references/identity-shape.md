# Identity shape — Cloudflare D1

The account-side model — which credential automation is handed, why the
unscoped one never appears in a design, and the privilege review that
reconciles them — is the `cloudflare` skill's identity and IAM reference.
This file cites it and states only what is this service's own: the
permission a token needs to touch D1, and the fact that at runtime there
is no token at all.

## At runtime the binding *is* the identity

A Worker reaches its database through the binding declared in the
configuration. There is no connection string, no username, no password
and no token in the request path — the platform resolves the binding for
the Worker it was declared on, and nothing else can present it.

That removes the credential this store would otherwise need, and it moves
the whole authorization question one level up: **a Worker holding a
binding can do anything to that database.** D1 has no per-table, per-row
or read-only grant inside the binding, so the boundary is which Workers
declare which databases. Two consequences follow, and both are design
decisions rather than configuration:

- **A database is scoped to the service that owns it.** A Worker that
  needs another service's data calls that service, per the datastore
  contract's access rule — it does not add a second binding.
- **Read-only means read-only in the code**, because the platform will
  not enforce it. Where that matters — a reporting surface, an
  operator's ad-hoc query path — the enforcement is a reviewed part of
  the service, and saying so is more honest than implying a grant that
  does not exist.

## Off the request path: two permissions, and the difference is real

Anything outside a Worker — a deploy applying migrations, a pipeline
checking configuration, an operator running a query — uses an
account-owned API token, whose credential rules are the provider
reference's. What is this service's own is **which permission that token
carries**, and D1 draws the line exactly where it should:

| Doing | Needs |
| --- | --- |
| Reading a database, or reading its configuration | `D1:Read` |
| Writing rows, applying migrations, changing database configuration | `D1:Edit` |

Cloudflare documents both against the read-replication configuration
endpoints — reading the replication mode takes `D1:Read`, setting it
takes `D1:Edit`
([read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)).

**The line is enforced, and recently tightened.** A 2025 fix closed a
case where a token holding `D1:Read` plus edit permissions on some
*other* product could still write to a database over the HTTP API; a
write now requires `D1:Edit` explicitly
([release notes](https://developers.cloudflare.com/d1/platform/release-notes/)).
The practical reading is that a token predating that change may be
narrower than whatever it appeared to be, so a pipeline that quietly
worked can fail on a permission it never held.

## Which token gets which

**The deploy identity holds `D1:Edit`; nothing else does.** Migrations
are the only routine write off the request path, so the permission that
allows them belongs to the one identity that applies them, and it belongs
to a token scoped to D1 rather than to a broader one that happens to
include it.

**Everything observational holds `D1:Read`.** A monitoring check, a
report, a doctor pass. The temptation to hand it the deploy's token
because it already exists is how an account acquires a second thing able
to rewrite a database.

**Nothing holds a token in the browser or on a device.** There is no
client-direct path to design around here, so a token outside the
account's own automation has no legitimate holder.

## The ids are not secrets

`database_id` and `database_name` identify a database; they do not
authorize anything, so they live in the checked-in configuration
alongside the binding and are not catalogued as secrets. The account id
and the API token that *are* credentials are the provider reference's
subject, named there once.

Getting this backwards has a cost in both directions: treating an id as a
secret pushes an ordinary configuration value into a secret store where
nobody can review it, and treating the token as an id puts a write
credential in the repository.

## Reviewing this database

1. Which Workers declare a binding to it, and does each of them need
   **write** access?
2. Does any automation hold `D1:Edit` that only reads?
3. Is the deploy's token scoped to D1, or to something broader that
   includes it?
4. Does a read-only surface enforce read-only anywhere the platform can
   see, or only in prose?
