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
a `name` of the catalog's `data.tools` is never sent. A Claude plugin is a
value of the `claude` tool, written with `bootstrap config set` and
`bootstrap config unset`, and `mise run setup:ai` installs or uninstalls
it.

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
   through a pack — gets no call. For each scope a plugin of step 4
   names, read what the `claude` tool already lists:

   ```bash
   mise x -- bootstrap config get tools.claude.plugins.<scope> --json
   ```

   A plugin whose `<name>@<marketplace>` is a key of its `data` gets no
   call. `data` is `null` for an unset key or a `claude` tool the repo
   does not select: that is an empty list, and every plugin goes on. Any
   non-zero exit stops the handoff before the consent, with the
   envelope's `errors` as bootstrap gives them. A plugin that
   `claude plugin list --json` shows installed at its scope for this repo
   also gets no call, so stackgen never takes over a hand install: an
   entry counts when its `enabled` is true and either its scope is
   `user`, or its `projectPath` is this repo's main checkout or one of
   its worktrees (`git worktree list`). What is left is the delta.

6. **Plan the delta.** For the tools, run:

   ```bash
   mise x -- bootstrap add tool <tool>… --json --dry-run
   ```

   It writes nothing. Its `data.plan` holds the changes, the files of
   the sync and, in `pending`, each question with no answer; a warning of
   the envelope goes with it. For the plugins, when the delta holds one
   and `data.tools` of `bootstrap describe --json` does not list
   `claude`, plan that tool first, the same way:

   ```bash
   mise x -- bootstrap add tool claude --json --dry-run
   ```

   Then write down, for each plugin of the delta, the call step 8 makes
   — the key segment double-quoted, the value a JSON string:

   ```bash
   mise x -- bootstrap config set tools.claude.plugins.<scope>."<name>@<marketplace>" '"<source>"' --json
   ```

7. **Show them at the consent gate** — the materializer's step 3, or
   sync's plan — as their own consent line: the tools to add, for each
   tool the component that needs it, the files the dry run lists, each
   pending question with its default, the `claude` tool when step 6
   plans it, and each plugin's `config set` call as it will run, with the
   components that need it and the `mise run setup:ai` that follows.
   Ask each pending question there. Declining the line sends nothing,
   and the plan says what is absent: the tasks the tools ship, the pins,
   and the plugins.

8. **Send them.** On consent, run the same call again with `--yes` and
   one `--answer <tool>.<key>=<value>` for each answer of step 7:

   ```bash
   mise x -- bootstrap add tool <tool>… --json --yes --answer <tool>.<key>=<value>
   ```

   It writes the values and runs the sync; it commits nothing. A stop
   bootstrap reports — a non-zero `code`, with its `errors` — is shown to
   the user as it is, and nothing more is sent. Then, for the plugins,
   run `bootstrap add tool claude --json --yes` when step 6 planned it,
   each `config set` call of step 6, and once they all pass:

   ```bash
   mise run setup:ai
   ```

   It installs what the `claude` tool lists. When `add tool claude --yes`
   or a `config set` fails, stop before `setup:ai` and show bootstrap's
   `errors`; a failed call writes nothing, and nothing is written for
   that plugin step. When `setup:ai` exits 1, keep the written keys: they
   are the desired state, and the next `setup:ai` tries again. The report
   says that the install failed. The handoff commits nothing itself:
   every file these calls change joins the materializer's one commit.

9. **Record what was sent** in the lockfile's `bootstrap:` block
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`): each tool and plugin
   this handoff added, with the components that needed it — a plugin
   whose key was written is recorded even when `setup:ai` failed. A tool
   the repo selected before is never recorded — it is the repo's, not
   stackgen's.

10. **Report** what step 8 did not finish: a `setup:ai` that exited 1,
    with the plugins it left uninstalled, and, on a removal, each
    `user`-scope plugin that stays installed.

## Removal

When a pack leaves the composition, find each tool and plugin in the
lockfile's `bootstrap:` block whose list of components holds only that
pack's components. For those tools, run
`bootstrap remove tool <tool>… --json --dry-run`, then, on consent, the
same call with `--yes`; for each of those plugins, run

```bash
mise x -- bootstrap config unset tools.claude.plugins.<scope>."<name>@<marketplace>" --json
```

then, once every unset passes, `mise run setup:ai`, which uninstalls a
`project`-scope plugin it recorded. A `user`-scope plugin stays
installed, and the report says so. A failed unset stops before
`setup:ai` with bootstrap's `errors`, and that plugin keeps its record.
When `setup:ai` exits 1, the key stays unset, and bootstrap keeps the
plugin in its own record until an uninstall succeeds. Both go through
steps 1, 7, 8 and 10, then their records are dropped. A tool or plugin
that another component still needs keeps its record, without the removed
components. A tool with no record is never removed: stackgen did not add
it.

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
