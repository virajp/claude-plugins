---
type: vwf-change-plan
title: vwf process — plan commits at hand-off, the 13/17 version rule, the
  backlog skill
requires: []
backlog: [ B01, B02, B03 ]
---

# Plan — vwf process — plan commits at hand-off, the 13/17 version rule, the backlog skill (2026-09-13)

## Status

**COMPLETE** 2026-09-14. Commits on `2026-09-13-vwf-process`, in order:
`7d5708e7` U1, `88b99756` U2, `6b66810b` U3, `8ea68dcf` U4, `69d0b3d1` U5,
`ab5bbdf7` U6, `5399e00b` wave-1 log, `fde65598` U7, `d54a27ae` wave-2 log,
`89e83829` U8, plus this archive commit. Worktree
`.worktrees/2026-09-13-vwf-process`. Approved 2026-09-14 by the user, after
self-review.

## Consent

| Action                                            | Granted                                                                                                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                              |
| After landing: `/release`                         | ask                                                                                                                              |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json`, `19.20.0` → `19.21.0`, by editing the `version` field                          |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U8 runs it first), `1.1.9` → `1.1.10` |
| Release installer publicly                        | none — the published package is untouched; only this repo's version tasks change                                                 |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, three things are true that are not true now. An approved
change plan is committed on the branch it was planned on and pushed before the
hand-off line, so the fresh session's worktree, cut from the integration branch,
sees it — the two 2026-09-13 runs had to sweep an untracked folder into a wave
commit. No version line vwf or this repo maintains can be cut or stamped with a
component equal to 13 or 17: the plugin checker refuses such a manifest, the
bump tasks skip past such a number, the release tasks refuse to tag one, and the
format-stamp doctrine states the rule. And vwf ships `/vwf:backlog`, the sole
writer of the repo's `docs/backlog.md` — a prioritised list of work that cannot
be picked up now — which `change-plan`, `change-execute`, `plan`, `execute` and
`archive` call to mark items planned and done.

The framing: the user's backlog request of 2026-09-13 named eleven items;
`docs/backlog.md` was written as the seed and its group A (B01–B03) is this
plan. No standing decision is reversed. git-workflow's "never push without an
explicit request" is satisfied by the gate approve, which the skill records as
the request.

## Facts the survey established

**change-plan today** (`plugins/vwf/skills/change-plan/`). `SKILL.md` §6 Write
the folder (178–210), §7 Self-review (212–225), §8 Hand off (227–240) ends with
the launch block at 233–237 and "Do not start executing" at 239–240; "What this
skill never does" is 242–248. Nothing says the folder is committed, nothing says
it is not. §1 Recall bullets are 39–49. `references/plan-template.md`: Launch
block 148–152, Run log 141–146, per-unit `## Commit` 190–195, consent row 32,
gates-and-bump paragraph at 208. `references/interview.md`: landing Q15 65–66,
after-landing Q16 67–71, release intent Q17 72–77, the gate Q18 84–88.
Frontmatter: `model: opus`, `effort: high`, `disable-model-invocation: false`.

**change-execute** (`plugins/vwf/skills/change-execute/SKILL.md`, 253 lines). §1
Resolve and refuse early 38–57; 54–57 says the plan folder is edited in the
worktree only and committed with each wave, never in the main checkout — which
assumes the folder is already on the integration branch. §2 One worktree 59–68
declares to git-workflow: isolate without asking, branch from the integration
branch, commit only. §4 step 5 at 116–122 commits one commit per green unit. §7
Land 163–173: move to `archived/`, `COMPLETE`, one final `docs:` commit, then
merge and push on consent. `references/blocking.md` 48–58: resume semantics.

**History.** Plans from 2026-09-08 to 2026-09-12 were committed first-parent on
`develop` before the run: `97729e3a`, `94f4b529`, `321e8851`, `f18d532d`, each
`docs: … — approved, awaiting execution`. The two 2026-09-13 plans were first
committed inside the run, on the feature branch, after wave 1's unit commits
(`823015cb`, `2f1e172b`); no skill text describes how the untracked folder got
into the worktree.

**git-workflow** (`plugins/vwf/skills/git-workflow/SKILL.md`). 17–18 "never work
directly in the main worktree"; Step 1 122–127 consents to isolate and "if
declined, work in place and skip to Step 3" — an in-place commit is a consented
path. 42–43 "never push without explicit user request"; Step 4 186–223: a
caller-declared post-commit preference skips the prompt. Step 3 134–168: the
`code:precommit` pre-stage pass, `git add <files>` never `-A`, the convention
file, `mise x -- git commit`. The no-commit-to-branch hook
(`.config/pre-commit-config.yaml:224–228`) guards `main` only.

**plan / execute.** `plan/SKILL.md` §8 Approval gate 338–355 commits the plan on
every approve option; §9 Commit 361–365 uses a bare `docs:` message via
git-workflow in the plan session's own worktree; recall step 91–94; the slice
argument is mandatory (71–83). `execute/SKILL.md` 119–122: one worktree, commit
each step, merge and push only behind the final gate; 157–162 the declared
preferences. `archive/SKILL.md` 98–129 move and status, 137–143 commit.
`feedback/SKILL.md` 19–21 says feedback goes "not to a backlog"; 139–147 the
deferred route writes a gaps drawer only.

**Versions.** vwf `19.20.0` (`plugins/vwf/.claude-plugin/plugin.json:4`),
stackgen `1.9.0`, installer `1.0.1` in the **root** `package.json:3`
(`installer/package.json` is a `0.0.0` workspace stub), site `1.1.9`
(`site/package.json:3`), `config_format` 18
(`plugins/vwf/assets/vwf-config.md:41`, bump instruction at 251–252, the 16 → 18
note at 548–552), `blueprint_format` 24 (`plugins/vwf/assets/blueprint-format`).
`p/i/version` and `p/site/version` run
`pnpm version <level> --no-git-tag-version` (lines 23 and 24) with no
pre-computation and read the result two lines later; both source
`.config/mise/tasks/_scripts/helpers`, the pack-owned helper library. No
`_scripts/local` sidecar exists yet. `deps-update.yml:85` runs `p:i:version`
unattended monthly. `p/i/release` reads the version at 43 and tags at 48,
refusal ladder at 29/38/54; `p/site/release` reads at 44, tags at 50, refusals
30/39/56; `p/plugins/release` reads refs from the marketplace manifest at 56–59,
tag-existence loop 66–79, tags at 96–98 — only refs with no tag yet are cut.
`p/plugins/local` writes `X.Y.Z+N` at 111; the `+N` is not a component.

**Checker.** `scripts/src/check.ts`: `SEMVER_RE` at 74, the plain-semver
assertion inside `checkManifest()` (115–155) at 130–137 with the message "is not
plain semver"; rules are numbered only in prose. `scripts/src/check.test.ts`
105–120 "flags a missing, non-semver, or build-metadata version" is the case to
mirror; fixtures use `1.0.0`.

**Rule mentions today.** `setup/references/format-lineage.md:25–30`,
`assets/vwf-config.md:549`,
`.claude/skills/vwf-plugin/references/docs-tree.md:94`,
`references/assets.md:22`, the 2026-09-12 decision doc 146–149. Nothing in
`readme.md`, `CLAUDE.md`, `installer/`, `scripts/`, the site.

**Adding a skill.** `.claude/skills/vwf-plugin/SKILL.md:160–167` (create
`skills/<name>/SKILL.md`, nothing else registers it, run `p:plugins:check`
because a strict-YAML failure drops the skill silently); invocation policy
174–184 (model-invocable when anything delegates to it). Checker rules that scan
a skill: `.claude/skills/plugin-authoring/references/checks.md:34–120` — rule 4
strict YAML, rule 6 root-relative references, rule 10 technology-free vwf prose
(`TOOL_TOKENS`, `check.ts:1251+`), rule 12 retired vocabulary.

**Docs that enumerate skills or describe today's behaviour.**
`.claude/skills/vwf-plugin/references/skills-and-agents.md:23–44` (table; the
"seven are user-only" claim at 11 is stale — six today, `design-system` is
model-invocable);
`.claude/skills/vwf-plugin/SKILL.md:41, 60–63, 187–189,
259–261`;
`references/docs-tree.md:36–45, 79–87`; `references/assets.md:22`;
`site/src/content/docs/plugins/vwf.md:361–405, 399–401, 758–783, 1921,
2030–2070`;
`how-to/operate/ad-hoc-change.md:62–65, 133–159, 226–228`;
`how-to/index.md:67–68`; `how-to/operate/production-feedback-loop.md:231–244`;
`readme.md:231–233`; `CLAUDE.md:49–50, 64, 150, 160, 275–278, 327`;
`.claude/docs/repo-shape.md:157–158`; `.claude/docs/ci-and-releases.md:83–84`;
`.claude/skills/release/SKILL.md:80–91, 118, 172`;
`.claude/skills/plugin-authoring/references/structure.md:35–44`,
`references/checks.md:38–39`.

**Gates.** No `.config/vwf.yaml` in this repo, so no `harness:` stamp. The
commit convention `.config/git-conventional-commits.yaml` allows types `ops`,
`docs`, `merge`, `feat`, `fix`, `refactor` and no scopes. `plugins.yml` runs the
marketplace, inventory, check and shellcheck tasks, vitest, the npm-normalize
test and both `tsc` projects; `site.yml` runs `p:site:check`. `plugins/**/*.md`
is not dprint-formatted; `CLAUDE.md`, `readme.md` and the site docs are.

**Memory.** `mempalace` was up; the wing's diary confirms the two 2026-09-13
runs copied the plan folder into the worktree untracked and the user's
2026-09-12 ruling on 13 and 17. `docs/backlog.md` is untracked at approval time.

## Assumed decisions — confirm or override at review

| #  | Decision                 | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Rejected                                                         | Unit       |
| -- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| 1  | Forbidden version        | A version is forbidden when any component equals 13 or 17 — `1.13.0`, `17.0.0`, `2.1.17`, `config_format` 17. `1.130.0` and `113.0.0` are fine. (User, MCQ.)                                                                                                                                                                                                                                                                                                                  | the digits 13 or 17 appearing anywhere in the string             | U4, U5, U6 |
| 2  | Bump tasks               | `p:i:version` and `p:site:version` skip past a forbidden number automatically and print what was skipped (`1.1.12` → patch → `1.1.14`); the release tasks refuse to tag a forbidden version as the last line. (User, MCQ.)                                                                                                                                                                                                                                                    | refuse and exit non-zero                                         | U5         |
| 3  | Checker                  | A second assertion inside the manifest rule (`checkManifest`), beside "is not plain semver". Every "thirteen rules" passage stays true; only the sentences describing what the manifest rule asserts change. (User, MCQ.)                                                                                                                                                                                                                                                     | a named rule 14                                                  | U4, U7     |
| 4  | Rule scope               | This repo's version tasks, the two plugin manifests, `config_format` and `blueprint_format`. The shipped mise task library is untouched — a target repo inherits nothing from this plan.                                                                                                                                                                                                                                                                                      | pushing the guard into the pack so target repos inherit it       | U5, U6     |
| 5  | Counters and old tags    | The `+N` staging counter is not a component. The release tasks check only the tags they would newly cut; `vwf-v19.17.0` predates the rule and stays real, as does `config_format` 13.                                                                                                                                                                                                                                                                                         | re-checking every existing ref                                   | U5         |
| 6  | Guard location           | A new repo-owned sidecar `.config/mise/tasks/_scripts/local`, sourced by the five tasks after `helpers`; the pack-owned `helpers` file is not edited.                                                                                                                                                                                                                                                                                                                         | editing `helpers`; inlining the loop in each task                | U5         |
| 7  | Commit path              | change-plan invokes `vwf:git-workflow` with declared preferences: work in place on the current branch (no worktree); stage the plan folder plus `docs/backlog.md` when it changed; commit `docs: change plan — <name> — approved, awaiting execution`; push to the branch's upstream, setting it when absent. (User, MCQ.)                                                                                                                                                    | raw git inside change-plan; commit only, then ask before pushing | U1         |
| 8  | Backlog ownership        | "Let only `backlog` skill be responsible to manage the file and content, others can simply call `backlog` skill to make changes. `change-plan`, `change-execute`, `plan`, `execute` any of them can call `backlog`." (User, verbatim.) Callers invoke `/vwf:backlog planned <ids> <folder>` and `/vwf:backlog done <ids>`.                                                                                                                                                    | callers editing the file themselves                              | U2, U3     |
| 9  | Backlog ids on a plan    | A `backlog:` frontmatter key — a list of ids — on change-plan folders' `index.md` and on `/vwf:plan`'s flat files. Empty or absent means the plan covers no backlog item.                                                                                                                                                                                                                                                                                                     | grepping the plan body for ids                                   | U1, U3     |
| 10 | Backlog skill shape      | `model: sonnet`, `effort: medium`, `disable-model-invocation: false`. Verbs: `add`, `list`, `next`, `move <id> <priority>`, `planned <ids> <folder>`, `done <ids>`, `close <id>`. Priorities `P1`–`P3`. Statuses `open`, `planned`, `done`, `closed`. Ids `Bnn`, sequential, never reused. The file: one table plus one `### Bnn — <title>` section per item, as the seed. The skill never commits.                                                                           | user-only; `haiku`; a mempalace room                             | U2         |
| 11 | Feedback vs backlog      | "`feedback` is different than `backlog`. `backlog` is something that can't be picked up right now, `feedback` is something that is being worked upon and might need change in `product`, `blueprint`, `architecture`, etc. It will then follow the `plan` and `execute` workflow." (User, verbatim.) Feedback's routing is untouched; its "not to a backlog" passage and the two manual passages gain one sentence stating this distinction; the backlog skill states it too. | deferred feedback becoming a backlog row                         | U2, U7     |
| 12 | This run's own rows      | The docs unit edits `docs/backlog.md` by hand to mark B01–B03 `done` with this folder's name — the one exception to decision 8, because the skill is not loaded in the run session.                                                                                                                                                                                                                                                                                           | leaving them `planned`                                           | U7         |
| 13 | Where the rule is stated | The bump rule sentence lives in `vwf-config.md`'s bump instruction, in `format-lineage.md`'s skip paragraph, in the change-plan interview's release-intent item and the plan template's gates-and-bump paragraph, in the release skill's three bump slots, and in the plugin-authoring `structure.md` versions section.                                                                                                                                                       | a single central doc                                             | U1, U6, U7 |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                                                          | Depends on | Status | Commit     |
| -- | ---- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ---------- |
| U1 | 1    | [01-change-plan.md](01-change-plan.md)       | `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/change-plan/references/interview.md`, `plugins/vwf/skills/change-plan/references/plan-template.md`                                                                                                             | —          | green  | `7d5708e7` |
| U2 | 1    | [02-backlog-skill.md](02-backlog-skill.md)   | `plugins/vwf/skills/backlog/SKILL.md` (new), `plugins/vwf/skills/feedback/SKILL.md`                                                                                                                                                                                           | —          | green  | `88b99756` |
| U3 | 1    | [03-callers.md](03-callers.md)               | `plugins/vwf/skills/change-execute/SKILL.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/archive/SKILL.md`, widened at run time: `plugins/vwf/skills/plan/references/plan-doc.md`, `plugins/vwf/assets/templates/plan.md` | —          | green  | `6b66810b` |
| U4 | 1    | [04-checker.md](04-checker.md)               | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                           | —          | green  | `8ea68dcf` |
| U5 | 1    | [05-version-tasks.md](05-version-tasks.md)   | `.config/mise/tasks/_scripts/local` (new), `.config/mise/tasks/p/i/version`, `.config/mise/tasks/p/site/version`, `.config/mise/tasks/p/i/release`, `.config/mise/tasks/p/site/release`, `.config/mise/tasks/p/plugins/release`                                               | —          | green  | `69d0b3d1` |
| U6 | 1    | [06-stamp-doctrine.md](06-stamp-doctrine.md) | `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/skills/setup/references/format-lineage.md`                                                                                                                                                                                   | —          | green  | `ab5bbdf7` |
| U7 | 2    | [07-docs.md](07-docs.md)                     | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/**`, `site/src/content/docs/**`, `docs/backlog.md`, `docs/memory/decisions/2026-09-13-vwf-process.md` (new), widened at run time: `site/CLAUDE.md`                                                               | U1–U6      | green  | `fde65598` |
| U8 | 3    | [08-gates-and-bump.md](08-gates-and-bump.md) | `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                              | U7         | green  | `89e83829` |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                               | Why it collides                                            | Owner   |
| ------------------------------------------------------------------ | ---------------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`      | several units bumping one version is a lost update         | U8 only |
| `.claude-plugin/marketplace.json`                                  | generated from the manifest; regenerating mid-wave races   | U8 only |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**` | n units editing one doc                                    | U7 only |
| `docs/backlog.md`                                                  | the backlog skill is its sole writer; this run's exception | U7 only |
| `plugins/vwf/skills/change-plan/**`                                | B01, B02 and B03 all reach it                              | U1 only |
| `plugins/vwf/skills/feedback/SKILL.md`                             | the backlog distinction sentence                           | U2 only |
| `.config/mise/tasks/_scripts/helpers`                              | pack-owned; nobody edits it                                | nobody  |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5, U6.** Six disjoint trees: the change-plan
  skill; the new backlog skill plus one sentence in feedback; the four caller
  skills; the checker; the repo's version tasks; two vwf doctrine files. No unit
  reads another's output.
- **Wave 2 — U7.** Docs, over the branch delta plus the survey's list.
- **Wave 3 — U8.** The two bumps, the marketplace generator, the full gate.

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
green before wave 1. The two checks that hold only once a unit has landed — the
checker refusing a `1.13.0` manifest, the guard skipping `1.1.13` — are U4's and
U5's *Verification* and are repeated in U8's.

## After landing

| Step                       | Mode | Notes                                                                                                                                                            |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages vwf into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugin. |
| `/release`                 | ask  | Cuts `vwf-v19.21.0` and `site-v1.1.10` per the consent block. The run stops once and asks first.                                                                 |

## Gates the orchestrator keeps

- **The guard, in a scratch shell.** From the worktree root:
  `bash -c 'source .config/mise/tasks/_scripts/local; for v in 1.1.13 17.0.0 2.1.17; do version_forbidden "$v" && echo "refused $v"; done; for v in 1.130.0 113.0.0 19.21.0; do version_forbidden "$v" || echo "allowed $v"; done'`
  prints three `refused` and three `allowed` lines. Then, in a temp directory
  holding a `package.json` at `"version": "1.1.12"`, the bump loop U5 wrote
  (copied from `p/i/version`) leaves it at `1.1.14` and prints the skip.
- **The checker, on a scratch manifest.** Copy `plugins/vwf` to a temp plugins
  root, set its version to `1.13.0`, run the checker's manifest rule over it
  (the vitest case U4 adds is the same proof); the message names the component.
- **The new skill loads.** After U8, `claude plugin validate plugins/vwf` (or
  the `validate --strict` form the last runs used) lists `backlog` among the
  skills.

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

- **Feedback's routing.** Decision 11: feedback is worked now and routes into
  product, blueprint, architecture and then plan and execute; whether the
  shipped skill does exactly that is group C's plan (backlog B05).
- **The shipped mise task library.** Decision 4: no pack file changes, so a
  target repo's own bump tasks know nothing of the rule.
- **A rule 14.** Decision 3.
- **A `/vwf:plan` no-argument "pick the next backlog item" mode.** `plan` keeps
  its mandatory slice argument; `/vwf:backlog next` prints the item and the
  command to run.
- **Retiring the stale "seven user-only" count** is fixed by U7 in passing (it
  is six), but no invocation mode changes.

## Parked

- **Group C (B05).** The user's definition, 2026-09-13: "`feedback` is different
  than `backlog`. `backlog` is something that can't be picked up right now,
  `feedback` is something that is being worked upon and might need change in
  `product`, `blueprint`, `architecture`, etc. It will then follow the `plan`
  and `execute` workflow." Group C's plan starts by checking the shipped
  `feedback` skill against this sentence, and by the 2026-09-08 parked item —
  feedback routing a non-blueprint fix into `change-plan`.
- **The pack task library and the 13/17 rule.** If a target repo should inherit
  the guard, that is a stackgen mise-pack change with its own plan.

## Run log

| Wave | Unit         | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Commit |
| ---- | ------------ | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight    | —     | —     | green       | all nine gate lines green on the inherited branch; `setup:worktree` failed at `setup:deps:{outdated,audit}` (pnpm v12 dropped `outdated --depth` and `audit --reporter summary`) — pre-existing, not a gate line; lockfile restored and installed frozen                                                                                                                                                                                                                                                                                                                                                                                                                | —      |
| 1    | U1           | opus  | 1     | green       | change-plan SKILL §1/§6/§8 + never-does; interview 17/18; template `backlog: []`, skip rule, launch sentence. DECIDED: skip sentence says "never issued on any version line" (shipped prose reads in a target repo). DOCS FALSIFIED: site vwf.md `#vwfchange-plan` hand-off; how-to ad-hoc-change.md 133–159. GAP none                                                                                                                                                                                                                                                                                                                                                  |        |
| 1    | U6           | opus  | 1     | green       | vwf-config.md bump instruction + format-lineage.md skip paragraph state the standing rule. DECIDED: old stamps read by history not rule — 17 on either line reads 16, blueprint_format 13 reads 12, config_format 13 reads itself (decision 5 keeps it real). GAP: plan's "12 goes to 14" illustration is false for config_format (it issued 13); written counterfactually, plus "stamps issued before the rule stand"                                                                                                                                                                                                                                                  |        |
| 1    | U2           | opus  | 1     | green       | new backlog skill (sonnet/medium/model-invocable, seven verbs); feedback "not to a backlog" clause reworded. DECIDED: vocabulary + callers as tables; `add` creates the file, other verbs report absence; next id = highest+1. GAP: `planned` on an already-planned item asks rather than overwrites; `done` on a never-planned item moves it and says so                                                                                                                                                                                                                                                                                                               |        |
| 1    | U3           | opus  | 1     | green       | change-execute §1 reads `backlog:` + refuses an uncommitted folder, §7 calls `backlog done`; plan §2/§7/§9; execute final gate + Autonomous Rules; archive §3. DECIDED: never-edits sentence in each skill's standing-rules block; archive covers both plan shapes. GAP: `/vwf:plan`'s frontmatter is spelled out in `plan/references/plan-doc.md` and `assets/templates/plan.md`, neither owned — orchestrator widened U3's Owns to both (round 2). GAP: blocking.md needs no edit                                                                                                                                                                                     |        |
| 1    | U4           | opus  | 1     | green       | check.ts second assertion inside checkManifest (13/17 component after prerelease strip); two vitest cases. DECIDED: strip prerelease via replace before split. DOCS FALSIFIED: plugin-authoring checks.md:40–41 (rule 1 title), structure.md:43–44, CLAUDE.md:319–320, ci-and-releases.md:83–84, dev-marketplace.md:61 — all say build metadata only. GAP none                                                                                                                                                                                                                                                                                                          |        |
| 1    | U3           | opus  | 2     | green       | widened Owns: `backlog: []` in templates/plan.md, `backlog:` defined in plan-doc.md §7. DECIDED: two neighbouring lines reflowed at 80. GAP closed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |        |
| 1    | U5           | opus  | 1     | green       | new `_scripts/local` sidecar (`version_forbidden`, `version_skip_note`); bump loops in p/i and p/site version; refusal step in the three release tasks (plugins: `FORBIDDEN` set over newly-cut refs only). DECIDED: shebang + exec bit on the sidecar (else invisible to `shell_files_in_scope`); release ladders renumbered. DOCS FALSIFIED: ci-and-releases.md:60–61,260,268; release/SKILL.md:118,172; repo-shape.md:221,253. GAP: unbounded skip loop never clears a forbidden minor on a patch bump (`1.13.5`) — capped at 10 attempts with an explicit error                                                                                                     |        |
| 1    | R1           | opus  | 1     | findings(5) | CONTRACT clean, RULINGS clean. (1) backlog/SKILL.md:125–131 [U2] r4 callers table misaligned; (2) change-plan/SKILL.md:3–11 [U1] r5 frontmatter description omits commit/push/backlog; (3) plan/archive/execute Doc Paths tables omit `docs/backlog.md` [U3] r5; (4) backlog/SKILL.md:37–38 [U2] r5 which repo holds the backlog in a multi-repo product is undetermined; (5) p/i,site/release refusal is step 3 not last [U5] r2 — the unit file directed that placement, plan-consistent, no loop. 1–4 looped                                                                                                                                                         |        |
| 1    | U1           | opus  | 2     | green       | R1 finding 2: frontmatter description now names the backlog-planned call and the commit-and-push; 36 skills still parse                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |        |
| 1    | U2           | opus  | 2     | green       | R1 findings 1+4: callers table realigned (95 cols, all rows match separator); location restated as the base repo's `docs/`. GAP: multi-repo placement unruled — assumed the backlog is product-level, base repo only, one per product; a member caller addresses the base's file                                                                                                                                                                                                                                                                                                                                                                                        |        |
| 1    | U3           | opus  | 3     | green       | R1 finding 3: `Backlog` row added to the Doc Paths tables of plan, archive, execute, each with the verb that file calls                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |        |
| 1    | R1           | opus  | 2     | findings(2) | converging (5→2, none resurfaced), CONTRACT clean, RULINGS clean. (6) change-plan/SKILL.md:11 [U1] r4 ragged fold in the description; (7) plan/archive/execute Doc Paths `Backlog` rows carry no `(base repo)` marker and change-plan:47–48 / plan:94 say "when the repo has one" [U1,U3] r5 — a member-repo session would skip the base's backlog. Review cap reached; both looped to U1/U3 as mechanical fixes without a third review round — listed in the final report as fixed-after-cap                                                                                                                                                                           |        |
| 1    | U1           | opus  | 3     | green       | R1 findings 6+7 (after cap): description re-flowed at 80; recall bullet reads the base repo's `docs/backlog.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |        |
| 1    | U3           | opus  | 4     | green       | R1 finding 7 (after cap): `(base repo)` marker on the three Backlog rows, archive/execute tables widened; plan §2 reads the base repo's file                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |        |
| 2    | U7           | opus  | 1     | green       | 17 files: release skill, ci-and-releases, repo-shape, dev-marketplace, plugin-authoring checks+structure, vwf-plugin SKILL + 3 refs, CLAUDE.md, readme, site vwf.md (+`#vwfbacklog` section), ad-hoc-change, production-feedback-loop, backlog.md B01–B03 done, new decision doc. DECIDED: site plan/execute/archive sections gained backlog calls (surveyor); `_scripts/local` paragraph in repo-shape not the shellcheck bullet. DOCS FALSIFIED: `site/CLAUDE.md` Tasks rows for `p:site:version`/`p:site:release` — nobody's Owns; orchestrator widened U7 to `site/CLAUDE.md` (round 2). GAP: edit 11 (how-to/index.md:67–68) conditional, not falsified, untouched |        |
| 2    | U7           | opus  | 2     | green       | widened Owns: `site/CLAUDE.md` Tasks rows for `p:site:version` (skip, prints what it skipped) and `p:site:release` (refusal). Format re-padded the run-log table (orchestrator's), whitespace only                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |        |
| 2    | R2           | opus  | 1     | findings(4) | CONTRACT clean, RULINGS clean. (1) ad-hoc-change.md:232 archive "closes" — wrong verb/state, it marks `done`; (2) site vwf.md:1896 bold lead "closed on the way out" collides with the `close` verb; (3) docs/backlog.md:12 B02 row still says "anywhere" (decision 1: component); (4) index.md run-log row unpadded — orchestrator's, fixed by the pre-stage pass. 1–3 looped to U7                                                                                                                                                                                                                                                                                    |        |
| 2    | U7           | opus  | 3     | green       | R2 findings 1–3: archive "marks … `done`" in ad-hoc-change; site lead "marked `done` on the way out"; B02 row states the component rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |        |
| 2    | R2           | opus  | 2     | pass        | all three fixes landed, none resurfaced, nothing new; site check green, every U7 table padded                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |        |
| 3    | U8           | opus  | 1     | green       | vwf 19.20.0 → 19.21.0 (+ `backlog` keyword), site 1.1.9 → 1.1.10 via bare `p:site:version` (no skip note), marketplace regenerated pinning `vwf-v19.21.0`; all nine gate lines + both repeated proofs pass. GAP: `claude plugin validate` prints no skill list on this CLI — substituted `p:plugins:check` (36 skills, 35 before U2)                                                                                                                                                                                                                                                                                                                                    |        |
| 3    | R3           | opus  | 1     | pass        | three owned paths only; versions exactly per consent; keyword directed by the unit file; marketplace diff is the vwf ref/version/keyword; no doc states 19.20.0 or 1.1.9 literally                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |        |
| 3    | orchestrator | —     | —     | green       | wave gate nine lines green after U8. Kept gates: guard scratch shell 3 refused / 3 allowed, scratch bump 1.1.12 → 1.1.14 with the skip note; checker over a scratch `1.13.0` manifest returns exactly one finding naming the component; `claude plugin validate --strict plugins/vwf` passes but lists no skills on this CLI — the skill-load proof is `p:plugins:check`'s 36 skills (35 before U2) with `name: backlog` parsing                                                                                                                                                                                                                                        | —      |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-13-vwf-process
