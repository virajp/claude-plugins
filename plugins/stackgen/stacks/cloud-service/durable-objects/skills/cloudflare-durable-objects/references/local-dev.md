# Durable Objects — local dev

**The class runs for real on the laptop, and the binding has no per-binding
remote mode.** The provider's local development map owns the general shape —
the `cloudflare` skill — including which of this platform's surfaces have a
local existence at all, where Cloudflare's per-binding table says so, and
the separate question of whole-Worker `--remote`. This row is the one this
component owns.

## What runs locally

`wrangler dev` runs in local mode by default; `--remote` develops against
resources on Cloudflare's network instead
([Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)).
So the ordinary loop needs nothing provisioned — and for this service that
is more literally true than for any other backing pin, because there is
nothing to provision even remotely: the class is in the Worker script, and
`wrangler dev` instantiates objects from it on the machine. The code path is
the deployed one, the ids resolve the same way, and the storage is real
SQLite.

That is the fidelity point worth stating: **the single-threaded delivery
guarantee, the storage semantics, the alarm handler and the WebSocket
hibernation callbacks are all genuinely exercised locally.** Where KV's
simulation hides the behaviour worth designing against, this one does not
hide the central one.

## Where the state lives, and why it outlives the test

Local state persists between runs under the Wrangler state directory, and
`--persist-to` names a different one
([local data](https://developers.cloudflare.com/workers/local-development/local-data)).
So yesterday's objects are still there this morning, with yesterday's rows
in them.

**Resetting is removing that directory.** Cloudflare documents where the
state lives and how to move it, not a command for clearing it — so the reset
is a consequence of the persistence rule rather than a documented flag, and
it is an ordinary delete of whatever `--persist-to` names:

```sh
rm -rf <the persistence directory>
```

**`--persist-to` must be passed on every `wrangler dev` invocation**, not
once
([local data](https://developers.cloudflare.com/workers/local-development/local-data)),
which is what makes a reset script easy to get wrong: a task that deletes
the custom directory and a dev command that forgot the flag are pointed at
two different stores, and the objects the reset was supposed to clear are
still there.

**Put the reset in the test task, not in a comment.** A suite that assumes a
fresh object passes on a clean machine and then never again, and the failure
reads as a flaky test rather than as durable state doing exactly what it
promised. The `local_stack` harness answer is nonetheless **`n/a`**,
honestly: there is no engine to compose behind a readiness gate and no port
to wait on — `wrangler dev` is the project's own dev command and this
component adds no stack to start.

## Alarms locally

Alarms fire on the laptop, with one stated trap: **alarm methods may fail
after a hot reload**, and the fix is to stop and restart `wrangler dev`
rather than to debug the handler
([alarms in local development](https://developers.cloudflare.com/durable-objects/api/alarms/)).
An alarm that stopped firing halfway through a session is a reload artefact
until proven otherwise.

The second thing to know is that a local alarm is **wall-clock**, like the
deployed one. A class that re-arms for an hour is untestable by waiting; the
time has to be a parameter of the class, so a test can set it to a second.

## Testing objects directly

`cloudflare:test`'s `runInDurableObject(stub, fn)` runs a function **inside**
an instance, with its `DurableObjectState` in hand, so a test can assert on
`state.storage.sql` after driving the object through its public surface
([testing with Durable Objects](https://developers.cloudflare.com/durable-objects/examples/testing-with-durable-objects/)).
That is the tool for the assertions that would otherwise need a getter added
to production code purely for the test.

Use it for state assertions and drive the behaviour through the object's own
interface, not the other way round — a suite that mutates storage from
outside has tested the storage engine.

## `--remote`, and the two questions it is easy to conflate

**The binding has no per-binding remote mode**, so there is no way to point
a locally-running Worker's Durable Objects binding at objects living on
Cloudflare while everything else stays local. The per-binding table is what
says so
([supported bindings per development mode](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).

**Whole-Worker `wrangler dev --remote` is a different question, and Durable
Objects is supported in it** — the same page's remote-development list names
it. That mode uploads the Worker and runs it on Cloudflare, so the objects
are the real ones and nothing is running on the laptop at all. The provider's
local development map states both answers side by side and explains why they
are asked separately.

The consequence for a working day: the local loop and the remote loop are
whole-Worker choices here, not per-binding ones. There is no half-way
configuration in which local code inspects a production object, which is a
small loss in debugging convenience and a large one in accidental
production writes.

## What local cannot tell you

- **Placement, and therefore latency.** Every locally-instantiated object is
  in the same place as the code. `locationHint` has no local meaning, and a
  design whose latency depends on where an object was first created shows
  nothing on a laptop.
- **The per-object throughput ceiling.** Single-threaded delivery is
  exercised locally, but a laptop's load is not production's; a hot id that
  serializes fine at ten requests a second is the same code at ten
  thousand. That ceiling is reasoned about, not tested locally.
- **The bill.** Duration is wall-clock and hibernation is what stops it (see
  [cost shape](cost-shape.md)); a local run bills nothing, so an object that
  never hibernates is indistinguishable from one that does until it is
  deployed.
