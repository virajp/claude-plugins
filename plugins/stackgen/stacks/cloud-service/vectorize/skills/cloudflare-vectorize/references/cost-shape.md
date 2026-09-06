# Vectorize — cost shape

The provider's cost doctrine is the `cloudflare` skill's, and it says
what the account-wide shape is and what it deliberately does not cover —
including that every service besides the proxy bills by consumption
rather than by seat. This is what consumption means for this one
service.

## The unit is a dimension, not a vector and not a query

Two metered terms, and both are **vectors multiplied by the index's
dimension count**:

- **Queried vector dimensions** — the number of vectors queried plus the
  number of queries, times the dimensions.
- **Stored vector dimensions** — the stored vectors, times the
  dimensions.

Cloudflare states the estimate as one formula over those two terms, and
states plainly what is **not** billed: CPU, memory, active index hours,
and the number of indexes created
([pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)).
Read the formula there before sizing anything; never copy a rate into a
document, because rates change and a stale figure reads as authoritative
in a way a stale principle does not.

## What that shape means

**Dimensions are a cost multiplier on everything at once.** They are in
both terms. An index at twice the width costs twice as much to store and
twice as much to query, for the same vectors and the same traffic. So
the embedding model is a cost decision as much as a quality one, and it
is taken at index creation where it cannot be revised
([limits](https://developers.cloudflare.com/vectorize/platform/limits/)).

**The size of the index is inside the price of every query.** The
queried term counts the stored vectors, not just the results returned —
which means a query against a large index costs more than the same query
against a small one, and `topK` is not the lever it looks like. Cutting
results returned does not cut the query's cost; cutting what the query
has to search does.

**Indexes are free to create, and that is the lever — up to a ceiling.**
Since the count of indexes is not billed, a corpus that partitions
cleanly — per tenant, per content type, per language — can be several
smaller indexes rather than one large one, and every query then bills
against its own partition instead of the whole corpus. The ceiling is
**50,000 indexes per account on Workers Paid and 100 on Free**
([limits](https://developers.cloudflare.com/vectorize/platform/limits/)),
which is generous for a partition keyed on content and finite for one
keyed on a tenant population that grows on its own. Weigh both against
the operational cost of more indexes to create, migrate and keep in
step; the point is that the
partitioning decision has a bill attached, not that more indexes are
always better. Where the partition is a filter rather than a boundary, a
namespace is the cheaper expression of the same idea, and it does not
reduce the stored vectors the query term counts.

## The trap

**Storage is charged for what is in the index, not for what is used.**
Vectors whose source records were deleted, an old index left behind
after a model migration, a bulk load that was re-run under generated ids
instead of derived ones — each keeps billing at full width, quietly and
forever, and each also inflates every query. The three have the same
remedy and it is the same remedy the service doctrine gives for
correctness: derive the id from the source record, delete vectors when
the record goes, and retire the old index at the end of a migration
rather than leaving it as a rollback that nobody will use.

The second half of the trap is the re-embed. Changing the embedding
model means writing the whole corpus into a second index, and while the
dual-write runs **both** indexes are stored and both are billed. That is
a known, temporary cost, and it is much easier to explain before it
appears on a bill than after.

## The sizing question

Not "how many queries will this take" but **"how many vectors, how wide,
and how much of the corpus does one query have to search"**. Those three
numbers are the whole estimate. If the honest answer to the third is
"all of it, forever, and the corpus grows with the product's own
content", the partitioning decision above is worth taking before the
first bulk load rather than after.

A Workers plan includes a monthly allowance of each metered term before
anything is charged, and a corpus small enough to sit inside it adds
nothing to the bill. Which plans this service is available on at all,
and how large each allowance is, both belong to the pricing page rather
than to this reference — they have moved before.
