---
type: vwf-change-plan
title: vwf's init, setup and doctor and stackgen's materializer run on the
  template renderer
requires: [ docs/plans/2026-10-05-tool-config-templates ]
backlog: []
backlog_pieces: [ B80 ]
---

# Plan — vwf's callers run on the template renderer (2026-10-05)

## Status

**APPROVED**

APPROVED 2026-10-05 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release vwf publicly                              | none    |
| Release stackgen publicly                         | none    |

**The mode recorded here is the consent.** `p:plugins:local` runs on a green
landing without a prompt; the staged plugins are picked up only by a
**restarted** session. From this landing stackgen and vwf agree — use them on a
scratch repo; existing repos stay on the old layout until plan 4's reshape.
**Release none** — the chain releases after plan 4. vwf (`20.1.0`) is already a
minor above `vwf-v20.0.1`, stackgen (`3.0.0`) a major above `stackgen-v2.0.0`:
no manifest bump. A pack edited here takes one patch only if its `version:` has
not moved since `stackgen-v2.0.0`.

## Goal

vwf's `init`, `setup` and `doctor`, and stackgen's materializer and sync, work
on plan 2's renderer: a repo is shaped by tool-config's `all` writing
`.config/stackgen.yaml`; packs are applied with `pack` and removed with
`pack-remove`; a pack's values come from a `values:` list in its `pack.yaml`;
doctor finds drift by previewing; `.config/vwf.yaml` loses `answers:`
(`config_format` 23); nothing in vwf names a retired verb.

**Plan 3 of the four-plan chain** — 1 `2026-10-05-tool-config-template-engine`,
2 `2026-10-05-tool-config-templates`, 3 this, 4 `2026-10-05-reshape-migration`.
Requires plan 2.

**Reversals, confirmed at the gate 2026-10-05** — U6 writes one decision doc
each:

1. `2026-09-22-persisted-answers.md` lines 35-56 (init's answers live in
   `vwf.yaml` `answers:`) → forge and secrets live in `stackgen.yaml`,
   `update_bot` retires, `answers:` goes (`config_format` 23).
2. `2026-09-27-tool-config-hygiene.md` lines 45-46 ("shaped means the
   `tool-config/*` records are present") → shaped means `.config/stackgen.yaml`
   with `format: 1`.
3. `2026-10-03-setup-ai-validates-vwf.md` D5 (a pack plugin arrives through a
   `tool-config:` `add-plugin` entry) and D7 ("landed and nobody edited" from
   the record) → `setup/ai/<slug>` subtasks; an unedited file is one with no
   `preview` row.

Plan 2 started before this plan's interview found that deleting swiftui's
`machine_env:` also deletes each value's `detect` command and `question`; the
user ruled: *"Plan 2 has started, if it has not then amend it otherwise add to
plan 3"* — so F1 restores them as `values:`.

## Facts the survey established

Line numbers below are before plan 2 ran; re-locate each passage by its words.

- **Plan 2's interface** —
  `docs/plans/2026-10-05-tool-config-templates/index.md` (read its Assumed
  decisions E1–E23 and Template names): the script's four calls `all`,
  `pack --slug --dir --set`, `pack-remove --slug` and `upgrade`, each with
  `preview` and `--answers`; `stackgen.yaml` keys `format`, `repo_name`,
  `merge_model.develop`, `merge_model.main`, `members`, `scopes`, `node`,
  `external`, `forge`, `secrets`, `packs.<slug>.*`; packs carry `templates/`
  beside `config/`; `setup:ai:all` with `setup/ai/<slug>`; `code:check:all`,
  `code:lint:all`, `code:format:all`. Read the landed tree, not the plan, where
  they differ, and report the difference as `GAP:`.
- **swiftui's retired metadata** —
  `git show add4e104:plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  lines 37-77: `machine_env:` entries for `XCODE_VERSION`, `SIMULATOR_PLATFORM`,
  `SIMULATOR_DEVICE` and `SIMULATOR_OS`, each with `detect:` and `question:`.
- **init** (`plugins/vwf/skills/init/`): `SKILL.md` lines 50-62, 386-396,
  688-696 (the `all` call), 61 and 231 (mode by `source: tool-config/` records),
  87 and 501-504 (`--scopes`), 393 (runtimes), 118-126 and 514-515 (merge models
  into marked positions), 579-622 (answers incl. `update_bot`), 657 and 667
  (marked positions). `references/new-repo.md` lines 82-115 (flag table;
  `--update-bot` at 98; `preview all` at 108), 143-197 (renovate/update_bot),
  293-295 (`gitignore:` requester), 335 (`add-hook` example), 461-480 (marked
  positions, `MEMBER_ALIASES`), 497 (`machine_env`), 640-673 (merge-model rows).
  `references/existing-repo.md` lines 114, 160, 213, 234, 277, 480, 491-562,
  629, 706, 795-817, 958, 992-995, 1114, 1203. `references/tool-configs.md`
  lines 32, 47-75. `references/readme-and-license.md` lines 27, 177-180.
  `assets/hygiene/CONTRIBUTING.md` lines 38-70 (`env.toml`, the merge-model
  variables, `code:format`/`code:lint`).
- **setup** (`plugins/vwf/skills/setup/`): `SKILL.md` lines 108-113 (shaped
  check by records), 162 (`.vscode`), 209 (`machine_env`), 216-236 (re-runs each
  pack's `tool-config:` list), 324 (graphify hook landed by `all`).
  `references/materialize.md` lines 33-46 and 112-154 (answers, update_bot, the
  forge rewrite at 137), 168-178 (preview/answers incl. `all add-exclude` and
  `apply-entries`), 202-223 (pack lists re-run), 245-333 (`machine_env` and
  `set-env`, at 261 and 309). `references/migrate-pipeline.md` lines 28-44;
  `references/format-lineage.md` lines 126-127; `references/onboard-pipeline.md`
  line 58; `references/memory-tree.md` lines 13-14 (the `# ==== vwf memory ====`
  banner, B80 item 4); `references/workspace-structure.md` line 56.
- **doctor** (`plugins/vwf/skills/doctor/`): `references/stack-checks.md` lines
  105 (`tool-config mise add-tool` remedy), 290-300 (baseline predicates on
  `tool-config/*` records and renovate), 446-452, 531-549, 613-618, 639, 653
  (marked positions), 556-565 (calls `check`), 668-675 and 720 (`tools*.toml`);
  `SKILL.md` lines 178, 214-216; `references/code-intelligence.md` lines 16
  (`tools.dev.toml`) and 37 (the remedy lacks `MISE_ENV=dev`, B80 item 2);
  `references/harness-and-memory.md` line 56.
- **vwf assets**: `plugins/vwf/assets/vwf-config.md` lines 62-79, 123-128,
  647-674 (`linkage`, `members`, the `answers` schema, retirements);
  `stack-adapter.md` lines 289, 373-379, 411-413; `stack-vocabulary.md` line 56;
  `memory.md` line 249.
- **Other vwf ignore writers** (the cancelled hygiene plan's H4): setup's memory
  tree, the mockups skill, screen-review, git-workflow's worktree setup — U5
  finds each with
  `rg -n "gitignore|graphifyignore" plugins/vwf --glob '!**/init/**' --glob '!**/setup/**'`.
- **stackgen**: `plugins/stackgen/assets/pack-format.md`, `output-tree.md`,
  `skills/stackgen-stack-template/SKILL.md`,
  `skills/stackgen-stack-template/references/materializer.md`,
  `skills/stackgen-sync/SKILL.md` — as plan 2's U6 left them.
- **Checker** — `scripts/src/check.ts` as plan 2's U5 left it (refuses
  `machine_env:`, checks pack template `@@` names).
- **Docs** — `site/src/content/docs/plugins/vwf.md` lines 74 (`tools.dev.toml`),
  936-965, 1153-1177, 1245-1268 (renovate, `.vscode`, update-bot), 1068-1071 and
  1603-1610 (`gitignore:`), 1323-1398 and 1701 (marked positions), 1594
  (`tool-config check`), 1809-1837 (`machine_env`, `set-env`), and
  `tool-config all` at 938, 1254, 1394, 1419, 1463, 1546, 1551, 1696,
  1719, 3450. How-tos: `how-to/brownfield/migrate-old-vwf-repo.md` lines 75-82,
  `how-to/brownfield/onboard-existing-codebase.md` line 115,
  `how-to/greenfield/single-repo.md` lines 91-95,
  `how-to/greenfield/multi-repo.md` line 341,
  `how-to/operate/choosing-your-stack.md` line 59, `plugins/mempalace.md` line
  80. `.claude/skills/vwf-plugin/SKILL.md` lines 114, 122-172, 241;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md` lines 27-28, 40;
  `references/assets.md` lines 24-27; `references/dependencies.md` lines 32,
  35, 55.
- **Commit convention** — `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`.

## Assumed decisions — confirm or override at review

| #   | Decision            | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                        | Unit       |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------- |
| F1  | Pack values         | A `values:` list in `pack.yaml`, each entry `name` (upper snake), `detect` (a shell command printing the value, exit non-zero when unknown) and `question`. swiftui's four restored from `add4e104`'s `machine_env:` (lines 37-77), renamed. The checker requires every `values:` name to appear as `@@<name>@@` in the pack's `templates/`, and every pack-own `@@` name to be declared in `values:`.                    | plan 2 deleting the metadata                    | U1, U2     |
| F2  | Shaped              | A repo is shaped when `.config/stackgen.yaml` exists with `format: 1`. A repo with old-layout files (`.config/mise/conf.d/tools.toml`, `.config/mise/conf.d/env.toml` or a root `.config/mise.dev.toml`) and no `stackgen.yaml` is "shaped on the old layout" — plan 4's trigger; until plan 4 lands, setup and init say so and stop rather than reshaping it.                                                            | a layout probe                                  | U3, U4, U5 |
| F3  | `NODE`              | init passes `--node true` (most repos are Node). setup re-derives it after pinning: `true` when any pinned pack in that repo is Node-based (package-manager pnpm, language typescript, toolchain-gate eslint, any framework whose bundle includes pnpm), else `false`, and calls `all --node <value>` when it changed.                                                                                                    | an init question                                | U3, U4     |
| F4  | `EXTERNAL`          | init passes `--external false`. setup derives it: `true` only when a pinned pack ships a `setup/external/*` task; none does today.                                                                                                                                                                                                                                                                                        | an init question                                | U3, U4     |
| F5  | Rendered pack files | After `pack` writes a pack's templates, the materializer records each rendered path in `.claude/stackgen/lock.yaml` with `source: <pack>@<version>`, `rendered: true` and no hash. Removal deletes them with the pack's other files (after `pack-remove`). stackgen-sync re-runs `pack` for a newer pack version instead of diffing bytes.                                                                                | restrict templates to `conf.d/<slug>/`          | U2         |
| F6  | Drift               | doctor runs `preview all` and `preview pack --slug <s> --dir <d>` per pinned pack; each returned row is a drift finding carrying its diff; the LLM says whether it looks like a deliberate local edit or a stale file; the remedy is `/vwf:setup reshape`. No `check`.                                                                                                                                                    | the LLM comparing files by eye                  | U5         |
| F7  | `vwf.yaml` answers  | `answers:` leaves `vwf.yaml` (`config_format` 23): `answers.secrets` and `answers.repos.<path>.forge` are passed to `all --secrets` and `all --forge` and live in each repo's `stackgen.yaml`; `answers.repos.<path>.update_bot` retires with renovate. `members:` and `linkage:` stay — init passes `--members` from `members:`, and doctor checks the two agree. The 22 → 23 migration of existing configs is plan 4's. | migrate in plan 3                               | U3, U4, U5 |
| F8  | vwf's ignore lines  | vwf's ignore lines (`docs/memory/handoff/`, `docs/memory/doctor/`, `docs/memory/runs/`, `docs/scratchpad/` and the rest the four writers add) join tool-config's universal `assets/.gitignore` and `assets/.graphifyignore` inside the `tool-config` markers; setup's memory tree, mockups, screen-review and worktree-setup stop writing either file (B80 item 4).                                                       | vwf writes the repo's own lines outside markers | U2, U4, U5 |
| F9  | init's `all` call   | `--repo-name`, `--merge-model-develop`, `--merge-model-main` (defaults `direct`, `pr`), `--members` (from `vwf.yaml` `members:`), `--scopes`, `--node true`, `--external false`, `--forge` (from `origin`'s host), `--secrets`. `--linkage`, `--runtimes`, `--update-bot` and init's renovate question go; mode detection uses F2.                                                                                        | —                                               | U3         |
| F10 | setup's materialize | For each pinned pack: copy `config/` (unchanged), then `pack --slug --dir --set` with each `values:` entry's value — run `detect`, else ask its `question` — then record per F5. A dropped pack: `pack-remove`, then delete its recorded files. Re-derive `NODE`/`EXTERNAL` (F3, F4). `apply-entries`, `set-env` and `machine_env` go. `setup:ai` → `setup:ai:all` everywhere vwf names it.                               | —                                               | U4         |
| F11 | B80 item 2          | doctor's remedy reads `MISE_ENV=dev mise run setup:precommit`.                                                                                                                                                                                                                                                                                                                                                            | —                                               | U5         |
| F12 | Review row          | One `review` row covering U1 (runnable checker code).                                                                                                                                                                                                                                                                                                                                                                     | wave review only                                | R          |
| F13 | Landing steps       | After landing `mise run p:plugins:local` (`run`); release none; no manifest bump.                                                                                                                                                                                                                                                                                                                                         | —                                               | U7         |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                    | Depends on        | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- | ------ |
| U1 | 1    | [01-checker.md](01-checker.md)               | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `.claude/skills/plugin-authoring/references/checks.md`                                                                                                                                                                                                                                                                             | —                 | pending |        |
| U2 | 2    | [02-stackgen.md](02-stackgen.md)             | edit   | `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml` (not `version:`), `plugins/stackgen/skills/tool-config/assets/.gitignore`, `plugins/stackgen/skills/tool-config/assets/.graphifyignore`, `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-sync/**` | U1                | pending |        |
| U3 | 2    | [03-init.md](03-init.md)                     | edit   | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                                                                                            | U1                | pending |        |
| U4 | 2    | [04-setup.md](04-setup.md)                   | edit   | `plugins/vwf/skills/setup/**`                                                                                                                                                                                                                                                                                                                                                           | U1                | pending |        |
| U5 | 2    | [05-doctor-and-vwf.md](05-doctor-and-vwf.md) | edit   | `plugins/vwf/skills/doctor/**`, `plugins/vwf/assets/**`, and the ignore-writing passages in vwf skills other than init and setup (found by the facts' grep)                                                                                                                                                                                                                             | U1                | pending |        |
| R  | 3    | [06-review.md](06-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                                                                       | U1                | pending |        |
| U6 | 4    | [07-docs.md](07-docs.md)                     | edit   | `site/src/content/docs/**`, `.claude/**` except `checks.md`, `CLAUDE.md`, `readme.md`, `docs/memory/decisions/2026-10-05-*.md` (new files only)                                                                                                                                                                                                                                         | R, U2, U3, U4, U5 | pending |        |
| U7 | 5    | [08-gates-and-bump.md](08-gates-and-bump.md) | edit   | the swiftui pack's `version:` line and bundle pins naming it, `plugins/stackgen/stacks/inventory.md`, `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                         | U6                | pending |        |

## Shared-file rule

| File                                        | Why it collides                         | Owner                        |
| ------------------------------------------- | --------------------------------------- | ---------------------------- |
| `scripts/src/check.ts`                      | U2's `values:` must pass the checker    | U1, wave 1 — before U2 lands |
| version files, `inventory.md`               | version and generated files             | U7 only                      |
| every human-facing doc                      | n units editing one doc                 | U6 (outside `plugins/`)      |
| `plugins/vwf/skills/{init,setup,doctor}/**` | three trees, three units                | U3, U4, U5 respectively      |
| a vwf skill outside init/setup/doctor       | only its ignore-writing passage changes | U5                           |
| this repo's own `.config/**`, `.gitignore`  | the user edits them by hand             | nobody                       |

## Waves

- **Wave 1** — U1 alone: swiftui's `values:` (U2) fails plan 2's checker until
  U1 accepts it, and pre-commit runs the checker on U2's commit.
- **Wave 2** — U2, U3, U4, U5: disjoint trees (stackgen files; init; setup;
  doctor, vwf assets and the other skills' ignore passages).
- **Wave 3** — R. **Wave 4** — U6. **Wave 5** — U7.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                                                   |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into the dev marketplace; a restarted session picks them up; do not reshape an existing repo until plan 4 lands |

## Gates the orchestrator keeps

After U5 and again after U7, in a scratch git repo (isolated `HOME` and every
`MISE_*` dir, `trusted_config_paths` set to it, an `origin` remote):

1. Run the exact `all` invocation
   `plugins/vwf/skills/init/references/new-repo.md` documents, placeholders
   filled, through
   `node plugins/stackgen/skills/tool-config/scripts/tool-config.mjs` with every
   row answered `ok`: it exits 0, writes `.config/stackgen.yaml` with
   `format: 1` and every key init passed, and returns no `needs-edit` row.
2. `pack --slug swiftui --dir plugins/stackgen/stacks/app-framework/swiftui`
   with one `--set` per name in swiftui's `values:` writes
   `.config/mise/conf.d/swiftui/mise.toml` with every value filled and no `@@`
   left; the same call missing one `--set` is refused naming the value.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc outside its Owns, never adds a dependency this file
does not list, never commits, never runs `git checkout`/`git restore` or a
formatter `--fix` outside its Owns. A unit deletes with plain `rm`, never
`git rm` — it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Migrating existing repos — the old layout, `config_format` 22 → 23, seeding
  `stackgen.yaml` from old files — plan 4.
- The fnox plan's rewrite — after plan 4.
- init's hygiene files (CONTRIBUTING, SECURITY, licence, issue templates) stay
  init's own, unchanged in shape (user: "stay in vwf:init"); only
  `CONTRIBUTING.md`'s task and file names are corrected.

## Parked

- B80: items 1 (init hygiene assets have no record) and 9 (installer notice)
  stay open on the backlog.
- Plan 4 `2026-10-05-reshape-migration`: the `config_format` 22 → 23 migration
  (move `answers.secrets` and the forge into `stackgen.yaml`, drop
  `update_bot`); the old-layout migration rows; member re-render (B55); the fnox
  re-plan afterwards.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-10-05-vwf-callers-on-templates

or let the queue pick it, by priority:

/vwf:execute next
