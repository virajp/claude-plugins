# mise — the toolchain manager

mise does three jobs for a repo: it **pins** the tool versions the repo runs
on, **holds** the environment values those tools and tasks read, and **runs**
the repo's tasks. One manager, one command surface: a repo with two task
runners has two vocabularies for the same commands, and only one of them is
the one anything else invokes.

This reference is the `mise` row of the skill's tool table. The contract every
tool shares — the argument shapes, the block markers, drift, removal and the
lock record — is [the skill's](../SKILL.md); what follows is mise's own. The
files it lands are under
`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/mise/`, laid out as they land
under the repo root.

| Section                                  | Read before                                  |
| ---------------------------------------- | -------------------------------------------- |
| [1. The layout](#1-the-layout)           | deciding which file a pin, setting or value goes in |
| [2. What `all` lands](#2-what-all-lands) | running `all`, or reading what it landed     |
| [3. The marked positions](#3-the-marked-positions) | passing `all` its arguments        |
| [4. The verbs](#4-the-verbs)             | any other instruction                        |
| [5. The migration](#5-the-migration)     | running `all` on a repo shaped before this layout |
| [6. The task library](#6-the-task-library) | writing or editing anything under `tasks/` |
| [7. Bootstrap and CI parity](#7-bootstrap-and-ci-parity) | wiring a clone or a pipeline |
| [8. Legacy names](#8-legacy-names)       | renaming an existing repo's tasks            |

## 1. The layout

**All of it lives under `.config/`.** mise resolves `MISE_ENV` variants
there, so the config never clutters the repo root.

| File                               | Loaded when            | Holds                                          |
| ---------------------------------- | ---------------------- | ---------------------------------------------- |
| `miserc.toml`                      | before the rest        | `env_conf_d = true` and nothing else           |
| `mise.toml`                        | always                 | shared `[settings]` and top-level keys         |
| `mise.dev.toml`                    | `MISE_ENV=dev`         | dev settings                                   |
| `mise.ci.toml`                     | `MISE_ENV=ci`          | the pipeline's and production's settings       |
| `mise.test.toml`                   | `MISE_ENV=dev,test`    | test deltas, layered on top of dev             |
| `mise.local.toml`                  | always, last           | **never committed** — this machine's overrides |
| `mise/conf.d/<section>.toml`       | always                 | one section for every environment              |
| `mise/conf.d/<section>.<env>.toml` | `MISE_ENV` has `<env>` | one section for one environment                |
| `mise/mise.lock`                   | not loaded — written   | every environment's resolved versions          |

**Top-level files hold settings; sections live in `conf.d`.** Each top-level
file holds `[settings]` and top-level keys (`min_version`) only. Every other
section is its own file in `.config/mise/conf.d/`: `<section>.toml` for every
environment, `<section>.<env>.toml` for one. As `all` lands them:
`env.toml`, `tools.toml`, `tasks.toml`, `env.dev.toml`, `tools.dev.toml` and
`shell_alias.dev.toml`. A section with no content has no file.
`miserc.toml`'s `env_conf_d = true` is what scopes a dotted name to its
environment; it must sit in a miserc file, since `mise.toml` is read too
late. `MISE_ENV` itself is the user's shell's, never a file's.

**mise loads the base first and deep-merges the active variants on top**,
then `mise.local.toml` and `mise.<env>.local.toml` last of all. So a variant
holds **deltas** and never a copy of the base.

- **`MISE_ENV` is a comma list and the last entry wins.** `MISE_ENV=dev,test`
  is what makes `mise.test.toml` a delta on dev rather than a fourth full
  config — it is never selected alone.
- **Developers** export `MISE_ENV=dev` in their shell. **Pipelines** set
  `MISE_ENV=ci` in the workflow env. **Tests** run under `MISE_ENV=dev,test`.
- With `MISE_ENV` **unset**, only the base and the undotted `conf.d` files
  load — the minimal, portable base — and `setup:all` exits 1.
- A repo with **no CI/CD, no deploy target and no separate test environment**
  needs only the base. The others cost little and land anyway, so the answer
  to "where does this go" never requires creating a file first.
- Guard variant-only behaviour in a task by testing membership —
  `[[ ",${MISE_ENV:-}," == *",dev,"* ]]` — never by assuming a variant is
  loaded.

**A fresh checkout trusts nothing** — [section 7](#7-bootstrap-and-ci-parity)
opens with the trust step.

### What goes where

**Nothing is duplicated across layers.** A tool pinned twice is a version that
can disagree with itself, and the disagreement surfaces on someone else's
machine. Each tool, setting and env value goes in the **lowest layer that
needs it**.

- **`conf.d/tools.toml`** — the **runtime**, which a language or
  package-manager pack asks for, and everything the **pipeline** runs:
  `MISE_ENV=ci` never loads a `*.dev.toml` file, so a gate pinned there is a
  gate CI cannot reach. `conf.d/tasks.toml` holds `[tasks.init]` in the base
  for the same reason — the file-based tasks must be executable under
  `MISE_ENV=ci` too.
- **`mise.toml`** — the freshness policy and the settings that are policy
  rather than taste: `all_compile = false` (take the published binary for
  every tool, never build one), `task.timings = true` (an aggregate gate whose
  steps have no elapsed time is a slowdown nobody can attribute),
  `task.disable_spec_from_run_scripts = true` (a task's flags come from its
  `#USAGE` header, never from executing it to find out),
  `task.run_auto_install = false` (`setup:mise` owns installs), and
  `lockfile_platforms = ["linux-x64", "macos-arm64"]`. `min_version` is the
  mise release `env_conf_d` was tested on.
- **`conf.d/tools.dev.toml`** — what a human needs locally that a pipeline
  does not: formatters, linters, scanners, pre-commit, the graph tool.
- **`conf.d/shell_alias.dev.toml`** — the repo's **shell aliases**, and
  nowhere else. Aliases need `mise activate`, which is a human's shell; CI
  never loads this file, so nothing in the pipeline may depend on one. Three
  are part of the contract:

  ```toml
  [shell_alias]
  precommit = "mise run code:precommit"
  setup     = "mise run setup:all"
  worktrees = "mise run code:worktrees"
  ```

  plus one `setup-<slug>` per **member repo**
  ([section 3](#3-the-marked-positions)).
- **`mise.ci.toml`** — `locked = true`, so the pipeline installs from the
  tracked lock and fails rather than resolving, and any per-runtime CI
  workaround. The deployed runtime's env values go in `conf.d/env.ci.toml`.
  **Never a secret.**
- **`mise.test.toml`** — only the settings a test run has to differ on; its
  values go in `conf.d/env.test.toml`.
- **`mise.local.toml`** — nothing lands one; it is gitignored and written by
  hand, for what is true of one machine and no other. The same holds for
  `mise.<env>.local.toml` and `conf.d/*.local.toml`. Its existence is
  documented in `mise.toml`'s banner rather than by a file, because a shipped
  one would be committed by the first person who ran `git add -A`.

**A tool is pinned in one file only.** Two environments that need it share
`tools.toml`: the same tool at two versions in two environment files locks
one version, and the other environment's locked install fails.

**A tool CI runs belongs in `tools.toml`.** The dev files' job is what a
laptop needs and a runner does not.

**No provider edits the base.** A capability provider — a secret manager, say
— asks for its `[tools]` pin and its `[env]` defaults through its own
`tool-config:` calls, which land as its own block. Swapping providers removes
one requester's blocks and adds another's, and the base block never changes.

### The house linter

`npm:@askviraj/linter` is the base's one tool in `conf.d/tools.toml`, pinned
at an exact version with `allow_low_downloads = true`. The `code:lint` of the
pnpm, eslint, flutter, swift and swiftui packs calls it as `linter`: one pin is
one version those packs agree on, where a per-run fetch is whatever the
registry serves that minute, and it is in the base because the pipeline runs
`code:lint`. The binary is a Node script and needs a `node` on PATH — the
repo's own pin where it has one, else, for the packs that pin none (swift,
swiftui, flutter), the machine's. The tasks call it as
`mise which linter --tool npm:@askviraj/linter`, never by bare name: a Node
repo puts `node_modules/.bin` ahead of mise's tool bins, where a dependency's
`linter` would shadow the pin.

**The installer is the machine's, and the pin's guarantees are aube's.**
mise's npm backend defaults to its embedded aube; a machine may set
`npm.package_manager` or `npm.shell_out` to use npm, pnpm or bun instead. No
landed file sets the installer — a project-level setting reaches the machine's
global tools too. Only under the embedded aube does the pin install with no
separate package manager, does `allow_low_downloads` matter (aube refuses a
package under its weekly-download threshold on a first, unlocked install; the
exemption is this package's alone and its dependencies stay gated), and do
dependency lifecycle scripts run only when listed in `allow_builds`, which
the pin leaves empty.

**Commit the lock and its sidecar before the first CI push.** Under aube, the
lock's linter entry points at a generated sidecar,
`.config/mise/locks/npm-askviraj-linter/<version>~<hash>/`, whose
`package.json` and `aube-lock.yaml` fix the dependency graph; an install with
the entry and no sidecar fails, locked or not. So a repo runs `setup:all` in
dev and commits the lock and the sidecar together, or its pipeline fails at
install. The sidecar is generated: never format or lint it.

### Freshness and the one lock

**Latest, but never brand new; and CI resolves nothing.** Fuzzy pins defer
any release younger than `minimum_release_age` (ten hours; mise's own default
is 24), and `lockfile = true` records what they resolved to. The pipeline
sets `locked = true` and installs from that record. So moving a version
forward is a deliberate act with a diff, and a release nobody has run never
reaches a build.

**One lockfile for every environment, and it is tracked.**
`.config/mise/mise.lock` holds every tool in `conf.d`. It is written by one
`mise lock` under `MISE_ENV` set to every environment suffix the config files
carry, comma-joined — `dev,ci,test` as landed. A single-environment
`mise lock` drops the other environments' tools, so none is ever run. It is
written in two cases only, both in dev: when none exists, and under
`--upgrade`, as `mise lock --bump --upgrade` over the same union. The one
untracked lock is the local one, which the hygiene pack ignores.

### Environment values

**Names are shared across layers; values are split by layer.** Development
and production override the *same* keys rather than each inventing their own,
so the two differ in value and never in vocabulary.

- `conf.d/env.toml` — only what is identical everywhere: as landed, nothing
  but the marked positions ([section 3](#3-the-marked-positions)). They sit
  here and not in `env.dev.toml` because the tasks that read them run in the
  pipeline too.
- `conf.d/env.dev.toml` — the **development** values: verbose logging, local
  hosts, emulator endpoints, test credentials. `PRE_COMMIT_HOME` lands here.
- `conf.d/env.ci.toml` — the CI and **production** values for those same
  keys. One variant, two roles: it covers the pipeline and the deployed
  runtime both.
- `conf.d/env.test.toml` — only the keys a test run flips.

Never invent project-specific env vars, and never commit a secret to any of
them: tokens are injected by the CI provider or resolved by the pinned secret
manager at run time. A value committed here is in the history.

### The graph tool

`"pipx:graphifyy" = { version = "latest" }` is in the base's
`conf.d/tools.dev.toml` — dev only, since a pipeline never builds the graph.
`uv = { version = "latest" }` sits beside it: mise's pipx backend installs
through uv, so a repo with no Python still installs the graph tool.
The PyPI name really is `graphifyy`, double y; never correct it. `code:graph`
refreshes the graph — code only, detached, a no-op in a linked worktree,
mid-rebase or on a commit that touched only `graphify-out/` — and exits 0
when the tool is missing, so a commit never fails on it. `setup:ai` wires the
tool for the agent with `graphify install --platform claude` and installs no
git hook of its own: graphify's raw hooks pin a Python path and break on the
next upgrade. No hook runs `code:graph`: it is run by hand after a commit.

### Prerequisites named but not owned

The task library reaches for `.config/dprint.json`,
`.config/pre-commit-config.yaml`, `.config/gitleaks.toml` and
`.config/grype.yaml`. Those files belong to the gate packs, and each task
no-ops with a warning when its config is absent. `setup:vscode` reads one
more, `.vscode/extensions.json`, which `/vwf:init` composes from every
`.config/vscode.d/*.jsonc` fragment, this skill's included. Name any the repo
still needs; never write one from here.

## 2. What `all` lands

`all` lands every file under the assets' `.config/` at the same path under
the repo root:

| Landed                                              | As                                     |
| --------------------------------------------------- | -------------------------------------- |
| `miserc.toml`, `mise.toml`, `mise.{dev,ci,test}.toml` | the frame, then one `mise` block holding the rest |
| `mise/conf.d/*.toml`                                | the frame, then one `mise` block holding the rest |
| `mise/tasks/**`                                     | whole files, verbatim, mode `755`      |
| `vscode.d/mise.jsonc`                               | one `mise` block, `//` markers — only when `editor=vscode` |

**The frame is what opens a file before any block**: its header comment — the
leading run of comment and blank lines, ending at the first line that is
neither — and in a section file the table line — `[tools]` in `tools.toml`,
`[env]` in `env.toml`. A top-level file's frame is its header comment alone,
since `min_version` must precede `[settings]`; the `mise` block holds both.
`tasks.toml` has no single table: its blocks hold whole `[tasks.<name>]`
tables. Everything below the frame in an asset is the `mise` block, with its
marked positions filled from the arguments; an asset with nothing below its
header, `mise.test.toml`, is its frame alone.

**The task library is copied whole**, `_scripts/` included, every file mode
`755`. A task file is the base's alone, so it carries no markers; a pack that
fills a slot overwrites the file, its lock entry then names the pack, and
`all` never writes it back ([the skill's](../SKILL.md) rule for a path another
source owns). A slot no pack filled keeps its placeholder: a repo that has
picked no stack is supposed to see it.

**The editor fragment is conditional.** `vscode.d/mise.jsonc` lands only
where `editor=vscode`; on any other answer it is listed under **Skipped**, and
a later run whose answer turned to `vscode` lands it. `forge`, `secrets` and
`update_bot` are read by no mise file.

**After the landing, two bootstrap steps**, in this order: `mise trust --all`
([section 7](#the-trust-step-which-comes-before-all-of-it)), then
`mise run init`, which restores the exec bit on every task file. The caller
runs them; on a repo whose config was trusted and whose tasks carried the bit,
both change nothing and say so.

## 3. The marked positions

A marked position is a value no asset can know. It is filled from an `all`
argument, written as a literal directly below its comment, inside the `mise`
block — so a filled value is never drift, and a changed argument is one row
showing the change.

| Position                   | File                              | Argument                                  | Unfilled                  |
| -------------------------- | --------------------------------- | ----------------------------------------- | ------------------------- |
| `REPO_NAME`                | `conf.d/env.toml`                 | `repo`                                    | `"unfilled"`              |
| `MERGE_MODEL_DEVELOP`      | `conf.d/env.toml`                 | `merge_model_develop`                     | `"direct"`                |
| `MERGE_MODEL_MAIN`         | `conf.d/env.toml`                 | `merge_model_main`                        | `"pr"`                    |
| `MEMBERS`                  | `conf.d/env.toml`                 | `members`, when `linkage=siblings`        | `""`                      |
| `PATH_ENTRIES`             | `conf.d/env.toml`                 | `runtimes`                                | empty                     |
| `RUNTIME_BLOCK`            | `mise.toml`                       | `runtimes`                                | empty                     |
| the `setup-<slug>` aliases | `conf.d/shell_alias.dev.toml`     | `members`                                 | none                      |
| the member flags           | `tasks/setup/all`                 | `members`                                 | none beyond `--all`       |
| `EXTRA_MARKETPLACES`       | `tasks/setup/ai`                  | `plugin_sources`                          | `()`                      |
| `EXTRA_PLUGINS`            | `tasks/setup/ai`                  | `plugins`                                 | `()`                      |

Each has a working default, so an unfilled repo runs: `direct` into
`develop` is a local merge, `pr` into `main` opens the request, an empty
`MEMBERS` means `members()` falls through to `.gitmodules`.

**The default of every key mise reads**, taken when the key is left out and
the repo carries no value of its own:

| Key                                         | Default                                                     |
| ------------------------------------------- | ----------------------------------------------------------- |
| `repo`                                      | `unfilled`                                                  |
| `members`, `plugin_sources`, `plugins`      | empty                                                       |
| `linkage`                                   | `submodule` where the repo has a `.gitmodules`, else `siblings` |
| `merge_model_develop`, `merge_model_main`   | `direct`, `pr`                                              |
| `runtimes`                                  | empty — no runtime line at either position                  |
| `editor`                                    | `none` — the editor fragment is skipped                     |

`forge`, `secrets` and `update_bot` are read by no mise file and need none.

**`REPO_NAME` is the repo's folder name, slugified, and it is a literal.**
The slug rule is `${CLAUDE_PLUGIN_ROOT}/assets/ids.md`'s. It is **not** a
project id — the `p:<id>:*` task group carries that — and the two tokens are
independent; a single-project repo whose folder spells its project id is a
coincidence. It is never derived at load time: the basename of the config
root is the **branch** name inside a linked worktree, so a derived value
would address a different repo depending on where you stood. Aliases that
vary only by repo — the agent launchers — live in the user's **global**
config and read `$REPO_NAME`, so one definition serves every repo.

**The landing pair is set per branch.** `code:merge:develop` reads
`MERGE_MODEL_DEVELOP`, `code:merge:main` reads `MERGE_MODEL_MAIN`, each
`direct` or `pr` ([section 6](#the-merge-tasks)).
A file still carrying the single legacy `MERGE_MODEL` is migrated by `all`
([section 5](#5-the-migration)).

**`MEMBERS` is a string, never an array** — mise env values are strings. It
holds the member repos' paths, space-separated, relative to the repo root,
when `linkage=siblings`; under `submodule` it stays `""`, since git already
holds the list in `.gitmodules` and a second copy could only disagree.

**The member flags and aliases are named for member repos**, one per path in
`members`, whatever linkage: the slug of the member's folder name. Each flag
is a line `#USAGE flag "--<slug>" help="Set up the <slug> project"` added
below the comment in `tasks/setup/all`; each alias is
`setup-<slug> = "mise run setup:all --<slug>"` in the `mise` block of
`conf.d/shell_alias.dev.toml`. They are never a project id: a repo with three
projects in one tree and no members gets neither.

**The runtime positions take one entry per language `runtimes` names**, and
nothing for a language it does not — a setting for an absent runtime is a
claim about the stack that is not true:

| Runtime  | `RUNTIME_BLOCK` lines                                                   | `PATH_ENTRIES` line                                       |
| -------- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| `node`   | `node.compile = false`                                                  | `_.path = { path = "node_modules/.bin", tools = true }`   |
| `python` | `pipx.uvx = true`, `python.compile = false`, `python.uv_venv_auto = "create\|source"` | —                                  |
| `dart`, `go`, `rust`, `swift` | —                                                  | —                                                         |

No runtime line sets the npm installer: that is the machine's choice
([the house linter](#the-house-linter)).

**The plugin lists are arrays, one quoted row per line**, keeping their
template comment above them so a later run can re-derive them:
`EXTRA_MARKETPLACES` takes `plugin_sources`' `<source-ref>|<name>` rows,
`EXTRA_PLUGINS` takes `plugins`' `<name>@<marketplace>` rows. The workflow's
own plugin and what it depends on are never written there: `setup:ai`
installs them unconditionally.

## 4. The verbs

| Instruction                                      | Writes to                                 |
| ------------------------------------------------ | ----------------------------------------- |
| `add tool <name> <version> to all environments`  | `conf.d/tools.toml`                       |
| `add tool <name> <version> to <env> environment` | `conf.d/tools.<env>.toml`                 |
| `add env <KEY>=<value> to all environments`      | `conf.d/env.toml`                         |
| `add env <KEY>=<value> to <env> environment`     | `conf.d/env.<env>.toml`                   |
| `set env <KEY>=<value>`                          | wherever the requester's block sets `KEY` |
| `add alias <name>=<command>`                     | `conf.d/shell_alias.dev.toml`             |
| `remove <requester>`                             | every file holding its blocks             |
| `upgrade`                                        | the lock, through the task library        |
| `lock`                                           | the lock, when none exists                |

Each writes into the requester's block, `for <requester>`, or outside every
block when the call has none. `<env>` is `dev`, `ci` or `test`, and
`to <env>` without the trailing word reads the same. A call may continue onto
a second line; the words are what count.

### What a call may carry

Checked before anything is shown, and a call that fails is refused whole:

- **An env key** matches `[A-Za-z_][A-Za-z0-9_]*`.
- **An alias name** matches `[A-Za-z_][A-Za-z0-9_-]*` — a `-` after the first
  character, as in `setup-<slug>`.
- **A tool name** takes letters, digits and `:`, `/`, `.`, `-`, `_`, `@` —
  an optional backend prefix and its path, `aqua:realm/SwiftLint` — and
  nothing else: no `=`, `]`, quote, space or control character.
- **Every value** — an env value, an alias command, a version — is written as
  a TOML basic string, with `\`, `"` and every control character escaped.
  Nothing a call carries is ever written as bare TOML.
- **A template is legal only in `add env … for <requester>`**, a pack's own
  shipped line. `set env`, and `add env` with no `for`, refuse a value holding
  `{{`, `{%` or `{#`: mise renders every env value as a template on every
  load, so a typed or detected value would run for every developer and in CI.

**`add tool`** writes `<name> = { version = "<version>" }`, the name quoted
when it is not a bare TOML key (`"aqua:realm/SwiftLint"`, `"pipx:graphifyy"`).
A version is a mise version spec — an exact version, a prefix, or `latest`.
**One pin per tool across the tools files**: when the name is already pinned
in any tools file — another block or a user line — the call is not written
and is shown as a conflict row naming the file and whose pin it is; the user
settles it, and a pin two environments need moves to `tools.toml`.

**`add env`** writes `<KEY> = "<value>"`; the value may be given quoted or
bare. A requester's own value may be a template —
`"{{ config_root | split(pat='/') | last }}"` — while a machine value, which
`set env` takes from a person, never is. A key already set in the same file by
another block is a conflict row, as for a tool. **A key the requesting pack's
`machine_env:` list names is a machine value**: the pack ships it for the
person to fill, and whatever it holds later is never drift.

**`set env`** rewrites the value of a key the requester's block already sets,
in whichever env file that is, and nothing else; the requester's block not
setting the key is refused. It is how `/vwf:setup` fills a pack's machine
value — `set env XCODE_VERSION=26.1 for swiftui`. An answer equal to the
current value writes nothing. With no `for`, it rewrites the user's own line
for that key, and is refused where there is none.

**`add alias`** writes `<name> = "<command>"`. Dev only —
`to dev environment` is accepted and any other environment refused, since a
pipeline never activates a shell. **One alias per name**: `[shell_alias]` is
one table, so a name already set in `conf.d/shell_alias.dev.toml` — by the
mise block's own `setup-<slug>` aliases, another pack's block, or a user line
— is never written a second time. The call is shown as a conflict row naming
the name, whose alias it is and both commands, with two answers: **keep the
existing** (the new alias is not written) or **overwrite** (the existing line
is removed from its block or the user's lines and the new one written in the
requester's block). The user picks; nothing is written until they do, and
nothing records the answer, so a later run that meets the same clash asks
again.

**`upgrade`** runs `MISE_ENV=dev mise run setup:all --upgrade`: the one lock
bumped across every environment, the formatter's plugins updated, the same
passed to every member. It is the only verb that moves a pinned version
forward, and it is refused outside dev.

**`lock`** writes the one lock when none exists — `mise lock` under `MISE_ENV`
set to the union of the environment suffixes the config files carry — and
says so and writes nothing when one does. Moving an existing lock is
`upgrade`'s.

## 5. The migration

`all` on a repo whose mise files predate this layout brings them onto it. Every
step is a row in the call's plan; nothing is dropped unseen.

- **The legacy landing key.** A `MERGE_MODEL` in any env file becomes the
  pair in the `mise` block — the `merge_model_*` arguments where given, else
  the legacy value for both — and the old line goes.
- **A root manager config** — `.mise.toml` or a root `mise.toml` — and a
  top-level `.config/mise*.toml` still carrying sections are **split**, not
  moved: `[settings]` and top-level keys into the matching top-level file,
  every other table into its `conf.d` section file, inline `[tasks.*]` into
  `conf.d/tasks.toml`. What the base block already says is dropped as a
  duplicate; everything else lands as the user's lines, outside every block.
  The emptied file is deleted.
- **A pack's old fragment** — a `conf.d/<name>.toml` whose `<name>` is no
  section, the file a pack once copied — is split into `<name>`'s blocks in
  the section files, the values its machine keys held carried over, and the
  fragment deleted. The pack's own `tool-config:` calls, run next, then find
  their blocks already written.
- **An old lock** — `.config/mise.lock` or a per-environment
  `.config/mise.<env>.lock` — is deleted; `setup:mise` writes the one lock the
  next time it runs in dev.
- **The old pack's records.** A lockfile entry sourced from the retired
  toolchain pack is re-recorded as `tool-config/mise@<version>` where the path
  is still the skill's. The repo-local mise skill that pack used to copy under
  `.claude/skills/` is deleted where its content still matches its record,
  and kept and reported where it does not.

## 6. The task library

Once tasks grow past one-liners, drive everything through **executable task
files** under `.config/mise/tasks/`. mise turns nested directories into
colon-separated names: `.config/mise/tasks/code/format` →
`mise run code:format`. Discover them with `mise tasks`; reserve `[tasks.*]`
TOML entries (like `init`) for trivial run-strings and `depends`
aggregations.

**Three groups, and every task belongs to exactly one:**

| Group      | Is                                                                    |
| ---------- | --------------------------------------------------------------------- |
| `setup:*`  | bootstrap and re-sync — what a machine runs to be able to work here   |
| `code:*`   | the quality gates and the git operations — what a change runs through |
| `p:<id>:*` | one project's own commands — what only that project has               |

The `setup:*` and `code:*` sets are a **contract**: the names are identical
on every repo, because the names are what the rest of the toolkit invokes —
vwf among them, which probes for them. Only the commands *inside* them change
with the stack. `p:*` is the opposite — every name in it is this repo's own,
and nothing outside the repo may depend on one.

`all` lands the whole `setup:*` and `code:*` set; the stack-divergent files
arrive with the language, package-manager and gate packs, which land
**after** it and overwrite at the same paths. **Author from what landed, not
from scratch** — the snippets here show the shape, the landed files are the
source of truth.

### Task-file anatomy

```bash
#!/usr/bin/env bash

#MISE description="Check or format files"   # shown in `mise tasks`
#MISE hide=true                             # hide sub-tasks; aggregators stay visible
#MISE dir="{{ config_root }}"               # run from repo root, not the caller's cwd
#MISE depends=["init"]                      # ordering / fan-out

#USAGE flag "--fix"   help="apply fixes"    # arrives inside as $usage_fix ("true"/"false")
#USAGE arg "<branch>" help="what to merge"  # arrives inside as $usage_branch

set -euo pipefail
# shellcheck source=/dev/null
source "${MISE_PROJECT_ROOT}/.config/mise/tasks/_scripts/helpers"

print_header "Doing the thing ..."
```

- **Every task sources `helpers`** as its first real line, for uniform
  output.
- **Every task file is bash** — `#!/usr/bin/env bash`, `set -euo pipefail`,
  and clean under `shellcheck -x` and `shfmt -d -i 2 -ci`. The library runs
  on CI runners that have no other shell, and the two gates keep it that way.
- **Every flag and every positional gets a `#USAGE` line.** That is what
  makes `mise run <task> --help` true, and it is where the value's name comes
  from: `--fix` arrives as `$usage_fix`, `<branch>` as `$usage_branch`. A flag
  read without a `#USAGE` line is always unset.
- The flag conventions are `--fix` (mutate rather than check), `--debug`
  (verbose), `--all` (widen the scope), `--frozen` (do not move the
  lockfile).
- Guard dev-only side effects (containers, emulators) with a `MISE_ENV`
  membership test so the identical task is a no-op in the pipeline.
- Every task file lands **executable (755)**. mise runs the file directly, so
  one without its exec bit fails as an *unknown task* rather than as a
  permission error. `mise run init` restores the bit.

### `_scripts/` — the libraries every task shares

`_scripts/` is underscore-prefixed, so mise treats it as **not a task
directory**. The files inside it are named without a second underscore: the
directory has already said they are libraries.

| File          | Is                                                          |
| ------------- | ----------------------------------------------------------- |
| `helpers`     | the print vocabulary, `members()`, `shell_files_in_scope()` |
| `helpers.mjs` | the same vocabulary for Node tasks                          |
| `placeholder` | what an unfilled slot prints                                |
| `checks`      | the git predicates the merge tasks ask                      |
| `merge`       | the merge procedure both `code:merge:*` tasks run           |
| `<name>.env`  | a repo-specific value file, sourced rather than executed    |

All but the last land with `all`. A repo that grows a library of its own adds
a sibling here rather than a directory — `_scripts/helpers/` would make
`helpers` a path and every `source` line in the repo wrong at once. The one
repo-owned sibling a reshape writes is `_scripts/local`, which no pack ships
and nothing replaces. A repo already carrying an older `helpers` of its own
holds a diverged copy of this one, and [the legacy table](#8-legacy-names)
maps its vocabulary onto this one.

#### The print vocabulary

Styling constants (`BOLD`, `NORMAL`, and the `GREEN` / `YELLOW` / `RED` /
`BLUE` colours) plus:

| Helper              | Output                                                  |
| ------------------- | ------------------------------------------------------- |
| `print_header`      | a full-width `=` rule, then the title — a major section |
| `print_subheader`   | a full-width `-` rule, then the title — a step inside one |
| `print_success`     | a green bold line, no rule                              |
| `print_ok`          | green bold `OK`, for the end of a `print_wait` line     |
| `print_wait`        | yellow bold, no newline — an in-progress step           |
| `print_warn`        | yellow bold line                                        |
| `print_yellow`      | plain yellow line (not bold)                            |
| `print_error`       | red bold line, **to stderr**                            |
| `print_newline`     | a blank line                                            |
| `line_sep "<char>"` | a full-width rule of `<char>` (terminal width, else 80) |

**The separators are baked into the two headers, not left to the caller.**
`line_sep` stays public for the rare case that wants a rule with no title
after it, and calling it before a header prints two. **A single-step task
calls neither header**: `print_wait` … `print_ok`, or one `print_success`, is
its whole vocabulary.

#### Node tasks

A `.mjs` task imports from `helpers.mjs` instead of sourcing the bash file,
and prints identically. Its headers are the same directives behind `//`:

```js
#!/usr/bin/env node

//MISE description="Generate the API client from the schema"
//MISE hide=true
//USAGE flag "--check" help="fail instead of writing"

import { print_header, print_success, run } from "../_scripts/helpers.mjs";

print_header("Generating the client ...");
run("some-generator", ["--out", "src/generated"]);
print_success("Client generated.");
```

`run(cmd, args)` is the only thing the Node library adds: it inherits stdio
and exits the task with the command's status, which is what `set -e` does
for free on the bash side. **Keep the two libraries in step** — a printer
added to one and not the other is how the vocabularies drift.

### The mandatory set

| Task                                                  | Does                                                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `setup:all [--all] [--upgrade] [--<slug>…]`           | the bootstrap orchestrator — the order below; exits 1 when `MISE_ENV` is unset; `--<slug>` per member; `--upgrade` passed on to `setup:mise` and every member |
| `setup:mise [--upgrade]`                              | reshim, `mise install --locked`, doctor, the linter if present; one `mise lock` over every environment first only in dev with no lock (outside dev a missing lock exits 1); the lock bumped and the formatter plugins updated only under `--upgrade`, dev only |
| `setup:secrets`                                       | **slot** — the pinned secret manager's setup                                  |
| `setup:external:{start,stop,pull}`                    | **slots** — local services; each a no-op outside a dev shell                  |
| `setup:deps:all`                                      | `cleanup → install → upgrade → outdated → audit`                              |
| `setup:deps:{install,cleanup,upgrade,outdated,audit}` | **slots** — the package manager's verbs; `install` honours `--frozen`         |
| `setup:precommit [--force] [--update]`                | install the hooks, chaining a hand-written one as `.legacy`; refuses a foreign hook manager or `core.hooksPath` without `--force`; autoupdate only under `--update` |
| `setup:ai [--user] [--inventory]`                     | install and update the repo's required plugins at project scope               |
| `setup:vscode`                                        | reconcile the repo's editor profile with its recommended extensions           |
| `setup:worktree`                                      | the lighter sibling a fresh worktree runs                                     |
| `code:all [--fix] [--debug]`                          | the one-command gate: `format → lint → sec`                                   |
| `code:format [--fix] [files...]`                      | format or check the files given, else the tree; the `format` hook calls it    |
| `code:lint [--fix] [files...]`                        | **slot** — the linter; ships shellcheck/actionlint; `lint` hook calls it      |
| `code:sec [--staged] [files...]`                      | secret and vulnerability scan; the `sec` hook calls it with `--staged`        |
| `code:precommit [--all]`                              | run the hooks over what you changed, **before** you stage                     |
| `code:git-config [--fix]`                             | require the forge identity and ssh signing in the local git-config; `--fix` sets them from `GITHUB_*` / `GITLAB_*` / `GIT_*` |
| `code:graph [--force]`                                | refresh the knowledge graph after a commit; exits 0 when the tool is missing  |
| `code:worktrees`                                      | list worktrees across the repo and its members                                |
| `code:merge:develop <branch>`                         | merge a branch into `develop`, or open a pull request — `MERGE_MODEL_DEVELOP` |
| `code:merge:main`                                     | merge `develop` into `main`, or open a pull request — `MERGE_MODEL_MAIN`      |
| `code:count`                                          | lines of tracked text, grouped by extension, plus a total                     |

`code:all` is the one-command gate. `precommit`, `git-config`, `graph`,
`merge:*` and `count` are not in it — they are wired into the hooks, into
`setup:all`, or run by hand. `setup:all` calls every other `setup:*` task
except `setup:worktree`, which is the fresh-worktree sibling and not part of
the bootstrap order.

**`code:git-config` requires the forge identity, per repo.** The local
git-config must carry `user.name`, `user.email` and `user.signingkey`
**equal to** `<FORGE>_USER_NAME`, `<FORGE>_EMAIL` and `<FORGE>_SIGNING_KEY` —
presence is not enough — with `commit.gpgsign` and `tag.gpgsign` `true`,
`gpg.format` `ssh`, and `gpg.program` and `gpg.ssh.program` absent. `<FORGE>`
is `GITHUB` when the origin host is `github.com` or a subdomain of it,
`GITLAB` when it is `gitlab.com` or a subdomain, and `GIT` for any other host
or no remote; the variables are exported by the machine, never committed.
Check mode lists each failing key with expected against actual and the
variable to export, and exits 1; `--fix` writes the identity keys from the
variables — failing by name on an unset one and writing nothing partial —
sets the two booleans and `gpg.format`, and unsets the two `gpg.*program`
keys. It never deletes an identity. `<FORGE>_SIGNING_KEY` holds what git
accepts as `user.signingkey` under `gpg.format` `ssh`: the path to the key
file or the literal public key prefixed `key::`; a literal key of a type other
than `ssh-ed25519` without the prefix is read as a file path and the first
signed commit fails. The pre-commit hook runs `--fix`, but git has already
loaded its identity by the time a hook runs, so whenever `--fix` changed a key
it exits 1 — *identity corrected — re-run the commit* — and the re-run
carries it.

**What a task never does to the host.** A task never unsets, overwrites or
upgrades state it did not create; where it would have to, it stops, names
what it found and prints the one by-hand command. Every destructive step sits
behind a flag passed on purpose — `--force` (`setup:precommit` unsets a
**local** `core.hooksPath` and installs with `--overwrite`; a value from a
global or system git-config is named by scope and refused even under
`--force`; without the flag a hand-written hook script is kept as `.legacy`
and chained), `--update` (`setup:precommit` runs `pre-commit autoupdate`,
which moves the `rev:` lines), `--upgrade` (`setup:mise` runs one
`mise lock --bump --upgrade` over every environment, then
`dprint config update`; refused outside dev). `setup:all` passes `--force`
and `--update` never, and `--upgrade` only when the user passed it, so a
plain bootstrap rewrites nothing outside the files the skill and the packs
own.

**Nothing in this set edits a remote's settings.** Setting the forge's
default branch is a one-time act by whoever shapes the repo, so the library
carries no task for it; the repo's CONTRIBUTING stub names the command. It is
orthogonal to the merge tasks anyway: work flows feature → `develop` →
`main` whatever the forge calls default.

### Slots and their placeholders

A **slot** is a task whose name is part of the contract but whose mechanism
belongs to a stack nobody has pinned yet. It carries a `#PLACEHOLDER` marker,
sources `_scripts/placeholder`, and calls `placeholder_notice`, which prints
the reason, then greps the repo's own task tree for the marker and lists
**every** unconfigured task — a user who hits one slot will hit the rest.

**A placeholder always exits 0.** An unconfigured repo has to be able to run
`code:all` and `setup:all` end to end: the docs a product is defined in get
gated from day one, and the unfilled slots announce themselves rather than
halting the aggregator that called them.

A slot stops being one by being **overwritten** — a pack ships its own file at
the same path, marker and all gone. Nothing edits a placeholder in place, and
nothing fills one by hand.

**An overlay inherits the slot's argument surface, and its shipped
defaults.** A gate task that takes a file list keeps `#USAGE arg "[files]..."`
when it is overwritten — the hook passes filenames to whatever landed.
`code:lint` adds a second obligation: its two defaults — `shellcheck` over the
shell files in scope, `actionlint` over the workflows in scope, each silent
when its binary is absent — run **before** the placeholder notice and are not
the language linter's to remove. An overlay replaces the notice, never them.

**A tool that reads the repo as a *directory* is a default; a tool that
belongs to a language is not.** That is why `code:format` ships dprint and
shfmt, `code:sec` ships both scanners, and `code:lint` ships shellcheck and
actionlint yet is still a slot: the house linter needs a `node` a docs-only
repo does not pin, so the language half is the part nobody can guess.

### `setup/*` — bootstrap and upgrade

`setup:all` is **the entrypoint** a human runs — on clone, and to re-sync a
machine afterwards. It declares `#MISE depends=["init"]` and names no tool,
only the tasks it calls in order:

```text
setup:all  (--all recurses into every member; --upgrade is passed on)
  ├─ setup:mise            # reshim · install --locked · doctor    (common)
  ├─ setup:secrets         # the pinned secret manager             (SLOT)
  ├─ setup:external:start  # local services                        (SLOT)
  ├─ setup:deps:all        # the package manager's five verbs      (SLOTS)
  ├─ setup:precommit       # install the hooks                     (common)
  ├─ setup:ai              # install and reconcile agent plugins   (common)
  ├─ setup:vscode          # the repo's editor profile             (common)
  └─ <each member>         # only with --all
```

**Keep it idempotent: re-running `setup:all` must converge, never error.** It
is the re-sync command as much as the bootstrap one.

**And keep it non-destructive: `setup:all` passes no flag the user did not
pass.** Tools install from the committed lock, `mise install --locked`, on
every run, and nothing runs `mise upgrade`; `task.run_auto_install = false`
stops mise installing before a task body. The lock is written only as
[the one lock](#freshness-and-the-one-lock) says: in dev, when missing or
under `--upgrade`, which `setup:all` passes on to `setup:mise` and to every
member. Outside dev a missing lock, or `--upgrade`, exits 1 before any step,
so a pipeline installs what a developer committed or nothing. `setup:all`
itself exits 1 when `MISE_ENV` is unset, naming
`MISE_ENV=dev mise run setup:all`.

`setup:precommit` stops, without `--force`, on an effective `core.hooksPath`,
a `.husky/` directory or a lefthook config in any of its forms (`lefthook` or
`.lefthook`, with `.yml`, `.yaml`, `.toml` or `.json`), prints what it found
and the by-hand cleanup, deletes nothing and exits 1. A repo whose hooks
pre-commit already owns is not refused again, even with the husky or lefthook
file still tracked.

#### Member flags

A repo with members gets **one flag per member repo** on top of `--all`
([section 3](#3-the-marked-positions)). Each member runs its **own** task
library through `mise run --cd <path> setup:all`, so a polyglot repo gets one
library per project rather than one that knows every language. **A repo with
no members has no flags beyond `--all`**, which is then a no-op — left in
place because a caller passes it without knowing the repo's shape.

**The member *list* is one function, `members()` in `_scripts/helpers`**, and
every task that walks members calls it — `setup:all --all` and
`code:worktrees`. It answers from `.gitmodules` when the members are
submodules, and otherwise from the words of `MEMBERS`.

#### `setup/deps/*` — the package manager, and only that

- **`setup/deps/*`** — the language's **package manager**: the repo's
  **own** packages, the ones its manifest declares.
- **`setup/external/*`** — **services** the repo talks to but does not
  contain, brought up by a process supervisor or a container runtime:
  emulators, local queues, databases.

**Those two sentences are the whole distinction, and the names are not
negotiable.** "Dependencies" reads as either one in English, and a rename
would move a package install under the name reserved for starting a database.

| Task                  | Is                                                          |
| --------------------- | ----------------------------------------------------------- |
| `setup:deps:all`      | the aggregator `setup:all` calls                            |
| `setup:deps:install`  | install from the lockfile; `--frozen` refuses to resolve    |
| `setup:deps:cleanup`  | delete the installed tree and the cache, never the lockfile |
| `setup:deps:upgrade`  | the one task allowed to move the lockfile forward           |
| `setup:deps:outdated` | report what has moved on, and exit 0 anyway                 |
| `setup:deps:audit`    | the manager's own advisory check over the resolved tree     |

All five ship as slots and all five run. **A package manager with no such
verb fills the slot with an overlay that says so and exits 0** — the absence
is stated by the pack that knows, never inferred. **The task path carries no
tool name.**

#### `setup/external/*` — local services

`start`, `stop` and `pull` — `pull` fetches and builds, `start` boots. All
three are **local-only**: the pipeline brings up what it needs through its
own service definitions, so each exits 0 outside a dev shell. `setup:all`
calls `start`, so one bootstrap leaves a developer able to run the product.

#### `setup:ai` — the repo's agent plugins

Installs and updates the plugins **this repo** requires, through the agent
CLI's own plugin commands and nothing else. The required set is the
toolkit's own workflow plugin plus the rows of `EXTRA_PLUGINS`;
`EXTRA_MARKETPLACES` holds **marketplaces**, registered in their own pass
before any install. A plugin that arrives as another's declared dependency is
never listed, because the CLI resolves it.

**Project scope, and the exception is a flag.** Every install, update and
prune runs `--scope project`, so the repo's own settings file declares the
plugins and a machine's user-scope choices are left alone. `--user` flips
every scope for the rare repo that wants them global.

**A marketplace may be registered from a remote repository or from a local
directory**, and the task asks what is registered and branches: a
marketplace already registered under the name it wants is **updated**, never
re-added, whatever source it resolves from; only an unregistered one is
added. Re-adding a name whose registered source differs is an error, which is
the failure this branch avoids.

**`--inventory` is for the orchestrator.** It prints one line per registered
marketplace other than the toolkit's own, then one per installed plugin with
its marketplace and scope, and exits — the seed for the question `/vwf:init`
asks before it passes `plugin_sources` and `plugins`.

It closes by wiring [the graph tool](#the-graph-tool) when it is on `PATH` —
hinting `MISE_ENV=dev mise run setup:all` when it is not — and by hinting at
the statusline package, which is a per-machine choice and never installed.

#### `setup:vscode` — the repo's editor profile

`setup:all`'s last step, and silent on a machine without the editor. It reads
the recommendation ids out of `.vscode/extensions.json` and makes a profile
named `$REPO_NAME` match: install what is listed and missing, **uninstall
what is installed there and no longer listed**. A per-repo profile, because
accepting a recommendation installs globally and a global prune would take a
neighbouring repo's tools with it.

Measured on VS Code 1.136.1: `--profile <name>` combines with
`--list-extensions`, `--install-extension` and `--uninstall-extension` only
once the profile exists, and none of the three creates it. On a missing
profile the CLI prints `Profile '<name>' not found.` and, for
`--list-extensions`, still exits 0 — so that string is the only signal. The
task detects it, prints the one-time command that opens the folder under the
profile plus the share-settings-with-Default step, and exits 0.

#### `setup:worktree` — the lighter sibling

Members checked out, tools installed, secrets set up,
`setup:deps:install --frozen`. Nothing else: a fresh worktree shares the
machine's tools and the running services. `mise install` honours the tracked
lock and writes nothing new, so `git status` is clean after the task. **vwf's
git-workflow probes for it by name** before falling back to `setup:all`, so a
repo without it silently takes the slower path.

### `code/*` — the gates and the git operations

#### The hooks call the tasks

**Every gate hook runs a task, never a tool.** The gate pack's hook config
carries three tool-neutral hooks:

| Hook id  | Entry                                  | Passes               |
| -------- | -------------------------------------- | -------------------- |
| `format` | `mise x -- mise run code:format --fix` | the staged filenames |
| `lint`   | `mise x -- mise run code:lint --fix`   | the staged filenames |
| `sec`    | `mise x -- mise run code:sec --staged` | nothing — the index  |

That is why the three tasks take a file list: a hook is per-file and a task
is whole-tree by default, and `[files]...` lets one task serve both.
**A repo customising a gate edits the task, never the hook.** A tool named in
both places is a tool configured twice, and the two copies drift in the
direction nobody is looking.

#### The pre-commit ordering, which is the point

`code:precommit` runs the hooks over the **working tree's** changed files —
staged and unstaged, plus untracked, minus deletions — and it is meant to run
**before you stage**:

```text
mise run code:precommit   →   git add …   →   git commit
```

The hooks rewrite files; run first, those rewrites fold into the commit you
were about to make. `code:precommit --all` is the wide form, and the merge
tasks use it as a **safety net**: every hook over every file, then the tree
must still be clean. A hook with something to say at merge time means a
commit went in without one, and the merge **fails** rather than committing
the fixup — the repair belongs on the branch that caused it.

#### The merge tasks

`code:merge:develop <branch>` names its source, because it is routinely run
from the worktree the work was done in. `code:merge:main` names nothing: only
`develop` reaches `main`.

The shared procedure is `_scripts/merge`; the predicates it asks are
`_scripts/checks`. In order: refuse a merge **from** `main`; refuse into
`main` from anywhere but `develop`; refuse a branch merging into itself;
refuse when you are already standing on the destination; **refuse when the
destination branch does not exist locally**, naming the two-branch model;
then no untracked files and no uncommitted changes, and — under `direct`
alone — no unpushed commits on the source branch; then the hook safety net.
Only then does it touch git, as the destination's landing model says.

**A conflict leaves the tree mid-merge on purpose** — aborting would discard
which files disagree. `--no-ff` is on purpose too: the merge commit is what
makes "what shipped" a question git can answer.

#### The landing pair — what "land it" means on each branch

| Value    | After the predicates                                                     |
| -------- | ------------------------------------------------------------------------ |
| `direct` | check out the destination, `git merge --no-ff`, `git push --follow-tags` |
| `pr`     | `git push --follow-tags -u origin <branch>`, then open a pull request    |

Under `direct` a linked worktree hops to the main one, pulls with tags,
merges and pushes, and returns to where it started. Under `pr` **nothing
merges locally**: the task pushes and opens the request through whichever
forge CLI is on PATH — `gh` first, then `glab` — and where neither is, it
prints the branch, the destination and one line telling you to open the
request, then stops successfully. `code:merge:main` under `pr` opens
`develop` → `main`. A destination whose position is unset or empty reads as
`direct`.

**The legacy key.** A repo shaped before the pair existed carries the single
`MERGE_MODEL`. The merge reads it in place of whichever position is unset and
prints one warning naming it legacy, so a landing never fails on an old file
and the migration that writes the pair is not forgotten.

Repo-level values and not flags, because which one applies is the repo's
review policy and not the lander's; one per branch, because `develop` and
`main` carry different review policies more often than the same one.

#### `code:count` — a size reading

Lines of tracked text, grouped by extension, top ten plus a total — a
**size reading, not a metric**. It counts what git tracks and nothing more,
with `git grep -I -c ''` in one process, so the ignore story is git's and no
external counter is needed.

#### `code:graph` — the graph refresh

See [the graph tool](#the-graph-tool). It is run by hand after a commit,
never by `code:all`, and `--force` rebuilds even when the last commit touched
only `graphify-out/`.

### `p:<id>:*` — one project's own commands

Everything that is not bootstrap and not a gate: `dev`, `build`, `test`,
`e2e`, `deploy`, a code generator, a data migration.

**The `<id>` segment**, in order of preference:

1. the project's **registry id**, where `.config/vwf.yaml` names one;
2. otherwise the **sub-project directory name**;
3. otherwise the project's **primary platform token** — `service`, `worker`,
   `webapp`, `site`, `cli`, `iac` — so the group says what the project *is*.

**Two surfaces, two tokens.** The `p:<id>:*` group carries the **project
id**; `REPO_NAME` carries the **repo's folder name, slugified**; the member
flags and aliases carry the **member repos'** slugs. They coincide only in the
case that made them easy to confuse. This library derives none of them.

**Every project gets a `_default` slot.** `/vwf:init` creates
`p/<id>/_default` as a `#PLACEHOLDER` that prints "no project tasks yet" and
exits 0, so the group is visible in `mise tasks` from the first day. A worked
example, for a project whose registry id is `site`:

```bash
#!/usr/bin/env bash

#MISE description="Run the site's dev server"
#MISE dir="{{ config_root }}/site"

#USAGE flag "--host" help="bind on the network rather than localhost"

set -euo pipefail
# shellcheck source=/dev/null
source "${MISE_PROJECT_ROOT}/.config/mise/tasks/_scripts/helpers"

print_header "Starting the dev server ..."
# … the project's own command
```

**A gate or a bootstrap step never lives under `p:`**: if two projects would
both have it, it belongs in `code:*` or `setup:*` where the contract names
it.

### After `all` lands — what still takes judgement

- **Do not fill a slot by hand.** A repo that has picked no stack is
  *supposed* to see the placeholder output; writing a tool into it is the
  guess the slot exists to prevent.
- **A linter default is the author's, not the repo's.** Where a pack's
  `code/lint` runs a personal default, flag it and offer to swap in the
  linter the repo already configures.
- **`p:<id>:*` is authored, not copied.** Fill it from what the repo actually
  runs.
- **Name the missing prerequisites** — the gate config files — rather than
  writing them from here.
- **Leave the `MISE_ENV` guards intact.** They keep local-only side effects
  out of CI.

## 7. Bootstrap and CI parity

### The trust step, which comes before all of it

mise will not read a config file it has not been told to trust, and a fresh
checkout has told it nothing: the trust record is per machine, kept outside
the repo, and never committed. So the first command run in a clone — or in a
repo `all` has just landed into — is

```bash
mise trust --all
```

from the repo root. **`--all` is the form that matters.** Bare `mise trust`
trusts a single file, and `all` lands a config *split* — several top-level
files plus the `conf.d` section files — so a bare run leaves the rest
untrusted and the next command fails on a different one.

| Setting                      | `mise run <task>`               | `mise tasks`          |
| ---------------------------- | ------------------------------- | --------------------- |
| `paranoid = false` (default) | auto-trusts the config and runs | **fails** — untrusted |
| `paranoid = true`            | **fails** — untrusted           | **fails** — untrusted |

Discovery is broken either way, which makes this the **first** failure a
newly shaped repo hits: `mise tasks` is how a human and an agent both find the
library, and `setup:mise` asks it before deciding what to run.

Two ways to stop needing it per clone, both the machine's call:
`trusted_config_paths` in the **global** `~/.config/mise/config.toml` —
mise ignores the key in any non-global config — and a pipeline can set the
same. **A CI runner checks out fresh and trusts nothing**, so a workflow that
calls `mise run code:all` needs one of the two. Trust is shared into linked
worktrees from the main checkout.

### The rest

- **The pipeline runs the identical task names.** CI installs mise, sets
  `MISE_ENV=ci` in the workflow env, and calls `mise run code:all` — the same
  command a developer runs. A gate that passes locally and fails in CI is a
  gate that ran a different command. Setting `MISE_ENV=ci` in the pipeline
  definition is the one wiring step outside these files.
- **`code:all` needs the dev toolchain.** The formatter and the scanners are
  pinned in `conf.d/tools.dev.toml`, so the aggregate gate runs under
  `MISE_ENV=dev` — in the pipeline too, wherever it runs the gate rather than
  the build.
- **Per-runtime CI workarounds live in `mise.ci.toml` alone.** The one that
  ships, commented: for a **Node** project, `node.gpg_verify = false`. mise's
  bundled Node release-key gpg import fails on Linux runners ("no valid
  OpenPGP data found"); only Node's signature check is disabled, the tarball
  is still SHA256-verified, and `gpg_verify = true` in `mise.toml` stays.
- **The editor is set up by the same command as everything else** —
  `setup:vscode`, `setup:all`'s last step.
- **The repo's agent plugins are the repo's, and a user's are theirs** —
  `setup:ai` works at project scope only.

**This tool gates nothing and defines no build.** What each gate *checks*
belongs to the gate packs; the CI system's workflow syntax belongs to the CI
system; a language's build commands belong to that language — the tasks wrap
them rather than define them.

## 8. Legacy names

Names this contract replaced. `/vwf:init` reads this table to rename tasks on
an existing repo, which is why it lives here rather than in vwf — the renaming
is a fact about this task library, and vwf's prose names no tool. Apply the
rows top to bottom: no old name appears on the left twice, but a name a row
*produces* can be a later row's left-hand side — `setup:pnpm:update` becomes
`setup:deps:update`, then `setup:deps:upgrade`.

The `print_*` rows are how a repo's own tasks are rewritten when a diverged
`_scripts/helpers` is replaced by this one: every call to a left-hand name
becomes its right-hand one. A function the diverged copy defines that this
`helpers` does not, and no row here maps, is neither rewritten nor dropped:
its body **moves, whole, into `_scripts/local`**, and its calls keep their
name.

| Was                                         | Is now                 | Why it moved                                                              |
| ------------------------------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `worktree:init`                             | → `setup:worktree`     | it is a bootstrap step; `worktree:` was a group of one                    |
| `merge:develop`, `merge:main`               | → `code:merge:*`       | a merge is something a change runs through, like the gates               |
| `setup:pnpm:*`, `setup:uv:*`, `setup:app:*` | → `setup:deps:*`       | the task path carried the tool's name, so the contract differed per stack |
| `setup:doppler`                             | → `setup:secrets`      | same reason as `setup:deps:*` — the provider is a choice, the slot is not |
| `setup:deps:{start,stop,pull}`              | → `setup:external:*`   | services a product runs against are not its package manager              |
| `setup:deps:update`                         | → `setup:deps:upgrade` | "update" read as both install-and-refresh; the verbs are now separate     |
| `_scripts/_helpers`                         | → `_scripts/helpers`   | `_scripts/` already says library; the second underscore says it twice     |
| `_scripts/_checks`                          | → `_scripts/checks`    | same reason — and it is a separate library, not part of `helpers`         |
| `print_normal`                              | → `print_yellow`       | the vocabulary has no uncoloured line; a plain yellow one is the nearest  |
| `print_normal_wait`                         | → `print_wait`         | the `_wait` variants collapsed — an in-progress line has one colour       |
| `print_green`                               | → `print_success`      | a task says what happened, not what colour it said it in                  |
| `print_green_wait`                          | → `print_wait`         | same collapse; the green belonged to the `print_ok` that closes the line  |
| `print_yellow_wait`                         | → `print_wait`         | it was already the colour `print_wait` prints, under a second name        |
| `print_red`                                 | → `print_error`        | role-named now — and the line moves to stderr, where a failure belongs    |
| `print_red_wait`                            | → `print_wait`         | same collapse; the failure that follows is `print_error`'s to print       |
| `print_header_wait`                         | → `print_header`       | a header opens a section, and a section is not an in-progress step        |
| `print_subheader_wait`                      | → `print_subheader`    | same reason — the rule and the title are the whole of a subheader         |

A repo still carrying a left-hand name is not broken, but nothing else in the
toolkit will find it: vwf probes `setup:worktree`, the aggregators call
`setup:deps:*`, and `[shell_alias]` points at `code:*`.
