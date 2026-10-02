---
type: vwf-change-plan
title: git-workflow drives worktrees through git alone
requires: []
backlog: [ B81 ]
backlog_pieces: []
---

# Plan — git-workflow drives worktrees through git alone (2026-10-02)

## Status

**RUNNING**

RUNNING since 2026-10-02 in .worktrees/2026-10-02-git-workflow-git-only

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release vwf publicly                              | patch   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release rows are intent, not authorisation** — no public release step is
recorded; the change ships with the next batched `/release`. A project is bumped
once per level since its last release: vwf `20.1.0` and site `1.1.50` already
sit above their last released tags (`vwf-v20.0.1`, `site-v1.1.49`) at a level at
or above patch, so **this plan bumps nothing**; the patch intent rides those
unreleased versions. Were a bump needed, vwf's is a hand edit of
`plugins/vwf/.claude-plugin/plugin.json` plus `mise run p:plugins:marketplace`,
and the site's is `mise run p:site:version` — neither is authorised here.

## Goal

The vwf `git-workflow` skill creates, enters and removes worktrees with git
commands alone — `git worktree add`, `cd`, `git worktree remove` — and never
names a Claude Code tool for that work, so a run is never trapped in a harness
worktree session that branches from origin's default branch and refuses `git`.
Three adjacent defects in the same skill are fixed with it: an undefined
`$BRANCH_NAME`, an `allowed-tools` line that omits a tool the body calls, and a
bootstrap step that skips `mise x --`. This plan finishes backlog item B81. No
standing decision is reversed.

## Facts the survey established

`GW` = `plugins/vwf/skills/git-workflow`. The skill is `GW/SKILL.md` (276
lines), `GW/references/worktree-setup.md` (128) and `GW/references/landing.md`
(85); there are no scripts.

- **The only tool references.** `GW/references/worktree-setup.md:10-17`, Step 2a
  "Native Worktree Tools (preferred)": if the model has `EnterWorktree`,
  `WorktreeCreate`, a `/worktree` command or a `--worktree` flag, use it and
  proceed to Step 2c (`:13`). `GW/references/landing.md:43-44`, cleanup step 4:
  a native-tool worktree uses its teardown "(e.g. `ExitWorktree` or
  equivalent)", otherwise `git worktree remove <path>`. `GW/SKILL.md` names no
  worktree tool. No other file in the repo outside `docs/plans/archived/` names
  `EnterWorktree`, `ExitWorktree` or `WorktreeCreate`.
- **The git path already exists.** Step 2b (`worktree-setup.md:29-61`) picks
  `.worktrees/` (an existing `worktrees/` is accepted; `.worktrees/` wins),
  ensures it is ignored, runs
  `git worktree add -b "$BRANCH_NAME" ".worktrees/$BRANCH_NAME" "$CURRENT_BRANCH"`
  (`:50-56`) — branching from the current branch — then `cd "$path"` (`:55`),
  and on a permission error works in place (`:58-59`); it ends "proceed to Step
  2c" (`:61`). 2c is submodules (`:63-90`), 2d the mise bootstrap (`:92-128`),
  which runs plain `mise run` (`:99-104`).
- **Step citations.** "Step 2c" at `worktree-setup.md:13,61`; "Step 2d" at
  `GW/SKILL.md:27,145`. No file outside `GW/` cites 2a–2d.
- **`$BRANCH_NAME`** is used at `worktree-setup.md:50-56` and defined nowhere.
  `/vwf:execute` names its branch after the plan folder
  (`plugins/vwf/skills/execute/SKILL.md:486-491`).
- **Frontmatter** (`GW/SKILL.md:1-11`): `allowed-tools: Bash Read`, while Step
  1's consent and Step 4's post-commit prompt (`GW/SKILL.md:~110-123`,
  `~188-263`) go through `AskUserQuestion`.
- **Core Rules** are `GW/SKILL.md:15-47`; declared preferences
  `GW/SKILL.md:48-57`; landing runs the outer merge in the main worktree
  (`landing.md:34-40`), then removes the worktree (`:42-44`) and sweeps fully
  merged ones (`:46-49`). Commits already use `mise x -- git commit`
  (`GW/SKILL.md:168`); `--no-verify` is forbidden (`:63,68,170`).
- **Why the tools go.** An `EnterWorktree` session refuses `git` and
  `mise x -- git`, forcing `/usr/bin/git`, and `EnterWorktree` bases the new
  branch on `origin/main` rather than the current branch (both observed in this
  repo's earlier runs). The `/usr/bin/git` workaround is needed only inside such
  a session; nothing in the repo documents it.
- **Callers inherit.** `/vwf:execute`, `plan`, `change-plan`, `product`,
  `architecture`, `setup`, `recall`, `handoff` and the rest invoke git-workflow
  by name and never name a worktree tool; `execute/SKILL.md:491` and
  `execute/references/edit-unit.md:26` forbid `isolation: "worktree"` for units
  — already consistent, untouched.
- **Docs.** `site/src/content/docs/plugins/vwf.md:3350-3358` (the
  `/vwf:git-workflow` section), `:856`, `:2423`, `:2538-2541`;
  `how-to/operate/sessions-and-handoff.md:116-126`;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:41` — all describe
  worktree isolation generically, none names a tool. Likely no passage is
  falsified; docs-sync decides.
- **Gates.** `mise tasks`:
  `p:plugins:{check,inventory,marketplace,shellcheck,npm-normalize-test,local,release}`,
  `p:site:{check,build,version,release}`, `code:{precommit,format,lint,sec}`.
  `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand.
- **Commit types** (`.config/git-conventional-commits.yaml:3-9`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Versions.** vwf `20.1.0` (tag `vwf-v20.0.1`), site `1.1.50` (tag
  `site-v1.1.49`).
- **Concurrent work.** `2026-10-01-tool-config-script-mise` is RUNNING in
  `.worktrees/2026-10-01-tool-config-script-mise`; its chain edits stackgen's
  tool-config and vwf's init, not `GW/`.
- **New dependencies.** None needed; every edit is markdown.

## Assumed decisions — confirm or override at review

| # | Decision           | Ruling                                                                                                                                                                                                                                                   | Rejected                                                              | Unit |
| - | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---- |
| 1 | Which tools retire | The worktree tools only — `EnterWorktree`, `WorktreeCreate`, a `/worktree` command, a `--worktree` flag, `ExitWorktree`. `AskUserQuestion` stays for the Step 1 and Step 4 prompts; it is not git work.                                                  | Also replacing `AskUserQuestion` with prose questions (user's answer) | U1   |
| 2 | Step 2a            | Removed. `git worktree add` is the only creation path, and the sub-steps renumber: 2b → 2a, 2c → 2b, 2d → 2c, every citation in `GW/` updated to match.                                                                                                  | Keeping the labels and leaving 2a as a "removed" stub                 | U1   |
| 3 | Prohibition        | A new Core Rule: never create, enter or leave a worktree with a Claude Code tool (`EnterWorktree`, `ExitWorktree`, an agent's worktree isolation) — it branches from origin's default branch rather than the current one, and its session refuses `git`. | Silent removal of the step (user's answer)                            | U1   |
| 4 | `$BRANCH_NAME`     | The caller's declared name when it declares one (`/vwf:execute` names it after the plan folder); otherwise a kebab-case slug of the task, shown to the user and confirmed before `git worktree add`.                                                     | Always asking for a name; deriving silently (user's answer)           | U1   |
| 5 | Cleanup            | `git worktree remove <path>`, run from the main checkout — where landing already runs the outer merge.                                                                                                                                                   | — (one idiomatic answer)                                              | U1   |
| 6 | `allowed-tools`    | The frontmatter line gains `AskUserQuestion`, so it matches the body.                                                                                                                                                                                    | Leaving the mismatch (user's answer)                                  | U1   |
| 7 | Bootstrap          | The bootstrap step runs its tasks as `mise x -- mise run <task>`, matching the rest of the skill.                                                                                                                                                        | Plain `mise run` (user's answer)                                      | U1   |
| 8 | Review row         | None — every edit is markdown, so the wave review is the only check.                                                                                                                                                                                     | A `Kind: review` row                                                  | —    |
| 9 | Bumps              | None: vwf `20.1.0` and site `1.1.50` already sit above their last tags at or above patch.                                                                                                                                                                | Bumping again                                                         | U3   |

## New dependencies

none

## Units

| Id | Wave | Unit file                                | Kind | Owns                                                                                                    | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-git-workflow.md](01-git-workflow.md) | edit | `plugins/vwf/skills/git-workflow/**`                                                                    | —          | green   | 0fd8b2b1 |
| U2 | 2    | [02-docs.md](02-docs.md)                 | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**` | U1         | pending |          |
| U3 | 3    | [03-gates.md](03-gates.md)               | edit | —                                                                                                       | U2         | pending |          |

## Shared-file rule

| File                                                        | Why it collides         | Owner          |
| ----------------------------------------------------------- | ----------------------- | -------------- |
| `docs/plans/index.md`                                       | plan-management's       | no unit — ever |
| every human-facing doc                                      | n units editing one doc | U2 only        |
| version files, `.claude-plugin/marketplace.json`, inventory | generated or versioned  | nobody — D9    |

## Waves

- **Wave 1 — U1**, the skill edit.
- **Wave 2 — U2**, docs, over U1's delta.
- **Wave 3 — U3**, gates; confirms no bump is due.

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

| Step                       | Mode | Notes                                                                                      |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages vwf into the dev marketplace; a **restarted** session picks up the new git-workflow |

## Gates the orchestrator keeps

- `grep -rnE 'EnterWorktree|ExitWorktree|WorktreeCreate' plugins/` prints only
  the Core Rule line(s) U1 adds to `plugins/vwf/skills/git-workflow/SKILL.md`.
- `grep -rnE 'Step 2d|Native Worktree' plugins/vwf/skills/git-workflow/` prints
  nothing.
- `grep -n 'BRANCH_NAME' plugins/vwf/skills/git-workflow/references/worktree-setup.md`
  shows the variable defined before its first use.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter with
`--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Replacing `AskUserQuestion` in git-workflow — declined (D1); it is not git
  work.
- The `/usr/bin/git` workaround — not documented anywhere, and moot once no
  harness worktree session is entered.
- Callers of git-workflow — none names a worktree tool; they inherit the change.

## Parked

none

## Run log

| Wave | Unit            | Model | Round | Outcome | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Commit |
| ---- | --------------- | ----- | ----- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight       | —     | 1     | pass    | wave gate 8/8 green; doctor blocking predicates clear (mise, graphify CLI, main-checkout graph); no .config/vwf.yaml — no stack, LSP n/a (no code unit)                                                                                                                                                                                                                                                                                                                                              | —      |
| 0    | preflight       | —     | 1     | skipped | conventions fetch — why: no code unit; format check — why: no covers:; mempalace down — journal skipped; sequence W1 U1 → W2 U2 → W3 U3                                                                                                                                                                                                                                                                                                                                                              | —      |
| 1    | U1 git-workflow | opus  | 1     | pass    | edit; worktree-setup.md: native-tool 2a removed, 2b→2a 2c→2b 2d→2c, Branch name section defines $BRANCH_NAME first (caller's name, else confirmed kebab slug), bootstrap via mise x -- mise; landing.md cleanup = git worktree remove from main checkout; SKILL.md: allowed-tools + AskUserQuestion, new Core Rule (D3), Step 2c citations, References row; DECIDED: worktree-setup.md opening becomes a three-step sequence pointing at the Core Rule; References row reworded (listed native tool) | —      |
| 1    | R1 wave review  | opus  | 1     | pass    | 0 findings; CONTRACT clean, RULINGS clean; kept gates 3/3 pass (tool names only in the new Core Rule SKILL.md:29; no Step 2d/Native Worktree; BRANCH_NAME defined :39,:45 before use :54); no doc outside GW falsified                                                                                                                                                                                                                                                                               | —      |
| 1    | wave gate       | —     | 1     | pass    | 8/8 green (code:precommit reformatted once, green on re-run); U1 0fd8b2b1                                                                                                                                                                                                                                                                                                                                                                                                                            | —      |
| —    | acceptance      | —     | —     | skipped | why: no covers:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —      |
| —    | ux              | —     | —     | skipped | why: no covers:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —      |
| —    | reconcile       | —     | —     | skipped | why: no covers: and no code unit                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-02-git-workflow-git-only

or let the queue pick it, by priority:

/vwf:execute next
