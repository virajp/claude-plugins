# Cloudflare Pipelines — conventions

**Streaming ingestion into the object store.** Events are sent from a
Worker binding or posted to an HTTP endpoint, optionally reshaped by SQL,
and written to R2 — as JSON or Parquet files, or as an Apache Iceberg
table through R2 Data Catalog. It is how clickstream, telemetry and
structured product events become durable without a broker the team runs
([overview](https://developers.cloudflare.com/pipelines/)).

**Three nouns, and they are not interchangeable.** A **stream** is where
events arrive: it holds the schema and, optionally, an HTTP ingest
endpoint. A **sink** is where they land: an R2 bucket, as files or as a
catalog table. A **pipeline** is the SQL that connects the two —
`INSERT INTO <sink> SELECT … FROM <stream>`
([managing pipelines](https://developers.cloudflare.com/pipelines/pipelines/manage-pipelines/)).
Calling all three "the pipeline" is the habit that makes every later
sentence ambiguous, including the ones about cost and about what a health
probe measures.

**This component writes no configuration file.** The binding block belongs
in the project's own `wrangler.jsonc`, at the repo root, which the hosting
component — `workers-static-assets` or `workers-ssr` — is the one that
writes. What this component states is the shape to add there:

```jsonc
{
  "pipelines": [
    { "binding": "STREAM", "stream": "<STREAM_ID>" }
  ]
}
```

**The key is `pipelines` and the field inside it is `stream`.** It was
`pipeline` until Cloudflare renamed it, so the old spelling is what
anything trained on older material writes, and it fails at deploy rather
than at edit time
([writing to streams](https://developers.cloudflare.com/pipelines/streams/writing-to-streams/),
[the rename](https://developers.cloudflare.com/changelog/post/2026-05-27-pipeline-binding-stream-field)).
In the Worker, the binding exposes `send(records)` — an array of
JSON-serializable records, returning a promise that resolves once they are
confirmed ingested.

**The HTTP endpoint is the second door, and it is a decision.** A stream
created with HTTP enabled gets an ingest URL of the form
`https://<stream-id>.ingest.cloudflare.com`, which accepts a POST of a
JSON array; with authentication on, requests carry a bearer token holding
the send permission. Both switches are set when the stream is created
(`--http-enabled`, `--http-auth`, `--cors-origin`) and a CORS origin plus
no authentication is a deliberately public write path, not a default to
inherit.

**The three resources are created once per environment, by CLI, not by a
file in the repo.** `wrangler pipelines streams create`,
`wrangler pipelines sinks create`, then `wrangler pipelines create <name>
--sql "INSERT INTO <sink> SELECT * FROM <stream>"`; a `--sql-file` carries
several statements when one stream fans out to several sinks
([the command reference](https://developers.cloudflare.com/workers/wrangler/commands/pipelines/)).
Only the resulting stream id reaches the repo, in the binding above.

**Schema goes in, format comes out, and they are separate choices.** The
stream declares its input fields (`--schema-file`); the sink declares how
they are stored — `--format json`, `--format parquet` with a compression
choice, or `--type r2-data-catalog` for an Iceberg table
([the R2 sink](https://developers.cloudflare.com/pipelines/sinks/available-sinks/r2/)).
The catalog and the SQL that later reads those tables are R2's, not this
component's: the `cloudflare-r2` component carries them, and a Pipelines
pin expects an R2 pin beside it for the sink.

**Delivery is exactly-once at the sink; the rolling policy is the dial.**
Cloudflare states that sinks deliver exactly once — events neither
duplicated nor dropped. What is tunable is when a file closes: by size, by
elapsed interval, or after a period of inactivity. Frequent small files
mean lower latency to queryability and worse query performance later;
larger, rarer files invert both. Pick against the read pattern, not
against the write one.

**What this component is not.** It is not a task queue — work with
consumers, retries and a dead-letter path is Queues, which this stack
plans and does not yet offer. It is not a metrics store — pre-aggregated,
high-cardinality time-series is the `analytics-engine` component. Which
Cloudflare services are offered, planned and declined is the provider
component's to state; see `cloud-provider/cloudflare/conventions.md`.

Full judgment: the `cloudflare-pipelines` skill and its references. The
provider-wide doctrine it cites — the account and role model, the billing
principle, what exists locally — is the `cloudflare` skill's.
