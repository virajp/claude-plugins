---
title: "stackgen plugin"
description: "The principles-driven stack materializer that implements vwf's stack-adapter contract with the dispatch rule and lands artifacts in the repo's committed .claude/ tree."
order: 2
---

The principles-driven stack materializer. stackgen implements vwf's
stack-adapter contract with one core rule — **the dispatch rule** — and one
output shape — **artifacts landing directly in the repo's committed `.claude/`
tree**, with three narrow targets beside it: the two things no repo file can
express, and the repo config a component genuinely owns. It makes a product
*executable* on stacks nobody curated, by generating project-level skills,
agents, hooks-wiring and rules from vwf's principles catalog and current
documentation, behind a reviewer gate and your consent.

Configure, not conjure: stackgen wires and documents existing tools — it never
implements a server, and it never invents a tool the ecosystem does not have.

## Install

```sh
claude plugin install stackgen@virajp-plugins
```

Independent of `vwf` at install time — but its two adapter skills exist to be
called by `/vwf:architecture`, `/vwf:setup`, `/vwf:plan` and `/vwf:execute`, so
in practice you list it in the product's roster:

```yaml
# .config/vwf.yaml
stacks: [ stackgen ] # the only stack plugin there is
```

## Components and bundles

**Components** are the atoms — the language, its package manager, each
framework, each toolchain gate, a datastore instance, a cloud service. Each is a
pack (or a generated artifact set) declaring a **type**, a finer **category**,
and the vwf **capability** token it realizes where one applies; the type and
category vocabularies are closed, in `assets/taxonomy.md`, extended
deliberately.

**Bundles** are recorded compositions of component refs —
`<type>/<slug>@<version>`, or `@generated` — never directories. Four bundle
shapes exist today: a Language-Bundle is the composition rooted at a language
component (language + package manager + framework components + toolchain gates);
a Cloud-Bundle is provider + service components; a Datastore-Bundle is
category-level doctrine + an instance component; and the standing-alone shape —
a Deploy-, Design- or **Stylesheet-Bundle**, exactly one component with no
second half.

The taxonomy splits at the existing seam: **capability tokens stay vwf's**
(`capability-vocabulary.md`); the finer **category taxonomy is stackgen's**. vwf
never learns what an ORM is; stackgen never redefines a capability — several
categories, `cdn` and `access` among them, leave their capability token
deliberately unset until vwf defines one, because a category classifies what a
component *is*, never whether a product must have one. `workspace` is unset for
a reason of its own rather than a pending decision — it is the agent's knowledge
source, not the product's runtime, so no capability is waiting on it. Which
categories those are is
[`assets/taxonomy.md`](https://github.com/virajp/claude-plugins/blob/main/plugins/stackgen/assets/taxonomy.md)'s
to say. Categories make components substitutable answers to one blueprint
capability, which is what lets stack menus become category-filtered queries
instead of per-plugin lists. Category-level doctrine is written once as curated
knowledge; instance components cite it and stay thin.

### Four bundles on one pack — the Astro example

The clearest worked example of "bundles are compositions, not directories" is
the `site` platform. Four Astro bundles serve it, all pinning the one
`framework/astro` pack and all carrying React for islands, and they differ by
which of Astro's two `output` values is set and whether an adapter is present.
`astro-ssg` carries `default: true`, so a `site` project's round preselects it;
the other three are picked deliberately:

| Bundle         | Menu name        | Renders                                                                                                             |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `astro-ssg`    | `Astro (SSG)`    | every route at build time, no adapter, nothing per request — a marketing site, a docs build, a changelog            |
| `astro-ssr`    | `Astro (SSR)`    | every route per request, behind an adapter, so a page can read the request that asked for it                        |
| `astro-hybrid` | `Astro (Hybrid)` | prerendered by default, with the handful of routes that must read a request opting out per route                    |
| `astro-csr`    | `Astro (CSR)`    | one shell page plus a catch-all, the app itself a client-only island with its own router — a console or a dashboard |

`astro-ssr` and `astro-hybrid` also pin `framework/effect`, because Hybrid is
SSR with prerendering flipped and its on-demand routes cite the SSR bundle's
server doctrine rather than restating it. SSG and CSR have no server, so neither
does.

**The `site` platform's fifth entry is not Astro at all.** `html`, on the
`framework/html` pack, is a hand-authored HTML5 page tree with plain CSS and
ES-module JavaScript — no framework, no components, no content model. Vite
serves it in development and `vite build` writes `./dist`; a repo that wants its
tree served byte-for-byte replaces the build with
`cp -R src/. dist/ && cp -R public/. dist/` and keeps Vite for the dev server
alone, at the cost of hashing, minification, `.ts` scripts and any stylesheet
approach that needs a build plugin. `html-validate` over `src/**/*.html` is its
`test`. It carries no `default:` flag — `astro-ssg` stays what the round
preselects — and its category is `document`, a token minted for it: the build is
a bundler, not a framework. Pick it over `astro-ssg` when the site is a handful
of pages someone writes by hand, needs no content collections and no islands; a
blog, a changelog, documentation past a page or two, anything in Markdown, or
anything wanting a per-route rendering mode is one of the Astro bundles. With no
layout file, the web-head contract's layout clause is met per page: every page
carries the full head set as a checklist, the sitemap and `robots.txt` are
hand-authored under `public/`, and the site origin is one exported constant in
`vite.config.ts` that a review checks the hand-typed canonicals against. The
stylesheet axis is answered as for any site, with one rule: `plain-css` needs
nothing, `tailwindcss` uses its Vite plugin under the default build and its CLI
under the copy-only opt-out, and `stylex` needs the Vite build.

There is no output-mode field on a bundle and no per-project setting: Astro has
exactly two `output` values (`hybrid` was removed in Astro 5 and merged into
`static`), and CSR is a page shape rather than a mode, so all four are decisions
the pack's doctrine carries and each bundle pins one. **A page with no island
ships no JavaScript**, which is why React rides along in all four rather than
splitting the menu into with- and without-React pairs.

**Every one of the four ships the head.** Since `framework/astro` **0.2.0** the
pack's conventions carry a fixed `## Head` section — the title and description a
page states about itself, the canonical address, the OpenGraph and card set, the
favicon links and the manifest, `robots.txt` and the sitemap — and it lands one
file: a `p/_project/icons` task that rasterizes the whole favicon set from the
product's single source mark, installing its tools one-off rather than adding a
dependency. That is the first `config/` payload the Astro pack has ever shipped.
What it renders comes from the blueprint: each screen's Metadata block, the
product-wide text under `conventions.md`'s `#web-metadata` anchor, and the
design system's Brand assets. The `public/` files themselves — `robots.txt`, the
manifest, the rasterized icons, the social image — are written by `/vwf:execute`
from that doctrine, not landed by the pack.

**Every one of the four also carries MDX, images and layouts.** Since
`framework/astro` **0.4.0** the pack's skill routes to three more references:
MDX — when a page earns it over plain markdown, the `@astrojs/mdx` integration,
MDX inside a content collection; the image pipeline — `src/` versus `public/`,
`<Image>` and `getImage` from `astro:assets`, layout shift, and `sharp` as the
default service; and layouts and slots — the shell-versus-route split, named
slots, nesting, and layouts for collection entries. They are written once for
the pack and state each mode's difference inline — images is the one where the
four genuinely differ — so no bundle's composition changed.

**The doctrine above the pack is a contract.**
[`assets/contracts/web-head.md`](https://github.com/virajp/claude-plugins/blob/main/plugins/stackgen/assets/contracts/web-head.md)
states, provider-neutrally, what **any** web framework pack — shipped or
generated — must realize for a project declaring `site`, or `webapp` with the
`seo` capability: the head set, the icon sizes, the manifest, robots and
sitemap, and the icon task. Astro's conventions restate it by role and cite
nothing by path, which is what lets a framework pack that does not exist yet
satisfy the same bar. It sits beside the other cross-pack contracts —
`datastore`, `identity`, `local-stack`, `object-storage`, `observability`,
`orchestration`, `release-trigger`, `secrets`, `audit` and `workspace`.

**The build output is a named fact.** The `framework/astro` pack's conventions
carry a fixed `## Build output` heading stating that the build writes `./dist` —
Astro's `outDir` default — and that a deploy pack may rely on it. The two
Cloudflare deploy packs that upload an asset directory —
`cloud-service/workers-static-assets` and `cloud-service/workers-ssr` — cite
that heading from their `assets.directory`, which is what makes the seam between
the project axis and the deploy axis a written contract instead of a
coincidence. (`cloud-service/containers`, the third Cloudflare deploy pack,
ships no `assets` block at all: what it publishes is an image.) A repo that
changes `outDir` has changed that contract and has to change its deploy
configuration in the same commit; nothing detects the mismatch. The
`framework/html` pack carries the same heading, stating the same `./dist`, so
the deploy packs' citation holds for a site on either pack.

**Which deploy each pairs with.** SSG and CSR name `cloudflare-workers-static`,
the bundle they were built for — CSR flipping the host's not-found handling to
single-page-application mode so a deep link still serves the shell. SSR and
Hybrid pair with **any** supported deployment and name `cloudflare-workers-ssr`
first, then `gcp-cloud-run`, `gcp-gke` and `container-generic`; the adapter a
repo installs follows whichever pairing it picks. None of this is in frontmatter
— `artifact:` is deploy-only and the axes are pinned independently — so a bundle
names its pairing in prose and a project still pins the two axes separately.

> **`typescript-astro-react` is now `astro-ssr`.** The old slug shipped in
> `stackgen-v1.0.0` and is gone; a repo pinning it gets an unknown-slug error,
> which is the adapter refusing to guess. Re-point the `project` axis pin in
> `.config/vwf.yaml` and re-run `/vwf:doctor`. "TypeScript" left the display
> names because every one of the four pins the TypeScript language component
> anyway.

### Three stylesheet packs, on an axis of their own

How a web frontend's styles are authored is a **pin**, not something the
framework pack decides — so `astro-ssg` and an `astro-ssg-tailwind` sibling
never had to exist. Three packs answer the `stylesheet` axis, each its own
one-component bundle whose slug is the `projects.<name>.stylesheet` token:

| Bundle        | Is                                                                                   | Costs                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `tailwindcss` | utility classes generated from a token block, every style written at the call site   | markup carries the styling, nothing is type-checked, and the v4 line's CSS-first config reads no JS file |
| `stylex`      | typed style objects in the component's own language, compiled to atomic CSS at build | a build step and a bundler plugin registered in the right order; the most locked-in of the three         |
| `plain-css`   | the design system's roles as custom properties in one token module, rules in layers  | nothing checks anything, there is no deduplication, and the project must name a browser baseline         |

Each pack's `tokens.md` is required by the kind, because the mapping from the
design system's semantic roles to something a component can reference is the one
topic nothing else in the tree carries. None of them ships token **values** — a
pack shipping a palette would have replaced the product's contract with a
default — and none of them names a component library. An approach none of the
three covers takes the same `generate` door every other axis has.

## The dispatch rule

Given a bundle a project pins, stackgen resolves its composition and dispatches
**per component**:

1. **Pre-created pack first, per component.** Curated packs ship as stackgen
   assets under its `stacks/` tree — one pack per component, assets, not live
   skills, so installing stackgen floods no session with every stack's doctrine.
   A component a pack covers is **copied** from its pack into the repo — never
   generated.
2. **Generation only for what no pack covers, per uncovered component.** The
   first template fetch runs the pipeline for each uncovered component: resolve
   the **kind** and its topic bar → detect the real stack (manifests + the
   graphify graph) → one Context7 research pass per bar topic → instantiate
   vwf's principles catalog with citations → vet every concrete third-party name
   the component emits — packages, runner-invoked tools, GitHub Actions,
   container images — through `stackgen-reputation`, one verdict per name
   (`pass`, `warn`, `block`); a **`block` halts that component** with the
   verdict table and you name the replacement, which is checked in turn — the
   generator never swaps a name silently → the `stackgen-skill-reviewer` gate
   (capped at **four rounds**, after which residuals are reported rather than
   looped forever) → the same materialized tree, the verdict table shown whole
   beside the reviewer's verdict at the dry-run consent gate. Context7 or a
   reputation source unreachable → **halt, never guess**. When the bundle root
   itself is uncovered, the pin is `generated/<technology-slug>`.

Mixed compositions are the ordinary case — a covered language beside an
uncovered framework copies the language's packs and generates only the
framework's artifact — so a later re-sync can act on one component alone.

**The full pack and bundle inventory is generated from the tree** —
[`stacks/inventory.md`](https://github.com/virajp/claude-plugins/blob/main/plugins/stackgen/stacks/inventory.md),
never typed by hand and guarded against drift in pre-commit and CI. The packs
arrived in waves, starting with `dprint`, `gitleaks`, `grype` and `pre-commit` —
the `repo-gate` kind's components — and closing with `cloud-provider`, the last
kind that had been defined but never authored against, which the `cloudflare`
and `gcp` packs filled. Along the way three packs each deleted a curated *skill*
in the same commit, because the pack plus a neutral contract carry everything
that source said — `deploy-target/container-image` with
`assets/contracts/local-stack.md`, `capability-provider/doppler` with
`assets/contracts/secrets.md`, and `ci-system/github-actions` with
`assets/contracts/release-trigger.md`. The third was the first to retire not a
skill but a **whole plugin**: `cicd` was exactly one kind wearing a manifest.

The retirement wave then took the four that were left — `typescript`, `flutter`,
`gcp` and `cloudflare` — each once its doctrine had landed as packs. That
ordering is the no-skill-lost rule: a pack is the destination that must exist
*before* a plugin retires, never a replacement the moment it lands.

Four **framework** packs ship today, `effect`, `astro`, `cloudflare-agents` and
`html`; every other framework a bundle names is a `@generated` ref, which is the
generated path working as designed rather than a gap. `framework/astro` arrived
on 2026-09-06 as the second, and it is the pack all four bundles in
[the Astro example](#four-bundles-on-one-pack--the-astro-example) pin.
`framework/cloudflare-agents` arrived on 2026-09-06 as the third — the
Cloudflare Agents SDK, whose `Agent` class compiles to a Durable Object — and it
is the pack the `typescript-cloudflare-agents` bundle pins. `framework/html`
arrived on 2026-09-15 as the fourth, under a category minted for it, `document`
— a hand-authored page tree whose build, if any, is a bundler rather than a
framework — and it is the pack the `html` bundle pins, the `site` platform's one
entry beside the four Astro ones.

**Swift** arrived on 2026-09-23 as the fourth language a language-bundle is
rooted at, after TypeScript and the Markdown and Bash pair the
`claude-code-plugin` bundle composes: `swift-package`, a Swift library on the
`packages` platform, pins four new packs. `language/swift` is the root — the
12-topic doctrine, the sourcekit-lsp declaration, and `binaries: [swift]`, since
the toolchain is the host's rather than mise's and `/vwf:doctor` blocks when
`swift` is not on `PATH`. `package-manager/swiftpm` carries SwiftPM's doctrine
and lands no file; no pack lands `Package.swift`, which `swift package init`
creates. `toolchain-gate/swift-format` lands `.config/swift-format.json`, and
`toolchain-gate/swiftlint` lands `.config/swiftlint.yml` plus
`.config/mise/conf.d/swiftlint.toml`, which pins `aqua:realm/SwiftLint` at
0.65.1 so `mise.toml` names no linter; each ships an editor fragment on
`editor: vscode`. The `language/swift` pack supplies the tasks: `code:format`
takes the staged files the hook passes and otherwise, like `code:lint`, takes
its file list from git — every file it does not ignore, read NUL-separated and
passed `./`-prefixed, so no file name is read as a flag, and a failed
`git ls-files` stops the task with an error rather than judging an empty list;
with neither a `.git` entry nor `GIT_DIR`, or no git installed, both walk the
tree instead — and `code:lint` skips SwiftLint when no Swift source is in scope.
Of the `setup:deps:*` tasks, `install`, `outdated` and `upgrade` run
`swift package`; `cleanup` removes `.build/`, and `audit` is a stated no-op,
since SwiftPM ships no advisory command.

The `devtools` plugin then dissolved into stackgen and was deleted, closing the
marketplace at two plugins. Its mise doctrine and its file-based task library
became the `toolchain-manager/mise` pack, its four repo gates the `repo-gates`
bundle, and `/devtools:scaffold` stopped being a command at all: laying the
toolchain into a repo is a materialization now, like every other pack. Two kinds
were minted on the way — `toolchain-manager` and `workspace` — and packs gained
a fourth output target so one could write a repo's own config files. A third
kind, `repo-hygiene`, followed when that target widened to cover every gate's
config and the hygiene files, and `/vwf:init` arrived to lay them down.

The newest category is **`workspace`**, under `capability-provider`, minted on
2026-09-14 — and the first minted for something no blueprint chooses. The
workspace is where a team's docs, specs and tickets live, and it is the
**agent's** knowledge source rather than anything the product runs against, so
it realizes no vwf capability token and none is pending. Its neutral contract
(`assets/contracts/workspace.md`) states a permission shape rather than an
availability one: the person authenticates and not the repository, the agent's
reach stops where that person's does, and a write needs the person to ask for it
in the session. One pack realizes it — `notion` — and what it lands is **wiring
and nothing else**: an `mcp_servers:` entry the materializer writes into the
repo's own `.mcp.json` behind its own consent line, the second pack to use that
door after `claude-design`.

Before it came **`audit`**, under the same kind and minted the same day for
vwf's `audit-store` token — the append-only, access-controlled store the
operator console reads. It is deliberately *not* part of observability:
telemetry answers what the system did and may sample, drop and expire; an audit
store may do none of those, so it gets its own neutral contract
(`assets/contracts/audit.md`) and `assets/contracts/observability.md` dropped
the half-claim it used to carry, leaving a trace id as the only thing the two
share. Two packs realize it — `audit-store-d1` and `audit-store-postgres` — and
each **rides a datastore pack the product already runs** rather than composing
an engine of its own, so neither ships a migration and both declare
`local_stack: n/a`. What separates them is where the invariants are enforced:
real grants on one side, the code path holding the only binding on the other.

The newest **type** and the newest **kind** are both `stylesheet`, minted the
same day for an axis vwf had not had before — with three categories of their own
(`utility`, `compile-time`, `plain`, the three ways the token mapping can be
paid for) and three packs filling them at once. It is the first kind whose
single required artifact is named by the kind itself: every pack in it ships a
`tokens.md`.

The newest **design tool** is the terminal itself — `claude-code`, the fourth
`design-tool` pack beside `claude-design`, `lovable` and `stitch`, and the first
with a **file canvas**: there is no hosted server, no key and nothing written
into `.mcp.json`. The design system, the logo and a flow's screens are authored
in session, through the `taste-skill` plugin's design skills, into a committed
`docs/design/<project>/` — `design-system.md` in the shape that plugin authors,
`brand/logo.svg` and its variants, `screens/<flow>--<platform>/<CODE>.html` one
per pinned screen code with a stitched `index--<platform>.html`, and
`comments/<flow>--<platform>.yaml` — which the three fixed import skills read as
files. The pack ships a fourth, **user-invocable** skill beside them,
`design-session`, which runs those sessions; vwf never calls it. It declares
`taste-skill@taste-skill` as the plugin a product pinning it must add at init's
fifth question, so the repo's `setup:ai` installs it at project scope, and every
skill that needs it halts with one plain sentence when it is absent.

The review loop is four lines. `/design-session screens <flow>` authors the
pages from the brief `/vwf:screens prompt <flow>` wrote.
`/design-session review <flow>` serves them from the repo — a single-file Node
script with no dependencies, bound to `127.0.0.1` on an ephemeral port, no auth
and no TLS, a surface for one person on one machine — prints
`URL: http://127.0.0.1:<port>/screens/<flow>--<platform>/index--<platform>.html`,
and waits while you click an element, leave a comment and press **Done**. The
session then applies every `open` comment to its screen, marks it `applied`, and
lists what changed. `/vwf:screens import <flow>` diffs the reviewed screens
against the contract, and `/vwf:feedback canvas` sees whatever is still `open`.
The comments are **committed**: one YAML list per flow page, each item
`{ id, screen, selector, text, status, created_at, applied_at }` with
`applied_at: null` while open. Its bundle is the first to carry
**`default: true`** — the optional frontmatter key that marks the entry vwf's
architecture menu preselects on that axis, highlighted and never assumed, so a
product with no opinion on its design tool lands here and one with an opinion
picks another. The menu skill copies the key onto every entry whose bundle
carries it and computes none; at most one bundle per axis **per platform**
carries it — two flagged bundles on one axis conflict when either declares no
`platforms:` list or their lists intersect — and `p:plugins:check` refuses the
pair, naming both files and the platform they share. That is what lets
`astro-ssg` be flagged too, on the `project` axis for `site` alone, without
being preselected on any other platform's round.

**stackgen is now the only stack plugin.** Its packs are the covered path, and
the menu keeps its open `generate` entry for the rest — the stack you use that
nobody wrote a pack for.

## Kinds — what can be generated, and its shape

Every pack and generation run declares a **kind**, and the kind — not the run —
decides the output's structure and scope, so generated output is deterministic
in shape while only content varies:

| Kind                  | vwf axis               | Shape                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language-bundle`     | project (+ repo facts) | the composition rooted at a `language` component — a **12-topic bar** behind a lean router skill → on-demand references, plus paths-scoped doctrine per config file the toolchain owns (archetypes: the `language/typescript` bundle, and `swift-package` rooted at `language/swift`)                                                                                                                                                                                                                |
| `database`            | backing                | a **6-topic bar** on the instance component — pick & trade, data-model constraints, clause-by-clause satisfaction of the neutral datastore contract *by citation*, connection & access incl. credentials, cost shape, the Docker-composed `local_stack`                                                                                                                                                                                                                                              |
| `capability-provider` | backing                | the same two halves as `database` — the neutral capability contract plus one provider component that realizes it, citing rather than restating                                                                                                                                                                                                                                                                                                                                                       |
| `cloud-provider`      | backing + deploy       | **4 provider topics** (cost, IAM, local-dev map, networking & private plane) + **5 per `cloud-service` component**, plus a **deploy-target extension** — artifact/pipeline/health — where the service's category is `compute` or `static-hosting`, the two categories that are deploy targets (archetypes: the `cloud-provider/gcp` and `cloudflare-workers-static` bundles)                                                                                                                         |
| `repo-gate`           | repo                   | the `toolchain-gate` components that run over the whole repo, composed together. A **language-specific** linter or formatter appearing here is a gap — it belongs to that language's bundle                                                                                                                                                                                                                                                                                                          |
| `toolchain-manager`   | repo                   | **exactly one component, standing alone** — the thing that pins the repo's tools, holds the environment values they read, and runs its tasks. A **5-topic bar** behind a router skill: the config split, environment values, the task-library contract, the mandatory task set, and bootstrap/CI parity. A polyglot repo materializes it **once**                                                                                                                                                    |
| `repo-hygiene`        | repo                   | **exactly one component, standing alone** — the files every repo carries whatever wrote it. A **4-topic bar**, no router: the ignore set, the editor and attribute defaults, licensing and the security contact, and the dependency-update policy. Not a gate, and that is the distinction the kind holds: a gate *runs, finds something and fails*; hygiene runs nothing and *declares*. It also owns the **root allowlist** every other kind's `config/` tree is measured against                  |
| `workspace`           | repo                   | the `package-manager` component that installs and locks the repo's members, plus a `build-orchestrator` where there is one — a **5-topic bar**, no router. The only repo-axis kind you **pick**: it is what `repo.stack.template` selects from. A single-package repo pins none, which is the kind's edge rather than a gap                                                                                                                                                                          |
| `ci-system`           | cicd                   | the **release-trigger contract** + **exactly one** `ci-system` component, a **6-topic bar** behind a router skill with one reference per system. Three layers, none duplicated: vwf's delivery-pipeline rules say what a deploy must guarantee, the contract is the recommended mechanism above any one system, the component is how that system spells it. A second CI system in one bundle is a gap, not extra coverage                                                                            |
| `app-framework`       | project                | rooted at the SDK that owns the manifest and build, carrying its languages as members with a `role` — one `primary`, any number of `platform-edge` (archetype: the `app-framework/flutter` bundle)                                                                                                                                                                                                                                                                                                   |
| `deploy-target`       | deploy                 | **one component, standing alone** — the only bundle with no second half. A **6-topic bar** covering pick & trade, the artifact, hygiene, promotion, config/secrets and health. Its discipline is a scope fence: the pipeline, the cloud and the local stack each belong to a kind that already owns them                                                                                                                                                                                             |
| `design-tool`         | design                 | one component, standing alone — a **5-topic bar** on the three imports, reach & credentials, and the naming contract. Lands three skills at **fixed names** in the repo's `.claude/`, all mandatorily model-invocable, because a user-only one is invisible to vwf rather than a smaller feature. The tool's source may be a hosted canvas or a **committed directory** the imports read as files, and a pack may ship one extra, user-invocable authoring skill beyond the three the checker counts |
| `stylesheet`          | stylesheet             | one component, standing alone — a **7-topic bar** on tokens, authoring, theming, responsive, the single integration hook, performance and (conditionally) testing. `tokens.md` is required of every pack in the kind: the mapping from the design system's semantic roles to something a component can reference is the one topic nothing else in the tree carries                                                                                                                                   |

Every kind in that table is defined; no reservations are outstanding. Three of
the seven axes — `design`, `cicd` and `stylesheet` — are **tool axes**, where
the bundle slug is the token the project config already holds, so picking from
the menu and writing the config key are one act. Kinds compose through vwf's
capability vocabulary — a language bundle says "the datastore", never a database
by name — so each stays independently re-syncable.

Each kind's structure **is a topic bar**: a closed list of topics the output
must cover, one artifact per topic, lazy-loaded — a reference behind a lean
router skill, or a paths-scoped doctrine skill on the config file it governs. A
conditional topic the detected stack makes inapplicable is stated `n/a` with
why, never silently skipped. **No artifact carries a line cap.** A skill puts
only its description in context — its body loads on activation, a reference only
when something reads it — so length is not what costs; loading is, and lazy
hanging already pays that bill. A cap would only cap depth, pressuring research
to stop early. An artifact that has outgrown one sitting is decomposed into a
router skill plus on-demand references, never trimmed.

The **composition** covers the bar, whichever components supply each topic: the
language component owns standards, errors, async, testing, build and
config/observability wiring; the package-manager component owns the manifest and
workspace/supply-chain topics; toolchain-gate components own the compiler config
and lint/format gates; and each framework component supplies one usage reference
of its own.

The **framework ruling**: generation is selection-neutral and usage-opinionated
— it never opines on *which* framework (the pin and the packs own selection),
and every usage opinion traces to a source in precedence order: the repo's own
**detected** settled pattern, then the framework's **documented recommendation**
(cited), then a **catalog entry** instantiated (cited). A genuinely split
ecosystem choice with no detection signal is presented as an **open decision**
with real options — never fake consensus. Dependencies get no reference — a line
in manifest doctrine at most; frameworks are written against, dependencies are
looked up at use time.

## The output — `.claude/` first, and three targets beside it

The output vocabulary is **closed**: skills, agents, hooks (config + scripts),
and rules, all landing in the repo's own `.claude/` tree. Three things cannot be
`.claude/` files, and each is a separate target with its own consent line rather
than something that rides the landing:

- **An MCP server** goes into the project's own `.mcp.json`. It is genuinely a
  project file — collaborators should get it — and the alternative, a curated
  registry of servers, fails on scaling before it fails on charter: a list holds
  only what someone curated, and stackgen exists for the tail nobody did.
- **A language server** cannot be expressed by any project file at all —
  `lspServers` is a plugin-manifest feature — so the one way to provide one is
  to *be* a plugin. stackgen writes a small local plugin at the fixed path
  `~/.claude/plugins/local/stackgen-lsp/`, holding the union of what every repo
  you have materialized from contributed, and **prints the two registration
  commands rather than running them**.
- **A repo's own config files** belong to the repo, not to `.claude/`. A pack
  that owns some — the toolchain manager owns the `mise.*.toml` layers and the
  task library under `.config/mise/tasks/`; a gate owns its own config file; the
  hygiene pack owns most of the root files; a provider drops an env fragment
  into `.config/mise/conf.d/` and a hook fragment into `.config/pre-commit.d/`;
  a deploy target owns the root config its own tool reads, which is how
  `cloud-service/workers-static-assets`, `cloud-service/workers-ssr` and
  `cloud-service/containers` each ship a `wrangler.jsonc` and the
  `p:<id>:deploy` task beside it; and any pack may drop an **editor fragment**
  into `.config/vscode.d/`, three keys wide, which `/vwf:init` composes —
  declares them in a `config/` tree mirroring the repo root, and they land
  there. A pack may also mark some of them **conditional**: an optional
  `conditional:` list in its `pack.yaml`, each entry a `config/` path or glob
  and a `when:` of one axis to one value — `forge` (`github`, `gitlab`),
  `editor` (`vscode`), `secrets` (a provider slug), `update_bot` (`renovate`,
  `dependabot`, `none`) — evaluated by the materializer against the `answers:`
  map the caller passes beside `repo:`; a path whose answer differs is left out
  of the landing set and written to the lockfile's `skipped:` list with its
  condition, never a create and never a conflict, and an axis the caller did not
  answer reads true. That last rule is a **fallback**, not the path anything
  here takes: all three callers — `/vwf:init`, `/vwf:setup`'s materialize pass
  and `/stackgen:stackgen-sync` — pass a full map, read from the product's
  `.config/vwf.yaml` `answers:` block with the forge re-read live from the
  repo's `origin`. A pack's `skipped:` rows live and die with its `entries:`, so
  removing or un-pinning the pack drops them too. Everything else goes under
  `.config/`: a `config/` tree landing a root path outside the **landable** tier
  of the fixed allowlist is a pack authoring error the materializer refuses —
  that list also names the root files vwf itself writes, `CLAUDE.md` and
  `mempalace.yaml`, which may sit at a shaped root and which no pack may land.
  Two **directories** are allowlisted at that root, `.config/` and `.github/`,
  and a CI workflow inside the second is refused outright. Mode is preserved,
  because a task file arriving without its exec bit fails as an *unknown task*
  rather than as a permission error.

The need still travels as `language_facts` in the template payload for
`/vwf:doctor` to verify; the local plugin is what actually provides the server.
Its scope is `user`, so **your collaborators get none of it** — a teammate's
language server is their machine's business, the same line your editor already
draws, and what user scope buys is one registration serving every repo instead
of a per-repo obligation nobody maintains. What makes that safe is the
`extensionToLanguage` map every generated declaration must carry: a repo with no
matching files never starts the server, and a declaration without a map is
forbidden outright.

```text
.claude/
├── skills/  agents/  hooks/  rules/   # the artifacts, auto-discovered
└── stackgen/                          # bookkeeping, not discovered
    ├── lock.yaml                      # one entry per path, per component
    ├── templates/<slug>.md            # payload (incl. components:) + prose
    └── citations/<component>.yaml     # sources per component, keyed by topic
```

**Repo-owned means:** committed, editable by the project, and working for every
collaborator with no plugin installed. **Three consent tiers** guard a landing:

1. The `.claude/` file set is a dry-run plan you approve — every path listed,
   nothing written unapproved.
2. **`.claude/settings.json`, `.mcp.json` and a pack's `config/` tree are never
   written without your explicit, separate consent**, each as its own line in
   the gate. A hook script can land while its wiring is declined (it stays
   inert, and the plan says so); a declined MCP wiring leaves the skills landed
   and says the tool will be unreachable; a declined config write leaves the
   skills landed and says the tasks will be absent.
3. **The local plugin gets a larger gate still** — writing outside the repo and
   registering with a user-scoped tool is a bigger act than editing a project
   file — split into two separately declinable items: the manifest write, and
   the registration. Declining the registration leaves a valid plugin directory
   nobody has installed, and prints the two commands for later.

Every target **merges, never owns**: the keys stackgen added are recorded in the
lockfile, so sync and removal touch only those, and removal of the local plugin
is **by subtraction** — another repo's contributions to the union stay, and the
directory and its registration go only when the last key does. Hook *scripts*
come only from curated packs; generation never emits an executable.

**A pack may still need repo files the materializer will not write.** The
`config/` tree is what a pack *owns*, and the fence around it is still real,
just drawn further out. Gate and provider configs came inside it on 2026-09-05,
and so did a deploy target's own config and its `p:<id>:deploy` task, the same
day; **four things stay out, enumerated rather than left to judgment** — a
language manifest and its lockfile (a manifest is the project's own declaration
of what it is), CI workflow files (a pack states which task names CI must run;
the workflow is the repo's), a **whole editor file** (it is composed from every
pack's slice, so it belongs to no single one), and `CLAUDE.md` (vwf's, out of
scope outright). Charters ratchet, which is why they are a list: each file the
tier absorbs makes the argument for the next one easier, and "gate configs went
in, so why not the manifest" is the argument that list exists to answer.

The third of those was narrowed on 2026-09-06 rather than dropped, and the
narrowing is worth reading precisely: **whole editor files stay outside,
per-pack fragments come inside**. A pack ships `.config/vscode.d/<pack>.jsonc`
carrying exactly three keys — `settings`, an object; `nesting`, a map of a
parent file name to its children; and `extensions`, a list of recommended ids —
and nothing else. What forced it is that a recommendation list only ever
*prompts*, is per-workspace, and nothing merges a common set into it: a pack
that ships a linter and says nothing about the editor ships a linter whose
editor integration nobody turns on. Every fragment in the tree — twelve of them:
the hygiene baseline, dprint-editor, pre-commit, eslint, ruff, tsconfig,
analysis-options, mise, astro, pnpm, swift-format and swiftlint — is
**conditional on the editor**: its pack's `pack.yaml` names it under
`when: { editor: vscode }`, so a repo whose init answer was *no* lands none and
composes nothing. The split between them is by ownership. The hygiene baseline
carries **editor-wide keys alone** — indentation and suggestion defaults, the
generic excludes, todo-tree, the nesting rows no stack owns, the generic
extensions — and every key that names a stack sits in the fragment of the pack
that pins it: `node_modules`, the tsbuildinfo files, the template-string
converter and `*.js` nesting in tsconfig's; `.dart_tool` in analysis-options';
`.astro` in astro's; `.turbo`, the pnpm lockfile and the `package.json` children
in pnpm's, since Turbo is a generated component the pnpm-turbo bundle carries
and has no pack of its own; `.build`, `.swiftpm` and the `Package.swift` nesting
in swift-format's; the YAML language-server keys and their extension in
pre-commit's. The default formatter is bound **per language** in the dprint
fragment — one `[<language>]` scope for each plugin `.config/dprint.json`
carries, `[toml]` to even-better-toml — never editor-wide, which would ask
dprint to format a file it has no plugin for and override Dart's formatter by
composition order alone.

Two files inside the fence are written **whole** by no pack, and both are
composed by `/vwf:init`. The **pre-commit config**: a pack may contribute a
`pre-commit.d/` fragment, and init concatenates them between markers — though a
fragment is for a **non-gate** check only, since every gate tool is now reached
through a `code:*` task the base config already calls, and only
`package-manager/uv` still ships one. The **two editor files**: init deep-merges
every `vscode.d/` fragment's `settings`, unions the `nesting` children per
parent and the `extensions` list, and writes one marked block **first** in each
file. A key you already carry outside the block is a **collision**: the block
**omits** it, so your key wins without the file ever holding a duplicate, and
what becomes of it — keep mine, take the pack's, or union — is asked once by
init and recorded, an identical extension id simply kept; everything outside the
block survives a second merge byte-for-byte unless you chose otherwise for that
key. Nothing in stackgen edits either composed file, which is what keeps a
fragment a fragment.

One root file is a **shim** rather than a config: `dprint.json`, whose entire
content is `{ "extends": ".config/dprint.json" }`. That formatter's config
discovery is root-only and `--config` is its only override, so the choice was a
two-line root file or a flag every caller has to remember — the same exception
`eslint.config.mjs`, `wrangler.jsonc`, `.npmrc` and `.graphifyignore` already
are. On an existing repo `/vwf:init` **moves** a real root `dprint.json` into
`.config/` and leaves the shim in its place, telling the two apart by content
rather than by name, and says in the plan that the settings survive the move. So
a pack whose correctness depends on a repo-wide edit it genuinely does not own —
a scanner allowlist, a `.gitignore` block, a mining exclude — carries that edit
as a literal block in the reference that owns it, and ships a gate that fails
the first commit naming whichever block is missing. `capability-provider/fnox`
is the first: three of the four conditions the secrets contract's
encrypt-into-git allowance sets sit outside the boundary, and its
`fnox-ciphertext-guard.sh` is the first hook script any pack ships.

The **lockfile** is the ownership boundary: `.claude/` also holds your own
hand-written skills, so sync diffs only what the lockfile lists — anything else
is invisible to every stackgen write path. Each entry carries the component and
source it came from (`pack/<type>/<slug>@<version>` or `generated`), which is
the grain sync acts at — one framework's bump never churns the language
component beside it. **CLAUDE.md is vwf's domain**: stackgen never edits it, and
ends a materialization by recommending `/vwf:setup`.

`templates/<slug>.md` is what makes later fetches pure reads: frontmatter
carries every payload field (kind, axis, the `components:` refs this bundle
composes — `<type>/<slug>@<version>` or `@generated` — languages **with the
facts `/vwf:doctor` verifies** — LSP provision, mise tool, manifest, and the
optional `binaries` list of executables the stack needs on `PATH` that mise does
not manage, such as Xcode's `xcodebuild` — plus harness tasks and mechanisms,
with `frameworks`/`capabilities` derived from the composition), and the body is
the `conventions:` prose `plan` sizes against and `execute` writes to. That
emitted-facts block is the **materialized escape** in vwf's stack vocabulary: a
language no shipped bundle covers is still *known* when its pin carries these
facts.

In a multi-repo product the target repo defaults to the current one; the caller
names a member repo to materialize there instead, as one optional `repo: <path>`
line beside the principles-catalog paths — the member's path relative to the
base repo root. vwf is what resolves it, and under `topology: multi-repo` every
vwf caller passes it. Each repo gets independent copies and its own lockfile, so
two members pinning the same slug hold two independent materializations.

## The repo baseline — mise, the gates and the hygiene files

Three bundles are **unconditional**: `stackgen-stack-menu` leaves them out of
the payload it returns, and [`/vwf:init`](./vwf.md#vwfinit) fetches them by
their fixed slugs, `mise`, `repo-gates` and `repo-hygiene`. Nothing is recorded
in `.config/vwf.yaml` for any of them — nothing was chosen, so there is no
choice to record — and the landing goes in `lock.yaml` like any other
materialization. All three slugs present in that lockfile is what "this repo is
shaped" means: `/vwf:setup` no longer fetches them, it checks for exactly that
and offers `/vwf:init` when one is missing — or when the shape has drifted. On a
multi-repo product it checks **every repo**, the base and every member present
on this machine, and one repo missing a slug or behind its baseline is enough to
make the offer; `init` then fetches the three into every repo it resolved, each
with its own lockfile.

They are unconditional because a repo that has picked no stack yet still needs a
formatter, a secret scanner, a vulnerability scanner, an ignore set, and a way
to run them by name. Left to the menu, "no stack chosen" and "this repo has no
gates" would be the same state and nothing would tell them apart. None of the
three needs a project axis or any stack knowledge, so all three materialize onto
a blank repo.

**`repo-gates`** composes the four gates that run over the whole repository:
**dprint** as the single formatter, **gitleaks** the secret scanner, **grype**
the dependency vulnerability scanner, and **pre-commit** the local gate that
runs them. Nothing there is language-specific — ESLint is JS/TS-only, so it is a
topic of the TypeScript language bundle rather than a repo gate. Getting that
backwards is how a polyglot repo ends up with three secret scanners, one per
language. Each of those four packs now ships **its own config file** under
`.config/` and a `vscode.d/` editor fragment. None of them ships a
`pre-commit.d/` fragment any more: the gate config carries three tool-neutral
hooks — `format`, `lint`, `sec` — that call `code:format`, `code:lint` and
`code:sec`, and each tool is configured once, inside the task. Both scanners
document the same **baseline step for an existing repo**: run the scan, fix what
can be fixed — rotate a real secret, upgrade a dependency — and record what
remains, a gitleaks finding by fingerprint in the allowlist, a grype
vulnerability id under `ignore:` in `.config/grype.yaml`, each with a one-line
reason and when to re-check, then re-run until green. The thresholds stay where
they are: a time-boxed ignore is the temporary silence, a lowered threshold the
permanent one. The formatter also ships the root `dprint.json` shim described
above, and the JS/TS linter gate — a language-bundle topic rather than a repo
gate — ships `.config/linter.yaml`, the config it had always invoked and never
supplied. The trees a gate skips are stated as **one exclusion set**: the
formatter's `dprint.json` and `taplo.toml` and the hook config's global
`exclude` — a `(?x)` block, one anchored alternative per line — spell the same
fourteen entries (`.build`, `.claude`, `.git`, `.turbo`, `.venv`, `Derived`,
`build`, `dist`, `graphify-out`, `node_modules`, `target` and the three lockfile
globs; `.build` and `Derived` are SwiftPM's and Tuist's output trees) in their
own syntax, and the toolkit's checker holds the three equal after normalising
the syntax away. The secret scanner's `[allowlist] paths` is held to a
**subset** of it, never the reverse: gitleaks extends upstream's default config,
which already skips `.git`, `node_modules` and the named lockfiles, and
`.claude/` is authored source a scanner must scan even though no formatter
touches it in a shaped repo, where it is machine-owned. Its seven entries are
anchored `(^|/)` — `.turbo/` joined them — so `\.turbo/` no longer matches a
`foo.turbo.ts`. Widen a formatter list, widen all three; widen the allowlist
only with a generated tree. One hook narrows further: `trailing-whitespace`
skips `.md`, because two trailing spaces are a Markdown hard break.

**`repo-hygiene`** is the newest kind on the repo axis, beside `repo-gate`,
`toolchain-manager` and `workspace`. Its single pack ships the files every repo
needs and no tool owns: a sectioned `.gitignore` (with a graphify section that
ignores `graphify-out/*` while keeping `GRAPH_REPORT.md`, plus one upstream
template section per language `/vwf:init`'s stack read finds — a table keyed by
language, `node`, `python`, `dart`, `go`, `rust`, `swift` (whose section also
ignores Tuist's `Derived/` on a Tuist app) — so a repo with a `package.json`
gets its Node section on the first run — and one **provider row** beside the
language rows, `fnox.local.toml` for fnox and `.doppler/` for doppler, appended
under a banner named for the slug only where init's stack read carries that
provider, so the base ignore file names no secrets manager), `.graphifyignore`,
`.editorconfig`, `.gitattributes`, `SECURITY.md`, `CONTRIBUTING.md`, three
`.github/ISSUE_TEMPLATE/` files, a root `renovate.json`, the chosen `LICENSE` on
a repo `/vwf:init` was told is public, and the **editor baseline** — the
`vscode.d/` fragment carrying the settings every repo wants regardless of stack,
editor-wide keys alone, since a key that names a stack belongs to that stack's
pack. Three of those are **conditional**, named in the pack's `conditional:`
list with the one answer init already holds that lands them: the issue forms on
`forge: github`, the Renovate policy on `update_bot: renovate`, the editor
baseline on `editor: vscode`. A GitLab repo gets no GitHub issue forms, a
Dependabot repo no Renovate policy, a repo edited elsewhere no VS Code fragment;
each skipped path is listed in the plan and recorded in the lockfile, never
reported missing. Init also **records** the four answers in the product's
`.config/vwf.yaml`, so the later callers judge the same conditions the same way.

The seam with `repo-gates` is worth stating, because it is the reason the kind
exists rather than folding in: **a gate scans, while hygiene declares what is
not there to scan.** Ignoring a file and allowlisting it in a scanner are two
different decisions, and a secret that is ignored is still a secret nothing ever
scanned — writing them as one act is how that gets missed. Two consequences
follow. The licence texts live under `config/_licenses/` as a **pack-private**
payload that is never copied wholesale: a repo gets the one licence it chose,
not a directory of them — and a repo init was told is **private** gets none,
since a grant to the public has no reader there. `SECURITY.md`'s one contact
slot takes the security contact as init was given it — an advisories URL for a
public repo, an email or an internal URL for a private one — and the issue
chooser's *Report a vulnerability* link takes a URL contact or is removed for an
email or a decline. `CONTRIBUTING.md` records that the forge's default branch
and the protection on `develop` and `main` are set by `/vwf:setup`'s forge pass
on GitHub and GitLab, and keeps the **by-hand** form of both for any other
forge. And the stack-specific ignore sections are **appended per repo** by
`/vwf:init`, one section per technology, never frozen into the pack — a pack
that hard-codes them ages the moment a language renames its build directory. A
repo that already has a `.gitignore` keeps it whole: `/vwf:init` merges
**section by section**, appending each banner section of the base and of the
stack whose patterns are not already present, patterns compared normalised (a
leading or trailing `/` stripped, a `**/` prefix ignored) so one the file
carries under another spelling is never doubled. `renovate.json` is the one
hygiene file that **yields**: a policy the repo already carries under
`.github/renovate.json`, `.renovaterc` or `renovate.json` wins, and the pack's
is not landed — and it is conditional besides, landing only where the repo's
update-bot answer is `renovate`, so a repo on Dependabot or on no bot gets no
second policy beside its own.

**`mise`** is the toolchain manager, and the rest of this section is its
subject: how the toolchain is pinned, where env values live, and the task
library everything else runs through. It lands as a `config/` tree — the config
files and the task library itself — plus a paths-scoped doctrine skill.

### The five-file split

mise config lives under `.config/`, where mise resolves `MISE_ENV` variants. A
repo splits its config across five files, four of which the pack ships. mise
loads `mise.toml` first, then deep-merges the active `MISE_ENV` variants on top,
then the local file last of all — so each variant holds only deltas, never a
copy of the base. Never duplicate a tool or setting across files; put it in the
lowest layer that needs it.

| File              | Loads when          | Holds                                                                         |
| ----------------- | ------------------- | ----------------------------------------------------------------------------- |
| `mise.toml`       | always (every env)  | shared `[settings]`, runtime `[tools]`, common `[env]`, `[tasks.init]`        |
| `mise.dev.toml`   | `MISE_ENV=dev`      | dev-only tooling, shell aliases, local/dev env values                         |
| `mise.ci.toml`    | `MISE_ENV=ci`       | CI/production-only settings + tools, the node-gpg workaround, prod env values |
| `mise.test.toml`  | `MISE_ENV=dev,test` | test deltas, layered on top of dev — never selected alone                     |
| `mise.local.toml` | always, last        | this machine's overrides — **never committed**, and never shipped             |

Selecting the environment:

- **Developers** export `MISE_ENV=dev` in their shell, so the dev toolchain and
  local env values load automatically.
- **CI/CD pipelines and production runtimes** set `MISE_ENV=ci`, so the CI/prod
  overrides apply.
- `MISE_ENV` is a **comma list and the last entry wins**, which is what makes
  `MISE_ENV=dev,test` a delta on dev rather than a fourth full config.
- With `MISE_ENV` unset, only `mise.toml` loads — the minimal, portable base.

A repo with no CI/CD, no deploy target and no separate test environment needs
only `mise.toml`. The others cost nothing empty and are shipped anyway, so the
answer to "where does this go" never requires creating a file first.
`mise.local.toml` is the exception: it is gitignored by the hygiene pack and
documented in `mise.toml`'s banner, never written for you.

**Three of the base `[settings]` are worth naming**, because each answers a
failure people hit rather than a preference: `all_compile = false` never builds
a tool from source, so a missing prebuilt binary fails loudly instead of
starting a long compile nobody asked for; `task.timings = true` prints elapsed
time after each task; and `task.disable_spec_from_run_scripts = true` makes a
task's flags come from its `#USAGE` header alone, rather than being inferred
from the script it runs.

**The lockfiles are tracked, and there is one per config that declares tools.**
`lockfile = true` in the base makes `mise install` record what each fuzzy pin
resolved to, in a file named after the declaring config's stem. With the split
as shipped — an empty base `[tools]`, the dev tooling in `mise.dev.toml` — the
only file produced is `.config/mise.dev.lock`; a runtime pinned in `mise.toml`
would add `mise.lock` beside it. `locked = true` in `mise.ci.toml` is what makes
the pipeline a reader of what a laptop resolved rather than a resolver of its
own. Only `mise.local.lock` is ignored, matching its config. (Every pack doc
used to say "`mise.lock`, committed", singular; the per-config rule is what
`mise install` actually does, measured.)

A path beside them is not part of the five-file count:
`.config/mise/conf.d/<pack>.toml`, a directory mise auto-loads, where a secrets
provider contributes its own `[env]` — and the package manager its `npx` alias —
without any component editing `mise.toml`.

`mise.toml` carries the language **runtime only** in `[tools]`. Formatters,
linters, security scanners, and other dev tooling belong in `mise.dev.toml`, so
a fresh checkout or a CI build does not pull them. `[tasks.init]` is the
exception that lives in the base: file-based tasks must be executable under
`MISE_ENV=ci` too. The runtime's settings are a **marked position** the base
ships empty: `RUNTIME_BLOCK` under `[settings]` and `PATH_ENTRIES` at the end of
`[env]` are filled by `/vwf:init` from its stack read — one runtime settings
line per detected language, the `_.path` entry where a project-local binary
directory needs it — and left empty for a language the repo does not have, since
a setting for an absent runtime is a claim about the stack that is not true.
With `REPO_NAME`, `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN` and `MEMBERS` they
are the base's six marked positions.

`mise.dev.toml` holds the **local values** of runtime env vars (verbose logging,
local hosts, test credentials). `mise.ci.toml` carries the **production values**
of those same keys. Dev and prod differ only in value, not in variable name.

### CI node-gpg workaround

For any **Node** project, `mise.ci.toml` must set:

```toml
[settings]
node.gpg_verify = false
```

CI runs on Linux, where mise's bundled Node release-key gpg import can fail with
"no valid OpenPGP data found". This disables **only** Node's signature check —
the tarball is still SHA256-verified. Keep the general `gpg_verify = true` in
`mise.toml` intact.

### The task library

Once tasks grow past one-liners, drive everything through executable task files
under `.config/mise/tasks/`. mise turns nested directories into colon-separated
names: `.config/mise/tasks/code/format` becomes `mise run code:format`. List
them with `mise tasks`. Reserve `[tasks.*]` toml entries for trivial run-strings
and `depends` aggregations.

**Three groups, and every task is in exactly one.** `setup:*` is bootstrap and
re-sync — what a machine runs to be able to work here at all. `code:*` is what a
*change* runs through: the quality gates and the git operations. `p:<id>:*` is
one project's own commands. The first two are a **contract** whose names are
identical on every repo, because those names are what the rest of the toolkit
invokes by hand; `p:*` is the opposite, and every name in it is the repo's own.

Every repo ships the same mandatory set. The contract — helpers,
`#MISE`/`#USAGE` headers, flags — is identical across stacks; only the commands
inside `code/*` and `setup/*` change with the tech stack.

- **`code/*` — what a change runs through.** `code/format`, `code/lint`,
  `code/sec`, `code/precommit`, `code/git-config`, `code/worktrees`,
  `code/count`, `code/merge/develop`, `code/merge/main`, and the `code/all`
  aggregator (`format` → `lint` → `sec`). `code:all` is the one-command gate;
  `precommit` and `git-config` are wired into the pre-commit hooks and `setup`,
  not into `code:all`. The three gate tasks take an **optional file list** —
  `code:format [--fix] [files...]`, `code:lint [--fix] [files...]`,
  `code:sec [--staged]` — empty meaning the whole tree, and the pre-commit hooks
  call **them** rather than the tools they wrap: `format` and `lint` pass the
  staged filenames, `sec` passes `--staged` and lets gitleaks read the index. A
  repo customising a gate edits the task, never the hook, so every tool is
  configured exactly once. `code:sec` needs scanners from `mise.dev.toml` — run
  it under the dev toolchain (`MISE_ENV=dev`). Its full scan skips a `.env` file
  through a throwaway overlay of the gitleaks config, for the `dir` scan alone —
  the shipped `gitleaks.toml` stays strict, so a `.env` someone stages is still
  caught — and a grype failure prints the remedy: the finding's vulnerability id
  under `ignore:` in `.config/grype.yaml` with a one-line reason.
  **`code:git-config` requires the forge identity, per repo**: the local
  git-config must carry `user.name`, `user.email` and `user.signingkey` equal to
  `GITHUB_USER_NAME`, `GITHUB_EMAIL` and `GITHUB_SIGNING_KEY` when the origin
  host is `github.com` or a subdomain of it, the `GITLAB_` twins for
  `gitlab.com`, and the `GIT_` twins for any other host or no remote — with
  ssh-signed commits and tags and no `gpg.program` or `gpg.ssh.program`.
  `--fix`, which the hook runs, writes those keys from the variables, refuses
  before writing anything when one is unset, and exits 1 after a change
  (*identity corrected — re-run the commit*), because git reads its identity
  before a hook runs: the first commit on a fresh clone is refused while the
  identity is written, and the re-run carries it. Export the three variables
  where the hook can see them — the global mise `[env]` block is the one place a
  GUI git client that never sources your shell profile still picks up, since the
  hook runs under `mise x`. `code:count` is a size reading rather than a metric:
  lines of **tracked** text grouped by extension, which is the whole ignore
  story for free — no build output, no vendored tree, and no second exclusion
  list to keep in step with `.gitignore`.
- **`code/merge/*` — landing, with the predicates first.**
  `code:merge:develop <branch>` refuses a source that is `main` or `develop`,
  refuses a **destination branch that does not exist locally** — naming the
  two-branch model, asked up front so a repo whose branches were never laid out
  fails in one command instead of after the whole-tree hook pass with nothing
  restored — refuses an unclean tree, and runs the pre-commit safety net,
  **failing if it changed anything**. `code:merge:main` is the same sequence
  with one extra predicate: the source must be `develop`. A conflict leaves the
  tree mid-merge on purpose. (These were `merge:develop` and `merge:main`; a
  merge is one more thing a change runs through, like the gates.)
- **`MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN` — what "land it" means on each
  branch.** What the merge tasks do *after* the predicates is set **per
  destination branch** — two marked positions in `mise.toml`'s `[env]` that
  `/vwf:init` fills: `MERGE_MODEL_DEVELOP`, which `code:merge:develop` reads and
  which ships `direct`, and `MERGE_MODEL_MAIN`, which `code:merge:main` reads
  and which ships `pr`. A destination whose position is unset reads as `direct`;
  a file shaped before the pair existed still carries the single legacy
  `MERGE_MODEL`, which the merge reads in place of whichever position is unset —
  both, on such a file — with one warning naming it legacy, so a landing never
  fails on an old file and the reshape that writes the pair is not forgotten.
  Under **`direct`** the task hops to the main worktree, checks out the
  destination, `git merge --no-ff` and `git push --follow-tags` — today's
  behaviour, and the one mode that also refuses unpushed commits on the source.
  Under **`pr`** nothing merges locally: the task pushes the branch with
  `--follow-tags` and opens a pull request through whichever forge CLI is on
  PATH (`gh` first, then `glab`), printing the branch and one "open the request
  on your forge" line where neither is. Repo-level values rather than flags,
  because which one applies is a property of the repo's review policy, not of
  the person landing the change; and one per branch rather than one per repo,
  because `develop` and `main` carry different review policies more often than
  the same one — a solo repo that merges into `develop` locally still wants a
  request as the record of what reached `main`.
- **`setup/*` — bootstrap & upgrade.** `setup:all` is the entrypoint — run it on
  clone and to re-sync. It calls `setup:mise`, `setup:secrets`,
  `setup:external:start`, `setup:deps:all`, `setup:precommit`, `setup:ai` and
  `setup:vscode` in order, and stays idempotent. **It never upgrades or
  overwrites anything it did not create**: a pack task that would have to stops,
  names what it found and prints the by-hand command, and every destructive step
  sits behind a flag `setup:all` never passes. `setup:mise --upgrade` is what
  runs `mise upgrade --local` and `dprint config update`, moving the tool pins
  the lockfile records; `setup:precommit --update` is what runs
  `pre-commit autoupdate`, moving the hook `rev:` lines; and
  `setup:precommit --force` is what takes the hooks over from a **local**
  `core.hooksPath`, a `.husky/` directory or a lefthook config, installing with
  `--overwrite`. Without it `setup:precommit` refuses, prints the unset and the
  install to run by hand plus the cleanup (delete the foreign files and drop a
  husky `prepare` script — the task deletes nothing), and exits 1 — which halts
  `setup:all` there on a brownfield clone until that cleanup is done, since the
  orchestrator stops at a failing step. A `core.hooksPath` set in a global or
  system git-config is named by scope and refused even under `--force`. A plain
  install keeps a hand-written hook script as `.legacy` and chains it, and a
  repo pre-commit already owns is never refused. `setup:ai` installs and
  reconciles the repo's agent plugins; it is bootstrap and re-sync like every
  other step here, which is why it is a `setup:*` task and not a gate. It drives
  **Claude's own `claude plugin` commands and nothing else** — no package
  runner, no wrapper CLI — and it checks before it writes: a marketplace already
  registered under a name is *updated*, whatever source it was registered from,
  and only one that is absent is *added*. That one rule is what makes the task
  behave identically on a machine pointed at the published marketplace and on
  one pointed at a local checkout of it, which a wrapper with a hardcoded source
  cannot do. Scope is **project** by default, because the plugin set is the
  repo's: it installs or updates each required plugin at that scope, prunes with
  `autoremove` at that scope alone, and never installs, updates or removes a
  user-scope plugin — `--user` is the flag for the rare repo that wants the
  other scope, and it flips every one of those. Two **marked positions** —
  further marketplaces, and the plugins to install from them — carry whatever
  the repo needs beyond the workflow plugin, which the task installs
  unconditionally with its dependencies; `/vwf:init` fills them from one
  confirmed answer, seeded by the task's own **`--inventory`** mode, which
  prints what this machine already has — one line per registered marketplace
  **other than the toolkit's own**, then one line per installed plugin with its
  marketplace and its scope — and exits, printing nothing else on stdout. It is
  a seed for the question, not a paste buffer: a marketplace row is already in
  the shape its position takes, while a plugin row carries a trailing scope
  field that position does not. After the plugins it wires **graphify** where
  the CLI is on PATH (and says what to install where it is not, since vwf treats
  a missing graph as blocking), and prints the statusline package's
  `brew install` line as a hint when `claude-status` is absent — hinted, never
  installed, because that is a per-machine package and not the repo's to place.
  The official marketplace is never added: it ships with Claude Code. `--all`
  recurses into every **member**, which `_scripts/helpers`' `members()` answers
  for under either multi-repo linkage — the repo's submodules where
  `.gitmodules` exists, else the paths listed in the `MEMBERS` env value — and
  one `--<slug>` flag per **member repo** is generated from that same list,
  named for the member and never for a project id: a member holding three
  projects is still one flag. `code:worktrees` reads the same helper, so the two
  never disagree about what a member is. Alias it as `setup`.
- **`setup/vscode` — the repo's editor profile**, and `setup:all`'s last step.
  It reads the recommendation ids out of the editor file `/vwf:init` composed
  from every pack's fragment and makes a profile named `$REPO_NAME` match:
  install what is listed and missing, **uninstall what is installed there and no
  longer listed**. A per-repo profile rather than a global install, because
  accepting a recommendation installs globally and a repo worked on for a week
  otherwise leaves its whole toolchain enabled in every window forever — and
  because pruning globally would take a neighbouring repo's tools with it. It is
  silent on a machine without the editor. The first run on a repo prints one
  create-the-profile command and the share-settings step and exits 0: the
  profile flag combines with the install, uninstall and list flags only once the
  profile exists, and none of the three creates it.
- **Nothing in the set edits a remote's settings.** There was a
  `setup:default-branch` once; it is gone, and no task re-runs it. The forge's
  default branch and the protection on `develop` and `main` are set by
  `/vwf:init`'s **forge pass** on GitHub and GitLab, on its own consent, through
  the forge CLI rather than a task; the `repo-hygiene` pack's `CONTRIBUTING.md`
  keeps the by-hand form for any other forge —
  `gh repo edit --default-branch <branch>` or
  `glab repo update --defaultBranch <branch>`, and the two protection rules. It
  is orthogonal to the merge tasks either way: work flows feature → `develop` →
  `main` whichever branch the forge calls default.
- **`setup/deps/*` — the package manager, and only that.** Five verbs, all five
  slots: `cleanup`, `install` (which honours `--frozen`, the lockfile-strict
  mode CI uses), `upgrade`, `outdated`, `audit`. `setup:deps:all` runs them in
  that order, and a manager missing one leaves its slot printing the placeholder
  notice. `update` split into `upgrade` because the one word read as both
  install-and-refresh. **The task path carries no tool name** — `setup:pnpm:*`,
  `setup:uv:*`, `setup:app:*` and `setup:doppler` are gone, so the contract
  reads the same on every stack.
- **`setup/external/*` — services, and optional.** Emulators, containers, local
  queues, under `pull` / `start` / `stop`. A repo that runs against none gets
  placeholder slots that announce themselves and exit 0, so `setup:all` runs end
  to end regardless.
- **`setup/worktree`.** The lighter sibling of `setup:all` for a fresh worktree
  — submodules, mise, `setup:secrets`, `setup:deps:install --frozen`. vwf's
  git-workflow probes for it by name before falling back to `setup:all`. (It was
  `worktree:init`; `worktree:` was a group of one, and this is a bootstrap.)
- **Several tasks ship as slots.** `code/lint`, `setup/secrets`, every
  `setup/deps/*` and every `setup/external/*` carry a `#PLACEHOLDER` marker: the
  task name is the contract, the mechanism comes from whichever stack the repo
  pins. Running one prints every unconfigured task in the repo and **exits 0**,
  so `code:all` and `setup:all` work end to end before any stack is chosen.
  `code/format` and `code/sec` are the exceptions with real defaults — the
  formatter over the repo's markdown, and the secret and vulnerability scanners
  the gates bundle installs — because every repo has markdown and dependencies
  from the first commit. `code/lint` is the half-case: it keeps the marker for
  the language linter nobody has pinned, and still ships **shellcheck** and
  **actionlint** as defaults, as `code/format` ships **shfmt** beside dprint.
  The line is what the tool reads: one that walks the tree by extension gets a
  default, one that needs a pinned language toolchain stays a slot. An overlay
  inherits both the argument surface and those defaults — it adds its linter, it
  does not drop them.
- **`_scripts/helpers`, plus siblings.** The `_scripts/` directory is
  underscore-prefixed, so mise treats it as **not a task**. `helpers` is the
  shared shell library (colors plus `print_header` / `print_subheader` /
  `print_warn` / `print_error` / `line_sep`) that every task sources as its
  first real line; the separator is baked into the two header functions, so a
  caller never draws one. Beside it: `checks` (the merge predicates), `merge`
  (their shared body), `placeholder` (what a slot prints) and `helpers.mjs`,
  which mirrors the print API for a Node task. One underscore, not two — the
  directory already says *library*.
- **`[tasks.init]`.** A toml task in `mise.toml` that chmods every file under
  `.config/mise/tasks/` executable. It lives in the base so tasks run in every
  env, CI included; `setup:all` and others declare `#MISE depends=["init"]`.

**Who fills the slots.** The `mise` pack ships the common contract — the
`code/*` gates, `setup/worktree`, `setup/*` and the helpers — and every other
pack with a `config/` tree fills in its own half on top: `package-manager/pnpm`
and `package-manager/uv` supply `setup/deps/*`, `toolchain-gate/ruff` and
`app-framework/flutter` supply the `code/format` and `code/lint` their toolchain
needs, `language/swift` supplies both — `setup/deps/*` over SwiftPM and the
`code/format` and `code/lint` that run swift-format and SwiftLint — and the
secrets providers overlay `setup/secrets`. The pnpm pack also ships a root
`.npmrc` setting `ignore-scripts=true` and `fund=false` — an install never runs
a dependency's install-time code, and a package that genuinely has to build is
allowed by name in the workspace file, so the exception is a reviewable line
rather than a blanket switch — plus a `conf.d/` fragment aliasing `npx` to the
manager's own runner, which keeps one store, one lockfile-aware resolver and one
set of registry settings. Composition runs `toolchain-manager` first, then the
`repo-gate` components, then `repo-hygiene`, then `package-manager`/`language`,
then `app-framework`, then `capability-provider`, then `cloud-provider`, then
`cloud-service`, so a later component's file wins and the lockfile records per
file which component supplied it. The two ends are what the order is for: the
manager goes **first** because it lays the baseline every overlay overlays, and
the **deploy target goes last** because it is the most specific thing a repo
pins — a `cloud-service` pack's root config and the `p:<id>:deploy` overlay
beside it are the answer to how this repo actually ships, and nothing may
overwrite that. A secrets overlay still outranks every language and framework
pack, for the reason it always did: it is the most specific answer anything
gives to `setup:secrets`. The two cloud types joined the order on 2026-09-05,
when `cloud-service/workers-static-assets` became the first cloud pack to ship a
`config/` tree at all; `cloud-service/workers-ssr` and
`cloud-service/containers` followed with the same pair.

**What no pack can know, and `/vwf:init` fills** — in the base repo and in every
member repo it resolved, each from that repo's own answers. It is more than two
things, and each is a commented slot a pack ships **in place**, never a file
init authors from scratch:

- the bootstrap aggregator's **member flags** and the `setup-<slug>` **shell
  aliases** beside them, both one per **member repo** and named for the member,
  never from a project id — what they widen a run to is another repository. A
  reshape rewrites a list an earlier version generated from project ids;
- the **per-project `p:<id>:*` groups**, scaffolded as a `_default` placeholder
  per project — the one file init authors rather than copies, because no pack
  can know a project's name;
- **`REPO_NAME`**, the toolchain manager's environment key. It carries the
  repo's **folder name, slugified** — the basename of that repo's main checkout,
  never a project id — and is written **literally, never derived** at read time:
  a linked worktree's directory is named for the branch, so a derived value
  would change identity every time somebody cut one. A member repo names its own
  folder, never the base's. The per-repo launch aliases that read it live in
  your own global configuration — init publishes the value and never writes
  outside the repos it resolved;
- **`MERGE_MODEL_DEVELOP`** and **`MERGE_MODEL_MAIN`**, beside it in the same
  `[env]` block: `direct` or `pr` each, the landing model `code:merge:develop`
  and `code:merge:main` respectively read, asked inside init's git pass one row
  per repo per branch. Shipped `direct` and `pr`; an unset position reads as
  `direct`, and a file still carrying the single legacy `MERGE_MODEL` is read as
  both values until the reshape writes the pair;
- **`MEMBERS`**, beside those three: the product's other repositories as
  space-separated paths relative to the repo root, filled from the members init
  resolved where the linkage is **siblings**. A submodule product leaves it
  exactly as shipped — `.gitmodules` answers instead;
- the two **runtime positions** in the same base config — **`RUNTIME_BLOCK`**
  under `[settings]` and **`PATH_ENTRIES`** at the end of `[env]` — both shipped
  empty and filled from init's **stack read**: one runtime settings line per
  detected language in the first, the `_.path` entry a project-local binary
  directory needs in the second, and nothing in either for a language the repo
  does not have. A repo with no detected language leaves both exactly as
  shipped;
- the commit gate's **scope list**, one scope per project id — filled on *any*
  run, the first included, from the ids init's second question confirmed. A
  project registry, where the repo has one, is only where those ids were
  proposed from; it is never a precondition, so a repo with no registry fills
  the list on its first run like any other;
- the commit gate's **forge links**, from the origin remote — fillable on *any*
  run that has one, first included.

Every name above is **slugged** first, by a rule the adapter's `assets/ids.md`
owns: lowercased, runs outside the slug alphabet collapsed to a single `-`, ends
trimmed. That asset carries one rule with two independent applications — a
project's **id**, which names the `p:<id>:*` group and fills the scope list, and
a repo's **name**, which fills `REPO_NAME` from the main checkout's folder — and
a member's name takes the same spelling rule on its way into a flag or an alias.
The reason is measured rather than stylistic — the task runner reads a
per-project group's directory name as the task's *last* segment once the
`_default` slot collapses into it, and strips what looks like an extension from
that segment, so an id carrying a dot silently loses everything after it and the
task the repo shows you is not the task it has.

A pack can still contribute **one task** to a project's group without knowing
its name: a `config/` tree's `.config/mise/tasks/p/_project/` directory is
itself a marked position, and the materializer renames it to the pinned
project's slugged id as it copies — which is how all three Cloudflare deploy
packs land `p:<id>:deploy`.

**Legacy names.** The contract replaced these, and the pack carries the table so
`/vwf:init` can rename them on an existing repo — and, for the `print_*` rows,
rewrite the calls to them. What moved is a fact about this task library, so the
table lives with the pack and vwf's own prose names no tool.

| Was                                         | Is now               |
| ------------------------------------------- | -------------------- |
| `worktree:init`                             | `setup:worktree`     |
| `merge:develop`, `merge:main`               | `code:merge:*`       |
| `setup:pnpm:*`, `setup:uv:*`, `setup:app:*` | `setup:deps:*`       |
| `setup:doppler`                             | `setup:secrets`      |
| `setup:deps:{start,stop,pull}`              | `setup:external:*`   |
| `setup:deps:update`                         | `setup:deps:upgrade` |
| `_scripts/_helpers`                         | `_scripts/helpers`   |
| `_scripts/_checks`                          | `_scripts/checks`    |
| `print_normal`                              | `print_yellow`       |
| `print_normal_wait`                         | `print_wait`         |
| `print_green`                               | `print_success`      |
| `print_green_wait`                          | `print_wait`         |
| `print_yellow_wait`                         | `print_wait`         |
| `print_red`                                 | `print_error`        |
| `print_red_wait`                            | `print_wait`         |
| `print_header_wait`                         | `print_header`       |
| `print_subheader_wait`                      | `print_subheader`    |

The last nine rows are read for a second job. A repo whose shared helper file
has drifted from the pack's is carrying a diverged copy of it, not a library of
its own, so `/vwf:init` replaces that file and rewrites every call to a
left-hand name into its right-hand one — one token per call site, nothing else
on the line. A function the table has no row for is never rewritten either: it
is one the repo wrote for itself, so `/vwf:init` moves it verbatim into a
repo-owned `_scripts/local` sidecar this pack neither ships nor declares, and
points the calling tasks at it. The set that moves is every function the repo's
own copy **defines** that the pack's does not and the table does not map —
derived from definitions, not from call sites, so one nothing calls yet crosses
over too. One of the nine is more than a rename: the red line became the error
line, and an error line goes to stderr.

A repo still carrying a left-hand name is not broken, but nothing else in the
toolkit will find it: vwf probes `setup:worktree`, the aggregators call
`setup:deps:*`, and the shell aliases point at `code:*`.

## Skills and the agent

| Name                      | Kind                   | Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stackgen-stack-menu`     | adapter, skill-invoked | The packs + the one open `generate` entry, as a vwf menu payload. Answers the same in every product                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `stackgen-stack-template` | adapter, skill-invoked | The dispatch: materialized entry → pure read; a first pin — which arrives from `/vwf:setup`'s materialize pass — resolves the bundle's composition and dispatches **per component**, packs copied and uncovered components generated, landing once behind one consent gate in the repo the optional `repo:` line names. Unknown slug → error, never a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `stackgen-sync`           | user-only              | The explicit re-sync, **per component**: lockfile-anchored diff against current component packs, regeneration offered per generated component, the delta presented for consent. Repo edits never overwritten by default. Conditional paths are evaluated first, against the config's `answers:` block with the forge re-read live — a false path with no record is `skipped (condition)` and never offered, a never-landed path whose condition now holds is offered as a create, and a landed path whose condition turned false is kept and reported once. Removing a pack drops its `skipped:` rows with its entries. Closes by **re-checking the repo shape** — `/vwf:setup`'s Step 0 check, in-session, over the base and every member against the lockfile just updated — and on drift offers `/vwf:setup reshape` and invokes it on a yes; clean says nothing. A fragment that moved is folded into the merged config there, by the reshape, never by the sync |
| `stackgen-reputation`     | user **and** model     | A verdict on every name it is given — `/stackgen:stackgen-reputation <ecosystem>:<name> …`, the prefix one of `npm:`, `pypi:`, `pub:`, `action:` (owner/repo) or `image:` (registry/repo), an optional version or ref (`npm:left-pad@1.3.0`, `action:actions/checkout@v4`, `image:docker.io/library/nginx:1.27`) pinning what the advisory check runs against — one row per name reading `pass`, `warn` or `block`, with the signals that decided it, from public read APIs. The generator calls it over every concrete name a generated component emits; you call it on a name before typing it anywhere                                                                                                                                                                                                                                                                                                                                                            |
| `stackgen-skill-reviewer` | subagent               | The stateless trust gate on generation: catalog fidelity, the **when-not-to-apply** checks, citations that resolve and support, honest emitted facts, **kind conformance**, **topic-bar coverage** against the composition, and every emitted name carrying a verdict-table row that does not read `block` — read off the table it is handed, never looked up                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

**"skill-invoked" is two frontmatter keys, not one.** The two adapter skills
carry `disable-model-invocation: false`, so vwf can reach them by their
constructed names, *and* `user-invocable: false`, so neither takes a slot in
your `/` menu: an adapter answers in a payload shape only vwf reads, and there
is nothing for a user to do with it. Both keys are part of the adapter contract,
not a preference: `disable-model-invocation: true` would make vwf's call a
silent no-op rather than an error, and leaving the skills user-invocable spends
two menu slots on skills that answer only a program. `stackgen-reputation` is
the third shape: the first key and **no** `user-invocable` line, so the
generator reaches it programmatically and it still appears in your `/` menu —
the one stackgen skill invocable both ways.

## Trust: how a generated skill earns its place

A generated artifact is only as good as its checks, so every one passes five
before it lands:

1. **The catalog.** Each judgment instantiates a principles-catalog entry (vwf's
   `assets/principles/`) and cites it — including the entry's *when not to apply
   it* section, so the skill yields where the stack's own idiom already covers
   the ground. The catalog is passed in by vwf; stackgen never reaches into
   another plugin's files.
2. **The citations.** Each technology claim cites current documentation fetched
   through Context7 during the run — the primary research channel, one pass per
   bar topic minimum — recorded durably under `.claude/stackgen/citations/`, one
   file per component keyed per topic. Supplementary sources are allowed only
   where that topic's Context7 coverage is thin, and both the supplement and the
   thinness are disclosed.
3. **Artifact validity.** Separately from what it covers, every artifact has to
   *work*: strict-YAML frontmatter (a rejected skill is dropped with no error),
   the invocation state its kind rules — an adapter carries both
   `disable-model-invocation: false` and `user-invocable: false`, since a
   user-only skill is invisible to a delegating caller, silently, and a
   user-visible one offers a menu entry nobody can use — a **fixed** skill name
   rather than one assembled from configuration, and the hook verdict shape its
   event requires. These are host rules rather than stack rules, they live in
   `assets/artifact-doctrine.md`, and every one of them fails **silently at run
   time** — which is why they are gated here and nowhere downstream. The
   frontmatter bar is not the generator's alone: stackgen's own repo gate parses
   every **shipped** pack skill and pack agent under a strict parser too, so a
   curated pack is held to what a generated one is.
4. **The names.** Every concrete third-party name the component emits — a
   package a `mise_tool` entry or a runner-invoked task names, a command an MCP
   server entry spawns, a GitHub Action, a container image — gets a verdict from
   `stackgen-reputation` before the dry-run gate shows it: `pass`, `warn` or
   `block`, decided by thresholds written in the skill's `references/signals.md`
   rather than judged on the spot — among them: absent from its registry, first
   published under 30 days ago, an unpatched critical or high advisory on the
   version to be pinned, a near-name of a far more downloaded package,
   deprecated or archived → `block`; one maintainer, bottom-tier downloads, no
   provenance, a low Scorecard → `warn`. A `block` halts the component with the
   table; you name the replacement, and it is checked in turn — never a silent
   swap. A source the skill cannot reach is `UNRESOLVED`, never an inferred
   verdict, and halts like an unreachable Context7. Shipped packs are outside
   the check: their names were curated by hand.
5. **The reviewer + you.** The `stackgen-skill-reviewer` agent returns `NO GAPS`
   or a numbered list — checking the kind's **topic-bar coverage**, artifact
   validity, the content, and that every emitted name has a row in the verdict
   table it is handed with none reading `block` (it looks nothing up itself) —
   and generation loops under a convergence guard of **four rounds**, after
   which residuals are reported rather than looped forever or landed quietly;
   then the materializer shows the full landing set as a dry-run plan, the
   verdict table whole beside the reviewer's verdict with each `warn` row called
   out on its own line, and writes nothing without your approval.

## Caveats

- **Generation needs Context7, the catalog, and the reputation sources.**
  Missing any is a halt with its name, not a degraded run — a name whose
  registry or advisory source could not be reached is never landed on a guessed
  verdict.
- **Drift is a feature with a viewport.** Your repo's copies may diverge from an
  upgraded pack by design; `/stackgen:stackgen-sync` is where the divergence
  becomes a diff you decide about. The lockfile's per-file `hash:` has three
  writers, and a differing hash is drift only when none of them ran: the
  materializer at landing, `/vwf:init`'s replace-or-keep offer on either answer,
  and `/vwf:init` again after every fill, `.gitignore` section append,
  hook-fragment merge or editor block it writes — so a file it filled or you
  chose to keep reads as current, not as drift.
- **Repo config is a fenced target, not a free one.** A pack writes only the
  config files its own component owns — its gate's config included, since
  2026-09-05, and its editor *fragment* since 2026-09-06. The language manifest
  and its lockfile, CI workflows, a **whole** editor file and `CLAUDE.md` are
  named as prerequisites and left to you, deliberately: each file the tier
  absorbs makes the argument for the next one easier, and those four are where
  the line holds.
