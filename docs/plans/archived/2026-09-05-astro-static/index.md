---
type: repo-plan
title: Astro on the project axis — one framework pack, four rendering modes,
  four bundles, and a Workers SSR deploy; plus the /vwf:init defects from the
  first real run
requires: [ docs/plans/2026-09-05-cloudflare-workers-static ]
---

# Plan — Astro on the project axis, Workers SSR, and the `/vwf:init` defects from the first real run (2026-09-05, amended 2026-09-06)

## Status

**COMPLETE** — 2026-09-06. Ran in worktree `.worktrees/2026-09-05-astro-static`
on branch `2026-09-05-astro-static`, cut from `develop` at `f6df9ed8`. Commits:
`a38dbb1a` (wave 1, nine units), `59e34730` (the plan folder at the wave-1
block), `5b3f12c2` (U7 and the gate follow-ups, after the user's ruling (a) —
the dprint editor fragment renames to `dprint-editor.jsonc`), `d9ecf382` (wave
2, docs), `49ef03d3` (wave 3, the bumps), plus the archiving commit. All twelve
units green; all fifteen orchestrator gates and the real-install verifier pass.
The first attempt's status read: *BLOCKED at wave 1 — U7 failed: orchestrator
gate 12 (the shim), second cause; U3, U4 skipped* — resumed the same day on the
user's ruling.

**APPROVED**

APPROVED 2026-09-05 by the user for the Astro half (two static bundles), after
the self-review. Amended 2026-09-06 twice at the user's direction: first with
the `/vwf:init` defects ("You can add the fixes to that itself"), then with the
Astro half re-planned for four rendering modes and a Workers SSR deploy ("Let's
complete the Astro stack properly"). Both amendments APPROVED 2026-09-06 by the
user, after the self-review.

## Consent

| Action                                       | Granted |
| -------------------------------------------- | ------- |
| Merge to `develop` and push on green run     | yes     |
| Stage locally (`plugins:local`) on green run | yes     |
| Release `vwf` publicly                       | minor   |
| Release `stackgen` publicly                  | minor   |
| Release installer publicly                   | none    |
| Release site publicly                        | patch   |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session.

The 2026-09-05 answer — no release for anything — is overtaken by the amendment:
`/vwf:init`'s behaviour changes, so users only see it through a tag. stackgen
`1.1.0` is staged but untagged, so the `1.2.0` tag ships the Workers Static
Assets pack too; site `1.1.3` is bumped and unreleased, so `1.1.4` ships both.
The stackgen minor carries one **renamed released slug**
(`typescript-astro-react` → `astro-ssr`, D6); the only pin in existence is the
user's own, and the release note says so.

## Goal

After this lands, the stack menu offers **four** project-axis bundles for
platform `site`, all pinning one real `framework/astro` pack and each carrying
React for islands: `Astro (SSG)`, `Astro (SSR)`, `Astro (Hybrid)` and
`Astro (CSR)`. The pack's doctrine carries all four as decisions over Astro's
two output values plus the adapter and the client directives, and states when
each is the answer. It states the build-output contract as a **named fact** in
its conventions: the build output is `./dist`, and a deploy pack may rely on it
— which is what the Workers packs' `assets.directory` cite. The deploy menu
gains `cloudflare-workers-ssr` — a Worker with a script — as the preferred
pairing for the two server-rendering bundles, redeeming the second half of the
Cloudflare reservation.

**And**, from the first amendment: a repo that `/vwf:init` shapes can, with no
hand repair, make its first commit, cut a worktree and land it through its own
merge tasks; every promise a payload makes about init is one init keeps; and the
editor and shell the repo is used from are set up by the same composition that
sets up everything else.

**Framing — Astro.** The greenfield `/vwf:init` → `/vwf:architecture` run on the
user's website repo (Astro, static, one page, no React) found that the only
`platforms: [site]` bundle is named "Astro (SSR)", with both framework
components `@generated`. The user first ruled that Astro has two modes; on
2026-09-06 widened it: "There are 4 types of projects that can be created using
Astro" — SSG, SSR, Hybrid, CSR — "create 4 bundles or packs to support each",
display names `Astro (SSG)`, `Astro (SSR)`, `Astro (Hybrid)`, `Astro (CSR)`,
"drop `Typescript` since that's implicitly used for Astro projects". The
research (Context7, 2026-09-06) found that Astro has two `output` values, that
`hybrid` was removed in Astro 5 and merged into `static`, and that CSR is a
shape (a `client:only` app in a static shell), not a mode — so four bundles on
one pack, each pinning a mode, on the precedent `typescript-effect-cli` /
`typescript-parseargs-cli` already set.

**Framing — the init defects.** The same first real run (`virajp.dev`,
2026-09-05) reported five defects, parked twice. The 2026-09-06 survey found
nine, corrected two of the five as reported, and measured the causes rather than
taking them on report. The user's rulings widened the fix into a git pass init
never had, a composed editor setup, and a re-run doctrine — and a scan of every
repo under `~/Projects/github.com/virajp/` and the `95octane` reference found
what init ships that the user's real repos carry by hand. The user's framing:
"while I am open-sourcing this for the world, it's specifically designed for my
way of using and setting up projects, that's why it's `opinionated`."

**Not a reversal (Astro).**
`docs/memory/decisions/2026-08-17-north-star-two-plugins.md:14-15` rules that a
closed stack menu must not force the maintainer's choices
(Effect/Hono/Astro/Refine) on users. This plan adds one cited pack beside the
generator's open entry and removes nothing; the `generate:` block still ships on
every menu answer.

**Four reversals**, each recorded by the docs unit:

1. **The charter fence reopens for editor settings.** `output-tree.md:202-214`
   keeps editor settings outside every pack. Narrowed: whole editor files stay
   outside; per-pack fragments the orchestrator composes come inside; and
   `dprint.json` joins the root allowlist as an `extends` shim.
2. **Init now touches git history.** `new-repo.md:20` — "Nothing else in this
   pipeline touches git history" — becomes a git pass with two consents.
3. **The slug reason** written on 2026-09-05 into `materializer.md:57-68` is
   replaced by the measured mechanism.
4. **The Cloudflare reservation narrows a second time.** On 2026-09-05 a Worker
   *with* a script was reserved by name; `cloud-service/workers-ssr` redeems it.
   Pages, R2, D1, KV, Durable Objects, Queues, Images and Stream stay reserved.

**This plan stands on the Workers plan.** The static bundles name
`cloudflare-workers-static` as the deploy pairing they were built for, the dist
fact is what that pack's `./dist` cites, the new SSR pack is that pack's
sibling, and the manual describes them together. `requires:` is set accordingly,
and that plan is `COMPLETE`.

## Facts the survey established

**This repo.**

- stackgen is `1.1.0` (staged locally as `1.1.0+1`, untagged); vwf `19.12.0`;
  site `1.1.3` (unreleased). `develop` is at `c75bc8e3`.
- `stacks/bundles/typescript-astro-react.md:1-16`:
  `name: TypeScript · Astro (SSR) · React`, `axis: project`,
  `kind: language-bundle`, `platforms: [site]`, components
  `language/typescript@0.1.0`, `package-manager/pnpm@0.1.0`,
  `toolchain-gate/tsconfig@0.1.0`, `toolchain-gate/eslint@0.1.0`,
  `framework/astro@generated`, `framework/react@generated`,
  `framework/effect@0.1.0`. Body (`:19-58`) decides `output: "server"` on
  `@astrojs/node` standalone, React islands via `@astrojs/react`,
  shadcn/Radix/Tailwind, a shared Effect `AppLayer`, server-side datastore reads
  through the common package's layers, same-origin SSR proxy endpoints,
  per-route cache middleware, OTel via Effect, Vitest + jsdom at 100 % on a
  scoped include. **It shipped in `stackgen-v1.0.0`, and it is pinned today in
  95octane's `.config/vwf.yaml:1034` as `project/site/typescript-astro-react`**
  — the only pin that exists.
- SSR there is prose, not a field: the bundle frontmatter schema
  (`assets/pack-format.md:144-152`) is `axis`, `kind`, `platforms`, `artifact`
  (deploy only), `unconditional`, `components`. No `output`/`ssg`/`static`
  vocabulary exists in `assets/` or `bundles/`.
- `stacks/framework/` contains exactly one directory, `effect/`. Every other
  `framework/*` ref in the tree is `@generated`: `astro`, `react`, `hono`,
  `temporal`, `refine`, `pulumi`.
- Every `axis: project` bundle and its platforms: `typescript-effect`
  `[packages]`; `typescript-effect-cli` `[cli]`; `typescript-parseargs-cli`
  `[cli]` (no framework); `typescript-effect-hono` `[service]`;
  `typescript-effect-temporal` `[worker]`; `typescript-hono-refine`
  `[service, webapp]`; `typescript-astro-react` `[site]`; `typescript-pulumi`
  `[iac]`; `dart-flutter` `[mobile, tablet, desktop, webapp]` (kind
  `app-framework`); `claude-code-plugin` `[plugin]`.
- Every `axis: deploy` bundle and its artifact: `cloudflare-workers-static`
  (`static-assets`), `cloudflare-zero-trust` (`n/a`), `container-generic`,
  `gcp-cloud-run`, `gcp-gke` (all `container-image`), `npm-package`
  (`npm-package`). None is unconditional. **No deploy exists for a Worker with a
  script.**
- The `language-bundle` kind (`assets/kinds.md:49-135`): composition is a
  `language` plus its `package-manager`, `framework` and `toolchain-gate`
  components; framework components are optional (topic 2 is conditional on
  detection, `:66-67`). Twelve-topic bar at `:79-113`; topic 2 is **one artifact
  per `framework` component** — a framework pack owes exactly one
  Framework-doctrine reference. The framework ruling (`:120-135`):
  selection-neutral, usage-opinionated, every opinion cited in precedence
  detection → the framework's own docs → catalog; **dependencies get no
  reference**; one seam per framework, no per-pair integration references.
- The model pack, `stacks/framework/effect/`: `pack.yaml` (`name`, `summary`,
  `version: 0.1.0`, `type: framework`, `category: meta-framework`,
  `kind: language-bundle`, `axis: project`, `harness: n/a`), `conventions.md`
  (prose, copied verbatim into the template payload), `skills/effect/SKILL.md`
  (frontmatter `name`, `version`, `category: development`, `description`,
  `license`, **`user-invocable: false`**, `allowed-tools`, **`paths:`** globs)
  and `skills/effect/references/{effect,effect-runtime,testing}.md`. No
  `config/` tier. Framework categories (`taxonomy.md:93`): `meta-framework` /
  `ui-library` / `cli` / `iac` / `workflow-sdk`.
- The model deploy pack, `stacks/cloud-service/workers-static-assets/` (landed
  2026-09-05): `pack.yaml` (`type: cloud-service`, `category: static-hosting`,
  `kind: cloud-provider`, `axis: deploy`, `artifact: static-assets`, `harness:`
  with `local_stack`, `pipeline`, `health`), `conventions.md`,
  `config/wrangler.jsonc` (no `main`; `name` and `routes` as marked positions;
  `assets.directory: ./dist`, `not_found_handling: "404-page"`),
  `config/.config/mise/tasks/p/_project/deploy` (credential guard on
  `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`, `--dry-run` exempt, build via
  `p:<id>:build` when present, `pnpm exec wrangler` with an `npx` fallback),
  `skills/workers-static-assets/SKILL.md` + eight references. The `compute`
  category carries the three-topic deploy-target extension (`kinds.md:193-194`,
  `:252-259`); `cloud-run/pack.yaml` is the `compute` specimen for `category`,
  `capability` and `harness`.
- The Cloudflare reservation after 2026-09-05:
  `cloud-provider/cloudflare/conventions.md:5-16` and `cloudflare-zero-trust.md`
  reserve "a Worker script fronting static assets — server-side rendering on
  Workers — along with Pages, R2, D1, KV, Durable Objects, Queues, Images and
  Stream"; the provider skill's coverage fence, `cost-doctrine.md`,
  `local-development-map.md`, `zero-trust-access/conventions.md` and its
  `pick-and-trade.md` were all reworded that day to name two services. The
  static pack's `wrangler.jsonc` header says "Adding `main` here turns this into
  a different stack".
- `@generated` at pin time (`pack-format.md:172-177`) is a first-class outcome:
  covered components land verbatim, uncovered ones run the generation pipeline
  on first fetch, and the lockfile records which was which.
- `platforms: [site]` is **vwf's** vocabulary
  (`plugins/vwf/assets/standard-flows.md:130`, "Browser-delivered content
  surface", split from `web` at format 22); a template's `platforms:` must cover
  every platform the project declares (`stack-adapter.md:182`). A project-axis
  bundle **cannot** name a deploy bundle in frontmatter — `artifact:` is
  deploy-only and the axes are pinned independently (`stack-adapter.md:87`,
  `vwf-config.md:77,371`). Body prose may name a pairing, as
  `cloudflare-zero-trust.md:26-32` does.
- The build-output ↔ `assets.directory` seam is claimed by neither bar: the
  deploy-target bar puts "what gets built, from what" on the deploy side
  (`kinds.md:876-880`) while fencing that kind off from the language's build
  commands (`:854-856`); no project-axis bundle emits a build-directory fact.
- Gates. `scripts/src/check.ts` asserts nothing on `platforms:` or on
  `@generated` refs; the only rules reaching a bundle are the retired-terms
  prose scan (`:983`), whose live traps for a site bundle are a backticked `web`
  on a line that also carries another platform token or the word "token"
  (`:1091-1095`) and the literal `stacks/project/` (`:1101`). A doctrine-only
  framework pack ships no `config/` tier and trips rule 11 nowhere.
  `scripts/src/inventory.ts:146-176` requires each bundle's `name`, `kind`,
  `axis` and a non-empty `components:`; `:78-88` rejects a `kind` no `kinds.md`
  heading defines; it counts packs by `type` (`:120-144`) and bundles by `kind`
  (`:183-200`), stores component refs verbatim (`:161-165`), and **never
  resolves a ref to a directory or checks its version** — a ref naming a version
  the pack does not declare is caught by nothing. A new pack or bundle makes
  `stacks/inventory.md` stale.
- This repo's own `site/` is the static specimen: `site/astro.config.ts` has
  `output: "static"` (`:11`), `site: "https://claude-plugins.virajp.dev"` (`:9`
  — what `@astrojs/sitemap` and canonicals derive from; without it a static site
  silently emits no sitemap), `trailingSlash: "always"` (`:13`, because
  Cloudflare's default `html_handling` redirects the bare form),
  `build.inlineStylesheets: "never"` (`:17`) and
  `vite.build.assetsInlineLimit: 0` (`:23`) — both forced by a CSP with no
  inline allowance — `integrations: [sitemap()]` (`:27`),
  `markdown.remarkPlugins: [remarkDocsLinks]` (`:29-31`, a local plugin).
  `site/package.json`: `astro ^6.4.8`, `@astrojs/sitemap`, `@astrojs/check`,
  `pagefind`, `wrangler ^4.129.0`, **no React**. Tasks in
  `.config/mise/tasks/site/`: `build` = `astro build` then
  `pagefind --site dist`; `dev` = `astro dev`; `check` = `astro check` →
  `site:build` → the link checker; all `#MISE dir="{{ config_root }}/site"` via
  `pnpm exec`.
- `plugins/**/*.md` is not dprint-formatted (match fold width by hand);
  `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `site/src/content/docs/**` and
  `docs/plans/**` are. `cat` is aliased to `bat`; write with Write/Edit.
  `plugins/*/stacks/*/*/config/` is payload, excluded from this repo's dprint.

**`/vwf:init` and the packs — the nine defects, as measured (2026-09-06).**

1. **No slugification exists anywhere.** `new-repo.md:91` (repo's own name),
   `task-library.md:373-379`, and the registry field is "free text (short
   identifier)" (`architecture/SKILL.md:155`). The id feeds three surfaces:
   member flags (`setup/all:8-17`), `setup-<id>` aliases
   (`mise.dev.toml:44-48`), and `p/<id>/_default`, which init authors rather
   than copies (`new-repo.md:119-137`). **Measured on mise 2026.9.1:** a
   directory `tasks/p/virajp.dev/` holding `deploy` lists as
   `p:virajp.dev:deploy`; the same directory holding `_default` lists as
   `p:virajp` — `_default` collapses into its parent, the parent becomes the
   task's last segment, and mise strips what looks like an extension from the
   last segment. The reason written into `materializer.md:57-68` on 2026-09-05
   ("mise reads `p/virajp.dev/deploy` as a task with an extension") is false as
   written. The live `virajp.dev` repo never hit it: commit `a85b7a6` wrote
   `p/virajp-dev/` already hyphenated by hand, and nothing records that.
2. **A `main`-only repo cannot merge.** `_scripts/merge:88-243` holds every
   predicate; `code:merge:develop` passes them all, runs the whole-tree hook
   pass (`:36-80`), hops to the main worktree (`:175-183`), and dies at
   `git checkout develop` (`:186-190`) with no restore. `code:merge:main` dies
   at `:101-106`. Untracked files are a **hard** refusal checked before
   uncommitted ones (`:141-147`; `_scripts/checks:22-24`).
3. **Init makes no commit at all** — `new-repo.md:20`. The shipped
   `no-commit-to-branch --branch main` (pre-commit payload `:120-124`, no
   `stages:`, inheriting `default_stages: [pre-commit]` at `:25`) blocks
   *whoever* makes the first commit. Precedent for a hook that would fail a
   young repo's first commit: `check-hooks-apply` and `check-useless-excludes`
   ship at `stages: [manual]` (`:197-219`; `conventions.md:70-79`;
   `skills/pre-commit/SKILL.md:71-80`).
4. **`mise.dev.lock`, measured.** `mise install` (run by `setup/worktree:21-22`)
   writes one lockfile per config declaring tools, named after the stem; the
   base `[tools]` is empty (`mise.toml:73-84`) and `mise.dev.toml:15-30` has
   nine, so exactly `.config/mise.dev.lock` appears. The hygiene `.gitignore`
   (`:31-38`) ignores `mise.local.lock` only. Every pack doc names `mise.lock`
   and says it is committed (`mise.toml:40-43`, `mise.ci.toml:9`,
   `conventions.md:37`, `skills/mise/SKILL.md:88,103-104`,
   `config-files.md:52-54`); the five-file table (`config-files.md:13-35`) has
   no lockfile row. The base `mise.toml` sets `lockfile = true`. In `virajp.dev`
   the file is tracked.
5. **Two unbacked promises**, both in the pre-commit gate's payload:
   `git-conventional-commits.yaml:26-32` says init fills `commitScopes` from the
   project registry; `:73-79` says init fills the forge links from the remote.
   Init implements neither (no mention under `plugins/vwf/skills/init/`), and
   the registry is written after init — `docs/blueprint/registry.yaml` by
   `/vwf:architecture`, `.config/vwf.yaml` by `/vwf:setup`
   (`init/SKILL.md:84-85`).
6. **`git branch develop` off an empty `main` is impossible** —
   `new-repo.md:14-15` runs before anything is written and nothing commits
   after, so HEAD is unborn.
7. **§7's first preference is dead on the new path** — it prefers registry ids
   from `.config/vwf.yaml`, which exists only after `/vwf:setup`. A re-run after
   setup resolves different ids and `existing-repo.md:115-118` classifies the
   old groups as renames, contradicting the idempotence claim at `:191-194`.
8. **Step 10 offers the bootstrap aggregator even when step 9 deferred it** for
   a missing toolchain binary (`new-repo.md:180-191`), with no guard.
9. **Step 6's fragment merge leaves `.config/pre-commit-config.yaml`
   modified-but-unstaged** (`new-repo.md:77-82`), which aborts every commit.

**The fragment mechanism.** The pre-commit pack ships a **whole** config
(`toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`); only
`toolchain-gate/{eslint,ruff}` ship `pre-commit.d/*.yaml` fragments. The
materializer copies fragments verbatim (`materializer.md:87`); merging is init's
alone (`fragments-and-sections.md:96-127`, `# >>> pre-commit.d/<name>.yaml`
markers). A fragment is additive only — it cannot change a base hook's `args` or
`stages` (rule 11 asserts `repos:` at `check.ts:257`).

**Gates.** No gate today covers a task-group directory mise would mis-parse, a
payload hook contradicting the bootstrap, or a config referencing a value
nothing fills. Rule 11 (`check.ts:343-420`) asserts exec bit and shebang on
tasks and hooks, the `config/` root against the allowlist (`:301`), and
`pre-commit.d/*.yaml` parsing with `repos:`. **The pre-commit pack's whole
config is parsed by no rule.** `plugins.yml:52-108` runs the same lines as
pre-commit plus the tag check. Rules reaching `/vwf:init` (vwf prose): 4, 6, 7,
10 (technology-free), 12. This repo's own `.config/pre-commit-config.yaml` and
`.config/git-conventional-commits.yaml` are **independently authored**, not
copies — a payload fix does not propagate and is not mirrored by this plan.

**Docs.** `new-repo.md:13-17` is the only statement of the branch rule in the
repo; `site/src/content/docs/plugins/vwf.md:770-847` describes init end-to-end
and never mentions branches, so the fix adds a passage. Adjacent and going
inconsistent: `_scripts/merge:10-19`, `task-library.md:346-356`,
`site/src/content/docs/plugins/stackgen.md:429-436,444,501-510`,
`.claude/docs/ci-and-releases.md:30-33`. Rule 11's allowlist prose is
`.claude/skills/plugin-authoring/references/checks.md`. **No shipped skill or
payload instructs a heredoc write**; the only `cat > … <<EOF` in the tree is
`execute-plan/references/wave-review.md:31`, telling a reviewer to check for its
residue.

**The user's repos (nine under `virajp/`, plus `95octane` base + three
members).** Carried by hand and not laid down by init: `.vscode/settings.json`
(4 virajp repos + all of 95octane; byte-identical across two; ~80–180 keys —
`explorer.fileNesting.patterns`, `files/search/watcher.exclude`, dprint as
default formatter, `formatOnSave`, even-better-toml, eslint, `js/ts.*`,
todo-tree) and `.vscode/extensions.json` (identical 19-extension list);
Claude-launch aliases `cc/cco/ccf/cch/ccs` in two spellings (the full command,
or `cc = "dcc --name '<repo>'"` wrapping a global family) with the repo name as
the only varying token, and `--remote-control '<repo>'` in 95octane;
`[settings] all_compile = false` (3 + all 95octane), `task.timings = true`,
`task.disable_spec_from_run_scripts = true` (95octane backend/frontend);
`.graphifyignore` + a `graphify-out/` ignore section tracking `GRAPH_REPORT.md`
(2 + all 95octane); `CONTRIBUTING.md` and `.github/ISSUE_TEMPLATE/` (1);
`.npmrc` `ignore-scripts=true` `fund=false` and `npx = "pnpm dlx"` (95octane
backend/frontend); `.config/linter.yaml` for `@askviraj/linter`, which the
eslint gate invokes but ships no config for (all 95octane + `macos-setup`);
`code:count` (3 + 95octane). The baseline items no repo carries — `SECURITY.md`
(0 of 9), a licence, `.editorconfig`, `renovate.json`, `mise.test.toml`,
`setup:external`, `setup:secrets`, `grype.yaml` — are the standard the older
repos have not caught up to (D35). Three older repos keep `dprint.json` at the
root; only `virajp.dev` has `.config/dprint.json`.

**Tool facts (Context7, 2026-09-06).**

- Astro (`/withastro/docs`): `output` is `'static'` (default — every page
  prerendered; a route exporting `prerender = false` renders on demand and then
  needs an adapter) or `'server'` (every page on demand; `prerender =
  true`
  opts a route out). **`output: 'hybrid'` was removed in Astro 5** and merged
  into `'static'`. `outDir` defaults to `./dist`. `client:only="react"` skips
  server rendering and runs a component entirely on the client; the docs' own
  "migrate from Create React App" guide uses it to host a whole React app.
  `<ClientRouter />` from `astro:transitions` is view transitions between
  prerendered pages, not SPA routing. `@astrojs/node` and `@astrojs/cloudflare`
  are the adapters for a Node target and for Workers; neither is required for a
  purely static site; **Astro 6 requires `@astrojs/cloudflare` v13**, whose
  `main` moved from a built file path to the unified entrypoint
  `@astrojs/cloudflare/entrypoints/server`.
- Cloudflare Workers (`/websites/developers_cloudflare_workers`): a Worker with
  a script names `main`, `assets.directory` and `assets.binding: "ASSETS"` (the
  script fetches assets through the binding); `run_worker_first` invokes the
  script before matching assets; a request no asset matches falls through to the
  script; `compatibility_flags: ["nodejs_compat"]` is what the Astro adapter
  needs; the Astro SSR guide's config is exactly `main` + `nodejs_compat`
  - `assets` with a binding; a static-only site needs no `main`.
- React Router (`/websites/reactrouter`): three modes — **Declarative**
  (`<BrowserRouter>`, the simplest; routes do not participate in loaders,
  actions or code splitting), **Data** (`createBrowserRouter` +
  `RouterProvider`; loaders and actions, `clientLoader`/`clientAction` in SPA
  use, you keep your own build), **Framework** (owns the Vite build; the typegen
  `.react-router/types/` lives here only). Library modes: params are strings;
  `href()` is typed. `useSearchParams` wraps `URLSearchParams`.
- TanStack Router (`/tanstack/router`): 100 % inferred types for params,
  validated search params (zod/valibot), loader data; built-in loaders with SWR
  caching and prefetching; file-based routing via `@tanstack/router-plugin/vite`
  placed before the React plugin, generating `routeTree.gen.ts`; code-based
  routing needs no plugin; its docs ship a migration guide *from* React Router.
- dprint (`/websites/dprint_dev`): config discovery is root-only —
  `dprint.json`, `.dprint.json`, `dprint.jsonc`, `.dprint.jsonc` — with
  `--config` the CLI's only override; `extends` accepts a relative local path;
  `${configDir}` and `${originConfigDir}` are the two config variables.
- VS Code (`/microsoft/vscode-docs`): workspace `settings.json` is JSONC;
  `explorer.fileNesting.patterns` maps a parent to a comma-list of children with
  `$(capture)`, `$(basename)`, `$(extname)`, `$(dirname)`;
  `.vscode/extensions.json` recommendations only **prompt**, are per-workspace,
  and nothing merges a common set into them; per-workspace enablement exists
  only in the UI; `code --profile "<name>"` creates the profile if absent.
- mise (`/jdx/mise`): `[env]` from a project config is applied to an activated
  shell on `cd` in and removed on `cd` out; `[shell_alias]` entries are set
  dynamically per directory and are ordinary shell aliases — `$VAR` in the body
  expands at invocation; global-config aliases apply everywhere.

## Assumed decisions — confirm or override at review

User rulings are quoted; rows marked *(assumed)* were made by the planner and
are the review surface. D1–D14 are the Astro half (re-ruled 2026-09-06); D15–D37
the init amendment; D38–D41 the four-mode and Workers SSR additions.

| #  | Decision                       | Ruling                                                                                                                                                                                                                                                                                                                                                                                                               | Rejected                                                                                   | Unit       |
| -- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| 1  | Shape                          | Four sibling bundles on one pack, each pinning a mode — the frontmatter has no output-mode key, Astro itself has only two `output` values, and `typescript-effect-cli` / `typescript-parseargs-cli` is the precedent.                                                                                                                                                                                                | a mode field; a per-project setting; one bundle per `output` value                         | U2         |
| 2  | Pack                           | "Ship a real framework/astro pack": the second framework pack in the tree, redeeming `framework/astro@generated`.                                                                                                                                                                                                                                                                                                    | keep `@generated`; fold `framework/react` in too                                           | U1, U2     |
| 3  | Modes                          | "There are 4 types of projects that can be created using Astro" — SSG (`static`, no adapter), Hybrid (`static` + adapter + per-route `prerender = false`), SSR (`server` + adapter), CSR (`static`, one shell page + catch-all, the app a `client:only` island). One pack carries all four doctrines; `hybrid` is stated as no longer a config value.                                                                | two packs; two bundles                                                                     | U1, U2     |
| 4  | React                          | "React in all four": every bundle carries `framework/react@generated`; a page with no island ships no JavaScript, and the SSG doctrine says so.                                                                                                                                                                                                                                                                      | React only where the mode needs it; with/without pairs (six bundles)                       | U2         |
| 5  | dist seam                      | "Framework pack conventions, as a named fact": `framework/astro`'s `conventions.md` and its Framework-doctrine reference state, under a fixed heading, that the build output is `./dist` (Astro's `outDir` default) and a deploy pack may rely on it; both Workers packs' `./dist` cite that heading.                                                                                                                | a `build_output:` payload field (reaches into vwf); leave it with the deploy pack          | U1         |
| 6  | Slugs and names                | `astro-ssg`, `astro-ssr`, `astro-hybrid`, `astro-csr`; display names `Astro (SSG)`, `Astro (SSR)`, `Astro (Hybrid)`, `Astro (CSR)` — "drop `Typescript` since that's implicitly used for Astro projects". `typescript-astro-react.md` is `git mv`'d to `astro-ssr.md`; the one live pin (95octane) is re-pointed in its own session, parked.                                                                         | keep `typescript-astro-react` as the SSR slug; an alias stub                               | U2         |
| 7  | Composition *(assumed)*        | Every bundle: `language/typescript@0.1.0`, `package-manager/pnpm@0.1.0`, `toolchain-gate/tsconfig@0.1.0`, `toolchain-gate/eslint@0.1.0`, `framework/astro@0.1.0`, `framework/react@generated`. SSR and Hybrid add `framework/effect@0.1.0`.                                                                                                                                                                          | Effect in SSG or CSR                                                                       | U2         |
| 8  | Category and scope *(assumed)* | `category: meta-framework` (Astro owns the build, as Effect owns composition); the skill is `user-invocable: false` and paths-scoped to `**/*.astro`, `**/astro.config.*` and `**/src/content/**`.                                                                                                                                                                                                                   | `ui-library`; model-invocable                                                              | U1         |
| 9  | Specimen *(assumed)*           | This repo's `site/` is the cited static specimen for the four config facts: `output`, `trailingSlash: "always"` and why, the CSP-forced `inlineStylesheets: "never"` + `assetsInlineLimit: 0`, and `site:` for sitemap and canonicals. Cited as facts and reasons, never as paths or the domain.                                                                                                                     | uncited doctrine                                                                           | U1         |
| 10 | Testing *(assumed)*            | SSG: Vitest, node for `lib/` and endpoints, jsdom + Testing Library only for islands a repo writes. Hybrid and SSR: the SSR bundle's Vitest + jsdom + Testing Library plus endpoint tests. CSR: jsdom + Testing Library, route tests through React Router's `createMemoryRouter`. The SSR bundle's 100 %-coverage rule is **not** copied; each states its scoped include.                                            | the 100 % rule verbatim                                                                    | U1, U2     |
| 11 | SSR body *(assumed)*           | The SSR bundle's body keeps its decisions but **cites** the pack for what Astro is and how the modes work; "SSR is not a published API" stays; the adapter sentence follows the pairing.                                                                                                                                                                                                                             | leaving the body untouched                                                                 | U2         |
| 12 | Deploy pairings                | SSG and CSR name `cloudflare-workers-static` (CSR flips the host's not-found handling to single-page-application mode). SSR and Hybrid: "Pair with all supported deployments, Cloudflare Workers as preferred option" — `cloudflare-workers-ssr` first, then `gcp-cloud-run`, `gcp-gke`, `container-generic`; the adapter follows the pairing. Frontmatter names no deploy slug.                                     | container pairings only; Workers SSR named but not built                                   | U2, U12    |
| 13 | References *(assumed)*         | `skills/astro/references/`: `framework-doctrine.md` (topic 2, the one owed artifact — the four-mode decision), `ssg.md`, `ssr.md`, `hybrid.md`, `csr.md`, `content-and-routing.md`, `build-output.md` (the named dist fact), `testing.md`. Eight.                                                                                                                                                                    | a single reference; per-integration references; six with static/server only                | U1         |
| 14 | Release (2026-09-05)           | "No release yet" for stackgen; "No site release." — **overtaken** by the consent block above on 2026-09-06.                                                                                                                                                                                                                                                                                                          | minor; patch                                                                               | U4         |
| 15 | Slug                           | One asset `plugins/stackgen/assets/ids.md`: lowercase; runs outside `[a-z0-9]` → one `-`; trimmed. Reason: mise strips an extension from a task's **last** segment and `_default` makes the directory that segment; plus the alias and flag grammars. Init §7 and the materializer cite it.                                                                                                                          | define in init; dots-only                                                                  | U5, U6, U9 |
| 16 | Branches                       | "If the git is empty, start with `develop` and NOT `main`. Once a commit is done, add `main`." Existing repo: create `develop` from `main` where missing. "No matter which is default branch, work must flow from feature branches/worktree to develop to main."                                                                                                                                                     | main first; leave an existing repo's branches alone                                        | U9         |
| 17 | Forge default                  | "Ask user which branch must be default branch in remote … with `develop` being default selection." Set it when it can, print it when it can't: a task `setup:default-branch <branch>` uses the forge CLI it finds (`gh`, `glab`), else prints the command; init runs the task and names no forge.                                                                                                                    | print only; record it in the repo                                                          | U6, U9     |
| 18 | Commits                        | "At the end of `init`, ask user to commit (local commit, push, etc)": init commits on consent — commit / commit and push / leave — with a fixed `ops:` message; push is the second consent. "When there's a change in `.config/pre-commit-config.yaml`, it must be committed independently (along with it's dependencies like `.config/git-conventional-commits.yaml`)" — that commit goes first, alone.             | init stages and prints; never pushes                                                       | U9         |
| 19 | Branch guard                   | `no-commit-to-branch --branch main` ships unchanged at the commit stage; the new-repo first commit precedes hook wiring by construction, which is the whole fix for defect 3.                                                                                                                                                                                                                                        | guard `develop` too; `stages: [manual]`                                                    | U7, U9     |
| 20 | Lockfile                       | "Use lock file is good for reproducability, let's start using it for all projects, specifically brownfield projects": `mise.<env>.lock` files are tracked, one per config declaring tools; `.gitignore` unchanged; every "`mise.lock`" claim corrected to the per-config rule.                                                                                                                                       | ignore it                                                                                  | U6         |
| 21 | Merge tasks                    | `_scripts/merge` gains a predicate — the destination branch must exist locally — before the hook pass, with a message naming the branch model.                                                                                                                                                                                                                                                                       | leave the checkout failure                                                                 | U6         |
| 22 | Unbacked promises              | "In greenfield it will be impossible for `init` to fill this fully but it can still have commit scopes when it's re-run at later stages": the `commitScopes` and forge-link comments say init fills them on a re-run once the registry / remote exist; init gains that step.                                                                                                                                         | drop the claims                                                                            | U7, U9     |
| 23 | Re-run                         | "`init` must be run at regular interval to keep everything in sync": doctrine names the moments (after architecture, after a pack bump, fresh clone), and `/vwf:doctor` gains a finding — adapter lockfile vs installed packs, registry ids vs `commitScopes` and `p:<id>` groups, missing `develop`/`main` — that says "run /vwf:init".                                                                             | offer from architecture only; doctrine only                                                | U9, U10    |
| 24 | Id source changed              | A re-run after architecture renames `p/<repo>/` → `p/<registry-id>/`; the report says "id source changed", not "a pack moved"; idempotence is claimed per id source.                                                                                                                                                                                                                                                 | —                                                                                          | U9         |
| 25 | Step 10 guard                  | The bootstrap offer is conditional on step 9 having run.                                                                                                                                                                                                                                                                                                                                                             | —                                                                                          | U9         |
| 26 | Editor shape                   | "Composed from per-pack fragments": each pack ships `config/.config/vscode.d/<pack>.jsonc` (`settings`, `nesting`, `extensions`); init merges into the two editor files between one marked block placed first, user keys after it winning. Init never names the editor — the convention names the target.                                                                                                            | one hygiene payload; a profile for the common set                                          | U5, U6–U9  |
| 27 | Nesting                        | "all ignore files are ideally grouped under gitignore": parent `.gitignore` collects every ignore file any pack ships; each pack nests its own files; the hygiene fragment carries the editor baseline.                                                                                                                                                                                                              | —                                                                                          | U6, U7, U8 |
| 28 | dprint shim                    | dprint discovery is root-only and cannot be pointed at `.config/`; the gate ships root `dprint.json` = `{ "extends": ".config/dprint.json" }`; the existing-repo path moves a real root `dprint.json` into `.config/` and leaves the shim. The unit verifies `includes` resolve through `extends` on the real CLI.                                                                                                   | a symlink                                                                                  | U7, U9     |
| 29 | Extension install              | "Per-repo profile generated is better, however it must also clean up stale extensions": `setup:vscode` in the mise pack — `code --profile "$REPO_NAME"`, install the merged list, **prune** what is installed there and not listed; wired into `setup:all`; silent without `code`; prints the one-time share-with-Default step when the profile was empty.                                                           | global install; recommendations only                                                       | U6         |
| 30 | Aliases                        | "use repo-specific env variables to change the name value": the pack ships `[env] REPO_NAME = "<slug>"` as a marked position, literal, never derived (a worktree's config root is the branch name); the `cc` family lives in the user's global config reading `$REPO_NAME`.                                                                                                                                          | full command shipped; `dcc` wrapper                                                        | U6, U9     |
| 31 | mise settings                  | `all_compile = false`, `task.timings = true`, `task.disable_spec_from_run_scripts = true`; the third verified against current mise before shipping.                                                                                                                                                                                                                                                                  | fish completions postinstall                                                               | U6         |
| 32 | Hygiene adds                   | `.graphifyignore`; a graphify `.gitignore` section (`graphify-out/*`, `!graphify-out/GRAPH_REPORT.md`); `CONTRIBUTING.md`; `.github/ISSUE_TEMPLATE/{bug,feature,config}`.                                                                                                                                                                                                                                            | `.config/claude-status.json`                                                               | U8         |
| 33 | Pack adds                      | eslint gate ships `.config/linter.yaml`; pnpm pack ships `.npmrc` (`ignore-scripts=true`, `fund=false`) and the alias `npx = "pnpm dlx"`; mise pack ships `code:count`.                                                                                                                                                                                                                                              | —                                                                                          | U6, U7, U8 |
| 34 | Vocabulary                     | "`setup:external` to setup external dependencies (using pitchfork or docker) and `setup:deps` are used to install internal dependencies": unchanged, restated where the groups are defined.                                                                                                                                                                                                                          | renaming `setup:external` to `setup:deps`                                                  | U6         |
| 35 | Unused baseline                | "They are the standard; the old repos are behind": nothing dropped; the re-run doctrine and the doctor finding are what bring them up.                                                                                                                                                                                                                                                                               | drop some                                                                                  | —          |
| 36 | Allowlist                      | Root allowlist gains `dprint.json`, `.npmrc`, `CONTRIBUTING.md`, `.graphifyignore`, and the directory `.github/` with `.github/workflows/` refused inside it.                                                                                                                                                                                                                                                        | —                                                                                          | U5, U11    |
| 37 | Pack versions *(assumed)*      | No existing pack `version:` moves in this plan; the plugin's minor carries the change. Bumping the mise, gate, hygiene and pnpm packs would force a ref change in every bundle that pins them — including the four Astro bundles U2 writes — and the sync lockfile diffs per file, not per version. New packs start at `0.1.0`.                                                                                      | per-pack minor bumps with every bundle ref updated                                         | U6, U7, U8 |
| 38 | Hybrid server                  | "Hybrid is SSR with prerender flipped": `astro-hybrid` pins `framework/effect@0.1.0` and cites the SSR bundle's server doctrine (AppLayer, layered reads, proxy endpoints, cache middleware) for its on-demand routes; same adapter; the two bodies differ in the default and in what to prerender.                                                                                                                  | Hybrid without Effect                                                                      | U1, U2     |
| 39 | CSR router                     | React Router in **Data** mode (`createBrowserRouter` + `RouterProvider`, `clientLoader`/`clientAction`) inside the `client:only="react"` island; a catch-all page so deep links serve the shell; TanStack Router named as the swap when the URL is the app's state, with its costs (a Vite plugin inside Astro's, a generated `routeTree.gen.ts`).                                                                   | TanStack Router file-based; TanStack code-based; React Router Declarative; no router named | U1, U2     |
| 40 | Workers SSR                    | "Pair with all supported deployments, Cloudflare Workers as preferred option" → this plan builds it: `cloud-service/workers-ssr` (a Worker with a script; `category: compute`; `wrangler.jsonc` with `main`, `nodejs_compat`, an assets binding; the same `p/_project/deploy` overlay) and the `cloudflare-workers-ssr` bundle. Workers-with-a-script leaves the reserved list; the other eight services stay on it. | name it preferred and ship it next plan; container pairings only                           | U12        |
| 41 | Artifact token *(assumed)*     | `artifact: worker-script` on the pack and the bundle — the vocabulary is open, and a script plus its assets is neither a container nor a directory. `main` is shipped as a marked position whose default is the Astro adapter's unified entrypoint, with the comment that another framework's adapter names another entry.                                                                                           | reuse `container-image`; reuse `static-assets`                                             | U12        |

## New dependencies

None. Context7's `/withastro/docs`, `/websites/developers_cloudflare_workers`,
`/websites/reactrouter` and `/tanstack/router` are the citation sources and are
already available; the packs pin nothing — a repo's manifest carries `astro`,
its adapter, its router and `wrangler`, and the manifest is fenced. The init
amendment adds no npm package and no mise tool: `code:count` uses `git
ls-files`
and `wc`; `setup:vscode` and `setup:default-branch` invoke `code`, `gh` and
`glab` when present and do nothing otherwise.

## Units

| Id  | Wave | Unit file                                        | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                    | Depends on | Status | Commit   |
| --- | ---- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1  | 1    | [01-astro-pack.md](01-astro-pack.md)             | `plugins/stackgen/stacks/framework/astro/**`                                                                                                                                                                                                                                                                                                                                                                                            | —          | green  | a38dbb1a |
| U2  | 1    | [02-astro-bundles.md](02-astro-bundles.md)       | `plugins/stackgen/stacks/bundles/typescript-astro-react.md` (→ `astro-ssr.md`), `plugins/stackgen/stacks/bundles/astro-ssg.md`, `plugins/stackgen/stacks/bundles/astro-hybrid.md`, `plugins/stackgen/stacks/bundles/astro-csr.md`                                                                                                                                                                                                       | —          | green  | a38dbb1a |
| U5  | 1    | [05-ids-and-fence.md](05-ids-and-fence.md)       | `plugins/stackgen/assets/**`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`                                                                                                                                                                                                                                                                                                                              | —          | green  | a38dbb1a |
| U6  | 1    | [06-mise-pack.md](06-mise-pack.md)               | `plugins/stackgen/stacks/toolchain-manager/mise/**`                                                                                                                                                                                                                                                                                                                                                                                     | —          | green  | a38dbb1a |
| U7  | 1    | [07-gate-packs.md](07-gate-packs.md)             | `plugins/stackgen/stacks/toolchain-gate/**`                                                                                                                                                                                                                                                                                                                                                                                             | —          | green  | 5b3f12c2 |
| U8  | 1    | [08-hygiene-and-pnpm.md](08-hygiene-and-pnpm.md) | `plugins/stackgen/stacks/repo-hygiene/**`, `plugins/stackgen/stacks/package-manager/pnpm/**`                                                                                                                                                                                                                                                                                                                                            | —          | green  | a38dbb1a |
| U9  | 1    | [09-init.md](09-init.md)                         | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                                                                                                                                            | —          | green  | a38dbb1a |
| U10 | 1    | [10-doctor.md](10-doctor.md)                     | `plugins/vwf/skills/doctor/**`                                                                                                                                                                                                                                                                                                                                                                                                          | —          | green  | a38dbb1a |
| U11 | 1    | [11-checker.md](11-checker.md)                   | `scripts/src/**`                                                                                                                                                                                                                                                                                                                                                                                                                        | —          | green  | a38dbb1a |
| U12 | 1    | [12-workers-ssr.md](12-workers-ssr.md)           | `plugins/stackgen/stacks/cloud-service/workers-ssr/**`, `plugins/stackgen/stacks/bundles/cloudflare-workers-ssr.md`, `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`, `plugins/stackgen/stacks/bundles/cloudflare-workers-static.md`, `plugins/stackgen/stacks/cloud-provider/cloudflare/**`, `plugins/stackgen/stacks/cloud-service/workers-static-assets/**`, `plugins/stackgen/stacks/cloud-service/zero-trust-access/**` | —          | green  | a38dbb1a |
| U3  | 2    | [03-docs.md](03-docs.md)                         | `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/plugin-authoring/**`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/*`                                                                                                                                                                                                         | all        | green  | d9ecf382 |
| U4  | 3    | [04-gates.md](04-gates.md)                       | `plugins/*/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                  | U3         | green  | 49ef03d3 |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. The ids are not contiguous by wave on purpose: U1–U4 are the
2026-09-05 units and keep their files; U5–U12 are the amendments.

## Shared-file rule

| File                                                                                                                                      | Why it collides                                                               | Owner                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `plugins/*/.claude-plugin/plugin.json`, `site/package.json`                                                                               | several units bumping one version is a lost update                            | U4 only                                                                    |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                 | generated; regenerating mid-wave races                                        | U4 only (see Waves for the inventory caveat)                               |
| `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/**`, `docs/memory/decisions/*` | n units editing one doc                                                       | U3 only                                                                    |
| `plugins/stackgen/stacks/framework/astro/pack.yaml`                                                                                       | U2's refs name the version U1 declares                                        | U1 only; U2 reads it, never edits it                                       |
| `plugins/stackgen/stacks/cloud-service/workers-ssr/pack.yaml`                                                                             | U12's bundle names the version U12's pack declares — same unit, no collision  | U12                                                                        |
| `plugins/stackgen/assets/ids.md`, the editor-fragment subsection of `pack-format.md`                                                      | U6–U9, U12 cite them by name; only one unit writes them                       | U5 only; the others cite by the names this plan fixes                      |
| `plugins/stackgen/stacks/bundles/cloudflare-*.md`                                                                                         | the reservation prose and the sibling cross-references                        | U12 only                                                                   |
| `plugins/stackgen/stacks/bundles/*.md` other than the four Astro and the three Cloudflare bundles                                         | pack versions do not move (D37), so no bundle ref changes                     | nobody                                                                     |
| `plugins/stackgen/stacks/cloud-service/workers-static-assets/**`                                                                          | the cross-references to the SSR sibling                                       | U12 only                                                                   |
| `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.gitignore`                                                                     | U6's lockfile ruling could tempt an edit; the lock is tracked, nothing to add | U8 only                                                                    |
| every existing pack's `pack.yaml` `version:`                                                                                              | D37                                                                           | nobody                                                                     |
| `plugins/stackgen/skills/stackgen-sync/SKILL.md`                                                                                          | restates composition order and the allowlist                                  | nobody this plan; a falsified passage is `DOCS FALSIFIED:` for U3 to route |

## Waves

- **Wave 1 — U1, U2, U5, U6, U7, U8, U9, U10, U11, U12.** Ten disjoint trees:
  the Astro pack; the four Astro bundles; the stackgen assets and the
  materializer; the mise pack; the gate packs; the hygiene and pnpm packs; init;
  doctor; the checker; the Workers SSR pack with the Cloudflare prose. U2's
  component refs name `framework/astro@0.1.0`, the version U1's `pack.yaml`
  declares; U2 reads that file and never edits it. U2's SSR and Hybrid bodies
  name `cloudflare-workers-ssr` by the slug this plan fixes; U12's bundle names
  `astro-ssr` and `astro-hybrid` the same way. U6–U9 and U12 cite
  `assets/ids.md` and the editor-fragment convention by the names this plan
  fixes, so they need nothing U5 writes first. As the previous runs established,
  this repo's repo-wide pre-commit hooks force wave 1 into **one commit**: the
  payload root files U7 and U8 add need U11's allowlist in the same tree, and
  the new inventory entries need the regenerated inventory.
- **Wave 2 — U3.** Docs and the five decision docs, from the `docs-reconciler`
  findings plus every `DOCS FALSIFIED:` line.
- **Wave 3 — U4.** Versions, generators, full gate, `target-verifier`.

**Every unit is a subagent** — the user's standing instruction for this plan,
and execute-plan's construction: wave 1 is ten concurrent `Agent` dispatches,
the wave review is a subagent, the docs reconciler and the real-install verifier
are subagents, and the orchestrator decides, gates and commits without reading a
unit's owned files or doing a unit's work inline.

**Inventory caveat.** This repo's pre-commit runs `plugins:inventory --check`,
and two new packs plus five new or renamed bundles make the generated inventory
stale, so no wave-1 commit can land until it is regenerated. The previous runs
resolved this by letting the orchestrator run `plugins:inventory` at the wave-1
commit; the same ruling applies. U4 re-runs it with the version bumps.

## Wave gate

`mise run plugins:marketplace --check`, `mise run plugins:inventory --check`,
`mise run plugins:check`, `mise run plugins:shellcheck`, `pnpm vitest run`,
`pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, `mise run site:check` from wave 2 on,
plus the wave review, plus every report read for `UNRESOLVED:`.

Plan-specific lines, Astro and Workers SSR:

- `grep -c "framework/astro@generated" plugins/stackgen/stacks/bundles/*.md`
  totals **0** after wave 1; `grep -l "framework/astro@0.1.0"` over the same
  glob returns exactly the four `astro-*.md` files, and
  `typescript-astro-react.md` no longer exists.
- `grep -n "^name:" plugins/stackgen/stacks/bundles/astro-*.md` shows exactly
  `Astro (SSG)`, `Astro (SSR)`, `Astro (Hybrid)`, `Astro (CSR)`; no `name:`
  under `bundles/astro-*.md` contains "TypeScript".
- `grep -n "platforms" -A1 plugins/stackgen/stacks/bundles/astro-*.md` shows
  `- site` under all four; `grep -n "unconditional"` over the same glob is
  empty.
- `grep -l "framework/effect@0.1.0" plugins/stackgen/stacks/bundles/astro-*.md`
  returns exactly `astro-ssr.md` and `astro-hybrid.md`.
- The four Astro bundles trip neither retired-terms trap: no backticked `web`
  beside another platform token, no literal `stacks/project/`.
- `plugins/stackgen/stacks/framework/astro/skills/astro/SKILL.md` parses as
  strict YAML frontmatter with `user-invocable: false` and a non-empty `paths:`
  list; its `references/` directory holds eight files.
- `grep -rn "not offered" plugins/stackgen/stacks/cloud-provider/cloudflare plugins/stackgen/stacks/bundles/cloudflare-*.md`
  — no hit's reserved list contains "Workers" as a bare word or "Worker script";
  Pages, R2, D1, KV, Durable Objects, Queues, Images and Stream are still on it.
- `grep -n "artifact: worker-script" plugins/stackgen/stacks/bundles/cloudflare-workers-ssr.md plugins/stackgen/stacks/cloud-service/workers-ssr/pack.yaml`
  hits both.

Plan-specific lines, the init amendment:

- `grep -rn "as a task with an extension" plugins/` returns nothing;
  `test -f plugins/stackgen/assets/ids.md`.
- `grep -rn "touches git history" plugins/vwf/skills/init/` returns nothing.
- `grep -rln "vscode.d" plugins/stackgen/assets/pack-format.md plugins/stackgen/stacks/*/*/config/.config/vscode.d plugins/vwf/skills/init/references/fragments-and-sections.md`
  hits the convention, at least four fragments, and the algorithm.
- Every file under `plugins/stackgen/stacks/*/*/config/.config/mise/tasks/**` is
  executable and starts with `#!/usr/bin/env bash`.
- `grep -rn "mise\.lock" plugins/stackgen/stacks/toolchain-manager/mise/` —
  every hit is a sentence stating the per-config rule.
- `grep -rn "REPO_NAME" plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml plugins/vwf/skills/init/references/new-repo.md`
  hits both.
- `mise run plugins:check` reports the new payload root files — `dprint.json`,
  `.npmrc`, `CONTRIBUTING.md`, `.graphifyignore`, `.github/ISSUE_TEMPLATE/*` —
  as **accepted**: the allowlist widening is what makes wave 1 pass.

## Gates the orchestrator keeps

**Astro**, after wave 1 and before wave 2 (project-axis packs ship no `config/`
tier, so no scratch materialization for them):

1. **The menu source.** `grep -l "^- site" plugins/stackgen/stacks/bundles/*.md`
   (or the equivalent YAML read) returns exactly **four** files, none carrying
   `unconditional:` — the menu will offer all four.
2. **Every component ref resolves.** For each `components:` line across the four
   Astro bundles and the new Cloudflare bundle, either the ref ends in
   `@generated` or `plugins/stackgen/stacks/<type>/<slug>/pack.yaml` exists
   **and** declares the named version. This is the check `inventory.ts` does not
   do (`:161-165`), so the orchestrator does it by hand; a mismatch is a wave-1
   finding for the bundle's unit (a wrong ref) or the pack's unit (a wrong
   version), not a GAP.
3. **The specimen facts are true.** The four D9 facts the pack cites grep true
   against `site/astro.config.ts`: `output: "static"`,
   `trailingSlash: "always"`, `inlineStylesheets: "never"`,
   `assetsInlineLimit: 0`.
4. **The dist fact is citable.**
   `grep -n "./dist" plugins/stackgen/stacks/framework/astro/conventions.md`
   hits a line under a fixed heading, and the same heading text appears in
   `skills/astro/references/build-output.md`.
5. **The pairings cross-reference.** `astro-ssr.md` and `astro-hybrid.md` name
   `cloudflare-workers-ssr` before any container pairing;
   `cloudflare-workers-ssr.md` names `astro-ssr` and `astro-hybrid`;
   `astro-ssg.md` and `astro-csr.md` name `cloudflare-workers-static`; the
   `hybrid` reference states the config value was removed in Astro 5.
6. `mise run plugins:check` and `mise run plugins:inventory --check` exit 0 from
   the worktree.

**The scratch materialization**, after wave 1 and before wave 2, in a temp git
repo whose directory is named `scratch.dev`:

7. Compose, in the documented order, the `config/` trees of
   `toolchain-manager/mise`, the four `toolchain-gate` packs of the `repo-gates`
   bundle, `repo-hygiene/repo-hygiene`, `package-manager/pnpm` and — last, per
   the cloud rule — `cloud-service/workers-ssr`, skipping `_`-prefixed top-level
   entries; trust the mise config.
8. **The slug.** Author `p/scratch-dev/_default` by hand (init's file) and
   `p/scratch.dev/_default` beside it as the control:
   `MISE_ENV=dev mise tasks
   ls --hidden` lists `p:scratch-dev` and lists the
   control as `p:scratch`, not `p:scratch.dev`. Remove the control.
9. **The merge predicate.** With one commit on `main` and no `develop`,
   `MISE_ENV=dev mise run code:merge:develop` exits non-zero with U6's message,
   and `git branch --show-current` is still `main` — nothing was checked out and
   no hook ran.
10. **The lock.** `.config/mise.dev.lock` is created by `mise install`; commit
    it; `MISE_ENV=dev mise run setup:worktree` (or `mise install` again) leaves
    `git status --porcelain` empty.
11. **The editor composition.** Run the merge algorithm from
    `fragments-and-sections.md` by hand over the composed fragments:
    `.vscode/settings.json` parses as JSONC, its `explorer.fileNesting.patterns`
    has a `.gitignore` parent whose children include `.graphifyignore`, and
    `.vscode/extensions.json` lists the union with no duplicate; a key written
    by hand after the block survives a second merge byte-for-byte.
12. **The shim.** From the scratch root, `dprint check` (or
    `dprint output-file-paths`) through the root `dprint.json` yields the same
    file set as `dprint --config .config/dprint.json output-file-paths`.
13. **`setup:vscode`, hermetically.** With `REPO_NAME=scratch-dev` and a two-id
    `.vscode/extensions.json`, run the task with `code` wrapped to add
    `--user-data-dir` and `--extensions-dir` under the temp dir: both ids
    install into a profile named `scratch-dev`; plant a third by hand, re-run:
    it is uninstalled. Never the real user directory.
14. **The Worker with a script.** `wrangler.jsonc` lands at the scratch root
    (the cloud pack composed last), parses as JSONC (comments and trailing
    commas stripped), carries `main`, `compatibility_flags` containing
    `nodejs_compat`, `assets.directory` and `assets.binding`, **no**
    `not_found_handling`, and its marked positions (`name`, the route block,
    `main`) intact and clearly marked. The deploy overlay renamed to
    `p/scratch-dev/` lists as `p:scratch-dev:deploy`, is clean under
    `shellcheck -x -s bash -P .config/mise/tasks/_scripts -e SC2034 -e SC2154`
    and `shfmt -d -i 2 -ci`, and with no credentials in the environment exits 1
    naming both variables before invoking wrangler.
15. `mise run plugins:check` from the worktree reports every new payload file
    accepted.

Pass = all fifteen. A failure is a wave-1 finding routed to the owning unit
(U1/U2 for the Astro pack and bundles, U5 for the asset, U6 for the mise pack,
U7 for the shim, U8 for the fragment baseline, U9 for the algorithm, U11 for the
checker, U12 for the Worker), not a GAP.

**`target-verifier`** runs inside U4: a hermetic install of the working tree's
dev marketplace shows `stackgen@1.2.0` and `vwf@19.13.0`; the installed stackgen
tree contains `stacks/framework/astro/pack.yaml`, all four
`stacks/bundles/astro-*.md` and no `typescript-astro-react.md`,
`stacks/cloud-service/workers-ssr/config/wrangler.jsonc`,
`stacks/bundles/cloudflare-workers-ssr.md`, `assets/ids.md`, the root
`dprint.json` shim under the dprint gate's `config/`, and at least one
`vscode.d/*.jsonc`; the installed vwf tree's
`skills/init/references/new-repo.md` contains `setup:default-branch`; every task
file survives with its executable bit; and uninstall leaves only Claude's own
cache.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits.

A unit returns exactly this block and nothing else — no file contents, no diff.
Keep `CHANGED:` entries to a bare path and six words: the mailbox truncates long
reports, and the orchestrator reads the file list from git.

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **A `framework/react` pack.** Declined at review ("fold react in too" was
  rejected); all four Astro bundles keep `framework/react@generated`.
- **An output-mode field on bundles or a per-project setting.** The taxonomy
  supports a sibling bundle (D1).
- **A `build_output:` payload field.** The shape E3 recommended, but it changes
  the template payload vwf parses — a vwf plan, parked.
- **Touching `site/`** beyond the manual under `site/src/content/docs/`. The
  Astro config is the cited specimen, read-only.
- **A scratch Astro project** (`pnpm create astro`) as an orchestrator gate —
  network, tooling and a manifest the pack must not write.
- **Pages, R2, D1, KV, Durable Objects, Queues, Images, Stream** — the
  reservation stands for all of them.
- **Dropping any baseline item** (D35). **Renaming `setup:external`** (D34).
- **Guarding `develop`** with the branch hook (D19).
- **A shell `slugify` helper** — no shell consumer exists; both consumers are
  prose.
- **Init writing to `~/.config`** — the `cc` aliases are the user's global
  config; `setup:vscode` writes to the editor's profile store, which is what the
  profile mechanism is for, and nowhere else.
- **Mirroring payload fixes into this repo's own
  `.config/pre-commit-config.yaml` and `.config/git-conventional-commits.yaml`**
  — independently authored, not copies.
- **Per-pack version bumps for existing packs** (D37).
- **`.config/claude-status.json`** — declined at the hygiene pick.

## Parked

- **95octane's pin** — `.config/vwf.yaml:1034` reads
  `project/site/typescript-astro-react` and must become `project/site/astro-ssr`
  once stackgen `1.2.0` is installed there; a one-line edit in that repo's own
  session, plus a `/vwf:doctor` run to confirm the template resolves.
- **`framework/react` as a real pack** — now referenced `@generated` from all
  four Astro bundles plus `typescript-hono-refine`. Same shape as this plan's
  U1.
- **`build_output:` as a template-payload field** the framework pack declares
  and the deploy pack reads at pin time — the `harness:` shape. Needs vwf's
  `stack-adapter.md` payload contract to gain a key, so it is a vwf plan.
- **A `plugins:check` rule that resolves component refs**: every
  `<type>/<slug>@<version>` in a bundle either is `@generated` or names an
  existing pack directory declaring that version. `inventory.ts:161-165` stores
  refs verbatim today; this plan's orchestrator gate 2 does the check by hand.
- **`.vscode/launch.json` and `tasks.json`** as a framework pack's fragment
  contribution — they differ per project everywhere the scan looked.
- **`mempalace.yaml`, `.claude/settings.json` (hooks, permissions,
  `worktree.symlinkDirectories`), `AGENTS.md`, `.config/vwf.yaml`** — all
  `/vwf:setup`'s domain, not init's.
- **A github-actions unconditional bundle** — the pack exists but is not
  unconditional, so init lays down no workflow; the charter fence keeps
  workflows out of payloads regardless.
- **The older repos' catch-up runs** — `claude-status`, `linter`, `macos-setup`
  and the rest re-shaped by `/vwf:init` once this lands; each is its own session
  in its own repo. Three of them keep `dprint.json` at the root, which the D28
  move rule handles.
- **95octane's `setup:deps` drift** — its compose lifecycle lives under the name
  the baseline reserves for package installs; that repo's fix, not the
  baseline's.
- **`.claude/docs/ci-and-releases.md:104-108`** — the `claude --plugin-dir`
  dogfooding paragraph predates the dev marketplace and reads stale beside it;
  adjacent, not this plan's.
- **The `oc = "opencode"` alias** — global, the user's.
- **`run_worker_first` and a Worker script in front of a *static* site** — the
  SSR pack ships the knob off and says why; a middleware-only Worker over SSG
  output is a shape nobody has asked for.

## Run log

<written by execute-plan; empty at approval>

| Wave | Unit      | Model | Round | Outcome                        | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Commit   |
| ---- | --------- | ----- | ----- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green                          | all nine gate lines exit 0 from the worktree (check, marketplace --check, inventory --check, shellcheck, vitest 265, tsc installer + scripts, npm-normalize 33, site:check). Inherited, not a gate line: `setup:pnpm:audit` fails on four advisories from `develop` (astro GHSA-7pw4-f3q4-r2p2 and three others); deps installed regardless                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 1    | U2        | opus  | 1     | green                          | 4 bundles: `typescript-astro-react.md` git-mv'd to `astro-ssr.md`, `astro-ssg.md`, `astro-hybrid.md`, `astro-csr.md` new. DECIDED: React Router doctrine states Data-mode `loader`/`action` (D39's `clientLoader`/`clientAction` are Framework-mode exports; Context7 confirmed), Framework spelling noted in a parenthesis; one `## Build output and deploy` heading per bundle; 79-char fold by hand. DOCS FALSIFIED: `stacks/inventory.md:104` still lists `typescript-astro-react` (generated, U4's). GAP: bodies cite `ssr.md`, `hybrid.md`, `csr.md`, `content-and-routing.md` by D13's names before U1 had written them — assumed U1 lands all eight. `plugins:check` 0; inventory --check red as the plan expects                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | a38dbb1a |
| 1    | U5        | opus  | 1     | green                          | `assets/ids.md` new; `pack-format.md` (ids cite, editor-fragment subsection, narrowed fence), `output-tree.md` (fence item 3 narrowed, root allowlist +5), `materializer.md` (slug reason replaced, allowlist + fragment rules). DECIDED: `kinds.md` unchanged — hygiene bar is four closed topics, a fifth is beyond D32; `pack-format.md`'s own fence restatement narrowed to "a **whole** editor file"; `vscode.d/<pack>.jsonc` added to the layout tree; subsection placed at the end of Layout. DOCS FALSIFIED: `stackgen-stack-template/SKILL.md:118-121` (pre-narrowing fence), `toolchain-gate/dprint/conventions.md:101-105` and `dprint/skills/dprint/SKILL.md:108-111` (allowlist "carries no file" for format-on-save — U7's tree). `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | a38dbb1a |
| 1    | U11       | opus  | 1     | green                          | `scripts/src/check.ts` + `check.test.ts`: root allowlist +4 (`.graphifyignore`, `.npmrc`, `CONTRIBUTING.md`, `dprint.json`), `PACK_CONFIG_ROOT_DIRS` (`.config`, `.github`), `PACK_CONFIG_FORGE_FENCE` refuses `.github/workflows`, rule 11 walks `vscode.d/*.jsonc` via a hand-rolled `stripJsonc` (no dependency) and parses a whole `pre-commit-config.yaml` through the extracted `preCommitFaults`; nine new tests, one fixture swapped `dprint.json`→`.prettierrc`. DOCS FALSIFIED: `.claude/skills/plugin-authoring/references/checks.md:79` ("Five assertions" → seven), `:94-103` allowlist prose short by four names, `.github/`, the fence and the two new assertions; `:95` lists `CLAUDE.md` as allowlisted — never was; `CLAUDE.md` Tasks rule-11 summary short by three assertions. `inventory.test.ts` red per the inventory caveat                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | a38dbb1a |
| 1    | U10       | opus  | 1     | green                          | `doctor/references/stack-checks.md` new baseline section with four drift sub-checks; `doctor/SKILL.md` dispatch, drift kind, one remedy, two doc paths. DECIDED: section at the end of stack-checks.md (a `##` after the mise paragraph would swallow §5's tail; the mise nudge points down); installed pack version resolves from the adapter's `-stack-template` payload first, else `pack.yaml` under the adapter root via `claude plugin list`; a recorded version newer than shipped is not a finding. GAP: the lockfile records a version per entry (`source: pack/<type>/<slug>@<version>`), not per component — check written per entry; `generated` sources and non-`entries:` blocks skipped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | a38dbb1a |
| 1    | U1        | opus  | 1     | green                          | `stacks/framework/astro/` new: `pack.yaml` 0.1.0, `conventions.md`, `skills/astro/SKILL.md` (paths-scoped, `user-invocable: false`) + eight references (`framework-doctrine`, `ssg`, `ssr`, `hybrid`, `csr`, `content-and-routing`, `build-output`, `testing`). DECIDED: Effect pack's register, no technology outside Astro named; `## Build output` is the fixed heading in both `conventions.md` and `build-output.md`; CSR names `not_found_handling` / `"404-page"` as the one deploy setting it flips; adapter entry-path drift stated as a fact, no version or path pinned; no coverage threshold (D10). `plugins:check` 0 (33 skills); four specimen facts grep true against `site/astro.config.ts`; inventory --check red as predicted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | a38dbb1a |
| 1    | U9        | opus  | 1     | green                          | `init/references/new-repo.md` (§1 develop-first, §7 slug + `REPO_NAME`, new §11 git pass, §10 guard, report → §12), `existing-repo.md` (move-and-shim, id-source-changed rows, tenth survey pass, gate-config commit first, scoped idempotence), `fragments-and-sections.md` (third algorithm: editor fragments), `init/SKILL.md` (git-pass hard rule, pipeline table, git report, "When to run it again"). DECIDED: develop-first stated as mechanism and model; `mise x -- git commit` / `mise run setup:default-branch` spelled literally; editor never named (`vscode.d` once as the fragment path); `REPO_NAME` as the third marked position; slug example `My.App` → `my-app` with `assets/ids.md` authoritative; `readme-and-license.md` unchanged. DOCS FALSIFIED: `site/src/content/docs/plugins/vwf.md:770-847` (init described with no branches/commit/forge/editor/re-run); `.claude/skills/vwf-plugin/` (init as files-only); `plugins/vwf/skills/setup/**` — its `init` offer is now cross-referenced by "When to run it again", check it reads as the absent-shape case only (unowned). GAP ×4, all cite-by-name against concurrent units: `ids.md` (U5), the editor-fragment subsection (U5), `setup:default-branch` + `REPO_NAME` (U6), U7's marked-position wording for commit-scope and forge-link — pass 10 defers every literal to the shipped file                                                                                                                                    | a38dbb1a |
| 1    | U8        | opus  | 1     | green                          | repo-hygiene `config/`: `.graphifyignore` new, `.gitignore` graphify section, `CONTRIBUTING.md`, three `.github/ISSUE_TEMPLATE/*.yml`, `.config/vscode.d/repo-hygiene.jsonc` (29 settings, nesting re-keyed by ownership, `.gitignore` parent nests `.graphifyignore`); `conventions.md` + `SKILL.md` updated. pnpm: `config/.npmrc` (ignore-scripts, fund), `config/.config/mise/conf.d/pnpm.toml` (npx → pnpm dlx), `conventions.md`. DECIDED: conf.d path mirrors doppler's fragment; copilot commit-instructions key dropped (path outside the repo); claude-status's settings.json is the source of record (newer than 95octane's); `.graphifyignore` ships `graphify-out/` only; `.npmrc` comment names `allowBuilds` first. GAP: the plan's extension exclusion list is narrower than D27's rule — kept `astro-build.astro-vscode`, `doppler.doppler-vscode`, `effectful-tech.effect-vscode`, `bradlc.vscode-tailwindcss` (pack-owned tools with no fragment this plan), following the list literally; doppler is then recommended in an fnox repo too. Verified the four fragments disjoint. Notes `plugins:check`'s one finding is U6's `tasks/code/count` exec bit                                                                                                                                                                                                                                                                                                                                | a38dbb1a |
| 1    | U7        | opus  | 1     | green                          | 17 files across the gate packs: dprint `config/dprint.json` root shim + `vscode.d/dprint.jsonc`, eslint `config/.config/linter.yaml` (new, `--init` output with fuller header) + `vscode.d/eslint.jsonc`, tsconfig/ruff/analysis-options/pre-commit `vscode.d/*.jsonc`, pre-commit `git-conventional-commits.yaml` fill comments, every `conventions.md` + two SKILL.md. DECIDED: shim carries no comment — `check-json` (python `json.load`) rejects `//`, reason moved to dprint conventions; `includes` is NOT inherited through `extends` (dprint 0.57.1, measured) but `excludes` is, and the shipped includes equals the plugins' claimed extensions so `output-file-paths` is byte-identical either way; extension ids lowercase verbatim from source `extensions.json` (plan's edit 9 had them capitalized); four conventions gained a "what this pack writes" section. DOCS FALSIFIED: `assets/output-tree.md:202-214` (U5 already narrowed it — reviewer to confirm), `stackgen-sync/SKILL.md` allowlist restatement (U3 routes). GAP: bare `dprint check` from the root exits 11 on the `includes` diagnostic — no documented call hits it (all pass `--config`; `--stdin` is clean), stated as a cost in conventions, both fixes measured worse; shim already on U11's allowlist; fragment shape assumed from the plan's names before U5 landed, all six verified. `plugins:check` 0, `plugins:shellcheck` 0 (59), no pack.yaml version moved                                                   | 5b3f12c2 |
| 1    | U12       | opus  | 1     | green                          | `cloud-service/workers-ssr/` new: `pack.yaml` (compute, `artifact: worker-script`), `conventions.md`, `config/wrangler.jsonc` (`main`, `nodejs_compat`, assets directory + binding, no `not_found_handling`, three marked positions), `config/.config/mise/tasks/p/_project/deploy` overlay, `skills/workers-ssr/SKILL.md` + eight references; `bundles/cloudflare-workers-ssr.md` new; static, zero-trust bundles and the provider/static/zero-trust packs reworded for three services (13 files). DECIDED: `capability` left unset (cloud-run declares none, `compute` is no vwf token); only `nodejs_compat` shipped, `global_fetch_strictly_public` named in a comment; the static pack's `SKILL.md` fence touched one clause beyond the plan's three named files (it claimed the script shape was a separate effort); `compatibility_date: 2026-09-06`. DOCS FALSIFIED: `site/src/content/docs/plugins/stackgen.md` Cloudflare passages need the third service (U3's). GAP: plan's `harness: pipeline` is not a vwf capability token (`pack-format.md:165`) — shipped `health`/`e2e_staging`/`local_stack` as the static sibling does, deploy task in prose; plan's `platformProxy` for local dev is superseded (Context7: adapter v13 + Astro 6 run `astro dev` under workerd via the Cloudflare Vite plugin) — `local-dev.md` states that. `plugins:check` 0, `plugins:shellcheck` 0, overlay lists as `p:scratch-dev:deploy` and exits 1 naming both credentials; inventory --check red as expected | a38dbb1a |
| 1    | U6        | opus  | 1     | green                          | mise pack: `mise.toml` (`REPO_NAME` marked position, three settings, lockfile rule), `mise.ci.toml`, `_scripts/merge` (destination-branch-exists predicate), `setup/all` (runs `setup:vscode` last), `setup/worktree`, new `code/count`, `setup/vscode`, `setup/default-branch`, `vscode.d/mise.jsonc`; conventions, SKILL, `config-files.md`, `task-library.md`. DECIDED: three settings verified real on mise 2026.9.1; `code --profile` combines with the extension flags but never creates a profile — task probes with streams apart and prints the create step on first run; `extensions.json` parsed with awk (no node dependency); `setup:default-branch` not called by `setup:all` (edits a remote); `#MISE dir` on `setup:vscode` only; D20 re-measured (`mise install` writes `.config/mise.dev.lock` only, clean re-install); merge predicate after source/dest checks, before untracked. DOCS FALSIFIED: `site/src/content/docs/plugins/stackgen.md:428-438` (predicate list), `:439-445` (`setup:all` ends at `code:ai`), no `code:count`/`setup:vscode`/`setup:default-branch`/`REPO_NAME`/lockfile rule anywhere. GAP: plan's `glab repo update --default-branch` is really `--defaultBranch` — shipped the real flag; the `mise\.lock` gate line now also hits a nesting glob in `vscode.d/mise.jsonc`, not a sentence. All three new tasks executable; `plugins:check` and `plugins:shellcheck` 0                                                                                         | a38dbb1a |
| 1    | R1        | opus  | 1     | findings(6)                    | CONTRACT: `pnpm-lock.yaml` modified outside every Owns — the orchestrator's own `setup:pnpm:install` bootstrap (unfrozen; vite 8.2.2→7.3.6), not a unit's; restored with `git checkout` and `pnpm install --frozen-lockfile`. RULINGS: U8 departed from D26/D27 (pack-owned extension ids and stack-specific nesting parents kept in the unconditional baseline) → looped. Findings: `repo-hygiene.jsonc:153` [U8] rulings (astro/tailwind/doppler/effect ids); `:128` [U8] rulings (`Cargo.toml`, `dockerfile.projects`, `firebase.json`, `mempalace.yaml` nesting); `:49` [U8] docs (`files.exclude` hides `graphify-out/` whole though `GRAPH_REPORT.md` is tracked); `mise.toml:98` [U6] traps (payload cites `${CLAUDE_PLUGIN_ROOT}`); `init/references/existing-repo.md:169` [U9] docs (contradicts U7's `git-conventional-commits.yaml:84` on when forge links fill). U2/U7/U12/U6/U10 departures judged gap-fills, not ruling departures. Cross-cited names verified matching; `setup/**` not falsified                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |          |
| 1    | U6        | opus  | 2     | green                          | `mise.toml` slug rule stated in place with the `virajp.dev` → `virajp-dev` example, names "stackgen's `assets/ids.md`" without a path token; `CLAUDE_PLUGIN_ROOT` absent from the pack's `config/`. `plugins:check`, `plugins:shellcheck` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | a38dbb1a |
| 1    | U9        | opus  | 2     | green                          | `existing-repo.md` pass 10 mirrors U7's shipped yaml: scopes re-run-only, forge links fill on any run with a remote (shipped commented out, filling = uncommenting); table gains a "Fillable" column. No sibling claim in `new-repo.md`; SKILL.md:172/:237 already correct                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | a38dbb1a |
| 1    | U8        | opus  | 2     | green                          | `repo-hygiene.jsonc`: extensions 7 (dropped the reviewer's four plus pnpm's `npm-intellisense` and bash's `shell-format` as pack-owned), nesting parents 6 (dropped `Cargo.toml`, `dockerfile.projects`, `firebase.json`, `mempalace.yaml`; kept `package.json`, `*.js` as repo-root shapes no fragment claims), `graphify-out/` dropped from `files.exclude` (no negation form in VS Code — a comment says so); `conventions.md` states the ownership rule for ids. Earlier extension GAP closed by the ruling. All eight `vscode.d/*.jsonc` disjoint; `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | a38dbb1a |
| 1    | R1        | opus  | 2     | pass                           | FINDINGS 0, CONTRACT clean (49 changed paths + 15 untracked trees inside Owns; lockfile restored; generated files untouched), RULINGS clean — all five round-1 findings verified resolved with nothing regressed; every bundle ref resolves; every pack task 755 with the bash shebang; eight fragments parse strictly                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |          |
| 1    | gate      | —     | 1     | green                          | Inventory regenerated first per the inventory caveat (+2 packs, +3 bundles net). Mechanical: `plugins:check` 0 (33 skills), `marketplace --check` 0, `inventory --check` 0, `shellcheck` 0 (59 files, 10 libraries), vitest 271 passed, tsc installer + scripts 0, npm-normalize 33/33. Plan-specific Astro/SSR lines all hold (0 `astro@generated`, four `astro-*.md` at `@0.1.0`, old file gone, four display names without "TypeScript", `- site` ×4, no `unconditional`, effect on ssr + hybrid only, no retired terms, SKILL frontmatter strict with `paths:`, 8 references, reserved lists keep the eight services with no bare "Workers", `artifact: worker-script` in both). Init lines hold; two exceptions noted, neither this plan's: `_scripts/helpers.mjs` (pre-existing at `0abcde1f`, unchanged) is not a bash task so fails the "every file" wording; `mise\.lock` also hits a nesting glob in `vscode.d/mise.jsonc` (U6's GAP). Orchestrator gates 1–6 pass: exactly four `- site` bundles, none unconditional; all 29 component refs resolve to a pack declaring that version; four specimen facts true; `./dist` under `## Build output` in both files; pairings cross-reference in the right order; `hybrid.md` states the Astro 5 removal. Gates 7–15 dispatched to G1                                                                                                                                                                                                                 |          |
| 1    | G1        | opus  | 1     | 8/9                            | Scratch materialization in `scratch.dev`: 7 PASS (62 payload files composed, `_licenses` skipped); 8 PASS (`p:scratch-dev` listed, dotted control listed as `p:scratch`); 9 PASS (merge predicate exits 1 naming `develop`, still on `main`, no hook ran); 10 PASS (`mise install` writes `.config/mise.dev.lock` only, clean re-install); 11 PASS (four fragments merged, `.gitignore` nests `.graphifyignore`, 10 unique extensions, hand key survives byte-for-byte); **12 FAIL** — bare `dprint check` through the root shim exits 11 "Unexpected non-string, boolean, or int property (includes)" on dprint 0.57.1, file sets match 23/23 only via `output-file-paths`; D28's "includes resolve through extends" is measured false → routed to U7 as a wave-1 finding; 13 PASS (hermetic `code` wrapper: two ids into profile `scratch-dev`, planted id pruned, real store untouched); 14 PASS (`wrangler.jsonc` shape, three marked positions, overlay lists as `p:scratch-dev:deploy`, shellcheck + shfmt clean, exits 1 naming both vars); 15 PASS. Temp dir removed                                                                                                                                                                                                                                                                                                                                                                                                                                |          |
| 1    | U7        | opus  | 2     | green                          | Gate-12 fix: `includes` deleted from `dprint/config/.config/dprint.json`; conventions gain a "No `includes` key" section replacing the exit-11 cost text; SKILL example and editor section state the inheritance rule. DECIDED: dropped rather than re-expressed via `excludes` — the pinned plugin list is the include set and `includes` had already drifted from it (`**/dockerfile` lowercase, `.htm`/`.html` but not `.astro`/`.vue`/`.svelte`), so deleting removed a second copy, not coverage. Scratch: bare `dprint fmt`/`check` exit 0, file sets 9 = 9 byte-identical between the shim and `--config`. `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 5b3f12c2 |
| 1    | G1        | opus  | 2     | 12 FAIL                        | Re-run after U7's fix: the `includes` diagnostic is gone and the two file sets match byte-for-byte (21/21), but bare `dprint check` and `dprint fmt` from the scratch root both exit **13** — "No formatting plugins found. Ensure at least one is specified in the 'plugins' array of the configuration file." Cause measured: dprint 0.57.1 discovers `.config/vscode.d/dprint.jsonc` — the editor fragment named `<pack>.jsonc` by U5's convention — as a sub-directory dprint config with no `plugins`; renaming that one file makes both commands exit 0. 15 PASS. A second gate-12 failure after U7's one mechanical re-dispatch: U7 **failed**; U3 and U4 depend on all wave-1 units → **skipped**. Ruling needed (see Status)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |
| 1    | R1        | opus  | 3     | pass                           | Focused re-check of U7's gate-12 fix: FINDINGS 0, CONTRACT clean (three modified + two untracked, all in `toolchain-gate/**`). RULINGS: U7 substituted the mechanism D28 named — deleted `includes` rather than rewriting it with `${configDir}`; the goal holds (shim and `--config` resolve the same set, both exit 0 on that count). Consequence not contemplated by D28: the shipped set is now **wider** — a materialized repo also formats `.astro`, `.vue`, `.svelte` and `Dockerfile` — stated in `conventions.md:132-138` and `SKILL.md:53-57`. No passage still claims `includes` resolves through `extends`; every payload dprint call still passes `--config`. vitest 271 green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 0    | preflight | —     | 2     | green                          | Resume: worktree present, ruling (a) written into `07-gate-packs.md`, U7/U3/U4 reset to pending; the eight non-site gate lines exit 0 at `59e34730` with U7's tree uncommitted in place (`plugins:check` 0, marketplace and inventory up to date, shellcheck 59, vitest 271, tsc ×2, npm-normalize 33)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 1    | U7        | opus  | 3     | green                          | Ruling (a): `vscode.d/dprint.jsonc` renamed to `dprint-editor.jsonc`, content unchanged; `dprint/conventions.md` states the exception and the exit-13 reason. DOCS FALSIFIED: `assets/pack-format.md` fragment convention needs the one-sentence exception (U5's file, U3 routes). Scratch: bare `dprint fmt`/`check` exit 0, shim and `--config` sets 10 = 10 byte-identical. `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 5b3f12c2 |
| 1    | G1        | opus  | 3     | 11 PASS, 12 shim PASS, 15 PASS | After the rename: 11 PASS (renamed fragment merges — 22 keys, both ids, hand key survives); 12 — the gate's assertion holds: no diagnostic, bare `dprint fmt` exits 0, shim and `--config` sets byte-identical at 25/25 (the four fragments now discovered); but bare `dprint check` on a fresh composition exits **20** — five payload files ship unformatted under their own shipped config (`workers-ssr/config/wrangler.jsonc` U12; `repo-hygiene.jsonc`, `CONTRIBUTING.md`, two issue templates U8), the trap `CLAUDE.md` names. Judged a separate wave-1 finding, routed to U8 and U12 to format with the **shipped** config. 15 PASS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 1    | R1        | opus  | 4     | findings(1)                    | Rename check: CONTRACT clean (only the renamed fragment and `dprint/conventions.md` moved), RULINGS clean (the rename is the user's ruling, recorded as an exception). One finding: `assets/pack-format.md:99` still states `<pack>.jsonc` with no exception — the convention itself, U5's file under the shared-file rule → U5 re-dispatched for the sentence (the ruling text's "U3 routes" corrected to U5). Nothing anywhere names `dprint.jsonc` as the fragment; the six shipped hits are dprint's config-discovery names; downstream `<pack>.jsonc` restatements read as placeholders. Fragment content byte-identical to rounds 1/3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 1    | U12       | opus  | 2     | green                          | `workers-ssr/config/wrangler.jsonc` and the static sibling's reformatted under the **shipped** dprint config — whitespace only (blank lines between a `}` and a comment block); comments and the three marked positions intact; shipped `dprint check` clean on both; `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 5b3f12c2 |
| 1    | U8        | opus  | 3     | green                          | `repo-hygiene.jsonc`, `CONTRIBUTING.md`, `bug_report.yml`, `feature_request.yml` reformatted under the **shipped** dprint config in a /tmp scratch mirroring the payload layout — whitespace only (list splitting, a trailing comma, a reflow at 80); `config.yml`, `.graphifyignore`, `.gitignore`, `.npmrc`, `pnpm.toml` were already clean. Shipped `dprint check` 0 over every hygiene/pnpm payload file; JSONC still three keys (29/6/7); `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 5b3f12c2 |
| 1    | U5        | opus  | 2     | green                          | `assets/pack-format.md` names `dprint-editor.jsonc` as the one filename exception, with the measured cause (dprint 0.57.1 sub-directory discovery, exit 13) and that `*.jsonc` still finds it. `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 5b3f12c2 |
| 1    | G1        | opus  | 4     | pass                           | Final: 12 PASS — bare `dprint check` exit 0 (no diffs, no diagnostic), bare `dprint fmt` changes nothing on the committed 62-file composition, both `output-file-paths` sets byte-identical at 25/25; 15 PASS. All fifteen orchestrator gates now hold                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 5b3f12c2 |
| 2    | DR        | —     | 1     | findings(29)                   | `docs-reconciler` over `f6df9ed8..HEAD`: 26 stale passages across `site/…/plugins/stackgen.md` (8), `site/…/plugins/vwf.md` (5), `how-to/operate/choosing-your-stack.md` (2), `readme.md`, `CLAUDE.md`, `.claude/docs/repo-shape.md`, `plugin-authoring/references/checks.md` (4), `stackgen-plugin/SKILL.md` (4), `vwf-plugin/SKILL.md`, `skills-and-agents.md`; plus one pre-existing error (`CLAUDE.md` claimed on the payload root allowlist in three files — the code never listed it). Written to `wave-2-reconciler-findings.md` for U3. DECIDED (orchestrator): three falsified passages under `plugins/stackgen/` with no owner this plan (`assets/output-tree.md:155`, `stackgen-stack-template/SKILL.md:118-121`, `stackgen-sync/SKILL.md`) are routed to U5 as a bounded Owns extension — `CLAUDE.md`'s docs-ship-with-the-change rule over the shared-file rule's "nobody"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 2    | U5        | opus  | 3     | green, then discarded          | Routed passages applied (`CLAUDE.md` off the root allowlist in `output-tree.md`; `stackgen-stack-template/SKILL.md` fence narrowed with the `vscode.d` fragment named; `stackgen-sync/SKILL.md` gains the editor fragment and deploy config and points at `output-tree.md`), `plugins:check` 0 — then **discarded uncommitted** by U3's `git checkout` (next row). Re-dispatched as round 4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 2    | U3        | opus  | 1     | contract violation             | U3 ran `mise run code:format --fix`, saw four files outside its Owns reflowed, and reverted them with `git checkout`: `assets/output-tree.md`, `stackgen-stack-template/SKILL.md`, `stackgen-sync/SKILL.md` (U5's live wave-2 edits, lost) and `docs/plans/…/index.md` (the orchestrator's post-`5b3f12c2` rows and hashes, lost; re-written here). Reverting is touching. U3 told; U5 re-applying. U3's own edits are intact (17 files) — its report row follows once the truncated tail arrives                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | U3        | opus  | 1     | green                          | 17 files: five decision docs (`2026-09-06-astro-four-modes-four-bundles`, `-editor-fragments-inside-the-fence`, `-init-owns-the-first-commit`, `-project-ids-are-slugged`, `-workers-ssr-redeems-the-script-reservation`); `site/…/plugins/stackgen.md` (new `### Four bundles on one pack`, fence, allowlist, mise, hygiene, pnpm, cloud), `site/…/plugins/vwf.md` (init rewritten: branches, git pass, slug, editor, re-run; doctor row), `choosing-your-stack.md`, the two greenfield how-tos (one clause each), `checks.md` (rule 11 seven assertions, allowlist points at `PACK_CONFIG_ROOT_FILES`), `stackgen-plugin/SKILL.md`, `vwf-plugin/SKILL.md`, `skills-and-agents.md`, `repo-shape.md`, `CLAUDE.md`, `readme.md`. DECIDED: allowlist prose points at the code and drops both unbacked claims; Astro material as one section; vwf page names `setup:default-branch` but no editor/forge/CLI; `ci-and-releases.md` untouched. DOCS FALSIFIED: `output-tree.md:150-160` also lists "manifests a language mandates" (→ U5, folded into its re-apply); `dprint/conventions.md:95-107` pre-shim "inert"/"asymmetric" contradicts the shim section (→ U7). Reconciler's `stackgen-sync` allowlist finding not reproducible (no allowlist there). `plugins:check` 0, `site:check` 0 (23 pages, 1441 links resolve), `dprint check` clean over Owns                                                                                                                                                    | d9ecf382 |
| 2    | U5        | opus  | 4     | green                          | Re-applied after the discard: `output-tree.md` takes `CLAUDE.md` and the language manifests/lockfiles off the root allowlist (both fenced out); `stackgen-stack-template/SKILL.md` fence narrowed to a whole editor file, `vscode.d` fragment named; `stackgen-sync/SKILL.md` gains the editor fragment and deploy config and points at `output-tree.md`. Exactly three files modified under `plugins/stackgen/`; `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | d9ecf382 |
| 2    | U7        | opus  | 4     | green                          | `dprint/conventions.md` pre-shim `--config` section rewritten as "two routes to the same config" — no "inert", no "asymmetric trade"; SKILL.md already post-shim. `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | d9ecf382 |
| 2    | R2        | opus  | 1     | findings(6)                    | CONTRACT clean, RULINGS clean. `stackgen.md:90` + decision doc `:51` [accuracy] "both Workers packs' `assets.directory` cite that heading" — false in the tree: neither Workers pack cites the astro `## Build output` fact the plan's Goal promised → routed to U12 to add the cite (docs kept); `stackgen.md:158` [docs] "below" points the wrong way; `checks.md:80` [accuracy] "Seven assertions" heads eight bullets (allowlist + workflows refusal are one in `check.ts:377-381`); `checks.md:106` [traps] dangling "—"; `stackgen.md:445` [completeness] the three mise settings unnamed; note: shape prose drops `fnox.toml`. All DECIDEDs judged gap-fills. `site:check` 0 (23 pages, 1441 links), `dprint check` clean over U3's Owns, tree spot-checks all true                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | U12       | opus  | 3     | green                          | Both Workers packs now cite the Astro `## Build output` fact — `conventions.md` artifact sections and a one-line comment beside `assets.directory` in both `wrangler.jsonc` (heading named, `framework/astro` as the specimen only; no value changed, no Astro dependency). `plugins:check` 0, both jsonc dprint-clean under the shipped config                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | d9ecf382 |
| 2    | U3        | opus  | 2     | green                          | `checks.md` allowlist + workflows refusal merged into one assertion (seven bullets), the allowlist prose is a pointer at `PACK_CONFIG_ROOT_FILES`/`PACK_CONFIG_ROOT_DIRS` with no enumeration, dangling "—" gone; `stackgen.md` Astro cross-ref is an anchor link to the section above, the three mise settings named. No reverts this round. `site:check` 0 (23 pages, 1442 links, 508 fragments), `dprint check` 0 over Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | d9ecf382 |
| 2    | R2        | opus  | 2     | pass                           | FINDINGS 0, CONTRACT clean (21 modified + 6 untracked, all U3's Owns, the six named U5/U7/U12 files, or `docs/plans/**`), RULINGS clean. All six round-1 findings resolved on path:line, nothing regressed; both `wrangler.jsonc` parse with values unchanged; hand fold holds under `plugins/` (78 max). `site:check` 0 (508 fragments, +1 anchor), `plugins:check` 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 2    | gate      | —     | 1     | green                          | `plugins:check` 0, marketplace and inventory up to date, `shellcheck` 59 clean, vitest 271, tsc ×2, npm-normalize 33, `site:check` 0 (23 pages, 1442 internal links, 508 fragments, 543 markdown links, all resolve). No `UNRESOLVED:` in any report                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | d9ecf382 |
| 3    | U4        | opus  | 1     | green                          | vwf `19.12.0` → `19.13.0`, stackgen `1.1.0` → `1.2.0`, site `1.1.3` → `1.1.4`; `.claude-plugin/marketplace.json` regenerated (refs `stackgen-v1.2.0`, `vwf-v19.13.0`); inventory regenerated byte-identical. DECIDED: `site:version` refused the dirty tree (the orchestrator's unstaged index.md), version edited by hand per Edit 3; `target-verifier` left to the orchestrator per §Verification. Full gate all exit 0 (check, marketplace --check, inventory --check, shellcheck, vitest, tsc ×2, npm-normalize, site:check)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 49ef03d3 |
| 3    | R3        | opus  | 1     | pass                           | FINDINGS 1 — the orchestrator's own unpadded run-log row (the pre-commit formatter pads it at commit, as every wave). CONTRACT clean (exactly the four owned files + index.md), RULINGS clean: versions match Consent and tag reality (`stackgen-v1.1.0` never tagged, `vwf-v19.12.0` exists, site tags stop at `site-v1.1.1`); manifest diff is the four expected lines, marketplace name and vwf's dependency edge intact; `installer/package.json` byte-identical; hand edit of `site/package.json` equivalent to `site:version`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 3    | TV        | —     | 1     | pass                           | `target-verifier`, hermetic (`HOME` + `CLAUDE_CONFIG_DIR` under /tmp, real `claude` 2.1.260): install of `vwf@virajp-plugins` pulled `stackgen` as its dependency from the same marketplace name; `claude plugin list` shows `stackgen 1.2.0`, `vwf 19.13.0`; every named path present in the installed stackgen (astro pack + 8 references, four `astro-*.md`, no `typescript-astro-react.md`, `workers-ssr` wrangler + deploy task, `cloudflare-workers-ssr.md`, `ids.md`, the dprint shim, eight `vscode.d/*.jsonc` incl. `dprint-editor.jsonc`); installed vwf `new-repo.md:326` names `setup:default-branch`; 58 task files all `u+x`; uninstall leaves only Claude's own cache (`.orphaned_at` markers); installed trees byte-identical to source; second install a clean no-op; worktree `git status` unchanged. Note: `.dev-marketplace/plugins/` was empty (staging is `plugins:local`'s), the verifier staged and removed its own copies                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-05-astro-static
