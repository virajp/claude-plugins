# Workers KV — service doctrine

The service's own usage rules: how keys, TTLs and metadata are designed
against the stated limits, what the binding must contain, and why the
namespace is per environment.

**There is no clause-by-clause contract satisfaction here, and that is
correct rather than missing.** This component realizes vwf's
`cache-layer` capability, and `assets/contracts/` carries no doctrine for
it — there are contracts for datastores, object storage, identity, local
stacks, observability, orchestration, release triggers and secrets, and
none of them is this one. So what the capability means for this component
is stated directly below, and nothing here invents a contract file to
cite.

## What a cache layer may hold

**Losing the namespace must cost latency, never truth.** Every value in
it is either derivable from a source that survives, or is data the
product has decided in advance it can lose. That is the whole clause, and
it is the one to check a design against: if the answer to "what happens
if this namespace is empty tomorrow" is anything other than "it gets
slower and then refills", the capability is misnamed and the store is
wrong.

Two consequences. **Nothing writes to KV as its only write** — a write
that has no source of truth behind it is a system of record wearing a
cache's clothes. And **every read has a miss path** that produces a
correct answer, because a miss is the normal state of a key that was
just written, of a key that expired, and of a key in a location the write
has not reached.

## Key design

The key is the only access path and the prefix is the only filter, so the
key **is** the schema.

- **Namespace the key by hand**, hierarchically, most significant part
  first: `tenant:<id>:flags`, not `flags:<tenant-id>`. Prefix listing is
  the only query, so the parts you would filter by go on the left.
- **A key name is at most 512 bytes**, and all printable, non-whitespace
  characters are valid
  ([limits](https://developers.cloudflare.com/kv/platform/limits/)).
  A key built from user input needs a bound and an encoding decided up
  front, not discovered when a long one is rejected.
- **Version the key rather than mutating the value** where the write rate
  would otherwise concentrate: `config:v7` written once and a pointer
  flipped is one write on the pointer, and it sidesteps the per-key
  limit below.
- **Never encode a secondary index into the key space.** Two key layouts
  for the same data, kept in step by application code, drift — and the
  drift is invisible because both reads succeed. That design is D1's.

## TTL and expiration

Expiry is per key and set on the write — either `expiration`, an absolute
UNIX time, or `expirationTtl`, a number of seconds. Setting both uses
`expirationTtl` and ignores `expiration`; setting **neither means the
pair never expires**. `expirationTtl` has a floor of **60 seconds**
([write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs)).

**Set one on everything that is a cache of something else.** A value with
no expiry is a value that outlives the shape of the thing it caches, and
the failure is a stale answer nobody can explain because nothing wrote it
recently.

**`cacheTtl` on the read is a different dial.** It says how long a result
may be held at the reading location, minimum **30 seconds**
([read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/)).
Raising it buys fewer cold reads and costs freshness on top of the 60
seconds propagation already costs — the two add, and a design that sets
a large `cacheTtl` and then reasons about staleness in terms of the
write's TTL alone has undercounted.

## Metadata, bulk operations and listing

- **Metadata** is arbitrary JSON attached to a pair, capped at **1024
  bytes**, returned by `getWithMetadata` and — importantly — by `list()`.
  Putting the small fact a listing needs to filter on into metadata is
  what turns a list into something useful without a read per key.
- **Bulk reads** take up to **100 keys** in one `get()` or
  `getWithMetadata()` call and return a `Map`
  ([read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/)).
  A request that fans out into a hundred sequential reads should be one
  bulk call — it is fewer round trips and the same billed operations.
- **`list()` is prefix, limit and cursor**, at most 1,000 keys per page,
  and the response carries the cursor for the next
  ([list keys](https://developers.cloudflare.com/kv/api/list-keys)).
  Treat listing as an administrative operation, not a request-path one: a
  listing that pages is several operations, and its results are subject
  to the same up-to-60-second propagation delay unless a `cacheTtl` was
  set on the reads.

## The write-rate limit, stated plainly

**One write per second per key**, over which the write fails with
`429 Too Many Requests`. There is no limit on the number of distinct
keys, and Cloudflare's own guidance for a write-heavy workload is to
spread writes across keys or to use Durable Objects, which allow a higher
per-key write rate
([write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs)).

The trap is that this is invisible in development and arrives all at once
in production: one key per tenant is fine at ten tenants and fine at ten
thousand, while one key for everything is fine until traffic doubles.
Decide the key's write concentration when the key is designed.

## The binding block, and whose file it goes in

This component ships **no `wrangler.jsonc`**. The project's Workers pack
owns that file; what follows is what this service requires be present in
it.

A namespace is created first, and the command prints the id
([get started](https://developers.cloudflare.com/kv/get-started/)):

```sh
wrangler kv namespace create MY_KV
```

The id it prints is recorded in the configuration, not in code:

```jsonc
{
  "kv_namespaces": [
    { "binding": "MY_KV", "id": "<namespace-id>" }
  ]
}
```

`binding` is the name the Worker reads as `env.MY_KV`; `id` names the
namespace the binding resolves to.

## Per-environment namespaces

**One namespace per environment, the same binding name in each**, so the
code is identical and only the id differs
([environments](https://developers.cloudflare.com/kv/reference/environments/)):

```jsonc
{
  "env": {
    "staging": {
      "kv_namespaces": [{ "binding": "MY_KV", "id": "<staging-id>" }]
    },
    "production": {
      "kv_namespaces": [{ "binding": "MY_KV", "id": "<production-id>" }]
    }
  }
}
```

**Not one namespace with a key prefix per environment.** A prefix is a
convention the runtime does not enforce: one wrong key in a test run
writes into production data, and a production `list()` returns the test's
keys. Separate namespaces make the mistake impossible rather than
unlikely.

**Bindings are not inherited into an environment block.** An environment
that declares none has none, rather than falling back to the top-level
list
([Wrangler environments](https://developers.cloudflare.com/workers/wrangler/environments/)).
The symptom is a deploy that succeeds and a first read that throws, so
adding a namespace means adding it to every environment that needs it in
the same edit.

## What this component stays silent on

**Where the Worker runs, and what its Wrangler config otherwise says.**
That belongs to the project's hosting pin. **Which other Cloudflare
services exist** is the provider component's scope fence, not this one's.
