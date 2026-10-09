---
type: vwf-change-plan
title: Web canvas layout
requires: []
backlog: [ B59 ]
backlog_pieces: []
---

# Plan — Web canvas layout (2026-10-09)

## Status

**APPROVED**

APPROVED 2026-10-09 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | no      |

**The mode recorded here is the consent.** The plan has no after-landing step of
its own. `.config/vwf.yaml`'s `after_landing:` runs `mise run p:plugins:local`
after every green landing, and a restarted session loads the staged vwf.

## Release levels

| Project | Level | Reason                                                                              |
| ------- | ----- | ----------------------------------------------------------------------------------- |
| vwf     | MINOR | The `site` and `webapp` canvas layouts are new behaviour of `/vwf:screens prompt`.  |
| site    | PATCH | The manual's canvas conventions passage is corrected to agree with the new layouts. |

## Goal

After this plan lands, every platform with a canvas has a correct Layout block
in `canvas-claude.md`. `site` and `webapp` get a browser-frame block, and
`desktop` describes a native app window, not a browser. The plan finishes B59.
It contains no reversal: the desktop fix makes the template agree with the
definition of `desktop` in `standard-flows.md`.

## Facts the survey established

- `plugins/vwf/assets/templates/canvas-claude.md` — `## Layout` starts at :46
  and ends before `## Behavior conventions` (~:91). An HTML comment at :48-51
  tells the generator to keep only this platform's block and to write the
  `design.viewports` size into it. Blocks exist for mobile (:53-55), tablet
  (:56-58), desktop (:59-61), auto (:62-69), watch (:70-76), tv (:77-83) and
  spatial (:84-90). No block exists for `site`, `webapp` or `cli`.
- The desktop block (:59-61) says: "every screen renders at a **1440×900**
  viewport in a browser-chrome frame, toggleable via the `frame` tweak (default
  on)".
- The page naming contract (`canvas-claude.md` ~~:33-43) names each frame by its
  screen code and says state variations are tweaks, "never as extra frames or
  pages". The standing tweak set (~~:96-98) is `darkMode`, `frame`, one tweak
  per sad state and one per conditional product state.
- `plugins/vwf/assets/standard-flows.md` ~~:150-175 is the platform vocabulary.
  `desktop` is a "Natively installed desktop application" (~~:161), a device
  token. `site` is a browser-delivered content surface and `webapp` a
  browser-delivered application (~:104-109, ~:171-175). `cli` has no canvas.
- `plugins/vwf/skills/screens/references/prompt-mode.md:16-22` lists the device
  frame for each platform. Line ~~19 describes desktop as "a browser-chrome
  frame". It has no `site` or `webapp` entry. Step 3 (~~:83-88) regenerates
  `CLAUDE--<platform>.md` from the template and keeps only the matching Layout
  block.
- `plugins/vwf/skills/screens/references/import-mode.md:30-41` flags a frame not
  named by a pinned code as a delta, and checks the `frame` tweak against the
  resolved viewport of the platform.
- `plugins/vwf/assets/vwf-config.md:142-144` and
  `plugins/vwf/skills/doctor/references/stack-checks.md:269-279` limit
  `design.viewports` to the device tokens: "never `site`, `webapp` or `cli`".
  This plan keeps that rule.
- No file in vwf gives a viewport for `site` or `webapp`.
- `site/src/content/docs/plugins/vwf.md` ~~:2319-2363 describes the conventions
  file and lists the default viewports for the 7 device tokens (~~:2330). It
  does not name `site` or `webapp`. `vwf.md:2074` already says desktop is "a
  natively installed app".
- No in-flight plan in `docs/plans/` owns any file this plan edits. B58's canvas
  frame-size piece has no folder.
- Commit types allowed by `.config/git-conventional-commits.yaml`: `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`. No scopes.
- `plugins/**/*.md` is not dprint-formatted: match the fold width of the
  surrounding text by hand. `site/` docs are covered by `p:site:check`.

## Assumed decisions — confirm or override at review

| # | Decision                       | Ruling                                                                                                                                                                                                                                                    | Rejected                                                                                                                                      | Unit |
| - | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1 | The `site` and `webapp` frames | Every screen renders at 1440×900 in a desktop browser-chrome frame. A `width` tweak (1440 \| 390, default 1440) switches it to 390×844 in a mobile browser frame with a status bar and an address bar. The `frame` tweak toggles the chrome (default on). | One desktop frame only — it does not show the responsive layout. Extend `design.viewports` to the web tokens — changes vwf-config and doctor. | U1   |
| 2 | One frame for each code        | Each screen code keeps one frame. The narrow layout is the `width` tweak, not a second frame. This follows the rule "variants are tweaks, never extra frames".                                                                                            | Frames named `<code>@1440` and `<code>@390` — the import payload shape changes and stackgen's import skill needs edits.                       | U1   |
| 3 | What import diffs              | Import diffs the default (1440) layout of `site` and `webapp` frames. It does not diff the 390 tweak.                                                                                                                                                     | Diff both widths — needs a width field in the payload.                                                                                        | U1   |
| 4 | The `desktop` frame            | Every screen renders at 1440×900 in a neutral native app window frame: a title bar with window controls, no address bar and no tabs. The `frame` tweak toggles it (default on).                                                                           | A macOS window — wrong for Windows and Linux. Window chrome that follows the pinned stack — that is B58's OS fidelity.                        | U1   |
| 5 | `prompt-mode.md` agrees        | `prompt-mode.md:16-22` gets the same desktop correction and adds `site` and `webapp` lines.                                                                                                                                                               | Leave it — two sources then disagree.                                                                                                         | U1   |
| 6 | `design.viewports` scope       | `design.viewports` stays limited to the device tokens. The `site` and `webapp` sizes are fixed.                                                                                                                                                           | Accept the web tokens — out of scope.                                                                                                         | U1   |
| 7 | No review row                  | The plan changes Markdown only and lands no runnable code, so the wave review is the only check.                                                                                                                                                          | A `Kind: review` row — nothing executes.                                                                                                      | —    |
| 8 | Decision record                | The docs unit writes `docs/memory/decisions/2026-10-09-web-canvas-layout.md` with rulings 1 to 6.                                                                                                                                                         | No record — the next canvas plan re-opens the rulings.                                                                                        | U2   |

## New dependencies

none

## Units

| Id | Wave | Unit file                    | Kind | Owns                                                                                                                                                            | Depends on | Status  | Commit |
| -- | ---- | ---------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-layout.md](01-layout.md) | edit | `plugins/vwf/assets/templates/canvas-claude.md`, `plugins/vwf/skills/screens/references/prompt-mode.md`, `plugins/vwf/skills/screens/references/import-mode.md` | —          | pending |        |
| U2 | 2    | [02-docs.md](02-docs.md)     | edit | `site/src/content/docs/plugins/vwf.md`, `docs/memory/decisions/2026-10-09-web-canvas-layout.md`                                                                 | U1         | pending |        |
| U3 | 3    | [03-gates.md](03-gates.md)   | edit | `.claude-plugin/marketplace.json` (generated; regenerated only)                                                                                                 | U2         | pending |        |

## Shared-file rule

| File                                                    | Why it collides                        | Owner           |
| ------------------------------------------------------- | -------------------------------------- | --------------- |
| `.claude-plugin/marketplace.json`                       | generated; regenerating mid-wave races | gates unit only |
| `site/src/content/docs/plugins/vwf.md`                  | human-facing doc                       | docs unit only  |
| `docs/memory/decisions/2026-10-09-web-canvas-layout.md` | decision record                        | docs unit only  |
| `plugins/vwf/.claude-plugin/plugin.json`                | version file                           | nobody          |

## Waves

- Wave 1: U1 alone. It edits the three vwf files.
- Wave 2: U2 (docs). It runs after U1 so its delta is complete.
- Wave 3: U3 (gates). It runs the full gate.

## Wave gate

- `mise run p:plugins:check`
- `mise run p:plugins:marketplace -- --check`
- `mise run p:site:check`

The wave review runs after each wave, and every report is read for
`UNRESOLVED:`. No line here depends on a unit.

## After landing

none — `.config/vwf.yaml`'s `after_landing:` already runs
`mise run p:plugins:local` after every green landing.

## Gates the orchestrator keeps

None beyond the wave gate. The template is read by `/vwf:screens prompt`, and no
run can render a canvas.

## Unit contract

Every unit prompt carries its ruling quoted from this file, its owned paths and
"touch nothing outside this list", the facts section, the shared-file rule and
the return block. A unit never bumps a version, never runs a generator, never
edits a doc outside its own Owns, never adds a dependency, and never commits. A
unit deletes with plain `rm`, never `git rm`.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Many canvas frame sizes for each platform, and OS-specific window or device
  chrome — B58's parked piece.
- `cli` — it has no screens and no canvas.
- Other vwf text that describes `desktop` — the survey found only
  `prompt-mode.md` with the browser-chrome defect, and U1 owns it.
- `design.viewports` for `site` and `webapp` (decision 6).
- The import payload shape and stackgen's `design-import-screens` skill
  (decision 2).

## Parked

none

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-09-web-canvas-layout

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
