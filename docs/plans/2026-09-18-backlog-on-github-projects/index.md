---
type: vwf-change-plan
title: backlog on GitHub Projects — the store moves from docs/backlog.md to a
  forge project
requires: []
backlog: []
---

# Plan — backlog on GitHub Projects — the store moves from docs/backlog.md to a forge project (2026-09-18)

## Status

**RUNNING**

RUNNING since 2026-09-18 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-18-backlog-on-github-projects

## Consent

| Action                                            | Granted                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                    |
| After landing: `mise run p:plugins:local`         | run                                                                                                                    |
| After landing: create the project, re-add B12     | ask                                                                                                                    |
| Release vwf publicly                              | minor — `19.33.0` → `19.34.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json`; no release step, the tag waits |
| Release site publicly                             | patch — `1.1.26` → `1.1.27`, `mise run p:site:version`; no release step, the tag waits                                 |
| Release installer publicly                        | none — untouched                                                                                                       |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, `/vwf:backlog` keeps the product's backlog in a **GitHub
Project** — owned by the account the base repo's remote names, titled with the
repo's name — instead of in `docs/backlog.md`. Items are draft issues titled
`Bnn — <item>`; the project's own Status and Priority fields carry the state,
plus one `Closed` status option and one `Group` text field the skill adds on
first use. The skill detects the forge from the base repo's remote host: GitHub
is implemented in `references/github.md`; a GitLab remote stops with "not yet
supported" and the parked shape. When the project does not exist, the skill asks
consent, then hands the user the browser — GitHub's API cannot instantiate a
built-in template, and Team planning is one — waits for their word, and
re-detects the project by title. `/vwf:doctor` reports a `gh` that is absent,
unauthenticated or without the `project` scope as a warning with the remedy. The
seven verbs, the `Bnn` ids the plans carry in `backlog:` and the plan index's
Backlog column, and the five callers are unchanged in shape.

The framing: the user asked for the backlog to live where a team already looks —
the forge's project board — with the project named for the repo, under the
repo's account, created on consent from the Team planning template when missing;
and, mid-interview, for a repo hosted on GitLab to be considered.

**Reversal.** The 2026-09-13-vwf-process decision (ruling 3) rejected a
mempalace room as the store because "a backlog that exists only in memory is one
an offline session cannot read". A GitHub Project has the same property — it
needs network and a `project`-scoped `gh` token — and this plan accepts it with
**no file fallback**: when `gh` cannot reach the project, every verb stops with
the remedy and a caller's recall reads nothing and says so. The docs unit writes
this to `docs/memory/decisions/2026-09-18-backlog-on-github-projects.md`.

## Facts the survey established

**The skill today.** `plugins/vwf/skills/backlog/SKILL.md` is the one file (150
lines, no `references/`): frontmatter `:1-16` (`model: sonnet`,
`disable-model-invocation: false`, bracketed `argument-hint` `:12`); "The file"
`:32-65` (shape, the vocabulary table `:51-58`, the trailers `:60-62`, `add`
creates the file `:64-66`); Verbs `:67-121` — `add` `:72`, `list` `:81`, `next`
`:86` (routes to `change-plan`/`plan` `:91-92`), `move` `:98`, `planned` `:103`,
`done` `:109`, `close` `:114`, the order-invariance rule `:120-122`; "Who calls
it" `:123-137` (ids from `backlog:` frontmatter `:136`); "never does"
`:139-149`, whose fourth bullet is the sentence the reversal overturns.
Registered at `plugins/vwf/.claude-plugin/plugin.json:19`.

**The callers, every passage that names the file or its shape** — each is in
U2's Owns:

- `skills/change-plan/SKILL.md:52-57` (recall reads `docs/backlog.md`; sole
  writer), `:223` (`backlog:` frontmatter), `:314-315` (hand-off step 2),
  `:326-327` (`docs/backlog.md` staged when changed), `:358` (never edits it).
- `skills/plan/SKILL.md:54` (doc table), `:99-101` (recall), `:393-396`
  (frontmatter), `:445-446` (hand-off step 2), `:457-467` (staging; base vs
  member), `:499` (never edits); `skills/plan/references/plan-doc.md:19-21`.
- `skills/execute/SKILL.md:107-109`, `:227`, `:316-318`, `:742-749` (landing
  `done <ids>`), `:886`; `skills/execute/references/blocking.md:69` (the "is
  backlog B12" example — stays true, ids survive).
- `skills/plan-management/SKILL.md:40,59,100,113,251-257` (archive → `done`);
  `references/plan-index.md:4,141` ("lives in the base like `backlog.md`"),
  `:30,37,48` (Backlog column = ids).
- `skills/feedback/SKILL.md:22` (the boundary sentence).
- `assets/templates/plan-folder.md:39` (`backlog:` comment: "ids from
  docs/backlog.md").

Zero mentions in `recall`, `setup`, `doctor`, `docs-sync`, the hooks, and
`plugins/stackgen/**` (its "backlog" hits are queue/job prose, unrelated).

**Repo docs and the site** — each in U4's Owns: `readme.md:242-244` (sole writer
of `docs/backlog.md`);
`.claude/skills/vwf-plugin/references/docs-tree.md:47,56-60` (the file in the
docs tree, the callers) and `references/skills-and-agents.md:35,36,39,45,46`
(skill rows); `site/src/content/docs/plugins/vwf.md:405-410` (docs-tree entry),
`:819` (command table), `:1890-1893,1903-1905` (plan hand-off), `:1946` (index
columns), `:2191-2192` (execute landing), `:2262-2263,2271,2286`
(plan-management), `:2335-2338` (feedback boundary), `:2410-2463` (the full
`### /vwf:backlog` section — examples `:2424-2427`, product-level `:2430`,
caller ids `:2449-2451`), `:2480,2544,2563-2566` (change-plan);
`how-to/operate/production-feedback-loop.md:300-307` ("Deferring is not a
backlog"); `how-to/operate/ad-hoc-change.md:68-70,154-155,233,279`. `CLAUDE.md`
names the backlog nowhere. `docs/memory/decisions/*` and
`docs/memory/handoff/next.md` are historical and never edited.

**This repo's own file.** `docs/backlog.md` holds B01–B11 `done` and B12 `open`
(`P1`, the `unclaim <folder>` verb for `plan-management`, `:76`). Deleted by U5;
B12 is re-added after landing by hand.

**Doctor's binary pattern.** `skills/doctor/references/stack-checks.md:252-262`
is the `rtk` paragraph — "recommended, never required", a **degradation** with
the remedy, reported every run. `skills/doctor/SKILL.md:140-163` is the checks
table whose 3–5 row lists what stack-checks covers; `:165-195` the severity
vocabulary. No skill in vwf calls `gh`, GraphQL or any GitHub API today;
`plugin.json` declares no binary.

**The forge, as it stands.** `gh` 2.101.0 is installed here; the token carries
`gist, read:org, repo, workflow` — not `project`, so `gh project list` fails
today with "missing required scopes [read:project]" and the remedy
`gh auth refresh -s project`. `gh repo view --json owner,name` on this repo
answers `virajp/claude-plugins`; `virajp` is a **user** account. The GraphQL
`createProjectV2` mutation takes `ownerId` and `title` only; `gh project create`
takes `--owner` and `--title` (its `--template` flag is Go output formatting);
built-in templates such as Team planning are chosen in the web UI at creation
and nowhere else; `copyProjectV2` copies an existing project, and org project
templates are an organisation feature a user account does not have. Views cannot
be created by API; fields can (`createProjectV2Field`, `updateProjectV2Field`).
Team planning ships Status `Todo / In Progress / Done` and Priority
`P0 / P1 / P2`, plus Size, Estimate, Iteration and the two date fields. Draft
issues are created with
`gh project item-create <number> --owner <o> --title --body`, listed with
`gh project item-list --format json`, edited with
`gh project item-edit --id
--project-id --field-id` plus
`--single-select-option-id` or `--text`.

**Config.** No forge key exists in the config schema
(`plugins/vwf/assets/vwf-config.md:38-138`, `config_format` 19); none is added,
so the stamp stays 19.

**Gates.** Pre-commit runs `format`, `lint`, `sec`, `npm-normalize-hook-test`,
`plugins-marketplace`, `plugins-inventory`, `plugins-check`,
`plugins-shellcheck` and the standard hooks (`.config/pre-commit-config.yaml`).
`p:plugins:check` fails a `${CLAUDE_PLUGIN_ROOT}/…` citation to a path that does
not exist, which fixes commit order: U1's `references/github.md` lands before
any unit cites it. `p:site:check` is the site's gate, in neither pre-commit nor
`plugins.yml`; it is a wave-gate line because the site changes.
`plugins/**/*.md` is not dprint-formatted — match the fold width by hand;
`readme.md`, `site/**` and `docs/**` are.

**Commit convention.** `.config/git-conventional-commits.yaml:3-9` allows `ops`,
`docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

**Versions.** `plugins/vwf/.claude-plugin/plugin.json:4` reads `19.33.0`, bumped
by hand; `mise run p:plugins:marketplace` regenerates
`.claude-plugin/marketplace.json` from it. `site/package.json:3` reads `1.1.26`,
bumped by `mise run p:site:version` (bare — patch is the default; it refuses a
dirty tree). Neither target carries a `13` or `17` component.

**The plan index** is empty of rows — no plan is active, so this plan requires
nothing and its priority is `10`.

## Assumed decisions — confirm or override at review

| #  | Decision                | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                   | Rejected                                                                                   | Unit   |
| -- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------ |
| 1  | A missing project       | On consent the skill prints the new-project URL — `https://github.com/users/<owner>/projects/new` for a user, `https://github.com/orgs/<owner>/projects/new` for an organisation — and the two things to set there: the **Team planning** template and the title `<repo>`; then waits for the user to say it is done and re-lists by title. The skill never runs `gh project create`                                     | replicate the template's fields by API (views cannot be); a plain project with no template | U1     |
| 2  | No fallback             | The project is the one store. When `gh` is absent, unauthenticated for the remote's host, or without the `project` scope, every verb stops with the remedy — `gh auth login` or `gh auth refresh -s project` — and a caller's recall reports "backlog unreadable: <reason>" and continues with nothing. `docs/backlog.md` is never read or written again                                                                 | keep `docs/backlog.md` as a read-only mirror (two stores, stale on any UI edit)            | U1, U2 |
| 3  | Item kind               | Draft issues, created with `gh project item-create`; no repo issue is ever opened                                                                                                                                                                                                                                                                                                                                        | repo issues added to the project                                                           | U1     |
| 4  | The id                  | The title is `Bnn — <item>`; the next number is one past the highest `Bnn` any item title carries, done and closed included, never reused. An item whose title carries no id is listed under "unnumbered", warned about, and never renumbered by the skill                                                                                                                                                               | a custom `Id` field; the opaque `PVTI_…` node id                                           | U1     |
| 5  | Vocabulary              | Priority is the template's `P0 / P1 / P2`, `P0` first. Status: `open` → `Todo`, `planned` → `In Progress`, `done` → `Done`, `closed` → `Closed` — an option the skill adds to the Status field once, on the first verb that needs it, via `updateProjectV2Field`. `Group` is a text field the skill adds once via `createProjectV2Field`. `Planned in: <folder>` and the close reason are the last line of the item body | the skill's own `Backlog status` / `Backlog priority` fields beside the template's         | U1     |
| 6  | Finding the project     | Every verb resolves owner and title from `gh repo view --json owner,name` run in the **base** repo, then `gh project list --owner <owner> --format json` filtered on `title == <repo>`; nothing is cached and no `.config/vwf.yaml` key is added, so `config_format` stays `19`. A member-repo session resolves the base first, as today                                                                                 | a `forge:` config key                                                                      | U1     |
| 7  | The forge               | The base repo's `origin` host decides: `github.com`, or any host `gh auth status` lists, is GitHub; `gitlab.com`, or any host `glab auth status` lists, is GitLab; anything else is unsupported. GitLab stops every verb with "GitLab is not yet supported by /vwf:backlog" and names the parked shape. Unsupported stops with the host                                                                                  | GitHub-only, no detection; both backends in this plan                                      | U1     |
| 8  | The skill's shape       | `SKILL.md` keeps the verbs, the vocabulary, forge detection and the callers; `references/github.md` carries the `gh` command per verb, the field-and-option bootstrap, and the missing-project procedure, cited as `${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md`. A later `references/gitlab.md` slots beside it                                                                                           | one file                                                                                   | U1     |
| 9  | Doctor                  | One paragraph after the `rtk` one in stack-checks: `gh` on `PATH`, `gh auth status` green for the base remote's host, the `project` scope present — each missing one a **degradation** with its remedy, never blocking, reported every run; on a GitLab remote the same three for `glab`, with "backlog not yet supported there" noted. Doctor's checks-table row names it                                               | blocking (every vwf repo would need a forge account); no doctor check (found on first use) | U3     |
| 10 | This repo's file        | `rm docs/backlog.md` in U5, after the docs unit; B12 is re-added after landing by the `ask` step. B01–B11 stay in git history and in the archived plans' `backlog:` lists                                                                                                                                                                                                                                                | keep as frozen history; migrate all twelve                                                 | U5     |
| 11 | Review row              | None — nothing runnable lands; the wave review is the check                                                                                                                                                                                                                                                                                                                                                              | —                                                                                          | —      |
| 12 | The `next` verb         | The top item by Priority (`P0` first) then id among `Todo` items; the routing to `/vwf:change-plan` or `/vwf:plan` is unchanged                                                                                                                                                                                                                                                                                          | —                                                                                          | U1     |
| 13 | `list`                  | Prints a five-column table — Id, Item, Group, Priority, Status — from `item-list`, ordered by priority then id; `Done` and `Closed` fold into a trailing count unless everything is asked for; ends with the project's URL                                                                                                                                                                                               | —                                                                                          | U1     |
| 14 | Commit                  | The skill still never commits — there is nothing in the tree to commit; the planners' and the executor's staging lines that named `docs/backlog.md` are dropped                                                                                                                                                                                                                                                          | —                                                                                          | U1, U2 |
| 15 | The `add` consent chain | `add` on a repo with no project is the one verb that creates: it asks consent to create, hands over the browser (decision 1), then adds. Every other verb on a missing project reports "no backlog project yet — `/vwf:backlog add` creates it" and stops                                                                                                                                                                | every verb creating                                                                        | U1     |
| 16 | `plugin.json` keywords  | Unchanged — `backlog` stays; no forge keyword is added                                                                                                                                                                                                                                                                                                                                                                   | adding `github`                                                                            | U5     |

## New dependencies

None packaged. **Runtime binary `gh`** (the `project` command set — 2.x) on the
machine of a vwf user who runs `/vwf:backlog`; declared by doctor as a
degradation, installed by nobody here. A GitLab user will need `glab` when that
backend lands; not this plan.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                             | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-skill.md](01-skill.md)                   | edit | `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/skills/backlog/references/github.md`                                                                                                                                                                                                                                                                                                                                         | —          | green   | 4f0d50ae |
| U2 | 2    | [02-callers.md](02-callers.md)               | edit | `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/plan/references/plan-doc.md`, `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/execute/references/blocking.md`, `plugins/vwf/skills/plan-management/SKILL.md`, `plugins/vwf/skills/plan-management/references/plan-index.md`, `plugins/vwf/skills/feedback/SKILL.md`, `plugins/vwf/assets/templates/plan-folder.md` | U1         | green   | 45338409 |
| U3 | 2    | [03-doctor.md](03-doctor.md)                 | edit | `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`                                                                                                                                                                                                                                                                                                                                     | U1         | green   |          |
| U4 | 3    | [04-docs.md](04-docs.md)                     | edit | `readme.md`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/how-to/operate/ad-hoc-change.md`, `site/src/content/docs/how-to/operate/production-feedback-loop.md`, `docs/memory/decisions/2026-09-18-backlog-on-github-projects.md`                                                                                                                                               | U2, U3     | pending |          |
| U5 | 4    | [05-gates-and-bump.md](05-gates-and-bump.md) | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`, the deletion `docs/backlog.md`                                                                                                                                                                                                                                                                                                 | U4         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                   | Why it collides                        | Owner   |
| ------------------------------------------------------ | -------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`               | the version                            | U5 only |
| `.claude-plugin/marketplace.json`                      | generated from the manifest            | U5 only |
| `site/package.json`                                    | the site version                       | U5 only |
| `docs/backlog.md`                                      | read by U1 as the shape being replaced | U5 only |
| `readme.md`, `.claude/**`, `site/**`, `docs/memory/**` | human-facing docs                      | U4 only |
| `plugins/vwf/skills/backlog/**`                        | U2 and U3 cite it; only U1 writes it   | U1 only |

## Waves

- **Wave 1 — U1 alone.** Rewrites the skill and creates `references/github.md`.
  Nothing else may land first: U2 and U3 cite
  `${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md`, and
  `p:plugins:check` fails a citation to a path that is not there.
- **Wave 2 — U2, U3.** Disjoint trees: the five caller skills and the template
  against `skills/doctor/`. Both read U1's committed skill; neither deletes
  anything.
- **Wave 3 — U4.** The repo docs, the site, the decisions doc; runs docs-sync
  over waves 1–2.
- **Wave 4 — U5.** The two bumps, the generator, the one deletion, the full
  gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                           | Mode | Notes                                                                                                                                                                                                                                                                                       |
| ------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local`     | run  | stages vwf at `19.34.0+N` into the dev marketplace and updates this machine's install; publishes nothing, cuts no tag; a **restarted** session loads it                                                                                                                                     |
| create the project, re-add B12 | ask  | in a **restarted** session: `gh auth refresh -s project`, then `/vwf:backlog add unclaim <folder> verb for plan-management — reset a stale RUNNING plan` with priority `P0`; the skill's consent prompt hands over the browser to create `claude-plugins` under `virajp` from Team planning |

## Gates the orchestrator keeps

none beyond the wave gate — the after-landing `ask` step is the first real
exercise of the verbs against a project, and the run touches GitHub nowhere.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns. No unit runs `gh` against GitHub — the run is offline
with respect to the forge.

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

- **A GitLab backend** — parked below with its shape; this plan lands the forge
  detection and the stop.
- **Creating the project by API** — impossible with the Team planning template
  (decision 1); a plain or field-replicated project was declined.
- **A file mirror of the project** — declined (decision 2).
- **Migrating B01–B11** — declined (decision 10); history keeps them.
- **A release** — both bumps are recorded; the tags wait for a later `/release`.
- **A `forge:` config key and a `config_format` bump** — declined (decision 6).
- **`docs/memory/decisions/*` and `handoff/next.md`** — historical records that
  describe `docs/backlog.md` as it was; never edited.
- **The stackgen mise-pack `merge` script's `gh pr create`** — unrelated `gh`
  use, untouched.

## Parked

- **GitLab backend — `references/gitlab.md`.** Shape agreed at this interview:
  the repo's own issues carry scoped labels `priority::P0|P1|P2` and
  `status::todo|in-progress|done|closed`, a `group::<name>` label where one is
  named, shown on an Issue Board; `glab issue create/list/update` per verb;
  `Bnn` stays a title prefix; a missing board is created by `glab` (GitLab has
  no template gate to hand to the browser); doctor's `glab` probe already lands
  in this plan; self-hosted hosts resolve through `glab auth status`. Needs its
  own plan and a GitLab repo to prove it on.
- **B12 — `unclaim <folder>`** — stays the next backlog item; re-added after
  landing.

## Run log

| Wave | Unit       | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                         | Commit   |
| ---- | ---------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight  | —     | 1     | pass        | doctor: no .config/vwf.yaml, no stack; mise, graphify CLI and graph (main checkout) present; gh 2.x present, token lacks project scope (degradation, noted); format check skipped — no covers:; conventions fetch skipped — edit units only; all five gate lines green                                         | —        |
| 1    | U1 skill   | opus  | 1     | pass        | edit; DECIDED: updateProjectV2Field options inlined in mutation text (gh api -F is scalar-only), existing options read first; title/body edit uses DI_content id, field edits PVTI_ item id (Context7 reading, unverified — gh not run); GAP: precommit re-padded run-log row (outside Owns), second run green | 4f0d50ae |
| 1    | R1         | opus  | 1     | findings(1) | SKILL.md:58 [U1] completeness — precondition vs references/github.md:22-23 disagree on the read:project tolerance for list/next; CONTRACT clean; RULINGS clean                                                                                                                                                 | —        |
| 1    | U1 skill   | opus  | 2     | pass        | edit; fixed R1 finding: tolerance (read:project passes list/next) stated once in SKILL.md, reference defers; DECIDED: kept per 01-skill.md Precondition bullet                                                                                                                                                 | 4f0d50ae |
| 1    | R1         | opus  | 2     | pass        | 0 findings; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                      | —        |
| 1    | wave gate  | —     | 1     | pass        | 5 gate lines green; no UNRESOLVED in reports                                                                                                                                                                                                                                                                   | 4f0d50ae |
| 2    | U3 doctor  | opus  | 1     | pass        | edit; DECIDED: severity worded 'no caller halts on' (grep 'blocking' must miss), gh URL mirrors rtk form; DOCS FALSIFIED noted: doctor SKILL.md §9 degraded list omits forge CLI (unit says nothing else in that file); GAP: precommit lint --fix ran whole-tree, own files unaltered                          | —        |
| 2    | U2 callers | opus  | 1     | pass        | edit; 8 of 9 Owns changed (blocking.md untouched, :69 names no file); DECIDED: caller recall names the three unreadable reasons plus 'no project yet'; plan-management archive cites Done / In Progress names; grep docs/backlog → 0 hits                                                                      | 45338409 |
| 2    | R2         | opus  | 1     | findings(2) | stack-checks.md:271-273 [U3] cost line overstates scope miss (read:project tolerance for list/next); doctor SKILL.md:203 [U3] §9 degraded list omits the forge CLI — U3's edits widened by one clause (GAP: 03-doctor.md said nothing else for that file); CONTRACT clean; RULINGS clean                       | —        |
| 2    | U3 doctor  | opus  | 2     | pass        | edit; fixed both R2 findings: cost line split by miss (read:project tolerance points at the skill), §9 degraded enumeration names the forge CLI; DECIDED: SKILL.md edit widened on the orchestrator's instruction                                                                                              | —        |
| 2    | R2         | opus  | 2     | findings(1) | contested at the two-round cap: doctor SKILL.md:205 [U3] tree traps — new §9 clause runs to 118 columns in a ~78-fold paragraph (cosmetic; plugins/**/*.md is hand-folded); round-1 findings closed; CONTRACT clean; RULINGS clean                                                                             | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-18-backlog-on-github-projects

or let the queue pick it, by priority:

/vwf:execute next
