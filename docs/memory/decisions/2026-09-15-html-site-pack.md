# Decision — a plain HTML page tree is one pack and one bundle beside Astro

**Date** 2026-09-15 · **Branch** `2026-09-15-html-site-pack` · **Plan**
[`docs/plans/2026-09-15-html-site-pack/`](../../plans/2026-09-15-html-site-pack/index.md)
· **Adds** `framework/html`, the `html` bundle and the `document` category

## What was decided before

The `site` platform's whole menu was Astro. The four bundles
[`2026-09-06-astro-four-modes-four-bundles.md`](./2026-09-06-astro-four-modes-four-bundles.md)
made from the one `framework/astro` pack — `astro-ssg`, `astro-ssr`,
`astro-hybrid`, `astro-csr` — were the only entries a `site` project's
architecture round offered, and
[`2026-09-15-default-per-platform.md`](./2026-09-15-default-per-platform.md)
flagged `astro-ssg` as the one that round preselects. How a site's styles are
authored had already left the framework pack: the `stylesheet` axis of
2026-09-14 answers it with `plain-css`, `tailwindcss` or `stylex`, so a "static
site with plain CSS" needed no new stylesheet work — only a framework side that
is not a framework.

## What changed

**`framework/html`** ships as the fourth `framework/` pack: a hand-authored
HTML5 page tree with plain CSS and ES-module JavaScript as the whole of a static
site — no component model, no router, no content collections, no template
language. Vite serves `src/` in development and `vite build` writes `./dist`
under the same fixed `## Build output` heading Astro's conventions carry, so the
deploy packs' citation holds without edit. `html-validate` over `src/**/*.html`
is the project's `test`. The pack ships none of the three project tasks — init
authors `p:<id>:dev|build|test` from the doctrine — and lands exactly one file,
a byte-identical copy of Astro's `icons` task.

**`category: document`** is a new token appended to the closed `framework`
category list in `assets/taxonomy.md`, glossed as a hand-authored page tree
whose build, if any, is a bundler, not a framework. `meta-framework` was
rejected because Vite is a bundler and the token would misdescribe the pack;
`vanilla` and `static-site` were rejected as names.

**The `html` bundle**, display name `HTML`, `axis: project`,
`kind: language-bundle`, `platforms: [site]`, carries no `default:` key. Its
components are `astro-ssg`'s list with `framework/astro@0.2.0` replaced by
`framework/html@0.1.0` and `framework/react@generated` dropped — there are no
islands to hydrate. A `site` round now offers five entries, `astro-ssg` still
highlighted.

## The reversal: two bundles became one

The interview's first ruling was **both, as two bundles** — `html-static` with
no build step, `html-vite` with Vite. The user then generalised to **one
bundle**, `html`, with Vite as the dev server and the build shape a documented
choice inside the pack's doctrine. The reasons: it is one dependency either way,
since a dev server with live reload is wanted in both shapes and Vite is the one
that also builds; and whether `dist/` is a build or a copy is a doctrine choice
a repo makes once in its `build` task, not a difference that earns a second menu
entry. The reversal also removed the only consumer of the
stylesheet-compatibility mechanism the interview had agreed to plan, which is
why that mechanism is parked below with its design intact.

**The copy-only opt-out, as the pack writes it:** a repo that wants its tree
served byte-for-byte replaces the build with
`cp -R src/. dist/ && cp -R public/. dist/` and keeps `vite` for the dev server
alone. Both copies are needed — `public/` sits beside `src/`, not inside it, so
a copy of `src/` alone would drop `robots.txt`, `sitemap.xml` and the brand
assets. It gives up content-hashed asset names, minification, `.ts` scripts and
any stylesheet approach that needs a build plugin. The Vite build is the
default; copy-only as the default was rejected because Tailwind would then need
its CLI from the start and StyleX would be unavailable. Also rejected:
validating `dist/` instead of `src/` — authors edit `src/`, so that is the tree
the `test` task must read.

## Why Vite

Vite over `sirv-cli`, caddy and `live-server`: it gives live reload, and it is
the one dependency the Vite build needs anyway, so the dev server costs nothing
the build did not already cost. `html-validate` over "not applicable" because
every pack names a test, and over a Playwright smoke because the language pack's
`ux-gate` skill already renders.

## Stylesheets on the copy-only build (decision 7)

The pack's stylesheet paragraph states the one compatibility rule: `plain-css`
needs nothing wired; `tailwindcss` uses its Vite plugin under the default build
and its CLI under the copy-only opt-out; `stylex` needs the Vite build, so a
repo on the copy-only opt-out cannot pick it and says so in its own conventions.
No `stylesheets:` allowlist on the bundle — the mechanism is parked, since with
one bundle there is nothing for it to narrow.

## The web-head contract without a layout (decision 8)

No layout file exists, so the contract's layout clause is stated as met **per
page**: every page carries its full head, the head set is a checklist each page
repeats in order, `html-validate` catches the malformed half and a review
against the checklist catches the rest. `robots.txt` and `sitemap.xml` are
hand-authored under `public/`, stated as such — no build step owns page
discovery, so nothing can generate the sitemap. The site origin is one exported
constant, `SITE_ORIGIN` in `vite.config.ts`, that nothing reads at build; the
pages carry absolute canonicals by hand and a review checks them against it.
Rejected: an include plugin for a shared head, a dependency added for one file;
and generating the sitemap, which no build step is positioned to do.

## Parked

- **Stylesheet-compatibility mechanism (the interview's "B1").** Design agreed
  2026-09-15, no consumer yet: a project-axis bundle may declare
  `stylesheets: [<stylesheet bundle slugs>]`, absent meaning all;
  `stackgen-stack-menu` copies it verbatim
  (`skills/stackgen-stack-menu/SKILL.md:31,69`, and `:112-121` must be reworded
  since the stylesheet axis would then filter on the project pin); vwf's
  stylesheet round offers only the listed entries
  (`plugins/vwf/skills/architecture/references/stack-menu.md:135-142` — the
  project pin is recorded before that round, `SKILL.md:236-254`);
  `stack-adapter.md:176-190` gains the field; doctor flags a pin outside the
  list as blocking, beside the covering rule
  (`doctor/references/stack-checks.md:221-231`, `doctor/SKILL.md:148,170-176`);
  checker rule 15 validates every slug names a stylesheet-axis bundle (pattern:
  `scripts/src/check.ts:1265-1341`, registered at `:97`; "fourteen" → "fifteen"
  at `CLAUDE.md:65,151`, `.claude/docs/repo-shape.md:69,157`,
  `.claude/skills/plugin-authoring/references/checks.md:34,192`,
  `.claude/skills/vwf-plugin/SKILL.md:41`; `pack-format.md:199-209`). vwf minor,
  stackgen minor, site patch. Pick up when a bundle needs to narrow the round.
- **A shared home for the web-head icons task**, so two framework packs stop
  carrying byte-identical copies — needs a place a pack payload may cite without
  a sibling-pack path (rule 13), which no tier offers today.
