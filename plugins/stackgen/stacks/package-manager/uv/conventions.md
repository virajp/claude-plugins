# uv — conventions

uv is the only package manager, and it is more than a resolver: it owns the
lockfile, the `.venv`, and running what it installed. A repo that installs with
uv and runs with a hand-activated virtualenv has two environments and only one
of them is locked.

**The lockfile is committed and authoritative.** `uv sync` resolves from it;
nothing in the ordinary install path is allowed to move it.

**Nothing runs outside the environment.** Every Python entrypoint the task
library invokes goes through `uv run`, so the version that executes is the
version the lockfile pinned — including the gates, which is why the `ruff` pack
calls `uv run ruff` rather than a `ruff` on `PATH`.

**Install and upgrade are separate verbs.** `setup:deps:install:uv` is
`uv sync --all-extras` and never moves a pin; `setup:deps:upgrade:uv` is
`uv lock --upgrade` followed by the same sync, so moving the lockfile forward
is always something someone asked for. This pack ships all five
`setup/deps/<verb>/uv` subtasks, and the repo's `setup:deps:<verb>:all`, which
tool-config renders, calls each by name.

**The lockfile is checked on every commit.** This pack's `code/check/uv`
subtask runs `uv lock --check` for each tracked `uv.lock` with a
`pyproject.toml` beside it, and passes where there is none — uv installed as
mise's pipx backend leaves no lockfile. The gate config's `check` hook runs it
through `code:check:all`, so the pack ships no pre-commit fragment.

**The verbs, and why each reads as it does.** `install --frozen` maps to uv's
`--locked`, never to uv's `--frozen`: a plain sync re-locks whenever the
manifest has drifted, the silent rewrite a fresh worktree and CI must see fail,
and uv's `--frozen` skips resolution and reads a stale lockfile without
complaint — `--locked` is the one that errors on drift. `audit` is advisory and
never a gate: the auditor is not a declared dependency but pulled in for the
run with `uv run --with`, layered over the project's own environment, so its
ruleset moves under an unchanged lockfile; the blocking supply-chain check is
`code:sec`, which runs pinned tools. `outdated` is advisory too — something
newer available is the normal state. `upgrade` syncs after `uv lock --upgrade`,
which rewrites the lockfile without touching the virtualenv. `cleanup` removes
`.venv` and prunes the cache and never deletes `uv.lock`. The verbs print no
header of their own; `setup:deps:all` frames each.

**This pack is authored but not yet reachable, and that is expected.** It
declares `kind: language-bundle`, but there is no `language/python` component
and no python bundle for it to compose into, so no materialization can land it
today. Authoring the python language bundle against the 12-topic bar, with
per-topic research, is its own wave — this is not a bug to fix in passing.

The gates that run against this environment are the `ruff` pack.
