# The Materializer

Read this only on a **first pin** — a slug with no
`.claude/stackgen/templates/` entry yet. It is the one code path that writes
to a repo, and every write it makes is consent-gated and committed once.

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
- **The answers** — an optional `answers:` map passed into the invocation
  beside the `repo:` line, in the same payload style: at most one value
  per axis of the `conditional:` vocabulary
  (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`) — `forge`, `secrets`.
  The map a caller passes comes from the target repo's
  `.config/stackgen.yaml` — its `forge` and `secrets` keys — with `forge`
  re-read live from the repo's `origin` host, so a remote that appeared
  since is evaluated against, not the record. `/vwf:init` puts them there
  through tool-config's `all --forge` and `all --secrets`, the script
  being that file's one writer; `/vwf:setup`'s materialize
  pass and `/stackgen:stackgen-sync` read it. A caller that passes none,
  or leaves an axis out, is read as below.
- **The values** — an optional `values:` map beside `answers:`, one
  block per component pack of the slug that declares `values:`
  (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`), keyed by the pack's
  slug and then by each entry's name, lowercased:

  ```text
  values:
    <pack slug>:
      <name, lowercased>: <value>
  ```

  The caller gathers it — `/vwf:setup` runs each entry's `detect`, and
  asks its `question` when `detect` exits non-zero or prints nothing —
  and this skill never asks. Each pair becomes one
  `--set <name, lowercased>=<value>` on that pack's `pack` call (step
  3's preview, step 5's run).

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
     `config/.config/mise/tasks/code/format` lands at
     `<repo>/.config/mise/tasks/code/format`, exactly the way `skills/`
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
     - **A root path must be on the allowlist.** Only `.npmrc`,
       `readme.md`, `fnox.toml`, `eslint.config.mjs`, `dprint.json`,
       `wrangler.jsonc` and the directory `.github/` — never
       `.github/workflows/` — may land at the repo root
       (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`). That doctrine's
       list is what may **sit** at a shaped root, and its other tiers
       nothing here ever lands: `.gitignore`, `.gitattributes`,
       `.graphifyignore` and `.vscode/` are `stackgen:tool-config`'s,
       `CONTRIBUTING.md`, `SECURITY.md` and `LICENSE` are `/vwf:init`'s,
       and `CLAUDE.md` and `mempalace.yaml` are vwf's, so a pack shipping
       any of them is refused like any other unallowlisted path. A
       language's manifests and lockfiles are not on the list at all. Any
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
       The five that joined on 2026-09-06 are there for that one reason
       too — the tool reading each discovers it at the root and cannot be
       pointed elsewhere. `dprint.json` is a
       **shim** whose only content is `extends` into `.config/`, exactly
       as `eslint.config.mjs` is.
     - **A pack ships no pre-commit hook fragment**; a gate it adds is a
       subtask in its `config/` tree, which the universal hooks reach
       through tool-config's `…:all` tasks.
   - **The pack's `templates/`, rendered by tool-config** — never copied
     here (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). For each
     component whose pack ships a `templates/` tree **or** a subtask in
     its `config/` tree, one call to tool-config's script, previewed in
     step 3 and run in step 5:
     `MISE_ENV=dev mise x -- node "${CLAUDE_PLUGIN_ROOT}/skills/tool-config/scripts/tool-config.mjs" pack --slug <slug> --dir <pack dir>`,
     `<pack dir>` the pack's own, `${CLAUDE_PLUGIN_ROOT}/stacks/<type>/<slug>/`
     (the skill's
     `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/SKILL.md#running-the-script`
     — the repo's mise config trusted beforehand, the formatter and the
     hook runner installed). It renders the pack's mise folder into
     `.config/mise/conf.d/<slug>/` and re-renders every `…:all` task, so a
     subtask copied in this set joins its gate. A pack value its templates
     name — swiftui's `XCODE_VERSION` — is declared in the pack's
     `values:` list, and the caller passes its value in the invocation's
     `values:` map (Inputs), gathered there by `detect`, else `question`.
     The call carries one `--set <name, lowercased>=<value>` per pair
     under that pack's slug. A pack whose `values:` entry has no pair in
     the map is not called: name the missing value in the plan and land
     nothing for that pack — the script would refuse the call naming it.
     After the call, **every path it rendered from the pack's
     `templates/` is recorded in the lockfile** with
     `source: pack/<type>/<slug>@<version>`, `rendered: true` and no hash:
     a rendered file is judged against a fresh render (`preview pack`),
     never against recorded bytes. The `…:all` tasks the call re-renders
     are tool-config's own and get no record.
   - The lockfile update — every path above, with its component ref,
     source and content hash (a rendered path: `rendered: true`, no
     hash), plus the **mode** for a `config/` file, and
     the `skipped:` list the evaluation below produces. The
     per-component record is what lets sync act on one component alone,
     and per file it is what makes `config/` precedence auditable: it
     names which component supplied the version that actually landed.
     The hash written here is the landing hash, not the last word:
     `/vwf:init` **re-records** the hash of every landed file it changes
     after landing, and on either answer of its replace-or-keep offer, so a
     differing hash is content drift only when no such writer ran.
     tool-config's own files have no record here; a pack's rendered ones
     have one without a hash.

   **Composition order, and why a bug in it is silent.** More than one
   component may write into one `config/` tree — `.config/mise/tasks/` is
   the first destination that happens for. Compose by component type in
   the order `toolchain-gate`, then
   `package-manager` / `language`, then
   `app-framework`, then `capability-provider`, then `cloud-provider`,
   then `cloud-service`; a **later component's file wins**, and the
   lockfile records per file which one that was. The baseline library
   every pack lands beside is `stackgen:tool-config`'s, written before any
   pack lands, and no pack ships a path it holds save the `#PLACEHOLDER`
   slot `setup/secrets`, which the secrets provider fills; the deploy
   target sits last, because how a repo ships is the most specific thing
   it pins. The two cloud types joined the order
   on 2026-09-05, when the first cloud pack shipped a `config/` tree
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`). Get it backwards and
   nothing errors: a generic `p/<id>/deploy` shadowing the deploy
   target's would simply ship the wrong way, in a repo where the task
   still exists and still exits zero.

   **The fence: stackgen writes only what a pack declares in `config/`.**
   Landing a config tree does not make stackgen the owner of a repo's
   configuration. What a pack **may** declare now includes the gate config
   files the tier was opened for on 2026-09-05 (a provider's environment
   is a mise file in its `templates/`); what stays outside is
   unchanged and enumerated
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

   **`.mcp.json` is not in the set either, but for a different reason**: it
   is a **tier-2** target (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`),
   so a component's `mcp_servers:` entries are presented at their own
   consent line in step 3 rather than landing with the files.

   **LSP configuration is not in the set, for a third reason**: it cannot
   go in a repo at all — a language server is a plugin-manifest feature no
   project file can express. A component's `languages[].facts.lsp` still
   travels in the payload for `/vwf:doctor` to read, and what actually
   provides the server is the **generated local plugin**, a tier-3 target
   outside the repo, handled at its own consent line in step 3b.

   **Conditional paths are evaluated here, after the set is assembled and
   before the collision check.** A pack may declare, in its `pack.yaml`, a
   `conditional:` list — a landed path or glob and a `when:` of one axis
   to one value, from the fixed vocabulary `forge`, `secrets`
   (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). For each
   entry, match its path or glob against the component's `config/` paths
   in the set as the pack spells them — **before** the `p/_project/`
   rename, the same spelling rule 11 resolved; the rename is applied to
   whatever stays — and evaluate `when:` against the `answers:` the
   caller passed:

   - **False** — the answer for that axis is present and differs — drops
     every matched path from the landing set. A dropped path this repo's
     lockfile has **never landed** (no `entries:` record) is written to
     the lockfile's `skipped:` list as `{ path, pack, when }`
     (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`): never a create and
     never a conflict, and a file already sitting there is the repo's
     own, unread and unlisted. A dropped path that **has** an `entries:`
     record — landed on an earlier run, the answer since flipped — is
     **not** written to `skipped:`: it keeps its record, is not removed,
     and is named in the plan under the skips heading as landed earlier,
     condition now false — kept. A path is in `entries:` or in
     `skipped:`, never both.
   - **True** leaves the path in the set, an ordinary member from here on
     — so a path both conditional and pre-existing is a conflict in step
     2 only when its condition is true.
   - **Unanswered** — the caller passed no `answers:`, or none for that
     axis — reads as true: the path lands, exactly as every path did
     before the key existed. A skip is an act of a known answer, never of
     a missing one, and this is what keeps a caller that passes nothing
     landing what it always landed. The rule is **unchanged** now that
     every caller this plugin knows about passes a full map read from
     the repo's `.config/stackgen.yaml` with the forge re-read live:
     it is the fallback for a caller nobody here has met, not the path
     those callers take.

   A path named by more than one entry stays only when every condition
   is true. A run evaluates only the packs of the slug it materializes,
   so it rewrites `skipped:` for **those packs alone** — their entries
   replaced from that run's answers, every other pack's entries kept as
   they were: a path skipped last time whose condition now holds leaves
   the list and lands as a create. Removing a kept path is the user's,
   through sync or removal, never a side effect of an answer changing.

2. **Collision check, against the lockfile.** Any target path that exists
   but is **not** in the target repo's own
   `.claude/stackgen/lock.yaml` — never a sibling repo's — is that
   repo's own file: a
   conflict listed for the user to resolve, never a write. Anything not in
   the lockfile is not stackgen's to touch.

   **A `config/` target is checked by exactly this rule, not a softer
   one.** A repo that already has `.config/mise/tasks/code/format` and no
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

   **Skips are listed under their own heading**, never folded into the
   creates or the conflicts: every path the evaluation in step 1 dropped,
   with the pack and the `when:` it failed against — and, marked "landed
   earlier, condition now false — kept", any path with an `entries:`
   record whose condition flipped, which stays where it is. The
   heading is present even when empty, so a user reading a plan with no
   issue forms in it sees *why* rather than a shorter list. Skips are not
   deselectable — there is nothing to decline.

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

   **MCP wiring is its own consent line too**, on the same terms. A
   component that needs a server declares it as `mcp_servers:` in its
   `pack.yaml` (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`) —
   `design-tool/claude-design` and `capability-provider/notion` are
   the two that do today — and those entries are written into the
   **project's `.mcp.json`**, never a plugin manifest. Present the
   exact server keys as a separate, individually skippable item. A
   consented edit **merges, never owns**: only the keys stackgen
   added are written, and they are recorded under the lockfile's
   `mcp_servers` so sync and removal touch nothing else. Declined leaves
   the component's skills landed and says the tool will be unreachable —
   never a silent partial landing.

   **The `config/` tree is its own consent line too**, the same tier
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`). It writes outside
   `.claude/`, into paths the repo's collaborators own and read, so it is
   presented as a separate, individually skippable item listing **every
   target path** — not folded into the file plan above. State the decline
   outcome in the plan, in these terms: **the skills stay landed and the
   tasks are simply absent** — a repo with the gate doctrine in
   `.claude/skills/` and no `mise run code:all` behind it. Say that at
   the gate, because the failure it prevents is a user discovering it a
   week later as a missing task.

   **The tool-config calls ride the `config/` line.** List each call
   under it, spelled as it will run; declining the line skips them too.
   For each pack run the script's
   `preview pack --slug <slug> --dir <pack dir> [--set <key>=<value>]…`,
   which writes nothing. Its rows are every file the call would create,
   write or delete — the pack's own mise files and the re-rendered `…:all`
   tasks — each answered `ok` or `keep-existing`
   (`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/SKILL.md#rows-and-answers`).
   Show them under that pack, answered inside this one consent, one set
   per pack with the script's ids. A call whose preview returns no row
   writes nothing and shows none.

4. **The local plugin — its own gate, and a larger one.** A component that
   declares an `lsp_servers:` entry, or a `user_mcp_servers:` one, is
   served by the generated local plugin at
   `~/.claude/plugins/local/stackgen-lsp/`
   (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md` — the fixed path, the
   manifest shape, the lockfile key). **The procedure is
   [the local plugin](local-plugin.md)**: the merge classification, the
   two file shapes, the already-registered detection, the version bump a
   re-read depends on, and removal by subtraction. This writes **outside
   the repo** and
   registers with a **user-scoped** tool, so it is gated apart from
   everything above and as **two** separately declinable items:

   - **The manifest write.** Show the exact `lspServers` and `mcpServers`
     keys being added and whether each is new or already present from
     another repo. It **merges, never owns** — existing keys the lockfile
     does not claim are left untouched, and a key another repo already
     contributed is reported, not rewritten.
   - **The registration.** Print the two commands and ask; **never run
     them unprompted**:

     ```sh
     claude plugin marketplace add ~/.claude/plugins/local/stackgen-lsp --scope user
     claude plugin install stackgen-lsp@stackgen-lsp --scope user
     ```

     Skip both when the plugin is already registered — say so instead.

   Declining either leaves everything else landed. A declined manifest write
   means the language server is simply absent, and the plan says so; a
   declined registration leaves a valid directory nobody installed, and
   reprints the two commands for later. Record the outcome under the
   lockfile's `local_plugin` block, `registered:` following the answer.

   **Say plainly that this is the developer's machine, not the repo.**
   Collaborators pulling the commit get none of it.

5. **Write and commit.** On approval: write the set, then run each
   consented pack's tool-config call with the answers its preview
   returned at step 3 — the user's pick for each row: the script's
   `pack --slug <slug> --dir <pack dir> [--set …] --answers <id>:<answer>,…`.
   The form is the skill's
   (`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/SKILL.md#rows-and-answers`),
   so the skill asks no second time. The subtasks are written before the
   call, so the `…:all` tasks it renders name them. A call it refuses is
   shown again — one refused because the repo's mise config is untrusted,
   or because the formatter or the hook runner is not installed, names its
   remedy (trust the path; run
   `MISE_ENV=dev mise run setup:all`), which is the person's to take before
   the call is re-run. Update the
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
   `mise run code:lint:swiftlint` claims the task does not exist while the
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

## Rules

- **Copy, never reference in place.** The repo owns its copies; the pack
  evolving does not change a repo until `/stackgen:stackgen-sync` shows the
  diff and the user takes it.
- **The lockfile is the ownership boundary** — sync diffs against it, and
  paths outside it are invisible to every stackgen write path.
- **A pack dropped from a composition takes its rendered files with it**,
  in this order. First one call, the script's `pack-remove --slug <slug>`,
  previewed then answered like any call: it deletes
  `.config/mise/conf.d/<slug>/` and every subtask named `<slug>` — never a
  path tool-config's own trees ship — drops `packs.<slug>` from
  `.config/stackgen.yaml`, and re-renders the `…:all` tasks so no gate
  calls a task that is gone. Then the pack's lockfile entries, its
  `rendered: true` ones among them, are removed with the pack's other
  recorded files — a path the call already deleted is simply dropped from
  the lockfile.
- **Four targets, and nothing else.** Inside `.claude/`, nothing lands
  outside the output vocabulary. Outside `.claude/` but inside the repo,
  there are exactly two: `.mcp.json`, and the repo config files a
  component declares in its `config/` tree — both tier 2, each behind its
  own consent line, and both **merging, never owning**, so only what the
  lockfile records is ever rewritten or removed. Outside the repo, the
  **only** path stackgen may write is
  `~/.claude/plugins/local/stackgen-lsp/.claude-plugin/`, behind the tier-3
  gate. **LSP server configuration never lands in the repo** whatever the
  source ships; it goes to the local plugin, and the need still travels as
  `language_facts` in the payload for `/vwf:doctor` to read.
- **The `config/` tier is what a pack declares, and no more.** A gate's own
  config file is inside it; the toolchain manager's files are
  `stackgen:tool-config`'s; the
  repo's manifests, its CI workflows, its editor settings and its CLAUDE.md
  are not (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`), and neither is
  any root path off the allowlist.
- **The local plugin is the machine's, not the repo's.** It is user-scoped
  and uncommitted, so it is never assumed present: nothing the repo owns may
  depend on it having been registered.
