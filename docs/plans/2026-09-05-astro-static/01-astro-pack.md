# U1 — The `framework/astro` pack, carrying all four rendering modes

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/framework/astro/**` — everything under it
  is new. Touch nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/framework/effect/**` top to bottom —
  the only framework pack, and the model for every file here: `pack.yaml`
  fields, `conventions.md` in the "layers on top of the language baseline"
  voice, the paths-scoped `user-invocable: false` skill, one reference per
  topic; `plugins/stackgen/assets/kinds.md:49-135` (the `language-bundle` bar,
  topic 2, and the framework ruling at `:120-135` — selection-neutral,
  usage-opinionated, cited, dependencies get no reference, one seam per
  framework); `plugins/stackgen/assets/pack-format.md` for the `pack.yaml`
  fields; `plugins/stackgen/stacks/language/typescript/conventions.md` so the
  seam with the baseline is stated once, not restated.
- **Lazy-load:** `site/astro.config.ts`, `site/package.json` and
  `.config/mise/tasks/site/{build,dev,check}` in this repo — the maintainer's
  proven static specimen, read-only, for the four facts D9 names and the
  build/pagefind shape. Cite facts and reasons; never the repo name, the domain,
  or a path. `plugins/stackgen/stacks/bundles/typescript-astro-react.md:19-58`
  (renamed to `astro-ssr.md` by U2 in this wave — read whichever exists) for
  what the SSR bundle already decides, so the pack's SSR doctrine agrees with it
  rather than contradicting it. Context7 `/withastro/docs` for every Astro fact
  you cite; `/websites/reactrouter` for the CSR reference's router facts.

## Ruling

D2: "Ship a real framework/astro pack": the second framework pack in the tree,
redeeming `framework/astro@generated`.

D3: "One pack, four bundles". The user: "There are 4 types of projects that can
be created using Astro: Static Site Generation, aka SSG; Server Side Rendering,
aka SSR; Hybrid Rendering; Client Side Rendering, aka CSR." The measured facts
(Context7, 2026-09-06): Astro has **two** `output` values — `'static'` (the
default; every page prerendered unless a route exports `prerender = false`,
which then needs an adapter) and `'server'` (every page on demand unless a route
exports `prerender = true`). `output: 'hybrid'` was **removed in Astro 5** and
merged into `'static'`. CSR is not an output mode: it is `'static'` shipping a
shell page whose whole app is a `client:only` island with its own router. The
pack's doctrine carries all four as decisions over those two values plus the
adapter and the client directives.

D5: "Framework pack conventions, as a named fact": `framework/astro`'s
`conventions.md` and its Framework-doctrine reference state, under a fixed
heading, that the build output is `./dist` (Astro's `outDir` default) and a
deploy pack may rely on it; the Workers packs' `./dist` cite that heading.

D8 *(assumed)*: `category: meta-framework`; the skill is `user-invocable: false`
and paths-scoped to `**/*.astro`, `**/astro.config.*` and `**/src/content/**`.

D9 *(assumed)*: this repo's `site/` is the cited static specimen for the four
config facts.

D10 *(assumed)*: testing per mode, stated in `testing.md` — node for `lib/` and
endpoints, jsdom + Testing Library for islands and the CSR app, route tests
through React Router's `createMemoryRouter`; no coverage threshold decided.

D13 *(assumed)*: eight references — `framework-doctrine.md`, `ssg.md`, `ssr.md`,
`hybrid.md`, `csr.md`, `content-and-routing.md`, `build-output.md`,
`testing.md`.

D38: "Hybrid is SSR with prerender flipped" — the same adapter and the same
server doctrine, differing in the default.

D39: the CSR bundle's router is React Router in **Data** mode
(`createBrowserRouter` + `RouterProvider`) inside a `client:only="react"`
island, with a catch-all page so deep links serve the shell; TanStack Router is
named as the swap when the URL is the app's state.

## Edits

1. **`pack.yaml`** — `name: Astro`; a `summary` in the Effect pack's register (a
   content-first web framework that owns the build: file routes, content
   collections, islands only where interactivity demands it, and two config
   decisions — `output` and whether an adapter is present — that between them
   give four ways to render); `version: 0.1.0`; `type: framework`;
   `category: meta-framework`; `kind: language-bundle`; `axis: project`; the
   topic-2 comment the Effect pack carries; `harness: n/a`.
2. **`conventions.md`** — the component's prose, copied verbatim into the
   template payload. Carries, in this order: the seam with the TypeScript
   baseline (Astro layers on it; `strict` stays; the baseline's rules apply to
   every `.ts` the site holds); **the four modes as one decision table** — SSG
   (`static`, no adapter, everything prerendered), Hybrid (`static` plus an
   adapter, prerendered by default, `prerender = false` opts a route into
   on-demand), SSR (`server` plus an adapter, on demand by default,
   `prerender = true` opts a route out), CSR (`static`, no adapter, one shell
   page and a catch-all, the app a `client:only` island) — and when each is the
   answer (no per-request data: SSG; a content site with a few request-time
   pages: Hybrid; anything reading a request, session or datastore on most
   routes: SSR; an app whose state lives in the browser and whose pages are not
   content: CSR); the honest note that `hybrid` is no longer a config value and
   that CSR is a shape, not a mode; **the named dist fact under a fixed heading
   `## Build output`** — the build writes `./dist` (Astro's `outDir` default)
   and a deploy pack may rely on that path; a repo that changes `outDir` has
   changed the contract and must change its deploy config with it; what lands
   there per mode (files only for SSG and CSR; files plus the adapter's server
   entry for Hybrid and SSR); islands doctrine (zero JavaScript by default;
   React is available in every bundle and used only where interactivity demands
   it; a page with no island ships no JavaScript); the four specimen facts as
   reasons (D9): `site:` must be set or sitemap and canonicals silently degrade,
   `trailingSlash` is chosen to match the host's `html_handling`, and a CSP with
   no inline allowance forces `build.inlineStylesheets: "never"` and
   `vite.build.assetsInlineLimit: 0`; what this pack does not decide (the UI
   kit, the deploy target, the content of `astro.config`'s `site`, the adapter —
   the deploy pairing names it).
3. **`skills/astro/SKILL.md`** — the router. Frontmatter in the Effect skill's
   exact shape: `name: astro`, `version: 0.1.0`, `category: development`,
   `description` (auto-applies when editing an Astro project's pages, config or
   content), `license: MIT`, `user-invocable: false`,
   `allowed-tools: Read Grep Glob Edit Write Bash`, `paths:` with the three
   globs from D8. Body: the reference table and when to read each; no doctrine
   of its own.
4. **`skills/astro/references/framework-doctrine.md`** — topic 2, the one
   artifact the bar owes: what Astro is for, the four-mode decision in full with
   the two config values it rests on, the routing model, and the seam with the
   language pack. Every opinion cited in the ruling's precedence: detection (the
   specimen) → Astro's own docs (Context7 `/withastro/docs`) → the catalog.
5. **`references/ssg.md`** — `output: 'static'`, no adapter: the build is a
   directory, `404.html` for the host's not-found handling, sitemap and
   canonicals from `site:`, trailing-slash policy versus the host, a search
   index built over `dist/` after the build (the specimen uses pagefind; name
   the shape, not the package, unless citing it), and what a static site never
   needs (middleware at request time, an adapter, server endpoints). Islands are
   optional and each one is a deliberate cost.
6. **`references/ssr.md`** — `output: 'server'`: an adapter is mandatory and
   which one is the deploy pairing's call (Node standalone for a container; the
   Cloudflare adapter for a Worker — cite both adapters' docs, decide neither);
   SSR endpoints under `src/pages/*.ts`; per-route cache policy in middleware;
   `prerender = true` for the pages that do not need the server. Must agree with
   the SSR bundle's decisions; where the bundle decides more (Effect `AppLayer`,
   proxy endpoints), this reference cites the bundle rather than restating it.
7. **`references/hybrid.md`** — `output: 'static'` plus an adapter: the same
   adapter choice as SSR, prerendering as the default,
   `export const prerender
   = false` per route or endpoint as the opt-in, and
   the rule of thumb for which routes earn it (anything reading a cookie, a
   session, or data that changes between requests). States plainly that `hybrid`
   was a config value until Astro 5 and is not one now, so a reader who finds it
   in older material knows why it fails. Cites `ssr.md` for the server side
   rather than restating it.
8. **`references/csr.md`** — `output: 'static'`, no adapter, and the shape: one
   shell page (`src/pages/index.astro`) mounting the app with
   `client:only="react"`, a catch-all (`src/pages/[...path].astro`) rendering
   the same shell so every deep link prerenders to it, and the host's not-found
   handling switched to single-page-application mode so unknown paths also land
   on the shell (name the setting the Workers Static Assets pack ships and that
   CSR flips it). The router per D39: React Router in Data mode —
   `createBrowserRouter`, `RouterProvider`, `clientLoader`/`clientAction` for
   data, why Data over Declarative (loaders without a rewrite) and why not
   Framework mode (it owns the build; Astro owns this build); and the swap:
   TanStack Router when search params are the app's state, what it costs (a Vite
   plugin inside Astro's `vite.plugins`, a generated `routeTree.gen.ts`). Note
   that Astro's own `<ClientRouter />` is view transitions between prerendered
   pages, not this. Cite `/websites/reactrouter` for the router facts.
9. **`references/content-and-routing.md`** — file routes, content collections
   and their schemas, markdown and remark/rehype plugins as build-time
   transforms, `src/` layout (`pages/`, `layouts/`, `components/`, `content/`,
   `lib/`), and the catch-all route pattern CSR relies on.
10. **`references/build-output.md`** — the named dist fact, restated under the
    same `## Build output` heading as `conventions.md` so a deploy pack can cite
    either; `outDir`; what lands in `dist/` per mode (files only, or files plus
    the adapter's server entry — for the Cloudflare adapter, the Worker entry
    the deploy pack's `main` names); the rule that a search index or any
    post-build step writes **into** `dist/`, never beside it.
11. **`references/testing.md`** — Vitest as the runner; `astro check` as the
    type gate over `.astro` files; jsdom + Testing Library for islands and for
    the CSR app (route tests through React Router's `createMemoryRouter`); a
    node environment for endpoints and `lib/`; the scoped include and why
    `.astro` shells are excluded. Leave the coverage threshold to the repo.

## Verification

- `mise run plugins:check` exits 0 with the pack discovered (the skill count
  rises by one).
- `python3 -c "import yaml,sys; d=yaml.safe_load(open('plugins/stackgen/stacks/framework/astro/skills/astro/SKILL.md').read().split('---')[1]); assert d['user-invocable'] is False and d['paths']"`
  passes.
- `ls plugins/stackgen/stacks/framework/astro/skills/astro/references/ | wc -l`
  = 8.
- `grep -n "^## Build output" conventions.md skills/astro/references/build-output.md`
  hits both, and `grep -n "./dist"` hits under each.
- `grep -rn "output: 'hybrid'\|output: \"hybrid\"" plugins/stackgen/stacks/framework/astro/`
  — every hit is inside the sentence saying it was removed.
- `grep -rn "95octane\|virajp\|claude-plugins" .` inside the pack is empty.
- `mise run plugins:inventory --check` is expected to be red until the
  orchestrator regenerates; say so, do not run the generator.

## Guardrails

- Do not edit any bundle (U2's), any asset, `site/` (read-only specimen), the
  Effect or TypeScript packs, or any Cloudflare pack (U12's).
- Dependencies get no reference (framework ruling): no `@astrojs/react`, no
  Tailwind, no pagefind reference. Name a shape; cite a package only as a fact.
  React Router is cited inside `csr.md` as the CSR shape's router, not given a
  reference of its own.
- Do not decide the UI kit or the deploy target.
- `plugins/**/*.md` is not dprint-formatted; match the surrounding fold width by
  hand. `cat` is aliased to `bat` — Write/Edit only. Strict-YAML frontmatter: a
  malformed one drops the skill silently.

## Commit

`feat(stackgen): add the astro framework pack — four rendering modes on two output values, and the build-output contract as a named fact`
— written by the orchestrator after the wave gate, not by the unit.
