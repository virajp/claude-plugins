---
type: vwf-change-plan
title: Swift tasks git compatibility — no silent pass when git ls-files fails
requires: [ docs/plans/2026-09-23-swift-package-stack ]
backlog: []
---

# Plan — Swift tasks git compatibility — no silent pass when git ls-files fails (2026-09-23)

## Status

**COMPLETE**

COMPLETE 2026-09-23 — 9a4b3403 cc6a2454 eeb34f83 646743ca e18c3e15 031e2f5c

## Consent

| Action                                            | Granted                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                               |
| After landing: `mise run p:plugins:local`         | run                                                                                               |
| Release stackgen publicly                         | patch — 1.30.0 → 1.30.1, by hand in `plugins/stackgen/.claude-plugin/plugin.json`                 |
| Release site publicly                             | patch only if U3 edits a site page — `mise run p:site:version` (bare, on a clean tree); else none |
| Release vwf publicly                              | none                                                                                              |
| Release installer publicly                        | none                                                                                              |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

The `Release` rows are **intent, not authorisation**: no public release step —
the Swift chain's releases batch at its end.

## Goal

After this lands, the `language/swift` pack's `code:format` and `code:lint`
either check the files git lists or fail loudly — on any git version — and the
pack's docs describe those tasks truly. Plan 2c (`2026-09-23-swiftui-app-stack`)
copies these tasks byte for byte, so it is chained to require this plan.

It closes gaps **G1** and **G2** of `docs/plans/2026-09-23-swift-package-stack`
(its "Gaps surfaced during execution" section). G3–G7 stay open there. No
reversal.

## Facts the survey established

All paths below are under `plugins/stackgen/stacks/`.

- **The defect (G1).** `--deduplicate` appears only in `language/swift`:
  `config/.config/mise/tasks/code/lint:133`, `code/lint:156`, `code/format:68`.
  Each is `git … ls-files … -z` inside a process substitution `< <(…)`, so git's
  exit status is lost to `set -e` and `pipefail`. The flag needs git 2.31 or
  later: on an older git (Ubuntu 20.04 Swift images ship 2.25, Debian 11 ships
  2.30) git exits 129, the list is empty, and the tools are skipped with exit 0.
- **What an empty list skips.** `code/format` has no in-git flag: a file list is
  used when given (`:61`), else `git rev-parse --is-inside-work-tree` (`:65`)
  chooses ls-files (`:68`) over `find` (`:70-73`); an empty Swift list skips
  `swift format` while dprint still runs (`:85-89`, `--allow-no-files`).
  `code/lint` sets `in_git` at `:116-118`; with `in_git=true` and an empty list
  the house linter (`:136`) and SwiftLint (`:168`, `${#swift_scope[@]} -gt 0`)
  are both skipped silently.
- **Why the flag is there.** During an unresolved merge, `git ls-files --cached`
  lists a conflicted path once per index stage; the output is sorted, so the
  stages of one path are adjacent (R4 round 3 of the previous plan).
- **Deliberate error-hiding elsewhere.** `2>/dev/null || true` on the actionlint
  workflow list in every pack's `code/lint` (`language/swift` `:87`, flutter
  `:85`, pnpm `:82`, eslint `:85`, ruff `:75`, mise `:73`) and in
  `toolchain-manager/mise/config/.config/mise/tasks/_scripts/helpers:131` is
  intended and out of scope (F4).
- **Helpers.** The mise pack's helpers library has `print_error` (`:79`, stderr)
  and no fail/die helper and no exit-status helper. The tasks source it as
  `${MISE_PROJECT_ROOT}/.config/mise/tasks/_scripts/helpers`.
- **Shell.** The shebang is `#!/usr/bin/env bash`; a stock macOS bash is 3.2, so
  `wait $!` on a process substitution (bash 4.4+) is unavailable.
- **G2 — the doc lines.** `language/swift/conventions.md:32-33` (the `code:lint`
  row claims shellcheck and actionlint run whole-tree whatever list the hook
  passes — they take the staged list; the `code:format` row says it skips what
  SwiftLint excludes, which contradicts build-and-run.md) and
  `language/swift/skills/swift/references/build-and-run.md:30` (credits the
  shipped `swiftlint.yml` with any-depth excludes; it excludes `../.build` and
  `../.swiftpm` at the root only — the any-depth exclusion is the tasks').
- **No doc states a minimum git version** anywhere in `plugins/`, `.claude/`,
  `site/src/content/docs/` or `readme.md`; no doc describes the deduplicate
  behaviour.
- **2c.** `docs/plans/2026-09-23-swiftui-app-stack/index.md:5` reads
  `requires: [ docs/plans/2026-09-23-swift-package-stack ]`; its `:50` says its
  pack copies the language/swift tasks byte for byte.
- **Smoke baseline.** A faithful scratch repo needs, beyond the Swift packs'
  payload and the mise helpers: `toolchain-manager/mise`'s `mise*.toml`, the
  dprint gate pack's `dprint.json` and `taplo.toml`, and the hygiene
  `.gitignore` with a Swift section (`.build/`, `.swiftpm/`); `MISE_ENV=dev`;
  and `code:format --fix` before the read-only run, since `swift package init`
  writes no trailing newline (G3 of the previous plan).
- **Versions.** stackgen 1.30.0, site 1.1.44, vwf 19.45.0.
- **Commit convention.** `.config/git-conventional-commits.yaml:3-9`: `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #  | Decision        | Ruling                                                                                                                                                                                                                   | Rejected                                                    | Unit |
| -- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---- |
| F1 | Scope           | Fix G1 plus the G2 doc lines in the same pack; G3–G7 stay open on the swift-package-stack folder                                                                                                                         | G1 only; also G5                                            | U1   |
| F2 | Duplicate paths | Drop `--deduplicate`; the read loop skips a path equal to the one before it (git's output is sorted, a conflicted path's stages are adjacent)                                                                            | `sort -zu`; gate the flag on a git version check            | U1   |
| F3 | Failure is loud | Write the `ls-files -z` output to a `mktemp` file with a plain command, then check its exit status; on failure `print_error` and exit non-zero; read the NUL list from the file; remove it on EXIT. Portable to bash 3.2 | `wait $!` (bash 4.4+); a pre-flight probe running git twice | U1   |
| F4 | Unchanged       | The deliberate `2>/dev/null \|\| true` on the actionlint list and in the mise helpers stays                                                                                                                              | making every pack's listing strict                          | —    |
| F5 | Review row      | R2 covers U1 — it lands shell task scripts that execute in a target repo                                                                                                                                                 | no review row                                               | R2   |
| F6 | Order after 2c  | Hard chain: the approval commit adds this folder to 2c's `requires:` and to its index row's Requires cell, by hand (no `plan-management` verb edits another plan's requirements)                                         | priority order only                                         | —    |
| F7 | Verification    | Orchestrator smoke only, no permanent test harness                                                                                                                                                                       | a new table-test gate                                       | —    |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                     | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-swift-tasks.md](01-swift-tasks.md)       | edit   | `plugins/stackgen/stacks/language/swift/config/.config/mise/tasks/code/format`, `plugins/stackgen/stacks/language/swift/config/.config/mise/tasks/code/lint`, `plugins/stackgen/stacks/language/swift/conventions.md`, `plugins/stackgen/stacks/language/swift/skills/swift/references/build-and-run.md` | —          | green  | 9a4b3403 |
| R2 | 2    | [02-review.md](02-review.md)                 | review | —                                                                                                                                                                                                                                                                                                        | U1         | green  |          |
| U3 | 3    | [03-docs.md](03-docs.md)                     | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                        | U1, R2     | green  | e18c3e15 |
| U4 | 4    | [04-gates-and-bump.md](04-gates-and-bump.md) | edit   | `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                            | U3         | green  | 031e2f5c |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                          | Why it collides                                    | Owner |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----- |
| `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`                            | several units bumping one version is a lost update | U4    |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                     | generated                                          | U4    |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md` | n units editing one doc                            | U3    |

## Waves

- **Wave 1 — U1**, the two tasks and the two pack docs.
- **Wave 2 — R2**, the review row over U1's commit.
- **Wave 3 — U3**, docs. **Wave 4 — U4**, versions and generators.

One unit per wave; nothing runs concurrently.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    pnpm vitest run
    pnpm tsc --noEmit -p installer
    pnpm tsc --noEmit -p scripts
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. The marketplace
freshness line is red inside wave 4 between U4's manifest edit and its
regeneration — expected; green before its commit.

## After landing

| Step                       | Mode | Notes                                                                                                                                                           |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed stackgen into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **Smoke test, in `/tmp`**, after wave 1 and again after wave 4, outside the
   repo and any worktree: a scratch git repo with the payload of every component
   `swift-package.md` pins, the mise pack's helpers and `mise*.toml`, the dprint
   pack's `dprint.json` and `taplo.toml`, and the hygiene `.gitignore` plus
   `.build/` and `.swiftpm/`; `MISE_ENV=dev`; `mise install`;
   `swift package init --type library`; `mise run setup:deps:install`;
   `swift build`; `swift test`; `mise run code:format --fix`;
   `mise run code:format`; `mise run code:lint`. Pass: every command exits 0.
2. **Failing git.** In the same scratch repo, a `git` shim first on `PATH` that
   exits 129 for `ls-files` and passes everything else to the real git. Pass:
   `mise run code:format` and `mise run code:lint` each exit non-zero and print
   an error naming `git ls-files`.
3. **Merge conflict.** A scratch repo mid-merge with a conflict on a `.swift`
   file (conflict markers removed, not yet `git add`ed). Pass: the path reaches
   swift-format and SwiftLint once (e.g. one SwiftLint finding, not three).
4. **Flag gone.** `grep -rn -- '--deduplicate' plugins/stackgen/stacks`. Pass:
   empty.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc outside its Owns, never adds a dependency this file
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never runs `git checkout`, `git restore`, `git stash`
or a formatter's `--fix` over any path outside its Owns, and never runs this
repo's dprint over a `config/` payload file.

A unit returns exactly this block and nothing else — no file contents, no diff —
kept under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **G3–G7** of `2026-09-23-swift-package-stack` — the smoke list, the house
  linter ignoring `.gitignore` (Flutter's exposure), U2's `.swiftpm` claim and
  swift-format rules, the ragged folds, the unpinned linter — user scoped this
  plan to G1 + G2 (F1).
- **Every other pack's error-hiding `|| true`** — deliberate (F4).
- **A permanent test harness for pack task scripts** — F7.
- **A public release** — batched at the chain's end.

## Parked

None.

## Gaps surfaced during execution

- **G1 — contested at the R2 review cap (round 4).**
  `plugins/stackgen/stacks/language/swift/conventions.md:32-33`: the
  `code:format` and `code:lint` rows say only "every file git does not ignore"
  and omit that both tasks walk the tree with `find` when there is no `.git`
  entry, no `GIT_DIR` or no git installed; `build-and-run.md:35-41` states it.
  Exit: the cap — the plan left the two docs' exact wording of the no-git case
  unspecified. Non-blocking. **Resolved 2026-09-23** in 12778549 — a note under
  the task table names the git-repository test and the `find` walk.

## Run log

| Wave | Unit         | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Commit   |
| ---- | ------------ | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | format-check | —     | —     | skipped     | no `covers:` — the plan reads no blueprint artifact                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 0    | preflight    | —     | —     | green       | doctor blockers clear (mise, graphify CLI, main-checkout graph; no `.config/vwf.yaml` stack, no `code` unit so no LSP read); all 9 wave-gate lines green on develop 548fe140                                                                                                                                                                                                                                                                                                                             | —        |
| 0    | conventions  | —     | —     | skipped     | no `code` unit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 0    | order        | —     | —     | green       | W1 U1 (edit) → W2 R2 (review, covers U1) → W3 U3 (edit) → W4 U4 (edit)                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 1    | U1           | opus  | 1     | green       | DECIDED: code:lint lists once, filters `*.swift` from that one list; fix inline, no new helper. Scratch smoke by unit: format/lint exit 0; shim → exit 129 with error; mid-merge one finding each. DOCS FALSIFIED none, GAP none                                                                                                                                                                                                                                                                         | —        |
| 1    | R1           | opus  | 1     | findings(2) | rule 5: stale comments `code/format:39` and `code/lint:161-163` still say the Swift scope leaves out what `.config/swiftlint.yml` excludes; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                | —        |
| 1    | U1           | opus  | 2     | green       | loop-back from R1: the two scope comments now credit the any-depth list to the tasks, root-only excludes to swiftlint.yml; comments only; shellcheck green                                                                                                                                                                                                                                                                                                                                               | 9a4b3403 |
| 1    | R1           | opus  | 2     | pass        | both findings fixed; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 1    | gate         | —     | —     | green       | all 9 wave-gate lines green                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 1    | smoke        | opus  | 1     | green       | orchestrator gates 1–4 after wave 1: scratch repo build/test/format/lint exit 0; git shim → both tasks exit 129 with `git ls-files failed (exit 129)`; mid-merge one swift-format pass and one SwiftLint finding; `--deduplicate` grep empty                                                                                                                                                                                                                                                             | —        |
| 2    | R2           | opus  | 1     | findings(6) | review, range 548fe140..0d0e1e1b, 4 files → U1 (9a4b3403). Engine /code-review 9 findings, /security-review none (logs engine/R2-1.*). Kept: build-and-run.md:22,41-45 G2 half-fixed (medium); conventions.md:32-33 'every tracked file' + ambiguous clause; build-and-run.md:37 overstated; format:70/lint:119 'sorted' comment; lint:166 two loops; lint:122/format:67 rev-parse fallback silent (pre-existing). Engine-only, not kept by reviewer: last-byte glob, duplicated block, helpers:131 (F4) | —        |
| 2    | R2           | opus  | 1     | pass        | security: no findings; approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | U1           | opus  | 3     | green       | R2 loop-back: all 6 findings fixed; one listing loop in lint; DECIDED rev-parse: only 'not a git repository' (LC_ALL=C) or no git falls back to find, any other failure prints `git rev-parse failed (exit N)` and exits. GAP: shellcheck scope still from the helper's silent listing (F4); ownership error tested by shim only. Smoke green                                                                                                                                                            | cc6a2454 |
| 2    | R2           | opus  | 2     | findings(3) | review, range 548fe140..cc6a2454. Engine 8 (log engine/R2-2.review.log); 2 already reported in round 1 dropped (helpers:131, last-byte glob). Kept: lint:140/format:76 'not a git repository' match also catches unreadable repos (reproduced); lint:135/format:71 `2>&1` capture (GIT_TRACE=1 reproduced); build-and-run.md:23 code:format row vs hook mode. Site finding is U3's. Verdict approve                                                                                                      | —        |
| 2    | R2           | opus  | 2     | pass        | security: no findings; approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | U1           | opus  | 4     | green       | R2 round-2 loop-back: rev-parse probe removed; in a repo when a `.git` entry is in cwd or a parent, or GIT_DIR is set; then one `git ls-files` decides list vs loud error (F3 no-probe now holds); build-and-run.md:23 row fixed. GAP: a bare repo or unintended parent `.git` now fails loudly rather than walking (intended). Smoke green incl. broken .git file → 128, GIT_TRACE=1 still lists                                                                                                        | eeb34f83 |
| 2    | R2           | opus  | 3     | findings(1) | review, range 548fe140..eeb34f83. Engine 8 (log engine/R2-3.review.log); 3 already reported earlier in this loop dropped (site manual, duplicated block, helpers listing); 4 pre-existing or accepted not raised by the reviewer. Kept: build-and-run.md:35-40 omits that a set GIT_DIR counts as a repo. Verdict approve                                                                                                                                                                                | —        |
| 2    | R2           | opus  | 3     | pass        | security: no findings; approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | U1           | opus  | 5     | green       | R2 round-3 loop-back: build-and-run.md repo test and walk case now name GIT_DIR; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                   | 646743ca |
| 2    | R2           | opus  | 4     | findings(1) | review, range 548fe140..646743ca. Engine 8 (log engine/R2-4.review.log); earlier-round repeats dropped, 4 new engine items not raised (empty successful list, inherited GIT_DIR, temp file on INT/TERM, conventions row). Kept: conventions.md:32-33 rows omit the no-git find walk. Cap reached (4) → contested, gap G1. Verdict approve                                                                                                                                                                | —        |
| 2    | R2           | opus  | 4     | pass        | security: no findings; approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | W2           | opus  | 1     | findings(2) | contract review over 0d0e1e1b..4b85dd69: CONTRACT clean, RULINGS clean; rule 5 → U3 as DOCS FALSIFIED: `site/src/content/docs/plugins/stackgen.md:275-278` and `plugins/stackgen/stacks/readme.md:63-65` omit the hook list, the no-git find walk and the loud failure                                                                                                                                                                                                                                   | —        |
| 2    | gate         | —     | —     | green       | all 9 wave-gate lines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| —    | acceptance   | —     | —     | skipped     | no `covers:` — no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| —    | ux           | —     | —     | skipped     | no `covers:` — no Screens contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| —    | reconcile    | —     | —     | skipped     | no `covers:` — no stamps, registry or harness to reconcile; no `code` unit, nothing to persist                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 3    | U3           | opus  | 1     | green       | docs-sync over 548fe140..HEAD: nothing beyond the two DOCS FALSIFIED lines; both applied (hook list, loud ls-files failure, no-git walk) to `site/src/content/docs/plugins/stackgen.md` and `plugins/stackgen/stacks/readme.md`. DECIDED: a site page changed → site patch bump applies                                                                                                                                                                                                                  | —        |
| 3    | W3           | opus  | 1     | findings(3) | rule 5: stackgen.md:280 and stacks/readme.md:66 'no .git entry, no GIT_DIR or no git' reads as any one of three (tasks walk on neither .git nor GIT_DIR, or no git); stackgen.md:276-277 'otherwise' wrongly covers code:lint's list. CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                      | —        |
| 3    | U3           | opus  | 2     | green       | W3 loop-back: fallback reworded to 'neither a .git entry nor GIT_DIR, or no git installed' in both docs; 'otherwise' limited to code:format; p:site:check green                                                                                                                                                                                                                                                                                                                                          | e18c3e15 |
| 3    | W3           | opus  | 2     | pass        | all three fixed; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 3    | gate         | —     | —     | green       | all 9 wave-gate lines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 4    | U4           | opus  | 1     | green       | site 1.1.44 → 1.1.45 (bare p:site:version, clean tree, first); stackgen 1.30.0 → 1.30.1 by hand; marketplace regenerated; inventory unchanged; all 9 gate lines green; no 13/17                                                                                                                                                                                                                                                                                                                          | 031e2f5c |
| 4    | W4           | opus  | 1     | pass        | CONTRACT clean, RULINGS clean; 3 files in Owns; marketplace stackgen ref stackgen-v1.30.1                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 4    | gate         | —     | —     | green       | all 9 wave-gate lines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| —    | smoke        | opus  | 2     | green       | orchestrator gates 1–4 after wave 4, fresh payload copy: build/test/format/lint exit 0; ls-files shim → 129 with error; mid-merge one swift-format pass, one SwiftLint finding; `--deduplicate` grep empty; extra: .git file to missing gitdir → 128 with error, no .git/GIT_DIR → exit 0                                                                                                                                                                                                                | —        |
| —    | final gate   | —     | —     | green       | all 9 wave-gate lines over the finished tree (031e2f5c)                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-23-swift-tasks-git-compat

or let the queue pick it, by priority:

/vwf:execute next
