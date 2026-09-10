---
type: vwf-change-plan
title: vwf pair hardening — commit types, retired names, staged deletions,
  nobody-owned docs findings, hidden tasks, the dprint shim
requires: []
---

# Plan — vwf pair hardening (2026-09-10)

## Status

**COMPLETE** 2026-09-10. Ran in worktree
`.worktrees/2026-09-10-vwf-pair-hardening` on branch
`2026-09-10-vwf-pair-hardening`, branched from `develop` at `c9750d18`. Commits,
in order: U1 `3396a109`, U2 `b4f5d24f`, U3 `cdb5a380`, U4 `3566074e`, plan
`6f31d210`, U5 `1f1a6444`, plan `7ed064e5`, U6 `23a7cb08`, then this archive
commit. Every unit green; three GAPs recorded (U2, U4, U5); no contested
findings; no unit skipped or failed.

**APPROVED** 2026-09-10 by the user, after the shape gate and the
post-self-review yes.

## Consent

| Action                                            | Granted                                                                                                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                              |
| After landing: `mise run plugins:local`           | run                                                                                                                              |
| After landing: `/release`                         | ask                                                                                                                              |
| Release `vwf` publicly                            | patch — 19.14.0 → 19.14.1, by editing `version` in `plugins/vwf/.claude-plugin/plugin.json`, then `mise run plugins:marketplace` |
| Release `stackgen` publicly                       | none                                                                                                                             |
| Release installer publicly                        | none                                                                                                                             |
| Release site publicly                             | none                                                                                                                             |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, a plan written by `/vwf:change-plan` carries commit types the
repo's own commit-message gate accepts, names an owner for every pointer a
retired or renamed name leaves behind, and puts a check that holds only after a
unit lands in that unit's Verification rather than in the wave gate. A
`/vwf:change-execute` run cannot sweep one unit's staged deletion into another
unit's commit, routes a docs finding in a file nobody owns to the docs unit
instead of stalling, and its `have_task` probe sees a hidden task. `/vwf:init`'s
existing-repo pipeline says what the dprint pack already knows about moving a
real `dprint.json` behind the root shim.

Every item is a defect the pair's first two runs in this repo surfaced
(2026-09-08, `docs/plans/archived/2026-09-08-retire-repo-plan-skills/`, and the
2026-09-09 `/vwf:setup reshape` run). Nothing here reverses a standing decision.

## Facts the survey established

**change-plan.** The unit file's `## Commit` line format lives only in
`plugins/vwf/skills/change-plan/references/plan-template.md:187-190`
("`<type>: <description>` — written by the orchestrator after the wave gate");
`SKILL.md:174-176` says a unit file carries "its commit line". Nothing in
change-plan reads `.config/git-conventional-commits.yaml`; the only reader is
git-workflow step 3.4 (`git-workflow/SKILL.md:160-161`), at commit time. This
repo's file allows exactly `ops, docs, merge, feat, fix, refactor`; the
2026-09-08 plan's unit file said `chore:` and the orchestrator substituted at
commit time. The survey step is `change-plan/SKILL.md:55-68` (trees, gates,
docs, dependencies — no name grep); the closest interview item is
`references/interview.md:58-59` (item 14, docs the change falsifies); the
self-review is `SKILL.md:202-203`. The wave-gate template is
`plan-template.md:90-94`; `change-execute/SKILL.md:72-80` runs the whole gate
before wave 1 and calls a red line "the integration branch's". The unit contract
is `plan-template.md:110-128`; the dispatch prompt is
`change-execute/SKILL.md:89-96`; neither mentions deletions or `git rm`.

**change-execute.** Commit step: `SKILL.md:116-119` ("one commit per unit in
wave order using each unit file's commit line") via git-workflow step 3, whose
staging is `git add <files>` (`git-workflow/SKILL.md:157-158`). No guard against
a deletion another unit staged with `git rm`. On 2026-09-08 U2's staged
`docs-reconciler.md` deletion rode into U1's round-2 commit and was undone with
`git reset --soft HEAD~1`. Wave-review rules: `references/wave-review.md:24-34`
(rule 1 Scope, rule 5 Docs); loop `:41-58` ("findings loop to the owning unit")
— nothing for a finding in a nobody-owned file. On 2026-09-08 four
`docs-reconciler` sentences in files no unit owned were routed to the docs unit
with its Owns widened, as a GAP; the same shape happened on three earlier plans
(memory `plan-needs-owner-for-cross-pack-falsified-passages`).

**git-workflow.** `have_task()` is
`git-workflow/references/worktree-setup.md:99`:
`mise tasks 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "$1"` — no
`--hidden`; reused at `SKILL.md:139-140,149` for `code:precommit`. The shipped
mise pack hides 20 tasks with `#MISE hide=true` (all `_scripts/*`,
`setup/{mise,secrets,default-branch,precommit}`, `setup/deps/*`,
`setup/external/*`, `setup/vscode`, `code/ai`); `setup/all`, `setup/worktree`
and `code/precommit` are not hidden, so the three probes work today. Doctor's
probe (`doctor/references/harness-and-memory.md:12`) is out of scope: the
harness tasks it detects are unhidden by design.

**init.** `init/references/existing-repo.md:34-51` (the move-and-shim case) says
the real root file moves and "the settings survive the move — they are read
through the stand-in" (`:46-47`). The dprint pack says otherwise at
`plugins/stackgen/stacks/toolchain-gate/dprint/skills/dprint/SKILL.md:122-125`:
"`excludes` is inherited through `extends`; `includes` is not … dropped *and*
reported as a fatal config diagnostic … every bare invocation through the shim
exits 11"; and at `:53-57` the pinned plugin list *is* the include set — "Add a
plugin to widen; add an exclusion to narrow". On 2026-09-09 the moved
`dprint.json` carried `includes`, the shim failed with "Unexpected non-string,
boolean, or int property (includes)", and dropping `includes` widened the gate
to six `site/public/brand/*.svg` (markup_fmt claims `.svg`) until an `excludes`
entry was added.

**Docs that describe today's behaviour.** `site/src/content/docs/plugins/vwf.md`
`#vwfchange-plan` `:1639-1698`, `#vwfchange-execute` `:1699-1780` (commit per
green unit `:1727`), `#vwfgit-workflow` `:1888-1904`; the how-to
`site/src/content/docs/how-to/operate/ad-hoc-change.md:62` (survey), `:109` (one
unit one commit), `:138`; the repo maps
`.claude/skills/vwf-plugin/SKILL.md:60-61,154-156` and
`references/skills-and-agents.md:36,40,41`; `readme.md:222-224`;
`CLAUDE.md:49-50,65`. The init section of the manual (`vwf.md:795+`) mentions
neither the shim nor dprint.

**Gates.** `plugins:check` (thirteen rules, incl. strict-YAML frontmatter and
`claude plugin validate --strict`), `plugins:marketplace --check`,
`plugins:inventory --check`, `plugins:npm-normalize-test`, `pnpm vitest run`,
`tsc -p installer`, `tsc -p scripts`, `site:check`. `plugins/**/*.md` is not
dprint-formatted — fold width is matched by hand. No gate delta: every edit is
prose in a skill file the existing rules already cover.

**Versions.** vwf 19.14.0 (`plugins/vwf/.claude-plugin/plugin.json:4`), pinned
`vwf-v19.14.0` at `.claude-plugin/marketplace.json:54`.

## Assumed decisions — confirm or override at review

| # | Decision                       | Ruling                                                                                                                                                                                                                                                                                                                                                                                                   | Rejected                                                                                                                          | Unit   |
| - | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1 | Where commit types are checked | **Plan-time.** Survey §1 reads `.config/git-conventional-commits.yaml` (or the repo's equivalent convention file); the template constrains every `## Commit` line to its types and scopes; absent a file, git-workflow's common-types list applies. git-workflow step 3.4 stays as the second check; change-execute is unchanged.                                                                        | run-time validation and substitution in change-execute (a mapping the user never reviewed); both (a second parse step in execute) | U1     |
| 2 | Retired-name grep              | Survey §1 gains a bullet: when the request retires or renames a name, grep the name itself across every tree — `.claude/`, `installer/`, `site/src/content/docs/`, `plugins/`, the root docs — and every hit gets an owner in the unit table. Interview item 14 and the self-review point at it.                                                                                                         | —                                                                                                                                 | U1     |
| 3 | Wave-scoped checks             | **Doctrine, not syntax.** The Wave gate holds from preflight on, unchanged; a check that only holds once unit N has landed is written into unit N's Verification and repeated in the gates-and-bump unit's. One sentence in the template and in §4(a).                                                                                                                                                   | a `(from wave N)` suffix change-execute honours (a new parse rule and a second way to say what Verification already says)         | U1     |
| 4 | The staged deletion            | **Both ends.** Unit contract and dispatch prompt: delete with plain `rm`, never `git rm` — a unit stages nothing. Execute step 5: stage exactly the unit's Owns (`git add -- <paths>`, which stages a deletion too), then `git diff --cached --stat` must list nothing outside them; a stray path is unstaged with `git reset -q HEAD -- <path>` before the commit.                                      | execute-only (the index stays shared state a unit can dirty); units-only (relies on every unit obeying)                           | U1, U2 |
| 5 | Nobody-owned docs findings     | **Route to the docs unit, widen its Owns, log a GAP.** A rule-5 finding in a file no unit owns becomes a `DOCS FALSIFIED:` line for the docs unit; the orchestrator widens that unit's Owns to the passage, records the widening in the Units table and the run log as a GAP, and the final report lists it. The plan's Goal is the authority. Bounded to rule-5 — a code path nobody owns still blocks. | block (the surfacing unit returns UNRESOLVED; four one-line sentences would have blocked the 2026-09-08 run)                      | U2     |
| 6 | Hidden tasks                   | `have_task` probes `mise tasks --hidden`. One token; the pack hides 20 tasks including `setup:precommit` and `setup:mise`.                                                                                                                                                                                                                                                                               | leave (works for today's three probes only)                                                                                       | U3     |
| 7 | The worktree preference        | **Dropped.** `worktree-setup.md` 2a/2b stay as they are — the fallback exists and every run finds it. The user: *"Why are we creating this docs? It's already covered in git-workflow"*.                                                                                                                                                                                                                 | a guard caveat after 2a; flipping 2b to preferred                                                                                 | —      |
| 8 | The dprint shim                | `existing-repo.md`'s move-and-shim case gains one paragraph: the moved real config must lose its `includes` key (not inherited through `extends`; a fatal diagnostic), and dropping it can widen the file set to every extension a pinned plugin claims — narrow with `excludes`, never by restoring `includes`. Cite the dprint pack's own lines.                                                       | —                                                                                                                                 | U4     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                     | Depends on | Status | Commit     |
| -- | ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------ | ---------- |
| U1 | 1    | [01-change-plan.md](01-change-plan.md)       | `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/change-plan/references/interview.md`, `plugins/vwf/skills/change-plan/references/plan-template.md`                                                        | —          | green  | `3396a109` |
| U2 | 1    | [02-change-execute.md](02-change-execute.md) | `plugins/vwf/skills/change-execute/SKILL.md`, `plugins/vwf/skills/change-execute/references/wave-review.md`                                                                                                              | —          | green  | `b4f5d24f` |
| U3 | 1    | [03-git-workflow.md](03-git-workflow.md)     | `plugins/vwf/skills/git-workflow/references/worktree-setup.md`                                                                                                                                                           | —          | green  | `cdb5a380` |
| U4 | 1    | [04-init.md](04-init.md)                     | `plugins/vwf/skills/init/references/existing-repo.md`                                                                                                                                                                    | —          | green  | `3566074e` |
| U5 | 2    | [05-docs.md](05-docs.md)                     | `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/how-to/operate/ad-hoc-change.md`, `.claude/skills/vwf-plugin/**`, `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `docs/memory/decisions/**` (none expected) | U1–U4      | green  | `1f1a6444` |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md) | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                              | U5         | green  | `23a7cb08` |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                               | Why it collides                                                                                | Owner   |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`                           | the version                                                                                    | U6 only |
| `.claude-plugin/marketplace.json`                                  | generated                                                                                      | U6 only |
| `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/**` | docs                                                                                           | U5 only |
| `plugins/vwf/skills/change-plan/references/plan-template.md`       | carries both the unit contract (decision 4) and the wave-gate wording (decision 3) — one owner | U1 only |
| `plugins/vwf/skills/change-execute/SKILL.md`                       | the dispatch prompt (decision 4) and the commit step (decision 4)                              | U2 only |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Four skill trees, disjoint paths, no dependency
  between them.
- **Wave 2 — U5**, the docs unit, over wave 1's delta.
- **Wave 3 — U6**, the gates-and-bump unit.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `mise run plugins:npm-normalize-test`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer`,
`pnpm exec tsc --noEmit -p scripts`, `mise run site:check` — plus the wave
review, plus every report read for `UNRESOLVED:`. The plan's own checks:

- `grep -rn 'git rm' plugins/vwf/skills/change-plan plugins/vwf/skills/change-execute`
  → only the sentences that forbid it.
- `grep -n 'mise tasks --hidden' plugins/vwf/skills/git-workflow/references/worktree-setup.md`
  → one hit.

## After landing

| Step                     | Mode | Notes                                                                                                                                            |
| ------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run plugins:local` | run  | stages vwf into the dev marketplace under `19.14.1+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |
| `/release`               | ask  | cuts `vwf-v19.14.1`; reaches every user of the marketplace                                                                                       |

## Gates the orchestrator keeps

- None beyond the wave gate: no manifest, skill list or agent changes, so no
  `target-verifier` run. The final report says so in one line.

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

- **`worktree-setup.md` 2a/2b** — decision 7, dropped at the user's word.
- **`docs-sync`, `handoff`, `doctor`** — unchanged. Doctor's `mise tasks` probe
  detects harness tasks that are unhidden by design.
- **The mise pack's own `hide=true` flags** — stackgen's, and correct.
- **Any change under `plugins/stackgen/`** — the dprint facts are cited, not
  moved.
- **A `--hidden` on doctor's probe** — see above.

## Parked

none

## Run log

| Wave | Unit               | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Commit     |
| ---- | ------------------ | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 0    | preflight          | —     | —     | green       | All eight gate lines pass on the branch at `c9750d18`: `plugins:check`, `plugins:marketplace --check`, `plugins:inventory --check`, `plugins:npm-normalize-test`, `pnpm vitest run`, `tsc -p installer`, `tsc -p scripts`, `site:check`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |            |
| 0    | preflight          | —     | —     | green       | Plan check 1 (`git rm` in the pair) passes vacuously — zero hits, so no use to forbid yet. Plan check 2 (`mise tasks --hidden`) has zero hits and only holds once U3 lands; carried to U3's Verification and U6's per decision 3, not treated as an inherited red line.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |            |
| 1    | U3                 | opus  | 1     | green       | `have_task` probes `mise tasks --hidden`; 2a/2b untouched. DECIDED: probe kept on one line (87 chars), matching the file's existing long code lines. No DOCS FALSIFIED, no GAP. Verification green incl. `plugins:check` and the `setup:precommit` hidden-task probe.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |            |
| 1    | U4                 | opus  | 1     | green       | `existing-repo.md` move-and-shim case gains the non-inherited-key paragraph and the widening-narrowed-by-exclusion paragraph; Plan section gains the move row's two sub-lines. DECIDED: cite the gate pack's skill by role, naming neither tool nor key, so vwf prose carries no fact that can drift from the pack. GAP: ruling said "one paragraph"; landed as two at the fold, content unchanged. DOCS FALSIFIED: none — the manual's init section never mentioned the shim. Verification green.                                                                                                                                                                                                                                                                                                                                                      |            |
| 1    | U1                 | opus  | 1     | green       | `SKILL.md`: §1 gains the commit-convention and retired-name-grep bullets, §4(a) the wave-scoped-check sentence, §6 the `rm`-never-`git rm` sentence, §7 the self-review bullet. `interview.md`: item 14 covers every retired-name hit as a unit-table row. `plan-template.md`: Wave gate placeholder, Unit contract `rm` sentence, skeleton Guardrails line, `## Commit` bound to the convention file. DECIDED: §4(a) sentence placed after the gate-timing clause; common-types list quoted from git-workflow `SKILL.md:175-176`. No DOCS FALSIFIED, no GAP. Verification green.                                                                                                                                                                                                                                                                       |            |
| 1    | U2                 | opus  | 1     | green       | `SKILL.md`: dispatch prompt forbids `git rm` and staging; step 5 stages by Owns, checks `git diff --cached --stat`, unstages strays; §6 GAP bullet lists every run-time Owns widening. `wave-review.md`: new loop bullet routes a rule-5 finding in a nobody-owned file to the docs unit, widens its Owns, logs a GAP. DECIDED: step 5 reads stage → inspect → unstage → commit; rule-5 bullet closes with "handled by the bullets above". GAP: edit 4 offered §4 step 3 or §6 — placed in §6's GAP bullet, since the widening is a GAP the report renders from the run log. DOCS FALSIFIED (2, for U5): `site/src/content/docs/plugins/vwf.md:1727` (commit per green unit now stages exactly Owns and unstages strays) and `:1726` (the two-round loop has the nobody-owned rule-5 exception).                                                        |            |
| 1    | R1                 | opus  | 1     | findings(2) | CONTRACT clean, RULINGS clean. (1) `change-plan/SKILL.md:132` [U1] tree traps — 61-char line mid-paragraph, rest of §4(a) not rewrapped to the file's fold; looped to U1. (2) `site/src/content/docs/how-to/operate/ad-hoc-change.md:137` [U2] docs — "at most two rounds … one commit per green unit" falsified by the rule-5 exception and stage-by-Owns, unreported; recorded here as a third DOCS FALSIFIED line for U5 (the file is U5's Owns already), no re-dispatch needed. Verified: all seven paths in exactly one Owns, stackgen untouched, 2a/2b untouched, every numbered edit landed.                                                                                                                                                                                                                                                     |            |
| 1    | U1                 | opus  | 2     | green       | §4(a) rewrapped to the file's 78–80 column fold; words unchanged, only line breaks moved. Verification re-run green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |            |
| 1    | R1                 | opus  | 2     | pass        | FINDINGS 0, CONTRACT clean, RULINGS clean. Rewrap is the only change since round 1; the other six files byte-identical. Converged: 2 → 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |            |
| 1    | gate               | —     | —     | green       | All eight gate lines pass over wave 1; plan check 1 hits only the four forbidding sentences; plan check 2 hits once at `worktree-setup.md:99`. No report carries `UNRESOLVED:`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |            |
| 1    | commit             | —     | —     | paused      | U1 staged (3 files) and every pre-commit hook passed, but `git commit` fails at signing: `1Password: failed to fill whole buffer` from `op-ssh-sign`, twice; a direct `op-ssh-sign -Y sign` probe returns nothing. 1Password is running with `--just-updated --should-restart`. Machine fact, not the tree's. Resolved: the cause was this session's shell sandbox blocking the signer's socket to the 1Password app, not 1Password itself — a signed commit in a scratch repo succeeded the moment the sandbox was disabled. All commit commands from here run unsandboxed.                                                                                                                                                                                                                                                                            |            |
| 1    | commit             | —     | —     | green       | One commit per unit in wave order, each staged by its Owns alone: U1 `3396a109`, U2 `b4f5d24f`, U3 `cdb5a380`, U4 `3566074e`. Every pre-commit hook and the conventional-commits check passed on each.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `3566074e` |
| 2    | U5                 | opus  | 1     | green       | docs-sync over the branch delta plus the three DOCS FALSIFIED lines and the survey list. `vwf.md`: init move-and-shim facts; change-plan survey reads (convention, retired-name grep) and the green-before-wave-1 rule; change-execute Waves bullet gains stage-by-Owns, unstage strays, `rm` not `git rm`, the nobody-owned finding exception as a GAP. `ad-hoc-change.md`: the survey reads, the wave-gate rule, stage-by-Owns and the nobody-owned exception in how-to voice. `skills-and-agents.md`: pair rows widened. DECIDED: manual names neither tool nor key (U4's ruling); Owns widening stated in the Waves bullet, the how-to's final-report paragraph got it. Confirmed untouched: readme, CLAUDE.md, vwf-plugin SKILL.md, `.claude/docs`. GAP: "one sentence" for the init section landed as three in one paragraph. Verification green. |            |
| 2    | R2                 | opus  | 1     | findings(1) | CONTRACT clean, RULINGS clean. `vwf.md:892` [U5] rulings — decision 8 drift: init's Plan emits a sub-line per exclusion plus one for the dropped key; the manual said "a sub-line per file that newly enters". Looped to U5. Verified: three paths in Owns, all three handed-over lines and every survey item landed, `#vwfgit-workflow` unchanged, no decision-7 claim, dprint check clean.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |            |
| 2    | U5                 | opus  | 2     | green       | Manual's move-and-shim sentence now names the sub-lines at U4's grain: one for the dropped key, one per exclusion naming the files it keeps out, before the one consent. Still names neither tool nor key. dprint check and `site:check` green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |            |
| 2    | R2                 | opus  | 2     | pass        | FINDINGS 0, CONTRACT clean, RULINGS clean. Reviewer re-ran `site:check` itself: green. Converged: 1 → 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |            |
| 2    | gate               | —     | —     | green       | All eight gate lines pass over waves 1–2; plan checks 1 and 2 hold as before. No report carries `UNRESOLVED:`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |            |
| 2    | commit             | —     | —     | green       | U5 committed, staged by its Owns alone: `1f1a6444`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `1f1a6444` |
| 3    | U6                 | opus  | 1     | green       | `plugin.json` version 19.14.0 → 19.14.1; `marketplace.json` regenerated, vwf ref `vwf-v19.14.1`; `plugins:inventory` regenerated with no diff. Full gate plus both plan checks green. No DECIDED, GAP or DOCS FALSIFIED.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |            |
| 3    | R3                 | opus  | 1     | pass        | FINDINGS 0, CONTRACT clean, RULINGS clean.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |            |
| 3    | gate               | —     | —     | green       | All eight gate lines pass over the whole branch; plan check 1 hits the four forbidding sentences, plan check 2 hits once; `plugin.json` reads 19.14.1, marketplace pins `vwf-v19.14.1`. No report carries `UNRESOLVED:`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |            |
| 3    | commit             | —     | —     | green       | U6 committed, staged by its Owns alone: `23a7cb08`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `23a7cb08` |
| —    | orchestrator gates | —     | —     | green       | None beyond the wave gate: no manifest shape, skill list or agent change, so no `target-verifier` run.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |            |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-10-vwf-pair-hardening
