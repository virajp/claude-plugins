# SSG — every route prerendered

`output: 'static'`, **no adapter**. The build walks every route, renders it to
HTML, and writes a directory. Nothing runs at request time; the host serves
files.

This is Astro's default and the mode to start in. Adding an adapter later is a
two-line config change ([`hybrid.md`](hybrid.md)); adding one now is a
dependency that pays for nothing.

## What the build produces

A directory of files — `./dist` — and that directory is the whole
deployment. See [`build-output.md`](build-output.md) for the contract a deploy
pack relies on.

**`404.html` at the directory root.** A static host's not-found handling
serves it; a build that emits none turns every unknown path into a bare edge
404 with no branding and no navigation, and nothing reports the gap. Emit it
from `src/pages/404.astro`.

**A dynamic route enumerates its pages.** `getStaticPaths` returns the
parameter set, and the build renders one file per entry. A route whose
parameters are not knowable at build time is not a static route — it is the
signal that the project is Hybrid, not SSG.

## Config that is not optional

**`site`.** Sitemap generation and canonical URLs are built from it. Without
it a static build silently emits no sitemap — no error, no warning, an absent
file nobody looks for until search results are missing.

**`trailingSlash`, matched to the host.** Pick the form the host does *not*
redirect. A host whose default redirects the bare path to the slashed one
makes `"always"` the shape where an internal link never takes a redirect;
a host with the opposite default inverts the answer. This is a property of the
deploy pairing, so it is decided with the pairing and not before it.

**Inlining, where a Content-Security-Policy forbids it.** `style-src 'self'`
admits no inline `<style>`, and Astro's default inlines a stylesheet under
Vite's size threshold, so a CSP-bearing site sets
`build.inlineStylesheets: "never"`. The script side is
`vite.build.assetsInlineLimit: 0`. Setting one and not the other produces a
build that passes and a page that fails in the browser.

## Search

A static site has no server to query, so search is an **index built over the
output after the build** — a second command in the build task that reads
`dist/` and writes into it. Name the shape, not the tool: the requirement is
that the index ships as part of the same directory and is regenerated on every
build, never committed.

## Islands are optional and each one is a cost

React is available; a page that uses none ships no JavaScript. Add a
`client:*` directive when the interaction genuinely cannot be HTML — a form
with live validation, a filterable list — and not for a navigation toggle a
few lines of markup already handle.

Prefer the laziest directive that works: `client:visible` over `client:idle`
over `client:load`. `client:only` skips server rendering entirely and belongs
to the CSR shape ([`csr.md`](csr.md)), not here.

## What a static site never needs

- **An adapter.** If one seems necessary, a route is rendering on demand and
  the project is Hybrid.
- **Middleware at request time.** There is no request.
- **Server endpoints.** A `.ts` route under `src/pages/` must be prerendered,
  which means it can only serve a fixed body. Anything else is Hybrid.
- **A runtime secret.** Every value the build reads is baked into public
  output. Treat `astro.config` and every prerendered page as public.
