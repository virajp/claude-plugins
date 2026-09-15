# Audit store · PostgreSQL — integration & access shape

Where the boundary between the product and the audit store sits, and what the
console's history surface needs on the other side of it.

## The boundary is a grant, not a network hop

The audit schema is in the same database as the product's data, so there is no
service in front of it and no call to make: a service that must record an event
inserts it, on its own connection, inside its own transaction. What separates
audit from the rest of that database is that the service's role can do exactly
one thing to the audit schema and nothing else can reach it at all.

That gives the store a shape its D1 neighbour cannot have — no cross-service
append endpoint, no internal call, no actor carried in a payload because the
caller's identity was lost at a boundary. Two entry points, both in-process:

- **Append.** Called by whatever performs a privileged or destructive mutation,
  **inside the same transaction**, so the two commit or neither does.
- **Append out-of-band.** The same seam through a second connection, for the
  refusals and aborts that must be recorded although the transaction will roll
  back — [contract satisfaction](contract-satisfaction.md) states why the two
  are separate entry points and not one with a flag.
- **Query.** The console's, on the reader role, and nowhere else.

**No product service holds `SELECT` on the events table.** A service that wants
to show an event asks the console, which is the read surface the contract
restricts. Granting a second reader is the diff to refuse.

## Credentials

Three identities where there was one, and the secrets contract's rules apply
unchanged to each: env-injected, names not values, catalogued in
`docs/blueprint/environment.md`, nothing read from a committed file.

**Prefer identity-based database authentication wherever the host offers it.**
It is worth more here than anywhere else in the product: the failure this store
is most exposed to is a service using the wrong connection string, and a mapped
principal per role removes the string that gets copied. Where a password is
unavoidable, the three are rotatable independently — one shared password across
the three roles reintroduces exactly the confusion the roles exist to prevent.

**No observational identity reads the audit schema.** A monitoring check or a
report that wants counts gets them from the console, not from a read-only
connection pointed at the table — otherwise the read surface the contract
restricts has a second door with no policy on it. The one exception worth
allowing is a check that reads the *count* of unpurged rows past their window,
and it belongs to the purge identity.

## What the history surface queries

The operator flow needs three shapes and no more. Design the indexes for
exactly these.

- **By target.** "Everything that happened to this user, this group, this piece
  of content" — the moderation history. Filtered by target entity plus target
  id, ordered by time descending.
- **By actor.** "Everything this operator did" — the review after a complaint
  or during an offboarding. Filtered by actor id, ordered by time descending.
- **One event in full.** Selected by id, showing the reason and the trace id.

Each of the first two is a composite index ending in the timestamp, so the
ordering comes out of the index rather than out of a sort over a scan. An index
no query filters on is a permanent tax on every insert — see
[cost shape](cost-shape.md).

## Partition pruning needs the time predicate, and the console must supply one

This is the trap specific to the partitioned shape, and it is easy to miss
because the query is correct either way. "Everything this actor did", with no
time bound, has nothing for the planner to prune with, so it visits every
partition — including the ones holding years of events nobody is asking about.
Partitioning made the purge cheap and made the unbounded query expensive.

So the surface offers a time window on every filter, defaulted rather than
optional, and widening it is a deliberate act. Check it with `EXPLAIN`: a
history query whose plan lists every partition is the one to fix, and it is
worth checking again after the second year's partitions exist, because the
first year's plan looks fine.

## Pagination is keyset, not offset

`LIMIT … OFFSET n` scans and discards the rows it skips, and the audit table is
the largest append-only table in the database. Page 50 of the history costs
fifty pages' worth of work to return one page, and the deep pages are exactly
what a compliance review reads.

Page by the last row instead: carry the `(timestamp, id)` of the last row shown
and ask for rows ordered before it. The cost is then the page, whatever page it
is, and the composite index serves it directly. The `id` in the cursor is what
makes the ordering total, so two events written in the same instant do not
straddle a page boundary or repeat.

## The reader sees what the policy lets it see, and that is the point

The console does not filter the compliance tier in its handler. The policy on
the table does it, keyed on the role the session is connected as, so restricted
rows are never returned to the application at all — which is what makes the
rule hold through a query the console's authors have not written yet. Duplicate
it in a `WHERE` clause and the two will disagree eventually; the disagreement is
silent in one direction and a support ticket in the other.

What the console *does* own is the classification at write time, and the
handling of a query that returns fewer rows than the operator expected: say
that access is restricted rather than showing a shorter list, or the surface
lies by omission.

## Linking out, not copying in

Events reference ids. The history surface resolves those ids into names at read
time, from the tables that hold them, and where the referenced record has since
been deleted the surface says so rather than showing a blank. The resolution is
a second query on a different grant — not a join, and never a foreign key: the
audit schema holds values, not references, and a constraint pointing out of it
would make the store the reason a deletion fails.

## Correlation

Every event carries the trace id of the request that produced it, which is what
joins the audit record to the telemetry. Audit answers "which actor is
accountable"; telemetry answers "what the system did"; the trace id is the only
thing that makes them one story. Wire it at the seam, from the request context,
rather than passing it as an argument every caller can forget.
