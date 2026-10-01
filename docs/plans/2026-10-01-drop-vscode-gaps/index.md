---
type: vwf-change-plan
title: Close the gaps the drop-vscode run left open
requires: []
backlog: []
backlog_pieces: []
---

# Plan — Close the gaps the drop-vscode run left open (2026-10-01)

## Status

**RUNNING**

RUNNING since 2026-10-01 23:09 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-10-01-drop-vscode-gaps

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release stackgen publicly                         | patch   |
| Release vwf publicly                              | patch   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release rows are intent, not authorisation** — no public release step is
recorded. The chain rule from `2026-10-01-drop-vscode` holds: a project is
bumped once per level since its last release. stackgen `3.0.0`, vwf `20.1.0` and
site `1.1.50` already sit above their last released tags (`stackgen-v2.0.0`,
`vwf-v20.0.1`, `site-v1.1.49`) at a level at or above patch, so **this plan
bumps nothing**; the patch intent rides those unreleased versions.

## Goal

Every gap `docs/plans/2026-10-01-drop-vscode` recorded as open is closed, and
plan 1 (`docs/plans/2026-10-01-tool-config-script-mise`) carries the
`setup/vscode` retirement into its scripted migration rather than dropping it.

**Reversal, partial:** drop-vscode's V3 removed init pass 1's fifth exempt kind
("the editor directory the fragment convention names"). G1 restores an exemption
for `.vscode/` — named, and grounded in drop-vscode's E3 ("`.vscode/` is the
user's"), not in the retired fragment convention.

## Facts the survey established

`ER` = `plugins/vwf/skills/init/references/existing-repo.md`; `TC` =
`plugins/stackgen/skills/tool-config`.

- **Pass 1.** The exempt list is `ER:99-123` — "Four kinds of root entry are
  recognised and never listed at all": `.git/`, `.gitmodules`, `.claude/`,
  member paths — closed by a paragraph saying "all four sit outside that
  question". Before `c62e2445` it read "Five kinds"; the fifth was the editor
  directory, never named. Strays are reported per `ER:89-97`. The allowlist pass
  1 reads is `plugins/stackgen/assets/output-tree.md:161-182`; `.vscode/`
  appears there only at `:303` (fence item 3: a pack never ships `.vscode/`
  files). `.idea/` is reported as a stray today and stays so.
- **Pass 7.** `ER:646-656`: heading `### 7 — Editor fragments`, `:648-649`
  "Retired — …", `:651-655` the live rows (the ignore file is tool-config's git
  tool; the template fallback is one Tool-config row per template, new-repo §5).
  "ten passes" at `ER:23,33,43`. No other file in `plugins/vwf` cites "pass 7".
  Plans `2026-10-01-tool-config-script-{mise,gates,init}` (U7, G7, I5) cite
  passes 3, 4, 5, 8 and 9 by number.
- **Lock records.** vwf's 21→22 row
  (`plugins/vwf/skills/setup/references/migrate-pipeline.md:36-43`,
  `plugins/vwf/assets/vwf-config.md:666-676`) offers each
  `.config/vscode.d/*.jsonc` for delete and says nothing of lock entries. The
  hygiene fragment carried none; pack fragments (`component: <type>/<slug>`) and
  tool-config fragments (`source: tool-config/<tool>@…`) did. The materializer
  writes `.claude/stackgen/lock.yaml`
  (`plugins/stackgen/assets/output-tree.md:355-440`; a dropped pack's `entries:`
  go at `:432-439`); `stackgen-sync` reads and rewrites it
  (`plugins/stackgen/skills/stackgen-sync/SKILL.md:26,192-194`).
- **"editor profile".** `plugins/stackgen/assets/ids.md:87`,
  `.config/mise/conf.d/env.toml:19`,
  `site/src/content/docs/plugins/stackgen.md:591` — each names "a per-repo
  editor profile" (or "an editor profile") as a reader of `REPO_NAME`. Its only
  such reader was `setup:vscode`, retired by drop-vscode.
- **JSONC marker.** "`//` in JSONC" only at
  `site/src/content/docs/plugins/stackgen.md:862` (plus `site/dist`, build
  output).
- **mise.md.** `TC/references/mise.md:514-518`, §5, "The retired editor task":
  opens "which `setup:all` no longer calls" — meaning the shipped task — then
  tests the repo's own `setup/all`.
- **Plan 1.**
  `docs/plans/2026-10-01-tool-config-script-mise/03-mise-module.md:80-87` lists
  the §5 migration steps the scripted `all` implements; the `setup/vscode`
  retirement is absent. `06-stackgen-prose.md` owns `TC/references/mise.md` and
  rewrites it to describe the script (`:57-60`), silent on §5's retirement
  bullet. Plan 1's frontmatter is
  `requires: [ docs/plans/2026-10-01-drop-vscode ]` (its `index.md:4`).
- **Gates.** `mise tasks`:
  `p:plugins:{check,inventory,marketplace,shellcheck,npm-normalize-test,local,release}`,
  `p:site:{check,build,version,release}`, `code:{precommit,format,lint,sec}`.
  Commit types (`.config/git-conventional-commits.yaml:4-9`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`.
- **Backlog.** No open item covers these gaps.

## Assumed decisions — confirm or override at review

| #  | Decision              | Ruling                                                                                                                                                                                                                                        | Rejected                                                                                               | Unit       |
| -- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| G1 | Pass 1 and `.vscode/` | Pass 1 exempts `.vscode/` by name, as the user's — a fifth kind beside `.git/`, `.gitmodules`, `.claude/` and member paths; `.idea/` stays reported.                                                                                          | exempt every editor directory; add `.vscode/` to the root allowlist (no pack may land editor settings) | W1         |
| G2 | Pass 7                | Retitle §7 for its live rows (the ignore file, the template fallback) and drop the "Retired" line; still ten passes, numbers unchanged.                                                                                                       | fold into a neighbour and renumber; keep a retired placeholder and move the rows                       | W1         |
| G3 | Lock records          | `stackgen-sync` drops a lock record whose component no longer ships the path **and** whose file is absent from the tree — no preview row, said in its report. vwf's 21→22 row is unchanged.                                                   | vwf's 21→22 row drops the records (vwf writing stackgen's lockfile); leave the records                 | W2         |
| G4 | "editor profile"      | Remove "a per-repo editor profile" as a `REPO_NAME` reader wherever it is named.                                                                                                                                                              | —                                                                                                      | W2, W3, W5 |
| G5 | JSONC marker          | The site manual drops "`//` in JSONC" at `stackgen.md:862`.                                                                                                                                                                                   | —                                                                                                      | W5         |
| G6 | mise.md wording       | `TC/references/mise.md:514` reads "which the shipped `setup:all` no longer calls".                                                                                                                                                            | —                                                                                                      | W2         |
| G7 | Plan 1                | This plan amends plan 1's folder: U3's migration list gains the `setup/vscode` retirement as §5 states it; U6 is told to keep that §5 bullet's behaviour in its rewrite; plan 1's `requires:` gains `docs/plans/2026-10-01-drop-vscode-gaps`. | amend plan 1 through its own planner; park it                                                          | W4         |
| G8 | Review row            | None: every edit is prose or a plan file; no runnable code lands.                                                                                                                                                                             | a review row                                                                                           | —          |
| G9 | Bumps                 | None: the patch intent rides the unreleased stackgen `3.0.0`, vwf `20.1.0`, site `1.1.50`.                                                                                                                                                    | patch again (`3.0.1`, `20.1.1`, `1.1.51`)                                                              | W6         |

## New dependencies

None.

## Units

| Id | Wave | Unit file                              | Kind | Owns                                                                                                                                                                                                                               | Depends on     | Status  | Commit   |
| -- | ---- | -------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| W1 | 1    | [01-init-passes.md](01-init-passes.md) | edit | `plugins/vwf/skills/init/references/existing-repo.md`                                                                                                                                                                              | —              | green   | dc37e341 |
| W2 | 1    | [02-stackgen.md](02-stackgen.md)       | edit | `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/assets/ids.md`, `plugins/stackgen/skills/tool-config/references/mise.md`                                                                                             | —              | green   | 604f1e95 |
| W3 | 1    | [03-env-comment.md](03-env-comment.md) | edit | `.config/mise/conf.d/env.toml`                                                                                                                                                                                                     | —              | green   | 7a9cacfc |
| W4 | 1    | [04-plan-1.md](04-plan-1.md)           | edit | `docs/plans/2026-10-01-tool-config-script-mise/index.md` (the `requires:` line only), `docs/plans/2026-10-01-tool-config-script-mise/{03-mise-module,06-stackgen-prose}.md`                                                        | —              | green   | feafaf2a |
| W5 | 2    | [05-docs.md](05-docs.md)               | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{plugin-authoring,stackgen-plugin,vwf-plugin}/**`, `site/src/content/docs/**`, `plugins/stackgen/assets/output-tree.md` (lockfile-rules passage, widened at run time) | W1, W2, W3, W4 | pending |          |
| W6 | 3    | [06-gates.md](06-gates.md)             | edit | —                                                                                                                                                                                                                                  | W5             | pending |          |

## Shared-file rule

| File                                                        | Why it collides           | Owner           |
| ----------------------------------------------------------- | ------------------------- | --------------- |
| `site/src/content/docs/plugins/stackgen.md`                 | G4 and G5 both land there | W5 only         |
| plan 1's folder                                             | another plan's contract   | W4, named lines |
| `docs/plans/index.md`                                       | plan-management's         | no unit — ever  |
| every human-facing doc                                      | n units editing one doc   | W5 only         |
| version files, `.claude-plugin/marketplace.json`, inventory | generated or versioned    | nobody — G9     |

## Waves

- **Wave 1 — W1, W2, W3, W4.** Four disjoint trees: init's reference, three
  stackgen files, this repo's `env.toml`, plan 1's folder.
- **Wave 2 — W5**, docs. **Wave 3 — W6**, gates.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                                  |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into the dev marketplace and updates this machine's install; a restarted session picks them up |

## Gates the orchestrator keeps

- `grep -rn -i 'editor profile' plugins .config .claude site/src/content/docs readme.md`
  prints nothing.
- `grep -rn 'in JSONC' site/src/content/docs plugins .claude` prints nothing.
- `grep -n '\.vscode/' plugins/vwf/skills/init/references/existing-repo.md`
  shows the pass-1 exemption.
- `grep -n 'setup/vscode\|setup:vscode' docs/plans/2026-10-01-tool-config-script-mise/03-mise-module.md`
  shows the migration step.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc outside its Owns, never adds a dependency, never
commits. A unit deletes with plain `rm`, never `git rm` — it stages nothing. A
unit never runs `git checkout`, `git restore` or a formatter's `--fix` on any
path outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

Keep the block under 1,500 characters.

## Out of scope

- Exempting `.idea/` or any editor directory beyond `.vscode/` — declined (G1).
- vwf's 21→22 migration row — unchanged; the record cleanup is stackgen's (G3).
- Plan 1's index row's `Requires` cell — `plan-management`'s alone; W4 edits
  plan 1's folder only. `/vwf:execute next` still orders this plan first
  (priority 10 before 20).
- Archiving `docs/plans/2026-10-01-drop-vscode` — asked for in prose once this
  plan lands.

## Parked

- An `.idea/` (and other editor directory) exemption in init pass 1, should a
  user report it as noise. Raised 2026-10-01; declined for now.

## Run log

| Wave | Unit           | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                        | Commit   |
| ---- | -------------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight      | —     | 1     | pass        | wave gate 8/8 green; doctor blocking predicates clear (mise, graphify CLI, main-checkout graph); no .config/vwf.yaml (stub removed f20b227d) — no stack, LSP n/a for an edit-only plan                                                                                                                        | —        |
| 0    | preflight      | —     | 1     | skipped     | conventions fetch — why: no code unit; format check — why: no covers:; mempalace down — journal skipped                                                                                                                                                                                                       | —        |
| 1    | W3 env comment | opus  | 1     | pass        | edit; "an editor profile" dropped from env.toml:19, "a launcher" kept as sole reader; REPO_NAME unchanged; GAP: full wave gate left to orchestrator                                                                                                                                                           | 7a9cacfc |
| 1    | W1 init passes | opus  | 1     | pass        | edit; pass 1 "Five kinds", .vscode/ bullet after .claude/ (order follows closing breakdown); §7 retitled, Retired line dropped; GAP: verification grep -c "ten passes" gives 2 — third is capital "Ten passes"; read case-insensitive, all 3 unchanged                                                        | dc37e341 |
| 1    | W2 stackgen    | opus  | 1     | pass        | edit; sync step 2 drops shipless+absent records (component: and source: tool-config/…), no delta row, named in report, also when nothing selected; ids.md reader removed; mise.md "the shipped"; DOCS FALSIFIED: stackgen/assets/output-tree.md lockfile rules (no owner), site stackgen.md sync passage (W5) | —        |
| 1    | W4 plan 1      | opus  | 1     | pass        | edit; U3 migration list gains setup/vscode retirement (delete only if content matches record and setup/all no longer calls it); U6 keeps §5 bullet; requires: gains drop-vscode-gaps; GAP: formatter reflows requires: to multi-line (+4 −1), two verification lines fail as worded                           | feafaf2a |
| 1    | R1 wave review | opus  | 1     | findings(3) | W2: sync SKILL.md:39 step 1 still says tool-config records are not diffed (contradicts new drop); SKILL.md:69 "handled as above, reported and never deleted" adds unnamed behaviour; ids.md:87 short line needs refold. CONTRACT clean, RULINGS clean; W1/W4 GAPs judged acceptable                           | —        |
| 1    | W2 stackgen    | opus  | 2     | pass        | loop-back from R1: step 1 names the tool-config drop exception; invented still-present clause removed; ids.md refolded                                                                                                                                                                                        | 604f1e95 |
| 1    | R1 wave review | opus  | 2     | pass        | 0 findings; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                     | —        |
| 1    | orchestrator   | —     | —     | pass        | GAP: W5 Owns widened to plugins/stackgen/assets/output-tree.md ("Rules the lockfile enforces" passage) — W2 DOCS FALSIFIED: sync now drops retired records; no unit owned the file, plan Goal (G3) authorises                                                                                                 | —        |
| 1    | wave gate      | —     | 1     | pass        | 8/8 green; code:precommit first run reformatted this folder index.md (run-log table), green on re-run; no UNRESOLVED                                                                                                                                                                                          | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-01-drop-vscode-gaps

or let the queue pick it, by priority:

/vwf:execute next
