---
name: Audit store · PostgreSQL
axis: backing
kind: capability-provider
components:
- capability-provider/audit-store-postgres@0.1.0
---

# Backing — Audit store · PostgreSQL

The append-only record of who did what to whom, kept in **its own schema inside
the product's PostgreSQL database** and reachable only through the grants each
role holds on it. Audit is a capability of its own here, not a corner of
observability: telemetry answers what the system did, and this answers which
actor is accountable for it.

**The composition is stackgen's neutral audit contract plus this one store.**
The contract requires insert-only writes, no update or delete, ids rather than
personal data, retention purge as the one removal path, a trace id, and a read
surface restricted to operators — with the compliance role alone reading events
that reference retained post-deletion data. It leaves the instance and the
write ordering to the realization, and this bundle is the answer on an engine
that has real privileges: every one of those clauses is a grant, a policy or a
trigger the database enforces, so the instance can be a schema beside the
product's data rather than a database apart from it — and because it is, the
event commits in the **same transaction** as the act it records. That atomic
write is the thing this realization has that a store with no roles cannot
offer.

What it costs is discipline rather than a residual. A grant binds an identity,
so the guarantees hold only while each process connects as the role intended
for it, and the component makes connection-string discipline the constraint the
product is built around rather than an operational footnote. The honest limits
are named in the same place: the schema's owner and the server's superuser sit
inside the trust boundary, so append-only here is a strong operational control
and not a cryptographic one, and a refusal that must be recorded cannot ride
the transaction it is refusing — Postgres has no autonomous transaction, so
that one path takes a second connection.

**It pins beside other backing bundles rather than instead of them.** A project
records one slug per capability, so a product taking its relational data from
`postgres` and its audit store from here records both — and this bundle expects
that composition: the audit schema lives in the database that bundle composes,
sharing its pooling, migration and credential judgment and restating none of
it. Through it the bundle also composes with a hosted Postgres such as the
`cloud-sql` bundle, where the three roles are reached by mapped identities and
there is no password to copy between services.

Full judgment: the component's own skill and its references. The contract it
cites is stackgen's audit contract.
