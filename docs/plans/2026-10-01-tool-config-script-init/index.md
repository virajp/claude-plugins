---
type: vwf-change-plan
title: init's task-library passes and hygiene assets move onto the tool-config
  script
requires: [ docs/plans/2026-10-01-tool-config-script-hygiene ]
backlog: []
backlog_pieces: []
---

# Plan — init's task-library passes and hygiene assets move onto the script (2026-10-01)

## Status

**APPROVED**

APPROVED 2026-10-01 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| After landing: `/vwf:backlog close B80`           | run     |
| Release stackgen publicly                         | major   |
| Release vwf publicly                              | minor   |
| Release site publicly                             | patch   |

`run` steps run on a green landing without a prompt; staged plugins load in a
restarted session. Release rows are intent: the chain releases at its end, and a
project is bumped once per level since its last release (packs too).

## Goal

The mechanical part of `vwf:init`'s task-library passes and its hygiene assets
run on tool-config's script; init keeps the questions, relays rows and makes the
commit. Plan 4 (last) of the chain agreed 2026-10-01; requires plan 3. Closes
B80 as superseded after landing.

User rulings, verbatim: *"Do not touch this repo, only make changes in the vwf
plugin"*, clarified as both plugins, no repo files; installer graphify wiring is
*"job of skills. Installer will only install these plugins using `claude` cli"*
— parked as its own plan.

## Facts the survey established

(`TC` = `plugins/stackgen/skills/tool-config`; lines pre-chain.)

- Passes: `plugins/vwf/skills/init/references/existing-repo.md` pass 3
  `:288-340`, pass 4 `:342-355`, pass 5 `:357-445`, pass 8 `:657-736`, pass 9
  `:738-783`; `_default` `new-repo.md:501-520`; §9 `mise run init`
  `new-repo.md:537-580` (redundant: `setup/all` declares `depends=["init"]`).
- Legacy names table `TC/references/mise.md:1094-1132`; mandatory set
  `:658-681`; ids slug rule `plugins/stackgen/assets/ids.md:12-18`.
- No bash function-definition parser exists anywhere in the repo.
- `_default` prose (own line) contradicts the shape it says to copy
  (`placeholder_notice`).
- Hygiene assets
  `plugins/vwf/skills/init/assets/hygiene/{CONTRIBUTING.md,SECURITY.md,licenses/}`
  and the readme stub (`init/references/readme-and-license.md`) carry no lock
  record (B80 item 1).
- B80 item 2 `plugins/vwf/skills/doctor/references/code-intelligence.md:37`;
  item 6 `plugins/stackgen/stacks/package-manager/swiftpm/conventions.md:35`;
  item 7 `plugins/stackgen/assets/pack-format.md:40`,
  `plugins/stackgen/assets/output-tree.md:405`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:135-136`,
  `plugins/stackgen/stacks/bundles/fnox.md:54-55`; item 8
  `TC/assets/mise/.config/mise/tasks/setup/precommit:45-50,159-161`.

## Assumed decisions — confirm or override at review

| #  | Decision       | Ruling                                                                                                                                                                                                    | Rejected                       | Unit       |
| -- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------- |
| I1 | Passes' owner  | tool-config verbs: `mise migrate-tasks --ids …` (passes 3, 5, 8, 9 and `_default` creates) and `mise audit-shebangs` (pass 4, flag rows only; listing shell-specific syntax stays LLM). init relays rows. | a vwf init script              | I1, I5     |
| I2 | `_default`     | Fixed template: bash shebang, `#MISE description="<id> — no project tasks yet"`, helper `source`, prints "no project tasks yet", exit 0, mode 755, slot marker kept, no `hide=true`.                      | placeholder notice, hidden     | I1         |
| I3 | Pass 5 parser  | A node bash-function scanner (braces, heredocs, quotes); a file it cannot parse is a `needs-edit` row.                                                                                                    | —                              | I1         |
| I4 | Hygiene        | A `hygiene` tool lands `CONTRIBUTING.md`, `SECURITY.md`, the licence and the readme stub from `all` keys `--license`, `--security-contact`, `--brief`, recorded and drift-checked. init only asks.        | record via a verb; doctor diff | I3, I5     |
| I5 | §9             | init's `mise run init` step is dropped.                                                                                                                                                                   | —                              | I5         |
| I6 | B80 2, 6, 7, 8 | doctor remedy `MISE_ENV=dev mise run setup:precommit`; swiftpm line ≤ 80 cols; stale passages fixed; `setup/precommit` strips graphify's raw hooks before unsetting `core.hooksPath`.                     | —                              | I2, I5, I6 |
| I7 | Out            | B80 item 5 (this repo's file) dropped; item 9 parked with the installer plan.                                                                                                                             | —                              | —          |
| I8 | Review row     | Runnable code lands.                                                                                                                                                                                      | —                              | I7         |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                  | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| I1 | 1    | [01-task-verbs.md](01-task-verbs.md)         | edit   | `plugins/stackgen/skills/tool-config/scripts/lib/{cli,schema,bash}.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/tools/mise.mjs`, `scripts/src/tool-config-tasks.test.ts`, `scripts/src/fixtures/tool-config/tasks/**`                                                                                                                                       | —          | pending |        |
| I2 | 1    | [02-precommit-task.md](02-precommit-task.md) | edit   | `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/precommit`                                                                                                                                                                                                                                                                                  | —          | pending |        |
| I3 | 2    | [03-hygiene-tool.md](03-hygiene-tool.md)     | edit   | `plugins/stackgen/skills/tool-config/assets/hygiene/**` (new), `plugins/stackgen/skills/tool-config/scripts/lib/tools/{index,hygiene}.mjs`, `scripts/src/tool-config-hygiene-files.test.ts`, `scripts/src/tool-config-{mise,gates,hygiene}.test.ts`, `scripts/src/fixtures/tool-config/**`                                                                            | I1, I2     | pending |        |
| I4 | 2    | [04-checker.md](04-checker.md)               | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                   | I1         | pending |        |
| I5 | 3    | [05-vwf.md](05-vwf.md)                       | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/{new-repo,existing-repo,readme-and-license}.md`, `plugins/vwf/skills/init/assets/hygiene/` (deleted), `plugins/vwf/skills/doctor/references/code-intelligence.md`                                                                                                                             | I3, I4     | pending |        |
| I6 | 3    | [06-stackgen.md](06-stackgen.md)             | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/{mise,hygiene}.md`, `plugins/stackgen/assets/{pack-format,output-tree}.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`, `plugins/stackgen/stacks/bundles/fnox.md`, `plugins/stackgen/stacks/package-manager/swiftpm/conventions.md` | I3         | pending |        |
| I7 | 4    | [07-review.md](07-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                                                     | I2, I3, I4 | pending |        |
| I8 | 5    | [08-docs.md](08-docs.md)                     | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{stackgen-plugin,vwf-plugin,plugin-authoring}/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-01-*.md` (new files only)                                                                                                                                                                  | I5, I6, I7 | pending |        |
| I9 | 6    | [09-gates-and-bump.md](09-gates-and-bump.md) | edit   | `site/package.json`, `plugins/{stackgen,vwf}/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, the `version:` line of `plugins/stackgen/stacks/package-manager/swiftpm/pack.yaml` and its bundle pins, `plugins/stackgen/stacks/inventory.md`                                                                                                           | I8         | pending |        |

`TC` = `plugins/stackgen/skills/tool-config`. No unit touches this repo's own
`.config/`.

## Shared-file rule

| File                                         | Owner       |
| -------------------------------------------- | ----------- |
| versions, `marketplace.json`, `inventory.md` | I9 only     |
| plans 1–3's suites and fixtures              | I3 (wave 2) |
| human-facing docs                            | I8 only     |

## Waves

1. I1, I2 — script verbs vs one asset task.
2. I3, I4 — the hygiene asset tree lands with the checker allowlist that admits
   it.
3. I5, I6 — vwf prose (and the old hygiene copies removed) vs stackgen prose.
4. I7 review. 5. I8 docs. 6. I9 bump.

## Wave gate

With `MISE_ENV=dev`:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review and every `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                           |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | restarted session picks it up                                                                   |
| `/vwf:backlog close B80`   | run  | reason: `superseded by the tool-config script chain (plans 1–4); item 5 dropped, item 9 parked` |

## Gates the orchestrator keeps

Scratch brownfield repo (isolated `HOME`/`MISE_*`, trusted path) with a legacy
task name, an inline `[tasks.x]`, a drifted `_scripts/_helpers` defining one
unmapped function: `mise migrate-tasks --ids web` returns the rename, the
sidecar create with that function, the `_default` create; applied, a second run
returns no rows; `all --license MIT --security-contact a@b.c --brief x` lands
the hygiene files and `check` is clean.

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

- This repo's own files (B80 item 5 dropped).

## Parked

- Installer: remove graphify wiring; it only installs plugins via the `claude`
  CLI (with B80 item 9).
- `/release` now that plans 0–4 cover the chain.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/vwf:execute docs/plans/2026-10-01-tool-config-script-init

or let the queue pick it, by priority:

/vwf:execute next
