---
type: vwf-change-plan
title: The installer installs plugins only — graphify wiring removed
requires: []
backlog: []
backlog_pieces: []
---

# Plan — The installer installs plugins only (2026-10-01)

## Status

**COMPLETE**

COMPLETE 2026-10-02 — 260d6842 397412f2 42740ee1 98fdad4f

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

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                  | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| J1 | 1    | [01-installer.md](01-installer.md)           | edit   | `installer/src/**`                                                                                                                                                                                                                                    | —          | green  | 260d6842 |
| J2 | 2    | [02-review.md](02-review.md)                 | review | —                                                                                                                                                                                                                                                     | J1         | green  |          |
| J3 | 3    | [03-docs.md](03-docs.md)                     | edit   | `installer/CLAUDE.md`, `CLAUDE.md`, `readme.md`, `.claude/docs/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-01-installer-plugins-only.md` (new), `package.json` + `installer/package.json` (description only, widened at run time) | J2         | green  | 42740ee1 |
| J4 | 4    | [04-gates-and-bump.md](04-gates-and-bump.md) | edit   | `package.json` (version only)                                                                                                                                                                                                                         | J3         | green  | 98fdad4f |

## Shared-file rule

| File           | Owner                                               |
| -------------- | --------------------------------------------------- |
| `package.json` | J4 (version); J3 (description, widened at run time) |
| docs           | J3 only                                             |

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

| Wave | Unit              | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Commit   |
| ---- | ----------------- | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight         | —     | 1     | pass        | wave gate 9/9 green; doctor blocking predicates clear (mise, graphify CLI, main-checkout graph); no .config/vwf.yaml — no stack, LSP n/a (no code unit)                                                                                                                                                                                                                                                                                                           | —        |
| 0    | preflight         | —     | 1     | skipped     | conventions fetch — why: no code unit; format check — why: no covers:; mempalace down — journal skipped                                                                                                                                                                                                                                                                                                                                                           | —        |
| 1    | J1 installer      | opus  | 1     | pass        | edit; graphify.ts + test deleted, install step and uninstall items (graphify hooks, graph, .graphifyignore) removed, dead `delete` removal kind dropped, comments cleaned; DOCS FALSIFIED: installer/CLAUDE.md, CLAUDE.md, site installer/{index,internals,targets,usage}.md                                                                                                                                                                                      | 260d6842 |
| 1    | R1 wave review    | opus  | 1     | pass        | 6 lines: 5 rule-5 docs passages, all in J3 Owns, handed to J3 as DOCS FALSIFIED (readme.md:44,383,403,421; site plugins/vwf.md:33,40; .claude/docs/repo-shape.md:92,96; .claude/docs/installer/packaging.md:62; receipts.md:14); 1 accepted (dead delete kind within edit 2); CONTRACT clean, RULINGS clean — no loop-back                                                                                                                                        | —        |
| 1    | wave gate         | —     | 1     | pass        | 9/9 green (code:precommit green on re-run after reformat); no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 2    | J2 security       | opus  | 1     | pass        | range 3188d428..1a6ed67d, file list installer/src/* → J1; engine /security-review: none; reviewer: removal only shrinks attack surface                                                                                                                                                                                                                                                                                                                            | —        |
| 2    | J2 review         | opus  | 1     | findings(3) | range 3188d428..1a6ed67d; (J1) refold uninstall.ts:37, index.ts:10, receipt.ts:15, uninstall.ts:138-141; (J1) add enumerate test: project plugin row tracked when git tracks .claude/settings.json; (J1) runTool only called with claude — inline or reword doc; routed: package.json:4 + installer/package.json:5 description (out of range, no owner) → J3; dismissed: engine 1/5 (no undo for 1.0.x graphify hooks/user wiring) per ruling J2, engine 3/4/9    | —        |
| 2    | orchestrator      | —     | —     | pass        | GAP: J3 Owns widened to the description field of package.json and installer/package.json — J2 review: both still say the installer wires graphify; no unit owned them, plan Goal authorises                                                                                                                                                                                                                                                                       | —        |
| 2    | J1 installer      | opus  | 2     | pass        | loop-back from J2 r1: comments refolded (uninstall/index/receipt), enumerate test for tracked .claude/settings.json added, runTool doc reworded (bin param kept); vitest installer 142/142                                                                                                                                                                                                                                                                        | 397412f2 |
| 2    | J2 security       | opus  | 2     | pass        | range 3188d428..397412f2; engine none; fix commit changes no running code                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 2    | J2 review         | opus  | 2     | findings(3) | range 3188d428..397412f2; (J1) refold still incomplete (receipt.ts:16, uninstall.ts:40 orphan, uninstall.ts:499, report.ts:35); (J1) enumerate doc :200-202 "where its root is"; (J1) runTool doc vs generic bin; resolved: tracked-settings test; dismissed engine 1 (orchestrator), 2/4 (routed), 3 (unchanged behaviour), 6 (not worth it). Convergence guard: 3→3 not strictly decreasing, refold resurfaced — loop ended, 3 findings contested (oscillation) | —        |
| 2    | R2 wave review    | opus  | 1     | pass        | 0 findings over 397412f2; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | wave gate         | —     | 1     | pass        | 9/9 green (code:precommit reformatted only this index.md, green on re-run); no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                         | —        |
| —    | acceptance        | —     | —     | skipped     | why: no covers: — no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| —    | ux                | —     | —     | skipped     | why: no covers: — no Screens contract                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| —    | reconcile         | —     | —     | skipped     | why: no covers: and no code unit — no stamps, nothing to persist                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 3    | J3 docs           | opus  | 1     | pass        | edit; installer/CLAUDE.md, CLAUDE.md, readme.md, site installer/{index,internals,targets,usage}.md, site plugins/vwf.md:33, .claude/docs/{repo-shape,installer/packaging,installer/receipts}.md: installer does plugins + --uninstall only, J2 leftovers note; package.json + installer/package.json description; decision doc added; DECIDED: stackgen.md:1161 and doctor/how-to graphify mentions kept (setup:ai/vwf, not installer)                            | 42740ee1 |
| 3    | R3 wave review    | opus  | 1     | pass        | 0 findings; CONTRACT clean, RULINGS clean; docs sweep finds no remaining installer-graphify claim                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 3    | wave gate         | —     | 1     | pass        | 9/9 green (code:precommit reformatted once, green on re-run); no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 4    | J4 gates and bump | opus  | 1     | pass        | p:i:version -- --minor: package.json 1.0.2 → 1.1.0 (pnpm version --no-git-tag-version, no tag); 9/9 gate lines green                                                                                                                                                                                                                                                                                                                                              | 98fdad4f |
| 4    | R4 wave review    | —     | 1     | pass        | diff is the one version line in package.json — within J4 Owns, matches J3 ruling; no reviewer dispatched                                                                                                                                                                                                                                                                                                                                                          | —        |
| 4    | wave gate         | —     | 1     | pass        | 9/9 green (run by J4 over the finished tree)                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| —    | reconcile         | —     | 1     | pass        | final wave gate 9/9 green over finished tree; kept gates 2/2: grep graphify installer/src empty, built --help (1.1.0) names no graphify                                                                                                                                                                                                                                                                                                                           | —        |

## Gaps surfaced during execution

- **J2 oscillation (convergence guard, not the contract):** after 2 rounds three
  cosmetic J1 findings stand `contested` — comments in
  `installer/src/{receipt,uninstall,report}.ts` still past the ~80-column fold;
  `enumerate` doc at `uninstall.ts:200-202` still says git answers "where its
  root is"; `runTool` doc says "Drive Claude's CLI" but keeps a generic `bin`.
  Non-blocking.
- **Ruling J2, deliberate:** `--uninstall` no longer lists raw graphify git
  hooks or the user-level `graphify install --platform claude` wiring that
  installers 1.0.0-1.0.2 wrote; both engines flagged it, both reviewers
  dismissed it as the ruling. Revisit only if the user wants an undo path.

## Launch

Run in a fresh session:

/vwf:execute docs/plans/2026-10-01-installer-plugins-only

or let the queue pick it, by priority:

/vwf:execute next
