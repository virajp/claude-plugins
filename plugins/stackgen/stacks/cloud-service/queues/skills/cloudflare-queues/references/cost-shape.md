# Queues — cost shape

The provider's billing principle is **seats, not traffic** — but that is
the private plane's shape, and the `cloudflare` skill's cost doctrine
says so itself: every other Cloudflare service this stack offers bills
by consumption, and what the consumption terms are belongs here. This is
that statement for Queues.

## One dimension, counted three times

Cloudflare bills Queues on **operations**, and an operation is every
**64 KB of data written, read, or deleted**. There is no egress charge
and no throughput charge
([pricing](https://developers.cloudflare.com/queues/platform/pricing/),
[the Workers pricing page](https://developers.cloudflare.com/workers/platform/pricing/)).
A monthly allowance is included; read the figure on the pricing page at
the time the decision is made rather than trusting a number written
here, because a stale number reads as authoritative in a way a stale
shape does not.

**The shape to carry is that a delivered message costs three
operations, not one** — one write when it is produced, one read when it
is consumed, one delete when it is acknowledged. So the sizing unit is
messages delivered, multiplied by three, and an estimate built on
"writes per second" is a third of the real answer.

## Operations are counted per message, and batching does not change that

This is the term that surprises people, and it is stated plainly:
operations are calculated **per message rather than per batch**, so a
batch of ten costs ten writes, ten reads and ten deletes. Batching is a
latency and throughput mechanism, and an efficiency one for whatever the
handler sets up once — **it is not a billing mechanism**. Sizing
`max_batch_size` upward to save money saves none.

The corollary points the other way and is the useful one: **the number
of messages is the whole bill**, so the design decision that moves it is
whether an event becomes one message or ten. Collapsing "these five
fields changed" into one message per entity rather than one per field is
the change that shows up; tuning the consumer is not.

## Message size is a billing dimension, and the metadata is part of it

Because an operation is per 64 KB, a message larger than that counts as
several — each 64 KB chunk or fraction of one. And each message carries
roughly 100 bytes of internal metadata, so a message sized deliberately
at exactly 64 KB crosses into a second operation for every one of its
three counts.

That is the arithmetic behind the message-design rule in the
[service doctrine](service-doctrine.md): **send an identifier, not a
snapshot.** The correctness argument for it is staleness; this is the
bill's argument for the same thing, and the two agree, which is rare
enough to lean on. A product embedding a rendered document in a message
is paying for it three times over and reading it back from the queue
instead of from the store that already has it.

## Failure is a cost term, not only an availability one

Retries, writes into a dead-letter queue, and messages that expire all
incur their own operations. So a consumer that flaps against a failing
downstream is spending on every attempt: the read that delivered it, the
write that re-enqueued it, and eventually the write into the DLQ and
whatever drains it.

Two consequences worth designing for. **A high `max_retries` against a
permanent failure is a purchase**, and it buys nothing, which is the
cost-side argument for the doctrine's rule that a validation failure
dead-letters immediately rather than retrying. And **an unbounded
back-off curve does not reduce the operation count**, only its rate —
the operations still happen, later.

## What the sizing question actually is

Not "how many events per second" but **how many messages are delivered,
how big each one is after its metadata, and what fraction of them are
retried**. Those three produce an estimate. The first alone produces a
number that feels like one and is short by whatever the failure rate
turns out to be.

## What this bill does not include

**The Workers that produce and consume.** A consumer invocation is a
Worker invocation with its own request and CPU-time terms on the Workers
bill, and a busy queue with a small `max_batch_size` buys invocations
that the operations line never shows. That is the one place batching
*is* a cost decision — on the neighbouring bill rather than on this one.

**Anything the consumer touches.** The datastore write, the object put,
the outbound API call — each belongs to its own component's cost shape.
A queue is cheap and the work behind it usually is not, so an estimate
that stops at the queue has priced the envelope.

The account-level guardrails — budget alerts, environment attribution,
and the review cadence — are the `cloudflare` skill's cost doctrine,
cited here and restated nowhere.
