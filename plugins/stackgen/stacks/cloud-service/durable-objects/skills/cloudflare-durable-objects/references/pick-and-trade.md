# Durable Objects — pick & trade

## What it is for

**One addressable object per id, single-threaded, with its own strongly
consistent transactional storage.** Cloudflare's own storage guidance places
it at "global coordination and stateful serverless" beside KV for key-value
configuration, R2 for objects, D1 for relational data and Hyperdrive for a
database that already exists
([storage options](https://developers.cloudflare.com/workers/platform/storage-options)).

The shape it fits is **state with a natural key, mutated concurrently, that
must be correct**: a counter, a quota, a lock, a rate limiter, a chat room,
a game session, a per-tenant ledger, a live document, the fan-out point for
a set of WebSocket connections.

## When it is the answer

- **Two concurrent requests must not disagree**, and what they disagree
  about has one key. Requests for an id are delivered to one instance and
  run single-threaded, so the read-modify-write needs no lock the product
  writes and no transaction spanning a network.
- **The state has a name the product already knows.** A room code, a tenant
  id, an order number — `getByName` turns that name into the object from
  anywhere, with no lookup table in between.
- **Something must happen later, per key.** `setAlarm` schedules a wake-up
  the object itself handles, with a retry count on the handler's argument
  ([alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)),
  so there is no scheduler process to run and no cron fanning out over a
  list.
- **Long-lived connections need a place to meet.** WebSockets accepted with
  `ctx.acceptWebSocket()` hibernate: the object can be evicted from memory
  with the sockets still open, and a message re-runs the constructor and
  delivers to `webSocketMessage`
  ([WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)).

## When it is the wrong answer

- **The read path is global and the writes are rare.** Every request for an
  id travels to that object's one location; a value read everywhere and
  written seldom is cheaper and faster from KV, and giving up consistency
  is the trade being made deliberately.
- **The query is not by the key.** There is no cross-object query, no join
  and no index spanning ids. A design that needs "all objects where …" has
  either built a fan-out over a list it maintains by hand, or has picked
  the wrong store — that shape is D1's.
- **Traffic concentrates on one id.** Single-threaded is a guarantee in one
  direction and a ceiling in the other: one id's throughput is one
  instance's throughput, so a global counter that every request increments
  is a bottleneck designed in. Shard the id (`counter:<bucket>`) and
  aggregate, or accept the ceiling knowingly.
- **The state is large or blob-shaped.** Storage is capped **per object** —
  the general limits also bound a single key-plus-value pair — so a design
  that puts files in an object has misread it; that is R2's shape and R2 is
  not an alternative to this service, it is a different question. Verify
  the current caps on the
  [limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
  page, which has moved as the product matured.
- **The state has no key at all.** Something purely global, with no id that
  divides it, is either one object (see the ceiling above) or was never
  per-key state.

## The trade against the neighbours

**Against Workers KV.** KV buys a fast eventually consistent read from
everywhere; a Durable Object buys read-after-write and serialized mutation
for one key, at the price of routing that key's traffic to one place. KV
also caps a single key at one write per second, which is why Cloudflare's
own KV guidance points a write-heavy key here
([write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs)).
The settling question: may two concurrent requests disagree? See
`cloud-service/kv/`.

**Against D1.** D1 is relational and shared: a schema, joins, ad-hoc queries
across rows written by every request. A Durable Object's SQLite is private
to one id and queried only from inside that object. Per-key state that
happens to be tabular is this; data whose value is in the relationships
between rows belonging to different keys is D1's. See `cloud-service/d1/`.

**Against Workflows.** Both are durable and both survive a restart, and they
answer different questions. A Workflow is **a run** — an ordered set of
steps, each retried, with durable `sleep` and event waits, that starts and
finishes. A Durable Object is **a place** — long-lived, addressed by name,
holding state between unrelated requests with no beginning or end. A
multi-step business process is a Workflow; the thing that process mutates
may well be a Durable Object. See `cloud-service/workflows/`.

**Against an external store.** A Postgres row with `SELECT … FOR UPDATE` is
the familiar version of this, and it works — at the cost of a connection
pool, a round trip from the edge to wherever the database is, and a lock
whose contention is the database's problem. The object removes all three by
moving the compute to the state. It also removes the ability to ask any
question that spans keys.

## What choosing it does not decide

**Where the Worker that holds the class runs.** The class is exported from
the Worker script, so this pin expects a Workers deploy pin beside it —
`cloudflare-workers-ssr`, or `cloudflare-containers` where the project's
compute is a container image. And it does not decide the product's system of
record: an object holding derived or in-flight state is not the same as one
holding the truth, and which it is should be a decision rather than a
default.
