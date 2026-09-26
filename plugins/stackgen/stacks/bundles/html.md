---
name: HTML
axis: project
kind: language-bundle
components:
- language/typescript@0.1.0
- package-manager/pnpm@0.4.0
- toolchain-gate/tsconfig@0.2.0
- toolchain-gate/eslint@0.3.3
- framework/html@0.1.0
platforms:
- site
---

# site — HTML

A **hand-authored page tree served as files**: a landing page, a handful of
marketing pages, a personal site — the sites small enough to be written by
hand and kept honest by being written by hand. Every page is a complete
HTML5 document, styled by plain CSS and given behaviour by an ES module;
Vite serves the tree in development and builds it into a directory, so
nothing runs per request and there is no server to operate.

**A static site publishes no API.** It may call someone else's, from the
browser, at the cost of that call being public; a project that owns an API
contract is `fullstack`, and an application whose state lives in the browser
is a different platform token. This bundle is picked deliberately: the entry
a `site` project's architecture round preselects is
[`astro-ssg`](astro-ssg.md), and this is the alternative to it.

**Pick it over `astro-ssg`** when the site is a handful of pages someone
writes by hand, needs no content collections, and needs no islands — when a
framework would be learned for the sake of a page tree that fits in one
sitting. **Do not pick it** for a content-driven site (a blog, a changelog,
documentation past a page or two, anything in Markdown or MDX), for pages
built from data, or for anything that wants a per-route rendering mode —
each of those is an Astro bundle, and the `framework/html` pack's doctrine
says where the line is and how to cross it.

**What a page tree is, and how it is kept, is the `framework/html` pack's
doctrine** — this bundle does not restate it. What the bundle pins is that
there is no framework at all: Vite is a bundler, and the copy-only build the
pack documents is the proof that it is replaceable by a copy.

This doc covers the **project axis** only; backing services and deploy target
are their own axes.

## Stack

- **Framework**: none. `framework/html` is the `document` category — a page
  tree whose build is a bundler, not a framework. There is no component
  model, no router, no content model, and adding any of them is the signal
  this is the wrong bundle.
- **Pages**: one `.html` per page under `src/`, at the URL it is served
  from, every one listed in the Vite config's `input` — a page missing from
  that list is served in development and silently absent from the build.
  The pack's `pages-and-navigation.md` carries the shape.
- **Scripts**: ES modules, plain `.js` by default; `.ts` is allowed since
  the language pin is TypeScript and Vite compiles it. No component
  framework, no islands — a page's behaviour is one module tag.
- **Layout**: `src/` (the pages, with `css/`, `js/` and `assets/` beside
  them), `public/` beside `src/` (the brand assets, `robots.txt`, the
  hand-authored `sitemap.xml`), `vite.config.ts` at the project root.
- **Config**: values are read at **build** time, so a "secret" in this
  project is a build input and anything reaching the browser is public. The
  site's origin is one exported constant in the Vite config that nothing
  reads at build — the pages carry absolute canonicals by hand, and the
  constant is what a review checks them against.

## Build output and deploy

The build leaves **a directory of files at `./dist`** — the `## Build output`
fact in the `framework/html` pack's conventions, which is what a deploy pack's
asset directory cites rather than guessing. The copy-only opt-out the pack
documents writes the same directory by a different command and gives up
hashing, minification, `.ts` and any stylesheet plugin.

**Pair with `cloudflare-workers-static`**, or any host that serves a
directory: the deployable is exactly that directory and no script runs in
front of it. What the pairing decides is the trailing-slash and not-found
behaviour, and those must agree with the URL shape the pages use and with
the `404.html` the tree carries.

## Stylesheets

The stylesheet axis is answered separately, as for any `site`, and each of
its shipped approaches works here with one compatibility rule: `plain-css`
needs nothing wired; `tailwindcss` uses its Vite plugin under the default
build and its CLI under the copy-only opt-out; `stylex` needs the Vite
build, so a repo on the copy-only opt-out cannot pick it.

## Testing

**`html-validate` over `src/**/*.html`** is the project's `test` — the
document's shape, offline, on every commit. **Vitest on the node
environment** for any module under `src/js/` that does more than wire an
event; no jsdom default, since a page tree ships a module or two and a DOM in
every test buys nothing. Rendering is the language pack's `ux-gate` skill,
which already drives a browser. A build that fails is a test too: a page in
`input` that does not parse fails `vite build` in the repo's gate.
