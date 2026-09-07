# Queues — pick & trade

## What it is for

**Work that has to happen, and must not happen inside the request.** A
producer Worker sends a message and answers; a consumer Worker is
invoked with a batch of them later, retries what fails, and gives up
into a dead-letter queue. Cloudflare's own placement of it among the
platform's storage and data products is exactly that — Queues for task
processing, beside Pipelines for streaming ingestion and Analytics
Engine for time-series metrics
([the platform's products](https://developers.cloudflare.com/learning-paths/workers/devplat/intro-to-devplat/)).

The shape that fits: **an action, described by a small message, that
somebody will perform once, and whose failure is worth retrying and then
worth a human seeing.** Sending the email. Resizing the upload.
Delivering the webhook to a downstream that is slow or occasionally
down. Recomputing a projection after a write.

## When it is the answer

- **The caller does not need the result.** The response can be written
  before the work is done, and nothing the user sees depends on when it
  finishes.
- **The work is worth retrying.** A transient failure should be tried
  again rather than lost, and a permanent one should end up somewhere a
  person looks.
- **Each item stands alone.** Processing message B does not require
  having processed message A, which is what makes an unordered,
  at-least-once queue a fit rather than a hazard
  ([how Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)).

## Against Workflows

**A queue holds independent messages; a workflow holds one process.**
This is the trade that matters most on this platform, because both are
async, both retry, and only one of them carries state between steps.

The question that separates them is whether the thing being modelled has
a **middle**. "Send this email" has no middle: it succeeds or it is
retried. "Take payment, provision the account, send the welcome mail,
and if provisioning fails refund the payment" has three middles and a
compensation, and each of them needs to know what the previous one did.

`assets/contracts/orchestration.md` states the rule neutrally, and
states it in both directions: a workflow engine is the heaviest of the
four async shapes and **the only one that carries state across steps**,
so do not buy it for a job table's worth of work — and do not simulate
it with retries and a status column when the process genuinely has
branches, waits and compensation. The `cloud-service/workflows`
component is the other side of that trade on this provider.

The tell that a queue has quietly become a workflow: a `status` column,
a message whose handler enqueues the next message, and a growing set of
rules about which states may follow which. That is a state machine
written by accident, without durability, without visibility, and with a
retry policy that resets it.

## Against Durable Objects

**A queue is fan-in of work; a durable object is per-key
coordination.** Both hold something the request does not, and they hold
different things: the queue holds *items waiting to be processed by
whoever is free*, the object holds *the single place where everything
about one key is serialized*.

Reach for `cloud-service/durable-objects` when the requirement is that
two concurrent operations on the same identity cannot interleave — a
seat booking, a running total, a live session. Reach for a queue when
the requirement is that the work happens eventually and nothing about it
is keyed. They compose: a durable object is a perfectly good producer,
and a consumer that must touch one key at a time reaches an object to
do it.

## Against Pipelines

**Queues is for work; Pipelines is for records.** A queue exists so a
consumer will *do* something. A pipeline exists so the event still
exists in six months, in a table nobody has written the query for yet —
that side of the trade is stated from Pipelines' end in
`cloud-service/pipelines`, and this end agrees with it.

The tell is what an hour of nothing consuming means. For a queue it is
an incident: work is not getting done, and the backlog's oldest message
is aging. For a pipeline it is nothing at all.

**A product that needs both is not choosing.** The same domain event can
be queued for work and streamed for the record; the two paths fail
independently, which is the point.

## Against a broker the team runs

The contract's first instruction is **pick the smallest thing that
holds**, and the smallest thing here is genuinely small: a managed
queue with no cluster, no partitions to size, no broker to patch, and a
consumer that is the same kind of Worker the product already deploys.
An external broker earns its operational weight when the product needs
something Queues does not have — strict ordering, replay of a consumed
log, topic fan-out to many independent subscribers, or a consumer
ecosystem that already exists elsewhere.

The contract also names the option below both of them: **where the
product needs only "one step, later, retried until it succeeds", a job
table in the datastore is a legitimate answer** — one less service, and
transactional with the write that enqueued it. On this provider that is
a real choice, because a `cloudflare-d1` write and a queue send are two
systems that can disagree, and the job table cannot.

## When Queues is the wrong answer

- **Order matters.** Nothing here promises delivery in publication
  order, and building ordering on top of an unordered queue means a
  sequence number and a buffer — which is a reimplementation, not a
  configuration.
- **Several independent consumers need the same message.** Each queue
  has exactly one active consumer. Three subscribers means three queues
  and a producer that sends three times, which is honest but is not
  what a topic is.
- **The caller needs the result.** A queue send returns once the
  message is accepted, not once anything happened. A product that
  awaits an outcome is describing a request, and should make one.
- **Exactly-once matters and the consumer cannot be made idempotent.**
  At-least-once is the guarantee; a consumer that cannot record what it
  has already done will eventually do it twice.
- **The volume is tiny and the failure is not worth retrying.** Then
  this is a second system for no gain, and the platform's own deferred
  work mechanism inside the same Worker is enough.

## What choosing it does not decide

**Where the consumer runs.** The consumer is a Worker, so a Queues pin
expects a Workers deploy pin in the project — `cloudflare-workers-ssr`,
or `cloudflare-containers` where the work needs an image. And **what
the messages mean**: which of the product's processes are asynchronous
at all is a blueprint contract, authored per product per flow, which
`assets/contracts/orchestration.md` says plainly it does not decide.
