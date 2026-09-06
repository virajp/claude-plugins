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
`<type>/<slug>@<version>`, or `@generated` — never directories. Three bundle
shapes exist today: a Language-Bundle is the composition rooted at a language
component (language + package manager + framework components + toolchain gates);
a Cloud-Bundle is provider + service components; a Datastore-Bundle is
category-level doctrine + an instance component.

The taxonomy splits at the existing seam: **capability tokens stay vwf's**
(`capability-vocabulary.md`); the finer **category taxonomy is stackgen's**. vwf
never learns what an ORM is; stackgen never redefines a capability — the `cdn`,
`secrets-manager`, `access` and `static-hosting` categories' capability tokens
are deliberately unset until vwf defines them, because a category classifies
what a component *is*, never whether a product must have one. Categories make
components substitutable answers to one blueprint capability, which is what lets
stack menus become category-filtered queries instead of per-plugin lists.
Category-level doctrine is written once as curated knowledge; instance
components cite it and stay thin.

### Four bundles on one pack — the Astro example

The clearest worked example of "bundles are compositions, not directories" is
the `site` platform. Four bundles serve it, all pinning the one
`framework/astro` pack and all carrying React for islands, and they differ by
which of Astro's two `output` values is set and whether an adapter is present:

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

There is no output-mode field on a bundle and no per-project setting: Astro has
exactly two `output` values (`hybrid` was removed in Astro 5 and merged into
`static`), and CSR is a page shape rather than a mode, so all four are decisions
the pack's doctrine carries and each bundle pins one. **A page with no island
ships no JavaScript**, which is why React rides along in all four rather than
splitting the menu into with- and without-React pairs.

**The build output is a named fact.** The `framework/astro` pack's conventions
carry a fixed `## Build output` heading stating that the build writes `./dist` —
Astro's `outDir` default — and that a deploy pack may rely on it. Both
Cloudflare Workers deploy packs' `assets.directory` cite that heading, which is
what makes the seam between the project axis and the deploy axis a written
contract instead of a coincidence. A repo that changes `outDir` has changed that
contract and has to change its deploy configuration in the same commit; nothing
detects the mismatch.

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
   vwf's principles catalog with citations → the `stackgen-skill-reviewer` gate
   (capped at **four rounds**, after which residuals are reported rather than
   looped forever) → the same materialized tree. Context7 unreachable → **halt,
   never guess**. When the bundle root itself is uncovered, the pin is
   `generated/<technology-slug>`.

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

Two **framework** packs ship today, `effect` and `astro`; every other framework
a bundle names is a `@generated` ref, which is the generated path working as
designed rather than a gap. `framework/astro` arrived on 2026-09-06 as the
second, and it is the pack all four bundles in
[the Astro example](#four-bundles-on-one-pack--the-astro-example) pin.

The `devtools` plugin then dissolved into stackgen and was deleted, closing the
marketplace at two plugins. Its mise doctrine and its file-based task library
became the `toolchain-manager/mise` pack, its four repo gates the `repo-gates`
bundle, and `/devtools:scaffold` stopped being a command at all: laying the
toolchain into a repo is a materialization now, like every other pack. Two kinds
were minted on the way — `toolchain-manager` and `workspace` — and packs gained
a fourth output target so one could write a repo's own config files. A third
kind, `repo-hygiene`, followed when that target widened to cover every gate's
config and the hygiene files, and `/vwf:init` arrived to lay them down.

**stackgen is now the only stack plugin.** Its packs are the covered path, and
the menu keeps its open `generate` entry for the rest — the stack you use that
nobody wrote a pack for.

## Kinds — what can be generated, and its shape

Every pack and generation run declares a **kind**, and the kind — not the run —
decides the output's structure and scope, so generated output is deterministic
in shape while only content varies:

| Kind                  | vwf axis               | Shape                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language-bundle`     | project (+ repo facts) | the composition rooted at a `language` component — a **12-topic bar** behind a lean router skill → on-demand references, plus paths-scoped doctrine per config file the toolchain owns (archetype: the `language/typescript` bundle)                                                                                                                                                                                                                                                |
| `database`            | backing                | a **6-topic bar** on the instance component — pick & trade, data-model constraints, clause-by-clause satisfaction of the neutral datastore contract *by citation*, connection & access incl. credentials, cost shape, the Docker-composed `local_stack`                                                                                                                                                                                                                             |
| `capability-provider` | backing                | the same two halves as `database` — the neutral capability contract plus one provider component that realizes it, citing rather than restating                                                                                                                                                                                                                                                                                                                                      |
| `cloud-provider`      | backing + deploy       | **4 provider topics** (cost, IAM, local-dev map, networking & private plane) + **5 per `cloud-service` component**, plus a **deploy-target extension** — artifact/pipeline/health — where the service's category is `compute` or `static-hosting`, the two categories that are deploy targets (archetypes: the `cloud-provider/gcp` and `cloudflare-workers-static` bundles)                                                                                                        |
| `repo-gate`           | repo                   | the `toolchain-gate` components that run over the whole repo, composed together. A **language-specific** linter or formatter appearing here is a gap — it belongs to that language's bundle                                                                                                                                                                                                                                                                                         |
| `toolchain-manager`   | repo                   | **exactly one component, standing alone** — the thing that pins the repo's tools, holds the environment values they read, and runs its tasks. A **5-topic bar** behind a router skill: the config split, environment values, the task-library contract, the mandatory task set, and bootstrap/CI parity. A polyglot repo materializes it **once**                                                                                                                                   |
| `repo-hygiene`        | repo                   | **exactly one component, standing alone** — the files every repo carries whatever wrote it. A **4-topic bar**, no router: the ignore set, the editor and attribute defaults, licensing and the security contact, and the dependency-update policy. Not a gate, and that is the distinction the kind holds: a gate *runs, finds something and fails*; hygiene runs nothing and *declares*. It also owns the **root allowlist** every other kind's `config/` tree is measured against |
| `workspace`           | repo                   | the `package-manager` component that installs and locks the repo's members, plus a `build-orchestrator` where there is one — a **5-topic bar**, no router. The only repo-axis kind you **pick**: it is what `repo.stack.template` selects from. A single-package repo pins none, which is the kind's edge rather than a gap                                                                                                                                                         |
| `ci-system`           | cicd                   | the **release-trigger contract** + **exactly one** `ci-system` component, a **6-topic bar** behind a router skill with one reference per system. Three layers, none duplicated: vwf's delivery-pipeline rules say what a deploy must guarantee, the contract is the recommended mechanism above any one system, the component is how that system spells it. A second CI system in one bundle is a gap, not extra coverage                                                           |
| `app-framework`       | project                | rooted at the SDK that owns the manifest and build, carrying its languages as members with a `role` — one `primary`, any number of `platform-edge` (archetype: the `app-framework/flutter` bundle)                                                                                                                                                                                                                                                                                  |
| `deploy-target`       | deploy                 | **one component, standing alone** — the only bundle with no second half. A **6-topic bar** covering pick & trade, the artifact, hygiene, promotion, config/secrets and health. Its discipline is a scope fence: the pipeline, the cloud and the local stack each belong to a kind that already owns them                                                                                                                                                                            |
| `design-tool`         | design                 | one component, standing alone — a **5-topic bar** on the three imports, reach & credentials, and the naming contract. Lands three skills at **fixed names** in the repo's `.claude/`, all mandatorily model-invocable, because a user-only one is invisible to vwf rather than a smaller feature                                                                                                                                                                                    |

Every kind in that table is defined; no reservations are outstanding. Two of the
six axes — `design` and `cicd` — are **tool axes**, where the bundle slug is the
token the project config already holds, so picking from the menu and writing the
config key are one act. Kinds compose through vwf's capability vocabulary — a
language bundle says "the datastore", never a database by name — so each stays
independently re-syncable.

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
  a deploy target owns the root config its own tool reads, which is how both
  `cloud-service/workers-static-assets` and `cloud-service/workers-ssr` ship a
  `wrangler.jsonc` and the `p:<id>:deploy` task beside it; and any pack may drop
  an **editor fragment** into `.config/vscode.d/`, three keys wide, which
  `/vwf:init` composes — declares them in a `config/` tree mirroring the repo
  root, and they land there. Everything else goes under `.config/`: a `config/`
  tree landing a root path outside the fixed allowlist is a pack authoring error
  the materializer refuses. Two **directories** are allowlisted at that root,
  `.config/` and `.github/`, and a CI workflow inside the second is refused
  outright. Mode is preserved, because a task file arriving without its exec bit
  fails as an *unknown task* rather than as a permission error.

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
editor integration nobody turns on.

Two files inside the fence are written **whole** by no pack, and both are
composed by `/vwf:init`. The **pre-commit config**: each pack contributes a
`pre-commit.d/` fragment, and init concatenates them between markers. The **two
editor files**: init deep-merges every `vscode.d/` fragment's `settings`, unions
the `nesting` children per parent and the `extensions` list, and writes one
marked block **first** in each file, so a key you add after it wins by ordinary
later-key precedence and survives a second merge byte-for-byte. Nothing in
stackgen edits either composed file, which is what keeps a fragment a fragment.

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
facts `/vwf:doctor` verifies** — LSP provision, mise tool, manifest — plus
harness tasks and mechanisms, with `frameworks`/`capabilities` derived from the
composition), and the body is the `conventions:` prose `plan` sizes against and
`execute` writes to. That emitted-facts block is the **materialized escape** in
vwf's stack vocabulary: a language no shipped bundle covers is still *known*
when its pin carries these facts.

In a multi-repo product the target repo defaults to the current one; name a
member repo to materialize there instead. Each repo gets independent copies and
its own lockfile.

## The repo baseline — mise, the gates and the hygiene files

Three bundles are **unconditional**: `stackgen-stack-menu` leaves them out of
the payload it returns, and [`/vwf:init`](./vwf.md#vwfinit) fetches them by
their fixed slugs, `mise`, `repo-gates` and `repo-hygiene`. Nothing is recorded
in `.config/vwf.yaml` for any of them — nothing was chosen, so there is no
choice to record — and the landing goes in `lock.yaml` like any other
materialization. All three slugs present in that lockfile is what "this repo is
shaped" means: `/vwf:setup` no longer fetches them, it checks for exactly that
and offers `/vwf:init` when one is missing — or when the shape has drifted.

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
`.config/`, a `pre-commit.d/` fragment where it contributes a hook, and a
`vscode.d/` editor fragment. The formatter also ships the root `dprint.json`
shim described above, and the JS/TS linter gate — a language-bundle topic rather
than a repo gate — ships `.config/linter.yaml`, the config it had always invoked
and never supplied.

**`repo-hygiene`** is the newest kind on the repo axis, beside `repo-gate`,
`toolchain-manager` and `workspace`. Its single pack ships the files every repo
needs and no tool owns: a sectioned `.gitignore` (with a graphify section that
ignores `graphify-out/*` while keeping `GRAPH_REPORT.md`), `.graphifyignore`,
`.editorconfig`, `.gitattributes`, `SECURITY.md`, `CONTRIBUTING.md`, three
`.github/ISSUE_TEMPLATE/` files, a Renovate config, the chosen `LICENSE`, and
the **editor baseline** — the largest `vscode.d/` fragment, since the settings
every repo wants regardless of stack are hygiene by the same definition
everything else here is.

The seam with `repo-gates` is worth stating, because it is the reason the kind
exists rather than folding in: **a gate scans, while hygiene declares what is
not there to scan.** Ignoring a file and allowlisting it in a scanner are two
different decisions, and a secret that is ignored is still a secret nothing ever
scanned — writing them as one act is how that gets missed. Two consequences
follow. The licence texts live under `config/_licenses/` as a **pack-private**
payload that is never copied wholesale: a repo gets the one licence it chose,
not a directory of them. And the stack-specific ignore sections are **appended
per repo** by `/vwf:init`, one section per technology, never frozen into the
pack — a pack that hard-codes them ages the moment a language renames its build
directory.

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
`MISE_ENV=ci` too.

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
  `code/sec`, `code/precommit`, `code/git-config`, `code/worktrees`, `code/ai`,
  `code/count`, `code/merge/develop`, `code/merge/main`, and the `code/all`
  aggregator (`format` → `lint` → `sec`). `code:all` is the one-command gate;
  `precommit` and `git-config` are wired into the pre-commit hooks and `setup`,
  not into `code:all`. `code:sec` needs scanners from `mise.dev.toml` — run it
  under the dev toolchain (`MISE_ENV=dev`). `code:count` is a size reading
  rather than a metric: lines of **tracked** text grouped by extension, which is
  the whole ignore story for free — no build output, no vendored tree, and no
  second exclusion list to keep in step with `.gitignore`.
- **`code/merge/*` — landing, with the predicates first.**
  `code:merge:develop <branch>` refuses a source that is `main` or `develop`,
  refuses a **destination branch that does not exist locally** — naming the
  two-branch model, asked up front so a repo whose branches were never laid out
  fails in one command instead of after the whole-tree hook pass with nothing
  restored — refuses an unclean tree, runs the pre-commit safety net and **fails
  if it changed anything**, then hops to the main worktree, `git merge --no-ff`
  and `git push --follow-tags`. `code:merge:main` is the same sequence with one
  extra predicate: the source must be `develop`, with nothing unpushed. A
  conflict leaves the tree mid-merge on purpose. (These were `merge:develop` and
  `merge:main`; a merge is one more thing a change runs through, like the
  gates.)
- **`setup/*` — bootstrap & upgrade.** `setup:all` is the entrypoint — run it on
  clone and to re-sync. It calls `setup:mise`, `setup:secrets`,
  `setup:external:start`, `setup:deps:all`, `setup:precommit`, `code:ai` and
  `setup:vscode` in order, and stays idempotent. `--all` recurses into every git
  submodule, and one `--<project-id>` flag per member is generated from the
  repo's own project ids. Alias it as `setup`.
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
- **`setup/default-branch <branch>` — the forge's default.**
  `setup:default-branch` is the one `setup:*` member `setup:all` does **not**
  call, because it edits a remote. It sets the default through whichever forge
  CLI it finds and prints the command where it finds none, and it never fails:
  no remote yet is the ordinary first-day case, and a contributor without the
  CLI still needs the one line to run. `/vwf:init` runs it once, with the answer
  to its forge-default question. It is orthogonal to the merge tasks — work
  flows feature → `develop` → `main` whichever branch the forge calls default.
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
  from the first commit.
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
needs, and the secrets providers overlay `setup/secrets`. The pnpm pack also
ships a root `.npmrc` setting `ignore-scripts=true` and `fund=false` — an
install never runs a dependency's install-time code, and a package that
genuinely has to build is allowed by name in the workspace file, so the
exception is a reviewable line rather than a blanket switch — plus a `conf.d/`
fragment aliasing `npx` to the manager's own runner, which keeps one store, one
lockfile-aware resolver and one set of registry settings. Composition runs
`toolchain-manager` first, then the `repo-gate` components, then `repo-hygiene`,
then `package-manager`/`language`, then `app-framework`, then
`capability-provider`, then `cloud-provider`, then `cloud-service`, so a later
component's file wins and the lockfile records per file which component supplied
it. The two ends are what the order is for: the manager goes **first** because
it lays the baseline every overlay overlays, and the **deploy target goes last**
because it is the most specific thing a repo pins — a `cloud-service` pack's
root config and the `p:<id>:deploy` overlay beside it are the answer to how this
repo actually ships, and nothing may overwrite that. A secrets overlay still
outranks every language and framework pack, for the reason it always did: it is
the most specific answer anything gives to `setup:secrets`. The two cloud types
joined the order on 2026-09-05, when `cloud-service/workers-static-assets`
became the first cloud pack to ship a `config/` tree at all;
`cloud-service/workers-ssr` is its sibling and ships the same pair.

**What no pack can know, and `/vwf:init` fills.** It is more than two things,
and each is a commented slot a pack ships **in place**, never a file init
authors from scratch:

- the bootstrap aggregator's **member flags** and the **shell aliases**, both
  generated from the repo's project ids;
- the **per-project `p:<id>:*` groups**, scaffolded as a `_default` placeholder
  per project — the one file init authors rather than copies, because no pack
  can know a project's name;
- **`REPO_NAME`**, the toolchain manager's environment key. It carries the
  repo's own slug and is written **literally, never derived** at read time: a
  linked worktree's config root is named for the branch, so a derived value
  would change identity every time somebody cut one. The per-repo launch aliases
  that read it live in your own global configuration — init publishes the value
  and never writes outside the repo;
- the commit gate's **scope list**, from the project registry, which is why it
  is re-run work by construction: the registry does not exist when init first
  shapes a repo, so the empty list a first run leaves is the correct state;
- the commit gate's **forge links**, from the origin remote — fillable on *any*
  run that has one, first included.

Every id above is **slugged** first, by a rule the adapter's `assets/ids.md`
owns: lowercased, runs outside the slug alphabet collapsed to a single `-`, ends
trimmed. The reason is measured rather than stylistic — the task runner reads a
per-project group's directory name as the task's *last* segment once the
`_default` slot collapses into it, and strips what looks like an extension from
that segment, so an id carrying a dot silently loses everything after it and the
task the repo shows you is not the task it has.

A pack can still contribute **one task** to a project's group without knowing
its name: a `config/` tree's `.config/mise/tasks/p/_project/` directory is
itself a marked position, and the materializer renames it to the pinned
project's slugged id as it copies — which is how both Workers packs land
`p:<id>:deploy`.

**Legacy names.** The contract replaced these, and the pack carries the table so
`/vwf:init` can rename them on an existing repo — the renaming is a fact about
this task library, and vwf's own prose names no tool.

| Was                                         | Is now               |
| ------------------------------------------- | -------------------- |
| `worktree:init`                             | `setup:worktree`     |
| `merge:develop`, `merge:main`               | `code:merge:*`       |
| `setup:pnpm:*`, `setup:uv:*`, `setup:app:*` | `setup:deps:*`       |
| `setup:ai`                                  | `code:ai`            |
| `setup:doppler`                             | `setup:secrets`      |
| `setup:deps:{start,stop,pull,update}`       | `setup:external:*`   |
| `setup:deps:update`                         | `setup:deps:upgrade` |
| `_scripts/_helpers`, `_scripts/_checks`     | `_scripts/helpers`   |

A repo still carrying a left-hand name is not broken, but nothing else in the
toolkit will find it: vwf probes `setup:worktree`, the aggregators call
`setup:deps:*`, and the shell aliases point at `code:*`.

## Skills and the agent

| Name                      | Kind                   | Does                                                                                                                                                                                                                                                    |
| ------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stackgen-stack-menu`     | adapter, skill-invoked | The packs + the one open `generate` entry, as a vwf menu payload. Answers the same in every product                                                                                                                                                     |
| `stackgen-stack-template` | adapter, skill-invoked | The dispatch: materialized entry → pure read; a first pin resolves the bundle's composition and dispatches **per component** — packs copied, uncovered components generated — landing once behind one consent gate. Unknown slug → error, never a guess |
| `stackgen-sync`           | user-only              | The explicit re-sync, **per component**: lockfile-anchored diff against current component packs, regeneration offered per generated component, the delta presented for consent. Repo edits never overwritten by default                                 |
| `stackgen-skill-reviewer` | subagent               | The stateless trust gate on generation: catalog fidelity, the **when-not-to-apply** checks, citations that resolve and support, honest emitted facts, **kind conformance**, and **topic-bar coverage** against the composition                          |

**"skill-invoked" is two frontmatter keys, not one.** The two adapter skills
carry `disable-model-invocation: false`, so vwf can reach them by their
constructed names, *and* `user-invocable: false`, so neither takes a slot in
your `/` menu: an adapter answers in a payload shape only vwf reads, and there
is nothing for a user to do with it. Both keys are part of the adapter contract,
not a preference: `disable-model-invocation: true` would make vwf's call a
silent no-op rather than an error, and leaving the skills user-invocable spends
two menu slots on skills that answer only a program.

## Trust: how a generated skill earns its place

A generated artifact is only as good as its checks, so every one passes four
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
   time** — which is why they are gated here and nowhere downstream.
4. **The reviewer + you.** The `stackgen-skill-reviewer` agent returns `NO GAPS`
   or a numbered list — checking the kind's **topic-bar coverage**, artifact
   validity and the content — and generation loops under a convergence guard of
   **four rounds**, after which residuals are reported rather than looped
   forever or landed quietly; then the materializer shows the full landing set
   as a dry-run plan and writes nothing without your approval.

## Caveats

- **Generation needs Context7 and the catalog.** Missing either is a halt with
  its name, not a degraded run.
- **Drift is a feature with a viewport.** Your repo's copies may diverge from an
  upgraded pack by design; `/stackgen:stackgen-sync` is where the divergence
  becomes a diff you decide about.
- **Repo config is a fenced target, not a free one.** A pack writes only the
  config files its own component owns — its gate's config included, since
  2026-09-05, and its editor *fragment* since 2026-09-06. The language manifest
  and its lockfile, CI workflows, a **whole** editor file and `CLAUDE.md` are
  named as prerequisites and left to you, deliberately: each file the tier
  absorbs makes the argument for the next one easier, and those four are where
  the line holds.
