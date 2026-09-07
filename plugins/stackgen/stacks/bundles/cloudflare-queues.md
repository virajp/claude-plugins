---
name: Cloudflare Queues
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/queues@0.1.0
---

# Backing — Cloudflare Queues

**Durable at-least-once messaging between Workers.** A producer sends a
message through a binding and answers the request; a consumer Worker is
invoked later with batches of them, retries what fails, and hands what
will never succeed to a dead-letter queue. Pick it when the product has
work that must happen, must not happen inside the request, and must not
be lost — the email, the thumbnail, the delivery to a downstream that is
slow or occasionally down.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services —
the account and role model behind every grant, the billing principle,
what exists on a laptop, and the networking rule — and the service
component carries this one service and **cites** that doctrine rather
than restating it. Written once, read from wherever it applies.

**What pinning it gives a project** is the doctrine, not a file. This
component ships no configuration: the project's own Workers pack owns
`wrangler.jsonc`, and this says what the `queues.producers` and
`queues.consumers` entries in it must contain, that the queue itself is
an account resource created by CLI once per environment, and that its
dead-letter queue is created beside it. What comes with the pin is the
judgment — messages that carry an identifier rather than a snapshot
under a 128 KB ceiling, an idempotency key minted by the producer
because delivery is at-least-once and unordered, per-message
acknowledgement so a mid-batch failure does not redeliver what already
succeeded, a dead-letter queue treated as required *and given a
consumer*, and a bill counted per message and per 64 KB in which
batching saves nothing.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink" (vwf's `vwf-config.md`). So a project pins this
alongside whatever else it needs from any provider, and the axis
composes rather than choosing.

**The consumer is a Worker, so this pin expects a Workers deploy pin
beside it.** A queue with no consumer is a backlog; the thing that
drains it is a Worker script, deployed by the project's own deploy-axis
entry — `cloudflare-workers-ssr`, or `cloudflare-containers` where the
work needs an image. That pairing is asserted here because neither
component states it alone: the provider does not know what the project
picked, and the service component describes the consumer without owning
where it runs.

## What this bundle decides that no component decides alone

**Which of the platform's three event-shaped answers this is.**
Cloudflare offers Queues for task processing, Pipelines for streaming
ingestion and Analytics Engine for time-series metrics. Pinning this one
records that the product wants **work done, not records kept and not
aggregates** — something happens because the message existed, and the
message is gone once it has. A product that also wants the event to
still exist in six months needs a second answer, and
`cloudflare-pipelines` is it; the two paths fail independently, which is
a feature.

**That fan-out is not on the table.** Each queue has exactly one active
consumer, which is what makes at-least-once delivery workable and is
also why this bundle realizes vwf's `message-queue` token and **not**
`pub-sub`. A product needing the same fact delivered to three
independent subscribers pins three queues and produces three times, or
wants a different service — and it is better to learn that here than
after the first topic-shaped design.

**That the work is asynchronous but not a process.** A queue holds
independent messages; a multi-step process with state, timers and
compensation is `cloudflare-workflows`, and per-key coordination is
`cloudflare-durable-objects`. `assets/contracts/orchestration.md` draws
those lines neutrally and the service component walks its
`message-queue` clauses one by one. Pinning this instead of one of the
other two is a decision about the product's shape, not about
Cloudflare's.

**That every environment gets its own queue.** A consumer subscribes to
a queue, not to a field in the message body, so a shared production
queue with a discriminator is not an isolation mechanism at all — the
suite's message is delivered to the production consumer and does the
production thing. The split is a correctness boundary rather than a
security one, and it is the reason the pack's harness block states a
queue and a dead-letter queue per environment rather than a prefix.

Full judgment: the components' own skills and their references.
