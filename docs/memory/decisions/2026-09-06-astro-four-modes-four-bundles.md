# Decision — Astro is one pack and four bundles, one per rendering mode

**Date** 2026-09-06 · **Branch** `2026-09-05-astro-static` · **Plan**
[`docs/plans/2026-09-05-astro-static/`](../../plans/2026-09-05-astro-static/index.md)
· **Renames** a released bundle slug, `typescript-astro-react` → `astro-ssr`

## What was decided before

`framework/astro` was a `@generated` ref. The only bundle serving
`platforms: [site]` was `typescript-astro-react` — display name *TypeScript ·
Astro (SSR) · React* — and both of its framework components were `@generated`,
so a repo pinning it got a bundle whose two most load-bearing components ran the
generation pipeline on first fetch. It shipped in `stackgen-v1.0.0` and is
pinned today in exactly one place: 95octane's `.config/vwf.yaml`, as
`project/site/typescript-astro-react`.

## What changed

**One real `framework/astro` pack**, the second framework pack in the tree
beside `effect`, at `category: meta-framework` because Astro owns the build the
way Effect owns composition. Its skill is `user-invocable: false` and
paths-scoped to `**/*.astro`, `**/astro.config.*` and `**/src/content/**`, and
it carries eight references — the one Framework-doctrine artifact the
twelve-topic bar owes, one per mode, content and routing, the build output, and
testing.

**Four sibling bundles on that one pack**, all `platforms: [site]`, all carrying
`framework/react@generated` for islands:

| Bundle         | Display name     | Is                                                                                 |
| -------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `astro-ssg`    | `Astro (SSG)`    | `output: 'static'`, no adapter — built once, served as files                       |
| `astro-ssr`    | `Astro (SSR)`    | `output: 'server'` plus an adapter — every route per request                       |
| `astro-hybrid` | `Astro (Hybrid)` | `output: 'static'` plus an adapter, `prerender = false` per route                  |
| `astro-csr`    | `Astro (CSR)`    | `output: 'static'`, one shell page and a catch-all, the app a `client:only` island |

`astro-ssr` and `astro-hybrid` also pin `framework/effect@0.1.0`: Hybrid is SSR
with prerender flipped, so its on-demand routes cite the SSR bundle's server
doctrine — the shared `AppLayer`, layered datastore reads, same-origin proxy
endpoints, per-route cache middleware — rather than restating it. SSG and CSR
have no server to hold a layer, so neither pins Effect.

**"TypeScript" left the display names.** The user's ruling: *"drop `Typescript`
since that's implicitly used for Astro projects"*. Every bundle still pins
`language/typescript@0.1.0`; what changed is what the menu shows.

**The build-output contract became a named fact.** `framework/astro`'s
`conventions.md` and its `build-output.md` reference both carry a fixed
`## Build output` heading stating that the build writes `./dist` — Astro's
`outDir` default — and that a deploy pack may rely on it. Both Cloudflare
Workers packs' `assets.directory` cite that heading. The seam was claimed by
neither bar before: the deploy-target bar puts "what gets built, from what" on
the deploy side while fencing that kind off from the language's build commands,
and no project-axis bundle emitted a build-directory fact at all.

**CSR's router is React Router in Data mode** — `createBrowserRouter` plus
`RouterProvider` — inside the `client:only="react"` island, with a catch-all
page so a deep link still serves the shell. TanStack Router is named as the swap
when the URL is the app's state, with its costs stated: a Vite plugin inside
Astro's, and a generated `routeTree.gen.ts` in the tree.

## The measured facts that shaped it

Two findings from the Context7 research pass (2026-09-06) decided the shape:

- **`output: 'hybrid'` was removed in Astro 5** and merged into `'static'`.
  Astro has exactly two `output` values, so "four modes" cannot be four values
  of one key.
- **CSR is a shape, not a mode.** A `client:only` React app in a static shell is
  `output: 'static'` with a particular page layout; Astro's own "migrate from
  Create React App" guide describes exactly that.

So the four modes are four *decisions over two values plus the adapter and the
client directives* — which is a doctrine question, not a configuration one, and
belongs in a pack that four bundles pin rather than in a field.

## The alternatives rejected

- **A mode field on the bundle frontmatter.** The schema is `axis`, `kind`,
  `platforms`, `artifact` (deploy only), `unconditional`, `components` — no
  output-mode vocabulary exists anywhere in `assets/` or `bundles/`, and adding
  one would put a rendering decision in the payload vwf parses.
- **A per-project setting.** Same objection, one level further out.
- **One bundle per `output` value** — two bundles. It collapses Hybrid into SSR
  and CSR into SSG, which is exactly the distinction the user asked to see on
  the menu.
- **Two packs.** One pack carries all four doctrines because they differ in
  which of one framework's knobs are turned, not in what the framework is.
- **Folding `framework/react` into the Astro pack.** Declined at review; React
  stays `@generated` in all four, which is the generated path working as
  designed rather than a gap.
- **With/without-React pairs**, six bundles. A page with no island ships no
  JavaScript, and the SSG doctrine says so — which is what makes the pair
  unnecessary.
- **Keeping `typescript-astro-react` as the SSR slug**, and an alias stub beside
  the new one. Both rejected: four siblings named on one scheme read as a menu,
  and a stub is a second thing to keep in step.
- **TanStack Router as CSR's default.** Named as the swap, with its costs, not
  as the default.
- **A `build_output:` payload field** the framework pack declares and the deploy
  pack reads at pin time. The better shape, and it changes the template payload
  vwf parses — parked as a vwf plan.

The precedent for four siblings on one pack is already in the tree:
`typescript-effect-cli` and `typescript-parseargs-cli` are two bundles on one
platform differing by one decision.

## The rename is a breaking change, and the blast radius is one line

`typescript-astro-react.md` was `git mv`'d to `astro-ssr.md`. A repo pinning the
old slug gets an unknown-slug error from `stackgen-stack-template`, which is the
correct failure — it never guesses — but it is a failure. **The only pin that
exists anywhere is the maintainer's own**, 95octane's `.config/vwf.yaml`, and
re-pointing it is a one-line edit in that repo's own session followed by a
`/vwf:doctor` run. The `stackgen` release note says so by name.

## Not a reversal of the north star

[`2026-08-17-north-star-two-plugins.md`](./2026-08-17-north-star-two-plugins.md)
rules that a closed stack menu must not force the maintainer's choices — Effect,
Hono, Astro, Refine — on users. This plan adds one cited pack beside the
generator's open entry and removes nothing: the `generate` entry still ships on
every menu answer, and a project the four bundles do not fit takes it. The
objection that decision raised is about a menu with no door out of it, and the
door is still there.
