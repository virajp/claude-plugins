# The Generated Output

Every artifact stackgen materializes lands **directly in the repo's
`.claude/` tree** — committed, repo-owned, and working for every collaborator
with no plugin installed. There is no intermediate tree and no symlink
wiring: what Claude Code discovers is what the repo owns.

The output vocabulary is **closed to four artifact kinds** plus stackgen's
own bookkeeping, one **tier-2 project file** — `.mcp.json` — a **fourth
target**, the repo config files a pack declares (below), and one **tier-3
target outside the repo entirely**: a generated local plugin on the
developer's machine (below).

LSP server configuration stays **excluded from the repo**: a language server
is a plugin-manifest feature no project file can express, so no `.claude/`
artifact and no `.mcp.json` key can carry one. The need still travels as
`language_facts` in the template payload for `/vwf:doctor` to read — that
tells doctor *how* a server is provided and provides nothing itself. What
actually provides one is the local plugin.

The facts the template payload carries for its callers, all passed through
from `pack.yaml` as declared (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`):
`language_facts` per language — `binaries` entries included, in either form,
a bare name or a `{ name, probe }` map; and `package_manager` and, beside
it, `lockfile`, the paths or globs doctor's resolve check reads.

**`.mcp.json` was excluded and is not any more**, decided at Wave D. The
reasoning that changed: an MCP server is genuinely a project file — this
toolkit's own installer already treats `.mcp.json` as one of the user's
project files — and the alternative was a curated registry of servers, which
fails on **scaling** before it fails on charter. A list can only ever hold
what someone curated, and stackgen exists for the tail nobody curated. So a
pack that needs a server declares it, and the materializer writes it into the
project's `.mcp.json` **behind its own separate consent line** (tier 2 below,
the same treatment `.claude/settings.json` gets). It **merges, never owns**:
the server keys stackgen added are recorded in the lockfile, so sync and
removal touch only those. A declined wiring leaves the skills landed and says
the tool will be unreachable — never a silent partial landing.

```text
.claude/
├── skills/<name>/SKILL.md     # doctrine with references; auto-discovered
├── agents/<name>.md           # subagents; auto-discovered
├── hooks/<name>.sh            # hook SCRIPTS (pack-sourced only, never generated)
├── rules/<name>.md            # short path-scoped constraints
└── stackgen/                  # bookkeeping — not discovered by Claude Code
    ├── lock.yaml              # the materialization record (below)
    ├── templates/<slug>.md    # template payloads: frontmatter (incl. the
    │                          #   components: composition) + conventions body
    └── citations/<component-slug>.yaml  # per-component research sources with URLs + fetch dates
```

**Skills vs rules — one mechanism per content, never both.** Doctrine that
needs references and judgment is a paths-scoped skill; a one-screen
constraint bound to a glob is a rule. The kind definitions
(`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`) say which each kind uses.

## The third target — the generated local plugin

An LSP server can only be declared in a plugin manifest, so the one way to
provide one is to **be** a plugin. stackgen generates a local plugin on the
developer's machine and registers it with Claude:

```text
~/.claude/plugins/local/stackgen-lsp/
└── .claude-plugin/
    ├── plugin.json       # lspServers + mcpServers, union across the user's stacks
    └── marketplace.json  # a single-plugin directory marketplace, also stackgen-lsp
```

Registration is two commands, and **stackgen prints them and asks — it never
runs them unprompted**:

```sh
claude plugin marketplace add ~/.claude/plugins/local/stackgen-lsp --scope user
claude plugin install stackgen-lsp@stackgen-lsp --scope user
```

The path and the plugin name are **fixed**, never constructed from the stack
pin — one plugin per machine, holding the union.

**Scope is `user`, and the trade is taken knowingly.** Collaborators get
nothing by pulling: a teammate's language server is their own machine's
business, which is the same line every editor already draws. What user scope
buys is one registration serving every repo, instead of a per-repo
obligation nobody would maintain.

**The extension map is what makes user scope safe.** A server declared with
an `extensionToLanguage` map never starts in a repo with no matching files,
so a user-scoped declaration costs a repo that does not need it nothing. A
generated LSP declaration **without** one is forbidden
(`${CLAUDE_PLUGIN_ROOT}/assets/artifact-doctrine.md` §5) — it would start
unconditionally in every session in every repo, which is exactly the
objection user scope would otherwise deserve.

**MCP rides the same mechanism, and the two paths are not interchangeable.**
`.mcp.json` stays the path for **project-scoped** servers the repo should
own and collaborators should get; the local plugin is for **user-scoped**
ones the repo should not own. Which a server is belongs to the component
that declares it, not to the materializer.

**It merges, never owns.** The manifest is a union across every repo that
materialized into it, so a landing adds its keys and leaves the rest;
removal removes exactly the keys this repo's lockfile recorded, and takes
the directory and the registration down only when the last key goes.

## The fourth target — repo config files

`.claude/`, `.mcp.json` and the local plugin are the three targets above, and
a repo's own configuration is none of them. The toolchain of a repo — tool
pins, gates, gate configs, generic tasks, pre-commit hooks — is bootstrap's,
and stackgen asks bootstrap for it (the stack-template skill's bootstrap
handoff). What is left is the repo-specific part, which a component
genuinely owns, so a pack declares it in a **`config/` tree that mirrors the
repo root** (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`):

```text
stacks/<type>/<slug>/
└── config/              # tree mirrors the repo root
```

`config/.config/mise/tasks/test/golden` lands at
`<repo>/.config/mise/tasks/test/golden`, the same way `skills/` mirrors
`.claude/skills/`.

**What the tier covers is an allowlist**, and `p:plugins:check` rule 11
refuses any other path:

- **A test task** — `.config/mise/tasks/test/<name>`, for example
  `test/golden` or `test/e2e`. A test task needs a model decision, so it
  stays with the pack and is not bootstrap's.
- **A project task** — `.config/mise/tasks/p/_project/<name>`.
  `_project` is a **marked position** the materializer renames to the
  pinned project's id, not a task group. A deploy target ships its deploy
  task there (`cloud-service/workers-static-assets` was the first), and a
  framework pack its own project task (`framework/astro` ships `icons`).
  The position is shared on purpose — a project has one task group, and two
  packs contributing a file each into it is how it fills up — so a pack
  adding one names a task no other pack in the same bundle already ships.
- **A root file on the allowlist below** — a deploy target's root
  `wrangler.jsonc` is the case.
- **`config/_<name>/`** — pack-private payload, never copied.

A task that a pack ships sources bootstrap's `_scripts/helpers`, so the
repo must have adopted bootstrap before anything lands.

**The root allowlist** is stackgen's, and the materializer enforces it as
a ceiling. It is the list of what may **sit** at a shaped repo's root —
these entries and only these — and it has four tiers:

- **What a pack may land**: `readme.md`, `eslint.config.mjs`,
  `wrangler.jsonc`, and the directory `.github/` — **excluding
  `.github/workflows/`**. This is the tier `p:plugins:check` enforces over a
  pack's `config/` root.
- **What bootstrap's sync writes** — its own list, read from bootstrap,
  never restated here. A pack never ships one of those files and adds no
  line to one.
- **What `/vwf:init` writes from its own assets**: `CONTRIBUTING.md`,
  `SECURITY.md`, `LICENSE` and `.github/ISSUE_TEMPLATE/`.
- **What sits there because vwf writes it** — **vwf's — no pack lands
  them**: `CLAUDE.md`, fenced out below as `/vwf:setup`'s, with
  `p:plugins:check` refusing a pack that ships one at the root; and
  `mempalace.yaml`, which the mine looks for in the directory it is pointed
  at and nowhere else, so anywhere but the root is silently inert (vwf's own
  `memory.md`, "Repo config — `mempalace.yaml`").

The last tier is on the list because `/vwf:init`'s pass 1 reports any
root file the list does not name, and a rule beats a judgment: without
these two entries, every shaped repo's own `CLAUDE.md` and `mempalace.yaml`
read as findings that a person has to know to wave through.

A language's manifests and lockfiles are **not** on it: a manifest is
fenced out below, as it always was, and a lockfile is the manifest's
shadow. A `config/` tree landing a root path that is not on this list is a
**pack authoring error**: the materializer refuses it and reports it,
rather than quietly adding one more dotfile to a place the doctrine says is
closed. Everything else a pack configures lives under `.config/`.

**Why `.github/` is at the root**: the forge discovers issue templates, and
the rest of its furniture, only from that directory. `.github/workflows/` is
**refused inside it**: the CI fence below is unchanged, and a pack that may
write a template still may not write a pipeline.

`wrangler.jsonc` joined on 2026-09-05, and it is the same exception
`eslint.config.mjs` already is: a deploy tool that discovers its config only
at the repo root leaves a pack two ways to ship one — the root file, or
`--config` on every invocation any caller might type — and a flag every
caller has to remember is the worse of the two.

Being on that list is a ceiling, never a licence: `readme.md` is on it
because a shaped repo has one, and **no pack may ship it** — it belongs to
`/vwf:readme`. `CLAUDE.md` is on it in the second tier only: it is fenced
out below, it is `/vwf:setup`'s, and `p:plugins:check` refuses a pack that
ships one at the root. The rule reaches `wrangler.jsonc` unchanged:
being on the list makes it landable, not standard, and the three Cloudflare
deploy packs ship one (`workers-static-assets`, `workers-ssr`, `containers`).

The rules mirror the ones the other targets already have:

- **It merges, never owns.** Only the paths this repo's lockfile recorded are
  touched by sync or removal; a landing set colliding with an unlisted path is
  a conflict for the user, not a write.
- **Recorded in the lockfile per file**, with the **component** that supplied
  it — the same grain sync acts at everywhere else, and what makes a tree two
  components both write auditable.
- **Its own consent line**, the same tier `.claude/settings.json` and
  `.mcp.json` get (tier 2 below). A declined config write leaves the skills
  landed and says the tasks will be absent — never a silent partial landing.
- **Mode is preserved.** `.config/mise/tasks/**` must land executable (755) or
  `mise run <task>` fails as an *unknown task* rather than as a permission
  error. `p:plugins:check` asserts the bit on the authored packs, because an
  invisible exec bit has cleared every other gate in this repo before.

**Composition order, since more than one component may write one tree.**
By component type: `toolchain-gate`, then
`package-manager` / `language`, then `app-framework`, then
`capability-provider`, then `cloud-provider`, then `cloud-service` — a
later component's file wins, and the lockfile records per file which
component supplied the version that landed.

The two ends are what the order is for. The baseline every pack lands
beside — the whole task library and the toolchain — is bootstrap's,
synced before any pack lands. The **deploy target
goes last** because it is the most specific thing a repo pins: a
`cloud-service` pack's `wrangler.jsonc`, and the `p/<id>/deploy` task beside
it, are the answer to how this repo actually ships, and nothing may
overwrite that.

The two cloud types were absent from this order until 2026-09-05, for a
plain reason rather than an oversight: no `cloud-provider` or
`cloud-service` pack shipped a `config/` tree, so there was nothing of
theirs to compose. `cloud-service/workers-static-assets` is the first that
does, and is what put them on it.

**Precedent, and its limit.** The `package-manager/pnpm` pack already ships
a hook script copied into a target repo, so packs already write outside
`.claude/`. This generalizes that from
`hooks/` to a declared tree, the same move `.mcp.json` got at Wave D, and for
the same reason: the alternative is that the one thing which writes a repo's
config lives in a plugin that exists for no other reason.

**The fence, and where it now runs.** The tier was opened on 2026-09-05 for
gate and provider config files, and closed again for them on 2026-10-23, when
bootstrap took the toolchain: a gate's config, a provider's environment and
every generic task are bootstrap's now. What stays is what only the repo's
own stack decides — its test tasks, its project tasks, and a deploy target's
root config. A framework whose doctrine names a test the repo must run, and
then ships no task, has described a command rather than given one.

Four things stay **outside** the fence, and they are the whole of it:

1. **`package.json` and every language manifest** — `pyproject.toml`,
   `Cargo.toml`, `pubspec.yaml`, `go.mod`. A manifest is the project's own
   declaration of what it is; a pack that writes one is deciding the
   project's dependencies for it.
2. **CI workflow files.** A pack states which task names CI must run; the
   workflow that runs them is the repo's, and a generated pipeline nobody
   maintains is worse than none.
3. **Editor settings.** A pack never ships `.vscode/` files or any other
   editor configuration. The editor files a shaped repo carries are
   bootstrap's.
4. **`CLAUDE.md`** — vwf's, out of scope outright, as it always was.

**Charters ratchet**, which is why the four are enumerated rather than left
to judgment: each file the tier absorbs makes the argument for the next one
easier, and "gate configs went in, so why not the manifest" is exactly the
argument this list exists to answer. Moving one of the four is a decision on
the record, never an implementer's call.

**The lockfile records what the materializer copied, and the bootstrap
tools and plugins it asked for — never a file bootstrap's sync writes.**
Those files are bootstrap's, kept by its `mise run setup:configs`.
`.config/` holds the repo's own files too, and presence in the tree has
never meant stackgen put it there.

## The three consent tiers

1. **Files in the tree above** land through the materializer's ordinary
   dry-run consent gate — every path listed, nothing written unapproved.
2. **`.claude/settings.json`, `.mcp.json` and a pack's `config/` tree are
   NEVER modified without the
   user's explicit consent, as their own separate lines in the gate.** Hook *scripts* are files
   (tier 1); the settings entry that wires a hook to its event is a
   settings.json edit (tier 2), presented separately and skippable — a
   declined wiring leaves the script landed but inert, and says so. When
   stackgen does edit settings.json it **merges, never owns**: the keys it
   added are recorded in the lockfile so sync and removal touch only those.
   A hooks entry merges **event by event, by appending** — never replacing
   an event's list, and never coalescing two groups whose matchers happen to
   agree, either of which would silently rewrite a hook the user owns. Its
   lockfile spelling is `hooks.<Event>[<matcher>]`, since a hooks entry is
   not a top-level key and removal needs a name for exactly one group.
3. **The local plugin gets its own, larger gate** — writing outside the repo
   and registering with a user-scoped tool is a bigger act than editing a
   project file, and is gated as two separate items: the manifest write, and
   the registration. Declining either is fine and leaves the rest landed; a
   declined registration leaves a valid plugin directory nobody has
   installed, and says so, with the two commands printed for later.

**CLAUDE.md is vwf's domain.** stackgen never writes it. After a
materialization lands, stackgen recommends `/vwf:setup` as the next step —
that is where the repo's CLAUDE.md and workspace wiring get reconciled.

## The lockfile

`.claude/stackgen/lock.yaml` is what makes ownership real. `.claude/` also
holds the user's own hand-written skills, agents and rules, so nothing may
be inferred from presence in the tree. One record per materialized path,
each carrying the **component** it landed for — the grain sync acts at:

```yaml
entries:
  - path: .claude/skills/go/SKILL.md
    slug: generated/go # the template (bundle) it landed with
    component: language/go # the component ref — <type>/<slug> (assets/taxonomy.md)
    source: generated # or pack/<type>/<slug>@<version>
    hash: <content hash — at landing, re-recorded by the composing skill after its fills>
  - path: .config/mise/tasks/test/golden # a `config/` tier file — outside .claude/
    slug: swift-swiftui
    component: app-framework/swiftui # which component's version won, per file
    source: pack/app-framework/swiftui@<version>
    hash: <content hash — at landing, re-recorded by the composing skill after its fills>
    mode: "755" # preserved for .config/mise/tasks/** — mise runs the file itself
bootstrap: # what stackgen asked bootstrap for — absent when it asked for nothing
  tools:
    <tool>: [ <component ref>, … ] # a tool this repo did not select before; the components that need it
  plugins:
    <name>@<marketplace>: { scope: user, source: <marketplace source>, components: [ <component ref>, … ] }
settings_keys: [] # exact settings.json keys stackgen added, with consent — a hooks entry is spelled `hooks.<Event>[<matcher>]`
mcp_servers: [] # exact .mcp.json server keys stackgen added, with consent
local_plugin: # the generated local plugin — absent when none was written
  path: ~/.claude/plugins/local/stackgen-lsp # fixed; recorded so removal has a target
  marketplace: stackgen-lsp # the name given to `claude plugin marketplace add`
  plugin: stackgen-lsp@stackgen-lsp # what `claude plugin install` was given
  scope: user
  lsp_servers: [] # exact lspServers keys THIS repo contributed to the union
  mcp_servers: [] # exact mcpServers keys THIS repo contributed to the union
  registered: true # false when the manifest landed but registration was declined
```

`local_plugin.mcp_servers` and the top-level `mcp_servers` are different
lists and must not be conflated: the top-level one names project-scoped
keys in the repo's own `.mcp.json`, the nested one names user-scoped keys in
the generated manifest.

Rules the lockfile enforces:

- **Sync diffs against the lockfile, mechanically, per component**:
  unchanged / pack moved / repo edited are hash comparisons, not inference,
  and one component's drift never churns the rest of its bundle.
- **Sync drops a retired record whose file is gone.** A recorded path its
  recording component — the `component:` ref — no longer ships, and that is
  absent from the tree, leaves `entries:` with no row in the delta:
  nothing lands and nothing is deleted. The sync report names every
  record it dropped. A path no longer shipped that is still present is
  not this rule's.
- **`hash:` has three writers, and a differing hash is drift only when none
  of them ran.** The materializer writes it at landing. The composing skill
  (`/vwf:init`) **re-records** it after every change it makes to a landed
  file, and its replace-or-keep offer re-records it on either answer, so a
  file kept as the repo's own reads as current, not as drift, the next time
  sync or the offer runs.
- **Anything not in the lockfile is not stackgen's** — never diffed, never
  overwritten, never removed. A landing set that collides with an unlisted
  path is a conflict for the user, not a write.
- **Removal removes exactly the listed entries**, `settings_keys` and
  `mcp_servers`, nothing else — the same receipt invariant this repo's
  installer CLI lives by. A tool or plugin under `bootstrap:` is removed
  only when no remaining component needs it, through bootstrap's own
  `remove` instruction; one the repo selected itself has no record and is
  never removed.
- **The local plugin is removed by subtraction, not deletion.** Removal drops
  only the keys under `local_plugin.lsp_servers` and
  `local_plugin.mcp_servers` from the generated manifest — another repo's
  keys stay. Only when that leaves the manifest with no servers at all is the
  plugin uninstalled, the marketplace removed and the directory deleted:

  ```sh
  claude plugin uninstall stackgen-lsp@stackgen-lsp --scope user
  claude plugin marketplace remove stackgen-lsp
  ```

  Those two are printed and confirmed, exactly as the registration pair is;
  the directory is stackgen's own and is deleted outright once they succeed.
  A `local_plugin` block absent from a lockfile means this repo contributed
  nothing, so removal touches the machine not at all.
