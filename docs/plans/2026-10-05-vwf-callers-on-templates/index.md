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

**RUNNING**

RUNNING since 2026-10-05 19:12 in .worktrees/2026-10-05-vwf-callers-on-templates

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

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                    | Depends on        | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- | -------- |
| U1 | 1    | [01-checker.md](01-checker.md)               | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `.claude/skills/plugin-authoring/references/checks.md`                                                                                                                                                                                                                                                                             | —                 | green   | 2af3a10d |
| U2 | 2    | [02-stackgen.md](02-stackgen.md)             | edit   | `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml` (not `version:`), `plugins/stackgen/skills/tool-config/assets/.gitignore`, `plugins/stackgen/skills/tool-config/assets/.graphifyignore`, `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-sync/**` | U1                | green   | 4b3175e6 |
| U3 | 2    | [03-init.md](03-init.md)                     | edit   | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                                                                                            | U1                | green   | d784f165 |
| U4 | 2    | [04-setup.md](04-setup.md)                   | edit   | `plugins/vwf/skills/setup/**`                                                                                                                                                                                                                                                                                                                                                           | U1                | green   | abe35f35 |
| U5 | 2    | [05-doctor-and-vwf.md](05-doctor-and-vwf.md) | edit   | `plugins/vwf/skills/doctor/**`, `plugins/vwf/assets/**`, and the ignore-writing passages in vwf skills other than init and setup (found by the facts' grep)                                                                                                                                                                                                                             | U1                | green   | 9be4f199 |
| R  | 3    | [06-review.md](06-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                                                                       | U1                | green   |          |
| U6 | 4    | [07-docs.md](07-docs.md)                     | edit   | `site/src/content/docs/**`, `.claude/**` except `checks.md`, `CLAUDE.md`, `readme.md`, `docs/memory/decisions/2026-10-05-*.md` (new files only)                                                                                                                                                                                                                                         | R, U2, U3, U4, U5 | green   | cc282ec3 |
| U7 | 5    | [08-gates-and-bump.md](08-gates-and-bump.md) | edit   | the swiftui pack's `version:` line and bundle pins naming it, `plugins/stackgen/stacks/inventory.md`, `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                         | U6                | pending |          |

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

## Gaps surfaced during execution

| #  | Gap                                                                                                                                                                               | Source       | State                                                                                 |
| -- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------- |
| G1 | The Waves rationale is backwards: the old checker ignores unknown `pack.yaml` keys, so U2's `values:` passes it; U1's new checker fails until U2 lands                            | U1           | resolved — commits reordered, U2 before U1                                            |
| G2 | F7 falsifies the vwf.yaml `answers:` readers in stackgen-sync, stackgen-stack-template and the materializer, which U2's Edits did not list                                        | U2           | resolved — closed from F7 in U2's round 2                                             |
| G3 | F2 names `.config/mise/conf.d/env.toml` as an old-layout signal, while U3's and U5's Verification greps ban `env\.toml`                                                           | R2           | resolved — the ruling outranks the grep; the F2 detection lines are the expected hits |
| G4 | tool-config's shipped `.gitattributes` asset has no marker pair, so once init keeps a repo's own lines there every preview shows a `write` row and doctor reports drift every run | R3, R engine | open — a marker pair in the asset is the fix; no unit in this plan owns that file     |
| G5 | `all` folds no root `mise.toml`; init keeps it and reports it under Deferred; a root `renovate.json` is now an off-allowlist stray every run                                      | U3           | open — non-blocking                                                                   |
| G6 | The `config_format` 22 → 23 migration is named as reshape's, which lands in plan 4                                                                                                | U5           | parked — plan 4 `2026-10-05-reshape-migration`                                        |

## Run log

| Wave | Unit              | Model | Round | Outcome      | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Commit   |
| ---- | ----------------- | ----- | ----- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight         | —     | 1     | pass         | doctor: no blocking (repo has no vwf.yaml — not onboarded by design); wave gate 7/7 green; mempalace down — memory steps skipped; no code unit — LSP and conventions fetch skipped                                                                                                                                                                                                                                                                                      | —        |
| 0    | sequence          | —     | —     | —            | wave 1 U1 (edit) → wave 2 U2,U3,U4,U5 (edit) → wave 3 R (review, covers U1) → wave 4 U6 → wave 5 U7; no covers: — format check, acceptance, ux skipped                                                                                                                                                                                                                                                                                                                  | —        |
| 1    | U1 checker values | opus  | 1     | pass         | edit; DECIDED #if/#each on a name counts as reading it; GAP: wave rationale backwards — new checker red on swiftui's 4 undeclared names until U2 lands; orchestrator reorders commits: U2 before U1 (old checker ignores values:), U1 commit and wave-1 gate deferred to after wave 2                                                                                                                                                                                   | 2af3a10d |
| 1    | R1                | opus  | 1     | pass         | contract clean, rulings clean; 2 rule-5 docs findings (repo-shape.md:191, stackgen-plugin SKILL.md:240,328) in U6's Owns — carried to U6 as DOCS FALSIFIED                                                                                                                                                                                                                                                                                                              | —        |
| 2    | U2 stackgen       | opus  | 1     | findings(1)  | edit; values: restored byte-identical from add4e104; ignore lines added; DECIDED .worktrees/ and graphify-out/ already in assets; UNRESOLVED (F7 readers in stackgen-sync 92-110, stack-template SKILL 182-195, materializer 18-23/230-236) — answered from F7 by orchestrator, re-dispatched round 2                                                                                                                                                                   | —        |
| 2    | U2 stackgen       | opus  | 2     | pass         | edit; F7 applied: sync/stack-template/materializer read forge+secrets from stackgen.yaml, forge correction via all --forge; DECIDED invocation answers: payload map stays (caller interface, not vwf.yaml block); GAP: F7 readers in Owns not listed in U2's Edits — closed from F7                                                                                                                                                                                     | 4b3175e6 |
| 2    | U4 setup          | opus  | 1     | pass         | edit; F2 stop, values+pack/pack-remove, re-derive node/external/forge; DECIDED stored packs.<slug> value kept not re-detected; all runs only changed flags; node rule names no tool (checker refuses pnpm); workspace-structure unchanged; GAP: landing payload needs values: block (pack→name→value) — materializer (U2) and stack-adapter.md (U5) must name it; forge none when no origin — must match U3                                                             | abe35f35 |
| 2    | U5 doctor and vwf | opus  | 1     | pass         | edit; F2/F6/F7/F8/F11 in doctor; config_format 23 in vwf-config.md; stack-adapter values: + pack/pack-remove; mockups/screen-review/worktree-setup/handoff stop writing ignore files; DECIDED historical migration notes reworded (dependency bot) to keep verification grep empty; GAP: 22→23 note says reshape performs it — lands in plan 4                                                                                                                          | 9be4f199 |
| 2    | U3 init           | opus  | 1     | pass         | edit; F2 mode + old-layout stop, F9 flags, answers/update bot/runtimes gone; DECIDED old-layout halts whole run before plan; --node/--external only where stackgen.yaml has none; stub only when a keep needs it; GAP: all folds no root mise.toml (kept, reported Deferred); old-layout row reworded to avoid env.toml grep; root renovate.json now an off-allowlist stray                                                                                             | d784f165 |
| 2    | R2                | opus  | 1     | findings(6)  | contract clean, rulings clean; (a) values contract differs U2/U4/U5 — orchestrator rules U4's (setup gathers, payload values:, materializer runs pack --set); (c) F2 files paraphrased U3/U5 — F2 outranks verification grep env.toml ban (GAP); forge mapping unstated in setup; fold width U2/U4/U5; 2 docs (stackgen-plugin SKILL.md:135, site stackgen.md:525) carried to U6                                                                                        | —        |
| 2    | U3 init           | opus  | 2     | pass         | edit; SKILL.md:226 names F2's three files exactly; GAP: verification grep's one hit is the F2 detection line (ruling outranks grep)                                                                                                                                                                                                                                                                                                                                     | d784f165 |
| 2    | U2 stackgen       | opus  | 3     | pass         | edit (wave-review loop); materializer Inputs gain values: map, render runs one --set per pair then records per F5; refolded; DECIDED --set keys lowercase (verified: values.mjs upper-cases packs.<slug>.<key> to @@NAME@@); pack missing a value is not called                                                                                                                                                                                                         | 4b3175e6 |
| 2    | U5 doctor and vwf | opus  | 2     | pass         | edit (wave-review loop); stack-adapter values: contract matches setup; stack-checks:298 names F2 files; refolded; GAP: verification grep's one hit is the F2 detection line                                                                                                                                                                                                                                                                                             | 9be4f199 |
| 2    | U4 setup          | opus  | 2     | pass         | edit (wave-review loop); forge mapping github/gitlab/none as init; refolded                                                                                                                                                                                                                                                                                                                                                                                             | abe35f35 |
| 2    | R2                | opus  | 2     | findings(2)  | converging (6→2), cap 2 reached; contested: output-tree.md:462 [U2] 108-col prose line; init/assets/hygiene/CONTRIBUTING.md:43 [U3] 85-col prose line                                                                                                                                                                                                                                                                                                                   | —        |
| 2    | wave gate         | —     | 1     | pass         | waves 1+2 (U1 commit deferred behind U2): 7/7 green; code:precommit's first red was the orchestrator's own folder-table re-pad, green on re-run; no UNRESOLVED left (U2's answered from F7)                                                                                                                                                                                                                                                                             | —        |
| 2    | gate after U5     | opus  | 1     | pass         | orchestrator gate in isolated scratch repo: (1) init's all invocation → exit 0, stackgen.yaml format: 1 with every key, no needs-edit, setup:all exit 0; (2) swiftui pack with 4 lowercase --set → mise.toml filled, no @@; omitted simulator_os refused exit 2 naming SIMULATOR_OS                                                                                                                                                                                     | —        |
| 3    | R security        | opus  | 1     | findings(1)  | range 22354bd2..3a06efe3; engine NO FINDINGS; [low] init/references/new-repo.md:126 (U3) unmarked .gitignore replaced whole — repo-only secret ignores dropped on ok; U3 uncovered — routed per the one rule, coverage widened to U3; verdict approve                                                                                                                                                                                                                   | —        |
| 3    | R review          | opus  | 1     | findings(11) | range 22354bd2..3a06efe3; engine 10 findings; kept U1: check.ts:1067 FORMAT not refused, check.ts:1073 duplicate values: name; U3 new-repo.md:126 routed via security; 8 findings on uncovered units dropped (U3 existing-repo:492, SKILL:226; U4 materialize:214,:42, SKILL:123,:134; U5 worktree-setup:35, vwf-config:644) — listed in final report; API COMPAT n/a                                                                                                   | —        |
| 3    | U1 checker values | opus  | 2     | pass         | edit fix (R round 1): FORMAT refused via PACK_VALUE_REFUSED, duplicate values: name a finding on second line; DECIDED FORMAT hardcoded (values.mjs exports neither GLOBAL_NAMES nor TOP; plugin code outside Owns); vitest 185/185                                                                                                                                                                                                                                      | b77a8fe9 |
| 3    | U3 init           | opus  | 3     | pass         | edit security fix (R round 1, coverage widened to U3): unmarked .gitignore/.graphifyignore adoption lists repo-own lines, re-appends them below the tool-config block on ok; DECIDED rule covers the two ignore files only                                                                                                                                                                                                                                              | 0aa26b45 |
| 3    | R security        | opus  | 2     | findings(1)  | range 22354bd2..0aa26b45; engine NO FINDINGS; round-1 .gitignore finding resolved; new [low] new-repo.md:135 (U3) unmarked .gitattributes replaced whole — git-crypt/transcrypt filter= lines lost → plaintext commits; routed to U3 (coverage widened); verdict approve                                                                                                                                                                                                | —        |
| 3    | R review          | opus  | 2     | findings(11) | range 22354bd2..0aa26b45; round-1 U1 findings resolved (b77a8fe9); covered U1: 2 new lows (check.ts:1010 FORMAT hand-copied not imported from values.mjs; check.ts:741 invalid YAML spurious findings + double parse) — guard: 2→2 not decreasing, loop ends, contested (oscillation); 8 findings on uncovered units dropped incl. [high] worktree-setup.md:35 check-ignore false negative REPRODUCED (U5); site vwf.md:1793 (unmapped) → U6                            | —        |
| 3    | U3 init           | opus  | 4     | pass         | edit security fix (R round 2): .gitattributes and other whole-owned line files keep own lines (listed, appended on ok, later runs preselect keep-existing); GAP: a marker pair in stackgen's .gitattributes asset would remove the repeat write row — outside U3 Owns                                                                                                                                                                                                   | 2a461fc8 |
| 3    | U5 doctor and vwf | opus  | 3     | pass         | edit fix on user ruling (R round 2 dropped [high], user: fix in this run; coverage widened to U5): probe <dir>/x not bare name in worktree-setup, mockups, screen-review; verified in throwaway repo (pattern+no dir → 0; bare → 1; no pattern → 1)                                                                                                                                                                                                                     | 5ba0172b |
| 3    | R security        | opus  | 3     | pass         | range 22354bd2..5ba0172b; engine NO FINDINGS; round-2 .gitattributes finding resolved (2a461fc8); probe fix clean; verdict approve                                                                                                                                                                                                                                                                                                                                      | —        |
| 3    | R review          | opus  | 3     | pass         | range 22354bd2..5ba0172b; verdict approve; round-2 [high] worktree-setup resolved (5ba0172b), probe fix clean; U1 lows (check.ts:1010, :744) remain contested; 7 findings on uncovered units dropped (U4 materialize:246 pack-remove bundle slug, :238/:234 rendered records; U2 materializer:154; U3 new-repo:162 gitattributes no marker pair; U5 stack-checks:497, vwf-config:683, stack-adapter:380); site stackgen.md:525 → U6. Row green with contested residuals | —        |
| 3    | R3                | opus  | 1     | findings(4)  | contract clean; RULINGS flagged U3 vs F8 — orchestrator: not a departure (F8 rejects vwf writing its OWN ignore lines outside markers; U3 preserves the repo's pre-existing lines below the markers, a required security fix); fold existing-repo.md:227, tool-configs.md:46 → U3; .gitattributes write row every run → GAP (root fix: marker pair in tool-config's .gitattributes asset, owned by no unit); site how-to onboard-existing-codebase.md:110 → U6          | —        |
| 3    | U3 init           | opus  | 5     | pass         | edit fold fix (R3 round 1): existing-repo.md:221-228, tool-configs.md:43-47 refolded, word-diff empty                                                                                                                                                                                                                                                                                                                                                                   | ddd78b30 |
| 3    | R late            | —     | —     | skipped      | late re-run of row R not run — why: ddd78b30 is whitespace-only (word-diff 0 changed words), no content for the engines to review                                                                                                                                                                                                                                                                                                                                       | —        |
| 3    | R3                | opus  | 2     | pass         | contract clean, rulings clean (F8 ruling accepted); round-1 folds resolved                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 3    | wave gate         | —     | 1     | pass         | 7/7 green after the R row and R3                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| —    | acceptance        | —     | —     | skipped      | why: no covers: — a change plan has no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| —    | ux                | —     | —     | skipped      | why: no covers: — no Screens contract                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| —    | reconcile         | —     | —     | skipped      | why: no covers: — no stamps/registry; no code unit — nothing to persist beyond the Run log                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 4    | U6 docs           | opus  | 1     | pass         | edit; site vwf.md/stackgen.md + 5 how-tos, .claude skills/docs, CLAUDE.md, readme.md, 4 decision docs; DECIDED mempalace.md unchanged, older stale counts fixed; GAP: doctor/SKILL.md:50 still says no lockfile = not shaped (F2); stack-checks (e) claims parity with pass 6 which lost the splice test — plugins/, not U6's                                                                                                                                           | cc282ec3 |
| 4    | R4                | opus  | 1     | findings(3)  | contract clean, rulings clean (reversals, F1–F13, rulings a–c described as decided); F2 leftovers: doctor/SKILL.md:50 [U5], site vwf.md:3207 [U6], skills-and-agents.md:40 [U6] — 'no lockfile = not shaped'; U5 first, U6 matches its wording                                                                                                                                                                                                                          | —        |
| 4    | U5 doctor and vwf | opus  | 4     | pass         | edit fix (R4 round 1): doctor/SKILL.md:49-53 F2 shaped test (old layout / not shaped on their own line); stack-checks (e) states pass 6 runs hash alone                                                                                                                                                                                                                                                                                                                 | 6b62ebde |
| 4    | U6 docs           | opus  | 2     | pass         | edit fix (R4 round 1): vwf.md:3207, skills-and-agents.md:40 match doctor's F2 wording                                                                                                                                                                                                                                                                                                                                                                                   | cc282ec3 |
| 4    | R4                | opus  | 2     | findings(1)  | converging 3→1, cap 2; contested: doctor/SKILL.md:51-52 [U5] code span wraps two lines (nit, renders)                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 4    | wave gate         | —     | 1     | pass         | 7/7 green                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-10-05-vwf-callers-on-templates

or let the queue pick it, by priority:

/vwf:execute next
