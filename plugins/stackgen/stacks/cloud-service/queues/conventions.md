# Cloudflare Queues — conventions

**Durable messaging between Workers.** A producer sends a message
through a binding; a consumer Worker is invoked with batches of them,
retries what fails, and after a stated number of attempts hands the
message to a dead-letter queue. It is where a product puts work that has
to happen and must not happen inside the request — the email, the
thumbnail, the delivery to a slow downstream — and where that work
survives the isolate that enqueued it
([overview](https://developers.cloudflare.com/queues/)).

**Two halves, configured separately, and only one of them is a
binding.** A **producer** entry names a queue and gives the Worker a
`send()` / `sendBatch()` handle under a binding name. A **consumer**
entry subscribes the Worker script to a queue and carries the batching
and retry settings; it has no binding name, because nothing in code
reaches for it — the platform invokes the Worker's `queue()` handler
([configure queues](https://developers.cloudflare.com/queues/configuration/configure-queues/)).
The same Worker is often both, and a small product usually is.

**This component writes no configuration file.** The blocks belong in
the project's own `wrangler.jsonc`, at the repo root, which the hosting
component — `workers-ssr` or `containers` — is the one that writes. It
is those two and not `workers-static-assets`: a consumer is a `queue()`
handler in a Worker script, and an assets-only deploy ships no script
for one to live in. What this component states is the shape to add
there:

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

**The queue itself is an account resource, created by CLI rather than by
that block.** `wrangler queues create <name>` makes it, and the block
binds to it by name — a name that does not exist is an error at deploy
([the command reference](https://developers.cloudflare.com/workers/wrangler/commands/queues/)).
So **a queue per environment, named for it**, and its dead-letter queue
alongside. Never one production queue shared behind a discriminator
field in the message body: a consumer subscribes to a queue, not to a
field, so a pre-production message on a shared queue is delivered to the
production consumer and does the production thing.

**Each queue has exactly one active consumer, and that single fact
settles most of the design questions.** Cloudflare states it, and states
why — it is what lets the service reach at-least-once delivery with the
duplicate risk kept small
([how Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)).
Fan-out to several independent subscribers is therefore **not** what
this is; a product that needs the same fact to reach three places
publishes to three queues, deliberately, or wants something else. The
inverse composes freely: one consumer Worker may serve several queues,
and the batch it receives names the queue it came from.

**Delivery is at-least-once and unordered, and both are design inputs
rather than caveats.** Cloudflare states that a message may in rare
cases be delivered more than once — the deliberate trade against
exactly-once's overhead
([delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/))
— and that messages are not delivered in publication order. **So every
consumer is idempotent, keyed on something it records**, and no step
depends on having seen a previous message first.

**Messages are small, typed and self-contained.** The ceiling is 128 KB
per message, with a batch capped at 100 messages or 256 KB, whichever
comes first
([limits](https://developers.cloudflare.com/queues/platform/limits/)).
The rule that follows is not really about the ceiling: **send an
identifier and the fields the consumer cannot re-read, not the payload**
— a message carrying a whole record is a snapshot that was already stale
when the consumer picked it up.

**Batching, retries and the dead-letter queue are one decision made
three times.** `max_batch_size` and `max_batch_timeout` set how long a
batch waits to fill; `max_retries` bounds the attempts; and
`dead_letter_queue` names where a message goes after the last one. The
last is the one routinely left out, and leaving it out means a message
that can never succeed is simply dropped
([dead letter queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)).
**Treat the dead-letter queue as required and give it a consumer** — one
with no consumer holds messages for four days and then deletes them,
which is the silent version of the failure it was added to prevent.

**A pull consumer is the other shape, and it replaces the Worker one.**
Where consumption is paced by infrastructure outside Workers, a queue
can be switched to HTTP pull, and the client pulls and acknowledges
batches itself. It is a switch, not an addition: Cloudflare refuses to
add an HTTP consumer to a queue that already has a Worker consumer
([pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/)).

**R2 can produce into a queue** rather than the Worker doing it — the
object-store side of that arrangement, the notification rule and what it
buys, is the `cloudflare-r2` component's, stated once in
`cloud-service/r2/conventions.md` and not restated here.

**What this component satisfies.** The `queue` category realizes vwf's
`message-queue` token, and the neutral contract for it is
`assets/contracts/orchestration.md`. This component answers the
`message-queue` clauses of that contract — at-least-once delivery with
idempotent consumers, bounded retry with back-off, a poison path,
visible work in flight — clause by clause in its service doctrine
reference. The **durable-workflows** clauses of the same contract are
not this component's: a multi-step process with state, timers and
compensation is the `cloud-service/workflows` component, and the
contract's own "pick the smallest thing that holds" table is what
separates them.

**What this is not.** It is not a pub-sub topic — one active consumer
per queue is the whole argument. It is not a workflow engine — nothing
here carries state between messages, and simulating that with a status
column is the mistake the contract names; see
`cloud-service/workflows`. It is not per-key coordination, which is
`cloud-service/durable-objects`. And it is not an ingestion path: events
kept as a record rather than acted on one at a time are
`cloud-service/pipelines`. Which Cloudflare services are offered,
planned and declined is the provider component's to state; see
`cloud-provider/cloudflare/conventions.md`.

Full judgment: the `cloudflare-queues` skill and its references. The
provider-wide doctrine it cites — the account and role model behind
every grant, the billing principle, and what exists on a laptop — is the
`cloudflare` skill's.
