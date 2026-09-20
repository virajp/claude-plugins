---
type: vwf-change-plan
title: init editor dedupe — a hand key and the block never both carry a key
requires: [ docs/plans/2026-09-20-init-forge-pass ]
backlog: [ B28 ]
---

# Plan — init editor dedupe (2026-09-20)

## Status

**RUNNING**

RUNNING since 2026-09-20 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-20-init-editor-dedupe

## Consent

| Action                                            | Granted                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                              |
| Release vwf publicly                              | minor — `19.36.0` → `19.37.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step    |
| Release stackgen publicly                         | patch — `1.20.2` → `1.20.3`, a hand edit of `plugins/stackgen/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release site publicly                             | patch — `1.1.31` → `1.1.32` via `mise run p:site:version`; no release step                                                                       |
| Release installer publicly                        | none — untouched                                                                                                                                 |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, a `.vscode/settings.json` or `.vscode/extensions.json` that
`/vwf:init` composes never carries a key or an extension id twice. The
composition step reads the whole existing file, treats every key present both in
the hand section and in the composed set as a **collision**, asks the user once
per run what to do with each — keep mine, take the pack's, or (for object-valued
keys and the extensions list) union — and records the answer in
`.config/vwf.yaml` so a later run applies it without asking. A hand key still
wins by default and still survives byte-for-byte unless the user chose otherwise
for that key.

Backlog item B28, its second piece (of four). Requires
`2026-09-20-init-forge-pass` — both plans edit `init/SKILL.md`, `setup/SKILL.md`
and the same doc pages, and the chain makes every version bump deterministic.

**Reversal, confirmed at the interview.** The 2026-09-10/11 ruling — "dedupe the
hand keys with an inline `eslint-disable`, keep the union by hand; rejected:
changing vwf's algorithm here"
(`docs/plans/archived/2026-09-10-repo-task-groups-and-editor-block/index.md:185-196`)
— is superseded: the algorithm changes. With it, the doctrine passage that
relied on the duplicate — "JSON's own last-wins rule then makes a key a person
adds after the block beat the composed one"
(`plugins/stackgen/assets/pack-format.md:129-134`) and its restatement at
`init/references/fragments-and-sections.md:195-197` — is rewritten: a hand key
wins because the block **omits** it, not because JSON tolerates the duplicate.
The 2026-09-06 decision that the block sits first and everything outside it
survives byte-for-byte
(`docs/memory/decisions/2026-09-06-editor-fragments-inside-the-fence.md`)
stands, with the one carve-out that *take* and *union* remove the hand copy on
the user's word. The docs unit writes one decisions doc.

## Facts the survey established

- Composition
  (`plugins/vwf/skills/init/references/fragments-and-sections.md:137-213`;
  convention `plugins/stackgen/assets/pack-format.md:97-137`): every
  `.config/vscode.d/*.jsonc` is parsed as JSONC in composition order; keys
  `settings` (deep merge, later wins), `nesting` (union per parent),
  `extensions` (sorted union) → one marked block `// >>> vscode.d` /
  `// <<< vscode.d` placed **first** in each file (`:172-176`); the existing
  file is handled purely by marker splice — replace between the markers or
  insert at the top — and everything outside the pair survives byte-for-byte
  (`:192-198`). The step never reads the hand section; inputs are the fragments
  alone (`:152-155`).
- Eight fragments ship, under
  `plugins/stackgen/stacks/*/config/.config/vscode.d/`: repo-hygiene,
  toolchain-manager/mise, and toolchain-gate's dprint (`dprint-editor.jsonc`),
  eslint, tsconfig, ruff, pre-commit, analysis-options. No two collide on a
  settings key or a nesting parent. The hygiene fragment's own comment
  (`repo-hygiene.jsonc:9-11`) and the pack's `conventions.md:139-141` say a
  fragment-vs-fragment duplicate is a silent override — about fragments, not
  hand keys; not falsified.
- This repo's own `.vscode/settings.json` carries the block at `:2-124` and two
  duplicated top-level keys — `explorer.fileNesting.patterns` (`:50` in the
  block, `:147` by hand) and `files.exclude` (`:61`, `:163`) — each hand copy
  preceded by `// eslint-disable-next-line json/no-duplicate-keys` (`:146`,
  `:162`). `extensions.json` has the block at `:3-14`, no duplicate.
  `.config/linter.yaml` says nothing about JSON duplicate keys; the rule is the
  house linter's default.
- Neither doctor nor init's existing-repo survey inspects `.vscode`
  (`existing-repo.md:69-72` exempts the editor dir from pass 1) — the open gap
  at `docs/plans/archived/2026-09-14-repo-name-split/index.md:363`.
- `.config/vwf.yaml`: `config_format: 19`
  (`plugins/vwf/assets/vwf-config.md:41`); `enforcement.kept_files: {}` at
  `:111` is FORMAT 18, "the one key `init` writes" (`:214`, `:553`); the bump
  rule — "bump it (with a migration note here) when a key's shape changes; a
  bump never lands on 13 or 17" — is `:256-262`. `setup` migrates the stamp
  (`plugins/vwf/skills/setup/SKILL.md:147`).
- Init asks seven questions (`init/SKILL.md:252-414`, as re-shaped by the
  required plan); the editor block is composed in the plan step, not by a
  question.
- Gates and versions as the required plan leaves them: vwf `19.36.0`, stackgen
  `1.20.2`, site `1.1.31`. Commit types `ops docs merge feat fix refactor`, no
  scopes. Priority: the required plan is archived and its row swept → no
  unarchived requirement → 10.

## Assumed decisions — confirm or override at review

| # | Decision           | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Rejected                                                    | Unit   |
| - | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------ |
| 1 | Collision handling | The composition step parses the **whole** existing file (JSONC, comments tolerated); every top-level `settings` key, every `nesting` parent, and every extension id that is present **outside** the block and also in the composed set is a collision. Collisions are never resolved silently — they are asked                                                                                                                                                     | omit-and-report without asking; union silently; block wins  | U1     |
| 2 | The question       | One round per run, one row per collision naming the file, the key, the hand value and the pack value; choices **keep mine** — the block omits the key, the hand copy is untouched; **take the pack's** — the block carries it and init removes the hand copy, the exact lines shown in the plan before consent; **union** — offered only for an object-valued key and for the extensions list: pack + hand entries composed into the block, hand copy removed      | keep / take only; a question per key                        | U1     |
| 3 | Persistence        | `enforcement.editor_keys: {}` beside `kept_files` in the base's `.config/vwf.yaml`: `<file>: { <key>: keep \| take \| union }`, the file path base-relative with the member prefix exactly as `kept_files` spells it. A recorded answer applies on every later run without asking; editing the block is how a user is re-asked. `config_format` 19 → 20 with a migration note; `setup` adds the empty block on migrate. `init` now writes two keys into the config | fold into `kept_files`; persist `keep` only; no persistence | U1, U2 |
| 4 | Question count     | The collision round belongs to the plan step and is not an eighth question — the seven stand; a run with no collision asks nothing                                                                                                                                                                                                                                                                                                                                 | number it Q8                                                | U1     |
| 5 | Doctor             | Unchanged — the detection runs inside every composition, new and existing mode alike, so the "no `vscode.d` survey pass" gap closes without a predicate; doctor's content-drift check never read `.vscode` and still does not                                                                                                                                                                                                                                      | a doctor predicate over `.vscode`                           | —      |
| 6 | Take/union edit    | Removing the hand copy is the **one** edit init makes outside the block, and only on the recorded or just-given answer; the plan shows the lines it will remove. A hand copy that is the last member of an object leaves a valid file (trailing comma handled)                                                                                                                                                                                                     | never edit outside the block, even on consent               | U1     |
| 7 | Review row         | None — skill prose, a doctrine paragraph and a config schema note                                                                                                                                                                                                                                                                                                                                                                                                  | a `Kind: review` row                                        | —      |

## New dependencies

none

## Units

| Id | Wave | Unit file                                        | Kind | Owns                                                                                                                                                                                                                                                          | Depends on | Status  | Commit   |
| -- | ---- | ------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-init.md](01-init.md)                         | edit | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/fragments-and-sections.md`, `plugins/vwf/skills/init/references/existing-repo.md`                                                                                                     | —          | green   | add917c6 |
| U2 | 1    | [02-config-and-setup.md](02-config-and-setup.md) | edit | `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/format-lineage.md`, `plugins/vwf/skills/setup/references/migrate-pipeline.md`, `plugins/vwf/skills/architecture/SKILL.md` (widened at run time) | —          | green   | 553521eb |
| U3 | 1    | [03-pack-format.md](03-pack-format.md)           | edit | `plugins/stackgen/assets/pack-format.md`                                                                                                                                                                                                                      | —          | green   | 9ca99019 |
| U4 | 2    | [04-docs.md](04-docs.md)                         | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/repo-shape.md`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/SKILL.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-init-editor-dedupe.md`                                       | U1, U2, U3 | green   | f0717dc4 |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md)     | edit | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                               | U4         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `edit`.

## Shared-file rule

| File                                                                                         | Why it collides                                 | Owner   |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------- |
| the two `plugin.json`, `site/package.json`                                                   | version files                                   | U5 only |
| `.claude-plugin/marketplace.json`                                                            | generated                                       | U5 only |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**` | n units editing one doc                         | U4 only |
| `plugins/vwf/skills/setup/SKILL.md`                                                          | U1 would cite the migration; U2 owns it         | U2 only |
| `plugins/vwf/assets/vwf-config.md`                                                           | U1 would describe the key; U2 owns the schema   | U2 only |
| the hygiene pack's `conventions.md` and `repo-hygiene.jsonc`                                 | not falsified (fragment-vs-fragment); untouched | —       |

## Waves

- **Wave 1** — U1, U2, U3: three disjoint trees.
- **Wave 2** — U4: the docs over the branch delta plus the decisions doc.
- **Wave 3** — U5: bumps, marketplace, full gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf at `19.37.0+N` and stackgen at `1.20.3+N` into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session loads them |

## Gates the orchestrator keeps

none beyond the wave gate. This repo's own `.vscode` duplicates are cleaned by
the next `/vwf:setup reshape` on this repo, which is the user's real-repo
verification, not a unit's.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

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

- This repo's own `.vscode/settings.json` — its two duplicated keys and the two
  `eslint-disable-next-line` comments are removed by the next
  `/vwf:setup reshape` on this repo, on the collision question, not by a unit.
- Fragment-vs-fragment collisions (two packs shipping one key) — none exist; the
  silent-override rule for them stands.
- A doctor predicate over `.vscode` — decision 5.
- Any other `enforcement` key — only `editor_keys` is added.
- A public release — the bumps land; the tags wait for the next `/release`.

## Parked

- B28's remaining pieces — setup re-run on structural change (C), the greenfield
  / brownfield rework (D) — are their own folders, chained after this one. B28
  closes only when the last of them lands; `/vwf:execute`'s `done` at this
  plan's landing may need the item moved back to `Backlog` by hand until then.

## Run log

| Wave | Unit                | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Commit   |
| ---- | ------------------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight           | —     | 1     | pass        | node: preflight; doctor: mise, graphify CLI and the main checkout graph present, no `.config/vwf.yaml` in this repo so no stack to check, no `code` unit so LSP and conventions skipped; wave gate: all five lines green on the integration branch; format check skipped (no `covers:`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U3 pack-format      | opus  | 1     | pass        | node: edit; last-wins bullet rewritten to the omit rule with keep/take/union named; DECIDED: "the composing skill" kept as actor, no vwf path; re-run-rewrites-between-markers clause kept; GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 1    | U2 config-and-setup | opus  | 1     | pass        | node: edit; config_format 20, `editor_keys` line, writers cell, 19→20 migration note; setup/SKILL.md gains the 19→20 step; DECIDED: SKILL.md has no per-step procedure, sentence placed beside its one stamp-comparison passage; DOCS FALSIFIED: `setup/references/format-lineage.md` (:18 names 19 current; lineage table lacks the editor_keys row) and `setup/references/migrate-pipeline.md` (:27-30 names kept_files alone) — nobody-owned, U2's Owns widened to both (GAP: plan named no owner; U4 may not edit `plugins/**`, so the setup unit takes them), round 2 dispatched                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 1    | U2 config-and-setup | opus  | 2     | pass        | node: edit; format-lineage.md :18 reads 20, lineage table gains the editor_keys row; migrate-pipeline.md step 1 names `editor_keys` beside `kept_files`; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 1    | U1 init             | opus  | 1     | pass        | node: edit; fragments-and-sections.md gains "Collisions with the hand section" (round, row shape, keep/take/union by key shape, editor_keys record, re-ask rule), omit rule replaces last-wins, byte-for-byte carve-out; SKILL.md names two config keys plus the collision sentence, seven-question passage untouched; existing-repo.md pass 1/7, Plan and Apply passages; DECIDED: collision rows are sub-lines under the editor file's Merges row, not an eleventh section (renumbering would reach new-repo.md, outside Owns); identical extension id is keep-without-asking, unrecorded; GAP: none                                                                                                                                                                                                                                                                                                                                                                                                         | add917c6 |
| 1    | R1                  | opus  | 1     | findings(3) | fragments-and-sections.md:239 [U1] rulings — extension ids never asked/recorded (01-init.md edit 1) while vwf-config.md:115 [U2] offers union for the extensions list (decision 2): the two shipped files disagree; architecture/SKILL.md:415 [—] docs — "the only child of `enforcement:` this check reads" now omits `editor_keys`, nobody-owned; vwf-config.md:35 [U2] completeness — intro paragraph not named in the edit list, accurate, note only. CONTRACT clean. Orchestrator ruling: 01-init.md edit 1 is the more specific instruction and every choice on an identical id yields the same file, so `editor_keys` never records an extension id — U2 aligns vwf-config.md:115 (GAP: the plan's decision 2 and 01-init.md edit 1 read differently; assumption: the unit file governs, union on the extensions list is what the sorted union already produces); U2's Owns widened to `plugins/vwf/skills/architecture/SKILL.md` for the one passage (GAP: nobody-owned, U4 may not edit `plugins/**`) | —        |
| 1    | U2 config-and-setup | opus  | 3     | pass        | node: edit; vwf-config.md:115 — collision is a settings key or nesting parent only, an extension id is kept without asking and never recorded, union only for an object-valued key; architecture/SKILL.md ~:415 names both children as init's and unchecked; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 1    | R1                  | opus  | 2     | findings(2) | round-1 findings 1 and 2 resolved, nothing resurfaced, CONTRACT and RULINGS clean; two consistency nits downstream of the round-1 ruling: pack-format.md:131 [U3] still lists an extension id among the asked collisions; vwf-config.md:115 [U2] says union for an object-valued key where fragments-and-sections.md says object-valued key or nesting parent. Loop closes at the two-round cap; both nits are mechanical one-sentence fixes dispatched to U3 (round 2) and U2 (round 4) without a further reviewer round — recorded here, not contested                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 1    | U3 pack-format      | opus  | 2     | pass        | node: edit; collision sentence names settings keys and nesting parents as the asked choice, an extension id kept unasked and unrecorded; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 9ca99019 |
| 1    | U2 config-and-setup | opus  | 4     | pass        | node: edit; vwf-config.md:115 union clause reads "an object-valued key or a nesting parent"; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 553521eb |
| 2    | U4 docs             | opus  | 1     | pass        | node: edit; CLAUDE.md init paragraph, vwf-plugin SKILL.md + skills-and-agents.md + assets.md + docs-tree.md, stackgen-plugin SKILL.md (h), site vwf.md init passage and reshape "two keys", site stackgen.md omit rule, migrate-old-vwf-repo.md format 20 row, new decisions doc, Amended-by line on the 2026-09-06 doc; DECIDED: readme.md and repo-shape.md not falsified; historical 19 hits left; GAP: surveyor report reached the orchestrator rather than U4 (relayed; every finding covered by a CHANGED line); precommit format hook re-padded two plan-table cells (whitespace)                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 2    | R2                  | opus  | 1     | findings(1) | CLAUDE.md:301 and vwf-plugin/SKILL.md:108 [U4] rulings — "union where the value is an object" narrows the landed rule (object-valued key or nesting parent); CONTRACT clean (11 paths, all in Owns); RULINGS clean — no last-wins, no "one key", 19 only as history, extension-id rule consistent everywhere; edits 1–8 landed; U4 round 2 dispatched                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 2    | U4 docs             | opus  | 2     | pass        | node: edit; CLAUDE.md :303-304 and vwf-plugin/SKILL.md :110 union clause reads "for an object-valued key or a nesting parent"; precommit green twice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | f0717dc4 |
| 2    | R2                  | opus  | 2     | pass        | round-1 finding resolved, nothing resurfaced; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| —    | acceptance          | —     | 1     | skipped     | why: no `covers:` — a change plan has no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| —    | ux                  | —     | 1     | skipped     | why: no `covers:` — no Screens contract to verify against                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| —    | reconcile           | —     | 1     | skipped     | why: no `covers:` (no stamps, registry, environment or harness edit); no `code` unit (nothing to persist beyond the Run log)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 3    | U5 gates-and-bump   | opus  | 1     | pass        | node: edit; vwf 19.37.0, stackgen 1.20.3, marketplace regenerated (refs vwf-v19.37.0, stackgen-v1.20.3); four gate lines green; UNRESOLVED (mechanical): `p:site:version` refuses a dirty tree (ERR_PNPM_UNCLEAN_WORKING_TREE) and the run log keeps the tree dirty. Orchestrator ruling (GAP: plan ordered the site bump first without accounting for the folder's own edits): close the wave-2 folder commit, commit the two plugin bumps as U5's first commit, then U5 round 2 runs the task on a clean tree and the site bump lands as a second U5 commit                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-init-editor-dedupe

or let the queue pick it, by priority:

/vwf:execute next
