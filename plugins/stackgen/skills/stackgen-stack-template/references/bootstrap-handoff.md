# The Bootstrap Handoff

The toolchain of a repo — its tool pins, its generic tasks
(`setup:deps:<tool>`, `code:format:<tool>`, `code:lint:<tool>`), its
gate configs and its pre-commit hooks — is not stackgen's. It is
[bootstrap](https://github.com/virajp/bootstrap)'s: the repo selects tools
in `.config/bootstrap.toml`, and `mise run setup:configs` syncs their
files. A pack names no bootstrap tool. This file is how stackgen finds the
tools a composition needs and asks bootstrap for them.

Read it from the materializer (step 1 and step 5), from
`/stackgen:stackgen-sync`, and on the removal of a pack.

## The rule

**stackgen never edits `.config/bootstrap.toml`, and never names a
bootstrap tool from memory.** It reads the tools from a fresh clone of
bootstrap, and it gives its instructions to bootstrap's
`docs/sync/vwf.md`, which edits the file and runs the sync. A tool name that
is not a folder of the clone's `tools/` is never sent.

## Steps

1. **The repo must have adopted bootstrap.** With no
   `.config/bootstrap.toml` at the repo root, stop the whole landing set
   before anything is written: the tasks a pack lands source bootstrap's
   `_scripts/helpers`, and they fail without it. Name the remedy —
   `/vwf:setup reshape`, which adopts bootstrap — and return.

2. **Clone bootstrap.** A shallow clone into a temporary directory,
   removed when the handoff ends:

   ```bash
   tmp=$(mktemp -d)
   git clone --quiet --depth 1 https://github.com/virajp/bootstrap.git "$tmp"
   ```

   A failed clone stops the handoff line, not the landing set: the plan
   names the failure, and every other line lands.

3. **Choose the tools.** Read `tools/packs.toml`, each
   `tools/<tool>/tools.toml` and each `docs/sync/tools/<tool>.md` in the
   clone — the last says when its tool is relevant. For each component of
   the composition, choose the tools that its `pack.yaml` facts
   (`languages`, `package_manager`, `lockfile`, the `mise_tool` and
   `binaries` facts) and its conventions call for. A tool that a chosen
   tool `depends` on is bootstrap's to add, not yours: send only the
   tools a component names directly.

4. **Collect the plugins.** A component's `conventions.md` may hold a
   `## Claude plugins` section, one line for each plugin:
   `<name>@<marketplace>`, the source of its marketplace, and the scope
   (`user` or `project`). Collect them.

5. **Subtract what the repo has.** A tool that `.config/bootstrap.toml`
   already selects — its own `[tools.<tool>]` table, or through a pack —
   and a plugin it already lists under `[claude.plugins.<scope>]` get no
   instruction. What is left is the delta.

6. **Write the instructions** in the format of `docs/sync/vwf.md` in the
   clone — one instruction for each verb and scope, each with its
   `reason:` line naming the components:

   ```text
   bootstrap: add tools [<tool>, …]
   reason: stackgen pinned <slug> (<component ref>, …)
   ```

   Read the format from the clone each time; the lines above show its
   shape on the day this was written, not a contract.

7. **Show them at the consent gate** — the materializer's step 3, or
   sync's plan — as their own consent line: each instruction as it will be
   sent, and for each tool the component that needs it. Declining the line
   sends nothing, and the plan says what is absent: the tasks the tools
   ship, and the pins.

8. **Send them.** On consent, read `docs/sync/vwf.md` in the clone and do
   what it says, with the instructions of step 6. It edits
   `.config/bootstrap.toml` and runs `mise run setup:configs`; it commits
   nothing. Every file it changes joins the materializer's one commit. A
   stop it reports is shown to the user as it is, and nothing more is sent.

9. **Record what was sent** in the lockfile's `bootstrap:` block
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`): each tool and plugin
   this handoff added, with the components that needed it. A tool the repo
   selected before is never recorded — it is the repo's, not stackgen's.

10. **Remove the clone:** `rm -rf "$tmp"`.

## Removal

When a pack leaves the composition, find each tool and plugin in the
lockfile's `bootstrap:` block whose list of components holds only that
pack's components. Send `bootstrap: remove tools […]` and
`bootstrap: remove <scope> plugins […]` for those, through steps 2, 7, 8
and 10, then drop their records. A tool or plugin that another component
still needs keeps its record, without the removed components. A tool with
no record is never removed: stackgen did not add it.
