# Packs

Packs — the dispatch rule's preferred, pre-created path, one pack per
**component** — arrive here in the merge waves, one wave at a time, in the
shape `../assets/pack-format.md` defines (`<type>/<slug>/pack.yaml` + prose
+ optional skills/agents).

**Wave A — `toolchain-gate/`, kind `repo-gate`:** `dprint`, `gitleaks`,
`grype`, `pre-commit`.

**Wave B — `datastore/`, kind `database`:** `postgres`. And
`capability-provider/`, kind `capability-provider`: `oidc` (identity),
`otel-lgtm` (telemetry), `temporal` (workflow). The neutral contracts they
cite live once, in `../assets/contracts/`.

Most packs' doctrine **also shipped from a curated plugin** while that plugin
still existed. That copy is the destination the no-skill-lost rule requires
**before** a retirement, never a replacement on landing — and the backstop is
now spent: every curated stack plugin has retired, so for every pack here the
pack is the only home. Three packs went straight there, deleting their source
in the same commit because the pack plus a contract together carry everything
that source said: Wave D's `container-image` (with `contracts/local-stack.md`),
`doppler` (with `contracts/secrets.md`), and `github-actions` (with
`contracts/release-trigger.md`) — the third being the first to retire not a
skill but a **whole plugin**, `cicd` having been exactly one kind wearing a
manifest.

**Wave C — `ci-system/`, kind `ci-system`:** `github-actions`. Exactly one CI
system per repo, so this bundle never composes two. Its neutral contract is
`../assets/contracts/release-trigger.md`, landed later with the `cicd`
dissolution: it holds the recommended release-trigger mechanism — tag grammar,
branch mapping, release task names, how far a deploy path may be split — that
vwf's delivery-pipeline rules deliberately stopped mandating. Like
`local-stack.md` it is a **kind** contract rather than a capability one, and it
is what makes a second CI system one component rather than a second copy of the
release shape.

**`cicd` dissolved in the same landing** — the third plugin to go, and the
first to go whole rather than by skill: the kind *was* the plugin. Its neutral
rules, its resolution discipline and its one implemented system are the pack
and the contract above; what did not come across is its worked YAML, by the
same rule every pack follows — a pack carries judgment, and the vendor's own
syntax comes from Context7 at use time.

**Wave C — the TypeScript Language-Bundle**, five components across four
directories: `language/typescript`, `package-manager/pnpm`,
`toolchain-gate/tsconfig` (topic 9), `toolchain-gate/eslint` (topic 10) and
`framework/effect` (topic 2).

Note `toolchain-gate` appears under **two** kinds, which is the seam working
rather than a mistake: `dprint`/`gitleaks`/`grype`/`pre-commit` run over any
repo and compose into `repo-gate`, while `eslint` and `tsconfig` are
meaningful for exactly one toolchain and compose into its language bundle.

**The Swift package stack made Swift the fourth language root on 2026-09-23**,
after TypeScript and the Markdown and Bash pair the `claude-code-plugin`
bundle composes. `swift-package`, `platforms: [packages]`, pins four packs:
`language/swift` (the root, declaring `sourcekit-lsp` and `binaries: [swift]`,
since the toolchain is the host's), `package-manager/swiftpm` (doctrine only,
no `config/` tier, and a `lockfile` fact naming `Package.resolved` at the
root or inside an `.xcodeproj`), `toolchain-gate/swift-format` and
`toolchain-gate/swiftlint` — two more gates meaningful for one toolchain.
swift-format ships with the toolchain; SwiftLint is pinned through mise by
the `conf.d/swiftlint.toml` its pack lands. `language/swift` owns the tasks,
which take their file list from git, NUL-separated and `./`-prefixed —
`code:format` the hook's staged list when one is passed — stop with an error
when `git ls-files` fails, walk the tree with `find` when there is neither a
`.git` entry nor `GIT_DIR`, or no git, and skip SwiftLint when no Swift
source is in scope. No pack lands `Package.swift`: `swift package init`
creates it.

**Wave C — `app-framework/flutter`**, kind `app-framework`, with
`package-manager/pub` and `toolchain-gate/analysis-options`. The first
bundle whose root is not a language: Flutter owns the manifest and the build,
so Dart is a `primary` member and Kotlin and Swift are `platform-edge` members
with their own boundary-scoped skills.

Its integration references are **wiring only** — 45 files kept from 160, the
other 115 being API surface that Context7 serves current at use time. What was
kept is setup order, platform configuration (manifest entries, entitlements,
permissions) and anti-patterns: the half a per-package lookup gives piecemeal.

**`app-framework/swiftui` made the second on 2026-09-23**, the first pack in
the `native-ui` category, rooting the `swift-swiftui` bundle beside
`package-manager/swiftpm`, `toolchain-gate/swift-format` and
`toolchain-gate/swiftlint` across every Apple platform token. Xcode owns the
build from a committed Xcode project a person creates once — no pack lands
it and no generator writes it — so the pack declares `swift` as a bare
binary and `xcodebuild` with the probe `xcodebuild -version`, which doctor
runs because a Command Line Tools stub is on `PATH` too. Its tasks check
`xcodebuild -version` against the `XCODE_VERSION` in the
`.config/mise/conf.d/swiftui.toml` it lands, and refuse an unset or empty
pin, or one still set in `.config/mise.toml`'s `[env]` — which would
override the fragment; `/vwf:setup` moves such a line (a 0.1.0 repo's) into
the fragment, as the pack's conventions say. That pin and the three
`SIMULATOR_*` pins beside it ship empty and are filled by `/vwf:setup`,
which runs each `machine_env` entry's `detect` and offers the answer as the
default. Its `ux-gate` runs the swift-snapshot-testing goldens on the
simulator the repo pins. It ships no integration references yet.

**The UX gate is materialized, not delegated.** The two retired curated
`-ux-gate` skills moved into their packs as an unprefixed `ux-gate`, landed
into the repo's own `.claude/skills/`. vwf invokes that fixed name instead of
building `<plugin>-ux-gate` from the stack pin — once stacks are packs there
is no plugin name to build from, and a name assembled from configuration is
one that can silently resolve to nothing.

**Wave D — `deploy-target/container-image`**, kind `deploy-target`, the
eighth kind. Folded from the doctrine of the since-dissolved `devtools`
plugin's Docker/OCI skill, and the fold split it in two, because that skill
was two skills wearing one hat:

- **The deploy artifact** — the build file, its ignore file, and promoting
  one digest rather than rebuilding per environment — is this pack, and it
  turns `container-generic`'s `@generated` ref into a curated one.
- **The local stack** — Compose behind `wait-on` readiness gates — is *not*.
  It went to `../assets/contracts/local-stack.md`, because a repo needs a
  local stack whether or not it pins a container deploy target, and welding
  the two is the exact conflation the retired skill's own opening paragraph
  warned about. That contract is the one file in `contracts/` that is a
  **harness** contract rather than a capability one.

`deploy-target` is also the first kind whose bundle has **no second half** —
one component, standing alone, because there is no category above a
provider-neutral target to write doctrine at. Its scope fence does the work a
pairing does elsewhere. Fixing it exposed that both deploy bundles had been
declaring `kind: language-bundle` as a placeholder; `npm-package` now declares
`deploy-target` too, with its ref still `@generated`.

**Wave D — the `claude-code` plugin dissolved**, and its doctrine split along
a line the plugin had blurred. Plugin *creation* is the authoring repo's own
business and is deliberately not distributed, so how a plugin is packaged and
registered went back to that repo's private `.claude/`. What **is**
distributed is `../assets/artifact-doctrine.md`: the host rules deciding
whether a skill, agent or hook is **valid at all** — strict-YAML frontmatter,
the invocation states and their silent failure, fixed rather than constructed
skill names, hook verdict shapes, and MCP/LSP wiring. stackgen generates those
artifacts, so it is stackgen that has to know.

It is an **asset, never a pack**: it governs stackgen's output rather than
being part of it, and it applies to every generation run whatever the stack.
`kinds.md` decides what an artifact must *cover*; this decides whether it
works. The reviewer gained a ninth check for it.

The `claude-code-plugin` bundle survives, trimmed to stack facts. It is what
lets the authoring repo stay onboarded on vwf, and it is not a special case —
every bundle here is a stack its author uses.

**Wave D — `design-tool/`, kind `design-tool`:** `claude-design`, `lovable`,
`stitch`. Each carries the three import skills at the **fixed names** vwf
delegates to — `design-import-screens`, `design-import-design-system`,
`design-import-conversations` — landed in the repo's own `.claude/`. That is the
`ux-gate` seam reused rather than a second one invented: vwf now names no design
tool anywhere, and the technology-free guard's allowlist got **smaller**, which
is the intended direction whenever an exception stops feeling arguable.

A fourth tool is the **terminal itself**, with a file canvas: its source of
truth is a committed directory under the target repo's `docs/`, its adapters
read files rather than call a server, and it ships one extra user-invocable
skill that runs the design session. The bundle whose frontmatter carries
`default: true` is the entry vwf's architecture menu preselects on the axis —
at most one per axis per platform, where a bundle declaring no `platforms:`
covers every platform on its axis, which the checker enforces.

`claude-design` also declares an MCP server, which the materializer writes into
the project's own `.mcp.json` behind its own consent line. That is the charter
change Wave D made deliberately (`../assets/output-tree.md`): a curated registry
of servers fails on **scaling** before it fails on charter, since a list can only
hold what someone curated. LSP configuration stays out of the repo — no
project file can express one — and reaches the developer's machine through
the generated local plugin instead, the third output target Wave E added.

**Secrets — `capability-provider/`, category `secrets-manager`:** `doppler` and
`fnox`, the second pair to land in a category rather than one instance, and the
first landing where the choice between them is the whole point. Their neutral
contract is `../assets/contracts/secrets.md`, whose clauses both are judged
against; the axis that separates them is **where the secret lives and what
onboarding a teammate costs**, and the contract deliberately declines to rank
them.

Two things are worth knowing here rather than discovering later. The contract
carries an **encrypt-into-git allowance** under four conditions, and only `fnox`
engages it — a pack storing nothing in the repository emits no scanner allowlist
and claims no exemption, so a committed plaintext secrets file stays a finding
whichever pack is pinned. And `doppler`'s scope is **`development` only**, which
its contract-satisfaction topic states as a **named gap** on clauses 1 and 2
rather than omitting them: deployed environments take their secrets from the
platform that runs them. That is the contract's "a clause a tool cannot satisfy
is stated as such" rule doing what it exists for.

The since-dissolved `devtools` plugin lost its `doppler` skill in the same
landing — the second pack to retire its source skill on arrival. That plugin
dissolved into this one entirely; nothing named `devtools` ships any more.

**Audit — `capability-provider/`, category `audit`:** `audit-store-d1` and
`audit-store-postgres`, the third pair to land in a category rather than one
instance. The category was minted for vwf's `audit-store` token — the
append-only, access-controlled store the operator console reads — which is
**not** the telemetry sink and never was: their neutral contract
`../assets/contracts/audit.md` draws that line, and
`../assets/contracts/observability.md` dropped the half-claim it used to carry,
leaving a trace id as the only thing the two share.

Each pack **rides an existing datastore pack** rather than composing an engine
of its own — `cloud-service/d1` and `datastore/postgres` — because that is the
engine the product already runs and already operates. So neither ships a
`config/` tier or a migration, and both declare `local_stack: n/a`: the ridden
pack's local stack is already theirs. What separates them is **where the
invariants are enforced** — real grants in one, the code path holding the only
binding in the other — and how each orders the write, which the contract leaves
to the realization: the D1 pack states plainly that it cannot write atomically
with the act and so writes the event first, over-reporting under a monitor. The
contract's realizations table is where that comparison lives.

**Workspace — `capability-provider/`, category `workspace`:** `notion`, the
first provider of a category minted for something no blueprint chooses. The
workspace is where the team's docs, specs and tickets live, and it is the
**agent's** knowledge source rather than anything the product runs against —
so the category realizes no vwf token and none is pending, which its neutral
contract `../assets/contracts/workspace.md` states in its opening lines
instead of leaving the reader to infer a gap.

What the pack lands is **wiring and nothing else**: an `mcp_servers:` entry
the materializer writes into the repo's own `.mcp.json` behind its own
consent line, the second pack to use that door after `claude-design`. That
is the whole scope — no vwf step reads a workspace today. The contract's
work is therefore the permission shape rather than an availability one: the
person authenticates and not the repository, the agent's reach stops where
that person's does, writes need the person to ask in the session, and a
declined consent line leaves the skills landed and **says** the tool is
unreachable rather than returning an empty search.

**Stylesheet — `stylesheet/`, kind `stylesheet`:** `tailwindcss`, `stylex`
and `plain-css`, the first three packs of a type and a kind minted together
on 2026-09-14 for vwf's seventh axis. The kind exists because vwf names no
stylesheet approach and must not: a design system is a contract — token
values, scales and behaviours — and the file those values actually live in is
realization. Until the kind existed the only homes for that realization were
a framework pack, which would make every Astro project style the same way, or
a second bundle per framework, which the four-modes-four-bundles decision had
already refused. Each pack ships `conventions.md`, a paths-scoped doctrine
skill and a **required** `tokens.md` — the one topic nothing else in the tree
carries — and none of them ships a token value or names a component library.
Like `design-tool`, none ships a `config/` tier: the single integration hook
each needs is named by role and made by `/vwf:execute` in the framework's own
config file.

**The three tool axes, and the stranded pack that forced the first two.**
`design:` and `cicd:` began as per-project config keys outside the stack axes
rather than axes of their own, and the bundle menu was the only door a
template could come through — so `ci-system/github-actions` landed in Wave C
and **nothing could ever materialize it**. Not an error; invisible. The
`design` and `cicd` axes close that door, and `stylesheet` was minted as one
from the start. On all three the bundle slug **is** the config token, so the
menu pick and the config key are one value rather than two that can disagree.

**Bundles — `bundles/`, the recorded compositions users actually pick.** Every
curated option survives the merge — the eight TypeScript ones, the Flutter
app, the provider-neutral container deploy and the Claude Code plugin
template, the four Wave D added on what were then the two tool axes, the three
the stylesheet axis added to them, the `secrets-manager` pair above, the
five Wave E added for the two clouds, and the two Swift ones of 2026-09-23,
`swift-package` and the `swift-swiftui` app. Each names its components as refs,
mixing shipped packs (copied verbatim) with `@generated` ones (researched on
first fetch) — which is the dispatch rule working at bundle scale rather than
a gap.

A component answers *what is TypeScript*; a bundle answers *what is a
TypeScript service*. The menu lists bundles only — offering bare components
would ask a user to assemble a stack rather than choose one.

**Wave E — `cloud-provider/` and `cloud-service/`**, kind `cloud-provider`, the
ninth kind and the last one that had been defined but never authored against.
`cloud-provider` carries the account, IAM, billing and emulator judgment that
spans a provider's services — `gcp` and `cloudflare` — and `cloud-service`
carries one component per service: `cloud-run`, `cloud-sql`, `firestore`,
`firebase-auth`, `firebase-messaging`, `firebase-storage`, `gke` and
`zero-trust-access`. Wave D deferred this deliberately, because folding the
two clouds honestly needed per-topic research with citations rather than a
fold of their four ~80-line service templates.

**Cloudflare kept growing after the wave closed.** `workers-static-assets`
joined on 2026-09-05 — the first Cloudflare service here that hosts rather
than fronts — `workers-ssr` the day after, and then the storage and data
services: `kv`, `r2`, `d1`, `hyperdrive`, `vectorize`, `pipelines` and
`analytics-engine`, which gave Cloudflare a managed **backing** offering
rather than hosting alone. Each is a `backing`-axis bundle of its own, pinned
beside the others rather than chosen between, and each ships **no `config/`
tier**: a binding is an entry in the project's root `wrangler.jsonc`, which a
deploy pack owns, so nothing here writes a file of its own. The provider
component's scope prose is now two lists — offered and declined — so a
service the menu does not carry says which of the two it is rather than
leaving a reader to guess. It carried a third, `planned`, while the
remaining services were still arriving; the landing below emptied it.

**Compute and orchestration followed on 2026-09-06.** `durable-objects`,
`workflows` and `queues` joined on the same backing terms as the storage
services — one bundle each, no `config/` tier, the binding an entry in a
`wrangler.jsonc` a deploy pack owns. `containers` is on neither term: it is
a **deploy** target, category `compute`, `artifact: container-image`, and
the third `cloud-service` pack to ship a `config/` tier — a root
`wrangler.jsonc` carrying `main`, the container block, the Durable Object
binding that addresses it and the migration that declares the class, plus
the `p/_project/deploy` overlay. It is also the first bundle here pinned
*instead of* another: a Containers project **is** a Workers project, so
`cloudflare-containers` replaces `cloudflare-workers-ssr` rather than
sitting beside it, because both write that one root file — the reasoning is
`docs/memory/decisions/2026-09-06-containers-pin-instead-of-workers-ssr.md`.

**The AI services followed, and one of them is not a service.** `workers-ai`,
`ai-gateway`, `ai-search` and `browser-rendering` joined on the storage
services' terms — one `backing` bundle each, no `config/` tier, the binding an
entry in a `wrangler.jsonc` a deploy pack owns: inference, the plane in front
of every model call, a managed retrieval pipeline, and headless Chrome.

**The Agents SDK is the exception in that landing**, and why is worth stating:
it has no binding, and it is not a service at all but an npm framework whose
`Agent` class compiles to a Durable Object. So it ships as
`framework/cloudflare-agents` — the third `framework/` pack, beside `effect`
and `astro` — reachable through the project-axis language bundle
`typescript-cloudflare-agents`, because a framework pack no bundle names is
authored and unreachable, a defect this tree already carries once in its
python packs. The reasoning is
`docs/memory/decisions/2026-09-06-agents-sdk-is-a-framework-pack.md`.

**`framework/html` made it four on 2026-09-15**, under a category minted for
it, `document`: a hand-authored HTML5 page tree with plain CSS and ES-module
JavaScript, no framework and no content model, served by Vite in development
and built by `vite build` into `./dist` — the same `## Build output` heading
the deploy packs cite — with `cp -R src/. dist/ && cp -R public/. dist/` as
the documented copy-only opt-out and `html-validate` as its test. It is
reached through the `html` bundle, `platforms: [site]`, the one entry on a
`site` project's round beside the four Astro bundles; `astro-ssg` keeps the
default flag. Having no layout, it meets the web-head contract's layout
clause per page, and it carries a byte-identical copy of Astro's `icons`
task, since rule 13 forbids a payload citing a sibling pack. The reasoning is
`docs/memory/decisions/2026-09-15-html-site-pack.md`.

**Media, messaging and secrets closed the platform.** `images`, `realtime`,
`email-service` and `secrets-store` joined on the storage services' terms —
one `backing` bundle each, no `config/` tier — and with them the last of the
four Cloudflare plans landed, which is what emptied the provider's planned
list. Two are unlike their siblings. `realtime` has no binding at all: it is
an HTTPS API reached with an app id and secret, so it has no row on the
per-binding table and no local form. And `secrets-store` shares the category
noun `secrets-manager` with `capability-provider/fnox` on purpose — this one
is the **runtime** store a deployed Worker or Container reads in staging and
production, fnox the developer-machine and CI provider that injects on the
way in, so a repo pins both and neither replaces the other. The reasoning is
`docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`.

Every landing that brings a service nothing already classifies mints its
`cloud-service` category in `../assets/taxonomy.md`, which owns the closed
list and the reasoning — the wave itself minted `document`, for Firestore,
and `access`, for Zero Trust Access; `static-hosting` came with
`workers-static-assets` after it; and the Cloudflare storage and data work
minted a further set, once for that whole developer platform rather than per
landing, so every landing that followed needed no second edit there. Several of
those leave `capability` unset and stay that way: minting a capability token
is vwf's move, never the taxonomy's, and the taxonomy names which ones
rather than this file restating the list.

**Every stack adapter has now retired**, and `stackgen` is the only plugin left
shipping a `-stack-menu` / `-stack-template` pair. The retirement test stayed
mechanical rather than a judgement — an adapter retires only when **every** slug
it offered has a bundle — and `gcp` and `cloudflare`, which failed it at Wave D,
pass it here; `typescript` and `flutter` retired in the same wave on the same
test. The checker's stack-adapter rule gained an **inverse direction** alongside
this, since with one adapter left, deleting its keyword would otherwise have
switched the whole rule off while the checker still passed.

`object-storage` still gets no pack of its own, and will not: every object store
is a cloud's, so its flavour arrives from `cloud-service/firebase-storage`,
`cloud-service/r2`, or whichever provider's equivalent lands next. Its
contract sits in `../assets/contracts/` regardless, because the clauses are
the same whoever provides it.

`eslint` is deliberately absent: it is JS/TS-only, so it is topic 10 of the
TypeScript language bundle rather than a repo gate. See the `repo-gate` seam
in `../assets/kinds.md`.

**The inventory is [`inventory.md`](inventory.md)** — generated from this tree
by `mise run p:plugins:inventory`, never typed by hand, and guarded by `--check`
in pre-commit and CI. No curated plugin stands behind any pack any more, so
the covered path is exactly this tree, and stackgen's standing value beyond it
is the uncovered tail: `generated/<technology-slug>`.
