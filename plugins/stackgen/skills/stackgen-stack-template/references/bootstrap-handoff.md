# The Bootstrap Handoff

The toolchain of a repo — its tool pins, its generic tasks
(`setup:deps:<tool>`, `code:format:<tool>`, `code:lint:<tool>`), its test
tasks, its gate configs, its pre-commit hooks and its LSP servers — is not
stackgen's. It is [bootstrap](https://github.com/virajp/bootstrap)'s: the
repo selects tools through the `bootstrap` CLI, and bootstrap's sync writes
their files. A pack names no bootstrap tool; a bundle names the ones it
needs under `tools:`. This file is how stackgen asks bootstrap for them.
Every call below follows the contract in
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`.

Read it from the materializer (step 1 and step 5), from
`/stackgen:stackgen-sync`, and on the removal of a slug.

## The rule

**stackgen never writes a file in `.config/bootstrap/`, and never names a
bootstrap tool from memory.** A tool name comes from a bundle's `tools:`,
and it is sent only when it is a `name` of `data.tools` of
`bootstrap catalog --json`. stackgen asks for tools with
`bootstrap add tool` and `bootstrap remove tool`. An addon is no part of
this handoff: it is a Claude plugin listed in
`${CLAUDE_PLUGIN_ROOT}/assets/addons.yaml`, which vwf's setup declares in
the `claude` tool's `plugins.project` and installs with `setup:ai`, and no
pack names one.

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

3. **Check the bundle's tools.** Each name of the bundle's `tools:` must be
   a `name` of `data.tools`; a name that is not is shown in the plan as
   unknown to bootstrap and never sent. A tool that a named tool depends on
   is bootstrap's to add, not yours: send only the tools the bundle names.

4. **Subtract what the repo has.** Run `bootstrap describe --json`. A
   tool whose `name` is in its `data.tools` — selected on its own, or
   through a bootstrap pack — gets no call. Any non-zero exit stops the
   handoff before the consent, with the envelope's `errors` as bootstrap
   gives them. What is left is the delta.

5. **Plan the delta:**

   ```bash
   mise x -- bootstrap add tool <tool>… --json --dry-run
   ```

   Each `<tool>` is a name that step 3 found in the catalog and that passes
   the name check of `## Passing values` of
   `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`.

   It writes nothing. Its `data.plan` holds the changes, the files of
   the sync and, in `pending`, each question with no answer; a warning of
   the envelope goes with it.

6. **Show it at the consent gate** — the materializer's step 3, or
   sync's plan — as its own consent line: the tools to add, for each
   tool the bundle that names it, the files the dry run lists, and each
   pending question with its default. Ask each pending question there.
   Declining the line sends nothing, and the plan says what is absent: the
   tasks the tools ship, the pins and the servers.

7. **Send it.** On consent, run the same call again with `--yes` and
   one `--answer` for each answer of step 6. Quote each one per
   `## Passing values` of `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`:
   the value in the form `bootstrap questions --json` shows, each `'`
   replaced with `'\''`, and the whole `<tool>.<key>=<value>` argument in
   single quotes. An answer that holds a backslash or a control character is
   not sent, and the report names its key:

   ```bash
   mise x -- bootstrap add tool <tool>… --json --yes --answer '<tool>.<key>=<value>'
   ```

   It writes the values and runs the sync; it commits nothing. A stop
   bootstrap reports — a non-zero `code`, with its `errors` — is shown to
   the user as it is, and nothing more is sent. The handoff commits
   nothing itself: every file the call changes joins the materializer's
   one commit.

8. **Record what was sent** in the lockfile's `bootstrap:` block
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`): each tool this handoff
   added, with the slugs that needed it. A tool the repo selected before is
   never recorded — it is the repo's, not stackgen's.

9. **Report** what step 7 did not finish: a stop, with the tools it left
   unsent.

## Removal

When a slug is removed, find each tool in the lockfile's `bootstrap:` block
whose list holds only that slug. For those tools, run
`bootstrap remove tool <tool>… --json --dry-run`, then, on consent, the
same call with `--yes` and each answer as a quoted
`--answer '<tool>.<key>=<value>'`, both per `## Passing values` of
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`: each `<tool>` passes
its name check, and each answer is quoted as step 7 says. Both go through
steps 1, 6, 7 and 9, then their records are dropped. A tool that another
slug still needs keeps its record, without the removed slug. A tool with no
record is never removed: stackgen did not add it.

A removal called by [the materializer](materializer.md#removing-a-component)
shows its calls inside that call's one consent rather than on a line of
their own, and step 7's files join its one commit.

**A `bootstrap.plugins` record an older stackgen wrote** — the
`taste-skill@taste-skill` claim of the retired `addon/taste-skill` pack is
the case — is no longer this handoff's. `/stackgen:stackgen-sync` drops it
once, with the addon rows, and sends nothing: the plugin stays as bootstrap
lists it.
