---
type: repo-plan
title: vwf change workflow — /vwf:change-plan and /vwf:change-execute
requires: []
---

# Plan — vwf change workflow (2026-09-08)

## Status

**COMPLETE** 2026-09-08. Commits on `2026-09-08-vwf-change-workflow`: `0c3b5624`
(U1, change-plan), `bc4387cc` (U2, change-execute), `a00b5375` (U2 round 2,
description), `78a5388f` (U3, docs), plus the per-wave plan-folder `docs:`
commits `9895cbb4`, `1a94c08c`, `249b2f3a`. U4 changed nothing. No version
bumped.

Approved 2026-09-08 by the user, after the shape gate and the post-self-review
yes.

## Consent

| Action                                       | Granted |
| -------------------------------------------- | ------- |
| Merge to `develop` and push on green run     | yes     |
| Stage locally (`plugins:local`) on green run | yes     |
| Release `vwf` publicly                       | none    |
| Release `stackgen` publicly                  | none    |
| Release installer publicly                   | none    |
| Release site publicly                        | none    |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session.

The user chose "not this time" for vwf and for the site: the two skills reach
this machine through the local stage and are exercised by the follow-on plan
`docs/plans/2026-09-08-retire-repo-plan-skills/` before anyone else sees them;
the manual would otherwise document skills users cannot install yet. **No
`plugin.json` is bumped by this plan.** `site:version` is not run.

## Goal

After this lands, any repo with vwf installed can plan an ad-hoc change — work
that does not go through the blueprint — with `/vwf:change-plan`, and run the
approved plan folder autonomously in a fresh session with `/vwf:change-execute`.
The two skills are the repo-level `.claude/skills/create-plan/` and
`.claude/skills/execute-plan/` ported and generalized: everything this repo
baked into them (its gate commands, its project trees, its `docs-reconciler` and
`target-verifier` agents, `plugins:local`, the `release` skill) becomes either a
vwf doctrine equivalent or a value the plan folder carries.

The user's request, verbatim:

> I like the repo-level `create-plan` and `execute-plan` skills. These are good
> for adhoc work which don't really follow vwf process of blueprint. There are
> times where adhoc work is required to be done which has nothing to do with the
> project so let's add both of these to `vwf`

Names decided in conversation: `change-plan` / `change-execute` (`adhoc-*` and
the verbatim `create-plan` / `execute-plan` rejected — vwf's existing pair is
`plan` / `execute`, and the new pair mirrors it).

This plan reverses no standing decision. One **tension** was named and accepted:
the 2026-09-06 preference for fewer user-invocable skills (memory
`fewer-user-invocable-skills`; plan `2026-09-06-init-behind-setup`) and this
plan adds two. Both must be user-typed; the user chose to keep `change-plan`
model-invocable as well, for a future hand-off (parked).

A second plan, `docs/plans/2026-09-08-retire-repo-plan-skills/`, requires this
one and retires the repo copies. **Its viability constrains this plan's
design**: this repo has no `.config/vwf.yaml` and none of the `code:check` /
`code:test` / `code:precommit` harness tasks, so the generic pair must work from
what the plan folder says, not from vwf's config.

## Facts the survey established

**The source skills** (889 lines in six files). `.claude/skills/create-plan/`:
`SKILL.md` (217), `references/interview.md` (90), `references/plan-template.md`
(210). `.claude/skills/execute-plan/`: `SKILL.md` (252),
`references/wave-review.md` (55), `references/blocking.md` (65). Frontmatter:
create-plan `model: fable`,
`allowed-tools: Read Grep Glob Bash Write Edit Agent
AskUserQuestion`;
execute-plan `model: opus`,
`allowed-tools: Read Grep Glob
Bash Edit Agent AskUserQuestion Skill`. Neither
sets `disable-model-invocation`.

**Repo-specific passages, by kind** (every one must change in the port):

- (a) fixed gate commands — `create-plan/SKILL.md:110-119` (`plugins:local`,
  `i:test`, `site:check`); `plan-template.md:98-103` (the six-line wave gate),
  `:204-205`; `execute-plan/SKILL.md:70-78` (the fenced preflight), `:128`,
  `:174`, `:192`.
- (b) this repo's project trees — `create-plan/SKILL.md:47-54`, `:101-105`,
  `:171-177`; `plan-template.md:77-78`, `:85-90`, `:100-101`; `interview.md:29`.
- (c) repo-only agents — `docs-reconciler` at `create-plan/SKILL.md:175`,
  `interview.md:59`, `plan-template.md:195`, `execute-plan/SKILL.md:126`;
  `target-verifier` at `interview.md:57`, `plan-template.md:107`, `:205`,
  `execute-plan/SKILL.md:129`.
- (d) repo-only skills and tasks — the `release` skill
  `execute-plan/SKILL.md:202-206`, `:212`; the dev marketplace
  `create-plan/SKILL.md:110-119`, `execute-plan/SKILL.md:171-196`,
  `plan-template.md:42-48`; `.claude/docs/dev-marketplace.md` cited at
  `create-plan/SKILL.md:118`, `execute-plan/SKILL.md:193`; `plugin.json` bumps
  `plan-template.md:78`, `:87`, `:203-204`; the checker-rules path
  `create-plan/SKILL.md:50`; two archived plans named as specimens
  `plan-template.md:9-11`.
- (e) machine specifics — `claude-status` as the cap-directive source,
  `execute-plan/SKILL.md:220`. `vwf:git-workflow` is invoked by name at
  `execute-plan/SKILL.md:59`, `:119`, `:165` and **survives** the port — vwf
  ships it.
- (f) the release table `create-plan/SKILL.md:99-105`; the consent rows
  `plan-template.md:34-40`; `interview.md:63-78`.

**Already generic, copyable near-verbatim:** `create-plan/SKILL.md:15-45`,
`:64-94`, `:136-154`, `:164-217` minus `:175-177`; `interview.md:1-48`,
`:80-89`; `plan-template.md:13-96` and `:110-191` except the cells above;
`execute-plan/SKILL.md:16-33`, `:36-67`, `:84-123`, `:133-170`, `:217-252`;
`wave-review.md:1-28`, `:38-55`; `blocking.md` in full.

**The checker, over `plugins/vwf/**/*.md`** (`scripts/src/check.ts`). Rule 4
strict-YAML frontmatter `:650-690` — a header a strict parser rejects drops the
skill silently. Rule 6 root-relative refs `:1020-1032` — every
`${CLAUDE_PLUGIN_ROOT}/…` must resolve inside vwf. Rule 7 agent cross-references
`:1047-1075` — roles are the last hyphen-segment of vwf's own agent names
(`verifier`, `surveyor`, `reviewer`, `writer`, …), so a backticked
`target-verifier` fires "names no agent under agents/"; `docs-reconciler` and
`general-purpose` pass. Rule 10 technology-free guard `:1477-1556`,
`TOOL_TOKENS` `:1253-1298`: `mise`, `tsc`, `git` are **not** tokens; `pnpm`,
`npm`, `vitest`, `bun`, `docker`, `astro` **are**; fenced blocks are stripped
(`:1349-1351`); an occurrence within 100 chars of another token is exempt
(`:1381-1397`). Two source lines fail as-is, both outside fences:
`create-plan/SKILL.md:103` ("…; npm") and `wave-review.md:30` ("no `npm` after a
pipe"). Rule 12 retired vocabulary `:1589-1643` — nothing trips it. Rules 8, 9,
11, 13 do not apply to a plain vwf skill. 39 files under `plugins/vwf/` already
say `mise`, 24 of them under `skills/`.

**vwf's generic equivalents.**

- Docs reconciliation → `plugins/vwf/skills/docs-sync/SKILL.md` with the
  `docs-sync-surveyor` agent (`plugins/vwf/agents/docs-sync-surveyor.md`); the
  standalone ad-hoc mode is `docs-sync/SKILL.md:26-33` (commit range or the
  branch delta) and a `docs/plans/`-only scope is exempt at `:35`. Doctrine:
  `plugins/vwf/assets/docs-sync.md:9-31`.
- Worktree, commit, land → `plugins/vwf/skills/git-workflow/SKILL.md:17-32`
  (rules), `:121-128` (create), `:130-166` (commit; the pre-commit pass is the
  repo gate, `:134`, `:149-151`), `:180-215` (land),
  `references/worktree-setup.md:99-104` (bootstrap).
- Review loop cap and convergence →
  `plugins/vwf/assets/execute-stages.md:45-63`, `:106-111`. The run-journal
  record shape the final report renders → `execute-stages.md:167-205`.
  `execute-code-reviewer` and `execute-security-reviewer` read the blueprint and
  are **not** the wave reviewer.
- Resume → `plugins/vwf/skills/handoff/SKILL.md`, `skills/recall/SKILL.md`.
- Memory → `plugins/vwf/assets/memory.md:12-32` (two stores written together),
  `:39-48` (the markdown tree and the seven rooms), `:59-66` (committed vs
  ignored), `:81-90` (wing/room resolution). Rooms an ad-hoc run wants:
  `planning`, `decisions`, `gaps`, `runs`.
- Elicitation → `plugins/vwf/assets/elicitation.md` §2 scope check (`:16`), §3
  one question at a time (`:36-42`), §3a (`:43`), §4 decisions vs mechanics
  (`:82`), §7 the hard gate (`:102`), §9 convergence guard (`:119`).
  `assets/minimalism.md` — dependency consent, the decision ladder.
- Gate discovery → the harness capability vocabulary
  `plugins/vwf/assets/harness.md:12-21`, stamp shape `:46-57`; the config block
  `assets/vwf-config.md:94-102`; detection is `mise tasks`
  (`skills/doctor/references/harness-and-memory.md:10-14`). `/vwf:execute` never
  runs a repo-wide gate itself; its gate is git-workflow's pre-commit pass.

**Plan location.** `/vwf:plan` writes a flat file
`docs/plans/<date>-<time>-<slice>.md` plus a base-repo index
(`skills/plan/SKILL.md:48-49`, `:299`, `:318`). Discovery is **index-driven**,
not a glob: `skills/execute/SKILL.md:41-43`, `skills/archive/SKILL.md:33-36`;
archive moves single files `:65-66`. `blueprint-authoring/SKILL.md:16` scopes
`docs/plans/**/*.md`, so every file in a change folder auto-loads that doctrine,
whose closed `type` vocabulary is
`blueprint-authoring/references/frontmatter-and-links.md:47-61` (rows
`vwf-product` … `vwf-plan`, `vwf-gap-report`; no ad-hoc type). The repo
template's index.md already carries `type: repo-plan` (`plan-template.md:17`).

**Frontmatter conventions.** Heavy skill: `skills/plan/SKILL.md:1-15`
(`argument-hint`, `model: opus`, `effort: high`,
`disable-model-invocation: false`). User-only: `skills/archive/SKILL.md:1-10`
(`disable-model-invocation: true`). Invocation policy table:
`.claude/skills/vwf-plugin/SKILL.md:124-145`. Adding a skill needs no
registration beyond the directory.

**Version.** `plugins/vwf/.claude-plugin/plugin.json:4` reads `19.14.0`. Not
bumped by this plan.

**Docs that enumerate vwf's skills.** `site/src/content/docs/plugins/vwf.md`:
command table `:719-740`, invocation prose `:742-757` (names the user-only
skills), model/effort tiering `:759-768`, per-skill `### /vwf:<name>` sections
`:779-1765` in workflow order, mermaid workflow graph `:268-282`, prose
walkthrough `:304-330`, the "vwf skills" section `:1926-1992`; existing ad-hoc
mentions at `:213`, `:306`, `:1730`, `:1990`. `readme.md:212-223` (vwf prose, no
command list), `:66`. `CLAUDE.md:217` (Plugins table row), `:226-240` (workflow
sentence). `.claude/docs/plugins.md:12`.
`.claude/skills/vwf-plugin/references/skills-and-agents.md:20-39` (skill table),
`:8-18` (invocation prose). `.claude/skills/vwf-plugin/SKILL.md:55-60` (ordering
line), `:124-145`. No how-to page covers ad-hoc work; the nearest home is
`site/src/content/docs/how-to/operate/` (three pages) and `how-to/index.md:64`.
Content schema `site/src/content.config.ts:15-19` requires exactly `title`,
`description`, `order` (integer); nav derives from `order` within a fixed
section list (`site/src/nav.ts:44-55`). `site/CLAUDE.md` rules: relative `.md`
links only inside the collection, absolute GitHub URLs otherwise (`:48-52`);
heading anchors are load-bearing (`:53-57`); no em-dashes in `.astro` copy
(`:58-61`).

**Dependencies.** None new. Both skills are prose plus two references each.

## Assumed decisions — confirm or override at review

| #  | Decision                          | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                            | Rejected                                               | Unit   |
| -- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| 1  | Plan folder location              | `docs/plans/<YYYY-MM-DD>-<kebab-name>/` in the target repo, `index.md` frontmatter `type: vwf-change-plan`. The type joins the closed vocabulary in `frontmatter-and-links.md` with a note that the blueprint completeness bars do not apply to it; no `paths:` carve-out.                                                                                                                                                        | a `docs/changes/` sibling root                         | U1     |
| 2  | Gate discovery                    | `index.md`'s **Wave gate** section carries the exact commands. change-plan proposes them from `mise tasks` and, when `.config/vwf.yaml` carries a `harness:` stamp, its capabilities; the user confirms. change-execute runs what is written, before wave 1 and after every wave, and nothing it infers.                                                                                                                          | harness names only; harness default with plan override | U1, U2 |
| 3  | After landing                     | `index.md` gets an **After landing** list: ordered commands or skills, each marked `run` (executed unprompted after a consented landing; e.g. a local stage) or `ask` (the run stops once and asks; e.g. a release). change-plan proposes them from the survey; the user confirms. Empty is valid.                                                                                                                                | the pair ends at merge and push                        | U1, U2 |
| 4  | Release proposal                  | The repo's project table becomes generic: per project the units touch, ask whether a user sees a difference and how that project ships (version command, tag, publish). Record as a `Release <project>` consent row (`none / patch / minor / major`) plus the `ask` step that ships it. The gates-and-bump unit bumps with the command the plan names.                                                                            | keep the repo's five-row table                         | U1     |
| 5  | Docs unit                         | The fixed docs unit runs `vwf:docs-sync` over the run's branch delta and applies every `DOCS FALSIFIED:` line. A confirmed reversal lands as `docs/memory/decisions/<date>-<slug>.md` per `assets/memory.md`.                                                                                                                                                                                                                     | port `docs-reconciler` into vwf                        | U1, U2 |
| 6  | Wave reviewer                     | The repo's prompt-based `general-purpose` reviewer subagent, as `wave-review.md` has it, with the round cap and convergence guard cited from `assets/execute-stages.md:45-63`, `:106-111`.                                                                                                                                                                                                                                        | `execute-code-reviewer` (reads the blueprint)          | U2     |
| 7  | Orchestrator-kept verification    | The interview item stays, generic: "anything a diff cannot prove — a real install, a scratch-repo run, a smoke test — named with its pass condition". No agent is named in the shipped text.                                                                                                                                                                                                                                      | ship `target-verifier`                                 | U1, U2 |
| 8  | Resource cap                      | "an injected cap directive from an external hook" — no tool named.                                                                                                                                                                                                                                                                                                                                                                | keep `claude-status`                                   | U2     |
| 9  | Archive                           | change-execute moves the folder to `docs/plans/archived/<folder>/` itself on completion, as the repo copy does. Change plans are **never** written into the base repo's `docs/plans/index.md`, so `/vwf:archive`, `/vwf:execute` and `/vwf:recall` are untouched.                                                                                                                                                                 | folder handling in `/vwf:archive`                      | U2     |
| 10 | Invocation                        | `change-plan`: user **and** model (`disable-model-invocation: false`, no `user-invocable`). `change-execute`: user-only (`disable-model-invocation: true`) — it must start a fresh session, which only the user can guarantee.                                                                                                                                                                                                    | both user-only                                         | U1, U2 |
| 11 | Model                             | Both `model: opus`, `effort: high`, as every other vwf workflow skill.                                                                                                                                                                                                                                                                                                                                                            | `fable` for change-plan (the repo copy's choice)       | U1, U2 |
| 12 | Recall                            | change-plan's recall reads `docs/memory/decisions/`, the last archived plan touching the same tree (folder or flat file), and the mempalace rooms `planning`, `decisions`, `gaps` for the repo's wing when the server is up, skipping silently when not — citing `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, never restating the room list.                                                                                         | —                                                      | U1     |
| 13 | Survey vocabulary                 | The survey maps "the trees the change touches and which project each belongs to" using the repo's own layout (the vwf registry when one exists, else the top-level directories), "the gates that already cover those trees" (`mise tasks`, the harness stamp, CI workflow files), and "the docs that describe today's behaviour" (README, CLAUDE.md, `docs/`). No tree of this repo is named.                                     | —                                                      | U1     |
| 14 | Rule 10 and rule 7 hygiene        | No bare `npm` (or any other `TOOL_TOKENS` entry) outside a fence; no backticked `target-verifier`. Prose that needs a package-manager example says "the package manager".                                                                                                                                                                                                                                                         | —                                                      | U1, U2 |
| 15 | Manual scope                      | `vwf.md`: two command rows, the invocation and tiering prose, two `###` sections placed after the `verify`/`feedback` sections, one sentence in the walkthrough saying ad-hoc work sits beside the chain, and the "vwf skills" section. Plus one how-to page `site/src/content/docs/how-to/operate/ad-hoc-change.md` (plan, execute, resume). The mermaid graph is **not** changed — the pair is outside the chain by definition. | sections only; a graph node                            | U3     |
| 16 | Specimens in the shipped template | The template names no archived plan of this repo as a specimen; `plan-template.md:9-11` is cut.                                                                                                                                                                                                                                                                                                                                   | —                                                      | U1     |
| 17 | What U2 reads from U1             | U2 runs in wave 2 so it reads the template U1 wrote, and its `index.md` parsing (Status, Consent, Units, Wave gate, After landing, Run log) matches U1's headings exactly. Any mismatch U2 finds is a `GAP:` resolved in U2's favour by editing only U2's files and reporting the template line.                                                                                                                                  | both in wave 1 with the format spec only in this file  | U2     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                                                                                   | Depends on | Status | Commit |
| -- | ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------ | ------ |
| U1 | 1    | [01-change-plan.md](01-change-plan.md)       | `plugins/vwf/skills/change-plan/**` (new: `SKILL.md`, `references/interview.md`, `references/plan-template.md`); the `type` row in `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md`                                                                                        | —          | green  | 0c3b56 |
| U2 | 2    | [02-change-execute.md](02-change-execute.md) | `plugins/vwf/skills/change-execute/**` (new: `SKILL.md`, `references/wave-review.md`, `references/blocking.md`)                                                                                                                                                                                        | U1         | green  | bc4387 |
| U3 | 3    | [03-docs.md](03-docs.md)                     | `readme.md`, `CLAUDE.md`, `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/how-to/operate/ad-hoc-change.md` (new), `site/src/content/docs/how-to/index.md`, `.claude/docs/plugins.md`, `.claude/skills/vwf-plugin/SKILL.md`, `.claude/skills/vwf-plugin/references/skills-and-agents.md` | U2         | green  | 78a538 |
| U4 | 4    | [04-gates.md](04-gates.md)                   | `.claude-plugin/marketplace.json` (generated, expected unchanged), `plugins/stackgen/stacks/inventory.md` (generated, expected unchanged); **no `plugin.json`**                                                                                                                                        | U3         | green  | —      |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                    | Why it collides                                    | Owner                         |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------- |
| `plugins/*/.claude-plugin/plugin.json`                                                                  | several units bumping one version is a lost update | nobody — not bumped this plan |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                               | generated; regenerating mid-wave races             | U4 only                       |
| `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**` | n units editing one doc                            | U3 only                       |
| `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md`                            | the type row; U2 must not touch it                 | U1 only                       |
| `plugins/vwf/skills/archive/**`, `skills/plan/**`, `skills/execute/**`, `skills/recall/**`              | decision 9 leaves them alone                       | nobody                        |

## Waves

- **Wave 1 — U1 alone.** It writes the plan-folder format U2 parses.
- **Wave 2 — U2 alone.** Reads U1's template; disjoint paths from U1.
- **Wave 3 — U3**, the docs unit, after the two skills exist to describe.
- **Wave 4 — U4**, the gates unit: generators (no diff expected), full gate,
  `site:check`, the real install.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `pnpm vitest run`,
`pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, `mise run site:check` from wave 3 on (U3
owns files under `site/`), plus the wave review, plus every report read for
`UNRESOLVED:`. The plan's own checks:

- `grep -rnE '\bnpm\b|\bpnpm\b|\bvitest\b' plugins/vwf/skills/change-plan plugins/vwf/skills/change-execute`
  → every hit is inside a fenced block (rule 10 strips fences) or absent.
- `grep -rn 'target-verifier\|docs-reconciler\|claude-status\|plugins:local\|plugins:check\|site:check\|i:release\|site:release\|plugins:release' plugins/vwf/skills/change-plan plugins/vwf/skills/change-execute`
  → nothing.
- `grep -rn 'vwf-change-plan' plugins/vwf/skills/change-plan/references/plan-template.md plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md`
  → both files.
- `grep -c '^disable-model-invocation: true$' plugins/vwf/skills/change-execute/SKILL.md`
  → `1`;
  `grep -c '^disable-model-invocation: false$' plugins/vwf/skills/change-plan/SKILL.md`
  → `1`.

## Gates the orchestrator keeps

- `mise run plugins:check` runs `claude plugin validate --strict` when `claude`
  is on PATH — both new skills must appear in its output with no warning.
- After U4, run `target-verifier` with the change description; pass: the
  installed vwf carries `skills/change-plan/SKILL.md` and
  `skills/change-execute/SKILL.md`, both frontmatters parse, the uninstall
  report is clean.
- The functional proof is the follow-on plan
  `docs/plans/2026-09-08-retire-repo-plan-skills/`, which is the first real use
  of the staged pair. Nothing in this run exercises the skills end to end; say
  so in the final report.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits.

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

- **Retiring the repo copies** `.claude/skills/create-plan/`,
  `.claude/skills/execute-plan/` and `.claude/agents/docs-reconciler.md`. That
  is the second plan, `docs/plans/2026-09-08-retire-repo-plan-skills/`, which
  requires this one. Nothing under `.claude/skills/create-plan`,
  `.claude/skills/execute-plan` or `.claude/agents/` changes here.
- **A vwf or site release.** "Not this time", both. No version bumped.
- **A `docs/changes/` root.** The user chose `docs/plans/` with a new type.
- **Folder handling in `/vwf:archive`**, or listing change plans in the base
  repo's `docs/plans/index.md`. Decision 9.
- **A mermaid node for the ad-hoc pair** in the manual's workflow graph. The
  pair sits beside the chain; a sentence says so.
- **Any change to `docs-sync`, `git-workflow`, `handoff`, `recall`,
  `execute-code-reviewer`.** The new skills cite them; they do not change.

## Parked

- **`/vwf:feedback` routing a non-blueprint fix into `/vwf:change-plan`.** The
  reason change-plan stays model-invocable (decision 10). Nothing delegates to
  it today; when feedback's routing table gains a "not a blueprint gap" row,
  change-plan is the destination.
- **`/vwf:archive` folder handling**, should change plans ever be listed in the
  base repo's `docs/plans/index.md` (decision 9 says they are not).
- **Hiding the three `vwf:import-*` skills** — carried from
  `2026-09-06-init-behind-setup`'s Parked list; the reason was not stated there.
  Ask before assuming it was only scope.
- **This repo's own `/vwf:setup`.** It has no `.config/vwf.yaml`; the second
  plan does not need one (decision 2), but a later plan may shape this repo with
  vwf so the harness stamp exists.

## Run log

| Wave | Unit               | Model | Round | Outcome                | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Commit |
| ---- | ------------------ | ----- | ----- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight          | —     | —     | green                  | check, marketplace, inventory, vitest (288), tsc x2, npm-normalize, site:check all pass on `develop`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —      |
| 1    | U1                 | opus  | 1     | returned               | DECIDED: no `allowed-tools` (Edit 2); consent row reads "Merge to the integration branch and push on green"; shared-file rows are placeholders (dec. 13). GAP: guardrails cite markdownlint-cli2, which this repo lacks — assumed no md lint gate, fold width by hand. GAP: kept the Wave gate tail "plus the wave review, plus every report read for UNRESOLVED:" verbatim, U2 parses it. DOCS FALSIFIED: none.                                                                                                                                                                                        | —      |
| 1    | R1                 | opus  | 1     | findings(3)            | CONTRACT clean; RULINGS clean; gate green (check, greps). (1) frontmatter-and-links.md:60 row unpadded [rule 4] → U1. (2) plan-template.md:71 and :98-100 tables misaligned [rule 4] → U1. (3) blueprint-authoring/SKILL.md:61 enumerates the docs/plans/** types (`vwf-plan` / `vwf-gap-report`) — falsified by `vwf-change-plan`, file in nobody's Owns [rule 5] → recorded as DOCS FALSIFIED for U3.                                                                                                                                                                                                 | —      |
| 1    | —                  | —     | —     | GAP                    | Orchestrator: `plugins/vwf/skills/blueprint-authoring/SKILL.md:61` is falsified and no unit owns it. Assumption: the docs unit's remit covers every DOCS FALSIFIED line wherever it lands, so U3 applies the one-sentence fix there.                                                                                                                                                                                                                                                                                                                                                                    | —      |
| 1    | U1                 | opus  | 2     | returned               | Both tables re-padded by hand (type table to 19/103; Units and After-landing tables aligned). DECIDED: `vwf-change-plan` cell drops the "(`/vwf:change-plan`)" clause to match neighbouring cells' form; docs-unit Owns cell uses Edit 11's exact wording. Verification green.                                                                                                                                                                                                                                                                                                                          | —      |
| 1    | gate               | —     | —     | green                  | check, marketplace, inventory, npm-normalize, vitest (288), tsc x2, plan greps (0/0/2/1) all pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 0c3b56 |
| 1    | R1                 | opus  | 2     | pass                   | FINDINGS 0; CONTRACT clean (12 pre-existing type-table rows re-padded whitespace-only); RULINGS clean — decision 1's note carried; all three tables aligned (129/126/83 cols); gate greps unchanged.                                                                                                                                                                                                                                                                                                                                                                                                    | —      |
| 2    | U2                 | opus  | 1     | returned               | DECIDED: two unenumerated `develop` mentions → "the integration branch" (git-workflow resolves the name); added the negative form of decision 2 to "What this skill never does"; cited execute-stages.md by section name not line numbers (the plan's numbers had rotted); §7 quotes the template's consent row label exactly. GAP: none — U1's template matched the parsing agreement, no edit needed. DOCS FALSIFIED: none. Verification green (35 skills).                                                                                                                                           | —      |
| 2    | R2                 | opus  | 1     | findings(2) — accepted | CONTRACT clean; RULINGS clean (decision 17 verified heading-by-heading; decision 6's plan line numbers were stale, section-name citation is the correct resolution). Findings: SKILL.md:244 added bullet (negative form of decision 2) and :63-64 added clause on the integration branch — both disclosed DECIDED additions, reviewer recommends accept; accepted, no second round. Gate green (35 skills, greps 0/0).                                                                                                                                                                                  | —      |
| 2    | gate               | —     | —     | green                  | check, marketplace, inventory, npm-normalize, vitest (288), tsc x2, plan greps (0/0/1/1) all pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | bc4387 |
| 3    | docs-reconciler    | —     | 1     | findings(8)            | vwf.md command table, user-only count/list (was already stale: `design-system` missing), skills-and-agents.md count + table rows, two `###` sections, "vwf skills" example, readme.md and CLAUDE.md arc sentences. Missed blueprint-authoring/SKILL.md:61 (R1's finding, verified by grep) — handed to U3 as item 9.                                                                                                                                                                                                                                                                                    | —      |
| 3    | U3                 | opus  | 1     | returned               | 9 files incl. the one extended-Owns sentence in blueprint-authoring/SKILL.md:61. DECIDED: sections after `### /vwf:feedback`, rows after the feedback row (parallel order); fixed two extra falsified "execute is the only unattended command" passages in vwf.md; left readme.md:66 alone (still true). GAP: edit 1 said the command table ends on feedback/verify, it ends on git-workflow — assumed "after the last workflow row" = after feedback. GAP: `design-system` was already missing from the user-only list — fixed with finding 2. DOCS FALSIFIED: none. site:check + plugins:check green. | —      |
| 3    | R3                 | opus  | 1     | findings(3)            | CONTRACT clean; RULINGS clean (mermaid byte-identical; seven user-only confirmed by grep; every ad-hoc-change.md claim traces to shipped text). (1) docs-tree.md:36 `docs/plans/` names only the flat form [docs] → U3 (shared-file rule: `.claude/skills/vwf-plugin/**` is U3's). (2) docs-tree.md:60 type vocabulary omits `vwf-change-plan` [docs] → U3. (3) change-execute/SKILL.md:5 description says "a commit per green wave", body says per unit [docs] → U2. site:check + plugins:check green.                                                                                                 | —      |
| 3    | U2                 | opus  | 2     | returned               | change-execute/SKILL.md:5 description now "a commit per green unit"; fold width and frontmatter unchanged; plugins:check green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —      |
| 3    | U3                 | opus  | 2     | returned               | docs-tree.md: `docs/plans/` describes both forms (flat via the base index; `<date>-<name>/` folders never listed there; both retire into `archived/`); type vocabulary gains `vwf-change-plan` inline with the completeness-bars note. DECIDED: inline form matches the list's existing shape; named both retirement mechanisms (dec. 9). dprint clean.                                                                                                                                                                                                                                                 | —      |
| 3    | R3                 | opus  | 2     | pass                   | FINDINGS 0; CONTRACT clean; RULINGS clean; all three round-1 findings closed, none resurfaced; site:check + plugins:check green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —      |
| 3    | gate               | —     | —     | green                  | check, marketplace, inventory, npm-normalize, vitest (288), tsc x2, site:check (24 pages, all links resolve), plan greps (0/0/1/1) all pass. U2's round-2 fix committed a00b5375.                                                                                                                                                                                                                                                                                                                                                                                                                       | 78a538 |
| 4    | U4                 | opus  | 1     | green                  | Generators re-run, no diff; full gate green (check 35 skills, marketplace --check, inventory --check, vitest 288 passed + 2 skipped, tsc x2, npm-normalize, site:check 24 pages), plan greps 0/0/2/1; vwf plugin.json 19.14.0 untouched, nothing bumped. GAP (dismissed): "290 tests vs 288" — same suite, 288 passed + 2 skipped = 290 in every run. DECIDED: fish needed `--check` passed as a direct invocation, not through a loop variable.                                                                                                                                                        | —      |
| 4    | R4                 | —     | —     | n/a                    | Wave 4 produced no diff; nothing to review.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —      |
| 4    | target-verifier    | —     | 1     | clean                  | Hermetic install from the worktree tree (tmp CLAUDE_CONFIG_DIR): both skills landed under vwf 19.14.0, `diff -r` vs source empty, both frontmatters parse with the intended fields, `validate --strict` clean on manifest, marketplace and installed copy; stackgen pulled automatically; uninstall leaves no registration. Not verified: the published pins (no tag yet) and runtime skill discovery.                                                                                                                                                                                                  | —      |
| 4    | orchestrator gates | —     | —     | green                  | `validate --strict` clean in every plugins:check run (35 skills, no warning); target-verifier clean; the functional proof is the follow-on plan `2026-09-08-retire-repo-plan-skills` — nothing in this run exercised the pair end to end.                                                                                                                                                                                                                                                                                                                                                               | —      |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-08-vwf-change-workflow
