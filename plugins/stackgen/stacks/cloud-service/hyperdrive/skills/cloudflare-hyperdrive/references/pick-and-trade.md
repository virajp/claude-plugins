# Pick & trade — Cloudflare Hyperdrive

## When this is the answer

One signal, and it is narrow: **the data already lives in a Postgres or
MySQL somewhere that is not Cloudflare, it is staying there, and
Workers have to read and write it.** Everything else follows from that.

The problem it solves is per-request connection setup. A Worker isolate
that opens its own connection to a distant database pays a full TCP +
TLS + authentication round trip before its first row, which Cloudflare
puts at 300–500 ms in its own worked comparison of the two shapes
([Workers best practices][bp]). Hyperdrive holds that pool for you, so
constructing a client per request — the only shape a Worker permits —
stops being the expensive shape.

It is also the answer when the data is somewhere you cannot move it
from: a system of record another team owns, a database bound to a
compliance boundary, a schema half the company already queries.

## When it stops being the answer

- **The data is born at the edge and has no other consumer.** Then D1
  is the smaller answer — one service instead of two, no origin to keep
  reachable, no second bill. Reach for a proxy when there is an
  existing database, not when there could be one.
- **The workload needs session-level database state.** SQL-level
  prepared-statement management, advisory locks and `LISTEN`/`NOTIFY`
  are unsupported on Postgres origins, as are `USE`, multi-statement
  queries and non-UTF8 on MySQL ones; Cloudflare's own advice for these
  is a direct connection instead ([Supported databases and
  features][sdf]). A product built on any of them is choosing between
  the feature and the proxy.
- **A statement legitimately runs longer than a minute.** Statements
  are terminated at 60 seconds ([Limits][lim]). A batch job, a big
  migration or an analytical scan belongs on a direct connection from
  something that is not a Worker.
- **The database is SQL Server or MongoDB.** Not supported ([Supported
  databases and features][sdf]); this is a Postgres and MySQL service.

## Against a direct connection from the Worker

The direct connection is not wrong at low volume — it is wrong at
scale, and it fails in the two ways that are hardest to see coming.
Every isolate is its own client, so the connection count tracks
concurrency rather than the pool size the database was sized for; and
the handshake cost is paid on the request path, so latency degrades
exactly when traffic arrives. Hyperdrive replaces both with a **soft
origin connection limit** — defaulting to 20 on a free account and 60
on a paid one, raisable to 100 ([Tune the connection pool][tcp]) — that
the database can actually be sized against.

## Against running your own pooler

A pgBouncer or ProxySQL you operate is the same idea with the operating
cost kept. It buys placement control and, on Postgres, transaction
pooling semantics you choose; it costs an instance to run, patch,
monitor and fail over, and it still sits at one location while the
Workers do not. Pick it when the pooler's own configurability is the
requirement. Otherwise this is the same shape without the pager.

## When caching helps, and when it must be off

Caching is a separate decision from pooling and worth taking
separately, because pooling is always a win and caching sometimes is
not.

**It helps** where a read is expensive relative to how often the answer
changes and where a stale answer is harmless — reference data, product
catalogues, a dashboard's aggregates, anything a human is about to
read.

**It must be off** for authorization checks, for a read that follows a
write in the same flow, and for anything a subsequent decision treats
as current. The mechanism is a second configuration with caching
disabled and its own binding, not per-query cleverness — see [service
doctrine](service-doctrine.md).

[bp]: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
[sdf]: https://developers.cloudflare.com/hyperdrive/reference/supported-databases-and-features/
[lim]: https://developers.cloudflare.com/hyperdrive/platform/limits/
[tcp]: https://developers.cloudflare.com/hyperdrive/configuration/tune-connection-pool/
