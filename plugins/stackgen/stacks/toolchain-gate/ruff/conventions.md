# Ruff — conventions

Both halves of the Python gate — the linter and the formatter — are one tool.
Topic 10 of the language bundle, deliberately not a repo gate: a linter
meaningful for exactly one toolchain belongs to that toolchain's bundle, or a
polyglot repo acquires one gate per language.

**Ruff runs through `uv run`**, never off `PATH`. The gate must be the version
the lockfile pinned, or CI and a developer's machine can disagree about what
passes. See the `uv` package-manager pack.

**`--fix` is a flag, not the default.** `code:lint:ruff` and
`code:format:ruff` check by default and mutate only when asked, so the same
task is a gate in CI and a tool locally.

## The seam with the repo formatter

**This pack owns two subtasks, `code/format/ruff` and `code/lint/ruff`**, and
nothing else in the task tree. The repo's `code:format:all` and
`code:lint:all`, which tool-config renders, call every subtask by name — so
dprint, through the universal `code:format:dprint`, formats every file type it
has a plugin for across the whole repo, and ruff formats Python, without
either file knowing of the other.

**Both subtasks take an optional file list, and the empty case is the whole
tree.** That is the whole pre-commit story for this pack: it ships **no
fragment**, because the gate config's `format` and `lint` hooks call
`code:format:all` and `code:lint:all` with the staged files, and each passes
them on. `ruff format` narrows to the Python files it is given; `ruff check`
stays whole-project either way, since its per-file settings resolve from the
project root and a staged subset would answer differently from CI.

## Not yet reachable

**This pack is authored but not yet reachable, and that is expected.** It
declares `kind: language-bundle`, but there is no `language/python` component
and no python bundle for it to compose into, so no materialization can land it
today. Authoring the python language bundle against the 12-topic bar, with
per-topic research, is its own wave — this is not a bug to fix in passing.
