# SSR — every route on demand

`output: 'server'`, **adapter mandatory**. Every route renders per request
unless it exports `prerender = true`. This is the mode for a project that
reads a request, a session or a datastore on most of its routes.

## The adapter is the deploy pairing's call

An adapter teaches Astro to render on one kind of server, and which server is
a **deploy-axis** decision. This pack decides neither; it states the two
adapters the pairings in this plugin use and what each implies:

- **`@astrojs/node`**, in standalone mode, for anything that runs as a
  container or a long-lived process. The build emits a server entry the
  container's start command runs.
- **`@astrojs/cloudflare`** for a Worker. It targets the Workers runtime, not
  Node, so a dependency reaching for a Node built-in needs the runtime's Node
  compatibility flag turned on — the deploy pack owns that setting. Astro 6
  requires this adapter at v13 or later, whose `main` entry moved to a unified
  entrypoint path; a deploy config written against an older version names a
  built file that no longer exists.

**Never both.** One adapter per project, matching the deploy pin. Changing the
deploy target changes the adapter and nothing else in the route code.

Cite each adapter's own documentation for its options; this file decides
neither the options nor the target.

## Endpoints

A `.ts` file under `src/pages/` exporting `GET`, `POST` and the rest is an
endpoint returning a `Response`. In server output it runs per request, which
is what lets an Astro project serve JSON without a second service beside it.

Endpoints are the boundary. Validate the request there, map failures to coded
responses there — one mapping home, as the language baseline requires — and
keep the handler thin over `src/lib/`.

## Cache policy lives in middleware

`src/middleware.ts` runs on every request, and it is the one place that knows
both the route and the response. Set `Cache-Control` there, per route, rather
than scattering headers through handlers:

- A page whose content changes per user is `private, no-store`. Getting this
  wrong on a shared cache leaks one user's page to the next.
- A page that is the same for everyone and changes on deploy is short-lived
  with revalidation, not `immutable` — only fingerprinted asset paths earn
  `immutable`.
- A route that is genuinely static is not a cache-policy problem. It is a
  `prerender = true`.

## Prerender what does not need the server

`export const prerender = true` on the pages that read nothing per request —
legal pages, the marketing surface, `404`. They leave the server's path
entirely and are served as files. A project where most routes end up marked
this way is Hybrid written backwards; see [`hybrid.md`](hybrid.md).

## What the bundle decides, not this file

The SSR bundle that pins this pack decides the **server composition** — the
shared application layer the pages and endpoints run against, how datastore
reads reach that layer, and same-origin proxy endpoints to a separate service.
Read the bundle's own conventions for those; this reference does not restate
them and must not contradict them.

The rule that survives regardless: **the browser never talks to a datastore or
a vendor SDK.** Server-side code reads through the project's own typed layer,
and a privileged write goes to the service that owns it — from the server,
same-origin, so the service host stays hidden and no CORS grant exists to
misconfigure.

## The build produces two things

Files, and the adapter's server entry. Both land in `./dist`
([`build-output.md`](build-output.md)); the deploy target runs the entry and
serves the files.
