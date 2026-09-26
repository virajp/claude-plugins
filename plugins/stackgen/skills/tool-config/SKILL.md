---
name: tool-config
description: Configure a repo's universal tools — mise, dprint, pre-commit,
  gitleaks and grype — from one instruction per call, writing each requester's
  lines between its own block markers and a line outside them only on a
  person's approval. Use it to land every tool the skill owns in a repo (all,
  with the repo's answers as key=value arguments), to add a tool pin, an
  environment value, an alias, a formatter plugin, a hook, a linter ignore, a
  vulnerability ignore or an exclude for every gate at once, for a pack or by
  hand, to set a machine value, to remove a dropped pack's blocks, or to
  upgrade and lock the toolchain. Invoked by /vwf:init, by the
  stackgen materializer for a pack's tool-config list, and by /vwf:setup for
  machine values.
argument-hint: "[preview] <tool> <instruction> [for <requester>] [answers=…] | [preview] all [key=value …] [answers=…] | [preview] all add exclude [generated] <path> … [for <requester>]"
disable-model-invocation: false
user-invocable: true
---

# tool-config

One skill owns the configuration of the tools every repo runs, whatever its
stack. A pack never copies one of their files: it asks this skill, one
instruction per line, and the skill writes the lines where the tool reads them.
So a tool's files have one writer, and the lines each asker needs can be told
apart, shown, and taken out again.

## The tools it owns

| Tool         | Reference                                            | Assets                                                        |
| ------------ | ---------------------------------------------------- | ------------------------------------------------------------- |
| `mise`       | [references/mise.md](references/mise.md)             | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/mise/`       |
| `dprint`     | [references/dprint.md](references/dprint.md)         | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/dprint/`     |
| `pre-commit` | [references/pre-commit.md](references/pre-commit.md) | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/pre-commit/` |
| `gitleaks`   | [references/gitleaks.md](references/gitleaks.md)     | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/gitleaks/`   |
| `grype`      | [references/grype.md](references/grype.md)           | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/grype/`      |

A row is a tool: its reference holds the doctrine, the verbs and what `all`
lands for it; its assets hold the static files and templates, laid out exactly
as they land under the repo root. The list grows one row per tool. Read the
tool's reference before acting on any call that names it.

## Arguments

Four shapes, each of which `preview` may open, and nothing else:

```text
[preview] <tool> <instruction> [for <requester>] [answers=<id>:<answer>,…]
[preview] all [key=value …] [answers=<id>:<answer>,…]
[preview] all add exclude [generated] <path> … [for <requester>] [answers=…]
[preview] <tool> key=value [key=value …] [answers=<id>:<answer>,…]
```

`answers=` is always the last argument, never one of `all`'s keys, and never
carried by a `preview` — it hands back the picks a preview's rows were
answered with ([Consent and the rows](#consent-and-the-rows)).

Only `all` and the fourth shape take `key=value` arguments. The fourth lands
that one tool's base exactly as `all` would, with the same keys, and nothing
else — `/stackgen:tool-config mise repo=scratch`. The third is
[the one cross-tool verb](#the-one-cross-tool-verb).

**`preview`** builds the rows the same call would show — every create, write,
fold, move and delete, every drift row and every conflict row — and returns
them, writing nothing: no file, no lock entry, no question asked. It is how a
caller that gathers one consent for a whole plan shows the skill's rows inside
it ([Consent and the rows](#consent-and-the-rows)). A pack's `tool-config:`
list never carries it; the materializer adds it.

**`<tool> <instruction>`** runs one verb of that tool's reference against the
repo the call runs in. The verbs, their spelling and the files each writes are
the reference's; an instruction no verb matches is refused, naming the verbs.
What a name, a key or a value may hold is the reference's too — mise's is
[what a call may carry](references/mise.md#what-a-call-may-carry) — and a
call that breaks it is refused before anything is shown.
Every tool also takes `remove <requester>` — below — whatever its reference
adds.

**`for <requester>`** names whose lines these are. A pack's calls carry the
pack's slug — the materializer appends `for <pack>` to each line of a pack's
`tool-config:` list — and the tool's own name is reserved for the base the
skill lands itself (`for mise`, `for dprint` and the rest are never typed). A
requester is a slug: lowercase letters, digits and `-`. A call with no `for`
writes the user's own line, outside every block. Only a person types one,
and it writes on that person's approval; a pack's call and the materializer
always carry a `for`.

**`all [key=value …]`** lands every tool in the table above, in table order,
each as its reference's `all` section says, filling that tool's marked
positions from the arguments. The keys are fixed:

| Key                                        | Value                                                           |
| ------------------------------------------ | --------------------------------------------------------------- |
| `repo`                                     | the repo's folder slug                                          |
| `members`                                  | member repo paths, in order, comma-separated; empty where none  |
| `linkage`                                  | `siblings` or `submodule`                                       |
| `merge_model_develop`, `merge_model_main`  | `direct` or `pr`                                                |
| `runtimes`                                 | language keys, comma-separated — `node`, `python`, `dart`, `go`, `rust`, `swift` |
| `plugin_sources`                           | `<source-ref>\|<name>` rows, comma-separated; empty on none     |
| `plugins`                                  | `<name>@<marketplace>` rows, comma-separated; empty on none     |
| `forge`, `editor`, `secrets`, `update_bot` | the four conditional answers, `none` the spelling of no answer  |
| `scopes`                                   | the commit gate's scopes, project ids, comma-separated; empty on none |

**A list is spelled comma-separated, no spaces** — `members=backend,frontend`
— and this is the one place that spelling is stated. A key given as `key=` is
empty. An unknown key is refused. A key left out keeps the value the repo
already carries, else its default: the tool reference states one for every
key it reads. So a caller re-passing one changed answer re-passes the rest
unchanged, and the run shows the one row that moved. A value holding a space
is quoted, `"…"`, and a quoted value is read as the tool reference reads one —
mise's is [what a call may carry](references/mise.md#what-a-call-may-carry).

**`all` is idempotent.** A second run with the same arguments over an
unchanged repo writes nothing and shows no row. It is also the migration: a
repo whose files predate a tool's current layout is brought onto it by the
same call, each fold, move and delete one row — the reference names what it
reads.

**Values nobody passes.** The commit gate's forge links are filled by `all`
from the repo's `origin` remote, never from an argument — the rule is
[pre-commit's](references/pre-commit.md#2-the-marked-positions); a repo with no
`origin` keeps them commented until a later `all` finds one.

### The one cross-tool verb

**`all add exclude [generated] <path> …`** is the only way an exclude is
added, by a pack or by hand. One call writes every path, in each tool's own
syntax, into the formatter's `excludes`, the TOML formatter's `exclude` and
the hook runner's global `exclude`; with `generated` it writes them into the
secret scanner's path allowlist too. So the formatters' three lists state one
set and the scanner's is a subset of it by construction, never by care. A
path holding a `*` or a `?` is a file glob (`*.lock`, `*-lock.json`); any
other is a directory (`node_modules`, `.config/mise/locks`); both match at
any depth. `generated` is for a tree a tool writes and no one reviews, never
a lockfile or authored source. An exclude asked of one tool alone —
`dprint add exclude …` — is refused, naming this verb. Its removal is
`remove <requester>` on each tool it wrote.
The spelling each list takes is in
[dprint's](references/dprint.md#3-the-exclusion-set),
[pre-commit's](references/pre-commit.md#3-the-global-exclude) and
[gitleaks'](references/gitleaks.md#2-the-allowlist) references.

## Blocks

**Each requester's lines sit between its own markers**, in each file it wrote
to:

```toml
# >>> swiftui
XCODE_VERSION = ""
# <<< swiftui
```

JSONC spells them `// >>> <requester>` and `// <<< <requester>`. An editor
fragment's asset carries no markers: the skill wraps its content in the
tool's `//` base block as it lands the file, and a requester's `//` block
follows it. The base the
skill lands for a tool is that tool's own block — `# >>> mise`,
`# >>> dprint`, `# >>> pre-commit` — and in a file one tool lands and
another's verb reaches, the landing tool's name is the base. A block may sit
inside a list — a TOML array, a YAML sequence, a verbose-mode regex, where a
`#` line is a comment — and the list's own punctuation between entries (a
comma, a `|`) is re-derived on every write, so it is never content, never
drift and never a user line. **A requester has at most one block per
position** — a position being one table, section or list the tool reads — so
one file may hold two of its blocks where it asked for two positions: uv's
exclude sits in the hook config's global `exclude` and its hook in `repos:`,
two `# >>> uv` blocks in one file. `remove` takes every one. A block is
written where the tool reads it — for a sectioned file, inside the section —
and a new block goes after the last block in its position, so the base comes
first and the packs follow in the order they asked. One blank line separates
two adjacent blocks — except inside a list, where one block's closing marker
is followed directly by the next one's opening marker — and a block's own
lines carry no blank line at either end. A comment directly above a key, with
no blank line between, belongs to that key's block. **Entries inside a block
are written sorted**, in the order the shipped formatter leaves them — taplo
sorts a TOML array, so its entries take that order, never the call's — and
where no formatter sorts (a JSON list, a regex), directories first, then
globs, each alphabetical, as the assets are. So a landed file passes its own
format check.

**The base follows the same per-position rule.** Where the whole file below
the frame is one position — a mise section file — the base is one block
there. Where requesters write into a list inside a larger file — the
formatter's `exclude`, the hook config's global `exclude`, the linter's
`ignores:`, the scanner's allowlist — the base's entries in that list are its
own base block, and a requester's block follows it inside the same list,
never inside the base block: blocks never nest. The rest of such a file below
the frame — keys and entries no verb writes, and the hook config's own
`repos:` entries ahead of the first requester block — is the base's by
position, unmarked, and compared with the asset as the base; a line there the
asset does not carry is the user's.

**A file's frame** is its leading comment run, up to the first blank line,
and in a section file the table line below it — `[env]`, `[tools]`. The skill
writes the frame when it creates the file and removes it with the file.

**Lines outside every block are the user's.** A pack's call and the
materializer never write, reorder or remove one. Such a line is written only
by a call with no `for` that a person typed and approved, and removed or
overwritten only on a row that person settled — a conflict row, or a
migration row moving their own line into its new file. A file whose format
has no comments — plain JSON — carries no markers; the lock entry records
which keys each requester wrote instead.

**A shared entry is written once.** When a requester asks for a list entry
another block already holds — a formatter plugin two packs need, an exclude
two packs name — nothing is added to the file: the lock records the second
requester against that entry (`shares:`, below), and the preview shows it as
one `ok` row saying so. `remove` of the block that holds it moves the entry
into the next sharer's block, oldest first, instead of deleting it; only the
last requester's removal takes it out. An entry the base or a user line
already holds is not shared — the request is simply satisfied, and noted.

**A file exists only while it has content.** The skill creates a file for the
first block it needs, and deletes it when its last block goes and no user line
is left.

**A file the skill lands whole** — a task file, say — is one block with no
markers: the base owns every byte of it. A path whose lock entry names any
source other than `tool-config/…` is not the skill's, whatever it once landed
there: a pack overlay that replaced a task file keeps it, and neither `all`
nor any verb writes it back.

## Consent and the rows

**Every call shows before it writes.** It builds its rows — each file it would
create, write, fold, move or delete, and each block that drifted — and writes
nothing until they are approved. A caller that gathers one consent for a whole
plan — `/vwf:init`'s plan, the materializer's dry-run — runs each call as
`preview` first, shows the returned rows inside its own consent, then runs the
calls with the answers it gathered; the skill asks no second time. A call
typed by a person is its own consent round. A call that would write a pin, an
env key, an alias name or a hook id another block or a user line already
holds with a different value is a **conflict row** — never a silent
overwrite — settled by the user as the tool's reference says. The same list
entry — a plugin, an exclude, an ignore — asked for twice is not a conflict:
it is [shared](#blocks).

**How the answers come back.** `preview` numbers its rows `r1`, `r2`, … in
order, and returns each with the answer names it takes. Every row takes one:

| Row                                 | Answers                             |
| ----------------------------------- | ----------------------------------- |
| drift                               | `take-theirs`, `keep-mine`, `merge` |
| a tool, env, alias or hook clash    | `keep-existing`, `overwrite`        |
| `set env` finding a key outside     | `move-in`, `keep-both`              |
| … in the block's own file           | `move-in`, `keep-existing`          |
| a create, write, fold, move, delete | `ok`                                |

A `merge` row carries the combined block in the preview, so its answer needs
no second yes. The real call then carries
`answers=<id>:<answer>,<id>:<answer>` as its last argument — no spaces. The
skill rebuilds the rows on that call, and `answers=` must name exactly the
ids the rebuilt rows carry, each with one of that row's answers. A missing
id, an unknown id, a wrong answer name, or a row whose content changed since
the preview refuses the **whole call**: nothing is written, and the rows are
shown again. **A call that carries a matching `answers=` asks nothing**; a
call without it is its own consent round.

## Drift

**A block that differs from what its requester would write now is drift**,
tested by content and never by a hash. Outside quoted strings the words are
compared, so spacing and line breaks are never drift; a quoted string is
compared exactly, character for character. Each drifted block is one row,
the two versions side by side, with three answers:

- **take theirs** — the block is rewritten as the requester would write it;
- **keep mine** — the block stays as it stands for this run; nothing records
  the answer, so the next run that finds the same difference asks again;
- **merge** — the two are combined line by line, shown, and written on a
  second yes — or, on a call carrying `answers=`, as its preview showed.

The skill never picks one for the user.

**Three things are never drift.** A marked position filled from an argument
is the argument's, so a changed argument is a changed row, shown as the
change. A machine value — a key named in the requesting pack's
`machine_env:` list, read from its `pack.yaml` under
`${CLAUDE_PLUGIN_ROOT}/stacks/*/<requester>/`, whatever value it holds — is
the machine's, and the comparison skips it; a requester with no such list has
none. And a line outside every block is not compared at all.

## Removal

`<tool> remove <requester>` deletes every block that requester holds across
that tool's files, and nothing else: the user's lines and the other blocks
stay byte for byte. A file left empty is deleted, and a shared entry moves
as [Blocks](#blocks) says. The materializer calls it once per tool a dropped
pack's `tool-config:` list called — for an `all add exclude` line, once on
each of `dprint`, `pre-commit` and `gitleaks`. The tool's own
base is not removable by this verb — a repo that stops using the tool deletes
its files by hand.

## The lock record

Every path the skill writes is one entry in stackgen's lockfile,
`.claude/stackgen/lock.yaml`, in the materializer's shape
(`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`):

```yaml
entries:
  - path: .config/mise/conf.d/tools.toml
    source: tool-config/mise@<stackgen version>
    hash: <content hash after the write>
    blocks: [mise, swiftlint] # the requesters holding a block here
  - path: .config/mise/tasks/setup/all
    source: tool-config/mise@<stackgen version>
    hash: <content hash after the write>
    mode: "755"
  - path: .config/dprint.json
    source: tool-config/dprint@<stackgen version>
    hash: <content hash after the write>
    blocks: [dprint, typescript, astro]
    keys: # plain JSON: what each requester wrote, as <key> or <key>[<entry>]
      typescript: ["plugins[typescript]", typescript]
      astro: ["plugins[malva]", "plugins[markup_fmt]", malva, markup]
    shares: # an entry one block holds that other requesters also asked for
      "plugins[malva]": [astro, html]
```

`<stackgen version>` is this plugin's own, from
`${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`. The hash is for the
callers that test a repo's shape — `/vwf:doctor` and `/vwf:init` — and is
re-recorded on every write; the skill's own drift test never reads it. A JSON
file's entry carries `keys:` beside `blocks:`, one list per requester. An
entry with a shared line carries `shares:`, the entry against every requester
that asked for it, the holder first. A path
the skill deletes loses its entry. The entry is written in the same step as
the file, so the two never disagree.

## What it never does

- Writes a line outside a block for a pack's call or the materializer, or a
  path another source owns.
- Resolves a drifted block or a conflict row without the user's answer.
- Commits. The caller commits what it landed, the way it commits everything
  else.
