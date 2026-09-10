# Workers KV — local dev

**KV is simulated locally, and the binding can also be pointed at the
real namespace.** The provider's local development map owns the general
shape — the `cloudflare` skill — including which of this platform's
surfaces have a local existence at all and where Cloudflare's per-binding
table says so. This row is the one this component owns.

## What runs locally

`wrangler dev` runs in local mode by default; `--remote` develops against
resources on Cloudflare's network instead
([Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)).
So the ordinary loop needs nothing provisioned: the binding resolves to a
local simulation, reads and writes go to disk, and the Worker code is
identical to the deployed one.

**Local KV data persists between runs**, and `--persist-to` names the
directory it persists to
([local data](https://developers.cloudflare.com/workers/local-development/local-data)).
That is why a laptop's namespace fills up with whatever yesterday's
session wrote, and why a test that assumes an empty namespace passes once
and then never again — the local store is durable, not per-run.

The `local_stack` harness answer is nonetheless **`n/a`**, honestly:
there is no engine to compose behind a readiness gate and no port to wait
on. `wrangler dev` is the project's own dev command, and this component
adds no stack to start.

## Seeding

`wrangler kv key put` writes a pair, addressed by binding name or by
namespace id
([get started](https://developers.cloudflare.com/kv/get-started/)):

```sh
wrangler kv key put --binding=MY_KV "some-key" "some-value"
```

**The trap is that this targets the remote namespace.** To write the
local simulation, pass `--local`, and pass the **same `--persist-to`**
the dev server uses if it uses one — otherwise the write lands in a
different directory and the dev server never sees it
([local data](https://developers.cloudflare.com/workers/local-development/local-data)):

```sh
wrangler kv key put --binding=MY_KV "some-key" "some-value" --local
```

The same `--local` rule applies to `kv key get`, `kv key list` and
`kv key delete`. A seeding script that omits it is a script that
silently writes real data, which is the failure worth designing the
command line against — put `--local` in the task, not in a comment.

## `--remote`, and what it actually points at

`--remote` makes the binding read and write the **real namespace named by
the configured id**. That is genuinely useful for reproducing a data
shape nobody wants to recreate by hand, and it is the mode to reach for
before adding fixtures.

It is also the one command in the loop that can damage something. The id
in the top-level `kv_namespaces` block is whatever the project put there,
and if that is a production namespace then a local `put` under `--remote`
is a production write, made from a laptop, by a process with no review
around it. Two habits remove the risk: keep a development namespace as
the top-level binding and production only under its environment block,
and treat `--remote` as a read tool unless the write is the point.

## What local cannot tell you

Three things, and they are the three that break in production:

- **Eventual consistency does not exist locally.** The simulation is a
  local store, so a write is immediately visible to the next read and
  every read-after-write bug passes. The behaviour to design against —
  up to 60 seconds or more of propagation, including for a key that
  previously did not exist — has no local expression at all
  ([how KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)).
  A suite that goes green locally has said nothing about it.
- **The per-key write rate does not exist locally.** One write per second
  per key is enforced by the service, not the simulation, so a design
  that hammers a single key runs fine on a laptop and returns
  `429 Too Many Requests` under real traffic
  ([write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs)).
- **The binding may be absent in a deployed environment and present
  locally.** Bindings are not inherited into an environment block, so a
  staging deploy can lose the namespace the laptop always had; the first
  read is where it surfaces. See
  [service doctrine](service-doctrine.md).

**So the consistency behaviour is verified in a deployed environment or
not at all.** That is not a gap to close with more local machinery — it
is what local can mean here, and it is why the design rule is that every
read has a correct miss path rather than that the tests catch a stale
one.
