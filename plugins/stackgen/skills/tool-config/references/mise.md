# mise — the toolchain manager

mise does three jobs for a repo: it **pins** the tool versions the repo runs
on, **holds** the environment values those tools and tasks read, and **runs**
the repo's tasks. One manager, one command surface: a repo with two task
runners has two vocabularies for the same commands, and only one of them is
the one anything else invokes.

This reference is the why behind the mise files tool-config renders — the
calls, the rows and the values file are [the skill's](../SKILL.md). Every
file below is an asset or a template under
`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/`, laid out as it lands under the
repo root; a greenfield repo needs no edit by hand. When you edit a mise file
yourself, the layout and the rules of what goes where below are what you
hold it to.

| Section                                                  | Read before                                         |
| -------------------------------------------------------- | --------------------------------------------------- |
| [1. The layout](#1-the-layout)                           | deciding which file a pin, setting or value goes in |
| [2. Pins](#2-pins)                                       | adding or moving a tool                             |
| [3. The task library](#3-the-task-library)               | writing or editing anything under `tasks/`          |
| [4. Bootstrap and CI parity](#4-bootstrap-and-ci-parity) | wiring a clone or a pipeline                        |
| [5. Legacy names](#5-legacy-names)                       | renaming an existing repo's tasks                   |

## 1. The layout

**All of it lives under `.config/`**, so the config never clutters the repo
root.

| File                                   | Loaded when            | Holds                                                 |
| -------------------------------------- | ---------------------- | ----------------------------------------------------- |
| `miserc.toml`                          | before the rest        | `env_conf_d = true` and nothing else                  |
| `mise.toml`                            | always                 | `min_version` and `[settings]` only                   |
| `mise/conf.d/<folder>/mise.toml`       | always                 | a folder's tools, env values, tasks and aliases       |
| `mise/conf.d/<folder>/mise.<env>.toml` | `MISE_ENV` has `<env>` | the same, for one environment — `dev`, `ci` or `test` |
| `mise.local.toml`, `*.local.toml`      | always, last           | **never committed** — one machine's overrides         |

There is no root `mise.<env>.toml`: an environment's lines live in the folder
that owns them. `miserc.toml`'s `env_conf_d = true` is what makes mise read a
dotted file inside a `conf.d/` folder for its environment alone; it must sit
in a miserc file, since `mise.toml` is read too late. `min_version` is the
mise release that folder loading was tested on. `MISE_ENV` itself is the
user's shell's, never a file's.

**Folders, and who owns each:**

| Folder          | Owner                    | Holds                                                                |
| --------------- | ------------------------ | -------------------------------------------------------------------- |
| `_base/`        | tool-config, every repo  | the repo's values, the gate tools, the shell aliases, `tasks.init`   |
| `ai/`           | tool-config, every repo  | the agent tooling — jq, yq, mempalace, graphify — dev only           |
| `<pack slug>/`  | that pack's `templates/` | the pack's own pins, values and aliases                              |
| `<project id>/` | the repo                 | what one project of this repo pins — written by hand, never rendered |

mise loads folders after single files, alphabetically by name, with the same
environment and local rules. Which of two folders wins when both pin one
tool is not documented, so **a tool is pinned in exactly one folder**.

**mise deep-merges the active environments on top of the base**, then the
local files last of all, so an environment file holds **deltas**, never a
copy.

- **`MISE_ENV` is a comma list and the last entry wins.** `MISE_ENV=dev,test`
  makes `mise.test.toml` a delta on dev rather than a full config.
- **Developers** export `MISE_ENV=dev` in their shell. **Pipelines** set
  `MISE_ENV=ci`. **Tests** run under `MISE_ENV=dev,test`.
- With `MISE_ENV` **unset**, only the undotted files load, and `setup:all`
  exits 1.
- Guard variant-only behaviour in a task by testing membership —
  `[[ ",${MISE_ENV:-}," == *",dev,"* ]]` — never by assuming a variant is
  loaded.

### What `_base/` and `ai/` hold

- **`_base/mise.toml`** — loaded everywhere, CI included. `[env]` holds the
  repo's values: `REPO_NAME`, `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN` and
  `MEMBERS` (the member paths, space-separated — mise env values are
  strings). `[tasks.init]` sits here, not in dev, because `setup:all` depends
  on it and CI needs the task files executable too. On a **node repo**
  (`node: true`) it also pins `node` and `pnpm`, sets `node.compile = false`
  and `npm.package_manager = "pnpm"`, and puts `node_modules/.bin` on the
  path.
- **`_base/mise.dev.toml`** — the laptop's: the python, pipx and uv settings
  and their three `UV_*` values, `PRE_COMMIT_HOME`, and the tools a developer
  needs and a runner does not — python, uv, pre-commit, osv-scanner, grype,
  gitleaks, dprint, taplo, shellcheck, shfmt, actionlint and the house
  linter, `npm:@askviraj/linter`. On a repo that is not node, `node` and
  `pnpm` are pinned here instead: the tool-config script runs on them. The
  shell aliases sit here too — `precommit`, `setup`, `worktrees`, and one
  `setup-<slug> = "mise run setup:all --<slug>"` per member — because an
  alias needs `mise activate`, which is a human's shell.
- **`_base/mise.ci.toml`** — on a node repo, `node.gpg_verify = false`, the
  one CI workaround ([section 4](#4-bootstrap-and-ci-parity)); empty
  otherwise, and so not written.
- **`ai/mise.dev.toml`** — jq, yq, `pipx:mempalace` and `pipx:graphifyy`
  (the PyPI name really is `graphifyy`, double y; never correct it), the
  `MEMPALACE_*` values, and `MEMPALACE_PALACE_PATH`, the one per repo. Dev
  only: a pipeline never builds the graph or the palace.

**`REPO_NAME` is a literal**, never derived at load time: the basename of
the config root is the **branch** name inside a linked worktree, so a derived
value would address a different repo depending on where you stood. It is
not a project id — the `p:<id>:*` group carries that.

**The landing pair is set per branch.** `code:merge:develop` reads
`MERGE_MODEL_DEVELOP`, `code:merge:main` reads `MERGE_MODEL_MAIN`, each
`direct` or `pr` ([the merge tasks](#the-merge-tasks)).

### `mise.toml`'s settings

Policy, not taste: `all_compile = false` (take the published binary, never
build one), `lockfile = false` ([section 2](#2-pins)),
`minimum_release_age = "10h"` (a release nobody has run is not what `latest`
resolves to), `task.run_auto_install = true` (a task's tools install before
its body), `task.timings = true` (an aggregate gate whose steps have no
elapsed time is a slowdown nobody can attribute) and
`task.disable_spec_from_run_scripts = true` (a task's flags come from its
`#USAGE` header, never from executing it).

### Environment values

**Names are shared across environments; values are split by them.** dev and
CI override the *same* keys rather than each inventing their own. A value
the tasks read in the pipeline goes in an undotted `mise.toml`; a laptop's
value in `mise.dev.toml`; a test run's flip in `mise.test.toml`. **Never
commit a secret** to any of them: tokens are injected by the CI provider or
resolved by the pinned secret manager at run time.

### The house linter

`npm:@askviraj/linter` is pinned in `_base/mise.dev.toml` with
`allow_low_downloads = true`, and `code:lint:house` runs it over the whole
tree — its rules read across files. It runs the eslint config the installer
generates, so no pack ships an eslint task. The task calls it as
`mise which linter --tool npm:@askviraj/linter`, never by bare name: a
`node_modules/.bin` on `PATH` would shadow the pin. Its config,
`.config/linter.yaml`, is an asset ([pre-commit's](pre-commit.md)).

## 2. Pins

**Where a pin is exact is decided by who loads the file.**

- A **dev-only** file (`mise.dev.toml`) says `version = "latest"`: a laptop
  takes what is current, and `minimum_release_age` keeps a release nobody has
  run out of it.
- A file **CI loads** — `.config/mise.toml`, or `mise.toml`, `mise.ci.toml`
  or `mise.test.toml` in any `conf.d/` folder — is written with every
  `latest` resolved by `mise latest <tool>` to an exact version, so the
  pipeline installs what a developer committed and resolves nothing. **node
  and pnpm stay `latest`** even there: node keeps good backward
  compatibility, and a node repo pins both in `_base/mise.toml`.

**So there is no lockfile.** A template ships `latest`; the render makes it
exact where CI loads it. A pin the repo's file already holds exactly is kept
as it stands, which is what makes a second `all` show no row. **`upgrade` is
the only mover** — [the skill's](../SKILL.md#pins) — and nothing else, no
task, no install, no hook, moves a pin.

**A tool is pinned once.** Put it in the folder that owns it — `_base/` and
`ai/` are tool-config's, a pack's folder is the pack's, and the repo's own
pins go in a folder of its own. **A tool CI runs belongs in an undotted
`mise.toml`**: `MISE_ENV=ci` never loads a dev file, so a gate pinned there
is a gate CI cannot reach.

**A tool is never added with a bare `mise use`** — never: it writes the
settings-only `mise.toml` and pins outside every folder. Write the pin into
its folder's file first, then `mise install`.

## 3. The task library

Executable task files under `.config/mise/tasks/`, turned by mise into
colon-separated names: `.config/mise/tasks/code/format/all` →
`mise run code:format:all`. Discover them with `mise tasks`; keep `[tasks.*]`
TOML entries (like `init`) for trivial run-strings.

**Three groups, and every task belongs to exactly one:**

| Group      | Is                                                                    |
| ---------- | --------------------------------------------------------------------- |
| `setup:*`  | bootstrap and re-sync — what a machine runs to be able to work here   |
| `code:*`   | the quality gates and the git operations — what a change runs through |
| `p:<id>:*` | one project's own commands — what only that project has               |

The `setup:*` and `code:*` names are a **contract**: identical on every repo,
because the names are what the rest of the toolkit invokes — vwf among them.
Only the subtasks under them change with the stack. `p:*` is the opposite —
every name in it is this repo's own.

**The repo-local mise skill**, `.claude/skills/mise/SKILL.md`, is a template:
how an agent runs tasks, where each file lives, how a tool is added, and a
task table rendered from `TASKS` — so a pack's subtask shows up there on the
`pack` call that adds it.

### Subtasks

A gate or a setup step that differs by stack is an **`…:all` task calling
every subtask beside it**, never one file a pack overwrites:

| `…:all` task            | Calls every                | Universal subtasks                                                         |
| ----------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `code:check:all`        | `code:check:<name>`        | none                                                                       |
| `code:format:all`       | `code:format:<name>`       | `dprint`, `shell` (shfmt)                                                  |
| `code:lint:all`         | `code:lint:<name>`         | `house` (the house linter), `shell` (shellcheck), `workflows` (actionlint) |
| `setup:ai:all`          | `setup:ai:<name>`          | `base` — the workflow plugin and every upgrade                             |
| `setup:deps:<verb>:all` | `setup:deps:<verb>:<name>` | none                                                                       |

`<verb>` is `install`, `upgrade`, `outdated`, `audit` or `cleanup`. Each
`…:all` is a template listing the executable files in its folder — `all`
and `_`- or `.`-named files left out — and is **re-rendered whenever a pack
adds or removes one** (`pack`, `pack-remove`). With no subtask it prints that
there is nothing to run and passes. Each calls its subtasks by name with the
flags it was given — `--fix`, `--debug`, the file list — so a subtask takes
the same surface.

**A pack's subtask is named for the pack and runs its own tool alone**:
`code:lint:swiftlint`, `code:format:swift-format`, `code:check:uv`,
`setup:deps:install:pnpm`, `setup:ai:claude-code`. Two packs never share a
file, so a pack is added and removed without touching another's. A repo adds
its own step the same way — a subtask file of its own — never by editing an
`…:all` task, which the next render rewrites.

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
  on CI runners that have no other shell, and `code:lint:shell` and
  `code:format:shell` keep it that way.
- **Every flag and every positional gets a `#USAGE` line.** That is what
  makes `mise run <task> --help` true, and where the value's name comes from:
  `--fix` arrives as `$usage_fix`. A flag read without a `#USAGE` line is
  always unset.
- The flag conventions are `--fix` (mutate rather than check), `--debug`
  (verbose), `--all` (widen the scope), `--frozen` (do not move the
  lockfile).
- Guard dev-only side effects with a `MISE_ENV` membership test so the
  identical task is a no-op in the pipeline.
- Every task file lands **executable (755)**. mise runs the file directly, so
  one without its exec bit fails as an *unknown task*. `mise run init`
  restores the bit.

### `_scripts/` — the libraries every task shares

`_scripts/` is underscore-prefixed, so mise treats it as **not a task
directory**.

| File          | Is                                                          |
| ------------- | ----------------------------------------------------------- |
| `helpers`     | the print vocabulary, `members()`, `shell_files_in_scope()` |
| `helpers.mjs` | the same vocabulary for Node tasks                          |
| `placeholder` | what an unfilled slot prints                                |
| `plugins`     | `claude_available`, `plugin_installed`, `ensure_plugin`     |
| `checks`      | the git predicates the merge tasks ask                      |
| `merge`       | the merge procedure both `code:merge:*` tasks run           |

A repo that grows a library of its own adds a sibling here rather than a
directory — `_scripts/helpers/` would make `helpers` a path and every
`source` line wrong at once. The one repo-owned sibling a reshape writes is
`_scripts/local`, which nothing ships and nothing replaces.

#### The print vocabulary

Styling constants (`BOLD`, `NORMAL`, and the `GREEN` / `YELLOW` / `RED` /
`BLUE` colours) plus:

| Helper              | Output                                                    |
| ------------------- | --------------------------------------------------------- |
| `print_header`      | a full-width `=` rule, then the title — a major section   |
| `print_subheader`   | a full-width `-` rule, then the title — a step inside one |
| `print_success`     | a green bold line, no rule                                |
| `print_ok`          | green bold `OK`, for the end of a `print_wait` line       |
| `print_wait`        | yellow bold, no newline — an in-progress step             |
| `print_warn`        | yellow bold line                                          |
| `print_yellow`      | plain yellow line (not bold)                              |
| `print_error`       | red bold line, **to stderr**                              |
| `print_newline`     | a blank line                                              |
| `line_sep "<char>"` | a full-width rule of `<char>` (terminal width, else 80)   |

**The separators are baked into the two headers.** `line_sep` stays public
for a rule with no title after it. **A single-step task calls neither
header**: `print_wait` … `print_ok`, or one `print_success`, is its whole
vocabulary.

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

`run(cmd, args)` inherits stdio and exits the task with the command's
status, which is what `set -e` does on the bash side. **Keep the two
libraries in step.**

### The mandatory set

| Task                                   | Does                                                                                                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setup:all [--all] [--<slug>…]`        | the bootstrap orchestrator — the order below; exits 1 when `MISE_ENV` is unset; `--<slug>` sets up that one member, `--all` every member                                         |
| `setup:mise`                           | `mise install` of the pinned versions, `mise reshim`, then `mise doctor`; it moves no pin                                                                                        |
| `setup:secrets`                        | **slot** — the pinned secret manager's setup                                                                                                                                     |
| `setup:external:{start,stop,pull}`     | local services; rendered only on a repo with `external: true`, each a slot and a no-op outside a dev shell                                                                       |
| `setup:deps:all`                       | `cleanup → install → upgrade → outdated → audit`, each verb's `…:all`                                                                                                            |
| `setup:precommit [--force] [--update]` | install the hooks, chaining a hand-written one as `.legacy`; skips a foreign hook manager or `core.hooksPath` with a warning without `--force`; autoupdate only under `--update` |
| `setup:ai:all`                         | every `setup:ai` subtask — `base` checks for vwf and upgrades every plugin                                                                                                       |
| `setup:worktree`                       | the lighter sibling a fresh worktree runs                                                                                                                                        |
| `code:all [--fix] [--debug]`           | the one-command gate: `check → format → lint → sec`                                                                                                                              |
| `code:check:all [files...]`            | every whole-repo check subtask                                                                                                                                                   |
| `code:format:all [--fix] [files...]`   | every format subtask; the `format` hook calls it                                                                                                                                 |
| `code:lint:all [--fix] [files...]`     | every lint subtask; the `lint` hook calls it                                                                                                                                     |
| `code:sec [--staged] [files...]`       | secret and vulnerability scan; the `sec` hook calls it with `--staged`                                                                                                           |
| `code:precommit [--all]`               | run the hooks over what you changed, **before** you stage                                                                                                                        |
| `code:git-config [--fix]`              | require the forge identity and ssh signing ([git's](git.md))                                                                                                                     |
| `code:graph [--force]`                 | refresh the knowledge graph after a commit; exits 0 when the tool is missing                                                                                                     |
| `code:worktrees`                       | list worktrees across the repo and its members                                                                                                                                   |
| `code:merge:develop <branch>`          | merge a branch into `develop`, or open a pull request — `MERGE_MODEL_DEVELOP`                                                                                                    |
| `code:merge:main`                      | merge `develop` into `main`, or open a pull request — `MERGE_MODEL_MAIN`                                                                                                         |
| `code:count`                           | lines of tracked text, grouped by extension, plus a total                                                                                                                        |

`precommit`, `git-config`, `graph`, `merge:*` and `count` are not in
`code:all` — they are wired into the hooks or run by hand. `setup:all` calls
every other `setup:*` task except `setup:worktree`.

**What a task never does to the host.** A task never unsets, overwrites or
upgrades state it did not create; where it would have to, it stops, names
what it found and prints the one by-hand command. Every destructive step
sits behind a flag passed on purpose — `--force` (`setup:precommit` unsets a
**local** `core.hooksPath` and installs with `--overwrite`; a global or
system value is named and refused even under `--force`), `--update`
(`setup:precommit` runs `pre-commit autoupdate`, which moves the `rev:`
lines). `setup:all` passes neither. **Nothing in this set edits a remote's
settings.**

### Slots and their placeholders

A **slot** is a task whose name is part of the contract but whose mechanism
belongs to a stack nobody has pinned yet — `setup:secrets`, the
`setup:external:*` trio. It carries a `#PLACEHOLDER` marker, sources
`_scripts/placeholder`, and calls `placeholder_notice`, which prints the
reason and lists **every** task still carrying the marker. **A placeholder
always exits 0**, so an unconfigured repo runs `setup:all` end to end.

A slot stops being one by being **replaced** — a pack ships its own file at
the same path, marker gone (fnox's `setup/secrets`), or the repo writes its
own. No render overwrites a filled slot or offers it for deletion.

### `setup/*` — bootstrap and upgrade

`setup:all` is **the entrypoint** a human runs — on clone, and to re-sync a
machine afterwards. It declares `#MISE depends=["init"]` and names no tool:

```text
setup:all  (--all, or --<slug>, recurses into members)
  ├─ setup:mise            # install · reshim · doctor
  ├─ setup:secrets         # the pinned secret manager             (SLOT)
  ├─ setup:external:start  # local services, external repos only   (SLOT)
  ├─ setup:deps:all        # every package manager's five verbs
  ├─ setup:precommit       # install the hooks
  ├─ setup:ai:all          # vwf, then each pack's plugins
  ├─ setup:precommit       # again: strip what the plugin install let in
  └─ <each member>         # --all, or that member's --<slug>
```

`setup:precommit` runs twice because the published installer `setup:ai:all`
may run can put back graphify's raw hooks and its `merge=graphify` line in
`.gitattributes`; the second pass strips them.

**Keep it idempotent and non-destructive**: re-running converges, never
errors, and it passes no flag the user did not pass. It exits 1 when
`MISE_ENV` is unset, naming `MISE_ENV=dev mise run setup:all`.

`setup:precommit` skips, without `--force`, on an effective
`core.hooksPath`, a `.husky/` directory or a lefthook config: it warns,
prints what it found and the by-hand switch lines, and exits 0, so
`setup:all` completes. It also takes graphify's raw git hooks out of the
repo's own hooks directory — through `graphify hook uninstall`, and by
stripping their marked blocks when that fails — before anything else, so
unsetting `core.hooksPath` never re-arms them; graphify's merge attribute
and git-config section go too.

#### Member flags

A repo with members gets **one flag per member** on top of `--all`:
`--<slug>` sets up that one member, and the `setup-<slug>` alias is exactly
`mise run setup:all --<slug>`. Both are rendered from `MEMBER_ENTRIES`, and
the task matches a member to its flag by the same slug rule, so the two
never disagree. Each member runs its **own** task library, in a subshell
with stdin closed — `(cd <member> && mise run setup:all </dev/null)` — so
mise reads the member's own `miserc.toml`. **The member list is one
function, `members()` in `_scripts/helpers`**: `.gitmodules` when the members
are submodules, otherwise the words of `MEMBERS`.

#### `setup/deps/*` — the package manager, and only that

- **`setup/deps/*`** — the language's **package manager**: the repo's own
  packages, the ones its manifest declares.
- **`setup/external/*`** — **services** the repo talks to but does not
  contain: emulators, local queues, databases.

| Task                      | Is                                                          |
| ------------------------- | ----------------------------------------------------------- |
| `setup:deps:install:all`  | install from the lockfile; `--frozen` refuses to resolve    |
| `setup:deps:cleanup:all`  | delete the installed tree and the cache, never the lockfile |
| `setup:deps:upgrade:all`  | the one task allowed to move the lockfile forward           |
| `setup:deps:outdated:all` | report what has moved on, and exit 0 anyway                 |
| `setup:deps:audit:all`    | the manager's own advisory check over the resolved tree     |

Each verb's `…:all` calls the package-manager packs' subtasks
(`setup:deps:install:pnpm`, `setup:deps:install:uv`, …). **A package manager
with no such verb ships a subtask that says so and exits 0** — the absence is
stated by the pack that knows.

#### `setup:ai:all` — the repo's agent plugins

`setup:ai:base` makes sure the toolkit's workflow plugin is installed, then
upgrades every marketplace and every plugin the machine has; a pack that
needs a plugin of its own ships a `setup:ai:<slug>` subtask calling
`ensure_plugin` from `_scripts/plugins`. Neither ever installs at project
scope. The steps `base` runs, in order:

1. **No agent CLI, no work.** With no `claude` on `PATH` the task warns and
   exits 0.
2. **Run from the repo root**, so the CLI resolves this repo's project scope.
3. **Check for the workflow plugin.** When `vwf@virajp-plugins` is installed
   at **user** scope, or at **local** or **project** scope whose
   `projectPath` resolves to this repo's root, do nothing more for it.
   Otherwise run `pnpx @virajp.dev/claude-plugins@latest --all`, which
   installs vwf and stackgen at **user** scope — `@latest` on purpose, since
   a bare name can replay a cached old version. With no `pnpx`, or a failed
   installer, it warns naming that command and goes on.
4. **Update every marketplace** — `claude plugin marketplace update`, no
   name.
5. **Upgrade every installed plugin at its own scope**, for each row that
   counts in step 3.
6. **Prune** — `claude plugin autoremove --scope project --yes`.

No `claude` call aborts the task: each failure warns and the run goes on.
`ensure_plugin <plugin> <source>` treats a pack's plugin the same as vwf:
installed at a scope that counts, nothing; else it registers the marketplace
when absent and installs at **user** scope.

#### `setup:worktree` — the lighter sibling

Members checked out, tools installed, secrets set up,
`setup:deps:install:all --frozen`. Nothing else: a fresh worktree shares the
machine's tools and the running services. It exits 1 when `MISE_ENV` is
unset. **vwf's git-workflow probes for it by name** before falling back to
`setup:all`.

### `code/*` — the gates and the git operations

**Every gate hook runs a task, never a tool** — `format`, `lint`, `check`
and `sec` call `code:format:all --fix`, `code:lint:all --fix`,
`code:check:all` and `code:sec --staged` ([pre-commit's](pre-commit.md)). A
repo customising a gate adds or edits a subtask, never the hook.

#### The pre-commit ordering, which is the point

`code:precommit` runs the hooks over the **working tree's** changed files —
staged, unstaged and untracked, minus deletions — and is meant to run
**before you stage**:

```text
mise run code:precommit   →   git add …   →   git commit
```

The hooks rewrite files; run first, those rewrites fold into the commit.
`code:precommit --all` is the wide form, and the merge tasks use it as a
**safety net**: every hook over every file, then the tree must still be
clean, else the merge fails rather than committing the fixup.

#### The merge tasks

`code:merge:develop <branch>` names its source; `code:merge:main` names
nothing: only `develop` reaches `main`. The shared procedure is
`_scripts/merge`, the predicates `_scripts/checks`. In order: refuse a merge
**from** `main`; refuse into `main` from anywhere but `develop`; refuse a
branch merging into itself or standing on the destination; refuse when the
destination does not exist locally; then no untracked files, no uncommitted
changes, and — under `direct` — no unpushed commits; then the safety net.

| Value    | After the predicates                                                     |
| -------- | ------------------------------------------------------------------------ |
| `direct` | check out the destination, `git merge --no-ff`, `git push --follow-tags` |
| `pr`     | `git push --follow-tags -u origin <branch>`, then open a pull request    |

Under `pr` **nothing merges locally**: the request opens through `gh`, else
`glab`, else the task prints the branch and destination and stops
successfully. **A conflict leaves the tree mid-merge on purpose.** A repo
still carrying the single legacy `MERGE_MODEL` has it read in place of an
unset position, with one warning.

#### `code:graph` — the graph refresh

Run by the `graphify-refresh` hook at `post-commit` and `post-merge`: code
only, detached, a no-op in a linked worktree, mid-rebase, mid-merge,
cherry-pick or revert, or after a commit that touched only `graphify-out/`
(unless `--force`); a first commit builds it. It exits 0 when the tool is
missing, so a commit never fails on it. **One rebuild at a time**: a lock
directory in the git dir holds its holder's PID; a run finding it held
leaves a re-run marker and exits, and the holder rebuilds once more if the
marker is there when it finishes. A lock is cleared only when its holder is
dead or it is older than any rebuild runs.

#### `code:count` — a size reading

Lines of tracked text, grouped by extension, top ten plus a total — counted
by `git grep -I -c ''` in one process, so the ignore story is git's.

### `p:<id>:*` — one project's own commands

Everything that is not bootstrap and not a gate: `dev`, `build`, `test`,
`deploy`, a generator. **The `<id>` segment** is the project's registry id
where `.config/vwf.yaml` names one, else the sub-project directory name,
else the project's primary platform token (`service`, `webapp`, `site`, …).
**A gate or a bootstrap step never lives under `p:`**: if two
projects would both have it, it is a `code:*` or `setup:*` subtask.

## 4. Bootstrap and CI parity

### The trust step, which comes before all of it

mise will not read a config file it has not been told to trust, and a fresh
checkout has told it nothing. **Trust is the person's prerequisite**, in
place before the first `all` or the first command in a clone — the repo's
path in `trusted_config_paths` in the **global** mise config (mise ignores
the key anywhere else), or, in a repo that already has its config,
`mise trust --all` from the root. Bare `mise trust` trusts one file, and the
config is split across many. The script only reads trust, and `all`
re-checks it over the config it just landed before `setup:all`. **A CI
runner trusts nothing**, so a workflow calling `mise run` needs one of the
two.

### The rest

- **The pipeline runs the identical task names**, under `MISE_ENV=ci` —
  installs mise, sets the variable, `mise install`, then the task a
  developer runs. CI runs the tests; the gates run locally, in the hooks.
- **The gate tools are dev pins**, in `_base/mise.dev.toml`, so `code:all`
  runs under `MISE_ENV=dev`.
- **Per-runtime CI workarounds live in `_base/mise.ci.toml` alone.** The one
  that ships, on a node repo: `node.gpg_verify = false` — mise's bundled Node
  release-key import fails on Linux runners; the tarball is still
  checksum-verified, and `gpg_verify = true` stays everywhere else.

**This tool gates nothing and defines no build.** What each gate checks
belongs to the gate tools' references and the packs' subtasks; a language's
build commands belong to that language.

## 5. Legacy names

Names this contract replaced. `/vwf:init` reads this table to rename tasks
on an existing repo. Apply the rows top to bottom: a name a row *produces*
can be a later row's left-hand side.

The `print_*` rows are how a repo's own tasks are rewritten when a diverged
`_scripts/helpers` is replaced by this one. A function the diverged copy
defines that no row maps **moves, whole, into `_scripts/local`**, and its
calls keep their name.

| Was                                         | Is now                               | Why it moved                                                              |
| ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| `worktree:init`                             | → `setup:worktree`                   | it is a bootstrap step; `worktree:` was a group of one                    |
| `merge:develop`, `merge:main`               | → `code:merge:*`                     | a merge is something a change runs through, like the gates                |
| `setup:pnpm:*`, `setup:uv:*`, `setup:app:*` | → `setup:deps:*`                     | the task path carried the tool's name, so the contract differed per stack |
| `setup:doppler`                             | → `setup:secrets`                    | the provider is a choice, the slot is not                                 |
| `setup:deps:{start,stop,pull}`              | → `setup:external:*`                 | services a product runs against are not its package manager               |
| `setup:deps:update`                         | → `setup:deps:upgrade`               | "update" read as both install-and-refresh; the verbs are now separate     |
| `setup:deps:<verb>`                         | → `setup:deps:<verb>:all`            | each verb calls every package manager's subtask                           |
| `code:format`, `code:lint`                  | → `code:format:all`, `code:lint:all` | a gate is every pack's subtask, never one file a pack overwrites          |
| `setup:ai`                                  | → `setup:ai:all`                     | the same — `setup:ai:base` is what `setup:ai` was                         |
| `_scripts/_helpers`                         | → `_scripts/helpers`                 | `_scripts/` already says library; the second underscore says it twice     |
| `_scripts/_checks`                          | → `_scripts/checks`                  | same reason — and it is a separate library, not part of `helpers`         |
| `print_normal`                              | → `print_yellow`                     | the vocabulary has no uncoloured line; a plain yellow one is the nearest  |
| `print_normal_wait`                         | → `print_wait`                       | the `_wait` variants collapsed — an in-progress line has one colour       |
| `print_green`                               | → `print_success`                    | a task says what happened, not what colour it said it in                  |
| `print_green_wait`                          | → `print_wait`                       | same collapse; the green belonged to the `print_ok` that closes the line  |
| `print_yellow_wait`                         | → `print_wait`                       | it was already the colour `print_wait` prints, under a second name        |
| `print_red`                                 | → `print_error`                      | role-named now — and the line moves to stderr, where a failure belongs    |
| `print_red_wait`                            | → `print_wait`                       | same collapse; the failure that follows is `print_error`'s to print       |
| `print_header_wait`                         | → `print_header`                     | a header opens a section, and a section is not an in-progress step        |
| `print_subheader_wait`                      | → `print_subheader`                  | same reason — the rule and the title are the whole of a subheader         |

A repo still carrying a left-hand name is not broken, but nothing else in
the toolkit will find it: vwf probes `setup:worktree`, the aggregators call
the `…:all` tasks, and the hooks call `code:*:all`.
