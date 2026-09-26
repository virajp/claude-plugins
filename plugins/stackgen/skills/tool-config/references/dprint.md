# dprint — the format authority

**One formatter for the whole repository, configured once.** dprint owns
whitespace and layout across every language in the repo; the linter owns
correctness. A second formatter is not a preference, it is a fight: two tools
with different opinions rewrite each other's output on alternate commits. And
a formatting rule in the linter, or a correctness rule here, costs more than it
saves — a rule a formatter can satisfy should never be able to fail a lint run.

This reference is the `dprint` row of the skill's tool table. The contract every
tool shares — the argument shapes, the block markers, drift, removal and the
lock record — is [the skill's](../SKILL.md); what follows is dprint's own. The
files it lands are under
`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/dprint/`, laid out as they land
under the repo root.

| Section                                                    | Read before                                        |
| ---------------------------------------------------------- | -------------------------------------------------- |
| [1. What `all` lands](#1-what-all-lands)                   | running `all`, or reading what it landed           |
| [2. The plugins](#2-the-plugins)                           | `dprint add plugin`, or widening what is formatted |
| [3. The exclusion set](#3-the-exclusion-set)                 | `all add exclude`, or narrowing what is formatted  |
| [4. The verbs](#4-the-verbs)                               | any instruction naming `dprint`                    |
| [5. Two routes to one config](#5-two-routes-to-one-config) | touching the root shim or a call site              |
| [6. The migration](#6-the-migration)                       | running `all` on a repo the old gate pack shaped   |

## 1. What `all` lands

| Landed                              | As                                                           |
| ----------------------------------- | ------------------------------------------------------------ |
| `.config/dprint.json`               | plain JSON, no markers — the `dprint` base, keys in the lock  |
| `.config/taplo.toml`                | the frame, the settings unmarked, a `dprint` block in `exclude` |
| `dprint.json` (the root shim)       | one file, whole, the base's alone                             |
| `.config/vscode.d/dprint-editor.jsonc` | the `dprint` base block — only when `editor=vscode`          |

**`.config/dprint.json` carries no marker.** It is strict JSON: the hook
runner's `check-json` rejects a `//` line, and dprint rejects an unknown
property. So, as [the skill](../SKILL.md#blocks) says for any plain-JSON file,
the lock entry's `keys:` records what each requester wrote — a whole key
(`typescript`) or one entry of a list (`plugins[typescript]`,
`excludes[node_modules]`) — and the `dprint` base is every key no requester
and no user holds.

**`.config/taplo.toml`** decides TOML layout and is reached only through the
`exec` plugin, so the two land together or the TOML half formats with taplo's
defaults. Its `exclude` array is the second spelling of
[the exclusion set](#3-the-exclusion-set): the base's entries are the
`dprint` block inside that array, and a requester's block follows it there.
Everything else below the frame is the base's, unmarked
([the skill's](../SKILL.md#blocks) per-position rule).

**The editor fragment is conditional.** The asset carries no markers; the
skill lands its content as the `dprint` base block, as
[the skill](../SKILL.md#blocks) says for every editor fragment. It lands only
where `editor=vscode`;
on any other answer it is listed under **Skipped**, and a later run whose
answer turned to `vscode` lands it. It binds `editor.defaultFormatter` **per
language, never editor-wide** — `[markdown]`, `[yaml]`, `[json]`, `[jsonc]` in
the base, and `[toml]` to even-better-toml — because an editor-wide binding
asks dprint to format a file it has no plugin for, and overrides the formatter
another pack binds for its own language depending on composition order alone.
Each [plugin](#2-the-plugins) a requester adds brings its own language scopes
in that requester's block. The even-better-toml `formatter.*` keys equal
`.config/taplo.toml`'s: the extension reads them before the config file
resolves, so a value that differs formats the first save differently from the
gate.

**That filename breaks the `<tool>.jsonc` fragment rule, and it is forced.**
dprint discovers a `dprint.jsonc` anywhere below the root as a sub-directory
config, so a fragment named `dprint.jsonc` is read as a second config with no
plugins, and every bare invocation exits 13, "No formatting plugins found".

`forge`, `secrets`, `update_bot` and `scopes` are read by no dprint file;
`editor` is its one key, default `none`.

## 2. The plugins

**The pinned plugin list is the include set.** Each plugin declares the
extensions it claims, so what is formatted follows from what was installed —
there is no `includes` key, and there must never be one
([section 5](#no-includes-key-and-that-is-what-makes-the-shim-work)). Widening
coverage is adding a plugin; narrowing it is
[an exclude](#3-the-exclusion-set). There is no third place to look.

**Plugins are pinned by version in the URL.** A floating reference formats
differently on a machine that resolved it later, and the diff lands on whoever
commits next. The URL below is what a first write uses; after that the version
in the file is the file's — `dprint config update`, run by
`setup:mise --upgrade` in dev on a terminal and at no other time, moves it —
so a version differing from this table is never drift. Drift compares the
plugin, not its version.

| Plugin        | URL written first                                                 | Config key   | Editor scopes                                                 | Held by                            |
| ------------- | ----------------------------------------------------------------- | ------------ | ------------------------------------------------------------- | ---------------------------------- |
| `markdown`    | `https://plugins.dprint.dev/markdown-0.22.1.wasm`                 | `markdown`   | `[markdown]`                                                  | the base                           |
| `pretty_yaml` | `https://plugins.dprint.dev/g-plane/pretty_yaml-v0.6.0.wasm`      | `yaml`       | `[yaml]`                                                      | the base                           |
| `json`        | `https://plugins.dprint.dev/json-0.21.3.wasm`                     | `json`       | `[json]`, `[jsonc]`                                           | the base                           |
| `exec`        | `https://plugins.dprint.dev/exec-0.6.2.json@<checksum>`           | `exec`       | `[toml]`, bound to even-better-toml                           | the base                           |
| `typescript`  | `https://plugins.dprint.dev/typescript-0.96.1.wasm`               | `typescript` | `[javascript]`, `[javascriptreact]`, `[typescript]`, `[typescriptreact]` | `language/typescript`   |
| `malva`       | `https://plugins.dprint.dev/g-plane/malva-v0.16.0.wasm`           | `malva`      | `[css]`, `[scss]`, `[less]`                                   | the stylesheet packs, astro, html  |
| `markup_fmt`  | `https://plugins.dprint.dev/g-plane/markup_fmt-v0.27.3.wasm`      | `markup`     | `[html]`, `[vue]`, `[svelte]`, `[astro]`                      | astro, html                        |
| `dockerfile`  | `https://plugins.dprint.dev/dockerfile-0.4.0.wasm`                | `dockerfile` | `[dockerfile]`                                                | container-image, containers, cloud-run |

`exec`'s checksum is the one the asset carries; it is what lets dprint run a
process plugin without a prompt. `exec` is the escape hatch for a language
dprint has no plugin for — it pipes the file through that language's own
formatter (`taplo fmt --config .config/taplo.toml -` for `.toml`), keeping one
entry point where dprint itself cannot format. Use it before ever adding a
second formatter to the hook chain.

**The config a plugin brings** is written under its config key, in the
requester's keys, beside the URL:

| Key          | Value                                                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript` | `indentWidth` 2, `lineWidth` 80, `newLineKind` `lf`, `quoteProps` `asNeeded`, `quoteStyle` `alwaysDouble`, `semiColons` `always`, `trailingCommas` `onlyMultiLine`, `useTabs` false |
| `malva`      | `formatComments` true, `ignoreCommentDirective` `dprint-ignore`                                                                                                            |
| `markup`     | `formatComments` true, `ignoreCommentDirective` `dprint-fmt-ignore`, `preferAttrsSingleLine` true, `scriptIndent` true, `styleIndent` true                                  |
| `dockerfile` | `lineWidth` 80                                                                                                                                                             |

A plugin two packs ask for is written once and
[shared](../SKILL.md#blocks): `malva` is asked for by five packs and sits in
the file once, with its config key, whatever order they landed in.

## 3. The exclusion set

**Every generated tree is excluded.** A formatted generated file is a diff
nobody authored and a check nobody can pass without regenerating. The base
set is universal — true of every repo whatever its stack:

| Entry                | Why                                                                   |
| -------------------- | --------------------------------------------------------------------- |
| `.claude`            | the agent tooling tree — machine-owned end to end; see below          |
| `.git`               | git's own                                                             |
| `.config/mise/locks` | mise's sidecar lock tree — `mise.lock` records its digest             |
| `graphify-out`       | the graph tool's output, written without a final newline              |
| `build`, `dist`      | the generic output trees                                              |
| `*.lock`             | every tool's lockfile                                                 |

The base is a block in each list — the `dprint` block in both formatter files,
the `pre-commit` block in the hook config's, the `gitleaks` block in the
allowlist — and every other entry is a stack's, added by its pack through
[`all add exclude`](../SKILL.md#the-one-cross-tool-verb): pnpm's
`node_modules`, `.turbo`, `*-lock.json`, `*-lock.yaml`; uv's `.venv`;
swiftpm's `.build`, `.swiftpm`; swiftui's `Derived`, `DerivedData`,
`*.xcassets` (Xcode rewrites every `Contents.json` inside one, so a formatted
one is rewritten back on the next edit in the IDE). A tree no pack produces is
never in a repo's lists.

**The spellings.** A directory `<d>` is `**/<d>/` in `.config/dprint.json`'s
`excludes` and `**/<d>/**` in `.config/taplo.toml`'s `exclude`; a file glob
`<g>` is `**/<g>` in both. Each is written in the requester's block — in
`taplo.toml` the `# >>> <requester>` lines sit inside the array — and the
hook config's and the allowlist's spellings are
[pre-commit's](pre-commit.md#3-the-global-exclude) and
[gitleaks'](gitleaks.md#2-the-allowlist). The toolkit's checker holds the three
formatter lists equal and the allowlist a subset, which the one verb makes true
by construction.

**Templated markdown is the exclusion that surprises people.** A formatter
re-wraps prose to a width measured on the template text, but an expression is
far wider than what it renders to, so the output lands mis-wrapped. Exclude a
template source, and any file whose committed form is derived. And an exclusion
added for a reason that later expires does not announce itself: when a
template layer retires, revisit its exclusions deliberately.

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
unformatted — is the cheaper side of the trade. The reason is here and not in
the config because `.config/dprint.json` is strict JSON and can carry no
comment.

## 4. The verbs

| Instruction                           | Writes to                                                             |
| ------------------------------------- | --------------------------------------------------------------------- |
| `add plugin <name>`                   | `.config/dprint.json` — the URL, the config key; the editor fragment's scopes |
| `remove <requester>`                  | every dprint file holding its keys or blocks                          |

**`add plugin <name>`** takes a name from [the plugin table](#2-the-plugins)
and nothing else; an unknown name is refused, naming the table. It inserts
the URL into `plugins` just ahead of `exec`, which stays last so a real
plugin takes any extension both claim; writes the plugin's config key among
the top-level keys in alphabetical order, as the asset keeps them; and —
where the editor fragment has landed — writes the plugin's language scopes
into the requester's block there, after the `dprint` base block, each bound
to `dprint.dprint`. A base plugin asked for is already satisfied and
noted.

**No exclude verb.** An exclude is added only through
[`all add exclude`](../SKILL.md#the-one-cross-tool-verb), because one list
widened alone is the drift the one set exists to prevent;
`dprint add exclude` is refused, naming it.

**Running it** is the task library's: `mise run code:format` checks,
`--fix` rewrites, and the task passes `--config .config/dprint.json` with
`--allow-no-files`. `check` is what CI runs; `fmt` is what the hook and a
person run. Never hand-fix whitespace to satisfy `check` — a hand fix that
differs from what `fmt` produces fails again next run. The repo formatter runs
first in `code:format`, ahead of any language formatter a pack wires into the
same task.

## 5. Two routes to one config

dprint discovers `dprint.json` and `dprint.jsonc` by walking up from the file
it formats, and does **not** look inside `.config/`. The config lives there
anyway, and its two consumers reach it differently:

- **Every command-line call carries `--config .config/dprint.json`** — the
  format task, the hook, CI. A call without it, in a tree with no root shim,
  formats with built-in defaults and reports success: the worst failure
  available, because it looks like a pass.
- **The editor has only discovery.** The VS Code extension contributes
  `dprint.path`, `dprint.verbose` and `dprint.experimentalLsp`, and none names
  a config file. So `all` lands a root `dprint.json` whose whole content is
  `{ "extends": ".config/dprint.json" }` — format-on-save finds it by walking
  up, and formats with the gate's config.

**The shim is a file, never a symlink.** A symlink does not survive a checkout
on every platform, shows up as a thing to explain, and a tool resolving it
reports the target's path in its errors. **Nothing is ever added to the
shim** — a second key there is a formatting opinion where nobody looks — and
it carries no comment, since `check-json` parses it strictly.

### No `includes` key, and that is what makes the shim work

**`excludes` is inherited through `extends`; `includes` is not.** Measured on
dprint 0.57.1: an extended config's `includes` is dropped *and* reported
against the extending file as a fatal config diagnostic, exit 11. A shim
extending a config that carries `includes` fails every bare invocation — the
format-on-save path, the shim's only job. Without it, the bare and the
`--config` invocations resolve the same file set and both exit 0.

**A submodule takes its own copy**, kept identical on purpose: its checkout
may not contain the parent's `.config/`, and a relative symlink out of it
resolves to nothing wherever it is cloned alone. The skill runs in each
member repo on its own; two files can drift, and a diff shows it — the cost of
the alternative is a gate silently formatting with defaults.

## 6. The migration

`all` on a repo the retired dprint gate pack shaped brings it onto this
layout, each step a row:

- **The lockfile entries** sourced from that pack are re-recorded as
  `tool-config/dprint@<version>` where the path is still the skill's.
- **`.config/dprint.json`'s plugins and keys** are sorted into the base, each
  requesting pack's keys once its own `add plugin` call runs, and the user's
  keys — a plugin no base and no pack asks for stays, the user's.
- **The excludes** the base does not hold are kept as the user's lines until
  a pack's `all add exclude` claims them; `target`, which the old pack
  shipped and no pack produces, is shown as a row offering its removal.
- **The repo-local dprint skill** the pack used to copy under
  `.claude/skills/dprint/` is deleted where its content still matches its
  record, and kept and reported where it does not.
