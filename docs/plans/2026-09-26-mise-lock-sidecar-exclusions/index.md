---
type: vwf-change-plan
title: mise lock sidecar exclusions — no formatter or hook rewrites
  .config/mise/locks/
requires:
  - docs/plans/2026-09-26-mise-conf-d-layout
backlog: [ B69 ]
backlog_pieces: []
---

# Plan — mise lock sidecar exclusions — no formatter or hook rewrites .config/mise/locks/ (2026-09-26)

## Status

**RUNNING**

RUNNING since 2026-09-26 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.claude/worktrees/2026-09-26-mise-lock-sidecar-exclusions

## Consent

| Action                                            | Granted                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                  |
| After landing: `mise run p:plugins:local`         | run                                                                                  |
| Release stackgen publicly                         | none — no bump; rides stackgen `1.34.0`, which `2026-09-26-mise-conf-d-layout` bumps |
| Release vwf publicly                              | none — untouched                                                                     |
| Release site publicly                             | none — not this time                                                                 |
| Release installer publicly                        | none — untouched                                                                     |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, no formatter and no pre-commit hook rewrites a file under
`.config/mise/locks/` — the committed sidecar tree whose digest `mise.lock`
records — in a shaped repo or in this one.

The framing: B69, from the gate-hardening run's gaps
(`docs/plans/archived/2026-09-25-gate-hardening`). Not a reversal. It requires
`docs/plans/2026-09-26-mise-conf-d-layout` (B1): both regenerate `inventory.md`
with their pack bumps, so they run in turn. The sidecar path is the same before
and after B1.

## Facts the survey established

- **Excluded today only by the linter**: the pre-commit pack's
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/linter.yaml:51-52`
  (`"**/.config/mise/locks/"`), documented at
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md:91-92`.
- **Not excluded**:
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json:18-20`
  and `.../dprint/config/.config/taplo.toml:15-17` (only `**/*-lock.json`,
  `**/*-lock.yaml`, `**/*.lock`);
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml:62-64`
  (the global `exclude` regex, the same three).
- **Checker rule 15**: the dprint `dprint.json`, `taplo.toml` and the pre-commit
  global `exclude` state one set after normalisation (anchors, `**/`, escapes,
  trailing `/` stripped), and the gitleaks `[allowlist] paths` is a subset of
  it. Adding one entry to all three keeps it green; gitleaks unchanged stays a
  subset.
- **This repo**: `.config/dprint.json:14-15` (lock excludes),
  `.config/taplo.toml`, `.config/pre-commit-config.yaml` carry no `locks` entry;
  no `.config/mise/locks/` tree exists yet.
- **mise pack prose already says the sidecar is never formatted**:
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md:61`,
  `.../mise/skills/mise/SKILL.md:103` — not falsified.
- **Trap**: a modified-but-unstaged `.config/pre-commit-config.yaml` aborts
  every commit, so this repo's unit is committed before any other.
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes. **Versions**: stackgen `1.33.0`.

## Assumed decisions — confirm or override at review

| # | Decision        | Ruling                                                                                                                                                                                                                                                                                                | Rejected                                                                         | Unit |
| - | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---- |
| 1 | The three lists | The dprint pack's `dprint.json` and `taplo.toml` excludes gain `**/.config/mise/locks/`; the pre-commit pack's global `exclude` gains the equivalent `(^\|/)\.config/mise/locks/` alternative.                                                                                                        | —                                                                                | U1   |
| 2 | Gitleaks        | Unchanged — per B69's security note, committed lock data is still scanned.                                                                                                                                                                                                                            | adding it to the gitleaks allowlist                                              | U1   |
| 3 | This repo       | This repo's `.config/dprint.json`, `.config/taplo.toml` and `.config/pre-commit-config.yaml` gain the same entry.                                                                                                                                                                                     | packs only                                                                       | U2   |
| 4 | Review row      | None: config lists, nothing runnable ships.                                                                                                                                                                                                                                                           | a `Kind: review` row                                                             | —    |
| 5 | Release         | No bump; rides stackgen `1.34.0` from B1.                                                                                                                                                                                                                                                             | a patch bump that collides with B1's bump in `plugin.json`                       | U4   |
| 6 | Pack bumps      | A pack whose content changes bumps its `pack.yaml` version, its bundle pin and `inventory.md` in one commit: dprint `1.1.2` → `1.1.3`, pre-commit `1.1.6` → `1.1.7`. This plan requires `docs/plans/2026-09-26-mise-conf-d-layout`, so the two regenerate `inventory.md` in turn, never concurrently. | leaving pack versions unchanged; running beside B1 (both rewrite `inventory.md`) | U4   |

## New dependencies

none

## Units

| Id | Wave | Unit file                          | Kind | Owns                                                                                                                                                                                                                                                                                                   | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | -------- |
| U1 | 1    | [01-packs.md](01-packs.md)         | edit | `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json`, `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/taplo.toml`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`                                                       | —          | green   | e1697f29 |
| U2 | 1    | [02-this-repo.md](02-this-repo.md) | edit | `.config/dprint.json`, `.config/taplo.toml`, `.config/pre-commit-config.yaml`                                                                                                                                                                                                                          | —          | green   | c0aa66c6 |
| U3 | 2    | [03-docs.md](03-docs.md)           | edit | `plugins/stackgen/stacks/toolchain-gate/dprint/conventions.md`, `plugins/stackgen/stacks/toolchain-gate/dprint/skills/**`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/skills/**`, `.claude/**`, `site/src/content/docs/**` | U1, U2     | pending |          |
| U4 | 3    | [04-gates.md](04-gates.md)         | edit | `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`, the `version:` line of the dprint and pre-commit `pack.yaml`, `plugins/stackgen/stacks/bundles/repo-gates.md`                                                                                                               | U3         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                            | Why it collides                                         | Owner   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------- | ------- |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`       | generated                                               | U4 only |
| the dprint and pre-commit `pack.yaml` `version:` lines, `bundles/repo-gates.md` | a version, its pin and the inventory land in one commit | U4 only |
| every human-facing doc                                                          | n units, one doc                                        | U3 only |

## Waves

- **Wave 1 — U1, U2.** Disjoint: the shipped payload and this repo's `.config/`.
  **Commit U2 first**: a modified, unstaged `.config/pre-commit-config.yaml`
  aborts every commit.
- **Wave 2 — U3**, docs. **Wave 3 — U4**, gates.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`. If
`docs/plans/2026-09-26-mise-conf-d-layout` has landed first, run every line with
`MISE_ENV=dev` exported.

## After landing

| Step                       | Mode | Notes                                                                               |
| -------------------------- | ---- | ----------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen at `1.33.0+N` on this machine; picked up by a **restarted** session |

## Gates the orchestrator keeps

**The sidecar survives the formatters**, after wave 1: in the worktree, create
`.config/mise/locks/probe/package.json` with deliberately unformatted JSON
(`{"a":1,  "b":2}`) and no trailing newline, `git add` it, run
`mise run code:format -- --fix` and `mise run code:precommit`; pass when the
file is byte-identical afterwards. Remove the probe with `rm` and unstage it
before the next commit.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **The gitleaks allowlist** — declined by B69 itself: committed lock data is
  still scanned.
- **The lock's own path** (`.config/mise.lock` → `.config/mise/mise.lock`) —
  B1's; `**/*.lock` already covers either.

## Parked

none

## Run log

| Wave | Unit      | Model | Round | Outcome | Detail                                                                                                                                                                                                                                                             | Commit   |
| ---- | --------- | ----- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight | —     | 1     | green   | wave gate green on the untouched tree with MISE_ENV=dev (conf-d-layout landed); doctor skipped beyond tooling presence — mise and graphify present; plan of edit units alone, no LSP or conventions step                                                           | —        |
| 1    | U1        | opus  | 1     | green   | three pack lists gain the sidecar entry, placed with the directory entries after .claude; taplo written `**/.config/mise/locks/**`, the file's directory form. GAP: unit said beside the lock globs and in the list's order convention — took the order convention | e1697f29 |
| 1    | U2        | opus  | 1     | green   | this repo's dprint, taplo and pre-commit lists gain the entry; taplo `/**` form, array expanded by taplo. GAP: verification named code:precommit, dispatch withheld it while U1 ran — orchestrator ran it at the wave gate                                         | c0aa66c6 |
| 1    | R1        | opus  | 1     | green   | wave review clean: rulings honoured, Owns respected, no drift, regex checked by re.search; no doc falsified, two passages incomplete for U3                                                                                                                        | —        |
| 1    | gate      | —     | 1     | green   | all seven wave gate lines                                                                                                                                                                                                                                          | —        |
| 1    | probe     | —     | 1     | green   | sidecar probe `.config/mise/locks/probe/package.json` byte-identical after code:format --fix and code:precommit; removed                                                                                                                                           | —        |
| 2    | U3        | opus  | 1     | green   | pre-commit and dprint conventions and the site's stackgen page name the sidecar in every formatter list; site set count fifteen to sixteen; rule 15 docs and mise docs needed no edit                                                                              |          |
| 2    | R2        | opus  | 1     | green   | wave review clean: sixteen-entry count verified against the three lists, Owns respected, nothing left falsified                                                                                                                                                    | —        |
| 2    | gate      | —     | 1     | green   | all seven wave gate lines                                                                                                                                                                                                                                          | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-mise-lock-sidecar-exclusions

or let the queue pick it, by priority:

/vwf:execute next
