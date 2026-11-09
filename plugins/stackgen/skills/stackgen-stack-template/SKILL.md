---
name: stackgen-stack-template
description: Return one stackgen stack as a vwf template payload — reading the
  materialized entry from the target repo's .claude/ tree, or, on a first pin,
  resolving the bundle's composition and dispatching per component (shipped
  pack components copied, uncovered components generated) behind a consent
  gate. Invoked by /vwf:setup, which materializes a first pin, and by
  /vwf:plan and /vwf:execute, which fetch an already-materialized entry.
  /vwf:setup also calls it on every run for each picked addon, to remove
  a component or a server key, and to reconcile this repo's server claims
  — not a general-purpose skill.
argument-hint: "<slug> | remove: <slug> | remove: key <name> | reconcile-claims:"
disable-model-invocation: false
user-invocable: false
---

# stackgen-stack-template

Return the template payload for the slug the caller names, per the vwf
stack-adapter contract. This skill is the **dispatch rule**, and dispatch
runs **per component**: materialized entries are read back; a first pin
resolves the bundle's composition and materializes each component — shipped
packs by copy, uncovered components by generation. Materialization is
**explicit and consent-gated — never a silent re-run**.

> **`disable-model-invocation` must stay `false`, and `user-invocable` must
> stay `false`** — the first so vwf can reach the skill by its constructed
> name, the second because no user types it. See `stackgen-stack-menu`. The
> `argument-hint` stays: it costs nothing on a hidden skill and documents the
> one argument the caller passes. `remove: <slug>`, `remove: key <name>`
> ([Removing a component](#removing-a-component)) and `reconcile-claims:`
> ([Reconciling claims](#reconciling-claims)) are that argument's other forms.

## Resolution order

1. **Materialized already?** Read `.claude/stackgen/templates/<slug>.md` at
   the root of the target repo — the one the invocation's `repo:` line
   names, else the current one (in a worktree, the tree is part of the
   checkout like any committed file). If it exists: return the payload
   below, filled from its frontmatter with the body as `conventions:`.
   **Stop — never regenerate, never diff.** Drift against packs is
   `/stackgen:stackgen-sync`'s job, on the user's clock — and it acts per
   component.

   An entry whose `axis:` is `addon` is no exception: an addon lands no
   server, so the call `/vwf:setup` makes for it on every run is this same
   read ([the materializer](references/materializer.md#an-addon-already-materialized)).
   Only `/vwf:setup` makes an `addon` call; `/vwf:plan` and `/vwf:execute`
   collect no `addon` pin.
2. **A first pin? Read the recorded composition.** The slug names a **bundle
   file**, `${CLAUDE_PLUGIN_ROOT}/stacks/bundles/<slug>.md`. Its frontmatter
   already lists every component as a `<type>/<slug>@<version|generated>`
   ref, and its body is the composition's own conventions — take both. The
   composition is **recorded, not inferred**: a bundle is a reviewed
   combination, and re-deriving it from whatever the repo happens to contain
   would silently produce a different stack than the one the user picked.

   **Only `generated/<technology-slug>` has no bundle file**, because nothing
   curated it. There, and only there, infer the composition: resolve the root's
   kind and the component types that compose it
   (`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`,
   `${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`) by reading the repo's manifests
   and the config's `stack` block, and name every component as a
   `<type>/<slug>` ref.
3. **Dispatch each component.** A component with a shipped pack
   (`stacks/<type>/<slug>/pack.yaml`) is a copy — read
   [the materializer](references/materializer.md). An uncovered component
   is a generation — read [the generator](references/generator.md):
   research, catalog instantiation, the `stackgen-skill-reviewer` gate, per
   component. Generation vets every concrete third-party name it emits
   through `stackgen-reputation` and halts on a `block` — the user names
   the replacement, never the generator. The whole composition then lands
   **once** through the materializer — one dry-run plan, one consent, one
   commit — with the template entry recording the bundle as `components:`
   refs and the lockfile recording every landing per component, so a later
   re-sync can act on one component alone. Return the payload from the
   freshly materialized entry.
4. **Anything else is reported and skipped, never a guess.** A slug with no
   materialized entry and no bundle file — on any axis, a pin whose pack was
   removed among them — returns one line, **skipped**, naming the slug, the
   packs that do exist and the `generated/<technology-slug>` form. It is never
   an error, and a component ref inside a bundle whose pack no longer exists is
   reported and skipped the same way by the materializer. Never answer an
   unknown slug from general knowledge — a template this plugin has not
   materialized is a template the repo does not have. A removed pin's
   materialized skills stay until `/vwf:setup`'s step 26 takes them out through
   `remove:`.

## Removing a component

`/stackgen:stackgen-stack-template remove:` is the one call that takes a
component out, because `/stackgen:stackgen-sync` is user-only and `/vwf:setup`
has to reach it. It skips the resolution order and returns no payload: one
line, **removed** or **declined**. It has two forms:

- **`remove: <slug>`** — any materialized slug, on any axis: a dropped addon,
  a pin whose pack was removed, a re-pinned design tool. It deletes the
  component with all its records and keys, MCP ones included. A slug the
  lockfile does not record has nothing to remove, and the call says so.
- **`remove: key <name>`** — deletes one server key from the `vwf-tools`
  manifest and `claims.json`, whichever repos claim it, and returns the removed
  key name. It edits no lockfile and commits nothing. `/vwf:setup`'s machine
  cleanup uses it for every MCP key in `vwf-tools`.

The first applies, on one plan and one consent, the removal rules of
[the local plugin](references/local-plugin.md#removal--by-subtraction) and
[the bootstrap handoff](references/bootstrap-handoff.md#removal), delete
the slug's recorded files, refusing and reporting a recorded path that resolves
outside the repo root, update the lockfile and commit once. A call carrying a
`consented` line — `/vwf:setup` passes one into each call it makes under a
consent it already asked — shows the plan and asks nothing; a call without one
asks its own consent. `/vwf:setup` reaches a member repo with the `repo:` line,
as it does for a materialization. The procedure
is [the materializer](references/materializer.md#removing-a-component).

## Reconciling claims

`/stackgen:stackgen-stack-template reconcile-claims:` takes no slug.
`/vwf:setup` makes the call once per run in the base repo, because an LSP
server dropped on another machine reaches this one by a pull: the lockfile no
longer records the server, so no `remove:` call is made, and this repo's claim
stays. Every `lspServers` key in `claims.json` that claims this repo's path and
that the lockfile no longer records loses this repo's claim, behind the normal
tier-3 consent, and leaves the manifest only when no repo claims it. It skips
the resolution order and returns no payload: one line, **removed**, **declined**
or **unchanged**. A decline changes nothing and is offered again on the next
run. The procedure is
[the materializer](references/materializer.md#reconciling-this-repos-claims).

## The payload

Return **only** this, filled from `.claude/stackgen/templates/<slug>.md`,
followed on a call `/vwf:setup` makes by any `declined:` line
[one offer per setup run](references/materializer.md#one-offer-per-setup-run)
calls for:

```yaml
slug: <the requested slug>
axis: project | backing | deploy | repo | design | cicd | stylesheet | addon
kind: language-bundle | database | cloud-provider | workspace | capability-provider | ci-system | app-framework | deploy-target | design-tool | stylesheet | addon # assets/kinds.md
components: # the bundle's composition — the per-component dispatch record
  - <type>/<slug>@<pack version> # pack-sourced
  - <type>/<slug>@generated # generated
platforms: [ <platform> ] # project axis only
os: # project axis only — the bundle's os: map, passed through; omitted when the bundle declares none
  <platform>: [ <os> ]
languages: [ <token> ]
language_facts: # per language — what /vwf:doctor verifies
  <token>: { lsp: <how provided | n/a>, mise_tool: <name | n/a>, manifest: <file | n/a>, binaries: [ <name> | { name: <name>, probe: <command> } ] } # binaries passed through from pack.yaml in either form; omitted when the pack declares none
optional_languages: []
frameworks: [] # derived — the composition's framework component slugs
dependencies: []
capabilities: [] # backing axis — the components' capability tokens
artifact: <token> # deploy axis
package_manager: <token> # repo axis
lockfile: [ <path or glob> ] # beside package_manager — passed through from the package-manager pack; omitted when none declares it
harness:
  <capability>: { task: <name>, mechanism: <one line> } # or n/a
conventions: |
  <the entry's body, verbatim — do not summarize it away>
```

`language_facts` is the **materialized escape**: a language no shipped bundle
covers is still *known* to vwf when its pin is a stackgen template carrying
these emitted facts — doctor verifies against them instead of against a
language plugin. Emitting them honestly (`n/a` included) is what keeps that
check real.

`os` is the bundle's own `os:` map, copied as it stands — the payload adds
no token and orders none. A generated bundle may emit it under the same
rule; when it does not, the key is omitted and vwf draws its generic frame.

A `binaries` probe runs in `/vwf:doctor` only while the committed entry
matches the hash its lockfile records, and is reported not run on
drift. It adds no consent tier.

## Rules

- **Reads are cheap and pure.** Steps 2–3 run at most once per slug per repo;
  every later fetch is step 1 — a file read. `plan` and `execute` fetch
  conventions mid-run and must never trigger research, network, or a write.
  The reputation check belongs to generation — where a name is first
  emitted — and never to a read: a materialized entry is returned as it
  was landed, with no re-check.
- **Dispatch is per component; landing is per bundle.** Pack-or-generate is
  decided component by component — a covered language never regenerates
  because its framework is uncovered — but the user consents to one landing
  set and gets one commit, never a drip of gates. A caller landing several
  slugs in one repo invokes this skill once per slug, and gets one consent
  and one commit per slug.
- **Structure follows the kind; the slice follows the type.** Every
  composition declares a kind (`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`) and
  each component ships the structural slice its type owns within it
  (`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`) — the run never invents a
  structure.
- **A `stylesheet` bundle is doctrine and nothing else.** Its one component
  ships a `conventions.md` and a paths-scoped skill and **no `config/` tier**,
  so the landing is the ordinary one — the conventions fold into the template
  entry, the skill copies into the repo's `.claude/skills/`, the lockfile
  records the component and the slug — and there is no repo config file to
  consent to on top. What the approach needs wired into the host framework (a
  build plugin, an entry stylesheet import) is **not landed here**: the
  doctrine names it by role and `/vwf:execute` makes the edit in the project's
  own config, because that edit is framework-specific and this component does
  not know which framework it was pinned beside. A config file that guessed
  would overwrite the framework pack's.
- **An `addon` bundle is an optional tool**, landed the ordinary way only in
  the base repo: its `## Claude plugins` section goes to the bootstrap
  handoff, and it lands no server. Its pin comes from the tools menu, through
  `.config/vwf.yaml`'s `addons:` list, and a slug dropped from that list
  leaves through `remove: <slug>`.
- **Servers never land in a repo.** A component's `lsp_servers:` is the only
  server field, and it goes to the generated local plugin, `vwf-tools`
  ([the local plugin](references/local-plugin.md)), which holds LSP servers
  only. **No MCP server is installed by this skill**: the user owns every MCP
  install. A component that needs one names it in its `conventions.md`'s
  `## MCP servers` section, and the materializer records each line in the
  lockfile's `required_mcp_servers` for `/vwf:doctor` to read
  (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). MCP records an older
  lockfile carries are ignored by every verb but `remove:`.
- **A landing is not confined to `.claude/`.** A component may also declare
  repo config files in a `config/` tree that mirrors the **repo root** —
  `config/.config/mise/tasks/test/golden` lands at
  `<repo>/.config/mise/tasks/test/golden`. It is a **target, not a fifth
  artifact kind**: copied verbatim, gated on its own tier-2 consent line,
  merging rather than owning, recorded per file in the lockfile with the
  component that supplied it, and executable where mise requires it. The
  tier holds what is specific to the repo — `test:*` tasks, `p/_project/`
  tasks, the allowlisted root files; what it may not
  write — a language manifest, a CI workflow, editor settings, CLAUDE.md —
  and the allowlist of what may land at the repo **root** are
  `${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`. The procedure is the
  materializer.
- **The toolchain is not a slug, and not a pack's.** No `mise` or gates
  bundle exists, and no pack names a toolchain tool: the tool pins, the
  gates, their configs and the generic tasks are bootstrap's. The
  materializer reads a fresh clone of bootstrap to find the tools a
  composition needs, and asks for them through bootstrap's
  `docs/sync/vwf.md` ([the bootstrap handoff](references/bootstrap-handoff.md)). No pre-commit
  hook fragment is landed or merged.
- **A `config/_<name>/` directory is pack-private and is never copied**
  (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). It is payload a reader
  picks from — the licence texts are the case — so landing the directory
  would answer a question the user was about to be asked.
- **The target repo is the current one by default**, and a caller names
  another one way: a single optional `repo: <path>` line passed into the
  invocation beside the catalog paths, in the same payload style the vwf
  stack-adapter contract's delegation protocol uses for those — a path
  relative to the current repo's root. The argument itself stays
  `<slug>`, one of the `remove:` forms or `reconcile-claims:`; there is no
  second positional. When the
  line is present every
  read of `.claude/stackgen/…` in steps 1–3, every write the materializer
  makes, and the lockfile it keeps
  (`<repo>/.claude/stackgen/lock.yaml`) resolve under that path; absent
  means the current repo. Each repo gets its own independent copies and
  its own lockfile — never one repo's copies pasted around. This
  line, the `declined:` line
  [one offer per setup run](references/materializer.md#one-offer-per-setup-run)
  defines and the `consented` line of
  [removing a component](#removing-a-component) are the whole of the optional
  input beside the catalog paths.
- **The caller may pass context; this skill never reaches for another
  plugin's files.** vwf passes the principles-catalog paths into the
  invocation (the design-adapter payload style). If a generation run needs
  the catalog and none was passed, halt and say so — `${CLAUDE_PLUGIN_ROOT}`
  names this plugin's root, nothing else's.
- **All writes go through the consent gate and the git workflow** — see the
  materializer. A fetch (step 1) writes nothing, ever.
