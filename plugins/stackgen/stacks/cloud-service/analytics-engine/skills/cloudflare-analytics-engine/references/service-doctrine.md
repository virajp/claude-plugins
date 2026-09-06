# Analytics Engine — service doctrine

The service's own usage rules: how the dataset is named, what the schema
is once anything reads it, how the index is chosen, and how a query is
written so the number it returns is true.

**There is no clause-by-clause contract satisfaction here, and that is
correct rather than missing.** The `analytics` category realizes no vwf
capability token today, so there is no neutral capability contract to
check this against — the taxonomy records that as a known vwf-side gap
and nothing here mints a token to fill it. The one contract a reader
might reach for, `assets/contracts/observability.md`, governs the
telemetry sink instead; [pick & trade](pick-and-trade.md) states why in
one place so it is not re-opened here.

## The binding, and the dataset per environment

The project's own Wrangler config — the one its hosting pack owns; this
pack ships none — gains:

```jsonc
{
  "analytics_engine_datasets": [
    { "binding": "<BINDING_NAME>", "dataset": "<DATASET_NAME>" }
  ]
}
```

The dataset is **created the first time it is written to**
([get started](https://developers.cloudflare.com/analytics/analytics-engine/get-started/)),
which has one consequence worth stating plainly: **a misspelled dataset
name is not an error, it is a new dataset**. Writes succeed, queries
against the intended name return nothing, and the symptom is an empty
dashboard rather than a failure.

**One dataset per environment, named for the environment.** The name is
the entire isolation mechanism — nothing else keeps a staging write out
of production's numbers. Point pre-production's binding at its own
dataset when the environment is created, not after someone notices the
counts are too high.

## The schema is positional, so the argument order is a contract

A stored row is `dataset`, `timestamp`, `_sample_interval`, `index1`,
`blob1`–`blob20` and `double1`–`double20`
([SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)).
Queries name **positions**, not the meanings the Worker had in mind.

So the mapping from meaning to position is a contract the Worker keeps
stable, and it lives somewhere a query author can read — the entity or
flow doc that owns the metric. Two rules follow:

- **Append; never reorder or repurpose.** Inserting a blob at position
  two silently redefines `blob2` for every historical row, and the query
  that reads it keeps returning values of the wrong kind. There is no
  migration and no error.
- **A retired field stays where it is.** Leave the position occupied
  rather than shifting what follows it.

The write-side limits bound the schema: at most twenty blobs, twenty
doubles and **one** index per call, 16 KB of blobs per data point, 96
bytes for the index, and at most 250 data points per Worker invocation
([limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)).
The last one is a real ceiling for a handler that writes in a loop.

## Choosing the index

Sampling is applied **per index value**, on write and on read, and only to
index values receiving high event rates — low-traffic values stay
unsampled
([sampling](https://developers.cloudflare.com/analytics/analytics-engine/sampling/)).
That single fact decides what the index should be.

**Index by the dimension the product slices by and wants protected** —
the tenant, the customer, the host. A busy tenant is downsampled and its
figures stay statistically sound; a quiet tenant keeps every row, which is
exactly the tenant whose numbers are too small to survive sampling.

**Never index by something unique per event** — a request id, an event id,
a timestamp. Every value is then low-rate, nothing is ever sampled, and
the mechanism that keeps queries fast at volume does nothing. The failure
is slow, expensive queries rather than an error.

**One index, so choose the one that matters.** Everything else is a blob.
A dimension in a blob is still queryable — it is simply not the sampling
key, and not protected.

## Querying: the weighting is not optional

Every read weights by `_sample_interval`, which says how many original
rows the stored row stands for. Counting is
`SUM(_sample_interval)` rather than `count()`; an average is
`SUM(_sample_interval * doubleN) / SUM(_sample_interval)`; a quantile
uses a weighted function
([sampling](https://developers.cloudflare.com/analytics/analytics-engine/sampling/)).

This is the failure worth designing against, because it does not look
like one. An unweighted `count()` returns a smaller number that is still
plausible, and it is wrong by a factor nobody can see — and the factor
varies per row, so it cannot be corrected afterwards by multiplying.

**Always bound the time window.** `WHERE timestamp > NOW() - INTERVAL …`
belongs in every query; the store holds three months and there is no
reason for a dashboard to ask for all of it
([limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)).

**Retention is three months and cannot be extended.** Anything a report
must reach further back than that is aggregated and exported on a cadence
the product owns; a rolling window against this store is not a substitute
for a warehouse.

## Dashboards and reports read the SQL API

Queries are a `POST` of SQL text to the account's
`analytics_engine/sql` endpoint under a bearer token, with the response
format chosen by a `FORMAT` clause — `JSON`, `JSONEachRow` or
`TabSeparated`
([SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)).
`SHOW TABLES` lists the datasets that exist, which is the fastest way to
catch the misspelled-name failure above.

Two rules for whatever reads it:

- **The query runs server-side, never in a browser.** The token is an
  account credential; see [identity shape](identity-shape.md).
- **Each `POST` is one read query, whatever it costs to run**, so a
  dashboard that refreshes per widget per viewer is a quantity decision
  before it is a performance one — see [cost shape](cost-shape.md).

## What this component stays silent on

**Where the writing Worker runs**, which is the project's hosting pin's
business, and **the product's telemetry**, which is the sink's.
