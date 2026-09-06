# Cloudflare Analytics Engine — conventions

A **time-series store the product writes to from its own code**. A Worker
calls one method on a binding with a handful of strings and numbers; the
rows land in a dataset that is created the first time it is written to,
and are read back over an HTTP SQL API. There is no collector to run, no
schema to migrate and no retention job to own.

**It answers questions about the product, not about the system.** How many
times a feature was used, by which tenant, at what latency, with what
outcome — the numbers a product owner asks for and a per-customer usage
report is built from. Traces and logs are a different question with a
different contract; see the last section.

## The data point, and the one field that matters most

A write is `writeDataPoint({ blobs, doubles, indexes })`: strings that
describe the event, numbers that measure it, and **one** index that
identifies what the event is about. The stored row is
`dataset`, `timestamp`, `_sample_interval`, `index1`, `blob1`–`blob20` and
`double1`–`double20` — column positions, not names, which is why the
argument order is a contract rather than a convenience
([SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)).

The limits are per call: at most twenty blobs, twenty doubles and **one**
index; 16 KB of blobs in total per data point; 96 bytes for the index; and
at most 250 data points per Worker invocation
([limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)).

**The index is the sampling key, and choosing it is the design decision
here.** Sampling is applied per index value, on write and on read, and
only to index values receiving high event rates — so a busy tenant is
downsampled while a quiet one stays whole
([sampling](https://developers.cloudflare.com/analytics/analytics-engine/sampling/)).
Index by the dimension the product will slice by and want protected —
tenant, customer, host — never by something unique per event, which
defeats the mechanism by making every value low-rate and every query a
scan.

**Writes are non-blocking and are not awaited.** They return nothing, add
no latency, and report no failure, so nothing downstream can branch on
whether a write succeeded
([Workers example](https://developers.cloudflare.com/workers/examples/analytics-engine/)).
That is the property that makes instrumenting cheap and the property that
makes a write a bad place to put anything the product must be sure of.

## The binding

This pack ships no configuration. The project's own Wrangler config — the
one its hosting pack owns — gains a dataset binding:

```jsonc
{
  "analytics_engine_datasets": [
    { "binding": "<BINDING_NAME>", "dataset": "<DATASET_NAME>" }
  ]
}
```

The dataset is **created on first write**, which means a typo in the name
is a new dataset rather than an error
([get started](https://developers.cloudflare.com/analytics/analytics-engine/get-started/)).
A dataset per environment, named for the environment, is the whole of the
isolation between staging and production numbers.

## Reading it back

Queries are a `POST` of SQL text to the account's
`analytics_engine/sql` endpoint under a bearer token, with the response
format chosen by a `FORMAT` clause. The token needs the **Account
Analytics Read** permission and nothing more
([SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)).
The dashboard reads the same data through a GraphQL API; the SQL API is
the one custom queries and external tools use
([get started](https://developers.cloudflare.com/analytics/analytics-engine/get-started/)).

**Every query must weight by `_sample_interval`.** A sampled row stands
for however many original rows the interval says, so `count()` undercounts
and a plain average is wrong: counts are `SUM(_sample_interval)` and
averages are `SUM(_sample_interval * doubleN) / SUM(_sample_interval)`
([sampling](https://developers.cloudflare.com/analytics/analytics-engine/sampling/)).
This is the one rule that produces a plausible, quietly incorrect number
when it is skipped.

**Data is stored for three months**
([limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)).
Anything the product must keep longer than that is exported on a cadence
the product owns, and a report whose window exceeds the retention is a
report of nothing.

## What this component does not cover

**Traces and logs.** Those are the telemetry sink's, under
`assets/contracts/observability.md`, which requires that leaving the
backend not be a rewrite — a different requirement from this one, and this
component neither satisfies it nor competes for it.

**A raw event lake.** Analytics Engine samples and expires; ingesting
events whole and keeping them belongs to the `pipelines` component and
its own bundle.

**Billing-grade counts.** Sampled totals are estimates. A number an
invoice is computed from is stored where every row is kept.

Which Cloudflare services this stack offers beyond this one, and which are
planned or declined, is the provider component's to state — see
`cloud-provider/cloudflare/conventions.md`.

Full judgment: the `cloudflare-analytics-engine` skill and its references.
The provider-wide doctrine it cites is the `cloudflare` skill's.
