# Decision — Workers SSR redeems the Worker-script reservation

**Date** 2026-09-06 · **Branch** `2026-09-05-astro-static` · **Plan**
[`docs/plans/2026-09-05-astro-static/`](../../plans/2026-09-05-astro-static/index.md)
· **Narrows**, for one service only, the Cloudflare scope reservation as it
stood after
[`2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md`](./2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md)

## What was decided before

On 2026-09-05 the reservation narrowed once, from "Zero Trust Access and nothing
else" to two services. The thing it newly named on the reserved list, in those
words, was **a Worker script fronting the assets** — server-side rendering on
Workers — *"which is its own pack under its own effort"*. Static assets then;
SSR later.

## What changed

**That service leaves the reserved list.** `cloud-service/workers-ssr` is the
sibling of `workers-static-assets` in exactly the shape the static pack
established. It declares `type: cloud-service`, `category: compute` — so it
carries the three-topic deploy-target extension, artifact, pipeline and health —
the deploy axis, and `artifact: worker-script`. The bundle is
`cloudflare-workers-ssr` — `cloud-provider/cloudflare@0.1.0` composed with
`cloud-service/workers-ssr@0.1.0`.

It ships a root `wrangler.jsonc` carrying `main`, the `nodejs_compat`
compatibility flag, and `assets` with both a `directory` and a
`binding: "ASSETS"` — the script fetches assets through the binding, and a
request no asset matches falls through to the script. **No
`not_found_handling`**, which is the static sibling's setting and the wrong one
here. Three marked positions: the Worker `name`, the route block, and `main`.
Beside it, the same `p/_project/deploy` overlay the static pack ships, with the
credential guard on `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

**`artifact: worker-script` is a new token**, and deliberately not a reuse. The
artifact vocabulary is open; a script plus its assets is neither a container
image nor a directory of files, and calling it either would make the deploy
menu's own answer to "what does this publish" wrong.

**Everything else stays reserved, by name.** Pages, R2, D1, KV, Durable Objects,
Queues, Images and Stream. The reservation prose is narrowed a second time, not
deleted: the reasoning that made it worth writing — a menu that comes back short
without explaining itself is indistinguishable from a broken one — still holds
for the eight services it still covers.

## Why now

The SSR and Hybrid Astro bundles needed a preferred pairing, and the user ruled
which one:

> Pair with all supported deployments, Cloudflare Workers as preferred option

Naming it preferred and shipping it next plan was the alternative, and it was
rejected for the reason the static pack's own decision gives: a closed menu
whose recommended answer does not exist is the failure mode the reservation was
written to avoid. So `cloudflare-workers-ssr` is named first in both bundles,
then `gcp-cloud-run`, `gcp-gke` and `container-generic` — all of which remain
supported, because a server-rendered site is an ordinary server.

**The fact the pairing rests on is Astro's Cloudflare adapter.** Astro 6
requires `@astrojs/cloudflare` v13, whose `main` moved from a built file path to
the unified entrypoint `@astrojs/cloudflare/entrypoints/server` — so `main`
ships as a marked position whose default is that entrypoint, with the comment
that another framework's adapter names another entry. `nodejs_compat` is what
the adapter needs, and it is the only compatibility flag shipped;
`global_fetch_strictly_public` is named in a comment rather than turned on.

The frontmatter names no deploy slug in either direction — `artifact:` is
deploy-only and the axes are pinned independently. The pairing lives in body
prose, as `cloudflare-zero-trust.md` already does it.

## Rejected

- **Reusing `container-image` or `static-assets`** as the artifact token. Above.
- **Container pairings only** for SSR and Hybrid, leaving Cloudflare unnamed.
- **`run_worker_first`, and a Worker script in front of a purely *static*
  site.** The pack ships the knob off and says why; a middleware-only Worker
  over SSG output is a shape nobody has asked for.

## One superseded plan assumption

The plan specified `platformProxy` for local development. Context7 (2026-09-06)
has it superseded: adapter v13 plus Astro 6 run `astro dev` under `workerd`
through the Cloudflare Vite plugin, so the script is exercised by the runtime
that will serve it. The pack's `local-dev.md` states that instead.
