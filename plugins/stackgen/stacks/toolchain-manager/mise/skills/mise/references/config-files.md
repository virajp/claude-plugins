# The mise config files

The annotated skeleton for each file in the `.config/` split. Read this before
writing or editing any of them. The rules that decide **which** file a tool,
setting or env value belongs in — and the Node gpg rule — stay in the skill
itself and are not repeated here.

All but `mise.local.toml` ship as this pack's `config/` payload, so a
materialized repo already has them; that one is never shipped and only ever
written by hand. This reference is what you author against when a repo needs
something the payload did not cover, or when you are editing one that landed.

## The files, and how one is selected

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

The top-level files hold `[settings]` and top-level keys only; every other
section is its own file in `conf.d`. As shipped: `env.toml`, `tools.toml`,
`tasks.toml`, `env.dev.toml`, `tools.dev.toml`, `shell_alias.dev.toml`. A
section with no content ships no file. `miserc.toml`'s `env_conf_d = true` is
what scopes a dotted name to its environment; it must sit in a miserc file,
since `mise.toml` is read too late. `MISE_ENV` itself is the user's shell's.

The last row is not a file to author. **One lock holds every environment's
tools**: `setup:mise` writes it with one `mise lock` under `MISE_ENV` set to
every environment suffix the config files carry, comma-joined. A
single-environment `mise lock` drops the other environments' tools. **It is
tracked**, which is the whole point: `locked = true` in `mise.ci.toml` makes the
pipeline a reader of what a laptop resolved. Only the local lock is ignored.

**A tool is pinned in one file only.** Two environments that need it share
`tools.toml`: the same tool at two versions in two environment files locks one
version, and the other environment's locked install fails.

mise loads `mise.toml` first, then deep-merges the active `MISE_ENV` variants on
top, then `mise.local.toml` and `mise.<env>.local.toml` last of all. So a
variant holds **deltas** and never a copy of the base.

- **`MISE_ENV` is a comma list and the last entry wins.** `MISE_ENV=dev,test` is
  what makes `mise.test.toml` a delta on dev rather than a fourth full config —
  it is never selected alone.
- **Developers** export `MISE_ENV=dev` in their shell. **Pipelines** set
  `MISE_ENV=ci` in the workflow env. With `MISE_ENV` **unset**, only the base
  and the undotted `conf.d` files load, and `setup:all` exits 1.
- A repo with **no CI/CD, no deploy target and no separate test environment**
  needs only the base. The others cost little and are shipped so the answer to
  "where does this go" never requires creating a file first.

## `miserc.toml` — turns on environment suffixes

```toml
env_conf_d = true
```

Nothing else. `MISE_ENV` is never set here.

## `mise.toml` — the common base

```toml
min_version = "2026.9.13"   # the release env_conf_d was tested on

[settings]
activate_aggressive  = true     # let mise shims win on PATH
all_compile          = false    # never build a tool from source
env_shell_expand     = true     # expand $VARS in [env]
gpg_verify           = true     # verify tool signatures (see the CI exception)
raw                  = true     # streams output
status.missing_tools = "always"

# Latest, with a quarantine: a fuzzy pin resolves to the newest release at least
# this old, so a version yanked hours after publication is never what a fresh
# clone installs. mise's own default is 24h.
minimum_release_age = "10h"

# Record every resolved version in a lockfile, which IS committed. One lock,
# .config/mise/mise.lock, for every environment. That is what makes "latest"
# reproducible.
lockfile = true
lockfile_platforms = ["linux-x64", "macos-arm64"]

task.run_auto_install = false              # setup:mise owns installs
task.output = "interleave"
task.timings = true                        # elapsed time after each task
task.disable_spec_from_run_scripts = true  # flags come from #USAGE, not from a run

# A MARKED POSITION — RUNTIME_BLOCK. One runtime settings line per language the
# orchestrator's stack read detected, written below this comment; shipped empty.
# A Node repo gets, for instance:
#   node.compile        = false
#   npm.package_manager = "pnpm"
# and a Python one:
#   pipx.uvx            = true
#   python.compile      = false
#   python.uv_venv_auto = "create|source"
```

## `conf.d/env.toml`, `tools.toml`, `tasks.toml` — every environment

```toml
# conf.d/env.toml
[env]
# Only what is identical in every environment.

# A marked position: the orchestrator fills it with this repo's folder name,
# slugified (the slug rule `assets/ids.md` defines) — not a project id. A
# LITERAL — never derived from the config root, whose basename is the branch
# name inside a linked worktree.
REPO_NAME = "unfilled"

# Two marked positions: how a branch lands on THIS repo, one per destination —
# code:merge:develop reads the first, code:merge:main the second.
#   direct = merge locally and push   |   pr = push and open a pull request
MERGE_MODEL_DEVELOP = "direct"
MERGE_MODEL_MAIN    = "pr"

# A marked position: this repo's member repos, as space-separated paths
# relative to the repo root. Left empty when the members are submodules, which
# `members()` reads from .gitmodules instead. A string, never an array — mise
# env values are strings.
MEMBERS = ""

# A MARKED POSITION — PATH_ENTRIES. Project-local binaries on PATH without a
# `<pm> exec` prefix, written below by the orchestrator from the same stack
# read; shipped empty, and left empty when nothing the read found needs one.
#   _.path = { path = "node_modules/.bin", tools = true }

# conf.d/tools.toml
[tools]
# Language RUNTIME only — the minimum to run/build the project anywhere. It
# arrives with the language and package-manager components, not with this one.
node = { version = "latest" }
pnpm = { version = "latest" }
# The one tool this pack ships here: the house linter the pnpm, eslint,
# flutter, swift and swiftui packs' `code:lint` calls as `linter`, at an EXACT
# version. Under mise's default npm installer, embedded aube, a first install
# is refused below a download threshold without the exemption, which covers
# this package alone; another installer the machine picks ignores it.
"npm:@askviraj/linter" = { version = "1.1.6", allow_low_downloads = true }

# conf.d/tasks.toml
[tasks.init]
# Mandatory — chmod the file-based tasks under .config/mise/tasks/ executable.
# Lives in the BASE (not dev) so tasks are runnable in every env, CI included.
description = "Initialize mise tasks"
hide        = true
run         = "find .config/mise/tasks/ -name '*' -type f -not -path '*/*.env' -exec chmod 755 {} \\;"
```

**Six marked positions, and they are the only ones in the config split.** Four
are `conf.d/env.toml` values: `REPO_NAME` is the repo's folder name,
slugified — never a project id, which is the `p:<id>:*` group's token;
`MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN` are how `code:merge:develop` and
`code:merge:main` land a branch here, one landing model per destination — a
file still carrying the single legacy `MERGE_MODEL` is read as both until the
orchestrator writes the pair; `MEMBERS` is the member list for a product whose
parts are linked as siblings rather than as submodules. Each ships with a
working default, so an unfilled repo runs — `direct` into `develop` is today's
local merge, `pr` into `main` opens the request, an empty `MEMBERS` means
`members()` falls through to `.gitmodules` — and each is filled by the
orchestrator rather than by hand. They sit in `env.toml` and not in
`env.dev.toml` because the tasks that read them run in the pipeline too.

**The other two are slots, shipped empty, and the orchestrator fills both from
its stack read** — the languages it learned from the repo's pins, its lockfile
or its manifests. `RUNTIME_BLOCK`, under `mise.toml`'s `[settings]`, takes one
runtime settings line per detected language — the Node and Python lines the
skeleton shows as examples — and nothing for a language the repo does not have:
a setting for an absent runtime is a claim about the stack that is not true.
`PATH_ENTRIES`, at the end of `conf.d/env.toml`, takes the `_.path` entries that
put a project-local binary directory on PATH, `node_modules/.bin` being the Node
case; it stays empty when nothing the read found needs one. Neither is edited by
hand to pick a runtime: a marked position is what the orchestrator's content
hash ignores, so filling one is never drift, where a hand edit outside one is.

**Two more marked positions sit outside the TOML**, in the task library rather
than the config: `EXTRA_MARKETPLACES` and `EXTRA_PLUGINS` in
`.config/mise/tasks/setup/ai`. They are arrays, one row per line, filled by the
same orchestrator, from a confirmed answer seeded by the task's own
`--inventory` run:

| Position             | Row shape                   | Is                                  |
| -------------------- | --------------------------- | ----------------------------------- |
| `EXTRA_MARKETPLACES` | `<source-ref>\|<name>`      | a marketplace beyond the toolkit's  |
| `EXTRA_PLUGINS`      | `<name>@<marketplace>`      | a plugin this repo requires         |

Both default to empty — a repo that needs only the toolkit's own plugin fills
neither — and both keep their template comment in place after filling, so a
later reshape can re-derive them.

**`minimum_release_age` and `lockfile` are one policy, not two.** The freshness
rule is *latest, but defer anything released in the last ten hours*, and the
pipeline installs from the lockfile rather than resolving at all. Together they
mean a developer moving a version forward is a deliberate act with a diff, and
CI never picks up a release nobody has run.

## `mise.dev.toml` and the `*.dev.toml` files — the developer laptop

```toml
# mise.dev.toml
[settings]
env_shell_expand     = true
status.missing_tools = "always"

# conf.d/tools.dev.toml
[tools]
actionlint = { version = "latest" }
dprint     = { version = "latest" }
gitleaks   = { version = "latest" }
grype      = { version = "latest" }
jq         = { version = "latest" }
pre-commit = { version = "latest" }
shellcheck = { version = "latest" }
shfmt      = { version = "latest" }
taplo      = { version = "latest" }

# conf.d/shell_alias.dev.toml
[shell_alias]
setup     = "mise run setup:all"
precommit = "mise run code:precommit"
worktrees = "mise run code:worktrees"
# One per member repo, named by that member's slug, when this repo has members:
# setup-backend  = "mise run setup:all --backend"
# setup-frontend = "mise run setup:all --frontend"

# conf.d/env.dev.toml
[env]
PRE_COMMIT_HOME = "$HOME/.cache/pre-commit"

# Node-only, when the runtime is Node (`_.path` is the base's PATH_ENTRIES, not
# a dev value):
# NODE_NO_WARNINGS = 1

# The DEVELOPMENT values for anything the app reads at runtime. The NAMES must
# match what env.ci.toml overrides.
# LOG_LEVEL   = "trace"
# RUNTIME_ENV = "development"
```

**`[shell_alias]` lives in `shell_alias.dev.toml` and nowhere else.** Aliases
need `mise activate`, which is a human's shell — CI never loads this file, so
nothing in the pipeline may depend on one. The three shipped aliases are the
three commands typed most; the `setup-<slug>` aliases are generated from this
repo's **member repos** — each submodule, or each path `MEMBERS` names — the
same list `setup:all`'s member flags come from, and not the project ids the
`p:<id>:*` group uses.

**No secret-manager tool here.** The pinned capability provider ships its own
`[tools]` entry in `.config/mise/conf.d/<provider>.toml`, so swapping providers
never touches this file.

## `mise.ci.toml` — CI builds & deployed runtime

```toml
[settings]
# Install exactly what the tracked lock records — one, for every environment —
# and fail rather than resolve. A CI run that silently picks up a newer version
# is a build nobody can reproduce.
locked = true

# CI runs on Linux, where mise's bundled Node release-key gpg import can fail
# ("no valid OpenPGP data found"). Disable ONLY the Node signature check — the
# tarball is still SHA256-verified. Include this only for Node projects.
# node.gpg_verify = false

# conf.d/tools.ci.toml — not shipped. Usually absent: CI reuses tools.toml. Add
# one only if the pipeline genuinely needs a tool and dev does not.
[tools]

# conf.d/env.ci.toml — not shipped.
[env]
# CI-only and PRODUCTION values for the keys env.dev.toml names locally.
# NEVER a secret: tokens are injected by the CI provider or resolved by the
# pinned secret manager at run time. A value committed here is in the history.
```

## `mise.test.toml` — the test run

```toml
# conf.d/env.test.toml — not shipped; mise.test.toml ships comments only.
[env]
# Deltas only. Layered on dev with MISE_ENV=dev,test, so everything a test needs
# that a dev shell already has must NOT be repeated here — only the keys whose
# value flips a runtime into its test mode.
# RUNTIME_ENV = "test"
```

## `mise.local.toml` — the machine, and nothing shipped

Never written by a pack, never committed, always gitignored — along with
`mise.<env>.local.toml`, the per-environment form. It is where a machine-specific
path, a personal project handle for the secret manager, or a locally built
runtime goes: anything true of one laptop and no other.

Its existence is documented in `mise.toml`'s banner rather than by a file,
because a shipped `mise.local.toml` would be committed by the first person who
ran `git add -A`.

## `conf.d/` — the tier a provider contributes to too

mise auto-loads `.config/mise/conf.d/*.toml`. Beside the section files, that is
where a **capability provider** puts its own `[tools]` pin and its `[env]`
defaults — `.config/mise/conf.d/<provider>.toml`, one file, owned end to end by
the pack that wrote it.

The point is removal as much as addition: swapping one secret manager for
another deletes one file and adds one, and no section file changes. A provider
that edited the base instead would leave its keys behind on every uninstall.
