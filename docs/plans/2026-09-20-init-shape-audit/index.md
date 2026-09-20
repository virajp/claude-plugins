---
type: vwf-change-plan
title: init shape audit — what init lands, reads and ignores, per mode
requires: [ docs/plans/2026-09-20-setup-reshape-triggers ]
backlog: [ B28 ]
---

# Plan — init shape audit (2026-09-20)

## Status

**RUNNING**

RUNNING since 2026-09-20T09:06Z in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/plan/2026-09-20-init-shape-audit

## Consent

| Action                                            | Granted                                                  |
| ------------------------------------------------- | -------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                      |
| Release vwf publicly                              | none — no plugin file changes; the version does not move |
| Release stackgen publicly                         | none — untouched                                         |
| Release site publicly                             | none — untouched                                         |
| Release installer publicly                        | none — untouched                                         |

No after-landing step: nothing this plan lands is loaded by a session, so there
is nothing to stage.

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, `docs/memory/problems/` holds an evidence-based register of
everything `/vwf:init` lands or edits in each mode — greenfield blank,
greenfield with source, brownfield, and the members walk under each — what it
**reads from the repo before doing so**, what it **ignores**, how it behaves
when the path already exists, whether the landing is or should be
stack-conditional, and every duplicate or conflict path. A one-page summary
ranks the findings and names the candidates for the fix plan (D2), which is
planned from those named findings and not from the request text. No plugin
behaviour changes here; nothing is released.

Backlog item B28, its fourth piece, first half. The user's own observations that
aim this audit: init laid down a shape that **ignored what the repo already
had**; duplicate or conflicting entries appeared beyond the `.vscode` files; and
there are likely side effects not yet observed. The request also asks for
greenfield stack detection and "a config file with contents" instead of blind
copying — both are D2 questions this register must be able to answer.

Not a reversal. Requires `2026-09-20-setup-reshape-triggers` only for the
chain's ordering; it reads the init tree as the three earlier plans leave it.

## Facts the survey established

- Mode is decided per repo solely by the absence of `.config/` **and** the
  task-library directory (`plugins/vwf/skills/init/SKILL.md:173-184`); a repo
  with source but no layout is "new".
- A new repo gets no manifest survey and no language or framework detection —
  init "never reads a language manifest or a lockfile" (`SKILL.md:77-78`;
  `references/new-repo.md:3-5`); the three unconditional bundles land regardless
  (`new-repo.md:58-66`). Init does not read `.config/vwf.yaml`'s `stacks:` (the
  roster is read for the adapter plugin name only, `SKILL.md:227-233`);
  `new-repo.md:114-122` reads the **materializer lockfile** for language /
  package-manager / framework components to append ignore sections — on a fresh
  repo that lists nothing.
- Setup's blank-vs-code fork (`plugins/vwf/skills/setup/SKILL.md:161-166`) does
  not hand to init and passes it nothing; init is reached only via Step 0 and
  `reshape` with no arguments
  (`docs/memory/decisions/2026-09-06-init-behind-setup.md:102-103`).
- The landed set, by bundle: **mise** → `.config/mise.toml`, `mise.ci.toml`,
  `mise.dev.toml`, `mise.test.toml`, `.config/mise/tasks/**` (about 36 scripts),
  `vscode.d/mise.jsonc`; **repo-gates** → dprint (`.config/dprint.json`,
  `.config/taplo.toml`, root `dprint.json` shim,
  `vscode.d/dprint-editor.jsonc`), gitleaks (`.config/gitleaks.toml`), grype
  (`.config/grype.yaml`), pre-commit (`.config/pre-commit-config.yaml`,
  `.config/git-conventional-commits.yaml`, `vscode.d/pre-commit.jsonc`);
  **repo-hygiene** → `.gitignore`, `.gitattributes`, `.editorconfig`,
  `.graphifyignore`, `CONTRIBUTING.md`, `SECURITY.md`, `renovate.json`,
  `.github/ISSUE_TEMPLATE/*`, `_licenses/*`, `vscode.d/repo-hygiene.jsonc`; plus
  the composed `.vscode/settings.json` and `extensions.json` and the `.claude/`
  lockfile. Pack roots: `plugins/stackgen/stacks/toolchain-manager/mise/`,
  `plugins/stackgen/stacks/toolchain-gate/*/`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/`.
- Brownfield today (`references/existing-repo.md`): "adopt, not flatten" — a
  sidecar `_scripts/local` from old helper definitions, repo-only tasks kept and
  listed, diverged pack files offered per file as replace-or-keep in one plan,
  keeps recorded in `enforcement.kept_files`, marked-position-only divergence
  never offered
  (`docs/memory/decisions/2026-09-12-init-brownfield-sidecar-and-diverged-files.md:39-162`).
  Pass 1 exempts the editor dir (`existing-repo.md:69-72`); the editor collision
  round of the `init-editor-dedupe` plan is the only read of it.
- Recorded side effects: `docs/plans/archived/2026-09-05-vwf-init/index.md:509`
  (`cp -R` overwrote a stubbed task and ran real commands on the host) and
  `:522` (a rename table would have clobbered `_scripts/checks`). Nothing else
  is recorded; "flatten" appears nowhere as an observed effect.
- The palace `problems` room mirrors `docs/memory/problems/<drawer>.md`
  (`${CLAUDE_PLUGIN_ROOT}/assets/memory.md`); the room is committed.
- `docs/memory/**` is dprint-formatted. Commit types
  `ops docs merge feat fix refactor`, no scopes. Priority: `10 + 20` over the
  required plan's row → 30 while that row is open.

## Assumed decisions — confirm or override at review

| # | Decision       | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                                   | Unit       |
| - | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------- |
| 1 | Method         | **Read-only walks** of the init skill, its references and the three unconditional bundles' payloads; every finding cites `file:line` in the plugin and, where it applies, the pack file that lands. No scratch-repo run, no emulated fixture (a hand-emulated fixture hid a real defect on 2026-09-14)                                                                                                                                                              | scratch-repo runs; emulated fixtures       | U1, U2, U3 |
| 2 | Register shape | One table per mode with the columns: landed path · source pack · what init reads first (or "nothing") · behaviour when the path exists (overwrite / keep / offer / merge / splice / unspecified) · stack-conditional (yes / no / should be, with why) · duplicate or conflict risk · pointer. Below each table, the findings as numbered lines, each with a severity — blocks a user / surprises a user / cosmetic                                                  | prose only; one flat table for all modes   | U1, U2, U3 |
| 3 | Where it lives | `docs/memory/problems/2026-09-20-init-shape-audit-greenfield.md`, `…-brownfield.md`, `…-landing-register.md` written by the walks; `docs/memory/problems/2026-09-20-init-shape-audit.md` — the one-page summary ranking every finding by severity and naming the D2 candidates — written by the docs unit; each opens with the AAAK line the memory shape asks for, and the docs unit files the four as drawers in the palace `problems` room when the server is up | `docs/scratchpad/`; inside the plan folder | U1–U4      |
| 4 | Modes covered  | Greenfield blank and greenfield-with-source, as one walk with two columns where they differ (both are "new" today); brownfield, every pass of `existing-repo.md` in order; the members walk — base plus members — as a section under each                                                                                                                                                                                                                           | one mode; members as a separate unit       | U1, U2     |
| 5 | Lens           | Three questions asked of every landed path: *what did init read from this repo before landing it* · *what would a repo plausibly already have here, and what happens to it* · *is this landing right for a repo whose stack the registry names*. The request's two asks — greenfield stack detection, a config-of-intent instead of copying — are answered in the summary as D2 candidates, not decided here                                                        | deciding the fixes in this plan            | U1–U4      |
| 6 | Review row     | None — nothing executable lands                                                                                                                                                                                                                                                                                                                                                                                                                                     | —                                          | —          |
| 7 | Bump           | No version moves — no file under `plugins/` or `site/` changes; U5 runs the wave gate and nothing else                                                                                                                                                                                                                                                                                                                                                              | a docs-only patch bump                     | U5         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                        | Kind | Owns                                                                   | Depends on | Status  | Commit   |
| -- | ---- | ------------------------------------------------ | ---- | ---------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-greenfield-walk.md](01-greenfield-walk.md)   | edit | `docs/memory/problems/2026-09-20-init-shape-audit-greenfield.md`       | —          | green   | 7859795b |
| U2 | 1    | [02-brownfield-walk.md](02-brownfield-walk.md)   | edit | `docs/memory/problems/2026-09-20-init-shape-audit-brownfield.md`       | —          | green   | 8198bc26 |
| U3 | 1    | [03-landing-register.md](03-landing-register.md) | edit | `docs/memory/problems/2026-09-20-init-shape-audit-landing-register.md` | —          | green   | 936ba19e |
| U4 | 2    | [04-docs.md](04-docs.md)                         | edit | `docs/memory/problems/2026-09-20-init-shape-audit.md`                  | U1, U2, U3 | pending |          |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md)     | edit | — (runs the gate; no file)                                             | U4         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `edit`.

## Shared-file rule

| File                                     | Why it collides                                         | Owner   |
| ---------------------------------------- | ------------------------------------------------------- | ------- |
| the summary `…-init-shape-audit.md`      | three walks would each want to rank                     | U4 only |
| every file under `plugins/**`, `site/**` | read by every unit, written by none                     | —       |
| `readme.md`, `CLAUDE.md`, `.claude/**`   | nothing here falsifies them; U4 confirms with docs-sync | U4 only |

## Waves

- **Wave 1** — U1, U2, U3: three walks writing three disjoint files; each reads
  the whole init tree and the three bundles, and none reads another's output.
- **Wave 2** — U4: the summary over the three files, `vwf:docs-sync` over the
  delta (expected to find nothing), the palace mirror.
- **Wave 3** — U5: the wave gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1. `p:site:check` is left out — the site is untouched.

## After landing

none

## Gates the orchestrator keeps

none beyond the wave gate. The wave review is the check that a finding cites a
real `file:line` — a walk that cites nothing is sent back.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc outside its one owned file, never adds a dependency
this file does not list, never commits. A unit deletes with plain `rm`, never
`git rm` — it stages nothing.

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

- Any change to init, setup, doctor or a pack — that is D2, planned from the
  summary's named findings.
- A scratch-repo or fixture run — decision 1; a real run on a real repo is the
  user's after D2 lands.
- The `.vscode` collision — already ruled by `2026-09-20-init-editor-dedupe`;
  the walks cite it and do not re-audit it.
- A version bump or a release of anything.

## Parked

- **D2 — the init rework**, planned with `/vwf:change-plan` from
  `docs/memory/problems/2026-09-20-init-shape-audit.md` once this lands:
  greenfield stack detection (read `stacks:` / the registry before choosing the
  shape), brownfield "read before land" for every path the register marks, and
  whether a config-of-intent replaces payload copying. B28 closes when D2 lands;
  `/vwf:execute`'s `done` at this plan's landing may need the item moved back to
  `Backlog` by hand until then.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Commit |
| ---- | --------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight | —     | 1     | green       | resolve runnable (requires COMPLETE); doctor: mise, graphify CLI and graph present, no .config/vwf.yaml so no stack to check, all-edit plan so no LSP or conventions step; 4 gate lines green (code:precommit pass 2); no covers: so format check skipped                                                                                                                                                                                                                                                                                                                                    | —      |
| 1    | U1        | opus  | 1     | green       | 22-row register, 15 findings, 107 pointers. DECIDED: AAAK line in a text block under the H1; wing `ai-plugins`. DOCS FALSIFIED: bundles/repo-gates.md:24-27 (no toolchain-gate pack ships a pre-commit.d fragment); readme-and-license.md:114-119 + repo-hygiene conventions.md:217-222 (renovate caveat says .config/, lands at root); plan index.md:78 (31 task files, not ~36), :67 (SKILL.md line drift). GAP: no AAAK example in problems/; used memory.md:284-287 shape                                                                                                                |        |
| 1    | U2        | opus  | 1     | green       | 11 passes, 21-row register, 20 findings (4 blocks: mode gate; pass-1 basename map moving root install/main into the task library; detached-HEAD submodule member; root .gitleaks.toml allowlist dropped), 13 D2 candidates. DECIDED: mode-boundary section up front. DOCS FALSIFIED: task-library.md:631-634; hygiene conventions.md:216-220 + readme-and-license.md:114-119 (renovate); pre-commit-config.yaml:201-204 vs fragments-and-sections.md:107-111. GAP: AAAK grammar (PROBLEM date ★4 scope summary source); existing-repo.md silent on new-repo §3/4/8/9/10 → treated as not run |        |
| 1    | U3        | opus  | 1     | green       | 32-row register over all 58 config/ files, 23 findings, D2 candidates. DECIDED: task scripts grouped in 5 rows; _licenses/* kept as never-copied rows. DOCS FALSIFIED: bundles/repo-gates.md:25-26 (no gate pack ships a pre-commit.d fragment); materializer.md:73-83 (root-allowlist sentence truncated); repo-hygiene CONTRIBUTING.md:35 names untypeable /vwf:init. GAP: new-repo.md silent on materializer conflicts in mode new → cells say unspecified                                                                                                                                |        |
| 1    | R1        | opus  | 1     | findings(3) | landing-register.md:292 [U3] finding 23 false — materializer.md:73-83 is complete, quoted fragment is :105; greenfield.md:117 [U1] 12 of 31 slot files → 10; landing-register.md:80 [U3] no standalone pointer column (RULINGS: departed from decision 2). CONTRACT clean; 60+ citations verified                                                                                                                                                                                                                                                                                            |        |
| 1    | U1        | opus  | 2     | green       | R1 loop-back: slot-file count 12→10 with the producing grep beside it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |        |
| 1    | U3        | opus  | 2     | green       | R1 loop-back: finding 23 dropped (22 remain); standalone Pointer column added, pointers tagged reads/exists/risk/file. DOCS FALSIFIED retracted: materializer.md:73-83                                                                                                                                                                                                                                                                                                                                                                                                                       |        |
| 1    | R1        | opus  | 2     | pass        | all three fixes verified; 7 pointers spot-checked; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-init-shape-audit

or let the queue pick it, by priority:

/vwf:execute next
