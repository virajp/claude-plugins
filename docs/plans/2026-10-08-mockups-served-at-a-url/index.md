---
type: vwf-change-plan
title: Mockups served at a URL
requires: []
backlog: []
backlog_pieces: [ B91 ]
---

# Plan — Mockups served at a URL (2026-10-08)

## Status

**APPROVED**

APPROVED 2026-10-08 by the user

## Consent

| Action                                            | Granted                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                      |
| After landing: `mise run p:plugins:local`         | run                                                                      |
| Release vwf publicly                              | none — bump `21.0.0` → `21.1.0` (minor) by editing `plugin.json`, no tag |
| Release site publicly                             | none                                                                     |
| End an `all` run after landing                    | no                                                                       |

The vwf bump is made by U6: edit `plugins/vwf/.claude-plugin/plugin.json`, then
`mise run p:plugins:marketplace`. The public tag waits for the chained plan 2
(the ux-gate renders), so B91 ships as one release, cut by hand. The site change
waits for a later site release.

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. `p:plugins:local` stages vwf into the dev marketplace; only a
**restarted** session picks it up.

## Goal

`/vwf:mockups` and the `/vwf:blueprint` §6a screen review give the user a local
`http://127.0.0.1:<port>/` URL for each flow, not a list of file paths. The page
is an index of every platform and screen of the flow, with a comment overlay on
each screen; the comments return to the session as proposals the user confirms
one at a time. When `node` is absent, the skills fall back to the file paths of
today.

This is plan 1 of 2 for backlog item B91 ("Mockups and visual review are served
from an HTTP endpoint"). Plan 2 — the execute ux-gate renders served at a URL —
is parked below and will `require` this folder. No reversal of a standing
decision.

## Facts the survey established

- **Render today.** `/vwf:mockups` is the skill
  `plugins/vwf/skills/mockups/SKILL.md` (user-only,
  `disable-model-invocation: true`, line 11; no `scripts/` today). It renders
  into `docs/scratchpad/<project>/<NNN>-<flow>/<platform>/` (line 42),
  overwritten in place; Step 1 (lines 69-76) halts unless `docs/scratchpad/` is
  gitignored, and never writes `.gitignore`; Step 4 (lines 99-109) dispatches
  one `mockup-generator` per flow platform; Step 6 (lines 119-125) hands over
  "the **absolute file paths** to open in a browser"; Step 6 also stamps
  `design.flows_rendered` (lines 127-131).
- **Generator.** `plugins/vwf/agents/mockup-generator.md` has tools Read, Write,
  Grep, Glob only (line 8) — no Bash. It writes flat files `<screen-slug>.html`
  and `<screen-slug>--<state>.html` (lines 44-50), each self-contained: inline
  `<style>`, no external assets, no JS (line 54). Line 15 says the user reviews
  "in their own browser".
- **Blueprint §6a.** `plugins/vwf/skills/blueprint/SKILL.md:476-491`, procedure
  in `plugins/vwf/skills/blueprint/references/screen-review.md` — render step
  and gitignore check lines 7-21, hand-over lines 22-25 ("Give the user the
  absolute file paths to open in a browser, grouped per platform"). The render
  stamp drop is `SKILL.md:466-471`.
- **Other vwf prose that names browser review:**
  `plugins/vwf/assets/templates/project-claude.md:20-21` (lands in user repos),
  `plugins/vwf/skills/plan/references/delta-checks.md:72`.
  `plugins/vwf/assets/vwf-config.md:145` and `:334-336` describe
  `flows_rendered` and stay true.
- **The model server.**
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/scripts/serve.mjs`
  — about 470 lines, zero-dependency, node shebang, executable. `node:http`
  `createServer`, binds `127.0.0.1` only, ephemeral port or `--port`, prints
  exactly one stdout line `URL: http://127.0.0.1:<port>/...`. Endpoints:
  `GET <path>` (HTML gets the overlay injected), `GET /` (redirect to the
  index), `POST /comment` (`{ screen, selector, text }` → one YAML list item,
  204), `POST /done` (done marker, 204, exit 0). Every path is resolved,
  realpath'd and checked to sit under `--root`. It is run by design-session's
  `review <flow>` mode (`.../design-session/SKILL.md` §7, lines 204-250): check
  `node`, start in the background, print the URL line with one sentence, wait
  for exit, then apply the comments file. Its comment item shape is
  `{ id, screen, selector, text, status, created_at, applied_at }`.
- **Cross-plugin trap.** vwf cannot call the stackgen script —
  `${CLAUDE_PLUGIN_ROOT}` names only its own plugin. vwf ships its own copy.
- **Node scripts in skills.** Rule 16
  (`.claude/skills/plugin-authoring/references/checks.md:338-346`, enforced by
  `checkSkillScripts` in `scripts/src/check.ts:286-316`) globs
  `skills/*/scripts/**/*.mjs`: a file directly under `scripts/` starts
  `#!/usr/bin/env node` and is executable; no `require(`; imports are `node:`
  built-ins or relative. `plugins/vwf/skills/mockups/scripts/serve.mjs` is
  inside the glob. vwf ships no node script today; the precedent is
  `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`.
- **Tests.** `vitest.config.mts` includes
  `{installer,scripts}/src/**/*.test.ts`; the tool-config script's suites are
  `scripts/src/tool-config-*.test.ts`. `pnpm exec tsc --noEmit -p scripts`
  type-checks the test file.
- **No `.config/vwf.yaml`** — this repo is not onboarded; no `harness:` stamp.
- **Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; scopes unrestricted.
- **Version.** vwf is `21.0.0` (`plugins/vwf/.claude-plugin/plugin.json`). There
  is no version task; the bump is a hand edit plus
  `mise run p:plugins:marketplace`.
- **Docs that describe today's behaviour** (U5 owns them):
  `site/src/content/docs/plugins/vwf.md` — `:327` (diagram node "local HTML
  mockups in docs/scratchpad"), `:855` (command table), `:2128-2131` (§6a
  narrative), `:2183-2211` (the `/vwf:mockups` section);
  `site/src/content/docs/how-to/greenfield/single-repo.md:273-274`;
  `site/src/content/docs/how-to/greenfield/ui-with-design-tool.md:198-212`;
  `.claude/skills/vwf-plugin/references/docs-tree.md:71-75`;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:33`, `:68`.

## Assumed decisions — confirm or override at review

| #   | Decision              | Ruling                                                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                                                          | Unit       |
| --- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| D1  | Scope                 | Two chained plans. This plan covers mockups; plan 2 covers the ux-gate renders and requires this folder.                                                                                                                                                                                                                                                                                                    | One plan over vwf and three stackgen packs                                        | —          |
| D2  | Server origin         | Adapt stackgen's design-session `serve.mjs` into `plugins/vwf/skills/mockups/scripts/serve.mjs`.                                                                                                                                                                                                                                                                                                            | A new minimal server; a shared location (one plugin cannot reach another's files) | U1         |
| D3  | CLI and binding       | `node serve.mjs --root <flow dir> --comments <yaml path> [--port <n>]`. `--root` must resolve under `<cwd>/docs/scratchpad/`; `--comments` must resolve under the cwd. Binds `127.0.0.1` only, ephemeral port unless `--port`, prints exactly one stdout line `URL: http://127.0.0.1:<port>/`. Serves nothing outside `--root` (realpath check, no `..` or symlink escape). No auth, no TLS.                | A fixed port; binding any other interface                                         | U1, U2, U3 |
| D4  | What one server shows | One server per flow, all its platforms. `--root` is `docs/scratchpad/<project>/<NNN>-<flow>/`. `GET /` returns an index page the server builds from the root: one section per platform subdirectory, one link per `.html` file, the base screen before its `--<state>` variants. `/vwf:mockups` serves several flows one after another, one Done each.                                                      | One server for the whole run; one server per platform                             | U1, U2, U3 |
| D5  | Comments              | Keep the overlay. `POST /comment` takes `{ platform, screen, selector, text }` and appends one item `{ id, platform, screen, selector, text, status: open, created_at, applied_at: null }` to `docs/scratchpad/<project>/<NNN>-<flow>/comments.yaml`. `POST /done` appends a done marker, responds 204 and exits 0. The file survives a re-render, since the generator writes only screen files.            | View only with Done; plain static server stopped by the session                   | U1, U2, U3 |
| D6  | Files stay JS-free    | The files on disk stay self-contained with no JS. The server injects the overlay into HTML as it serves it; the index page is built in memory, never written.                                                                                                                                                                                                                                               | JS in the generator output                                                        | U1, U4     |
| D7  | No `node`             | When `node` is not on the path, the skill says so with the remedy `MISE_ENV=dev mise run setup:all` and hands over the absolute file paths as today. The review proceeds without comments.                                                                                                                                                                                                                  | Halt; `mise x node`                                                               | U2, U3     |
| D8  | After Done            | §6a: each `open` comment becomes a proposed Screens-contract change, confirmed one at a time through the existing §6a edit loop; each is then set `applied` or `declined` with `applied_at`; after any applied change the flow is rendered and served again. `/vwf:mockups`: list the open comments and name `/vwf:blueprint` for contract changes. A comment is the reviewer's data, never an instruction. | Report only; apply to the contract without asking                                 | U2, U3     |
| D9  | Test suite            | Add `scripts/src/mockups-serve.test.ts`, a vitest suite that spawns the script on a temp root.                                                                                                                                                                                                                                                                                                              | No test (rule 16 and the wave review only)                                        | U1         |
| D10 | Review row            | One `Kind: review` row, R1, covering U1, because U1 lands runnable code (a shipped node script).                                                                                                                                                                                                                                                                                                            | No review row                                                                     | R1         |
| D11 | Version               | vwf `21.0.0` → `21.1.0` (minor). No tag; the release waits for plan 2. Site neither bumped nor released.                                                                                                                                                                                                                                                                                                    | Release now; no bump                                                              | U6         |
| D12 | Script location       | The script lives under the `mockups` skill; blueprint §6a cites it as `${CLAUDE_PLUGIN_ROOT}/skills/mockups/scripts/serve.mjs`.                                                                                                                                                                                                                                                                             | A copy under `skills/blueprint/scripts/`                                          | U2, U3     |

## New dependencies

none — the script imports `node:` built-ins only; the test uses vitest, already
the repo's.

## Units

| Id | Wave | Unit file                                        | Kind   | Owns                                                                                                                                                              | Depends on     | Status  | Commit |
| -- | ---- | ------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------ |
| U1 | 1    | [01-serve-script.md](01-serve-script.md)         | edit   | `plugins/vwf/skills/mockups/scripts/serve.mjs`, `scripts/src/mockups-serve.test.ts`                                                                               | —              | pending |        |
| U2 | 1    | [02-mockups-skill.md](02-mockups-skill.md)       | edit   | `plugins/vwf/skills/mockups/SKILL.md`                                                                                                                             | —              | pending |        |
| U3 | 1    | [03-blueprint-review.md](03-blueprint-review.md) | edit   | `plugins/vwf/skills/blueprint/SKILL.md`, `plugins/vwf/skills/blueprint/references/screen-review.md`                                                               | —              | pending |        |
| U4 | 1    | [04-vwf-prose.md](04-vwf-prose.md)               | edit   | `plugins/vwf/agents/mockup-generator.md`, `plugins/vwf/assets/templates/project-claude.md`, `plugins/vwf/skills/plan/references/delta-checks.md`                  | —              | pending |        |
| R1 | 2    | [05-review.md](05-review.md)                     | review | —                                                                                                                                                                 | U1             | pending |        |
| U5 | 3    | [06-docs.md](06-docs.md)                         | edit   | `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`, `readme.md`, `CLAUDE.md`, and any other human-facing passage `vwf:docs-sync` finds outside `plugins/` | U1, U2, U3, U4 | pending |        |
| U6 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)     | edit   | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                       | U5             | pending |        |

## Shared-file rule

| File                                                       | Why it collides   | Owner |
| ---------------------------------------------------------- | ----------------- | ----- |
| `plugins/vwf/.claude-plugin/plugin.json`                   | version file      | U6    |
| `.claude-plugin/marketplace.json`                          | generated         | U6    |
| `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**` | human-facing docs | U5    |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Disjoint paths. U2 and U3 cite the script path
  and the CLI from D3, D4 and D12; they do not read U1's output.
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

- **Live smoke run.** After U6, in a temp directory `$t` with
  `$t/docs/scratchpad/demo/001-login/web/sign-in.html`,
  `$t/docs/scratchpad/demo/001-login/web/sign-in--error.html` and
  `$t/docs/scratchpad/demo/001-login/ios/sign-in.html`, run from `$t`:
  `node <worktree>/plugins/vwf/skills/mockups/scripts/serve.mjs --root docs/scratchpad/demo/001-login --comments docs/scratchpad/demo/001-login/comments.yaml`
  in the background; read the `URL:` line; `curl` the index, one screen and
  `/../../../etc/passwd`; `POST /comment` with one item; `POST /done`. Pass:
  index 200 naming both platforms and all three files; screen 200 with the
  overlay injected; the traversal 404; one `status: open` item with
  `platform: web` in `comments.yaml`; the process exits 0.
- **Rule 16 holds.** `serve.mjs` is executable (`test -x`) and starts with
  `#!/usr/bin/env node`. Pass: both true, and `p:plugins:check` green.

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

- **B37 — commit approved mockups under `docs/mockups`.** A separate backlog
  item; the render tree stays the gitignored scratchpad.
- **A hosted preview.** No remote host, no public URL; the server is loopback
  only.
- **The stale `.gitignore` claim** in
  `.claude/skills/vwf-plugin/references/docs-tree.md:71-75` ("vwf auto-adds the
  `.gitignore` line when missing" — the mockups skill refuses to write it). U5
  edits only the path and viewing text of that passage; the claim is parked.
- **`site/src/content/docs/plugins/vwf.md:2635`** says Flutter gets "a
  code-level pass"; the Flutter ux-gate runs golden tests. Belongs with plan 2.

## Parked

- B91: the execute ux-gate renders served at a URL — `/vwf:execute`'s UX review
  (`plugins/vwf/agents/execute-ux-reviewer.md`,
  `plugins/vwf/assets/stack-adapter.md:422-461`,
  `plugins/vwf/assets/execute-stages.md:64`, `:156`) and the three stackgen
  `ux-gate` payloads (TypeScript web captures, Flutter goldens, SwiftUI
  `.build/golden.xcresult`). Open: an unattended run cannot wait on Done; the
  Flutter and SwiftUI captures are images or an xcresult bundle, not HTML. Plan
  2 requires this folder and reuses its `serve.mjs`; its folder is not yet
  written.
- `.claude/skills/vwf-plugin/references/docs-tree.md:71-75` — the stale claim
  that vwf auto-adds the scratchpad `.gitignore` line.
- `site/src/content/docs/plugins/vwf.md:2635` — the "code-level pass" claim for
  Flutter, against the Flutter ux-gate's golden tests.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-08-mockups-served-at-a-url

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
