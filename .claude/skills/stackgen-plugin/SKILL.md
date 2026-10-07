---
name: stackgen-plugin
description: The stackgen plugin's own shape — the dispatch rule, the pack and
  bundle model, the kind vocabulary, where a materialization lands and the
  consent tiers around it, the one script it ships as a pack payload, and the
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
both ways too: `/stackgen:tool-config` owns every universal file a repo runs —
the mise config and task library, dprint, taplo, pre-commit, gitleaks, grype,
the house linter, git, graphify, `.vscode/settings.json` and
`.config/claude-status.json` — rendered by a shipped node script,
`skills/tool-config/scripts/tool-config.mjs` plus `scripts/lib/`
(`template.mjs`, the `@@NAME@@`, `@@#if NAME@@` and `@@#each NAME@@` engine;
`yaml.mjs`, the reader for the constrained `.config/stackgen.yaml` grammar;
`values.mjs`, which turns that file plus the repo's `origin` into the names a
template reads; `render.mjs`, `stackgen-file.mjs`, `paths.mjs`, `rows.mjs`,
`run.mjs` and `cli.mjs`): zero dependencies, run as
`MISE_ENV=dev mise x -- node` on the repo's own node pin (the `node` on `PATH`
only for the first `all` on a repo with no mise config), JSON on stdout, exit 0,
2 (refused) or 1 (fault). It copies `skills/tool-config/assets/` as it is and
renders `skills/tool-config/templates/` from `.config/stackgen.yaml` — the
repo's values, which **the script alone writes** — in four calls: `all` (the
repo's values as flags, every asset and template),
`pack --slug <s> --dir <pack dir>` (a pack's `templates/` and its `--set`
values), `pack-remove --slug <s>` and `upgrade` (the exact pins forward). Each
list a pack once appended to ships as a **universal superset**, and six files
carry one `# >>> tool-config` / `# <<< tool-config` marker pair whose outside
lines are the repo's own; every other file is owned whole. Dev-only mise files
pin `latest`; a file CI loads is rendered with exact versions from
`mise latest`, save `node` and `pnpm` — there is no mise lockfile. It runs a
tool only as `mise x -- <tool>`, only once installed; it reads mise trust and
never grants it — **trust is the person's prerequisite**. **No lock record and
no `check`**: each call compares a fresh render with the repo and shows every
differing file as a numbered row (`create`, `write`, `delete`, `pin`), answered
`ok` or `keep-existing` for that run alone. Any call may open with `preview`,
which returns the rows and writes nothing; the real call carries
`--answers <id>:<answer>,…` and asks nothing, so a caller with one consent of
its own shows the skill's rows inside it. Drift is the session's to judge from
`preview all`. A written call formats what it wrote with the shipped dprint
config and validates the hook config, restoring the files byte for byte on a
failure; `all` runs `MISE_ENV=dev mise run setup:all` between the landing and
the formatter, so it ends in a set-up repo, and renders a repo-local
`.claude/skills/mise/SKILL.md` whose task table lists every task. Its references
are the why behind each file. vwf's callers — `/vwf:init`'s `all` flags,
`/vwf:setup`'s pack values, doctor's drift — move onto the four calls in the
plan `2026-10-05-vwf-callers-on-templates`.

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

No bundle is fetched for a repo's baseline any more. The hygiene kind, its pack,
its bundle and the `unconditional:` bundle key retired on 2026-09-27: the
hygiene **config files** — `.gitignore`, `.gitattributes`, `.graphifyignore` —
are `stackgen:tool-config`'s universal files, and the **prose files** —
`CONTRIBUTING.md`, `SECURITY.md`, the licence texts, the issue forms — are
`/vwf:init`'s own assets. `init` runs `/stackgen:tool-config all` **per repo** —
the base and every member repo it resolved — so a member is shaped on its own
evidence; the only adapter fetch it makes is the secrets provider the user
picked. tool-config records nothing in the lockfile for its own files, so a repo
is shaped when it carries `.config/stackgen.yaml` with `format: 1` — the file
the script alone writes; one with the old mise layout and no `stackgen.yaml` is
**shaped on the old layout**, and vwf names it and stops until the reshape that
moves it ships. What setup *does* fetch is every **pinned** axis — its
materialize pass invokes `-stack-template` once per `(repo, slug)`, with the
`repo:` line naming the member — which is the one landing path
`/vwf:architecture` no longer takes. That pass carries an **`answers:` map**
beside the `repo:` line, and so does `stackgen-sync`: all three callers read the
two axes from the repo's own `.config/stackgen.yaml` — `secrets` and `forge`,
which init passed to `tool-config all` as `--secrets` and `--forge` — and
re-read `forge` live from that repo's `origin`, so a pinned pack's conditional
files land there only where init's answers allow (no shipped pack declares one
today). Since vwf's `config_format` 23 nothing reads a `.config/vwf.yaml`
`answers:` block, and no caller edits `stackgen.yaml` by hand: a held `forge`
the live host contradicts is passed again through `tool-config all --forge`, and
landing the forge-conditioned files that staleness had skipped is
`/vwf:setup reshape`'s, which `/vwf:doctor` names. The pass also carries a
**`values:` map** — pack slug → lowercase name → value — of each pinned pack's
`values:` entries (`name`, `detect`, `question` in its `pack.yaml`), which setup
gathers by running `detect`, else asking `question`; the materializer copies the
pack's `config/`, then runs
`tool-config pack --slug <slug> --dir <pack dir> --set <name>=<value>…` for its
`templates/`, and records each rendered path in the lockfile with
`rendered: true` and **no hash** — judged against a fresh render
(`preview pack`), never against bytes. Removal runs `pack-remove` first, then
deletes the pack's recorded files, rendered ones among them; `stackgen-sync`
refreshes rendered entries by re-running `pack` for a newer pack version, never
by diffing them.

A bundle's frontmatter may also carry **`default: true`**, since 2026-09-15:
`stackgen-stack-menu` copies it onto every entry whose bundle carries it and
computes none, and vwf's architecture menu preselects the one flagged entry
among those it offers on a round, after filtering by the project's platforms —
highlighted, never assumed, naming no tool. At most one bundle per axis **per
platform**: two flagged bundles on one axis conflict when either declares no
`platforms:` list (it is offered on every round of the axis) or their lists
intersect, and `p:plugins:check` rule 14 refuses the pair, naming the platform
they share. Two are flagged today. On the project axis it is `astro-ssg`,
`platforms: [site]` — what a `site` project's round highlights, and nothing on
any other platform's round; the other four entries on that round, the three
remaining Astro bundles and `html` (the `framework/html` pack, a hand-authored
page tree under the `document` category, since 2026-09-15), carry no flag.
Neither app-framework bundle carries one either — `dart-flutter`
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
`comments/<flow>--<platform>.yaml`. It requests `taste-skill@taste-skill`
through its own `setup/ai/claude-code` subtask, which `setup:ai:all` calls, so
the repo installs it at user scope when no scope serving the repo has it.

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
  a component genuinely owns — **mode preserved**, so a task file lands 755.
  Four kinds of entry since 2026-09-27: **(a)** is retired — the toolchain
  manager's own config and task library are `stackgen:tool-config`'s, landed
  from its `assets/` and `templates/`, never a pack's `config/` tree — what a
  pack adds is a **subtask** under `.config/mise/tasks/` —
  `code/{check,format,lint}/<slug>`, `setup/ai/<slug>` or
  `setup/deps/<verb>/<slug>`, the leaf always its slug — which the `…:all` task
  tool-config renders calls; **(b)** a language gate's own config
  (`.config/swiftlint.yml`, `.config/swift-format.json`, …) — dprint,
  pre-commit, gitleaks and grype are the skill's since 2026-09-26; **(c)** is
  retired too — since 2026-09-27 the hygiene config files (`.gitignore`,
  `.gitattributes`, `.graphifyignore`) are `stackgen:tool-config`'s universal
  files, the prose files (`CONTRIBUTING.md`, `SECURITY.md`, the licence texts,
  the issue forms) are `/vwf:init`'s own assets, and `.editorconfig` lands
  nowhere. What survives it is the **conditional** list, since 2026-09-21: a
  pack's `pack.yaml` may carry a `conditional:` list, each entry a `config/`
  path or glob and a `when:` of one axis to one value from the fixed vocabulary
  `forge` (`github`, `gitlab`) or `secrets` (a provider slug) — no shipped pack
  uses it today, since the per-pack editor settings it once guarded were dropped
  on 2026-10-01 with the `editor` axis. The materializer evaluates each against
  the `answers:` map the caller passes beside `repo:` — all three callers pass a
  full map read from the repo's `.config/stackgen.yaml` (`forge`, `secrets`),
  the forge re-read live from `origin`; an axis left out reads **true** and
  lands, the fallback for a caller none of this describes — and writes a
  never-landed false path to the lockfile's `skipped:` list as
  `{ path, pack, when }`, never a create and never a conflict, so `/vwf:doctor`
  never reports it missing and a file at that path is the repo's own; a path
  with an `entries:` record whose answer since flipped keeps its record and is
  never removed. A pack's `skipped:` rows **live and die with its `entries:`**:
  removing or un-pinning the pack drops its rows too, so the list never claims a
  path is intentionally absent for a condition nothing evaluates any more.
  `stackgen-sync` evaluates the same conditions before it classifies a pack's
  landing set, and gains three states beside its three — a false path with no
  record is **skipped (condition)** and is its `skipped:` row; a never-landed
  path whose condition now holds is **landable — condition now true** and is
  offered as a create under the consent tier a new pack file already takes; a
  landed path whose condition turned false is **kept**, reported once and never
  removed. A pack's ignore and attribute lines are not its own at all:
  tool-config's `.gitignore`, `.gitattributes`, exclude set, linter ignores and
  formatter plugins are **universal supersets** carrying every stack's entries —
  node's, Python's, Dart's, Flutter's and Swift's, fnox's `fnox.local.toml`,
  pnpm's and SwiftPM's lockfile markers — whether or not the repo uses that
  stack; **(d)** is retired too — a mise `conf.d/` file in `config/` is refused
  by rule 11: a pack's tool pin, environment values and aliases (fnox's pin,
  pnpm's `npx`, swiftlint's pin, swiftui's four Xcode and simulator values as
  `@@` names) live in its **`templates/`** tree, in
  `templates/.config/mise/conf.d/<slug>/` and nowhere else in `conf.d/`, which
  `/stackgen:tool-config pack --slug <slug> --dir <pack dir>` renders, its
  values declared in the pack's `values:` list, given with `--set` and stored
  under `packs.<slug>` in `.config/stackgen.yaml`, and a pack dropped from a
  composition gets `pack-remove --slug <slug>`, deleting `conf.d/<slug>/` and
  every subtask named for it; **(e)** is retired too — a `.config/pre-commit.d/`
  file is refused by rule 11: the hooks are tool-config's universal set, calling
  the `…:all` tasks, so a pack's check is a subtask — uv's `uv lock --check` is
  `code/check/uv`; **(f)** a deploy target's own config and its deploy task,
  since 2026-09-05 — `cloud-service/workers-static-assets`, its `workers-ssr`
  sibling and `cloud-service/containers` each ship `wrangler.jsonc` at the root
  (the SSR and Containers ones both carrying `main`, the Containers one adding a
  `containers` array, the Durable Object binding that addresses it and the
  migration that declares the class) plus a
  `.config/mise/tasks/p/_project/deploy` overlay, and the first two were the
  first `cloud-provider`/`cloud-service` packs to ship a `config/` tree at all,
  which is what put both types on the composition order (**last**, after
  `capability-provider`); **(g)** a **project task a framework pack owns**,
  since 2026-09-14 — the same `p/_project/` marked position and the same rename,
  landed from the **project** axis rather than the deploy one: `framework/astro`
  ships an `icons` overlay there, which rasterizes the favicon set from the
  product's mark, and `framework/html` ships a byte-identical copy of it — rule
  13 forbids a payload citing a sibling pack, and no tier offers a shared home
  yet. The position is shared on purpose, so a pack adding a file to it names a
  task no other pack in the same bundle already ships; and **(h)** is retired
  too — since 2026-10-01 no pack ships **editor settings**; the one
  `.vscode/settings.json` every repo gets is tool-config's universal asset since
  2026-10-05 (`docs/memory/decisions/2026-10-05-vscode-settings-universal.md`).
  Note the second underscore rule: `config/_<name>/` at the top of the tier is
  pack-private and never copied, but nested deeper `p/_project/` is a **marked
  position**, copied and renamed to the pinned project's id — **slugged** per
  `assets/ids.md`, which owns that rule and the measured reason for it. Still
  fenced out: `package.json`, any language manifest or lockfile, a pack's own
  editor settings, and CI workflows — the last of those refused *inside*
  `.github/`, which is otherwise an allowlisted root directory beside
  `.config/`. What lands at the repo **root** is capped by a fixed allowlist,
  whose doctrine is `assets/output-tree.md` and whose two tiers do not both
  reach the checker: the **landable** tier is `PACK_CONFIG_ROOT_FILES` in
  `scripts/src/check.ts`, enforced by `p:plugins:check` rule 11, and beside it
  sits a second tier of root files **vwf** writes — `CLAUDE.md` and
  `mempalace.yaml` — which may sit at a shaped root and which no pack may land.
  `readme.md` is on the landable tier only because a shaped repo has one — **no
  pack may ship it**. The git and graphify root files left the pack tier on
  2026-09-27: tool-config's trees admit them beside its own root
  (`TOOL_CONFIG_ROOT_FILES`), with `.vscode/`, and a pack ships none of their
  lines. Renovate is gone altogether since 2026-10-05 — no asset, no reference,
  no `update_bot` axis. The lockfile's per-file `hash:` — on every copied entry,
  never a `rendered: true` one — is the landing hash **re-recorded by
  `/vwf:init`** after its replace-or-keep offer, so a differing hash is drift
  only when no such writer ran — `assets/output-tree.md` and the materializer
  reference both say so.

**Three consent tiers**: the `.claude/` files ride the ordinary dry-run gate;
`settings.json`, `.mcp.json` and a pack's `config/` tree are never written
without their own separate consent lines; and the local plugin is two separately
declinable items — the manifest write, and the user-scoped registration, whose
two `claude plugin` commands are **printed and confirmed, never auto-run**.
CLAUDE.md is vwf's: the materializer recommends `/vwf:setup`.

## Authoring a pack

- **A landed file cites nothing by plugin path.** Everything under `skills/`,
  `agents/`, `rules/`, `hooks/`, `config/` and `templates/`, plus a pack's
  `conventions.md` and a bundle's body, is copied verbatim into a repo where
  **no plugin is installed**, so `p:plugins:check` rule 13 refuses four forms in
  them: the literal `${CLAUDE_PLUGIN_ROOT}`, a bare `assets/…` path, a `../`
  climb leaving the tree the file lands in (only a file under `skills/` has one
  — it may still reach a sibling skill of the same pack, which lands beside it;
  an agent, a rule, a `conventions.md` and a bundle body each land as one file,
  so any climb at all is a break), and a path into another pack. A bare
  `<type>/<slug>` — or `<type>/<slug>@<version>` — is the identifier vocabulary
  and stays legal. Name the asset by **role** ("stackgen's secrets contract"),
  or state the rule it carries **inline**; a sibling component's conventions are
  "the `<type>/<slug>` component's conventions, in this composition's template".
  Never swap one path for another.
- **The whole `config/` payload tier is checked before it ships.**
  `p:plugins:check` rule 11 makes **seven** assertions, over each pack's
  `config/` and `templates/` tiers and over tool-config's `assets/` and
  `templates/` alike (those also admitting `.vscode/` and
  `.claude/skills/mise/SKILL.md`, nothing else under `.claude/`): the exec bit
  and a known shebang on every task file (mise reports a 644 task as an
  *unknown* one rather than a permission error) and on every `hooks/*.sh`; the
  **landable** tier of the root allowlist over the tier's top level — the
  vwf-owned tier never reaches the checker, so a pack shipping `CLAUDE.md` or
  `mempalace.yaml` there is refused like any unallowlisted path — with a CI
  workflow refused inside `.github/`; that every `conditional:` entry in the
  pack's `pack.yaml` names a relative path or glob (no `..`) matching at least
  one file under `config/` — the checker's own walk, so `**` enters `.config/` —
  and a `when:` of exactly one vocabulary axis with a value it takes,
  `secrets: none` refused; that the pack's `binaries` and `lockfile` facts take
  the shapes doctor reads — a binary a bare name or `{ name, probe }`, a
  lockfile a list of relative paths or globs with no `..` — and that a
  `tool-config:` or `machine_env:` key is refused outright; that an optional
  `values:` list is entries of exactly `name` (upper snake, unique, never
  `FORMAT` or a tool-config global name), `detect` and `question`, each name
  read as an `@@` tag in the pack's `templates/`; and that every `@@` tag in a
  template tree is one the engine reads, tool-config's own limited to the global
  names and a pack's to those plus its `values:` names. Beside those: no mise
  `conf.d` file and no `pre-commit.d` file in `config/`; a pack's
  `templates/.config/mise/conf.d/` holding one folder, named for its slug; a
  subtask's leaf its own slug and never one of tool-config's universal subtask
  leaves; no reserved slug (`all`, `ai`, `_base`); and no pack file at a path
  tool-config ships, bar a `#PLACEHOLDER` slot — fnox's `setup/secrets`. Rule 15
  holds the skill's exclusion lists to one invariant: `assets/.config/`'s
  `dprint.json` (JSONC, a `../X` entry and its `**/X` twin one entry) and
  `taplo.toml` and the global `exclude` in `pre-commit-config.yaml` (a `(?x)`
  block of anchored alternatives) state **one set** after normalisation, and the
  gitleaks `[allowlist] paths` — every entry anchored `(^|/)`, `.turbo/` among
  them since 2026-09-21 — is a **subset** of it, never the reverse: the scanner
  extends upstream's default allowlist and must still walk `.claude/`, which the
  formatters skip because in a shaped repo it is machine-owned. A list missing
  from the skill's assets is a finding. A pack widens no list: each is a
  universal superset, edited in tool-config's own assets. The house linter's
  `linter.yaml` is not compared.
- **The tool-config script ships with nothing beside it.** Rule 16 holds
  `skills/tool-config/scripts/` to a `#!/usr/bin/env node` executable entry and
  `node:` built-ins or relative modules only — no `require(`, no package; the
  `scripts/` vitest suite spawns it in temp repos against a fake `mise`. Rule 17
  fails any `mise use` the plugin ships unless the line forbids it: a tool is
  entered into the owning `conf.d/<folder>/` file first, then installed with
  `mise install`.
- **Never format a payload file with this repo's dprint config.** The tier is
  excluded from it on purpose, and so are the template trees: the target repo
  formats these files with the *shipped* config, which omits settings this repo
  sets, so formatting one here makes a freshly initialised repo fail its own
  first hook run. Run the shipped config when a payload file needs formatting.
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

## A script that is not a plugin hook

One hook script ships here as a **pack payload**, copied into the target repo by
a materialization rather than discovered from a `hooks/hooks.json`: the
`package-manager/pnpm` pack's npm→pnpm/bun normalizer (`PreToolUse` on `Bash`,
via `updatedInput`), which moved here from the retired `typescript` plugin with
the package manager it rewrites for — a JS/TS rewrite has no business in vwf.
The `capability-provider/fnox` pack's ciphertext guard was the second, and was
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
`mise run p:plugins:marketplace`. A new pack, bundle or kind regenerates
`stacks/inventory.md` with `mise run p:plugins:inventory` — never type a count
into prose; `--check` in pre-commit and CI fails a stale inventory, and the
generator throws on a `kind` that `assets/kinds.md` does not define — and on a
bundle component ref that is not `<type>/<slug>@<version>`, that names no
`stacks/<type>/<slug>/pack.yaml`, or that pins a version the pack no longer
carries. Bumping a pack therefore means re-pinning every bundle that names it.
`@generated` refs name no pack by design and are skipped.
