# U2 — p:plugins:release bumps from the recorded levels

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `.config/mise/tasks/p/plugins/release`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file top to bottom; then
  `.config/mise/tasks/_scripts/local` (read only — U1's functions).
- **Lazy-load:** `.config/mise/tasks/p/plugins/marketplace`,
  `.config/mise/tasks/code/merge/main` or the task `code:merge:main` resolves to
  (read only)

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
>   compared with that tag. Example: vwf tag 21.0.0, manifest 21.2.0, recorded
>   `MAJOR` → 22.0.0. A project at `NONE`, with no record, and with a manifest
>   equal to its tag is skipped.
> - Decision E5: Each task gets two modes for `p:release`: `--no-commit` (bump
>   and stage only, on `develop`) and `--tag-only` (tag the current manifest on
>   `main`, the behaviour of today). With no flag, a task does the full E1
>   sequence.
> - Decision E6: `--dry-run` on each task and on `p:release` prints each
>   project, its last tag, its level and the version it will release. It skips
>   the branch and clean-tree checks and writes nothing.
> - Decision E8: No new `p:plugins:version` task. `p:plugins:release` edits
>   `plugin.json` and runs `p:plugins:marketplace`.

The U1 function contract is in index.md, *The U1 function contract*; call those
six functions by those names only.

## Edits

1. **`.config/mise/tasks/p/plugins/release`**
   - Header comment: what the task now does (E1), its three modes and
     `--dry-run`.
   - For each plugin in `plugins/*/.claude-plugin/plugin.json` whose name is
     `vwf` or `stackgen`: last tag = highest `<name>-v*` tag by version; level =
     `level_max` of `releases_level .config/releases.yaml <name>` and
     `level_implied <tag> <manifest>`; target = `release_target <tag> <level>`;
     skip when the target is empty.
   - Bump step (full mode and `--no-commit`): refuse unless on `develop` with a
     clean tree (except in `--dry-run`); write the target into the tracked
     `plugin.json` with a `node` one-liner that keeps the JSON formatting;
     `releases_clear` each released key; run `mise run p:plugins:marketplace`;
     `git add` exactly the changed `plugin.json` files,
     `.claude-plugin/marketplace.json` and `.config/releases.yaml`.
   - Full mode only: commit `ops: release <name> <version>[, <name> <version>]`
     with `mise x -- git commit`; `git push origin develop`;
     `mise run code:merge:main`; then the tag step; then `git switch develop`.
   - Tag step (full mode and `--tag-only`): the existing behaviour — on `main`,
     clean tree, `p:plugins:marketplace --check`, 13/17 refuse, annotated tag
     for each marketplace ref without a tag, one push of the tags.
   - `--dry-run`: print `<name>  tag <tag>  level <LEVEL>  → <target | skip>`
     per plugin; write nothing; skip the branch and tree checks.
   - Nothing to release: print one line and exit 0 without a commit.

## Verification

- `mise run p:releases:test` passes.
- `mise run p:plugins:release -- --dry-run` runs in the worktree and prints one
  line per plugin, writing nothing (`git status --short` unchanged).
- The full wave gate.

## Guardrails

- Do not touch any file outside Owns. Never run the task without `--dry-run`;
  never commit, push, tag or merge.
- Never use `--no-verify`; never commit on `main`.
- Run task scripts through `bash`; the Bash tool's shell is fish.
- Write files with the Write or Edit tool, never `cat > file <<EOF`.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`ops: p:plugins:release bumps from the recorded levels`
