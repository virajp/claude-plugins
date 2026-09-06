# Local dev — Cloudflare D1

**This service really runs on a laptop.** `wrangler dev` starts in local
mode by default and hands the Worker a local database behind the same
binding name it will have in production
([local development](https://developers.cloudflare.com/d1/best-practices/local-development/)).
Where this row sits among Cloudflare's other surfaces — which have a
local mode, which have only a remote one, which have neither — is the
`cloudflare` skill's local development map, which this cites rather than
restates.

## The loop

Three commands, and nothing else is needed to have a working database:

1. `wrangler d1 migrations apply <database> --local` — build the schema
   from the same migration files the deploy will apply.
2. `wrangler d1 execute <database> --local --file=./seed.sql`, or
   `--command "…"` for one statement, to load or inspect data
   ([wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)).
3. `wrangler dev` — run the Worker against it.

Local state persists to a directory on disk, and `--persist-to` moves it
([wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)).
That persistence is a convenience and a hazard in equal measure: it is
why the database is still there tomorrow, and why **a suite that passes
only on its second run is depending on leftovers**. Reset between runs,
not between assertions.

## The `--remote` trap

Every one of those commands takes `--remote` instead of `--local`, and
`--remote` means the managed database — the real one, with the real data
([wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)).
The hazard is not the flag, it is its absence: Cloudflare's own guidance
is that `--local` is what targets the local copy and that **omitting it
executes against the remote database** on Cloudflare's network
([local development](https://developers.cloudflare.com/d1/best-practices/local-development/)).
A half-remembered command is a command aimed at production.

Three rules, all cheap and all learned the expensive way otherwise:

- **State the flag every time**, in scripts and in documentation, even
  where the default is the one you want. A command whose target depends
  on the reader's memory is a command that will one day run against
  production.
- **`--remote` is never in an automated loop.** A dev-loop task, a
  watcher, a test setup step: none of them targets a managed database.
  The one legitimate automated `--remote` is the deploy's migration
  apply.
- **A destructive `--remote` command is an incident action.** `--yes`
  exists to skip the confirmation prompt; combining it with `--remote` in
  anything a person did not just type is how a database gets emptied.

## Seeding

Seed **through the interface the product uses** wherever the seed is
setting up a test — the write path is what a test should exercise, and a
seed written in raw SQL will happily create rows the application could
never have produced. Raw `--file` seeding is for reference data the
product does not create: a lookup table, a fixture the schema assumes.

Keep the seed in the repository beside the migrations, and keep it
idempotent, so re-running it against an existing local database is not a
special case.

## Preview and per-environment databases

A `preview_database_id` on the binding gives the preview target its own
database, and `--preview` is the flag that points a `wrangler d1` command
at it
([migrations](https://developers.cloudflare.com/d1/reference/migrations/)).
Use it rather than sharing one non-production database between everyone —
a shared one drifts, and the first person to reset it breaks everyone
else's assumptions silently.

## Pointing the binding at the real database

Local mode is not the only option: **remote bindings** run the Worker's
code locally while routing one named binding's operations to the deployed
resource, and they are supported by Wrangler, the Vite plugin and the
Workers vitest pool
([remote bindings](https://developers.cloudflare.com/workers/local-development/)).

Worth knowing, rarely worth using here. It is the answer when the
question is genuinely about the managed database — replica behaviour,
production-shaped data volume — and it is the wrong default, because it
turns every local test run into billed rows against shared state.

## What does not reproduce locally

- **Read replication, and therefore replica lag.** A local database is a
  single copy that answers every read from the state the last write left.
  So a flow that needs the Sessions API looks identical to one that does
  not, and the bug it prevents cannot appear until a deployed
  environment. That correctness is a design decision, not something the
  local suite catches — see [service doctrine](service-doctrine.md).
- **The cost of a query.** The `rows_read` metadata is there locally, and
  it is worth reading, but a table with fifty rows scans fifty rows
  whether or not the index exists. Index decisions are verified with
  `EXPLAIN QUERY PLAN` and against production-shaped volume, not against
  a laptop's dataset.
- **The size ceiling.** Nothing local approaches 10 GB, so the split the
  design depends on is never exercised. That is one more reason it is
  decided up front rather than discovered.
- **Time Travel.** Point-in-time recovery is a property of the managed
  database. The local equivalent is deleting the persistence directory
  and re-running the migrations, which is faster and loses nothing that
  mattered.
