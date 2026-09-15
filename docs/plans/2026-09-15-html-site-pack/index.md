---
type: vwf-change-plan
title: html site pack — a plain HTML5+CSS+JS static site beside Astro
requires:
  - docs/plans/archived/2026-09-15-default-per-platform
backlog: []
---

# Plan — html site pack — a plain HTML5+CSS+JS static site beside Astro (2026-09-15)

## Status

**APPROVED** 2026-09-15 by the user.

## Consent

| Action                                            | Granted                                                                                                                                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                                                                       |
| After landing: `/release`                         | ask                                                                                                                                                                                                                       |
| Release `stackgen` publicly                       | minor — one level over the version the base carries at run time (`1.19.0` → `1.20.0` once `default-per-platform` has landed), by editing `plugins/stackgen/.claude-plugin/plugin.json`; tagged by the `/release` ask step |
| Release `site` publicly                           | patch — one level over the base's version (`1.1.21` → `1.1.22` once `default-per-platform` has landed), by `mise run p:site:version` (bare — no positional, refuses a dirty tree, runs first in the bump unit)            |
| Release `vwf` publicly                            | none — vwf names no technology and nothing in `plugins/vwf/` changes                                                                                                                                                      |
| Release `installer` publicly                      | none — untouched                                                                                                                                                                                                          |

**A release recorded here is intent, not authorisation.** The `/release` step is
an `ask` step: the run stops once, reports what it would ship, and waits. The
`run` step publishes nothing and cuts no tag; it stages stackgen into this
machine's dev marketplace, which a **restarted** session picks up.

## Goal

After this lands, a `site` project's architecture round offers **five** entries:
the four Astro bundles, with `astro-ssg` preselected by the flag the
`default-per-platform` plan gave it, and `html` — a `framework/html` pack whose
doctrine is a hand-authored HTML5 page tree with plain CSS and ES-module
JavaScript, served in development by Vite and built by `vite build` into
`./dist`, with a copy-only build documented as the opt-out for a repo that wants
its tree served byte-for-byte. The stylesheet axis is untouched: the project
answers the same round as any site, and the pack states which picks need the
Vite build.

Framing: the request was "add capability for generating static sites using
HTML5+CSS+JS … alternate approach to Astro-SSG … Astro-SSG will still be the
default". The stylesheet options the request names already ship as the
stylesheet axis (`plain-css`, `tailwindcss`, `stylex`, 2026-09-14), so this plan
adds the framework side only.

**Reversal inside the interview**, recorded as one: the first ruling was "both,
as two bundles" (`html-static` with no build, `html-vite` with Vite); the user
then generalised to **one bundle**, `html`, with Vite as dev server and the
build shape a documented choice. That also removed the consumer of a
stylesheet-compatibility mechanism the interview had agreed to plan — parked
below with its design intact.

## Facts the survey established

- Pack types are closed (`plugins/stackgen/assets/taxonomy.md:17-35`);
  `framework` categories are closed at `taxonomy.md:101-103` — `webserver`,
  `orm`, `otel-sdk`, `testing`, `meta-framework`, `ui-library`, `cli`, `iac`,
  `workflow-sdk`, `agent-sdk`. No no-framework token exists.
- The shape to mirror is `plugins/stackgen/stacks/framework/astro/`: `pack.yaml`
  (`:1-15` — `type: framework`, `category: meta-framework`,
  `kind: language-bundle`, `axis: project`, `harness: n/a`, version `0.2.0`),
  `conventions.md` (headings at `:1,13,41,57,69,93,139`; `## Build output` at
  `:41-55`; `## Head` at `:93-137`; "what this component does not decide" at
  `:139-145`), `config/.config/mise/tasks/p/_project/icons` (exec bit,
  `#!/usr/bin/env bash`), `skills/astro/SKILL.md` (`:1-15` frontmatter,
  `user-invocable: false`, `paths:` scoped) and nine references.
- The language-bundle bar is `plugins/stackgen/assets/kinds.md:77-114`, twelve
  topics: 1 Standards; 2 Framework doctrine (conditional); 3 Error handling; 4
  Async/concurrency (conditional); 5 Testing (**not** conditional); 6 Build &
  run; 7 Manifest discipline; 8 Package manager & workspace; 9
  Compiler/toolchain config; 10 Lint & format gate; 11 Config & env; 12
  Observability wiring. Topic-to-component map `:109-114`; the framework ruling
  `:116-134`. A framework pack is topic 2.
- `plugins/stackgen/assets/contracts/web-head.md:163-181` — what a web framework
  pack serving `site`/`webapp` must state: the one layout file and its four
  props; where the site origin is configured and canonical derived; how the
  sitemap is generated and how `index: no` reaches it; the real `public/` path;
  the icons task under the project group; and any unsatisfiable clause stated,
  never omitted. Astro satisfies it at `conventions.md:93-137` and
  `references/head.md`.
- The stylesheet packs name their framework hooks by role, not by framework:
  `stylesheet/tailwindcss/conventions.md:161-181` (`:167` covers "no bundler"),
  `stylesheet/stylex/conventions.md:126-140` (needs a build plugin),
  `stylesheet/plain-css/conventions.md:128-146` (`:140-145` a CSP hook the
  framework owns). Astro's own citation of the axis is
  `framework/astro/conventions.md:139-145`.
- The bundle model is `plugins/stackgen/stacks/bundles/astro-ssg.md:1-14`:
  `axis: project`, `kind: language-bundle`, `platforms: [site]`, six components
  including `language/typescript@0.1.0` and `framework/react@generated`.
  Stylesheet bundle slugs are `plain-css`, `tailwindcss`, `stylex`. The
  `default-per-platform` plan flags `astro-ssg`; this bundle carries no flag.
- Per-project tasks (`p:<id>:dev|build|test`) are authored by init from the task
  library, not shipped by packs
  (`toolchain-manager/mise/skills/mise/references/task-library.md:558-620`); a
  pack contributes only `p/_project/*` files, renamed at copy
  (`assets/pack-format.md:55`, `assets/output-tree.md:143-150`). The deploy
  packs cite the framework's `## Build output` heading:
  `cloud-service/workers-static-assets/conventions.md:73-82`,
  `workers-ssr/conventions.md:108`.
- `language/typescript` (`pack.yaml:8,16`) serves `site`, carries the
  `javascript` token, `manifest: package.json`, `mise_tool: node`, and ships the
  `ux-gate` skill. `/vwf:doctor` reads the manifest the language pin implies
  (`doctor/references/stack-checks.md:105-125`), expects a `dev` capability for
  any screen platform (`plugins/vwf/assets/harness.md:14`) and `screenshots` for
  `site`/`webapp` (`:19`).
- Checker rules a new pack meets: rule 4 frontmatter
  (`scripts/src/check.ts:674-712`, pack `SKILL.md` included at `:699`); rule 11
  config tier (`:419-470`; constants `:270-370` — task shebang
  `bash`/`node`/`python3`, exec bit, config-root allowlist); rule 13 landed
  citations (`:874-935` — no `${CLAUDE_PLUGIN_ROOT}`, no bare `assets/…`, no
  `../` climb, no sibling-pack path in anything under `config/`).
  `inventory.ts:89-94` asserts every bundle component's kind and pin; kinds are
  read from `assets/kinds.md` headings (`inventory.ts:83-92`).
- Pre-commit runs `p:plugins:inventory --check`, so a commit adding a pack and a
  bundle **must carry the regenerated `inventory.md`** — the precedent is
  web-frontend-surface U3 (`2ca10c7e`), which regenerated it inside the pack
  unit (`64→67 packs`).
- Docs the change falsifies (each owned by U2):
  `site/src/content/docs/plugins/stackgen.md:67-79` ("Four bundles on one pack —
  the Astro example"; `:70` "Four bundles serve it"), `:93`, `:117`, `:148`,
  `:214-218` ("Three framework packs ship today … all four bundles");
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:57-64` ("A `site`
  project picks between four Astro bundles");
  `plugins/stackgen/stacks/readme.md:281-283` ("the third `framework/` pack,
  beside effect and astro"); `.claude/skills/stackgen-plugin/SKILL.md` (the pack
  inventory prose). `readme.md:276` and `.claude/docs/plugins.md` carry no count
  — check, edit only if falsified. `inventory.md` is generated.
- Versions when this plan was written: stackgen `1.18.0`, site `1.1.20`; the
  `default-per-platform` plan bumps them to `1.19.0` / `1.1.21` first.
- Commit convention `.config/git-conventional-commits.yaml`: types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; any scope.
- `plugins/**/*.md` is not dprint-formatted; `plugins/*/stacks/*/*/config/` is
  excluded from every formatter and is copied byte-for-byte into target repos.

## Assumed decisions — confirm or override at review

| #  | Decision                      | Ruling                                                                                                                                                                                                                                                                                                                                                                                                            | Rejected                                                                                                                    | Unit |
| -- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1  | Pack name and category        | `framework/html`, `category: document` — a new token appended to `taxonomy.md:101-103` with a one-line gloss ("a hand-authored page tree; the build, if any, is a bundler, not a framework").                                                                                                                                                                                                                     | `meta-framework` — Vite is a bundler, and the token would misdescribe the pack; `vanilla`, `static-site` names              | U1   |
| 2  | The bundle                    | One bundle, `stacks/bundles/html.md`, display name `HTML`, `axis: project`, `kind: language-bundle`, `platforms: [site]`, **no** `default:` key. Components: `astro-ssg`'s list with `framework/astro@0.2.0` replaced by `framework/html@0.1.0` and `framework/react@generated` dropped — every other pin copied verbatim.                                                                                        | two bundles (the interview's first ruling, reversed); pinning react — no islands                                            | U1   |
| 3  | Dev, build, test              | `dev` runs `vite`; `build` runs `vite build` writing `./dist`; the copy-only build (`cp -R src/. dist/`) is documented as the opt-out in one paragraph, with what it loses (hashing, minification, any stylesheet plugin). `test` runs `html-validate` over `src/**/*.html`. The pack ships no task file for these — init authors `p:<id>:*` from the doctrine.                                                   | validating `dist/` — authors edit `src/`; copy-only as the default — Tailwind then needs its CLI and StyleX is unavailable  | U1   |
| 4  | Build output                  | `conventions.md` carries the same fixed `## Build output` heading as Astro's, stating `./dist`, so `workers-static-assets`' citation holds without edit.                                                                                                                                                                                                                                                          | a different output dir                                                                                                      | U1   |
| 5  | The icons task                | `framework/astro/config/.config/mise/tasks/p/_project/icons` is **byte-copied** (`cp -p`, exec bit kept) to `framework/html/config/.config/mise/tasks/p/_project/icons`. A shared home for the task is parked.                                                                                                                                                                                                    | citing Astro's file — rule 13 forbids a sibling-pack path in anything landed                                                | U1   |
| 6  | Scripts                       | ES-module plain `.js` by default (`<script type="module">`); `.ts` is allowed and stated as such, since Vite compiles it and the language pin is TypeScript.                                                                                                                                                                                                                                                      | JS-only                                                                                                                     | U1   |
| 7  | StyleX on the copy-only build | `conventions.md`'s stylesheet paragraph states: `plain-css` needs nothing; `tailwindcss` uses the Vite plugin under the default build and its CLI under copy-only; `stylex` needs the Vite build, so a repo on the copy-only opt-out cannot pick it. No `stylesheets:` allowlist — parked.                                                                                                                        | the allowlist mechanism now — no consumer once the bundle is one                                                            | U1   |
| 8  | The web-head contract         | No layout file exists: each page carries its full head, and the doctrine states the contract's layout clause as met per page (a checklist of the head set every page repeats, validated by `html-validate`). `robots.txt` and `sitemap.xml` are hand-authored under `public/`, stated as such. Origin is one constant in `vite.config.ts` read by nothing at build — the pages carry absolute canonicals by hand. | an include plugin for a shared head — a dependency for one file; generating the sitemap — no build step owns page discovery | U1   |
| 9  | Inventory in the pack commit  | U1 owns `plugins/stackgen/stacks/inventory.md` and runs `mise run p:plugins:inventory` as its last edit, the one generator exception in this plan, because pre-commit's `--check` refuses a pack+bundle commit without it.                                                                                                                                                                                        | gates-and-bump only — the wave-1 commit cannot pass                                                                         | U1   |
| 10 | Decision record               | U2 writes `docs/memory/decisions/2026-09-15-html-site-pack.md` per `assets/memory.md`: the pack, the one-bundle reversal, decisions 1, 3, 7 and 8 with their rejected alternatives, and the parked mechanism.                                                                                                                                                                                                     | —                                                                                                                           | U2   |
| 11 | Model                         | opus for every unit.                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                                                                           | all  |

## New dependencies

None in this repo. Two packages the pack's doctrine names for **target** repos,
as devDependencies, both to be vetted by `/stackgen:stackgen-reputation` and
Context7-checked by U1 before any version or config key is written:

- `vite` — dev server and `build`; preferred over `sirv-cli`, caddy and
  `live-server` because it gives live reload and is the one dependency the Vite
  build needs anyway (U1).
- `html-validate` — the Testing topic; preferred over "not applicable" (every
  pack names a test) and a Playwright smoke (ux-gate already renders) (U1).

## Units

| Id | Wave | Unit file                                      | Owns                                                                                                                                                                                                    | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-pack-and-bundle.md](01-pack-and-bundle.md) | `plugins/stackgen/stacks/framework/html/**`, `plugins/stackgen/stacks/bundles/html.md`, `plugins/stackgen/assets/taxonomy.md`, `plugins/stackgen/stacks/inventory.md` (regenerated)                     | —          | pending |        |
| U2 | 2    | [02-docs.md](02-docs.md)                       | `plugins/stackgen/stacks/readme.md`, `.claude/skills/stackgen-plugin/**`, `.claude/docs/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-15-html-site-pack.md` | U1         | pending |        |
| U3 | 3    | [03-gates-and-bump.md](03-gates-and-bump.md)   | `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                   | U2         | pending |        |

## Shared-file rule

| File                                                                                   | Why it collides                                 | Owner   |
| -------------------------------------------------------------------------------------- | ----------------------------------------------- | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`                                          | version                                         | U3 only |
| `site/package.json`                                                                    | version                                         | U3 only |
| `.claude-plugin/marketplace.json`                                                      | generated                                       | U3 only |
| `plugins/stackgen/stacks/inventory.md`                                                 | generated; must land with the pack (decision 9) | U1 only |
| `plugins/stackgen/stacks/readme.md`, `CLAUDE.md`, `readme.md`, `.claude/**`, `site/**` | human-facing docs                               | U2 only |
| `plugins/stackgen/stacks/framework/astro/**`                                           | read as the model and copied from; never edited | nobody  |

## Waves

- **Wave 1 — U1.** One unit: the pack, its bundle, the taxonomy token and the
  inventory it changes, in one commit.
- **Wave 2 — U2.** Docs over the wave-1 delta, plus the decision record.
- **Wave 3 — U3.** Bumps, the marketplace, the full gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line must
be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                           |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages stackgen into this machine's dev marketplace and updates the install; publishes nothing; a restarted session picks it up |
| `/release`                 | ask  | Tags `stackgen-v<the version U3 wrote>` and `site-v<the version U3 wrote>`; the run stops and asks first                        |

## Gates the orchestrator keeps

- After wave 1: `mise run p:plugins:check` green, and
  `command grep -rnE 'CLAUDE_PLUGIN_ROOT|\.\./|stacks/framework/astro' plugins/stackgen/stacks/framework/html/config`
  is empty (rule 13 by hand).
- After wave 1:
  `cmp plugins/stackgen/stacks/framework/astro/config/.config/mise/tasks/p/_project/icons plugins/stackgen/stacks/framework/html/config/.config/mise/tasks/p/_project/icons`
  is silent, and `test -x` on the copy passes.
- After wave 1: the regenerated `plugins/stackgen/stacks/inventory.md` counts
  four `framework` packs, one more bundle than before wave 1, and the same kind
  count — read the header line and the framework rows.
- After wave 1, in a throwaway directory outside the repo: a `package.json` with
  `vite` and `html-validate` at the versions the pack's doctrine names, an
  `index.html` carrying the head set the pack's `## Head` lists, and the pack's
  `vite.config.ts` — `pnpm install`, `pnpm exec vite build` writes
  `dist/index.html`, `pnpm exec html-validate index.html` exits 0. Pass
  condition: both commands exit 0.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator (decision 9 is the one named exception), never edits a doc, never adds
a dependency this file does not list, never commits. A unit deletes with plain
`rm`, never `git rm` — it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **A second bundle** (`html-static` / `html-vite`) — reversed to one in the
  interview.
- **`webapp` on the bundle's platforms** — the request is a static site; a web
  application on a page tree is a later ruling.
- **A `stylesheets:` allowlist on project-axis bundles** — parked below.
- **A shared home for the icons task** — parked below.
- **Editing any Astro file** — the four Astro bundles and the pack are the
  model, never the target.
- **This repo's own `site/`** — stays on its own Astro, as the site plan and
  web-frontend-surface both ruled.
- **A `config_format` or `blueprint_format` bump** — no vwf change.

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

## Run log

<written by /vwf:change-execute; empty at approval>

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-15-html-site-pack
