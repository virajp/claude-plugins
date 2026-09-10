# Hybrid — prerendered by default, on demand where a route asks

`output: 'static'` **plus an adapter**. Every route is prerendered at build
time except the ones exporting `prerender = false`, which render per request.

**Hybrid is SSR with the default flipped.** The adapter is the same, the
server code is the same, the endpoints are the same — the only differences are
which way the default points and, therefore, how many routes carry a marker.

## `hybrid` is not a config value

It was one until Astro 5, which removed `output: 'hybrid'` and merged its
behaviour into `'static'`. A config carrying it is rejected; a tutorial,
answer or older repo that names it is describing this mode under its old
spelling. Nothing was lost — `static` plus an adapter plus per-route
`prerender = false` is exactly what `hybrid` used to mean.

The name survives here because it names a **shape** worth deciding on, and a
project that says "we are hybrid" is saying something true about its routes
even though its config says `static`.

## The opt-in

```astro
---
export const prerender = false;
---
```

on a page, or the same export in an endpoint's `.ts`. It takes a literal
boolean — Astro 5 removed computed values, so a route that wants the decision
made programmatically makes it in an integration through the
`astro:route:setup` hook.

**The moment one route opts in, the adapter is mandatory.** A build with an
on-demand route and no adapter fails; the fix is the adapter, not removing the
export.

## Which routes earn it

The rule of thumb: **a route earns `prerender = false` when its output depends
on something that differs between two requests for the same URL.**

- Reads a cookie, a session, or an authorization header.
- Reads a query parameter that changes the body rather than filtering a list
  the client already has.
- Reads data that changes more often than the site deploys, and where being
  stale is wrong rather than merely old.
- Cannot enumerate its dynamic parameters at build time — a static dynamic
  route needs `getStaticPaths`, and a route whose parameter space is unbounded
  has no such list.

And what does not earn it: personalization that a client-side island can do
after hydration; content that changes on a schedule the build already runs on;
anything whose only motivation is "it might need to be dynamic later".

Every route that opts in is one the deploy target must run code for. Counting
them is the honest measure of whether the project is still Hybrid: when most
routes carry the marker, invert the default and read [`ssr.md`](ssr.md).

## Everything else is SSR's

The adapter choice, endpoint discipline, cache policy in middleware, and the
rule that the browser never reaches a datastore are all in
[`ssr.md`](ssr.md) and apply unchanged to the on-demand half of a hybrid
project. The prerendered half is [`ssg.md`](ssg.md)'s — including `site`,
`trailingSlash`, `404.html` and the search index, none of which change here.

The build produces both: files for the prerendered routes, plus the adapter's
server entry for the rest ([`build-output.md`](build-output.md)).
