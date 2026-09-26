---
name: stackgen-plugin
description: The stackgen plugin's own shape — the dispatch rule, the pack and
  bundle model, the kind vocabulary, where a materialization lands and the
  consent tiers around it, the two scripts it ships as pack payloads, and the
  one contract vwf holds it to. Auto-applies when editing anything under
  plugins/stackgen/.
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "plugins/stackgen/**"
---

# The stackgen Plugin

`stackgen` is the **principles-driven stack materializer** and the only stack
plugin left — vwf's one dependency. It implements vwf's stack-adapter contract:
`skills/stackgen-stack-menu` returns the stack options as a vwf menu payload,
`skills/stackgen-stack-template` returns one stack as a template payload, and
both are called by vwf rather than by users — the menu by `/vwf:architecture`
and `/vwf:setup`, the template by `/vwf:setup` (whose materialize pass lands a
first pin), `/vwf:plan` and `/vwf:execute` (pure conventions reads).
`/vwf:architecture` decides a pin and materializes nothing.
`skills/stackgen-sync` is the one user-only skill: the explicit, lockfile-diffed
re-sync. `skills/stackgen-reputation` is the one skill invocable **both** ways —
`disable-model-invocation: false` and no `user-invocable` line — so the
generator can call it over every concrete third-party name a generated component
emits, and a person can run `/stackgen:stackgen-reputation <ecosystem>:<name> …`
on a name before typing it anywhere; it returns `pass`, `warn` or `block` per
name from public read APIs over `WebFetch`, and is the only network stackgen
touches beyond Context7. Since `devtools` dissolved into it, stackgen also
carries the repo's own gate doctrine as packs. `skills/tool-config` is invocable
both ways too: `/stackgen:tool-config` owns the mise config — its layout, task
library and doctrine sit in its `assets/mise/` and `references/mise.md` — writes
each requester's lines between `# >>> <requester>` / `# <<< <requester>`
markers, shows drift with take theirs, keep mine or merge, and records
`source: tool-config/<tool>@<version>` in the lockfile. `/vwf:init` calls it as
`all` with its answers, the materializer runs each pack's `tool-config:` list
through it, and `/vwf:setup` fills a `machine_env` value with its `set env`.

**Each asset is authoritative for its own subject.** This file is a map; do not
restate a count or a rule that an asset below already owns.

| Read                          | For                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/taxonomy.md`          | the closed component **types** and **categories**; capability tokens stay vwf's                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `assets/kinds.md`             | the **kind vocabulary** — each kind a closed topic bar, one artifact per topic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `assets/pack-format.md`       | the shape of a pack: `<type>/<slug>/pack.yaml` + prose + optional skills/agents/`config/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `assets/output-tree.md`       | where a materialization lands, the lockfile, the three targets outside `.claude/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `assets/ids.md`               | one **slug rule**, two independent tokens: a project's **id** (`p:<id>/` and the commit scopes) and a repo's **name** (`REPO_NAME`, the checkout folder); flags name member **repos**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `assets/artifact-doctrine.md` | the **host rules** deciding whether a generated skill, agent or hook is valid at all                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `assets/contracts/`           | the provider-neutral doctrine per capability or kind that instance packs cite and stay thin; the newest is `contracts/workspace.md`, the `workspace` category's, which states how the agent **reaches** the team's knowledge workspace and what it may read and write, and is the third contract to realize no vwf token at all. Before it, `contracts/web-head.md`, what **any** web framework pack — shipped or generated — realizes for a project declaring `site`, or `webapp` with `seo`: the head set, the icon sizes, the manifest, robots and sitemap, and the icon task; and before that `contracts/audit.md`, the `audit` category's, realizing vwf's `audit-store` and deliberately beside `observability.md` rather than inside it |
| `stacks/inventory.md`         | **generated** — every pack, bundle and kind with counts; `mise run p:plugins:inventory`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `stacks/readme.md`            | the narrative — which wave landed what, and why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `agents/`                     | `stackgen-skill-reviewer`, the generator's gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

The user-facing reference is `site/src/content/docs/plugins/stackgen.md`. The
checker rules, the two mise gates and the authoring traps are the sibling
`plugin-authoring` skill, which also applies here.

## The dispatch rule

A **component** is the atom (a language, its package manager, a framework, a
gate, a datastore instance, a cloud service); a **bundle** is a recorded
composition of component refs — never a directory. Given a bundle a project
pins, stackgen resolves its composition and dispatches **per component**:

1. A component a shipped **pack** covers is **copied verbatim** from `stacks/`.
2. An uncovered component is **generated**: resolve the kind and its topic bar →
   detect the real stack → one Context7 research pass per topic → instantiate
   vwf's principles catalog with citations → at assemble, every concrete
   third-party name the component emits (packages, runner-invoked tools,
   actions, images) through `stackgen-reputation`, a `block` halting the
   component with the verdict table until the user names a replacement, never a
   silent swap → the `stackgen-skill-reviewer` gate, capped at **four rounds**,
   after which residuals are reported rather than looped; its tenth check reads
   the verdict table it is handed — every name has a row, none reads `block` —
   and it stays offline. Context7 or a reputation source unreachable → **halt,
   never guess**. The verdict table is shown whole beside the reviewer's verdict
   at the dry-run consent gate; a template read-back (`/vwf:plan`,
   `/vwf:execute`) never re-checks.

Mixed compositions are the ordinary case, with one consent and one landing per
bundle, so a later re-sync can act on one component alone. Packs are **assets,
not live skills** — installing stackgen floods no session with every stack's
doctrine.

`repo-gates` and `repo-hygiene` are **unconditional** bundles: left out of the
menu payload and fetched by `/vwf:init` at their fixed slugs, because a repo
that has picked no stack still has to run its gates by name. `init` fetches them
**per repo** — the base and every member repo it resolved, each landing its own
lockfile — so a member is shaped on its own evidence. `/vwf:setup` no longer
fetches **those two**: it checks each repo's adapter lockfile for them and for
the `tool-config/…` records `/stackgen:tool-config all` writes, and offers
`/vwf:init` when one is missing anywhere, or when any repo has drifted from
doctor's baseline. What setup *does* fetch is every **pinned** axis — its
materialize pass invokes `-stack-template` once per `(repo, slug)`, with the
`repo:` line naming the member — which is the one landing path
`/vwf:architecture` no longer takes. Since `config_format` 21 that pass carries
an **`answers:` map** beside the `repo:` line, and so does `stackgen-sync`: all
three callers read the four axes from the base's `.config/vwf.yaml` `answers:`
block — `editor` and `secrets` once for the product, `forge` and `update_bot`
per repo — and re-read `forge` live from that repo's `origin`, so a pinned
pack's conditional files (the editor fragments of tsconfig, astro, pnpm,
analysis-options, eslint, ruff, swift-format, swiftlint) land there only where
init's answers allow. A caller reading a config that carries no block infers the
four the way init seeds them and writes nothing; the one config key a caller
other than `init` may write is `answers.repos.<path>.forge`, rewritten in place
and reported when the live host contradicts the record. Landing the
forge-conditioned files that staleness had skipped is `/vwf:setup reshape`'s,
which `/vwf:doctor` names.

A bundle's frontmatter may also carry **`default: true`**, since 2026-09-15:
`stackgen-stack-menu` copies it onto every entry whose bundle carries it and
computes none, and vwf's architecture menu preselects the one flagged entry
among those it offers on a round, after filtering by the project's platforms —
highlighted, never assumed, naming no tool. At most one bundle per axis **per
platform**, never an unconditional one: two flagged bundles on one axis conflict
when either declares no `platforms:` list (it is offered on every round of the
axis) or their lists intersect, and `p:plugins:check` rule 14 refuses the pair,
naming the platform they share. Two are flagged today. On the project axis it is
`astro-ssg`, `platforms: [site]` — what a `site` project's round highlights, and
nothing on any other platform's round; the other four entries on that round, the
three remaining Astro bundles and `html` (the `framework/html` pack, a
hand-authored page tree under the `document` category, since 2026-09-15), carry
no flag. Neither app-framework bundle carries one either — `dart-flutter`
(`cross-platform-ui`) and `swift-swiftui` (the `app-framework/swiftui` pack, the
first under `native-ui`, since 2026-09-23) — so an app platform's round
preselects nothing. On the design axis it is `design-tool`'s `claude-code` — the
terminal itself as a design tool, the fourth of that kind beside
`claude-design`, `lovable` and `stitch`, and the first with a **file canvas**: a
committed `docs/design/<project>/` its three import skills read as files, plus a
fourth, user-invocable `design-session` skill that writes it — the design system
and the logo, and since pack `0.2.0` a flow's screens (`screens <flow>`, from
the brief `/vwf:screens prompt` wrote, into `screens/<flow>--<platform>/`) and a
review round (`review <flow>`, which serves the canvas from the repo, waits for
**Done**, then applies every open comment). The server is the skill's own
`scripts/serve.mjs`, a single-file Node program with no dependencies: it binds
`127.0.0.1` on an ephemeral port, serves only the canvas, carries no auth and no
TLS, and appends each comment to a **committed**
`comments/<flow>--<platform>.yaml`. It declares `taste-skill@taste-skill` as the
plugin a product pinning it must add at init's fifth question.

## Where it lands, and the consent tiers

Both paths land **directly in the repo's committed `.claude/` tree** — output
closed to skills, agents, hooks and rules — recorded per component in
`.claude/stackgen/lock.yaml`. Three targets sit outside it, each **merging,
never owning**, removed only by subtraction of the keys the lockfile recorded:

- the project's own `.mcp.json`;
- a generated **local plugin** at the fixed path
  `~/.claude/plugins/local/stackgen-lsp/`, which exists because `lspServers` is
  a manifest-only feature no project file can express — the one way to provide a
  language server is to *be* a plugin. User scope is safe because every
  generated `lspServers` entry **must** carry an `extensionToLanguage` map;
- a pack's own **`config/` tree**, mirroring the repo root, for the repo config
  a component genuinely owns — **mode preserved**, so a task file lands 755. Six
  kinds of entry since 2026-09-26: **(a)** is retired — the toolchain manager's
  own config and task library are `stackgen:tool-config`'s, landed from its
  `assets/mise/`, never a pack's `config/` tree; **(b)** a gate's own config
  (`.config/dprint.json`, `.config/pre-commit-config.yaml`,
  `.config/gitleaks.toml`, `.config/grype.yaml`, …); **(c)** the hygiene files
  (`.gitignore`, `.editorconfig`, `.gitattributes`, `SECURITY.md` — its one
  contact slot taking a URL or an email — `renovate.json` at the root, the
  licence texts — copied by `/vwf:init` for a repo that answered `public`, never
  for a private one — and, since 2026-09-21, three of them **conditional**: a
  pack's `pack.yaml` may carry a `conditional:` list, each entry a `config/`
  path or glob and a `when:` of one axis to one value from the fixed vocabulary
  `forge` (`github`, `gitlab`), `editor` (`vscode`), `secrets` (a provider
  slug), `update_bot` (`renovate`, `dependabot`, `none`); the hygiene pack
  conditions `.github/ISSUE_TEMPLATE/*` on `forge: github`, `renovate.json` on
  `update_bot: renovate` and its editor fragment on `editor: vscode`. The
  materializer evaluates each against the `answers:` map the caller passes
  beside `repo:` — since `config_format` 21 all three callers pass a full map
  read from the base config's `answers:` block, the forge re-read live from
  `origin`; an axis left out reads **true** and lands, the fallback for a caller
  none of this describes — and writes a never-landed false path to the
  lockfile's `skipped:` list as `{ path, pack, when }`, never a create and never
  a conflict, so `/vwf:doctor` never reports it missing and a file at that path
  is the repo's own; a path with an `entries:` record whose answer since flipped
  keeps its record and is never removed. A pack's `skipped:` rows **live and die
  with its `entries:`**: removing or un-pinning the pack drops its rows too, so
  the list never claims a path is intentionally absent for a condition nothing
  evaluates any more. `stackgen-sync` evaluates the same conditions before it
  classifies a pack's landing set, and gains three states beside its three — a
  false path with no record is **skipped (condition)** and is its `skipped:`
  row; a never-landed path whose condition now holds is **landable — condition
  now true** and is offered as a create under the consent tier a new pack file
  already takes; a landed path whose condition turned false is **kept**,
  reported once and never removed. The provider's ignore line is **not** a
  conditional file: `fnox.local.toml` left the base `.gitignore` and is a
  provider row in the hygiene pack's ignore table (fnox, and doppler's
  `.doppler/`), appended under a banner named for the slug only where init's
  stack read carries that provider); **(d)** is retired too — a mise
  `conf.d/<pack>.toml` fragment is refused by rule 11; a provider's tool pin and
  environment values (doppler, fnox), a shell alias (pnpm's `npx`) or a gate
  tool's pin (swiftlint's) is a line of the pack's `tool-config:` list, which
  the materializer runs through `/stackgen:tool-config`, and a pack dropped from
  a composition gets that skill's `remove <pack>`; **(e)** a hook fragment at
  `.config/pre-commit.d/<pack>.yaml`, copied verbatim — **`/vwf:init` merges
  it**, nothing in stackgen edits the pre-commit config, which is what keeps a
  fragment a fragment. A fragment is for a **non-gate** check only: since
  2026-09-12 a gate tool is configured once, in a `code:*` task the base hooks
  call, so a pack needing a gate overlays that task instead. Only
  `package-manager/uv` still ships a fragment, for `uv lock --check`; **(f)** a
  deploy target's own config and its deploy task, since 2026-09-05 —
  `cloud-service/workers-static-assets`, its `workers-ssr` sibling and
  `cloud-service/containers` each ship `wrangler.jsonc` at the root (the SSR and
  Containers ones both carrying `main`, the Containers one adding a `containers`
  array, the Durable Object binding that addresses it and the migration that
  declares the class) plus a `.config/mise/tasks/p/_project/deploy` overlay, and
  the first two were the first `cloud-provider`/`cloud-service` packs to ship a
  `config/` tree at all, which is what put both types on the composition order
  (**last**, after `capability-provider`); **(g)** a **project task a framework
  pack owns**, since 2026-09-14 — the same `p/_project/` marked position and the
  same rename, landed from the **project** axis rather than the deploy one:
  `framework/astro` ships an `icons` overlay there, which rasterizes the favicon
  set from the product's mark, and `framework/html` ships a byte-identical copy
  of it — rule 13 forbids a payload citing a sibling pack, and no tier offers a
  shared home yet. The position is shared on purpose, so a pack adding a file to
  it names a task no other pack in the same bundle already ships; and, since
  2026-09-06, **(h)** a pack's **editor fragment** at
  `.config/vscode.d/<pack>.jsonc`, three keys only (`settings`, `nesting`,
  `extensions`) — **`/vwf:init` composes them** into `.vscode/settings.json` and
  `.vscode/extensions.json`, which no pack ever ships whole and which the
  convention in `assets/pack-format.md` names (init itself never names an
  editor). The composed block sits first, and the convention's rule since
  2026-09-20 is that a key the file already carries outside the block is a
  **collision** the composing skill **omits** from the block — keep mine, take
  the pack's or union, asked once and recorded by vwf, an identical extension id
  kept unasked — so a hand key wins without the file ever holding a duplicate,
  never because the format tolerates one. Every one of the **twelve** fragments
  in the tree — repo-hygiene, dprint-editor, pre-commit, eslint, ruff, tsconfig,
  analysis-options, mise, since 2026-09-21 astro and pnpm, and since 2026-09-23
  swift-format and swiftlint — is conditioned on `editor: vscode`, in its pack's
  `pack.yaml` or, for mise's, by `stackgen:tool-config`'s `editor` argument, so
  an editor **no** at init lands none and the composing skill composes nothing.
  The split is by ownership: the hygiene baseline carries **editor-wide keys
  alone** (indentation and suggestion defaults, the generic excludes, todo-tree,
  the non-stack nesting rows, the generic extensions), and every stack-naming
  key sits in the fragment of the pack that pins that stack — `node_modules`,
  the tsbuildinfo files, the template-string converter and `*.js` nesting in
  tsconfig's; `.dart_tool` in analysis-options'; `.astro` in astro's; `.turbo`,
  the pnpm lockfile and the `package.json` children in pnpm's (turbo is a
  generated component the pnpm-turbo bundle carries, so its exclude lives beside
  the manager); `.build`, `.swiftpm` and the `Package.swift` nesting in
  swift-format's; `yaml.*` and `redhat.vscode-yaml` in pre-commit's; the fish
  extension dropped. `editor.defaultFormatter` is set **per language** in the
  dprint fragment, one `[<language>]` scope per plugin `dprint.json` carries and
  `[toml]` to even-better-toml, never editor-wide — an editor-wide binding
  overrode Dart's formatter by composition order alone. The dprint gate's
  fragment is the one filename exception, `dprint-editor.jsonc`: dprint
  discovers any `dprint.jsonc` below the root as a sub-directory config, and one
  with no `plugins` array makes a bare `dprint check` exit 13. Note the second
  underscore rule: `config/_<name>/` at the top of the tier is pack-private and
  never copied, but nested deeper `p/_project/` is a **marked position**, copied
  and renamed to the pinned project's id — **slugged** per `assets/ids.md`,
  which owns that rule and the measured reason for it. Still fenced out:
  `package.json`, any language manifest or lockfile, a **whole** editor file,
  and CI workflows — the last of those refused *inside* `.github/`, which is
  otherwise an allowlisted root directory beside `.config/`. What lands at the
  repo **root** is capped by a fixed allowlist, whose doctrine is
  `assets/output-tree.md` and whose two tiers do not both reach the checker: the
  **landable** tier is `PACK_CONFIG_ROOT_FILES` in `scripts/src/check.ts`,
  enforced by `p:plugins:check` rule 11, and beside it sits a second tier of
  root files **vwf** writes — `CLAUDE.md` and `mempalace.yaml` — which may sit
  at a shaped root and which no pack may land. `readme.md` is on the landable
  tier only because a shaped repo has one — **no pack may ship it** — and
  `renovate.json` joined that tier on 2026-09-10, at the root because Renovate's
  config discovery never reaches `.config/` — and since 2026-09-21 it
  **yields**: a repo already carrying a policy under `.github/renovate.json`,
  `.renovaterc` or `renovate.json` keeps its own and the pack's is not landed
  (`/vwf:init`'s tool-config table owns the spellings; the hygiene pack's
  conventions state the rule) — and since 2026-09-21 it is also **conditional**
  on `update_bot: renovate`, so a repo whose init row picked `dependabot` or
  `none` gets no `renovate.json` at all, the path listed under `skipped:` rather
  than landed beside a Dependabot policy. The lockfile's per-file `hash:` is the
  landing hash **re-recorded by `/vwf:init`** after its fills, appends, merges
  and its replace-or-keep offer, so a differing hash is drift only when no such
  writer ran — `assets/output-tree.md` and the materializer reference both say
  so.

**Three consent tiers**: the `.claude/` files ride the ordinary dry-run gate;
`settings.json`, `.mcp.json` and a pack's `config/` tree are never written
without their own separate consent lines; and the local plugin is two separately
declinable items — the manifest write, and the user-scoped registration, whose
two `claude plugin` commands are **printed and confirmed, never auto-run**.
CLAUDE.md is vwf's: the materializer recommends `/vwf:setup`.

## Authoring a pack

- **A landed file cites nothing by plugin path.** Everything under `skills/`,
  `agents/`, `rules/`, `hooks/` and `config/`, plus a pack's `conventions.md`
  and a bundle's body, is copied verbatim into a repo where **no plugin is
  installed**, so `p:plugins:check` rule 13 refuses four forms in them: the
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
  `p:plugins:check` rule 11 makes **ten** assertions, over each pack's tier and
  each `skills/tool-config/assets/<tool>/` tree alike: the exec bit and a known
  shebang on every task file (mise reports a 644 task as an *unknown* one rather
  than a permission error) and on every `hooks/*.sh`; the **landable** tier of
  the root allowlist over the tier's top level — the vwf-owned tier never
  reaches the checker, so a pack shipping `CLAUDE.md` or `mempalace.yaml` there
  is refused like any unallowlisted path — with a CI workflow refused inside
  `.github/`; that each `.config/pre-commit.d/*.yaml` parses with a top-level
  `repos:` list, and that the gate pack's **whole**
  `.config/pre-commit-config.yaml` does too — it is neither a fragment nor at
  the tier's root, so nothing parsed it until it was named; that each
  `.config/vscode.d/*.jsonc` parses as JSONC carrying only the three keys; and
  that every `conditional:` entry in the pack's `pack.yaml` names a relative
  path or glob (no `..`) matching at least one file under `config/` — the
  checker's own walk, so `**` enters `.config/` — and a `when:` of exactly one
  vocabulary axis with a value it takes, `secrets: none` refused; and that the
  pack's `binaries`, `lockfile` and `machine_env` facts take the shapes doctor
  and setup read — a binary a bare name or `{ name, probe }`, a lockfile a list
  of relative paths or globs with no `..`, a `machine_env` entry a `name`,
  `detect` and `question`, the name set by a `mise add env` entry of the pack's
  `tool-config:` list, and each such entry parsing as `mise add tool`,
  `mise add env` or `mise add alias` with a legal name and scope, a template
  delimiter only in an `add env` value; and no mise `conf.d` fragment in the
  tier at all. Beside it, rule 15 holds the gate packs' exclusion lists to one
  invariant: the dprint pack's `dprint.json` and `taplo.toml` and the pre-commit
  pack's global `exclude` (a `(?x)` block of anchored alternatives) state **one
  set** after normalisation, and the gitleaks `[allowlist] paths` — every entry
  anchored `(^|/)`, `.turbo/` among them since 2026-09-21 — is a **subset** of
  it, never the reverse: the scanner extends upstream's default allowlist and
  must still walk `.claude/`, which the formatters skip because in a shaped repo
  it is machine-owned. Widen a formatter list, widen all three; widen the
  allowlist only with a generated tree. `p:plugins:shellcheck` runs
  `shellcheck -x` and `shfmt -d` over the same shell, in two groups — task
  libraries with the pack's `_scripts/` beside them, hooks with no flags, since
  a hook lands alone and may declare `sh`.
- **Never format a payload file with this repo's dprint config.** The tier is
  excluded from it on purpose: the target repo formats these files with the
  *shipped* config, which omits settings this repo sets, so formatting one here
  makes a freshly initialised repo fail its own first hook run. Run the shipped
  config when a payload file needs formatting.
- **A pack carries judgment, never the vendor's syntax** — worked YAML comes
  from Context7 at use time. Category-level doctrine is written once, in
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

## Two scripts that are not plugin hooks

Two hook scripts ship here as **pack payloads**, copied into the target repo by
a materialization rather than discovered from a `hooks/hooks.json`:

- the `capability-provider/fnox` pack's git pre-commit gate;
- the `package-manager/pnpm` pack's npm→pnpm/bun normalizer (`PreToolUse` on
  `Bash`, via `updatedInput`), which moved here from the retired `typescript`
  plugin with the package manager it rewrites for — a JS/TS rewrite has no
  business in vwf.

Both are still gated here, as payload rather than as hooks: rule 11 asserts each
script's exec bit and its shebang, and `p:plugins:shellcheck` lints the body.
What no rule reads is the `hooks.yaml` beside them — `checkHookScripts`, the
older rule, follows only a plugin's own `hooks/hooks.json`, so the event and
matcher a payload hook is wired to are asserted by nothing in this repo.
`mise run p:plugins:npm-normalize-test` covers the normalizer's behaviour: it
table-tests the script through the **system sed** for both package managers,
each table in a temp dir seeded with the lockfile that selects pnpm or bun. Hook
scripts must stay portable to macOS BSD `sed` — no `\s`, no `\b`.

## Documentation

Any change to stackgen's behaviour must reconcile `readme.md`, `CLAUDE.md` and
`site/src/content/docs/plugins/stackgen.md` in the **same commit** — the repo's
hard rule. Delegate the sweep to `/vwf:docs-sync`. A behaviour change also bumps
`version` in `plugin.json` (plain `X.Y.Z`) and regenerates the marketplace with
`mise run p:plugins:marketplace`. A new pack, bundle or kind regenerates
`stacks/inventory.md` with `mise run p:plugins:inventory` — never type a count
into prose; `--check` in pre-commit and CI fails a stale inventory, and the
generator throws on a `kind` that `assets/kinds.md` does not define — and on a
bundle component ref that is not `<type>/<slug>@<version>`, that names no
`stacks/<type>/<slug>/pack.yaml`, or that pins a version the pack no longer
carries. Bumping a pack therefore means re-pinning every bundle that names it.
`@generated` refs name no pack by design and are skipped.
