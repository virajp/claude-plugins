# Decision — the release tasks bump, commit on develop, merge to main, then tag

**Date** 2026-10-08 · **Branch** `2026-10-08-release-tasks-bump` · **Plan**
[`docs/plans/2026-10-08-release-tasks-bump/`](../../plans/2026-10-08-release-tasks-bump/index.md)
· **Follows**
[`2026-10-08-release-levels-recorded.md`](./2026-10-08-release-levels-recorded.md)
(plan 1, which records the levels) · **Backlog** B96 (piece 2 of 2)

## What prompted it

Plan 1 made each landing plan record a release level per project, which
`/vwf:execute` raises in `.config/releases.yaml`. Nothing read that file: a
release still meant bumping each manifest by hand on `develop`, merging, and
running a release task that only tagged. This plan makes `p:plugins:release`,
`p:i:release`, `p:site:release` and a new `p:release` read the file, bump from
the last tag, commit on `develop`, merge to `main` and tag. No person and no
plan bumps a version by hand.

## The reversals, confirmed by the user on 2026-10-08

1. **"No release task commits"** (`.claude/docs/ci-and-releases.md`, the release
   skill) is reversed. The release tasks now bump and commit.
2. **The release tasks run on `main` only** is reversed. They start on
   `develop`, merge to `main` with `code:merge:main`, and tag on `main`. `main`
   stays merge-only: the bump is a `develop` commit that reaches it by merge.
3. **"Bump the manifest on `develop` by hand"** (the release skill,
   `site/CLAUDE.md`, `.claude/docs/ci-and-releases.md`) is retired.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **Branch sequence (E1).** Each task runs from `develop`: it bumps, clears its
  keys, commits on `develop`, pushes, merges `develop` into `main` with
  `code:merge:main`, tags on `main`, pushes the tag, and goes back to `develop`.
  Rejected: two tasks (prepare and tag); a commit on `main` with the hook
  skipped.
- **Task shape (E2).** The three tasks stay, each reading and clearing only its
  own keys — `vwf` and `stackgen`, `installer`, `site`. A new `p:release` runs
  all three with one bump commit and one merge, then tags each; `/release` calls
  it. Rejected: three tasks only; one `p:release` only.
- **Base and level (E3).** The base is always the last tag. The level is the
  higher of the recorded level and the level an untagged manifest implies
  against that tag: vwf tag `21.0.0`, manifest `21.2.0`, recorded `MAJOR` →
  `22.0.0`. A project at `NONE` with a manifest equal to its tag is skipped.
  Rejected: refusing when the manifest is ahead; bumping from the manifest. Open
  as gap G1: the rule as written can put a target below the manifest.
- **Composable modes (E5).** Each task takes `--no-commit` (bump and stage only,
  on `develop`) and `--tag-only` (tag what the manifest names, on `main`); no
  flag runs the full E1 sequence. `p:release` composes the two. Rejected:
  `p:release` copying each task's logic.
- **`deps-update.yml` (E7).** The workflow commits the dependency refresh on
  `develop`, raises `installer: PATCH`, and runs `p:i:release --ci`;
  `p:i:version` leaves the workflow. Rejected: recording `PATCH` only.
- **This repo's key (E10).** `.config/vwf.yaml` is created with only
  `after_landing: [mise run p:plugins:local]`, so every landing stages the
  plugins locally. Rejected: none offered.

## Added by the review

Every full run, `--ci` and `p:release` refuse unless `MERGE_MODEL` and
`MERGE_MODEL_MAIN` are both `direct` — under `pr` a tag would name a stale
`main`; the fallback is `--no-commit`, the PR landed by hand, then `--tag-only`.
`gh` and the installer and site gates are checked before the first bump, and
`p:release` passes `RELEASE_GATES_DONE=1` to its own tag steps so those gates do
not run twice.
