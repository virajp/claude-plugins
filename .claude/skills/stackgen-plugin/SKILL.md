---
name: stackgen-plugin
description: The stackgen plugin's own shape — the dispatch rule, the pack and
  bundle model, the kind vocabulary, where a materialization lands and the
  consent tiers around it, the one script it ships as tool-knowledge payload,
  and the one contract vwf holds it to. Auto-applies when editing anything under
  plugins/stackgen/.
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "plugins/stackgen/**"
---

# The stackgen Plugin

`stackgen` is the **principles-driven stack materializer** and the only stack
plugin left — vwf's one dependency. It implements vwf's stack-adapter contract:
`skills/stackgen-stack-menu` returns the stack options as a vwf menu payload —
the shipped bundles, the repo's own bundles, the design tools and the addons —
and, as `compose:`, writes a **repo bundle** at
`.claude/stackgen/bundles/<slug>.md` for a combination no shipped bundle
covers; `skills/stackgen-stack-template` returns one stack as a template
payload, and both are called by vwf rather than by users — the menu by
`/vwf:architecture` and `/vwf:setup`, the template by `/vwf:setup` (whose
materialize pass lands a first pin), `/vwf:plan` and `/vwf:execute` (pure
conventions reads). `/vwf:architecture` decides a pin and materializes nothing.
`skills/stackgen-sync` is the explicit, lockfile-diffed re-sync, which also
converts, once, a lockfile written before tool knowledge and design tools —
`disable-model-invocation: false`, so `/vwf:setup`'s materialize pass invokes it
on consent to convert old lock rows, and the user runs it as
`/stackgen:stackgen-sync` too.
`skills/stackgen-reputation` is invocable **both** ways too —
`disable-model-invocation: false` and no `user-invocable` line — so the
generator can call it over every concrete third-party name a generated component
emits, and a person can run `/stackgen:stackgen-reputation <ecosystem>:<name> …`
on a name before typing it anywhere; it returns `pass`, `warn` or `block` per
name from public read APIs over `WebFetch`, and is the only network stackgen
touches beyond the generator's research sources. Since `devtools` dissolved into
it, stackgen also carried the repo's own gate doctrine as packs, and those packs
left in turn: every universal file a repo runs — the mise config and task
library, dprint, taplo, pre-commit, gitleaks, grype, the house linter, git and
the editor settings — is [bootstrap](https://github.com/virajp/bootstrap)'s, the
`setup:*` and `code:*` tasks with them, and `stackgen:tool-config`, which once
rendered them, was removed on 2026-11-03. Both plugins reach bootstrap only
through its CLI and JSON contract (bootstrap 4.1.0 or newer), per each plugin's
`assets/bootstrap-contract.md`, whose `## Passing values` says how each value
is quoted and each name in a key is checked. `/vwf:init` runs
`bootstrap migrate`, `/vwf:setup`'s materialize pass applies packs through the
adapter, and `/vwf:doctor` judges drift through `bootstrap check --json` and
`bootstrap sync --json --dry-run`, in full mode and in setup's Step 0 only.

**Each asset is authoritative for its own subject.** This file is a map; do not
restate a count or a rule that an asset below already owns.

| Read                          | For                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/taxonomy.md`          | the closed component **types** and **categories**; capability tokens stay vwf's                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `assets/kinds.md`             | the **kind vocabulary** — each kind a closed topic bar, one artifact per topic                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `assets/pack-format.md`       | the shape of a pack (`<type>/<slug>/pack.yaml` + prose + optional skills/agents/`config/`), of a tool-knowledge entry, of a design tool, of a bundle's `tools:` and `packs:`, and of an addon                                                                                                                                                                                                                                                                                                                 |
| `assets/addons.yaml`          | the **addons** — the optional Claude plugins the `addon` axis offers — `name`, `summary`, `plugin`, `marketplace`, `repo`, `design_tools` — which `/vwf:setup` declares in the `claude` tool's `plugins.project` and `setup:ai` installs                                                                                                                                                                                                                                                                      |
| `assets/output-tree.md`       | where a materialization lands, the lockfile, the two targets outside `.claude/`                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `assets/ids.md`               | one **slug rule**, two independent tokens: a project's **id** (`p:<id>/` and the commit scopes) and a repo's **name** (`REPO_NAME`, the checkout folder); flags name member **repos**                                                                                                                                                                                                                                                                                                                         |
| `assets/artifact-doctrine.md` | the **host rules** deciding whether a generated skill, agent or hook is valid at all                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `assets/contracts/`           | the provider-neutral doctrine per capability or kind that instance packs cite and stay thin; the newest is `contracts/web-head.md`, what **any** web framework pack — shipped or generated — realizes for a project declaring `site`, or `webapp` with `seo`: the head set, the icon sizes, the manifest, robots and sitemap, and the icon task; and before that `contracts/audit.md`, the `audit` category's, realizing vwf's `audit-store` and deliberately beside `observability.md` rather than inside it |
| `tools/<slug>/`               | **tool knowledge** — one entry per bootstrap tool or tools (`tool.yaml` names them), landed where a project links or a bundle names one; never listed in a bundle                                                                                                                                                                                                                                                                                                                                             |
| `design-tools/`               | the **design tools** — three generic role skills under `skills/` and one folder per tool, installed into `vwf-tools`, never into a repo                                                                                                                                                                                                                                                                                                                                                                       |
| `stacks/inventory.md`         | **generated** — every pack, bundle, tool entry, design tool and kind with counts; `mise run p:plugins:inventory`                                                                                                                                                                                                                                                                                                                                                                                              |
| `stacks/readme.md`            | the narrative — which wave landed what, and why                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `agents/`                     | `stackgen-skill-reviewer`, the generator's gate                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

The user-facing reference is `site/src/content/docs/plugins/stackgen.md`. The
checker rules, the two mise gates and the authoring traps are the sibling
`plugin-authoring` skill, which also applies here.

## The dispatch rule

A **bundle** is a recorded composition — never a directory — of two lists:
`tools:`, bootstrap tool names with no version (a language, its package
manager, its gates), and `packs:`, knowledge packs as
`<type>/<slug>@<version>` or `@generated` (a framework, a datastore instance, a
cloud service). Tool knowledge is never listed: each `tools/<slug>/` entry
whose `tool.yaml` names a tool a project links or the bundle names — and every
entry naming none — lands beside it. Given a bundle a project pins, stackgen
asks bootstrap for the tools and dispatches **per pack**:

1. A pack ref a shipped **pack** covers is **copied verbatim** from `stacks/`.
2. An uncovered (`@generated`) pack is **generated**: resolve the kind and its
   topic bar →
   detect the real stack → one research pass per topic, with Context7 first when
   Context7 is installed, else `WebFetch` of the official documentation, and the
   package registries always → instantiate vwf's principles catalog with
   citations → at assemble, every concrete third-party name the component emits
   (packages, runner-invoked tools, actions, images, SwiftPM packages, Maven
   artifacts and Gradle plugins, mise tools as
   `mise:<backend>:<path>@<version>`) through `stackgen-reputation` — nine
   prefixes, `host:` the newest, which always blocks since no source vets a
   remote host, Go, Cargo, Ruby and .NET reached through `mise:` — a `block`
   halting the component with the verdict table until the user names a
   replacement, never a silent swap → the `stackgen-skill-reviewer` gate, capped
   at **four rounds**, after which residuals are reported rather than looped;
   its tenth check reads the verdict table it is handed — every name has a row,
   none reads `block` — and it stays offline. The generator researches no
   language server: the servers are bootstrap's. The generator never halts on
   Context7 and never asks for it; with no research
   source reachable (no Context7 and no `WebFetch`) or a reputation source
   unreachable → **halt, never guess**. The verdict table is shown whole beside
   the reviewer's verdict at the dry-run consent gate; a template read-back
   (`/vwf:plan`, `/vwf:execute`) never re-checks.

Mixed compositions are the ordinary case, with one consent and one landing per
bundle, so a later re-sync can act on one component alone. A bundle is never
mandatory: a combination no shipped bundle covers is a repo bundle written by
`compose:`, whose uncovered items are `@generated` refs under the pack-type
prefix, exactly as in a shipped bundle. Packs are **assets,
not live skills** — installing stackgen floods no session with every stack's
doctrine.

No bundle is fetched for a repo's baseline any more. The hygiene kind, its pack,
its bundle and the `unconditional:` bundle key retired on 2026-09-27: the
hygiene **config files** — `.gitignore`, `.gitattributes` and the issue forms —
are bootstrap's, and the **prose files** — `CONTRIBUTING.md`, `SECURITY.md` and
the licence texts — are `/vwf:init`'s own assets. `init` runs
`bootstrap migrate` in each repo, the base first, then each member, so a member
is shaped on its own evidence; it makes no adapter fetch. A repo is shaped when
`bootstrap config get repo.format --json` answers `ok`; one with
`.config/stackgen.yaml` or the old mise layout is **shaped on the old layout**,
and `bootstrap migrate` moves it through the same step. What setup *does* fetch
is every **pinned** axis — its materialize pass invokes `-stack-template` once
per `(repo, slug)`, with the `repo:` line naming the member — which is the one
landing path `/vwf:architecture` no longer takes. The `repo:` line is the whole
of the optional input beside the catalog paths: the `answers:` and `values:`
maps retired on 2026-10-23 with the pack keys they fed.

**A pack ships no toolchain.** The tool pins, gates, gate configs, generic tasks
(`setup:deps`, `code:format`, `code:lint`), pre-commit hooks and secrets setup
of a repo are **bootstrap**'s — a separate repo, selected through the
`bootstrap` CLI and synced by `bootstrap sync`. The materializer checks the
bundle's `tools:` against `bootstrap catalog --json`, and adds them with
`bootstrap add tool <t> --json --dry-run`, then `--yes`, behind their own
consent line; a plugin a pack names is written to the `claude` tool's values
with `bootstrap config set` (`config unset` on removal), and `mise run setup:ai`
installs or uninstalls it.
It never edits a file in `.config/bootstrap/` and never names a bootstrap tool
from memory; it records what it asked for in the lockfile's `bootstrap:` block,
so removal runs the matching `remove` and `stackgen-sync` diffs that block. A
pack names its Claude plugin in a `## Claude plugins` section of its
`conventions.md`. A repo bootstrap's shaped test refuses gets nothing landed — a
pack's tasks are Python uv scripts that import bootstrap's
`_scripts/helpers.py` — and the remedy named is
`/vwf:setup reshape`. A value only the machine can answer (`XCODE_VERSION`,
`SIMULATOR_*`, `COMPILE_SDK`, `EMULATOR_IMAGE`) is found by bootstrap's tasks,
or set by the repo in the `[env]` of
`.config/mise/conf.d/zz-repo/mise.<env>.toml`. The procedure is
`skills/stackgen-stack-template/references/bootstrap-handoff.md`.

A bundle's frontmatter may also carry **`default: true`**, since 2026-09-15:
`stackgen-stack-menu` copies it onto every entry whose bundle carries it and
computes none, and vwf's architecture menu preselects the one flagged entry
among those it offers on a round, after filtering by the project's platforms —
highlighted, never assumed, naming no tool. At most one bundle per axis **per
platform**: two flagged bundles on one axis conflict when either declares no
`platforms:` list (it is offered on every round of the axis) or their lists
intersect, and `p:plugins:check` rule 14 refuses the pair, naming the platform
they share. One is flagged today. On the project axis it is `astro-ssg`,
`platforms: [site]` — what a `site` project's round highlights, and nothing on
any other platform's round; the other four entries on that round, the three
remaining Astro bundles and `html` (the `framework/html` pack, a hand-authored
page tree under the `document` category, since 2026-09-15), carry no flag. None
of the three app-framework bundles carries one either — `dart-flutter`
(`cross-platform-ui`), `swift-swiftui` (the `app-framework/swiftui` pack, the
first under `native-ui`, since 2026-09-23) and `kotlin-compose` (the
`app-framework/compose` pack, the second under `native-ui`, since 2026-10-09) —
so an app platform's round preselects nothing.

**The `design` axis lists the design tools**, the folders of `design-tools/`,
none flagged `default: true`: `claude-code`, `lovable` and `stitch`
(`claude-design` was removed on 2026-11-09). Each is a `tool.yaml`, a
`conventions.md`, one `references/<role>.md` per role and, optionally, a
skill only it has; the three generic role skills under `design-tools/skills/`
— `design-import-screens`, `design-import-design-system`,
`design-import-conversations` — read the named project's `design` value and
follow that tool's reference. Materializing installs the role skills once and
a named tool's references and skills into `vwf-tools`, claimed per repo as
`design-tool:<tool>`; nothing of a design tool lands in a repo, and
`p:plugins:check` rule 8 holds the tree. `claude-code` is the terminal itself
as a design tool, and the first with a **file canvas**: a committed
`docs/design/<project>/` the role skills read as files through its references,
plus a user-invocable `design-session` skill only it has, which writes
it — the design system and the logo, and since pack `0.2.0` a flow's screens
(`screens <flow>`, from the brief `/vwf:screens prompt` wrote, into
`screens/<flow>--<platform>/`) and a review round (`review <flow>`, which serves
the canvas from the repo, waits for **Done**, then applies every open comment).
The server is the skill's own `scripts/serve.mjs`, a single-file Node program
with no dependencies: it binds `127.0.0.1` on an ephemeral port, serves only the
canvas, carries no auth and no TLS, and appends each comment to a **committed**
`comments/<flow>--<platform>.yaml`. It does not install `taste-skill`:
`design-session` halts plainly when the plugin is absent, naming the tools menu,
and the three role skills do not need it.

**The `addon` axis holds the optional Claude plugins** that
`assets/addons.yaml` lists — no pack, no bundle and no kind, none flagged
`default: true`; each entry carries `name` (equal to its `plugin`), `summary`,
`plugin`, `marketplace`, `repo` (the marketplace's owner/repo) and
`design_tools`. One ships today: `taste-skill`
(`taste-skill@taste-skill`, from the `Leonxlnx/taste-skill` marketplace),
serving the `claude-code` design tool. The menu carries them for
`/vwf:architecture`'s tools round, with a `needed_by` note on an entry that
serves a design tool. `.config/vwf.yaml`'s product-level `addons:` list records
the
pick, and `/vwf:setup` declares each in the base repo's `claude` tool as
`tools.claude.plugins.project."<plugin>@<marketplace>" = "<repo>"` through
`bootstrap config set`, unsets a dropped one, and runs `mise run setup:ai`,
which installs it — an addon is never landed or removed by the stack-template.
The stack-template's `remove: <slug>` takes any slug a lockfile records, the
form setup's format steps use to retire a component — a pin dropped from an axis
setup deletes itself, its bootstrap tools left selected;
`remove: key <name>` deletes one server key from `vwf-tools`. `addon` is the
eighth axis and not a tool axis:
"the three tool axes" stays `design`, `cicd` and `stylesheet`.

A project-axis bundle may also carry an **`os:` map**, `<platform>: [ <os> ]`,
since 2026-10-10: its keys a subset of the bundle's `platforms:`, the first OS
on each list the primary. `stackgen-stack-template` passes it through in the
payload, and `/vwf:setup` records it as `projects.<name>.stack.os`, beside
`frameworks` (a project's languages are bootstrap's tools since
`config_format` 28); vwf alone maps a (platform, OS) pair to a device
frame, so the bundle names no frame. Three carry one — `swift-swiftui`,
`kotlin-compose` and `dart-flutter`; an absent map, or a platform absent from
it, reads as no OS known.

## Where it lands, and the consent tiers

Both paths land **directly in the repo's committed `.claude/` tree** — output
closed to skills, agents, hooks and rules — recorded per component in
`.claude/stackgen/lock.yaml`. Two targets sit outside it, each **merging, never
owning**, removed only by subtraction of the keys the lockfile recorded:

- a generated **local plugin**, `vwf-tools`, at the fixed path
  `~/.claude/plugins/local/vwf-tools/`, which exists because `lspServers` is a
  manifest-only feature no project file can express — the one way to provide a
  language server is to *be* a plugin — and which holds the LSP servers, taken
  unchanged from `data.servers` of `bootstrap lsp --json`, and the design
  tools the repo's projects name.
  **stackgen installs no MCP server**: the user owns every MCP install, and a
  pack that needs one names it in a `## MCP servers` section of its
  `conventions.md` (an `(optional)` marker for one it can work without), which
  the materializer records in the lockfile's `required_mcp_servers` for
  `/vwf:doctor`; the retired `user_mcp_servers:` key is refused by the checker.
  The project-scoped `mcp_servers:` key and the `.mcp.json` write path are
  retired too; a machine with the older `stackgen-lsp` plugin is offered one
  migration. A
  `claims.json` beside the manifest maps each key — a server, or a
  `design-tool:<tool>` — to the repos claiming it, so a removal drops a key
  only when no repo claims it. User scope is safe for a language server
  because every `lspServers` entry bootstrap gives carries an
  `extensionToLanguage` map;
- a pack's own **`config/` tree**, mirroring the repo root, for the repo config
  a component genuinely owns — **mode preserved**, so a task file lands 755.
  Since 2026-10-23 the tier is an **allowlist**, and rule 11 refuses any other
  path: a project task at the
  `.config/mise/tasks/p/_project/` marked position (the three Cloudflare deploy
  packs' `deploy.py` overlay, `framework/astro`'s `icons.py` and
  `framework/html`'s byte-identical copy of it — rule 13 forbids a payload
  citing a sibling pack; each is a Python uv script `<name>.py` in bootstrap's
  M51 form, importing `helpers.py`, and an old extension-less task of the same
  name is removed as replaced only when `stackgen.lock` records it — an
  unrecorded one is a named conflict),
  a root file on the landable allowlist (the deploy packs' `wrangler.jsonc`),
  and `config/_<name>/`, pack-private and never copied. A test task
  (`.config/mise/tasks/test/`) is refused as a bootstrap tool's part — the
  `test/golden` swiftui and compose shipped and android's `test/e2e` left the
  packs for bootstrap. A tool-knowledge entry ships no `config/` tier at all.
  Everything a pack once shipped beyond that — subtasks, gate configs
  (`.config/swiftlint.yml`, …),
  `templates/` mise folders, pnpm's `.npmrc` and `npx` alias, fnox's `fnox.toml`
  and `setup/secrets` — is bootstrap's or gone; the `.npmrc` and
  `code:format:pnpm` have no replacement. The `p/_project/` position is shared
  on purpose, so a pack adding a file to it names a task no other pack in the
  same bundle already ships. Note the second underscore rule: `config/_<name>/`
  at the top of the tier is pack-private and never copied, but nested deeper
  `p/_project/` is a **marked position**, copied and renamed to the pinned
  project's id — **slugged** per `assets/ids.md`, which owns that rule and the
  measured reason for it. Still fenced out: `package.json`, any language
  manifest or lockfile, a pack's own editor settings, and CI workflows — the
  last of those refused *inside* `.github/`, which is otherwise an allowlisted
  root directory beside `.config/`. What lands at the repo **root** is capped by
  a fixed allowlist, whose doctrine is `assets/output-tree.md` and whose tiers
  do not all reach the checker: the **landable** tier is
  `PACK_CONFIG_ROOT_FILES` in `scripts/src/check.ts`, enforced by
  `p:plugins:check` rule 11, and beside it sits a tier of root files **vwf**
  writes — `CLAUDE.md` — which may sit at a shaped root and which no pack may
  land. `readme.md` is on the landable tier only because a shaped repo has one —
  **no pack may ship it**. The files bootstrap's sync writes are bootstrap's,
  and a pack ships none of their lines. The lockfile has no `rendered:` entries
  and no `skipped:` list. Its per-file `hash:` — on every copied entry — is the
  landing hash, and `/vwf:init` touches no file a pack landed, so a differing
  hash
  is what `/vwf:doctor`'s Content drift predicate judges.

**Three consent tiers**: the `.claude/` files ride the ordinary dry-run gate;
`settings.json`, a pack's `config/` tree and the bootstrap
instructions are never written or sent without their own separate consent lines;
and the local plugin is two separately declinable items — the manifest write,
and the user-scoped registration, whose two `claude plugin` commands are
**printed and confirmed, never auto-run**. CLAUDE.md is vwf's: the materializer
recommends `/vwf:setup`.

## Authoring a pack

- **A landed file cites nothing by plugin path.** Everything under `skills/`,
  `agents/`, `rules/`, `hooks/` and `config/`, plus a pack's `conventions.md`
  and a bundle's body — and the same tiers of a `tools/` entry, and every file
  under `design-tools/` but a `tool.yaml` — is copied verbatim where **no plugin
  root resolves**, so `p:plugins:check` rule 13 refuses four forms in them: the
  literal `${CLAUDE_PLUGIN_ROOT}`, a bare `assets/…` path, a `../` climb leaving
  the tree the file lands in (only a file under `skills/` has one — it may still
  reach a sibling skill of the same pack, which lands beside it; an agent, a
  rule, a `conventions.md` and a bundle body each land as one file, so any climb
  at all is a break), and a path into another pack. A bare `<type>/<slug>` — or
  `<type>/<slug>@<version>` — is the identifier vocabulary and stays legal. Name
  the asset by **role** ("stackgen's secrets contract"), or state the rule it
  carries **inline**; a sibling component's conventions are "the `<type>/<slug>`
  component's conventions, in this composition's template". Never swap one path
  for another.
- **The whole `config/` payload tier is checked before it ships.**
  `p:plugins:check` rule 11 runs over each pack's `config/` tier: the exec bit,
  the `<name>.py` name and the `#!/usr/bin/env -S uv run --script` shebang on
  every task file — a Python uv script in bootstrap's M51 form (mise reports a
  644 task as an *unknown* one rather than a permission error) — and the exec
  bit and a known shebang on every `hooks/*.sh`;
  the **landable** tier of the root allowlist over the tier's top level — the
  vwf-owned tier never reaches the checker, so a pack shipping `CLAUDE.md` there
  is refused like any unallowlisted path — with a CI workflow refused inside
  `.github/`; under `.config/`, only `p/_project/` tasks
  (`PACK_CONFIG_DOTCONFIG_ALLOWLIST`), which names no bootstrap tool, a test
  task refused with its own message; no pack `templates/` tier; no `config/`
  tier in a `tools/` entry; and that a retired key — `tool-config:`,
  `machine_env:`, `values:`, `conditional:`, `user_mcp_servers:`,
  `languages:`, `lsp_servers:`, `package_manager:`, `lockfile:`, `harness:` —
  is refused outright in a `pack.yaml` or a `tool.yaml`. The rule
  in
  full is the `plugin-authoring` skill's `references/checks.md`. Rule 15 is
  retired, with the exclusion lists it compared. Rule 17 fails any `mise use`
  the
  plugin ships unless the line forbids it: a tool is added with
  `bootstrap add tool <tool>`, never by a hand edit of the config.
- **Never format a payload file with this repo's dprint config.** The tier is
  excluded from it on purpose, and so are the template trees: the target repo
  formats these files with the *shipped* config, which omits settings this repo
  sets, so formatting one here makes a freshly initialised repo fail its own
  first hook run. Run the shipped config when a payload file needs formatting.
- **A pack carries judgment, never the vendor's syntax** — worked YAML comes
  from Context7 at use time when Context7 is installed; else the official
  documentation. Category-level doctrine is written once, in
  `assets/contracts/`; instance packs cite it.
- **The no-skill-lost rule runs backwards**: a pack is the destination that has
  to exist *before* a source retires, never a replacement on landing. Every
  curated stack plugin has now retired, so for every pack here the pack is the
  only home.
- A generated artifact is **lazily hung and never line-capped** — a large one is
  decomposed into a router skill plus on-demand references, never trimmed.
- The `vwf-stack-adapter` keyword in `plugin.json` is load-bearing:
  `p:plugins:check` requires the menu + template pair on every plugin carrying
  it, **and** the keyword on every plugin shipping either skill, so dropping one
  side cannot silently turn the rule off.
- Both adapter skills are **skill-invoked**: `disable-model-invocation: false`
  so vwf can reach them by their constructed names, **and**
  `user-invocable: false` so neither spends a `/` menu slot on a skill that
  answers only a program. Rule 9 asserts both literal lines, and asserts the
  explicit `false` rather than the mere absence of `true` — absence states
  nothing about the thing vwf depends on. `stackgen-reputation` is the third
  shape — `disable-model-invocation: false` with **no** `user-invocable` line —
  so the generator reaches it and it still takes a `/` menu slot; rule 9 keys
  off the two adapter names only and does not read it. `stackgen-stack-template`
  keeps its `argument-hint`; it costs nothing on a hidden skill and documents
  the one argument the caller passes — still `<slug>` alone. The **target repo**
  is not a second argument: it arrives as one optional `repo: <path>` line
  beside the principles-catalog paths, the member's path relative to the base
  repo root, absent meaning the current repo. The materializer writes there and
  keeps that repo's own `.claude/stackgen/lock.yaml`, so two members pinning the
  same slug hold two independent materializations.

## A script that is not a plugin hook

One hook script ships here as a **tool-knowledge payload**, copied into the
target repo by a materialization rather than discovered from a
`hooks/hooks.json`: the `tools/pnpm` entry's npm→pnpm/bun normalizer
(`PreToolUse` on `Bash`,
via `updatedInput`), which moved here from the retired `typescript` plugin with
the package manager it rewrites for — a JS/TS rewrite is stack doctrine, and
vwf's workflow doctrine stays language-agnostic; the one TypeScript module vwf
ships is engine glue for the progress pane, not doctrine. The
`capability-provider/fnox` pack's ciphertext guard was the second, and was
deleted on 2026-10-07 with the encrypted mode it gated.

It is still gated here, as payload rather than as a hook: rule 11 asserts the
script's exec bit and its shebang; nothing lints the body. What no rule reads is
the `hooks.yaml` beside it — `checkHookScripts`, the older rule, follows only a
plugin's own `hooks/hooks.json`, so the event and matcher a payload hook is
wired to are asserted by nothing in this repo.
`mise run p:plugins:npm-normalize-test` covers the normalizer's behaviour: it
table-tests the script through the **system sed** for both package managers,
each table in a temp dir seeded with the lockfile that selects pnpm or bun. Hook
scripts must stay portable to macOS BSD `sed` — no `\s`, no `\b`.

## Documentation

Any change to stackgen's behaviour must reconcile `readme.md`, `CLAUDE.md` and
`site/src/content/docs/plugins/stackgen.md` in the **same commit** — the repo's
hard rule. Delegate the sweep to `/vwf:docs-sync`. A behaviour change also bumps
`version` in `plugin.json` (plain `X.Y.Z`) and regenerates the marketplace with
`mise run p:plugins:marketplace`. A new pack, bundle, tool entry, design tool
or kind regenerates `stacks/inventory.md` with `mise run p:plugins:inventory` —
never type a count into prose; `--check` in pre-commit and CI fails a stale
inventory, and the generator throws on a `kind` that `assets/kinds.md` does not
define, on a bundle missing its `tools:` or `packs:` list or still carrying
`components:` — and on a bundle `packs:` ref that is not
`<type>/<slug>@<version>`, that names no
`stacks/<type>/<slug>/pack.yaml`, or that pins a version the pack no longer
carries. Bumping a pack therefore means re-pinning every bundle that names it.
`@generated` refs name no pack by design and are skipped. A bundle's `tools:`
names are checked by `p:plugins:check` rule 14 against the committed snapshot
`scripts/src/bootstrap-tools.json`, which `node scripts/src/bootstrap-tools.ts`
writes from `bootstrap catalog --json` — rerun it when bootstrap adds a tool.
