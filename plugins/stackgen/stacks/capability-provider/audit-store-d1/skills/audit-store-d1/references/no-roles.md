# Audit store · D1 — no roles, the constraint that bites

The one property that reshapes how the product is built around this store.
**D1 has no database roles.** There is no `GRANT`, no read-only user, no
per-table permission and no row-level security. Every access-control rule the
audit contract states has to be met somewhere other than the database.

This is not a gap in the pack's research; it is the platform's model. At runtime
the binding is the identity, and a Worker holding it can do anything to that
database — the `cloud-service/d1` component's identity reference states that
once and this file does not restate it. What follows for **audit specifically**
is the subject here, because audit is the capability where the absence costs the
most.

## What the platform does enforce

Exactly two lines, and they are worth naming precisely because they are all
there is:

- **Which Worker holds which binding.** A database is reachable only by the
  Workers that declare it. This is a deploy-time, reviewable, all-or-nothing
  boundary.
- **Which token holds `D1:Edit`.** Off the request path, reading takes `D1:Read`
  and writing or changing configuration takes `D1:Edit`. The deploy identity
  holds the second; nothing else should.

Everything else in the audit contract's access rule — operators read, the
compliance role alone reads events referencing retained post-deletion data — is
above the database.

## Consequence 1 — isolation is a database, so use one

Because the only boundary is the binding, an audit table sitting in the
product's database is reachable by every path that reaches the product's data,
including the paths that write it. There is no grant that makes it read-mostly
and none that makes it operator-only.

The contract leaves the instance to the realization, and this is the
realization: a dedicated database, which converts isolation from a promise into
a deployment fact — the audit database appears in exactly one Worker's
configuration, and adding a second is a diff someone reviews.

## Consequence 2 — the compliance rule lives in the console, alone

The contract's read rule has two tiers. Operators read the history; the
compliance role alone reads events that reference retained post-deletion data.
On a store with roles, the second tier would be a grant. Here it is code, and
that has three implications worth deciding out loud:

- **The tier is a property of the event, so it is a column.** Whether an event
  references retained post-deletion data is decided when the event is written,
  by the seam, and stored — not re-derived at read time by a query that has to
  understand every entity's deletion state. A read-time derivation is a rule
  that drifts the first time an entity's retention changes.
- **The filter is applied in the query, never after it.** The compliance
  predicate goes into the `WHERE` clause so the restricted rows are never read
  into the console's memory. Filtering a full result set in the handler is a
  bug waiting for a logging statement, and on this store it is also billed —
  rows read counts rows scanned.
- **The check has one implementation.** Every read path into the audit database
  goes through one query builder that applies the operator's role. Two entry
  points mean two chances to forget, and the forgetting is silent.

## Consequence 3 — read-only means read-only in the code

The console both reads history and, being the operator surface, is where
privileged mutations originate — so the Worker holding the audit binding is a
Worker that can write. There is no read-only binding to hand the history
surface.

What replaces the missing grant is a seam with two functions and no third: an
append that only inserts, and a query that only selects. The history surface
calls the second and cannot reach the first, because the first is not in its
module. That is a reviewed boundary rather than an enforced one, and stating it
that way in the blueprint is more honest than implying a grant that does not
exist.

## Consequence 4 — the account is inside the trust boundary

Anyone holding `D1:Edit` on the account can write to the audit database, drop
its triggers, or delete rows, using `wrangler d1 execute --remote` or the
dashboard console. No configuration prevents it, and this is true of the
Postgres realization's superuser too — it is not a D1 peculiarity.

So state the control that actually applies: **the deploy identity is the only
holder of `D1:Edit`, and account access is governed by the provider's own
identity model.** A product whose threat model includes a hostile or compromised
account administrator has outgrown database-enforced append-only entirely and
wants tamper-evidence — hash chaining, or write-once storage with object lock —
which [pick & trade](pick-and-trade.md) names as the point where this pack stops
being the answer.

## The review, in four questions

1. Which Workers declare a binding to the audit database, and is the answer one?
2. Does every read path go through the single query builder that applies the
   compliance predicate, in the `WHERE` clause?
3. Is the two-tier classification written by the seam and stored, or re-derived
   at read time?
4. Does anything besides the deploy identity hold `D1:Edit`?
