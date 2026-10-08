---
type: vwf-change-plan
title: Mockups served at a URL
requires: []
backlog: []
backlog_pieces: [ B91 ]
---

# Plan — Mockups served at a URL (2026-10-08)

## Status

**BLOCKED**

BLOCKED at wave 2 — R1 security findings not converging (3, 1, 1, 2 over rounds
1-4; cap-exempt, so a pause): U1 links.mjs:83 entity-encoded href, serve.mjs:285
YAML control chars — ruling in G9; U5, U6 not run (depend on R1's wave); U1-U4
green;
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-10-08-mockups-served-at-a-url

## Consent

| Action                                            | Granted                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                      |
| After landing: `mise run p:plugins:local`         | run                                                                      |
| Release vwf publicly                              | none — bump `21.0.0` → `21.1.0` (minor) by editing `plugin.json`, no tag |
| Release site publicly                             | none                                                                     |
| End an `all` run after landing                    | no                                                                       |

U6 does the vwf bump: it edits `plugins/vwf/.claude-plugin/plugin.json`, then
runs `mise run p:plugins:marketplace`. The public tag waits for the chained
plans 2a and 2b (the renders of the built app), so B91 ships as one release, cut
by hand. The site change waits for a later site release.

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. `p:plugins:local` stages vwf into the dev marketplace; only a
**restarted** session gets it.

## Goal

After `/vwf:mockups` or the `/vwf:blueprint` §6a screen review, the user opens
one `http://127.0.0.1:<port>/` URL for each platform. The mockups use the
production routes, the screens of all flows are connected, and every link works.
A link check passes before the user is asked to validate. Each screen has a
comment overlay; the comments return to the session as proposals that the user
confirms one at a time.

This is plan 1 of 3 for backlog item B91 ("Mockups and visual review are served
from an HTTP endpoint"). Plans 2a and 2b serve the renders of the built app that
the `/vwf:execute` UX stage makes; they are parked below.

**Reversals.** This folder was approved on 2026-10-08 and revised on the same
day, before any run. The revision reverses four rulings of that first version:

- "One server per flow, all its platforms" becomes one server for each platform,
  with all flows (D3).
- The disk tree `<NNN>-<flow>/<platform>/<slug>.html` becomes
  `mockups/<platform>/<route>/index.html` (D3, D4).
- "When `node` is absent, hand over the file paths" becomes a stop with the
  remedy (D17).
- "Two chained plans" becomes three: this plan, 2a (vwf) and 2b (stackgen).

The cause: the mockups of today show one screen, and their other links are
broken. The generator writes each link itself, with no map of the screens, and
nothing examines the links before the user gets the paths.

## Facts the survey established

- **Render today.** `/vwf:mockups` is the skill
  `plugins/vwf/skills/mockups/SKILL.md` (user-only,
  `disable-model-invocation: true`, line 11; no `scripts/` today). It renders
  into `docs/scratchpad/<project>/<NNN>-<flow>/<platform>/` (line 42),
  overwritten in place. Step 1 (lines 69-76) halts unless `docs/scratchpad/` is
  gitignored, and never writes `.gitignore`. Step 4 dispatches one
  `mockup-generator` per flow platform. Step 5 (lines 111-117) prunes stale
  files. Step 6 (lines 119-125) hands over "the **absolute file paths** to open
  in a browser", and stamps `design.flows_rendered` (lines 127-131) as
  `<project>/<NNN>-<flow>/<platform>`.
- **A stale row.** The Doc Paths table of the mockups skill (line 41) says the
  Screens section is in the flow's `index.md`. It is in
  `docs/blueprint/flows/<project>/<NNN>-<flow>/<platform>.md`, under
  `## Screens → <project>` (`plugins/vwf/assets/templates/flow-platform.md:34`).
- **The Screens table.** Columns:
  `Code | Screen | Route | Reads (operationId) | States (loading/error/empty) | Actions | Form validation`
  (`flow-platform.md:36`). A Code is `<NNN><letter>`, the same screen concept on
  every platform, unique in the product (`:38-47`). HOME rule: each screen is
  defined in exactly one flow; another flow links that row (`:54-56`). Each
  Components block names, for each action, "the coded screen it navigates to"
  (`:76-83`). A Route can be empty on a device platform.
- **Generator.** `plugins/vwf/agents/mockup-generator.md` has tools Read, Write,
  Grep, Glob only (line 8) — no Bash. It writes flat files `<screen-slug>.html`
  and `<screen-slug>--<state>.html` (lines 44-50), each self-contained: inline
  `<style>`, no external assets, no JS (line 54). It has no rule for links: each
  generator invents its own hrefs and knows only its own flow. Line 15 says the
  user reviews "in their own browser".
- **Blueprint §6a.** `plugins/vwf/skills/blueprint/SKILL.md:476-491`, procedure
  in `plugins/vwf/skills/blueprint/references/screen-review.md` — render step
  lines 7-21, hand-over lines 22-25 ("Give the user the absolute file paths to
  open in a browser, grouped per platform"). The render stamp drop is
  `SKILL.md:466-471`.
- **Other vwf prose that names browser review:**
  `plugins/vwf/assets/templates/project-claude.md:20-21` (lands in user repos),
  `plugins/vwf/skills/plan/references/delta-checks.md:72`.
  `plugins/vwf/assets/vwf-config.md:145` and `:334-336` describe
  `flows_rendered` and stay true: the stamp key stays per flow platform.
- **The model server.**
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/scripts/serve.mjs`
  — about 470 lines, zero-dependency, node shebang, executable. `node:http`
  `createServer`, binds `127.0.0.1` only, ephemeral port or `--port`, prints
  exactly one stdout line `URL: http://127.0.0.1:<port>/...`. A MIME table at
  lines 122-134. `resolveFile` (lines 139-168) realpaths every path and keeps it
  under `--root`. `serveFile` (lines 170-188) injects the overlay into HTML.
  `POST /comment` and `POST /done` (lines 298-322).
- **Cross-plugin trap.** vwf cannot call the stackgen script —
  `${CLAUDE_PLUGIN_ROOT}` names only its own plugin. vwf ships its own copy.
- **Node scripts in skills.** Rule 16
  (`.claude/skills/plugin-authoring/references/checks.md:338-346`, enforced by
  `checkSkillScripts` in `scripts/src/check.ts:286-316`) globs
  `skills/*/scripts/**/*.mjs`: a file directly under `scripts/` starts
  `#!/usr/bin/env node` and is executable; a module under `scripts/lib/` needs
  neither; no `require(`; imports are `node:` built-ins or relative. The
  precedent is `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`.
- **Tests.** `vitest.config.mts` includes
  `{installer,scripts}/src/**/*.test.ts`;
  `scripts/src/tool-config-render.test.ts` shows how a suite spawns a shipped
  script. `pnpm exec tsc --noEmit -p scripts` type-checks the test files.
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

| #   | Decision           | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Rejected                                                            | Unit           |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------- |
| D1  | Scope              | Three chained plans. This plan covers the mockups; plan 2a (vwf) and plan 2b (stackgen) cover the renders of the built app, 2a requiring this folder and 2b requiring 2a.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | One plan over vwf and three stackgen packs; two plans               | —              |
| D2  | Server origin      | Adapt stackgen's design-session `serve.mjs` into `plugins/vwf/skills/mockups/scripts/serve.mjs`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | A new server; a shared location (one plugin cannot reach another's) | U1             |
| D3  | Server and root    | One server for each platform, with all flows. The root is `docs/scratchpad/<project>/mockups/<platform>/`; the sibling `docs/scratchpad/<project>/renders/<platform>/` belongs to plan 2a. `node serve.mjs --root <platform dir> [--port <n>]`; `--root` must resolve under `<cwd>/docs/scratchpad/` and hold `__mockups/routes.json`. Binds `127.0.0.1` only, ephemeral port unless `--port`, prints exactly one stdout line `URL: http://127.0.0.1:<port>/`. Serves nothing outside `--root` (realpath check, no `..` or symlink escape). Non-HTML files are served with the MIME table of the source. No auth, no TLS.                               | One server per flow; one server per run                             | U1, U2, U3     |
| D4  | Route to file      | A screen with the route `/a/b` is the file `<root>/a/b/index.html`; the route `/` is `<root>/index.html`. `GET /` serves the app's `/` screen. `GET /__mockups/` is a list of every flow, screen and state of the platform, built in memory and never written; it marks a screen with no file "not rendered yet". `/__mockups/` is reserved: no other path under it is served.                                                                                                                                                                                                                                                                          | `<route>.html`; a list page at `/`                                  | U1, U2, U3, U4 |
| D5  | State variants     | A state is the URL `<route>?state=<state>`; its file is `index--<state>.html` beside `index.html`. A `?state=` with no such file is 404. The overlay shows a state switcher with every state file of the page's directory, and a link to `/__mockups/`.                                                                                                                                                                                                                                                                                                                                                                                                 | A reserved state path                                               | U1, U4         |
| D6  | Route parameters   | A segment `:id`, `{id}` or `[id]` in a route is the folder `[id]`, for example `orders/[id]/index.html`. A link uses a sample value, for example `/orders/1042`. The server serves any value of that segment from the `[id]` folder; a static folder wins over a `[param]` folder.                                                                                                                                                                                                                                                                                                                                                                      | One fixed sample folder                                             | U1, U4         |
| D7  | No route           | A screen whose Route cell is empty, `—`, `-` or `n/a` gets the route `/<code>-<slug>`, where `<slug>` is the kebab-case Screen name. The report lists each such screen, so the user can pin a route through `/vwf:blueprint`.                                                                                                                                                                                                                                                                                                                                                                                                                           | Route mandatory on every screen platform                            | U1, U2         |
| D8  | Route map          | `node routes.mjs --project <project> --platform <platform>`, from the repo root, reads `## Screens` of every `docs/blueprint/flows/<project>/*/<platform>.md` and writes `docs/scratchpad/<project>/mockups/<platform>/__mockups/routes.json`: `{ "project", "platform", "screens": [ { "code", "screen", "slug", "flow", "route", "path", "routed" } ] }`. `path` is the directory under the root (empty for `/`); `routed` is false for a D7 route. Two codes with one route, or one code twice, is an error: stderr, non-zero exit. stdout is one summary line, plus one `NO ROUTE: <code> <screen>` line per D7 screen.                             | Each generator writes its own hrefs                                 | U1, U2, U3, U4 |
| D9  | Link targets       | A link goes to the route of the target screen code, from `routes.json`, with a sample value for each parameter. An action with no pinned target screen gets no href, `aria-disabled="true"`, and a visible mark "no target in contract"; the generator returns it as an `UNLINKED:` line, and the skill reports it as a contract gap.                                                                                                                                                                                                                                                                                                                   | The generator invents the target                                    | U2, U3, U4     |
| D10 | Unrendered target  | A link to a code in `routes.json` with no file opens a placeholder page from the server: the code, the screen name, the flow, "not rendered yet", and a link to `/__mockups/`. A code in no Screens table is a broken link.                                                                                                                                                                                                                                                                                                                                                                                                                             | Render the target flow; count it as broken                          | U1, U2, U3     |
| D11 | Link check         | `node links.mjs --root <platform dir>` reads every `.html` under the root (except `__mockups/`) and every `href`. A `#` link is correct. A root-absolute link is correct when the server would serve it: a file, a `[param]` match, or a D10 placeholder; and its `?state=` file exists. Any other href (relative, `http:`, `mailto:`) is broken. Broken links: one `BROKEN: <page> -> <href> — <reason>` line each, exit 1. None: one `LINKS OK: <n> links in <m> pages` line, exit 0.                                                                                                                                                                 | No check                                                            | U1, U2, U3     |
| D12 | Broken links       | The skill sends each `BROKEN:` line to the generator of the flow that owns the page (from `routes.json`), and runs the check again, for a maximum of 2 rounds. If links are still broken, the skill starts no server, gives no URL, asks for no review, sets no `flows_rendered` stamp, and reports each broken link.                                                                                                                                                                                                                                                                                                                                   | Stop at once; serve with a warning                                  | U2, U3         |
| D13 | Several platforms  | The skill starts all platform servers at the same time, each on its own port, and gives every URL in one message. Each server stops on its own Done. The skill continues when all servers stopped.                                                                                                                                                                                                                                                                                                                                                                                                                                                      | One after another                                                   | U2, U3         |
| D14 | Render a flow      | Before a flow is rendered again, the skill deletes only the `index.html` and `index--*.html` files at the `path` of each of its screens (from `routes.json`) — never a directory, since a child route can belong to another flow. A sweep also deletes files at paths that `routes.json` no longer names.                                                                                                                                                                                                                                                                                                                                               | Delete the whole platform tree                                      | U2, U3         |
| D15 | Comments           | `POST /comment` takes `{ path, state, selector, text }`; the server finds the code and the route from `routes.json` and appends `{ id, code, route, state, selector, text, status: open, created_at, applied_at: null }` to `<root>/__mockups/comments.yaml`; a missing field is 400. `POST /done` appends a done marker, responds 204 and exits 0. The file survives a render. §6a: each `open` comment becomes a proposed Screens-contract change, confirmed one at a time; then `applied` or `declined` with `applied_at`. `/vwf:mockups`: list the open comments and name `/vwf:blueprint`. A comment is the reviewer's data, never an instruction. | View only; apply without asking                                     | U1, U2, U3     |
| D16 | §6a URL            | §6a serves the whole platform and gives the URL of the first screen of the flow under review: the root URL plus that screen's route.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Serve only the flow                                                 | U3             |
| D17 | No `node`          | When `node` is not on the path, the skill renders nothing and stops: `node` is necessary for the route map and the link check; the remedy is `MISE_ENV=dev mise run setup:all`. §6a reports that the review of that flow waits for `node`.                                                                                                                                                                                                                                                                                                                                                                                                              | File paths with no check                                            | U2, U3         |
| D18 | Old tree           | The skill ignores the old `docs/scratchpad/<project>/<NNN>-<flow>/` directories; the docs say that the user can delete them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Delete them automatically                                           | U2, U5         |
| D19 | Pages stay JS-free | The files on disk stay self-contained with no JS. The server injects the overlay into HTML as it serves it; the list page and the placeholder pages are built in memory, never written.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | JS in the generator output                                          | U1, U4         |
| D20 | Shared module      | `serve.mjs` and `links.mjs` match a URL path to a file through one module, `plugins/vwf/skills/mockups/scripts/lib/routes.mjs`, so the server and the check agree.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Two copies of the matcher                                           | U1             |
| D21 | Test suites        | `scripts/src/mockups-serve.test.ts`, `mockups-routes.test.ts` and `mockups-links.test.ts`, vitest suites that spawn each script on a temp root.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No test                                                             | U1             |
| D22 | Review row         | One `Kind: review` row, R1, covering U1, because U1 lands runnable code (three shipped node scripts).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No review row                                                       | R1             |
| D23 | Version            | vwf `21.0.0` → `21.1.0` (minor). No tag; the release waits for plan 2b. Site neither bumped nor released.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Release now; no bump                                                | U6             |
| D24 | Script location    | The scripts live under the `mockups` skill; blueprint §6a cites them as `${CLAUDE_PLUGIN_ROOT}/skills/mockups/scripts/<name>.mjs`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | A copy under `skills/blueprint/scripts/`                            | U2, U3         |

## New dependencies

none — the scripts import `node:` built-ins only; the tests use vitest, already
the repo's.

## Units

| Id | Wave | Unit file                                        | Kind   | Owns                                                                                                                                                                                                                                                                                               | Depends on     | Status  | Commit   |
| -- | ---- | ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-scripts.md](01-scripts.md)                   | edit   | `plugins/vwf/skills/mockups/scripts/**`, `scripts/src/mockups-serve.test.ts`, `scripts/src/mockups-routes.test.ts`, `scripts/src/mockups-links.test.ts`                                                                                                                                            | —              | green   | 31f47d73 |
| U2 | 1    | [02-mockups-skill.md](02-mockups-skill.md)       | edit   | `plugins/vwf/skills/mockups/SKILL.md`                                                                                                                                                                                                                                                              | —              | green   | 8a49ee5b |
| U3 | 1    | [03-blueprint-review.md](03-blueprint-review.md) | edit   | `plugins/vwf/skills/blueprint/SKILL.md`, `plugins/vwf/skills/blueprint/references/screen-review.md`                                                                                                                                                                                                | —              | green   | 534f6f5d |
| U4 | 1    | [04-vwf-prose.md](04-vwf-prose.md)               | edit   | `plugins/vwf/agents/mockup-generator.md`, `plugins/vwf/assets/templates/project-claude.md`, `plugins/vwf/skills/plan/references/delta-checks.md`                                                                                                                                                   | —              | green   | 4ebb9002 |
| R1 | 2    | [05-review.md](05-review.md)                     | review | —                                                                                                                                                                                                                                                                                                  | U1             | blocked |          |
| U5 | 3    | [06-docs.md](06-docs.md)                         | edit   | `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`, `readme.md`, `CLAUDE.md`, `docs/memory/decisions/2026-10-08-mockups-on-production-routes.md`, and any other human-facing passage `vwf:docs-sync` finds outside `plugins/`; widened at run time: `plugins/vwf/assets/vwf-config.md:145` | U1, U2, U3, U4 | pending |          |
| U6 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)     | edit   | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                        | U5             | pending |          |

## Shared-file rule

| File                                                       | Why it collides   | Owner |
| ---------------------------------------------------------- | ----------------- | ----- |
| `plugins/vwf/.claude-plugin/plugin.json`                   | version file      | U6    |
| `.claude-plugin/marketplace.json`                          | generated         | U6    |
| `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**` | human-facing docs | U5    |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Disjoint paths. U2, U3 and U4 cite the script
  CLIs, the disk tree and the `routes.json` shape from D3-D16; they do not read
  U1's output.
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

- **Live smoke run.** After U6, make a temp directory `$t` with two web flows:
  `$t/docs/blueprint/flows/demo/100-signin/web.md` (screens `100a` route `/`,
  `100b` route `/signin`, with states `error`) and
  `$t/docs/blueprint/flows/demo/200-orders/web.md` (screens `200a` route
  `/orders`, `200b` route `/orders/:id`, `200c` with no route). From `$t`:
  1. Run
     `node <worktree>/plugins/vwf/skills/mockups/scripts/routes.mjs --project demo --platform web`.
     Pass: exit 0, `routes.json` names five screens, one `NO ROUTE: 200c` line.
  2. Write by hand `index.html`, `signin/index.html`,
     `signin/index--error.html`, `orders/index.html` and
     `orders/[id]/index.html` under `docs/scratchpad/demo/mockups/web/`, with
     links to `/signin`, `/signin?state=error`, `/orders/1042` and
     `/200c-<slug>`. Run `links.mjs --root docs/scratchpad/demo/mockups/web`.
     Pass: exit 0, `LINKS OK:`. Add one link to `/nowhere` and run it again.
     Pass: exit 1, one `BROKEN:` line naming `/nowhere`; then remove that link.
  3. Run `serve.mjs --root docs/scratchpad/demo/mockups/web` in the background;
     read the `URL:` line; `curl` `/`, `/orders/7`, `/signin?state=error`,
     `/__mockups/`, `/200c-<slug>` and `/../../../etc/passwd`; `POST /comment`
     with one item; `POST /done`. Pass: `/` is `index.html` with the overlay;
     `/orders/7` is the `[id]` page; the state file is served; `/__mockups/`
     names all five codes; `/200c-<slug>` is the placeholder page; the traversal
     is 404; `__mockups/comments.yaml` holds one `status: open` item with its
     `code` and `route`; the process exits 0.
- **Rule 16 holds.** `serve.mjs`, `routes.mjs` and `links.mjs` are executable
  (`test -x`) and start with `#!/usr/bin/env node`. Pass: all true, and
  `p:plugins:check` green.

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
- **A hosted preview.** No remote host, no public URL; the servers are loopback
  only.
- **A mandatory Route on every screen.** D7's fallback path is the answer; the
  blueprint authoring rules and reviewer do not change.
- **The stale `.gitignore` claim** in
  `.claude/skills/vwf-plugin/references/docs-tree.md:71-75` ("vwf auto-adds the
  `.gitignore` line when missing" — the mockups skill refuses to write it). U5
  edits only the path and viewing text of that passage; the claim is parked.
- **`site/src/content/docs/plugins/vwf.md:2635`** says Flutter gets "a
  code-level pass"; the Flutter ux-gate runs golden tests. Belongs with plan 2a.

## Parked

- B91: plan 2a (vwf) — the renders of the built app served at a URL: an optional
  artifact field in the `ux-gate` contract
  (`plugins/vwf/assets/stack-adapter.md:419-451`), `execute-ux-reviewer`
  (`plugins/vwf/agents/execute-ux-reviewer.md`), the execute UX stage
  (`plugins/vwf/assets/execute-stages.md:64`, `:149-165`) keeps the renders in
  the main checkout's scratchpad and the final report names the review command,
  and a `/vwf:mockups ux <plan>` mode that serves them with image support. The
  person reviews after the run; execute stays unattended. Requires this folder;
  its folder is not yet written.
- B91: plan 2b (stackgen) — `docs/plans/2026-10-08-typescript-ux-gate-renders`:
  the TypeScript `ux-gate` names its captures `<code>--<state>.png` and returns
  the 2a `renders:` list; the pack bumps, with its 13 bundle pins and
  `inventory.md`. Requires 2a; finishes B91. The Flutter and SwiftUI gates
  (golden images) are backlog item B94.
- `.claude/skills/vwf-plugin/references/docs-tree.md:71-75` — the stale claim
  that vwf auto-adds the scratchpad `.gitignore` line.
- `site/src/content/docs/plugins/vwf.md:2635` — the "code-level pass" claim for
  Flutter, against the Flutter ux-gate's golden tests.

## Gaps surfaced during execution

All non-blocking; the run proceeded on the assumption stated.

- **G1 (R1 review, plan gap).** D8 makes a shared route an error, but a modal,
  dialog or sheet screen sits on its parent's route
  (`plugins/vwf/skills/mockups/scripts/routes.mjs:168`), so one such screen
  stops the whole platform. Assumed: D8 as written. Closes in a follow-up plan.
- **G2 (U1 GAP, R1 review).** The HOME-rule reference row has no pinned format;
  U1 assumed a markdown link in the Code cell (`routes.mjs:115`). Any other form
  counts as a second definition.
- **G3 (R1 review, plan gap).** D11 checks `href` only, while the generator
  allows a form action to navigate; a broken form action is never reported.
- **G4 (U2 GAP).** In a flow-scoped run, a stale page at a path `routes.json` no
  longer names has no owning flow, so its `BROKEN:` lines hit the D12 stop; the
  remedy is a sweep.
- **G5 (R1 wave review, contested).** `screen-review.md:55` — after the D12
  stop, nothing records the deferred review in `blueprint.remaining` or names
  the halt.
- **G6 (R1 review round 2, plan gap).** D4 does not say what `GET /` does when
  no screen has the route `/` (a mobile platform, or D7 routes only):
  `lib/routes.mjs:323` returns a blank 404, yet `/vwf:mockups` step 9 hands the
  user that root URL. Assumed: D4 as written; a ruling (for example a redirect
  to `/__mockups/`) closes it.
- **G7 (R1 review round 3, plan gap).** D5 and D11 make a missing `?state=` file
  a 404 and a broken link, while D10 and the generator link `?state=` to an
  unrendered cross-flow target; `lib/routes.mjs:319` returns no match, which
  leads to the D12 stop on a fresh tree. A ruling is needed.
- **G8 (R1 review, convergence guard, contested).** Round 3 raised 5 findings on
  U1 against round 2's 4, so the review loop ended at the guard, not the cap;
  the loop, not the contract, is the suspect. Open on U1: `links.mjs:81` (href
  pattern also matches `data-href=` and comment text), `routes.mjs:130` (route
  token keeps surrounding punctuation), `links.mjs:72` (exact-case `__mockups`
  skip vs case-insensitive reserve), `lib/routes.mjs:221` (two validators to
  keep in step), and the `serve.mjs:411` vs `links.mjs` parse divergence. Round
  4 (the cap) added six more U1 residuals, contested: `serve.mjs:285`,
  `lib/routes.mjs:304`, `serve.mjs:664`, `serve.mjs:500`, `links.mjs:96`,
  `serve.mjs:523` — see the Run log and `engine/R1-4-code.log`.
- **G9 (R1 security, BLOCKING — the run paused here).** The security findings of
  the review row did not converge: round 1 raised 3, round 2 raised 1, round 3
  raised 1 and round 4 raised 2, each fix holding but each round finding
  something new. Security findings are cap-exempt and never take the contested
  exit, so the convergence guard is a pause. Open, both U1, both low:
  `links.mjs:83` — the link check never decodes HTML entities, so an href of
  `/&#x2F;evil.com` passes through a root `[param]` folder while the browser
  leaves the server; `serve.mjs:285` — the YAML writer leaves DEL, C1 control
  characters and lone surrogates raw, so one comment can make `comments.yaml`
  unparseable. Ruling needed: authorise one more U1 fix round for these two
  findings (decode entities before the check, or refuse any `&` in an href;
  escape those characters as `\uXXXX`), or rule them out of scope for this plan.

## Run log

| Wave | Unit                | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Commit   |
| ---- | ------------------- | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight           | opus  | 1     | pass        | doctor: 0 blocking (repo not onboarded, no .config/vwf.yaml); format check skipped (no covers:); no code unit, LSP and conventions skipped; wave gate 7/7 green on 7bb533f8; order W1 U1 U2 U3 U4, W2 R1, W3 U5, W4 U6                                                                                                                                                                                                                                                                                                                                                  | —        |
| 0    | override            | —     | 1     | pass        | override: skip as deduped: mise run p:plugins:local                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | U4 vwf prose        | opus  | 1     | pass        | edit; DECIDED template says "the URL the pass prints"; generator never deletes, manifest state `default`; description unchanged. GAP: p:plugins:check red mid-wave on U2/U3 citations of U1 scripts not yet written — assumed to clear when U1 lands                                                                                                                                                                                                                                                                                                                    | —        |
| 1    | U3 blueprint review | opus  | 1     | pass        | edit; DECIDED with no `node`, record `screens/<project>/<NNN>-<flow>/<platform>` in `blueprint.remaining` (deferred review, as SKILL.md does for others); render-stamp passage left as is. GAP: same mid-wave p:plugins:check red on U1 script citations                                                                                                                                                                                                                                                                                                                | —        |
| 1    | U2 mockups skill    | opus  | 1     | pass        | edit; DECIDED D12 stop is run-wide (any platform broken → no server on any); command lines as code blocks with backslash continuations. GAP: flow-scoped run, a stale page at a path routes.json no longer names has no owning flow, its BROKEN: lines hit the D12 stop, remedy a sweep; GAP: same mid-wave p:plugins:check red                                                                                                                                                                                                                                         | —        |
| 1    | U1 scripts          | opus  | 1     | pass        | edit; 22 test cases green. DECIDED a linked-Code Screens row is a HOME reference, skipped; comment on an unmatched path records code/route null, not 400; empty state → null; list page samples params with `1`; exit 2 bad args, 1 duplicate/no flow file. GAP: plan does not say how a linked HOME row is written — assumed a `[code](…)` cell                                                                                                                                                                                                                        | —        |
| 1    | R1 wave review      | opus  | 1     | findings(4) | mockups/SKILL.md:154 [U2] manifest `path\|screen\|state` vs generator `path\|code\|state`; delta-checks.md:73 [U4] 102 cols; project-claude.md:21 [U4] wording paraphrases ruling; assets/vwf-config.md:145 [—] rule 5 old tree path. CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                     | —        |
| 1    | U5 docs             | —     | —     | —           | GAP: Owns widened to `plugins/vwf/assets/vwf-config.md:145` (the "Mockup renders live in …/<NNN>-<flow>/<platform>/" passage) — R1 rule-5 finding in a file no unit owns, handed to U5 as DOCS FALSIFIED                                                                                                                                                                                                                                                                                                                                                                | —        |
| 1    | U2 mockups skill    | opus  | 2     | pass        | edit loop-back; manifest line now `<path> \| <code> \| <state>`; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 1    | U4 vwf prose        | opus  | 2     | pass        | edit loop-back; delta-checks.md:73 re-folded; DECIDED kept "the local URL the pass prints" — the sentence's subject is blueprint passes, whose §6a prints the URL itself, so "`/vwf:mockups` prints" would be false                                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | R1 wave review      | opus  | 2     | findings(1) | round-1 (a)(b) verified fixed, (c) U4 wording upheld; contested (cap 2 rounds): screen-review.md:55 [U3] 3 — after the D12 stop nothing records `screens/<project>/<NNN>-<flow>/<platform>` in `blueprint.remaining` or names the halt (minor). CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                           | —        |
| 2    | R1                  | opus  | 1     | findings(8) | review node; range 7bb533f8..5d1f6caf; map U1 31f47d73, U2 8a49ee5b, U3 534f6f5d, U4 4ebb9002 (5d1f6caf folder commit excluded); engines: code-review 10 findings (engine/R1-1-code.log), security-review 0 at conf>=8 (engine/R1-1-security.log); U1: matchPath falls through to [param] (high), POST no Origin, overlay cancels form submit, comment drops path, unquoted href; 3 findings on uncovered units dropped (screen-review.md:39, mockups/SKILL.md:201, :140); changes-required                                                                             | —        |
| 2    | R1                  | opus  | 1     | findings(3) | security node; U1: POST /comment and /done no Host/Origin/Content-Type check (medium); `/__mockups/` check case-sensitive on APFS (low); route cells with `.`/`..`/NUL/`__mockups` not rejected (low); approve                                                                                                                                                                                                                                                                                                                                                          | —        |
| 2    | U1 scripts          | opus  | 2     | pass        | edit loop-back from R1 round 1: fixed route wins over [param] sibling; Host/Origin 403 and non-JSON POST 415; reserved prefix case-insensitive; `.`/`..`/NUL/reserved routes rejected; form submits pass the overlay; comment records `path`; unquoted href read. DECIDED Host/Origin compared case-insensitively; findScreen ties broken at first differing segment; no comment on a form submit control. 30 tests green                                                                                                                                               | d0aa95ae |
| 2    | R1                  | opus  | 2     | findings(4) | review node; range 7bb533f8..d0aa95ae; engines: code-review 10 (engine/R1-2-code.log), security-review 0 at conf>=8 (engine/R1-2-security.log); U1: serve.mjs:410 `new URL` throws on malformed target, crashes server (medium); routes.mjs:159 case-only route collision unreported; serve.mjs:431 duplicate findScreen; serve.mjs:562 cannot comment on links/CTAs; plan gap: GET / when no screen has route `/` (G6); 3 engine findings on uncovered units dropped (screen-review.md:39, mockups/SKILL.md:208, and G2-G4 restatements); approve                      | —        |
| 2    | R1                  | opus  | 2     | findings(1) | security node; U1: serve.mjs:410 uncaught ERR_INVALID_URL ends the review server (low, availability) — cap-exempt, fixed; round-1 three findings verified fixed; approve                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 2    | U1 scripts          | opus  | 3     | pass        | edit loop-back from R1 round 2: path-only request parse, 400 on a non-path target, async handler wrapped (throw → 500, server lives); duplicate-route key lowercased; matchPath returns the screen; Alt/Option-click comments on links and submit controls. DECIDED `//[` and `//x/orders` are paths (404), not 400. 35 tests green                                                                                                                                                                                                                                     | a695ad88 |
| 2    | R1                  | opus  | 3     | findings(5) | review node; range 7bb533f8..a695ad88; engines: code-review 10 (engine/R1-3-code.log), security-review 0 at conf>=8 (engine/R1-3-security.log); U1: links.mjs:87 `/\` href passes as local; links.mjs:81 HREF_RE matches data-href/comments; routes.mjs:130 routeToken keeps punctuation; links.mjs:72 exact-case `__mockups` skip; lib/routes.mjs:221 duplicated validators; 2 findings on uncovered units dropped (screen-review.md:74, :59); plan gap G7. Convergence guard: 5 > 4 (round 2) — not converging, review loop ends; non-security U1 residuals contested | —        |
| 2    | R1                  | opus  | 3     | findings(1) | security node; U1: links.mjs:87 `/\evil.com` or tab-prefixed href passes the check while the browser goes off-site (low) — cap-exempt, looped back; round-2 serve.mjs:410 verified fixed; approve                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 2    | U1 scripts          | opus  | 4     | pass        | edit loop-back from R1 round 3 security: href with backslash/tab/CR/LF, or resolving to another origin, is BROKEN. DECIDED reused the "not a link inside the mockups" reason. 36 tests green                                                                                                                                                                                                                                                                                                                                                                            | 9024a1bd |
| 2    | R1                  | opus  | 4     | findings(6) | review node; range 7bb533f8..9024a1bd; engines: code-review 10 (engine/R1-4-code.log), security-review 0 at conf>=8 (engine/R1-4-security.log); U1: serve.mjs:285 DEL/C1 chars break comments.yaml; lib/routes.mjs:304 case-differing link accepted on APFS; serve.mjs:664 done() ignores non-ok; serve.mjs:500 no listen error handler; links.mjs:96 origin check dead; serve.mjs:523 per-page comment count; cap 4 reached — all contested (G8)                                                                                                                       | —        |
| 2    | R1                  | opus  | 4     | blocked     | security node; U1: links.mjs:83 entity-encoded href (`/&#x2F;evil.com` + root [param] folder) passes the check, browser leaves the server (low); serve.mjs:285 yamlString leaves DEL/C1/lone surrogates raw, comments.yaml unparseable (low). why: convergence guard — security count 1 (round 3) → 2 (round 4) did not strictly decrease; cap-exempt findings cannot take the contested exit, so the run pauses (Pause Conditions: non-converging cap-exempt finding)                                                                                                  | —        |

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
