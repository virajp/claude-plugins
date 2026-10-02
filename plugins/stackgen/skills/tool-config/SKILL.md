---
name: tool-config
description: Configure a repo's universal tools — mise, dprint, pre-commit,
  gitleaks, grype, git, graphify and renovate — from one instruction per call,
  writing each requester's lines between its own block markers and a line
  outside them only on a person's approval. mise is configured by a shipped
  node script that renders the templates, shows every change as a numbered
  row and writes on the answers; the other seven still follow their
  references. Use it to land every tool the skill owns in a repo (all, with
  the repo's answers as flags), to apply a pack's tool-config entries, to add
  a tool pin, an environment value, an alias, a formatter plugin, a hook, a
  linter ignore, a vulnerability ignore, an ignore line, a pinned ignore
  template, an attribute or an exclude for every gate at once, for a pack or
  by hand, to set a machine value, to remove a dropped pack's blocks, to
  check a repo for drift, or to move the toolchain's pins forward. Invoked by
  /vwf:init, by the stackgen materializer for a pack's tool-config list, and
  by /vwf:setup for machine values.
argument-hint: "[preview] mise <verb> [--<flag> <value>]… [--for <requester>] [--answers <id>:<answer>,…] | [preview] all [--<key> <value>]… [--answers …] | [preview] apply-entries --pack <slug> --file <pack.yaml> [--answers …] | check [<tool>] | [preview] <tool> <instruction> [for <requester>] [answers=…] for the seven prose tools"
disable-model-invocation: false
user-invocable: true
---

# tool-config

One skill owns the configuration of the tools every repo runs, whatever its
stack. A pack never copies one of their files: it asks this skill, one
instruction per entry, and the skill writes the lines where the tool reads
them. So a tool's files have one writer, and the lines each asker needs can be
told apart, shown, and taken out again.

## The tools it owns

| Tool         | Reference                                            | Assets                                                        | Run by          |
| ------------ | ---------------------------------------------------- | ------------------------------------------------------------- | --------------- |
| `mise`       | [references/mise.md](references/mise.md)             | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/mise/`       | the script      |
| `dprint`     | [references/dprint.md](references/dprint.md)         | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/dprint/`     | its reference   |
| `pre-commit` | [references/pre-commit.md](references/pre-commit.md) | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/pre-commit/` | its reference   |
| `gitleaks`   | [references/gitleaks.md](references/gitleaks.md)     | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/gitleaks/`   | its reference   |
| `grype`      | [references/grype.md](references/grype.md)           | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/grype/`      | its reference   |
| `git`        | [references/git.md](references/git.md)               | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/git/`        | its reference   |
| `graphify`   | [references/graphify.md](references/graphify.md)     | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/graphify/`   | its reference   |
| `renovate`   | [references/renovate.md](references/renovate.md)     | `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/renovate/`   | its reference   |

A row is a tool: its assets hold the static files and templates, laid out
exactly as they land under the repo root, and its reference says what lands
and why. **A scripted tool's script is the authority**: it renders the assets,
fills their marked positions and writes the blocks, so a greenfield repo needs
no judgement for it, and its reference tells you what the script does and the
edits it hands back to you. **A prose tool is still yours to apply**, exactly
as its reference says — read it before acting on any call that names it. The
other seven move onto the script in later releases; until then a call reaches
both halves the way [Running the script](#running-the-script) says.

## Running the script

```sh
node "${CLAUDE_PLUGIN_ROOT}/skills/tool-config/scripts/tool-config.mjs" <arguments>
```

Run it with the `node` on `PATH` — never through `mise x node@lts --`. It
needs no package, and it needs `mise` on `PATH` for any call that resolves a
version; without one it refuses, naming the install. It runs against the
repo the working directory sits in (`git rev-parse --show-toplevel`), or the
one `--repo-root <dir>` names. A caller — `/vwf:init`, `/vwf:setup`, the
materializer, a person — invokes this skill with the script's own arguments,
and the skill runs them as given.

**The output is JSON on stdout, always**, and the exit code says which shape:

| Exit | Shape                                         | Means                                                                        |
| ---- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| 0    | `{preview: true, rows, prose?, notes?}`       | a `preview`: the rows the call would show; nothing written                   |
| 0    | `{written, deleted, rows, prose?, notes?}`    | the call wrote; `rows` are the `needs-edit` rows its answers left for you    |
| 2    | `{error, rows?}`                              | refused — nothing written; the message names why, and the rows when it has some |
| 1    | `{error}`, a stack on stderr                  | an internal fault — report it whole; never work around it by hand            |

`prose` lists what the script left to the references — the seven tools on
`all`, a pack's string entries on `apply-entries`. `notes` are things said,
not asked: a pin already held, a path another source owns left alone.

## Arguments

**The script's grammar** — mise, `all`, a pack's entries and `check`:

```text
[preview] mise <verb> [--<flag> <value>]… [--for <requester>] [--answers <id>:<answer>,…]
[preview] mise [--<key> <value>]…                   [--answers …]
[preview] all [--<key> <value>]…                    [--answers …]
[preview] apply-entries --pack <slug> --file <pack.yaml> [--answers …]
check [<tool>]
```

plus `--repo-root` and `--plugin-root`, anywhere. `--key value` and
`--key=value` both read; a flag followed by another flag, or by nothing, is
empty; a flag given twice, or one the call does not take, is refused naming
the valid ones. **A list is comma-separated, no spaces** —
`--members backend,frontend` — and this is the one place that spelling is
stated. A value holding a space is one shell argument, quoted for the shell;
a value starting with `"` is read as a TOML basic string — what that means is
[what a call may carry](references/mise.md#what-a-call-may-carry).

- **`mise <verb>`** runs one of mise's verbs —
  [`add-tool`, `add-env`, `set-env`, `add-alias`, `upgrade`,
  `remove`](references/mise.md#4-the-verbs). `mise` with no verb lands mise's
  base alone, exactly as `all` would, with the same keys.
- **`all`** lands every tool in the table above, in table order: the script
  lands mise and returns the other seven under `prose`, which you then land as
  each reference's `all` section says — so `git`, `graphify` and `renovate`
  land after the five gate tools, and `renovate` only on
  `--update-bot renovate`.
- **`apply-entries`** runs a pack's whole `tool-config:` list: each structured
  entry (`{tool: mise, verb: add-tool, …}`) as that verb `--for <slug>`, each
  string entry returned under `prose` for you to run as the word grammar
  below. A malformed entry refuses the whole call, naming it.
- **`check [<tool>]`** is the drift test ([Drift](#drift)). It writes nothing
  and takes no `--answers` and no `preview`.

**`--for <requester>`** names whose lines these are. A pack's calls carry the
pack's slug — `apply-entries` adds it from `--pack` — and a tool's own name is
reserved for the base the skill lands itself (`--for mise`, `--for dprint`
and the rest are refused). A requester is a slug: lowercase letters, digits
and `-` — save `gitignore:<Name>`, the one requester `/vwf:init`'s
ignore-template fallback names ([git's](references/git.md#4-templates)). A
call with no `--for` writes the user's own line, outside every block. Only a
person types one, and it writes on that person's approval; a pack's call and
the materializer always carry a `--for`.

**`all`'s keys are fixed**; the prose references spell each with `_` for the
flag's `-` (`update_bot`):

| Flag                                           | Value                                                           |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `--repo`                                       | the repo's folder slug                                          |
| `--members`                                    | member repo paths, in order; empty where none                   |
| `--linkage`                                    | `siblings` or `submodule`                                       |
| `--merge-model-develop`, `--merge-model-main`  | `direct` or `pr`                                                |
| `--runtimes`                                   | language keys — `node`, `python`, `dart`, `go`, `rust`, `swift` |
| `--plugin-sources`                             | `<source-ref>\|<name>` rows; empty on none                       |
| `--plugins`                                    | `<name>@<marketplace>` rows; empty on none                      |
| `--forge`, `--secrets`, `--update-bot`         | the three conditional answers, `none` the spelling of no answer |
| `--scopes`                                     | the commit gate's scopes, project ids; empty on none            |

An unknown key is refused. A key left out keeps the value the repo already
carries, else its default: each tool's reference states one for every key it
reads. So a caller re-passing one changed answer re-passes the rest
unchanged, and the run shows the one row that moved.

**`all` is idempotent.** A second run with the same arguments over an
unchanged repo writes nothing and shows no row. It is also the migration: a
repo whose files predate a tool's current layout is brought onto it by the
same call, each fold, move and delete one row — the reference names what it
reads.

**The prose tools' word grammar**, until they move onto the script:

```text
[preview] <tool> <instruction> [for <requester>] [answers=<id>:<answer>,…]
[preview] <tool> key=value [key=value …] [answers=<id>:<answer>,…]
[preview] all add exclude [generated] <path> … [for <requester>] [answers=…]
```

`<tool> <instruction>` runs one verb of that tool's reference; an instruction
no verb matches is refused, naming the verbs. Every tool also takes
`remove <requester>`. `answers=` is always the last argument and never
carried by a `preview`. The third shape is
[the one cross-tool verb](#the-one-cross-tool-verb).

**`preview`** builds the rows the same call would show — every create, write,
fold, move and delete, every drift row and every conflict row — and returns
them, writing nothing: no file, no lock entry, no question asked. It is how a
caller that gathers one consent for a whole plan shows the skill's rows inside
it ([Consent and the rows](#consent-and-the-rows)). A pack's `tool-config:`
list never carries it; the materializer adds it.

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
other is a directory (`node_modules`, `.venv`); both match at any depth.
`generated` is for a tree a tool writes and no one reviews, never a lockfile
or authored source. An exclude asked of one tool alone —
`dprint add exclude …` — is refused, naming this verb. Its removal is
`remove <requester>` on each tool it wrote.
The spelling each list takes is in
[dprint's](references/dprint.md#3-the-exclusion-set),
[pre-commit's](references/pre-commit.md#3-the-global-exclude) and
[gitleaks'](references/gitleaks.md#2-the-allowlist) references.

## Blocks

**Each requester's lines sit between its own markers**, in each file it wrote
to. The script writes mise's this way; for the seven prose tools, this section
is the rule you write them by.

```toml
# >>> swiftui
XCODE_VERSION = ""
# <<< swiftui
```

The base the skill lands for a tool is that tool's own block — `# >>> mise`,
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
format check. **`.gitignore` is the one exception**: its entries keep written
order, so a negation follows the pattern it re-includes
([git's rule](references/git.md#3-the-ignore-files-rules)).

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
overwritten only on a row that person settled — a conflict row, a migration
row moving their own line into its new file, or the delete row `all` raises
for a line that ignores a lock file. A file whose format has no comments —
plain JSON — carries no markers; the lock entry records which keys each
requester wrote instead.

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
nor any verb writes it back — the script leaves it and says so in `notes`.
Only a migration step that names that exact source takes such a path over —
deleting an old lock or an old pack fragment — and the path's entry goes with
it.

## Consent and the rows

**Every call shows before it writes.** It builds its rows — each file it would
create, write, fold, move or delete, and each block that drifted — and writes
nothing until they are approved. A caller that gathers one consent for a whole
plan — `/vwf:init`'s plan, the materializer's dry-run — runs each call as
`preview` first, shows the returned rows inside its own consent, then runs the
calls with the answers it gathered; the skill asks no second time. A call
typed by a person is its own consent round. **The script refuses a call that
would show rows and carries no `--answers`** — exit 2, the rows returned —
and that refusal stands in for the preview, so the same call can be answered
next.

A call that would write a pin, an env key, an alias name or a hook id another
block or a user line already holds with a different value is a **conflict
row** — never a silent overwrite — settled by the user as the tool's
reference says. `all` raises one for each tool its base block pins that the
repo already pins: `keep-existing` keeps the repo's version, `overwrite`
takes the base's pin, resolved to an exact version, and the winner is pinned
once. `all` also raises one **delete row**, answered `ok`, for each
`.gitignore` line, in a block or the user's, that ignores a lock file other
than `mise.local.lock` ([git's lock rule](references/git.md#3-the-ignore-files-rules)).
The same list entry — a plugin, an exclude, an ignore — asked for twice is
not a conflict: it is [shared](#blocks).

**How the answers come back.** Rows are numbered `r1`, `r2`, … in order, and
each carries the answer names it takes — relay them as given:

| Row                                    | Answers                             |
| -------------------------------------- | ----------------------------------- |
| a create, write, delete, share         | `ok`                                |
| a fold, a move                         | `ok`                                |
| a lock-ignoring line's delete          | `ok`                                |
| drift                                  | `take-theirs`, `keep-mine`, `merge` |
| a tool, env, alias or hook clash       | `keep-existing`, `overwrite`        |
| `set-env` finding a key outside        | `move-in`, `keep-both`              |
| … in the block's own file              | `move-in`, `keep-existing`          |
| a commit type outside the ten          | `rename-<type>`, `keep-existing`    |
| `upgrade` — one per changed pin        | `ok`, `keep`                        |
| `hoist` — a pin two env files hold     | `ok`, `keep-existing`               |
| `needs-edit`                           | `done`, `skip`                      |

The real call then carries `--answers <id>:<answer>,<id>:<answer>` — no
spaces; `answers=…` last, for the word grammar. The call is rebuilt and must
match: the answers name exactly the ids the rebuilt rows carry, each with one
of that row's answers, and no row's content changed since the preview — the
script keeps each preview's rows in the repo's git directory, never in the
tree. A missing id, an unknown id, a wrong answer name, or a changed row
refuses the **whole call**: nothing is written, and the rows are shown again.
**A call that carries matching answers asks nothing.**

**One numbered set on `all`.** Until the seven prose tools move onto the
script, `all` is two halves: the script's preview returns mise's rows,
`r1` … `rN`, and the seven tools under `prose`; build each prose tool's rows
from its reference and number them on from `r<N+1>`. Show the one set. Then
pass the script only its own ids, and apply the prose rows on their answers.

**A `needs-edit` row is a change the script will not guess at** — a root mise
config to split, a `merge` answer to combine, a file it cannot parse. It names
the file, why, and the target layout. Either answer writes nothing for that
row: `done` when you make the edit in this round, `skip` when the person
declined it and the file stays as it is. Make the edit as the tool's
reference says — mise's is
[what you edit by hand](references/mise.md#what-you-edit-by-hand) — then
re-run the same call's `preview`, answer what it returns, and finish with
`check`; the file is settled when neither shows a row for it. A `merge`
answer comes back the same way: the written call returns a `needs-edit` row
carrying the requester's version, and you combine the two by hand.

## Drift

**A block that differs from what its requester would write now is drift.**
For mise, the script decides: **`check`** renders what each recorded block's
requester would write now and compares it with the file, one `drift` row per
differing block, the two versions side by side (`theirs` beside `mine`), and
one `needs-edit` row for a recorded file that is missing or whose markers do
not balance. `check` writes nothing; its `prose` lists the recorded tools it
left to their references. A drift row is settled by re-running the call that
wrote the block — `all` for a base, the pack's `apply-entries` — and
answering it:

- **take-theirs** — the block is rewritten as the requester would write it;
- **keep-mine** — the block stays as it stands for this run; nothing records
  the answer, so the next run that finds the same difference asks again;
- **merge** — a `needs-edit` row: combine the two by hand.

The skill never picks one for the user.

**For the prose tools**, compare by content: outside quoted strings the words
are compared, so spacing and line breaks are never drift; a quoted string is
compared exactly. **One exception**: a fetched template's block is compared by
the lock's `written:` hash of its lines as last written, trailing whitespace
trimmed ([git's templates](references/git.md#4-templates)).

**Three things are never drift**, scripted or not. A marked position filled
from an argument is the argument's, so a changed argument is a changed row,
shown as the change. A machine value — a key named in the requesting pack's
`machine_env:` list in its `pack.yaml` under
`${CLAUDE_PLUGIN_ROOT}/stacks/*/<requester>/`, whatever value it holds — is
the machine's, and the comparison skips it. And a line outside every block is
not compared at all.

## Removal

`remove` deletes every block one requester holds across a tool's files, and
nothing else: the user's lines and the other blocks stay byte for byte. A
file left empty is deleted, and a shared entry moves as [Blocks](#blocks)
says. For mise it is `mise remove --for <requester>`; for a prose tool,
`<tool> remove <requester>`. The materializer calls it once per tool a
dropped pack's `tool-config:` list called — for an `all add exclude` line,
once on each of `dprint`, `pre-commit` and `gitleaks`. A tool's own base is
not removable this way — a repo that stops using the tool deletes its files
by hand.

## The lock record

Every path the skill writes is one entry in stackgen's lockfile,
`.claude/stackgen/lock.yaml`, in the materializer's shape
(`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`). The script writes mise's
entries in the same step as the files; for a prose tool you write them, in
this shape:

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
  - path: .gitignore
    source: tool-config/git@<stackgen version>
    hash: <content hash after the write>
    blocks: [git, graphify, pnpm]
    templates: # the upstream commit each fetched template is pinned to
      pnpm: { Node: <sha>, written: <block hash> }
```

`<stackgen version>` is this plugin's own, from
`${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`. The hash is the sha256 of
the file as written, for the callers that test a repo's shape —
`/vwf:doctor` and `/vwf:init` — and is re-recorded on every write; the drift
test never reads it. A JSON file's entry carries `keys:` beside `blocks:`,
one list per requester. An entry with a shared line carries `shares:`, the
entry against every requester that asked for it, the holder first. An entry
holding a fetched template carries `templates:`, the commit each was fetched
at, moved only inside the upgrade round
[git's templates](references/git.md#4-templates) describes, and the hash of
the block as last written. A path the skill deletes loses its entry. The
entry is written in the same step as the file, so the two never disagree.

## What it never does

- Writes a line outside a block for a pack's call or the materializer, or a
  path another source owns.
- Resolves a drifted block, a conflict row or a `needs-edit` row without the
  user's answer.
- Writes a pin that is not an exact version, or adds a tool with a bare
  `mise use` — never; the pin is written into the config, then installed.
- Commits. The caller commits what it landed, the way it commits everything
  else.
