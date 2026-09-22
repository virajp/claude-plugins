---
type: vwf-change-plan
title: persisted answers — the four conditional axes recorded, every caller
  evaluates them
requires: [ docs/plans/2026-09-20-pack-intent-rendering ]
backlog: []
---

# Plan — persisted answers (2026-09-22)

## Status

**APPROVED**

APPROVED 2026-09-22 by the user

## Consent

| Action                                            | Granted                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                              |
| Release vwf publicly                              | minor — `19.42.0` → `19.43.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step    |
| Release stackgen publicly                         | minor — `1.25.0` → `1.26.0`, a hand edit of `plugins/stackgen/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release site publicly                             | patch — `1.1.38` → `1.1.39` via `mise run p:site:version`; no release step                                                                       |
| Release installer publicly                        | none — untouched                                                                                                                                 |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, **every** caller of the materializer evaluates a conditional
file against the same four answers: `/vwf:init`, which asks them, `/vwf:setup`'s
materialize pass, which lands a pinned template long after init ran, and
`/stackgen:stackgen-sync`, which re-derives a pack's landing set. The answers
stop living in one session: `.config/vwf.yaml` gains an **`answers:`** block —
the editor and the secrets provider once for the product, the forge and the
update bot per repo — and `config_format` steps 20 → 21. A repo whose `origin`
appeared after init no longer needs anyone to remember a reshape: the forge is
read live by every caller, and `/vwf:doctor` reports a recorded value that no
longer matches, or a `skipped:` row whose forge condition the live host
contradicts, as drift. A pack that is removed or un-pinned takes its `skipped:`
rows with its `entries:`, so a lockfile never carries the ghost of a pack the
repo no longer runs.

Closes gaps **G-2** and **G-7** of `docs/plans/2026-09-20-pack-intent-rendering`
— the two that plan recorded as a follow-up rather than closing itself, and the
three findings behind them: R7 round 2's N3 (setup's pass passes no answers),
R7-late1's L6 (a removed pack's `skipped:` rows linger) and R7 round 4's E2/E3
(sync never reads `skipped:`; a no-origin repo's forge skips re-land only by
hand). G-6 and G-8 of that plan stay open — they are contested checker lows and
a design question, not this plan's.

**Not a reversal.** The previous plan's decision 1 already ruled that "a later
run whose answer changed re-evaluates"; it shipped the evaluation and left the
record unbuilt. This is the record. The one standing passage it contradicts is
its own admission that nothing about the two new answers is written into the
tree (`init/SKILL.md:605`), which is what the gap said would change.

## Facts the survey established

Paths: `I` = `plugins/vwf/skills/init`, `S` = `plugins/vwf/skills/setup`, `D` =
`plugins/vwf/skills/doctor`, `SG` = `plugins/stackgen`. Verified at `a7f575e7`,
after `2026-09-20-pack-intent-rendering` landed.

- **The four answers today.** `I/SKILL.md:387-393` asks q7 (editor, once per
  product) and q8 (update bot, per repo) as rounds 8 and 9; q4
  (`I/SKILL.md:492`) answers the secrets provider once and reaches the tree only
  as the `.gitignore` provider section (`:360-367`); the forge is the `origin`
  host, read per repo at question time (`I/references/new-repo.md:97-135`, §2's
  axis table). `I/SKILL.md:719-726` composes them as the `answers:` map every
  fetch carries; `:631-639` states the four values per repo in the plan and the
  per-repo **Skipped** heading. `I/SKILL.md:605` says plainly that nothing about
  the two new answers is written into the tree and a later run asks again.
  `I/references/fragments-and-sections.md:317-325` records editor **collisions**
  under `enforcement.editor_keys` — the only answer-shaped thing in the config
  today, and not the answer itself.
- **The callers that pass nothing.** `S/references/materialize.md:83-98`
  composes the stack-template invocation with the catalog paths and a `repo:`
  line — no `answers:`; under the materializer's rule an unanswered axis reads
  **true**
  (`SG/skills/stackgen-stack-template/references/materializer.md:186-222`), so
  every conditional path lands there. `SG/skills/stackgen-sync/SKILL.md:47-70`
  re-derives a pack's landing set and hash-classifies it, and mentions neither
  `conditional:`, `skipped:` nor answers — a skipped path reads to it as a pack
  file the repo is missing. Its removal path is `:106-118`, keyed by
  subtraction; there is no separate removal skill (the stackgen skills are
  reputation, stack-menu, stack-template, sync). `/vwf:architecture` reaches
  setup in-session (`plugins/vwf/skills/architecture/SKILL.md:367, 456-457`), so
  the materialize pass is the path every architecture pin takes.
- **The config.** `plugins/vwf/assets/vwf-config.md:41-44` stamps
  `config_format` 20; `:113-117` is the `enforcement:` block, `kept_files`
  (format 18) and `editor_keys` (format 20); `:221` is the ownership row — init
  writes those two keys and nothing else; `I/SKILL.md:76-84` is the stub rule
  (`config_format` plus `enforcement` when the file is absent). The bump rule is
  `vwf-config.md:263-269`, with 19 → 20 as the worked precedent at `:605-615`
  (add the key, rewrite the stamp, convert nothing). A bump also takes a lineage
  row beside `S/references/format-lineage.md:126` and a step-1 clause in
  `S/references/migrate-pipeline.md:24-32`, which already treats a missing
  `enforcement` key as one entry gaining `{}`. `blueprint_format` is a separate
  line and is untouched. 21 carries no 13 or 17 component.
- **Doctor.** `D/references/stack-checks.md:401-424` is predicate (e) as the
  last plan left it: a `skipped:` path is never reported missing; a path with an
  `entries:` record is hashed whatever its condition reads now; and one
  config-read row requires a pinned provider's `.gitignore` section — a row that
  **presumes a config key that does not exist**. No predicate compares
  `skipped[].when` against the current answers. `:562-563` notes the forge
  default-branch choice is recorded nowhere, the same shape as this plan's
  problem and deliberately not its scope. `D/SKILL.md:160-166` compares
  `config_format` against the asset's schema version generically, so 21 needs no
  doctor edit for the stamp itself.
- **The lockfile.** `SG/assets/output-tree.md:372-375` is the `skipped:` schema
  (`{path, pack, when}`); `:408-430` the invariants the last plan wrote —
  `entries:` and `skipped:` exclusive, no hash, rewritten per evaluated pack, a
  landed path whose condition flipped kept; `:431-435` is removal, which removes
  exactly the listed `entries:`, `settings_keys` and `mcp_servers` — and no
  `skipped:` rows.
- **Triggers.** `S/SKILL.md:72-95` is the `reshape` argument, `:97` Step 0,
  `:127-150` the offer on doctor's seven predicates, `:222-236` the second shape
  check after the materialize pass. Nothing anywhere watches for a remote that
  appeared since (`grep` for remote/origin in setup: none).
  `plugins/vwf/skills/recall/SKILL.md:99-106` prints the (a)–(f) drift line.
- **Docs that describe today** (U6's): `I/SKILL.md:605`;
  `I/references/new-repo.md:118, 128`;
  `.claude/skills/stackgen-plugin/SKILL.md:91-96` (the "a follow-up plan"
  paragraph); `.claude/skills/vwf-plugin/SKILL.md:114, 135-136, 161`;
  `.claude/skills/vwf-plugin/references/assets.md:24`;
  `.../references/docs-tree.md:119-120, 125, 131-134` (the config-only bump
  lineage 14/16/18/20); `CLAUDE.md:307-312, 346-354`;
  `site/src/content/docs/plugins/vwf.md:951-956, 1176-1186, 1656-1657`;
  `site/src/content/docs/plugins/stackgen.md:424-432`;
  `site/src/content/docs/how-to/brownfield/migrate-old-vwf-repo.md:71`.
  `readme.md` carries no falsified claim (it describes the reshape offer only) —
  U6 edits it only where a grep hit reads false. The previous plan's folder and
  its decisions doc are the **historical record** and are not edited; the new
  decisions doc supersedes them.
- **Gates.** The nine lines below are the same set that plan used and every task
  still exists. `scripts/src/check.ts` reads neither `.config/vwf.yaml` nor
  `config_format`, so the bump is prose-only for the checker and no unit touches
  `scripts/`. Commit types from `.config/git-conventional-commits.yaml`:
  `ops docs merge feat fix refactor`; `commitScopes` is empty, so no scopes.
- **Versions now**: vwf `19.42.0`, stackgen `1.25.0`, site `1.1.38`. The 19 → 20
  bump is the worked example of what a config-only bump touched: the schema, the
  lineage row, the migrate step, then a docs commit across `CLAUDE.md`, both
  `.claude/skills/*-plugin`, three `vwf-plugin` references, two site pages and
  the brownfield how-to.
- **Priority**: `10 + 50` over the required plan's row → **60**.

## Assumed decisions — confirm or override at review

| # | Decision              | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                                              | Unit           |
| - | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------------- |
| 1 | The key               | `.config/vwf.yaml` gains a top-level **`answers:`** block: `editor` and `secrets` once for the product; `repos:` keyed by the member path exactly as `enforcement.kept_files` spells one (`.` for the base) and each entry carrying `forge` and `update_bot`. Every key is always present, `none` where no answer was picked or nothing could be read. `config_format` steps 20 → 21                                                                                                                                                                                                             | under `enforcement:`; four flat base-only keys                        | U1, U2         |
| 2 | Who writes it         | **Init writes the block**, in every mode, as part of the pass that writes the stub — a third key it owns beside `kept_files` and `editor_keys`. No other skill writes the block, with one exception: a caller that reads a **stale forge** (the recorded value differs from the live `origin` host) rewrites **that one value** and says so. Setup's pass and sync never write any other key                                                                                                                                                                                                     | setup and sync write all four; nobody writes                          | U1, U2, U3, U4 |
| 3 | Forge is read live    | Every caller reads the forge from `origin` at run time and passes **that** as the `forge` axis; the recorded value is the record and the fallback for a repo with no remote reachable. Doctor's predicate (e) gains one row: a recorded `forge` that differs from the live host, **or** a `skipped:` row whose `when: forge` the live host now contradicts, is **drift**, remedy `/vwf:setup reshape` — so the forge files land at the reshape, never silently mid-pass                                                                                                                          | re-evaluate and land inside setup's pass; reshape-only with no signal | U3, U4, U5     |
| 4 | Sync's rule           | `stackgen-sync` evaluates every `conditional:` entry against the answers (forge live) and gains one classification beside its three: a path whose condition is **false** is `skipped (condition)` — never offered, its `skipped:` row rewritten for that pack; a path that **never landed** and whose condition is **now true** is `landable — condition now true` and is landed under sync's existing consent tier for a new pack file; a **landed** path whose condition turned false is `kept`, reported once and never removed. Removal drops the pack's `skipped:` rows with its `entries:` | report only and point at reshape; subtract silently                   | U4             |
| 5 | A format-20 repo      | A caller that finds **no `answers:` block** infers what init's own seeds would give — forge from `origin`, editor from a `.vscode/` directory or the editor binary, secrets from the lockfile's pinned provider, update bot from a renovate or dependabot file — passes that map and **writes nothing**. Doctor's existing stamp check reports 20 → 21 as drift, and the reshape that follows asks q7 and q8 seeded the same way and writes the block                                                                                                                                            | pass nothing (today's behaviour); refuse until reshape                | U3, U4, U5     |
| 6 | Doctor's provider row | The provider ignore-section row the last plan added reads `answers.secrets` — the key it presumed. A `config_format` 21 config with **no** `answers:` block is drift in its own right                                                                                                                                                                                                                                                                                                                                                                                                            | leave the row keyed on nothing                                        | U5             |
| 7 | The default stays     | The materializer's "an unanswered axis reads true" rule is **unchanged** — it is what keeps a caller this plan does not know about landing what it landed before. Every caller this plan does know about now passes a full map                                                                                                                                                                                                                                                                                                                                                                   | invert the default to false                                           | U4             |
| 8 | No review row         | No unit lands runnable code: every edit is prose a skill reads, and `scripts/src/check.ts` reads neither the config nor the format. The wave review is the only review                                                                                                                                                                                                                                                                                                                                                                                                                           | a `review` row anyway                                                 | —              |
| 9 | The editor axis       | Persisted now with the other three, one mechanism for all four. Backlog **B40** ("drop the vscode configuration from init") is parked: when it lands it retires `answers.editor` together with the axis and `enforcement.editor_keys`                                                                                                                                                                                                                                                                                                                                                            | persist three and leave editor session-only; plan B40 first           | — (parked)     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                 | Depends on         | Status  | Commit |
| -- | ---- | -------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------- | ------ |
| U1 | 1    | [01-config-schema.md](01-config-schema.md)   | edit | `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/skills/setup/references/format-lineage.md`, `plugins/vwf/skills/setup/references/migrate-pipeline.md`                                                                               | —                  | pending |        |
| U2 | 1    | [02-init.md](02-init.md)                     | edit | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/skills/init/references/fragments-and-sections.md`                          | —                  | pending |        |
| U3 | 1    | [03-setup.md](03-setup.md)                   | edit | `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/materialize.md`                                                                                                                                            | —                  | pending |        |
| U4 | 1    | [04-stackgen.md](04-stackgen.md)             | edit | `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`, `plugins/stackgen/skills/stackgen-sync/SKILL.md` | —                  | pending |        |
| U5 | 1    | [05-doctor.md](05-doctor.md)                 | edit | `plugins/vwf/skills/doctor/references/stack-checks.md`, `plugins/vwf/skills/doctor/SKILL.md`                                                                                                                                         | —                  | pending |        |
| U6 | 2    | [06-docs.md](06-docs.md)                     | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-22-persisted-answers.md`                                | U1, U2, U3, U4, U5 | pending |        |
| U7 | 3    | [07-gates-and-bump.md](07-gates-and-bump.md) | edit | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                      | U6                 | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `edit`; there is no `review` row (decision 8).

## Shared-file rule

| File                                                                                         | Why it collides                                                 | Owner   |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------- |
| `plugins/vwf/assets/vwf-config.md`                                                           | U2, U3 and U5 all describe the key; U1 owns the schema          | U1 only |
| `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`                 | U3 would describe the caller's map; U4 owns the contract        | U4 only |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**` | n units editing one doc                                         | U6 only |
| the two `plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                | version files and generated files                               | U7 only |
| `docs/plans/2026-09-20-pack-intent-rendering/**`                                             | the landed plan is the historical record, superseded not edited | nobody  |

No pack under `plugins/stackgen/stacks/` is touched: no `pack.yaml`, no payload,
no pack version — so no bundle pin and no inventory regeneration either.

## Waves

- **Wave 1** — U1–U5: five disjoint trees. Each cites the `answers:` key by name
  against U1's schema rather than restating it, exactly as the previous plan's
  wave 1 cited `conditional:`.
- **Wave 2** — U6, the docs unit.
- **Wave 3** — U7, gates and bump.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    pnpm vitest run
    pnpm exec tsc --noEmit -p scripts
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf at `19.43.0+N` and stackgen at `1.26.0+N` into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session loads them |

## Gates the orchestrator keeps

none beyond the wave gate. The behaviour is proven by the user's next
`/vwf:setup reshape` on this repo — which writes the `answers:` block and steps
the stamp to 21 — and by an architecture pin taken after an editor **no**, where
the pinned pack's editor fragment must now be skipped rather than landed.

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

- **Backlog B40** — dropping the editor configuration from init and the hygiene
  pack. Parked below; this plan persists the editor axis as it stands.
- **Backlog B55** — member repos' gate-config drift (gap G15 of the shape
  audit).
- **G-6 and G-8** of `2026-09-20-pack-intent-rendering` — the three contested
  checker lows and the hook-exclude design point. Neither is about answers.
- **A new question.** The four answers are already asked; this plan records them
  and changes no interview round.
- **Persisting any other answer** — the visibility answer (`I/SKILL.md:558`) and
  the forge default-branch choice (`D/references/stack-checks.md:562-563`) are
  the same shape and stay as they are.
- **A pack, a payload or a pack version** — no file under
  `plugins/stackgen/stacks/` is touched.

## Parked

- **B40 — drop the editor configuration from init** (backlog): when it lands it
  retires `answers.editor` with the axis, the ten `vscode.d` conditionals and
  `enforcement.editor_keys`. Decided 2026-09-22: this plan persists the editor
  answer anyway, since one mechanism carries all four and B40 has no date.
- **A "remote appeared since" trigger** beyond doctor's drift row — setup's Step
  0 could watch for it directly rather than reading it off doctor's predicates.
- **Persisting the visibility answer and the forge default-branch choice** — the
  same shape as this plan's problem, in files this plan does not own.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-22-persisted-answers

or let the queue pick it, by priority:

/vwf:execute next
