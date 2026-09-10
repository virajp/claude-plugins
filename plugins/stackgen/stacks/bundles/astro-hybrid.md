---
name: Astro (Hybrid)
axis: project
kind: language-bundle
components:
- language/typescript@0.1.0
- package-manager/pnpm@0.1.0
- toolchain-gate/tsconfig@0.1.0
- toolchain-gate/eslint@0.1.0
- framework/astro@0.1.0
- framework/react@generated
- framework/effect@0.1.0
platforms:
- site
---

# site — Astro (Hybrid)

A content site that is **prerendered except where a request must be read**: the
marketing pages, the docs and the changelog are files on disk, and the handful
of routes that need the caller — a signed preview, a personalized page, a small
account-facing flow, an endpoint the site's own islands call — render on
demand.

**`hybrid` has not been a config value since Astro 5**, where it was removed
and merged into `static`. The mode is a **static build with an adapter
installed and `export const prerender = false` on the routes that opt out** —
naming it "hybrid" describes the resulting site, not a setting. The pack's
`hybrid.md` carries the reasoning; what this bundle pins is that combination.

Its siblings pin the other answers: [`astro-ssg`](astro-ssg.md) is the same
build with no adapter and no exceptions, [`astro-ssr`](astro-ssr.md) inverts
the default so every route is on demand, and [`astro-csr`](astro-csr.md) puts
the whole app in the browser behind one shell.

A `site` calls someone else's API rather than publishing its own — the
on-demand routes here are the site's own surface, not a published contract. A
project that owns an API contract is `fullstack` instead.

This doc covers the **project axis** only; backing services and deploy target
are their own axes.

## Stack

- **Framework**: Astro on `output: "static"` **with** an adapter, and
  `export const prerender = false` on exactly the routes that read a request.
  The default is the safe one: a route stays a file unless someone had to opt
  it out, which keeps the on-demand surface small enough to reason about.
- **The server side of those routes is [`astro-ssr`](astro-ssr.md)'s
  doctrine**, cited rather than restated: the shared Effect `AppLayer`,
  read-only datastore access through the common package's layers, same-origin
  proxy endpoints to the `service` for writes, and middleware setting per-route
  cache policy. The prerendered routes get none of it and should need none of
  it — a prerendered page reaching for a runtime service is a route that wanted
  `prerender = false`.
- **UI**: React via `@astrojs/react` where interactivity demands it; the
  prerendered pages ship no JavaScript unless they carry an island, exactly as
  on `astro-ssg`.
- **Layout**: `src/pages/` (routes), `src/content/` (collections),
  `src/components/`, `src/layouts/`, `src/lib/` (the layer + data readers).
- **Config**: the prerendered routes read their values at **build** time and
  the on-demand ones at **request** time, and the same variable can mean both.
  Read configuration through one fail-fast Effect `Config` schema so the
  difference is a declared boundary rather than an accident of where a module
  got imported.

## Build output and deploy

The build leaves **files plus the adapter's server entry** under `./dist` — the
`## Build output` fact in the `framework/astro` pack's conventions, which is
what a deploy pack's asset directory cites rather than guessing. The deploy
target must serve both: the files directly, and the entry for everything that
fell through.

**Pair with any supported deployment; Cloudflare Workers is the preferred
one.** `cloudflare-workers-ssr` first — a Worker with a script beside its
assets, so the adapter is `@astrojs/cloudflare` and the prerendered files are
served by the platform before the script is reached. Then `gcp-cloud-run`,
`gcp-gke` and `container-generic`, all of which run a Node process, so the
adapter is `@astrojs/node` in standalone mode. The adapter follows the pairing;
this bundle names no deploy slug in its frontmatter, because the axes are
pinned independently.

## Testing

Vitest with a **jsdom** environment + Testing Library for the React islands,
plus tests for the on-demand routes and endpoints, which are where this mode's
risk sits: a route that reads a request has a request shape to get wrong, and a
route that forgot to opt out fails at build. Scope the coverage include to
`lib/`, `components/` and the on-demand endpoints, excluding `.astro` shells
and the `ui/` primitives; the repo sets the threshold.
