# The Materializer

Read this on a **first pin** — a slug with no
`.claude/stackgen/templates/` entry yet — and for the two `addon` calls at the
end of this file: [one already materialized](#an-addon-already-materialized)
and [one dropped](#removing-a-dropped-addon). It is the one code path that
writes to a repo, and every write it makes is consent-gated and committed once.

## Inputs

- The resolved composition — one source per component: a pack directory
  (`${CLAUDE_PLUGIN_ROOT}/stacks/<type>/<slug>/`), or the generator's
  output for that component (an in-memory pack in the same shape —
  `pack.yaml` fields including the classification, conventions prose,
  artifacts).
- The target repo root — the current repo by default, or the repo the
  invocation's `repo: <path>` line names, a path relative to the current
  repo's root. Every write below, and the lockfile, resolve under that
  root: read "the repo" throughout as that repo.
- **The repo's `.config/bootstrap.toml`** — the tools and plugins it
  already selects. Without it the landing set stops before anything is
  written ([the bootstrap handoff](bootstrap-handoff.md), step 1).

## Steps

1. **Assemble the landing set** — the whole composition lands as one set,
   structured by the bundle's kind
   (`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`), each component contributing
   the slice its type owns (`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`),
   closed to the output vocabulary
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`):

   - `.claude/stackgen/templates/<slug>.md` — **one entry for the bundle**:
     the payload fields (including `kind`, the `components:` refs,
     per-language `facts` with `binaries` entries in either form, a bare
     name or a `{ name, probe }` map, `lockfile` beside
     `package_manager`) as
     frontmatter, the components' conventions prose as body.
   - `.claude/stackgen/citations/<component-slug>.yaml` — per component:
     the research sources with URLs and fetch dates (generation; a pack
     lists its provenance here).
   - `.claude/skills/<name>/…`, `.claude/agents/<name>.md`,
     `.claude/rules/<name>.md` — copied verbatim from each component's
     source.
   - `.claude/hooks/<name>.sh` — **pack-sourced scripts only**; generation
     never emits an executable.
   - **The repo config files a component declares** — each component's
     `config/` tree (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`)
     mirrors the **repo root**, not `.claude/`, so
     `config/.config/mise/tasks/test/golden` lands at
     `<repo>/.config/mise/tasks/test/golden`, exactly the way `skills/`
     mirrors `.claude/skills/`. It is a **target, not a fifth artifact
     kind**: copied verbatim like every other pack file, but a **tier-2**
     one, so it is presented at its own consent line in step 3 rather
     than riding the file plan
     (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`).

     **Four copy rules inside that tree**, all of them assertions rather
     than preferences:

     - **`config/_<name>/` is never copied.** A leading underscore marks a
       pack-private payload a reader picks from — the licence texts under
       `config/_licenses/` are the case — so copying the directory would
       land every option instead of the one chosen. Skip it silently; it
       is not a landing set member and never appears in the plan.
     - **A `p/_project/` directory is renamed as it is copied.** Where a
       payload carries `.config/mise/tasks/p/_project/`, `_project` is a
       **marked position**, not a task group: rename the directory to the
       registry id of the project this stack is being pinned for,
       slugified per `${CLAUDE_PLUGIN_ROOT}/assets/ids.md` — so
       `p/_project/deploy` lands as `p/<id>/deploy` and runs as
       `p:<id>:deploy`. This is **not** the skip rule above: that one is
       about a `config/_<name>/` entry at the top of the tier, and this
       directory is nested well below it, so it is copied. An unrenamed
       copy is **inert rather than wrong** — mise ignores a task
       directory whose name starts with an underscore, the same rule that
       keeps `_scripts/` out of `mise tasks` — so forgetting the rename
       costs the task and never publishes one under a name nobody meant.
       The lockfile records the **landed** path, not the authored one.
     - **A root path must be on the allowlist.** Only `readme.md`,
       `eslint.config.mjs`, `wrangler.jsonc` and the directory `.github/`
       — never `.github/workflows/` — may land at the repo root
       (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`). That doctrine's
       list is what may **sit** at a shaped root, and its other tiers
       nothing here ever lands: the files bootstrap's sync writes are
       bootstrap's,
       `CONTRIBUTING.md`, `SECURITY.md` and `LICENSE` are `/vwf:init`'s,
       and `CLAUDE.md` is vwf's, so a pack shipping any of them is
       refused like any other unallowlisted path. A language's manifests
       and lockfiles are not on the list at all. Any
       other root path in a `config/` tree is a **pack authoring error**:
       halt the landing set, name the pack and the path, and write nothing.
       This is the materializer's own assertion because a pack author is
       the only one who can fix it and the plan is the last place anyone
       would read it. `readme.md` is on
       the landable tier because a shaped repo has one, not because a pack
       may ship it — no pack may, and `CLAUDE.md` is separately out of
       scope below. `wrangler.jsonc` is on it because the deploy tool that
       reads it discovers its config only at the root, and the three
       Cloudflare deploy packs ship one (`workers-static-assets`,
       `workers-ssr`, `containers`).
     - **A pack ships no pre-commit hook fragment and no gate.** A
       toolchain gate, its config and its `code:lint:<tool>` or
       `code:format:<tool>` task are bootstrap's, asked for below.
   - **The bootstrap instructions** — the tools and the Claude plugins
     the composition needs that the repo does not select yet, chosen from a
     fresh clone of bootstrap and sent through its `docs/sync/vwf.md`.
     **The procedure is [the bootstrap handoff](bootstrap-handoff.md)**:
     steps 1 to 6 run here, step 7 is a consent line in step 3, and steps
     8 to 10 run in step 5. No pack names a bootstrap tool, and stackgen
     never edits `.config/bootstrap.toml` itself.
   - The lockfile update — every path above, with its component ref,
     source and content hash, plus the **mode** for a `config/` file, and
     the `bootstrap:` block the handoff records. The
     per-component record is what lets sync act on one component alone,
     and per file it is what makes `config/` precedence auditable: it
     names which component supplied the version that actually landed.
     The hash written here is the landing hash, not the last word:
     `/vwf:init` **re-records** the hash of every landed file it changes
     after landing, and on either answer of its replace-or-keep offer, so a
     differing hash is content drift only when no such writer ran.
     The files bootstrap's sync writes have no record here: they are
     bootstrap's.

   **Composition order, and why a bug in it is silent.** More than one
   component may write into one `config/` tree — `.config/mise/tasks/` is
   the first destination that happens for. Compose by component type in
   the order `toolchain-gate`, then
   `package-manager` / `language`, then
   `app-framework`, then `capability-provider`, then `cloud-provider`,
   then `cloud-service`; a **later component's file wins**, and the
   lockfile records per file which one that was. The baseline library
   every pack lands beside is bootstrap's, synced before any pack lands,
   and no pack ships a path a bootstrap tool ships; the deploy
   target sits last, because how a repo ships is the most specific thing
   it pins. The two cloud types joined the order
   on 2026-09-05, when the first cloud pack shipped a `config/` tree
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`). Get it backwards and
   nothing errors: a generic `p/<id>/deploy` shadowing the deploy
   target's would simply ship the wrong way, in a repo where the task
   still exists and still exits zero.

   **The fence: stackgen writes only what a pack declares in `config/`.**
   Landing a config tree does not make stackgen the owner of a repo's
   configuration. What a pack **may** declare is the repo-specific rest:
   its `test:*` tasks, its `p/_project/` tasks and the root files on the
   allowlist. Gate configs, tool pins and generic tasks are bootstrap's.
   What stays outside is enumerated
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`): a language manifest, a
   CI workflow, editor settings — the editor is the user's to configure —
   and CLAUDE.md. Charters ratchet: each file the tier absorbs makes the
   argument for the next one easier, which is why the four are restated
   here, where an implementer meets them, and not only where they were
   decided. A pack declaring one of the four is an authoring error, not a
   judgment call — treat it the way a disallowed root path is treated
   above.

   **Never in the set**: CLAUDE.md — that one is vwf's, out of scope
   outright.

   **Server configuration is not in the set, for a different reason**: it
   does not go in a repo at all. A language server is a plugin-manifest
   feature no project file can express, and every MCP server takes the same
   path. A component's `languages[].facts.lsp` still
   travels in the payload for `/vwf:doctor` to read, and what actually
   provides the server is the **generated local plugin**, a tier-3 target
   outside the repo, handled at its own consent line in step 4.

   **An `addon`-axis pin is materialized like any other bundle**: its
   `user_mcp_servers:` go to step 4, and its `## Claude plugins` section to
   the bootstrap handoff. It is materialized only in the repo vwf names for
   it, the base repo: a member gets no addon skill files, and the servers are
   user scope anyway.

2. **Collision check, against the lockfile.** Any target path that exists
   but is **not** in the target repo's own
   `.claude/stackgen/lock.yaml` — never a sibling repo's — is that
   repo's own file: a
   conflict listed for the user to resolve, never a write. Anything not in
   the lockfile is not stackgen's to touch.

   **A `config/` target is checked by exactly this rule, not a softer
   one.** A repo that already has `.config/mise/tasks/test/golden` and no
   lockfile entry for it wrote that file itself; it is a conflict, and
   overwriting it would be the one silent write this whole design exists
   to prevent. The tier **merges, never owns**: only paths this repo's
   lockfile recorded are ever rewritten or removed.

3. **The dry-run consent gate.** Present the full landing set as a plan —
   every path, created or conflicting, and (for generation) the reviewer's
   clean verdict beside the **reputation table** — and ask before writing
   anything. The user may deselect artifacts; the template entry itself is
   not deselectable (it is what the pin means). Declined → **nothing is
   written at all**, the caller's pin is left exactly as it was — this
   skill never rewrites a pin, and a decline is not a downgrade — and the
   caller is told the slug is pinned but not materialized. Reporting the
   decline is the caller's, and the repo's unmaterialized state is what
   `/vwf:doctor` reports until a later run lands it.

   **The reputation table is shown whole.** The generator vetted every
   concrete third-party name the component emits through
   `stackgen-reputation` ([the generator](generator.md), step 4); show
   every row, and call each `warn` row out in one line of its own — the
   name, the signal, and its source — so the user consents to a warned
   name knowingly rather than by scrolling past it. **A gate never shows a
   `block` row**: a block halted the component upstream, before anything
   reached this plan, and the user picked the replacement there. A `block`
   row that does reach the gate is a defect in the pipeline to report,
   never a choice to offer — halt and say so.

   **Hook wiring is its own consent line.** A hook script is a file (the
   list above); the `hooks` entry that wires it lives in
   `.claude/settings.json`, and **settings.json is never modified without
   the user's explicit consent** — present the exact entries as a separate,
   individually skippable item. Declined wiring leaves the script landed
   but inert, and the plan says so. A consented edit **merges** into
   settings.json (never rewrites it) and records the added keys under the
   lockfile's `settings_keys`.

   The entries come from the pack's `hooks/hooks.yaml`
   (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`), whose top-level
   `hooks:` map is **settings.json's own hook shape written as YAML** —
   event name → a list of matcher groups, each with its `matcher` and its
   `hooks:` list of `{type, command, …}` entries. Merge it **event by
   event, appending matcher groups**; never replace an event's list, and
   never merge two groups because their matchers match. Record each
   appended group under `settings_keys` as `hooks.<Event>[<matcher>]`, so
   sync and removal can find exactly the group stackgen added and leave
   the user's own groups on the same event alone.

   One spelling in a landed `command` is load-bearing: a script path is
   written **`${CLAUDE_PROJECT_DIR}/.claude/hooks/<name>.sh`**, never
   relative. A relative path resolves against whatever the hook's working
   directory happens to be, and a hook that cannot find its script fails
   the way every hook fault fails — quietly.

   **The `config/` tree is its own consent line too**, the same tier
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`). It writes outside
   `.claude/`, into paths the repo's collaborators own and read, so it is
   presented as a separate, individually skippable item listing **every
   target path** — not folded into the file plan above. State the decline
   outcome in the plan, in these terms: **the skills stay landed and the
   tasks are simply absent** — a repo with the test doctrine in
   `.claude/skills/` and no `mise run test:<name>` behind it. Say that at
   the gate, because the failure it prevents is a user discovering it a
   week later as a missing task.

   **The bootstrap instructions are their own consent line too** — step 7
   of [the bootstrap handoff](bootstrap-handoff.md). List each instruction
   as it will be sent, and for each tool and plugin the components that
   need it. A delta with no instruction shows no line.

4. **The local plugin — its own gate, and a larger one.** A component that
   declares an `lsp_servers:` entry, or a `user_mcp_servers:` one, is
   served by the generated local plugin at
   `~/.claude/plugins/local/vwf-tools/`
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md` — the fixed path, the
   manifest shape, the lockfile key). **The procedure is
   [the local plugin](local-plugin.md)**: the merge classification, the
   file shapes, the claims file, the already-registered detection, the
   version bump a re-read depends on, and removal by subtraction.

   **The migration comes first.** When
   `~/.claude/plugins/local/stackgen-lsp/` exists, this step offers
   [the migration](local-plugin.md#migrating-from-stackgen-lsp) before either
   item: write `vwf-tools`, register it, uninstall
   `stackgen-lsp@stackgen-lsp`, remove the `stackgen-lsp` marketplace, delete
   the old directory. Each step checks its own result first and is skipped
   when already done; a failed or declined step stops the run with a report,
   and the next run continues from the first incomplete step. Declined whole
   → nothing is written, newly picked addon servers and a design tool's
   required server land nowhere until it is accepted, and the offer comes back
   on each later run, once per `/vwf:setup` run
   ([one offer per setup run](#one-offer-per-setup-run)). While it is declined,
   the repo's `.mcp.json` entries are
   kept and their removal is not offered. A lockfile that names `stackgen-lsp`
   on a machine with no such directory is rewritten to the `vwf-tools` names
   with no prompt, and `vwf-tools` is then a first write behind the two items
   below when it does not exist.

   The write goes **outside the repo** and
   registers with a **user-scoped** tool, so it is gated apart from
   everything above and as **two** separately declinable items:

   - **The manifest write.** Show the exact `lspServers` and `mcpServers`
     keys being added, each with its full declaration (`command`, `args`, the
     `env` keys and their values, `url`) and whether it is new or already
     present from another repo. It **merges, never owns** — an existing key the
     claims file does not list for this repo is left untouched, whatever the
     committed lockfile names, and a key another repo already
     contributed is reported, not rewritten. This repo's path joins each key
     in the claims file beside the manifest, in the same step.
   - **The registration.** Print the two commands and ask; **never run
     them unprompted**:

     ```sh
     claude plugin marketplace add ~/.claude/plugins/local/vwf-tools --scope user
     claude plugin install vwf-tools@vwf-tools --scope user
     ```

     Skip both when the plugin is already registered — say so instead.

   Declining either leaves everything else landed. A declined manifest write
   means the server is simply absent, and the plan says so; a
   declined registration leaves a valid directory nobody installed, and
   reprints the two commands for later. Record the outcome under the
   lockfile's `local_plugin` block, `registered:` following the answer.

   **Say plainly that this is the developer's machine, not the repo.**
   Collaborators pulling the commit get none of it, and a server landing in
   `vwf-tools`, with any account grant it holds, is reachable from every repo
   on this machine, not only the one that picked it.

5. **Write and commit.** On approval: write the set, then, when the
   bootstrap line was consented, send its instructions — steps 8 to 10 of
   [the bootstrap handoff](bootstrap-handoff.md). A stop that
   `docs/sync/vwf.md` reports is shown as it is; the files already written
   stay, and the plan names the tools that are absent. Update the
   lockfile, then commit as **one commit**
   via the repo's git workflow (the vwf
   git-workflow skill when present; plain `git add <paths>` + a conventional
   commit otherwise — never `git add -A`). The commit is what makes the
   output repo-owned: collaborators pull files, not a plugin obligation.

   **The commit is made in the target repo, and in no other.** Where that
   repo is a submodule of the caller's base repo, the gitlink the commit
   moves is left **unstaged for the caller** — say so in the return. The
   materializer never commits in two repos: a base-repo commit is the
   caller's own git pass, and making one here would land a gitlink the
   user never saw in a plan.

   **Preserve the mode when writing a `config/` file, and record it.**
   Everything under `.config/mise/tasks/**` lands **executable (755)**.
   The reason is not self-evident and the failure does not read as a
   permission problem: mise runs a task file **directly**, so a file that
   lands 644 is reported as an **unknown task** —
   `mise run test:golden` claims the task does not exist while the
   file sits right there. The restore is `mise run init`, which re-marks
   the task library
   executable; say so rather than leaving a user to chmod by hand. The
   mode goes into the file's lockfile entry, so sync writes it back the
   same way.

   The local plugin is written and registered here too, but it is **outside
   the repo and outside the commit** — only its `local_plugin` lockfile
   block is committed, which is what makes removal able to find it.

6. **Return, and point forward.** Re-read the freshly written
   `.claude/stackgen/templates/<slug>.md` and return the payload from it —
   the same read every later fetch performs. Then recommend **`/vwf:setup`**
   as the next step: the repo's CLAUDE.md and workspace wiring are vwf's
   domain, and stackgen never edits them.

## One offer per setup run

`/vwf:setup` makes several calls in one run, so the migration and the
registration are each offered once per run, never once per call. A call on
which the migration is declined or stops, or the registration is declined, says
so in one line after what it returns: `declined: migration` or
`declined: registration`. The caller passes each such line into every later
call of that run, beside the `repo:` line. A call carrying one treats that offer
as declined without asking. The next run starts without the line, so the offer
comes back.

## An addon already materialized

`/vwf:setup` calls this skill for every `addons:` slug on every run, because a
pick is committed while its servers land per machine. On an entry whose `axis:`
is `addon`, the call does this, then returns the payload from the entry, and
does nothing else: no repo copy is touched, no bootstrap instruction is sent,
nothing is diffed.

1. **The migration offer**, when `~/.claude/plugins/local/stackgen-lsp/`
   exists, on the terms of step 4 above. Declined or stopped, now or by a
   carried `declined: migration` line → go straight to the return: the servers
   land nowhere until it is accepted, and the offer comes back on the next run.
2. **Read the pack's servers.** The `user_mcp_servers:` of
   `${CLAUDE_PLUGIN_ROOT}/stacks/addon/<slug>/pack.yaml`. A pack with none,
   `addon/taste-skill` among them, has nothing more to do: its plugin reaches
   a machine through the committed `.config/bootstrap.toml`.
3. **Compare with this machine.** Read `plugin.json` and `claims.json` under
   `~/.claude/plugins/local/vwf-tools/.claude-plugin/`, either of which may be
   absent, and detect the registration with the read-only commands of
   [the registration item](local-plugin.md#the-two-consent-items). Every key in
   the manifest, every claim present, and `vwf-tools` registered or its offer
   declined by a carried `declined: registration` line → no gate and no write:
   the call is a plain read.
4. **Otherwise, the normal tier-3 gate** of step 4 above, classified by
   [the merge table](local-plugin.md#the-merge--it-merges-never-owns). A key
   missing from the manifest is added and claimed. A key present with this
   repo's path missing from its claim is shown as already present on the same
   manifest-write item, and only the claims file is written for it. A conflict
   is reported, gets no claim and asks nothing. The registration item, or the
   update pair when the plugin is already registered, follows a manifest write.
   With nothing to write and `vwf-tools` not registered, the registration item
   is the whole gate. A declined manifest write → the servers are absent and
   the lockfile is untouched, and the next run offers them again. A declined
   registration → the plugin stays unregistered and the next run offers it
   again.
5. **The lockfile, only if it changed.** A key the `local_plugin` block does
   not name joins it with its `packs:`, and `registered:` follows the answer.
   A change, this call's or the migration's, is committed as step 5 above
   commits; with no change there is no commit.

## Removing a dropped addon

`remove: <slug>` takes out one `addon` slug that `addons:` no longer names, in
the current repo, the base. `/vwf:setup` is the caller, since
`/stackgen:stackgen-sync` is user-only.

1. **Collect what the lockfile records.** Every `entries` record with this
   `slug:` — the template entry, the skill files, the citations. Every
   `bootstrap:` tool and plugin
   [the handoff's removal](bootstrap-handoff.md#removal) selects for this
   component. Every `local_plugin` key
   [a pack leaving](local-plugin.md#removal--by-subtraction) subtracts. Nothing
   outside the lockfile is ever in the set. The lockfile is committed, so a
   recorded path is not trusted for being recorded: one that is absolute, climbs
   out with `..`, or whose parent directory resolves outside the repo root once
   symlinks are followed is **refused** — never deleted, named in the plan and
   the report, its record dropped with the others at step 5.
2. **The migration comes first**, when a key is in the set and
   `~/.claude/plugins/local/stackgen-lsp/` exists. Declined or stopped, now or
   by a carried `declined: migration` line → nothing is removed, and the call
   returns **declined**.
3. **One plan, one consent.** Show every path, marking a file whose hash
   differs from its record as edited since landing, each bootstrap instruction
   as it will be sent, and each server key with what happens to it: claim
   dropped, or key deleted because no repo claims it. Say plainly that the
   server part is this machine's, and that collaborators' machines are not
   touched. Declined → nothing is removed, the caller says so, and
   `/vwf:setup` offers it again on the next run.
4. **Apply.** Delete the recorded files step 1 did not refuse, send the
   bootstrap instructions, and
   subtract the keys, printing the pair
   [the removal](local-plugin.md#removal--by-subtraction) or
   [the bumped manifest](local-plugin.md#the-two-files) calls for and asking
   on its own terms. A failed clone or a stop bootstrap reports is shown as it
   is, and that tool or plugin keeps its record, where sync's bootstrap delta
   finds it.
5. **Update the lockfile and commit.** Drop the entries, the bootstrap records
   and the subtracted keys, then commit once, as step 5 above commits. Return
   one line: **removed**, or **declined**.

## Reconciling this repo's claims

`reconcile-claims:` takes no slug. `/vwf:setup` makes the call once per run in
the base repo, after its `remove:` calls. It is for an addon dropped on another
machine: after a pull this repo's lockfile no longer records the server, so no
`remove:` call is made, while this machine's claims file still holds this repo's
claim. It returns no payload: one line, **removed**, **declined** or
**unchanged**.

1. **Collect what the claims file holds.** Every key in `claims.json` under
   `~/.claude/plugins/local/vwf-tools/.claude-plugin/` whose list holds this
   repo's path and that the lockfile's `local_plugin.lsp_servers`,
   `local_plugin.mcp_servers` and top-level `mcp_servers` do not name. No claims
   file, or no such key → no gate and no write: return **unchanged**.
2. **The migration comes first**, when a key is in the set and
   `~/.claude/plugins/local/stackgen-lsp/` exists. Declined or stopped, now or
   by a carried `declined: migration` line → nothing changes, and the call
   returns **declined**.
3. **The normal tier-3 gate.** Show each key with what happens to it: claim
   dropped, or key deleted because no repo claims it. Say plainly that this
   changes this machine alone, and that the repo and collaborators' machines are
   not touched. Declined → nothing changes, the call returns **declined**, and
   the next run offers it again.
4. **Apply.** Subtract the keys by
   [the removal's steps](local-plugin.md#removal--by-subtraction), a key leaving
   the manifest only when no repo claims it, printing the pair the removal or
   [the bumped manifest](local-plugin.md#the-two-files) calls for and asking on
   its own terms. It deletes no repo path, and the one directory the removal can
   delete is the fixed `vwf-tools` one, never a path a lockfile records. The
   lockfile already lacks these keys, so nothing is
   committed. Return **removed**.

## Rules

- **Copy, never reference in place.** The repo owns its copies; the pack
  evolving does not change a repo until `/stackgen:stackgen-sync` shows the
  diff and the user takes it.
- **The lockfile is the ownership boundary** — sync diffs against it, and
  paths outside it are invisible to every stackgen write path.
- **A pack dropped from a composition takes its bootstrap tools with it**
  — only the ones this handoff added and no other component needs
  ([the bootstrap handoff](bootstrap-handoff.md#removal)). Its recorded
  files are removed with its lockfile entries — and so are a dropped
  generated component's, its `.claude/` skill and citations included.
- **Three targets, and nothing else.** Inside `.claude/`, nothing lands
  outside the output vocabulary. Outside `.claude/` but inside the repo,
  there is exactly one: the repo config files a
  component declares in its `config/` tree — tier 2, behind its
  own consent line, and **merging, never owning**, so only what the
  lockfile records is ever rewritten or removed. Outside the repo, the
  **only** path stackgen may write is
  `~/.claude/plugins/local/vwf-tools/.claude-plugin/`, behind the tier-3
  gate. **Server configuration never lands in the repo** whatever the
  source ships; it goes to the local plugin, and an LSP need still travels as
  `language_facts` in the payload for `/vwf:doctor` to read. A repo's
  `.mcp.json` is no longer written, only cleared of the recorded keys
  [the migration](local-plugin.md#migrating-from-stackgen-lsp) moved, which also
  deletes the old plugin's directory. No declaration is ever copied out of it:
  a moved key takes a shipped pack's.
- **The `config/` tier is what a pack declares, and no more.** The
  toolchain, its gates and their configs are bootstrap's; the
  repo's manifests, its CI workflows, its editor settings and its CLAUDE.md
  are not (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`), and neither is
  any root path off the allowlist.
- **The local plugin is the machine's, not the repo's.** It is user-scoped
  and uncommitted, so it is never assumed present: nothing the repo owns may
  depend on it having been registered.
