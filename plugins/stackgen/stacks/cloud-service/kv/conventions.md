# Cloudflare Workers KV — conventions

A global, **eventually consistent** key-value store, read from a Worker
through a binding. It is the cache layer a request reads on every hop —
configuration, routing metadata, a rendered fragment, a session lookup —
and not the datastore a request writes on every hop.

**Eventual consistency is the design constraint, not a caveat.** A write
is visible immediately where it was made, and may take **up to 60 seconds
or more** to reach other locations as cached versions time out; the same
delay applies to a negative lookup, so a key created after a miss stays
missing for a while
([how KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)).
Anything that must read its own write, and anything two requests can
race, belongs somewhere else.

**Write-heavy on one key is the wrong shape.** The binding allows
**one write per second per key**; more than that returns
`429 Too Many Requests`, and Cloudflare's own guidance is to spread
writes across keys or reach for Durable Objects, whose per-key write rate
is higher
([write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs)).

**The stated limits, which shape key and value design.** A key name is at
most **512 bytes**, a key's metadata **1024 bytes**, a value **25 MiB**,
and `cacheTtl` has a floor of **30 seconds**; stored data is capped at
1 GB per account and per namespace on the Free plan and uncapped on Paid
([limits](https://developers.cloudflare.com/kv/platform/limits/)).

**Why this realizes `cache-layer` and not a datastore capability.** The
read path is fast and global and the consistency is eventual, which is
exactly the trade a cache makes and exactly the trade a system of record
must not. Losing a namespace should cost latency, never truth: whatever
is in it is either derivable from a source that survives, or is data the
product has decided it can lose.

## The binding a project adds

This pack ships **no `wrangler.jsonc`** and writes no configuration. The
project's Workers pack owns that file; this component names what goes in
it. The binding is an entry in `kv_namespaces`, and the namespace id
comes from creating the namespace
([get started](https://developers.cloudflare.com/kv/get-started/)):

```jsonc
{
  "kv_namespaces": [
    { "binding": "MY_KV", "id": "<namespace-id>" }
  ]
}
```

Per environment, the **same binding name** with a different id, so no
code changes between environments
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

Bindings are **not inherited** by an environment block — an environment
that names none has none, rather than the top-level ones
([Wrangler environments](https://developers.cloudflare.com/workers/wrangler/environments/)).
That is the failure worth knowing about: a staging deploy that silently
lost its binding fails at the first read, not at deploy time.

## What this component does not cover

**Strongly consistent per-key state** — a counter, a lock, anything
read-after-write. That is Durable Objects, which this stack has not
written doctrine for yet. **Relational data** is the `d1` component's.
Which Cloudflare services are offered, planned or declined is the
provider component's to state — see
`cloud-provider/cloudflare/conventions.md`, and do not fill a gap from
general Cloudflare knowledge.

Full judgment: the `cloudflare-kv` skill and its references. The
provider-wide half — the billing principle, the account and role model,
what exists locally — is the `cloudflare` skill's, cited throughout and
restated nowhere.
