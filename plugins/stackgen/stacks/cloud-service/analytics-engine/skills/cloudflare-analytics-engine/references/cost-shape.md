# Analytics Engine — cost shape

The provider's billing doctrine is **seats, not traffic** — the
`cloudflare` skill's cost doctrine owns it, and it says in as many words
that every Cloudflare service besides the proxy bills by consumption and
that each service's terms are its own component's to state. This is that
statement for this one.

## Two dimensions, and only two

The bill has a **write** term and a **read** term
([pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)):

| Dimension | Unit |
| --- | --- |
| Data points written | One per `writeDataPoint` call |
| Read queries | One per `POST` to the SQL API |

The paid plan includes a monthly allowance on each dimension and charges
per additional million beyond it; the free plan includes a daily
allowance on each. Never write the figures down — they change, and a
stale figure reads as authoritative in a way a stale shape does not.

**Storage is not a term, and neither is volume queried.** Retention is
fixed at three months for everyone
([limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)),
so there is no bill that grows quietly with accumulated data — which is
the shape most people arrive expecting and the one instinct worth
correcting first.

## The read trap: every query costs the same

**A query costs one read query whatever it does.** Complexity is free,
rows scanned are free, a query returning one row and a query returning a
million cost identically
([pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)).

That inverts the usual optimisation. Tightening a `WHERE` clause saves
latency and nothing else; **reducing the number of `POST`s is the only
thing that reduces the read bill.** So:

- **A dashboard multiplies.** Widgets × refresh interval × viewers is the
  query count, and a per-viewer live dashboard is the common way to spend
  the whole allowance on a screen three people watch.
- **One query returning several series beats several queries.** A
  `GROUP BY` that answers five panels is one read query; five panels each
  fetching their own is five.
- **Cache the result, not the query.** A dashboard reading a periodically
  refreshed aggregate costs one query per refresh no matter who is
  looking.

## The write trap: instrumentation is per call, not per request

A data point is one call, and a handler that writes in a loop writes as
many. The ceiling is 250 data points per Worker invocation
([limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)),
which is high enough that the bill notices long before the limit does.

The cheap discipline is **aggregate in the invocation, write once**: a
request that touches forty items and writes forty data points is usually
answering a question one data point with a count in a double could have
answered.

## What sampling does and does not do to the bill

Sampling protects **query performance**, not the write meter — a written
data point is billed whether or not the row it produced survives
downsampling. So sampling is not a cost control, and reasoning "it will
be sampled anyway" is the way an instrumentation habit becomes a line
item.

## The sizing question

Not "how much data will this hold" but **"how many calls will the code
make, and how many `POST`s will read it back"**. Both are decisions in
the product's own code rather than properties of the traffic, which makes
this one of the few services whose bill is fully predictable before it is
switched on.

Never write dollar figures. They change; the shape does not.
