---
type: vwf-change-plan
title: The installer installs plugins only — graphify wiring removed
requires: []
backlog: []
backlog_pieces: []
---

# Plan — The installer installs plugins only (2026-10-01)

## Status

**APPROVED**

APPROVED 2026-10-01 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| Release installer publicly                        | minor   |

Release is intent: bumped here (`mise run p:i:version -- --minor`,
`1.0.2 → 1.1.0`), released with the tool-config chain via `/release`.

## Goal

`@virajp.dev/claude-plugins` installs and uninstalls plugins through the
`claude` CLI and nothing else. User: *"Installing graphify, creation of
`code:graph` task and using that in `pre-commit` config is job of skills.
Installer will only install these plugins using `claude` cli"*. Parked from
`docs/plans/2026-10-01-tool-config-script-init`; also retires B80 item 9.

## Facts the survey established

- Install step: `installer/src/graphify.ts` (60 lines, runs
  `graphify install --platform claude`; the repo's `setup:ai` task already does
  this), called at `installer/src/index.ts:46,184-185`; help text
  `installer/src/args.ts:146`; test `installer/src/graphify.test.ts`.
- Uninstall items: `installer/src/uninstall.ts:124-125,149,291-322` (graphify's
  git hooks, `graphify-out/`, `.graphifyignore`); test
  `installer/src/uninstall.test.ts`.
- Comments naming graphify: `index.ts:10`, `progress.ts:6`, `receipt.ts:14`,
  `report.ts:35`, `uninstall.ts:37`, `version.ts:19`.
- Docs: `installer/CLAUDE.md`, `CLAUDE.md` (*The installer CLI*), `readme.md`,
  `site/src/content/docs/installer/{index,internals,targets,usage}.md`,
  `site/src/content/docs/plugins/vwf.md` (installer mention).
- Installer version `1.0.2` (root `package.json`).

## Assumed decisions — confirm or override at review

| #  | Decision  | Ruling                                                           | Rejected                     | Unit |
| -- | --------- | ---------------------------------------------------------------- | ---------------------------- | ---- |
| J1 | Install   | No graphify step; the skills own graphify.                       | keep a soft-skipping step    | J1   |
| J2 | Uninstall | `--uninstall` lists no graphify item; repo files are the repo's. | keep the uninstall items     | J1   |
| J3 | Release   | Minor, bumped here, released with the chain.                     | release after landing; major | J4   |
| J4 | Review    | Runnable code changes.                                           | —                            | J2   |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                               | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | ------ |
| J1 | 1    | [01-installer.md](01-installer.md)           | edit   | `installer/src/**`                                                                                                                                                 | —          | pending |        |
| J2 | 2    | [02-review.md](02-review.md)                 | review | —                                                                                                                                                                  | J1         | pending |        |
| J3 | 3    | [03-docs.md](03-docs.md)                     | edit   | `installer/CLAUDE.md`, `CLAUDE.md`, `readme.md`, `.claude/docs/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-01-installer-plugins-only.md` (new) | J2         | pending |        |
| J4 | 4    | [04-gates-and-bump.md](04-gates-and-bump.md) | edit   | `package.json` (version only)                                                                                                                                      | J3         | pending |        |

## Shared-file rule

| File           | Owner   |
| -------------- | ------- |
| `package.json` | J4 only |
| docs           | J3 only |

## Waves

1. J1. 2. J2 review. 3. J3 docs. 4. J4 bump.

## Wave gate

With `MISE_ENV=dev`:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `pnpm exec tsc --noEmit -p installer`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review and every `UNRESOLVED:`.

## After landing

none

## Gates the orchestrator keeps

- `grep -rn -i graphify installer/src` prints nothing.
- `node bin/installer.mjs --help` (after the build) mentions no graphify.

## Unit contract

Each unit gets its ruling, its Owns ("touch nothing else"), the facts, the
shared-file rule, and returns only:

    CHANGED: <path> — <one line>
    DECIDED: <what> — <why>
    DOCS FALSIFIED: <path> — <passage>
    GAP: <gap and assumption>
    UNRESOLVED: <ruling needed>

No version bumps, generators, docs, dependencies or commits in a unit; delete
with `rm`; no `git checkout`/`restore` or formatter `--fix` outside Owns. Block
under 1,500 characters.

## Out of scope

- graphify behaviour in the plugins — the skills already own it.

## Parked

none

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/vwf:execute docs/plans/2026-10-01-installer-plugins-only

or let the queue pick it, by priority:

/vwf:execute next
