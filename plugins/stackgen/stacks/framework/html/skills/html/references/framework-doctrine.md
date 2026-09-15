# HTML — framework doctrine

The one artifact the `language-bundle` bar owes for this framework component:
what a hand-authored page tree is for, why there is no framework behind it,
the page model, when a site has outgrown it, and the seam with the language
pack.

**Every opinion below traces to a source**, in the bar's precedence order:
(1) the repo's settled pattern where one exists; (2) Vite's own documented
recommendation — Context7 `/vitejs/vite`, read 2026-09-15 — and
html-validate's published usage documentation, read the same day; (3) a
catalog entry. Where the ecosystem is genuinely split, this file says so
rather than manufacturing consensus.

## What this pack is for

**A static site small enough to be written by hand, and kept honest by
being written by hand.** A landing page, a handful of marketing pages, a
one-product documentation page, a personal site: a page tree where the whole
site is readable in one sitting and every page is a complete document
someone wrote. Its output is a directory of files; nothing runs per request
and there is no server to operate.

The reason to pick it over a framework is that it has **no abstraction to
learn, no build model to reason about, and no upgrade to take**. A page is
what the browser receives, less minification and hashing. What it costs is
repetition: the head, the navigation and the footer are typed into every
page, and a change to any of them is a change to every page. That trade is
right for a site with a few pages and wrong for a site with many — and the
line between them is the whole of the decision this file exists for.

**Selection is not this file's business.** The bundle a project pins decides
that a page tree is the answer; this file decides how the tree is kept once
it is.

## Why there is no framework

The `document` category this pack carries was minted for exactly this: a
hand-authored page tree where the build, if any, is a bundler and not a
framework. Vite is here to serve the tree with live reload in development
and to hash and minify it on build; it imposes no page model, no component
model and no routing. It is replaceable by a copy, which is what the
copy-only opt-out in this component's `conventions.md` is.

What the pack deliberately does **not** add, and why:

- **No include or partial mechanism.** A build-time include would give the
  head and the navigation one home, and it is the first thing a person
  reaches for. It is refused because it is a template language in all but
  name: the moment a page is assembled from parts, the page is no longer the
  document, and the site has taken the first step toward being a framework
  with none of a framework's tooling. A site that needs shared parts has
  outgrown this pack — the next section.
- **No client-side router.** A page is a URL and a URL is a file. A script
  that intercepts navigation and swaps content is an application shell, and
  an application is a different platform token.
- **No content model.** Markdown, collections, frontmatter and generated
  pages are a content site's needs, and a content site is the Astro packs'
  territory.

## When a site has outgrown this pack

Leave for an Astro bundle when any of these is true:

- **The shared parts hurt.** A head, navigation or footer edit that touches
  more pages than a person is willing to check by hand — roughly, a site
  past a dozen pages, or one where the pages are not all one person's.
- **Pages are generated from content.** A blog, a changelog, documentation
  with more than a page or two, anything written in Markdown — the moment
  there is a body of documents, a collection with a schema is what turns a
  typo in one into a build failure rather than a blank page.
- **A page needs to be built from data.** A price read from a file, a list
  of releases, a table that would otherwise be maintained twice.
- **Interactivity beyond a module or two.** An island framework is the
  correct answer to "this one part is an application"; a page tree with a
  growing `js/` directory is an application being written without one.

The move is mechanical: the pages become `.astro` files with the head lifted
into one layout, `public/` moves unchanged, and the deploy pairing stays,
since the Astro packs write the same `./dist`.

## The page model

**One file, one URL, one complete document.** `src/index.html` is `/`,
`src/about.html` is `/about.html`, `src/docs/index.html` is `/docs/`. There
is no rewriting: the URL a page is served at is the path of its file, and a
link between pages is written as that path. Vite's own documentation is
explicit that the dev server serves a nested page by its path exactly as a
static file server would, and that the production build respects the
resolved file paths so the two agree.

**Every page is listed in the Vite config.** The `input` map in
`vite.config.ts` is the build's page list, and a page not in it is not
built — the dev server will happily serve it, which is why the omission is
found in production. The depth on this, and on the `404.html` page, is
[`pages-and-navigation.md`](pages-and-navigation.md).

## The seam with the language pack

This component adds a directory of pages and a build; it changes none of
the baseline's rules. A `.ts` file under `src/js/` is TypeScript and is held
to them — `strict`, the alias, the one mapping home for errors. The type
gate over those files is the baseline's `tsc` pass, unchanged; there is no
second checker, because there is no second file type.

The one deliberate seam: `vite.config.ts` is the composition root for the
build and exports the site's origin as a constant. Nothing reads it at build
— the pages carry absolute canonicals by hand — and it exists so a review
has one value to check every canonical against. That is the baseline's
config-read-once rule with nobody reading it, stated honestly rather than
dressed up as a derivation.

Neighbours are named only through the capability vocabulary. This file does
not decide the stylesheet approach, the deploy target or the CI system, and
cross-framework integration judgment lives in the language pack's standards
reference — never here.
