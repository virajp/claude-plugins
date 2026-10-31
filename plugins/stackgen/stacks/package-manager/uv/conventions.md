# uv — conventions

uv is the only package manager, and it is more than a resolver: it owns the
lockfile, the `.venv`, and running what it installed. A repo that installs with
uv and runs with a hand-activated virtualenv has two environments and only one
of them is locked.

**The lockfile is committed and authoritative.** `uv sync` resolves from it;
nothing in the ordinary install path is allowed to move it. `uv.lock` is never
edited by hand, with an editor tool, `sed` or a script: it changes only as the
output of `uv lock`, `uv add`, `uv remove` or `uv sync`, and a merge conflict in
it is resolved by taking either side and running `uv lock`, never by merging its
lines.

**Nothing runs outside the environment.** Every Python entrypoint the task
library invokes goes through `uv run`, so the version that executes is the
version the lockfile pinned — including the gates, which is why ruff runs as
`uv run ruff` rather than a `ruff` on `PATH`.

**The tasks are bootstrap's.** This pack ships no task: the repo's
toolchain — uv's pin, its install and upgrade tasks, the gates and the
pre-commit hooks — comes from bootstrap. `mise run setup` installs and never
moves a pin; `mise run setup --upgrade` moves the lockfile forward, so a new
resolution is always something someone asked for.

**Install from the lockfile with `--locked`, never `--frozen`.** A plain sync
re-locks whenever the manifest has drifted, the silent rewrite a fresh
worktree and CI must see fail, and uv's `--frozen` skips resolution and reads
a stale lockfile without complaint — `--locked` is the one that errors on
drift. `uv lock --upgrade` rewrites the lockfile without touching the
virtualenv, so a sync follows it. A clean-up removes `.venv` and prunes the
cache, and never deletes `uv.lock`.

**The lockfile is checked on every commit.** bootstrap's lint step runs
`uv lock --check`, so a `pyproject.toml` edited without a fresh lock fails
`mise run code:lint` and the pre-commit hooks. The fix is `uv lock`, never an
edit to `uv.lock`.

**A dependency audit is advisory, never a gate.** Its ruleset moves under an
unchanged lockfile; the blocking supply-chain check is `code:sec`, which runs
pinned tools. A report of something newer is advisory too — it is the normal
state.

**This pack is authored but not yet reachable, and that is expected.** It
declares `kind: language-bundle`, but there is no `language/python` component
and no python bundle for it to compose into, so no materialization can land it
today. Authoring the python language bundle against the 12-topic bar, with
per-topic research, is its own wave — this is not a bug to fix in passing.

The gates that run against this environment are the `ruff` pack.
