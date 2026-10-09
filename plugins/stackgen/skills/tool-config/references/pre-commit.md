# pre-commit — the local gate, and gate wiring

pre-commit runs the quality gates before a commit is made, so a broken commit
is never created rather than caught later. It is also the wiring that makes the
local gate and CI run the identical command: **every gate hook calls a task
from the repo's task library, and never inlines a command.** A hook that
inlines its command is a second definition of that gate; the two drift the
first time one is edited, after which local and CI disagree and the gate is
worse than absent, because it is trusted.

This reference is pre-commit's part of the universal files tool-config lands.
What every file shares — the values, the render, the rows, the six marked
files and drift — is [the skill's](../SKILL.md); what follows is pre-commit's
own. The commit convention its `commit-msg` hook enforces is
[git's](git.md#4-the-commit-convention).

| Section                                                | Read before                                          |
| ------------------------------------------------------ | ---------------------------------------------------- |
| [1. What lands](#1-what-lands)                         | reading the hook config or `linter.yaml`             |
| [2. The gate hooks](#2-the-gate-hooks)                 | adding a gate, or reading why the hooks name no tool |
| [3. The global exclude](#3-the-global-exclude)         | narrowing what the hooks see                         |
| [4. The gate doctrine](#4-the-gate-doctrine)           | adding a hook by hand                                |
| [5. The graph refresh hook](#5-the-graph-refresh-hook) | touching `post-commit`, `post-merge` or `code:graph` |

## 1. What lands

| File                             | As                                                       |
| -------------------------------- | -------------------------------------------------------- |
| `.config/pre-commit-config.yaml` | an asset, marked — the global `exclude` between the pair |
| `.config/linter.yaml`            | an asset, marked — `ignores:` between the pair           |

Each carries one marker pair ([the marked files](../SKILL.md#the-marked-files)).
On a repo with no copy, the whole asset lands. Once the file is in the repo,
only the lines between the markers are rewritten: every other line — the
shipped hooks included — is the repo's as it stands, and survives every
render. So a hook a repo adds or edits stays, and a later release's change to
a shipped hook outside the pair does not reach a repo that already has the
file; fold one in by hand.

**The hook config**, in file order:

- `minimum_pre_commit_version: "3.2.0"` — where `commit`/`push` became
  `pre-commit`/`pre-push`; an older pre-commit silently runs nothing.
- `default_install_hook_types`: `pre-commit`, `commit-msg`, `post-commit`,
  `post-merge` — a type not installed is not a hook that fails, it is one
  that never runs, and nothing reports it.
- `default_stages: [pre-commit]`, so each hook says only what differs.
- the global `exclude` — [section 3](#3-the-global-exclude).
- a `local` repo: `no-dash-names`, `git-config`, the four gate hooks
  `format`, `lint`, `check`, `sec`, then `graphify-refresh`.
- `pre-commit/pre-commit-hooks` at a pinned rev: large files (1 MB), case
  conflicts, Windows-illegal names, shebang and exec-bit agreement in both
  directions, merge-conflict markers, broken and destroyed symlinks, JSON,
  TOML and YAML syntax, private keys, final newline, trailing whitespace
  (`.md` excepted — two trailing spaces are a Markdown hard break), LF line
  endings, and `no-commit-to-branch` on `main`. `check-json` excludes
  `^\.vscode/|^\.config/dprint\.json$`: `.vscode/` files are JSONC by design,
  and `.config/dprint.json` is JSONC since its markers are `//` lines.
- `qoomon/git-conventional-commits` at a pinned rev, at `commit-msg`, reading
  `.config/git-conventional-commits.yaml`.
- the `meta` audit, at `stages: [manual]` — [section 4](#4-the-gate-doctrine).

### The linter config

`linter.yaml` is the house linter's one file, read by `code:lint:house`, the
universal subtask that runs `@askviraj/linter` over the whole tree — eslint
included, through the config the linter's installer generates. It ships empty
of overrides. Its `ignores:` list is **generated trees only**, since the linter
does not read `.gitignore`, and holds every stack's: `.build`, `.dart_tool`,
`.gradle`, `.kotlin`, `.swiftpm`, `.venv`, `Derived`, `DerivedData`, `build`,
`graphify-out`. It is not one of the lists the toolkit's checker holds equal
to the exclusion set.

Patterns resolve from the repo root, so every entry is `**/`-prefixed: a
generated tree sits at its project's root, which in a monorepo is any depth.
The cost falls on the generic names, `build/` and `Derived/` — a source
directory so named goes unlinted at any depth, and a repo that has one negates
it below the closing marker (`- "!src/build/"`). An override names one of the
linter's presets: `javascript`, `typescript`, `astro`, `json`, `jsonc`,
`markdown`, `markdown-typescript`, `yaml`, `toml`, `html` and `css`; a change
that belongs to a location rather than a language is a `configs` entry scoped
to a `files` glob. An entry that skips source, or an override that turns a
rule off to get green, makes a real finding disappear — the one use the file
is not for.

## 2. The gate hooks

**The gate hooks name no tool.** Each calls an aggregate task:

| Hook id  | Entry                                      | Passes               |
| -------- | ------------------------------------------ | -------------------- |
| `format` | `mise x -- mise run code:format:all --fix` | the staged filenames |
| `lint`   | `mise x -- mise run code:lint:all --fix`   | the staged filenames |
| `check`  | `mise x -- mise run code:check:all`        | nothing — whole repo |
| `sec`    | `mise x -- mise run code:sec --staged`     | nothing — the index  |

Each `…:all` task runs every subtask in its folder by name — `code:lint:all`
runs `code:lint:house`, `code:lint:shell`, `code:lint:workflows` and each
pack's `code:lint:<slug>` — and is re-rendered whenever a pack adds or removes
one ([mise's](mise.md#subtasks)). An empty one passes. `lint` is
`require_serial`, so a long staged list split into partitions runs one
partition at a time and two whole-tree runs never race; `check` and `sec` are
`always_run` with `pass_filenames: false`.

**A pack adds a gate by adding a subtask, never a hook.** A formatter is a
`code:format:<slug>`, a linter a `code:lint:<slug>`, a whole-repo check — uv's
lockfile freshness — a `code:check:<slug>`. The hook, the terminal and CI all
reach it through the one aggregate, and a repo customising a gate edits the
subtask.

## 3. The global exclude

The hook config's `exclude` is the third spelling of the one exclusion set
([dprint's](dprint.md#3-the-exclusion-set) holds the list and the reasons), so
no hook rewrites or reports on a generated tree, a cache or a lockfile. It is
a verbose-mode regex, one alternative per line, the shipped entries between
the markers:

```yaml
exclude: |-
  (?x)
  # >>> tool-config
  (^|/)\.build/
  |(^|/)\.claude/
  …
  |(^|/)[^/]*\.xcassets/
  # <<< tool-config
```

Each path is a regex: `*` as `[^/]*`, every metacharacter escaped. A
directory is `(^|/)`, the regex, then `/`; a file glob is `(^|/)`, the regex,
then `$`. Under `(?x)` a `#` line is a regex comment, so the markers are inert
inside the pattern. **A repo's own exclude** goes below the closing marker,
opening with `|` — every alternative but the first opens with one, and a
dangling `|` is an empty alternative matching every path, excluding the whole
tree. Keep it equal to the repo's own lines in the other lists.

## 4. The gate doctrine

**`files:` scopes every hook except the gate hooks**, so it fires only for
what it validates. The gate hooks carry none: the task knows which paths its
tools own, and a regex here would AND with that and silently stop checking a
tree the next subtask adds. **Order matters when hooks interact**: a hook that
regenerates committed output runs before the hook asserting it is current, and
stages its result.

**The `no-dash-names` hook refuses a path component starting with `-`.** It
is `language: fail` with `files: '(^|/)-'`: every tool the gate hooks call
reads an argument beginning with `-` as an option, so such a name breaks or
silently changes the formatters and linters. It comes first, so its refusal
is the first line a committer reads. Rename the file.

**The `git-config` hook requires a per-repo identity** — the task is
[git's](git.md#3-the-identity-task).

**A local hook's entry begins `mise x -- `.** The hook runner does not run
under the developer's activated environment, so without it neither `mise` nor
the tool it pins is on `PATH`. A `post-commit` or `post-merge` hook is
`always_run: true` — it runs after the fact, over no staged files.

**Revs are pinned and moved deliberately.** Every third-party `repo:` carries
a `rev:`. `pre-commit autoupdate` runs only under `setup:precommit --update`;
a plain `setup:precommit` moves no `rev:`, so a commit never fails on a change
nobody in the repo made.

**The config lives under `.config/`, which the hook runner never discovers.**
Every by-hand call carries `--config .config/pre-commit-config.yaml`;
`setup:precommit` installs with that path baked into the hook script, so
`git commit` needs no flag. It installs every type in
`default_install_hook_types`, and never clobbers a hook setup it did not
create — a foreign hook manager or a `core.hooksPath` is skipped with a
warning unless `--force` ([mise's](mise.md#3-the-task-library)). The script
validates the file with `pre-commit validate-config` whenever it writes it
([what a written call runs](../SKILL.md#what-a-written-call-runs)).

**Two audits belong at `manual`, not at commit.** `check-hooks-apply` and
`check-useless-excludes` fail on a **correct** config in a young repo — a hook
matching zero files, an exclusion for a tree not generated yet — so at the
commit stage they would fail every new repo's first commit. Run them when a
hook is added or a scope changes:

```sh
mise x -- pre-commit run --config .config/pre-commit-config.yaml \
  --hook-stage manual --all-files check-hooks-apply check-useless-excludes
```

**Never bypass a red gate.** The gate found something or it is broken; both
need answering, and `--no-verify` answers neither — it commits the finding and
moves it to CI, where it costs more. Its two honest uses are a hook that is
itself broken, and tooling that performs the hook's job out of band, both
stated in the commit message.

## 5. The graph refresh hook

`graphify-refresh` runs `mise x -- mise run code:graph` at `post-commit` and
`post-merge`. `post-merge` is what keeps the graph current on a pull: code a
teammate committed reaches the checkout through a merge, which no
`post-commit` sees. Neither stage can fail a commit or a merge — each runs
after it exists — and `code:graph` exits 0 when the graph tool is missing, is
a no-op in a linked worktree, mid-rebase, mid-merge, mid-cherry-pick or
mid-revert, and runs detached under a single-flight lock
([mise's](mise.md#3-the-task-library)).

It replaces graphify's own `graphify hook install`, whose raw git hooks pin a
Python path and break on the next upgrade. `setup:precommit` strips them
first: where `post-commit` or `post-checkout` carries graphify's markers it
runs `graphify hook uninstall` — stripping each marked block itself when that
fails or graphify is absent — then strips any `.legacy` copy an earlier
install chained. A `core.hooksPath` directory is another manager's, so its
hooks are only named, with the by-hand lines. It also deletes graphify's
`merge=graphify` line from `.gitattributes` and the `merge.graphify` section
from the local git config.
