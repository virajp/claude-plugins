---
type: repo-plan
title: Astro on the project axis — a real framework pack carrying both output
  modes, and two static bundles; plus the /vwf:init defects from the first real
  run
requires: [ docs/plans/2026-09-05-cloudflare-workers-static ]
---

# Plan — Astro on the project axis, and the `/vwf:init` defects from the first real run (2026-09-05, amended 2026-09-06)

## Status

**APPROVED**

APPROVED 2026-09-05 by the user for the Astro half, after the self-review.
Amended 2026-09-06 with the `/vwf:init` defects at the user's direction ("You
can add the fixes to that itself"); the amendment APPROVED 2026-09-06 by the
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
`1.1.0` is staged but untagged, so the `1.2.0` tag ships the Workers pack too;
site `1.1.3` is bumped and unreleased, so `1.1.4` ships both.

## Goal

After this lands, the stack menu offers three project-axis bundles for platform
`site`, all pinning one real `framework/astro` pack: `typescript-astro-react`
(the existing SSR · React bundle, re-pinned from `framework/astro@generated` to
`@0.1.0`), `typescript-astro-static` (new: no islands framework, zero JavaScript
by default) and `typescript-astro-static-react` (new: static output with React
islands). The pack's doctrine covers both output modes — `output: 'static'`,
Astro's default, needing no adapter, and `output: 'server'` with an adapter —
and states when each is the answer. It states the build-output contract as a
**named fact** in its conventions: the build output is `./dist`, and a deploy
pack may rely on it — which is what the Workers Static Assets pack's
`assets.directory` cites.

**And**, from the amendment: a repo that `/vwf:init` shapes can, with no hand
repair, make its first commit, cut a worktree and land it through its own merge
tasks; every promise a payload makes about init is one init keeps; and the
editor and shell the repo is used from are set up by the same composition that
sets up everything else.

**Framing — Astro.** The greenfield `/vwf:init` → `/vwf:architecture` run on the
user's website repo (Astro, static, one page, no React) found that the only
`platforms: [site]` bundle is named "Astro (SSR)", with both framework
components `@generated`. The user ruled that Astro has two modes and stackgen
must support both. The taxonomy supports a sibling bundle, not a mode — no
output-mode key exists in the bundle frontmatter, and SSR is load-bearing in
that bundle's body (the Node adapter, an Effect `AppLayer`, same-origin proxy
endpoints) — on the precedent `typescript-effect-cli` /
`typescript-parseargs-cli` already set: two bundles, one platform, differing by
what frameworks are present.

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

**Three reversals (the amendment)**, each recorded by the docs unit:

1. **The charter fence reopens for editor settings.** `output-tree.md:202-214`
   keeps editor settings outside every pack. Narrowed: whole editor files stay
   outside; per-pack fragments the orchestrator composes come inside; and
   `dprint.json` joins the root allowlist as an `extends` shim.
2. **Init now touches git history.** `new-repo.md:20` — "Nothing else in this
   pipeline touches git history" — becomes a git pass with two consents.
3. **The slug reason** written on 2026-09-05 into `materializer.md:57-68` is
   replaced by the measured mechanism.

**This plan stands on the Workers plan.** The static bundles name
`cloudflare-workers-static` as the deploy pairing they were built for, the dist
fact is what that pack's `./dist` cites, and the manual describes the two
together. `requires:` is set accordingly, and that plan is `COMPLETE`.

## Facts the survey established

**This repo.**

- stackgen is `1.1.0` (staged locally as `1.1.0+1`, untagged); vwf `19.12.0`;
  site `1.1.3` (unreleased). `develop` is at `7ce78db5`.
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
  scoped include.
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
- Astro (`/withastro/docs`, 2026-09-05): `output` defaults to `'static'`;
  `outDir` defaults to `./dist`; `export const prerender = false` opts a route
  into on-demand rendering and needs an adapter.

## Assumed decisions — confirm or override at review

User rulings are quoted; rows marked *(assumed)* were made by the planner and
are the review surface. D1–D14 are the Astro half (approved 2026-09-05); D15–D37
are the amendment.

| #  | Decision                       | Ruling                                                                                                                                                                                                                                                                                                                                                                                                   | Rejected                                                                          | Unit       |
| -- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| 1  | Shape                          | A sibling bundle per mode, not a mode field — the frontmatter has no output-mode key, SSR is load-bearing in the existing body, and `typescript-effect-cli` / `typescript-parseargs-cli` is the precedent.                                                                                                                                                                                               | renaming the SSR bundle; a mode key; a per-project setting                        | U2         |
| 2  | Pack                           | "Ship a real framework/astro pack": the second framework pack in the tree, redeeming `framework/astro@generated`.                                                                                                                                                                                                                                                                                        | keep `@generated`; fold `framework/react` in too                                  | U1, U2     |
| 3  | Modes                          | "One pack, both modes, two bundles": the pack's doctrine covers `output: 'static'` and `output: 'server'` + adapter and says when each is the answer; the SSR bundle re-pins `framework/astro@0.1.0`; both static bundles pin the same pack.                                                                                                                                                             | two packs; SSR bundle left on `@generated`                                        | U1, U2     |
| 4  | React                          | "Two static bundles, with and without": `typescript-astro-static` carries no islands framework; `typescript-astro-static-react` carries `framework/react@generated`.                                                                                                                                                                                                                                     | no React; React only                                                              | U2         |
| 5  | dist seam                      | "Framework pack conventions, as a named fact": `framework/astro`'s `conventions.md` and its Framework-doctrine reference state, under a fixed heading, that the build output is `./dist` (Astro's `outDir` default) and a deploy pack may rely on it; the Workers pack's `./dist` cites that heading.                                                                                                    | a `build_output:` payload field (reaches into vwf); leave it with the deploy pack | U1         |
| 6  | Slugs *(assumed)*              | `typescript-astro-static` ("TypeScript · Astro (static)") and `typescript-astro-static-react` ("TypeScript · Astro (static) · React"); `typescript-astro-react` keeps its name — "(SSR)" is accurate now a sibling exists.                                                                                                                                                                               | `typescript-astro-ssg`; renaming the SSR bundle                                   | U2         |
| 7  | Composition *(assumed)*        | Static: `language/typescript@0.1.0`, `package-manager/pnpm@0.1.0`, `toolchain-gate/tsconfig@0.1.0`, `toolchain-gate/eslint@0.1.0`, `framework/astro@0.1.0`. Static · React adds `framework/react@generated`. Neither carries `framework/effect` — it exists in the SSR bundle for the server `AppLayer`.                                                                                                 | Effect in the static bundles                                                      | U2         |
| 8  | Category and scope *(assumed)* | `category: meta-framework` (Astro owns the build, as Effect owns composition); the skill is `user-invocable: false` and paths-scoped to `**/*.astro`, `**/astro.config.*` and `**/src/content/**`.                                                                                                                                                                                                       | `ui-library`; model-invocable                                                     | U1         |
| 9  | Specimen *(assumed)*           | This repo's `site/` is the cited static specimen for the four config facts: `output`, `trailingSlash: "always"` and why, the CSP-forced `inlineStylesheets: "never"` + `assetsInlineLimit: 0`, and `site:` for sitemap and canonicals. Cited as facts and reasons, never as paths or the domain.                                                                                                         | uncited doctrine                                                                  | U1         |
| 10 | Testing *(assumed)*            | Static: Vitest, node environment, no jsdom — there are no islands to mount. Static · React: the SSR bundle's Vitest + jsdom + Testing Library for the islands. The SSR bundle's 100 %-coverage rule is **not** copied; each static bundle states its scoped include and leaves the threshold to the repo.                                                                                                | the 100 % rule verbatim                                                           | U2         |
| 11 | SSR body *(assumed)*           | The SSR bundle's body keeps its decisions but **cites** the pack for what Astro is and how output modes work, rather than restating them; the one-line "SSR is not a published API" ruling stays.                                                                                                                                                                                                        | leaving the body untouched                                                        | U2         |
| 12 | Deploy pairing *(assumed)*     | Each static bundle's body names `cloudflare-workers-static` as the deploy pairing it was built for, in the same voice `cloudflare-zero-trust.md:26-32` names its pairing, and states the artifact is a directory of files at `./dist` per the pack's named fact. Frontmatter names no deploy slug.                                                                                                       | naming it in frontmatter (the axes are independent)                               | U2         |
| 13 | References *(assumed)*         | `skills/astro/references/`: `framework-doctrine.md` (topic 2, the one owed artifact — both modes and the mode choice), `static-output.md`, `server-output.md`, `content-and-routing.md`, `build-output.md` (the named dist fact), `testing.md`. Six.                                                                                                                                                     | a single reference; per-integration references                                    | U1         |
| 14 | Release (2026-09-05)           | "No release yet" for stackgen; "No site release." — **overtaken** by the consent block above on 2026-09-06.                                                                                                                                                                                                                                                                                              | minor; patch                                                                      | U4         |
| 15 | Slug                           | One asset `plugins/stackgen/assets/ids.md`: lowercase; runs outside `[a-z0-9]` → one `-`; trimmed. Reason: mise strips an extension from a task's **last** segment and `_default` makes the directory that segment; plus the alias and flag grammars. Init §7 and the materializer cite it.                                                                                                              | define in init; dots-only                                                         | U5, U6, U9 |
| 16 | Branches                       | "If the git is empty, start with `develop` and NOT `main`. Once a commit is done, add `main`." Existing repo: create `develop` from `main` where missing. "No matter which is default branch, work must flow from feature branches/worktree to develop to main."                                                                                                                                         | main first; leave an existing repo's branches alone                               | U9         |
| 17 | Forge default                  | "Ask user which branch must be default branch in remote … with `develop` being default selection." Set it when it can, print it when it can't: a task `setup:default-branch <branch>` uses the forge CLI it finds (`gh`, `glab`), else prints the command; init runs the task and names no forge.                                                                                                        | print only; record it in the repo                                                 | U6, U9     |
| 18 | Commits                        | "At the end of `init`, ask user to commit (local commit, push, etc)": init commits on consent — commit / commit and push / leave — with a fixed `ops:` message; push is the second consent. "When there's a change in `.config/pre-commit-config.yaml`, it must be committed independently (along with it's dependencies like `.config/git-conventional-commits.yaml`)" — that commit goes first, alone. | init stages and prints; never pushes                                              | U9         |
| 19 | Branch guard                   | `no-commit-to-branch --branch main` ships unchanged at the commit stage; the new-repo first commit precedes hook wiring by construction, which is the whole fix for defect 3.                                                                                                                                                                                                                            | guard `develop` too; `stages: [manual]`                                           | U7, U9     |
| 20 | Lockfile                       | "Use lock file is good for reproducability, let's start using it for all projects, specifically brownfield projects": `mise.<env>.lock` files are tracked, one per config declaring tools; `.gitignore` unchanged; every "`mise.lock`" claim corrected to the per-config rule.                                                                                                                           | ignore it                                                                         | U6         |
| 21 | Merge tasks                    | `_scripts/merge` gains a predicate — the destination branch must exist locally — before the hook pass, with a message naming the branch model.                                                                                                                                                                                                                                                           | leave the checkout failure                                                        | U6         |
| 22 | Unbacked promises              | "In greenfield it will be impossible for `init` to fill this fully but it can still have commit scopes when it's re-run at later stages": the `commitScopes` and forge-link comments say init fills them on a re-run once the registry / remote exist; init gains that step.                                                                                                                             | drop the claims                                                                   | U7, U9     |
| 23 | Re-run                         | "`init` must be run at regular interval to keep everything in sync": doctrine names the moments (after architecture, after a pack bump, fresh clone), and `/vwf:doctor` gains a finding — adapter lockfile vs installed packs, registry ids vs `commitScopes` and `p:<id>` groups, missing `develop`/`main` — that says "run /vwf:init".                                                                 | offer from architecture only; doctrine only                                       | U9, U10    |
| 24 | Id source changed              | A re-run after architecture renames `p/<repo>/` → `p/<registry-id>/`; the report says "id source changed", not "a pack moved"; idempotence is claimed per id source.                                                                                                                                                                                                                                     | —                                                                                 | U9         |
| 25 | Step 10 guard                  | The bootstrap offer is conditional on step 9 having run.                                                                                                                                                                                                                                                                                                                                                 | —                                                                                 | U9         |
| 26 | Editor shape                   | "Composed from per-pack fragments": each pack ships `config/.config/vscode.d/<pack>.jsonc` (`settings`, `nesting`, `extensions`); init merges into the two editor files between one marked block placed first, user keys after it winning. Init never names the editor — the convention names the target.                                                                                                | one hygiene payload; a profile for the common set                                 | U5, U6–U9  |
| 27 | Nesting                        | "all ignore files are ideally grouped under gitignore": parent `.gitignore` collects every ignore file any pack ships; each pack nests its own files; the hygiene fragment carries the editor baseline.                                                                                                                                                                                                  | —                                                                                 | U6, U7, U8 |
| 28 | dprint shim                    | dprint discovery is root-only and cannot be pointed at `.config/`; the gate ships root `dprint.json` = `{ "extends": ".config/dprint.json" }`; the existing-repo path moves a real root `dprint.json` into `.config/` and leaves the shim. The unit verifies `includes` resolve through `extends` on the real CLI.                                                                                       | a symlink                                                                         | U7, U9     |
| 29 | Extension install              | "Per-repo profile generated is better, however it must also clean up stale extensions": `setup:vscode` in the mise pack — `code --profile "$REPO_NAME"`, install the merged list, **prune** what is installed there and not listed; wired into `setup:all`; silent without `code`; prints the one-time share-with-Default step when the profile was empty.                                               | global install; recommendations only                                              | U6         |
| 30 | Aliases                        | "use repo-specific env variables to change the name value": the pack ships `[env] REPO_NAME = "<slug>"` as a marked position, literal, never derived (a worktree's config root is the branch name); the `cc` family lives in the user's global config reading `$REPO_NAME`.                                                                                                                              | full command shipped; `dcc` wrapper                                               | U6, U9     |
| 31 | mise settings                  | `all_compile = false`, `task.timings = true`, `task.disable_spec_from_run_scripts = true`; the third verified against current mise before shipping.                                                                                                                                                                                                                                                      | fish completions postinstall                                                      | U6         |
| 32 | Hygiene adds                   | `.graphifyignore`; a graphify `.gitignore` section (`graphify-out/*`, `!graphify-out/GRAPH_REPORT.md`); `CONTRIBUTING.md`; `.github/ISSUE_TEMPLATE/{bug,feature,config}`.                                                                                                                                                                                                                                | `.config/claude-status.json`                                                      | U8         |
| 33 | Pack adds                      | eslint gate ships `.config/linter.yaml`; pnpm pack ships `.npmrc` (`ignore-scripts=true`, `fund=false`) and the alias `npx = "pnpm dlx"`; mise pack ships `code:count`.                                                                                                                                                                                                                                  | —                                                                                 | U6, U7, U8 |
| 34 | Vocabulary                     | "`setup:external` to setup external dependencies (using pitchfork or docker) and `setup:deps` are used to install internal dependencies": unchanged, restated where the groups are defined.                                                                                                                                                                                                              | renaming `setup:external` to `setup:deps`                                         | U6         |
| 35 | Unused baseline                | "They are the standard; the old repos are behind": nothing dropped; the re-run doctrine and the doctor finding are what bring them up.                                                                                                                                                                                                                                                                   | drop some                                                                         | —          |
| 36 | Allowlist                      | Root allowlist gains `dprint.json`, `.npmrc`, `CONTRIBUTING.md`, `.graphifyignore`, and the directory `.github/` with `.github/workflows/` refused inside it.                                                                                                                                                                                                                                            | —                                                                                 | U5, U11    |
| 37 | Pack versions *(assumed)*      | No pack `version:` moves in this plan; the plugin's minor carries the change. Bumping the mise, gate, hygiene and pnpm packs would force a ref change in every bundle that pins them — including the three Astro bundles U2 writes — and the sync lockfile diffs per file, not per version.                                                                                                              | per-pack minor bumps with every bundle ref updated                                | U6, U7, U8 |

## New dependencies

None. Context7's `/withastro/docs` is the citation source for the pack and is
already available; the pack pins nothing — a repo's manifest carries `astro`,
and the manifest is fenced. The amendment adds no npm package and no mise tool:
`code:count` uses `git ls-files` and `wc`; `setup:vscode` and
`setup:default-branch` invoke `code`, `gh` and `glab` when present and do
nothing otherwise.

## Units

| Id  | Wave | Unit file                                        | Owns                                                                                                                                                                                                                            | Depends on | Status  | Commit |
| --- | ---- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1  | 1    | [01-astro-pack.md](01-astro-pack.md)             | `plugins/stackgen/stacks/framework/astro/**`                                                                                                                                                                                    | —          | pending |        |
| U2  | 1    | [02-astro-bundles.md](02-astro-bundles.md)       | `plugins/stackgen/stacks/bundles/typescript-astro-react.md`, `plugins/stackgen/stacks/bundles/typescript-astro-static.md`, `plugins/stackgen/stacks/bundles/typescript-astro-static-react.md`                                   | —          | pending |        |
| U5  | 1    | [05-ids-and-fence.md](05-ids-and-fence.md)       | `plugins/stackgen/assets/**`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`                                                                                                                      | —          | pending |        |
| U6  | 1    | [06-mise-pack.md](06-mise-pack.md)               | `plugins/stackgen/stacks/toolchain-manager/mise/**`                                                                                                                                                                             | —          | pending |        |
| U7  | 1    | [07-gate-packs.md](07-gate-packs.md)             | `plugins/stackgen/stacks/toolchain-gate/**`                                                                                                                                                                                     | —          | pending |        |
| U8  | 1    | [08-hygiene-and-pnpm.md](08-hygiene-and-pnpm.md) | `plugins/stackgen/stacks/repo-hygiene/**`, `plugins/stackgen/stacks/package-manager/pnpm/**`                                                                                                                                    | —          | pending |        |
| U9  | 1    | [09-init.md](09-init.md)                         | `plugins/vwf/skills/init/**`                                                                                                                                                                                                    | —          | pending |        |
| U10 | 1    | [10-doctor.md](10-doctor.md)                     | `plugins/vwf/skills/doctor/**`                                                                                                                                                                                                  | —          | pending |        |
| U11 | 1    | [11-checker.md](11-checker.md)                   | `scripts/src/**`                                                                                                                                                                                                                | —          | pending |        |
| U3  | 2    | [03-docs.md](03-docs.md)                         | `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/plugin-authoring/**`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/*` | all        | pending |        |
| U4  | 3    | [04-gates.md](04-gates.md)                       | `plugins/*/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                          | U3         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. The ids are not contiguous by wave on purpose: U1–U4 are the
2026-09-05 units and keep their files; U5–U11 are the amendment.

## Shared-file rule

| File                                                                                                                                      | Why it collides                                                               | Owner                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `plugins/*/.claude-plugin/plugin.json`, `site/package.json`                                                                               | several units bumping one version is a lost update                            | U4 only                                                                    |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                 | generated; regenerating mid-wave races                                        | U4 only (see Waves for the inventory caveat)                               |
| `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/**`, `docs/memory/decisions/*` | n units editing one doc                                                       | U3 only                                                                    |
| `plugins/stackgen/stacks/framework/astro/pack.yaml`                                                                                       | U2's refs name the version U1 declares                                        | U1 only; U2 reads it, never edits it                                       |
| `plugins/stackgen/assets/ids.md`, the editor-fragment subsection of `pack-format.md`                                                      | U6–U9 cite them by name; only one unit writes them                            | U5 only; the others cite by the names this plan fixes                      |
| `plugins/stackgen/stacks/bundles/*.md` other than the three Astro bundles                                                                 | pack versions do not move (D37), so no bundle ref changes                     | nobody                                                                     |
| `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.gitignore`                                                                     | U6's lockfile ruling could tempt an edit; the lock is tracked, nothing to add | U8 only                                                                    |
| every pack's `pack.yaml` `version:`                                                                                                       | D37                                                                           | nobody                                                                     |
| `plugins/stackgen/skills/stackgen-sync/SKILL.md`                                                                                          | restates composition order and the allowlist                                  | nobody this plan; a falsified passage is `DOCS FALSIFIED:` for U3 to route |

## Waves

- **Wave 1 — U1, U2, U5, U6, U7, U8, U9, U10, U11.** Nine disjoint trees: the
  Astro pack; the three Astro bundles; the stackgen assets and the materializer;
  the mise pack; the gate packs; the hygiene and pnpm packs; init; doctor; the
  checker. U2's component refs name `framework/astro@0.1.0`, the version U1's
  `pack.yaml` declares; U2 reads that file and never edits it. U6–U9 cite
  `assets/ids.md` and the editor-fragment convention by the names this plan
  fixes, so they need nothing U5 writes first. As the previous runs established,
  this repo's repo-wide pre-commit hooks force wave 1 into **one commit**: the
  payload root files U7 and U8 add need U11's allowlist in the same tree, and
  the new inventory entries need the regenerated inventory.
- **Wave 2 — U3.** Docs and the four decision docs, from the `docs-reconciler`
  findings plus every `DOCS FALSIFIED:` line.
- **Wave 3 — U4.** Versions, generators, full gate, `target-verifier`.

**Inventory caveat.** This repo's pre-commit runs `plugins:inventory --check`,
and a new pack plus two new bundles make the generated inventory stale, so no
wave-1 commit can land until it is regenerated. The previous runs resolved this
by letting the orchestrator run `plugins:inventory` at the wave-1 commit; the
same ruling applies. U4 re-runs it with the version bumps.

## Wave gate

`mise run plugins:marketplace --check`, `mise run plugins:inventory --check`,
`mise run plugins:check`, `mise run plugins:shellcheck`, `pnpm vitest run`,
`pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, `mise run site:check` from wave 2 on,
plus the wave review, plus every report read for `UNRESOLVED:`.

Plan-specific lines, Astro:

- `grep -c "framework/astro@generated" plugins/stackgen/stacks/bundles/*.md`
  totals **0** after wave 1; `grep -l "framework/astro@0.1.0"` over the same
  glob returns exactly the three Astro bundles.
- `grep -n "platforms" -A1 plugins/stackgen/stacks/bundles/typescript-astro-*.md`
  shows `- site` under all three.
- `grep -n "unconditional" plugins/stackgen/stacks/bundles/typescript-astro-*.md`
  is empty.
- The three Astro bundles trip neither retired-terms trap: no backticked `web`
  beside another platform token, no literal `stacks/project/`.
- `plugins/stackgen/stacks/framework/astro/skills/astro/SKILL.md` parses as
  strict YAML frontmatter with `user-invocable: false` and a non-empty `paths:`
  list.

Plan-specific lines, the amendment:

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
   (or the equivalent YAML read) returns exactly three files, none carrying
   `unconditional:` — the menu will offer all three.
2. **Every component ref resolves.** For each `components:` line across the
   three Astro bundles, either the ref ends in `@generated` or
   `plugins/stackgen/stacks/<type>/<slug>/pack.yaml` exists **and** declares the
   named version. This is the check `inventory.ts` does not do (`:161-165`), so
   the orchestrator does it by hand; a mismatch is a wave-1 finding for U2 (a
   wrong ref) or U1 (a wrong version), not a GAP.
3. **The specimen facts are true.** The four D9 facts the pack cites grep true
   against `site/astro.config.ts`: `output: "static"`,
   `trailingSlash: "always"`, `inlineStylesheets: "never"`,
   `assetsInlineLimit: 0`.
4. **The dist fact is citable.**
   `grep -n "./dist" plugins/stackgen/stacks/framework/astro/conventions.md`
   hits a line under a fixed heading, and the same heading text appears in
   `skills/astro/references/build-output.md`.
5. `mise run plugins:check` and `mise run plugins:inventory --check` exit 0 from
   the worktree.

**The scratch materialization**, after wave 1 and before wave 2, in a temp git
repo whose directory is named `scratch.dev`:

6. Compose, in the documented order, the `config/` trees of
   `toolchain-manager/mise`, the four `toolchain-gate` packs of the `repo-gates`
   bundle, `repo-hygiene/repo-hygiene` and `package-manager/pnpm`, skipping
   `_`-prefixed top-level entries; trust the mise config.
7. **The slug.** Author `p/scratch-dev/_default` by hand (init's file) and
   `p/scratch.dev/_default` beside it as the control:
   `MISE_ENV=dev mise tasks
   ls --hidden` lists `p:scratch-dev` and lists the
   control as `p:scratch`, not `p:scratch.dev`. Remove the control.
8. **The merge predicate.** With one commit on `main` and no `develop`,
   `MISE_ENV=dev mise run code:merge:develop` exits non-zero with U6's message,
   and `git branch --show-current` is still `main` — nothing was checked out and
   no hook ran.
9. **The lock.** `.config/mise.dev.lock` is created by `mise install`; commit
   it; `MISE_ENV=dev mise run setup:worktree` (or `mise install` again) leaves
   `git status --porcelain` empty.
10. **The editor composition.** Run the merge algorithm from
    `fragments-and-sections.md` by hand over the composed fragments:
    `.vscode/settings.json` parses as JSONC, its `explorer.fileNesting.patterns`
    has a `.gitignore` parent whose children include `.graphifyignore`, and
    `.vscode/extensions.json` lists the union with no duplicate; a key written
    by hand after the block survives a second merge byte-for-byte.
11. **The shim.** From the scratch root, `dprint check` (or
    `dprint output-file-paths`) through the root `dprint.json` yields the same
    file set as `dprint --config .config/dprint.json output-file-paths`.
12. **`setup:vscode`, hermetically.** With `REPO_NAME=scratch-dev` and a two-id
    `.vscode/extensions.json`, run the task with `code` wrapped to add
    `--user-data-dir` and `--extensions-dir` under the temp dir: both ids
    install into a profile named `scratch-dev`; plant a third by hand, re-run:
    it is uninstalled. Never the real user directory.
13. `mise run plugins:check` from the worktree reports every new payload file
    accepted.

Pass = all thirteen. A failure is a wave-1 finding routed to the owning unit (U5
for the asset, U6 for the mise pack, U7 for the shim, U8 for the fragment
baseline, U9 for the algorithm, U11 for the checker), not a GAP.

**`target-verifier`** runs inside U4: a hermetic install of the working tree's
dev marketplace shows `stackgen@1.2.0` and `vwf@19.13.0`, the installed stackgen
tree contains `stacks/framework/astro/pack.yaml`, all three
`stacks/bundles/typescript-astro-*.md`, `assets/ids.md`, the root `dprint.json`
shim under the dprint gate's `config/`, and at least one `vscode.d/*.jsonc`; the
installed vwf tree's `skills/init/references/new-repo.md` contains
`setup:default-branch`; every task file survives with its executable bit; and
uninstall leaves only Claude's own cache.

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
  rejected); both React bundles keep `framework/react@generated`.
- **An output-mode field on bundles or a per-project setting.** The taxonomy
  supports a sibling bundle (D1).
- **A `build_output:` payload field.** The shape E3 recommended, but it changes
  the template payload vwf parses — a vwf plan, parked.
- **Touching `site/`** beyond the manual under `site/src/content/docs/`. The
  Astro config is the cited specimen, read-only.
- **A scratch Astro project** (`pnpm create astro`) as an orchestrator gate —
  network, tooling and a manifest the pack must not write.
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
- **Per-pack version bumps** (D37).
- **`.config/claude-status.json`** — declined at the hygiene pick.

## Parked

- **`framework/react` as a real pack** — now referenced `@generated` from two
  bundles (`typescript-astro-react`, `typescript-astro-static-react`) plus
  `typescript-hono-refine`. Same shape as this plan's U1.
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

## Run log

<written by execute-plan; empty at approval>

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-05-astro-static
