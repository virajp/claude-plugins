---
name: tool-config
description: Render a repo's universal tool configs — mise, dprint, taplo,
  pre-commit, gitleaks, grype, the house linter, git, graphify, the editor
  settings and the statusline config — from two shipped trees, assets copied
  as they are and templates rendered from .config/stackgen.yaml, plus each
  pack's own templates and subtasks. A shipped node script does it in four
  calls (all, pack, pack-remove, upgrade), shows every change as a numbered
  row, writes on the answers, then formats and validates what it wrote. Use
  it to land or refresh every universal file in a repo (all, with the repo's
  values as flags, ending in a set-up repo), to render a pack's templates and
  values (pack), to take a dropped pack's files out (pack-remove), to move
  the exact pins CI loads forward (upgrade), or to judge whether a repo has
  drifted from a fresh render. Invoked by /vwf:init, by the stackgen
  materializer for a pack's templates, and by /vwf:setup for a pack's values.
argument-hint: "[preview] all [--repo-name <n>] [--merge-model-develop direct|pr] [--merge-model-main direct|pr] [--members <a,b>] [--scopes <a,b>] [--node true|false] [--external true|false] [--forge <f>] [--secrets <s>] [--answers <id>:<answer>,…] | [preview] pack --slug <s> --dir <pack dir> [--set <key>=<value>]… [--answers …] | [preview] pack-remove --slug <s> [--answers …] | [preview] upgrade [--answers …]"
disable-model-invocation: false
user-invocable: true
---

# tool-config

One skill owns the configuration of the tools every repo runs, whatever its
stack. It renders them from two trees it ships and from `.config/stackgen.yaml`
— the repo's values, which the script alone writes — so every repo shaped by
stackgen carries the same files, and a repo differs from another only in its
values, its packs and its own lines.

## What it lands

| Tree                  | Is                                                              | Lands as                                     |
| --------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| `assets/`             | static files, laid out exactly as they land under the repo root | copied as they are, mode kept                |
| `templates/`          | files holding `@@` names                                        | rendered from the values, then written       |
| a pack's `templates/` | that pack's mise folder and any file needing a value            | rendered by [`pack`](#the-four-calls)        |
| a pack's `config/`    | that pack's static payload, its subtasks among it               | copied by the materializer, never this skill |

Between them, every repo gets:

- **mise** — `.config/miserc.toml` and a settings-only `.config/mise.toml`,
  the `_base/` and `ai/` folders under `.config/mise/conf.d/`, and the task
  library under `.config/mise/tasks/`, its `…:all` tasks rendered to call
  every subtask beside them — [references/mise.md](references/mise.md);
- **the gates** — dprint's config and the root shim, taplo's, the hook
  runner's, gitleaks', grype's and the house linter's —
  [dprint](references/dprint.md), [pre-commit](references/pre-commit.md),
  [gitleaks](references/gitleaks.md), [grype](references/grype.md);
- **git** — the curated `.gitignore`, `.gitattributes` and the commit
  convention — [references/git.md](references/git.md);
- **graphify** — `.graphifyignore` —
  [references/graphify.md](references/graphify.md);
- **two single files** — `.vscode/settings.json`, an asset shared by every
  repo, and `.config/claude-status.json`, a template naming the project.

Each list a pack once appended to — the ignore set, the exclusion set, the
formatter's plugins, the attributes — is shipped as a **universal superset**:
every stack's entries, whether or not this repo uses that stack. A pack adds
no line to a universal file. The references say what each file holds and
why; the script is what writes it.

## The values file

`.config/stackgen.yaml` holds every value a template reads, and **the script
is its only writer**: `all` writes the values its flags carry, `pack` writes a
pack's `--set` values, `pack-remove` drops them. Nothing else edits it — a
value is changed by re-running the call that sets it. Lists are written as
block lists, one item a line.

| Key                            | Written by                                                | Template name(s)                                                   |
| ------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------ |
| `repo_name`                    | `all --repo-name`                                         | `REPO_NAME`                                                        |
| `merge_model.develop`, `.main` | `all --merge-model-develop`, `--merge-model-main`         | `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN` — default `direct`, `pr` |
| `members`                      | `all --members`                                           | `MEMBERS`, `MEMBERS_SPACED`, `MEMBER_ENTRIES`                      |
| `scopes`                       | `all --scopes`                                            | `SCOPES`                                                           |
| `node`, `external`             | `all --node`, `--external`                                | `NODE`, `EXTERNAL` — default false                                 |
| `forge`, `secrets`             | `all --forge`, `--secrets`                                | `FORGE`, `SECRETS`                                                 |
| `packs.<slug>.<key>`           | `pack --slug <slug> --dir <pack dir> --set <key>=<value>` | `<KEY>`, seen by that pack's templates alone                       |

Some names are never stored. `REPO_URL` and `PROJECT_NAME` come from the
repo's `origin` on every render, so they cannot go stale when the remote
moves; with no `origin`, `PROJECT_NAME` is `REPO_NAME` and `REPO_URL` is
unset. `MEMBER_ENTRIES` is each member's path and slug — its folder name,
lowercased, every other run of characters a `-`. `CHECK_SUBTASKS`,
`LINT_SUBTASKS`, `FORMAT_SUBTASKS`, `AI_SUBTASKS` and
`DEPS_<VERB>_SUBTASKS` list the executable task files under each subtask
folder, `all` and `_`- or `.`-named files left out. `TASKS` is every task the
rendered tree defines, with its description, for the repo-local mise skill's
table.

A key left out of a call keeps what the file holds, so a caller re-passing
one changed value passes only that one. `--scopes` and `--members` replace
the stored list whole: pass every entry, a retired scope included. A pack's
key must not name a global name (`REPO_NAME`, `NODE`, …): the render refuses
it.

## Templates

A template is a file whose `@@` tags the script fills: `@@NAME@@` substitutes
a value, `@@#if NAME@@ … @@#else@@ … @@/if@@` and
`@@#each NAME@@ … @@/each@@` are blocks, and `@@.@@` or `@@.key@@` reads the
innermost `#each` item. The delimiters pass mise's Tera `{{ … }}` and bash's
`${…}` through untouched. The engine is strict — an unknown name, a stray
`@@`, an unbalanced block or a value holding a line break is refused, naming
the template and the line; its rules are `scripts/lib/template.mjs`. **A
template that renders empty is not written**, and a copy already in the repo
becomes a delete row: `setup/external/*` render only under `EXTERNAL`.

## Running the script

```sh
MISE_ENV=dev mise x -- node "${CLAUDE_PLUGIN_ROOT}/skills/tool-config/scripts/tool-config.mjs" <arguments>
```

`node` is the repo's own pin — in `conf.d/_base/mise.toml` on a node repo,
in `_base/mise.dev.toml` on any other — so run the script under
`MISE_ENV=dev`, as a developer's shell exports it: node, the formatter and
the hook runner are all pinned there, and without it `mise x` finds none of
them. Only the very first `all` on a repo with no mise config has no pin to
run on; there `mise x -- node` falls through to the `node` on `PATH`. Never
name a version on the `mise x` line, which can install one the config does
not pin. The script needs no package; `all` and `upgrade` need `mise` on
`PATH` and refuse without it, naming the install.

**Two prerequisites are the person's, never the script's.** The repo's mise
config is **trusted** beforehand — its path in `trusted_config_paths` in the
global mise config, or `mise trust --all` in the repo. The script reads that
trust and never grants it: any call, a `preview` included, on a repo mise
reads as untrusted is refused (exit 2) naming the remedy. And **every tool
runs only as `mise x -- <tool>`**, once `mise which <tool>` says it is
installed; a tool the call needs and the repo has not installed refuses the
call before the first byte is written, naming
`MISE_ENV=dev mise run setup:all`. `all` runs that itself.

It runs against the repo the working directory sits in
(`git rev-parse --show-toplevel`), or the one `--repo-root <dir>` names, and
never outside it: a path that is absolute or climbs with `..`, a symlink at
or above a path inside the repo, or a path resolving outside the root
refuses the call. A caller — `/vwf:init`, `/vwf:setup`, the materializer, a
person — invokes this skill with the script's own arguments, and the skill
runs them as given.

### What a written call runs

A call that writes, in this order:

1. **writes** every file its answered rows reach; a write that fails midway
   puts every file back;
2. on **`all`** only, re-checks trust over the config it just landed, then
   runs **`MISE_ENV=dev mise run setup:all`** — every pinned tool installed
   and the repo set up, so `all` ends in a repo a person can work in;
3. runs the **shipped formatter** —
   `mise x -- dprint fmt --config .config/dprint.json --allow-no-files <files>`,
   whenever the repo has `.config/dprint.json` — over every file it wrote, and
   on `all` over every file it rendered, so a run stopped before this step is
   finished by the next;
4. runs **`mise x -- pre-commit validate-config`** when the hook config is
   among them.

So **how a rendered line is folded is the shipped formatter's call**: a
render is compared with the repo's file as the formatter would leave it, and
a difference in layout alone is never a row. A formatter or validate failure
puts every file back byte for byte (exit 2). An untrusted config or a
`setup:all` failure on `all` leaves the files written (exit 2, carrying
`written` and `deleted`): fix what it names, then re-run the same `all`.

**The output is JSON on stdout, always**, and the exit code says which shape:

| Exit | Shape                                | Means                                                                                                                       |
| ---- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 0    | `{preview: true, rows, notes?}`      | a `preview`: the rows the call would show; nothing written                                                                  |
| 0    | `{written, deleted, notes?, setup?}` | the call wrote                                                                                                              |
| 2    | `{error, rows?, written?, deleted?}` | refused — the message names why, and the rows when it has some; nothing written, save `all` stopped at trust or `setup:all` |
| 1    | `{error}`, a stack on stderr         | an internal fault — report it whole; never work around it by hand                                                           |

`notes` are things said, not asked: a file with no marker pair whose row
replaces it whole, a pin `upgrade` could not resolve, answers given to a call
with nothing left to answer. `setup` comes back on a successful `all` alone:
the tail of `setup:all`'s output, colour codes stripped. **Relay it to the
person** — a passing `setup:all` can still warn, and it is how a foreign hook
manager the repo kept reaches them.

## The four calls

```text
[preview] all [--repo-name <n>] [--merge-model-develop direct|pr] [--merge-model-main direct|pr]
              [--members <a,b>] [--scopes <a,b>] [--node true|false] [--external true|false]
              [--forge <f>] [--secrets <s>] [--answers <id>:<answer>,…]
[preview] pack --slug <s> --dir <pack dir> [--set <key>=<value>]… [--answers …]
[preview] pack-remove --slug <s> [--answers …]
[preview] upgrade [--answers …]
```

plus `--repo-root` and `--plugin-root`, anywhere. `--key value` and
`--key=value` both read; a bool flag given bare reads `true`. **A list is
comma-separated, no spaces** — `--members backend,frontend` — and this is
the one place that spelling is stated. A value lands inside a quoted string, so
each is held to a character set that cannot break the quoting; a flag given
twice, or one the call does not take, is refused naming the valid ones.

- **`all`** writes the values its flags carry into `.config/stackgen.yaml`,
  then copies every asset and renders every template — the `_base/` and
  `ai/` folders and the `…:all` tasks among them — then runs
  [what a written call runs](#what-a-written-call-runs). It needs a
  `repo_name`: given, or already in the file. **`all` is idempotent**: a
  second run with the same arguments over an unchanged repo shows no row.
- **`pack`** writes the pack's `--set` values under `packs.<slug>` — the key
  lowercase, letters, digits and `_`; the value free of quotes, backslashes,
  `@@` and control characters — renders the pack's `templates/` into the
  same relative paths, then re-renders the `…:all` tasks and the mise
  skill's task table, so a subtask the pack's payload added is called.
  ([Packs](#packs) says where a pack may render.)
- **`pack-remove`** deletes `conf.d/<slug>/` and every subtask file named
  `<slug>`, drops `packs.<slug>`, and re-renders the `…:all` tasks. It never
  deletes a path this skill ships itself.
- **`upgrade`** moves each exact pin a CI-loaded mise file holds forward,
  one row per pin `mise latest` has moved past ([Pins](#pins)).

A slug is lowercase letters, digits and `-`; `all`, `ai` and `_base` are
reserved — each names a folder or a task this skill renders itself.

**`preview`** builds the rows the same call would show and returns them,
writing nothing. It is how a caller that gathers one consent for a whole
plan — `/vwf:init`'s plan, the materializer's dry-run — shows this skill's
rows inside it.

## Rows and answers

**Every call shows before it writes.** No file is recorded anywhere: each
call compares a fresh render with the repo as it stands, and every file that
would change is one row.

| Row      | Is                                                                                          | Answers               |
| -------- | ------------------------------------------------------------------------------------------- | --------------------- |
| `create` | a file the repo does not have                                                               | `ok`                  |
| `write`  | a file that differs from the render, `added` and `removed` lines shown, a mode change named | `ok`, `keep-existing` |
| `delete` | a file a render no longer produces, or a pack's file on `pack-remove`                       | `ok`, `keep-existing` |
| `pin`    | an exact pin `upgrade` would move, `from` and `to`                                          | `ok`, `keep-existing` |

`ok` takes the render; `keep-existing` leaves the file — or the pin — as it
stands, for this run: nothing records it, so the next run that finds the
same difference shows the row again. The row for `.config/stackgen.yaml`
itself takes `ok` alone — answering the call is answering its values.

**The script refuses a call that would show rows and carries no
`--answers`** — exit 2, the rows returned — and that refusal stands in for
the preview, so the same call can be answered next. The answering call
carries `--answers <id>:<answer>,<id>:<answer>`, no spaces, and is rebuilt
and must match: exactly the ids the rebuilt rows carry, each with one of its
answers, and no row changed since the preview — kept in the repo's git
directory, never in the tree. Anything else refuses the **whole call**, the
rows shown again. So does an answer set that splits a task from what runs
it: keeping a file that still runs a task the call deletes, or taking a new
`…:all` that stops running a task the answers keep. **A call that carries
matching answers asks nothing.**

**A filled slot is never offered.** A shipped task carrying `#PLACEHOLDER`
is a slot; once a pack or the repo has replaced it with a file that does not,
no render overwrites it or offers it for deletion.

## The marked files

Six files carry a marker pair, and only the lines between the markers are
rendered:

| File                             | The marked list                   |
| -------------------------------- | --------------------------------- |
| `.gitignore`                     | the ignore set                    |
| `.graphifyignore`                | what the graph never ingests      |
| `.config/dprint.json`            | `excludes` (`//` markers — JSONC) |
| `.config/linter.yaml`            | `ignores`                         |
| `.config/gitleaks.toml`          | the path allowlist                |
| `.config/pre-commit-config.yaml` | the global `exclude`              |

```text
# >>> tool-config
…the rendered lines…
# <<< tool-config
```

**Every line outside the pair is the repo's own** and survives every render
byte for byte — the place a repo adds an exclude, an ignore or an allowlist
entry of its own. A file the repo already has with no single marker pair is
one `write` row replacing it whole, said in `notes`. **Every other file is
owned whole**: a hand edit to it is a `write` row on the next run, and a repo
keeping its own lines there answers `keep-existing` each time — and so takes
no later release of that file until it answers `ok`. A repo's own pins,
values and tasks belong in a `conf.d/` folder and task files of its own,
which no render touches.

## Pins

A dev-only mise file (`mise.dev.toml`) keeps `version = "latest"`: a laptop
takes what is current, under `minimum_release_age`. **A mise file CI loads**
— `.config/mise.toml`, or a `conf.d/<folder>/mise{,.ci,.test}.toml` — is
written with every `latest` resolved to an exact version by
`mise latest <tool>` at render, save `node` and `pnpm`, which stay `latest`.
A pin the repo's file already holds exactly is kept, which is what makes a
second `all` show no row; only **`upgrade`** moves it — one `pin` row per
tool whose latest has moved on. A render whose `mise latest` gives no exact
version is refused; on `upgrade` that one pin is left where it is and named
in `notes`. The why, and where a tool goes, is
[mise's](references/mise.md#2-pins).

## Packs

A pack reaches the universal files two ways, and neither is a list of
requests:

- **Subtasks**, in its `config/` payload, copied by the materializer:
  `.config/mise/tasks/{code/check,code/format,code/lint,setup/ai}/<slug>` and
  `setup/deps/<verb>/<slug>`, the leaf always the pack's slug. Each runs its
  own tool's steps alone; the `…:all` tasks this skill renders call it
  ([mise's subtasks](references/mise.md#subtasks)). A pack never ships a
  file at a path this skill ships, save one replacing a `#PLACEHOLDER` slot
  — fnox's `setup/secrets`.
- **Templates**, in its `templates/` folder, rendered by `pack`: its mise
  files in `.config/mise/conf.d/<slug>/` and nowhere else in `conf.d/`, plus
  any file that needs a value. `pack` refuses a template naming
  `.config/stackgen.yaml`, anything under `.git/`, a path this skill ships,
  another folder in `conf.d/`, or an `…/all` task. A pack's own values —
  swiftui's `XCODE_VERSION` — are `@@` names its templates read, stored
  under `packs.<slug>` and given with `--set`; a render missing one refuses,
  naming the `--set` it needs.

So a pack's `pack.yaml` asks this skill for nothing, and removing a pack is
`pack-remove`, never a hand edit of a universal file.

## Drift

**There is no drift test in the script; drift is yours to judge.** A repo
has drifted when its files differ from what `preview all` (and `preview pack`
for each pack it carries) would render now. Run the preview and read the
rows: none means the repo is as stackgen would shape it; each row is one
file that differs — a hand edit, a newer release, a value changed. Relay
them; the person settles each by answering the real call, `ok` to take the
render or `keep-existing` to keep theirs. Lines outside a marker pair are
never drift, and neither is a filled slot.

## What it never does

- Writes `.config/stackgen.yaml` any way but through a call's own values, or
  a line outside a marker pair.
- Writes a file the person has not answered, or takes `keep-existing` as
  standing beyond the run.
- Writes a CI-loaded pin that is not exact (save node and pnpm), or adds a
  tool with a bare `mise use` — never; the pin is written into the config,
  then installed.
- Runs a tool any way but `mise x -- <tool>`, or grants mise trust — the
  trust is the person's, given before the call.
- Commits. The caller commits what it landed, the way it commits everything
  else.
