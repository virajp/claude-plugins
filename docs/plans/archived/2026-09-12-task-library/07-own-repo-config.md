# U7 — This repo's own `.config/` takes the pack's new shape

- **Wave:** 2
- **Depends on:** U1, U3
- **Owns:** `.config/mise/tasks/**` (this repo's), `.config/mise.toml`,
  `.config/mise.dev.toml`, `.config/pre-commit-config.yaml`, `CONTRIBUTING.md`.
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom. Then the landed pack payload
  you copy from:
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/**` and
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
  **as committed by wave 1**.
- **Lazy-load:**
  `docs/plans/archived/2026-09-10-repo-task-groups-and-editor-block/index.md:315-336`
  for the run-log record of how this repo's copy diverged (which files, and that
  no `lock.yaml` exists).

## Ruling

Quoted from index.md:

> **11. This repo adopts the change.** One unit re-copies the changed pack files
> into `.config/`, fills `MERGE_MODEL = "direct"` and `MEMBERS = ""`, removes
> `setup/default-branch`, adds the `setup:vscode` call to `setup/all` and the
> `worktrees` alias, and takes the new gate config. Its own later commits then
> run through the task-calling hooks.

> **Wave 2 …** the standing rule applies: a modified-but-unstaged
> `.config/pre-commit-config.yaml` aborts every commit, so the orchestrator
> stages U7's whole `Owns` list in one `git add` before committing.

## Edits

1. **Tasks** — for each file U1 changed (`_scripts/helpers`, `_scripts/merge`,
   `code/format`, `code/lint`, `code/sec`, `code/worktrees`,
   `code/merge/develop`, `code/merge/main`, `setup/all`): copy the landed pack
   file over this repo's, byte for byte (`cp`, then set the exec bit). **Then**
   reapply this repo's own fills on top: `setup/all` keeps whatever this repo's
   version had beyond the pack's steps (read the diff before copying — today it
   has a `Linter setup` step running `pnpm dlx @askviraj/linter@latest --init`;
   keep it) and gains the `setup:vscode` call the pack has and this repo's copy
   lacks. `code/lint` here is the **pnpm overlay**, not the placeholder: copy
   U4's landed `package-manager/pnpm/config/.config/mise/tasks/code/lint` and
   `code/format` instead of the mise pack's for those two. Report each such
   choice as `DECIDED:`.
2. **`.config/mise/tasks/setup/default-branch`** — `rm`.
3. **`.config/mise.toml`** — add `MERGE_MODEL = "direct"` and `MEMBERS = ""` at
   the same position the pack puts them, keeping this repo's `REPO_NAME` value
   and every other repo-specific line.
4. **`.config/mise.dev.toml`** — add the `worktrees = "mise run code:worktrees"`
   alias the pack ships (`:42` in the pack) if absent; keep this repo's other
   aliases.
5. **`.config/pre-commit-config.yaml`** — take U3's landed base config and
   reapply this repo's own additions on top: the five `p:plugins:*` local hooks,
   the `Forbidden Local git-config` hook if it is this repo's rather than the
   pack's, the linter's exclude patterns (`:130-140` today) and `.astro`
   exclusion, the payload-tier exclusion. Read this repo's current file first
   and list every block that is not in the pack's; every one of those survives.
   The direct-tool `formatter`, `shellcheck`, `shfmt`, `actionlint`, `gitleaks`
   hooks go, replaced by the three task hooks.
6. **`CONTRIBUTING.md`** — `:27` names the merge tasks; add the sentence that
   the model is `MERGE_MODEL` in `.config/mise.toml` (`direct` here) and, from
   the repo-hygiene stub's new line (U8 writes the stub; write the same sentence
   here from the ruling), that the forge's default branch is set by hand once,
   with the `gh` and `glab` forms.

## Verification

- `mise x -- mise run code:precommit` twice: the first may fix, the second is
  clean — and its output shows the `format`, `lint`, `sec` hooks naming
  `mise run code:*`.
- `mise run code:all` exits 0.
- `mise tasks --hidden` lists no `setup:default-branch`, lists `code:worktrees`,
  and `mise run code:worktrees` prints no `worktree:init`.
- `mise run p:plugins:check`, `p:plugins:shellcheck`,
  `p:plugins:marketplace --check`, `p:plugins:inventory --check` green (this
  unit changes nothing they generate).
- `grep -n 'MERGE_MODEL\|MEMBERS' .config/mise.toml` hits both;
  `grep -n worktrees .config/mise.dev.toml` hits.
- `grep -c 'mise x -- mise run code:' .config/pre-commit-config.yaml` ≥ 4, and
  every `p:plugins:*` hook still present (`grep -c 'p:plugins:' …` unchanged
  from before).

## Guardrails

- Copy, do not retype: the pack file is the source of truth for every line the
  pack owns; this repo's own additions are the only hand-written lines.
- Do not touch `plugins/**` (wave 1 and U9), the site, or the docs (U8).
- `cat` is aliased to `bat`; never `cat > file`. Use `cp` and the editing tools.
- Delete with `rm`, never `git rm`.
- The pre-commit config must be staged together with everything else in this
  unit before the orchestrator commits (pre-commit refuses an unstaged own
  config).

## Commit

`ops: this repo's config takes the task-calling hooks, MERGE_MODEL and members()`
— written by the orchestrator after the wave gate. Type `ops`; no scope.
