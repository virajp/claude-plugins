# Workers SSR — local dev

**There is a real local runtime here, and it is the platform's own.** The
provider's local development map owns the general shape — the `cloudflare`
skill — including which parts of the platform have no local existence at
all. This is what it means for this service.

## Two surfaces, and the first one is the framework's

**The framework's dev server, running the script under the platform
runtime.** For the adapter this pairing names, that is now literal rather
than approximate: Astro 6 with `@astrojs/cloudflare` v13 runs `astro dev`
and `astro preview` through the Cloudflare Vite plugin, so the site executes
under `workerd` — the runtime that will serve it — instead of under Node.
Bindings behave locally as they do deployed, which is what makes the
dev-server surface worth trusting at all.

That is a change worth knowing about rather than assuming: **earlier
versions of that adapter emulated the platform from Node behind a proxy
option, and the class of bug that arrangement hid — a Node built-in
available locally and absent at the edge — is exactly the one this stack's
`nodejs_compat` cliff produces.** Check the adapter's own current
documentation at Context7 rather than this file; the mechanism moved once
and can move again.

**`wrangler dev` against the built output**, which is the closer surface
and the second one. It serves the actual uploaded shape: the file set
matched first, the script reached on fall-through, the assets binding
resolving in-process. It is the only local thing that exercises the
arrangement rather than the code.

The `local_stack` harness answer is nonetheless **`n/a`**, and honestly so:
there is no backing engine to compose behind a readiness gate. The dev
server is the project's own command, not a stack this component adds.

## What running locally does prove

- **That the script bundles and runs under the right runtime.** A
  dependency reaching for a Node built-in `nodejs_compat` does not cover
  fails here rather than at the edge — which is the whole reason the
  runtime parity matters and the single most valuable thing local can do
  for this stack.
- **That the fall-through is what you think.** Requesting a path and seeing
  whether a file answered or the script did is the check that separates
  this stack from its sibling, and it is only honest against the built
  output — see [service doctrine](service-doctrine.md).
- **That the build emits what `main` names.** For an adapter emitting a
  built file, the path either exists after the build or it does not.
- **That `_headers` and `_redirects` parse and apply** to the static half.
  They are build output and it is easy to leave them in the source tree,
  where the edge never sees them.

## What local cannot tell you

Five things, and they are where the deployed failures actually live:

- **Whether the route is right.** The custom domain, its DNS record and the
  zone it lives in do not exist on a laptop. A route pattern that matches
  nothing, or that collides with another Worker on the account, is
  invisible until a deployed environment sees it.
- **Whether TLS works.** Certificates are the edge's, and a hostname
  serving a certificate for something else is a production-only symptom.
- **Whether the CPU time fits.** The per-invocation ceiling is a platform
  property and a laptop does not enforce it. A render that is comfortable
  locally and over the limit deployed fails as a hard cutoff on the paths
  that are slowest — which are the ones with the most data, which is
  production — see [cost shape](cost-shape.md).
- **Whether the caching is right.** Locally every response is fresh and
  every request is a miss, which is exactly the case where a bad
  `Cache-Control` on a rendered response looks fine — see
  [artifact](artifact.md).
- **Whether the credential works.** The dev server needs no token; the
  first thing that does is the deploy. See
  [identity shape](identity-shape.md).

## The check worth insisting on

**Serve the BUILT output at least once before the deploy.** The dev server
and the built artifact are different programs with different routing, and
the built one is what gets uploaded. For a static site that check is
cheap-and-useful; here it is the only local thing that puts the file set in
front of the script in the order the edge will, and it costs one command
after the build.

## Nothing about the local task changes because this component is pinned

The same command runs whether or not the project deploys here — which is
what makes the substitution cheap, and what makes the framework's adapter
rather than this component the thing that decides what local looks like.
This component adds no local service, no emulator process and no
environment variable a developer has to hold.
