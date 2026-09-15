# Decision — the task library configures each gate once, and the hooks call it

**Date** 2026-09-12 · **Branch** `2026-09-12-task-library` · **Plan**
[`docs/plans/2026-09-12-task-library/`](../../plans/2026-09-12-task-library/index.md)
· **Reverses** D17 of
[`2026-09-06-init-owns-the-first-commit.md`](./2026-09-06-init-owns-the-first-commit.md),
*"the forge default"* · **Umbrella**
[`2026-09-05-vwf-init-and-the-repo-shape.md`](./2026-09-05-vwf-init-and-the-repo-shape.md)

## What was decided before

A gate tool was configured in two places. `/vwf:init` laid the toolchain
manager's task library into a repo, which gave it `code:format`, `code:lint` and
`code:sec`; the gate pack laid down a `pre-commit-config.yaml` that ran the same
tools directly, and every language pack added a `pre-commit.d/<pack>.yaml`
fragment that ran them again with its own flags.

## What was measured

A survey on 2026-09-12 found **seven tools configured twice** — dprint, eslint
(through the house linter), ruff, sort-package-json, `dart analyze`,
dependency_validator and gitleaks — each named once in a `code/*` task and once
in a hook. shellcheck, shfmt and actionlint were the mirror defect: direct hooks
with no task at all, so `mise run code:lint` passed on shell a commit would
refuse.

Two copies of one tool's configuration drift in the direction nobody is looking.
The hook run rewrites a file the whole-tree task would have left alone, or
`code:all` reports green on something the commit rejects, and which of the two
is authoritative is not written down anywhere.

## What changed

**One configuration per tool, and the task is where it lives.** The user's
ruling, verbatim:

> these customisations must land in mise tasks and let the pre-commit hooks use
> them as mise tasks

- **Three tool-neutral hooks.** The gate pack's config carries `format`, `lint`
  and `sec`, each `language: system`: `mise x -- mise run code:format --fix` and
  `mise x -- mise run code:lint --fix` with `pass_filenames: true`, and
  `mise x -- mise run code:sec --staged` with `pass_filenames: false`. The
  `formatter`, `shellcheck`, `shfmt`, `actionlint` and `gitleaks-system` hooks
  are gone. The builtins, `git-config`, `conventional-commits`,
  `no-commit-to-branch` and `meta` are unchanged.
- **The file-list contract.** The three gate tasks declare
  `#USAGE arg "[files]..."`; an empty list means the whole tree. A hook is
  per-file by nature and a task is whole-tree by default, and the optional list
  is the one argument that lets the same task serve both callers. A tool that
  cannot take a file list — dependency_validator, `dart analyze` on a package,
  `uv run ruff check` on a project, and the house linter, whose rules are
  cross-file — runs whole-tree even when files are given, and says so.
- **The three toolless tools get defaults, not slots.** shellcheck and
  actionlint ship inside `code:lint`, shfmt inside `code:format`, each skipping
  silently where its binary is absent or nothing in scope is its file type. The
  line is what the tool reads: one that walks a tree by extension gets a shipped
  default, one that needs a pinned language toolchain stays a slot. An overlay
  inherits both the argument surface and the defaults.
- **`code:sec --staged`.** With the flag it runs `gitleaks git --staged` against
  `.config/gitleaks.toml` and skips grype; without it, the tree scan as before.
  `--staged` reads the *index*, which only git can enumerate, which is why that
  hook passes no filenames.
- **Fragments are for non-gate checks only.** `eslint.yaml`, `ruff.yaml`,
  `pnpm.yaml` and `flutter.yaml` are deleted; import_sorter moved into flutter's
  `code/format` and the two analysis tools were already in its `code/lint`. Only
  `uv.yaml` survives, for `uv lock --check`, which gates nothing.
- **`MERGE_MODEL`.** A marked position in `mise.toml`'s `[env]`, read as
  `direct` when unset. `direct` is the local merge-and-push unchanged; `pr`
  pushes the branch with `--follow-tags` and opens a pull request through `gh`
  or `glab`, printing the branch and one instruction where neither is on PATH,
  and merges nothing locally. Every predicate runs under both but one — the
  unpushed-commits check is `direct`'s alone, since publishing the branch is
  `pr`'s first act. A repo-level value rather than a flag, because which one
  applies is a property of the repo's review policy, not of the person landing
  the change.
- **`MEMBERS`.** A second marked position beside it: space-separated paths
  relative to the repo root. `_scripts/helpers` gains `members()`, which reads
  `.gitmodules` where there is one and those paths otherwise, and both
  `setup:all --all` and `code:worktrees` call it — so a product whose parts are
  wired as siblings is as visible to the task library as one wired as
  submodules.

## The D17 reversal

D17 of `2026-09-06-init-owns-the-first-commit` had `init` ask which branch the
remote should default to and run `mise run setup:default-branch <answer>`, so
that vwf named no forge. The task is now deleted and the question with it.

**A one-time act is not a task a machine re-runs.** Setting a forge's default
branch happens once, when the repository is created; carrying it as a `setup:*`
member meant a task that edits a *remote* sat in a library whose every other
member edits this checkout, and which `setup:all` had to be told to skip. The
forge line lives in the `repo-hygiene` pack's `CONTRIBUTING.md` instead —
`gh repo edit --default-branch <branch>` or
`glab repo update --defaultBranch <branch>` — because a **pack may name a tool**
and vwf's own prose may not. That is the same rule D17 was honouring, satisfied
by a different file.

What D17 got right stands: `init` names no forge and inspects none. Its git pass
now ends at the `develop`/`main` pair and the first push, and it opens by asking
the landing model — the one question about how work leaves this repo that is
still a fact about the repo rather than about the remote.

## What stays outside

- **Doctor gets no predicate for `MERGE_MODEL` or `MEMBERS` drift.** An unfilled
  repo runs on the shipped defaults, which are safe.
- **No pack lands a CI workflow.** The hooks-to-tasks change does not touch
  `.github/`; that half of the charter fence did not move.
- **`grype`'s threshold is still in two places** — `.config/grype.yaml` and the
  task's own flag. Now that `code:sec` is the only thing that reaches grype, one
  of them is redundant; which one goes is a later question.
- **Brownfield adaptation is plan 3.** `init` still has no rule for a task the
  repo has and the pack lacks.
