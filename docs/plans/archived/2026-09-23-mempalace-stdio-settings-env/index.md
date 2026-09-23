---
type: vwf-change-plan
title: mempalace over stdio — the palace-path fix, and the docs that still
  describe a daemon
requires: []
backlog: []
---

# Plan — mempalace over stdio (2026-09-23)

## Status

**COMPLETE**

COMPLETE 2026-09-23 — 565fe128 6ada9044 08c22022 ea02abbc

## Consent

| Action                                            | Granted                                                                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                           |
| Release vwf publicly                              | patch — `19.43.1` → `19.43.2`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release site publicly                             | patch — `1.1.40` → `1.1.41` via `mise run p:site:version`; no release step                                                                    |
| Release stackgen publicly                         | none — untouched                                                                                                                              |
| Release installer publicly                        | none — untouched                                                                                                                              |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, vwf's mempalace MCP server opens the real palace whether
`MEMPALACE_PALACE_PATH` is written `~/.local/share/mempalace` or as an absolute
path, and every doc describes what vwf actually runs: a **stdio** server Claude
Code spawns per session, configured through the `env` block of
`~/.claude/settings.json` — not an HTTP daemon on `127.0.0.1:8765` under a
supervisor, and not mise `[env]`.

The defect: `plugins/vwf/.claude-plugin/plugin.json:47` runs
`sh -c "mise x -- mempalace-mcp --palace $MEMPALACE_PALACE_PATH --backend $MEMPALACE_BACKEND --allow-insecure-no-token"`.
The shell substitutes the variable but never expands a `~` inside a substituted
value, and mempalace 3.10.0 takes a `--palace` value as given — so `~/…` opens
`<cwd>/~/.local/share/mempalace`, and a `${HOME}/…` value (Claude's settings
`env` expands nothing) created a literal `${HOME}/` directory in this repo on
2026-09-23. mempalace **does** expand `~` when it reads `MEMPALACE_PALACE_PATH`
from the environment itself (`mempalace/config.py:927-932`). Dropping `--palace`
is the fix.

**A reversal.** `.claude/skills/vwf-plugin/references/dependencies.md:200-216`
records that vwf runs mempalace as one shared HTTP daemon and that "stdio is
still wrong": per-session servers race on `hallways.json`, a lockless
read-modify-write (`mempalace/hallways.py:86-146, 382` — still lockless in
3.10.0), and each holds its own embedder. Commit `9dbef1d1` (2026-09-23) moved
the manifest to stdio without docs; this plan **confirms stdio** — chosen for
zero setup, no daemon to supervise — and records the race and the per-session
embedder as known costs, with a revisit condition, in a decisions doc.

## Facts the survey established

- **The manifest** — `plugins/vwf/.claude-plugin/plugin.json:44-51`, the
  `mempalace` entry: `command: "sh"`, `args: ["-c", "<line above>"]`,
  `type: "stdio"`. context7's entry beside it (`:34-43`) is the only other
  server. vwf is at `19.43.1` (`:55`), unreleased since tag `vwf-v19.35.0`;
  `.claude-plugin/marketplace.json:54` already pins `vwf-v19.43.1`.
- **mempalace 3.10.0 behaviour**, verified on this machine: the env-var path is
  `os.path.abspath(os.path.expanduser(...))` (`config.py:927-932`); a `--palace`
  value is used verbatim (the MCP server reported
  `palace: <cwd>/~/.local/share/mempalace`); with no `--backend` flag the
  backend comes from `~/.mempalace/config.json` then `MEMPALACE_BACKEND`;
  `--allow-insecure-no-token` only concerns the HTTP transport. `repair` prints
  "repair is Chroma-only in this release" on a Qdrant palace — there is no
  in-tool re-embed for Qdrant. A palace records its embedder
  (`mempalace_embedder.json`), and opening it under another
  `MEMPALACE_EMBEDDING_MODEL` fails with `EmbedderIdentityMismatchError`.
- **Claude Code's settings `env`** passes values literally: `$HOME` and
  `${HOME}` are never expanded there. `~` survives to mempalace, which expands
  it — once `--palace` is gone.
- **No code probes the daemon.** Nothing curls `:8765` or `/healthz`; the
  checkpoint hook reads only `MEMPALACE_SAVE_INTERVAL` and
  `MEMPALACE_HOOKS_AUTO_SAVE`
  (`plugins/vwf/hooks/mempalace-checkpoint.sh:24,35`).
  `scripts/src/check.ts:1993-1997` carries a comment calling vwf's mempalace
  entry "a URL to a user-run daemon" — false now. `mise` is not in the checker's
  `TOOL_TOKENS` (`check.ts:1840`), so `mise x -- mempalace-mcp` passes the
  manifest-runner guard (`:2032-2049`). `check.test.ts:1575-1590` is a synthetic
  `type: http` fixture for the http-exempt path, not the real manifest — it
  stays. No test reads the real mempalace entry.
- **Passages the change falsifies** — (a) false, (b) stale framing:
  - `plugins/vwf/skills/mempalace/SKILL.md` — `:45-58` (b, supervisor framing),
    `:73-87` (a, mise `[env]`, `ALLOW_INSECURE` at `:81`), `:89-107` (a, "The
    MCP server daemon" section), `:130` (a, "without any further
    configuration").
  - `plugins/vwf/skills/mempalace-recall/SKILL.md` — `:24-27` (a, "the HTTP
    daemon"), `:87-89` (b, "check the daemon").
  - `plugins/vwf/vendor/mempalace/README.md` — `:29-35` (a, "declares the MCP
    server over HTTP in its own `plugin.yaml`"), `:54-57` (a, "neither is the
    shape vwf uses"), `:63-70` (a, "a supervised HTTP daemon that needs no
    flags").
  - "daemon" as a synonym for the server (b):
    `plugins/vwf/assets/memory.md:24,278`,
    `plugins/vwf/skills/setup/references/memory-tree.md:21`,
    `.claude/skills/vwf-plugin/references/assets.md:28`.
  - `.claude/skills/vwf-plugin/references/dependencies.md` — `:147-150`,
    `:175-181`, `:183-199`, `:201-216` (a; the last is the reversed ruling);
    `:218-233` stays true.
  - `.claude/agents/target-verifier.md:113-115` (b, "unconnected mempalace HTTP
    server").
  - `site/src/content/docs/plugins/mempalace.md` — `:64-77` (b), `:123-152` (a,
    section "Running the server (HTTP daemon)"), `:154-181` (a, the shape
    table's `127.0.0.1:8765` row and the pitchfork block; the Qdrant rows stay),
    `:200-204` (a, mise `[env]`), `:208-217` (b), `:253-285` (a/b, the
    supervisor-env trap; the `~` quoting lesson is history), `:288-296` (b,
    `/healthz`).
  - `site/src/content/docs/plugins/vwf.md` — `:87-98`, `:203-206`, `:3117`,
    `:3590-3597`, `:3635-3636`.
  - `site/src/content/docs/how-to/operate/sessions-and-handoff.md:76-85, 110` —
    and `:85` links `mempalace.md#running-the-server-http-daemon`, which breaks
    when that heading is renamed.
  - `site/src/content/docs/how-to/greenfield/single-repo.md:45-46` (a),
    `how-to/greenfield/cli-product.md:42` (b),
    `how-to/operate/production-feedback-loop.md:103, 316` (b).
  - Clean: `readme.md`, `CLAUDE.md`, `.claude/docs/`, `installer/**`,
    `plugins/stackgen/**`.
- **Gates.** `plugins.yml` runs marketplace, inventory and plugins `--check`,
  shellcheck, vitest and the npm-normalize test; `site.yml` runs `p:site:check`.
  Commit types (`.config/git-conventional-commits.yaml:3-10`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Recall.** `docs/memory/decisions/2026-08-13-mempalace-wiring-and-plan.md`
  holds the literal-`~` lesson from the pitchfork era; no backlog item covers
  this; the plan index is empty.

## Assumed decisions — confirm or override at review

| # | Decision                    | Ruling                                                                                                                                                                                                                                                                           | Rejected                                                                                   | Unit   |
| - | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| 1 | Transport                   | Keep stdio. Record the `hallways.json` race and the per-session embedder as known costs; revisit if mempalace adds a lock, or if lost hallway links ever show up                                                                                                                 | revert to the HTTP daemon at `127.0.0.1:8765`; stdio plus a lock or workaround (parked)    | U3     |
| 2 | Launch line                 | `mise x -- mempalace-mcp` — drop `--palace`, `--backend` and `--allow-insecure-no-token`, so mempalace reads `MEMPALACE_PALACE_PATH` itself and expands `~`                                                                                                                      | `${MEMPALACE_RUNNER:-mise x --} mempalace-mcp`, the context7 pattern; bare `mempalace-mcp` | U1     |
| 3 | Wrapper                     | Keep `command: "sh"` with `args: ["-c", …]`; only the argument string changes                                                                                                                                                                                                    | `command: "mise"` with the arguments split out                                             | U1     |
| 4 | Where the environment lives | The `env` block of `~/.claude/settings.json`: `MEMPALACE_BACKEND`, `MEMPALACE_QDRANT_URL`, `MEMPALACE_PALACE_PATH` as `~/.local/share/mempalace`, `MEMPALACE_MAX_BACKUPS`; `$HOME` and `${HOME}` never expand there. `MEMPALACE_MCP_HTTP_ALLOW_INSECURE_NO_TOKEN` is dropped     | mise `[env]` or the shell's startup script                                                 | U2, U3 |
| 5 | The embedder variables      | Documented as optional: `MEMPALACE_EMBEDDING_MODEL`, `MEMPALACE_EMBEDDING_DEVICE`. A palace is bound to the model it was built with; switching fails with `EmbedderIdentityMismatchError`; mempalace 3.10.0's `repair` cannot re-embed a Qdrant palace — dump and refile instead | leave them undocumented                                                                    | U2, U3 |
| 6 | The HTTP-daemon material    | Docs describe stdio only. The supervisor-env trap and the literal `~` / `${HOME}` lessons are kept once, in the new decisions doc                                                                                                                                                | keep "run it as a shared HTTP daemon instead" as a documented alternative                  | U2, U3 |
| 7 | Review row                  | None — the one non-prose change is a manifest argument string, proven by the orchestrator's stdio smoke test                                                                                                                                                                     | a `review` row over U1                                                                     | —      |
| 8 | The checker                 | Correct the stale comment at `scripts/src/check.ts:1993-1997`; leave the synthetic `type: http` fixture in `check.test.ts:1575-1590`, which tests the http-exempt path generically                                                                                               | rewrite the fixture to the stdio shape                                                     | U1     |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                    | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-manifest.md](01-manifest.md)             | edit | `plugins/vwf/.claude-plugin/plugin.json` (the `mempalace` entry only), `scripts/src/check.ts` (the comment at `:1993-1997` only)                                                                                        | —          | green  | 565fe128 |
| U2 | 1    | [02-vwf-skills.md](02-vwf-skills.md)         | edit | `plugins/vwf/skills/mempalace/SKILL.md`, `plugins/vwf/skills/mempalace-recall/SKILL.md`, `plugins/vwf/vendor/mempalace/README.md`, `plugins/vwf/assets/memory.md`, `plugins/vwf/skills/setup/references/memory-tree.md` | —          | green  | 6ada9044 |
| U3 | 2    | [03-docs.md](03-docs.md)                     | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/agents/target-verifier.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-23-mempalace-stdio-settings-env.md`        | U1, U2     | green  | 08c22022 |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md) | edit | `plugins/vwf/.claude-plugin/plugin.json` (the `version` only), `site/package.json`, `.claude-plugin/marketplace.json` (regenerated)                                                                                     | U3         | green  | ea02abbc |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `edit`; there is no `review` row (decision 7).

## Shared-file rule

| File                                                                                         | Why it collides                                    | Owner                                       |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`                                                     | U1 edits the `mempalace` entry; U4 bumps `version` | U1 in wave 1, U4 in wave 3 — never one wave |
| `site/package.json`, `.claude-plugin/marketplace.json`                                       | a version file and a generated file                | U4 only                                     |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**` | n units editing one doc                            | U3 only                                     |
| `docs/memory/decisions/2026-08-13-mempalace-wiring-and-plan.md`                              | the historical record; superseded, not edited      | nobody                                      |

## Waves

- **Wave 1** — U1 and U2: disjoint trees. U1 changes the launch line and a
  checker comment; U2 rewrites the plugin's own mempalace prose against the
  rulings, citing the launch line as decision 2 states it rather than reading
  U1's diff.
- **Wave 2** — U3, the docs unit.
- **Wave 3** — U4, gates and bump.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    pnpm vitest run
    pnpm exec tsc --noEmit -p scripts
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                      |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages vwf at `19.43.2+N` into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session loads it |

## Gates the orchestrator keeps

**The stdio smoke test**, run after U1's wave and again after U4's, from the
worktree. It launches the manifest's own command the way Claude Code does, from
an empty scratch directory, with the `~` form of the path:

    d=$(mktemp -d) && cd "$d"
    cmd=$(jq -r '.mcpServers.mempalace.args[1]' <worktree>/plugins/vwf/.claude-plugin/plugin.json)
    printf '%s\n' \
      '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' \
      '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
      '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"mempalace_status","arguments":{}}}' \
      | MEMPALACE_PALACE_PATH='~/.local/share/mempalace' timeout 180 sh -c "$cmd"

**Pass:** the `mempalace_status` reply names the palace as
`$HOME/.local/share/mempalace` — absolute, under the home directory — and
`test ! -e "$d/~"` holds. The reply may itself be an error (this machine's
palace currently mismatches its configured embedder); only the path is judged.
**Fail:** a palace path under `$d`, or a `~` directory created in `$d`.

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

- **The palace migration.** The dump and refile scripts in
  `~/Projects/tmp/palace-migrate/` and moving this machine's palace to
  `embeddinggemma` are the user's, outside the repo.
- **The user's dotfiles** — `~/.claude/settings.json`, the global mise config,
  the Qdrant compose stack.
- **A configurable runner.** Decision 2 keeps `mise x --`; the context7-style
  `${MEMPALACE_RUNNER:-…}` was offered and declined.
- **The synthetic `type: http` test fixture** in `check.test.ts` (decision 8).

## Parked

- **The `hallways.json` race under stdio.** Every session's server does a
  lockless read-modify-write of the palace's `hallways.json`
  (`mempalace/hallways.py:86-146, 382`, 3.10.0); two concurrent rebuilds drop
  entity links silently, last writer wins. Drawers in Qdrant are unaffected. The
  fix is a lock upstream in mempalace, or a vwf-side serialisation — its own
  plan, once either is chosen.
- **Stale target references in the vendored README** —
  `plugins/vwf/vendor/mempalace/README.md:36-51` still cites Cursor, OpenCode
  and an `opencode-plugin/` directory from before vwf became Claude-only.
- **The Qdrant setup the docs show.**
  `plugins/vwf/skills/mempalace/SKILL.md:37-42` and the site's `mempalace.md`
  show a bare `docker run`; the maintainer now runs Qdrant from a compose file
  via `mise bootstrap compose`. Whether the docs should show a compose file is a
  separate question.

## Run log

| Wave | Unit              | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                | Commit   |
| ---- | ----------------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight         | —     | 1     | pass        | node edit; wave gate 9/9 green (code:precommit green on 2nd pass after the status-line reflow); doctor blocking items clear (mise, graphify CLI, graph in main checkout; no vwf.yaml stack); no `code` unit, so no LSP or conventions step; format check skipped — no `covers:`; mempalace journal skipped — palace embedder mismatch | —        |
| 1    | U1 manifest       | opus  | 1     | pass        | node edit; launch line now `mise x -- mempalace-mcp`, check.ts comment rewritten; DECIDED none; GAP none (noted only the shared worktree's other diffs)                                                                                                                                                                               | 565fe128 |
| 1    | U2 vwf skills     | opus  | 1     | pass        | node edit; 5 files — settings.json `env` sample, stdio server section, recall server-down path, vendored README transport, daemon→server; DECIDED dropped the README's stale uv/graphify parenthetical inside the rewritten passage; GAP none                                                                                         | 6ada9044 |
| 1    | smoke             | —     | 1     | pass        | orchestrator stdio smoke test: palace resolved to `$HOME/.local/share/mempalace`, no `~` dir in scratch; reply error is the expected embedder mismatch                                                                                                                                                                                | —        |
| 1    | R1                | opus  | 1     | findings(6) | all U2: five fold-width lines over 80 (mempalace/SKILL.md:60,96; mempalace-recall/SKILL.md:27,90; vendor README:55,58 plus a stale wrapped span); SKILL.md:129 condition stated twice; CONTRACT clean, RULINGS clean; README parenthetical drop judged fine                                                                           | —        |
| 1    | U2 vwf skills     | opus  | 2     | pass        | node edit; R1 loop-back: all six fixed; DECIDED folded the Cursor bullet to 80 though its section uses one long line per bullet; left memory.md table row width as it was (one word swapped)                                                                                                                                          | 6ada9044 |
| 1    | R1                | opus  | 2     | pass        | all six round-1 findings resolved; both U2 DECIDED lines accepted; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                      | —        |
| 2    | U3 docs           | opus  | 1     | pass        | node edit; 11 files + new decisions doc; heading renamed to `Running the server (stdio)`, anchor re-pointed; DECIDED grep sweep in place of a docs-sync call (survey had listed targets); GAP `.claude/docs/plugins.md:12` said HTTP though the survey marked `.claude/docs/` clean — fixed inside Owns                               | 08c22022 |
| 2    | R2                | opus  | 1     | pass        | FINDINGS 0; CONTRACT clean (plugins.md:12 GAP fix accepted); RULINGS clean; no stale anchor, no daemon passage left outside history                                                                                                                                                                                                   | —        |
| —    | acceptance        | —     | 1     | skipped     | why: no `covers:` — no blueprint slice, no acceptance criteria                                                                                                                                                                                                                                                                        | —        |
| —    | ux                | —     | 1     | skipped     | why: no `covers:` — no Screens contract                                                                                                                                                                                                                                                                                               | —        |
| —    | reconcile         | —     | 1     | skipped     | why: no `covers:` — no stamps, registry or harness to reconcile; no `code` unit, nothing to persist                                                                                                                                                                                                                                   | —        |
| 3    | U4 gates and bump | opus  | 1     | pass        | node edit; site 1.1.40→1.1.41 via `p:site:version`, vwf 19.43.1→19.43.2 by hand, marketplace regenerated (pins `vwf-v19.43.2`); wave gate 9/9 green in-unit; DECIDED none; GAP none                                                                                                                                                   | ea02abbc |
| 3    | R3                | opus  | 1     | pass        | FINDINGS 0; CONTRACT clean; RULINGS clean; versions match Consent, marketplace diff is the generator's                                                                                                                                                                                                                                | —        |
| 3    | smoke             | —     | 1     | pass        | orchestrator stdio smoke test after the bump: palace `$HOME/.local/share/mempalace`, no `~` dir                                                                                                                                                                                                                                       | —        |
| —    | reconcile         | —     | 1     | pass        | final wave gate 9/9 over the finished tree (code:precommit green on 2nd pass — each first pass only reflows the orchestrator's Run log edits); orchestrator gate: stdio smoke test passed after waves 1 and 3                                                                                                                         | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-23-mempalace-stdio-settings-env

or let the queue pick it, by priority:

/vwf:execute next
