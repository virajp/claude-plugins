# Workers KV — pick & trade

## What it is for

A **global, eventually consistent key-value store** a Worker reads
through a binding. Cloudflare's own storage guidance places it at
key-value data — configuration and metadata — beside R2 for objects,
Hyperdrive for an existing SQL database, D1 for relational data and
Durable Objects for coordination and strongly consistent state
([storage options](https://developers.cloudflare.com/workers/platform/storage-options)).

The shape it fits is **written rarely, read constantly, everywhere**:
feature flags, routing and tenant metadata, a rendered fragment, a
personalization blob, a session lookup that can tolerate a stale answer.

## When it is the answer

- **Reads outnumber writes by orders of magnitude**, and the reads happen
  in every location the product is served from.
- **A stale read is survivable.** Not merely unlikely — survivable, with
  a stated ceiling on how stale, because 60 seconds is the number to
  design against
  ([how KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)).
- **The data is derivable or disposable.** The namespace is a cache in
  the honest sense: losing it costs latency, never truth.
- **Per-object expiry is part of the model** — `expirationTtl` on the
  write rather than a sweeper the product has to run
  ([write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs)).

## When it is the wrong answer

- **Counters, sequences, quotas, locks, anything read-after-write.** The
  binding permits **one write per second per key** and returns
  `429 Too Many Requests` beyond it; Cloudflare's guidance is to spread
  the writes across keys, or to use Durable Objects, whose per-key write
  rate is higher. Two requests incrementing the same key is not a
  contention problem to tune — it is the wrong store.
- **Anything that must read its own write.** The write is visible where
  it was made and takes up to 60 seconds or more elsewhere, and the same
  delay applies to a **negative lookup**: a key created after a miss
  keeps missing for a while. A "create then immediately fetch" flow fails
  intermittently and only under load, which is the worst way for it to
  fail.
- **Relational data, or anything queried by a field that is not the
  key.** `list()` filters by key prefix and nothing else; a query planner
  is D1's job.
- **Large blobs and files.** A value is capped at 25 MiB
  ([limits](https://developers.cloudflare.com/kv/platform/limits/)), and
  an object store bills and streams for that shape — R2's.
- **The system of record.** If losing the namespace loses truth, the
  capability being realized is not `cache-layer`.

## The trade against the neighbours

**Against the Cache API (`caches.default`).** The Cache API is
ephemeral and **does not replicate outside the data center that wrote
it**, while KV persists and is readable from every location until deleted
or expired
([Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache),
[cache data with KV](https://developers.cloudflare.com/kv/examples/cache-data-with-workers-kv/)).
So the Cache API is cheaper and faster for a response that is worth
recomputing per location, and KV is the answer when the recomputation is
expensive enough that each location paying it once is too much, or when a
purge has to be global.

**Against Durable Objects storage.** Durable Objects buy strong
consistency and coordination for one key at a time, at the cost of
routing every request for that key to one place. KV buys a fast read
everywhere at the cost of consistency. The question that settles it is
whether two concurrent requests may disagree.

**Against D1.** D1 is relational: joins, ad-hoc queries, a schema. KV has
one access path — the key — and one filter, the prefix. Reaching for a
key-encoding scheme that emulates a secondary index is the signal that
the answer was D1.

**Against Hyperdrive.** Hyperdrive is a proxy to a database that already
exists; KV is a store the product creates. They answer different
questions and are pinned side by side more often than they are chosen
between.

## The consistency, latency and cost triangle

KV gives up consistency to buy the other two, and does so **globally**
rather than per region — which is why the trade is worth making
deliberately rather than by default:

- **Consistency** is eventual, bounded by roughly a minute, and the bound
  is not tunable downward.
- **Latency** is a global-network read, and a `cacheTtl` on the read
  trades freshness for fewer cold reads — the floor is 30 seconds
  ([read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/)).
- **Cost** is per operation, so the design that reads a hundred keys per
  request is expensive in a way the design that reads one is not — see
  [cost shape](cost-shape.md).

Tightening any one of the three loosens another. A design that needs all
three tight has not found its store yet.

## What choosing it does not decide

**Where the Worker that reads it runs.** KV is a backing service and
pins beside a hosting entry, never instead of one. And it does not
decide the product's system of record: a KV namespace in front of a
datastore is a cache, and something else is still holding the truth.
