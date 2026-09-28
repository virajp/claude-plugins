---
type: vwf-change-plan
title: mempalace HTTP daemon — every doc, skill and agent describes the server
  vwf ships, and doctor reports it down
requires: []
backlog: []
backlog_pieces: []
---

# Plan — mempalace HTTP daemon (2026-09-29)

## Status

**RUNNING**

RUNNING since 2026-09-29T00:45 in .worktrees/2026-09-29-mempalace-http-daemon

## Consent

| Action                                            | Granted                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                  |
| After landing: `mise run p:plugins:local`         | run                                                                                  |
| After landing: `mise run code:merge:main`         | run                                                                                  |
| After landing: `mise run p:plugins:release`       | run                                                                                  |
| After landing: `mise run p:site:release`          | run                                                                                  |
| Release vwf publicly                              | patch — `20.0.0` → `20.0.1`, by editing `plugins/vwf/.claude-plugin/plugin.json`     |
| Release stackgen publicly                         | none — untouched                                                                     |
| Release site publicly                             | yes — `site-v1.1.47`; `site/package.json` already reads `1.1.47`, so no version bump |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, every doc, skill and agent in the repo describes vwf's
mempalace server as it ships — an HTTP daemon at `127.0.0.1:8765` the user runs
under any supervisor, its environment set on that supervisor, running before a
session starts — and `/vwf:doctor` reports the daemon unreachable as a
degradation with the remedy. vwf ships as `20.0.1` and the site as
`site-v1.1.47`.

Framing: commit `3a62fa48` (2026-09-26) switched
`plugins/vwf/.claude-plugin/plugin.json` to
`{"type": "http", "url": "http://127.0.0.1:8765/mcp"}` and changed nothing else;
it shipped in `vwf-v20.0.0`. A survey of the site against `site-v1.1.46..HEAD`
on 2026-09-29 found this the only drift.

**Reversal:** this reverses the 2026-09-23 stdio decision
(`docs/memory/decisions/2026-09-23-mempalace-stdio-settings-env.md`, plan
`docs/plans/archived/2026-09-23-mempalace-stdio-settings-env/`, decision 1 "Keep
stdio", which rejected "revert to the HTTP daemon"). The user confirmed at the
interview: "HTTP is intended" for every vwf user.

## Facts the survey established

- **The manifest** is already HTTP (`plugins/vwf/.claude-plugin/plugin.json`
  :44-47). No test asserts the stdio shape; `scripts/src/check.test.ts`
  :2098-2112 already uses the same `type: http` URL as a synthetic fixture.
- **Stale passages** (line numbers may have moved):
  - `plugins/vwf/skills/mempalace/SKILL.md` :59-60 (server a child of each
    session, env from settings.json), :75-90 (env block in
    `~/.claude/settings.json`), :102-108 ("### The MCP server" — stdio via
    `mise x -- mempalace-mcp`, no daemon), :131-135 ("the env block above").
  - `site/src/content/docs/plugins/mempalace.md` :66, :123-143 ("## Running the
    server (stdio)", "Stdio is chosen for zero setup"), :145-151 (shape table:
    "stdio child", "spawned by the session"), :174-176, :209-210 ("vwf's launch
    line passes no --backend"), :254-264 ("What Claude's settings env expands"),
    :307-318 (upstream stdio server — still valid, but frames vwf's as the only
    other).
  - `site/src/content/docs/plugins/vwf.md` :90-98, :206-208, :3741-3748 ("###
    mempalace — memory, over stdio").
  - `site/src/content/docs/how-to/greenfield/single-repo.md` :45-47 (MEMPALACE_*
    in the settings.json env block).
  - `.claude/skills/vwf-plugin/references/dependencies.md` :177-201, :203-217
    ("This reverses an earlier ruling" — the stdio one), :219-222, :230.
  - `.claude/agents/target-verifier.md` :113-115.
  - `scripts/src/check.ts` :2356-2362 — the `invocations()` doc comment says
    vwf's mempalace entry is `sh -c "mise x -- mempalace-mcp"`; the code already
    skips http servers.
  - `.claude/skills/plugin-authoring/references/checks.md` :342-344 is generic
    ("an http server has no runner") and still true.
  - No transport text in `readme.md`, `CLAUDE.md`, `installer/`,
    `plugins/vwf/assets/memory.md`, setup or init.
- **Anchors.** `mempalace.md#running-the-server-stdio` is linked from
  `how-to/greenfield/single-repo.md:47` and
  `how-to/operate/sessions-and-handoff.md:85`. The 2026-09-23 plan broke the
  earlier `#running-the-server-http-daemon` anchor the same way;
  `p:site:check`'s link checker catches a missed one.
- **Doctor** never probes transport: §7 of
  `plugins/vwf/skills/doctor/references/harness-and-memory.md` :21-96 checks the
  mempalace.yaml files, the room set and the docs/memory mirror; :95-96 treat an
  unreachable server as context, not a finding; reachability is inferred from
  whether the MCP tools answer (`doctor/SKILL.md` :159, :277).
- **The 2026-09-23 plan's Parked list:** the lockless `hallways.json` race under
  stdio (moot with one daemon — see Parked); stale Cursor/OpenCode references in
  `vendor/mempalace/README.md:36-51`; whether the docs should show a Qdrant
  compose file instead of a bare `docker run`.
- **Gates:** `p:plugins:{marketplace,inventory,check,shellcheck}`,
  `p:site:check`, `code:precommit`, and vitest via `pnpm vitest run`.
  `plugins/**/*.md` is not formatted — fold by hand; site, `.claude/` and root
  docs are dprint-formatted.
- **Commit types:** `feat`, `fix`, `refactor`, `docs`, `ops`, `merge`; no
  scopes.
- **Versions:** vwf `20.0.0` (tagged `vwf-v20.0.0`), stackgen `2.0.0` (tagged),
  site `1.1.47` in `site/package.json`, last tag `site-v1.1.46`.

## Assumed decisions — confirm or override at review

| # | Decision             | Ruling                                                                                                                                                                                                                                                                                                                                                                                | Rejected                                      | Unit     |
| - | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------- |
| 1 | Transport            | vwf's mempalace server is an HTTP daemon at `127.0.0.1:8765` for every vwf user, as the manifest declares.                                                                                                                                                                                                                                                                            | reverting the manifest to stdio               | U1 U2 U3 |
| 2 | How docs describe it | Generically: the command `mempalace-mcp --transport http --host 127.0.0.1 --port 8765`; its env — `MEMPALACE_BACKEND` and `MEMPALACE_QDRANT_URL` always set together, and `MEMPALACE_PALACE_PATH` — set on the supervisor that runs it, not in `~/.claude/settings.json`; it must be running before a Claude session starts; pitchfork and launchd named as examples of a supervisor. | pitchfork-specific steps; vwf shipping a task | U1 U3    |
| 3 | Doctor               | Doctor adds a degradation check: `curl -s -o /dev/null --max-time 2 http://127.0.0.1:8765/mcp`; any HTTP response is reachable, a refused connection or a timeout is a degradation whose remedy is decision 2's start command and env.                                                                                                                                                | docs only; a blocking finding                 | U1       |
| 4 | Anchor               | The `mempalace.md` heading "Running the server (stdio)" becomes "Running the server (HTTP daemon)", and both inbound links follow.                                                                                                                                                                                                                                                    | keeping a stale heading for its anchor        | U3       |
| 5 | Decision record      | The 2026-09-23 record stays as history; a new `docs/memory/decisions/2026-09-29-mempalace-http-daemon.md` supersedes it, quoting the user's ruling.                                                                                                                                                                                                                                   | editing the old record                        | U3       |
| 6 | Review row           | None: every change is prose, a skill reference or a code comment — nothing that executes; the wave review is the check.                                                                                                                                                                                                                                                               | a `Kind: review` row                          | —        |
| 7 | Comments             | Any comment or sentence a unit adds is one sentence, wrapped at the fold.                                                                                                                                                                                                                                                                                                             | —                                             | U1 U2 U3 |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                            | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-vwf-skills.md](01-vwf-skills.md)           | edit | `plugins/vwf/skills/mempalace/**`, `plugins/vwf/skills/doctor/**`                                                               | —          | pending |        |
| U2 | 1    | [02-checker-comment.md](02-checker-comment.md) | edit | `scripts/src/check.ts`                                                                                                          | —          | pending |        |
| U3 | 2    | [03-docs.md](03-docs.md)                       | edit | `site/src/content/docs/**`, `.claude/**`, `docs/memory/decisions/2026-09-29-mempalace-http-daemon.md`, `CLAUDE.md`, `readme.md` | U1, U2     | pending |        |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md)   | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                     | U3         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                      | Why it collides  | Owner   |
| ----------------------------------------- | ---------------- | ------- |
| vwf `plugin.json`                         | version file     | U4 only |
| `.claude-plugin/marketplace.json`         | generated        | U4 only |
| every human-facing doc outside `plugins/` | n units, one doc | U3 only |

## Waves

- **Wave 1 — U1, U2.** Disjoint paths: vwf's mempalace and doctor skills, and
  one comment in the checker.
- **Wave 2 — U3**, docs. **Wave 3 — U4**, gates and bump.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

every line with `MISE_ENV=dev` exported, plus the wave review, plus every report
read for `UNRESOLVED:`.

## After landing

| Step                         | Mode | Notes                                                                                                                                                                         |
| ---------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local`   | run  | stages vwf on this machine; picked up by a **restarted** session                                                                                                              |
| `mise run code:merge:main`   | run  | merges `develop` into `main` and pushes; run from the main checkout on `develop`, clean and pushed                                                                            |
| `mise run p:plugins:release` | run  | on `main`, `--dry-run` first — it must list exactly `vwf-v20.0.1` — then the real run; return to `develop` after                                                              |
| `mise run p:site:release`    | run  | on `main`; tags `site-v1.1.47`, pushes, watches `site.yml`; then `gh release create site-v1.1.47 --verify-tag` with a note in the release skill's format; return to `develop` |

## Gates the orchestrator keeps

**Doctor probe**, after wave 1: run the probe exactly as U1's text in
`doctor/references/harness-and-memory.md` writes it, against
`http://127.0.0.1:8765/mcp` on this machine (the daemon is running) — pass: it
classifies it reachable; then against `http://127.0.0.1:1/mcp` — pass: it
classifies it a degradation. Record both in the Run log; a failure goes back to
U1.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc it does not own, never adds a dependency this file
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never runs `git checkout`, `git restore` or a
formatter's `--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- **The user's machine** — pitchfork config, the Qdrant stack, the global mise
  `mempalace:*` tasks. The docs stay generic (decision 2).
- **The upstream mempalace plugin** — its own stdio server stays the user's to
  toggle off; the existing advice stands, reworded only where it frames vwf's
  server as stdio.
- **Vendored mempalace** (`plugins/vwf/vendor/**`).
- **stackgen** and the installer — untouched.

## Parked

- The 2026-09-23 plan's `hallways.json` race under stdio — closed by this plan:
  one daemon serialises the writes in-process.
- Still parked from 2026-09-23: stale Cursor/OpenCode references in
  `plugins/vwf/vendor/mempalace/README.md:36-51`; whether the docs should show a
  Qdrant compose file instead of a bare `docker run`.

## Run log

| Wave | Unit               | Model | Round | Outcome     | Detail                                                                                                                                                                                                        | Commit |
| ---- | ------------------ | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight          | —     | 1     | pass        | all 7 wave gate lines green; doctor: repo has no `.config/vwf.yaml`, so no checks ran, none blocking; no `code` unit, so LSP and conventions skipped; no `covers:`, format check skipped                      | —      |
| 1    | U2 checker-comment | opus  | 1     | pass        | edit: invocations() comment names the http URL; DECIDED kept the no-runner sentence; GAP none                                                                                                                 | —      |
| 1    | U1 vwf-skills      | opus  | 1     | pass        | edit: mempalace skill describes the HTTP daemon, env on the supervisor; doctor §7 adds the curl reachability predicate; DECIDED bold-led paragraph not numbered item, remedy adds a session restart; GAP none | —      |
| 1    | doctor probe       | —     | 1     | pass        | orchestrator gate: U1's curl line exits 0 against 127.0.0.1:8765 (reachable), 7 against 127.0.0.1:1 (degradation)                                                                                             | —      |
| 1    | R1                 | opus  | 1     | findings(3) | 2 fold findings in mempalace/SKILL.md :56 :62 → U1; `.claude/docs/plugins.md:12` still says stdio → handed to U3 as DOCS FALSIFIED (already in its Owns); CONTRACT clean; RULINGS clean                       | —      |
| 1    | U1 vwf-skills      | opus  | 2     | pass        | edit: re-folded the Qdrant bullet and daemon-env paragraph to ≤80 cols (line 56 was 80 chars, not 82 — em dash); GAP none                                                                                     | —      |
| 1    | R1                 | opus  | 2     | pass        | FINDINGS 0; CONTRACT clean; RULINGS clean                                                                                                                                                                     | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-29-mempalace-http-daemon

or let the queue pick it, by priority:

/vwf:execute next
