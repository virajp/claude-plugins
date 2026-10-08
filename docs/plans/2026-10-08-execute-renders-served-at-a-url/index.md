---
type: vwf-change-plan
title: Execute renders served at a URL
requires: [ docs/plans/2026-10-08-mockups-served-at-a-url ]
backlog: []
backlog_pieces: [ B91 ]
---

# Plan — Execute renders served at a URL (2026-10-08)

## Status

**RUNNING**

RUNNING since 2026-10-08T18:27Z in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-10-08-execute-renders-served-at-a-url

## Consent

| Action                                            | Granted                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                      |
| After landing: `mise run p:plugins:local`         | run                                                                      |
| Release vwf publicly                              | none — bump `21.1.0` → `21.2.0` (minor) by editing `plugin.json`, no tag |
| Release site publicly                             | none                                                                     |
| End an `all` run after landing                    | no                                                                       |

U6 does the vwf bump: it edits `plugins/vwf/.claude-plugin/plugin.json`, then
runs `mise run p:plugins:marketplace`. The public tag waits for plan 2b (the
stackgen `ux-gate` payloads), so B91 ships as one release, cut by hand.

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. `p:plugins:local` stages vwf into the dev marketplace; only a
**restarted** session gets it.

## Goal

After a `/vwf:execute` run, the renders of the built app from its UX stage are
kept in `docs/scratchpad/<project>/renders/<platform>/<route>/` of the main
checkout. `/vwf:mockups renders` serves them at a local URL for each platform,
together with the mockups, and the comments go to `/vwf:feedback`. Execute stays
unattended: it asks nothing, and its final report names the review command.

This is plan 2a of 3 for backlog item B91 ("Mockups and visual review are served
from an HTTP endpoint"). Plan 1 (`2026-10-08-mockups-served-at-a-url`) serves
the mockups; plan 2b makes the three stackgen `ux-gate` payloads return the list
this plan defines. No reversal: the `ux-gate` contract gets one optional key,
and a gate without it works as before.

**Mockups and renders are two things.** A mockup is static HTML of the Screens
contract, made before any code. A render is an image of the built app, made by
the repo's `ux-gate` skill in the execute UX stage. This plan is about renders.

## Facts the survey established

- **Plan 1 lands first** (this plan requires it). After it, the mockups are at
  `docs/scratchpad/<project>/mockups/<platform>/<route>/index.html` and
  `index--<state>.html`; `plugins/vwf/skills/mockups/scripts/` holds
  `serve.mjs`, `routes.mjs`, `links.mjs` and `lib/routes.mjs`; `routes.mjs`
  writes `__mockups/routes.json`
  (`{ project, platform, screens: [ { code, screen, slug, flow, route, path, routed } ] }`).
  Its D4-D7 route rules (`<route>/index.html`, `?state=`, `[param]` folders,
  `/<code>-<slug>` for no route) hold here too. Read plan 1's `index.md` for the
  exact rulings.
- **The UX gate contract.** `plugins/vwf/assets/stack-adapter.md:419-451`: the
  repo's own `ux-gate` skill returns `rendered: ok | n/a`, `reason`, and
  `findings: [ { severity, screen, what, where } ]` (lines 437-441). No key
  names the render files.
- **The reviewer.** `plugins/vwf/agents/execute-ux-reviewer.md`: tools Read,
  Bash, Grep, Glob and mempalace (lines 8-12) — no Write. It invokes the gate
  (lines 33-53), and its return block (lines 126-146) has `FINDINGS`,
  `RENDERED`, `A11Y`, `SPEC GAPS`, `VERDICT`, `RECALL`, `GAPS`. Its renders are
  working files in the worktree (lines 104-105).
- **The ux stage.** `plugins/vwf/assets/execute-stages.md:61-66` (when it runs)
  and `:149-165` (the dispatch). It runs once, after acceptance, only on a plan
  with `covers:` that changes screens on a screen platform. Its findings loop
  back to `code` for a maximum of 4 rounds
  (`plugins/vwf/skills/execute/references/acceptance-and-ux.md:8-15`).
- **Execute.** `plugins/vwf/skills/execute/SKILL.md`: Acceptance & UX at line
  689, the final report at line 758, Land at line 799 (a `yes` landing removes
  the worktree), After landing at line 890. Execute asks nothing at run time.
- **The three gates today** (plan 2b changes them, not this plan): TypeScript
  `plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md` returns
  `artifacts: [paths]` (lines 44-55); Flutter
  `plugins/stackgen/stacks/app-framework/flutter/skills/ux-gate/SKILL.md`
  returns `artifacts` (lines 50-59); SwiftUI
  `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md`
  returns none (lines 147-161), and its new renders are PNGs in
  `.build/snapshot-artifacts/`.
- **`/vwf:feedback`** (`plugins/vwf/skills/feedback/SKILL.md`) is
  model-invocable (`disable-model-invocation: false`, line 14) and routes a "UX
  issue" (line 93) to the screen's home flow (line 159).
- **The screen platforms:** `site`, `webapp`, `mobile`, `tablet`, `desktop`,
  `auto`, `watch`, `tv`, `spatial`.
- **Node scripts in skills.** Rule 16
  (`.claude/skills/plugin-authoring/references/checks.md:338-346`): an entry
  file directly under `scripts/` starts `#!/usr/bin/env node` and is executable;
  `scripts/lib/` modules need neither; `node:` built-ins and relative imports
  only; no `require(`.
- **Tests.** `vitest.config.mts` includes
  `{installer,scripts}/src/**/*.test.ts`; plan 1 adds
  `scripts/src/mockups-{serve,routes,links}.test.ts`.
- **Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`.
- **Version.** vwf is `21.1.0` after plan 1. The bump is a hand edit plus
  `mise run p:plugins:marketplace`.
- **Docs that describe the UX stage** (U5 owns them):
  `site/src/content/docs/plugins/vwf.md:2544` (ux stage row), `:2632`, `:2635`
  (Flutter "a code-level pass" — wrong: the Flutter gate runs golden tests),
  `:2715` (diagram), `:3587`;
  `site/src/content/docs/how-to/greenfield/ui-with-design-tool.md:221-234`;
  `.claude/skills/vwf-plugin/references/assets.md:25`,
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:74`.

## Assumed decisions — confirm or override at review

| #   | Decision       | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                                         | Unit       |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| E1  | Review time    | The person reviews the renders after the run. Execute asks nothing; its final report names `/vwf:mockups renders` when it copied renders.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Execute waits for Done; file paths in the report | U4         |
| E2  | Render tree    | `docs/scratchpad/<project>/renders/<platform>/<route>/index.png` and `index--<state>.png`, with plan 1's route rules (D4-D7). Latest set only: a run overwrites only the screens and states it rendered. `renders/<platform>/__renders/renders.json` records, for each image, `{ code, state, route, file, plan, date }`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | One set for each plan                            | U1, U2, U4 |
| E3  | Contract       | The `ux-gate` return can carry an optional `renders:` list, one item for each image: `{ code, platform, state, file }`. `file` is a path in the worktree; `state` is `default` or a pinned state. A gate with no list works as before.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | The gate writes the vwf tree                     | U3         |
| E4  | Reviewer relay | The reviewer returns one `RENDER: <code> <platform> <state> <file>` line for each `renders:` item of the gate's last call, in its return block, after `RENDERED:`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | The reviewer copies                              | U3         |
| E5  | Copy step      | After the last ux round, before the landing, the orchestrator runs `node ${CLAUDE_PLUGIN_ROOT}/skills/mockups/scripts/renders.mjs --worktree <worktree> --main <main checkout> --project <project> --plan <folder>` with the `RENDER:` lines on stdin. The script builds the route map from the worktree's `docs/blueprint/flows/<project>/*/<platform>.md` (plan 1's parse), copies each file into `<main>/docs/scratchpad/<project>/renders/<platform>/<path>/`, and updates `renders.json`. A `RENDER:` line for an unknown code or a missing file is one `SKIPPED:` stdout line; the rest are copied. stdout ends with one `COPIED: <n>` line.                                                                                                                                                                                  | Copy after each round                            | U1, U4     |
| E6  | No renders     | No `RENDER:` line, or `RENDERED: n/a`: the orchestrator runs no copy; a Run log row (`renders`, `skipped`, the reason) says so, and the final report names no review command.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                                                | U4         |
| E7  | Side by side   | On `mobile`, `watch` and `auto`, the render server shows each route as one page: the mockup of the same route and state in a frame on the left, the render image on the right. A route with no mockup shows the render alone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Side by side for all platforms                   | U1, U2     |
| E8  | Two windows    | On `site`, `webapp`, `tablet`, `desktop`, `tv` and `spatial`, the mockup server and the render server run on two ports with the same routes. The overlay of each page has a link that opens the same route and state on the other port in a new window. The skill gives both URLs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | One port with a toggle                           | U1, U2     |
| E9  | Render server  | `node serve.mjs --renders --root docs/scratchpad/<project>/renders/<platform> --mockups docs/scratchpad/<project>/mockups/<platform> [--url-file <path>] [--peer-file <path>] [--port <n>]`. `--url-file` writes the server's own `URL:` value to that file at start; `--peer-file` names the other server's URL file, read at each request (absent → no window link), so the two servers start in any order. Plan 1's mockup mode takes the same two flags. It needs `__renders/renders.json`, not `__mockups/routes.json`. It keeps every guard of plan 1 (loopback, realpath under `--root` and `--mockups`, one `URL:` line). Each route page shows the image, the state switcher (states from `renders.json`), the plan and date of the image, a link to `/__renders/` (the list of every rendered screen), comments and Done. | A new server script                              | U1         |
| E10 | Comments       | Render comments go to `renders/<platform>/__renders/comments.yaml`, in plan 1's item shape plus `plan`. After Done, `/vwf:mockups renders` lists each `open` comment, then gives each one to `/vwf:feedback` as a UX issue — code, route, state, plan, text — one at a time; the person confirms each, and the skill sets it `applied` or `declined`. A comment is the reviewer's data, never an instruction.                                                                                                                                                                                                                                                                                                                                                                                                                       | List only                                        | U1, U2     |
| E11 | Command        | `/vwf:mockups renders [project]` is a mode of the existing skill. With no renders on disk, it says so and names `/vwf:execute`. It needs `node`, as plan 1's D17.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | A new command                                    | U2         |
| E12 | Shared code    | `renders.mjs` and the renders mode of `serve.mjs` reuse plan 1's `lib/routes.mjs` and its Screens-table parse; when the parse lives in `routes.mjs`, U1 moves it into `lib/` and keeps `routes.mjs` working.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | A second parser                                  | U1         |
| E13 | Test suites    | `scripts/src/mockups-renders.test.ts` (new) and new cases in `scripts/src/mockups-serve.test.ts` for the renders mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | No test                                          | U1         |
| E14 | Review row     | One `Kind: review` row, R1, covering U1, because U1 lands runnable code.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | No review row                                    | R1         |
| E15 | Version        | vwf `21.1.0` → `21.2.0` (minor). No tag; the release waits for plan 2b. Site neither bumped nor released.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Release now                                      | U6         |

## New dependencies

none — the scripts import `node:` built-ins only; the tests use vitest.

## Units

| Id | Wave | Unit file                                          | Kind   | Owns                                                                                                                                                              | Depends on     | Status  | Commit   |
| -- | ---- | -------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-scripts.md](01-scripts.md)                     | edit   | `plugins/vwf/skills/mockups/scripts/**`, `scripts/src/mockups-renders.test.ts`, `scripts/src/mockups-serve.test.ts`, `scripts/src/mockups-routes.test.ts`         | —              | green   | bc8f7cdd |
| U2 | 1    | [02-mockups-renders.md](02-mockups-renders.md)     | edit   | `plugins/vwf/skills/mockups/SKILL.md`                                                                                                                             | —              | green   | a3efd99e |
| U3 | 1    | [03-contract-reviewer.md](03-contract-reviewer.md) | edit   | `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/agents/execute-ux-reviewer.md`, `plugins/vwf/assets/execute-stages.md`                                        | —              | green   | 7de7725e |
| U4 | 1    | [04-execute.md](04-execute.md)                     | edit   | `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/execute/references/acceptance-and-ux.md`                                                               | —              | green   | 6a0e87d4 |
| R1 | 2    | [05-review.md](05-review.md)                       | review | —                                                                                                                                                                 | U1             | pending |          |
| U5 | 3    | [06-docs.md](06-docs.md)                           | edit   | `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`, `readme.md`, `CLAUDE.md`, and any other human-facing passage `vwf:docs-sync` finds outside `plugins/` | U1, U2, U3, U4 | pending |          |
| U6 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)       | edit   | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                       | U5             | pending |          |

## Shared-file rule

| File                                                       | Why it collides   | Owner |
| ---------------------------------------------------------- | ----------------- | ----- |
| `plugins/vwf/.claude-plugin/plugin.json`                   | version file      | U6    |
| `.claude-plugin/marketplace.json`                          | generated         | U6    |
| `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**` | human-facing docs | U5    |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Disjoint paths. U2, U3 and U4 cite the CLIs, the
  line shapes and the tree from E2-E11; they do not read U1's output.
- **Wave 2 — R1.** Reviews U1's runnable code after its commit.
- **Wave 3 — U5.** The docs, over the whole branch delta.
- **Wave 4 — U6.** The bump and the generator, then the full gate.

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

| Step                       | Mode | Notes                                                                    |
| -------------------------- | ---- | ------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages vwf into the dev marketplace; a **restarted** session picks it up |

## Gates the orchestrator keeps

- **Live smoke run.** After U6, make two temp directories, `$w` (a worktree
  stand-in) and `$m` (a main-checkout stand-in). In `$w`, write
  `docs/blueprint/flows/demo/200-orders/mobile.md` and `.../web.md`, each with
  screens `200a` route `/orders` and `200b` route `/orders/:id`, and two PNG
  files. In `$m`, write
  `docs/scratchpad/demo/mockups/mobile/orders/[id]/index.html`.
  1. Pipe `RENDER: 200b mobile default <png>`,
     `RENDER: 200b mobile error <png>`, `RENDER: 200a web default <png>` and
     `RENDER: 999z mobile default <png>` into
     `renders.mjs --worktree $w --main $m --project demo --plan demo-plan`.
     Pass: `COPIED: 3`, one `SKIPPED:` line for `999z`, the files at
     `renders/mobile/orders/[id]/index.png`, `index--error.png` and
     `renders/web/orders/index.png`, and `renders.json` with the plan name.
  2. From `$m`, run the render server for `mobile` with `--mockups`; `curl`
     `/orders/7` and `/orders/7?state=error`. Pass: each page names the mockup
     frame and the image; the image URL is 200 with `image/png`.
  3. Run the render server for `web` with `--peer-file` naming a file that holds
     `http://127.0.0.1:9/`; `curl` `/orders`. Pass: the page links
     `http://127.0.0.1:9/orders` in a new window; `/../../../etc/passwd` is 404;
     `POST /comment` writes one `status: open` item with `plan: demo-plan`;
     `POST /done` exits 0.
- **Rule 16 holds.** `renders.mjs` is executable (`test -x`) and starts with
  `#!/usr/bin/env node`. Pass: true, and `p:plugins:check` green.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore`, or a formatter's
`--fix` over any path outside its Owns.

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

- **The stackgen `ux-gate` payloads.** Plan 2b makes them return `renders:`.
- **`/vwf:verify`** gets no UX review; it has none today.
- **An xcresult export.** The SwiftUI PNGs in `.build/snapshot-artifacts/` are
  enough.
- **B37 — commit approved mockups** and **a hosted preview**, as in plan 1.
- **Execute waits for a person.** Rejected (E1): execute asks nothing.

## Parked

- B91: plan 2b (stackgen) — `docs/plans/2026-10-08-typescript-ux-gate-renders`:
  the TypeScript `ux-gate` names its captures `<code>--<state>.png` and returns
  the E3 `renders:` list; the pack bumps, with its 13 bundle pins and
  `inventory.md`. Requires this folder; finishes B91. The Flutter and SwiftUI
  gates (golden images) are backlog item B94; until it lands, they return no
  `renders:` list and keep no images.
- `.claude/skills/vwf-plugin/references/docs-tree.md:71-75` — the stale claim
  that vwf auto-adds the scratchpad `.gitignore` line (parked by plan 1).

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Commit |
| ---- | --------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight | —     | —     | green       | runner mode under `/vwf:execute all`; claim 554a7d40; doctor: 0 blocking (repo not onboarded, no `.config/vwf.yaml` — no LSP finding); 7 wave gate lines green (`code:precommit` second pass; the first reflowed the Status line); format check skipped — no `covers:`; stack conventions skipped — no `code` unit                                                                                                                                                                          | —      |
| 0    | override  | —     | —     | green       | override: skip as deduped: mise run p:plugins:local                                                                                                                                                                                                                                                                                                                                                                                                                                         | —      |
| 1    | U3        | opus  | 1     | green       | `renders:` key in the UX gate contract, `RENDER:` relay in the ux reviewer, ux stage sentence; DECIDED: cite execute by section name; GAP: `p:plugins:check` red mid-wave on U4's citation of U1's not-yet-written `renders.mjs` — assumed to clear when U1 lands                                                                                                                                                                                                                           |        |
| 1    | U4        | opus  | 1     | green       | "Keep the renders" paragraph in Acceptance & UX (E5 copy, `renders` Run log row, E6 skip, non-zero exit a gap), final-report line, asks-nothing clause; acceptance-and-ux bullet; DECIDED: one `renders.mjs` run per project reviewed, command in a fenced block; GAP: same mid-wave `p:plugins:check` finding as U3                                                                                                                                                                        |        |
| 1    | U2        | opus  | 1     | green       | `argument-hint` names `renders [project]`; Renders mode section (node check, find `renders.json`, E7/E8 servers, URLs, wait, `server.url` cleanup, comments to `/vwf:feedback` one at a time); Doc Paths row; DECIDED: mode before Halt Conditions, runs alone; cites the `__mockups/` item shape, not plan 1; GAP: render server always gets `--mockups`, assumed U1 accepts a missing mockups dir; GAP: same mid-wave `p:plugins:check` finding                                           |        |
| 1    | U1        | opus  | 1     | green       | `renders.mjs` (E5), `lib/screens.mjs` (parse moved, E12), `routes.mjs` on it, `lib/routes.mjs` reserves `__renders`, `serve.mjs` `--renders`/`--mockups`/`--url-file`/`--peer-file`; 5 + 11 test cases; DECIDED: URL file written before the `URL:` line; `plan` stored as basename; `.png` only; frame under `/__mockups/<route>`; "no render yet" page; `routes.mjs` refuses `/__renders`; GAP: `--mockups` made optional, a missing path means no mockups (smoke step 3 runs without it) |        |
| 1    | R1-wave   | opus  | 1     | findings(2) | `mockups/SKILL.md:46` [U2] rule 5 — Scripts row omits `renders.mjs` and the `--renders` mode; `mockups/SKILL.md:45` [U2] rule 4 — Render tree row unpadded; CONTRACT clean, RULINGS clean; cross-unit shapes agree                                                                                                                                                                                                                                                                          |        |
| 1    | U2        | opus  | 2     | green       | fixed R1-wave findings: Scripts row names `renders.mjs` and the `--renders` mode; Doc Paths table re-padded by hand; `p:plugins:check` green                                                                                                                                                                                                                                                                                                                                                |        |
| 1    | R1-wave   | opus  | 2     | pass        | both round-1 findings resolved; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                               |        |
| 1    | gate      | —     | —     | red         | `code:precommit` red on `renders.mjs:182:7` no-useless-assignment (`map`), attributed to U1 (Owns); other 6 lines green                                                                                                                                                                                                                                                                                                                                                                     |        |
| 1    | U1        | opus  | 2     | green       | gate fix: `renders.mjs:182` `let map;` (no-useless-assignment), behaviour unchanged; mockups suites 57/57                                                                                                                                                                                                                                                                                                                                                                                   |        |
| 1    | gate      | —     | —     | green       | 7/7 wave gate lines green after the U1 fix (`code:precommit` second pass; first reflowed); commits U1 bc8f7cdd, U2 a3efd99e, U3 7de7725e, U4 6a0e87d4                                                                                                                                                                                                                                                                                                                                       |        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-08-execute-renders-served-at-a-url

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
