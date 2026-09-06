---
name: Astro (SSR)
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

# site — Astro (SSR)

A public website rendered **on demand**: every route is built per request, so
the page can read the request that asked for it. Typical duties: share/preview
pages with dynamic OG tags, legal pages, and small account-facing flows.

**What Astro is, and how its modes differ, is the `framework/astro` pack's
doctrine** — this bundle does not restate it. What the bundle pins is the mode:
`output: "server"`, every route on demand, `export const prerender = true`
opting an individual route back out. Its three siblings pin the other three
answers: [`astro-ssg`](astro-ssg.md) prerenders everything and needs no
adapter, [`astro-hybrid`](astro-hybrid.md) prerenders by default and flips
individual routes on demand, and [`astro-csr`](astro-csr.md) ships a static
shell whose app runs entirely in the browser.

A `site` calls someone else's API rather than publishing its own — SSR is not a
published API. A project that owns an API contract is `fullstack` instead.

This doc covers the **project axis** only; backing services and deploy target
are their own axes.

## Stack

- **Framework**: Astro on `output: "server"` — the pack's `ssr.md` carries the
  mode's reasoning. File routes under `src/pages/` (`.astro` pages plus `.ts`
  API endpoints); React via `@astrojs/react` only where interactivity demands
  it. The **adapter follows the deploy pairing**, not the other way round: see
  Deploy below.
- **UI**: shadcn-style components — Radix UI primitives + Tailwind CSS with
  `class-variance-authority`/`clsx`/`tailwind-merge`, icons via `lucide-react`.
- **Effect in SSR**: a shared `AppLayer` (the common package's aggregate
  services layer merged with the telemetry layer over a fetch HTTP client);
  pages and endpoints run Effect programs against it.
- **Data flow**: read-only datastore access happens server-side **via the
  common package's layers** (never a vendor SDK import, never from the
  browser), typed by the common `schemas/*`. Writes and privileged actions
  belong to the `service` — the site reaches it through **same-origin SSR proxy
  endpoints** (server-to-server fetch relaying status/body, hiding the service
  host and avoiding CORS).
- **Layout**: `src/pages/` (routes), `src/components/` (+ `components/ui/`),
  `src/layouts/`, `src/lib/` (the layer + data readers), `_shared/` (config,
  runtime); middleware sets per-route cache policy.
- **Config**: Effect `Config` + `Schema`, fail-fast; secrets injected by
  whatever the backing axis names; environment-driven domains in the Astro
  config.
- **Observability**: OpenTelemetry via Effect (enabled when the OTLP endpoint
  is configured).

## Build output and deploy

The build leaves a **server entry plus its client assets** under `./dist` — the
`## Build output` fact in the `framework/astro` pack's conventions, which is
what a deploy pack's asset directory cites rather than guessing.

**Pair with any supported deployment; Cloudflare Workers is the preferred
one.** `cloudflare-workers-ssr` first — a Worker with a script, so the adapter
is `@astrojs/cloudflare`. Then `gcp-cloud-run`, `gcp-gke` and
`container-generic`, all of which run a Node process, so the adapter is
`@astrojs/node` in standalone mode. Pinning the deploy axis is what decides
which adapter the repo installs; this bundle names no deploy slug in its
frontmatter, because the axes are pinned independently.

## Testing

Vitest with a **jsdom** environment + Testing Library for the React islands; v8
coverage at 100% on an explicitly scoped include (`lib/`, `components/`, the
SSR endpoints), excluding `.astro` shells and the `ui/` primitives.
