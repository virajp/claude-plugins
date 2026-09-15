---
type: vwf-change-plan
title: default per platform — the default flag is unique per (axis, platform)
requires: []
backlog: []
---

# Plan — default per platform — a bundle's default flag is unique per (axis, platform) (2026-09-15)

## Status

**COMPLETE** 2026-09-15 — commits 41f4ddd0, 5c14b613, 2b845213, 036aeb8e,
14ba7418 on branch `2026-09-15-default-per-platform`, merged to develop

## Consent

| Action                                            | Granted                                                                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                                              |
| After landing: `/release`                         | ask                                                                                                                                                                                              |
| Release `stackgen` publicly                       | minor — `1.18.0` → `1.19.0`, by editing `plugins/stackgen/.claude-plugin/plugin.json`; tagged by the `/release` ask step                                                                         |
| Release `vwf` publicly                            | minor — `19.27.1` → `19.28.0`, by editing `plugins/vwf/.claude-plugin/plugin.json`; tagged by the `/release` ask step                                                                            |
| Release `site` publicly                           | patch — `1.1.20` → `1.1.21`, by `mise run p:site:version` (bare — the task takes no positional and refuses a dirty tree, so it runs first in the bump unit); deployed by the `/release` ask step |
| Release `installer` publicly                      | none — untouched                                                                                                                                                                                 |

**A release recorded here is intent, not authorisation.** The `/release` step is
an `ask` step: the run stops once, reports what it would ship, and waits. The
`run` step publishes nothing and cuts no tag; it stages the two plugins into
this machine's dev marketplace, which a **restarted** session picks up.

## Goal

After this lands, a bundle's `default: true` is unique per **(axis, platform)**
rather than per axis, so a bundle serving one platform can be the preselected
entry on that platform's round without being preselected on every other round of
the same axis. `astro-ssg` carries the flag and is what a `site` project's
architecture round highlights. The checker's rule 14, stackgen's pack-format
contract, vwf's stack-adapter contract and the architecture menu's preselect
rule all say the same thing.

Framing: the user asked for a plain-HTML static-site pack offered beside Astro,
"Astro-SSG will still be the default". The survey found the default cannot be
expressed today — `astro-ssg` carries no flag, and flagging it under the
per-axis rule would preselect it on backend rounds too. The mechanism is its own
plan (this one); the pack is the next plan, which `requires:` this folder.

Not a reversal. The per-axis rule was written on 2026-09-15 when the design axis
was the only axis with a default; this widens it for axes whose bundles declare
platforms and leaves every other axis on the rule as written.

## Facts the survey established

- The flag: `default: true` in a bundle's frontmatter. Today only
  `plugins/stackgen/stacks/bundles/claude-code.md:5` (design axis) carries it;
  no project-axis bundle does, so flagging `astro-ssg` passes today's rule 14 as
  well as the widened one — U1 and U2 need no ordering.
- Rule 14 is `scripts/src/check.ts:1265-1332`, tests at
  `scripts/src/check.test.ts:1090-1140` (three cases: distinct axes pass, two on
  one axis fail, a string `"true"` is a finding). Bundle frontmatter is `axis`,
  `kind`, `platforms`, `artifact` (deploy only), `unconditional`, `default`,
  `components` — `plugins/stackgen/assets/pack-format.md:200-240`. Language
  packs alone carry `platforms:` on the pack side (`pack-format.md:159`);
  bundles carry their own `platforms:` list (`bundles/astro-ssg.md:1-13`).
- The menu: `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:27-56` lists
  every non-unconditional bundle with no platform filter and copies
  `default: true` verbatim (`:48-50`, payload at `:74`). vwf filters
  project-axis entries by the project's platforms
  (`plugins/vwf/skills/architecture/references/stack-menu.md:34`) and preselects
  the flagged entry (`:58-62`, `:120-121`, `:164-165`;
  `skills/architecture/SKILL.md:248-249`). The adapter contract is
  `plugins/vwf/assets/stack-adapter.md:187-198`. No `astro` string exists
  anywhere under `plugins/vwf/`.
- Every passage stating the per-axis rule, each one an owned edit below:
  `plugins/stackgen/assets/pack-format.md:206,228-238`,
  `plugins/stackgen/stacks/readme.md:126-127`,
  `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:48-50`,
  `plugins/vwf/assets/stack-adapter.md:187-198`,
  `plugins/vwf/skills/architecture/SKILL.md:248-249`,
  `plugins/vwf/skills/architecture/references/stack-menu.md:58-62,120-121,164-165`,
  `CLAUDE.md:169-173`, `.claude/docs/repo-shape.md:209-213`,
  `.claude/skills/plugin-authoring/references/checks.md:192-200`,
  `.claude/skills/stackgen-plugin/SKILL.md:93-98`,
  `site/src/content/docs/plugins/vwf.md:564-568`,
  `site/src/content/docs/plugins/stackgen.md:294-299`,
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:57-64` (the
  four-Astro-bundles passage, which gains "and `astro-ssg` is preselected").
- Versions today: stackgen `1.18.0`, vwf `19.27.1`, site `1.1.20`. The site bump
  is `mise run p:site:version` bare (patch; refuses a dirty tree); the plugin
  bumps are hand edits; `mise run p:plugins:marketplace` regenerates both
  manifests. `p:plugins:inventory` regenerates
  `plugins/stackgen/stacks/inventory.md` — no pack or bundle count changes in
  this plan, so it is expected to be a no-op, run to prove it.
- Commit convention `.config/git-conventional-commits.yaml`: types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; any scope.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand. `CLAUDE.md`, `readme.md`, `site/**` and `.claude/**` markdown are
  formatted; run `mise run code:format --fix` over owned files only.

## Assumed decisions — confirm or override at review

| # | Decision                             | Ruling                                                                                                                                                                                                                                                                                          | Rejected                                                                                                                                                  | Unit       |
| - | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1 | What two flagged bundles conflict on | Two flagged bundles on one axis conflict iff **either declares no `platforms:` list, or their platform lists intersect**; the finding names both files and the platform(s) they share. An axis whose flagged bundles all declare platforms may therefore carry one flagged bundle per platform. | Strict per-axis (cannot express a site default); per-platform only, ignoring unplatformed bundles (an unplatformed flagged bundle would overlap silently) | U1, U2, U3 |
| 2 | What vwf preselects                  | vwf preselects the **one flagged entry among the entries offered on the round** — the list it has already filtered by the project's platforms. The menu payload shape is unchanged; the flag is still copied verbatim from the bundle, never computed, and vwf still infers none.               | vwf filtering by platform for this purpose — it already filters the round; a new payload field — nothing new to carry                                     | U3, U2     |
| 3 | Which bundle is flagged              | `astro-ssg` alone gains `default: true`. No backend, `webapp`, `cli` or other platform's bundle is flagged by this plan.                                                                                                                                                                        | Flagging a default per platform across the board — nobody asked, and each is a separate ruling                                                            | U2         |
| 4 | Bump levels                          | No `config_format` or `blueprint_format` bump — no config or blueprint field changes. vwf **minor** (the preselect rule the manual documents changes), stackgen **minor** (the contract text and the flag on a shipped bundle), site **patch** (manual passages).                               | vwf patch — a documented rule changed, not a typo                                                                                                         | U5         |
| 5 | Model per unit                       | opus for every unit, as the prior plans.                                                                                                                                                                                                                                                        | —                                                                                                                                                         | all        |
| 6 | Where the decision record lands      | The docs unit writes `docs/memory/decisions/2026-09-15-default-per-platform.md` per `assets/memory.md`, recording rule 1 and its rejected alternatives, and citing the 2026-09-06 astro decision as the bundle it makes default.                                                                | No record — a widened checker rule without its reasoning is one the next plan re-opens                                                                    | U4         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                           | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-checker.md](01-checker.md)               | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                            | —          | green  | 41f4ddd0 |
| U2 | 1    | [02-stackgen.md](02-stackgen.md)             | `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`, `plugins/stackgen/stacks/bundles/astro-ssg.md`                                                          | —          | green  | 5c14b613 |
| U3 | 1    | [03-vwf.md](03-vwf.md)                       | `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/skills/architecture/SKILL.md`, `plugins/vwf/skills/architecture/references/stack-menu.md`                                                                                                  | —          | green  | 2b845213 |
| U4 | 2    | [04-docs.md](04-docs.md)                     | `CLAUDE.md`, `readme.md`, `.claude/docs/**`, `.claude/skills/plugin-authoring/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-15-default-per-platform.md` | U1, U2, U3 | green  | 036aeb8e |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md) | `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                        | U4         | green  | 14ba7418 |

## Shared-file rule

| File                                                               | Why it collides                                   | Owner   |
| ------------------------------------------------------------------ | ------------------------------------------------- | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`                      | version                                           | U5 only |
| `plugins/vwf/.claude-plugin/plugin.json`                           | version                                           | U5 only |
| `site/package.json`                                                | version                                           | U5 only |
| `.claude-plugin/marketplace.json`                                  | generated                                         | U5 only |
| `plugins/stackgen/stacks/inventory.md`                             | generated                                         | U5 only |
| `CLAUDE.md`, `readme.md`, `.claude/**`, `site/src/content/docs/**` | human-facing docs; U1–U3 report `DOCS FALSIFIED:` | U4 only |
| `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`             | the menu skill's prose states the per-axis rule   | U2 only |

## Waves

- **Wave 1 — U1, U2, U3.** Three disjoint trees: the checker, stackgen's
  contract and bundle, vwf's contract and menu. Flagging `astro-ssg` passes the
  unwidened rule 14 (the project axis has no other flag), so U2 does not wait on
  U1.
- **Wave 2 — U4.** Docs over the wave-1 delta, plus the decision record.
- **Wave 3 — U5.** Bumps, generators, the full gate.

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

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line must
be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                   |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages stackgen and vwf into this machine's dev marketplace and updates the install; publishes nothing; a restarted session picks it up |
| `/release`                 | ask  | Tags `stackgen-v1.19.0`, `vwf-v19.28.0`, `site-v1.1.21`; the run stops and asks first                                                   |

## Gates the orchestrator keeps

- After wave 1: `mise run p:plugins:check` green on the real tree with both
  `claude-code.md` (design) and `astro-ssg.md` (project, `[site]`) flagged.
- After wave 1: `pnpm vitest run` green, and `scripts/src/check.test.ts` holds
  the four rule-14 cases U1 names (its Verification) — grep each case title.
- After wave 2:
  `command grep -rn 'one per axis\|one bundle per axis\|at most one entry per axis\|at most one bundle per axis' plugins .claude CLAUDE.md readme.md site/src/content/docs`
  returns no hit that lacks a per-platform qualification — read each hit.

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

- **The plain-HTML static-site pack and its two bundles** — the next plan,
  `docs/plans/2026-09-15-html-static-site/`, which `requires:` this folder.
- **A default for any platform other than `site`** — each is its own ruling and
  nobody asked.
- **A `config_format` bump** — no config field changes (decision 4).
- **The broken 13-skip loop in `p:site:version`** recorded as a GAP by the
  web-frontend-surface plan — `1.1.21` is not a skip case; still unfixed.

## Parked

none

## Run log

<written by /vwf:change-execute; empty at approval>

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                       | Commit   |
| ---- | --------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green       | all nine gate lines green on develop d366ed16                                                                                                                                                                                                                                                                                                | —        |
| 1    | U2        | opus  | 1     | green       | DECIDED: shortened pack-format frontmatter comment to fold width; DOCS FALSIFIED: stackgen-plugin SKILL.md:93-98, site stackgen.md:294-299, CLAUDE.md:169-173, repo-shape.md:209-213, checks.md:192-200, choosing-your-stack.md:57-64; GAP: none                                                                                             | 5c14b613 |
| 1    | U3        | opus  | 1     | green       | DECIDED: round filter worded as "the axis's filter above"; DOCS FALSIFIED: site vwf.md:564-568; GAP: stack-menu.md:34 reads `role` not platforms (pre-format-22 wording) — left untouched, not in Edits                                                                                                                                      | 2b845213 |
| 1    | U1        | opus  | 1     | green       | DECIDED: empty `platforms: []` treated as absent; non-string platform entries ignored for intersection (rule 4's finding); DOCS FALSIFIED: none beyond U2/U4's; GAP: none                                                                                                                                                                    | 41f4ddd0 |
| 1    | R1        | opus  | 1     | findings(1) | stack-menu.md:60 [U3] rule 2/5 — "the axis's filter above" points at :34 which still reads `role` (pre-format-22), adapter says platforms; CONTRACT clean; RULINGS clean; no further unqualified per-axis passage found. Looped to U3 round 2                                                                                                | —        |
| 1    | U3        | opus  | 2     | green       | stack-menu.md:34 reworded to the adapter's covering rule (platforms cover every platform the project declares); round-1 GAP resolved                                                                                                                                                                                                         | 2b845213 |
| 1    | R1        | opus  | 2     | pass        | round-1 finding resolved; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                      | —        |
| 1    | gate      | —     | 1     | green       | nine gate lines green; orchestrator gates: both flags present, four rule-14 case titles found                                                                                                                                                                                                                                                | —        |
| 2    | U4        | opus  | 1     | green       | DECIDED: readme.md:294 and ui-with-design-tool.md claude-code passages still true, untouched; decision record cites the html plan by its real folder `2026-09-15-html-site-pack`; GAP: docs-sync surveyor report was delivered to the orchestrator instead of U4 — its 7 findings all covered by U4's hand survey (verified by orchestrator) | 036aeb8e |
| 2    | R2        | opus  | 1     | findings(2) | CLAUDE.md:173 and repo-shape.md:214 [U4] rule 5 — "platform they share" stated for both conflict cases; the no-list case names the bare file. CONTRACT clean; RULINGS clean; all seven falsified passages landed. Looped to U4 round 2                                                                                                       | —        |
| 2    | U4        | opus  | 2     | green       | CLAUDE.md and repo-shape.md finding text: names both files plus the platform they share, or the one that declares no list                                                                                                                                                                                                                    | 036aeb8e |
| 2    | R2        | opus  | 2     | pass        | both round-1 findings resolved; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                | —        |
| 2    | gate      | —     | 1     | green       | nine gate lines green; orchestrator grep: every per-axis hit carries a per-platform qualification                                                                                                                                                                                                                                            | —        |
| 3    | U5        | opus  | 1     | green       | stackgen 1.19.0, vwf 19.28.0, site 1.1.21; marketplace regenerated (2 new refs); inventory byte-identical; GAP: `p:site:version` refused the dirty tree (the orchestrator's run log) — patch bump applied to site/package.json by hand, not a 13/17 case; nine gate lines exit 0                                                             | 14ba7418 |
| 3    | R3        | opus  | 1     | pass        | FINDINGS 0; CONTRACT clean; RULINGS clean; note: site bumped by hand, same literal                                                                                                                                                                                                                                                           | —        |
| 3    | gate      | —     | 1     | green       | nine gate lines green                                                                                                                                                                                                                                                                                                                        | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-15-default-per-platform
