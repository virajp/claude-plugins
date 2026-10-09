---
type: vwf-change-plan
title: Release tasks bump
requires: [ docs/plans/2026-10-08-release-levels-recorded ]
backlog: [ B96 ]
backlog_pieces: []
---

# Plan — Release tasks bump (2026-10-08)

## Status

**RUNNING**

RUNNING since 2026-10-09T09:26 in .worktrees/2026-10-08-release-tasks-bump

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | no      |

This plan runs under the vwf that plan 1 (`2026-10-08-release-levels-recorded`)
lands, so it has the new shape: no `Release` Consent rows, a `## Release levels`
section, and a gates unit. The End an `all` run row is `no`, unasked: this plan
changes no plugin.

## Release levels

| Project   | Level | Reason                                                                |
| --------- | ----- | --------------------------------------------------------------------- |
| vwf       | NONE  | no file under `plugins/vwf/` changes                                  |
| stackgen  | NONE  | no file under `plugins/stackgen/` changes                             |
| installer | NONE  | no installer source changes; `deps-update.yml` is this repo's CI      |
| site      | NONE  | no page of the site manual changes; `site/CLAUDE.md` is not published |

## Goal

`p:plugins:release`, `p:i:release`, `p:site:release` and a new `p:release` read
`.config/releases.yaml`. They bump each project from its last tag, commit the
bump and the cleared keys on `develop`, merge to `main`, and then tag. No person
and no plan bumps a version by hand.

This plan is plan 2 of 2 for backlog item B96. Plan 1 made `/vwf:execute` write
the levels to `.config/releases.yaml` at landing.

**Reversals of standing decisions** (confirmed by the user on 2026-10-08):

1. "That is why no release task commits"
   (`.claude/docs/ci-and-releases.md:72-81`;
   `.claude/skills/release/SKILL.md:123-127`) is reversed. The release tasks now
   bump and commit.
2. The release tasks run on `main` only (`RELEASE_BRANCH="main"` in all three)
   is reversed. They start on `develop`, merge to `main` with `code:merge:main`,
   and tag on `main`. `main` stays merge-only.
3. "Bump the manifest on `develop` by hand"
   (`.claude/skills/release/SKILL.md:83-89`, `:102`; `site/CLAUDE.md:115-125`;
   `.claude/docs/ci-and-releases.md:283-306`) is retired.

## Facts the survey established

- All task scripts are bash with `node -p` one-liners for JSON reads.
- `p:plugins:release` (`.config/mise/tasks/p/plugins/release`): reads each
  plugin's `source.ref` in `.claude-plugin/marketplace.json` (`:35`), tags each
  ref with no tag (annotated tags `:83`, one push `:87`); refuses a dirty tree
  (`:19`) and a branch other than `main` (`:26`); runs
  `p:plugins:marketplace --check` first (`:32`); 13/17 check on new refs (`:48`,
  `:63`); has `--dry-run`; an existing tag not at HEAD warns (`:58`).
- `p:i:release` (`.config/mise/tasks/p/i/release`): header `:7` "never bumps or
  commits"; clean tree `:18`, `main` only `:25`, 13/17 refuse `:33`, tag-exists
  refuse `:43`, `p:i:test` `:49`, tag `:52`; `--ci` stops after the tag (`:57`);
  else needs `gh`, pushes `main` then the tag (`:74-75`) and watches
  `release.yml`.
- `p:site:release` (`.config/mise/tasks/p/site/release`): same shape; reads
  `site/package.json` (`:30`), tags `site-v<ver>`, runs `p:site:check` (`:49`);
  `--ci` exists and nothing passes it.
- `p:i:version` and `p:site:version`: `pnpm version <v> --no-git-tag-version`
  with `--minor`/`--major` flags (default patch); call `version_bump` and
  `version_next`; print the skip note; no commit, no tag; `pnpm version` refuses
  a dirty tree.
- `p:plugins:local` stages `X.Y.Z+N` copies into `.dev-marketplace/` from the
  tracked `plugin.json`; it refuses a tracked manifest with `+`.
- There is no `p:plugins:version` task; plugin versions were bumped by hand in
  `plugins/{vwf,stackgen}/.claude-plugin/plugin.json`, then
  `p:plugins:marketplace`.
- The guard (`.config/mise/tasks/_scripts/local`, sourced after the pack-owned
  `helpers`): `version_forbidden` `:13`, `version_bump` `:31` (lowercase
  `major|minor|patch`, plain `X.Y.Z` only), `version_next` `:86` (steps past
  13/17; refuses a bump that cannot clear a forbidden component, `:103-114`),
  `version_skip_note` `:129`.
- Branch rules: local `no-commit-to-branch --branch main`
  (`.config/pre-commit-config.yaml:222-226`) blocks commits on `main`, not
  merges. The remote `protected-branches` ruleset blocks force-push and deletion
  only. `release-tags` ruleset blocks deletion and re-pointing of
  `refs/tags/*-v*`. The legacy `MERGE_MODEL = "direct"` is at
  `.config/mise/conf.d/_base/mise.toml:23`.
- CI: `release.yml` triggers on `installer-v*`, checks the tag equals root
  `package.json` (`:35-45`) and that the tag commit is an ancestor of
  `origin/main` (`:48-56`). `site.yml` triggers on `site-v*`, the same two
  checks (`:72-77`, `:85`). `plugins.yml` (push to `main`/`develop`, PRs) runs
  `p:plugins:marketplace --check` (`:34`) and, on `main` only, requires every
  marketplace ref to be an existing tag (`:43-58`); `main` is red between the
  bump merge and the tag push, so the tags follow the merge at once.
- `deps-update.yml` (monthly, about `:61-76`): `p:i:version`, commit, push
  `develop`, merge to `main`, push, `p:i:release --ci`, push the tag, dispatch
  `release.yml`.
- Last tags on 2026-10-08: `vwf-v21.0.0`, `stackgen-v3.0.0`, `installer-v1.1.2`,
  `site-v1.1.50`. The B91 chain bumps vwf to `21.2.0` and stackgen to `3.1.0`
  with no tag. Plan 1 records `vwf: MAJOR`, `site: PATCH` in
  `.config/releases.yaml`.
- `.config/releases.yaml` shape (plan 1, D3, D4): flat `key: LEVEL` lines, keys
  `vwf`, `stackgen`, `installer`, `site`; levels `NONE`, `PATCH`, `MINOR`,
  `MAJOR`; absent key = `NONE`; absent file = all `NONE`; the highest level
  wins; written by `/vwf:execute` at landing; the file starts with two `#`
  comment lines.
- `yq` is only in the dev environment
  (`.config/mise/conf.d/ai/mise.dev.toml:5`); CI cannot rely on it.
- Docs that state the current model: `CLAUDE.md:129`, `:188-189`, `:323-328`,
  `:340-342`, `:415` and the CI & Releases section;
  `.claude/docs/ci-and-releases.md:50-58`, `:72-81`, `:88-92`, `:119`,
  `:196-201`, `:232`, `:283-306`; `.claude/docs/repo-shape.md:299-306`,
  `:310-317`; `.claude/docs/dev-marketplace.md:14`, `:117`;
  `.claude/docs/installer/packaging.md:95`; `installer/CLAUDE.md:219-221`;
  `site/CLAUDE.md:105-106`, `:115-125`; `.claude/skills/release/SKILL.md`
  throughout (ritual `:80-89`, 13/17 `:96-104`, `:106-109`, no-commit
  `:123-127`, installer `:129-162`, site `:184-216`, before cutting `:279-284`).
- The commit convention allows `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`, with no scopes.
- The Bash tool of this machine runs fish; task scripts are bash with a shebang.

## Assumed decisions — confirm or override at review

| #   | Decision            | Ruling                                                                                                                                                                                                                                                                                                                 | Rejected                                                            | Unit      |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------- |
| E1  | Branch sequence     | Each task runs from `develop`. It bumps, clears its keys, commits on `develop`, pushes, merges `develop`→`main` with `code:merge:main`, tags on `main`, pushes the tag, and goes back to `develop`                                                                                                                     | two tasks (prepare and tag); commit on `main` with the hook skipped | U2–U5     |
| E2  | Task shape          | The three tasks stay. Each reads and clears only its own keys: `p:plugins:release` uses `vwf` and `stackgen`, `p:i:release` uses `installer`, `p:site:release` uses `site`. A new `p:release` runs all three with one bump commit and one merge, and then tags each. `/release` calls `p:release`                      | three tasks only; one `p:release` only                              | U2–U5, U7 |
| E3  | Base and level      | The base is always the last tag. The level is the highest of the recorded level and the level that an untagged manifest implies when compared with that tag. Example: vwf tag 21.0.0, manifest 21.2.0, recorded `MAJOR` → 22.0.0. A project at `NONE`, with no record, and with a manifest equal to its tag is skipped | refuse when the manifest is ahead; bump from the manifest           | U1–U4     |
| E4  | Language            | Bash functions in `_scripts/local` read, raise and clear the flat `key: LEVEL` lines with awk. Each version comes from the existing `version_bump`/`version_next` guard. The levels are uppercase in the file and lowercase for the guard                                                                              | a TypeScript script with vitest                                     | U1        |
| E5  | Composable modes    | Each task gets two modes for `p:release`: `--no-commit` (bump and stage only, on `develop`) and `--tag-only` (tag the current manifest on `main`, the behaviour of today). With no flag, a task does the full E1 sequence                                                                                              | `p:release` copies the logic of each task                           | U2–U5     |
| E6  | Dry run             | `--dry-run` on each task and on `p:release` prints each project, its last tag, its level and the version it will release. It skips the branch and clean-tree checks and writes nothing                                                                                                                                 | dry-run with the full checks                                        | U2–U5     |
| E7  | `deps-update.yml`   | The workflow commits the dependency update on `develop`, raises `installer: PATCH`, and runs `p:i:release --ci`. `p:i:version` leaves the workflow                                                                                                                                                                     | record `PATCH` only                                                 | U6        |
| E8  | No version task     | No new `p:plugins:version` task. `p:plugins:release` edits `plugin.json` and runs `p:plugins:marketplace`. The installer and site tasks call `p:i:version` and `p:site:version`, which stay for hand use                                                                                                               | add `p:plugins:version`                                             | U2–U4     |
| E9  | Test                | A new bash table test `p:releases:test` (`.config/mise/tasks/p/releases/test`) covers the U1 functions, including 13/17 and "highest wins". It runs in `plugins.yml` and in the verification of U1 and U8, not in pre-commit                                                                                           | a pre-commit hook                                                   | U1, U6    |
| E10 | This repo's key     | Plan 2 creates `.config/vwf.yaml` with only `after_landing: [mise run p:plugins:local]` (plan 1, D16)                                                                                                                                                                                                                  | —                                                                   | U5        |
| E11 | Review row          | One review row after the code units: plan 2 lands runnable code (bash tasks and a workflow)                                                                                                                                                                                                                            | no review                                                           | R1        |
| E12 | `.config` exception | This plan is an explicit exception to the memory rule "plans do not edit this repo's `.config`". The exception covers only `.config/mise/tasks/**` and `.config/vwf.yaml`                                                                                                                                              | edit by hand                                                        | U1–U5     |
| E13 | Levels              | Every release level is `NONE`: plan 2 changes no file under `plugins/`, no installer source and no page of the site manual                                                                                                                                                                                             | —                                                                   | —         |

## The U1 function contract

U1 adds these functions to `.config/mise/tasks/_scripts/local`. Wave-2 units
call them by these names and arguments only:

| Function                                 | Does                                                                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `releases_level <file> <key>`            | prints the key's level; `NONE` when the key or the file is absent; refuses a value that is not one of the four                                                                     |
| `releases_raise <file> <key> <LEVEL>`    | sets the key only when `LEVEL` is higher; creates the file with its two comment lines when absent; never lowers                                                                    |
| `releases_clear <file> <key>`            | removes the key's line; leaves the comments and other keys; no error when absent                                                                                                   |
| `level_max <A> <B>`                      | prints the higher of two levels                                                                                                                                                    |
| `level_implied <tag-version> <manifest>` | prints `NONE` when equal, else `MAJOR`, `MINOR` or `PATCH` by the first component that differs; refuses a manifest lower than the tag                                              |
| `release_target <tag-version> <LEVEL>`   | prints the next version: `version_next` with the lowercase level, so 13 and 17 are skipped; prints nothing and returns 0 for `NONE`; returns non-zero where `version_next` refuses |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-functions.md](01-functions.md)             | edit   | `.config/mise/tasks/_scripts/local`, `.config/mise/tasks/p/releases/test`                                                                                                                                                                                                                                                                                           | —          | green   | 7cf38857 |
| U2 | 2    | [02-plugins-release.md](02-plugins-release.md) | edit   | `.config/mise/tasks/p/plugins/release`                                                                                                                                                                                                                                                                                                                              | U1         | green   | 8b8b5c4e |
| U3 | 2    | [03-i-release.md](03-i-release.md)             | edit   | `.config/mise/tasks/p/i/release`                                                                                                                                                                                                                                                                                                                                    | U1         | green   | a10bc015 |
| U4 | 2    | [04-site-release.md](04-site-release.md)       | edit   | `.config/mise/tasks/p/site/release`                                                                                                                                                                                                                                                                                                                                 | U1         | green   | ef227719 |
| U6 | 2    | [06-workflows.md](06-workflows.md)             | edit   | `.github/workflows/deps-update.yml`, `.github/workflows/plugins.yml`                                                                                                                                                                                                                                                                                                | U1         | green   | 8e1a3fc5 |
| U5 | 3    | [05-release-all.md](05-release-all.md)         | edit   | `.config/mise/tasks/p/release`, `.config/vwf.yaml`                                                                                                                                                                                                                                                                                                                  | U2, U3, U4 | pending |          |
| R1 | 4    | [07-review.md](07-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                   | U5, U6     | pending |          |
| U7 | 5    | [08-docs.md](08-docs.md)                       | edit   | `.claude/skills/release/**`, `.claude/docs/ci-and-releases.md`, `.claude/docs/repo-shape.md`, `.claude/docs/dev-marketplace.md`, `.claude/docs/installer/packaging.md`, `CLAUDE.md`, `site/CLAUDE.md`, `installer/CLAUDE.md`, `docs/memory/decisions/2026-10-08-release-tasks-bump.md`, and any other human-facing passage `vwf:docs-sync` finds outside `plugins/` | R1         | pending |          |
| U8 | 6    | [09-gates.md](09-gates.md)                     | edit   | —                                                                                                                                                                                                                                                                                                                                                                   | U7         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                        | Why it collides                                        | Owner          |
| --------------------------------------------------------------------------- | ------------------------------------------------------ | -------------- |
| `.config/mise/tasks/_scripts/local`                                         | every task sources it                                  | U1 only        |
| `plugins/*/.claude-plugin/plugin.json`, `package.json`, `site/package.json` | version files; this plan bumps nothing                 | nobody — never |
| `.claude-plugin/marketplace.json`                                           | generated; nothing changes its inputs                  | nobody — never |
| `.config/releases.yaml`                                                     | state; only `/vwf:execute` and a real release write it | nobody — never |
| the human-facing docs                                                       | n units editing one doc                                | U7 only        |

## Waves

- **Wave 1 — U1.** The functions and their test; every later unit calls them.
- **Wave 2 — U2, U3, U4, U6.** Each owns one task file or the two workflows. All
  call the U1 functions through the contract table above, which each unit file
  quotes, so no unit waits for the text of another.
- **Wave 3 — U5.** `p:release` calls the `--no-commit` and `--tag-only` modes of
  U2–U4.
- **Wave 4 — R1.** Reviews U1–U6 (U5 reaches U1–U4 through Depends on; U6 is
  named).
- **Wave 5 — U7.** Docs.
- **Wave 6 — U8.** Gates.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`. The new
`mise run p:releases:test` does not exist before wave 1, so it is in the
Verification of U1 and U8, not here.

## After landing

none — plan 2 changes no plugin, and it runs no release.

## Gates the orchestrator keeps

- After U8, in the worktree: `mise run p:release -- --dry-run`. Pass when (1)
  each printed line follows E3 for the tags and `.config/releases.yaml` at run
  time — with the state expected on 2026-10-08 after plan 1 and the B91 chain,
  vwf `22.0.0`, stackgen `3.1.0`, site `1.1.51`, installer skipped — and (2)
  `git status --short` is empty after the command.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits, never runs a release task without `--dry-run`, never pushes and
never tags. A unit deletes with plain `rm`, never `git rm` — it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- The mobile app build number `+N`. Backlog item B96 says that it changes no
  skill or task of this repo.
- `.config/pre-commit-config.yaml`. The new test runs in CI and in the gates
  unit, not as a hook (E9).
- Running a real release. The user runs `/release` by hand, after this plan
  lands.

## Parked

none

## Gaps surfaced during execution

- G1 (non-blocking, plan): E3 and the U1 contract let a release target fall
  below the manifest — tag 21.0.0, manifest 21.2.0, no record → implied MINOR →
  21.1.0, and the task lowers the manifest. No task refuses it (U2, U3, U4
  followed E3 as written). Close with a ruling: refuse a target below the
  manifest, or take the manifest as the floor.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                               | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight | —     | 1     | green       | format check skipped (no covers:); doctor: no blocking finding (repo not onboarded, no .config/vwf.yaml); edit units only — LSP and conventions skipped; wave gate 7/7 green                                                                                                                                                         | —        |
| 1    | U1        | opus  | 1     | green       | six contract functions + private level_rank helper; p:releases:test 38/38; raise to NONE on absent file writes nothing; empty value refused; DOCS FALSIFIED CLAUDE.md guard is four functions; GAP: shellcheck not pinned, not run                                                                                                   | —        |
| 1    | R1-wave   | opus  | 1     | pass        | CONTRACT clean; RULINGS clean; rule-5 repo-shape.md:309,315 (four functions; five tasks source the sidecar) handed to U7 as DOCS FALSIFIED (U7 owns it); level_rank helper informational                                                                                                                                             | —        |
| 1    | gate      | —     | —     | green       | wave gate 7/7 green; U1 7cf38857                                                                                                                                                                                                                                                                                                     | 7cf38857 |
| 2    | U6        | opus  | 1     | green       | deps-update raises installer PATCH via releases_raise, commits it with the refresh, git branch -f main origin/main, p:i:release --ci, tag from package.json; plugins.yml runs p:releases:test; GAP: actionlint unpinned, not run                                                                                                     | —        |
| 2    | U2        | opus  | 1     | green       | full/--no-commit/--tag-only/--dry-run; dry-run stackgen 3.0.0 MINOR → 3.1.0, vwf 21.0.0 MAJOR → 22.0.0; --no-commit refuses unstaged/untracked only; version written by regex in node; GAP: untagged plugin releases its manifest as is; GAP: E3 can target below the manifest (tag 21.0.0, manifest 21.2.0, implied MINOR → 21.1.0) | —        |
| 2    | U3        | opus  | 1     | green       | E1/E3/E5/E6 modes incl --ci; pnpm version --no-git-checks when tree dirty; clean check ignores .config/releases.yaml; --tag-only leaves branch; dry-run installer NONE → skip; GAP: --ci needs a local main (U6 creates it); GAP: shellcheck unpinned                                                                                | —        |
| 2    | U4        | opus  | 1     | green       | E1/E3/E5/E6 modes, --ci kept; dry-run site 1.1.50 PATCH → 1.1.51; p:site:version when clean else pnpm version --no-git-checks; EXIT trap back to develop; GAP: p:site:check after the merge can leave a bump on main untagged; GAP: E3 can target below the manifest; GAP: shellcheck unpinned                                       | —        |
| 2    | R2-wave   | opus  | 1     | findings(5) | RULINGS: U3 departed from E1 (clean check skips .config/releases.yaml; --no-commit has no tree check); U3 i/release:176 unnamed MERGE_MODEL=pr exit before tag; U3 i/release:90-101 dry-run exits non-zero when no tag / target refused (U2, U4 exit 0); plan-level E3 target below manifest → gap G1; CONTRACT clean                | —        |
| 2    | U3        | opus  | 2     | green       | fixed 4 findings: no releases.yaml exemption; --no-commit refuses unstaged/untracked; pr early exit removed; --dry-run prints refused and exits 0; dry-run line format matches U2/U4                                                                                                                                                 | —        |
| 2    | R2-wave   | opus  | 2     | findings(2) | round-1 four resolved; RULINGS: U3 departed from E6 — --tag-only --dry-run creates a tag (i/release:83,192); U3 --ci stays on main with no EXIT trap, drift from U4 (i/release:195-197); CONTRACT clean                                                                                                                              | —        |
| 2    | U3        | opus  | 3     | green       | --tag-only --dry-run routed to the dry-run print (no p:i:test, no tag); EXIT trap after switch to main returns to develop in full and --ci; git tag unchanged                                                                                                                                                                        | —        |
| 2    | R2-wave   | opus  | 3     | pass        | RULINGS confirmation after U3 round 3: both round-2 findings resolved; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                 | —        |
| 2    | gate      | —     | —     | green       | wave gate 7/7 green; U2 8b8b5c4e, U3 a10bc015, U4 ef227719, U6 8e1a3fc5                                                                                                                                                                                                                                                              | 8e1a3fc5 |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-08-release-tasks-bump

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
