---
type: vwf-change-plan
title: init walks the members
requires: []
---

# Plan — init walks the members (2026-09-13)

## Status

**RUNNING** since 2026-09-13 — worktree
`.worktrees/2026-09-13-init-walks-the-members`, branch
`2026-09-13-init-walks-the-members`, cut from `develop` at `936154be`.

Approved 2026-09-13 by the user.

## Consent

| Action                                            | Granted                                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes — a deliberate override of the standing in-the-moment consent rule, for this plan only                                      |
| After landing: `mise run p:plugins:local`         | run                                                                                                                             |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json`, `19.18.0` → `19.19.0`, by editing the `version` field                         |
| Release stackgen publicly                         | patch — `plugins/stackgen/.claude-plugin/plugin.json`, `1.8.0` → `1.8.1`, by editing the `version` field                        |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U9 runs it first), `1.1.7` → `1.1.8` |
| Release installer publicly                        | none                                                                                                                            |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session. This
plan has **no release step**: the three versions are bumped by U9 and the tags
wait for a later session's `/release`.

## Goal

After this lands, one `/vwf:init` run from a base repo shapes that repo **and
every member repo it has** — each submodule, and each sibling the config
declares — in one survey, one plan with a section per repo, and on one consent.
Today it shapes the root and silently leaves the members on their old task
libraries: the user's 95octane run left `backend`, `frontend` and `devops` on
`c/`, `k/`, `w/`, `merge/develop`, `flutter/` and the rest while the root moved
to the contract names.

The framing: the packs need no change, because a pack's `config/` payload lands
relative to the nearest config root and the toolchain library's own
`setup:all --all` already loops the members and runs each member's own library.
What is missing is the orchestration — init never descends into a member — and
the drift detection that would open setup's door when a member falls behind.

**Three reversals**, each recorded in the decisions doc U8 writes:

1. **"The shape is per repo, not per product."**
   `site/src/content/docs/how-to/greenfield/multi-repo.md:46-51` says each
   member gets its own init run; the 2026-09-06 decision
   (`docs/memory/decisions/2026-09-06-init-behind-setup.md`, "What stays
   outside") dropped init's target directory with "a different directory means
   running `/vwf:setup` there". Both are reversed: the shape is per repo, but
   the **run** is per product.
2. **"`init` never writes outside the target repo"**
   (`plugins/vwf/skills/init/references/new-repo.md:176`). A sibling member sits
   at `../<name>`, outside the base tree. The rule becomes: init never writes
   outside the repos it **resolved** as the base and its members.
3. **The landing consent rule.** Memory records that merge to develop, push and
   release each need explicit in-the-moment consent. The user chose an
   unattended landing for this plan. Recorded as a one-plan override, not as a
   change to the rule.

## Facts the survey established

**The init skill** (`plugins/vwf/skills/init/`): `SKILL.md` 370 lines,
`references/new-repo.md` 411, `references/existing-repo.md` 655,
`references/fragments-and-sections.md` 207, `references/readme-and-license.md`
88. Single-target statements: `SKILL.md:102-105` (no arguments, never another
directory), `:107-112` (mode table on one target), `:155` (name from basename),
`:279-281` (one lockfile); `new-repo.md:12-15` (§1 creates "the repository"),
`:105`, `:159-163` (single-project = no members), `:176` (never writes outside
the target), `:191-198` (`MEMBERS` filled from the registry's member list under
siblings only; under submodules it stays as shipped), `:329-333` (stages one
run's lists in one index), `:374-379` (one branch table);
`existing-repo.md:16-19` (pass 1 walks one root), `:257-271` (one
`.config/vwf.yaml` for `kept_files`), `:348-362` (member flags, `MEMBERS`),
`:449-450` (origin read from cwd), `:581-602` (gate-config-first commit in one
tree). Section structure — `new-repo.md`: §1:12 §2:36 §3:53 §4:64 §5:80 §6:91
§7:98 (marked positions 140, `_default` 221) §8:242 §9:248 §10:288 §11:304 (a
313, b 329, c 335, d 369, e 392) §12:405. `existing-repo.md`: Survey 12; passes
1:16 2:69 3:76 4:112 5:124 6:211 7:281 8:291 9:308 10:396 11:431; Plan 467;
Consent 519; Apply 538 (gate config commits first 581); Report 619. The report
shape is `SKILL.md:292-313`, flat, no per-repo grouping. "Member" is overloaded
in the skill today: a per-project id (the flags, the aliases) versus a sibling
repo path (`MEMBERS`).

**The topology model** lives in `.config/vwf.yaml`, not the registry:
`topology: repo|monorepo|multi-repo`, `linkage: submodule|siblings`,
`members[].{name,path,url,projects}` (`plugins/vwf/assets/vwf-config.md:51-63`,
format 15); the registry template disclaims `members`
(`assets/templates/registry.yaml:15-17`). Each member back-links through
`.config/vwf-membership.yaml` (`vwf_membership`, `product`, `host`). The owning
asset is `plugins/vwf/assets/membership.md`: the two-file contract (`:12-43`),
base-repo resolution in five steps including the superproject hop (`:64-83`),
presence never recorded (`:92-104`), the absent-member sequence — detect, offer
a consent-gated clone (`git submodule update --init <path>` under submodules,
`git clone <url> <path>` under siblings), on decline proceed and record the
blind spot; `execute` alone halts (`:106-140`). `linkage:` is single-valued.

**Setup and doctor.** Setup's Step 0
(`plugins/vwf/skills/setup/SKILL.md:79-100`) is cwd-root-only: three slugs in
the lockfile, then doctor's six shape predicates on the repo it stands in; it
writes member back-links at `:156-160`. Doctor resolves the base first
(`doctor/SKILL.md:82-88`), checks membership in both directions as blocking
(`:99-109`), and its six shape predicates are
`doctor/references/stack-checks.md:233-352` — (a) pack versions `:246`, (b)
project ids `:265`, (c) branches `:285`, (d) `REPO_NAME` `:292`, (e) content
drift `:298`, (f) `MERGE_MODEL`/`MEMBERS` `:336-352` — all `drift`, one remedy
`/vwf:setup reshape`, all root-scoped. Doctor already walks every
locally-present member for graphify (`SKILL.md:145`).

**The packs need no functional change.** Mise pack
`plugins/stackgen/stacks/toolchain-manager/mise/` at `pack.yaml` version
`1.2.0`, pinned in `stacks/bundles/mise.md:7` and reflected in the generated
`stacks/inventory.md:139`. Its `members()` helper
(`config/.config/mise/tasks/_scripts/helpers:100-110`) reads `.gitmodules`
(`git submodule foreach --recursive`) else word-splits `$MEMBERS`;
`setup:all
--all` (`tasks/setup/all:71-77`) loops it with
`mise run --cd <root>/<member>
setup:all`, each member's own library;
`code:worktrees` walks the same list. The per-member flags are a commented
template at `tasks/setup/all:8-17` whose text says "One member flag per project
… the ids come from the project registry when there is one, else the member
directory name". `MEMBERS` is declared at `config/.config/mise.toml:129-140` as
a space-separated string, doc-ruled empty under submodules; the alias template
is `mise.dev.toml:44-48`. The pack's own prose on these positions:
`skills/mise/SKILL.md:147,155-162`,
`references/task-library.md:277-302,566-575`,
`references/config-files.md:93-97,
114-120`, `conventions.md:52`. The
legacy-name table is `references/task-library.md:613-660`. Pack `config/` trees
mirror the repo root and every task keys off `MISE_PROJECT_ROOT`; the gates
scope by `git -C $MISE_PROJECT_ROOT ls-files`, so a parent's gate never descends
into a submodule and a submodule needs its own gate config — which is what
shaping it gives it.

**95octane, the motivating case** (`~/Projects/github.com/95octane/95octane`):
`.gitmodules` names `backend`, `frontend`, `devops`; `.config/vwf.yaml` reads
`config_format: 14`, `topology: polyrepo`, **no `members:` key**. The root
carries the contract task names; each member carries its own full `.config/`
with a legacy task library. Never written to by this plan.

**Gates.** Checker rules that fire on `plugins/vwf/skills/init/**`: 5 (strict
YAML frontmatter, `scripts/src/check.ts:660`), 7 (`${CLAUDE_PLUGIN_ROOT}` refs
resolve inside vwf, `:738`), 8 (agent-role tokens name real agents, `:1055`), 11
(technology-free vwf, `:1485` — tool tokens at `:1261-1300`), 12 (retired
vocabulary stated as live, `:1669`). Rule 13 (`:860`) fires on stackgen pack
edits. Rule 4 (`:405`) covers the pack `config/` tier. No test and no rule
asserts anything about init's question count, report shape or scope.
`plugins/**/*.md` is dprint-excluded; `CLAUDE.md`, `readme.md` and
`site/src/content/docs/**` are dprint-formatted; `plugins/*/stacks/*/*/config/`
is excluded whole and must never be formatted with this repo's config. CI
(`.github/workflows/plugins.yml`) runs marketplace, inventory, check,
shellcheck, vitest, npm-normalize-test and the two tsc projects; `site.yml` runs
`p:site:check`. Versions: vwf `19.18.0`, stackgen `1.8.0`, site `1.1.7`. No task
bumps a plugin version; `p:site:version` bumps the site (patch by default, no
positional, refuses a dirty tree).

**Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
`docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

**Docs that describe today's behaviour**, all owned by U8: count-bearing —
"seven questions" at `CLAUDE.md:246`, `.claude/skills/vwf-plugin/SKILL.md:75`,
`.claude/skills/vwf-plugin/references/skills-and-agents.md:25`,
`site/src/content/docs/plugins/vwf.md:874` (and 877, 918),
`site/src/content/docs/how-to/greenfield/single-repo.md:67`; "ten counted
sections" `site vwf.md:934`; "eleven passes" `site vwf.md:911`,
`skills-and-agents.md:25`. Scope-bearing — `site vwf.md:814-815, 866-872` ("no
directory argument … Shaping a different repository means running `/vwf:setup`
there"), `skills-and-agents.md:25` ("no flags, no target argument"),
`how-to/greenfield/multi-repo.md:46-51, 136-148, 310-314`. One consent —
`site vwf.md:910, 933-937, 989, 1018-1028`, `single-repo.md:74`,
`how-to/brownfield/onboard-existing-codebase.md:82-94`. `MEMBERS` and member
flags — `site vwf.md:858-864, 888, 1079`,
`site stackgen.md:387-389, 620-626,
720-746`. The reshape door and the six
predicates — `readme.md:109-114`, `CLAUDE.md:241-258, 393-396`,
`site vwf.md:1066-1122`,
`.claude/skills/vwf-plugin/references/dependencies.md:31-44`,
`.claude/skills/stackgen-plugin/SKILL.md:65-70`. Already stale, fixed in
passing: `single-repo.md:76-79` still says init asks which branch the remote
should default to. `installer/CLAUDE.md`, `site/CLAUDE.md`, `.claude/docs/**`:
no falsified passages.

**Last plan's parked list** (`docs/plans/archived/2026-09-12-init-brownfield/`)
already carries "95octane's own migration" — `config_format` 14 → 16, `polyrepo`
→ `multi-repo` + `linkage`. It stays parked here.

## Assumed decisions — confirm or override at review

| #  | Decision                                               | Ruling                                                                                                                                                                                                                                                                                                                                | Rejected                                                                                                        | Unit   |
| -- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| 1  | Where the member loop lives                            | init walks members itself: one survey across the base and every member, one plan with a section per repo, one consent, per-repo report sections                                                                                                                                                                                       | setup driving the loop with one init per repo; report-only                                                      | U1–U3  |
| 2  | The member source                                      | `.gitmodules` paths (walked recursively, as the pack's helper does) **union** the `members:` list in `.config/vwf.yaml`, deduped on realpath. A path in one source and not the other is reported as a membership disagreement, never shaped                                                                                           | submodules only; config `members:` only                                                                         | U1     |
| 3  | The git pass                                           | The landing model and the three-answer commit question are asked once and applied to every repo. Members commit first, then the base commits the run's files **plus** the changed gitlinks, which init deliberately stages. Push, on the commit-and-push answer, pushes every repo. The branch pair is created per repo that lacks it | leaving the gitlinks unstaged; dropping the git pass for a multi-repo run                                       | U2     |
| 4  | The seven questions                                    | Still seven rounds. Questions 2, 6 and 7 list one row per repo inside their single round (question 2 grouped by repo, each repo's own row first). Questions 4 and 5 are answered once and written into every repo. Questions 1 and 3 apply per repo that resolved to mode new                                                         | one answer everywhere; a product round plus a round per repo                                                    | U1, U4 |
| 5  | The aggregator's member flags and the `setup-` aliases | Filled from the resolved **member repos**, one flag and one alias per member, never from project ids. A reshape rewrites flags an earlier run wrote from project ids, as a rewrite row. Project ids still fill `p:<slug>:*` and `REPO_NAME` in each repo                                                                              | leaving the conflation; flags from members but aliases from projects                                            | U2, U7 |
| 6  | An absent member                                       | A clone row inside the same plan — `git submodule update --init <path>` under submodules, `git clone <url> <path>` under siblings, per the membership asset — covered by the same yes; the member is then surveyed and shaped in the same run. A member with no clone source is reported as absent and uncloneable, with no row       | skip and record; a separate round before the plan                                                               | U1, U3 |
| 7  | Doctor's shape predicates                              | All six evaluate per repo — the base and every locally-present member — grouped by repo in §5, one `/vwf:setup reshape` remedy. An absent member is a blind spot, never a finding                                                                                                                                                     | one new member predicate; doctor root-only                                                                      | U5     |
| 8  | Mode resolves per repo                                 | Step 0's mode table is applied to each resolved repo on its own markers; a base can be existing while a member is new, and the plan says each repo's mode in its section                                                                                                                                                              | one mode for the run                                                                                            | U1     |
| 9  | Apply order                                            | Members are applied and committed before the base, so the base's gitlinks are current when it commits. Within a repo the existing order holds — fills, three merges, git pass                                                                                                                                                         | base first                                                                                                      | U2, U3 |
| 10 | Project ids inside a member                            | The base registry's `members[].projects` where the config declares them; else the member's own sub-project directories; else the member's name. Each member's own row carries its `REPO_NAME`                                                                                                                                         | reusing the base's project list for every member                                                                | U1, U2 |
| 11 | `MEMBERS` env fill                                     | Unchanged: empty where `.gitmodules` exists, the sibling paths from `members:` otherwise. Ruling 5 changes the flags and aliases only                                                                                                                                                                                                 | filling `MEMBERS` under submodules too                                                                          | U2     |
| 12 | The report                                             | The ten file sections repeat under one heading per repo, base first; the git section prints the landing model once, then branches, commit and push one line per repo, then one `Gitlinks staged` line for the base                                                                                                                    | one flat report                                                                                                 | U1     |
| 13 | Idempotency across the product                         | A second run on a fully shaped product prints an empty plan with a section per repo each reading nothing, and says the product is shaped                                                                                                                                                                                              | reporting only the base                                                                                         | U1, U3 |
| 14 | The gate-config-first commit                           | `existing-repo.md`'s "gate configuration commits first, alone" applies **per repo**, since each repo's pre-commit is its own                                                                                                                                                                                                          | once for the run                                                                                                | U3     |
| 15 | The mise pack version                                  | `1.2.0` → `1.2.1`: the change is comment and prose, no task behaviour moves. `pack.yaml`, the bundle pin and the regenerated inventory land in **one** commit — the orchestrator regenerates the inventory before committing U7                                                                                                       | minor; leaving the pack version alone (doctor would then report unexplained content drift on every shaped repo) | U7     |
| 16 | The fixture                                            | Two submodules, no sibling: a sibling fixture needs a format-15 `members:` config and would drag the config migration in. The absent-member row is proven on a second clone of the fixture made without `--recurse-submodules`                                                                                                        | a copy of 95octane; a sibling fixture                                                                           | gate   |
| 17 | Model per unit                                         | `opus` for every unit                                                                                                                                                                                                                                                                                                                 | —                                                                                                               | all    |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-init-skill.md](01-init-skill.md)         | `plugins/vwf/skills/init/SKILL.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —          | green   | 113401f5 |
| U2 | 1    | [02-init-new-repo.md](02-init-new-repo.md)   | `plugins/vwf/skills/init/references/new-repo.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —          | green   | 0a6f45d0 |
| U3 | 1    | [03-init-existing.md](03-init-existing.md)   | `plugins/vwf/skills/init/references/existing-repo.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —          | failed  | 4a57960a |
| U4 | 1    | [04-init-per-repo.md](04-init-per-repo.md)   | `plugins/vwf/skills/init/references/readme-and-license.md`, `plugins/vwf/skills/init/references/fragments-and-sections.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —          | green   | 6abb7ac4 |
| U5 | 2    | [05-doctor.md](05-doctor.md)                 | `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | U1         | pending |          |
| U6 | 2    | [06-setup.md](06-setup.md)                   | `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/onboard-pipeline.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | U1         | pending |          |
| U7 | 2    | [07-mise-pack.md](07-mise-pack.md)           | `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`, `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all`, `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.dev.toml`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/config-files.md`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`, `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/stacks/inventory.md` (regenerated by the orchestrator before U7's commit) | —          | pending |          |
| U8 | 3    | [08-docs.md](08-docs.md)                     | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-13-init-walks-the-members.md`, every `DOCS FALSIFIED:` path; widened at run time by R1 round 1 to `plugins/vwf/assets/vwf-config.md:110` (the `kept_files` path-spelling sentence)                                                                                                                                                                                                                                                                                                                                   | U1–U7      | skipped |          |
| U9 | 4    | [09-gates-and-bump.md](09-gates-and-bump.md) | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | U8         | skipped |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                       | Why it collides                                                        | Owner                                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`                   | version file                                                           | U9 only                                                         |
| `plugins/stackgen/.claude-plugin/plugin.json`              | version file                                                           | U9 only                                                         |
| `site/package.json`                                        | version file, bumped by a task that refuses a dirty tree               | U9 only, first                                                  |
| `.claude-plugin/marketplace.json`                          | generated; regenerating mid-wave races                                 | U9 only                                                         |
| `plugins/stackgen/stacks/inventory.md`                     | generated; must land with `pack.yaml` and the bundle pin in one commit | U7's commit — regenerated by the orchestrator, edited by no one |
| `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml` | pack version; the bundle pin and the inventory must move with it       | U7 only                                                         |
| every human-facing doc under U8's Owns                     | n units editing one doc                                                | U8 only                                                         |
| `plugins/vwf/skills/init/SKILL.md` and its four references | four wave-1 units edit one skill                                       | one file per unit — U1, U2, U3, U4 own disjoint files           |
| `plugins/vwf/assets/membership.md`                         | U1, U5 and U6 all cite it                                              | nobody — cited, never edited                                    |

## Waves

- **Wave 1 — U1, U2, U3, U4.** The init skill, one file per unit. Disjoint
  paths; every unit carries the same rulings quoted, so no unit waits on
  another's text. U2 and U3 cite `SKILL.md` sections by their current headings
  and U1 keeps every heading name.
- **Wave 2 — U5, U6, U7.** The consumers. U5 and U6 cite init's new behaviour
  and depend on U1 having landed so their citations resolve; U7 is a pack edit
  with no dependency. Disjoint trees. The orchestrator runs
  `mise run p:plugins:inventory` **before** committing U7 so `pack.yaml`, the
  bundle pin and the inventory land together; until that commit the wave gate's
  inventory check is expected to fail and is re-run after it.
- **Gate after wave 1 — the fixture** (below), before the consumers cite the
  behaviour and before any doc is written; run again before landing.
- **Wave 3 — U8.** Docs and the decisions doc, after every behaviour change is
  in.
- **Wave 4 — U9.** Versions, the marketplace, the full gate.

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
red between U7's `pack.yaml` edit and the orchestrator's regeneration, and
`p:plugins:marketplace --check` is red between U9's version edits and its
regeneration; both are green again inside the same unit's commit.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                          |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | Stages vwf and stackgen into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugins. |

No release step. The tags wait for a later `/release`.

## Gates the orchestrator keeps

**The multi-repo fixture**, run after wave 1 and again before landing. It
follows the **edited** init prose from the worktree — the orchestrator (or a
subagent it dispatches with the worktree's `plugins/vwf/skills/init/` and
`plugins/stackgen/stacks/` paths as the skill and the packs) executes `SKILL.md`
and its references verbatim against the fixture; the installed plugin is **not**
what is being tested. Each pass condition is replayed against the ruling it
proves, named in brackets.

1. **Build.** Under `mktemp -d`: three repos, each `git init -b develop` with a
   throwaway identity. `a/` and `b/` each carry `.config/mise.toml` (any valid
   minimal content) and a legacy task library:
   `.config/mise/tasks/merge/develop`, `.config/mise/tasks/worktree/init`, and
   `.config/mise/tasks/_scripts/_helpers` defining `print_green` — three
   left-hand names from the legacy table at
   `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md:613-660`.
   Every task file executable with a shebang. Commit each. `base/` has a readme
   only; `git submodule add ../a a` and `git submodule add ../b b`; commit. No
   `.config/vwf.yaml` anywhere — the members come from `.gitmodules` alone.
2. **Run** init in `base/` through `/vwf:setup reshape`, answering the seven
   questions with fixed answers: accept every id row; secrets **none**; plugins
   **none**; licence **none** for all three rows; security contact **declined**
   for all three rows; landing model `direct`; and **commit** (not push — there
   is no origin) at the three-answer question.
3. **Pass conditions, read from the plan the skill presents before the yes:**
   - it carries exactly **three sections**, `base` first, then `a`, then `b`
     [ruling 1, 12];
   - `base` resolves mode **existing** or **new** as its markers say, and `a`
     and `b` each resolve **existing** on their own markers [ruling 8];
   - `a`'s and `b`'s sections each list the three legacy names as **rename**
     rows and `_scripts/_helpers` as a replace-or-keep row [ruling 1 — the
     eleven passes ran per member];
   - `base`'s section lists the aggregator's member flags `--a` and `--b` and
     the aliases `setup-a` and `setup-b` as fills, and **no** flag or alias
     named for a project id [ruling 5];
   - question 7 showed **three rows**, one per repo [ruling 4].
4. **Pass conditions, read from the trees after the yes:**
   - `a/.config/mise/tasks/code/merge/develop` and `setup/worktree` exist and
     `merge/develop` and `worktree/init` do not; same for `b/` [ruling 1];
   - `git -C a log --oneline` and `git -C b log --oneline` each show **one new
     commit** with the fixed `ops:` message, and `git -C base log --oneline`
     shows one new commit [ruling 3];
   - `git -C base show --stat HEAD` lists **both** gitlinks `a` and `b` among
     the changed paths, and `git -C base ls-tree HEAD a` names `a`'s new HEAD
     [ruling 3, 9];
   - `git -C base status --short` is empty, and so is each member's [ruling 3];
   - `base/.config/mise/tasks/setup/all` carries `#USAGE flag "--a"` and
     `#USAGE flag "--b"`, and `base/.config/mise.dev.toml` carries `setup-a` and
     `setup-b` aliases [ruling 5];
   - the report groups its ten sections under three headings and its git section
     prints one commit line per repo plus a `Gitlinks staged 2` line [ruling
     12].
5. **The absent member.** `git clone base clone` **without**
   `--recurse-submodules`, so `clone/a` and `clone/b` are empty directories. Run
   init in `clone/` and **decline** at the yes. Pass: the plan carries a **clone
   row** for `a` and for `b` reading `git submodule update --init a` (resp.
   `b`), each followed by "then survey and shape it", and after the decline
   `git -C clone status --short` is empty and `clone/a` is still empty [ruling
   6].
6. **Idempotency.** Run init in `base/` again. Pass: the plan is **empty**,
   printed as three sections each reading nothing, and the skill says the
   product is shaped [ruling 13].
7. Remove the temp dir. Record in the run log which of steps 3–6 passed and, for
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

- **The `config_format` migration** — `polyrepo` → `multi-repo` + `linkage`, the
  `members:` key on 95octane. Ruling 2 was chosen precisely so this plan needs
  none of it. Parked below as the standing item.
- **Any change to what `linkage:` means or to `assets/membership.md`'s
  contract.** init and doctor consume the asset; nothing here edits it.
- **The pack's `members()` helper.** Its else-chain and init's union agree under
  the contract (`linkage:` is single-valued), so the helper stays.
- **Running init against the real 95octane.** The fixture is synthetic; the real
  reshape is the user's to run after `p:plugins:local` and a restart.
- **Tagging and publishing.** No release step; the three bumps are intent.
- **Handoff's missing siblings branch and git-workflow's raw-submodule
  reasoning** (`plugins/vwf/skills/handoff/SKILL.md:69-86`,
  `git-workflow/SKILL.md:19-29`) — surfaced by the survey, unrelated to init.
- **`stackgen-stack-template`'s "name a member repo" target rule**
  (`site stackgen.md:387-389`) — the template skill's, not init's; init reaches
  members by walking, not by naming one.

## Parked

- **95octane's own migration** — `config_format` 14 → 16, `polyrepo` →
  `multi-repo` + `linkage: submodule`, the registry role/platform remap written
  out in conversation on 2026-09-12 (service/worker/common → backend, web →
  frontend/[site], console → backend/[service, webapp] + operator-rbac, frontend
  → frontend/[mobile, auto], devops → system/[iac]). Carried over from the
  2026-09-12 init-brownfield plan.
- **A sibling-linkage fixture** — proving the union's second half and the
  outside-the-tree write needs a base with a format-15 `members:` list and a
  `../` member; do it in the plan that lands the config migration.
- **The union versus the else-chain** — if a product ever declares both
  `.gitmodules` and sibling `members:`, init would shape a sibling that
  `setup:all --all` never visits. Out of contract today; revisit only if
  `linkage:` ever becomes multi-valued.
- **Cross-repo symlinks in 95octane** —
  `backend/.config/taplo.toml ->
  ../../.config/taplo.toml`,
  `devops/dprint.json -> /Users/…/.config/dprint.json`. A member shaped by the
  packs gets its own copies; what to do with the links is a question for the
  real reshape, not this plan.

## Run log

| Wave | Unit        | Model | Round | Outcome           | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Commit   |
| ---- | ----------- | ----- | ----- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight   | —     | —     | green             | All nine gate lines green on the branch cut from `develop` at `936154be`. Worktree bootstrap (`setup:worktree`) failed on `setup:deps:outdated` and `setup:deps:audit` — pnpm 12 rejects `--depth` and `--reporter summary`; the install itself succeeded, and the re-resolved `pnpm-lock.yaml` was restored. Inherited machine fact, not this plan's.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 1    | U4          | opus  | 1     | green             | DECIDED: per-repo framing sentence in each file's intro, not per subsection; a repo with no origin gets no security-contact default and is asked on its row; `<HOLDER>` reads `git config user.name` in the repo being written, ask-once fallback stays per run. GAP: `<YEAR>` for a member licensed in the same run as the base — assumed the same current year for every repo. DOCS FALSIFIED: none. Check green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 6abb7ac4 |
| 1    | U3          | opus  | 1     | green             | DECIDED: plan section heading `── <repo> ── (existing)` stating each repo's mode; each repo's section closes with its own total, the document with a product total — ruling 13's idempotent case is the product total being zero; the Report's invariant grows from three causes to four, adding "the set changed"; a keep inside a member is recorded in the base's `.config/vwf.yaml` keyed by base-relative path; pass 11 scope list from this repo's registry else the base's, forge links from this repo's own origin. GAP: whether a member's ten sections are path-prefixed — assumed paths stay relative to their own repo, the heading names the repo. DOCS FALSIFIED: none beyond U8's. Check green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 1    | U2          | opus  | 1     | green             | DECIDED: §7's confirm paragraph says question 2's rows are grouped by repo, own row first (ruling 4); §7's `MEMBERS` paragraph names the asymmetry — flags/aliases filled whatever the linkage, `MEMBERS` only under siblings (ruling 11); §11(c) a repo whose pass has not run shows the count from its plan section; §1 reports an unregistered member under Deferred. DOCS FALSIFIED: `site vwf.md:858-864, 888, 1079` (flags/aliases from project ids), `site vwf.md:814-815, 866-872` (run setup there), `site stackgen.md:620-626, 720-746` (templates filled per project) — all already in U8's Owns. GAP: §7's heading "the three things they fill" is loose now that ids fill two of three surfaces — kept verbatim, the guardrail forbids changing a cited heading; the body states the split.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 1    | U1          | opus  | 1     | green             | DECIDED: question 2's closing paragraph no longer names the aggregator's flags/aliases as id-list surfaces (ruling 5); the git hard rule gained one clause — asked once, members commit first, base stages the moved gitlinks; `MEMBERS` described as "the resolved members under siblings, as shipped where submodule declarations are read" (the registry carries no `members:`); an absent member's mode resolves with its post-clone survey, not at Step 0. DOCS FALSIFIED: `site vwf.md:814-815, 866-872, 934`, `multi-repo.md:46-51`, `CLAUDE.md:246`, `skills-and-agents.md:25` — all already in U8's Owns. GAP: none.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |          |
| 1    | R1          | opus  | 1     | findings(15)      | CONTRACT clean. RULINGS: U1 departed #2 (the disagreement rule read literally shapes nothing when only one source exists — falsifies the fixture gate); U2 departed #6 (an absent member with no clone source is created and shaped in §1 instead of reported uncloneable). Unit findings: `SKILL.md:131-135` union read as intersection [U1]; `:134-135` claims doctor reports a `.gitmodules`/`members:` disagreement as blocking — unsupported [U1]; `:125-126` restates membership step 4 [U1]; `:165` cites the asset's absent-member sequence whose command split does not name init [U1]; `new-repo.md:36-42` creates an absent member [U2]; `existing-repo.md:486` fold width [U3]; `:291` vs `:489` contradict on whether a member has its own `.config/vwf.yaml` [U3]. Rule-5 in U8's Owns: `.claude/skills/vwf-plugin/SKILL.md:66,77,80-83`; `site vwf.md:880-882, 905-906, 984-991, 1049-1055, 1057-1061`. Rule-5 in nobody's Owns: `plugins/vwf/assets/vwf-config.md:110` ("spelled exactly as the lockfile names it" — false once a member keep is base-relative) → U8's Owns widened. Cross-wave: `doctor/references/stack-checks.md:319` same sentence → handed to U5.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |          |
| 1    | U2          | opus  | 2     | green             | Ruling 6 restored: §1 never creates a resolved member; an absent member is the clone row's (cloned, surveyed, shaped in the same run); no clone source → no row, Deferred as absent and uncloneable; "where there is none" is now the genuinely new base. DECIDED: kept the why-not-`git init` reasoning; the uncloneable unlock is "add it to the membership with a source, then `/vwf:setup reshape`".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 0a6f45d0 |
| 1    | U1          | opus  | 2     | green             | All four findings fixed: where only one of `.gitmodules` and `members:` exists that list is the whole member set, the disagreement rule applies only when both exist; the doctor-blocking claim dropped; the worktree hop folded into the membership citation; absent-member handling stated in full in SKILL.md, the asset cited for the two clone commands alone, decline path explicit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 113401f5 |
| 1    | U3          | opus  | 2     | green             | Fold width repaired (fill table re-padded); the `:291`/`:489` contradiction resolved — a member carries only the back-link, so pass 11's scope list reads the base's `.config/vwf.yaml` alone while forge links stay per repo; §6's kept-file record is the base's under either linkage.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 4a57960a |
| 1    | R1          | opus  | 2     | findings(1)       | CONTRACT clean, RULINGS clean. Every round-1 unit finding resolved, none resurfaced. The one open finding is cross-wave: `doctor/references/stack-checks.md:319` — doctor's kept-file skip reads the path "as the lockfile names it", but a member's keep is now keyed with the member path as prefix in the base's config; carried to U5's wave-2 prompt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |          |
| 1    | fixture     | opus  | 1     | red               | Step 3: three sections base→a→b PASS; modes per repo PASS; legacy renames PASS; `_scripts/_helpers` as replace-or-keep FAIL — the skill emits an unconditional replace, per pre-wave-1 `existing-repo.md:305-311` ("the helper library is the one file this pass never offers"); flags/aliases PASS; question 7 three rows PASS. Step 4: task renames PASS; one new commit per member FAIL — each member has two, because ruling 14's gate-config-first commit fires per repo (base, mode new, has one); gitlinks staged and current PASS; clean status PASS; `#USAGE` flags and aliases PASS; report grouping and `Gitlinks staged 2` PASS; one `Commit` line per repo FAIL — `SKILL.md:455` allows one hash and cannot carry ruling 14's second commit. Step 5 PASS. Step 6 FAIL — three sections, product total 0, "the product is shaped" said, but no section reads nothing: pass 6 compares byte-for-byte against the pack's bytes, so every file with a filled marked position is re-offered (pre-wave-1 `existing-repo.md:645` already assumed a filled file reads byte-identical); the members' kept `.config/mise.toml` was Deferred (base has no `.config/vwf.yaml`) and re-offered. Prose defects: `SKILL.md:121-126` delegates base resolution wholly to `membership.md`, whose step 5 stops on a repo with no `.config/vwf.yaml` — the repo init exists for; `SKILL.md:146-147` "is a git work tree" is true of an empty submodule directory; `new-repo.md:404-409` writes `MERGE_MODEL` into every repo vs `existing-repo.md:422-430` keeps a kept `.config/mise.toml` untouched; `existing-repo.md:38-52` pass 1 flags `.gitmodules` and `.vscode/` on every run; `existing-repo.md:244-261` default keep on a differing `.config/mise.toml` leaves a member's positions unfilled — the fixture's fixed answers name no answer for a replace-or-keep row. | —        |
| 1    | gate ruling | —     | —     | replayed          | GAP: two step conditions contradict the plan's own rulings and are replayed against them, as the section instructs. (i) "`_scripts/_helpers` as a replace-or-keep row" [ruling 1] — the pre-existing pass never offers the helper library; the row is an unconditional replace and the eleven passes demonstrably ran per member, so ruling 1 is proven and the literal wording is a plan defect. (ii) "one new commit per member" [ruling 3] — ruling 14 mandates the gate-config commit first and alone per repo, so an existing-mode member makes two; ruling 3 (members first, base with gitlinks) is proven. GAP: the fixture's fixed answers omit the replace-or-keep rows — the re-run answers **replace** on every one, since the gate's step-4 conditions presuppose the packs land. The three remaining reds are attributed to the owning units and re-dispatched once each: U1 (report `Commit` line, base resolution without a `.config/vwf.yaml`, the presence predicate), U2 (`MERGE_MODEL` vs a kept file), U3 (pass 6's comparison for ruling 13, pass 1's `.gitmodules`/`.vscode/`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | U1          | opus  | 3     | green             | Fixture round: Step 0.1 carries init's own base rule — the asset's hops are followed, but where it would stop for want of a `.config/vwf.yaml` init takes the repo the hops landed in (halting only outside any repository); the presence predicate is "exists and is the top level of its own work tree"; the per-repo `Commit` line names every commit the run made in that repo, in order, each with hash and subject — one line still.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |          |
| 1    | U2          | opus  | 3     | green             | Fixture round: §11(a) writes `MERGE_MODEL` into every repo whose environment-block file this run lands or replaces; a kept file's position is not written, the repo's report line says so. DECIDED: the same qualifier stated once in §7 over all seven positions (`REPO_NAME` and `MEMBERS` sit in the same block), citing existing-repo.md's kept-file rule.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 1    | U3          | opus  | 3     | green             | Fixture round: pass 6 compares a pack-owned file against its lockfile record's `hash:` (pack bytes only where no record exists), matching doctor (e); the record is stated as the content at landing with the marked positions filled, and a replace records its hash once the fills have run; pass 1 recognises git's submodule file and the editor directory (named via the fragment convention) as outside the allowlist's question, the asset untouched.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |          |
| 1    | fixture     | opus  | 2     | red (step 6 only) | Steps 3, 4, 5 PASS in full — the two replayed conditions observed as replayed (helper library an unconditional replace row; members two commits each, base one plus gitlinks), Step 0 base resolution, the presence predicate (`--show-toplevel` reads the clone root for an empty member), the two-hash `Commit` line, and pass 6's lockfile baseline all confirmed. Step 6 FAIL: every pack file matches its landing record, all ten counted sections read none, totals 0, "the product is shaped" — but three lines remain in every section: pass 1 reports `.claude/` (the lockfile home this run writes) in all three repos and the member work trees `a`, `b` in the base (`existing-repo.md:58-74` exempts exactly two root entries); pass 10 lists `.config/mise/tasks/p/<id>/_default` as repo-owned kept every run (init authors it, no bundle declares it, `:477-488` exempts only `_scripts/local`); pass 9 prints `MERGE_MODEL` as unfilled-defaults-to-`direct` every run (`:436-439` — the written value equals the shipped default). Prose ambiguity: pass 1 is worded over root files (`:43-44, 54-56`) while the new exemption is titled over root entries and names a directory (`:58-59`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 1    | U3          | opus  | —     | failed            | Second failure of the fixture gate's step 6 after the one mechanical re-dispatch; blocks per the doctrine. Ruling needed (pasteable): under ruling 13, on a fully shaped product's second run, may pass 1 exempt `.claude/` and the resolved member paths (and is its scope root entries or root files only), may pass 10 exempt the init-authored `_default` slot as it does `_scripts/local`, and may pass 9 test the marker token rather than the value — so that each section reads nothing? U3's round-3 edits (lockfile-hash comparison, the `.gitmodules`/editor exemptions) are committed on the branch as progress; a resume re-runs U3 from its prompt plus the ruling.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |          |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-13-init-walks-the-members
