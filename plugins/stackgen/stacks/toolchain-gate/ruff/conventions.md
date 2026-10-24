# Ruff — conventions

Both halves of the Python gate — the linter and the formatter — are one tool.
Topic 10 of the language bundle, deliberately not a repo gate: a linter
meaningful for exactly one toolchain belongs to that toolchain's bundle, or a
polyglot repo acquires one gate per language.

**Ruff runs through `uv run`**, never off `PATH`. The gate must be the version
the lockfile pinned, or CI and a developer's machine can disagree about what
passes. See the `uv` package-manager pack.

**`--fix` is a flag, not the default.** The gate checks by default and
mutates only when asked, so the same task is a gate in CI and a tool
locally.

## The seam with the repo formatter

**This pack ships no task.** The ruff tasks, the repo formatter and the
pre-commit hooks are bootstrap's. `mise run code:format` formats every file
type the repo formatter has a plugin for, and ruff formats Python, without
either knowing of the other. `mise run code:lint` runs `ruff check`. The
hooks pass the staged files: `ruff format` narrows to the Python files it is
given; `ruff check` stays whole-project either way, since its per-file
settings resolve from the project root and a staged subset would answer
differently from CI.

## Not yet reachable

**This pack is authored but not yet reachable, and that is expected.** It
declares `kind: language-bundle`, but there is no `language/python` component
and no python bundle for it to compose into, so no materialization can land it
today. Authoring the python language bundle against the 12-topic bar, with
per-topic research, is its own wave — this is not a bug to fix in passing.
