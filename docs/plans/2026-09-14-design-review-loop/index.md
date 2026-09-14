---
type: vwf-change-plan
title: design review loop — screens in the canvas, a review server from the
  repo, comments applied in session
requires:
  - docs/plans/archived/2026-09-14-terminal-design-tool
backlog: [ B11 ]
---

# Plan — design review loop — screens in the canvas, a review server from the repo, comments applied in session (2026-09-14)

## Status

**APPROVED** 2026-09-14 by the user, after self-review.

## Consent

| Action                                            | Granted                                                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                           |
| After landing: `/release`                         | ask                                                                                                                                                                           |
| Release stackgen publicly                         | minor — `plugins/stackgen/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U4 runs, never a 13 or 17 component; by editing the `version` field |
| Release the pack                                  | `0.2.0` — `design-tool/claude-code`, re-pinned by its bundle, `mise run p:plugins:inventory`; by U2's commit                                                                  |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U4 runs it first)                                                                  |
| Release vwf publicly                              | none — untouched                                                                                                                                                              |
| Release installer publicly                        | none — untouched                                                                                                                                                              |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

A product that pins `claude-code` as its design tool designs a flow's screens in
session into the committed canvas, opens them in a browser served from the repo,
clicks an element and leaves a comment, presses Done, and watches the session
apply those comments to the screens. `design-import-screens` reads the canvas so
`/vwf:screens import <flow>` diffs it against the contract as it would any
tool's, and `design-import-conversations` returns the open comments so
`/vwf:feedback canvas` routes them. vwf is not touched.

This is the second of two plans for backlog item B11; it requires
`2026-09-14-terminal-design-tool`, which shipped the pack, the canvas, the
design system and the logo. No standing decision is reversed: vwf's own
`/vwf:mockups` keeps rendering the **contract** into the scratchpad; the canvas
holds the **design**, and the two are different things read by different steps.

## Facts the survey established

**Nothing serves anything today.** No webserver, no port binding, no static
server in any vwf skill, agent, hook or stackgen pack. The one serve-URL concept
in vwf is a design-tool field and is suppressed
(`plugins/vwf/skills/screens/references/import-mode.md:28`, "Never surface
`serve_url`"). `plugins/vwf/agents/mockup-generator.md` has
`tools: Read, Write, Grep, Glob` (`:8`) — no Bash — and emits self-contained
HTML with inline style and **no JS** (`:51`); it renders the blueprint's Screens
contract into `docs/scratchpad/<project>/<NNN>-<flow>/<platform>/`
(`plugins/vwf/skills/mockups/SKILL.md:42`), gitignored and never pushed to a
tool (`:16-33`). Untouched here.

**The naming contract the canvas mirrors.**
`plugins/vwf/skills/screens/SKILL.md:41-60`: pages `<flow>--<platform>`, frames
named by the screen Code, happy paths stitched into `index--<platform>`; one
design project per registry project per platform (`:62-66`). The brief
`/vwf:screens prompt <flow>` writes is
`docs/prompts/screens/<project>/<NNN>-<flow>/<platform>.md` (`:71-83`) — the
file is the deliverable, never run against a tool by vwf (`:26-39`). Import mode
is an 8-step diff at `references/import-mode.md:6-56`.

**The adapters.** `design-import-screens` is invoked by `/vwf:screens import`
through `plugins/vwf/skills/import-screens/SKILL.md:31-38` (inputs, the
per-platform pins passed through uninterpreted), `:60-85` (dispatch), `:98-107`
(return); the screens payload is `plugins/vwf/assets/design-adapter.md:109-139`.
`design-import-conversations` is invoked by `/vwf:feedback canvas` through
`plugins/vwf/skills/import-conversations/SKILL.md:30-42` (one project per call),
`:86-104` (`harvested: n/a` is an answer); the conversations payload is
`design-adapter.md:188-234`; feedback's steps 4–6
(`plugins/vwf/skills/feedback/SKILL.md:53-70`) treat remarks as data, present
them, and route each through classify. H1's pack returns the empty shapes from
both; this plan makes them read the canvas.

**The pack after H1** — `plugins/stackgen/stacks/design-tool/claude-code/`:
`pack.yaml` (`version: 0.1.0`, no `mcp_servers:`), `conventions.md` (the canvas
layout `docs/design/<project>/`, the `taste-skill@taste-skill` requirement),
`skills/design-import-design-system`, `skills/design-import-screens`,
`skills/design-import-conversations` (adapters), `skills/design-session`
(user-invocable; design system then logo). Bundle
`plugins/stackgen/stacks/bundles/claude-code.md` with `default: true` and
`components: [ design-tool/claude-code@0.1.0 ]`. A bundle pins the pack's
current `version`, and `p:plugins:inventory` fails a stale pin
(`plugins/stackgen/assets/pack-format.md:245-266`) — so the version bump, the
re-pin and the regenerated inventory land in **one** commit.

**Scripts inside a skill directory.** The materializer lands a pack's skills
whole
(`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:210-235`);
a `scripts/` subdirectory travels with its skill. Rule 13 applies to every
landed file (no plugin-path citation); rule 11's exec-bit and shebang assertions
apply to the `config/` tier and to `hooks/*.sh` only
(`.claude/skills/plugin-authoring/references/checks.md:117-160`) — a skill's
`scripts/serve.mjs` is outside both, so its exec bit is a convention, not a
gate. `p:plugins:shellcheck` covers shell only. **No gate runs a JS file a pack
ships** — parked.

**The browser and screenshots.** `ux-gate` is the sibling seam on the stack axis
(`plugins/vwf/agents/execute-ux-reviewer.md:6`, `:35`, `:50`;
`plugins/vwf/assets/stack-adapter.md:355-394`), implemented only by
`plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md`;
`screenshots` is a harness capability the stack satisfies
(`plugins/vwf/assets/harness.md:19`, `:40`, `:54`). Neither is needed to serve a
page to a person. Not touched.

**Node in a target repo.** The mise toolchain manager is unconditional
(`/vwf:init` lands it in every repo); `node` is a `mise use` away in a repo
whose stack does not already carry it. The skill says so instead of assuming.

**Gates over the touched trees.** `p:plugins:check` rules 4, 8, 12, 13;
`p:plugins:inventory -- --check`; `p:site:check`. Commit convention
`.config/git-conventional-commits.yaml`: `ops`, `docs`, `merge`, `feat`, `fix`,
`refactor`; no scopes.

**Docs describing today's behaviour** that this plan falsifies: the
`claude-code` entry in `.claude/skills/stackgen-plugin/SKILL.md` and
`site/src/content/docs/plugins/stackgen.md` (written by H1 as "design system and
logo; screens and review in a later plan");
`site/src/content/docs/plugins/vwf.md` only where it says the terminal tool's
screens/conversations adapters return nothing yet; `readme.md` one sentence.

## Assumed decisions — confirm or override at review

| # | Decision       | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Rejected                                                                                                   | Unit                                              |
| - | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1 | Server runtime | A **single-file Node script with zero dependencies**, `skills/design-session/scripts/serve.mjs`, plus the overlay it injects. Node comes from the repo's mise toolchain; the skill says `mise use node` when it is absent. (User, MCQ.)                                                                                                                                                                                                                                                                                                         | Python stdlib; Bun                                                                                         | U1                                                |
| 2 | Done signal    | The overlay carries a **Done** control that POSTs to the server; the server writes a marker line, closes, and exits `0`. The skill runs the server in the background, waits on the process, then reads the comments. (User, MCQ.)                                                                                                                                                                                                                                                                                                               | the user types "done" in the terminal                                                                      | U1, U2                                            |
| 3 | Canvas layout  | Screens at `docs/design/<project>/screens/<flow>--<platform>/<CODE>.html` plus a stitched `index--<platform>.html` (the prototype: happy-path links between screens). Comments **committed** at `docs/design/<project>/comments/<flow>--<platform>.yaml` — a list of `{ id, screen, selector, text, status: open                                                                                                                                                                                                                                | applied, created_at, applied_at }`. (Assumed from H1's committed-canvas ruling and vwf's naming contract.) | scratchpad comments; one comments file per screen |
| 4 | Server CLI     | `node serve.mjs --root <canvas dir> --flow <flow>--<platform> --comments <yaml path>`: binds **127.0.0.1** on an ephemeral port (`--port` optional), prints exactly one line `URL: http://127.0.0.1:<port>/index--<platform>.html` on stdout, serves only files under `--root` (no traversal, no symlink escape), injects the overlay into every `text/html` response, appends one YAML list item per `POST /comment`, writes the marker and exits `0` on `POST /done`. No other endpoint. (Assumed.)                                           | a config file; any-interface bind; a JSON store                                                            | U1, U2                                            |
| 5 | Session modes  | `design-session` gains `screens <flow>` — reads the brief `/vwf:screens prompt` wrote for each platform and authors the screens into the canvas through `taste-skill`'s frontend skills — and `review <flow>` — starts the server, prints the URL, waits, then applies every `open` comment to the named screen and element, marks it `applied`, and lists what changed. The adapters read the canvas: screens returns the payload from the HTML files; conversations returns `harvested: ok` with every `open` comment as a remark. (Assumed.) | a separate `design-review` skill                                                                           | U2                                                |
| 6 | Pack version   | `0.1.0` → `0.2.0`; the bundle re-pins; the inventory regenerates; all three in U2's one commit. (Assumed — the pack's surface changed.)                                                                                                                                                                                                                                                                                                                                                                                                         | leave at `0.1.0`                                                                                           | U2                                                |
| 7 | Security       | Loopback only, no auth, no TLS — a review server for one person on one machine. The comments path must resolve under the repo; the root must be the canvas. Stated in the script's header and the skill. (Assumed.)                                                                                                                                                                                                                                                                                                                             | a token in the URL                                                                                         | U1, U2                                            |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                                                                                              | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-server.md](01-server.md)                 | `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/scripts/**` (new)                                                                                                                                                                                                                          | —          | pending |        |
| U2 | 1    | [02-skills.md](02-skills.md)                 | `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`, `.../skills/design-import-screens/SKILL.md`, `.../skills/design-import-conversations/SKILL.md`, `.../conventions.md`, `.../pack.yaml`, `plugins/stackgen/stacks/bundles/claude-code.md`, `plugins/stackgen/stacks/inventory.md` | —          | pending |        |
| U3 | 2    | [03-docs.md](03-docs.md)                     | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`                                                                                                                                                                                                                                                | U1–U2      | pending |        |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md) | `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                             | U3         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                               | Why it collides                                                    | Owner   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json` | several units bumping one version is a lost update                 | U4 only |
| `.claude-plugin/marketplace.json`                                  | generated; regenerating mid-wave races                             | U4 only |
| `plugins/stackgen/stacks/inventory.md`                             | generated with the pack pin; must land with the bump in one commit | U2 only |
| `.../claude-code/pack.yaml`, `stacks/bundles/claude-code.md`       | the version and its pin move together                              | U2 only |
| `.../claude-code/skills/design-session/SKILL.md`                   | U1 writes the script beside it and never the skill file            | U2 only |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**` | n units editing one doc                                            | U3 only |
| `docs/backlog.md`                                                  | the backlog skill's; B11 moves at archive                          | nobody  |
| `plugins/vwf/**`                                                   | untouched — the adapters dispatch by fixed name                    | nobody  |
| `.../claude-code/skills/design-import-design-system/**`            | H1's, unchanged                                                    | nobody  |

## Waves

- **Wave 1** — U1 and U2 concurrently: one writes `scripts/**` inside the
  `design-session` skill directory, the other every markdown and YAML file of
  the pack. U2 names the script's CLI from ruling 4, not from U1's file.
- **Wave 2** — U3: docs over the branch delta.
- **Wave 3** — U4: version bumps, the generated marketplace, the full gate.

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
green before wave 1. `p:plugins:inventory -- --check` is expected red on the
wave-1 tree until U2's commit regenerates it — the orchestrator commits U2 with
the regenerated inventory before re-running the gate, per the shared-file rule.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                                                                                                                            |
| -------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages stackgen into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugin — and where the user runs `/design-session screens <flow>` then `/design-session review <flow>` end to end. |
| `/release`                 | ask  | Cuts the stackgen and site tags per the consent block. The run stops once and asks first.                                                                                                                                                                                        |

## Gates the orchestrator keeps

- **The smoke.** After wave 1, in a `/tmp` fixture directory holding
  `screens/demo--site/S1.html` and `screens/demo--site/index--site.html`: start
  `node <path>/serve.mjs --root <fixture> --flow demo--site --comments <fixture>/comments/demo--site.yaml`
  in the background; read the `URL:` line; `curl` the index and assert the
  overlay marker string is in the body; `curl -X POST` a comment JSON to
  `/comment`; `curl -X POST /done`; assert the process exited `0` within five
  seconds and the YAML holds one item with `status: open`. Record the transcript
  in the run log.
- **Loopback only.** `command grep -n '127.0.0.1' .../scripts/serve.mjs` hits
  the listen call; `command grep -n '0.0.0.0' .../scripts/serve.mjs` is empty.
- **No dependency.** `command grep -n "^import" .../scripts/serve.mjs` shows
  only `node:` specifiers.
- **Rule 8 still green** with the four skills, and
  `command grep -n 'version' plugins/stackgen/stacks/design-tool/claude-code/pack.yaml plugins/stackgen/stacks/bundles/claude-code.md`
  shows `0.2.0` in both.
- **vwf untouched.** `git diff --stat <base>..HEAD -- plugins/vwf` is empty.

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

- **vwf's `/vwf:mockups`** — renders the contract into the scratchpad; stays.
- **Screenshots through `ux-gate`** — the person looks at the page; nothing
  needs a headless browser here.
- **Hot reload, multi-user review, comment threading** — a review round is one
  person, one pass, then Done.
- **Applying comments to the blueprint** — that remains `/vwf:screens import` →
  `/vwf:blueprint`; this loop edits the design.

## Parked

- **A JS gate over pack-shipped scripts** — `node --check` over every
  `skills/**/scripts/*.mjs` a pack ships, in rule 11's neighbourhood, so a
  syntax error never lands. Small; worth its own line in a later checker plan.
- **Favicon derivation from `brand:`** — carried from H1.
- **A doctor row for required plugins** — carried from H1.
- **Comment resolution back into the design system** — a comment on a token
  ("this blue is too loud") belongs to the design system, not a screen; the
  session applies it to the screen today and says so. A route to
  `design-session` for the design system is a follow-on.

## Run log

<written by /vwf:change-execute; empty at approval>

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-design-review-loop
