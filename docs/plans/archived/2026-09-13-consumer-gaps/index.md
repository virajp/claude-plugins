---
type: vwf-change-plan
title: consumer gaps — auto, commits, reviewer, setup pins
requires: []
---

# Plan — consumer gaps — auto, commits, reviewer, setup pins (2026-09-13)

## Status

**COMPLETE** 2026-09-13. Every unit green; both fixture runs pass; landed from
branch `2026-09-13-consumer-gaps`. Commits, in order: `0c09a35c` (U1),
`f1d8ea85` (U2), `5b80a6e3` (U3), `6d03a4b1` (U4), `e1e36d23` (U5), `61ff59aa`
(U6), `3dc8fc58` (U7), `823015cb` (plan, wave 1), `321e8851` (U6 follow-up),
`69995dd6` (U8), `d68889c6` (plan, wave 2), `dde86331` (U9), `210679fb` (U7
follow-up), then this archive commit. Approved 2026-09-13 by the user, after
self-review.

## Consent

| Action                                            | Granted                                                                                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes — a deliberate override of the standing in-the-moment consent rule, for this plan only                                                                         |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json`, `19.19.0` → `19.20.0`, by editing the `version` field                                                            |
| Release stackgen publicly                         | minor — `plugins/stackgen/.claude-plugin/plugin.json`, `1.8.1` → `1.9.0`, by editing the `version` field                                                           |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U9 runs it first), `1.1.8` → `1.1.9`                                    |
| Release the flutter pack                          | minor — `plugins/stackgen/stacks/app-framework/flutter/pack.yaml` `0.2.0` → `0.3.0`, the `dart-flutter` bundle pin, `mise run p:plugins:inventory`; by U1's commit |
| Release installer publicly                        | none                                                                                                                                                               |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session. This
plan has **no release step**: the versions are bumped by U9 and the tags wait
for a later session's `/release`.

## Goal

After this lands, a multi-repo Flutter product like 95octane runs `/vwf:setup` →
`/vwf:product` → `/vwf:architecture` (which invokes setup again) with none of
the five defects its 2026-09-13 run surfaced: `auto` (CarPlay and Android Auto)
is a platform the Flutter template covers; every commit message a vwf skill
writes passes the commit gate the pre-commit pack ships; the product reviewer
accepts `—` in the Evidence cell of an `untested` row; **architecture decides
and setup pins** — each project's template is materialized into its own member
repo, one landing per (repo, slug), with the principles catalog handed over; and
a fresh setup records `unresolved` on an axis nobody has decided and continues
instead of halting.

The framing, in the user's words: *setup is responsible for pinning the stack to
respective repos; setup is NOT responsible to decide the stack, that
responsibility is with architecture; setup will run before architecture as well
as after (this must be programmed), so the decision of stack and pinning are
covered.*

**Three reversals**, each recorded in the decision doc U8 writes:

1. **Materialization moves from architecture to setup.**
   `plugins/vwf/assets/stack-adapter.md:305-309` ("Materialization itself
   happens once, interactively, when the pin is first made") and
   `plugins/vwf/skills/architecture/references/stack-menu.md:124-129` place it
   at pin time inside `/vwf:architecture`. Now `/vwf:setup` owns it, as a
   materialize pass that runs on every setup run; architecture only records the
   decision and invokes setup at its end.
2. **Setup writes `unresolved`.** `plugins/vwf/assets/vwf-config.md:165`
   ("**`unresolved` only ever arrives from an `/vwf:architecture` run** … No
   migration writes it") and
   `plugins/vwf/skills/setup/references/onboard-pipeline.md:72-77` ("setup never
   writes `unresolved` … An axis setup could not settle is left absent") are
   reversed for one case: an **absent** project axis on a repo architecture has
   not run on. A pinned slug is never rewritten.
3. **The landing consent rule.** Memory records that merge to develop, push and
   release each need explicit in-the-moment consent. The user chose an
   unattended landing for this plan. Recorded as a one-plan override, not as a
   change to the rule.

## Facts the survey established

**Baseline.** `develop` at `d75f1927`, which includes the landed
`init-walks-the-members` plan: vwf `19.19.0`, stackgen `1.8.1`, site `1.1.8`,
`config_format` 18, `blueprint_format` 24. The authored tree is `plugins/`;
`.dev-marketplace/` is a byte-identical staged copy and is never edited. Line
numbers below are from that commit; where a file was rewritten by the landed
plan (setup, doctor, init) the unit files cite an anchor phrase as well.

**Gap 1 — Flutter and `auto`.** The platform list lives in three places that
must agree: `plugins/stackgen/stacks/bundles/dart-flutter.md` (frontmatter
`platforms:` `:9-13`, pin `:6` `app-framework/flutter@0.2.0`, heading `:16` "#
mobile · tablet · desktop · webapp — Dart · Flutter", `:22` "**One template,
four platforms.** Flutter builds phone, tablet, desktop and web", `:24`);
`plugins/stackgen/stacks/app-framework/flutter/pack.yaml` (summary `:2-3` "one
codebase across mobile, tablet, desktop and web", version `:4`, platforms `:9`,
platform-edge `kotlin` `:19-28` and `swift` `:29-39` — already declared, no new
language); `plugins/stackgen/stacks/inventory.md` (`:33`, `:130`), generated by
`scripts/src/inventory.ts` from `pack.yaml` (summary, version) and the bundle
frontmatter (component refs) — it throws when a bundle pins a version the pack
no longer carries (`inventory.ts:27-30`), so `pack.yaml` bump, bundle re-pin and
regenerated inventory must land in **one commit**. `assets/pack-format.md`
states no minor/patch rule — only that a bundle pins the exact current version
(`:260-266`). vwf's platform vocabulary:
`plugins/vwf/skills/architecture/references/platforms.md:19` lists `auto`;
`:33-40` "Ask once per project whether the app must run in-car"; `:25` "not four
projects". Doctor's coverage check:
`plugins/vwf/skills/doctor/references/stack-checks.md:190-193` "**A project's
template must cover its platforms.**" — blocking, so `auto` on a Flutter project
blocks until the bundle lists it. Passages that count Flutter's platforms as
four, all falsified by the change:
`plugins/vwf/agents/architecture-writer.md:116-117`,
`plugins/vwf/skills/setup/references/topology-detection.md:99`,
`plugins/vwf/assets/topologies/repo.md:30`,
`plugins/vwf/assets/templates/registry.yaml:45`,
`plugins/vwf/assets/vwf-config.md:74` ("a Flutter template covers
mobile+tablet+desktop+webapp"),
`plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/pick-and-trade.md:6`,
`site/src/content/docs/how-to/greenfield/ui-with-design-tool.md:81`,
`site/src/content/docs/how-to/operate/choosing-your-stack.md:45`,
`site/src/content/docs/plugins/stackgen.md:200,696`,
`site/src/content/docs/plugins/vwf.md:594,611,1305,1356`,
`.claude/skills/vwf-plugin/references/docs-tree.md:16`,
`.claude/skills/plugin-authoring/references/checks.md:253`.

**Gap 2 — the commit convention.** The pack file
`plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/git-conventional-commits.yaml`
allows ten types and no more (`:14-24`):
`feat fix perf refactor revert test
ops docs merge wip`; its header (`:9-13`)
says "build, ci, chore, deps, config and release are all `ops`; style is
`refactor`; a specification or a design document is `docs`". `commitScopes: []`
(`:39`) is a marked position init fills **only with registry project ids, on a
re-run** (`init/references/existing-repo.md:574`, anchor "| commit scopes | … |
on a re-run only |"); init's brownfield rename table
(`existing-repo.md:375-391`, `:385`) already maps `spec`, `blueprint` → `docs`.
The qoomon tool's README: an empty `commitScopes` disables scope validation; a
non-empty one rejects unlisted scopes. So `blueprint(...)` fails everywhere on
type; `docs(architecture):` fails once init has filled project ids. vwf files
mandating a rejected prefix: `plugins/vwf/skills/git-workflow/SKILL.md:179-180`
("Common types: `feat`, `fix`, `refactor`, `wip`, `blueprint`, `test`, `ops`,
`docs`, `merge`"), `plugins/vwf/skills/change-plan/SKILL.md:72-73` (same list),
`plugins/vwf/skills/product/SKILL.md:131,134,135` (`blueprint(product):`),
`plugins/vwf/skills/design-system/SKILL.md:205`,
`plugins/vwf/skills/blueprint/SKILL.md:535`,
`plugins/vwf/skills/plan/SKILL.md:355`,
`plugins/vwf/skills/feedback/SKILL.md:156`,
`plugins/vwf/skills/setup/SKILL.md:204` (anchor "`/vwf:git-workflow` with a
`chore(vwf):` or `docs:` message"), `plugins/vwf/skills/mockups/SKILL.md:74,139`
(`chore(vwf):`). Scoped but type-valid, and made bare by ruling 3:
`plugins/vwf/skills/architecture/SKILL.md:411,415-418` (`docs(architecture):`),
`plugins/vwf/skills/archive/SKILL.md:140` (`docs(plan):`),
`plugins/vwf/skills/screens/references/prompt-mode.md:93` and
`import-mode.md:77` (`docs(prompts):`). Already conformant, untouched:
`handoff/SKILL.md:76,86` (`wip:`, `ops:`), `init/SKILL.md:81` (`ops:`),
`change-execute/SKILL.md:167` (`docs:`), every `docs: nothing contradicted`
report string. No hit in `plugins/vwf/agents/`, `hooks/`, `assets/`. No
`config_format` bump: `vwf-config.md:241` bumps only when a key's shape changes.
Docs restating a prefix:
`site/src/content/docs/plugins/vwf.md:1025-1026,
1826-1829, 2073, 2080, 2377`,
`site/src/content/docs/how-to/operate/ad-hoc-change.md:73-75`,
`.claude/skills/vwf-plugin/SKILL.md:71`.

**Gap 3 — reviewer wording.** `plugins/vwf/agents/product-reviewer.md:45-50`,
item "Validation vocabulary": "… no row has an empty Status
(`untested |
validated | invalidated`), and a row whose status left `untested`
carries Evidence." The source rule,
`plugins/vwf/skills/product/references/validation.md:23-24`: "the `Evidence`
cell is a link or one-line source, required the moment status leaves `untested`"
— unambiguous. Checklist shape shared by `blueprint-reviewer`,
`design-system-reviewer`, `blueprint-coherence-reviewer`: "- [ ] **Label**:
assertion; … is a gap". Invertible items in
`plugins/vwf/agents/blueprint-reviewer.md`: `:49-52` ("is a gap unless the
orchestrator passed a matching waiver" — the waiver clause trails), `:93-95`
("carries the default token … only a missing cell is a gap"), `:233-235` (the
deviation-note/waiver double negative). `design-system-reviewer.md` is clean.
Table format: `plugins/vwf/assets/templates/product.md:107-108`.

**Gap 4 — the stack-template contract.** `plugins/vwf/assets/stack-adapter.md`
delegation protocol `:108-152`; invocation shape `:112-128` — the two adapter
skills, `/<plugin>:<plugin>-stack-menu` and
`/<plugin>:<plugin>-stack-template <slug>`, plus "**The catalog handover.**
Every `-stack-template` invocation passes the principles-catalog asset paths
(`${CLAUDE_PLUGIN_ROOT}/assets/principles/index.md` and its entries) alongside
the slug — the design-adapter payload style"; template payload `:220-243`;
conventions fetch `:245-282`; materialized variant `:284-320` (`:296-300`
`language_facts`, `:305-309` materialization at first pin). The contract carries
**no target repo**. `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`:
`argument-hint:
"<slug>"` (`:9`); description `:3-8` names the callers
architecture, setup, plan, execute; `:31-32` reads
`.claude/stackgen/templates/<slug>.md` at the repo root (cwd); `:139-142` "**The
target repo is the current one by default.** In a multi-repo product the caller
may name a member repo; each repo gets its own independent copies and its own
lockfile" — no shape for naming it; `:143-147` the catalog handover; `:106-109`
"**Dispatch is per component; landing is per bundle.** … the user consents to
one landing set and gets one commit". `references/generator.md:12-27`
preconditions — halts without the catalog paths;
`references/materializer.md:9-15` inputs include "The target repo root — the
current repo by default; in a multi-repo product the caller may have named a
member repo instead"; the lockfile is `.claude/stackgen/lock.yaml` per repo
(`assets/output-tree.md:41`, `materializer.md:166`). vwf callers:
`/vwf:architecture` **never invokes** `-stack-template` — its Step 5 is "Write"
(`architecture/SKILL.md:308-335`, the writer dispatch); the only materialization
prose is `references/stack-menu.md:124-129`. `plan/SKILL.md:168-176` and
`execute/SKILL.md:303-312` fetch conventions by slug only;
`execute/SKILL.md:289-302` resolves which repo a worktree is of under
`linkage: siblings` but never hands it to the fetch. `setup/SKILL.md:80-90`
reads the lockfile for the shape check;
`setup/references/onboard-pipeline.md:104-118` asks the adapter by contracted
name and `:125-128` leaves an unsettled axis unrecorded. Target-repo derivation:
`vwf-config.md:54` `linkage: submodule | siblings`; `:58-62` `members:` entries
`{name, path, url, projects: [names]}` — the repo of a project is the member
whose `projects:` lists it, its `path` relative to the base root; a project no
member lists is the base's. The checker's rule 9 (`scripts/src/check.ts:1187`)
asserts only that the two adapter skills exist under the `vwf-stack-adapter`
keyword — no argument shape — so the contract field needs no checker change.
Docs describing today's flow:
`site/src/content/docs/plugins/vwf.md:650-652,
1220-1223`,
`.claude/skills/vwf-plugin/references/skills-and-agents.md:28`,
`.claude/skills/vwf-plugin/references/assets.md:24`,
`site/src/content/docs/plugins/stackgen.md:155`, `CLAUDE.md:239-274` (the
workflow paragraph).

**Gap 5 — the axis states and the two-pass.** `vwf-config.md:140-178`: three
states since format 16 — pinned (a slug / non-empty list), decided-none (`[]`,
list axes only), deferred (`unresolved`, the bare scalar on every axis);
`:174-178` the tolerance table — `doctor` a degradation, `setup` "records what
it could not provision and names the unlock; never halts on it",
`plan`/`execute` **halt**. The pin `projects.<name>.stack.template` lives only
in `.config/vwf.yaml` (`:74`), written by the architecture **skill** (Step 3b,
`architecture/SKILL.md:20`); `registry.yaml` holds no stack
(`agents/architecture-writer.md:35,71`). Doctor: `stack-checks.md:29-35` the
conditional-severity table (`:31` "**unknown language** (§3) | that project's
`template` is **pinned**"; `:34` "The severity follows the pin, never the
calendar"); `:47-49` the materialized escape; `:59-60` the unknown-language
check; `doctor/SKILL.md:60-64` "**Unavailable ≠ missing ≠ unknown.**"; `:160`
"### 9. Report & persist", report kinds `:178-196`. Setup:
`setup/SKILL.md:188-193` "**Halt on a `blocking` finding, and revert the
stamp**"; `:191-192` "A language no installed stack plugin declares is the
blocking kind"; `:215-221` "**Chain forward.** Print the ordered chain and stop"
/ `:220` "**setup runs none of them**"; `:86-95` Step 0 cites doctor's six shape
predicates. Setup on a re-run compares only the two stamps
(`setup/SKILL.md:134`); nothing flows back from the registry. 95octane's block:
its pins predate materialization, so doctor read the languages as unknown under
a pinned template — the fourth state the table lacks, "pinned, never
materialized".

**Gates.** Pre-commit (`.config/pre-commit-config.yaml`) runs `code:format`,
`code:lint`, `code:sec`, `code:git-config`, then `p:plugins:npm-normalize-test`,
`marketplace --check`, `inventory --check`, `check`, `shellcheck`, the
pre-commit-hooks set and conventional-commits. `plugins.yml` runs the plugin
tasks, a tag-exists check, `vitest`, `tsc`. `site.yml` runs `p:site:check`.
There is no `p:plugins:version` task — a plugin version is the `version` field
of `plugins/<name>/.claude-plugin/plugin.json`. `plugins/**/*.md` is
dprint-excluded (`.config/dprint.json:9`) — fold by hand to the surrounding
width; `CLAUDE.md`, `readme.md`, `site/**` are formatted at 80.

**Commit convention of this repo.** `.config/git-conventional-commits.yaml`
allows six types — `ops`, `docs`, `merge`, `feat`, `fix`, `refactor` — and
`commitScopes: []`. Every unit commit is a bare type.

## Assumed decisions — confirm or override at review

| #  | Decision                               | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Rejected                                                                               | Unit       |
| -- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| 1  | Flutter pack version                   | The flutter pack bumps `0.2.0` → `0.3.0`; the `dart-flutter` bundle re-pins `app-framework/flutter@0.3.0`; the orchestrator regenerates `inventory.md` into U1's commit so pack, pin and inventory land together.                                                                                                                                                                                                                                        | patch — a widened platform list is a wider contract, which reads as minor              | U1         |
| 2  | Where the `auto` pairing rule lives    | "`auto` is only ever declared **alongside** `mobile`, never alone, and never as its own project" is prose in two places: the `dart-flutter` bundle body (which says *why* — in-car is not a fifth build target but the same mobile binary reaching CarPlay / Android Auto through the `swift` and `kotlin` platform edge the pack already declares) and vwf's `platforms.md` vocabulary rule. No doctor predicate.                                       | a doctor predicate (a stackgen-specific rule in a stack-agnostic checker); bundle-only | U1         |
| 3  | The commit convention vwf skills adopt | Bare `docs:` — no scope — for every blueprint-tree commit (product, architecture, blueprint, design-system, plan, screens, archive, feedback); `chore(vwf):` becomes `ops:` (the pack absorbs chore into ops). The "Common types" lists in git-workflow and change-plan become the pack's ten, verbatim: `feat`, `fix`, `perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`, `wip`. No init change, no format bump.                             | init fills a fixed `blueprint` scope; init fills per-doc scopes                        | U2, U4, U5 |
| 4  | Reviewer wording                       | The product-reviewer item is rewritten trigger-first: "Evidence is required **only** once Status is `validated` or `invalidated`; a row still `untested` correctly carries `—` and is **not** a gap." The three blueprint-reviewer items at `:49-52`, `:93-95`, `:233-235` are rewritten the same way — trigger first, the non-gap case stated explicitly — with no change in meaning.                                                                   | product-reviewer only                                                                  | U3         |
| 5  | How the target repo travels            | The invocation's argument stays `<slug>`. The target repo travels as one optional line beside the catalog paths, in the same payload style: `repo: <path>` — the member's `path` relative to the base root, resolved as the member whose `projects:` lists the project; absent means the current repo. stackgen documents receiving it; the materializer writes there and keeps that repo's own lockfile. Every vwf caller passes it under `multi-repo`. | a second positional argument; passing it only under `siblings`                         | U4, U6     |
| 6  | Batching                               | One landing per (repo, slug), deduped: setup groups the projects whose axis holds a slug not yet materialized in their target repo, dedupes by slug per repo, and invokes stackgen once per (repo, slug) in registry order. stackgen's landing rule ("one landing set, one commit" per slug) is unchanged.                                                                                                                                               | one landing per repo (a stackgen landing-rule and consent-shape change)                | U5         |
| 7  | Where setup's materialize pass lives   | A new reference `plugins/vwf/skills/setup/references/materialize.md`, invoked from `SKILL.md` as its own step after the shape pass (Step 0) and before the doctor gate. An `unresolved` axis is skipped silently. A declined landing is reported by setup, the pin stays, and doctor's block stands as today (setup halts and reverts the stamp).                                                                                                        | inline in SKILL.md; continue past a decline with a warning                             | U5         |
| 8  | Architecture's handoff                 | Architecture's last step (Step 7, after its commit) **invokes `/vwf:setup` in-session**, the way setup invokes init today. No step is added or renumbered in architecture. `stack-menu.md:124-129` is rewritten to say materialization is setup's.                                                                                                                                                                                                       | print `/vwf:setup` as the next command and stop                                        | U4         |
| 9  | What setup writes on an undecided axis | Setup writes `unresolved` only for an **absent** project axis (or repo axis) on a repo architecture has not run on, and continues. A pinned slug is never rewritten — a pin the adapter never materialized is exactly what the materialize pass lands.                                                                                                                                                                                                   | rewrite the stale pin to `unresolved` with the old slug in `note:`                     | U5         |
| 10 | Doctor's new finding line              | "pinned, not materialized — `/vwf:setup` materializes it": one distinct finding for a project whose `template` is a slug, whose adapter is a materializing one, and whose target repo has no materialized entry. Still **blocking** — "the severity follows the pin, never the calendar" stands. Reached only after a declined landing or on a repo setup has not re-run on. `unresolved` stays a degradation.                                           | downgrade to a degradation until architecture has run                                  | U7         |
| 11 | Unit commit types                      | This repo's six types, bare: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`.                                                                                                                                                                                                                                                                                                                                                                          | —                                                                                      | all        |

## New dependencies

none

## Units

| Id | Wave | Unit file                                                    | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Depends on | Status | Commit   |
| -- | ---- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-flutter-auto.md](01-flutter-auto.md)                     | `plugins/stackgen/stacks/bundles/dart-flutter.md`, `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`, `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/pick-and-trade.md`, `plugins/vwf/skills/architecture/references/platforms.md`, `plugins/vwf/agents/architecture-writer.md`, `plugins/vwf/skills/setup/references/topology-detection.md`, `plugins/vwf/assets/topologies/repo.md`, `plugins/vwf/assets/templates/registry.yaml`; `plugins/stackgen/stacks/inventory.md` regenerated by the orchestrator before U1's commit | —          | green  | 0c09a35c |
| U2 | 1    | [02-commit-convention.md](02-commit-convention.md)           | `plugins/vwf/skills/git-workflow/SKILL.md`, `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/product/SKILL.md`, `plugins/vwf/skills/design-system/SKILL.md`, `plugins/vwf/skills/blueprint/SKILL.md`, `plugins/vwf/skills/feedback/SKILL.md`, `plugins/vwf/skills/mockups/SKILL.md`, `plugins/vwf/skills/archive/SKILL.md`, `plugins/vwf/skills/screens/references/prompt-mode.md`, `plugins/vwf/skills/screens/references/import-mode.md`                                                                                                         | —          | green  | f1d8ea85 |
| U3 | 1    | [03-reviewer-wording.md](03-reviewer-wording.md)             | `plugins/vwf/agents/product-reviewer.md`, `plugins/vwf/agents/blueprint-reviewer.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —          | green  | 5b80a6e3 |
| U4 | 1    | [04-contract-and-callers.md](04-contract-and-callers.md)     | `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/skills/architecture/SKILL.md`, `plugins/vwf/skills/architecture/references/stack-menu.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/execute/SKILL.md`                                                                                                                                                                                                                                                                                                     | —          | green  | 6d03a4b1 |
| U5 | 1    | [05-setup-materializes.md](05-setup-materializes.md)         | `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/onboard-pipeline.md`, `plugins/vwf/skills/setup/references/materialize.md` (new)                                                                                                                                                                                                                                                                                                                                                                                                       | —          | green  | e1e36d23 |
| U6 | 1    | [06-stackgen-receives-repo.md](06-stackgen-receives-repo.md) | `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`                                                                                                                                                                                                                                                                                                                                                                                                                         | —          | green  | 61ff59aa |
| U7 | 1    | [07-doctor-line.md](07-doctor-line.md)                       | `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —          | green  | 3dc8fc58 |
| U8 | 2    | [08-docs.md](08-docs.md)                                     | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/plugin-authoring/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-13-consumer-gaps.md`, every `DOCS FALSIFIED:` path                                                                                                                                                                                                                                                                                            | U1–U7      | green  | 69995dd6 |
| U9 | 3    | [09-gates-and-bump.md](09-gates-and-bump.md)                 | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` (regenerated, expected no diff after U1)                                                                                                                                                                                                                                                                                                                                 | U8         | green  | dde86331 |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                           | Why it collides                                                                          | Owner                                                                                    |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`                                       | version file                                                                             | U9 only                                                                                  |
| `plugins/stackgen/.claude-plugin/plugin.json`                                  | version file                                                                             | U9 only                                                                                  |
| `site/package.json`                                                            | version file, bumped by a task that refuses a dirty tree                                 | U9 only, first                                                                           |
| `.claude-plugin/marketplace.json`                                              | generated; regenerating mid-wave races                                                   | U9 only                                                                                  |
| `plugins/stackgen/stacks/inventory.md`                                         | generated; must land with `pack.yaml` and the bundle pin in one commit                   | U1's commit — regenerated by the orchestrator, edited by no one; U9 re-runs it (no diff) |
| `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`                      | pack version; the bundle pin and the inventory must move with it                         | U1 only                                                                                  |
| `plugins/vwf/skills/architecture/SKILL.md`                                     | gap 2's `docs(architecture):` lines and gap 4's handoff step                             | U4 only — carries ruling 3 for its four prefix lines                                     |
| `plugins/vwf/skills/plan/SKILL.md`                                             | gap 2's `docs(plan):` line and gap 4's conventions fetch                                 | U4 only — carries ruling 3 for its prefix line                                           |
| `plugins/vwf/skills/setup/SKILL.md`                                            | gap 2's `chore(vwf):` line and gap 5's materialize pass                                  | U5 only — carries ruling 3 for its prefix line                                           |
| `plugins/vwf/skills/setup/references/topology-detection.md`                    | a setup reference with a "four platforms" passage                                        | U1 only — U5 never opens it                                                              |
| `plugins/vwf/assets/vwf-config.md`                                             | gap 1's "mobile+tablet+desktop+webapp" comment and gap 5's `unresolved` writer sentences | U4 only — carries the `auto` edit for its `:74` comment                                  |
| every human-facing doc under U8's Owns                                         | n units editing one doc                                                                  | U8 only                                                                                  |
| `plugins/vwf/assets/membership.md`, `assets/memory.md`, `assets/principles/**` | cited by several units                                                                   | nobody — cited, never edited                                                             |

## Waves

- **Wave 1 — U1–U7.** Seven units on disjoint paths. Every ruling each needs is
  quoted in its file, and the one spelling three of them share — the `repo:`
  line of decision 5 — is fixed here, so U4, U5 and U6 do not wait on one
  another. The orchestrator regenerates `inventory.md` before committing U1.
- **Wave 2 — U8.** Docs, after every plugin edit is committed, so
  `vwf:docs-sync` reads the whole delta.
- **Wave 3 — U9.** Versions and generated files, after the docs, so the
  marketplace manifest is regenerated once.

## Wave gate

```text
mise run p:plugins:marketplace --check
mise run p:plugins:inventory --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line is
green before wave 1. Two expected transients: `p:plugins:inventory --check` is
red between U1's `pack.yaml` edit and the orchestrator's regeneration, and
`p:plugins:marketplace --check` is red between U9's version edits and its
regeneration; both are green again inside the same unit's commit.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                          |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | Stages vwf and stackgen into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugins. |

No release step. The tags wait for a later `/release`.

## Gates the orchestrator keeps

**The materialize fixture**, run after wave 1 and again before landing. It
follows the **edited** setup prose from the worktree — the orchestrator (or a
subagent it dispatches with the worktree's `plugins/vwf/skills/setup/`,
`plugins/vwf/skills/doctor/`, `plugins/vwf/assets/` and `plugins/stackgen/`
paths as the skills, the assets and the packs) executes `setup/SKILL.md` and its
references verbatim against the fixture; the installed plugin is **not** what is
being tested. Each pass condition names the ruling it proves.

1. **Build.** Under `mktemp -d`: two repos, `member/` and `base/`, each
   `git init -b develop` with a throwaway identity. `member/` carries a minimal
   Flutter-shaped tree (`pubspec.yaml`, `lib/main.dart`) and a readme; commit.
   `base/` carries a readme, `docs/blueprint/registry.yaml` declaring one
   project `app` with `platforms: [mobile, auto]`, and a `config_format: 18`
   `.config/vwf.yaml` with `topology: multi-repo`, `linkage: submodule`,
   `members:` naming `member` at path `member` with `projects: [app]`, and
   `projects.app.stack.template: project/dart-flutter` with `languages: []`, no
   `backing_template`/`deploy_template` (absent);
   `git submodule add
   ../member member`; commit. Nothing is materialized
   anywhere — no `.claude/stackgen/` in either repo.
2. **Run** `/vwf:setup` in `base/` through the edited skill, declining the Step
   0 shape offer, and **consenting** at the one landing.
3. **Pass conditions:**
   - setup does **not** halt before its materialize pass, and the pass names
     exactly **one** landing, for `(member, project/dart-flutter)`, with the
     invocation carrying `repo: member` and the catalog paths [decisions 5, 6];
   - after the consent, `member/.claude/stackgen/lock.yaml` exists and names
     `project/dart-flutter`, and `base/.claude/stackgen/lock.yaml` either does
     not exist or does not name it [decision 5];
   - `base/.config/vwf.yaml` now reads
     `projects.app.stack.backing_template:
     unresolved` and
     `deploy_template: unresolved` — the absent axes written as deferred — and
     `template:` is still `project/dart-flutter` [decision 9];
   - doctor's platform-coverage check reports `app`'s template as covering
     `auto` [gap 1 — the edited bundle lists it];
   - setup reaches its stamp step and chains forward [decision 7].
4. **Idempotency.** Run `/vwf:setup` in `base/` again. Pass: the materialize
   pass proposes **no** landing and says every pinned axis is materialized
   [decision 6].
5. **The decline.** Rebuild step 1 and run setup **declining** the landing.
   Pass: setup reports the declined landing, `template:` is unchanged, no
   lockfile appears in either repo, and doctor reports the distinct "pinned, not
   materialized — `/vwf:setup` materializes it" finding as blocking [decisions
   7, 10].
6. Remove the temp dir. Record in the run log which of steps 3–5 passed and, for
   any that did not, the exact row or path that differed.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore`, `git stash` or a
formatter's `--fix` outside its own Owns.

A unit returns exactly this block and nothing else — no file contents, no diff —
and keeps it under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **The consumer's own drift** — its trimmed
  `.config/git-conventional-commits.yaml` (`state: differs` in its lockfile,
  `/stackgen:stackgen-sync`'s business), its diverged `setup/ai` task, its astro
  dependency advisory. Named in the request as not plugin gaps.
- **Per-repo batching in stackgen** — decision 6 keeps the per-slug landing
  rule; batching N slugs into one consent is a stackgen consent-shape change
  nobody asked for.
- **A doctor predicate for the `auto` pairing** — decision 2; prose only.
- **A `config_format` bump** — no key changes shape (`vwf-config.md:241`).
  `not-applicable` and a secrets axis, which would need one, are plan 2's.
- **A separate `auto` bundle** — the request forbids it; `auto` rides the
  Flutter template.
- **`documentation-standards/SKILL.md:48`** — its CHANGELOG types line (`feat`,
  `fix`, `refactor`) is a subset of the pack's changelog types, not a
  contradiction; untouched.

## Parked

- **Plan 2 — the elicitation redesign** (`requires:` this plan). The user's
  words, 2026-09-13: *"Ask user whether the repo (and sub-repos/modules) are
  `public` or `private`. These answers will help you decide what license to
  select (like public will have further options but private will be none).
  Similarly if the user is hosting their repo in github or gitlab (either ask or
  detect from git-remote) then you know most likely they will use github-actions
  or gitlab-cicd … They can still use 3rd party for cicd like google's cloud
  build. Idea is that we ask limited questions so that we derive all the
  answers."* And: *"for each repo you can ask for programming language and then
  depending on the repo type you can filter the bundles. Like if user selects
  `typescript` for a particular repo, and you know it's website then you can
  only ask what type of website (Astro-SSG, Astro-Hybrid, Astro-SSR, etc). Using
  effect or not is by design of the bundle user selects."* Its pieces: (a)
  init/setup/architecture ask high-level questions and derive the rest; (b)
  **`not-applicable`** as a fourth axis state on every axis — *"my website will
  never have secrets so instead of marking that repo as unresolved, it's better
  to mark it as not applicable. Now if that ever changes, architecture will
  change it from not applicable to unresolved and setup will pin the stack"* —
  set and lifted by architecture only; (c) the secrets provider becomes a
  recorded per-repo axis (today init's question 4 writes no key,
  `init/references/new-repo.md:82-85`), which is a `config_format` 19 bump; (d)
  **keep or retire stackgen's generate-for-anything-uncovered path** — a
  reversal candidate of
  `docs/memory/decisions/2026-08-19-stackgen-dispatch-and-agents-tree.md` and
  the "stackgen scope" memory; the user's stated lean is retire: *"I want this
  plugin to deliver best quality output and I am not getting confidence on it if
  the stack doesn't exist in stackgen."*
- **`vwf-config.md:51,89,108` say "format 19"** meaning the blueprint line (the
  config's `11 → 12` migration, `:331`) — a wording bug beside U4's file,
  untouched here.
- **`format-check.md` compares only `blueprint_format`** (`:10-12`) though
  `format-lineage.md:18-20` says it compares both stamps.
- **This repo's own root convention file** is a six-type hand-written variant
  (no `wip`, `perf`, `revert`, `test`) — already parked as "plan 2 reshapes
  claude-plugins" in the 2026-09-05 rollout.
- **Doctor predicates for `MERGE_MODEL` and `MEMBERS` drift** — carried from the
  task-library plan's Parked list.

## Run log

| Wave | Unit         | Model | Round | Outcome                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Commit   |
| ---- | ------------ | ----- | ----- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight    | —     | 1     | green                   | All nine gate lines green on the branch point `d75f1927`. GAP: the two `--check` lines need mise's `--` separator (`mise run p:plugins:marketplace -- --check`); run that way throughout. Worktree bootstrap's `setup:deps:outdated` and `setup:deps:audit` fail on pnpm v12 flag changes — pre-existing, advisory, deps installed.                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | U2           | opus  | 1     | green                   | 10 files: both types lists → the pack's ten; `blueprint(...)`/`docs(x):`/`chore(vwf):` → bare `docs:`/`ops:`. DECIDED: product's examples keep their subjects rather than a literal `docs: product —` prefix. DOCS FALSIFIED: vwf.md :1025-1026, :1826-1829, :2073, :2080, :2377; ad-hoc-change.md:73-75; .claude/skills/vwf-plugin/SKILL.md:71. GAP: none.                                                                                                                                                                                                                                                                                                                                                             | f1d8ea85 |
| 1    | U3           | opus  | 1     | green                   | product-reviewer Validation item trigger-first, `untested` + `—` explicitly not a gap; blueprint-reviewer three items rewritten trigger-first. DECIDED: fold points keep "is **not** a gap" on one line for the grep. DOCS FALSIFIED: none. GAP: none.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 5b80a6e3 |
| 1    | U6           | opus  | 1     | green                   | stackgen-stack-template SKILL.md + materializer.md: `repo: <path>` line beside the catalog paths governs reads, writes and the lockfile; description says setup materializes, the other three fetch. DECIDED: all four callers kept in the description with their role; submodule case phrased without vwf's `linkage:` key. DOCS FALSIFIED: stackgen.md:387-388, :820. GAP: none.                                                                                                                                                                                                                                                                                                                                      | 61ff59aa |
| 1    | U1           | opus  | 1     | green                   | pack.yaml 0.3.0 + `auto`; dart-flutter.md re-pinned, five platforms, the alongside-`mobile` rule and why; pick-and-trade, platforms.md, architecture-writer, topology-detection, repo.md, registry.yaml — four → five. DECIDED: pack summary "mobile, tablet, desktop, web and in-car through the native edge" — the plan's sample wording contained the string its own grep forbids. DOCS FALSIFIED: ui-with-design-tool.md:81, choosing-your-stack.md:45, stackgen.md:200,696, vwf.md:594,611,1305,1356, docs-tree.md:16, checks.md:253. GAP: none. inventory.md regenerated by the orchestrator before commit.                                                                                                       | 0c09a35c |
| 1    | U7           | opus  | 1     | green                   | stack-checks.md: third severity row "pinned, not materialized" (blocking, never a degradation), materialized-escape read names the target repo, unknown-language branch checks that state first; doctor SKILL.md: "≠ not materialized", §9 lists the finding once per project. DECIDED: the four-segment table row split across the three columns + a prose paragraph. GAP: edit 3 found no `/vwf:architecture`-as-remedy passage in doctor; nothing changed, remedy stated in both files. DOCS FALSIFIED: none.                                                                                                                                                                                                        | 3dc8fc58 |
| 1    | U4           | opus  | 1     | green                   | stack-adapter.md: "The target repo." `repo: <path>`, per-(plugin,repo,slug) dedupe, materialization moved to setup's pass; vwf-config.md: `unresolved` also from setup on an absent axis, tolerance row rewritten, `:74` +auto; architecture SKILL.md Step 3b records only, Step 7 bare `docs:` then invokes /vwf:setup in-session; stack-menu.md, plan, execute pass `repo:` and dedupe. DECIDED: `repo:` shown as a one-line YAML block, not a table row. DOCS FALSIFIED: vwf.md:650-652,1220-1223,1025-1026,1826-1829,2073,2080,2377; assets.md:24; skills-and-agents.md:28; stackgen.md:155; CLAUDE.md:239-274. GAP: none.                                                                                          | 6d03a4b1 |
| 1    | U5           | opus  | 1     | green                   | materialize.md new; setup SKILL.md gains `## The materialize pass` after Step 0, `current` runs it before its report, doctor-gate decline path, `chore(vwf):` → `ops:`; onboard-pipeline.md reversed to write `unresolved` on an absent axis. DECIDED: the pass runs in every mode (mode `current` exits before the spine, and architecture's handoff lands there); "absent axis" = missing key in an existing block, never a missing block. DOCS FALSIFIED: vwf.md:1261-1264, :1285-1295; vwf-config.md:164-166 (U4). GAP: decision 7 reads spine-only — assumed every mode; whole `projects:` block absent — assumed left alone.                                                                                      | e1e36d23 |
| 1    | R1           | opus  | 1     | findings(9)             | RULINGS: U6 description keeps `/vwf:architecture` as a fetching caller of `-stack-template` (decision 8 / reversal 1). U5 materialize.md:110-116 decline prose assumes the spine (stamp revert) but the pass also runs in `current`. Fold/orphan lines: U1 platforms.md:25; U6 SKILL.md:35; U7 doctor SKILL.md:61,175; U4 stack-menu.md:137, plan SKILL.md:183, execute SKILL.md:320. CONTRACT: clean.                                                                                                                                                                                                                                                                                                                  | —        |
| 1    | U5           | opus  | 2     | green                   | materialize.md decline prose split by mode: `onboard`/`migrate` halt-and-revert per decision 7; `current` reports the decline, pin stays, doctor on demand / next spine run halts. setup SKILL.md doctor-gate paragraph mirrors it. DECIDED: the difference is *when* the block lands, never *whether*. GAPs held from round 1.                                                                                                                                                                                                                                                                                                                                                                                         | e1e36d23 |
| 1    | U6           | opus  | 2     | green                   | description drops `/vwf:architecture` from the caller list (setup materializes a first pin, plan and execute fetch); step 1 paragraph re-wrapped to 79. RULINGS residue resolved.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 61ff59aa |
| 1    | U1           | opus  | 2     | green                   | platforms.md paragraph re-wrapped whole at ~79; the other seven files swept, already within fold (registry.yaml:55 pre-existing 126-char line untouched).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 0c09a35c |
| 1    | U7           | opus  | 2     | green                   | doctor SKILL.md: the three broken paragraphs re-wrapped; the report-kind entry grew by decision 10's own clause ("reached only after a declined landing…", "never `/vwf:architecture`") to wrap without an orphan. stack-checks.md unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 3dc8fc58 |
| 1    | U4           | opus  | 2     | green                   | stack-menu.md, plan SKILL.md, execute SKILL.md orphans gone (plan's `repo:` paragraph moved after the original, not inside it); stack-adapter.md and architecture SKILL.md citation lines re-wrapped. DECIDED: vwf-config.md's long lines left — that file runs 107–869 chars by design.                                                                                                                                                                                                                                                                                                                                                                                                                                | 6d03a4b1 |
| 1    | R1           | opus  | 2     | findings(4) — contested | All nine round-1 findings resolved; CONTRACT clean; RULINGS clean. Four new, left `contested` at the two-round cap: doctor SKILL.md:172-174 [U7] third em-dash opens an aside never closed, the next blocking item reads as gloss; materializer.md:167-171 [U6] collision-check paragraph unreflowed (42/63/21/54 vs ~68); materialize.md:142,:126 [U5] 59/61-char orphans at ~79; doctor SKILL.md:200 [U7] 60-char line at the kind join.                                                                                                                                                                                                                                                                              | —        |
| 1    | F1 fixture   | opus  | 1     | pass                    | Materialize fixture after wave 1: steps 3a–3e, 4, 5 all pass (one landing for (member, project/dart-flutter) with `repo: member` + catalog paths; member lockfile only; both absent axes → `unresolved`, template untouched; coverage includes `auto`; stamp + chain; idempotent; decline → doctor blocking "pinned, not materialized"). Tier-3 local LSP manifest writes declined (outside temp dir). PROSE DEFECTS (pre-existing, not this plan's): (1) slug spelling — vwf writes `project/<slug>`, stackgen resolves `bundles/<slug>.md` / `templates/<slug>.md`; (2) `stacks:` roster key absent from the config_format 18 schema in vwf-config.md though stack-adapter.md:55 requires it; (3+) see follow-up row. | —        |
| 1    | F1 fixture   | opus  | 1     | prose defects           | (3) nothing backfills `languages:` after a landing — vwf-config.md:84 makes `[]` legal only under `unresolved`, but a pinned-then-landed project keeps `[]` while the payload carries `[dart, kotlin, swift]`; neither materialize.md nor setup SKILL.md writes them back — pre-existing, outside the plan, reported. (4) materializer.md:185 "Declined → … the pin stays unresolved" contradicts decision 9 — inside U6's Owns, re-dispatched once as the mechanical re-dispatch (gate finding, no ruling needed).                                                                                                                                                                                                     | —        |
| 1    | U6           | opus  | 3     | green                   | materializer.md decline outcome: writes nothing, leaves the caller's pin as it was, tells the caller the slug is pinned but not materialized; `/vwf:doctor` named as owner of the standing state (decision 10). Zero `unresolved` hits under the skill. Committed after U8 returned (pre-commit stash vs in-flight writes).                                                                                                                                                                                                                                                                                                                                                                                             | 321e8851 |
| 2    | U8           | opus  | 1     | green                   | 14 files: vwf.md (five surfaces, architecture records + invokes setup, new `#### The materialize pass`, `unresolved` on an absent axis, doctor's new finding, mermaid edge), stackgen.md, choosing-your-stack, ui-with-design-tool, single-repo, multi-repo, migrate-old-vwf-repo, CLAUDE.md, vwf-plugin SKILL + assets + skills-and-agents + dependencies, stackgen-plugin SKILL, decision doc new. DECIDED: one anchor heading for four links; no readme.md edit (nothing falsified). GAP: units' DOCS FALSIFIED line numbers largely wrong — re-located by content; gap 2 has zero doc impact. GAP: `code:format --fix` re-padded this plan's tables (whitespace).                                                   | 69995dd6 |
| 2    | R2           | opus  | 1     | findings(2)             | decision doc :155 ends with `</content>`/`</invoke>` tool-call residue; onboard-existing-codebase.md:375 "When things halt" lacks the pinned-not-materialized bullet its sister migrate-old-vwf-repo.md gained. CONTRACT clean, RULINGS clean; forbidden-token greps empty across every doc tree; all six `#the-materialize-pass` links resolve.                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 2    | U8           | opus  | 2     | green                   | decision doc residue removed, ends on the last Parked bullet; onboard-existing-codebase.md gains the pinned-not-materialized bullet via this journey's route (a declined landing), unknown-language bullet now "most often". p:site:check green (549 fragments).                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 69995dd6 |
| 2    | R2           | opus  | 2     | pass                    | Both round-1 findings resolved; FINDINGS 0; CONTRACT clean; RULINGS clean.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 3    | U9           | opus  | 1     | green                   | site 1.1.8 → 1.1.9 via `p:site:version` (first, clean tree); vwf 19.19.0 → 19.20.0; stackgen 1.8.1 → 1.9.0; marketplace.json regenerated (stackgen-v1.9.0, vwf-v19.20.0); inventory regenerated, no diff. All nine gate lines green by the unit. GAP: none.                                                                                                                                                                                                                                                                                                                                                                                                                                                             | dde86331 |
| 3    | R3           | opus  | 1     | pass                    | FINDINGS 1 — the orchestrator's own U9 run-log row, mis-ordered mid-table (fixed). U9's set exactly within Owns; versions match the consent block; marketplace.json differs from HEAD in exactly the four ref/version lines; three gate tasks re-run green. CONTRACT clean, RULINGS clean.                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 3    | orchestrator | —     | —     | note                    | U9's first commit attempt failed lint: F2 (the fixture runner) had read its temp-dir path through the `cat`→`bat` alias and a directory named with the rendered ANSI/box-drawing output appeared in the worktree root (ENAMETOOLONG in the house linter). Removed by the orchestrator; F2 warned; second attempt committed.                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 3    | gate         | —     | 1     | green                   | All nine wave-gate lines green on `dde86331` (site: 24 pages, 1549 links, 549 fragments resolve).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 3    | F2 fixture   | opus  | 2     | pass                    | Pre-landing fixture: steps 3a–3e, 4, 5 all pass on the committed tree; step 5 confirms the corrected decline path — pin untouched, no lockfile anywhere, materializer tells the caller "pinned but not materialized", doctor raises the blocking finding naming repo `member`. Target repo resolved base-relative (`base/member`). PROSE DEFECT (5): stack-checks.md:78 raises the per-project finding inside §3's per-token loop, unreachable for `languages: []` — inside U7's Owns, re-dispatched once (mechanical, no ruling). Residue: F2 read its temp path via the `cat`→`bat` alias, see the orchestrator note above.                                                                                           | —        |
| 3    | U7           | opus  | 3     | green                   | stack-checks.md §3 opens with a per-project gate before the token walk: a slug pin with no lockfile entry in the target repo raises pinned-not-materialized and skips that project's token walk; `languages: []` reached the same way. Duplicate check inside the LSP bullet removed. SKILL.md needed no edit. p:plugins:check green.                                                                                                                                                                                                                                                                                                                                                                                   | 210679fb |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-13-consumer-gaps
