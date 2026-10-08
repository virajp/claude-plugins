---
type: vwf-change-plan
title: TypeScript ux-gate renders
requires: [ docs/plans/2026-10-08-execute-renders-served-at-a-url ]
backlog: [ B91 ]
backlog_pieces: []
---

# Plan — TypeScript ux-gate renders (2026-10-08)

## Status

**COMPLETE**

COMPLETE 2026-10-09 — c7445ad1, fac55c3f, 2d70d9b4

## Consent

| Action                                            | Granted                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                     |
| After landing: `mise run p:plugins:local`         | run                                                                     |
| Release stackgen publicly                         | none — bump `3.0.0` → `3.1.0` (minor) by editing `plugin.json`, no tag  |
| Release vwf publicly                              | none — vwf is not changed here; B91 is released by hand with `/release` |
| Release site publicly                             | none                                                                    |
| End an `all` run after landing                    | no                                                                      |

U3 does the stackgen bump: it edits
`plugins/stackgen/.claude-plugin/plugin.json`, then runs
`mise run p:plugins:marketplace`. No tag: the user cuts vwf and stackgen by hand
with `/release` once B91 is complete.

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. `p:plugins:local` stages the changed plugins into the dev
marketplace; only a **restarted** session gets them.

## Goal

The TypeScript `ux-gate` names each browser capture `<code>--<state>.png` and
returns the `renders:` list that plan 2a defines, so `/vwf:execute` keeps the
renders of the built app for each web project and `/vwf:mockups renders` serves
them.

This is plan 2b of 3 for backlog item B91 ("Mockups and visual review are served
from an HTTP endpoint"), and it finishes B91. The Flutter and SwiftUI gates are
not changed: the user ruled on 2026-10-08 to remove the golden image process,
and that work is backlog item B94, which also covers how those two stacks give
renders. No reversal.

## Facts the survey established

- **Plan 2a lands first** (this plan requires it). After it, the `ux-gate`
  contract in `plugins/vwf/assets/stack-adapter.md` (*The UX gate*) has an
  optional `renders:` list, one item for each image:
  `{ code, platform, state, file }`; `code` is the Screens-table code, `state`
  is `default` or a pinned state, `file` is a path inside the worktree. The
  reviewer relays it, and `renders.mjs` copies each file to
  `docs/scratchpad/<project>/renders/<platform>/<route>/`. A gate with no list
  keeps no images.
- **The TypeScript gate.**
  `plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md`. Inputs
  (lines 21-27): the slice, the changed screens, the design-system path, the
  flow's Screens contract. What to do (lines 29-43): boot with `dev`, capture
  each changed screen in every reachable state (lines 34-38: "Write captures
  under the worktree's scratch/tmp area"), scan WCAG A/AA, return. Return
  contract (lines 44-55): `rendered`, `reason`, `artifacts: [ <path>, … ]` (line
  49), `findings`. No file name rule exists today.
- **The Screens table.**
  `Code | Screen | Route | … | States (loading/error/empty) | …`
  (`plugins/vwf/assets/templates/flow-platform.md:36`); a code is
  `<NNN><letter>`, the same on every platform. The table lives in
  `docs/blueprint/flows/<project>/<NNN>-<flow>/<platform>.md`; for a TypeScript
  web project the platform is `site` or `webapp`.
- **`docs/scratchpad/` is gitignored** by the tool-config `.gitignore` asset
  (`plugins/stackgen/skills/tool-config/assets/.gitignore:97`).
- **Rule 13.** The gate lands verbatim in a user repo, so it cites no
  plugin-relative path
  (`.claude/skills/plugin-authoring/references/checks.md:241-262`).
- **The pack and its pins.**
  `plugins/stackgen/stacks/language/typescript/pack.yaml:4` is `version: 0.3.1`.
  Thirteen bundles pin `language/typescript@0.3.1`: `astro-csr`, `astro-hybrid`,
  `astro-ssg`, `astro-ssr`, `html`, `typescript-cloudflare-agents`,
  `typescript-effect`, `typescript-effect-cli`, `typescript-effect-hono`,
  `typescript-effect-temporal`, `typescript-hono-refine`,
  `typescript-parseargs-cli`, `typescript-pulumi` (each
  `plugins/stackgen/stacks/bundles/<name>.md`). `mise run p:plugins:inventory`
  regenerates `plugins/stackgen/stacks/inventory.md` and fails a bundle whose
  pin names a version the pack no longer carries
  (`scripts/src/inventory.ts:303-338`); so the pack, the 13 pins and the
  inventory change in one commit.
- **stackgen** is `3.0.0` (`plugins/stackgen/.claude-plugin/plugin.json:4`).
- **Docs that name the TypeScript gate:**
  `site/src/content/docs/plugins/stackgen.md` (the `ux-gate` passages,
  `:320-327` for SwiftUI and the TypeScript pack section),
  `site/src/content/docs/plugins/vwf.md:2635` (after plan 2a). U2 runs
  `vwf:docs-sync` over the delta for the rest.
- **Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`.

## Assumed decisions — confirm or override at review

| #  | Decision      | Ruling                                                                                                                                                                                                                                                                    | Rejected                   | Unit   |
| -- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------ |
| F1 | Scope         | Only the TypeScript `ux-gate`. Flutter and SwiftUI return no `renders:` list; B94 covers them.                                                                                                                                                                            | All three gates            | U1, U2 |
| F2 | Capture names | The gate writes each capture to `docs/scratchpad/ux-gate/<platform>/<code>--<state>.png` in the worktree, `state` `default` for the default view. It reads each changed screen's code from the Screens contract it gets, and the states from that screen's pinned States. | A free name; a tmp path    | U1     |
| F3 | Return        | The gate returns `renders: [ { code, platform, state, file } ]`, one item for each capture, `file` the path relative to the worktree root. `renders:` replaces the `artifacts:` key; the reviewer reads the captures from it.                                             | Keep both keys             | U1     |
| F4 | Bump          | `language/typescript` `0.3.1` → `0.4.0` (minor), the 13 bundle pins, and `inventory.md`, in one commit; stackgen `3.0.0` → `3.1.0` (minor).                                                                                                                               | Patch                      | U3     |
| F5 | Review row    | None: the change is a markdown skill, not runnable code. The wave review is the check.                                                                                                                                                                                    | A review row               | —      |
| F6 | Release       | No release. The user cuts vwf and stackgen by hand with `/release`.                                                                                                                                                                                                       | `/release` as a `run` step | U3     |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                  | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-ux-gate.md](01-ux-gate.md)               | edit | `plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md`                                                                                                                                                                                                 | —          | green  | c7445ad1 |
| U2 | 2    | [02-docs.md](02-docs.md)                     | edit | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `readme.md`, `CLAUDE.md`, and any other human-facing passage `vwf:docs-sync` finds outside `plugins/`; widened: `plugins/vwf/agents/execute-ux-reviewer.md:108` (R1) | U1         | green  | fac55c3f |
| U3 | 3    | [03-gates-and-bump.md](03-gates-and-bump.md) | edit | `plugins/stackgen/stacks/language/typescript/pack.yaml`, the 13 bundle files named in Facts, `plugins/stackgen/stacks/inventory.md`, `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                 | U2         | green  | 2d70d9b4 |

## Shared-file rule

| File                                                                 | Why it collides | Owner |
| -------------------------------------------------------------------- | --------------- | ----- |
| `plugins/stackgen/stacks/language/typescript/pack.yaml`, the bundles | version pins    | U3    |
| `plugins/stackgen/stacks/inventory.md`                               | generated       | U3    |
| `plugins/stackgen/.claude-plugin/plugin.json`                        | version file    | U3    |
| `.claude-plugin/marketplace.json`                                    | generated       | U3    |

## Waves

- **Wave 1 — U1.** The gate.
- **Wave 2 — U2.** The docs, over the branch delta.
- **Wave 3 — U3.** The pack bump, the pins, the inventory, the stackgen bump,
  then the full gate.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                      |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages the changed plugins into the dev marketplace; a **restarted** session picks them up |

## Gates the orchestrator keeps

- **The contract agrees.**
  `grep -n 'renders:' plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md`
  names the F3 item shape, and the same four keys appear in the `renders:` key
  of `plugins/vwf/assets/stack-adapter.md`. Pass: the four keys match.
- **No pin is left behind.**
  `grep -rn 'language/typescript@0.3.1' plugins/stackgen/stacks` — no hit.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits — save U3, whose ruling is the bump and the generators. A unit
deletes with plain `rm`, never `git rm` — it stages nothing. A unit never runs
`git checkout`, `git restore`, or a formatter's `--fix` over any path outside
its Owns.

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

- **The Flutter and SwiftUI gates, and their golden image process.** Backlog
  item B94 (P0): remove the golden process and decide how those stacks give
  renders.
- **A release.** The user cuts vwf and stackgen by hand with `/release`.
- **The TypeScript pack's testing reference.** The gate captures by itself; the
  coder writes no capture test, so `skills/typescript/references/testing.md`
  does not change.

## Parked

none — B94 holds what remains for the device stacks.

## Run log

| Wave | Unit              | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                        | Commit   |
| ---- | ----------------- | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight         | —     | 1     | pass        | doctor: no blocking (no .config/vwf.yaml, stopped at §1); wave gate 7/7 green (code:precommit pass 2 clean after reflowing the Status edit)                                                                                                                                   | —        |
| 0    | override          | —     | 1     | pass        | override: skip as deduped: mise run p:plugins:local                                                                                                                                                                                                                           | —        |
| 0    | format-check      | —     | 1     | skipped     | why: no covers:, plan reads no blueprint artifact                                                                                                                                                                                                                             | —        |
| 0    | conventions       | —     | 1     | skipped     | why: no code unit; LSP and conventions fetch not needed                                                                                                                                                                                                                       | —        |
| 1    | U1 ux-gate        | opus  | 1     | pass        | edit; captures named docs/scratchpad/ux-gate/<platform>/<code>--<state>.png, renders: replaces artifacts:; DECIDED PNG + worktree-root-relative file; GAP example code 004a assumed                                                                                           | c7445ad1 |
| 1    | R1 wave review    | opus  | 1     | findings(1) | rule 5 only: plugins/vwf/agents/execute-ux-reviewer.md:108 'scratch/tmp area' stale vs docs/scratchpad/ux-gate path; nobody-owned, handed to U2 as DOCS FALSIFIED; CONTRACT clean, RULINGS clean                                                                              | —        |
| 1    | U2 docs           | —     | —     | —           | GAP: Owns widened to plugins/vwf/agents/execute-ux-reviewer.md:108 (that passage) per R1 rule-5 finding                                                                                                                                                                       | —        |
| 2    | U2 docs           | opus  | 1     | pass        | edit; stackgen.md TS ux-gate paragraph + SwiftUI clause, vwf.md renders sentence, execute-ux-reviewer.md:108 -> gitignored docs/scratchpad/; DECIDED no backlog id in manual; GAP no TS gate passage existed, one added; DOCS FALSIFIED execute-ux-reviewer.md:51 'artifacts' | fac55c3f |
| 2    | R2 wave review    | opus  | 1     | pass        | FINDINGS 0; CONTRACT clean; RULINGS clean; execute-ux-reviewer.md:51 judged not falsified (plain noun, flutter gate still returns artifacts:)                                                                                                                                 | —        |
| —    | acceptance        | —     | 1     | skipped     | why: no covers:, no acceptance criteria                                                                                                                                                                                                                                       | —        |
| —    | ux                | —     | 1     | skipped     | why: no covers:, no Screens contract                                                                                                                                                                                                                                          | —        |
| —    | reconcile         | —     | 1     | skipped     | why: no covers: (no stamps), no code unit (nothing to persist)                                                                                                                                                                                                                | —        |
| 3    | U3 gates-and-bump | opus  | 1     | pass        | edit; typescript pack 0.3.1->0.4.0, 13 bundle pins, inventory regenerated, stackgen 3.0.0->3.1.0, marketplace regenerated; gate lines green                                                                                                                                   | 2d70d9b4 |
| 3    | R3 wave review    | opus  | 1     | pass        | FINDINGS 0; CONTRACT clean; RULINGS clean; generators --check up to date                                                                                                                                                                                                      | —        |
| —    | reconcile         | —     | 1     | pass        | final wave gate 7/7 green over the finished tree                                                                                                                                                                                                                              | —        |
| —    | reconcile         | —     | 1     | pass        | orchestrator gates: renders: keys {code, platform, state, file} match stack-adapter.md:442; no language/typescript@0.3.1 pin left                                                                                                                                             | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-08-typescript-ux-gate-renders

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
