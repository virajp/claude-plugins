# Audit store · D1 — integration & access shape

Where the boundary between the product and the audit store sits, and what the
console's history surface needs on the other side of it.

## The boundary is one seam in one Worker

The audit database is bound to the console Worker and to nothing else, so the
whole product reaches audit through the console rather than through the store.
Two entry points, and no third:

- **Append.** Called by whatever performs a privileged or destructive mutation,
  and called **before** it — the audit database is not the product's, so there
  is no shared transaction and the ordering is what stands in for one. Where the
  mutation happens in another service, that service calls the console's append
  endpoint: an internal call, authenticated as a service, with the actor carried
  in the payload rather than inferred from the caller.
- **Query.** Called only by the history surface, and applying the reader's role
  before it builds a statement.

**No product Worker declares the audit binding.** That is the isolation the
platform gives and the only one it gives — [no roles](no-roles.md).

## Credentials

There are none on the request path, and that is worth stating explicitly rather
than leaving implied. The binding resolves for the Worker it was declared on;
there is no connection string, no password and no token in the audit write path.
`database_id` and `database_name` identify the audit database and authorize
nothing, so they live in the checked-in configuration alongside the binding.

Off the request path the account token rules are the `cloud-service/d1`
component's, and audit adds one restriction to them: **no observational token
reads the audit database.** A monitoring check or a report that wants counts
gets them from the console, not from a `D1:Read` token pointed at the store —
otherwise the read surface the contract restricts has a second door with no
role check on it.

## What the history surface queries

The operator flow needs three shapes and no more. Design the indexes for exactly
these, because on this store an unindexed filter is a bill as well as a
latency — see [cost shape](cost-shape.md).

- **By target.** "Everything that happened to this user, this group, this piece
  of content" — the moderation history. Filtered by target entity plus target
  id, ordered by time descending.
- **By actor.** "Everything this operator did" — the review after a complaint or
  during an offboarding. Filtered by actor id, ordered by time descending.
- **One event in full.** Selected by id, showing the reason and the trace id.

Each of the first two is a composite index ending in the timestamp, so the
ordering comes out of the index rather than out of a sort over a scan. A time
window on its own — "everything in this hour" — is worth an index only if the
console actually offers it; an index that no query filters on is a permanent tax
on every insert.

## Pagination is keyset, not offset

`LIMIT … OFFSET n` scans and discards the rows it skips, and rows read counts
rows scanned. On an append-only table that only grows, page 50 of the history
therefore costs fifty pages' worth of reads to return one page.

Page by the last row instead: carry the `(timestamp, id)` of the last row shown
and ask for rows ordered before it. The cost is then the page, whatever page it
is, and the composite index serves it directly. The `id` in the cursor is what
makes the ordering total, so two events written in the same instant do not
straddle a page boundary or repeat.

## Reading its own writes

The console writes an event and then, frequently in the same session, shows the
history containing it. If read replication is enabled on the audit database, a
read served by a replica may not have seen that write yet, and the operator
concludes nothing was recorded.

Either leave replication off — an audit database read by a handful of operators
has little to gain from it — or carry the session bookmark forward across the
write and the read, which is the mechanism the `cloud-service/d1` component
documents. Decide it, and say which; the failure mode is a missing record, which
is the most alarming thing this surface can show.

## Linking out, not copying in

Events reference ids. The history surface resolves those ids into names at read
time, from the store that holds them, and where the referenced record has since
been deleted the surface says so rather than showing a blank. This is what keeps
the audit database free of personal data while keeping the history readable —
and it is why an event whose subject has been deleted may still be legible to
the compliance role alone.

## Correlation

Every event carries the trace id of the request that produced it, which is what
joins the audit record to the telemetry. Audit answers "which actor is
accountable"; telemetry answers "what the system did"; the trace id is the only
thing that makes them one story. Wire it at the seam, from the request context,
rather than passing it as an argument every caller can forget.
