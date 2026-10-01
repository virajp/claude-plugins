---
type: vwf-change-plan
title: Drop the vscode configuration from both plugins
requires: []
backlog: [ B40 ]
backlog_pieces: []
---

# Plan — Drop the vscode configuration from both plugins (2026-10-01)

## Status

**APPROVED**

APPROVED 2026-10-01 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release stackgen publicly                         | major   |
| Release vwf publicly                              | minor   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release rows are intent, not authorisation** — no public release step is
recorded. The user ruled for the whole chain (plans 0–4): bump now, release at
the chain's end, and **bump a project once per level since its last release** —
a project whose version already sits above its last released tag at that level
is not bumped again; packs follow the same rule. For this plan, the first of the
chain:

- stackgen `2.0.0 → 3.0.0` (major — the `editor` key and the pack `conditional:`
  axis are removed): edit `plugins/stackgen/.claude-plugin/plugin.json`, then
  `mise run p:plugins:marketplace`.
- vwf `20.0.1 → 20.1.0` (minor — init's editor question goes, `config_format` 21
  → 22 with a migration row): edit `plugins/vwf/.claude-plugin/plugin.json`,
  then `mise run p:plugins:marketplace`.
- site `1.1.49 → 1.1.50` (patch): `mise run p:site:version`, bare — no
  positional, refuses a dirty tree, so V7 runs it first.
- the 8 packs that carried a fragment, one patch each — astro `0.5.0`, pnpm
  `0.6.0`, analysis-options `0.2.1`, eslint `0.3.3`, ruff `0.3.2`, swift-format
  `0.1.2`, swiftlint `0.2.0`, tsconfig `0.2.1` — with their bundle pins and
  `mise run p:plugins:inventory`.

None reaches a 13 or 17 component.

## Goal

A shaped repo carries no editor configuration: neither vwf nor stackgen ships,
asks about, merges or sets up vscode settings. The user, verbatim: *"drop vscode
settings from the plugin, let user create and manage their vscode settings (for
now, may make dedicated skill for it but later)"*. Finishes B40 ("drop the
vscode configuration from init").

**Plan 0 of a five-plan chain** agreed on 2026-10-01; plan 1,
`docs/plans/2026-10-01-tool-config-script-mise`, requires it, so the tool-config
script never templates a vscode fragment.

**Reversals**, written as one decision doc by V6:

- `docs/memory/decisions/2026-09-06-editor-fragments-inside-the-fence.md` —
  per-pack `config/.config/vscode.d/<pack>.jsonc` fragments, init's composed
  block in the two `.vscode` files, and the per-repo profile `setup:vscode` came
  from — **superseded**.
- `docs/memory/decisions/2026-09-20-init-editor-dedupe.md` —
  `enforcement.editor_keys` keep/take/union — **superseded**.

## Facts the survey established

- **`editor` has one value, `vscode`** (`none` = no answer); every reader uses
  it only to decide whether a vscode fragment lands. Asked:
  `plugins/vwf/skills/init/SKILL.md:619-641` (question 7) and
  `:36-37,83,98-102,415,420,674,684,756,763-767,782`;
  `init/references/new-repo.md:97,142,147,153,159,178,192-193,233-234,242,246`;
  `init/references/existing-repo.md:110-119,242-245,616,631,652,660-672,892,1033,1045-1046,1054`.
  Recorded: `plugins/vwf/assets/vwf-config.md:36-39,122,125,237-238,633-660`;
  `setup/references/format-lineage.md:126-127`;
  `setup/references/migrate-pipeline.md:30-34`. Read:
  `setup/references/materialize.md:114,124,153,399`; `TC/SKILL.md:108,161-162`;
  `TC/references/dprint.md:33,51-58,73,185,193,221`;
  `TC/references/mise.md:252-254,267,288-290,333`;
  `TC/references/pre-commit.md:35,127-136`;
  `stackgen-stack-template/SKILL.md:156-159,186,192`;
  `stackgen-stack-template/references/materializer.md:21-23,117-123,141,172,199`;
  `stackgen-sync/SKILL.md:38,70,76,209-210`;
  `plugins/stackgen/assets/pack-format.md:33,57-60,83-85,90-137,294,303,309-316,326,490`;
  `plugins/stackgen/assets/output-tree.md:303-310,380-382,409`;
  `scripts/src/check.ts:898`; `plugins/vwf/skills/architecture/SKILL.md:415`.
  `vwf:doctor` has no vscode or editor check. (`TC` =
  `plugins/stackgen/skills/tool-config`.)
- **12 shipped fragments**:
  `TC/assets/dprint/.config/vscode.d/dprint-editor.jsonc`,
  `TC/assets/mise/.config/vscode.d/mise.jsonc`,
  `TC/assets/pre-commit/.config/vscode.d/pre-commit.jsonc`,
  `plugins/vwf/skills/init/assets/hygiene/.config/vscode.d/hygiene.jsonc`, and
  `plugins/stackgen/stacks/<pack>/config/.config/vscode.d/<pack>.jsonc` for
  `framework/astro`, `package-manager/pnpm`,
  `toolchain-gate/{analysis-options,eslint,ruff,swift-format,swiftlint,tsconfig}`.
  Each pack's `pack.yaml` carries one `conditional:` block whose only `when:` is
  `editor: vscode` (astro `:22`, pnpm `:15`, analysis-options `:15`, eslint
  `:17`, ruff `:20`, swift-format `:17`, swiftlint `:17`, tsconfig `:15`).
- **`analysis-options` and `tsconfig`** carry nothing in `config/` but the
  fragment; their conventions and skill (106 and 149 lines) are doctrine an
  agent reads when it writes `analysis_options.yaml` / `tsconfig*.json`, which
  the packs never land.
- **init's editor merge**: `init/references/fragments-and-sections.md:3-235` is
  almost all editor merge (its only other heading, "Hook fragments" `:23`, is
  retired); cited at `init/SKILL.md:638,717` and
  `existing-repo.md:112,672,1046`.
  `init/references/readme-and-license.md:21,26,37-40` names the hygiene
  fragment.
- **`setup:vscode`**: `TC/assets/mise/.config/mise/tasks/setup/vscode` (whole
  file), called from `tasks/setup/all:44-46`; described at
  `TC/references/mise.md:675,782,884-906,1110-1111`. This repo's own copy was
  deleted in `c285438c`.
- **Gate lines that protect a user's own `.vscode/`**:
  `TC/assets/dprint/.config/dprint.json:25` (`jsonTrailingCommaFiles`),
  `TC/assets/pre-commit/.config/pre-commit-config.yaml:138-139` (`check-json`
  excludes `^\.vscode/`, comment "The composed editor files"),
  `TC/assets/git/.gitignore:13` (`.vscode/` deliberately not ignored).
- **Checker**: `scripts/src/check.ts:275-276` (`PACK_EDITOR_FRAGMENTS`),
  `:406-408`, `:466-473` (fragment walk), `:898` (axis), `:990-1097`
  (`EDITOR_FRAGMENT_KEYS`, `stripJsonc` `:1014` — check other users first,
  `editorFragmentFaults` `:1052`). The root allowlist `:326-343` is not
  vscode-specific. Tests:
  `scripts/src/check.test.ts:457,468,486,501,541,550,562-565,588,634,1135`.
  `.claude/skills/plugin-authoring/references/checks.md:142-148`.
- **This repo**:
  `.config/vscode.d/{dprint-editor,mise,pre-commit,repo-hygiene}.jsonc` tracked
  and dead; `.vscode/{extensions,launch,settings}.json` tracked, the user's.
- **Pack prose**: each fragment pack's `conventions.md` (astro `:163-165`, pnpm
  `:43-50`, analysis-options `:15-23`, eslint `:41-50`, ruff `:43-50`,
  swift-format `:36-41`, swiftlint `:39-42`, tsconfig `:19-39`);
  `toolchain-gate/swift-format/skills/swift-format/SKILL.md:83-85`.
- **Leave alone**: `plugins/vwf/assets/capability-vocabulary.md:166`, flutter's
  `build-flavors-signing.md:419` (`.vscode/launch.json` guidance),
  `plugins/stackgen/assets/ids.md:87`.
- **Human docs**: `readme.md:296,309`; `.claude/docs/repo-shape.md:175-181`;
  `.claude/skills/stackgen-plugin/SKILL.md:105,117-119,183-189,241-272,332`;
  `.claude/skills/vwf-plugin/SKILL.md:116,135-146,168-178`,
  `references/{assets.md:24,docs-tree.md:137,skills-and-agents.md:27}`;
  `site/src/content/docs/plugins/stackgen.md:278-279,506-515,584-623,710,823-827,1154,1216-1224,1516`;
  `site/src/content/docs/plugins/vwf.md:949-987,1106,1189-1197,1213-1242,1398,1445,1729-1730,1847`;
  `site/src/content/docs/how-to/brownfield/migrate-old-vwf-repo.md:72-80`;
  `site/src/content/docs/how-to/greenfield/single-repo.md:94-100`.
- **Versions**: stackgen `2.0.0`, vwf `20.0.1`, site `1.1.49`; `config_format`
  `21`.
- **Commit convention**: types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes enforced.

## Assumed decisions — confirm or override at review

| #  | Decision              | Ruling                                                                                                                                                                                                                                | Rejected                                                 | Unit           |
| -- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- |
| E1 | The `editor` axis     | Retired everywhere: init's question 7, `answers.editor`, tool-config's `editor` key, the pack `conditional:` `when: editor`, the checker's axis, the materializer's condition.                                                        | keep the axis for a future editor                        | V1, V2, V3, V4 |
| E2 | What is deleted       | All 12 shipped fragments; init's editor merge (`fragments-and-sections.md` deleted, its citations fixed); the `setup:vscode` task and its call in `setup/all`.                                                                        | —                                                        | V1, V2, V3     |
| E3 | Shaped repos          | `config_format` 21 → 22: a migration row drops `answers.editor` and `enforcement.editor_keys`, and `.config/vscode.d/*` is offered for delete. `.vscode/` is the user's — untouched, markers and all.                                 | strip init's marked block from `.vscode/`; touch nothing | V3             |
| E4 | Thin packs            | `analysis-options` and `tsconfig` become doctrine-only packs: their `config/` tree and `conditional:` go; conventions and skill stay; bundles unchanged.                                                                              | retire both; land real configs from templates (parked)   | V2             |
| E5 | `.vscode/` gate lines | The lines protecting a user's own `.vscode/` stay — dprint's `jsonTrailingCommaFiles` entry, pre-commit's `check-json` exclude, the `.gitignore` note; only the pre-commit comment changes to "`.vscode/` files are JSONC by design". | remove them                                              | V1             |
| E6 | This repo             | Delete `.config/vscode.d/` (four dead fragments); keep `.vscode/`.                                                                                                                                                                    | delete both; touch neither                               | V4             |
| E7 | Bumps in the chain    | A project is bumped once per level since its last release, across plans 0–4; packs too.                                                                                                                                               | every plan bumps; only the last plan bumps               | V7             |
| E8 | Review row            | One `Kind: review` row: the plan changes runnable code (`scripts/src/check.ts`, the `setup/all` bash task, a deleted task).                                                                                                           | wave review alone                                        | V5             |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| V1 | 1    | [01-tool-config.md](01-tool-config.md)       | edit   | `plugins/stackgen/skills/tool-config/assets/{dprint,mise,pre-commit}/.config/vscode.d/`, `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/{vscode,all}`, the `check-json` comment in `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/pre-commit-config.yaml`, `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/{dprint,mise,pre-commit}.md`                                                                                                                                              | —          | pending |        |
| V2 | 1    | [02-packs.md](02-packs.md)                   | edit   | `plugins/stackgen/stacks/{framework/astro,package-manager/pnpm,toolchain-gate/analysis-options,toolchain-gate/eslint,toolchain-gate/ruff,toolchain-gate/swift-format,toolchain-gate/swiftlint,toolchain-gate/tsconfig}/` — their `config/.config/vscode.d/`, the `conditional:` block of their `pack.yaml` (never `version:`), their `conventions.md`, and `toolchain-gate/swift-format/skills/swift-format/SKILL.md`; `plugins/stackgen/assets/{pack-format,output-tree}.md`; `plugins/stackgen/skills/stackgen-stack-template/**`; `plugins/stackgen/skills/stackgen-sync/**` | —          | pending |        |
| V3 | 1    | [03-vwf.md](03-vwf.md)                       | edit   | `plugins/vwf/**` except `plugins/vwf/.claude-plugin/plugin.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —          | pending |        |
| V4 | 1    | [04-checker.md](04-checker.md)               | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `.config/vscode.d/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —          | pending |        |
| V5 | 2    | [05-review.md](05-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | V1, V4     | pending |        |
| V6 | 3    | [06-docs.md](06-docs.md)                     | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{plugin-authoring,stackgen-plugin,vwf-plugin}/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-01-editor-config-dropped.md` (new)                                                                                                                                                                                                                                                                                                                                                                   | V2, V3, V5 | pending |        |
| V7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md) | edit   | `site/package.json`, `plugins/{stackgen,vwf}/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, the `version:` line of the 8 packs in V2 and the bundle pins naming them, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                                                                   | V6         | pending |        |

## Shared-file rule

| File                                                                      | Why it collides                                     | Owner                      |
| ------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------- |
| `plugins/{stackgen,vwf}/.claude-plugin/plugin.json`, `site/package.json`  | version files                                       | V7 only                    |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` | generated                                           | V7 only                    |
| the 8 fragment packs' `pack.yaml`                                         | V2 removes `conditional:`; V7 bumps `version:`      | V2 in wave 1, V7 in wave 4 |
| `TC/assets/pre-commit/.config/pre-commit-config.yaml`                     | one comment changes; plan 1 later edits other lines | V1, that comment only      |
| every human-facing doc                                                    | n units editing one doc                             | V6 only                    |

## Waves

- **Wave 1 — V1, V2, V3, V4.** Four disjoint trees: tool-config; packs, pack
  assets and the materializer skills; vwf; the checker and this repo's
  `.config/vscode.d/`. The checker drops the `editor` axis in the same wave the
  packs drop `when: editor`, so the gate after the wave sees both.
- **Wave 2 — V5**, the review row, after V1 and V4.
- **Wave 3 — V6**, docs. **Wave 4 — V7**, gates and bump.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                                  |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into the dev marketplace and updates this machine's install; a restarted session picks them up |

B40 is set `Done` by the executor at landing (`backlog: [B40]`).

## Gates the orchestrator keeps

- After wave 1 and after V7: `grep -rn -i vscode plugins/` prints only the
  allowed lines — `TC/assets/dprint/.config/dprint.json`
  (`jsonTrailingCommaFiles`),
  `TC/assets/pre-commit/.config/pre-commit-config.yaml` (`check-json` exclude
  and its comment), `TC/assets/git/.gitignore` (the note),
  `plugins/vwf/assets/capability-vocabulary.md`, flutter's
  `build-flavors-signing.md`, `plugins/stackgen/assets/ids.md`, and V3's
  format-22 migration row naming what it removes.
- `find plugins -path '*vscode.d*'` prints nothing.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` on any path outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

Keep the block under 1,500 characters.

## Out of scope

- This repo's own `.vscode/` — the user's, kept (E6).
- A dedicated vscode skill — the user: *"may make dedicated skill for it but
  later"*; not planned.

## Parked

- The two doctrine-only packs could land real configs from templates —
  `tsconfig.base.json` from `tsconfig`, a base `analysis_options.yaml` from
  `analysis-options` — when the pack is used. Raised 2026-10-01; a later plan,
  likely after the chain's plan 1 template engine exists.
- A dedicated vscode skill for users who want one — the user's "later".

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-01-drop-vscode

or let the queue pick it, by priority:

/vwf:execute next
