# The Bootstrap Handoff

The toolchain of a repo — its tool pins, its generic tasks
(`setup:deps:<tool>`, `code:format:<tool>`, `code:lint:<tool>`), its
gate configs and its pre-commit hooks — is not stackgen's. It is
[bootstrap](https://github.com/virajp/bootstrap)'s: the repo selects tools
through the `bootstrap` CLI, and bootstrap's sync writes their files. A
pack names no bootstrap tool. This file is how stackgen finds the tools a
composition needs and asks bootstrap for them. Every call below follows
the contract in `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`.

Read it from the materializer (step 1 and step 5), from
`/stackgen:stackgen-sync`, and on the removal of a pack.

## The rule

**stackgen never writes a file in `.config/bootstrap/`, and never names a
bootstrap tool from memory.** It reads the tools from
`bootstrap catalog --json`, and it asks for them with
`bootstrap add tool` and `bootstrap remove tool`. A tool name that is not
a `name` of the catalog's `data.tools` is never sent. The Claude plugins
alone still go as instructions to bootstrap's `docs/sync/vwf.md`, read
from a clone of bootstrap.

## Steps

1. **The repo must have adopted bootstrap.** Run the contract check of
   the contract asset; when it fails, stop with that asset's hint. Then
   run its shaped test, `bootstrap config get repo.format --json`; on
   code 2, show the envelope's `errors` messages as bootstrap gives them
   and stop the whole landing set before anything is written: the tasks a
   pack lands source bootstrap's `_scripts/helpers`, and they fail
   without it.

2. **Read the catalog:**

   ```bash
   mise x -- bootstrap catalog --json
   ```

   Its `data.tools` holds each tool with its `name`, `category`,
   `description`, `questions` and `defaults`; `data.packs` holds the
   packs. A failed call — code 5, a stale clone offline, among them —
   stops the handoff line, not the landing set: the plan shows the
   envelope's `errors`, and every other line lands.

3. **Choose the tools.** For each component of the composition, choose
   from `data.tools` the tools that its `pack.yaml` facts (`languages`,
   `package_manager`, `lockfile`, the `mise_tool` and `binaries` facts)
   and its conventions call for, by each tool's `category` and
   `description`. A tool that a chosen tool depends on is bootstrap's to
   add, not yours: send only the tools a component names directly.

4. **Collect the plugins.** A component's `conventions.md` may hold a
   `## Claude plugins` section, one line for each plugin:
   `<name>@<marketplace>`, the source of its marketplace, and the scope
   (`user` or `project`). Collect them. A plugin always goes through this
   handoff: the local plugin `vwf-tools` holds servers only. A
   `## MCP servers` section is **never** handed to bootstrap — only
   `## Claude plugins` is; an MCP server is the user's to install.

5. **Subtract what the repo has.** Run `bootstrap describe --json`. A
   tool whose `name` is in its `data.tools` — selected on its own, or
   through a pack — and a plugin that the `claude` tool's `values` already
   list under `plugins.<scope>` get no call. What is left is the delta.

6. **Plan the delta.** For the tools, run:

   ```bash
   mise x -- bootstrap add tool <tool>… --json --dry-run
   ```

   It writes nothing. Its `data.plan` holds the changes, the files of
   the sync and, in `pending`, each question with no answer; a warning of
   the envelope goes with it. For the plugins, clone bootstrap — only
   when the delta holds a plugin — with no file content until read, into
   a temporary directory, removed when the handoff ends:

   ```bash
   tmp=$(mktemp -d)
   git clone --quiet --filter=blob:none https://github.com/virajp/bootstrap.git "$tmp"
   ```

   and write the plugin instructions in the format of `docs/sync/vwf.md`
   in the clone — one instruction for each verb and scope, each with its
   `reason:` line naming the components:

   ```text
   bootstrap: add user plugins [<name>@<marketplace>=<source>, …]
   reason: stackgen pinned <slug> (<component ref>, …)
   ```

   Read the format from the clone each time; the lines above show its
   shape on the day this was written, not a contract. A failed clone
   stops the plugin instructions alone.

7. **Show them at the consent gate** — the materializer's step 3, or
   sync's plan — as their own consent line: the tools to add, for each
   tool the component that needs it, the files the dry run lists, each
   pending question with its default, and each plugin instruction as it
   will be sent. Ask each pending question there. Declining the line
   sends nothing, and the plan says what is absent: the tasks the tools
   ship, and the pins.

8. **Send them.** On consent, run the same call again with `--yes` and
   one `--answer <tool>.<key>=<value>` for each answer of step 7:

   ```bash
   mise x -- bootstrap add tool <tool>… --json --yes --answer <tool>.<key>=<value>
   ```

   It writes the values and runs the sync; it commits nothing. Then read
   `docs/sync/vwf.md` in the clone and do what it says, with the plugin
   instructions of step 6. Every file either changes joins the
   materializer's one commit. A stop bootstrap reports — a non-zero
   `code`, with its `errors` — is shown to the user as it is, and nothing
   more is sent.

9. **Record what was sent** in the lockfile's `bootstrap:` block
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`): each tool and plugin
   this handoff added, with the components that needed it. A tool the repo
   selected before is never recorded — it is the repo's, not stackgen's.

10. **Remove the clone**, when step 6 made one: `rm -rf "$tmp"`.

## Removal

When a pack leaves the composition, find each tool and plugin in the
lockfile's `bootstrap:` block whose list of components holds only that
pack's components. For those tools, run
`bootstrap remove tool <tool>… --json --dry-run`, then, on consent, the
same call with `--yes`; for those plugins, send
`bootstrap: remove <scope> plugins […]` through the clone's
`docs/sync/vwf.md`. Both go through steps 1, 7, 8 and 10, then their
records are dropped. A tool or plugin that another component still needs
keeps its record, without the removed components. A tool with no record
is never removed: stackgen did not add it.

A dropped addon's removal is this section, called by
[the materializer](materializer.md#removing-a-component). Its calls and
instructions are shown inside that call's one consent rather than on a
line of their own, and step 8's files join its one commit.

**A plugin that another repo of the product claims through an `addon` pack
is not removed** — `taste-skill@taste-skill` through the base repo's
`addon/taste-skill` is the case. A member repo reads the base repo's lockfile
for that claim. The plugin keeps its record, and no `remove` is sent; where the
base repo is not cloned locally the claim cannot be read, so nothing is sent
and the plan says so.
