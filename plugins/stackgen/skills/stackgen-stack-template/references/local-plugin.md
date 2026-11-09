# The Local Plugin

The tier-3 target — how stackgen actually writes and registers
`~/.claude/plugins/local/vwf-tools/`, the one local plugin that holds every
LSP server this machine's repos materialized — LSP servers only. The
**contract** (why it exists, the consent tier, the lockfile key) is
`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`; the host rules a declaration
must satisfy are `${CLAUDE_PLUGIN_ROOT}/assets/artifact-doctrine.md` §5.
This is the procedure both of those describe.

Read it from [the materializer](materializer.md) step 4 and its removal and
claims sections, and from `/stackgen:stackgen-sync` when a lockfile carries a
`local_plugin` block or the old plugin's directory exists ([the migration](#migrating-from-stackgen-lsp)).

**Nothing here is repo state.** Every path below is on the developer's
machine. A collaborator who pulls the commit gets the `local_plugin`
lockfile block and nothing else — say that at the gate, every time.

## What a component declares

One key, landing in this plugin's manifest:

| Pack key       | Lands in                        | Consent |
| -------------- | ------------------------------- | ------- |
| `lsp_servers:` | the local plugin's `lspServers` | tier 3  |

It is user-scoped: the machine's, never the repo's. **No MCP server lands
here.** The `user_mcp_servers:` key is retired, as the project-scoped
`mcp_servers:` key that wrote a repo's `.mcp.json` was before it: the user
owns every MCP install, and a pack that needs a server names it in its
`conventions.md`'s `## MCP servers` section
(`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). An MCP key an older stackgen
left in this manifest is someone's, merged around and never rewritten, until
`/vwf:setup`'s machine cleanup removes it through
[`remove: key <name>`](materializer.md#removing-a-component).

Each `lsp_servers:` entry is a complete manifest entry, verbatim as it
will appear under `lspServers`:

```yaml
lsp_servers:
  <server-name>:
    command: <binary>
    args: [ … ]
    extensionToLanguage: { ".<ext>": <language id> }
    startupTimeout: <ms>
```

`command` is the binary and `args` is the list after it, verbatim — never
fold the two into one shell string. Where the binary is a tool runner,
the tool it runs is the first `args` element, not part of `command`.

**An entry with no `extensionToLanguage` map is invalid output and is
never written** — not a warning, not a default filled in. The map is the
only thing that keeps a user-scoped declaration from starting a server in
every repo on the machine, so a component that cannot supply one has not
declared a server. Halt and name the component.

Generation emits these under the same rule it emits everything else: the
component declares, the materializer writes. The generator itself never
writes a manifest (`generator.md` step 4).

**A generated declaration bound for `vwf-tools` is researched from fresh
sources**, resolved from the technology's name by the generator's own research
channel, at first generation and at every regeneration alike. Its `command`,
`args` and `env` never come from a citations file or any other text the
repo holds: whoever wrote the repo wrote those, and this declaration runs in
every repo on the machine.

## The two files

Both under `~/.claude/plugins/local/vwf-tools/.claude-plugin/`. The
path and both names are **fixed** — never assembled from the stack pin,
per `artifact-doctrine.md` §3.

`plugin.json` — the union across every repo that has materialized here:

```json
{
  "$schema": "https://www.schemastore.org/claude-code-plugin-manifest.json",
  "name": "vwf-tools",
  "version": "0.1.0",
  "description": "The one local plugin that holds every LSP server this machine's repos materialized. Generated — edit the pins, not this file.",
  "lspServers": {}
}
```

`marketplace.json` — a single-plugin directory marketplace pointing at
its own root:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-marketplace.json",
  "name": "vwf-tools",
  "owner": { "name": "stackgen" },
  "plugins": [
    { "name": "vwf-tools", "source": "./", "version": "0.1.0" }
  ]
}
```

Two spellings there are load-bearing and silent when wrong. **`source`
must be `"./"`** — it resolves against the marketplace root, which is the
directory holding `.claude-plugin/`, not `.claude-plugin/` itself. And
**the entry must state its own `version`**: omitting it does not leave
the version unset, it resolves by accident and the plugin lists as
`0.0.0`. Keep it equal to the manifest's.

**Bump both versions on every manifest change**, patch-wise. A manifest
already registered is served from what Claude read at registration time,
so a second repo's servers land in the file and never reach a session
until the marketplace is re-read. That is the failure mode this whole
target exists to avoid, arriving through the back door — so when the
manifest changed and the plugin was already registered, print:

```sh
claude plugin marketplace update vwf-tools
claude plugin update vwf-tools@vwf-tools
```

and ask, on the same terms as the registration pair below.

## The claims file

`~/.claude/plugins/local/vwf-tools/.claude-plugin/claims.json` maps each
`lspServers` key to the absolute paths of the repos that claim
it, so one repo's removal never takes a server another repo still uses. It
sits inside the manifest folder because that folder is the only place
stackgen writes outside a repo.

```json
{
  "typescript-lsp": ["/abs/path/to/repo-a", "/abs/path/to/repo-b"],
  "kotlin-lsp": ["/abs/path/to/repo-a"]
}
```

- **It is written beside the manifest, in the same consented step.** A
  materialization adds this repo's path to every key this repo contributes,
  new and already-present alike; a conflict key gets no path. A removal drops
  this repo's path and deletes the key from the manifest only when its list is
  then empty ([removal](#removal--by-subtraction)).
- **An absent claims file means every key is unclaimed and kept**, and so does
  a key the file does not list.
- **Any write first drops a claimed repo path that no longer exists on disk.**
  A key this leaves with an empty list and that the write's own removal does
  not touch leaves the claims file and stays in the manifest, unclaimed.
- **A key no repo claims is never deleted automatically.** `/vwf:doctor`
  reports it as drift.

## The merge — it merges, never owns

Read the existing `plugin.json` if there is one; treat every key in it as
someone's. For each key this repo contributes, classify it, and report
the classification at the gate:

| State                   | Condition                                                     | Action                      |
| ----------------------- | ------------------------------------------------------------- | --------------------------- |
| **new**                 | the key is absent                                             | add it                      |
| **already present**     | the key exists, identical declaration                        | leave it; claim it in the lockfile |
| **ours, changed**       | the key exists and `claims.json` lists this repo's path       | rewrite it                  |
| **conflict**            | the key exists with a different declaration, unclaimed by us  | **do not write**; report it |

**"Ours" is read from `claims.json`, never from the lockfile.** The claims file
lives on this machine; the lockfile is committed, so whoever wrote the repo
wrote it, and a key it merely names is unclaimed by us. A rewrite only ever
writes what a shipped pack declares or a generator run on this machine emitted,
never a declaration read from a repo file.

A conflict is a real outcome, not an error to route around: another repo
pinned a different spelling of the same server name. Say which key, say
that this repo's server will be absent, and land everything else. Never
resolve it by overwriting — the other repo's lockfile claims that key and
would be silently falsified.

Missing directory, missing manifest and empty manifest are all the same
case: create what is absent, then merge into it.

## The two consent items

Gated apart from the repo landing set, and **separately declinable from
each other**. Declining either leaves everything else landed.

**1 — the manifest write.** Show the exact `lspServers` keys, each with its
state from the table above and its full declaration as it would be written:
`command`, `args`, the `env` keys and their values. A key and a state alone
are not consent to a process. The tier-3 consent covers LSP servers only.
Say plainly that this writes outside the repo, onto this machine, at user
scope, that collaborators get none of it, and that a server landing in
`vwf-tools` starts in every repo on this machine whose files match its
extension map, not only the one that picked it. The claims file is written
in this step. Declined → the servers are simply absent; the plan says so and
no `local_plugin` block is written.

**2 — the registration.** Print the two commands and ask. **Never run
them unprompted:**

```sh
claude plugin marketplace add ~/.claude/plugins/local/vwf-tools --scope user
claude plugin install vwf-tools@vwf-tools --scope user
```

Detect the already-registered case first, with the read-only
`claude plugin marketplace list` and `claude plugin list`. Registered
already → skip both and say so; the manifest write is what mattered, and
re-running them is noise. Where `claude` cannot be reached, do not guess
it is registered: print the commands, record `registered: false`, and say
the state could not be read.

Declined → a valid plugin directory nobody has installed. Reprint both
commands for later and record `registered: false`. That is a complete,
resumable state, not a partial landing. The next materialization that
lands an LSP server offers the registration again.

## The lockfile block

Written only when the manifest write was consented — **absent means this
repo contributed nothing, and removal touches the machine not at all**.
The full shape is in `${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`; two
fields decide whether it is right:

- `local_plugin.lsp_servers` lists **only the keys this repo contributed** —
  new and already-present alike (an already-present key this repo also needs
  is claimed by both, which is what keeps the last repo standing from removing
  a server another still uses). A conflict key is claimed by neither.
- Each listed key records its owners, as `{ name: <key>, packs: [ <component ref>, … ] }`.
  A list of bare names, the old shape, is read with owners unknown and
  rewritten on the next sync; `/vwf:doctor` reads the owners from here and
  skips an entry whose owners are unknown.
- `registered:` follows the answer to item 2, never the answer to item 1.

A `local_plugin.mcp_servers` list an older stackgen wrote is an MCP record:
every verb but `remove:` ignores it — it lands no server, adds no claim and
reports nothing — and `/vwf:setup`'s step 26 deletes it.

## Removal — by subtraction

No `local_plugin` block → nothing to do. Otherwise:

1. **Subtract.** For each key this repo's `local_plugin.lsp_servers` names —
   and, for [`remove:`](materializer.md#removing-a-component) alone, its
   `local_plugin.mcp_servers` — drop this repo's path from the key's list
   in the claims file, and delete the key from `plugin.json` only when no repo
   claims it any more. A key the claims file does not list is kept. Every
   other key stays, whoever put it there.
2. **Stop unless the manifest is now empty.** A manifest still holding
   any server is another repo's working wiring. Rewrite it, drop the
   `local_plugin` block, and finish.
3. **Only when no servers remain**, print these and ask, on the same
   terms as the registration pair:

   ```sh
   claude plugin uninstall vwf-tools@vwf-tools --scope user
   claude plugin marketplace remove vwf-tools
   ```

   Both name the marketplace's own `name`, not the directory. On
   success the directory is stackgen's own and is deleted outright: the
   fixed path above, never the lockfile's `local_plugin.path`.
   Declined → leave the empty manifest and the registration in place and
   say so; an empty manifest starts nothing, so the cost of stopping
   here is zero.

The invariant, and it is the same one this toolkit's installer lives by:
**removal removes exactly what was added, and nothing another repo
contributed.**

**One pack leaving, not the whole repo** — a removed component is the case.
Only the keys whose `packs:` list holds no other component are subtracted, by
the steps above. A key another component of this repo still needs stays
claimed, without the pack in its list. A key whose owners are unknown stays
and is reported. Step 2's `local_plugin` block is dropped only when it then
lists no key.

**A key dropped on another machine** — this repo's path is in the claims file
and, after a pull, its lockfile no longer names the key. The steps above run for
that key, behind the normal tier-3 gate, from the `reconcile-claims:` call
[the materializer](materializer.md#reconciling-this-repos-claims) describes,
which `/vwf:setup` makes once per run; there is no lockfile block to change.

## Migrating from stackgen-lsp

This plugin used to be named `stackgen-lsp`. On the first materialization or
sync that finds `~/.claude/plugins/local/stackgen-lsp/` — whatever the repo's
lockfile holds, even no `local_plugin` block — stackgen offers **one tier-3
migration**, before any other local-plugin work, in this order:

1. **Write `~/.claude/plugins/local/vwf-tools/`** with the union of both
   manifests' LSP servers, merged by
   [the table above](#the-merge--it-merges-never-owns) when a `vwf-tools`
   manifest already exists, and the claims file seeded as below.
2. **Register `vwf-tools`**, with the two commands of item 2 above.
3. `claude plugin uninstall stackgen-lsp@stackgen-lsp --scope user`
4. `claude plugin marketplace remove stackgen-lsp`
5. **Delete the old directory.**

Each step checks its own result first and is skipped when already done. Every
`claude` command is printed and asked for, never run unprompted. **When a step
fails or its printed command is declined, stackgen stops and reports**;
`/vwf:doctor` shows the drift, and the next run continues from the first
incomplete step. Both plugins may serve a server in that window. Step 1 is the
manifest write of item 1 above: every server of the union is shown with its
full declaration and the reach of user scope.

**The seed.** The migration writes the current repo's path into the claims
file for each key this repo's lockfile claims and the old manifest holds, only
when the old manifest's declaration of that key matches the shipped pack's, or
the one a generator run emitted on this machine in this same run; a copy in a
repo file is not that record. The lockfile is committed, so naming a key earns
no claim. Any other key stays unclaimed and is kept. The gate lists each seeded
claim. A seed is a claim and carries no declaration; a conflict key gets none.
Other repos add theirs on their next sync. An inherited key no repo claims is
never deleted automatically; `/vwf:doctor` reports it as drift.

**The lockfile, in the same consented step.** A `local_plugin` block that names
`stackgen-lsp` is rewritten to the `vwf-tools` names, `registered:` following
step 2.

**A recorded top-level `mcp_servers` list** names the retired `.mcp.json`
entries. It is an MCP record, so the migration ignores it like every other
verb but `remove:` — it moves no key, writes no declaration, leaves
`.mcp.json` untouched and reports nothing — and `/vwf:setup`'s step 26
deletes the record. **A declaration is never copied out of the repo.**

**Declining the whole offer writes nothing.** `vwf-tools` is not written or
registered and `stackgen-lsp` stays as it is, so no server is served twice.
Newly picked LSP servers land nowhere until the migration is accepted. The
offer comes back on each later
setup or sync; `/vwf:doctor` reports the old directory and the unlanded servers
as drift.

**A lockfile that names `stackgen-lsp` on a machine with no such directory** —
another repo already migrated this machine, or it never had the plugin — is
rewritten to the `vwf-tools` names with no prompt. The repo's servers then merge
into `vwf-tools` behind the normal tier-3 consent, as a first write when
`vwf-tools` does not exist yet.

## No registry, and the fact beside the declaration

stackgen holds **no registry of servers** — a component declares its own,
which is the whole reason the local plugin scales where a curated list
would not. There is nowhere here to look a server up, deliberately: the
pack that needs one carries it, and a server no pack declares is a server
no repo asked for.

A language component's `facts.lsp` and its `lsp_servers:` answer two
different questions and must agree. `facts.lsp` is prose for
`/vwf:doctor` — *how* a server is provided — and where the answer is this
plugin, it says so and names the server key. A pack whose `facts.lsp`
claims a server nobody declares is the dishonest-fact gap the reviewer
already fails.
