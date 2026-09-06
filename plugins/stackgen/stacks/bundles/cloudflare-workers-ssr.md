---
name: Cloudflare Workers SSR
axis: deploy
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/workers-ssr@0.1.0
artifact: worker-script
---

# Deploy — Cloudflare Workers SSR

**A script at the edge in front of its own static assets**: a site whose
pages are rendered per request, or a mostly-prerendered site with a handful
of routes and endpoints that are not. The Worker carries a `main`; the
platform serves the uploaded file set for every request that matches one,
and everything else falls through to the script. One `wrangler deploy`
uploads both halves under one Worker name.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, the token scoping rule, what does and does not
exist locally. The service component carries this one service and **cites**
that rule rather than restating it.

## The project bundles this was built for

`astro-ssr` and `astro-hybrid` — the two Astro modes that emit a Worker
entry — name this bundle **first** among their deploy pairings, and it is
the pairing the pack's shipped `main` is filled for:
`@astrojs/cloudflare` v13's unified entrypoint,
`@astrojs/cloudflare/entrypoints/server`, the value Astro 6 requires.

Nothing about the bundle is Astro-specific beyond that default. `main` is a
marked position, and **a different framework's adapter names a different
entry** — filling it from that adapter's own documentation is what pinning
a different pair does. What the bundle requires of any framework is only
that its adapter emit an entry the platform can run and a directory of
files beside it.

A project whose pages are *all* decided at build time does not belong here:
that is `cloudflare-workers-static`, the sibling below, and `astro-ssg` and
`astro-csr` name it for exactly that reason.

## What this bundle decides that no component decides alone

**The artifact is a script and the file set it fronts, and it is not
portable.** A container bundle ships an image it can move from staging to
production untouched, and a static bundle ships a directory that would
serve from any host. This one ships neither: the script is compiled against
a runtime that is not Node and reaches its files through a platform
binding. Moving it means the framework's adapter producing a different
output — a supported move for an adapter-based framework, a rewrite for
anything else. That is the lock-in this pairing carries, and it belongs in
the decision rather than in the migration.

**As with the static sibling, the upload is the release**, so the guarantee
comes from the build: the same commit must produce the same script and the
same directory, which makes a **reproducible build** this pipeline's real
job. One Worker name per environment, each fed its own build of the same
commit — and each given its own downstream credentials deliberately, since
a second front end with production's environment values is a second front
end pointed at production data.

**The release runs behind `p:<project>:deploy`, and this bundle ships no
workflow.** The task is the only thing that knows a Cloudflare Worker is on
the other end, which is what keeps the target swappable; the CI system
pinned on the project's `cicd` axis decides what fires it, behind
`assets/contracts/release-trigger.md`. Naming the task and writing the
workflow are different jobs, and only the first one is stackgen's.

**Credentials arrive from the environment, never from the config file.**
`wrangler.jsonc` is committed and describes the deployment; the account and
the token that authorize it come from the secrets provider at deploy time.
The script's own downstream credentials are a separate and narrower set,
and the deploy token is never among them — a rendering process that can
redeploy itself is the one grant this shape must not hand out.

**Assets are matched before the script runs, and the pack ships
`run_worker_first` off.** That is a cost decision and a failure-shape one:
requests the assets answer are free, requests that invoke the script are
billed, and under free-tier limits a forced invocation returns 429 rather
than falling back to the file. Turning it on is a deliberate act with its
cost written down, not a default.

## The seam with the other two Cloudflare bundles

**[Cloudflare Workers Static Assets](cloudflare-workers-static.md) is the
alternative, not a layer.** A deployment either has a `main` or it does
not, and the two bundles are the two answers. `astro-ssg` and `astro-csr`
pair there; `astro-ssr` and `astro-hybrid` pair here. A static site that
grows a rendered route moves from that bundle to this one, and the file
set, the route and the token all survive the move.

**[Cloudflare Zero Trust Access](cloudflare-zero-trust.md)** produces no
artifact and "composes with a hosting pin rather than replacing one" — this
is a hosting pin it composes with. A `site` that must not be publicly
reachable pins **both**: this one decides how the pages get served, that
one decides who is allowed to reach them. Since `config_format` 16 made
`deploy_template` a list, pinning two is representable, and pairing them is
vwf's job.

## What is still not offered

**Pages, R2, D1, KV, Durable Objects, Queues, Images and Stream.** A
product that needs one of them has a gap to name rather than a gap to fill
from general Cloudflare knowledge — a service nobody wrote doctrine for is
a service nobody reviewed.

Full judgment: the components' own skills and their references.
