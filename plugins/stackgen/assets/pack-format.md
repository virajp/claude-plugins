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
eight packs under `stacks/toolchain-gate/` — `analysis-options`, `detekt`,
`eslint`, `ktlint`, `ruff`, `swift-format`, `swiftlint` and `tsconfig` — and
no curated plugin stands behind any pack: the tree is each pack's only home.
This file is the contract every pack is folded into, so an author targets a
shape the materializer already reads.

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
├── config/              # optional: repo config files — tree mirrors the repo root
│   ├── .config/…        #   e.g. .config/mise/tasks/code/lint/<slug> (consent-gated)
│   └── _<name>/…        #   pack-private payload — NEVER copied
└── templates/           # optional: files tool-config renders — tree mirrors the repo root
    └── .config/mise/conf.d/<slug>/…   # the pack's own mise files, and nothing else
```

**Two sub-conventions inside `config/`**, each a different contract:

- **`config/.config/…` and the root allowlist.** Everything under `config/`
  mirrors the repo root, so `config/.config/swiftlint.yml` lands at
  `<repo>/.config/swiftlint.yml` and `config/wrangler.jsonc` at
  `<repo>/wrangler.jsonc`.
  A path landing at the **root** must be on the fixed allowlist
  (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`); anything else belongs
  under `.config/`, and the materializer refuses a root path that is not on
  it.
- **`config/_<name>/` is pack-private and is not copied.** A leading
  underscore **at the top of the tier** marks a payload a *reader* uses rather
  than a file the repo gets — alternative texts a reader copies one of, the
  one the user picked, with its placeholders filled.
  Copying the directory wholesale would land every alternative and answer a
  question nobody asked. Nested deeper, the same character means the
  opposite: `.config/mise/tasks/p/_project/` is a **marked position**, copied
  and renamed to the project's id as it lands — the id being the slug
  `${CLAUDE_PLUGIN_ROOT}/assets/ids.md` defines, never the raw name — and
  the materializer's copy rules are where that behaviour is specified.

A pack ships no fragment of a universal file — no pre-commit hook, no
ignore line, no exclude, no editor setting: `stackgen:tool-config` ships
those as universal supersets, every stack's entries whether or not the repo
uses that stack. What a pack adds to the toolchain is its own mise folder,
in `templates/`, and its own subtasks, in `config/` (both below).

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
config file it governs; a provider's environment is a file in its
`templates/`; what stays out is a language manifest, a CI workflow, editor
settings and CLAUDE.md — the editor is the user's to configure. **Mode is
preserved**: anything under `config/.config/mise/tasks/**` must be authored
executable (755), which `p:plugins:check` asserts, because mise runs a task
file directly and reports a non-executable one as an unknown task.

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
kind: language-bundle | database | cloud-provider | workspace | capability-provider | ci-system | app-framework | deploy-target | design-tool | stylesheet # the bundle kind it composes into (assets/kinds.md)
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
artifact: <token> # deploy-target components, and deploy-side cloud-service ones
mcp_servers: {} # design-tool and other components needing an MCP server — written into the project's .mcp.json behind tier-2 consent
user_mcp_servers: {} # user-scoped — the generated local plugin's mcpServers, tier 3
lsp_servers: {} # <name> -> the verbatim lspServers entry; extensionToLanguage mandatory — the generated local plugin's, tier 3
harness:
  <capability>: { task: <name>, mechanism: <one line> } # what this component satisfies — or n/a
conditional: # optional — config/ paths that land only when an answer holds; see below
  - path: <a landed path or glob, repo-root relative>
    when: { <axis>: <value> } # one axis, one value
values: # optional — the machine values the pack's templates read as @@NAME@@; see below
  - name: <UPPER_SNAKE>
    detect: <shell command printing the value; non-zero when unknown>
    question: <asked when detect fails>
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

### `templates/` — the pack's own mise files

A pack that needs a tool pin, an env value or an alias ships them as a mise
file in `templates/.config/mise/conf.d/<slug>/` — `mise.toml` for every
environment, `mise.<env>.toml` (`dev`, `ci`, `test`) for one — and nothing
else lives in `templates/`. `stackgen:tool-config` renders the tree into
the repo at the same relative paths with
`pack --slug <slug> --dir <pack dir> [--set <key>=<value>]…`
(`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/SKILL.md#packs`); the
materializer never copies it. The checker holds the folder to the slug:
`templates/.config/mise/conf.d/` carries exactly one entry, the folder named
for the pack, since tool-config renders and removes that folder as the
pack's.

```toml
# templates/.config/mise/conf.d/swiftlint/mise.toml
[tools."aqua:realm/SwiftLint"]
version = "latest"
```

**Pins follow tool-config's rule**
(`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/SKILL.md#pins`): write `latest`
and nothing else. In a file a CI environment loads — `mise.toml`,
`mise.ci.toml`, `mise.test.toml` — the script resolves it to an exact
version as it renders; a `mise.dev.toml` keeps `latest`. A tool is pinned in
exactly one `conf.d/` folder: never re-pin one the universal `_base/` or
`ai/` folder already pins.

**A value only the machine can answer** — the Xcode a repo builds with, the
simulator its goldens are recorded on — is a `@@NAME@@` tag in the pack's
template, never a hardcoded default:

```toml
# templates/.config/mise/conf.d/swiftui/mise.toml
[env]
XCODE_VERSION = "@@XCODE_VERSION@@"
```

The value is stored under `packs.<slug>` in the repo's
`.config/stackgen.yaml`, written by the script from `--set <key>=<value>`
(the key lowercase — `--set xcode_version=26.1` fills `@@XCODE_VERSION@@`),
and visible to that pack's templates alone. A render missing a value the
template names is refused, naming it. The pack says how to find each value
in its `values:` list (below); the caller runs it. The tag grammar is
tool-config's
(`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/SKILL.md#templates`), and
`p:plugins:check` rule 11 refuses a tag it would not read.

### `values:` — how each machine value is found

Every `@@NAME@@` a pack's templates read, beyond tool-config's own global
names, is declared in `pack.yaml` as one `values:` entry:

| Field      | Is                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------- |
| `name`     | the tag's name, upper snake case — `XCODE_VERSION` for `@@XCODE_VERSION@@`                    |
| `detect`   | a shell command that prints the value on this machine, and exits non-zero when it cannot tell |
| `question` | what to ask the person when `detect` fails                                                    |

```yaml
values:
  - name: XCODE_VERSION
    detect: >-
      xcodebuild -version
      | awk 'NR == 1 && $1 == "Xcode" { print $2; found = 1 } END { exit !found }'
    question: >-
      Which Xcode version does this repo build with? Every task that builds
      refuses any other.
```

The caller — `/vwf:setup`, as it lands the pack — fills each entry in
order: run `detect`; a zero exit with output is the value, anything else
asks `question`. It passes every value to `pack` as `--set
<name lowercased>=<value>`. `p:plugins:check` rule 11 holds the list to
the templates both ways: every `values:` name is read as `@@<name>@@`
somewhere in the pack's `templates/`, and every pack-own `@@` name there is
declared in `values:`. An entry carries exactly `name`, `detect` and
`question`, each a non-empty string, and a `name` may not take one of
tool-config's global names.

### Subtasks — what a pack adds to a gate

The universal gates are `…:all` tasks that call one subtask each:
`code:check:all`, `code:format:all`, `code:lint:all`, `setup:ai:all` and
`setup:deps:<verb>:all` for `install`, `upgrade`, `outdated`, `audit` and
`cleanup`. A pack adds to one by shipping a task file, executable, in its
`config/` tier at
`.config/mise/tasks/{code/{check,format,lint},setup/ai,setup/deps/<verb>}/<slug>`
— the leaf **is** the pack's slug, so two packs never write one file:
flutter's are `code/format/flutter` and `code/lint/flutter`, uv's lock check
is `code/check/uv`. A subtask carries only its own tool's steps, and skips
itself with a warning when its tool or config is absent. tool-config
re-renders every `…:all` task on each `pack` and `pack-remove` call, so the
new subtask joins the gate the hooks already call; a pack never ships a
hook.

**Three things a pack may not ship.** A slug from tool-config's reserved
set — `all`, `ai`, `_base` — which name its own `…:all` leaf and its own
`conf.d/` folders. A subtask whose leaf is one of tool-config's universal
subtasks (`dprint`, `shell`, `house`, `workflows`, `base`): removing the
pack would delete the universal file. And any file at a path
tool-config's own trees ship — save one tool-config ships as a
`#PLACEHOLDER` slot, which is a pack's to fill: the `capability-provider/fnox`
pack's `setup/secrets` replaces the universal placeholder. `p:plugins:check`
rule 11 refuses all three.

**A dropped pack is removed with `pack-remove --slug <slug>`**: tool-config
deletes `conf.d/<slug>/` and every subtask named `<slug>` — never a path its
own trees ship — drops `packs.<slug>` from `.config/stackgen.yaml`, and
re-renders the `…:all` tasks.

### `conditional:` — files that land only when an answer holds

A pack may declare that some of its `config/` files make sense only under
an answer the caller already holds — the forge the repo pushes to, or the
secrets provider picked.
`conditional:` is an optional list; each entry names a **path or glob**
(spelled as the pack's `config/` tree spells it, relative to `config/` —
so `.github/CODEOWNERS`, not `config/.github/CODEOWNERS`) and a `when:` map of
**exactly one axis to one value**, drawn from a fixed vocabulary:

| Axis      | Values                     | Answered by                   |
| --------- | -------------------------- | ----------------------------- |
| `forge`   | `github`, `gitlab`         | the origin host               |
| `secrets` | a capability-provider slug | the secrets-provider question |

```yaml
conditional:
  - path: .github/CODEOWNERS
    when: { forge: github }
```

That entry is illustrative: a file that only makes sense on one forge or
beside one provider. **The key is reserved with no axis in use** — no
shipped pack declares a `conditional:` entry today: a provider's ignore
line is already in tool-config's universal `.gitignore`, not a conditional
file.

Rules:

- **A path not named under `conditional:` is unconditional.** The key
  narrows; absence is the default every existing pack already has.
- **A glob may name a whole set** — `.config/<tool>/*.yml` is one
  entry, not one per file. A `path` or glob is spelled as the pack's
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
default: true # optional — what vwf preselects; one per axis per platform
components:
  - <type>/<slug>@<version> # a shipped pack, at its current version
  - <type>/<slug>@generated # no pack covers it — generated on first fetch
```

**This is what a user picks.** A component answers "what is TypeScript";
a bundle answers "what is a TypeScript service" — and those are different
questions, which is why a menu of components alone leaves nothing pickable.

**Every bundle is a menu entry.** The repo baseline is no bundle: the
toolchain manager, the gates and the hygiene configs are
`stackgen:tool-config`'s tools, and the prose files are `/vwf:init`'s own
assets. Nothing about it is recorded in `.config/vwf.yaml` — nothing was
chosen. tool-config keeps the values it renders from in
`.config/stackgen.yaml` and records nothing in `lock.yaml`.

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
one platform sees exactly one.

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
  `skills/`, `agents/`, `rules/`, `hooks/`, `config/` and `templates/`,
  plus a pack's
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
- **A landed config or task file carries only the comments something
  reads.** Under `config/`, `templates/` and `hooks/`, keep every comment a
  tool or skill reads: `#MISE` and `#USAGE` lines, shebangs, `# shellcheck`
  directives, `#PLACEHOLDER` markers, grype ignore-reason comments,
  commented-out templates a skill fills in, and any comment a reference
  names as load-bearing. Beyond those, a comment is at most a one-line
  warning where a reader would otherwise break something non-obvious.
  Every longer explanation belongs in the pack's `conventions.md` — dropped
  if it already says it, moved there if not — and boilerplate repeated
  across files goes, though a directive it sat above stays. Trimming a
  payload's comments is still a payload change: bump the pack.
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
  `config/.config/…` is reserved to curated packs: a generated component
  that genuinely owns a config file may declare one, and it lands through
  the same consent line and the same lockfile record. Teaching the
  generator to **emit** them is a separate piece of work and is not done —
  so the honest statement today is that the format allows it and the
  pipeline does not yet produce it, which is a gap in the
  generator rather than a rule in the format.
