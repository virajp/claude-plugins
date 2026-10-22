---
type: vwf-change-plan
title: vwf hands off to bootstrap
requires: [ docs/plans/2026-10-18-packs-hand-off-to-bootstrap ]
source: [ B102 ]
backlog: []
backlog_pieces: [ B102 ]
gaps_of: []
---

# Plan — vwf hands off to bootstrap (2026-10-18)

## Status

**ARCHIVED**

ARCHIVED 2026-10-22 — not run; was APPROVED. Superseded: the B102 work is done
in place, because bootstrap shipped differently than this plan assumed.

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | yes     |

**The mode recorded here is the consent.** This plan has no after-landing step:
`.config/vwf.yaml`'s `after_landing:` already runs `mise run p:plugins:local`.
The staged vwf is picked up only by a **restarted** session, so an `all` run
ends after this plan.

## Release levels

| Project  | Level | Reason                                                  |
| -------- | ----- | ------------------------------------------------------- |
| vwf      | MAJOR | `.config/stackgen.yaml` retires; `init` needs bootstrap |
| site     | PATCH | The manual follows the change                           |
| stackgen | NONE  | Not touched                                             |

## Goal

vwf `init`, `setup`, `doctor` and `git-workflow` shape and check a repo through
bootstrap, and `.config/stackgen.yaml` retires. No vwf skill calls
`stackgen:tool-config` after this plan.

Plan 2 of 3 for B102 — requires
`docs/plans/2026-10-18-packs-hand-off-to-bootstrap`; plan 3 deletes
`stackgen:tool-config`.

Reversals, confirmed by the user on 2026-10-18:

- `docs/memory/decisions/2026-10-05-shaped-means-stackgen-yaml.md` — shaped now
  means `.config/bootstrap.toml` exists.
- `docs/memory/decisions/2026-10-05-stackgen-yaml-replaces-vwf-answers.md` —
  forge and secrets come from the selected bootstrap tools.
- `docs/memory/decisions/2026-10-01-trust-is-the-users-setup-all-is-tool-configs.md`
  — init no longer calls `tool-config all` or `setup:all`.
- `docs/memory/decisions/2026-09-26-tool-config-gates.md`, the init part — init
  hands off to bootstrap.
- `docs/memory/decisions/2026-10-03-setup-ai-validates-vwf.md` — the vwf install
  step moves into bootstrap's `setup:ai`.
- `docs/memory/decisions/2026-10-05-doctor-drift-by-preview.md` — drift is found
  with `setup:configs --dry-run`.

## Facts the survey established

- **The handoff contract** (plan 1, decision 8): a plugin may run
  `mise run setup:configs`. To change `.config/bootstrap.toml`, it
  shallow-clones `git@github.com:virajp/bootstrap.git` into a `mktemp -d`
  directory, reads `docs/sync/vwf.md` there and gives it instructions. That file
  follows `docs/sync/<tool>.md` per tool. The plugin relies on nothing else in
  bootstrap. Instruction types: `bootstrap: add tools [..]`,
  `bootstrap: remove tools [..]` (plan 1), and `bootstrap: adopt` (this plan),
  each with `reason:`.
- **Bootstrap tasks** (`docs/sync/base.md:54-72` in bootstrap): `setup`,
  `setup:configs`, `setup:mise`, `setup:precommit`, `setup:worktree`, `code`,
  `code:format`, `code:lint`, `code:sec`, `code:precommit`, `code:graph`,
  `code:merge*`, `setup:deps:<name>`, `setup:secrets:<provider>`, `setup:ai`.
  `setup:configs` takes `--dry-run`. Bootstrap's `.config/bootstrap.toml` keys:
  `tools`, `environments`, `repo_name`, `product_name`, `merge_model_develop`,
  `merge_model_main`, `commit_scopes`, `repo_url`, `release_tag_pattern`,
  `worktree_files`, `extensions`, `[member.<name>]`.
- **Bootstrap's github tool** ships
  `.github/ISSUE_TEMPLATE/{bug_report.yml,config.yml.tmpl,feature_request.yml}`
  and `pull_request_template.md`; the gitlab tool ships the GitLab templates.
- **vwf files that name `tool-config`, `stackgen.yaml`, `setup:all`, `code:all`,
  `setup:ai` or the task library:**
  - init: `SKILL.md` (:5-6, :39-83, :116, :225-250, :370-406, :481, :564-565,
    :607-655; the `all` call :629-634), `references/tool-configs.md` (whole
    file; owner table :54-60), `references/new-repo.md` (:85-105, :196,
    :430-559, :638-648), `references/existing-repo.md` (:3, :11, :632-647, :868,
    :1096), `references/readme-and-license.md` (:37),
    `assets/hygiene/CONTRIBUTING.md` (:38).
  - setup: `SKILL.md` (:63-64, :111-112, :133, :161, :181, :211-236 pack `--set`
    values, :322-325), `references/materialize.md` (:38, :132, :197, :225,
    :285), `references/migrate-pipeline.md` (:32),
    `references/onboard-pipeline.md` (:55), `references/format-lineage.md`
    (:127), `references/memory-tree.md`.
  - doctor: `SKILL.md` (:50, :180, :214-221 drift by `preview`),
    `references/stack-checks.md` (§5 :307-319 shaped means `format: 1`;
    :417-419, :454-559, :607-608, :703), `references/harness-and-memory.md`
    (:56, :91, :119), `references/code-intelligence.md` (:14, :48).
  - shared: `assets/vwf-config.md` (:39, :125, :711, :718),
    `assets/stack-adapter.md` (:383, :418), `assets/graphify.md`,
    `assets/memory.md`, `skills/git-workflow/references/worktree-setup.md` (:37
    `.worktrees/` from tool-config's `.gitignore`; :97-129 fallback
    `setup:all`), `skills/handoff/SKILL.md`, `skills/mempalace/SKILL.md`,
    `skills/mockups/SKILL.md`, `skills/readme/SKILL.md`,
    `skills/blueprint/references/screen-review.md`.
- **Docs that describe today's behaviour:**
  `site/src/content/docs/plugins/vwf.md` (60 hits, mostly :940-1831),
  `how-to/brownfield/onboard-existing-codebase.md` (:83-130),
  `how-to/greenfield/single-repo.md` (:61-107),
  `how-to/greenfield/multi-repo.md`,
  `how-to/brownfield/migrate-old-vwf-repo.md`, `installer/targets.md` (:75),
  `CLAUDE.md` (the vwf row, the installation section on `setup:ai:all`),
  `readme.md` (:125-131, :305-328), `installer/CLAUDE.md` (:26-27),
  `.claude/skills/vwf-plugin/` (`SKILL.md` :102-244,
  `references/dependencies.md` :36-44, `references/skills-and-agents.md`
  :27-40).
- **Commit convention:** types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; scopes unrestricted.
- No worktree or unmerged branch touches these trees (checked 2026-10-18).

## Assumed decisions — confirm or override at review

| # | Decision          | Ruling                                                                                                                                                                                                                                                                           | Rejected                        | Unit       |
| - | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------- |
| 1 | init's job        | init surveys the repo and hands one `bootstrap: adopt` instruction to `docs/sync/vwf.md`. It keeps CONTRIBUTING, SECURITY, the licenses, `.config/vwf.yaml` and the forge pass                                                                                                   | hand off only; retire init      | U1         |
| 2 | Issue templates   | init no longer ships `.github/ISSUE_TEMPLATE/*`; bootstrap's github or gitlab tool lands them                                                                                                                                                                                    | keep them in init               | U1         |
| 3 | stackgen.yaml     | Shaped means `.config/bootstrap.toml` exists. A repo with `.config/stackgen.yaml` and no `.config/bootstrap.toml` is migrated by `/vwf:setup reshape`: it sends `bootstrap: adopt` with the values read from `stackgen.yaml`, then deletes `stackgen.yaml` on the user's consent | delete, no migration; keep both | U1, U2, U3 |
| 4 | Installing vwf    | Bootstrap's `setup:ai` installs vwf when it is absent (the user's bootstrap work); the vwf docs name bootstrap's `setup:ai`                                                                                                                                                      | the installer only              | U4         |
| 5 | Drift             | doctor runs `mise run setup:configs --dry-run`; each change it lists is a drift finding, remedy `mise run setup:configs`. A missing `.config/bootstrap.toml` is a blocking finding naming `/vwf:setup reshape`                                                                   | presence only                   | U3         |
| 6 | Task names        | vwf uses bootstrap's names: `setup` (was `setup:all`), `code` (was `code:all`), `code:format`, `code:lint` (were `…:all`), `setup:worktree` with `setup` as the fallback                                                                                                         | —                               | U1–U4      |
| 7 | Pack values       | setup passes no `pack --set` values; forge and secrets come from the tools `.config/bootstrap.toml` selects (`github`/`gitlab`; `fnox`/`doppler`)                                                                                                                                | —                               | U2         |
| 8 | One handoff doc   | The procedure — clone, `docs/sync/vwf.md`, the three instruction types — is written once, in `plugins/vwf/skills/init/references/bootstrap-handoff.md`, which replaces `references/tool-configs.md`. setup and doctor cite it by path                                            | a copy in each skill            | U1, U2, U3 |
| 9 | Adopt instruction | The shape below, confirmed by the user                                                                                                                                                                                                                                           | another shape                   | U1, U2     |

The adopt instruction (decision 9):

```text
bootstrap: adopt
tools: [base, node, github, fnox, claude]
values: repo_name=<name>, product_name=<name>, merge_model_develop=direct, merge_model_main=direct, environments=[dev, ci]
members: [<path>, …]          # only for a multi-repo product
reason: /vwf:init shaped this repo
```

## New dependencies

none

## Units

| Id | Wave | Unit file                            | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                 | Depends on     | Status  | Commit |
| -- | ---- | ------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------- | ------ |
| U1 | 1    | [01-init.md](01-init.md)             | edit | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                                                                                                                                         | —              | pending |        |
| U2 | 1    | [02-setup.md](02-setup.md)           | edit | `plugins/vwf/skills/setup/**`                                                                                                                                                                                                                                                                                                                                                                                                        | —              | pending |        |
| U3 | 1    | [03-doctor.md](03-doctor.md)         | edit | `plugins/vwf/skills/doctor/**`                                                                                                                                                                                                                                                                                                                                                                                                       | —              | pending |        |
| U4 | 1    | [04-vwf-shared.md](04-vwf-shared.md) | edit | `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/graphify.md`, `plugins/vwf/assets/memory.md`, `plugins/vwf/skills/git-workflow/references/worktree-setup.md`, `plugins/vwf/skills/handoff/SKILL.md`, `plugins/vwf/skills/mempalace/SKILL.md`, `plugins/vwf/skills/mockups/SKILL.md`, `plugins/vwf/skills/readme/SKILL.md`, `plugins/vwf/skills/blueprint/references/screen-review.md` | —              | pending |        |
| U5 | 2    | [05-docs.md](05-docs.md)             | edit | `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `installer/CLAUDE.md`, `.claude/skills/**`, `.claude/docs/**`, `docs/memory/decisions/2026-10-18-vwf-hands-off-to-bootstrap.md` (new), and any other human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to U4                                                                                                                                                   | U1, U2, U3, U4 | pending |        |
| U6 | 3    | [06-gates.md](06-gates.md)           | edit | none — runs the full wave gate                                                                                                                                                                                                                                                                                                                                                                                                       | U5             | pending |        |

## Shared-file rule

| File                                                      | Why it collides           | Owner                |
| --------------------------------------------------------- | ------------------------- | -------------------- |
| `plugins/vwf/skills/init/references/bootstrap-handoff.md` | U2 and U3 cite it         | U1 only              |
| every human-facing doc                                    | many units would edit one | U5 only              |
| `plugins/stackgen/**`                                     | plans 1 and 3             | nobody — do not edit |

## Waves

- Wave 1 — U1, U2, U3, U4: four disjoint vwf trees. U2 and U3 cite
  `bootstrap-handoff.md` by path and do not read it.
- Wave 2 — U5: docs.
- Wave 3 — U6: full gate.

## Wave gate

```text
bash -c 'gh api repos/virajp/bootstrap/contents/docs/sync/vwf.md --jq .content | base64 -d | grep -q "bootstrap: adopt" || { echo "bootstrap docs/sync/vwf.md lacks the adopt instruction"; exit 1; }'
bash -c 'gh api repos/virajp/bootstrap/contents/tools/claude/.config/mise/tasks/setup/ai --jq .content | base64 -d | grep -q "claude-plugins" || { echo "bootstrap setup:ai does not install vwf"; exit 1; }'
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line must
be green before wave 1.

## After landing

none

## Gates the orchestrator keeps

none beyond the wave gate — every unit edits prose.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never writes a lock file. A unit never runs `git checkout`,
`git restore` or a formatter with `--fix` on a path outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Any edit in the bootstrap repo — the user's work, done before this plan runs.
- This repo's own `.config/` and its hand-edited `setup:ai` — the user edits
  them by hand.
- `plugins/stackgen/**` — plans 1 and 3.

## Parked

- B102: plan 3 — delete `plugins/stackgen/skills/tool-config/`, its tests and
  fixtures, checker rules 4, 15, 16, 17 and the tool-config part of rule 11, and
  the `scripts/src/check.ts` imports of its `lib/`.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-18-vwf-hands-off-to-bootstrap

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
