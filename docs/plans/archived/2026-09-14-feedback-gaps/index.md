---
type: vwf-change-plan
title: feedback — the shape-change kind, build state, a named unit, a product
  note
requires: [ docs/plans/archived/2026-09-13-vwf-process ]
backlog: [ B05 ]
---

# Plan — feedback — the shape-change kind, build state, a named unit, a product note (2026-09-14)

## Status

**COMPLETE** 2026-09-14. Commits on `2026-09-14-feedback-gaps`, in order:
`e2cf104f` (U1), `85343b1a` (U2), `d2516578` (U3), `7ab90d1b` (plan log),
`8245bf0a` (U4), plus the archive commit.

## Consent

| Action                                            | Granted                                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                                                      |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                      |
| After landing: `/release`                         | ask                                                                                                                                                                      |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U4 runs, never a 13 or 17 component; by editing the `version` field |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U4 runs it first)                                                             |
| Release stackgen publicly                         | none — untouched                                                                                                                                                         |
| Release installer publicly                        | none — untouched                                                                                                                                                         |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, `/vwf:feedback` classifies **eight** kinds. The eighth,
**Shape change**, is the report whose fix needs a new project, a changed stack
pin, a new capability or a cross-cutting foundation before any flow can be
written; it routes to `/vwf:architecture`, which hands to `/vwf:setup`'s
materialize pass itself. Every route states the **build state** of what it
touches — the owning flow's or entity's implementation stamp, and whether a
released contract snapshot exists for it — and ends with the remaining path in
one line, so the user sees "blueprint, then plan, then execute" before the one
hand-off. A **feature idea** reaches blueprint by unit name, through
`/vwf:product` first only when it implies a goal the product doc does not serve.
And `/vwf:product` accepts a **feedback note** as its argument, seeding its
delta questions. The one-hop shape — one doc edit, one offered command, one
hand-off — is kept.

No reversal. The framing is the 2026-09-13 backlog request (B05): "Add
`/vwf:feedback` skill which is used once the product is built and we want to
make changes as per user feedback", and the user's definition of the same day:
"`feedback` is different than `backlog`. `backlog` is something that can't be
picked up right now, `feedback` is something that is being worked upon and might
need change in `product`, `blueprint`, `architecture`, etc. It will then follow
the `plan` and `execute` workflow." The backlog's note "parked from 2026-09-08:
feedback routing a non-blueprint fix into change-plan" is stale — the 2026-09-10
plan (`2026-09-10-vwf-feedback-archive-import`) landed that as the seventh kind.

## Facts the survey established

**The skill today** (`plugins/vwf/skills/feedback/SKILL.md`, 171 lines, no
`references/`). Frontmatter 1–15: `argument-hint` at 11, `model: sonnet` 12,
`effort: medium` 13, `disable-model-invocation: false` 14. Intro 17–22 — line 21
says "routes it to where it gets **fixed**, not to a backlog" (group A's U2
rewrites that sentence; edit what is on disk). Canvas harvest 24–68. §1
Understand and classify 72–94: reads `product.md`, skims plausible flow and
entity docs, recalls rooms `gaps` and `problems` (74–81); ambiguity is an MCQ
(83–84); the seven-kind table 86–94 — Behavior bug 88, Blueprint hole 89, Metric
reading 90, UX issue 91, Feature idea 92, Incident 93, Not a blueprint gap 94.
§2 Route 96–147, one bullet per kind: Behavior bug 101–106 (`/vwf:plan <slice>`;
deferred → Open Questions line), Blueprint hole 107–110
(`/vwf:blueprint <flow|entity>`), Metric reading 111–120 (dated row in
`product.md`'s Metric readings appendix; `/vwf:product` on a miss,
mandatory-offered on a `Re-evaluate if:` breach), UX issue 121–125
(`/vwf:design-system` or `/vwf:blueprint <flow>`), Feature idea 126–130
(`/vwf:product` first, then prose "the normal blueprint → plan → execute path";
never names a unit), Incident 131–139 (postmortem stub in
`docs/runbooks/postmortems.md`; action items re-enter the classifier), Not a
blueprint gap 140–147 (`/vwf:change-plan <request>`; deferred → room `gaps`
tagged `non-blueprint`). §3 Persist and commit 149–157: mempalace writes (bugs
and holes → `gaps`, incidents → `problems`, readings and routing → `decisions`),
"skip silently if mempalace is down" 153–154, the single hand-off "if the user
accepted a fixing command, hand off to it now" 156–157. Metric readings appendix
template 159–171. No route names `/vwf:architecture`; no word `stamp`,
`implementation`, `released` or `frozen` anywhere in the file; no precondition
on build state (only canvas halts, 41–45).

**Downstream mechanics that exist.** Implementation stamp
`implementation: none|partial|complete` in flow and entity frontmatter
(`skills/blueprint-authoring/references/frontmatter-and-links.md:121–148`;
templates `assets/templates/flow.md:6`, `entity.md:6`); blueprint demotes
`complete` → `partial` when a contract materially changes
(`skills/blueprint/SKILL.md:435–440`) and takes a named unit as a targeted
update (`:185–189`); blueprint's released-contract guard is additive-only or an
elicited major bump (`:361–366`, hard gap `:499–503`); plan prunes `complete`
docs from the chain and plans the delta for the requested element
(`skills/plan/SKILL.md:105–107, 115`), heals an empty delta
(`references/delta-checks.md:8–14`), refuses to plan a breaking change to a
released API (`:16–23`) and forces expand/backfill/contract steps on a
non-additive released schema (`:25–38`); execute re-stamps at Reconcile
(`assets/execute-stages.md:231–243`); verify's release freeze is the snapshot
directory `docs/blueprint/apis/released/` — `<project>@<version>.openapi.yaml`
and `entities/<entity>@<date>.schema.yaml`
(`skills/verify/references/release-freeze.md:22–41`), and nothing in
`.config/vwf.yaml` records it (`assets/vwf-config.md:256–261`). Blueprint routes
a non-trivial registry change to `/vwf:architecture` as a sub-step
(`skills/blueprint/SKILL.md:428–433`); architecture in update mode asks only
about deltas (`skills/architecture/SKILL.md:61–63`) and hands to `/vwf:setup`
in-session (`:434–449`).

**Product today.** `skills/product/SKILL.md:7`
`argument-hint: "(no args;
detects create vs update)"`; update mode 43–48
preserves confirmed content and asks only about deltas; its only feedback intake
is the Metric readings appendix (45–48); it re-runs nothing downstream.

**Enumerations of the kinds.**
`.claude/skills/vwf-plugin/references/skills-and-agents.md:36` (seven-kind row);
`.claude/skills/vwf-plugin/SKILL.md:59, 191, 199` (mentions);
`site/src/content/docs/plugins/vwf.md:1917` (heading), `1923–1943` (the kind
bullets), `1947–1948` (examples), `773` (product row's hint), `793–794` (says
feedback reaches architecture — true only after this plan), plus mentions at
267, 296, 346, 411, 789, 1362, 1894, 2259, 2325, 2406;
`site/src/content/docs/how-to/operate/production-feedback-loop.md` (section
headings 23–250; "any of seven" 188–190; "seventh kind" 243);
`how-to/operate/ad-hoc-change.md:47–48` (seven classes);
`plugins/mempalace.md:353`; `greenfield/single-repo.md:407`;
`greenfield/ui-with-design-tool.md:241`; `readme.md:22` and `CLAUDE.md:15,
240`
(intake sentences). Skills that name feedback: `verify/SKILL.md:22–24,
118–133`;
`product/SKILL.md:44–47`; `product/references/validation.md:20, 57`;
`product-foundations/references/incident-response.md:23, 42`;
`import-conversations/SKILL.md:5, 18, 25, 113`;
`agents/product-reviewer.md:66–68`; `assets/design-adapter.md:44, 93, 191`,
`vwf-config.md:305`, `elicitation.md:5`, `membership.md:113`,
`templates/product.md:55`, `templates/project-claude.md:14, 25`. No hook
mentions feedback.

**Gates and versions.** The nine wave-gate lines; no `.config/vwf.yaml` here;
commit types `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`, no scopes.
`plugins/**/*.md` is not dprint-formatted; `CLAUDE.md`, `readme.md`,
`.claude/**` and the site docs are. vwf `19.20.0` at approval; group A bumps it
first.

**Recall.** The 2026-09-10 plan's Parked list is `none`; its run log shows the
seventh kind landing at `22162e0f`. Group A's U2 rewrites `feedback/SKILL.md`
line 21 and the two manual passages that say "not to a backlog"; group A's
decision 11 is the backlog/feedback distinction, which this plan restates but
does not re-decide.

## Assumed decisions — confirm or override at review

| # | Decision         | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Rejected                                          | Unit   |
| - | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------ |
| 1 | Scope            | Fill the four gaps; keep one doc edit, one offered command and one hand-off per report. (User, MCQ.)                                                                                                                                                                                                                                                                                                                                                                                                                                   | feedback drives the whole chain; close as covered | U1, U2 |
| 2 | Eighth kind      | **Shape change** — signal: the fix needs a new project, a changed stack pin, a new capability or a cross-cutting foundation before any flow can be written. Route: `/vwf:architecture`, which hands to `/vwf:setup`'s materialize pass itself. A report whose shape change is incidental stays a Blueprint hole and reaches architecture through blueprint's own sub-step. Deferred: a line in `docs/blueprint/architecture.md`'s open questions, room `gaps`. (User, MCQ.)                                                            | a "needs architecture first" flag on every kind   | U1     |
| 3 | Build state      | After classifying, read the owning flow's or entity's `implementation:` stamp, and whether `docs/blueprint/apis/released/` holds the owning project's `<project>@*.openapi.yaml` or the entity's `entities/<entity>@*.schema.yaml`. Print one line — `Build state: <none/partial/complete>; contract: <unreleased/released>` — before the route. When a released contract is touched, the route note says the change is additive-only or expand and contract, citing blueprint's guard and plan's delta checks by name. No config key. | a lifecycle key in `.config/vwf.yaml`             | U1     |
| 4 | Feature idea     | The route names the unit: an idea an existing flow or entity can absorb → `/vwf:blueprint <unit>`; an idea that implies a goal `product.md` does not serve → `/vwf:product <note>` first, then the unit. The unranked-candidate deferral stays.                                                                                                                                                                                                                                                                                        | prose "the normal path" with no unit              | U1     |
| 5 | Path line        | Every route's summary ends with the remaining path in one line, e.g. `then /vwf:plan <slice>, then /vwf:execute`; the hand-off in §3 stays single.                                                                                                                                                                                                                                                                                                                                                                                     | silence after the hand-off                        | U1     |
| 6 | Product argument | `argument-hint: "[feedback note]"`; in update mode the note seeds the delta questions (a pivot, a new or retired goal, a metric change, a re-rank) and is quoted in the run's first question; create mode ignores it. Nothing else in product changes.                                                                                                                                                                                                                                                                                 | a new product mode; a metric-only argument        | U2     |
| 7 | Ordering         | `requires: [docs/plans/2026-09-13-vwf-process]` — group A's U2 edits `feedback/SKILL.md` and the two manual passages this plan also touches.                                                                                                                                                                                                                                                                                                                                                                                           | concurrent runs                                   | —      |
| 8 | Decisions doc    | One decisions doc records the scoping ruling (one hop kept, chain rejected) and the eighth kind, so the next feedback plan does not re-open them.                                                                                                                                                                                                                                                                                                                                                                                      | no doc, since nothing is reversed                 | U3     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                             | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------ | -------- |
| U1 | 1    | [01-feedback.md](01-feedback.md)             | `plugins/vwf/skills/feedback/SKILL.md`                                                                                                           | —          | green  | e2cf104f |
| U2 | 1    | [02-product.md](02-product.md)               | `plugins/vwf/skills/product/SKILL.md`                                                                                                            | —          | green  | 85343b1a |
| U3 | 2    | [03-docs.md](03-docs.md)                     | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`, `docs/backlog.md`, `docs/memory/decisions/2026-09-14-feedback-gaps.md` (new) | U1, U2     | green  | d2516578 |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md) | `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                 | U3         | green  |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                               | Why it collides                                    | Owner   |
| ------------------------------------------------------------------ | -------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`      | several units bumping one version is a lost update | U4 only |
| `.claude-plugin/marketplace.json`                                  | generated; regenerating mid-wave races             | U4 only |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**` | n units editing one doc                            | U3 only |
| `docs/backlog.md`                                                  | the backlog skill's; this run's exception          | U3 only |
| `plugins/vwf/skills/verify/SKILL.md`, `agents/product-reviewer.md` | name feedback but are not falsified; nobody edits  | nobody  |

## Waves

- **Wave 1 — U1, U2.** Two files, two skills, no shared ruling beyond decision
  4's `/vwf:product <note>` spelling, which both quote.
- **Wave 2 — U3.** Docs, over the branch delta plus the survey's list.
- **Wave 3 — U4.** The bumps, the marketplace generator, the full gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line is
green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                            |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages vwf into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugin. |
| `/release`                 | ask  | Cuts the vwf and site tags per the consent block. The run stops once and asks first.                                                                             |

## Gates the orchestrator keeps

- **Eight kinds everywhere.** After wave 2:
  `command grep -rn "seven kinds\|any of seven\|seventh kind\|seven classes" plugins/vwf/skills/feedback/SKILL.md .claude site/src/content/docs readme.md CLAUDE.md`
  is empty, and
  `command grep -c "Shape change" plugins/vwf/skills/feedback/SKILL.md` is at
  least 2 (the table row and the route bullet).
- **The skill loads.** After U4, the strict `claude plugin validate` form the
  last runs used lists `feedback` and `product` without a frontmatter warning.
- **Build-state line.**
  `command grep -n "Build state:" plugins/vwf/skills/feedback/SKILL.md` hits
  once, in §1 or the head of §2.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **Feedback driving the chain** — decision 1; the gates at blueprint, plan and
  execute already stop at every step.
- **A lifecycle key in `.config/vwf.yaml`** — decision 3; the snapshot directory
  and the frontmatter stamps are the record.
- **Canvas mode** — untouched.
- **The backlog/feedback distinction sentence** — group A's U2; this plan edits
  what is on disk and does not re-decide it.
- **Verify's routes** (`verify/SKILL.md:118–133`) — they call feedback by kind;
  the eighth kind does not arise from a verify run.

## Parked

- **A removed registry project leaves an orphaned `p:<slug>:*` group** that
  neither architecture, init nor doctor flags (survey: no removal path in
  `agents/architecture-writer.md`, init or doctor). A doctor drift row and an
  init rename-or-delete offer would close it.
- **Product has no create-from-feedback path** — a feature idea on a repo with
  no `product.md` falls through to create mode, which ignores the note.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                          | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | —     | green       | all nine gate lines green on `develop` at `8b3f9faf`                                                                                                                                                                                                                                                                                                                                            | —        |
| 1    | U1        | opus  | 1     | green       | DECIDED: kinds table widened to keep one row per kind; the `n/a` case phrased as "the same line with `n/a` in place of both values" so `Build state:` hits once. DOCS FALSIFIED: none beyond the survey's list. GAP: edit 3's literal `Build state: n/a` vs the orchestrator gate's single hit — phrased in prose, meaning unchanged                                                            | —        |
| 1    | U2        | opus  | 1     | green       | DECIDED: feedback-note paragraph as its own bold-led paragraph in Step 2, not inside the update bullet. DOCS FALSIFIED: `site/src/content/docs/plugins/vwf.md:773` product row hint. GAP: none                                                                                                                                                                                                  | 85343b1a |
| 1    | R1        | opus  | 1     | findings(5) | :117 n/a set widened beyond edit 3; :135 bug route cites only plan's delta checks; :181 architecture.md has no open-questions heading in the template (ruling-level, nobody owns); :87 kinds table 157 cols; docs `production-feedback-loop.md:146` + `vwf.md:2046` falsified by decision 4 → U3. CONTRACT clean; RULINGS: U1 minor departures from decision 3; U2 hint sanctioned by unit file | —        |
| 1    | U1        | opus  | 2     | green       | R1's four findings fixed: n/a set restored to edit 3; bug route cites blueprint's guard and plan's delta checks; shape-change deferral under an `## Open questions` heading created when absent; signal cell shortened, table 88 cols. GAP: architecture template has no open-questions heading — assumed appended at the end when absent, template untouched                                   | —        |
| 1    | R1        | opus  | 2     | findings(3) | :117 "every other kind reads the stamp" undefined for shape change and not-a-blueprint-gap; :186 heading casing `## Open questions` vs the templates' `## Open Questions`; :187 fold. CONTRACT clean; RULINGS clean. Guard: 5→3, no resurfacing — second round allowed                                                                                                                          | —        |
| 1    | U1        | opus  | 3     | green       | R1's three round-2 findings fixed: n/a rule names the four kinds with no owning unit; `## Open Questions` casing; shape-change bullet refolded to 80. GAP unchanged                                                                                                                                                                                                                             | —        |
| 1    | R1        | opus  | 3     | findings(1) | contested (cap reached): `feedback/SKILL.md:118` line breaks at 58 cols mid-paragraph, cosmetic. CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                  | —        |
| 2    | U3        | opus  | 1     | green       | DECIDED: `readme.md`/`CLAUDE.md` untouched — their intake sentences enumerate no kinds; manual's Relay feature-idea example routes to `/vwf:blueprint task`. Docs-sync applied; production-feedback-loop gains a step 6 (shape change). GAP: `code:format` re-padded the plan index (orchestrator's, not reverted)                                                                              | —        |
| 2    | R2        | opus  | 1     | findings(2) | `vwf.md:2055` "The eight routes:" introduces seven bullets; `production-feedback-loop.md:179` feature-idea path line drops the blueprint hop in the product-first case. CONTRACT clean; RULINGS clean; edit 6 no-op confirmed                                                                                                                                                                   | —        |
| 2    | U3        | opus  | 2     | green       | R2's two findings fixed: "The routes:"; feature-idea path line carries the blueprint hop in both branches. `p:site:check` green                                                                                                                                                                                                                                                                 | d2516578 |
| 2    | R2        | opus  | 2     | pass        | both fixes verified; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                              | —        |
| 3    | U4        | opus  | 1     | green       | vwf 19.25.0→19.26.0, site 1.1.16→1.1.18 (skipped 1.1.17), marketplace regenerated (`vwf-v19.26.0`). GAP: `claude plugin validate --strict` lists no skills on this CLI (same as the 2026-09-13 run) — substituted `p:plugins:check` (36 skills) plus frontmatter `name:` lines                                                                                                                  | —        |
| 3    | R3        | opus  | 1     | pass        | three Owns paths only; bumps per consent; marketplace diff is the vwf ref + version lines. CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                        | —        |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-feedback-gaps
