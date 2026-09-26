---
name: tool-config
description: Configure a repo's universal tools — mise today — from one
  instruction per call, writing each requester's lines between its own block
  markers and a line outside them only on a person's approval. Use it to land
  every tool the skill owns in a repo (all, with the repo's answers as
  key=value arguments), to add a tool pin, an environment value or an alias
  for a pack or by hand, to set a machine value, to remove a dropped pack's
  blocks, or to upgrade and lock the toolchain. Invoked by /vwf:init, by the
  stackgen materializer for a pack's tool-config list, and by /vwf:setup for
  machine values.
argument-hint: "[preview] <tool> <instruction> [for <requester>] [answers=…] | [preview] all [key=value …] [answers=…]"
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

| Tool   | Reference                                     | Assets                                          |
| ------ | --------------------------------------------- | ----------------------------------------------- |
| `mise` | [references/mise.md](references/mise.md)      | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/mise/` |

A row is a tool: its reference holds the doctrine, the verbs and what `all`
lands for it; its assets hold the static files and templates, laid out exactly
as they land under the repo root. The list grows one row per tool. Read the
tool's reference before acting on any call that names it.

## Arguments

Three shapes, each of which `preview` may open, and nothing else:

```text
[preview] <tool> <instruction> [for <requester>] [answers=<id>:<answer>,…]
[preview] all [key=value …] [answers=<id>:<answer>,…]
[preview] <tool> key=value [key=value …] [answers=<id>:<answer>,…]
```

`answers=` is always the last argument, never one of `all`'s keys, and never
carried by a `preview` — it hands back the picks a preview's rows were
answered with ([Consent and the rows](#consent-and-the-rows)).

Only `all` and the third shape take `key=value` arguments. The third lands
that one tool's base exactly as `all` would, with the same keys, and nothing
else — `/stackgen:tool-config mise repo=scratch`.

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
skill lands itself (`for mise` is never typed). A requester is a slug:
lowercase letters, digits and `-`. A call with no `for` writes the user's own
line, outside every block. Only a person types one, and it writes on that
person's approval; a pack's call and the materializer always carry a `for`.

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

## Blocks

**Each requester's lines sit between its own markers**, in each file it wrote
to:

```toml
# >>> swiftui
XCODE_VERSION = ""
# <<< swiftui
```

JSONC spells them `// >>> <requester>` and `// <<< <requester>`. The base the
skill lands for a tool is that tool's own block, `# >>> mise`. A requester has
at most one block per file. A block is written where the tool reads it — for
a sectioned file, inside the section — and a new block goes after the last
block in the file, so the base comes first and the packs follow in the order
they asked. One blank line separates two adjacent blocks, and a block's own
lines carry no blank line at either end. A comment directly above a key, with
no blank line between, belongs to that key's block.

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
env key or an alias name another block or a user line already holds is a
**conflict row** — never a silent overwrite — settled by the user as the
tool's reference says.

**How the answers come back.** `preview` numbers its rows `r1`, `r2`, … in
order, and returns each with the answer names it takes. Every row takes one:

| Row                                 | Answers                             |
| ----------------------------------- | ----------------------------------- |
| drift                               | `take-theirs`, `keep-mine`, `merge` |
| a tool, env or alias clash          | `keep-existing`, `overwrite`        |
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
stay byte for byte. A file left empty is deleted. The materializer calls it
once per tool a dropped pack's `tool-config:` list called. The tool's own
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
```

`<stackgen version>` is this plugin's own, from
`${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`. The hash is for the
callers that test a repo's shape — `/vwf:doctor` and `/vwf:init` — and is
re-recorded on every write; the skill's own drift test never reads it. A JSON
file's entry carries `keys:` beside `blocks:`, one list per requester. A path
the skill deletes loses its entry. The entry is written in the same step as
the file, so the two never disagree.

## What it never does

- Writes a line outside a block for a pack's call or the materializer, or a
  path another source owns.
- Resolves a drifted block or a conflict row without the user's answer.
- Commits. The caller commits what it landed, the way it commits everything
  else.
