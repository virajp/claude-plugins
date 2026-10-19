---
type: vwf-change-plan
title: Retire tool-config
requires: [ docs/plans/2026-10-18-vwf-hands-off-to-bootstrap ]
source: [ B102 ]
backlog: [ B102 ]
backlog_pieces: []
gaps_of: []
---

# Plan — Retire tool-config (2026-10-18)

## Status

**APPROVED**

APPROVED 2026-10-19 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | yes     |

**The mode recorded here is the consent.** This plan has no after-landing step:
`.config/vwf.yaml`'s `after_landing:` already runs `mise run p:plugins:local`.
The staged stackgen is picked up only by a **restarted** session.

## Release levels

| Project  | Level | Reason                                        |
| -------- | ----- | --------------------------------------------- |
| stackgen | MAJOR | A shipped skill, `stackgen:tool-config`, goes |
| vwf      | PATCH | Checker rule numbers in its prose change      |
| site     | PATCH | The manual follows the change                 |

## Goal

`stackgen:tool-config` is gone, with its tests, its fixtures and its checker
rules. The repo-local mise skill it rendered lives on as a stackgen plugin
skill. Nothing in the plugins calls tool-config any more.

Plan 3 of 3 for B102 — requires
`docs/plans/2026-10-18-vwf-hands-off-to-bootstrap`. Landing finishes B102.

Reversals, confirmed by the user on 2026-10-18 (plans 1 and 2 reversed the other
tool-config decisions):

- `docs/memory/decisions/2026-09-26-tool-config.md` — tool-config no longer
  exists.
- `docs/memory/decisions/2026-10-01-tool-config-renders-with-a-node-script.md` —
  the script goes with it.
- `docs/memory/decisions/2026-10-05-tool-config-templates.md` — the two trees
  go.

## Facts the survey established

- **tool-config** (`plugins/stackgen/skills/tool-config/`): `SKILL.md`,
  `scripts/tool-config.mjs` plus nine `lib/` modules, `assets/`, `templates/`,
  `references/{dprint,git,gitleaks,graphify,grype,mise,pre-commit}.md`.
  `templates/.claude/skills/mise/SKILL.md` is the repo-local mise skill.
- **Tests and fixtures:**
  `scripts/src/tool-config-{render,template,values}.test.ts` (plan 1 deletes
  `tool-config-pack.test.ts`), `scripts/src/fixtures/tool-config/`.
  `scripts/src/check.ts` imports tool-config's `lib/cli.mjs` and
  `lib/render.mjs` (:46, :48). `check.test.ts` blocks "skill scripts" (:1291)
  and "the exclusion sets" (:1960).
- **Checker rules** (`.claude/skills/plugin-authoring/references/checks.md`):
  rule 4 (:55-64) checks the frontmatter of tool-config's landed mise skill;
  rule 11 (:107-226) checks pack `config/` and tool-config's two trees; rule 13
  (:241-279) no plugin-path citation in landed files; rule 15 (:299-337)
  tool-config's four exclusion lists agree; rule 16 (:338-346) skill node
  scripts; rule 17 (:347-356) no bare `mise use`, its text naming `conf.d/_base`
  and `ai`.
- **Rule-number references** outside `docs/plans/`:
  `.claude/skills/stackgen-plugin/SKILL.md` (12),
  `.claude/skills/plugin-authoring/references/checks.md` (12),
  `scripts/src/check.ts` (6), `plugins/stackgen/assets/pack-format.md` (6),
  `CLAUDE.md` (6), `.claude/skills/plugin-authoring/SKILL.md` (6),
  `plugins/vwf/skills/setup/references/format-lineage.md` (4),
  `plugins/vwf/assets/delivery-pipeline.md` (3),
  `.claude/skills/vwf-plugin/SKILL.md` (3),
  `plugins/vwf/skills/execute/references/edit-unit.md`,
  `plugins/vwf/assets/engineering-baseline.md`,
  `plugins/stackgen/stacks/readme.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`,
  `.claude/skills/plugin-authoring/references/structure.md`,
  `.claude/docs/repo-shape.md` (one each). Some may be other "rules"; each is
  checked.
- **Bootstrap** (`github.com/virajp/bootstrap`, `main`): `setup` takes
  `--upgrade` (`tools/base/.config/mise/tasks/setup/_default.tmpl:5-8`).
  `code/check/_default` is not on `main` yet — the first gate line waits for it.
  The bootstrap project (`github.com/users/virajp/projects/5`) holds B06–B10,
  created 2026-10-19 for the outputs tool-config ships and bootstrap does not:
  miserc `env_conf_d`, `.gitattributes`, `.graphifyignore`, the claude-status
  config, `code:count`. The second gate line waits for them `Done` or `Closed`.
- **Docs:** `site/src/content/docs/plugins/stackgen.md` "The repo baseline —
  mise, the gates and the hygiene files" (:797-1498: `/stackgen:tool-config`
  :962, "The config split" :1122, "The task library" :1215);
  `.claude/skills/stackgen-plugin/SKILL.md`; `.claude/docs/repo-shape.md`
  (:126-283); `.claude/docs/ci-and-releases.md` (:6, :33, :61, :69); `CLAUDE.md`
  (the tasks section's "seventeen rules", the stackgen row); `readme.md`.
- **Commit convention:** types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; scopes unrestricted.

## Assumed decisions — confirm or override at review

| # | Decision                | Ruling                                                                                                                                                       | Rejected                                     | Unit       |
| - | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ---------- |
| 1 | Outputs bootstrap lacks | miserc, `.gitattributes`, `.graphifyignore`, the statusline config and `code:count` go with tool-config; bootstrap items B06–B10 own them                    | keep them here; vwf init lands them          | U3         |
| 2 | taplo                   | Goes: "`taplo` is no more required as `dprint` does it's work now"                                                                                           | —                                            | U3         |
| 3 | The mise skill          | Becomes `plugins/stackgen/skills/mise/SKILL.md`, a plugin skill using bootstrap's task names; nothing is copied into a repo                                  | the materializer lands it; vwf init lands it | U1         |
| 4 | `code:check:all`        | "replaced with `code/check/_default` which allows to run `code:check`"                                                                                       | —                                            | U1, U5     |
| 5 | `upgrade`               | "moved as flag `--upgrade` to `setup` task"                                                                                                                  | —                                            | U1, U5     |
| 6 | Rule numbers            | Rules 4 and 15 go; rule 11 loses its tool-config part. Renumber 1 to 15: 1–3 unchanged, 5–14 → 4–13, 16 → 14, 17 → 15. Archived plans keep their old numbers | keep numbers, mark retired                   | U2, U3, U5 |
| 7 | Review                  | One review row: `check.ts` is tooling source                                                                                                                 | none                                         | U4         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                            | Kind   | Owns                                                                                                                                                                                                                                                                                                                         | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-mise-skill.md](01-mise-skill.md)                 | edit   | `plugins/stackgen/skills/mise/**` (new)                                                                                                                                                                                                                                                                                      | —          | pending |        |
| U2 | 1    | [02-plugin-passages.md](02-plugin-passages.md)       | edit   | every file under `plugins/` outside `plugins/stackgen/skills/tool-config/**` and `plugins/stackgen/skills/mise/**` that names tool-config or a checker rule by number                                                                                                                                                        | —          | pending |        |
| U3 | 2    | [03-delete-and-checker.md](03-delete-and-checker.md) | edit   | `plugins/stackgen/skills/tool-config/**`, `scripts/src/tool-config-render.test.ts`, `scripts/src/tool-config-template.test.ts`, `scripts/src/tool-config-values.test.ts`, `scripts/src/fixtures/tool-config/**`, `scripts/src/check.ts`, `scripts/src/check.test.ts`, `.claude/skills/plugin-authoring/references/checks.md` | U1, U2     | pending |        |
| U4 | 3    | [04-review.md](04-review.md)                         | review | —                                                                                                                                                                                                                                                                                                                            | U3         | pending |        |
| U5 | 4    | [05-docs.md](05-docs.md)                             | edit   | `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/skills/**` (except `plugin-authoring/references/checks.md`), `.claude/docs/**`, `docs/memory/decisions/2026-10-18-retire-tool-config.md` (new), and any other human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to U3                         | U4         | pending |        |
| U6 | 5    | [06-gates.md](06-gates.md)                           | edit   | none — runs the full wave gate                                                                                                                                                                                                                                                                                               | U5         | pending |        |

## Shared-file rule

| File                                                   | Why it collides                        | Owner                |
| ------------------------------------------------------ | -------------------------------------- | -------------------- |
| `plugins/stackgen/skills/tool-config/**`               | U1 reads the mise template; U3 deletes | U3, wave 2 after U1  |
| `.claude/skills/plugin-authoring/references/checks.md` | the rule text and its numbers          | U3 only              |
| every human-facing doc                                 | many units would edit one              | U5 only              |
| `docs/plans/**`                                        | history keeps its rule numbers         | nobody — do not edit |

## Waves

- Wave 1 — U1, U2: the new mise skill and the plugin passages; disjoint.
- Wave 2 — U3: delete tool-config and renumber the checker, after U1 has read
  the template.
- Wave 3 — U4: review of U3.
- Wave 4 — U5: docs.
- Wave 5 — U6: full gate.

## Wave gate

```text
bash -c 'gh api repos/virajp/bootstrap/contents/tools/base/.config/mise/tasks/code/check/_default --silent || { echo "bootstrap main lacks code/check/_default"; exit 1; }'
bash -c 'n=$(gh project item-list 5 --owner virajp --format json --limit 500 --jq "[.items[] | select(.title | test(\"^B(06|07|08|09|10) — \")) | select(.status != \"Done\" and .status != \"Closed\")] | length"); [ "$n" = 0 ] || { echo "bootstrap B06-B10: $n not Done"; exit 1; }'
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line must
be green before wave 1.

## After landing

none

## Gates the orchestrator keeps

none beyond the wave gate.

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

- Any edit in the bootstrap repo — the user's work (B06–B10,
  `code/check/_default`).
- This repo's own `.config/` — the user edits it by hand, including its
  formatter and linter exclusions that name the tool-config path.
- `docs/plans/**` — archived plans keep their rule numbers.

## Parked

none — after this plan lands, release the three B102 plans together with
`/release`.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-18-retire-tool-config

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
