# Pipelines — pick & trade

## What it is for

Getting a **high-volume stream of events into durable, queryable storage**
without running a broker. Events are sent from a Worker binding or posted
to an HTTP endpoint, optionally reshaped by SQL, and written to R2 as
JSON, Parquet or Apache Iceberg tables. Cloudflare's own placement of it
among the platform's storage products is exactly that — "Pipelines for
streaming ingestion", beside Queues for task processing and Analytics
Engine for time-series metrics
([the platform's storage products](https://developers.cloudflare.com/learning-paths/workers/devplat/intro-to-devplat/)).

The shape that fits: **many small events, written far more often than
they are read, whose value is in aggregate rather than individually**.
Clickstream. Request and application telemetry the product wants to keep
rather than sample. Structured domain events — orders placed, documents
processed, jobs finished — kept as a record to analyse later.

## When it is the answer

- **The events outlive the request that produced them, and nobody acts on
  them one at a time.** They are analysed in batches, days or months
  later, by whoever asks a question.
- **The volume is enough that a row per event in a transactional database
  is the wrong home.** That is the honest threshold: below it, an
  ordinary table is simpler and this is machinery nobody needs.
- **The schema is known enough to declare.** A stream carries a schema,
  and a sink writing Parquet or Iceberg carries a column layout; both
  reward events whose shape is stable.

## Against Queues

**Queues is for work; Pipelines is for records.** A queue exists so a
consumer will *do* something — send the email, resize the image, retry on
failure, give up into a dead-letter queue. A pipeline exists so the event
still exists in six months.

The tell is what happens when nothing consumes for an hour. For a queue
that is an incident: work is not getting done. For a pipeline it is
nothing at all: the sink keeps rolling files and the rows are there when
someone queries them.

Two consequences worth stating. **Pipelines has no consumer, no retry
policy and no dead-letter path** — there is nothing to retry, because
there is no handler. And **a product that needs both is not choosing**;
the same event can be queued for work and streamed for the record, and
the two paths fail independently, which is a feature.

Queues is planned under its own effort and is not offered by this stack
today — see the provider component's scope fence.

## Against Analytics Engine

**Analytics Engine stores pre-shaped, high-cardinality time-series;
Pipelines stores the events themselves.** The question that separates
them is whether the questions are known in advance.

- **Known questions, asked constantly** — request counts by route, error
  rates by customer, a dashboard refreshed every minute. Analytics
  Engine: the write is a data point with dimensions, the read is fast,
  and nothing has to be scanned.
- **Unknown questions, asked occasionally** — "what did users who churned
  do in their last week", asked once, needing fields nobody thought to
  index. Pipelines into a queryable table: the raw event is still there,
  and the cost is that answering means scanning.

Choosing Analytics Engine and later wanting the raw events is the
expensive direction of this mistake — the events were never kept. The
`analytics-engine` component carries its own side of this trade.

## Against writing to R2 directly from a Worker

The tempting shortcut: the Worker already has an R2 binding, so it writes
the event as an object and skips this component entirely. That works, and
it is the right answer for a small number of large writes. For a stream
of events it moves three problems into product code:

- **Batching.** One object per event is one write operation per event
  against R2's per-operation billing, and a directory of millions of tiny
  objects that no query engine reads efficiently. Batching them in the
  Worker means holding state across requests, which a stateless isolate
  cannot do.
- **Format.** Columnar output — Parquet, or an Iceberg table — is what
  makes the data cheap to query later. Writing it from application code
  means a library, a schema mapping and a compaction story the product
  now maintains.
- **Delivery.** Cloudflare states the sink delivers exactly once. A
  hand-rolled writer that fails halfway through a batch has to decide,
  itself, whether the retry duplicates.

Reaching for the direct write is defensible; it should be a decision
somebody made rather than the path of least resistance, because the three
problems above arrive later, together, and in production.

## When the product does not need it at all

- **Low event volume.** If the events fit in the product's own database
  and the queries are answered there, this is a second system for no
  gain.
- **The events must be read back individually and immediately.** That is
  a datastore's job, not an ingestion path's — delivery to the sink is
  asynchronous and a row is queryable only after the sink's rolling
  policy closes a file.
- **The product has no analytical question and no retention requirement.**
  Keeping events because keeping events feels responsible is how a
  storage bill grows without anyone able to say what it bought.

## What choosing it does not decide

**Where the data lands and what reads it.** The sink is an R2 bucket, and
the bucket, the Data Catalog that makes it an Iceberg table, and the SQL
that queries it back are the `cloudflare-r2` component's — pin it
alongside. Both axes take lists, so this is a pairing rather than a
choice between the two.
