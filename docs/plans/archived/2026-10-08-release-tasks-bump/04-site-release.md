# U4 — p:site:release bumps from the recorded level

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `.config/mise/tasks/p/site/release`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file top to bottom; then
  `.config/mise/tasks/_scripts/local` and `.config/mise/tasks/p/site/version`
  (read only).
- **Lazy-load:** the task `code:merge:main` resolves to (read only)

## Ruling

> - Decision E1: Each task runs from `develop`. It bumps, clears its keys,
>   commits on `develop`, pushes, merges `develop`→`main` with
>   `code:merge:main`, tags on `main`, pushes the tag, and goes back to
>   `develop`.
> - Decision E2: The three tasks stay. Each reads and clears only its own keys:
>   `p:plugins:release` uses `vwf` and `stackgen`, `p:i:release` uses
>   `installer`, `p:site:release` uses `site`. A new `p:release` runs all three
>   with one bump commit and one merge, and then tags each.
> - Decision E3: The base is always the last tag. The level is the highest of
>   the recorded level and the level that an untagged manifest implies when
>   compared with that tag. A project at `NONE`, with no record, and with a
>   manifest equal to its tag is skipped.
> - Decision E5: Each task gets two modes for `p:release`: `--no-commit` (bump
>   and stage only, on `develop`) and `--tag-only` (tag the current manifest on
>   `main`, the behaviour of today). With no flag, a task does the full E1
>   sequence.
> - Decision E6: `--dry-run` on each task and on `p:release` prints each
>   project, its last tag, its level and the version it will release. It skips
>   the branch and clean-tree checks and writes nothing.
> - Decision E8: The installer and site tasks call `p:i:version` and
>   `p:site:version`, which stay for hand use.

The U1 function contract is in index.md, *The U1 function contract*; call those
six functions by those names only.

## Edits

1. **`.config/mise/tasks/p/site/release`** — the same changes as U3 makes to
   `p:i:release`, for the site:
   - Header comment for E1, the modes and `--dry-run`.
   - Key `site`; last tag = highest `site-v*` tag; manifest =
     `site/package.json` version; level and target per E3; skip when the target
     is empty.
   - Bump step (full mode, `--no-commit`): refuse unless on `develop` with a
     clean tree (except in `--dry-run`); set the target with
     `mise run p:site:version` and the right flag, or
     `pnpm version <target> --no-git-tag-version` in `site/` when the manifest
     is already ahead of the tag; `releases_clear .config/releases.yaml site`;
     `git add` `site/package.json` and `.config/releases.yaml`.
   - Full mode: commit `ops: release site <version>`; `git push origin develop`;
     `mise run code:merge:main`; then the tag step; then `git switch develop`.
   - Tag step (full mode, `--tag-only`): the existing checks, `p:site:check`,
     the tag, and the `main`-then-tag push (`:74-75`). Keep `--ci` with its
     present meaning.
   - `--dry-run`: print `site  tag <tag>  level <LEVEL>  → <target | skip>`;
     write nothing.

## Verification

- `mise run p:releases:test` passes.
- `mise run p:site:release -- --dry-run` runs in the worktree and prints one
  line, writing nothing.
- The full wave gate.

## Guardrails

- Do not touch any file outside Owns. Never run the task without `--dry-run`;
  never commit, push, tag or merge.
- Never use `--no-verify`; never commit on `main`.
- Run task scripts through `bash`; the Bash tool's shell is fish.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`ops: p:site:release bumps from the recorded level`
