# U5 — p:release, and this repo's after_landing key

- **Wave:** 3
- **Depends on:** U2, U3, U4
- **Owns:** `.config/mise/tasks/p/release` (new), `.config/vwf.yaml` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `.config/mise/tasks/p/plugins/release`,
  `.config/mise/tasks/p/i/release`, `.config/mise/tasks/p/site/release` (read
  only — their modes).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` (the `after_landing:` key —
  read only)

## Ruling

> - Decision E1: Each task runs from `develop`. It bumps, clears its keys,
>   commits on `develop`, pushes, merges `develop`→`main` with
>   `code:merge:main`, tags on `main`, pushes the tag, and goes back to
>   `develop`.
> - Decision E2: A new `p:release` runs all three with one bump commit and one
>   merge, and then tags each. `/release` calls `p:release`.
> - Decision E5: Each task gets two modes for `p:release`: `--no-commit` (bump
>   and stage only, on `develop`) and `--tag-only` (tag the current manifest on
>   `main`, the behaviour of today).
> - Decision E6: `--dry-run` on each task and on `p:release` prints each
>   project, its last tag, its level and the version it will release. It skips
>   the branch and clean-tree checks and writes nothing.
> - Decision E10: Plan 2 creates `.config/vwf.yaml` with only
>   `after_landing: [mise run p:plugins:local]`.
> - Decision E12: This plan is an explicit exception to the memory rule "plans
>   do not edit this repo's `.config`". The exception covers only
>   `.config/mise/tasks/**` and `.config/vwf.yaml`.

## Edits

1. **`.config/mise/tasks/p/release`** (new, executable, `#!/usr/bin/env bash`, a
   `#MISE description=` line like its siblings):
   - Refuse unless on `develop` with a clean tree (except `--dry-run`).
   - `--dry-run`: run each of the three tasks with `--dry-run`, in the order
     plugins, installer, site; write nothing.
   - Else: run `p:plugins:release --no-commit`, `p:i:release --no-commit`,
     `p:site:release --no-commit`; when nothing is staged, print one line and
     exit 0. Commit once, `ops: release <name> <version>, …` (every project
     released), with `mise x -- git commit`; `git push origin develop`;
     `mise run code:merge:main`; then `p:plugins:release --tag-only`,
     `p:i:release --tag-only`, `p:site:release --tag-only`, each only for a
     project it bumped; then `git switch develop`.
   - Stop at the first failure and print where it stopped and the command that
     resumes it.
2. **`.config/vwf.yaml`** (new) — exactly:

   ```yaml
   # vwf operating config — hand-edited keys only in this repo.
   after_landing:
     - mise run p:plugins:local
   ```

## Verification

- `mise run p:release -- --dry-run` runs in the worktree, prints one line per
  project, and `git status --short` is unchanged afterwards.
- `mise run p:releases:test` passes.
- The full wave gate.

## Guardrails

- Do not touch any file outside Owns. Never run `p:release` without `--dry-run`;
  never commit, push, tag or merge.
- Never use `--no-verify`; never commit on `main`.
- Run task scripts through `bash`; the Bash tool's shell is fish.
- Write files with the Write tool, never `cat > file <<EOF`.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`ops: p:release releases every recorded project in one merge`
