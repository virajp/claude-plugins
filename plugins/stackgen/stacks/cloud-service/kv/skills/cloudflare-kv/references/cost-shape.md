# Workers KV — cost shape

The provider's billing principle is **seats, not traffic**, and it is the
proxy's — the `cloudflare` skill's cost doctrine owns it, including the
account-level shape and why every other service this stack offers bills
by consumption instead. This is what consumption means for this one
service.

## The dimensions

KV bills **per operation, in four kinds, plus stored data**
([pricing](https://developers.cloudflare.com/kv/platform/pricing/)):

| Dimension | Counts |
| --- | --- |
| Reads | Every `get` / `getWithMetadata` |
| Writes | Every `put` |
| Deletes | Every `delete` |
| Lists | Every `list` page |
| Storage | Data held, per GB-month |

**Each of the four is metered on its own allowance**, and reads get an
allowance two orders of magnitude larger than the other three. That is
the useful thing to know about this bill: the design lever is **write,
delete and list volume**, not read volume — and a design that stays
inside the read allowance can still exhaust the list one on its own.

## The allowances

On the **Free** plan, per day, resetting at 00:00 UTC: 100,000 reads,
1,000 writes, 1,000 deletes and 1,000 list requests, with 1 GB of stored
data. **Exceeding a limit makes operations of that type fail** rather
than generating a charge — reads keep working while writes stop
([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing)).

On the **Paid** plan, per month: 10 million reads, 1 million writes,
1 million deletes and 1 million list requests included, plus 1 GB of
storage, with usage beyond each billed per million operations and per
GB-month
([pricing](https://developers.cloudflare.com/kv/platform/pricing/)).

Never write dollar figures. They change; the shape does not.

## The traps

**A list is not a read.** It has its own allowance, a hundredth the size
of the read one, and a listing that pages draws once per page at up to
1,000 keys a page. A dashboard that lists a large namespace on every load
is the most expensive thing in a design that otherwise looks read-only,
and it is the one people do not think to count — and it exhausts its own
limit without touching the read one, so the failure arrives with the read
budget still mostly unspent.

**A fan-out read is a read per key.** A hundred sequential `get` calls
bill as a hundred reads; the same hundred keys in one bulk call bill the
same but cost far less latency, so the bulk form is a latency fix, not a
cost one. The cost fix is fetching fewer keys — one composed value in
place of a hundred small ones.

**`cacheTtl` is the read lever.** Holding a result at the reading
location for longer means fewer cold reads for the same traffic; the
floor is 30 seconds and the price is freshness on top of what eventual
consistency already costs. See
[service doctrine](service-doctrine.md).

**Free-plan failure is a runtime failure.** On the Free plan the limits
do not degrade into a charge — the operation fails. A product whose
non-production environments sit on the Free plan will see writes stop
partway through a day, and the symptom looks like a bug in the
application.

**Storage never falls without deletes or expiry.** A value written with
no TTL is stored until something removes it, and nothing will. Per-object
expiry is the mechanism, and it is set at write time — see
[service doctrine](service-doctrine.md).

## The sizing question

Not "how much traffic" but **"how many writes and lists per request, and
how many distinct keys"**. Read volume tracks traffic and lands in the
larger allowance; writes and lists track the design. A design whose write
count grows with requests rather than with changes has picked the wrong
store, which is the same conclusion
[pick & trade](pick-and-trade.md) reaches from the consistency direction.

## Environment attribution

Namespaces are per environment, so operations attribute cleanly by
namespace and the GraphQL analytics group operations by namespace and
action type
([metrics and analytics](https://developers.cloudflare.com/kv/observability/metrics-analytics)).
A single namespace shared across environments loses that, which is a
second reason for the separation the service doctrine already requires
for correctness.
