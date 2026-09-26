---
name: stackgen-stack-template
description: Return one stackgen stack as a vwf template payload — reading the
  materialized entry from the target repo's .claude/ tree, or, on a first pin,
  resolving the bundle's composition and dispatching per component (shipped
  pack components copied, uncovered components generated) behind a consent
  gate. Invoked by /vwf:setup, which materializes a first pin, and by
  /vwf:plan and /vwf:execute, which fetch an already-materialized entry —
  not a general-purpose skill.
argument-hint: "<slug>"
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
> one argument the caller passes.

## Resolution order

1. **Materialized already?** Read `.claude/stackgen/templates/<slug>.md` at
   the root of the target repo — the one the invocation's `repo:` line
   names, else the current one (in a worktree, the tree is part of the
   checkout like any committed file). If it exists: return the payload
   below, filled from its frontmatter with the body as `conventions:`.
   **Stop — never regenerate, never diff.** Drift against packs is
   `/stackgen:stackgen-sync`'s job, on the user's clock — and it acts per
   component.
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
4. **Anything else is an error, not a guess.** Name the packs that do exist
   and the `generated/<technology-slug>` form. Never answer an unknown slug
   from general knowledge — a template this plugin has not materialized is a
   template the repo does not have.

## The payload

Return **only** this, filled from `.claude/stackgen/templates/<slug>.md`:

```yaml
slug: <the requested slug>
axis: project | backing | deploy | repo | design | cicd | stylesheet
kind: language-bundle | database | cloud-provider | repo-gate | repo-hygiene | workspace | capability-provider | ci-system | app-framework | deploy-target | design-tool | stylesheet # assets/kinds.md
components: # the bundle's composition — the per-component dispatch record
  - <type>/<slug>@<pack version> # pack-sourced
  - <type>/<slug>@generated # generated
platforms: [ <platform> ] # project axis only
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
machine_env: # passed through from every component that declares it, for /vwf:setup to ask; omitted when none does
  - { name: <ENV_VAR>, detect: <command>, question: <prompt> }
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

`machine_env` is what the caller asks, not what this skill fills. The
materializer leaves each value **unset**; `/vwf:setup`'s materialize pass
runs each `detect` — only while the committed entry matches the hash its
lockfile records, asking with no default otherwise — offers the value
preselected, refuses one its reader would not take literally, and writes
the answer with `/stackgen:tool-config mise set env <KEY>=<value> for
<pack>` (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). A `binaries`
probe is gated the same way in `/vwf:doctor`, which reports it not run on
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
- **A landing is not confined to `.claude/`.** A component may also declare
  repo config files in a `config/` tree that mirrors the **repo root** —
  `config/.config/mise/tasks/code/format` lands at
  `<repo>/.config/mise/tasks/code/format`. It is a **target, not a fifth
  artifact kind**: copied verbatim, gated on its own tier-2 consent line,
  merging rather than owning, recorded per file in the lockfile with the
  component that supplied it, and executable where mise requires it. The
  tier covers a gate's own config file and a pack's editor fragment
  (`.config/vscode.d/<pack>.jsonc`); what it
  still may not write — a language manifest, a CI workflow, a **whole**
  editor file, CLAUDE.md — and the allowlist of what may land
  at the repo **root** are
  `${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`. The procedure is the
  materializer.
- **The universal tools are not slugs.** No `mise` bundle exists; the
  toolchain manager's files are `stackgen:tool-config`'s, and a pack asks
  for what it needs through its `tool-config:` list, which the materializer
  previews inside its one consent and then runs with those answers.
- **A fragment is copied, never merged, by this skill.** A
  `.config/pre-commit.d/<pack>.yaml` lands verbatim as its own file;
  folding the fragments into `.config/pre-commit-config.yaml` is
  `/vwf:init`'s step, between its own markers. Nothing here reads or
  rewrites that file — a materializer that merged it would own a file two
  other things also write.
- **A `config/_<name>/` directory is pack-private and is never copied**
  (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). It is payload a reader
  picks from — the licence texts are the case — so landing the directory
  would answer a question the user was about to be asked.
- **The target repo is the current one by default**, and a caller names
  another one way: a single optional `repo: <path>` line passed into the
  invocation beside the catalog paths, in the same payload style the vwf
  stack-adapter contract's delegation protocol uses for those — a path
  relative to the current repo's root. The argument itself stays
  `<slug>`; there is no second positional. When the line is present every
  read of `.claude/stackgen/…` in steps 1–3, every write the materializer
  makes, and the lockfile it keeps
  (`<repo>/.claude/stackgen/lock.yaml`) resolve under that path; absent
  means the current repo. Each repo gets its own independent copies and
  its own lockfile — never one repo's copies pasted around.
- **A caller may pass answers the same way**: an optional `answers:` map
  beside the `repo:` line, at most one value per axis of the
  `conditional:` vocabulary — `forge`, `editor`, `secrets`, `update_bot`
  (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). The materializer
  evaluates every pack's `conditional:` entries against it in its step 1
  and skips the paths whose answer differs, recording them in the
  lockfile's `skipped:` list. **Three callers pass the map now** —
  `/vwf:init`, which asks the four questions and records them in the
  base repo's `.config/vwf.yaml` under its `answers:` block (`editor`
  and `secrets` once for the product, `forge` and `update_bot` per
  repo); `/vwf:setup`'s materialize pass, which lands a pinned template
  long after init ran; and `/stackgen:stackgen-sync`, which re-derives a
  pack's landing set. Each reads that block, re-reads `forge` from the
  repo's `origin` host live and passes that, and passes the full map per
  repo; a caller that finds no block infers the four values from the
  tree, passes those and writes nothing. An axis the map leaves out, or
  a map not passed at all, reads as **true** and lands the path — the
  **fallback** for a caller that passes none, which keeps a caller this
  contract does not know about landing what it always landed, and not
  the path the three above take. These two lines are the whole of the
  optional input beside the catalog paths.
- **The caller may pass context; this skill never reaches for another
  plugin's files.** vwf passes the principles-catalog paths into the
  invocation (the design-adapter payload style). If a generation run needs
  the catalog and none was passed, halt and say so — `${CLAUDE_PLUGIN_ROOT}`
  names this plugin's root, nothing else's.
- **All writes go through the consent gate and the git workflow** — see the
  materializer. A fetch (step 1) writes nothing, ever.
