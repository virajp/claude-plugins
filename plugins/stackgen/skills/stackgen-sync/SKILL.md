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
   "nothing materialized" and stop. The lockfile is the whole inventory:
   a path it does not list is the repo's own and is invisible to this
   skill. Partition entries by **component** (every landing carries its
   component ref) and by source: pack-sourced vs `generated`. Read the
   `settings_keys`, `mcp_servers` and `local_plugin` blocks too — those
   name state outside `.claude/`, and each diffs on its own terms below.

   **Entries are not all under `.claude/`.** A component may have landed
   repo config files from its `config/` tree — a gate's own config file,
   a root config file, a subtask, a deploy target's root config —
   and those are ordinary lockfile entries carrying a `path`, a
   `component`, a `hash` and a `mode`. Inventory them with the rest; they
   differ only in where they sit and in the consent line they take. What
   may sit at the repo **root** is the allowlist in
   `${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`, which is the one
   statement of it — never re-list it here.

   **What `stackgen:tool-config` renders is never byte-diffed here.** The
   toolchain manager's and the gates' own files — mise, dprint, pre-commit,
   gitleaks, grype — carry no lockfile record: tool-config compares them
   with a fresh render on its own calls. Each pack's `templates/` tree,
   rendered into `.config/mise/conf.d/<slug>/`, **is** recorded, as entries
   carrying `rendered: true` and no hash; inventory them with their
   component, and refresh them at step 2 by re-running `pack`, never by
   comparing bytes.

2. **Diff pack-sourced components.** For each component, re-derive its
   landing set from the current pack
   (`${CLAUDE_PLUGIN_ROOT}/stacks/<type>/<slug>/`, per
   `${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`) and classify each copied
   file — every entry but a `rendered: true` one, which is refreshed below
   — by hash against the lockfile and the tree — three states, reported per
   file: **unchanged**, **pack moved** (the pack's version/content changed,
   the copy still matches its landing hash), **repo edited** (the copy no
   longer matches its landing hash — whether or not the pack also moved).
   A pack that no longer exists in this stackgen version is reported, never
   deleted.

   **A retired record whose file is gone is dropped.** A recorded path
   that its recording component — the `component:` ref — no longer
   ships, **and** that is absent from the
   tree, leaves `entries:` at step 6 with no row in the delta: nothing
   lands and nothing is deleted, so there is nothing to consent to. The
   sync report names every record it dropped. The motivating case is the
   `.config/vscode.d/*.jsonc` fragments vwf's 21→22 migration deletes. A
   path the component no longer ships that is still **present** is not
   this rule's.

   **A rendered entry is refreshed by re-running `pack`, never
   byte-diffed.** For a component with `rendered: true` entries whose pack
   version is newer than the one recorded, run tool-config's
   `preview pack --slug <slug> --dir <pack dir>`
   (`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/SKILL.md#packs`) and offer its
   rows in the delta under that component; taking them runs `pack` with
   the same answers and re-records every path it rendered — `source` at
   the new version, `rendered: true`, no hash — dropping any rendered
   entry the new templates no longer produce. A pack value its templates
   name lives under `packs.<slug>` in `.config/stackgen.yaml`, so the
   call needs no `--set` for a value already there; a value the new
   version adds to its `values:` list is found the way `/vwf:setup`
   gathers one — its `detect`, else its `question` — before the call
   runs. A rendered
   entry whose pack has not moved gets no row: tool-config's own preview
   is what judges a local edit to it.

   **Conditional paths are evaluated first, against the same answers the
   materializer takes.** Read this repo's `.config/stackgen.yaml` — its
   `forge` and `secrets` keys, which tool-config's `all` wrote — and
   re-read `forge` live from this repo's `origin` host, so a remote that
   appeared since init ran is what the forge conditions are judged
   against. A repo with **no** `stackgen.yaml` is not shaped: report it,
   with `/vwf:setup reshape` as the remedy, infer the two from the tree
   the way `/vwf:init` seeds them — the forge from `origin`, the secrets
   provider from the lockfile's pinned provider — and write nothing for
   them. Where the file **is** there and the live host contradicts its
   `forge`, never edit the key in place: offer tool-config's
   `all --forge <value>` in the delta, previewed and answered like any
   call, since the script is the one writer of `stackgen.yaml`, and name
   the correction in the sync report. This skill writes no other value
   there and never reads `.config/vwf.yaml` for either. Evaluate each
   pack's `conditional:` entries
   (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`) against that map
   before classifying its landing set — three more states beside the
   three above, each reported in the delta:

   - **skipped (condition)** — the condition reads false and the path
     has no `entries:` record. Never offered, never reported missing; it
     is a `skipped:` row, rewritten for the packs this run evaluated and
     for no others, on exactly the terms the materializer rewrites them
     (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`).
   - **landable — condition now true** — the path has no `entries:`
     record and its condition now holds. It is offered as a create,
     under the consent line a new pack file already takes: a
     `config/`-tier path on step 5's tier-2 line, a `.claude/` path on
     the file plan, and the line says plainly that the path was skipped
     before and its answer has changed. Taking it lands it as an
     ordinary entry and drops its `skipped:` row; declining leaves the
     row.
   - **kept** — the path **has** an `entries:` record and its condition
     has since turned false. It stays, is reported once as landed
     earlier, condition now false, kept, and is never removed here.
     Removing a landed file is the user's own act, never a side effect
     of an answer changing.

   An axis the map leaves out still reads **true** — the materializer's
   rule, unchanged.

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
   gate included) and diff its output against the repo's copy. A
   regenerated component goes through the generator and so through its
   `stackgen-reputation` check: every concrete name it emits is re-checked
   at regeneration, a name that passed at first generation included, and
   a `block` halts the component the same way. Skip any component the
   user declines — regeneration costs research and review; it is an
   offer, not a default, and taking one component never forces another.

4. **Diff the local plugin, if the lockfile has one.** No `local_plugin`
   block → skip this step entirely; this repo has never written to the
   machine and a sync must not start. Otherwise read
   `~/.claude/plugins/local/stackgen-lsp/.claude-plugin/plugin.json` and
   compare, **key by key and only for the keys this repo claims** under
   `local_plugin.lsp_servers` / `local_plugin.mcp_servers`
   (`${CLAUDE_PLUGIN_ROOT}/skills/stackgen-stack-template/references/local-plugin.md`
   is the procedure — the merge classification, the version bump and the
   removal path):

   - a claimed key whose declaration the current pack has changed —
     **offer** the update;
   - a claimed key the manifest no longer holds — report it; the user
     removed it by hand and re-adding it uninvited is exactly the silent
     write this skill exists to prevent;
   - a claimed key whose component is no longer in the composition —
     offer **removal by subtraction**, which drops that key alone and
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
   Three things get their **own** consent lines rather than riding the
   file plan, and each is separately declinable:

   - any change to entries under `settings_keys` — a
     `.claude/settings.json` edit, and **settings.json is never modified
     without explicit consent**;
   - any change to entries under the top-level `mcp_servers` — a
     `.mcp.json` edit, on the same terms;
   - any change to a `config/`-tier entry — a write **outside
     `.claude/`**, into files the repo's collaborators own and read, so it
     is its own **tier-2** line listing every path, on the same
     merges-never-owns terms: only the paths this lockfile records are
     updated or removed, and a declined line leaves the `.claude/` side
     landed and says the tasks stay as they are;
   - anything from step 4 — the **tier-3** line, which says plainly that
     it writes to this machine outside the repo, and where a
     registration or de-registration is involved **prints the `claude`
     commands and asks; it never runs them unprompted**.

   Nothing selected → done, nothing written.

6. **Apply and commit.** Write only what was selected, update the changed
   components' lockfile hashes (a re-rendered path: its `source` alone)
   and the `local_plugin` block, and commit as
   one commit via the repo's git workflow. The local plugin's own files
   are on the machine, not in the commit. The lockfile's `skipped:` list
   is rewritten here too, for the packs step 2 evaluated and no others —
   a taken *landable* path leaves it and gains an `entries:` record, a
   *skipped (condition)* path is its row. And where this run removed a
   pack's `entries:`, its `skipped:` rows go with them
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`), so a pack the repo
   no longer runs leaves no row claiming one of its paths is
   intentionally absent. The retired records step 2 found are dropped
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
  the delta, save a retired record whose file is already gone (step 2),
  which the report names instead.
- **The component is the grain.** A framework's major bump regenerates that
  framework component alone; the language baseline beside it is untouched
  unless its own pack moved.
- **The lockfile is the boundary**, and it is the boundary **outside**
  `.claude/` too: a `.config/` file stackgen did not materialize is the
  repo's own and is never diffed, updated or removed, however exactly its
  path matches something a pack ships. Nothing in the repo is ever
  deleted without a line the user picked — a retired pack's copies stay
  until the user removes them.
- **Mode travels with a `config/` file.** Write back the recorded mode
  when a task file is taken; a `.config/mise/tasks/**` file restored 644
  is a task that has disappeared as far as mise is concerned.
- **The local plugin is the one thing subtracted rather than left.** It is
  the machine's shared file, not a repo copy, so a stale key there is
  another repo's problem rather than a note the user can ignore. Removal
  drops only the keys this repo's lockfile claims; the directory and the
  registration go only when subtracting leaves no servers at all, and only
  after the user confirms the two printed commands.
