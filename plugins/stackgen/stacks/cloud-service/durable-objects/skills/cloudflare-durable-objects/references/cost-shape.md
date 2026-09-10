# Durable Objects — cost shape

The provider's billing principle is **seats, not traffic**, and it is the
proxy's — the `cloudflare` skill's cost doctrine owns it, including the
account-level shape and why every other service this stack offers bills by
consumption instead. This is what consumption means for this one service.

## The dimensions

Durable Objects bill on **two axes at once**, which is the thing to
internalize: the compute the object does, and the storage it holds. A design
can be cheap on one and expensive on the other, and only one of them is
visible in a request count.

| Dimension | Counts |
| --- | --- |
| Requests | HTTP requests, RPC sessions, **WebSocket messages** and **alarm invocations** |
| Duration | Wall-clock GB-seconds while the object is running, or idle in memory and unable to hibernate |
| Rows read | Every row a SQLite-backed object's queries read |
| Rows written | Every row those queries write |
| Stored data | SQL data held, per GB-month |

The request and duration halves are stated on the Workers pricing page: the
Free plan includes a daily allowance of requests and of GB-seconds; the Paid
plan includes a monthly allowance of each, with usage beyond billed per
million requests and per million GB-seconds
([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing)).
The storage half is metered as **rows read, rows written and total SQL
stored data**, with a daily allowance on Free and a monthly one on Paid
([Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)).

Never write dollar figures. They change; the shape does not. Read the
current allowances and rates off the two pages above at sizing time —
billing for the SQLite backend began on its own schedule and the numbers
have moved.

## The traps

**Duration is wall-clock, not CPU.** An object is billed while it is
running *and* while it sits in memory unable to hibernate
([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing)).
So an object waiting on a slow upstream `fetch` bills for the wait, and an
object kept resident by something that prevents eviction bills for doing
nothing. That is the single largest difference from a per-request price
model, and it is why "how long is it awake" is a design question rather than
an operational one.

**A WebSocket message is a request.** A chatty protocol — a client polling
over a socket, a per-keystroke update — is a request count that tracks
keystrokes. The fix is the protocol, not the object.

**Hibernation is the WebSocket cost lever, and it is opt-in.** Sockets
accepted with `ctx.acceptWebSocket()` let the object be evicted while the
connections stay open — Cloudflare's own framing is that the API exists **to
save costs** — and `setWebSocketAutoResponse` answers a matching request
without waking it
([WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/),
[DurableObjectState](https://developers.cloudflare.com/durable-objects/api/state/)).
A room full of idle clients then bills for storage and nothing else. The
same room, with the sockets held in application code, bills duration for
every idle second — and both versions pass every test.

**An alarm is a request, so a re-arming alarm is a standing bill.** An
object that re-arms every ten seconds bills a request every ten seconds
forever, per object, whether or not anything changed. Alarms are for work
that must happen, not for polling; where the interval can be long, make it
long, and where the object can simply do the work on the next real request,
let it.

**Rows, not queries.** A SQLite-backed object is metered on rows read, not
statements executed, so a `SELECT` without a bound over a table that grows
is a bill that grows with it while the code stays the same
([Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)).
Index the access path and bound the read.

**Storage never falls on its own.** Nothing sweeps an object's storage;
data written stays until something deletes it, and the per-object cap is
reached the same way. Retention is a decision the class implements — an
alarm that trims, a rollover to a new id — or it does not exist.

## The sizing question

Not "how much traffic" but **"how many objects, how long is each awake, and
how many rows does a request touch"**. Requests track traffic; duration
tracks the shape of the code; rows track the schema. A design whose duration
grows with concurrency rather than with work has an object staying resident
that could have hibernated, and that is the first thing to look at.

## Environment attribution

Objects belong to the Worker that declares their class, so a staging Worker
and a production Worker have separate objects and their usage attributes to
separate deployments without any extra convention — the correctness
separation the [service doctrine](service-doctrine.md) requires gives clean
attribution for free.
