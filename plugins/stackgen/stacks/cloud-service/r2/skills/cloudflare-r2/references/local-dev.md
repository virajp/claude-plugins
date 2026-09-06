# Local dev — Cloudflare R2

The provider's map of what exists on a laptop is the `cloudflare` skill's
local-development reference, and its row for this service is the shape of
everything below: R2 is **simulated locally, and the same binding can be
pointed at the real bucket instead**. This file is what that means in
practice, and where the simulation stops resembling the service.

## What runs locally

`wrangler dev` resolves an `r2_buckets` binding to a **local simulation on
disk**, with no account and no credential involved. The Worker code is
unchanged: the same `env.MY_BUCKET.get` and `.put` calls run against the
simulation
([Workers API](https://developers.cloudflare.com/r2/get-started/workers-api/)).

The state lives in **`.wrangler/state`** in the project directory, shared
by Wrangler and the Vite plugin; `--persist-to <dir>` moves it, and has to
be passed on **every** invocation, not once
([Local data](https://developers.cloudflare.com/workers/local-development/local-data/)).
That directory belongs in `.gitignore` — it is developer-local data, and
committing it means committing whatever test uploads someone made.

Two consequences of state being a directory: it **survives between runs**,
so a bucket that looks correct may be correct only because of an object a
previous session wrote, and it is **deleted by clearing the directory**,
which is the reset the suite should do between runs rather than between
assertions.

## Reaching the real bucket instead

Set `"remote": true` on the R2 binding to have local development operate
against the actual bucket
([Workers API usage](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)),
or run `wrangler dev --remote` to develop against remote resources
generally
([wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)).

Both are worth using deliberately and briefly. Pointing a laptop at a real
bucket means every operation is billed, every write is real, and — if the
bucket named is the wrong one — every delete is real too. If a project
does this routinely, it should be against a **development bucket of its
own**, which is another reason buckets are per-environment.

## Seeding and inspecting objects

`wrangler r2 object` is the CLI surface: `put <bucket>/<key> -f <file>`,
`get`, and `delete <bucket>/<key>`
([wrangler commands](https://developers.cloudflare.com/r2/reference/wrangler-commands/),
[Delete objects](https://developers.cloudflare.com/r2/objects/delete-objects/)).

Two habits worth keeping. **Seed fixtures through the product's own upload
path**, not with `object put`, wherever the path is what the test is
about — seeding around the code under test proves the fixture, not the
feature. And **never point `object delete` at a bucket name typed by
hand**; the command takes production's name as readily as staging's.

## The S3 path has no local target at all

Cloudflare documents no local simulation for the S3-compatible API —
`wrangler dev` does not serve it
([AWS SDK for JavaScript](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)).

So a project whose access path is an S3 SDK rather than a binding has
**nothing local to run**, and this is the single fact most likely to
surprise. Its options are a real development bucket, or a seam in the
services layer that the tests substitute — which is the same seam the
access rule already asks for. That is the argument for keeping the SDK
behind one module rather than scattered: it is what makes the substitution
a one-line decision instead of a rewrite.

## What local cannot tell you

The simulation reproduces the object semantics. It does not reproduce the
things that decide whether the design was right:

- **Lifecycle rules and storage-class transitions.** The two decisions
  with the longest-lived cost consequences are the two nothing local
  exercises. Treat the lifecycle policy as an infrastructure artifact
  reviewed on its own terms: write down what each rule is meant to
  achieve — how long user content lives, when an unclaimed upload expires,
  what happens to an object whose record was deleted — and check the
  policy against that statement, because no test will. The orphan-expiry
  rule deserves the most care: it is the one the product depends on for
  correctness rather than for cost, and the one that will silently not be
  there.
- **Permissions.** No token is presented locally, so every scope error is
  a deployed-environment error — and permission changes propagate with a
  delay of their own (see [identity shape](identity-shape.md)).
- **Public access, custom domains and CORS.** All bucket-level settings on
  a real account; a browser-facing upload that works locally can still
  fail its first preflight in a deployed environment.
- **Cost.** Every operation is free locally, which is exactly the
  condition under which a chatty design looks fine. The bill is driven by
  how often the store is touched (see [cost shape](cost-shape.md)), and a
  laptop counts nothing.
- **Data Catalog and R2 SQL.** Both are account-side surfaces over a real
  bucket; there is no local catalog and no local query engine, so anything
  built on them is verified in a deployed environment or not at all.

## Hygiene

- Point the S3 SDK at its endpoint by **environment variable**, never a
  code branch — code that special-cases "local" is code that never runs in
  production.
- **Reset the persistence directory between runs**, not between
  assertions.
- Keep `.wrangler/` ignored, and keep any development bucket's name
  distinct enough from production's that a typo does not resolve.
