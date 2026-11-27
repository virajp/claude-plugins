---
name: stackgen-stack-template
description: Return one stackgen stack as a vwf template payload — reading the
  materialized entry from the target repo's .claude/ tree, or, on a first pin,
  reading the bundle's bootstrap tools and knowledge packs and dispatching
  per pack (shipped packs copied, @generated refs generated), with the tool
  knowledge those tools call for, behind a consent gate; a design-tool pin
  installs that tool into the local plugin vwf-tools. Invoked by /vwf:setup,
  which materializes a first pin, and by /vwf:plan and /vwf:execute, which
  fetch an already-materialized entry. /vwf:setup also calls it to remove
  a component or a server key, and to reconcile this repo's claims — not a
  general-purpose skill.
argument-hint: "<slug> | remove: <slug> | remove: key <name> | reconcile-claims:"
disable-model-invocation: false
user-invocable: false
---

# stackgen-stack-template

Return the template payload for the slug the caller names, per the vwf
stack-adapter contract. This skill is the **dispatch rule**, and dispatch
runs **per pack**: materialized entries are read back; a first pin reads the
bundle's `tools:` and `packs:` and materializes each pack — shipped packs by
copy, `@generated` refs by generation — and the tool knowledge its tools call
for. Materialization is **explicit and consent-gated — never a silent
re-run**.

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
   **Stop — never regenerate, never diff.** Drift against packs and tool
   knowledge is `/stackgen:stackgen-sync`'s job, on the user's clock — and it
   acts per component.
2. **A design tool?** A slug naming a folder of
   `${CLAUDE_PLUGIN_ROOT}/design-tools/` that holds a `tool.yaml` is a
   `design`-axis pin. It lands nothing in the repo: the tool installs into
   the local plugin `vwf-tools`
   ([the materializer](references/materializer.md#the-design-tools)), and the
   call returns the payload from the plugin's own folder — `axis: design`,
   `name` from `tool.yaml`, the tool's `conventions.md` as `conventions:`. A
   tool this repo already claims in `vwf-tools` is the plain read: no gate,
   no write.
3. **A first pin? Read the recorded composition.** The slug names a **bundle
   file**: `${CLAUDE_PLUGIN_ROOT}/stacks/bundles/<slug>.md`, a shipped
   bundle, or `.claude/stackgen/bundles/<slug>.md` in the target repo, a repo
   bundle `/stackgen:stackgen-stack-menu compose:` wrote. Its frontmatter
   lists the bootstrap tools it needs under `tools:`, and its knowledge
   packs under `packs:` as `<type>/<slug>@<version|generated>` refs; its body
   is the composition's own conventions — take all three. The composition is
   **recorded, not inferred**: a bundle is a reviewed or a chosen
   combination, and re-deriving it from whatever the repo happens to contain
   would silently produce a different stack than the one the user picked.
   A combination no bundle covers is composed first, through the menu's
   `compose:` verb, never inferred here.
4. **Dispatch.** Each pack ref with a shipped pack
   (`stacks/<type>/<slug>/pack.yaml`) is a copy — read
   [the materializer](references/materializer.md). Each `@generated` ref
   is a generation — read [the generator](references/generator.md):
   research, catalog instantiation, the `stackgen-skill-reviewer` gate, per
   component. Generation vets every concrete third-party name it emits
   through `stackgen-reputation` and halts on a `block` — the user names
   the replacement, never the generator. Beside the packs, the
   materializer selects the **tool knowledge** the tools call for
   ([the materializer](references/materializer.md#tool-knowledge)), takes
   the LSP servers from `bootstrap lsp --json`, and installs the design tool
   each project's `design` names. The whole composition then lands
   **once** through the materializer — one dry-run plan, one consent, one
   commit — with the template entry recording the bundle's `tools:` and
   `packs:` and the lockfile recording every landing per component, so a
   later re-sync can act on one component alone. Return the payload from
   the freshly materialized entry.
5. **Anything else is reported and skipped, never a guess.** A slug with no
   materialized entry, no design tool and no bundle file — on any axis, a pin
   whose bundle was removed among them — returns one line, **skipped**,
   naming the slug, the bundles that do exist and the menu's `compose:`
   verb. It is never an error, and a pack ref inside a bundle whose pack no
   longer exists is reported and skipped the same way by the materializer.
   Never answer an unknown slug from general knowledge — a template this
   plugin has not materialized is a template the repo does not have. A
   removed pin's materialized skills stay until `/vwf:setup`'s step 26
   takes them out through `remove:`.

   **An `addon` slug is this case.** An addon is a Claude plugin listed in
   `${CLAUDE_PLUGIN_ROOT}/assets/addons.yaml`; vwf's setup declares a picked
   one in the `claude` tool's `plugins.project` and runs `setup:ai`. This
   skill materializes nothing for it, and its **skipped** line says the
   plugin is vwf's setup to declare.

## Removing a component

`/stackgen:stackgen-stack-template remove:` is the one call that takes a
component out, and the one `/vwf:setup` reaches to do it. It skips the
resolution order and returns no payload: one line, **removed** or
**declined**. It has two forms:

- **`remove: <slug>`** — any materialized slug, on any axis: a pin whose
  bundle was removed, a re-pinned design tool. It deletes the component with
  all its records and keys, MCP ones included; for a design tool, it drops
  this repo's claim on that tool in `vwf-tools`. A slug the lockfile does not
  record and `vwf-tools` does not hold for this repo has nothing to remove,
  and the call says so.
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
`/vwf:setup` makes the call once per run in the base repo, because a claim
dropped on another machine reaches this one by a pull: the lockfile no longer
records the LSP server, or `.config/vwf.yaml` no longer names the design tool,
so no `remove:` call is made, and this repo's claim stays. Every key in
`claims.json` that claims this repo's path and that the repo no longer records
loses this repo's claim, behind the normal tier-3 consent, and leaves
`vwf-tools` only when no repo claims it. It skips the resolution order and
returns no payload: one line, **removed**, **declined** or **unchanged**. A
decline changes nothing and is offered again on the next run. The procedure is
[the materializer](references/materializer.md#reconciling-this-repos-claims).

## The payload

Return **only** this, filled from `.claude/stackgen/templates/<slug>.md`,
followed on a call `/vwf:setup` makes by any `declined:` line
[one offer per setup run](references/materializer.md#one-offer-per-setup-run)
calls for:

```yaml
slug: <the requested slug>
axis: project | backing | deploy | repo | design | cicd | stylesheet
kind: language-bundle | database | cloud-provider | workspace | capability-provider | ci-system | app-framework | deploy-target | stylesheet # assets/kinds.md — omitted on the design axis
tools: [ <bootstrap tool name> ] # the bundle's tools:, from the entry's frontmatter — omitted on the design axis
packs: # the bundle's packs: — the per-component dispatch record; omitted on the design axis
  - <type>/<slug>@<pack version> # pack-sourced
  - <type>/<slug>@generated # generated
platforms: [ <platform> ] # project axis only
os: # project axis only — the bundle's os: map, passed through; omitted when the bundle declares none
  <platform>: [ <os> ]
languages: [ <token> ] # the tools whose catalog category is languages
optional_languages: []
frameworks: [] # derived — the composition's framework component slugs
dependencies: []
capabilities: [] # backing axis — the components' capability tokens
artifact: <token> # deploy axis
conventions: |
  <the entry's body, verbatim — do not summarize it away>
```

The payload carries **no** language facts, server declaration, package
manager, lockfile or `harness`: a language's facts, its server, its package
manager and its tasks are bootstrap's, read from the repo through the
bootstrap CLI.

`os` is the bundle's own `os:` map, copied as it stands — the payload adds
no token and orders none. A repo bundle may carry one under the same rule;
when it does not, the key is omitted and vwf draws its generic frame.

## Rules

- **Reads are cheap and pure.** Steps 3–4 run at most once per slug per repo;
  every later fetch is step 1 — a file read — or, for a design tool already
  claimed, step 2's read of this plugin's folder. `plan` and `execute` fetch
  conventions mid-run and must never trigger research, network, or a write.
  The reputation check belongs to generation — where a name is first
  emitted — and never to a read: a materialized entry is returned as it
  was landed, with no re-check.
- **Dispatch is per pack; landing is per bundle.** Pack-or-generate is
  decided ref by ref — a covered framework never regenerates because a
  datastore beside it is generated — but the user consents to one landing
  set and gets one commit, never a drip of gates. A caller landing several
  slugs in one repo invokes this skill once per slug, and gets one consent
  and one commit per slug.
- **Tool knowledge follows the tools, never the menu.** No bundle lists a
  tool-knowledge entry: the materializer copies each entry under
  `${CLAUDE_PLUGIN_ROOT}/tools/` whose `tool.yaml` names a tool the project
  links or the bundle names, and every entry naming none.
- **Structure follows the kind; the slice follows the type.** Every
  composition declares a kind (`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`) and
  each component ships the structural slice its type owns within it
  (`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`) — the run never invents a
  structure.
- **A `stylesheet` bundle is doctrine and nothing else.** Its one pack
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
- **Servers never land in a repo.** An LSP server comes from
  `bootstrap lsp --json`, copied unchanged into the generated local plugin,
  `vwf-tools` ([the local plugin](references/local-plugin.md)), which holds
  LSP servers and the design tools; no pack or generator writes one. **No MCP
  server is installed by this skill**: the user owns every MCP install. A
  component that needs one names it in its `conventions.md`'s
  `## MCP servers` section, and the materializer records each line in the
  lockfile's `required_mcp_servers` for `/vwf:doctor` to read
  (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). MCP records an older
  lockfile carries are ignored by every verb but `remove:`.
- **A landing is not confined to `.claude/`.** A pack may also declare
  repo config files in a `config/` tree that mirrors the **repo root** —
  `config/.config/mise/tasks/p/_project/deploy.py` lands at
  `<repo>/.config/mise/tasks/p/<id>/deploy.py`. It is a **target, not a fifth
  artifact kind**: copied verbatim, gated on its own tier-2 consent line,
  merging rather than owning, recorded per file in the lockfile with the
  component that supplied it, and executable where mise requires it. The
  tier holds what is specific to the repo — `p/_project/` tasks, each a
  Python uv script `<name>.py` (mode 755, the
  `#!/usr/bin/env -S uv run --script` shebang), and the allowlisted root
  files; what it may not write — a test task, a language
  manifest, a CI workflow, editor settings, CLAUDE.md — and the allowlist of
  what may land at the repo **root** are
  `${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`. The procedure is the
  materializer.
- **The toolchain is not a slug, and not a pack's.** No `mise` or gates
  bundle exists, and no pack names a toolchain tool: the tool pins, the
  gates, their configs, the generic and the test tasks are bootstrap's. A
  bundle names its tools under `tools:`, the materializer checks them
  against `bootstrap catalog --json`, and asks for them with
  `bootstrap add tool`
  ([the bootstrap handoff](references/bootstrap-handoff.md)). No pre-commit
  hook fragment is landed or merged.
- **A `config/_<name>/` directory is pack-private and is never copied**
  (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). It is payload a reader
  picks from — the licence texts are the case — so landing the directory
  would answer a question the user was about to be asked.
- **A failed `bootstrap` call stops the skill** with the envelope's `errors`,
  as bootstrap gives them; nothing after it is written.
- **The target repo is the current one by default**, and a caller names
  another one way: a single optional `repo: <path>` line passed into the
  invocation beside the catalog paths, in the same payload style the vwf
  stack-adapter contract's delegation protocol uses for those — a path
  relative to the current repo's root. The argument itself stays
  `<slug>`, one of the `remove:` forms or `reconcile-claims:`; there is no
  second positional. When the
  line is present every
  read of `.claude/stackgen/…` in steps 1–4, every write the materializer
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
