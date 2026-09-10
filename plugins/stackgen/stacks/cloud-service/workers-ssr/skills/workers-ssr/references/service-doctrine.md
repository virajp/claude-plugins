# Workers SSR — service doctrine

The service's own usage rules: what the configuration says, what the edge
does with a request, and the knob this pack deliberately leaves off.

**There is no clause-by-clause contract satisfaction here, and that is
correct rather than missing.** The `compute` category names no vwf
capability token in the capability vocabulary, so there is no neutral
capability contract to check this against — the component leaves
`capability` unset, exactly as `cloud-run` does, and nothing here mints a
token to fill the hole.

## The whole configuration

A Worker with a script deploys with five things and nothing else: a `name`,
a `compatibility_date`, `main`, `compatibility_flags` carrying
`nodejs_compat`, and an `assets` block with a `directory` and a `binding` —
plus, where the site answers on a hostname rather than a `workers.dev`
subdomain, one `routes` entry with `custom_domain` set.

**`main` is the definition of this stack, not a default.** It names the
script's entry. Remove it and the deployment is assets-only, which is a
different arrangement with different failure modes and a different pack.

**`main` is the framework adapter's value, not this pack's.** For Astro,
`@astrojs/cloudflare` v13 — the release Astro 6 requires — moved it from a
built file path to the unified entrypoint
`@astrojs/cloudflare/entrypoints/server`, one value serving local
development and production alike. A different adapter names a different
entry, and some still emit a built file. Read the adapter's own
documentation; nothing here can guess it.

**`nodejs_compat` is a surface, not a runtime.** The platform does not run
Node. The flag provides the built-ins an adapter and its dependencies
expect, and what it does not provide fails at the edge rather than at build
time. Add a flag only when an adapter's documentation asks for it — Astro's
deployment guide also lists `global_fetch_strictly_public`, which changes
what a `fetch()` to the site's own hostname does — and never speculatively:
each flag changes runtime behaviour.

**`compatibility_date` is a date, not a version, and pinning it is the
point.** It fixes the runtime behaviour this deployment was written
against, so a future runtime change cannot alter how something already
shipped behaves. Move it deliberately and read the changelog for the span
skipped; a date bumped reflexively at every deploy is the same as not
pinning one.

**The file lives at the repo root.** Wrangler discovers its configuration
by walking up from the working directory, and the only alternative is
`--config` on every invocation any caller might type. The root allowlist
admits it for exactly that reason.

## What the edge does with a request, and the rule that follows

The request is matched against the uploaded file set first. A match is
served by the platform and **the script never sees it**. Everything else
**falls through to the script**, which renders the response.

Two consequences worth stating as rules:

- **`not_found_handling` has no business here, and this pack ships none.**
  The platform mode exists to decide what an unmatched request gets when
  there is no script to hand it to. With a script present, the unmatched
  request *is* the script's input, so what an unknown path returns is the
  framework's routing and its own 404 page — a decision in code, where it
  can read the request. Setting the mode would put a second, silent answer
  in front of exactly the paths the script exists to handle.
- **A prerendered page is not the script's traffic.** Which paths are files
  and which reach the script is decided by the framework's build, not by
  this configuration — which is why the health probe has to ask for one of
  each. See [health](health.md).

## `run_worker_first` ships off, and that is a decision

The knob inverts the order: the script is invoked **before** asset
matching, and reaches its files through the binding. It is real and
supported, and this pack leaves it unset for two reasons that both point
the same way.

- **Cost.** Requests the assets answer are free and unlimited; requests
  that invoke the script are billed. Turning the knob on makes every hashed
  CSS and JavaScript file a script invocation — see
  [cost shape](cost-shape.md).
- **Failure shape.** Under the platform's free-tier request limits, a
  request that must invoke the script returns 429 rather than falling back
  to serving the asset. Assets that would have been served regardless stop
  being served.

It earns its keep only where the script **must** see requests the assets
would otherwise have answered: an auth check over the whole site, a
redirect table maintained in code, a header the platform will not add.
That is a product decision made with its cost in view, and it is written
down when it is made.

## The assets binding

`assets.binding: "ASSETS"` is how the script fetches its own files —
`env.ASSETS.fetch(request)`, in-process rather than over the network. The
adapter uses it to serve prerendered pages and hashed assets from inside
the rendered response path. An assets-only deployment names no binding
because nothing exists to hold one.

## The route, and the deployment that has none

A `routes` entry with `custom_domain: true` binds the Worker to a hostname
and lets wrangler manage the DNS record for it; the zone has to already be
on the same account. **A repo with no custom domain deletes the block
rather than filling it in** — the Worker is then reachable at
`<name>.<account-subdomain>.workers.dev`, which is a complete deployment
and the right shape for a preview surface or an internal tool.

## Credentials are never in the file

`wrangler` reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from
the environment. The token's scope, and why `wrangler login` is not the CI
path, are [identity shape](identity-shape.md)'s. What matters here is the
negative rule: nothing in `wrangler.jsonc` is a secret, and a runtime value
the script needs is a binding or an environment variable the platform
supplies, never a literal in this file.

## What this component stays silent on

**How the directory and the script came to exist.** The build is the
framework's, and the deploy task runs the project's own build task where
one exists rather than defining one — see [pipeline](pipeline.md).

**Which routes render on demand.** That is the framework's configuration
and the project bundle's doctrine. This component serves whatever the build
decided.

**Whether the site should be publicly reachable.** Putting it behind the
account's identity-aware proxy is a second pin on the same axis, and
`cloud-service/zero-trust-access` owns that judgment.
