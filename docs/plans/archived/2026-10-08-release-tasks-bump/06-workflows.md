# U6 — deps-update records the installer level; plugins.yml runs the test

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `.github/workflows/deps-update.yml`, `.github/workflows/plugins.yml`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files top to bottom; then
  `.config/mise/tasks/_scripts/local` (read only).
- **Lazy-load:** `.config/mise/tasks/p/i/release` (U3 owns it — read only)

## Ruling

> - Decision E7: The workflow commits the dependency update on `develop`, raises
>   `installer: PATCH`, and runs `p:i:release --ci`. `p:i:version` leaves the
>   workflow.
> - Decision E9: A new bash table test `p:releases:test`
>   (`.config/mise/tasks/p/releases/test`) covers the U1 functions, including
>   13/17 and "highest wins". It runs in `plugins.yml` and in the verification
>   of U1 and U8, not in pre-commit.

The `--ci` contract of `p:i:release` after U3: from `develop`, it bumps from the
recorded level per E3, clears the `installer` key, commits
`ops: release installer <version>`, pushes `develop`, runs
`mise run code:merge:main`, and creates the tag on `main`; it stops after the
tag is created. The workflow pushes the tag and dispatches `release.yml`, as
now.

## Edits

1. **`.github/workflows/deps-update.yml`** (about `:61-76`) — keep the
   dependency update and its commit on `develop`. Replace the `p:i:version` call
   and the hand merge with: source `.config/mise/tasks/_scripts/helpers` and
   `_scripts/local` in a bash step and call
   `releases_raise .config/releases.yaml installer PATCH`; add
   `.config/releases.yaml` to the dependency commit (or commit it on its own,
   `ops: record installer patch`); then `mise run p:i:release -- --ci`; then the
   existing tag push and `release.yml` dispatch. Keep the comment that says the
   job takes the same merge-only route a person does, updated to the new task.
   If `code:merge:main` cannot run in the Actions runner (for example it needs a
   tool CI lacks), return `UNRESOLVED:` with the reason instead of inventing a
   merge.
2. **`.github/workflows/plugins.yml`** — add a step `mise run p:releases:test`
   beside the existing `p:plugins:npm-normalize-test` step, with the same
   environment.

## Verification

- `mise run code:precommit` (the workflow linter runs over the two files).
- The full wave gate.

## Guardrails

- Do not touch any file outside Owns; never edit `release.yml`, `site.yml` or
  `.config/pre-commit-config.yaml`.
- Keep every action pin exactly as it is.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`ops: deps-update records the installer level; plugins ci runs the release-level test`
