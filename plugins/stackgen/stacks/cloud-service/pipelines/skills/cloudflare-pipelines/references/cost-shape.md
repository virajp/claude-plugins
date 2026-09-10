# Pipelines — cost shape

The provider's billing principle is **seats, not traffic** — but that is
the private plane's shape, and the `cloudflare` skill's cost doctrine
says so itself: every other Cloudflare service this stack offers bills by
consumption, and what the consumption terms are belongs here. This is
that statement for Pipelines.

## Two dimensions, and ingress is not one of them

Cloudflare prices Pipelines on **the volume of data processed by
stateless SQL transforms** and **the volume of data delivered to sinks**.
**Ingress into a stream is free**
([pricing](https://developers.cloudflare.com/pipelines/platform/pricing/)).
Never write the figures; they change, and a stale number reads as
authoritative in a way a stale shape does not.

Three things follow from the shape alone.

**Sending more events does not, by itself, cost more.** The free ingress
term is unusual enough to be worth saying out loud, because every
instinct trained on message brokers points the other way. What costs is
what the pipeline *does* with the events after they arrive.

**Filtering in the transform reduces the delivery term but not the
transform term.** A `WHERE` clause that drops nine tenths of the events
still processed all of them; only the tenth that survives is delivered.
So filtering early is worth doing, and expecting it to make the bill
disappear is not.

**The output format moves the delivered-data term.** Cloudflare bills
delivery to a sink at different rates for JSON and for columnar output —
Parquet and Iceberg cost more per delivered gigabyte than JSON
([the pricing announcement](https://developers.cloudflare.com/changelog/post/2026-05-11-pipelines-pricing-announced)).
That is the one place where the format decision in the
[service doctrine](service-doctrine.md) shows up on the bill, and it
points the opposite way from the query cost, which columnar output
lowers. Deciding it on ingestion price alone gets the total wrong.

## The sink's storage is R2's bill, not this one's

Data written to a bucket or an Iceberg table incurs **R2's own storage
and operations charges**, stated as such on the pricing page above. So a
pipeline has two bills and they are read in different places: the
processing and delivery terms here, and everything about the bytes once
they have landed in the `cloudflare-r2` component's cost shape — its
storage tier, its per-operation terms and its egress rule. Reading only
one of the two produces an estimate that is confidently short.

The connection worth carrying: the rolling policy sets the **file count**,
and file count is an operations term in R2's bill rather than a
gigabyte term in this one. A thirty-second roll on a low-volume stream
buys latency nobody watches and pays for it in R2 write operations that
never appear on the Pipelines line.

## Retention is the term nobody sizes

Ingestion is a rate; **storage is an integral**. A stream that costs
little to deliver accumulates every month it runs, and nothing about a
pipeline expires anything — there is no retention setting here, because
retention is a property of the bucket. So the sizing question is not
"how many events per second" but **"how many events per second, kept for
how long, and deleted by what"**. A product with no answer to the third
part has chosen unbounded, and will discover it as a storage line rather
than as an ingestion one.

## Plan allowances exist and are worth checking, not memorising

Both dimensions carry a monthly included allowance that differs between
the free and paid Workers plans, and Cloudflare has stated that billing
was not yet enabled when the pricing was announced, with notice promised
before charges begin. Both facts are current-state rather than doctrine:
read the pricing page at the time the decision is made rather than
trusting a number written here.

## The sizing question

Not "how many events" but **how many bytes survive the transform, in what
format, and for how long after they land**. Those three answers produce
an estimate; the event count alone produces a number that feels like one.
