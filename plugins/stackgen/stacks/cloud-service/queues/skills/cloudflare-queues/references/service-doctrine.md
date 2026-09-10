# Queues — service doctrine

The service's own usage rules, and the clause-by-clause statement of how
this component satisfies the capability it realizes.

## The contract, clause by clause

The `queue` category realizes vwf's **`message-queue`** token, and the
neutral contract for it is stackgen's async-orchestration contract. That
contract's tokens are four — `durable-workflows`, `message-queue`,
`pub-sub` and `scheduled-jobs` — and this component answers exactly one
of them.
The `durable-workflows` clauses belong to `cloud-service/workflows`;
`pub-sub` is not answered here at all, because each queue has one active
consumer
([how Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)).

| Contract clause | How Queues satisfies it | What the project still owes |
| --- | --- | --- |
| **1. Deliver at least once** | Stated as the service's guarantee: reliability is prioritized and a message may in rare cases arrive more than once ([delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)) | The clause's second half — **every consumer idempotent, keyed on an id it records**. The platform does not provide this and cannot |
| **2. Retry with back-off, and stop** | `max_retries` bounds the attempts; `retry({ delaySeconds })` sets the wait per message and `msg.attempts` is what an exponential curve is computed from ([batching and retries](https://developers.cloudflare.com/queues/configuration/batching-retries/)) | Choosing the bound, and computing the curve — the default retry is not exponential unless the handler makes it so |
| **3. Have a poison path** | `dead_letter_queue` on the consumer entry receives the message after the last attempt ([dead letter queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)) | Naming one, and **giving it a consumer** — see below |
| **4. Make work in flight visible** | Backlog count, backlog bytes and the oldest message's timestamp, live from the producer binding's `metrics()` or the REST endpoint; retry counts, lag time and consumer concurrency over time in the GraphQL datasets ([metrics](https://developers.cloudflare.com/queues/observability/metrics/)) | Putting the **age of the oldest message** somewhere a person sees. Depth alone answers the wrong question |
| **5. Preserve the trace** | Nothing in the message envelope carries one — the body is the product's | Carrying the trace context **in the message body** and continuing the span in the consumer. A queue hop is where a trace silently ends otherwise |

Two more of the contract's rules apply verbatim and are worth restating
as obligations rather than as prose. **Retry only what is safe to
repeat**: a payment, an outbound email and any external mutation each
need an idempotency key that survives the retry, and an unordered
at-least-once queue in front of them makes that mandatory rather than
prudent. And **the access rule**: the project reaches the queue through
its shared services layer, never by importing the binding into a
handler, which is also what lets the unit suite record sends instead of
needing a queue.

## Message design

**Send an identifier, not a snapshot.** The ceiling is 128 KB per
message, with a batch capped at 100 messages or 256 KB, whichever comes
first
([limits](https://developers.cloudflare.com/queues/platform/limits/)) —
but the size limit is not the argument. A message carrying a whole
record was already stale when the consumer picked it up, and the
consumer has a binding to the datastore. Carry the id, the event name,
the fields the consumer genuinely cannot re-read, and a version.

**Type the body and version it.** A queue is a deployment seam: the
producer and the consumer are released at different moments, and during
a rollout both versions are running. A message in flight when the
consumer changes shape is the one that dead-letters, so the body carries
a version field from the first message rather than from the first
incident.

**The idempotency key is part of the message, not of the handler.** The
producer mints it — the domain id where one exists, a request id
otherwise — and the consumer records it before or with the effect. Two
rules keep it honest: the key names *the effect*, not the message, so a
retry and a genuine second event with the same intent collapse
correctly; and the record is written where the effect is written, so
they cannot disagree.

## Batching

`max_batch_size` and `max_batch_timeout` are one dial with two ends: the
batch is delivered when it is full **or** when the timeout expires, and
their defaults are 10 messages and 5 seconds
([configure queues](https://developers.cloudflare.com/queues/configuration/configure-queues/)).
The trade is latency against per-invocation overhead and against blast
radius.

- **Larger batches** amortize whatever the handler sets up once — a
  connection, an auth handshake, a bulk write — and are the right shape
  when the work is genuinely bulk. They also mean a mid-batch failure
  puts more messages at risk of re-delivery, which is only survivable
  because of the acknowledgement rule below.
- **A shorter timeout** lowers the latency of a nearly-empty queue and
  raises the invocation count on a busy one. Set it against what the
  user perceives, not against what feels responsive: nobody observes
  the difference between a two-second and a thirty-second delay on a
  thumbnail, and paying invocations for it is a cost with no reader.

## Acknowledgement, and why partial acknowledgement is the default habit

A handler that returns normally acknowledges the whole batch; a handler
that throws sends the whole batch back for redelivery — **including the
messages it had already processed successfully**. That is the failure
mode `ack()` exists for: acknowledging each message as it succeeds means
a later failure redelivers only what actually failed
([batching and retries](https://developers.cloudflare.com/queues/configuration/batching-retries/)).

The rule that follows: **in any handler that does something with side
effects per message, acknowledge per message.** `msg.ack()` on success
and `msg.retry()` on a failure worth another attempt, rather than
letting an exception decide for the batch. Reserve throwing for the case
where the whole batch really is unprocessable — the downstream is down —
because then redelivering all of it is exactly right.

`msg.retry({ delaySeconds })` is what makes back-off real, computed from
`msg.attempts`. Two things about it are easy to get wrong: a retry delay
cannot exceed 24 hours
([error codes](https://developers.cloudflare.com/queues/reference/error-codes/)),
and **a retried message does not trigger consumer autoscaling**, so a
queue whose failures dominate does not scale its way out of them.

## Retries and the dead-letter queue

`max_retries` defaults to 3, and after the last attempt the message goes
to `dead_letter_queue` if one is named — and is dropped if one is not.
**Name one, always.** The queue's own settings add a second timer behind
that: a message is retained for a configurable period between a minute
and 14 days, defaulting to four days
([configure queues](https://developers.cloudflare.com/queues/configuration/configure-queues/)).

**Give the dead-letter queue a consumer.** A DLQ with nothing attached
holds its messages for four days and then deletes them, which converts
the poison path back into the silent drop it was added to prevent
([dead letter queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)).
The minimum honest consumer writes the message somewhere durable and
raises an alert; the good one also makes replay a deliberate operation,
because a DLQ nobody can drain is an inbox.

Sizing the bound is a judgment about the failure, not a number to copy.
Retries help a transient fault and do nothing for a permanent one, so a
high `max_retries` against a malformed message just delays the
dead-letter by the whole back-off curve. Where the handler can tell the
two apart, it should: a validation failure is `retry()`-worthy zero
times and belongs in the DLQ immediately.

## Consumer concurrency

Concurrency is on by default, and the platform scales the number of
concurrent consumer invocations against the backlog's size, its growth
rate and the ratio of failed to successful invocations, up to
`max_concurrency`
([consumer concurrency](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/)).
Leaving it unset opts into the platform maximum and is the recommended
default.

**Set it when something downstream is the real constraint** — a database
with a connection ceiling, a third-party API with a rate limit, an
external system that serializes anyway. `max_concurrency: 1` is the
explicit statement "this consumer runs one at a time", and it is the
right answer more often than its bluntness suggests. What it is not is a
correctness mechanism: concurrent invocations may process messages for
the same entity, so ordering and mutual exclusion still come from the
consumer's own design — or from a durable object, in
`cloud-service/durable-objects`.

## The two blocks, restated as the shape a project adds

The producer is a binding; the consumer is a subscription. Only the
first appears in code.

```jsonc
{
  "queues": {
    "producers": [
      { "binding": "TASKS", "queue": "<QUEUE_NAME>" }
    ],
    "consumers": [
      {
        "queue": "<QUEUE_NAME>",
        "max_batch_size": 10,
        "max_batch_timeout": 5,
        "max_retries": 3,
        "dead_letter_queue": "<QUEUE_NAME>-dlq"
      }
    ]
  }
}
```

```js
await env.TASKS.send({ type: "resize", assetId, v: 1 });
```

The binding also exposes `sendBatch()` for many messages in one call and
`metrics()` for the live backlog reading clause 4 wants
([the producer API](https://developers.cloudflare.com/queues/configuration/javascript-apis/)).
The block goes in the project's own `wrangler.jsonc`, which the hosting
component writes; this component ships no configuration of its own.

**One consumer Worker may serve several queues.** The batch names the
queue it came from, so a single handler switching on that name is a
legitimate shape and often the cheaper one. The reverse is what is
forbidden: a second consumer on the same queue.

## Pull consumers

Where the consumption rate is set by something outside Workers — a
long-running job, a fixed worker pool, a legacy service — the queue can
be switched to HTTP pull, and the client pulls a batch and acknowledges
it explicitly, with a visibility timeout and a lease per message
([pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/)).

Three facts decide whether it fits. It is **a replacement, not an
addition**: Wrangler refuses to add an HTTP consumer to a queue that
already has a Worker consumer, and the existing one is removed first. It
is **enabled by CLI or dashboard, not by the configuration file** — that
route is no longer supported, so the repo does not record it and the
environment's provisioning must. And it **needs a credential** where the
push shape needed none, which is the identity reference's subject.

Start with the push consumer. Reach for pull when the constraint is real
and named, and record why, because the switch moves a piece of the
system's behaviour out of the repo.

## The ceilings worth knowing before they are hit

A producer is limited to 5,000 messages per second per queue and a queue
holds a backlog of up to 25 GB; an account may have up to 10,000 queues
([limits](https://developers.cloudflare.com/queues/platform/limits/)).
The first two matter together: **a queue is a scaling unit**, so a
product past the producer ceiling shards across queues rather than
tuning one, and the backlog ceiling is what makes "the consumer has been
down for a day" a data-loss question rather than only a latency one.
