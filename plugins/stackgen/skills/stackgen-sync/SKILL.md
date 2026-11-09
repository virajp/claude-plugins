---
name: stackgen-sync
description: Diff the repo's materialized entries — the .claude/ tree and
  the repo config files a component landed — against the
  current component packs (and offer regeneration per generated component),
  presenting the delta for consent — the explicit re-sync that makes drift
  visible without ever overwriting silently. Also diffs the generated local
  plugin on this machine, where the lockfile records one. Run after
  upgrading stackgen,
  or any time you want to see how far the repo's copies have drifted.
disable-model-invocation: true
---

# stackgen-sync

The explicit re-sync. Everything stackgen materializes is **repo-owned** —
copies the project may edit, that a pack upgrade must never overwrite
silently. This skill is the one place drift becomes visible and the user
decides what to take, and it works **per component**: one component's drift
or upgrade never churns the rest of its bundle. It is user-only by design:
nothing invokes it programmatically, so a sync only ever happens on the
user's clock.

## Steps

1. **Inventory, from the lockfile.** Read `.claude/stackgen/lock.yaml`
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`). No lockfile → report
   "nothing materialized" and stop, after step 4's migration offer when the
   old plugin's directory exists. The lockfile is the whole inventory:
   a path it does not list is the repo's own and is invisible to this
   skill. Partition entries by **component** (every landing carries its
   component ref) and by source: pack-sourced vs `generated`. Read the
   `settings_keys` and `local_plugin` blocks too — those
   name state outside `.claude/`, and each diffs on its own terms below. An
   MCP record — a `local_plugin.mcp_servers` list or a top-level
   `mcp_servers` list an older stackgen wrote — is ignored: sync lands no
   server, adds no claim and reports nothing for it, and `/vwf:setup`'s step
   26 deletes it.

   **Entries are not all under `.claude/`.** A component may have landed
   repo config files from its `config/` tree — a `test:*` task, a
   `p/<id>/` task, a deploy target's root config —
   and those are ordinary lockfile entries carrying a `path`, a
   `component`, a `hash` and a `mode`. Inventory them with the rest; they
   differ only in where they sit and in the consent line they take. What
   may sit at the repo **root** is the allowlist in
   `${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`, which is the one
   statement of it — never re-list it here.

   **What bootstrap syncs is never diffed here.** The tool pins, the
   gates, their configs and the generic tasks carry no lockfile record:
   bootstrap's `mise run setup:configs` keeps them. The lockfile's
   `bootstrap:` block — the tools and plugins stackgen asked bootstrap
   for — is inventoried here and diffed at step 2.

2. **Diff pack-sourced components.** For each component, re-derive its
   landing set from the current pack
   (`${CLAUDE_PLUGIN_ROOT}/stacks/<type>/<slug>/`, per
   `${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`) and classify each copied
   file by hash against the lockfile and the tree — three states, reported per
   file: **unchanged**, **pack moved** (the pack's version/content changed,
   the copy still matches its landing hash), **repo edited** (the copy no
   longer matches its landing hash — whether or not the pack also moved).
   A pack that no longer exists in this stackgen version is reported, never
   deleted.

   **The required MCP servers.** A component updated to a pack version whose
   `conventions.md` has a `## MCP servers` section gets its lines recorded in
   the lockfile's `required_mcp_servers`, on the terms of the materializer —
   filled when the key is missing, rewritten when the lines changed. It rides
   the component's update and has no consent line of its own: it is a record,
   and nothing installs a server.

   **The relocation table.** One item moved to a new pack, and this fixed
   table is the whole of it — there is no general diff across pins:

   | From                                                               | To                  |
   | ------------------------------------------------------------------ | ------------------- |
   | the `taste-skill@taste-skill` claim of `design-tool/claude-code@1` | `addon/taste-skill` |

   **In the base repo**, where the new pack is pinned, a relocated item is
   **re-attributed in the lockfile, never removed and re-added**, before the
   diff above runs against it, and the report names it. A change of content is
   a normal update behind its normal consent.

   **In a member repo of a multi-repo product** — one carrying
   `.config/vwf-membership.yaml` — the table does not apply: a claim on
   `taste-skill@taste-skill` goes by the bootstrap handoff's Removal section.
   A sync in the base repo names each member not cloned locally in a one-line
   warning; its old items wait for a sync there.

   **A retired record whose file is gone is dropped.** A recorded path
   that its recording component — the `component:` ref — no longer
   ships, **and** that is absent from the
   tree, leaves `entries:` at step 6 with no row in the delta: nothing
   lands and nothing is deleted, so there is nothing to consent to. The
   sync report names every record it dropped. The motivating case is the
   `.config/vscode.d/*.jsonc` fragments vwf's 21→22 migration deletes. A
   path the component no longer ships that is still **present** is not
   this rule's.

   **The bootstrap delta.** Run steps 1 to 6 of the bootstrap handoff
   (`${CLAUDE_PLUGIN_ROOT}/skills/stackgen-stack-template/references/bootstrap-handoff.md`) for the
   current composition, and compare its result with the lockfile's
   `bootstrap:` block. A tool or plugin that the composition needs and
   the repo does not select is an `add`; one whose recorded components
   all left is a `remove`, on the terms of that file's Removal section.
   A repo with no `.config/bootstrap.toml` is not shaped: report it, with
   `/vwf:setup reshape` as the remedy, and offer no bootstrap line.

   A component's `config/` files diff on **exactly these terms** — same three
   states, same hashes, same per-component grain — with two things to carry
   through. **Mode is part of the file**: a `.config/mise/tasks/**` entry
   recorded `755` and now sitting 644 is a drift worth reporting, because mise
   reports a non-executable task file as an *unknown task* rather than as a
   permission error, and `mise run init` is the restore. And where two
   components write into one tree, re-derive in composition order —
   `toolchain-gate`, then `package-manager` / `language`, then
   `app-framework`, then `capability-provider`, then `cloud-provider`, then
   `cloud-service`, later wins — and diff each file against the component the
   lockfile says supplied it. A file whose supplying component **changed** is a
   real delta, reported as such: it means precedence moved, not that the pack
   did.

3. **Offer regeneration per generated component.** A `generated` component
   has no pack to diff against; offer to re-run the generator for that
   component alone (the pipeline in `/stackgen:stackgen-stack-template`'s
   references — fresh research against its recorded citations, reviewer
   gate included) and diff its output against the repo's copy. An
   `lsp_servers:` declaration bound for `vwf-tools` is the exception: it is
   researched from fresh sources alone, never from those citations or any
   other text the repo holds, because a repo can plant them. A
   regenerated component goes through the generator and so through its
   `stackgen-reputation` check: every concrete name it emits is re-checked
   at regeneration, a name that passed at first generation included, and
   a `block` halts the component the same way. Skip any component the
   user declines — regeneration costs research and review; it is an
   offer, not a default, and taking one component never forces another.

4. **The local plugin: the old names first, then the diff.**
   `${CLAUDE_PLUGIN_ROOT}/skills/stackgen-stack-template/references/local-plugin.md`
   is the procedure — the merge classification, the claims file, the version
   bump, the removal path and the migration.

   - **`~/.claude/plugins/local/stackgen-lsp/` exists** — whatever the
     lockfile holds, even no `local_plugin` block — the migration is offered
     on step 5's tier-3 line. Declined → nothing is written and it comes back
     on the next sync, and every other offer of this step that writes to the
     manifest waits for it.
   - **The lockfile names `stackgen-lsp` and that directory does not exist**
     — its `local_plugin` block is rewritten to the `vwf-tools` names at step
     6 with no prompt, and the report names the rewrite. The repo's servers
     then merge behind the normal tier-3 line, as a first write when
     `vwf-tools` does not exist.
   Then the diff — of LSP keys only; sync subtracts and offers no MCP key. No
   `local_plugin` block and no key the composition declares
   → skip the rest of this step; this repo has never written to the
   machine and a sync must not start. Otherwise read
   `~/.claude/plugins/local/vwf-tools/.claude-plugin/plugin.json` and
   compare, **key by key and only for the `lspServers` keys this repo claims**
   under `local_plugin.lsp_servers`, and the keys the current composition
   declares:

   - a key the current composition declares that this repo does not claim yet
     — **offer** it, classified by the merge table;
   - a claimed key whose declaration the current pack has changed —
     **offer** the update, classified by the merge table too: it is ours only
     when `claims.json` lists this repo's path, never because the committed
     lockfile names the key, and is otherwise a conflict;
   - a claimed key the manifest no longer holds — report it; the user
     removed it by hand and re-adding it uninvited is exactly the silent
     write this skill exists to prevent;
   - a claimed key whose component is no longer in the composition —
     offer **removal by subtraction**, which drops this repo's claim on that
     key alone, deletes the key only when no repo claims it, and
     touches no other repo's;
   - a key the manifest holds that this repo does not claim — invisible
     here, always. It is another repo's, or the user's.

   Everything in this step is **outside the repo and outside the commit**;
   only the `local_plugin` block moves with the lockfile.

5. **Present the delta for consent.** One consolidated dry-run plan,
   grouped **per component**: every file that would change, with its
   three-state classification. **Repo edits are never overwritten by
   default** — a *repo edited* file is taken only if the user picks it
   explicitly, and the default selection covers only *pack moved* files.
   Four things get their **own** consent lines rather than riding the
   file plan, and each is separately declinable:

   - any change to entries under `settings_keys` — a
     `.claude/settings.json` edit, and **settings.json is never modified
     without explicit consent**;
   - any change to a `config/`-tier entry — a write **outside
     `.claude/`**, into files the repo's collaborators own and read, so it
     is its own **tier-2** line listing every path, on the same
     merges-never-owns terms: only the paths this lockfile records are
     updated or removed, and a declined line leaves the `.claude/` side
     landed and says the tasks stay as they are;
   - the bootstrap delta of step 2 — each instruction as it will be sent,
     on the terms of step 7 of the bootstrap handoff;
   - anything from step 4 — the **tier-3** line, LSP servers only, which shows
     each server's full declaration (`command`, `args`, the `env` keys and
     their values), says plainly that it writes to this machine outside the
     repo and that a server landing in `vwf-tools` starts in every repo on
     this machine whose files match its extension map, not only the one that
     picked it, and where a
     registration or de-registration is involved **prints the `claude`
     commands and asks; it never runs them unprompted**.

   Nothing selected → done, nothing written.

6. **Apply and commit.** A consented migration runs first, in its fixed
   order: write `vwf-tools`, register it, uninstall
   `stackgen-lsp@stackgen-lsp`, remove the `stackgen-lsp` marketplace, delete
   the old directory, each step skipped when already done, and a failed or
   declined step stopping the run with a report so the next run continues
   from the first incomplete step. It rewrites a `local_plugin` block that
   names `stackgen-lsp` to the `vwf-tools` names. Then write only what was
   selected, update the changed
   components' lockfile hashes, the `bootstrap:` block and the
   `local_plugin` block — every entry rewritten to the owners shape, with the
   re-attributions of step 2 and the no-prompt rewrite of step 4 — and commit as
   one commit via the repo's git workflow. The local plugin's own files
   are on the machine, not in the commit. A consented bootstrap delta is
   sent first — steps 8 to 10 of the bootstrap handoff — and the files
   its sync changes join the commit. The retired records step 2 found are dropped
   here too, on every run — whatever was selected, nothing included.

7. **Re-check the shape.** Once everything selected is written and
   committed — or nothing was selected — run the shape check `/vwf:setup`
   runs in its Step 0, in-session, over the base and every member: is
   the shape there, and is it current, evaluated against the lockfile
   this sync just updated. On drift, **offer** `/vwf:setup reshape` the
   way Step 0 offers it — one line naming the drifted repos and the
   failing predicate, then the question — and invoke `/vwf:setup reshape`
   in-session on a yes; a decline ends the sync. A clean check says
   nothing, and nothing reshapes unprompted.

## Rules

- **Visible, never silent** — every write traces to a line the user saw in
  the delta, save a retired record whose file is already gone (step 2), a
  re-attribution (step 2) and the rewrite to the `vwf-tools` names (step 4),
  which the report names instead.
- **The component is the grain.** A framework's major bump regenerates that
  framework component alone; the language baseline beside it is untouched
  unless its own pack moved.
- **The lockfile is the boundary**, and it is the boundary **outside**
  `.claude/` too: a `.config/` file stackgen did not materialize is the
  repo's own and is never diffed, updated or removed, however exactly its
  path matches something a pack ships. Nothing in the repo is ever
  deleted without a line the user picked — a retired pack's copies stay
  until the user removes them. The lockfile is committed, so a recorded path
  that resolves outside the repo root is refused and reported, never deleted.
- **Mode travels with a `config/` file.** Write back the recorded mode
  when a task file is taken; a `.config/mise/tasks/**` file restored 644
  is a task that has disappeared as far as mise is concerned.
- **The local plugin is the one thing subtracted rather than left.** It is
  the machine's shared file, not a repo copy, so a stale key there is
  another repo's problem rather than a note the user can ignore. Removal
  drops only this repo's claims, and a key leaves the manifest only when no
  repo claims it; the directory and the
  registration go only when subtracting leaves no servers at all, and only
  after the user confirms the two printed commands.
