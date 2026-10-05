# dprint — the format authority

**One formatter for the whole repository, configured once.** dprint owns
whitespace and layout across every language in the repo; the linter owns
correctness. A second formatter is not a preference, it is a fight: two tools
with different opinions rewrite each other's output on alternate commits. And
a formatting rule in the linter, or a correctness rule here, costs more than it
saves — a rule a formatter can satisfy should never be able to fail a lint run.

This reference is dprint's part of the universal files tool-config lands. What
every file shares — the values, the render, the rows, the six marked files and
drift — is [the skill's](../SKILL.md); what follows is why dprint's files say
what they say, for a person reading the result or editing the repo's own lines.

| Section                                                    | Read before                                       |
| ---------------------------------------------------------- | ------------------------------------------------- |
| [1. What lands](#1-what-lands)                             | reading `.config/dprint.json` or `taplo.toml`     |
| [2. The plugins](#2-the-plugins)                           | widening what is formatted                        |
| [3. The exclusion set](#3-the-exclusion-set)               | narrowing what is formatted                       |
| [4. Running it](#4-running-it)                             | formatting by hand, or reading `code:format:all`  |
| [5. Two routes to one config](#5-two-routes-to-one-config) | touching the root shim or a call site             |

## 1. What lands

All three are assets, copied as they are by
[`all`](../SKILL.md#the-four-calls):

| File                          | Owned                                                        |
| ----------------------------- | ------------------------------------------------------------ |
| `.config/dprint.json`         | marked — only the `excludes` block is rewritten once present |
| `.config/taplo.toml`          | whole                                                        |
| `dprint.json` (the root shim) | whole                                                        |

**`.config/dprint.json` is JSONC.** Its `excludes` list holds the
[marker pair](../SKILL.md#the-marked-files) as `//` comment lines —
`// >>> tool-config` and `// <<< tool-config` — and every entry ends in a
trailing comma, so a repo's own exclude below the closing marker never needs
the shipped last line edited. The file names itself in
`json.jsonTrailingCommaFiles`, so dprint keeps those commas, and the hook
runner's `check-json` excludes it
([pre-commit's](pre-commit.md#1-what-lands)). Every line outside the marker
pair — plugins, their config keys, a repo's own excludes — is the repo's once
the file exists, and survives every render.

**`.config/taplo.toml`** decides TOML layout and is reached only through the
`exec` plugin, so the two land together or the TOML half formats with taplo's
defaults. It carries no marker: a render that differs from it is one row,
`ok` or `keep-existing` ([rows](../SKILL.md#rows-and-answers)). Its `exclude`
array is the second spelling of [the exclusion set](#3-the-exclusion-set).

## 2. The plugins

**The pinned plugin list is the include set.** Each plugin declares the
extensions it claims, so what is formatted follows from what is installed.
Widening coverage is adding a plugin; narrowing it is
[an exclude](#3-the-exclusion-set).

**Every plugin ships, whatever the stack.** The asset carries `markdown`,
`pretty_yaml`, `json` and `exec`, and every plugin a stack once asked for —
`typescript`, `malva` (stylesheets, Astro, HTML), `markup_fmt` (Astro, HTML)
and `dockerfile` — each with its config key. A plugin whose extensions the
repo does not hold formats nothing and costs one download; a pack never adds
one.

**Plugins are pinned by version in the URL.** A floating reference formats
differently on a machine that resolved it later, and the diff lands on whoever
commits next. A person moves them by hand, in dev, with
`mise x -- dprint config update --config .config/dprint.json`. Plugins sit
outside the marker pair, so a moved version is the repo's and no render undoes
it.

`exec`'s checksum is what lets dprint run a process plugin without a prompt.
`exec` is the escape hatch for a language dprint has no plugin for — it pipes
the file through that language's own formatter (`taplo fmt --config .config/taplo.toml -`
for `.toml`), keeping one entry point. Use it before ever adding a second
formatter to the hook chain.

## 3. The exclusion set

**Every generated tree is excluded.** A formatted generated file is a diff
nobody authored and a check nobody can pass without regenerating. The set is
universal — every stack's trees, whether or not the repo uses that stack:

| Entry                                       | Why                                                   |
| ------------------------------------------- | ----------------------------------------------------- |
| `.claude`                                   | the agent tooling tree — machine-owned; see below     |
| `.git`                                      | git's own                                             |
| `build`, `dist`                             | the generic output trees                              |
| `graphify-out`                              | the graph tool's output                               |
| `*.lock`, `*-lock.json`, `*-lock.yaml`      | every tool's lockfile                                 |
| `node_modules`, `.turbo`                    | Node's install tree and build cache                   |
| `.venv`                                     | Python's environment                                  |
| `.build`, `.swiftpm`, `Derived`, `DerivedData` | SwiftPM and Xcode output                           |
| `*.xcassets/`                               | Xcode rewrites every `Contents.json` inside one       |

A tree a repo does not produce matches nothing and costs nothing.

**One set, four spellings.** The same entries are `.config/dprint.json`'s
`excludes`, `.config/taplo.toml`'s `exclude`, the hook config's global
`exclude` ([pre-commit's](pre-commit.md#3-the-global-exclude)) and — the
generated trees alone — gitleaks' allowlist
([gitleaks'](gitleaks.md#2-the-allowlist)). The toolkit's checker holds the
three formatter lists equal and the allowlist a subset of them, on the shipped
files. The house linter's `ignores:` is a fifth list, generated trees only,
and is not compared ([pre-commit's](pre-commit.md#the-linter-config)).

**dprint's spelling is a pair.** dprint resolves a config's patterns from the
config's own folder, `.config/`, so `includes: ["../**"]` reaches the repo
root, and each entry is written twice: `**/<d>/` and `../**/<d>/` for a
directory, `**/<g>` and `../**/<g>` for a file glob. Drop either half and some
call form formats the tree again. taplo's is `**/<d>/**` for a directory and
`**/<g>` for a file glob.

**A repo's own exclude** goes below the closing marker in `excludes`, and in
the other lists' own places — taplo's file is owned whole, so a repo that
keeps its own taplo exclude answers `keep-existing` on that file's row. Keep
the lists equal by hand when you do.

**Templated markdown is the exclusion that surprises people.** A formatter
re-wraps prose to a width measured on the template text, but an expression is
far wider than what it renders to, so the output lands mis-wrapped. Exclude a
template source, and any file whose committed form is derived. And an
exclusion added for a reason that later expires does not announce itself:
when a template layer retires, revisit its exclusions deliberately.

### `.claude` stays excluded — never tidy it away

`skills/`, `agents/`, `hooks/` and `rules/` are materialized there by stackgen;
`.claude/stackgen/` carries the lockfile and the payloads it regenerates;
`.claude/settings.json` is rewritten by the agent itself. Every file there has
an author that rewrites it, and none of them formats. Left in scope, it is the
first thing a fresh repo hits: the formatter reflows materialized doctrine, and
the first `pre-commit run --all-files` fails over files the repo's author never
wrote. **The whole tree, not just its markdown**: a hand-written and a
materialized `SKILL.md` are the same filename in the same directory, so no glob
can format one and spare the other. The price — a hand-written file there goes
unformatted — is the cheaper side of the trade.

## 4. Running it

`code:format:all` runs every `code:format` subtask; the universal one,
`code:format:dprint`, checks, and `--fix` rewrites, passing
`--config .config/dprint.json` with `--allow-no-files`. `check` is what CI
runs; `fmt` is what the hook and a person run. Never hand-fix whitespace to
satisfy `check` — a hand fix that differs from what `fmt` produces fails again
next run.

**The script runs it too**, on every file a call writes, as
`mise x -- dprint fmt --config .config/dprint.json --allow-no-files <files>`
([what a written call runs](../SKILL.md#what-a-written-call-runs)) — so where
a landed line folds is this formatter's decision, never the script's and
never yours, and a repo `all` lands passes its own `check`.

## 5. Two routes to one config

dprint discovers `dprint.json` and `dprint.jsonc` by walking up from the file
it formats, and does **not** look inside `.config/`. The config lives there
anyway, and its two consumers reach it differently:

- **Every command-line call carries `--config .config/dprint.json`** — the
  format task, the hook, CI, the script. A call without it, in a tree with no
  root shim, formats with built-in defaults and reports success: the worst
  failure available, because it looks like a pass.
- **The editor has only discovery.** The VS Code extension names no config
  file, so a root `dprint.json` whose whole content is
  `{ "extends": ".config/dprint.json" }` is what format-on-save finds.

**The shim is a file, never a symlink**, and nothing is ever added to it — a
second key there is a formatting opinion where nobody looks.

**A bare call through the shim fails today.** dprint refuses `includes` in an
extended config, and `.config/dprint.json` carries `includes: ["../**"]`, so
`dprint check` with no `--config` exits with a config error. Every gate names
`--config` and passes; only the editor's discovery route is affected.

**A member repo takes its own copy**, kept identical on purpose: its checkout
may not contain the parent's `.config/`. The skill runs in each member repo on
its own; two files can drift, and a diff shows it — the cost of the
alternative is a gate silently formatting with defaults.
