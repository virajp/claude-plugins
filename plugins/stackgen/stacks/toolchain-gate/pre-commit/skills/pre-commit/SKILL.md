---
name: pre-commit
version: 1.0.0
category: development
description: pre-commit as the local gate — config at
  .config/pre-commit-config.yaml, pack fragments merged in from
  .config/pre-commit.d/, the commit convention it enforces at commit-msg, hooks
  that call mise tasks so the same command runs locally and in CI, revs pinned
  and updated deliberately, and `files:` scoping so a hook fires only for what
  it validates. Auto-applies when editing a pre-commit config, a hook fragment
  or the commit convention.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/.pre-commit-config.yaml"
  - "**/.config/pre-commit-config.yaml"
  - "**/.config/pre-commit.d/*.yaml"
  - "**/.config/git-conventional-commits.yaml"
---

# pre-commit — the local gate

pre-commit runs the quality gates before a commit is made, so a broken commit is
never created rather than being caught later. The config lives at
**`.config/pre-commit-config.yaml`**, with the rest of the repo's tooling
config, which means every invocation carries `--config`:

```sh
mise run setup:precommit        # autoupdate + install the hooks
mise run code:precommit         # run against changed files
mise run code:precommit --all   # run against everything

pre-commit run --config .config/pre-commit-config.yaml --all-files
```

`pre-commit install -c <path>` **bakes that path into the generated hook
script**, which is why `git commit` needs no flag afterwards while a manual
`pre-commit run` still does. Re-run `setup:precommit` after moving the config;
the old path stays baked in until you do.

`setup:precommit` also clears any `core.hooksPath` the repo has set locally —
`install` refuses outright while one is set, and a leftover path silently wins
over pre-commit's installed hook, so the symptom is a gate that reports nothing
rather than one that errors.

## The config is a base, and packs extend it by fragment

A language or package-manager pack never rewrites
`.config/pre-commit-config.yaml`. It ships one fragment at
`.config/pre-commit.d/<pack>.yaml` — a document whose only top-level key is
`repos:` — and the merge appends each fragment's entries to the base config
between a pair of markers:

```yaml
# >>> pre-commit.d/<name>.yaml
  - repo: local
    hooks:
      - id: ...
# <<< pre-commit.d/<name>.yaml
```

A re-run replaces what sits between one pair and leaves everything else alone,
so a fragment landing later is additive. The rule that follows: **a repo's own
hooks go above the marker block, never inside one** — anything between a pair is
regenerated, and the loss is silent.

## Two hooks that belong at `manual`, not at commit

`check-hooks-apply` and `check-useless-excludes` audit the config rather than
the code, and both fail on a **correct** config in a young repo: the first
reports every hook matching zero files (the normal state of a symlink or
workflow hook until the repo grows one), the second reports an exclusion for a
tree that has not been generated yet. Wired at the commit stage they fail the
first commit of a new repository, and the fix people reach for is deleting the
hook that complained.

```sh
pre-commit run --config .config/pre-commit-config.yaml \
  --hook-stage manual --all-files check-hooks-apply check-useless-excludes
```

Run them when a hook is added or a scope is changed. What they catch is a
`files:` regex that stopped matching after a rename — a gate reporting success
while checking nothing.

## Every gate hook calls a task, and names no tool

A gate tool is configured in exactly one place — its mise task. The hook is a
thin call to that task, so a repo customising a gate edits the task, and the
hook, the terminal and CI all follow from the one edit. A hook that names a tool
is a second definition of that gate: the two drift the first time one is
touched, and the drift surfaces as CI failing what pre-commit passed.

That is why the base config ships exactly three gate hooks, all tool-neutral:

```yaml
- repo: local
  hooks:
    - id: format
      name: Format (mise run code:format)
      entry: mise x -- mise run code:format --fix
      language: system
      pass_filenames: true

    - id: lint
      name: Lint (mise run code:lint)
      entry: mise x -- mise run code:lint --fix
      language: system
      pass_filenames: true

    - id: sec
      name: Secrets (mise run code:sec --staged)
      entry: mise x -- mise run code:sec --staged
      language: system
      pass_filenames: false
      always_run: true
```

Which formatter, which linters and which scanners actually run is the pinned
stack's business: each language, package-manager and gate pack overlays
`code:format` and `code:lint` with its own tools, and every one of them skips
silently when its binary or its config is absent. Nothing about that reaches
this file.

`--fix` is how `code:format` and `code:lint` are told to rewrite rather than
report; `--staged` is how `code:sec` is told to scan the index rather than the
tree. The staged filenames follow for the first two and not for the third,
which asks git for its own scope.

`mise x --` is what makes the hook work in a bare shell: pre-commit does not run
under the developer's activated environment, so without it `mise` — and the
tools the task reaches for — are simply not on `PATH`.

A pack fragment follows the same rule. If a pack needs a gate, it overlays the
task; a fragment is for a check that is **not** a gate tool, such as `uv`'s
lockfile freshness.

## Scope with `files:`, and honour hook ordering

- **`files:` is a regex over paths**, and it is what keeps a commit touching one
  doc from running the whole gate. Scope each hook to what it actually
  validates — **except** a hook that calls a gate task, which carries no `files:`
  at all: the task is the thing that knows which paths each of its tools owns,
  and a regex here would AND with that and silently stop checking a tree the
  next overlay adds.
- **`pass_filenames: false`** for any hook that operates on the repo as a whole
  (a build, a full-tree check). Otherwise pre-commit appends the changed file
  list to the command, which most task runners then treat as arguments.
- **Order matters when hooks interact.** A hook that regenerates committed
  output must run *before* the hook that asserts the output is current, and the
  generating hook must be the one that stages its result — otherwise the check
  compares against a stale tree and fails as something else entirely.

## Pin revs; update them deliberately

Every third-party `repo:` entry carries a `rev:`. `pre-commit autoupdate` moves
them, and it is run as a deliberate act (`setup:precommit`), not silently on
each commit — an unpinned or auto-moving hook set means a commit can fail on a
change nobody in the repo made.

## The commit convention lives here too

`.config/git-conventional-commits.yaml` is this component's second file, because
the `commit-msg` hook is what enforces it — a convention nothing checks is a
style note, and the file and its gate should not be able to land separately. It
has a second reader: release notes are generated from the same file, so a type
missing from `changelog.commitTypes` is work that silently never appears in a
release.

Two keys are easy to get wrong. `featureCommitTypes` (under `convention:`, not
`changelog:`) is what decides a **minor** bump — everything else is a patch, and
a `!` or a `BREAKING CHANGE` footer is a major regardless of type. And
`commitScopes` is a closed list: a scope that stops existing stays listed with a
comment saying so, because deleting it retroactively invalidates every commit
that used it.

## Never `--no-verify` to get past a red gate

The gate found something. Bypassing it commits the finding and moves it to CI,
where it costs more to diagnose. The two honest uses of `--no-verify` are a hook
that is itself broken, and a commit made by tooling that legitimately performs
the hook's job out of band — both worth stating in the commit message.
