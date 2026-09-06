---
name: Astro (SSG)
axis: project
kind: language-bundle
components:
- language/typescript@0.1.0
- package-manager/pnpm@0.1.0
- toolchain-gate/tsconfig@0.1.0
- toolchain-gate/eslint@0.1.0
- framework/astro@0.1.0
- framework/react@generated
platforms:
- site
---

# site — Astro (SSG)

A **content surface built once and served as files**: a marketing site, a
documentation build, a changelog, a landing page. Every route is rendered at
build time, so nothing runs per request and there is no server to operate — the
deployable is a directory.

**A static site publishes no API.** It may call someone else's, from the
browser, at the cost of that call being public; a project that owns an API
contract is `fullstack`, and one that must read the request before it can
answer is [`astro-hybrid`](astro-hybrid.md) or [`astro-ssr`](astro-ssr.md)
instead. An app whose state lives in the browser behind one shell page is
[`astro-csr`](astro-csr.md).

**What Astro is, and how its modes differ, is the `framework/astro` pack's
doctrine** — this bundle does not restate it. What the bundle pins is the mode:
`output: "static"` with **no adapter**, which is the pack's `ssg.md`.

This doc covers the **project axis** only; backing services and deploy target
are their own axes.

## Stack

- **Framework**: Astro on `output: "static"`, the default. No adapter is
  installed, and installing one is the signal that this is the wrong bundle: an
  adapter exists to render on demand, and nothing here does.
- **Routing and content**: file routes under `src/pages/`, and **content
  collections** for anything that is a body of documents — the schema on a
  collection is what turns a typo in frontmatter into a build failure rather
  than a blank page. The pack's `content-and-routing.md` carries the shape.
- **React is present, and mostly unused.** `@astrojs/react` ships in the bundle
  so an island is a decision rather than a migration, but **a page with no
  island ships no JavaScript** — that is the whole reason to be on this mode,
  and reaching for a component where markup would do gives it away for nothing.
  Hydrate with the narrowest directive the interaction survives.
- **Layout**: `src/pages/` (routes), `src/content/` (collections),
  `src/components/`, `src/layouts/`, `src/lib/` (pure helpers the build calls).
- **Config**: values are read at **build** time, so a "secret" in this project
  is a build input and anything reaching the browser is public. Set the site's
  canonical origin in the Astro config — sitemaps and canonical URLs derive
  from it, and without it a static build silently emits none.

## Build output and deploy

The build leaves **a directory of files at `./dist`** — the `## Build output`
fact in the `framework/astro` pack's conventions, which is what a deploy pack's
asset directory cites rather than guessing.

**Pair with `cloudflare-workers-static`**, the bundle this mode was built for:
its deployable is exactly that directory, no script runs in front of it, and
its reproducible-build rule is what stands in for promotion by digest. Any host
that serves a directory works the same way; what the pairing decides is the
trailing-slash and not-found behaviour, and those must agree with what the
Astro config declares.

## Testing

**Vitest on the node environment** for `src/lib/` and anything the build calls
— that is where a static site's logic actually lives. **jsdom + Testing Library
only for the islands a repo actually writes**, since a bundle-wide jsdom
default buys nothing on a site that ships no client JavaScript. Scope the
coverage include to `lib/` and `components/`, excluding `.astro` shells, and
let the repo set the threshold. A build that fails is a test too: a broken
content-collection schema or a dead route is caught by `astro check` in the
repo's gate, not by a unit test.
