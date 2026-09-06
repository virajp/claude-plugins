# Cloudflare Hyperdrive — local dev

**There is no simulated origin, and there could not be one.** The
provider's local development map — the `cloudflare` skill — records
this binding as local-simulation-only and says the simulation resolves
to a database you name yourself. This is the mechanics of that row.

## The binding names a real database

`wrangler dev` runs the Worker locally and connects **directly** to the
database the binding's local connection string names, bypassing
Hyperdrive's connection pooling and query caching entirely ([Local
development][ld]). Two ways to name it, and they do the same thing:

```jsonc
{
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "<the configuration id>",
      "localConnectionString": "postgres://…@localhost:5432/…"
    }
  ]
}
```

or the environment variable, whose suffix is the binding name:

```text
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE
```

([Local development][ld]; the variable is listed among Wrangler's
supported system environment variables). **Prefer the variable.** The
wrangler file is committed and the connection string carries a
password; the variable keeps the credential out of source control,
which is the reason Cloudflare gives for it too.

The string may point at a database on the laptop or at a remote
development database over TLS ([Local development][ld]) — a shared dev
instance is a legitimate answer where the schema is large enough that
running one locally is its own project. Never production.

## Which local stack actually runs

Not this component's — it has none, and its `local_stack` harness
answer is `n/a` for that reason. The database the string points at is
the **datastore component's** local stack: whatever `gcp-cloud-sql`, a
generated Postgres, or the project's own compose file already stands
up, on production's major version, behind the readiness gate that
component's doctrine requires. Pinning Hyperdrive adds nothing to the
local task and changes no command.

That is the point of the shape: locally the project is simply a Worker
talking to a database, which is what it would be without this component
at all.

## The trap: local never exercises the pool or the cache

Both of the things this component exists to provide are absent from
every local run. So three failure modes are invisible on a laptop:

- **Connection exhaustion under concurrency.** Locally each request
  opens its own connection to a database sized for one developer. The
  pool, the soft origin connection limit, and a long transaction
  holding a connection for its duration are all production behaviours
  ([Connection lifecycle][cl]).
- **Staleness.** Caching is off locally, so every read is current. A
  flow that quietly depends on reading its own write passes locally and
  can return a stale row in production — which is why the
  cache-disabled binding is decided in the design and not after the
  bug.
- **Origin reachability and TLS.** A local Postgres on a loopback
  address proves nothing about whether Cloudflare can reach the real
  origin, or whether its certificate satisfies the configured SSL mode.

**So the pool and the cache are exercised in a deployed environment or
not at all** — with one intermediate step: `wrangler dev --remote` runs
the Worker on Cloudflare's infrastructure against the deployed
Hyperdrive configuration, pooling and caching included ([Local
development][ld]). That is a remote run of the whole Worker rather than
a remote binding, and it is the closest thing to a rehearsal this
service has.

## What the Worker sees

Nothing different. The binding exposes the same `connectionString` and
the same discrete fields in both modes, so no application code branches
on "local" — the substitution happens under the binding, which is what
makes it safe. Code that special-cases local is code that never runs in
production.

[ld]: https://developers.cloudflare.com/hyperdrive/configuration/local-development/
[cl]: https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/
