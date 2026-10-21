---
type: vwf-change-plan
title: Execute monitor inside vwf
requires: []
source: [ B101 ]
backlog: []
backlog_pieces: [ B101 ]
gaps_of: []
---

# Plan — Execute monitor inside vwf (2026-10-21)

## Status

**RUNNING**

RUNNING since 2026-10-21 in .worktrees/2026-10-21-execute-monitor-in-vwf

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | no      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt, and `run` is the only mode. This plan has no after-landing
step: `.config/vwf.yaml`'s `after_landing:` already runs
`mise run p:plugins:local`. The staged vwf is picked up only by a **restarted**
session.

## Release levels

| Project | Level | Reason                                                                     |
| ------- | ----- | -------------------------------------------------------------------------- |
| vwf     | MINOR | New behaviour: a progress pane for `/vwf:execute` and `/vwf-monitor`       |
| site    | PATCH | The manual describes the pane and corrects the passages on vwf's two hooks |

## Goal

After this plan lands, every vwf install carries the `/vwf:execute` progress
pane, and nobody can install the pane alone. The pane is a Claude Code mod — a
function-hooks module — that the user built and tested on 2026-10-21 as a
prototype in the session mods folder. This plan moves it into vwf as it is.

Reversals, confirmed by the user on 2026-10-21:

- The user's own choice earlier that day of a separate `vwf-monitor` plugin that
  vwf depends on. The user then ruled that the pane must be installable only
  through vwf, and no marketplace or manifest field hides a listed plugin or
  blocks a direct install. So the mod moves into vwf. The two-plugin north star
  (`docs/memory/decisions/2026-08-17-north-star-two-plugins.md`) stays
  unchanged.
- `.claude/skills/vwf-plugin/references/assets.md:39-43` — "a JS/TS rewrite has
  no business in a language-agnostic workflow plugin" — no longer holds for this
  hooks module. The workflow doctrine stays language-agnostic; the module is
  engine glue, not doctrine.

Plan 1 of 1 for a piece of B101: the pane covers `/vwf:execute` only.

## Facts the survey established

- **The prototype** is at
  `/Users/virajpatel/.claude/dev-mods/1eed5b1e-4e93-45b7-9d87-9166bb78929f/vwf-monitor/`:
  `hooks/register.tsx`, `hooks/plan.ts`, `hooks/plan.test.ts`,
  `hooks/pane.test.tsx`, `hooks/refresh.test.tsx`, `types/index.d.ts`,
  `hooks/hooks.json` (`{ "modules": ["./register.tsx"] }`),
  `.claude-plugin/plugin.json`, and two files that do not move:
  `.claude-plugin/marketplace.json` (a dev-only marketplace) and `tsconfig.json`
  (engine-written; it extends `.claude-plugin/types/`, which the engine also
  writes and git ignores). At approval, in Claude Code 2.1.301:
  `claude plugin test` — 5 pass; `claude plugin validate --strict` — passes
  except for the missing `author`; type check clean.
- **The prototype's names:** pane id `vwf-monitor`, command `vwf-monitor`, and
  three `$.state` refs with plugin `vwf-monitor` and the keys `run`, `isQuiet`
  and `viewing`, declared in `types/index.d.ts` under
  `interface PluginState { 'vwf-monitor': { … } }`. A `$.state` ref's `plugin`
  must be the name of the plugin that loads the module.
- **The engine refuses a colon in a registered command name:**
  `CommandSpec.name` takes letters, digits, `_` and `-`. So `/vwf:monitor` is
  not possible as a registered command.
- **One `hooks/hooks.json` may hold `modules` beside the classic `hooks`
  block:** `claude plugin validate --strict` passes a plugin with both. The
  runtime behaviour is not yet confirmed — a gate the orchestrator keeps.
- **`plugins/vwf/.claude-plugin/plugin.json`** keeps its keys in alphabetical
  order (`$schema`, `author`, `dependencies`, `description`, `keywords`,
  `mcpServers`, …). `plugins/vwf/hooks/hooks.json` holds the two mempalace hooks
  (`PreCompact`, `Stop`) and nothing else.
- **The checker** (`scripts/src/check.ts`): rule 3 reads only
  `hooks[*][*].hooks[*].command`, so `modules` is ignored; rule 10
  (`checkVwfIsTechnologyFree`) scans only vwf `.md` files, so the TypeScript
  files and their `git` strings pass; rule 6 scans every file for
  `${CLAUDE_PLUGIN_ROOT}/<path>`; rule 17 scans every file for the bare phrase
  `mise use`. `p:plugins:check` runs `claude plugin validate --strict` on each
  plugin when `claude` is on PATH, and CI has no `claude`.
- **Tooling over `plugins/vwf/**`:** dprint formats `.ts`, `.tsx`, `.d.ts` and
  `.json` (double quotes, sorted imports); the house linter lints
  `**/*.{ts,tsx}` with typescript-eslint recommended, not type-aware, and
  ignores `**/*.d.ts`; `no-undef` is off for TS, so the globals `h` and
  `Fragment` pass. No tsc project and no vitest config covers `plugins/`.
  `claude plugin test` runs only `*.test.ts(x)` inside the plugin folder.
- **`claude plugin test plugins/vwf` fails before U1** ("no hooks module to
  load"), so it is U1's verification and the gates unit's, not a wave-gate line.
- **`p:plugins:local`** copies the whole `plugins/vwf` tree into the dev
  marketplace, the new files included.
- **The docs that describe vwf's hooks as the two mempalace hooks, or every hook
  as a shell script:** `CLAUDE.md:257` and `:366-373` (the Hooks section);
  `.claude/docs/plugins.md:12,46,48`; `.claude/skills/vwf-plugin/SKILL.md:18-19`
  and `:385-403`; `.claude/skills/vwf-plugin/references/assets.md:39-43`;
  `.claude/skills/plugin-authoring/SKILL.md:89-109`;
  `.claude/skills/plugin-authoring/references/structure.md:14-24,70,81,85`;
  `.claude/skills/plugin-authoring/references/checks.md:52`; `readme.md:196`;
  `site/src/content/docs/plugins/mempalace.md:100`. The user manual's
  `/vwf:execute` section is `site/src/content/docs/plugins/vwf.md:2596-3043`.
- **The commit convention** (`.config/git-conventional-commits.yaml`): types
  `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **The bootstrap project** still has the prototype installed:
  `vwf-monitor@vwf-monitor-dev` at the local scope, from the marketplace
  `vwf-monitor-dev`. Both copies register `/vwf-monitor`.

## Assumed decisions — confirm or override at review

| #  | Decision        | Ruling                                                                                                                                                                                                    | Rejected                                                                                     | Unit |
| -- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---- |
| 1  | Packaging       | The mod is a hooks module inside vwf: `plugins/vwf/hooks/hooks.json` gains `"modules"` beside the mempalace `hooks` block                                                                                 | a separate plugin (anyone can install it directly); a second internal marketplace            | U1   |
| 2  | Layout          | `plugins/vwf/hooks/monitor/{register.tsx,plan.ts,plan.test.ts,pane.test.tsx,refresh.test.tsx}`, `plugins/vwf/types/index.d.ts`, and `"types": "./types/index.d.ts"` in vwf's manifest, alphabetical order | the mod files at the top level of `hooks/`                                                   | U1   |
| 3  | State names     | The `$.state` refs use plugin `vwf` and keys `monitorRun`, `monitorQuiet`, `monitorViewing`; the contract declares them under `vwf`                                                                       | the bare keys `run`, `isQuiet`, `viewing`, which can collide with later vwf state            | U1   |
| 4  | Command         | The command stays `/vwf-monitor`, and the pane id stays `vwf-monitor`                                                                                                                                     | `/vwf:monitor` (the engine refuses a colon); a stub skill dropped at `prompt.submit`         | U1   |
| 5  | Source          | U1 reads the prototype from the dev-mods folder in the facts; if the folder is missing, U1 returns `UNRESOLVED:` and edits nothing                                                                        | a copy of the prototype in this plan folder                                                  | U1   |
| 6  | Behaviour       | The behaviour stays exactly as tested; the only changes are the renames of rulings 3 and 4, the import paths the new layout needs, and the manifest and hooks-file wiring                                 | feature work during the move                                                                 | U1   |
| 7  | Tests           | The tests ship inside vwf, because `claude plugin test` runs only tests inside the plugin folder                                                                                                          | tests outside the plugin, which nothing runs                                                 | U1   |
| 8  | Review          | A review row covers U1, because U1 lands runnable code that runs in every vwf session                                                                                                                     | the wave review only                                                                         | U2   |
| 9  | Decision doc    | The docs unit writes `docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md` and replaces the passages that say vwf ships only shell hooks                                                       | edits to the dated decision docs                                                             | U3   |
| 10 | Order and chain | The plan requires nothing; priority 10                                                                                                                                                                    | waiting for `2026-10-18-retire-tool-config` (priority 40); a docs merge conflict is possible | —    |

## New dependencies

none — the module imports only types from `claude-code`, which the engine
provides.

## Units

| Id | Wave | Unit file                                        | Kind   | Owns                                                                                                                                                                                                                                             | Depends on | Status  | Commit   |
| -- | ---- | ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | -------- |
| U1 | 1    | [01-monitor-into-vwf.md](01-monitor-into-vwf.md) | edit   | `plugins/vwf/hooks/monitor/**` (new), `plugins/vwf/types/index.d.ts` (new), `plugins/vwf/hooks/hooks.json`, `plugins/vwf/.claude-plugin/plugin.json` (the `types` key only)                                                                      | —          | green   | c570b395 |
| U2 | 2    | [02-review.md](02-review.md)                     | review | —                                                                                                                                                                                                                                                | U1         | pending |          |
| U3 | 3    | [03-docs.md](03-docs.md)                         | edit   | `CLAUDE.md`, `readme.md`, `.claude/docs/**`, `.claude/skills/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md` (new), and any other human-facing passage `vwf:docs-sync` finds outside U1's Owns | U2         | pending |          |
| U4 | 4    | [04-gates.md](04-gates.md)                       | edit   | none — it runs the gates and fixes nothing outside a finding's own unit                                                                                                                                                                          | U3         | pending |          |

## Shared-file rule

| File                                     | Why it collides                          | Owner                               |
| ---------------------------------------- | ---------------------------------------- | ----------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json` | U1 adds `types`; the version is nobody's | U1 (`types`)                        |
| every human-facing doc                   | docs ship with the change                | U3 only                             |
| `.claude-plugin/marketplace.json`        | generated                                | none — no field it projects changes |

## Waves

- Wave 1 — U1 alone: the module, the contract and the wiring.
- Wave 2 — U2 alone: the review of U1's code.
- Wave 3 — U3 alone: the docs, after the review settled the code.
- Wave 4 — U4 alone: the final gate.

## Wave gate

```text
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

- `claude plugin test plugins/vwf` — green, 5 tests, after U1 and again in U4.
- `claude plugin validate --strict plugins/vwf` — green (also inside
  `p:plugins:check`), after U1 and in U4.
- The live pane cannot be proved by a diff. The final report lists these checks
  for the user to do by hand:
  1. In the bootstrap project, run
     `/plugin uninstall vwf-monitor@vwf-monitor-dev` and
     `/plugin marketplace remove vwf-monitor-dev`.
  2. Restart a session, so that it loads the vwf that `p:plugins:local` staged.
  3. Run `/vwf:execute` on a plan, and make sure that the pane opens, that the
     mempalace auto-save hooks still run, and that `/vwf-monitor close` closes
     the pane.

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

- A status block for the other vwf skills (`plan`, `blueprint`, `setup` and the
  others) — the rest of B101, parked.
- A CI gate with the `claude` CLI — CI has no `claude`, and the user declined to
  add it.
- Changes to `vwf:execute` — no new Run log column or signal; the pane reads the
  files and the agent events as they are.
- Feature changes to the mod — the plan moves the tested prototype.
- This repo's own `.config/` — the user edits it by hand.
- The prototype in the dev-mods folder and its install in the bootstrap project
  — the user removes them by hand after landing.

## Parked

- B101: a status block for the other vwf skills (`plan`, `blueprint`, `setup`
  and the others), with their agents in a disclosure widget.
- Add `claude plugin test plugins/vwf` to `p:plugins:check` — a by-hand edit in
  this repo's `.config/`.
- In `all` mode, show the plans that ran before the current one; the state keeps
  them, the pane does not draw them.
- Show unit titles in the unit rows — the Units table has no title column.
- A `Started` column or signal in the Run log, so that a unit that started
  before the pane loaded has a start time.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                         | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight | —     | 1     | green       | doctor blocking checks: mise, graphify CLI, graph in main checkout, claude 2.1.306 present; wave gate 5/5 green; format check skipped (no `covers:`); stack conventions skipped (no `code` unit); order U1 → U2 → U3 → U4                                                                                                      |          |
| 1    | U1        | opus  | 1     | green       | 8 files changed; DECIDED: hooks.json hooks block gains only the trailing comma JSON needs before `modules`; GAP: none; plugin test 5 pass, validate --strict pass (warnings: missing icon, gating hook without .catch, both from the prototype)                                                                                | c570b395 |
| 1    | R1        | opus  | 1     | pass        | FINDINGS: 0; CONTRACT: clean; RULINGS: clean                                                                                                                                                                                                                                                                                   |          |
| 1    | gate      | —     | 1     | green       | wave gate 5/5 green; `claude plugin test plugins/vwf` 5 pass                                                                                                                                                                                                                                                                   |          |
| 2    | U2        | opus  | 1     | findings(1) | security, range 52100f5a..481816ee, 8 files → U1: [low] register.tsx:537 plan text rendered without stripping ANSI/OSC escapes (needs a hostile cloned repo; no code execution); VERDICT approve                                                                                                                               |          |
| 2    | U2        | opus  | 1     | findings(2) | review, range 52100f5a..481816ee: [high] register.tsx:517 dprint at commit turned five spacers into empty Text and cut the hint indent (:526,569,604,609,535), breaks decision 6; [low] engine findings 2–9 carried over from the prototype unchanged, out of scope under decision 6; API COMPAT n/a; VERDICT changes-required |          |
| 2    | U1        | opus  | 2     | green       | fix from U2 round 1: spacers as {" "} and hint as a string expression (survive dprint); plan.ts parseIndex strips C0/C1 controls except \n and \t, + 1 test; plugin test 6 pass, validate pass                                                                                                                                 |          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-21-execute-monitor-in-vwf

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
