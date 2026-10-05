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
`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/`, laid out as they land
under the repo root.

**dprint is scripted.** `tool-config.mjs` — [run as the skill
says](../SKILL.md#running-the-script) — lands the three files, writes each
plugin a pack asks for with its config, writes each exclude
[`all add-exclude`](../SKILL.md#the-one-cross-tool-verb) carries, records
every key in the lock, raises the conflict, drift and migration rows, and
then runs this formatter over every file the call wrote. A greenfield repo
needs no edit by hand. This reference is the why behind what it writes, for a
person reading the result; your part is relaying its rows and making the one
change it hands back — a `.config/dprint.json` that is not strict JSON (a
`//` comment, a trailing comma, a JSONC file renamed), a `needs-edit` row:
rewrite it as strict JSON, keeping every key, then re-run the same call's
`preview` and finish with `check`. When you edit a dprint file yourself, the
rules below are what you hold it to.

| Section                                                    | Read before                                        |
| ---------------------------------------------------------- | -------------------------------------------------- |
| [1. What `all` lands](#1-what-all-lands)                   | running `all`, or reading what it landed           |
| [2. The plugins](#2-the-plugins)                           | `dprint add-plugin`, or widening what is formatted |
| [3. The exclusion set](#3-the-exclusion-set)               | `all add-exclude`, or narrowing what is formatted  |
| [4. The verbs](#4-the-verbs)                               | any call naming `dprint`                           |
| [5. Two routes to one config](#5-two-routes-to-one-config) | touching the root shim or a call site              |
| [6. The migration](#6-the-migration)                       | running `all` on a repo the old gate pack shaped   |

## 1. What `all` lands

| Landed                              | As                                                           |
| ----------------------------------- | ------------------------------------------------------------ |
| `.config/dprint.json`               | plain JSON, no markers — the `dprint` base, keys in the lock  |
| `.config/taplo.toml`                | the frame, the settings unmarked, a `dprint` block in `exclude` |
| `dprint.json` (the root shim)       | one file, whole, the base's alone                             |

**`.config/dprint.json` carries no marker.** It is strict JSON: the hook
runner's `check-json` rejects a `//` line, and dprint rejects an unknown
property. So, as [the skill](../SKILL.md#blocks) says for any plain-JSON file,
the lock entry's `keys:` records what each requester wrote — a whole key
(`typescript`) or one entry of a list, the plugin by its name and the
exclude as the file spells it (`plugins[typescript]`,
`excludes[**/node_modules/]`) — and the `dprint` base is every key no
requester and no user holds.

**`.config/taplo.toml`** decides TOML layout and is reached only through the
`exec` plugin, so the two land together or the TOML half formats with taplo's
defaults. Its `exclude` array is the second spelling of
[the exclusion set](#3-the-exclusion-set): the base's entries are the
`dprint` block inside that array, and a requester's block follows it there.
Everything else below the frame is the base's, unmarked
([the skill's](../SKILL.md#blocks) per-position rule).

`forge`, `secrets`, `update_bot` and `scopes` are read by no dprint file:
dprint takes no key.

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
in the file is the file's — neither the script nor any task moves it; a
person runs `mise x -- dprint config update --config .config/dprint.json` by
hand, in dev — so a version differing from this table is never drift. Drift
compares the plugin, not its version.

| Plugin        | URL written first                                                 | Config key   | Held by                            |
| ------------- | ----------------------------------------------------------------- | ------------ | ---------------------------------- |
| `markdown`    | `https://plugins.dprint.dev/markdown-0.22.1.wasm`                 | `markdown`   | the base                           |
| `pretty_yaml` | `https://plugins.dprint.dev/g-plane/pretty_yaml-v0.6.0.wasm`      | `yaml`       | the base                           |
| `json`        | `https://plugins.dprint.dev/json-0.21.3.wasm`                     | `json`       | the base                           |
| `exec`        | `https://plugins.dprint.dev/exec-0.6.2.json@<checksum>`           | `exec`       | the base                           |
| `typescript`  | `https://plugins.dprint.dev/typescript-0.96.1.wasm`               | `typescript` | `language/typescript`              |
| `malva`       | `https://plugins.dprint.dev/g-plane/malva-v0.16.0.wasm`           | `malva`      | the stylesheet packs, astro, html  |
| `markup_fmt`  | `https://plugins.dprint.dev/g-plane/markup_fmt-v0.27.3.wasm`      | `markup`     | astro, html                        |
| `dockerfile`  | `https://plugins.dprint.dev/dockerfile-0.4.0.wasm`                | `dockerfile` | container-image, containers, cloud-run |

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
| `graphify-out`       | the graph tool's output, written without a final newline              |
| `build`, `dist`      | the generic output trees                                              |
| `*.lock`             | every tool's lockfile                                                 |

The base is a block in each list — the `dprint` block in both formatter files,
the `pre-commit` block in the hook config's, the `gitleaks` block in the
allowlist — and every other entry is a stack's, added by its pack through
[`all add-exclude`](../SKILL.md#the-one-cross-tool-verb): pnpm's
`node_modules`, `.turbo`, `*-lock.json`, `*-lock.yaml`; uv's `.venv`;
swiftpm's `.build`, `.swiftpm`; swiftui's `Derived`, `DerivedData`,
`*.xcassets/` (Xcode rewrites every `Contents.json` inside one, so a formatted
one is rewritten back on the next edit in the IDE — and the trailing `/` is
what makes it the directory, excluded with everything inside, rather than a
file glob that matches nothing). A tree no pack produces is never in a
repo's lists.

**The spellings.** A path is a directory when it ends in `/` — a glob
included — or holds neither `*` nor `?`; otherwise it is a file glob
([the skill's rule](../SKILL.md#the-one-cross-tool-verb)). A directory `<d>`
is `**/<d>/` in `.config/dprint.json`'s `excludes` and `**/<d>/**` in
`.config/taplo.toml`'s `exclude`; a file glob `<g>` is `**/<g>` in both. In
`excludes` a requester's entries are its `keys:` in the lock; in
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

| Call                                      | Writes to                                                 |
| ----------------------------------------- | --------------------------------------------------------- |
| `dprint add-plugin --name <name>`         | `.config/dprint.json` — the URL, the config key           |
| `dprint remove --for <requester>`         | every dprint file holding its keys or blocks              |

A pack's entry is `{tool: dprint, verb: add-plugin, name: typescript}`, run
`--for` the pack by `apply-entries`.

**`add-plugin --name <name>`** takes a name from
[the plugin table](#2-the-plugins) and nothing else; an unknown name is
refused, naming the table. It inserts the URL into `plugins` just ahead of
`exec`, which stays last so a real plugin takes any extension both claim;
and writes the plugin's config key among the top-level keys in alphabetical
order, as the asset keeps them, unless the file already has that key. A
base plugin asked for is already satisfied, and the call notes so. A plugin
another requester already wrote is [shared](../SKILL.md#blocks) — a
`share` row, nothing added to the file; one a user line holds is satisfied.

**`remove --for <requester>`** takes out every key the lock records for it
— a plugin, its config key, its excludes — and its block in `taplo.toml`'s
`exclude`; a key another requester shares passes to the next sharer instead.

**No exclude verb.** An exclude is added only through
[`all add-exclude`](../SKILL.md#the-one-cross-tool-verb), because one list
widened alone is the drift the one set exists to prevent;
`dprint add-exclude` is refused, naming it.

**Running it** is the task library's: `mise run code:format` checks,
`--fix` rewrites, and the task passes `--config .config/dprint.json` with
`--allow-no-files`. `check` is what CI runs; `fmt` is what the hook and a
person run. Never hand-fix whitespace to satisfy `check` — a hand fix that
differs from what `fmt` produces fails again next run. The repo formatter runs
first in `code:format`, ahead of any language formatter a pack wires into the
same task. **The script runs it too**, on every file a call writes, as
`mise x -- dprint fmt --config .config/dprint.json --allow-no-files <files>`
([what a written call runs](../SKILL.md#what-a-written-call-runs)) — so
where a landed line folds is this formatter's decision, never the script's
and never yours, and a repo `all` lands passes its own `check`.

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
- **Lines the rewrite does not carry** are named in one `needs-edit` row
  per file, so nothing is dropped unseen: re-add each that was the person's
  own where the layout keeps it.
- **`.config/dprint.json`'s plugins and keys** are sorted into the base, each
  requesting pack's keys once its own `add-plugin` entry runs, and the user's
  keys — a plugin no base and no pack asks for stays, the user's.
- **The excludes** the base does not hold are kept as the user's lines until
  a pack's `all add-exclude` claims them; `target`, which the old pack
  shipped and no pack produces, is shown as a `migrate` row offering its
  removal — `ok` removes it, `keep-existing` leaves it.
- **A file it cannot read** — a `.config/dprint.json` that is not strict
  JSON — is a `needs-edit` row, never a guess: make it strict JSON by hand,
  then re-run.
- **The repo-local dprint skill** the pack used to copy under
  `.claude/skills/dprint/` is deleted where its content still matches its
  record, and kept and reported where it does not.
