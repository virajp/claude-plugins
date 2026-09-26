# Pack Format

A **pack** is a curated, pre-created **component** — the dispatch rule's
preferred path, one pack per component: `typescript`, `pnpm`, `postgres`,
`cloud-run`. A whole stack is never one pack: a **bundle** is a recorded
composition of component refs, not a directory (see Bundles below). Packs
ship as stackgen **assets**, not live plugin skills: installing stackgen
floods no session with every stack's doctrine, because nothing under
`stacks/` is discovered by Claude Code — it only reaches a session once the
materializer copies it into a repo's `.claude/` tree.

**Every pack in the tree is authored here.** The `toolchain-gate` type ships
ten packs under `stacks/toolchain-gate/` — `analysis-options`, `dprint`,
`eslint`, `gitleaks`, `grype`, `pre-commit`, `ruff`, `swift-format`,
`swiftlint` and `tsconfig` — and no curated plugin stands behind any pack:
the tree is each pack's only home. This file is the contract every pack is
folded into, so an author targets a shape the materializer already reads.

## Layout

```text
stacks/<type>/<slug>/
├── pack.yaml            # metadata — everything the payload needs but prose
├── conventions.md       # this component's conventions: prose, verbatim into the payload
├── skills/<name>/…      # optional: skills to copy into .claude/skills/
├── agents/<name>.md     # optional: subagents to copy into .claude/agents/
├── rules/<name>.md      # optional: rules to copy into .claude/rules/
├── hooks/               # optional: hook scripts + their settings entries
│   ├── <name>.sh        #   the script, copied into .claude/hooks/
│   └── hooks.yaml       #   the settings.json hook entries it needs (consent-gated)
└── config/              # optional: repo config files — tree mirrors the repo root
    ├── .config/…        #   e.g. .config/mise/tasks/code/format (consent-gated)
    ├── .config/mise/conf.d/<pack>.toml       #   env fragment, auto-loaded
    ├── .config/pre-commit.d/<pack>.yaml      #   hook fragment, merged by /vwf:init
    ├── .config/vscode.d/<pack>.jsonc         #   editor fragment, merged by /vwf:init
    └── _<name>/…        #   pack-private payload — NEVER copied
```

**Three sub-conventions inside `config/`**, each a different contract:

- **`config/.config/…` and the root allowlist.** Everything under `config/`
  mirrors the repo root, so `config/.config/dprint.json` lands at
  `<repo>/.config/dprint.json` and `config/.gitignore` at `<repo>/.gitignore`.
  A path landing at the **root** must be on the fixed allowlist
  (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`); anything else belongs
  under `.config/`, and the materializer refuses a root path that is not on
  it.
- **`config/_<name>/` is pack-private and is not copied.** A leading
  underscore **at the top of the tier** marks a payload a *reader* uses rather
  than a file the repo gets — `config/_licenses/MIT.txt` is the case that
  needs it: the hygiene pack carries both licence texts, and `/vwf:init`
  copies the one the user picked to `LICENSE` with the year and holder filled.
  Copying the directory wholesale would land two licences and answer a
  question nobody asked. Nested deeper, the same character means the
  opposite: `.config/mise/tasks/p/_project/` is a **marked position**, copied
  and renamed to the project's id as it lands — the id being the slug
  `${CLAUDE_PLUGIN_ROOT}/assets/ids.md` defines, never the raw name — and
  the materializer's copy rules are where that behaviour is specified.
- **Fragments are named `<pack-name>.<ext>`, one per pack.**
  `.config/mise/conf.d/<pack>.toml` is an environment fragment the toolchain
  manager auto-loads, which is how a provider contributes variables without
  editing `mise.toml` — and where a value is the machine's to answer, how
  a pack's `machine_env:` gets it filled (below).
  `.config/pre-commit.d/<pack>.yaml` is a hook fragment
  — a standalone `repos:` list, valid YAML on its own — that the materializer
  copies **verbatim** and `/vwf:init` merges into
  `.config/pre-commit-config.yaml` between markers. The pack name in the
  filename is what makes a fragment attributable at a glance and keeps two
  packs from colliding on one path. **Editor fragments** are the third of
  these, and have their own shape — below.

`<type>` is a component type from
`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`. The slug is unique within the
plugin. The artifact set is closed to the output vocabulary
(`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`): skills, agents, hooks,
rules — **never MCP or LSP configuration**.

**Hook scripts are pack-only.** A pack may ship them because they were
curated and tested here; generation never emits an executable — a generated
"hook" is at most a recommendation in the conventions prose. The
`hooks.yaml` entries land in `.claude/settings.json` only behind the
materializer's separate settings-consent line.

**`config/` is a target, not a fifth artifact kind.** It mirrors the repo
root rather than `.claude/`, so `config/.config/mise/tasks/code/format` lands
at `<repo>/.config/mise/tasks/code/format`, behind its own consent line, and
merging never owning — the rules, the per-file lockfile record, the
composition order when two components write one tree, the root allowlist and
the four things the tier still may not write are
`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`. A gate pack **does** ship the
config file it governs, and a provider pack its environment fragment; what
stays out is a language manifest, a CI workflow, a **whole** editor file
and CLAUDE.md — a pack contributes to the editor through the fragment
below, never by shipping `.vscode/settings.json`. **Mode is preserved**:
anything under `config/.config/mise/tasks/**` must be authored executable
(755), which `p:plugins:check` asserts, because mise runs a task file directly
and reports a non-executable one as an unknown task.

### Editor fragments

A pack may ship `config/.config/vscode.d/<pack>.jsonc`: a JSONC object
with exactly three optional top-level keys, and nothing else.

**One pack is exempt from the filename**, and it is the formatter: the
`dprint` pack's fragment is `dprint-editor.jsonc`, because dprint 0.57.1
discovers any `dprint.jsonc` below the repo root as a sub-directory config
— and a fragment carrying no `plugins` makes every bare `dprint check` or
`dprint fmt` exit 13. The composition glob is `*.jsonc`, so the renamed
file is still found; nothing else about the fragment changes.

| Key          | Is                                                           |
| ------------ | ------------------------------------------------------------ |
| `settings`   | an object of editor settings keys, verbatim                  |
| `nesting`    | an object: parent file name → a list of child names or globs |
| `extensions` | a list of extension ids                                      |

`nesting` is the source for the editor's `explorer.fileNesting.patterns`;
it is spelled as a list per parent rather than the editor's comma-joined
string so two packs contributing children of one parent merge without
either parsing the other's punctuation.

**The materializer copies a fragment verbatim** and stops, exactly as it
does for `.config/pre-commit.d/<pack>.yaml`. The **orchestrator** composes
them, into `.vscode/settings.json` and `.vscode/extensions.json`:

- `settings` keys are applied in composition order
  (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`) — a later component's
  value for the same key wins.
- `nesting` and `extensions` are **unions**: every pack's children under a
  parent, every pack's extension ids, each id once.
- Everything composed lands inside **one marked block per file**, placed
  **first**, between `// >>> vscode.d` and `// <<< vscode.d` on their own
  lines. A key the file already carries **outside** the block — a
  `settings` key or a `nesting` parent — is a collision, and the composing
  skill **omits** it from the block, so a hand key wins without the file
  ever holding a duplicate. What becomes of such a key is the user's
  choice at composition time — keep mine, take the pack's, or union —
  asked once and recorded by the composing skill, so a later run applies
  the answer without asking. An extension id the file already lists is
  simply kept, unasked and unrecorded. The block still sits first, and
  everything outside it still survives byte-for-byte unless the user chose
  otherwise for that key; a re-run rewrites only what is between the
  markers.

**Ownership of the base.** The `repo-hygiene` pack's fragment carries the
editor **baseline** — the nesting map, the exclude lists, the editor-wide
keys a repo has regardless of stack. Every other pack carries only keys
for the files or the tools **it** ships. A gate pack naming itself the
default formatter for the files it formats is in scope; a gate pack
setting the font size is not, and the split is what keeps two packs from
fighting over a key neither owns.

## `pack.yaml`

The component's classification (`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`),
its version, and the payload fields this component contributes — each
carried only by the component type that owns it:

```yaml
name: <display name>
summary: <one line — why you would pick it>
version: <semver — what sync diffs against, per component>
type: <component type> # assets/taxonomy.md
category: <token> # required where the type has categories
capability: <token> # the vwf capability realized — where one applies
kind: language-bundle | database | cloud-provider | repo-gate | toolchain-manager | repo-hygiene | workspace | capability-provider | ci-system | app-framework | deploy-target | design-tool | stylesheet # the bundle kind it composes into (assets/kinds.md)
axis: project | backing | deploy | repo | design | cicd | stylesheet # omitted by cloud-provider components, which compose into both a backing- and a deploy-axis bundle; each bundle naming one declares its own
platforms: [ <platform> ] # language components only — the bundle root
languages: # language and app-framework components only
  - token: <language token>
    role: primary | platform-edge # app-framework components only
    facts: # what /vwf:doctor verifies for this language
      lsp: <how a language server is provided — or n/a>
      mise_tool: <the mise tool name — or n/a>
      manifest: <the manifest file doctor checks deps against — or n/a>
      binaries: [ <name> | { name: <name>, probe: <command> } ] # optional — executables mise does not manage (xcodebuild, say); absent means none; see below
package_manager: <token> # package-manager components only
lockfile: [ <path or glob> ] # package-manager components only — where the lockfile lives, repo-root relative; any match passes
machine_env: # optional — env values detected from the machine, asked by /vwf:setup; see below
  - { name: <ENV_VAR>, detect: <command>, question: <prompt> }
artifact: <token> # deploy-target components, and deploy-side cloud-service ones
mcp_servers: {} # design-tool and other components needing an MCP server — written into the project's .mcp.json behind tier-2 consent
user_mcp_servers: {} # user-scoped — the generated local plugin's mcpServers, tier 3
lsp_servers: {} # <name> -> the verbatim lspServers entry; extensionToLanguage mandatory — the generated local plugin's, tier 3
harness:
  <capability>: { task: <name>, mechanism: <one line> } # what this component satisfies — or n/a
conditional: # optional — config/ paths that land only when an answer holds; see below
  - path: <a landed path or glob, repo-root relative>
    when: { <axis>: <value> } # one axis, one value
```

**Servers are three sibling keys, never one key with a scope field.**
`mcp_servers:` is project-scoped and lands in the repo's own `.mcp.json`;
`user_mcp_servers:` and `lsp_servers:` are user-scoped and land in the
generated local plugin's manifest. Three keys make "a server belongs in
exactly one place" structural — landing in both would mean writing the name
twice, and a name appearing under both `mcp_servers:` and
`user_mcp_servers:` halts the run. This changes no artifact: the landed set
is still closed to skills, agents, hooks and rules, and these are payload
the materializer writes elsewhere.

### `binaries:` — a name, or a name and its probe

A `binaries:` entry takes one of two forms, and one list may mix them:

```yaml
binaries:
  - swift
  - { name: xcodebuild, probe: "xcodebuild -version" }
```

A **bare name** is a `PATH` lookup, as it always was. A **map** carries
exactly `name` and an optional `probe` — a shell command `/vwf:doctor` runs
instead of the lookup, requiring exit 0. The probe is for a binary whose
presence on `PATH` proves nothing: `/usr/bin/xcodebuild` exists on a Mac with
only the Command Line Tools and fails the moment it is run, so the lookup
passes and the build does not. Severity is the same in either form —
blocking once the project's template is pinned, a degradation while its pin
still reads `unresolved`. A probe is a command the repo's committed
template entry carries, so doctor runs it only while that entry matches the
hash its lockfile records; on drift it runs nothing and reports the probe
as not run, at a failed probe's severity. The procedure is doctor's.

### `lockfile:` — where a package manager locks

A package-manager pack declares where its lockfile lives, beside its
`package_manager:` token: a non-empty list of repo-root-relative paths or
globs, no `..`, and **any match passes**. `/vwf:doctor`'s
`package_manager resolves` check reads it rather than guessing a filename
from prose.

```yaml
package_manager: swiftpm
lockfile:
  - Package.resolved
  - "*.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved"
```

The second entry is why the key is a list: an app's lockfile sits inside
the Xcode project Xcode writes it into, a library's at the root, and one
pack serves both.

### `machine_env:` — values read from the machine, asked at setup

A pack whose tasks read an environment value only the developer's machine
can answer — the Xcode it builds with, the simulator it tests on —
declares it as a pack-level `machine_env:` list:

```yaml
machine_env:
  - name: XCODE_VERSION
    detect: "xcodebuild -version | awk 'NR==1 {print $2}'"
    question: Which Xcode version does this repo build with?
```

`name` is the environment variable, `detect` a shell command whose stdout
is the default, and `question` the prompt. The pack **must** land a file
holding a marked position named for each `name` — typically an `[env]`
table in its own `config/.config/mise/conf.d/<pack>.toml` fragment (the
conf.d passage above), each variable under a `# A MARKED POSITION` comment,
shipped with an empty value. The **materializer lands that fragment with
its marked positions unfilled**; `/vwf:setup`'s materialize pass, the
caller that lands the pack, runs each `detect`, offers the output
preselected — the person may type another value — writes the answer into
the marked position, and re-records the file's lockfile hash. A `detect`
that fails or prints nothing offers no default and still asks. Setup runs
a `detect` only while the committed template entry matches the hash its
lockfile records — on drift it runs none and asks with no default — and
refuses a value the fragment's reader would not take literally (control
characters, the reading tool's template or expansion characters, a quote
it cannot escape). The procedure is setup's. The values are the repo's
committed pins, not per-machine overrides, and `/stackgen:stackgen-sync`
keeps them: when the pack changes that file, the repo's value of every
`machine_env` name is carried into the new payload before it is written.

### `conditional:` — files that land only when an answer holds

A pack may declare that some of its `config/` files make sense only under
an answer the caller already holds — the forge the repo pushes to, the
editor in use, the secrets provider picked, the update bot the repo runs.
`conditional:` is an optional list; each entry names a **path or glob**
(spelled as the pack's `config/` tree spells it, relative to `config/` —
so `renovate.json`, not `config/renovate.json`) and a `when:` map of
**exactly one axis to one value**, drawn from a fixed vocabulary:

| Axis         | Values                             | Answered by                                |
| ------------ | ---------------------------------- | ------------------------------------------ |
| `forge`      | `github`, `gitlab`                 | the origin host                            |
| `editor`     | `vscode`                           | the editor question, once per product      |
| `secrets`    | a capability-provider slug         | the secrets-provider question              |
| `update_bot` | `renovate`, `dependabot`, `none`   | the update-bot question, per repo          |

```yaml
conditional:
  - path: .github/ISSUE_TEMPLATE/*
    when: { forge: github }
  - path: renovate.json
    when: { update_bot: renovate }
  - path: .config/vscode.d/repo-hygiene.jsonc
    when: { editor: vscode }
```

Those three are the hygiene pack's: the issue forms are GitHub's format
and land nowhere else; the Renovate policy only where Renovate is the bot;
the editor fragment only where the editor is in use — and the third
applies to **every** pack that ships a `vscode.d/` fragment, each stating
it in its own `pack.yaml` on its own fragment's name. The `secrets` axis
works the same way — a file that only makes sense beside one provider,
`when: { secrets: fnox }` — but no shipped pack carries such a file today:
the provider's ignore line is an ignore-section row keyed on the provider
slug, not a conditional file.

Rules:

- **A path not named under `conditional:` is unconditional.** The key
  narrows; absence is the default every existing pack already has.
- **A glob may name a whole set** — `.config/vscode.d/*.jsonc` is one
  entry, not one per fragment. A `path` or glob is spelled as the pack's
  own `config/` tree spells it — **before** the `p/_project/` rename — and
  must match at least one file there; that pre-rename tree is what rule 11
  resolves it against, and the materializer evaluates it on the same
  pre-rename path and applies the rename after.
- **One axis per entry, one value per axis.** A file that depends on two
  answers is two entries on the same path, both of which must hold. A
  value outside the vocabulary, or an axis not in the table, is a pack
  authoring error, and `p:plugins:check` rule 11 refuses the tree naming
  the pack and the entry.
- **The materializer evaluates, records and skips; nothing else reads the
  key.** A false entry's paths leave the landing set and are written to the
  lockfile's `skipped:` list with their condition, so `/vwf:doctor` never
  reports one as missing and a later run whose answer changed re-evaluates
  it. The evaluation is the materializer's step, in its own reference.

The bundle-level lists the previous format carried per pack — `frameworks`,
`dependencies`, `optional_languages`, `capabilities` — are **derived at
composition time** now: a bundle's `frameworks:` is its framework
components' slugs, its `capabilities:` its components' `capability` tokens.
A pack states only what its own component is.

## Bundle files — the recorded composition

A bundle is **one file**, `stacks/bundles/<slug>.md`: YAML frontmatter naming
its component refs, and a body carrying the composition's own conventions —
what this combination is for, and what it decides that no single component
decides alone.

```yaml
name: <display name>
axis: project | backing | deploy | repo | design | cicd | stylesheet
kind: <bundle kind> # assets/kinds.md
platforms: [ <platform> ] # project axis only
artifact: <token> # deploy axis only
unconditional: true # omitted by every bundle a user picks — see below
default: true # optional — what vwf preselects; one per axis per platform
components:
  - <type>/<slug>@<version> # a shipped pack, at its current version
  - <type>/<slug>@generated # no pack covers it — generated on first fetch
```

**This is what a user picks.** A component answers "what is TypeScript";
a bundle answers "what is a TypeScript service" — and those are different
questions, which is why a menu of components alone leaves nothing pickable.

**Except where `unconditional: true`.** That key marks the repo baseline —
a slot with exactly one pack, where a one-entry menu would be theatre and
where a repo that has picked no stack still needs the thing. It has two
readers: `stackgen-stack-menu` **excludes** such a bundle from the payload
it returns, and `/vwf:init` fetches it by **fixed slug**, never a slug
constructed from configuration. Three bundles carry it today, because a
bundle declares one `kind` and these are three: `mise` (`toolchain-manager`),
`repo-gates` (`repo-gate`) and `repo-hygiene` (`repo-hygiene`). Nothing about
them is recorded in `.config/vwf.yaml` — nothing was chosen — only in
`lock.yaml`, which is also what tells a caller whether the repo is shaped at
all: all three slugs present, or not shaped. `unconditional:` is the
**bundle's** word — whether the composition is picked or fixed — and
`conditional:` the **file's**, inside a pack: an unconditional bundle may
still carry a pack whose issue forms land only on GitHub.

**`default: true` marks the menu entry vwf preselects on that axis.** It is
optional and boolean, and it changes nothing about what the bundle is — only
which entry the architecture menu highlights before the user answers, so a
product that has no opinion lands on it and one that does picks another.
`stackgen-stack-menu` copies the key onto every entry whose bundle carries
it and onto no other; vwf preselects the one flagged entry among those it
offers on the round, by the key alone, naming no tool. **At most one bundle
per axis carries it per platform** — a bundle declaring no `platforms:` list
covers every platform on its axis, so two flagged bundles conflict exactly
when either declares no list or their lists intersect. Two that overlap on a
platform would be a preselection decided by file order, which is silent
nondeterminism, and the checker refuses the tree, naming both files and the
platform they share. An axis whose flagged bundles all declare platforms
may therefore carry one flagged bundle per platform, and a round filtered to
one platform sees exactly one. It is **never set on an `unconditional`
bundle**: that bundle is not in the menu, so there is nothing to preselect.

**A `@generated` ref is a first-class outcome, not a gap.** A bundle may mix
copied and generated components freely: the covered ones land verbatim, the
uncovered ones run the generation pipeline on first fetch, and the lockfile
records which was which per component. That mixing is the dispatch rule
working at bundle scale.

**A `stylesheet` component and its bundle take neither `platforms:` nor
`languages:`**, and the absence is a ruling rather than an omission.
`platforms:` is the `project` axis's, and vwf's condition on the stylesheet
axis — asked of a project declaring `site` or `webapp` — lives in vwf's own
rules, so repeating it here as a platform list would make one answer read as
several. `languages:` belongs to the components that bring a language, and a
stylesheet approach brings none: it is authored inside whatever the project
already writes.

**No bundle directory exists**, which is what keeps a bundle a composition
rather than a fourth kind of artifact tree.

## Bundles — how the kinds compose

A bundle is the composition rooted per kind
(`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`): a Language-Bundle is a
`language` component + its `package-manager`, `framework` and
`toolchain-gate` components; a Cloud-Bundle a `cloud-provider` + its
`cloud-service`s; a Datastore-Bundle category doctrine + an instance
component; a Deploy-Bundle one `deploy-target` component alone; a
Design-Bundle one `design-tool` component alone, a CI-Bundle one
`ci-system`, and a Stylesheet-Bundle one `stylesheet` component — the three
**tool axes**, whose bundle slug is the token the project config already
holds. No bundle directory exists anywhere: the materializer folds the
resolved composition into **one** `.claude/stackgen/templates/<slug>.md` —
the vwf payload as frontmatter, including the `components:` refs
(`<type>/<slug>@<version>`, or `@generated`), with the components'
conventions as body — copies each component's artifact directories into
`.claude/`, and records every landing in the lockfile **per component**,
which is the grain `stackgen-sync` acts at.

## Rules

- **A pack is copied, never referenced in place.** The repo owns its copy;
  upgrades arrive only through the explicit sync diff, keyed on the pack's
  `version` and the lockfile's landing hashes — per component, so one
  pack's bump never churns the rest of its bundle.
- **A bundle pins the pack's current `version`.** Every
  `<type>/<slug>@<version>` component must name an existing pack at that
  exact version, or be `@generated`; `p:plugins:inventory` fails generation
  otherwise, rather than rendering a row for a composition nothing can
  copy. So bumping a pack means re-pinning every bundle that names it —
  the bundle is the recorded composition, and `stackgen-sync` diffs on
  that version.
- **A landed file cites nothing by plugin path.** Everything under
  `skills/`, `agents/`, `rules/`, `hooks/` and `config/`, plus a pack's
  `conventions.md` and a bundle's body, is copied verbatim into a repo
  that has **no plugin installed** — so the `${CLAUDE_PLUGIN_ROOT}` token,
  a bare `assets/…` path, a `../` climb out of the tree the file lands in,
  and a path into a sibling pack all resolve to nothing there, silently.
  Name the asset by role ("stackgen's secrets contract") or state its rule
  inline; a sibling component's conventions are "the `<type>/<slug>`
  component's conventions, in this composition's template". A bare
  `<type>/<slug>` ref is an identifier and is fine. `p:plugins:check`
  rule 13 enforces it. This file is an asset rather than a landed tier, so
  its own citations may keep the token.
- **Structure follows the kind; the slice follows the type.** A pack
  declares the bundle `kind` it composes into and ships the structural
  slice its `type` owns within that kind — the reviewer bar generated
  output meets is the bar curated packs meet too.
- **One component per pack, and thin.** A framework pack never restates the
  language baseline beside it; an instance component cites its category's
  doctrine rather than restating it. Anything two components would both say
  belongs to the category level, written once.
- **Judgment, not API surface.** A pack's conventions and skills carry the
  decisions a reader cannot look up — layout, placement, testing shape, what
  bills and what breaks. API reference belongs to Context7 at use time.
- **Facts are per language and honest.** `n/a` is an answer; an invented
  mise tool or manifest name surfaces as a doctor finding in every repo that
  pins the pack. A tool the stack cannot run without whose `mise_tool` is
  `n/a` — Xcode's `xcodebuild`, which mise does not install — belongs in
  `binaries`, so doctor reports it missing rather than skipping the `n/a`
  silently — blocking once the project's template is pinned, a degradation
  while its pin still reads `unresolved`. Where being on `PATH` does not
  prove the tool works, the entry carries a `probe` and doctor runs it.
- **A generated pack may ship the `config/` tiers too.** Nothing about
  `config/.config/…`, `conf.d` or `pre-commit.d` is reserved to curated
  packs: a generated component that genuinely owns a config file may declare
  one, and it lands through the same consent line and the same lockfile
  record. Teaching the generator to **emit** them is a separate piece of work
  and is not done — so the honest statement today is that the format allows
  it and the pipeline does not yet produce it, which is a gap in the
  generator rather than a rule in the format.
