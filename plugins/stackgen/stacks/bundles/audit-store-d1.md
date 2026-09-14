---
name: Audit store · Cloudflare D1
axis: backing
kind: capability-provider
components:
- capability-provider/audit-store-d1@0.1.0
---

# Backing — Audit store · Cloudflare D1

The append-only record of who did what to whom, kept in **its own D1 database**
and bound by the console Worker alone. Audit is a capability of its own here,
not a corner of observability: telemetry answers what the system did, and this
answers which actor is accountable for it.

**The composition is stackgen's neutral audit contract plus this one store.**
The contract requires insert-only writes, no update or delete, ids rather than
personal data, retention purge as the one removal path, a trace id, and a read
surface restricted to operators — with the compliance role alone reading events
that reference retained post-deletion data. It leaves the instance and the
write ordering to the realization, and this bundle is the answer on
Cloudflare's platform: D1 has no database roles, so the only access boundary is
which Worker declares which binding. The instance is therefore a database of
its own, and every read rule above it is the console's code.

The constraint the product is built around is that **absence of grants**.
Append-only is a schema trigger plus a single-purpose seam, which is a strong
operational control and not a cryptographic one — a product whose legal basis
needs tamper-evidence rather than append-only has outgrown this store, and the
component says where the line is. The second database has a price of its own:
there is no transaction spanning two D1 databases, so the event cannot be
written in the same unit of work as the act it records. The ordering is event
first, with the over-report it admits monitored rather than impossible — the
statement the contract asks such a realization to make, and the component makes
it in full.

**It pins beside other backing bundles rather than instead of them.** A project
records one slug per capability, so a product taking its relational data from
`cloudflare-d1` and its audit store from here records both — and this bundle
expects that composition: the audit database is a second D1 database in the
same account, sharing the store-wide judgment the `cloud-service/d1` component
already carries and restating none of it.

Full judgment: the component's own skill and its references. The contract it
cites is stackgen's audit contract.
