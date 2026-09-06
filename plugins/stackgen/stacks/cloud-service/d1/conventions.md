# Cloudflare D1 — conventions

A serverless SQL database built on SQLite, in Cloudflare's own words
([data isolation](https://developers.cloudflare.com/use-cases/saas/data-isolation/)),
which a Worker reaches through a binding rather than over a connection.
Pick it when the data model has real
relationships and the product's compute already runs on Workers — the
query travels no further than the runtime that issued it, and there is no
connection pool to size, because there are no connections.

**The size ceiling is the first design input, not a late surprise.** A
single database is capped at 10 GB, and Cloudflare's own guidance for a
dataset that outgrows it is to split it into several smaller databases
rather than to ask for a larger one
([limits](https://developers.cloudflare.com/d1/platform/limits/)). So D1 is
sized per tenant, per product or per bounded context, and a design that
assumes one database will hold everything forever is a design that has
already picked the wrong store.

**The dialect is SQLite's, and the transaction model is narrower than a
server database's.** Every query runs inside an implicit transaction, so
there is no session to open a transaction in and hold across requests;
`PRAGMA defer_foreign_keys = on` is how a schema change postpones
constraint checks to the end of one
([foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/)).
Atomicity across several statements is the batch API, which executes them
sequentially in one call and rolls the sequence back if one fails
([Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/)).

**The binding is the whole access path, and this pack ships no
`wrangler.jsonc`.** A project pinning D1 adds the block below to the one
its hosting pack already owns at the repo root — `workers-ssr`'s or
`workers-static-assets`':

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "<database name>",
      "database_id": "<uuid>"
    }
  ]
}
```

`binding` is the name the Worker reads off `env`; `database_id` is what
selects **which** database, and therefore what makes an environment.
`migrations_dir` and `migrations_table` are optional keys on the same
entry ([migrations](https://developers.cloudflare.com/d1/reference/migrations/)).

**Migrations are versioned files in the repo, applied by an explicit
step.** `wrangler d1 migrations create` writes the next numbered file,
`wrangler d1 migrations apply --local` runs it against the local
database and `--remote` against the managed one
([wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)).
The migration files are committed with the code that needs them, and the
deploy applies them before the Worker that depends on them goes live —
never at request time. **This pack ships no task for that.** A backing
component ships no `config/` tier, so the mise task that runs the apply
belongs to the project; whether a shipped task overlay is worth the
exception is parked until a real D1 project has one.

**Read replication is a database setting, and the Sessions API is what
makes it safe to use.** Replication is enabled per database and adds no
cost beyond the rows the queries already bill; without a session, a read
served by a replica may not yet have seen a write that already returned.
`withSession(bookmark)` and `session.getBookmark()` carry the read
forward from a known state, which is what turns eventual consistency into
sequential consistency for a request that just wrote
([read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)).
A product that reads its own writes needs the session; one that does not
can skip it and say so.

**Time Travel is recovery, not backup ceremony and not a test fixture.**
It is on by default, and restores the whole database to any minute inside
the retention window the plan allows
([release notes](https://developers.cloudflare.com/d1/platform/release-notes/)).
Using it to reset test data rewinds every table at once, including ones
the test never touched.

**What this component is not.** A database that already exists somewhere
else stays there and is reached through Hyperdrive, which is its own
component. Per-object strongly consistent state is Durable Objects'
SQLite, which is planned under its own effort and is not offered yet.
Which Cloudflare services this stack offers, plans and declines is the
provider component's to state — see
`cloud-provider/cloudflare/conventions.md`.

Full judgment: the `cloudflare-d1` skill's references. The provider-wide
half — cost doctrine, account roles and API tokens, the local development
map — is the `cloudflare` skill's, cited there and restated nowhere.
