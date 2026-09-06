# Cloudflare Hyperdrive — conventions

A connection pool and a query cache in front of a Postgres or MySQL
database that already exists, wherever it runs. Pick it when Workers
must reach a relational database that is not D1, and the thing making
that slow is the cold TCP + TLS + authentication handshake every
isolate would otherwise pay before its first row.

**Three things it is not.** It is **not a database** — it stores no
rows of its own and has no schema. It is **not a replica** — there is
one origin, and a cached read is a copy of a response rather than a
copy of the data. And it is **not a schema tool** — migrations run
against the origin by whatever the datastore component already says,
through a direct connection and not through this.

**So this component is pinned beside a datastore pin, never instead of
one.** The stack's backing axis is a list, so a project pins the
database it actually has — `gcp-cloud-sql`, a generated Postgres, a
self-hosted MySQL — and pins this alongside it. A stack whose only
backing entry is Hyperdrive has named a proxy and no data.

## The binding, and the flag the drivers need

The project adds this to its own `wrangler.jsonc` — the file the
hosting component (`workers-ssr`) owns. This component ships no config
of its own:

```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "hyperdrive": [
    { "binding": "HYPERDRIVE", "id": "<the configuration id>" }
  ]
}
```

`nodejs_compat` is required for the database drivers to work at all
([Hyperdrive: connect to a private database][cfg]) — its absence is a
driver-level failure, not a Hyperdrive one, which is why it reads as
unrelated when it bites.

## A configuration is created from a connection string

`wrangler hyperdrive create <name> --connection-string="postgres://…"`
creates it and returns the id the binding names; Hyperdrive validates
the credentials against the database before the configuration succeeds
([Get started][gs]). MySQL origins take the same command with a
`mysql://` string.

**The origin credential is a secret, and it lives where the provider's
doctrine says secrets live** — the `cloudflare` skill's identity and
IAM reference, cited and not restated here. It is handed to Cloudflare
once, at configuration time, rather than injected into the Worker: the
Worker holds a binding, not a password. Rotating it means creating a
configuration with the new credential and repointing the binding.

## Query caching is on by default, and that is a correctness decision

Hyperdrive caches eligible read-only responses with a `max_age` of 60
seconds and a `stale_while_revalidate` window of 15 seconds unless told
otherwise ([Query caching][qc]). Writes are never cached, and neither
is a read whose SQL calls a volatile or stable function — so a query
that reaches for `NOW()` inline silently opts itself out. Where a read
must be current — an authorization check, a read straight after a write
— the answer is a **second binding on a cache-disabled configuration**,
not a guess about whether this particular query was eligible.

## Clients are created inside the handler

Never in the global scope: a Worker cannot carry I/O across requests,
so a globally constructed client goes stale and its next query throws
([Connection lifecycle][cl]). Per-request construction is the
recommended shape precisely *because* Hyperdrive holds the pool — the
cost the pattern would normally carry is the cost this service removes.

Hyperdrive exposes a connection string the supported drivers take
directly — node-postgres, Postgres.js, and the ORMs and query builders
built on them — and the discrete `host` / `user` / `password` /
`database` / `port` fields the MySQL drivers want ([Query
caching][qc]).

Full judgment: the `cloudflare-hyperdrive` skill's references. The
provider-wide half — cost doctrine, IAM, the local development map, the
private plane — is the `cloudflare` skill's. Postgres' and MySQL's own
doctrine belongs to the datastore component this sits in front of.

[cfg]: https://developers.cloudflare.com/hyperdrive/configuration/connect-to-private-database/
[gs]: https://developers.cloudflare.com/hyperdrive/get-started/
[qc]: https://developers.cloudflare.com/hyperdrive/concepts/query-caching/
[cl]: https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/
