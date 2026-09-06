# Cloudflare Hyperdrive — service doctrine

The proxy's own rules. The database's rules — schema, migrations,
concurrency, indexing — belong to the datastore component this sits in
front of, and are not restated here. **This component realizes no
blueprint capability**, so there is no contract clause to satisfy: the
datastore behind it is what answers `relational-datastore`.

## What the origin has to satisfy

**TLS, always.** Hyperdrive requires TLS to the origin and does not
support plaintext connections. Postgres origins accept `require`,
`verify-ca` and `verify-full`; MySQL origins `REQUIRED`, `VERIFY_CA`
and `VERIFY_IDENTITY` ([Supported databases and features][sdf]). A
private CA is uploaded and named by id, with the stricter mode set
explicitly:

```text
wrangler hyperdrive create <name> \
  --connection-string="postgres://…" \
  --ca-certificate-id <id> --sslmode verify-full
```

mTLS to the origin is the same shape with `--mtls-certificate-id`
([TLS/SSL certificates][tls]).

**Reachability, by one of three paths.** A configuration's origin is
either a **public database** given host, port, user and password; an
**Access-protected database behind a Cloudflare Tunnel**, which takes
an Access client id and secret instead of a public host; or a
**database reachable through a Workers VPC service**, named by service
id ([Hyperdrive configs API][api]). The second and third are the same
private-plane argument the provider makes once — the `cloudflare`
skill's networking and private plane reference — applied to a database
rather than to an application: a database on the public internet with a
password in front of it is reachable by everyone who guesses, and the
proxy does not change that.

**A version Hyperdrive speaks.** PostgreSQL 9.0 through 17.x, MySQL 5.7
through 8.x including MariaDB, self-hosted or managed ([Supported
databases and features][sdf]).

## Creating and repointing a configuration

`wrangler hyperdrive create <name> --connection-string="…"` validates
the credentials against the database before the configuration exists
([Get started][gs]), so a typo fails at creation rather than at the
first request. The command returns the id the binding carries, and
`--update-config` writes the binding into the wrangler file for you.

**Credential rotation is a new configuration, not an edited one.**
Create a second configuration with the new credential, repoint the
binding, deploy, then delete the first ([Rotate credentials][rot]).
That sequence is what makes the rollback a redeploy instead of a
recreate.

## Drivers

The binding exposes `connectionString`, which the Postgres drivers take
directly — node-postgres and Postgres.js, and the ORMs and query
builders built on them — and the discrete `host`, `user`, `password`,
`database` and `port` fields the MySQL drivers want ([Query
caching][qc]). Prisma reaches the same binding through its `pg` driver
adapter ([Prisma ORM][pr]). All of them need
`compatibility_flags: ["nodejs_compat"]` in the wrangler file, without
which the driver — not Hyperdrive — is what fails ([Connect to a
private database][cpd]).

**The client is constructed inside the request handler.** A Worker
cannot carry I/O across requests, so a client built in the global scope
goes stale and its next query throws a hard error ([Connection
lifecycle][cl]). Per-request construction is cheap here *because*
Hyperdrive holds the pool — that is the whole trade.

Two driver settings are worth taking deliberately with Postgres.js: a
per-request connection ceiling, because a Worker's own limit on
concurrent outbound connections is the binding constraint; and leaving
prepared statements enabled, since a query generator that turns them
off costs Hyperdrive extra round trips ([Connect to Postgres][cpg]).

## Transactions, and what pooling costs them

Pooling here is **transaction pooling**: an origin connection is
reserved for the whole duration of a transaction and released when it
commits or rolls back, so a transaction spanning several queries holds
a connection the entire time ([Connection lifecycle][cl]). Transactions
work — they are just the one operation that converts the pool from a
shared resource into an exclusive one.

The consequence is a design rule rather than a tuning knob: **a
transaction holds a connection, so long ones exhaust the pool faster
than anything else the product does.** Keep the work between `BEGIN`
and `COMMIT` to the statements that must be atomic, and do the reads
that merely inform them outside it. There is no need to close a client
at the end of a request — Hyperdrive cleans up the client when the
request ends and keeps the underlying origin connection for reuse
([Connection lifecycle][cl]) — but there *is* a need to end the
transaction.

## Cache controls

Caching is on by default at `max_age` 60 s and `stale_while_revalidate`
15 s, with `max_age` configurable up to an hour ([Query caching][qc]).
Only read-only statements whose functions are immutable are eligible:
writes are excluded by wire-protocol parsing, and a read calling a
volatile or stable function — `NOW()`, `LASTVAL()`, `LAST_INSERT_ID()`
— is excluded too. The fix for the last case is to compute the value in
application code and pass it as a parameter, which also makes the query
cacheable rather than merely correct.

Two mechanical facts with sharp edges: a response over 50 MB is
returned to the Worker but not cached ([Limits][lim]), and the SQL text
including its comments is the cache key, so two identical queries with
different leading comments are two entries ([Query caching][qc]).

**Correctness first, then speed.** Where a read must be current —
authorization, permissions, a read immediately after a write — pin a
**second configuration with `--caching-disabled` and its own binding**,
and use it for exactly those queries ([Query caching][qc]). Deciding
per query at the call site is how a stale authorization check ships.

## The limits that shape a design

- **60 seconds per statement**, then termination ([Limits][lim]). A job
  that legitimately runs longer is not a Worker's job.
- **Unsupported session features.** SQL-level prepared-statement
  management, advisory locks and `LISTEN`/`NOTIFY` on Postgres;
  `USE`, multi-statement queries and non-UTF8 on MySQL. Cloudflare's
  own guidance where these are required is a direct connection
  ([Supported databases and features][sdf]) — so a flow needing one is
  a design decision, not a configuration flag.
- **Connection timeouts** of 15 seconds to establish and 10 minutes
  idle, and a soft origin connection limit the database should be sized
  against rather than surprised by ([Limits][lim]).

[sdf]: https://developers.cloudflare.com/hyperdrive/reference/supported-databases-and-features/
[tls]: https://developers.cloudflare.com/hyperdrive/configuration/tls-ssl-certificates-for-hyperdrive/
[api]: https://developers.cloudflare.com/api/resources/hyperdrive/subresources/configs/methods/edit/
[gs]: https://developers.cloudflare.com/hyperdrive/get-started/
[rot]: https://developers.cloudflare.com/hyperdrive/configuration/rotate-credentials/
[qc]: https://developers.cloudflare.com/hyperdrive/concepts/query-caching/
[pr]: https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-drivers-and-libraries/prisma-orm/
[cpd]: https://developers.cloudflare.com/hyperdrive/configuration/connect-to-private-database/
[cpg]: https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/
[cl]: https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/
[lim]: https://developers.cloudflare.com/hyperdrive/platform/limits/
