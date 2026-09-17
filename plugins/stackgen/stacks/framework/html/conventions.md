# HTML — conventions

A hand-authored page tree layers **on top of** the TypeScript baseline rather
than replacing it: the baseline's rules — `strict`, the `@/` alias, one
mapping home for errors, config read once at the composition root, Vitest —
apply to every `.ts` file the site holds, and the scripts below are held to
them too. This component adds nothing but a directory of pages: no
component model, no router, no content collections, no template language.
**Every page is a complete HTML document written by hand**, and that is the
property the pack is chosen for.

**Vite owns the build**, and it is the only build there is. There is no
framework config for a plugin to go inside, so a stylesheet approach that
needs one registers it in `vite.config.ts` — which is the one place any
build wiring lives. A repo that opts out of the build (below) has no plugin
list at all.

## The tree

```text
src/                     the site root — what Vite serves and builds
  index.html             one .html per page, at the URL it is served from
  about.html
  404.html               the not-found page a static host serves by name
  css/                   the stylesheets, imported from each page's <head>
  js/                    ES modules, loaded with <script type="module">
  assets/                images, fonts — referenced by pages, hashed on build
public/                  copied verbatim to the build's root, never hashed
  brand/favicon.svg      the mark; the task below rasterizes the set from it
  robots.txt             hand-authored; names the sitemap by absolute URL
  sitemap.xml            hand-authored; one <url> per page offered to search
  site.webmanifest
vite.config.ts           the site root, the page list, the output directory
.htmlvalidate.json       the validator's config — extends the recommended set
```

`src/` is the site: a file at `src/about.html` is served at `/about.html`
and built to `dist/about.html`, and nothing renames it. **`public/` sits
beside `src/`, not inside it**, so a stray `.html` in the copied-through
tree cannot become a page nobody validates; `vite.config.ts` points Vite at
both. The config states four things and no more — the root is `src`, the
public directory is the `public/` beside it, the output directory is the
`dist/` beside it (emptied on every build), and **every page is listed as an
input**:

```ts
import { resolve } from "node:path";
import { defineConfig } from "vite";

/** The site's origin. Nothing reads it at build; the pages carry absolute
    canonicals by hand, and this is the one place the origin is written so
    a review can check them against it. */
export const SITE_ORIGIN = "https://example.com";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  input: {
    index: resolve(import.meta.dirname, "src/index.html"),
    about: resolve(import.meta.dirname, "src/about.html"),
    notFound: resolve(import.meta.dirname, "src/404.html"),
  },
  build: { outDir: "../dist", emptyOutDir: true },
});
```

**A page not listed there is not built.** The dev server serves any file
under `src/` by path, so a new page works in development and is **silently
absent** from `dist/` — no error, no warning, just a 404 in production that
development never showed. Adding a page is two edits: the file, and its line
in `input`. The `input` key is Vite 8's top-level option; the older
`build.rollupOptions.input` is deprecated in that major and is not written.

## Build output

**The build writes `./dist`** — Vite's `outDir` default, resolved here to
the directory beside `src/` — and a deploy pack may rely on that path. It is
the contract between the project axis and the deploy axis: what a deploy
target uploads, and where it looks for it.

A repo that changes `outDir` has changed that contract and must change its
deploy configuration in the same commit. Nothing detects the mismatch: a
deploy target pointed at a directory that no longer exists uploads nothing
and reports success.

What lands there is **files only**: every listed page, its stylesheets and
scripts minified and content-hashed, the assets those reference, and
`public/` copied through at the root. No server entry exists in any
configuration of this component. Details, and the rule that a post-build
step writes **into** `dist/` rather than beside it, are the `build-output`
reference.

**The copy-only opt-out.** A repo that wants its tree served byte-for-byte —
no hashing, no minification, no rewriting of any kind — replaces the build
with `cp -R src/. dist/ && cp -R public/. dist/` and keeps `vite` for the dev
server alone. It gives up content-hashed asset names (so nothing in `dist/`
may be cached immutably), minification, `.ts` scripts (nothing compiles
them), and **any stylesheet approach that needs a build plugin** — the
stylesheet paragraph below says which. It is a choice a repo makes once, in
its `build` task, and states in its own conventions; the default is the Vite
build.

## Dev, build, test

The three project tasks `/vwf:init` authors from this doctrine, under the
project's own task group — this pack ships none of them:

- **`dev`** runs `vite`. Live reload over every file under `src/`, and
  `public/` served at `/`. A nested page is reached by its path, exactly as a
  static file server would serve it.
- **`build`** runs `vite build`, writing `./dist` as above — or the copy-only
  command where the repo has opted out.
- **`test`** runs `html-validate "src/**/*.html"` — the glob quoted, so the
  tool expands it — against `.htmlvalidate.json` at the project root,
  which extends `html-validate:recommended`. A page that fails validation
  fails the task, and validation is the nearest thing to the type check a
  framework would give a page: the document's shape is enforced here, and
  the head checklist below by review.

Both dependencies are `devDependencies` in the project's manifest, pinned by
the package manager the bundle names: `vite` on its current major (8 at the
time of writing) and `html-validate` on its (11). Nothing else is required;
a rendering check is the language pack's `ux-gate` skill, which already
drives a browser and is not duplicated here.

## Scripts

**ES modules, plain `.js` by default.** A page loads a script with
`<script type="module" src="/js/<name>.js">`; the module imports what it
needs by relative path, and Vite bundles the graph from that one tag. No
globals, no classic scripts, no inline handlers — a content-security policy
with no inline allowance then costs nothing, and a module is the shape that
keeps a page's behaviour reviewable beside its markup.

**`.ts` is allowed**, since the language pin is TypeScript and Vite compiles
it with no configuration: a page may load `/js/<name>.ts` directly. It is
allowed, not required — a site with three lines of behaviour gains nothing
from a type pass — and it is **unavailable on the copy-only opt-out**, where
nothing compiles it.

**Imports stay within what the browser and Vite both resolve**: relative
paths, and bare package names Vite resolves from `node_modules`. No
bundler-specific import syntax beyond Vite's own asset and `?raw` forms,
and none of those on a repo that has opted out of the build.

## Head

**No layout owns the head, because there is no layout** — that is what a
hand-authored page tree means, and it is the one clause of the web-head
contract this component cannot satisfy as written. It is met **per page**
instead: every page carries its full head, the set below is a checklist
each page repeats in this order, `html-validate` in the `test` task catches
the malformed half (a missing `<title>`, a missing `lang`, a tag that does
not close), and a review against the checklist catches the rest — nothing
typed stands in for the layout's props. A product renaming itself edits
every page; that cost is the trade the pack makes, and a site large enough
to feel it is a site that has outgrown this pack (the `framework-doctrine`
reference says when).

The head set every page repeats:

1. `<meta charset="utf-8">`, then the viewport meta.
2. `<title>`, then `<meta name="description">`.
3. **The canonical, as an absolute URL, typed by hand** — there is no config
   read and no build to derive it from. Every canonical starts with the
   origin `vite.config.ts` exports as `SITE_ORIGIN`, and a review checks
   them against it; a page that moves rewrites its own canonical in the same
   commit.
4. The icon links — the SVG mark at `/brand/favicon.svg`, the ICO at
   `sizes="32x32"`, the apple-touch icon — then the manifest, then
   `rel="sitemap"` pointing at `/sitemap.xml`.
5. Any `rel="alternate"` the page offers.
6. The OpenGraph set, then the twitter set, then the image dimensions and
   alt text, then `og:locale`.
7. `theme-color`.
8. The JSON-LD blocks, last — serialized by hand, with every `<` written as
   the JSON escape `\u003c`.
9. The stylesheet links, then the one `<script type="module">`.

**The sitemap is hand-authored** at `public/sitemap.xml` — no build step
owns page discovery, so nothing can generate it — and **`robots.txt`** is
hand-authored beside it, naming the sitemap by absolute URL and stating the
product's crawl and AI-use position explicitly. A page pinned `index: no` is
excluded twice: it is **left out of `sitemap.xml`**, and it carries
`<meta name="robots" content="noindex">`. Both, always — a noindex page
listed in the sitemap is an invitation followed by a refusal.

**Static files live under `public/`**, the directory beside `src/`, copied
through to the build's root at the same path: the SVG mark, the rasterized
icon set, the ICO, the web app manifest, `robots.txt`, `sitemap.xml` and the
social-preview image. They carry the product's own name, colours and art, so
the workflow writes them from the contract rather than a pack landing them.

**The icons task** is the pack's one landed file: it rasterizes the whole
set from `public/brand/favicon.svg` with one-off tools and lands under the
project's own task group. It is run by hand when the mark changes, never in
a gate and never in the build.

Depth — the tag order, the escaping, and the checklist as a file to diff a
page against — is the `head` reference.

**Stylesheets** are the project's own `stylesheet` pin, a separate axis,
and each of its three shipped approaches hooks in by role. `plain-css` needs
nothing wired: its entry stylesheet is linked from every page's head, and
the framework inlining setting it names is not this component's — a
stylesheet a page links is emitted by the Vite build as a file.
`tailwindcss` registers its **build plugin** in `vite.config.ts` under the
default build, and under the copy-only opt-out uses its **CLI** to write the
stylesheet the pages link, since no build runs to host the plugin. `stylex`
registers its **build plugin** first in the same config, and **needs the
Vite build** — a repo on the copy-only opt-out cannot pick it, and says so
in its own conventions if it has opted out.

## What this component does not decide

The UI kit (there is none; markup is the kit); **how styles are authored** —
that is the project's own `stylesheet` pin, a separate axis, subject to the
one compatibility rule above; the deploy target (the deploy-axis pin decides
it, and this component's `./dist` is the whole of what it needs); the value
of `SITE_ORIGIN`; the words in the head; the pages themselves. It decides
how a page tree is kept honest, never whether a page tree is the answer.

Full judgment: the `html` skill's references.
