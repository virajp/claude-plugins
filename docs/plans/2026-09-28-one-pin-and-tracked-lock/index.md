---
type: vwf-change-plan
title: one pin per tool and a tracked lock — tool-config asks which version to
  keep, init never leaves the mise lock ignored
requires:
  - docs/plans/2026-09-26-init-commits-the-lock
  - docs/plans/2026-09-27-dash-names-and-mise-ignores
backlog: []
backlog_pieces: []
---

# Plan — one pin per tool and a tracked lock (2026-09-28)

## Status

**COMPLETE**

COMPLETE 2026-09-28 — b5e333c1, 88ef8d3c, f9110595, 5f367219, 936a4e49

## Consent

| Action                                            | Granted                                                                                                                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                                |
| Release vwf publicly                              | patch if `vwf-v20.0.0` is tagged when the run starts (`20.0.0` → `20.0.1`, by editing `plugins/vwf/.claude-plugin/plugin.json`), else none — rides `20.0.0`; no release step       |
| Release stackgen publicly                         | patch if `stackgen-v2.0.0` is tagged when the run starts (`2.0.0` → `2.0.1`, by editing `plugins/stackgen/.claude-plugin/plugin.json`), else none — rides `2.0.0`; no release step |
| Release site publicly                             | none — the manual edits ride the site's next release                                                                                                                               |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session. vwf and stackgen are released
together, never one alone (G6 of the plan this one requires).

## Goal

After this lands, three things hold. tool-config's docs say graphify needs both
python and uv. When tool-config lands its base mise block and a tool the block
pins is already pinned in the repo, the person is asked which version to keep —
the repo's or the base's `latest` — and the winner is pinned once, in the tools
file for the environments that need it. And init never leaves
`.config/mise/mise.lock` or `.config/mise/locks/` ignored, and its Lock report
line reads `none` when the lock step changed nothing.

Framing: G3, G7 and G9 of `docs/plans/2026-09-26-init-commits-the-lock`, left
open by the user's rulings recorded in that folder's gap section.

**Reversal:** decision 9 of that plan accepted "the one-pin overlap with a
runtime pack's python pin". The user withdrew it: "ask user to select which
version must be retained/used and pin that only. Give option to select
“latest”", and "The same is true for all tools". Confirmed at the interview.

## Facts the survey established

- **G3 passages.** `plugins/stackgen/skills/tool-config/references/mise.md` near
  :217-218 says "a repo with no Python still installs the graph tool", and the
  next sentence adds python. `site/src/content/docs/plugins/vwf.md` :58-66 (the
  prerequisite table) calls uv "graphify's Python runtime" with no python row,
  and :194 lists graphify and uv with no python.
  `plugins/vwf/skills/doctor/references/code-intelligence.md:16` says "Its
  Python/uv toolchain", which is vague. Correct already: `tools.dev.toml:23`,
  `site/.../plugins/stackgen.md:1018-1021`, `mise.md:101`, `init/SKILL.md:691`,
  `new-repo.md:721`, `.claude/docs/ci-and-releases.md:21`.
- **The one-pin rule** is at `references/mise.md` :77-80, :128-130 and :420-424:
  a second `add tool` for a name already pinned in any tools file is not
  written, it becomes a conflict row naming file and owner, and a pin two
  environments need moves to `conf.d/tools.toml`. Row answers are
  `keep-existing` / `overwrite` (`tool-config/SKILL.md:236-262`), numbered r1,
  r2, …, returned by the caller as `answers=`; the skill never picks
  (`SKILL.md:360`). The caller runs `preview` (`SKILL.md:66-71`) and asks inside
  its own consent. **The gap:** `all` landing its own base block is not checked
  against a user's existing pins — the check is written for `add tool` only.
- **The `all` migration** (`mise.md:483-511`) splits old root mise configs,
  drops what duplicates the base block and keeps the rest as the user's lines.
  init shows its rows via `existing-repo.md:212-224` and `:724-729`,
  `tool-configs.md:46`, and `new-repo.md:107-116` ("Tool-config rows").
- **Callers that ask:** init (`all` with a preview, rows in its one consent),
  the materializer (`materializer.md:124-127`, `:335-342`), `/vwf:setup`
  (`setup/SKILL.md:205-218`, `:231`).
- **No shipped pack pins python.** `RUNTIME_BLOCK` is at
  `assets/mise/.config/mise.toml:87-90`, defined at `mise.md:303`, `:358-365`;
  its python row is empty. The base dev block
  `assets/mise/.config/mise/conf.d/tools.dev.toml` pins python and uv at
  `latest`; its header (:5-6) says the overlap with a runtime pack's python pin
  "is accepted" — falsified by this plan.
- **G9, lock ignored.** Defined at
  `plugins/vwf/skills/init/references/new-repo.md` :737-739
  (`git check-ignore -q .config/mise/mise.lock` → no lock staged, *lock
  ignored*), with *lock deferred* and *lock failed* at :730-737. The report copy
  is `new-repo.md:1069-1071`; the report spec is `init/SKILL.md:842`, under the
  rule at :839 "Every line reads `none` where nothing happened". The site copy
  is `site/.../plugins/vwf.md:1463-1466`. `existing-repo.md:1153-1156` defers to
  §11(b). The Lock line has no none state today.
- **gitignore.** The shipped `assets/git/.gitignore` cannot match `mise.lock` or
  `locks/`; `references/git.md:121-128` already turns a fetched template line
  ignoring `.config/mise/mise.lock` into a conflict row, with no such guard for
  `locks/`. A line outside every block is written or removed only on a person's
  approval (`tool-config/SKILL.md:89-91`, `:207-212`). git's last matching
  pattern wins, and a negation cannot re-include a path whose parent directory
  is excluded.
- **Overlap with the required plan.** `2026-09-27-dash-names-and-mise-ignores`
  (APPROVED, priority 70) owns `assets/git/.gitignore`,
  `references/{git,mise,pre-commit}.md` (its U1) and the site docs and
  `.claude/**` (its U3); it fixes the ignore for `.config/mise.local.lock`. This
  plan runs after it and edits those files as they stand then.
- **Gates.** `p:plugins:check` covers `plugins/**`; `p:plugins:shellcheck`
  covers the tool-config assets; `plugins/**/*.md` is not formatted — fold by
  hand; the payload tree under `assets/` is excluded from this repo's dprint and
  must stay clean under the shipped taplo config
  (`assets/dprint/.config/taplo.toml`).
- **Commit convention:** `feat`, `fix`, `refactor`, `docs`, `ops`, `merge`; no
  scopes. **Versions:** vwf `20.0.0`, stackgen `2.0.0`, neither tagged at
  planning time.

## Assumed decisions — confirm or override at review

| # | Decision               | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                                                                                       | Unit     |
| - | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| 1 | graphify's needs       | graphify requires python and uv, and every passage that names its needs says both.                                                                                                                                                                                                                                                                                                                                                                                        | uv alone                                                                                                       | U1 U2 U3 |
| 2 | One pin, every tool    | The one-pin check runs for every tool the base mise block pins, on `all` and on a reshape, as well as on `add tool`. A clash is a conflict row whose two answers are the repo's existing version or the base's `latest`; the winner is pinned once.                                                                                                                                                                                                                       | the check on `add tool` only (today)                                                                           | U1 U2    |
| 3 | Where a pin lives      | A tool one environment needs is pinned in `.config/mise/conf.d/tools.<env>.toml`; a tool several environments need is pinned in `.config/mise/conf.d/tools.toml`.                                                                                                                                                                                                                                                                                                         | the top-level `mise.<env>.toml`, which the layout keeps settings-only                                          | U1       |
| 4 | Lock files are tracked | Ruled at resume, 2026-09-28, reversing the approved ruling: no lock file is ignored except `mise.local.lock`, at any depth. The shipped `.gitignore` carries one lock line, `**/mise.local.lock`, in place of `mise.local.lock`, `mise.*.local.lock` and `.mise.local.lock`. When a repo's `.gitignore` has a line ignoring any lock file (e.g. `*.lock`, `mise.lock`, `locks/`), init removes that line, one removal row per line in the one consent. No negation lines. | negation lines (the approved ruling, withdrawn by the user: "Let's not mess the gitignore by adding negation") | U1 U2    |
| 5 | Order                  | The ignore fix runs before `setup:mise --lock-only`, and *lock ignored* is no longer a Lock state.                                                                                                                                                                                                                                                                                                                                                                        | checking after the lock step                                                                                   | U2       |
| 6 | Empty Lock line        | The Lock report line reads `none` for a repo whose lock step changed nothing.                                                                                                                                                                                                                                                                                                                                                                                             | no empty state                                                                                                 | U2       |
| 7 | Review row             | None: every change is skill prose or mise config, nothing that executes; the wave review is the check.                                                                                                                                                                                                                                                                                                                                                                    | a `Kind: review` row                                                                                           | —        |
| 8 | Comments               | Any comment or sentence a unit adds is one sentence (B65), wrapped at the fold as needed — ruled at resume.                                                                                                                                                                                                                                                                                                                                                               | one physical line                                                                                              | U1 U2 U3 |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                                                                 | Depends on | Status | Commit                         |
| -- | ---- | -------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------ |
| U1 | 1    | [01-tool-config.md](01-tool-config.md)       | edit | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/mise.md`, `plugins/stackgen/skills/tool-config/references/git.md`, `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/conf.d/tools.dev.toml`, `plugins/stackgen/skills/tool-config/assets/git/.gitignore` | —          | green  | b5e333c1, 88ef8d3c             |
| U2 | 1    | [02-init.md](02-init.md)                     | edit | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/skills/init/references/tool-configs.md`, `plugins/vwf/skills/doctor/references/code-intelligence.md`                                                       | —          | green  | f9110595                       |
| U5 | 1    | [05-packs.md](05-packs.md)                   | edit | `plugins/stackgen/stacks/app-framework/flutter/**`, `plugins/stackgen/stacks/package-manager/pub/**`, `plugins/stackgen/stacks/bundles/dart-flutter.md`, `plugins/stackgen/stacks/inventory.md`                                                                                                                      | —          | green  | 5f367219                       |
| U3 | 2    | [03-docs.md](03-docs.md)                     | edit | `site/src/content/docs/**`, `.claude/**`, `CLAUDE.md`, `readme.md`                                                                                                                                                                                                                                                   | U1, U2     | green  | 936a4e49                       |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md) | edit | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                           | U3         | green  | — (no bump, no generator diff) |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                      | Why it collides  | Owner   |
| ----------------------------------------- | ---------------- | ------- |
| vwf and stackgen `plugin.json`            | version files    | U4 only |
| `.claude-plugin/marketplace.json`         | generated        | U4 only |
| every human-facing doc outside `plugins/` | n units, one doc | U3 only |

## Waves

- **Wave 1 — U1, U2.** Disjoint paths: stackgen's tool-config and vwf's init and
  doctor. U2 describes init's side of rows U1 defines; each quotes the same
  rulings, so neither waits for the other.
- **Wave 2 — U3**, docs. **Wave 3 — U4**, gates and bump.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

every line with `MISE_ENV=dev` exported, plus the wave review, plus every report
read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                         |
| -------------------------- | ---- | ----------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf and stackgen on this machine; picked up by a **restarted** session |

## Gates the orchestrator keeps

**Lock ignore in a scratch repo**, after wave 1: in an empty `git init`
directory under `mktemp -d`, write `.gitignore` as the shipped
`assets/git/.gitignore`, then append `*.lock`, and apply init's fix as U2's text
in `new-repo.md` specifies (the `*.lock` line removed). Create
`.config/mise/mise.lock`, `.config/mise/locks/x/uv.lock`,
`.config/mise.local.lock` and `a/b/mise.local.lock`. Pass: `git check-ignore -q`
exits 1 for the first two and 0 for the last two, and the shipped file holds no
other lock line. Record in the Run log; a failure goes back to U1 or U2.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **G1, G2, G4, G5, G6, G8** of `2026-09-26-init-commits-the-lock` — ruled
  accepted by the user.
- **The required plan's own work** — dash-named paths, the sort-package-json
  pin, the `mise.local.lock` ignore patterns — stays in
  `2026-09-27-dash-names-and-mise-ignores`.
- **This repo's own mise config** — no change; the rulings bind what tool-config
  lands.

## Parked

none

## Run log

| Wave | Unit                     | Model  | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Commit   |
| ---- | ------------------------ | ------ | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight                | —      | 1     | pass        | all seven wave-gate lines green at 3fceb054 (MISE_ENV=dev); doctor: repo not onboarded (no `.config/vwf.yaml`), no blocking finding; format check skipped — no `covers:`; stack conventions skipped — no `code` unit; vwf-v20.0.0 and stackgen-v2.0.0 not tagged, so both `plugin.json` versions stay (no bump); sequence: W1 U1+U2, W2 U3, W3 U4                                                                                                                                                                                                                                      | —        |
| 1    | U2 init                  | opus   | 1     | unresolved  | edit; wrote three negation lines (`!/.config/mise/mise.lock`, `!/.config/mise/locks/`, `!/.config/mise/locks/**`) where decision 4 rules two — tested: with two, `*.lock` still ignores `.config/mise/locks/x/uv.lock`; UNRESOLVED: accept the third line (U1 and U3 to match); DOCS FALSIFIED: site plugins/vwf.md Lock line ~:1463-1466; p:plugins:check green; edits left uncommitted in the worktree                                                                                                                                                                               | —        |
| 1    | U1 tool-config           | opus   | 1     | pass        | edit; DECIDED: negations written as user lines outside every block, at the end of `.gitignore`; GAP: Edit 5 — `tools.dev.toml` no longer carries the "is accepted" sentence (removed by comment-trim 2672f478), file left unchanged; p:plugins:check, shellcheck, taplo --check green                                                                                                                                                                                                                                                                                                  | b5e333c1 |
| 1    | negation scratch gate    | —      | 1     | fail        | orchestrator gate: `*.lock` + `mise.local.lock` + decision 4's two negations → check-ignore 1 0 0 (`locks/x/uv.lock` still ignored); adding `!/.config/mise/locks/**` → 1 1 0, the pass condition. Confirms U2's finding: decision 4 and this gate contradict                                                                                                                                                                                                                                                                                                                          | —        |
| 1    | R1                       | opus   | 1     | findings(4) | CONTRACT clean; RULINGS: U2 departed from decision #4 (three negation lines) — the known UNRESOLVED; findings: new-repo.md:113 [U2] fold broken ("once. On the one") — rides U2's re-run; git.md:477-484 vs new-repo.md:726-731 [U1/U2] two vs three negation lines — waits on the decision-4 ruling; tools.dev.toml [U1] edit 5 not applied — U1's GAP, confirmed not a defect; [U1 U2] decision 8 "one line" read as one physical line — contested, interpretation (one sentence vs one line), not looped. No second round: U2 is blocked and the remaining findings need the ruling | —        |
| 1    | wave gate                | —      | 1     | pass        | all seven lines green (MISE_ENV=dev); code:precommit's first pass reformatted this table, second pass clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 1    | U3 docs                  | —      | —     | skipped     | depends on U2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 1    | U4 gates-and-bump        | —      | —     | skipped     | depends on U3 → U2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | resume                   | —      | —     | ruling      | user ruled decision 4 (remove lock-ignoring lines, ship one `**/mise.local.lock`, no negation) and decision 8 (one sentence, wrapped); U1 Owns widened to `assets/git/.gitignore`; U1 and U2 re-dispatched                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 1    | U2 init                  | opus   | 2     | pass        | edit; negation removed; §11(b) probes a scratch copy of the tracked .gitignore files with `git check-ignore -v`, one removal row per matching line, removed before the lock step; :113 fold fixed; DECIDED: a rule from an untracked source (`.git/info/exclude`, global excludes) is shown for the person to fix, never edited; own scratch check passed; p:plugins:check green                                                                                                                                                                                                       | —        |
| 1    | U1 tool-config           | opus   | 2     | pass        | edit; shipped `.gitignore` carries one lock line `**/mise.local.lock`; git.md: negation paragraph removed, "Lock files are tracked." rule — any line ignoring a lock file other than `mise.local.lock` is a removal row; SKILL.md and mise.md unchanged (nothing falsified); GAP: SKILL.md rows table has no "removal" kind — read as a delete answered ok, no kind added; DOCS FALSIFIED: docs/memory/decisions/2026-09-27-mise-local-files-ignored-by-name.md (outside every Owns); check, shellcheck, vitest green                                                                  | —        |
| 1    | lock-ignore scratch gate | —      | 2     | pass        | shipped `.gitignore` + `*.lock`: check-ignore -v names line 56; removed → mise.lock 1, locks/x/uv.lock 1, .config/mise.local.lock 0, a/b/mise.local.lock 0; one lock line left, `**/mise.local.lock`                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 1    | R1                       | opus   | 2     | findings(4) | 1 [U1 U2] two owners for the lock-ignore removal (tool-config rows vs init's own probe) and init probes mise paths only — ruled: tool-config owns it, init shows its rows; scope every lock file; 2 [U1] no removal row kind in SKILL.md — name it a delete row answered `ok`; 3 [unowned] flutter and pub packs ask for `!pubspec.lock` — user ruled: drop it in this plan, U5 added; 4 [U1] folds at SKILL.md:248, git.md:111                                                                                                                                                        | —        |
| 1    | U5 packs                 | opus   | 1     | pass        | edit; `!pubspec.lock` dropped from flutter and pub packs; flutter 0.6.0 → 0.7.0, pub 0.2.0 → 0.3.0; dart-flutter bundle pins updated; inventory.md regenerated; inventory --check and p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 1    | U2 init                  | opus   | 3     | pass        | edit; R1 finding 1: §11(b) now takes tool-config's delete rows (answered `ok`) from `all`'s preview, applied before `setup:mise --lock-only`; own probe-and-delete dropped; SKILL.md plan spec and existing-repo.md credit tool-config; DECIDED: after `all`, `git check-ignore -v .config/mise/mise.lock` names any rule from an untracked source for the person to fix; p:plugins:check green                                                                                                                                                                                        | —        |
| 1    | U1 tool-config           | opus   | 3     | pass        | edit; R1 findings 1-4: git.md owns the lock-ignore scan on `all` (every line, blocks and user lines), one delete row answered `ok` per lock-ignoring line, applied before init's lock step; `!pubspec.lock` sentence rewritten; SKILL.md rows table gains the delete row → `ok`; folds fixed; DECIDED: a line ignores a lock file when it is not a negation and its last segment globs a name ending `.lock` (not `local.lock`) or `locks`, or it names `.config/` or `.config/mise/`; p:plugins:check green                                                                           | —        |
| 1    | R1                       | opus   | 3     | clean       | verification round after the resume rulings changed the contract (round 1 predates them): all four round-2 findings resolved as ruled; no lock-file negation left in plugins/**; no Owns breach                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | wave gate                | —      | 2     | pass        | all seven lines green (MISE_ENV=dev); code:precommit first pass reformatted the folder, second clean; commits U1 88ef8d3c, U2 f9110595, U5 5f367219                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| —    | acceptance               | —      | —     | skipped     | no `covers:` — no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| —    | ux                       | —      | —     | skipped     | no `covers:` — no Screens contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| —    | reconcile                | —      | —     | skipped     | no `covers:` (no stamps); no `code` unit (nothing to persist)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 3a66f81a |
| 2    | U3 docs                  | opus   | 1     | pass        | edit; docs-sync over 3fceb054..HEAD; site vwf.md: python prerequisite row, Lock line states (staged, `none`, deferred, failed) and the lock-ignore delete rows; stackgen.md: lock files tracked except `**/mise.local.lock`, delete rows, one-pin check on `all`; GAP: docs/memory/decisions/2026-09-27-mise-local-files-ignored-by-name.md rejects the `**/` form this plan ships (outside Owns); precommit, p:site:check green                                                                                                                                                       | —        |
| 2    | R2                       | opus   | 1     | findings(1) | readme.md:68 prerequisite list counts five binaries and omits python (decision 1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 2    | U3 docs                  | opus   | 2     | pass        | readme: six binaries, python beside uv; .claude/skills/vwf-plugin/references/dependencies.md: same count and wording; precommit green                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | R2                       | —      | 2     | clean       | orchestrator grep: no remaining five-binary count in readme or dependencies.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 2    | U3 docs                  | opus   | 3     | pass        | dependencies.md tally covers six binaries; two pre-existing wrapped code spans there left (predate the run)                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 2    | wave gate                | —      | 1     | pass        | all seven lines green (MISE_ENV=dev); commit U3 936a4e49                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 3    | U4 gates-and-bump        | sonnet | 1     | pass        | edit; vwf-v20.0.0 and stackgen-v2.0.0 untagged locally and on origin → no bump, both ride 20.0.0 / 2.0.0; p:plugins:marketplace regenerated with no diff; no commit                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 3    | R3                       | —      | 1     | clean       | empty diff — nothing to review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| —    | reconcile                | —      | —     | pass        | final wave gate: all seven lines green over the finished tree (U4's run, vitest 357); orchestrator gate *Lock ignore in a scratch repo* passed at wave 1 round 2 and no later commit touched the files it exercises                                                                                                                                                                                                                                                                                                                                                                    | —        |

## Gaps surfaced during execution

- U2 UNRESOLVED (blocking U2, U3, U4): decision 4 names two negation lines, but
  with `*.lock` in `.gitignore` those two leave `.config/mise/locks/x/uv.lock`
  ignored. **Resolved at resume 2026-09-28:** the user withdrew negation;
  decision 4 now removes every lock-ignoring line and ships one
  `**/mise.local.lock`. U1 re-dispatched (Owns widened to
  `assets/git/.gitignore`), U2 re-dispatched.
- U1 GAP: Edit 5 had nothing to remove — the "is accepted" comment in
  `tools.dev.toml` was already gone (comment-trim 2672f478). Closed: nothing
  left to do.
- R1 contested: decision 8 "one line" — R1 read it as one physical line.
  **Resolved at resume:** one sentence, wrapped at the fold.
- U3 GAP (non-blocking):
  `docs/memory/decisions/2026-09-27-mise-local-files-ignored-by-name.md` lists
  the three old lock patterns and rejects the `**/` form this plan now ships; it
  sits outside every Owns — a superseding decision record is advised.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-28-one-pin-and-tracked-lock

or let the queue pick it, by priority:

/vwf:execute next
