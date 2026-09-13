---
type: vwf-change-plan
title: REPO_NAME is the folder, the task group is the project
requires: [ docs/plans/archived/2026-09-13-vwf-process ]
backlog: [ B04 ]
---

# Plan — REPO_NAME is the folder, the task group is the project (2026-09-14)

## Status

**APPROVED** 2026-09-14 by the user, after self-review.

## Consent

| Action                                            | Granted                                                                                                                                                                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                                               |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                                                               |
| After landing: `/release`                         | ask                                                                                                                                                                                                               |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U6 runs (`19.22.0` if group A shipped `19.21.0`), never a 13 or 17 component; by editing the `version` field |
| Release stackgen publicly                         | patch — `plugins/stackgen/.claude-plugin/plugin.json`, `1.9.0` → `1.9.1`, by editing the `version` field                                                                                                          |
| Release the mise pack                             | patch — `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml` `1.2.1` → `1.2.2`, the `mise` bundle pin, `mise run p:plugins:inventory`; by U3's commit                                                       |
| Release the three cloud-service packs             | patch — `containers`, `workers-ssr`, `workers-static-assets` `0.1.1` → `0.1.2`, their bundle pins, the same inventory run; by U3's commit                                                                         |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U6 runs it first)                                                                                                      |
| Release installer publicly                        | none                                                                                                                                                                                                              |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, `REPO_NAME` — the toolchain manager's environment key — is the
slugified name of the repo's main checkout folder, one per repo, proposed by
init's question 1 and written literally; a member repo names its own folder,
never the base's. A `p:<id>:*` task group is named for a project id and never
for `REPO_NAME`. Where no registry exists, init's question 2 proposes each
project's primary platform token (`service`, `worker`, `webapp`, `site`, `cli`,
`iac`, …) as its id, asked from the platform list plus a free "other", and
architecture recommends the same token when it later writes the registry. The
project id stays one token — group, commit scope, registry id — so doctor's
predicate on ids is untouched.

**This is a reversal.** The 2026-09-06 decision (`project-ids-are-slugged`) said
`REPO_NAME` "carries the same slugification applied to the repo's own name" and
was "the whole point of deriving the id once"; the 2026-09-13 decision
(`init-walks-the-members`) said "the project id keeps exactly two surfaces: the
`p:<id>:*` task group and `REPO_NAME`". The user confirmed the reversal on
2026-09-14: the two surfaces carry two different tokens. The framing came from
the 2026-09-13 backlog request (B04): "`init` uses the same `id` for `REPO_NAME`
as well as creating tasks group `p:<id>:*`. This needs to be separated,
REPO_NAME is usually different than tasks group id. E.g.: REPO_NAME =
"95octane", task group id will be "service", "worker", "console", etc. Ideally
the recommended task group id is the project type whereas REPO_NAME is folder
name".

## Facts the survey established

**The one-id rule today, and where it is written.** One slugged project id per
repo fills both `REPO_NAME` and the `p/<id>/` group. Stated in:
`plugins/stackgen/assets/ids.md:60–65` (the "Where the id lands" table, "Two,
and no more" at 67), `:74–77` ("the same token the task group uses, which is the
whole point of deriving the id once"), `:79–91` (who applies it); the mise pack
(`P` = `plugins/stackgen/stacks/toolchain-manager/mise`):
`P/conventions.md:50–60` ("REPO_NAME is the repo's own id … the same token the
`p:<id>:*` task group uses"), `:90`; `P/config/.config/mise.toml:96–116` (the
marked position; the comment restates the slug rule and the same-token claim;
value `unfilled` at 116); `P/config/.config/mise/tasks/setup/vscode:26–29, 43`
(comment); `P/skills/mise/SKILL.md:146–156, 233, 269–271`;
`P/skills/mise/references/config-files.md:84–87, 113–121`;
`P/skills/mise/references/task-library.md:399, 558–590` (the `<id>` order:
registry id, sub-project directory, single-project repo name; "two surfaces …
carry one identical project-id token … a mismatch between the two is a defect"
at 572–576; `_default` at 584–588); the three cloud-service overlays
`plugins/stackgen/stacks/cloud-service/{containers,workers-ssr,workers-static-assets}/config/.config/mise/tasks/p/_project/deploy:8–15`
("the same id the repo's own `REPO_NAME` carries where that project is the repo
itself"); vwf init `SKILL.md:274–275` ("its id is what that repo's `REPO_NAME`
receives"), `:294–296`; `references/new-repo.md:141–143, 173–178` ("task groups
and `REPO_NAME` take the project ids"), `:235–247` (`REPO_NAME` = the repo slug
as question 2 confirmed it, the first row; launch aliases in the user's global
config read it); `references/existing-repo.md:464–465` ("the repo-name key stays
the id list's"); doctor `references/stack-checks.md:356–361` (predicate (d):
"that repo's own slug"); the site
`site/src/content/docs/plugins/vwf.md:880–891, 940–953, 1179–1183`,
`site/src/content/docs/plugins/stackgen.md:733–762` (`:759–762` "the `p:<id>:*`
group and `REPO_NAME` are the two surfaces it fills"); `CLAUDE.md:249–259`;
`.claude/skills/vwf-plugin/SKILL.md:79–88`;
`.claude/skills/vwf-plugin/references/skills-and-agents.md:25`;
`.claude/skills/stackgen-plugin/SKILL.md:37`;
`site/src/content/docs/how-to/greenfield/single-repo.md:63–76`.

**Passages that survive.** `site/stackgen.md:637, 740–746` (profile named
`$REPO_NAME`; "carries the repo's own slug");
`site/vwf.md:893–897, 1173–1174,
1190–1192`;
`.claude/skills/stackgen-plugin/SKILL.md:127`; the materializer's `p/_project/`
rename (`skills/stackgen-stack-template/references/materializer.md:59–66`,
`assets/pack-format.md:55–57`) — the group is still the project's id, slugged.

**Consumers.** Only one shipped task reads `$REPO_NAME`:
`P/config/.config/mise/tasks/setup/vscode:41–42, 52, 103–109, 127, 136, 156,
164`,
the editor-profile name. The user's global launchers do not read it. The mise
pack ships no `p/` directory; the group and its `_default` are init's output
alone. `MEMBERS`, the member flags and the `setup-<slug>` aliases are named for
member repos, not ids (`task-library.md:277–306`) — untouched.

**Project type today.** Registry `role:` is `backend`/`frontend`/`data`/`system`
(`plugins/vwf/skills/architecture/SKILL.md:156`); closed platform lists per role
in `architecture/references/platforms.md:16–21` — backend: `packages`,
`service`, `worker`, `webapp`; frontend: `packages`, `site`, `webapp`,
`desktop`, `mobile`, `tablet`, `auto`, `cli`; data: `packages`, `data-lake`,
`analytics`, `ingestion`, `ml-platform`; system: `packages`, `iac`, `plugin`,
`misc`, `cicd`, `cli`. `console` and `fullstack` are retired spellings
(`setup/references/format-lineage.md:40–49`): an admin panel is `backend` +
`[service, webapp]` + `operator-rbac`. A first run has no registry
(`new-repo.md:145–152`). Architecture derives ids from `product.md` and the
registry field is "free text (short identifier)".

**Init's question 2 today.** `init/SKILL.md:265–303`: grouped by repo, the
repo's own row first, three columns (name / id / source: registry, sub-project
directory, repo's own name); members from the base config's
`members[].projects`, then member sub-directories, then the member's own name
(`:276–281`); a replacement is slugified per `ids.md` (`:287–292`); what §7
writes (`:294–296`). `new-repo.md:121–139` the resolution orders; `:154–162` the
slug citation; `:190–193` seven marked positions plus `_default`;
`existing-repo.md:392–431` pass 9 (ids against group segments, "id source
changed", a customised id, `_default` creates); `:572–584` commit scopes are the
project ids from the base registry.

**Doctor and setup.** `doctor/SKILL.md:148, 181–186`;
`doctor/references/stack-checks.md:313–331` predicate (b) — every registry id
has a `p/<slug>/` group and a commit scope, reverse row "id source changed";
`:356–361` predicate (d) — `REPO_NAME` is that repo's own slug, a member names
itself; `setup/SKILL.md:107–117` cites the six predicates by description ("the
toolchain manager's repo-name environment key").

**This repo.** `.config/mise.toml:44` `REPO_NAME = "claude-plugins"`; its
comment at `:28–30` is stale against the pack (says flags and aliases carry the
same token — the pack separated them on 2026-09-13). Groups `p/i`, `p/plugins`,
`p/scripts` (`_default` only), `p/site`. No `.config/vwf.yaml`.

**Gates.** Pack payload edits: `p:plugins:shellcheck` runs `shellcheck -x` and
`shfmt -d` over every pack's `config/.config/mise/tasks/**` (a comment edit is
safe; a reflow is not); `p:plugins:check` rule 11 (`check.ts`
`checkPackConfigTier` at ~405) inspects no `[env]` key; rule 13
(`checkLandedCitations` ~860) refuses a plugin path in a landed file — cite
`ids.md` as prose ("stackgen's `assets/ids.md`"), as `mise.toml:102` does today.
`plugins/**/*.md` and the `config/` payload tier are not dprint-formatted. Pack
versions: mise `1.2.1` (`P/pack.yaml:6`, pin `bundles/mise.md:7`); `containers`,
`workers-ssr`, `workers-static-assets` `0.1.1` (pins
`bundles/cloudflare-containers.md:7`, `cloudflare-workers-ssr.md:7`,
`cloudflare-workers-static.md:7`); the inventory is generated and `--check`ed,
so `pack.yaml`, pin and `stacks/inventory.md` land in one commit. Commit
convention: types `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
No fixture survives in the repo; no test asserts `REPO_NAME` or a group.

**Recall.** The 2026-09-06 handoff first asked for a shown, editable slug before
`p:<name>:*` tasks; the 2026-09-13 plan's Parked list carries 95octane's own
migration. Group A's plan (`2026-09-13-vwf-process`) edits `CLAUDE.md`, the site
manual and `skills-and-agents.md`; this plan requires it.

## Assumed decisions — confirm or override at review

| #  | Decision                | Ruling                                                                                                                                                                                                                                                                                                                                                                                  | Rejected                                                 | Unit       |
| -- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------- |
| 1  | `REPO_NAME`             | The slugified basename of the repo's **main checkout** folder, by `ids.md`'s slug rule, proposed by question 1 and written literally — never derived at load time, since a linked worktree's folder is named for the branch. A member repo names its own folder, never the base's. (User: "REPO_NAME is folder name".)                                                                  | the project id; derived at load time                     | U1, U2, U3 |
| 2  | Group id proposal       | With a registry: the registry ids, unchanged. Without one: per project, the primary platform token, asked in question 2 as a choice over the role's platform list plus a free "other" the user types; two projects that would share a token in one repo are proposed as `<token>-<directory-slug>` each; every row stays editable and a replacement is slugified as today. (User, MCQ.) | today's order (registry, directory, repo name); the role | U1         |
| 3  | One token               | The project id is the group id and the commit scope. No `task_group` key, no `config_format` bump; doctor's predicate (b) is untouched. (User, MCQ.)                                                                                                                                                                                                                                    | a mapping key in `.config/vwf.yaml`                      | U1, U2     |
| 4  | Architecture            | One sentence where it proposes ids: prefer the project's primary platform token as its id when it is unique within its repo, and on a shaped repo seed the ids from the existing `p/<id>/` groups so a re-run of init reports no "id source changed".                                                                                                                                   | leave architecture alone                                 | U2         |
| 5  | Re-run on a shaped repo | A `REPO_NAME` that is not the folder slug is shown in init's plan as a `repo-name key: <old> → <new>` replace row, applied on the one consent; group handling (rename, id source changed, customised id) is unchanged.                                                                                                                                                                  | silent rewrite; a doctor-only finding                    | U1, U2     |
| 6  | Overlays                | The three cloud-service deploy comments are rewritten; each pack bumps `0.1.1` → `0.1.2`, its bundle pin follows, the inventory regenerates — all in U3's one commit. (User, MCQ.)                                                                                                                                                                                                      | leave them                                               | U3         |
| 7  | Mise pack               | Comment and doctrine edits only; `REPO_NAME = "unfilled"` stays the marked position; pack `1.2.1` → `1.2.2` with its pin, in U3's commit.                                                                                                                                                                                                                                               | a unit per pack                                          | U3         |
| 8  | `ids.md`                | Retitled to cover both tokens — one slug rule, two applications. The "Where the id lands" table becomes two rows with two sources: the project id → `p/<id>/` and the commit scope; the repo name → `REPO_NAME`. The "whole point of deriving the id once" sentence goes. The `_default`/extension reasoning stays.                                                                     | a second asset                                           | U3         |
| 9  | This repo               | `.config/mise.toml`'s comment at 28–30 is re-landed by hand from the pack's new text; the value stays `claude-plugins`; nothing else in this repo changes.                                                                                                                                                                                                                              | wait for a reshape                                       | U4         |
| 10 | Ordering                | `requires: [docs/plans/2026-09-13-vwf-process]` — both plans edit `CLAUDE.md`, the site manual and `skills-and-agents.md`.                                                                                                                                                                                                                                                              | concurrent runs                                          | —          |
| 11 | Wording                 | The phrase for the key is "the repo's folder name, slugified"; "the repo's own id" and "the repo's own slug" are retired wordings wherever they describe `REPO_NAME`.                                                                                                                                                                                                                   | keeping "the repo's own slug"                            | all        |

## New dependencies

none

## Units

| Id | Wave | Unit file                                                          | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Depends on | Status  | Commit |
| -- | ---- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-init.md](01-init.md)                                           | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/init/references/existing-repo.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —          | pending |        |
| U2 | 1    | [02-doctor-setup-architecture.md](02-doctor-setup-architecture.md) | `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`, `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/architecture/SKILL.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —          | pending |        |
| U3 | 1    | [03-stackgen.md](03-stackgen.md)                                   | `plugins/stackgen/assets/ids.md`; under `plugins/stackgen/stacks/toolchain-manager/mise/`: `conventions.md`, `pack.yaml`, `config/.config/mise.toml`, `config/.config/mise/tasks/setup/vscode`, `skills/mise/SKILL.md`, `skills/mise/references/config-files.md`, `skills/mise/references/task-library.md`; under `plugins/stackgen/stacks/cloud-service/`: `containers/pack.yaml`, `workers-ssr/pack.yaml`, `workers-static-assets/pack.yaml` and each one's `config/.config/mise/tasks/p/_project/deploy`; `plugins/stackgen/stacks/bundles/mise.md`, `cloudflare-containers.md`, `cloudflare-workers-ssr.md`, `cloudflare-workers-static.md`; `plugins/stackgen/stacks/inventory.md` | —          | pending |        |
| U4 | 1    | [04-this-repo.md](04-this-repo.md)                                 | `.config/mise.toml`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —          | pending |        |
| U5 | 2    | [05-docs.md](05-docs.md)                                           | `CLAUDE.md`, `readme.md`, `.claude/**`, `site/src/content/docs/**`, `docs/backlog.md`, `docs/memory/decisions/2026-09-14-repo-name-is-the-folder.md` (new)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | U1–U4      | pending |        |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md)                       | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | U5         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                        | Why it collides                                                                    | Owner   |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------- |
| the two plugin manifests, `site/package.json`                                               | several units bumping one version is a lost update                                 | U6 only |
| `.claude-plugin/marketplace.json`                                                           | generated; regenerating mid-wave races                                             | U6 only |
| `plugins/stackgen/stacks/inventory.md`, every `pack.yaml` and bundle pin this plan touches  | generated with the pins; must land with them in one commit                         | U3 only |
| `CLAUDE.md`, `readme.md`, `.claude/**`, `site/src/content/docs/**`                          | n units editing one doc                                                            | U5 only |
| `docs/backlog.md`                                                                           | the backlog skill's; this run's exception (group A's decision 12 applies here too) | U5 only |
| `plugins/vwf/skills/setup/references/format-lineage.md`, `plugins/vwf/assets/vwf-config.md` | group A's U6 owns them; nothing here touches them                                  | nobody  |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Four disjoint trees: init; doctor, setup and
  architecture; stackgen's asset and packs; this repo's one config file. No unit
  reads another's output.
- **Wave 2 — U5.** Docs, over the branch delta plus the survey's list, plus the
  reversal's decisions doc.
- **Wave 3 — U6.** The bumps, the marketplace generator, the full gate.

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
green before wave 1. The two fixture runs below hold only once U1–U3 have
landed; they are the orchestrator's after wave 1 and repeated after wave 3.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                          |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | Stages vwf and stackgen into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugins. |
| `/release`                 | ask  | Cuts the vwf, stackgen and site tags per the consent block. The run stops once and asks first.                                                                                 |

## Gates the orchestrator keeps

- **Greenfield fixture, after wave 1.** In `/tmp/vwf-b04/acme-shop` (a fresh
  `git init` with one `package.json`, no `docs/blueprint/`), run init's new-repo
  path from the worktree's skill files with the user's answers scripted: repo
  name accepted, one project of role `backend`, platform `service`. Pass:
  `.config/mise.toml` holds `REPO_NAME = "acme-shop"`, the group lands at
  `.config/mise/tasks/p/service/_default`, the commit-scope list holds
  `service`, no group or scope named `acme-shop`.
- **Shaped fixture, after wave 1.** In `/tmp/vwf-b04/shaped`, a copy of the
  greenfield result with `REPO_NAME = "service"` (the old rule's outcome) and
  the folder renamed to `shaped`: init's existing-repo pass shows one replace
  row `repo-name key: service → shaped` and no group change. Pass: that row is
  present and nothing else is proposed.
- **The rule 13 grep.** `command grep -rn "CLAUDE_PLUGIN_ROOT\|assets/ids.md"`
  over every landed file U3 touched shows only the prose citation form.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. Exception, stated here so it is not a `GAP:`: U3 bumps four pack
versions and runs the inventory generator, because a pack pin and the inventory
must land in one commit.

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

- **A `task_group` mapping key and a `config_format` bump** — decision 3.
- **Any change to `MEMBERS`, the member flags or the `setup-<slug>` aliases** —
  already named for member repos; untouched.
- **The materializer's `p/_project/` rename** — still the project's slugged id;
  unchanged.
- **The registry's `role:` and `platforms:` vocabulary** — read, not edited;
  `console` stays retired and is typed as "other" when wanted.
- **Running init against the real 95octane** — the user's, after
  `p:plugins:local` and a restart.
- **Group A's files** — `format-lineage.md`, `vwf-config.md`, the change-plan
  tree; this plan requires that plan and touches none of them.

## Parked

- **95octane's own migration** — carried from the 2026-09-12 and 2026-09-13
  plans; under this plan its `REPO_NAME` stays `95octane` (folder name) and its
  groups `service`, `worker`, `console` are already type-shaped ids.
- **`console` as a first-class token** — retired on 2026-09-03 in favour of
  `backend` + `[service, webapp]` + `operator-rbac`; if a type vocabulary for
  ids ever needs it back, that is an architecture-platforms plan.
- **A durable init fixture in the repo** — three plans have rebuilt one under
  `/tmp`; a committed synthetic fixture with a scripted answer file would make
  the orchestrator's gate reproducible.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-repo-name-split
