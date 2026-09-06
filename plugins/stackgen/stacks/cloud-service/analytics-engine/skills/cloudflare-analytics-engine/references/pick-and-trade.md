# Analytics Engine — pick & trade

## What it is for

Counting and measuring **what the product did**, sliced by a dimension
with many distinct values — per tenant, per customer, per route, per
feature — where the questions are asked later and the answers are
aggregates.

A Worker writes a data point with one non-blocking call; a dataset is
created on first write; the rows are read back with SQL over HTTP
([get started](https://developers.cloudflare.com/analytics/analytics-engine/get-started/)).
There is no collector to run, no schema to migrate, and nothing to size.

## When it is the answer

- **Product usage metrics** — feature invocations, per-tenant activity,
  conversion counts.
- **Per-customer counters a report is built from**, where an estimate is
  acceptable and an exact ledger is not required.
- **Service telemetry the team wants without running a metrics stack** —
  latency and outcome distributions per route.
- **Anything whose cardinality would be a bill somewhere else.** A
  dimension with thousands of values is what this is designed for, and it
  is exactly the shape a conventional metrics backend punishes.

## The line against a telemetry sink, drawn once

**`assets/contracts/observability.md` is not this component's contract,
and this pack does not cite it.** That contract governs the sink for
traces, metrics and logs as one correlated system, and its ranking
requirement is that leaving the backend must not be a rewrite. Analytics
Engine is a product-metrics store written from Workers through a
Cloudflare-specific binding: it correlates nothing to a trace id, and the
binding is the coupling the contract exists to prevent. So a product that
needs telemetry chooses a sink under that contract, and may still write
product metrics here — the two coexist rather than substitute. Anyone
re-opening this should re-read the contract's first requirement rather
than the category name.

## The other three trades

**Against Pipelines plus object storage.** That path keeps every event,
whole and unsampled, for as long as the bucket does — a lake to query
later or reprocess. This one keeps aggregates for **three months** and
samples the busy ones
([limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)).
Pick the lake when the events themselves are the asset; pick this when
the numbers are.

**Against a counter in D1 or a Durable Object.** Those are **exact** — a
row updated transactionally, readable immediately, correct at any volume.
They are also a write on the request path that can fail, and a hot key
under contention. This one is a fire-and-forget write that costs the
request nothing and returns an estimate. Exactness against zero latency
is the whole of the trade.

**Against the dashboard's own analytics.** Cloudflare's built-in
analytics measure the platform's view of traffic. This measures what the
product's code chose to say about itself, which is the only place a
domain concept like "invoice generated" can come from.

## When it is the wrong answer

- **Billing-grade counts.** Sampling makes totals estimates, and an
  invoice computed from an estimate is a support ticket. Keep the ledger
  where every row is kept, and use this for the dashboard beside it.
- **Anything read back immediately after the write.** Writes are not
  awaited and report no failure; there is no read-your-write here.
- **A high-cardinality index.** Indexing by request id or user id makes
  every index value low-rate, which defeats sampling's purpose and turns
  every query into a scan — see
  [service doctrine](service-doctrine.md).
- **Data that must outlive three months in place.** Retention is fixed;
  anything longer is an export the product schedules and owns.
- **Traces and logs.** The sink's, per the contract above.

## What choosing it does not decide

**Where the Worker that writes runs.** The binding lives in the project's
own Wrangler config, which its hosting pin owns; this component adds a
binding block and no configuration of its own.

**Whether the product also has a telemetry sink.** It usually should, and
that is a separate pin answering a separate contract.
