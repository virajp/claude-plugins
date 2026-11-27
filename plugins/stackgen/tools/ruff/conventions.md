# Ruff — conventions

The Python lint gate; dprint's ruff plugin is the formatter (see the seam).
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

**This entry ships no task.** The ruff tasks, the repo formatter and the
pre-commit hooks are bootstrap's. `mise run code:format` formats Python
through dprint's ruff plugin (`code:format:05-dprint`), beside every other
file type dprint has a plugin for; ruff itself only lints.
`mise run code:lint` runs `ruff check` (`code:lint:70-ruff`). The hooks pass
the staged files: dprint narrows to the files it is given; `ruff check` stays
whole-project either way, since its per-file settings resolve from the
project root and a staged subset would answer differently from CI.

## Ahead of its bundle

**This entry is authored ahead of its bundle, and that is expected.** It
names bootstrap's `python` tool, but no shipped bundle names that tool yet.
Authoring the python language bundle against the 12-topic bar, with
per-topic research, is its own wave — this is not a bug to fix in passing.
