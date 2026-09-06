# Pipelines — service doctrine

The service's own usage rules: how the three resources are shaped, where
the transform belongs, what the sink's configuration decides, and the two
doors events arrive through.

**There is no clause-by-clause contract satisfaction here, and that is
correct rather than missing.** The `ingestion` category realizes no vwf
capability token today, so there is no neutral capability contract to
check this against — the taxonomy records that as a known vwf-side gap and
nothing here mints a token to fill it. What this component satisfies
instead is stated directly below.

## The three resources, and why the distinction is load-bearing

| Resource | Is | Created with |
| --- | --- | --- |
| Stream | Where events arrive — schema, optional HTTP endpoint | `wrangler pipelines streams create` |
| Sink | Where they land — an R2 bucket, as files or a catalog table | `wrangler pipelines sinks create` |
| Pipeline | The SQL joining the two | `wrangler pipelines create --sql …` |

All three are **account resources created once per environment**, not
files in the repo
([the command reference](https://developers.cloudflare.com/workers/wrangler/commands/pipelines/)).
The only thing that reaches version control is the stream id, in the
binding. Treating them as configuration to be committed leads to the
familiar failure of a repo that describes resources nobody created.

The pipeline is created by naming the SQL directly, or a file of it:

```sh
wrangler pipelines create events_pipeline \
  --sql "INSERT INTO events_sink SELECT * FROM events_stream"
```

## Stream design: the schema is the contract

A stream is created with a JSON schema file naming its fields, their
types and whether each is required
([managing streams](https://developers.cloudflare.com/pipelines/streams/manage-streams/)).
Two rules follow.

**Declare the schema rather than accepting whatever arrives.** An
unstructured stream defers every type question to whoever queries the
data, which means it is answered inconsistently and late. The declared
schema is also what lets the sink write a columnar format with real
types.

**Mark almost everything optional except the fields that identify the
event.** A required field is a field whose absence rejects the event, and
an event rejected at ingest is an event that no longer exists anywhere. A
timestamp and an identifier earn `required`; a field the product added
last month does not, because older producers still exist.

**One stream per event family, not one per event type.** Cloudflare's SQL
supports fanning a single stream out to several sinks with several
`INSERT` statements, filtered by a discriminator column — so a stream
carrying `event_type` and a pipeline routing on it is the cheaper shape
than a stream per type ([routing to several sinks](https://developers.cloudflare.com/pipelines/pipelines/manage-pipelines/)).
The counter-case is a genuinely different schema, which is a different
stream.

## Transform placement: SQL, not the Worker

The transform is stateless SQL evaluated between stream and sink:
projection, filtering, routing, renaming. **Put shaping there rather than
in the producer**, for one reason — the producer is deployed with the
product and the pipeline is not, so changing what is kept does not
require a release. The inverse rule matters as much: **do not put
business logic there**. A `WHERE` clause deciding which events are worth
keeping is shaping; a `WHERE` clause encoding a product rule is a rule
living outside the codebase, invisible to review and to tests.

Anything requiring state across events — sessionization, deduplication,
windowed aggregation — is not what a stateless transform does, and
attempting it in SQL that runs per batch produces answers that are wrong
in ways nobody notices. That work belongs downstream, in whatever queries
the table.

## Sink configuration: format, partitioning, rolling

**Format is the first decision and it is about the reader.** JSON is
readable by anything and expensive to query at volume; Parquet — with a
compression choice — is columnar and is what a query engine wants; the
`r2-data-catalog` sink type writes an Apache Iceberg table, adding schema
evolution and snapshot semantics on top
([the R2 sink](https://developers.cloudflare.com/pipelines/sinks/available-sinks/r2/)).
Pick against how the data will be read, because the format is decided
once at sink creation and the files already written keep the old one.

**Partitioning is a time pattern on the object path** for file sinks —
year, month, day, hour — which is what lets a query skip the files it
does not need. It is worth setting deliberately: an unpartitioned sink
makes every question a full scan, and that shows up on the bill rather
than as an error.

**The rolling policy is the latency dial**, and Cloudflare exposes three
terms: a file size, an elapsed interval, and a period of inactivity. A
short interval means rows are queryable sooner and the sink writes many
small files, which query engines read badly; a long one inverts both.
Choose against the read pattern — a dashboard refreshed hourly does not
need a thirty-second roll, and paying in file count for latency nobody
observes is the common mistake.

## Delivery, and what "exactly-once" does and does not cover

**Cloudflare states that sinks deliver exactly once — events are neither
duplicated nor dropped in the ingestion path**
([sinks](https://developers.cloudflare.com/pipelines/sinks/)). That is a
strong guarantee and it covers the segment from the stream to the file.

It does **not** cover the producer. `send()` resolves once records are
confirmed ingested; a send that fails ambiguously — a timeout, a
disconnect — leaves the producer not knowing whether the records landed,
and a naive retry there is a duplicate the pipeline will faithfully
deliver exactly once. Where duplicates would corrupt an answer, the event
carries an id the reader can deduplicate on. Where they would not, say so
and move on; adding an idempotency mechanism to an analytics path that
tolerates a double count is machinery bought for nothing.

Nor does it cover **ordering**. Nothing here promises events are stored
in the order they were sent, so the event's own timestamp is the ordering
key, and it is set by the producer.

## The two doors, and the one that is a public write path

**The binding** is the ordinary path: `pipelines` in `wrangler.jsonc`,
with the field named **`stream`** — renamed from `pipeline`, and the old
spelling is what anything trained on older material writes
([writing to streams](https://developers.cloudflare.com/pipelines/streams/writing-to-streams/),
[the rename](https://developers.cloudflare.com/changelog/post/2026-05-27-pipeline-binding-stream-field)):

```jsonc
{
  "pipelines": [
    { "binding": "STREAM", "stream": "<STREAM_ID>" }
  ]
}
```

```js
await env.STREAM.send([{ event: "login", user_id: "123" }]);
```

The block goes in the project's own `wrangler.jsonc`, which the hosting
component writes; this component ships no configuration of its own.

**The HTTP endpoint** is the other door — a stream created with HTTP
enabled accepts a POST of a JSON array at
`https://<stream-id>.ingest.cloudflare.com`. Its two switches are set at
creation and are a security decision, not a convenience:

- **`--http-auth`.** With authentication on, the request carries a bearer
  token holding the send permission — see
  [identity shape](identity-shape.md). With it off, anyone who learns the
  URL can write into the stream, and the URL is not a secret.
- **`--cors-origin`.** Setting it is what allows a browser to post
  directly, which is the arrangement that makes the two previous
  sentences matter. A browser cannot hold a token that is not also
  handed to every visitor, so direct browser ingest means an
  unauthenticated write path by construction. Where that is acceptable —
  anonymous page-view telemetry, where the worst case is junk rows —
  decide it explicitly and expect junk. Where it is not, the browser
  posts to the product's own Worker and the Worker sends through the
  binding.

## Batching in the producer

`send()` takes an **array**, and the array is the point. One call per
event, awaited, adds a round trip to every request and is the common
shape a first implementation lands in. Collect the events a request
produces and send them once, at the end; where a Worker legitimately has
many, the platform's own deferred-work mechanism is what keeps the send
off the response path.

## What this component stays silent on

**The bucket, the catalog and the query engine.** The sink is R2's
storage, the Iceberg table is R2 Data Catalog's, and reading the tables
back is R2 SQL's — all three are the `cloudflare-r2` component's
doctrine, cited here and restated nowhere. A Pipelines pin without an R2
pin beside it describes a stream with nowhere to land.
