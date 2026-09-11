---
type: vwf-change-plan
title: this repo — the p:<id> task groups, bash task files, the composed
  editor
  block, Renovate at the root
requires: [ docs/plans/2026-09-10-hygiene-pack-renovate-and-allowlist ]
---

# Plan — this repo: task groups, task files, the editor block, Renovate (2026-09-10)

## Status

**BLOCKED at wave 1** — U3 failed: gate line `pre-commit run --all-files`,
Linter `json/no-duplicate-keys` ×54 in `.vscode/settings.json`; RULING NEEDED:
the documented merge algorithm relies on hand keys duplicating block keys (later
wins), this repo's linter forbids duplicate keys, and decision 3 says hand
content is untouched — choose (a) delete the hand keys the block now carries (52
identical; fold the differing `files.exclude` and
`explorer.fileNesting.patterns` values somewhere the block cannot shadow), (b)
exempt `.vscode/*.json` from `json/no-duplicate-keys`, or (c) change vwf's
algorithm in a separate plan; U6, U7 skipped (depend on U3). U1, U2, U4, U5
green and committed. Worktree
`.worktrees/2026-09-10-repo-task-groups-and-editor-block`, branch
`2026-09-10-repo-task-groups-and-editor-block`. Run started 2026-09-11; approved
2026-09-10 by the user, after the shape gate and the post-self-review yes.

## Consent

| Action                                            | Granted                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                                                                                                                           |
| After landing: `mise run plugins:local`           | run                                                                                                                                                                                                                                                                                           |
| After landing: `/release`                         | ask                                                                                                                                                                                                                                                                                           |
| Release `vwf` publicly                            | patch, **conditional** — only if `.claude-plugin/marketplace.json`'s vwf `ref` names a tag that already exists (`git tag -l`); then `version` in `plugins/vwf/.claude-plugin/plugin.json` +0.0.1 and `mise run plugins:marketplace`. Else none: the eight edited lines ride the pending patch |
| Release `stackgen` publicly                       | patch, **conditional** — the same test on the stackgen `ref`; then `plugins/stackgen/.claude-plugin/plugin.json` +0.0.1 and `mise run plugins:marketplace`. Else none                                                                                                                         |
| Release installer publicly                        | none                                                                                                                                                                                                                                                                                          |
| Release site publicly                             | none                                                                                                                                                                                                                                                                                          |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, every task this repo runs is reachable under the toolchain
pack's contract — `p:i:*`, `p:plugins:*`, `p:site:*` — and every caller and
every mention follows; the three task files that were zsh are bash; the editor
block is composed from the packs' fragments into the committed `.vscode/` files
between markers, with everything hand-authored outside them intact; the Renovate
file sits at the root where the hygiene pack now lands it; and
`/vwf:setup reshape` on the landed checkout prints an empty plan.

This finishes what the 2026-09-09 `/vwf:setup reshape` run deferred: the user
chose *"Rename to p:i, p:plugins, p:site"* and then *"Carve it out as its own
change plan"* once the blast radius (CI, TypeScript source, published docs) was
on the table; the editor block was deferred on a misreading — the model is a
merge into the existing files, not a second store. The `p:<id>` contract
(`docs/memory/decisions/2026-09-06-project-ids-are-slugged.md`) and the composed
editor block (`2026-09-06-editor-fragments-inside-the-fence.md`) are standing
decisions; this repo is catching up to them. Nothing is reversed.

## Facts the survey established

**The task files.** `.config/mise/tasks/i/{build,publish,release,test,version}`
→ `i:*`;
`plugins/{check,inventory,local,marketplace,npm-normalize-test,release,shellcheck}`
→ `plugins:*`; `site/{build,check,dev,icons,release,version}` → `site:*`. No
`#MISE depends=` anywhere. Functional cross-calls: `i/publish:23-24` (`i:test`,
`i:build`), `i/release:60` (`i:test`), `plugins/local:123`
(`plugins:marketplace`), `plugins/release:53` (`plugins:marketplace --check`),
`site/check:10` (`site:build`), `site/release:62` (`site:check`). Descriptive
(comments, print strings): `i/publish:14`, `i/release:10,39,55`,
`plugins/release:24`, `plugins/shellcheck:63`, `site/release:10,40,57`.
`setup:*`/`code:*` never call them; `code/format:23` names a dead
`plugins:build` in a comment.

**Functional callers.** `.config/pre-commit-config.yaml` `entry:` lines `:22`
(`plugins:npm-normalize-test`), `:37` (`plugins:marketplace --check`), `:48`
(`plugins:inventory --check`), `:55` (`plugins:check`), `:71`
(`plugins:shellcheck`). Workflows:
`.github/workflows/plugins.yml:53,56,59,67,101`; `release.yml:101` (`i:test`),
`:104` (`i:build`); `deps-update.yml:85` (`i:version`), `:101`
(`i:release --ci`); `site.yml:68` (`site:check`). Descriptive lines in the same
files: `plugins.yml:75,91`, `deps-update.yml:72-73,99,102`, `release.yml:23`,
`site.yml:12,18`. `release.yml`'s trigger surface must stay untouched
(`CLAUDE.md`); the two edits are inside steps. No toml caller:
`.config/mise.dev.toml:24` is a comment; its `[shell_alias]` (`:38`) has no
`i:`/`plugins:`/`site:` alias but carries `be-setup`/`fe-setup` → `../backend`,
`../frontend`, which do not exist here; `.config/mise.toml:29` is a comment
naming `p:<id>:*`; `mise.ci.toml` nothing; `~/.config/mise/config.toml`'s
`[shell_alias]` names none of them.

**`scripts/src` and `installer/src`.** All descriptive — comments and
user-facing strings: `inventory.ts:191,364`;
`marketplace.ts:14,89,148,217,335,370,382,397-398`; `check.ts:70,283`;
`plugins.ts:133`; tests `check.test.ts:106`, `inventory.test.ts:32`,
`marketplace.test.ts:37,198` (assert on the strings). Nothing spawns a mise
task. `installer/src/mempalace-checkpoint-script.test.ts:8` is one comment.
`inventory.ts:191` is the source of `stacks/inventory.md`'s header line — the
generated file follows on regeneration.

**Descriptive mentions elsewhere.** `CLAUDE.md` 23,
`.claude/docs/ci-and-releases.md` 31, `.claude/skills/release/SKILL.md` 28,
`.claude/docs/repo-shape.md` 16, `.claude/docs/dev-marketplace.md` 13,
`site/CLAUDE.md` 11, `.claude/skills/plugin-authoring/references/checks.md` 11,
`plugin-authoring/SKILL.md` 10, `stackgen-plugin/SKILL.md` 10,
`.claude/agents/target-verifier.md` 8, `installer/CLAUDE.md` 5,
`vwf-plugin/SKILL.md` 4, `.claude/docs/plugins.md` 3, one each in
`plugin-authoring/references/structure.md`,
`.claude/docs/installer/packaging.md`, `.claude/docs/installer/receipts.md`,
`vwf-plugin/references/{dependencies,assets,skills-and-agents}.md`;
`.gitignore:42,67` comments; `readme.md` 0. Manual:
`site/src/content/docs/installer/internals.md:87,103,153` (`i:build`, `i:test`).
**Plugin-shipped, all naming this repo's checker:**
`plugins/vwf/assets/stack-adapter.md:145`,
`plugins/vwf/vendor/mempalace/README.md:79,97`,
`plugins/vwf/skills/blueprint-authoring/references/api-and-schema-contracts.md:93`,
`plugins/stackgen/stacks/readme.md:272`,
`plugins/stackgen/assets/output-tree.md:194,212`,
`plugins/stackgen/assets/pack-format.md:94,262,276`. **History, never
rewritten:** `docs/memory/**` (13 files, 16 hits), `docs/plans/archived/**` (149
files, 917 hits).

**The zsh files.** `.config/mise/tasks/code/git-config`: `${(f)LOCAL_CONFIG}` at
`:23` and `:32` (newline split); `code/count` and `code/all`: nothing beyond the
shebang (`all:10`'s `[[ ]] && ||` is bash-valid).

**The editor block.** Fragments compose into `.vscode/settings.json` and
`.vscode/extensions.json` (`plugins/stackgen/assets/pack-format.md:121-122`), in
a marked block `// >>> vscode.d` … `// <<< vscode.d` placed first (`:129-134`),
by init (`plugins/vwf/skills/init/references/fragments-and-sections.md:147-171`,
keys table `:157-161`). Three keys: `settings` (deep merge, later wins),
`nesting` (union per parent → `explorer.fileNesting.patterns`), `extensions`
(union) — `pack-format.md:108-112`, enforced by `scripts/src/check.ts:578-600`.
Reconcile rule for a hand-authored file: markers absent → insert at top;
everything outside survives byte-for-byte; hand keys after the block win
(`fragments-and-sections.md:186-193`). `setup:vscode` composes nothing — it
reads the composed `extensions.json` and reconciles a per-repo VS Code
**profile** named `$REPO_NAME` (`setup/vscode:15-32,34-35,105-118`). The four
fragments the three baselines ship:
`toolchain-manager/mise/config/.config/vscode.d/mise.jsonc`,
`toolchain-gate/dprint/config/.config/vscode.d/dprint-editor.jsonc`,
`toolchain-gate/pre-commit/config/.config/vscode.d/pre-commit.jsonc`,
`repo-hygiene/repo-hygiene/config/.config/vscode.d/repo-hygiene.jsonc`. This
repo's `.vscode/` is committed: `settings.json` 76 top-level keys (JSONC),
`extensions.json` 19 recommendations, `launch.json` 2 configurations.
`REPO_NAME = "claude-plugins"` is in `.config/mise.toml` since 2026-09-09.

**Renovate.** `.config/renovate.json` was created here by the 2026-09-09 reshape
from the hygiene pack; the required plan moves the pack's copy to
`config/renovate.json`, so this repo's moves to `renovate.json`.

**Gates.** Local pre-commit hooks that run the renamed tasks are all
`files:`-scoped to `plugins/**` (`:25,40,51,58,74`), so a commit touching only
`.config/**` exercises none of them — only `git-config` (always_run), the
shebang/executable checks, the formatter, the linter; `actionlint` covers
`.github/workflows/`. CI: `plugins.yml` has no paths filter and runs all five
`plugins:*` tasks on every push — the only automatic exercise of the rename.
`site.yml` is path-filtered to `site/**` + itself; `i:*` runs only in
`release.yml` (installer tag) and `deps-update.yml` (schedule/dispatch). So
`p:site:check`, `p:i:test`, `p:i:build` must be run by hand.

**Versions.** vwf 19.14.0 → 19.14.1 by the pair plan; stackgen 1.6.0 → 1.6.1 by
the required plan. Whether either tag exists when this runs is what the
conditional release rows test.

## Assumed decisions — confirm or override at review

| # | Decision                    | Ruling                                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                                                                                              | Unit       |
| - | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| 1 | The task groups             | `i:*` → `p:i:*`, `plugins:*` → `p:plugins:*`, `site:*` → `p:site:*`. The three directories move under `.config/mise/tasks/p/`; every functional caller and every descriptive mention outside history follows. The user: *"Rename to p:i, p:plugins, p:site"*.                                                                                                                                                       | leave as-is, record the divergence                                                                    | U1, U5, U6 |
| 2 | The plugin-shipped mentions | **Rewrite them; bump only if already released.** The docs unit rewrites all eight. The gates unit bumps vwf/stackgen patch only if the marketplace pin's tag already exists; otherwise the edits ride the pending patch.                                                                                                                                                                                            | leave the eight as they are                                                                           | U6, U7     |
| 3 | The editor block            | **A unit does the merge per the documented algorithm.** Copy the four fragments to `.config/vscode.d/`, compose the marked block into `.vscode/settings.json` and `.vscode/extensions.json` (settings deep-merge, nesting union, extensions union; block first; hand-authored content outside it untouched), add `setup/vscode` from the pack. `/vwf:setup reshape` printing an empty plan afterwards is the proof. | an after-landing `ask` step `/vwf:setup reshape` (a second consent; the plan cannot prove the result) | U3         |
| 4 | The zsh task files          | `code/git-config`, `code/count`, `code/all` become `#!/usr/bin/env bash`; `git-config`'s two `${(f)…}` splits become `while IFS= read -r` loops. Nothing else in them changes.                                                                                                                                                                                                                                      | —                                                                                                     | U2         |
| 5 | Renovate                    | `.config/renovate.json` → `renovate.json` (root), byte-identical, per the required plan's decision 1.                                                                                                                                                                                                                                                                                                               | —                                                                                                     | U4         |
| 6 | The stray aliases           | `.config/mise.dev.toml`'s `be-setup`/`fe-setup` aliases (`../backend`, `../frontend` — neither exists here) are dropped as residue from another repo.                                                                                                                                                                                                                                                               | keep them                                                                                             | U1         |
| 7 | `scripts/src` strings       | The user-facing strings and comments naming a task are rewritten; the tests that assert on them follow in the same unit. No behaviour changes.                                                                                                                                                                                                                                                                      | —                                                                                                     | U5         |
| 8 | History                     | `docs/memory/**` and `docs/plans/archived/**` are untouched.                                                                                                                                                                                                                                                                                                                                                        | rewrite historical mentions                                                                           | —          |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Depends on | Status  | Commit     |
| -- | ---- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ---------- |
| U1 | 1    | [01-rename.md](01-rename.md)                   | `.config/mise/tasks/{i,plugins,site}/**` → `.config/mise/tasks/p/{i,plugins,site}/**`; `.config/mise/tasks/code/format`; `.config/pre-commit-config.yaml`; `.github/workflows/{plugins,release,deps-update,site}.yml`; `.config/mise.toml`; `.config/mise.dev.toml`; `.gitignore`                                                                                                                                                                                                                                                                                                       | —          | green   | `bf86f327` |
| U2 | 1    | [02-bash.md](02-bash.md)                       | `.config/mise/tasks/code/git-config`, `.config/mise/tasks/code/count`, `.config/mise/tasks/code/all`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —          | green   | `d54d7a0c` |
| U3 | 1    | [03-editor-block.md](03-editor-block.md)       | `.config/vscode.d/**` (new), `.vscode/settings.json`, `.vscode/extensions.json`, `.config/mise/tasks/setup/vscode` (new)                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —          | failed  |            |
| U4 | 1    | [04-renovate.md](04-renovate.md)               | `.config/renovate.json` → `renovate.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —          | green   | `92d6e876` |
| U5 | 1    | [05-scripts-strings.md](05-scripts-strings.md) | `scripts/src/inventory.ts`, `scripts/src/marketplace.ts`, `scripts/src/check.ts`, `scripts/src/plugins.ts`, `scripts/src/check.test.ts`, `scripts/src/inventory.test.ts`, `scripts/src/marketplace.test.ts`, `installer/src/mempalace-checkpoint-script.test.ts`                                                                                                                                                                                                                                                                                                                        | —          | green   | `66fa2131` |
| U6 | 2    | [06-docs.md](06-docs.md)                       | `CLAUDE.md`, `installer/CLAUDE.md`, `site/CLAUDE.md`, `readme.md`, `.claude/docs/**`, `.claude/skills/**`, `.claude/agents/target-verifier.md`, `site/src/content/docs/**`, `.config/mise.ci.toml` (widened at run time — R1 finding, the `:17` comment), and the eight plugin-shipped lines: `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/vendor/mempalace/README.md`, `plugins/vwf/skills/blueprint-authoring/references/api-and-schema-contracts.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/assets/pack-format.md` | U1–U5      | skipped |            |
| U7 | 3    | [07-gates-and-bump.md](07-gates-and-bump.md)   | `plugins/vwf/.claude-plugin/plugin.json` (conditional), `plugins/stackgen/.claude-plugin/plugin.json` (conditional), `plugins/stackgen/stacks/inventory.md` (generated), `.claude-plugin/marketplace.json` (generated)                                                                                                                                                                                                                                                                                                                                                                  | U6         | skipped |            |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                             | Why it collides                                                                    | Owner   |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------- |
| the two `plugin.json`, `stacks/inventory.md`, `marketplace.json` | versions and generated files                                                       | U7 only |
| `.config/mise.dev.toml`                                          | the `:24` comment (rename) and the stray aliases (decision 6) — one unit           | U1 only |
| `.config/mise/tasks/code/format`                                 | the dead `plugins:build` comment at `:23` — U2 owns the other three `code/` files  | U1 only |
| `.config/mise/tasks/setup/vscode`                                | new; pack-copied                                                                   | U3 only |
| `.vscode/**`                                                     | the composed block                                                                 | U3 only |
| every doc and the eight plugin lines                             | docs                                                                               | U6 only |
| `stacks/inventory.md`                                            | generated from `inventory.ts:191` (U5's) — regenerated by U7, never edited by hand | U7 only |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Five disjoint trees: the task groups and
  their functional callers; three `code/` files; the editor block; one moved
  file; `scripts/src` strings. U1 and U2 both live under `.config/mise/tasks/`
  but own different files.
- **Wave 2 — U6**, the docs unit — every descriptive mention.
- **Wave 3 — U7**, the gates-and-bump unit.

## Wave gate

`mise run p:plugins:check`, `mise run p:plugins:marketplace --check`,
`mise run p:plugins:inventory --check`, `mise run p:plugins:npm-normalize-test`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer`,
`pnpm exec tsc --noEmit -p scripts`, `mise run p:site:check` — **under the new
names from wave 1 on**; the preflight before wave 1 runs the same eight under
the old names (`plugins:check` …, `site:check`), since the rename is wave 1's
work. Plus `pre-commit run --all-files` (actionlint over the workflows, the
formatter, the linter), plus the wave review, plus every report read for
`UNRESOLVED:`. The plan's own checks, every wave from 1 on:

- `mise tasks --hidden | awk 'NR>1 {print $1}' | grep -E '^(i|plugins|site):'` →
  nothing.
- `mise tasks --hidden | awk 'NR>1 {print $1}' | grep -cE '^p:(i|plugins|site):'`
  → `18`.
- `grep -rn '^#!/usr/bin/env zsh' .config/mise/tasks` → nothing.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                               |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages whichever plugin's tree changed (both — the eight lines) into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session picks it up |
| `/release`                 | ask  | cuts whatever tag the conditional bump produced, if any; reaches every user of the marketplace                                                                                      |

## Gates the orchestrator keeps

- In the landed checkout: `mise tasks --hidden` lists no bare `i:`, `plugins:`
  or `site:` task.
- `mise run p:site:check`, `mise run p:i:test`, `mise run p:i:build` each exit 0
  (CI exercises only `p:plugins:*` on a push).
- `pre-commit run --all-files` green.
- `/vwf:setup reshape` on the landed checkout prints an **empty plan** (total 0)
  — the proof that the task groups, the editor block and the Renovate path all
  match what the packs ship. A non-empty plan is a defect in this run's work,
  reported with its rows.
- `git diff --stat develop -- docs/memory docs/plans/archived` → empty.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm`, and moves with
`mv`, never `git mv` — it stages nothing.

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

- **`docs/memory/**` and `docs/plans/archived/**`** — history (decision 8).
- **`setup:cleanup`** (the docker prune) — not a legacy name; stays.
- **`release.yml`'s trigger block** — untouched; only the two step lines change.
- **The secrets provider** — the user chose "decide later" on 2026-09-09.
- **A `code:merge:*` change** — created on 2026-09-09; correct.
- **This repo's `/vwf:setup` proper** (`.config/vwf.yaml`, the docs tree) — "not
  yet applicable", per the user on 2026-09-09.

## Parked

- **The secrets provider slot** — unfilled; unlock: re-run
  `/vwf:setup
  reshape` and answer its question 4.
- **`setup:cleanup`** — a task no pack ships; if the mise pack ever grows a slot
  for it, it becomes an overlay.

## Run log

| Wave | Unit      | Model | Round | Outcome          | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Commit                                                                                                                                                                           |
| ---- | --------- | ----- | ----- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | preflight | —     | —     | green            | eight gate lines + `pre-commit run --all-files` under the old names, all exit 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —                                                                                                                                                                                |
| 1    | U4        | opus  | 1     | green            | `.config/renovate.json` → `renovate.json`, byte-identical; no decisions, no gaps                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `92d6e876`                                                                                                                                                                       |
| 1    | U5        | opus  | 1     | green            | 8 files, 19 mentions → `p:plugins:*` (no `i:`/`site:` hits in either tree; test edits are comments only). GAP: unit's verification grep matches inside `p:plugins:…`, verified with `(^                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [^:])`instead. GAP:`inventory.test.ts:36`red until U7 regenerates`stacks/inventory.md`(header from`inventory.ts:191`) — shared-file rule defers it; 290 pass, tsc + dprint clean |
| 1    | U2        | opus  | 1     | green            | three `code/` files → bash; `git-config`'s two `${(f)…}` splits → `while IFS= read -r` loops, exercised against a two-line sample. DECIDED: two pre-existing shellcheck findings (SC2086 `git-config:26`, SC2034 `all:10`) left alone — outside "nothing else changes". Formatter reflowed concurrent units' files only; gate re-run at wave end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `d54d7a0c`                                                                                                                                                                       |
| 1    | U3        | opus  | 1     | green            | four fragments copied byte-identical to `.config/vscode.d/`; marked block first in `.vscode/settings.json` (123 lines) and `extensions.json` (12 lines); 0 deletions, 76 hand keys + 19 hand entries untouched; `setup/vscode` copied, exec, not run. DECIDED: all 10 block extension ids duplicate hand entries — left per algorithm; ~40 hand keys duplicate block keys, hand copy wins by later-key precedence; block keys in composition order, nesting sorted; dprint check green untouched. GAP: `setup/all` does not call `setup:vscode` — outside every Owns; left unwired, orchestrator to decide                                                                                                                                                                                                                                      |                                                                                                                                                                                  |
| 1    | U1        | opus  | 1     | green            | 18 task files moved under `p/`, intra-task calls + comments renamed; 5 pre-commit `entry:` lines; 4 workflows (`release.yml` `on:` block byte-identical, hunks @23 @101 @104); `.gitignore` comments; `mise.dev.toml` :24 + stray aliases dropped. DECIDED: retired `plugins:build`/`plugins:render-clean` comments left verbatim; ~12 descriptive mentions beyond the facts list renamed under ruling 1; 7 comment paragraphs reflowed to 80 cols. GAP: unit Verification says release.yml ≥90 only, Edits ask for :23 — took Edits, :23 sits above `on:`. GAP: `mise tasks` in the nested worktree lists both bare and `p:` names (parent checkout's config leaks in) — the bare-name gate is only provable on the landed checkout. Pre-commit: inventory hook red (U5→U7 regen), Linter warnings claimed pre-existing — verified at the gate |                                                                                                                                                                                  |
| 1    | R1        | opus  | 1     | findings(3)      | `code/format:23` [U1] completeness — edit 3 (drop/rewrite dead `plugins:build`) did not land, returned as DECIDED → looped to U1. `.config/mise.ci.toml:17` [none] docs — `plugins:shellcheck` comment; facts said "nothing" → DOCS FALSIFIED handed to U6, Owns widened (GAP). `setup/all` [none] — pack's runs `setup:vscode` at :57, this repo's does not; file already diverges from the pack wholesale (pre-existing, no unit owns it) → recorded, not widened. CONTRACT clean, RULINGS clean; payload copies byte-identical, `release.yml` `on:` untouched                                                                                                                                                                                                                                                                                |                                                                                                                                                                                  |
| 1    | U3        | opus  | gate  | failed           | gate line `pre-commit run --all-files` red on U3's Owns: Linter `json/no-duplicate-keys` — 54 errors in `.vscode/settings.json` (52 hand keys duplicate the block with identical values; `files.exclude` and `explorer.fileNesting.patterns` differ). The documented merge algorithm (`fragments-and-sections.md` "hand keys after the block win by later-key precedence") relies on duplicate keys; this repo's linter forbids them. Not mechanical — decision 3 says hand content untouched and no unit owns `.config/linter.yaml`. RULING NEEDED: (a) delete the hand keys the block now carries, folding the two differing values somewhere the block cannot shadow; (b) exempt `.vscode/*.json` from `json/no-duplicate-keys`; or (c) change vwf's algorithm (out of this plan). Edits left in the worktree uncommitted                    | —                                                                                                                                                                                |
| 1    | U1        | opus  | 2     | green            | `code/format:23-24` — dead `plugins:build` reference dropped, reflowed within 80 cols. DECIDED: dropped rather than rewritten — the sentence is about a retired sorter, not the checker                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `bf86f327`                                                                                                                                                                       |
| 1    | R1        | opus  | 2     | pass             | `code/format:23-24` only change; folds under 80, no residue. CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                                                                                                                                                                                  |
| 1    | gate      | —     | —     | red (attributed) | under the new names: `p:plugins:check`, `p:plugins:marketplace --check`, `p:plugins:npm-normalize-test`, tsc ×2, `p:site:check` green; `p:plugins:inventory --check` and `pnpm vitest run` (1 test, `inventory.test.ts:36`) red — both the stale `stacks/inventory.md` header, U7's regeneration by the shared-file rule, not a wave-1 unit's defect (GAP: plan orders the regeneration after the gate that asserts it); `pre-commit --all-files` red on Linter → U3 failed (see row); no zsh shebangs; 18 `p:` names; bare-name check unprovable in the nested worktree — the parent checkout's tasks leak in (U1 GAP), deferred to the landed checkout                                                                                                                                                                                        |                                                                                                                                                                                  |
| 2    | U6        | —     | —     | skipped          | depends on U3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —                                                                                                                                                                                |
| 3    | U7        | —     | —     | skipped          | depends on U6 → U3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                                                                                                                                |

## Launch

Run in a fresh session, after
`docs/plans/2026-09-10-hygiene-pack-renovate-and-allowlist` reads `COMPLETE`:

/vwf:change-execute docs/plans/2026-09-10-repo-task-groups-and-editor-block
