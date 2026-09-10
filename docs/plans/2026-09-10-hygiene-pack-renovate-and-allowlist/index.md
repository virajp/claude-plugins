---
type: vwf-change-plan
title: hygiene pack — Renovate at a path Renovate reads, one root allowlist,
  and the dprint pin-update sentence
requires: []
---

# Plan — hygiene pack: Renovate, the root allowlist, dprint pins (2026-09-10)

## Status

**RUNNING** since 2026-09-11 — worktree
`.worktrees/2026-09-10-hygiene-pack-renovate-and-allowlist`, branch
`2026-09-10-hygiene-pack-renovate-and-allowlist` off `develop` at `c417a02d`.

Approved 2026-09-10 by the user, after the shape gate and the post-self-review
yes.

## Consent

| Action                                            | Granted                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                                                                                                           |
| After landing: `mise run plugins:local`           | run                                                                                                                                                                                                                                                                           |
| After landing: `/release`                         | ask                                                                                                                                                                                                                                                                           |
| Release `stackgen` publicly                       | patch — 1.6.0 → 1.6.1, by editing `version` in `plugins/stackgen/.claude-plugin/plugin.json`, then `mise run plugins:marketplace`; with pack bumps repo-hygiene 1.0.0 → 1.0.1 and dprint 1.0.0 → 1.0.1 (each `pack.yaml`, the bundle pins, then `mise run plugins:inventory`) |
| Release `vwf` publicly                            | none                                                                                                                                                                                                                                                                          |
| Release installer publicly                        | none                                                                                                                                                                                                                                                                          |
| Release site publicly                             | none                                                                                                                                                                                                                                                                          |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, the Renovate configuration the hygiene pack lands in a repo is
at a path Renovate actually reads, the root allowlist says the same thing in the
two places it is written and names the two root files vwf owns, the checker
refuses what the doctrine refuses and no more, and the formatter gate pack says
plainly that its plugin pins move only from a terminal.

Three of these are rulings left open on 2026-09-05 that nobody closed —
`.config/renovate.json` was called "inert at D3's path" in that day's run and
the file shipped anyway; on 2026-09-09 `/vwf:setup reshape` copied it into this
repo. Nothing here reverses a standing decision; the root allowlist gains
entries and a tier, it does not lose one.

## Facts the survey established

**Renovate.** Per Context7 (`/websites/renovatebot`, "Renovate config" and
"Configuration options"), Renovate discovers, in order: `renovate.json`,
`renovate.json5`, `.github/renovate.json`, `.github/renovate.json5`,
`.gitlab/renovate.json`, `.gitlab/renovate.json5`, `.renovaterc`,
`.renovaterc.json`, `.renovaterc.json5`, the deprecated `package.json`
`renovate` key (and `.jsonc` variants of each); a self-hosted `configFileNames`
array is checked first. **`.config/renovate.json` is not among them** — as
shipped, the file is inert on hosted Renovate. Every place naming it: the pack
payload
`plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.config/renovate.json`;
`stacks/repo-hygiene/repo-hygiene/conventions.md:23` (table) and `:172` (the
"policy, not an installation" paragraph);
`stacks/repo-hygiene/repo-hygiene/skills/repo-hygiene/SKILL.md:24` (paths glob;
`:25` also globs `**/renovate.json`);
`plugins/stackgen/assets/output-tree.md:130`;
`.claude/skills/stackgen-plugin/SKILL.md:92`. Not named in `pack.yaml`,
`stacks/inventory.md`, or the manual
(`site/src/content/docs/plugins/stackgen.md:422` says only "a Renovate config").

**The root allowlist.** `plugins/stackgen/assets/output-tree.md:150-162`, the
list at `:152-156`: `.gitignore`, `.graphifyignore`, `.editorconfig`,
`.gitattributes`, `.npmrc`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`,
`readme.md`, `fnox.toml`, `eslint.config.mjs`, `dprint.json`, `wrangler.jsonc`,
and the directory `.github/` excluding `.github/workflows/`. `CLAUDE.md` is
fenced as vwf's — a pack shipping it is refused (`output-tree.md:193-195`,
`:274`, `:316-318`; `plugins/vwf/skills/init/SKILL.md:61`;
`init/references/readme-and-license.md:83`) — yet the hygiene pack's own
`conventions.md:31` lists `CLAUDE.md` **inside** its allowlist. `mempalace.yaml`
must sit at the repo root by the mine's discovery rule
(`plugins/vwf/assets/memory.md:105-124`, esp. `:118-120`) and is named by
nothing in stackgen. `/vwf:setup` merges a section into the existing root
`CLAUDE.md` (`setup/references/claude-md.md:3-5`). On 2026-09-09 init's pass 1
could only skip both files by judgment.

**The checker.** Rule 11 walks a pack's `config/` root entries only
(`scripts/src/check.ts:434-449`; the file set at `:315-334`, the directory set
at `:347-350`, workflows fenced at `:361`); a repo's own root files are never
checked. So the allowlist's "may sit at a shaped root" tier and the checker's "a
pack may land" tier can differ without a checker change — only a new
**landable** file touches `check.ts`.

**dprint pins.**
`stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/mise:33`
`can_prompt()` probes `/dev/tty`; `:35-50` runs `dprint config update` only if
it can, else prints "Skipping formatter plugin updates" and a warning to run it
in a terminal; the comment at `:36-41` explains the process-plugin checksum
prompt and why `-y` is refused. The dprint pack's
`skills/dprint/SKILL.md:100-102` says the update is "a deliberate act run from
`setup:mise`"; `conventions.md:11` pins by explicit version. No doc states the
consequence — that CI and any non-TTY run never move a pin.

**Versions.** stackgen 1.6.0 (`plugins/stackgen/.claude-plugin/plugin.json:4`);
`repo-hygiene/repo-hygiene/pack.yaml:5` = 1.0.0, pinned by
`stacks/bundles/repo-hygiene.md:7`; `toolchain-gate/dprint/pack.yaml` = 1.0.0,
pinned by `stacks/bundles/repo-gates.md` (`toolchain-gate/dprint@1.0.0`).
`stacks/inventory.md:85,94` carry the version column; `plugins:inventory` fails
a bundle pin that does not match its pack (`scripts/src/inventory.ts:306-338`;
`assets/pack-format.md:260-266`) — so a pack bump is pack.yaml **and** the
bundle pin **and** a regeneration.

**Docs that describe today's behaviour.**
`.claude/skills/stackgen-plugin/SKILL.md:92`;
`site/src/content/docs/plugins/stackgen.md:422`; `CLAUDE.md` (the "Tasks" bullet
on rule 11 and the root allowlist wording: "whose two allowed directories are
`.config/` and `.github/`") — confirm whether the allowlist tier changes its
wording.

**Gates.** `plugins:check` (rule 11 reads the allowlist sets in `check.ts`),
`plugins:marketplace --check`, `plugins:inventory --check`,
`plugins:npm-normalize-test`, `pnpm vitest run` (`scripts/src/check.test.ts`
covers rule 11), `tsc -p installer`, `tsc -p scripts`, `site:check`.
`plugins/*/stacks/*/*/config/` is excluded from dprint whole — the payload is
copied byte-for-byte.

## Assumed decisions — confirm or override at review

| # | Decision                   | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                     | Rejected                                                                                                                                                       | Unit   |
| - | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1 | Where Renovate's file goes | **Root `renovate.json`.** The pack payload moves from `config/.config/renovate.json` to `config/renovate.json`; the root allowlist and the checker's landable file set both gain `renovate.json`.                                                                                                                                                                                                                                          | `.github/renovate.json` (allowlist-legal today, no checker change — but not where Renovate users look first)                                                   | U1, U2 |
| 2 | The allowlist's two voices | **Two tiers in one list.** `output-tree.md`'s allowlist becomes what may **sit** at a shaped repo's root. It gains `renovate.json` (landable) and `CLAUDE.md` and `mempalace.yaml`, each marked "vwf's — no pack lands them". The fence at `:193` is unchanged; the checker's landable set gains `renovate.json` only, and a test proves a pack shipping `CLAUDE.md` is still refused. `conventions.md:31` is aligned to the same wording. | strictly landable (drop `CLAUDE.md` from `conventions.md:31`; a separate sentence in init's pass 1 exempting vwf-owned root files — two lists to keep in step) | U1, U2 |
| 3 | The dprint pin sentence    | **Include.** One sentence in the dprint pack's "Running it": pins move only when `setup:mise` runs in a terminal — CI and any non-TTY run skip the update by design and say so. Pack 1.0.0 → 1.0.1.                                                                                                                                                                                                                                        | park it again                                                                                                                                                  | U3     |
| 4 | Pack versions              | Both changed packs bump patch: repo-hygiene (payload moved) and dprint (its skill changed). Bundle pins follow; inventory regenerates.                                                                                                                                                                                                                                                                                                     | bump only repo-hygiene (a doc-only pack change with no re-sync diff)                                                                                           | U5     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                                | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                | Depends on | Status  | Commit     |
| -- | ---- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ---------- |
| U1 | 1    | [01-hygiene-pack.md](01-hygiene-pack.md)                 | `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/**`                                                                                                                                                                                                                                                                                                                                                                                              | —          | green   | `e6689f7c` |
| U2 | 1    | [02-doctrine-and-checker.md](02-doctrine-and-checker.md) | `plugins/stackgen/assets/output-tree.md`, `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                                                       | —          | green   | `90fdc4d2` |
| U3 | 1    | [03-dprint-pack.md](03-dprint-pack.md)                   | `plugins/stackgen/stacks/toolchain-gate/dprint/**`                                                                                                                                                                                                                                                                                                                                                                                                  | —          | green   | `6982a210` |
| U4 | 2    | [04-docs.md](04-docs.md)                                 | `.claude/skills/stackgen-plugin/**`, `site/src/content/docs/plugins/stackgen.md`, `CLAUDE.md`, `readme.md`, `.claude/docs/**`, `docs/memory/decisions/**` (none expected), `plugins/stackgen/assets/kinds.md` (widened at run time — the `:463` passage U1 reported falsified, owned by nobody), `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md` (widened at run time — R1's rule-5 finding at `:71`, owned by nobody) | U1–U3      | pending |            |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md)             | `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/bundles/repo-hygiene.md`, `plugins/stackgen/stacks/bundles/repo-gates.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                        | U4         | pending |            |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                      | Why it collides                                        | Owner   |
| --------------------------------------------------------- | ------------------------------------------------------ | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`             | the version                                            | U5 only |
| `stacks/bundles/{repo-hygiene,repo-gates}.md`             | the pins — one lost update if two units bump           | U5 only |
| `stacks/inventory.md`, `.claude-plugin/marketplace.json`  | generated                                              | U5 only |
| `repo-hygiene/repo-hygiene/pack.yaml`, `dprint/pack.yaml` | each pack's own version line — the pack unit's         | U1 / U3 |
| `assets/output-tree.md`                                   | the allowlist — read by U1's conventions, edited by U2 | U2 only |
| the docs                                                  | docs                                                   | U4 only |

## Waves

- **Wave 1 — U1, U2, U3.** Two packs and the doctrine+checker pair, disjoint
  paths. U1's `conventions.md:31` and U2's `output-tree.md` say the same thing
  in different files; each carries the agreed wording from decision 2 verbatim.
- **Wave 2 — U4**, the docs unit.
- **Wave 3 — U5**, the gates-and-bump unit.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `mise run plugins:npm-normalize-test`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer`,
`pnpm exec tsc --noEmit -p scripts`, `mise run site:check` — plus the wave
review, plus every report read for `UNRESOLVED:`. The plan's own checks:

- `test -f plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/renovate.json && ! test -e plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.config/renovate.json`.
- `grep -rn '\.config/renovate\.json' plugins/ .claude/ site/src/content/docs/ CLAUDE.md readme.md`
  → nothing (from wave 2 on — this is U4's Verification and U5's, not a
  preflight line).

## After landing

| Step                     | Mode | Notes                                                                                                                                               |
| ------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run plugins:local` | run  | stages stackgen into the dev marketplace under `1.6.1+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |
| `/release`               | ask  | cuts `stackgen-v1.6.1`; reaches every user of the marketplace                                                                                       |

## Gates the orchestrator keeps

- `pnpm vitest run --reporter=verbose scripts/src/check.test.ts` shows the new
  test (a pack shipping `CLAUDE.md` at its `config/` root is refused; one
  shipping `renovate.json` there is accepted) passing by name.
- None else: no manifest, skill list or agent change, so no `target-verifier`
  run. The final report says so in one line.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. Exception by ruling: U1 and U3 each edit their own pack's `pack.yaml`
version line, which is the pack's, not the plugin's.

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

- **This repo's own `.config/renovate.json`** — moved by
  `docs/plans/2026-09-10-repo-task-groups-and-editor-block/`, which requires
  this plan.
- **`/vwf:init`'s pass 1** — reads the allowlist as written; with the two-tier
  wording it needs no change. Any init edit is the vwf pair plan's.
- **Any `.github/renovate.json`** — rejected in decision 1.
- **The exec-plugin checksum prompt itself** (`setup/mise:36-41`) — correct as
  designed; only its consequence is documented.

## Parked

none

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green       | All eight gate lines pass on the branch point: `plugins:check`, `plugins:marketplace --check`, `plugins:inventory --check`, `plugins:npm-normalize-test`, `pnpm vitest run`, `tsc -p installer`, `tsc -p scripts`, `site:check`. Note: the two `--check` tasks need `mise run <task> -- --check`; without the `--` mise eats the flag. Worktree bootstrap `setup:worktree` failed at `setup:deps:audit` (`pnpm audit --reporter=summary` — pnpm 12.3.4 rejects `summary`), a pre-existing repo defect outside this plan; dependencies did install and the rewritten `pnpm-lock.yaml` was restored.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U3        | opus  | 1     | green       | SKILL.md "Running it" gains the pin sentence; pack.yaml 1.0.0 → 1.0.1. DECIDED: conventions.md untouched — its pinning bullet never implies automatic updates, so edit 2's conditional did not fire. DECIDED: `plugins:check` red on U1's path only (`config/renovate.json` not yet in the landable set) — resolves when U2 lands. No GAP.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 6982a210 |
| 1    | U1        | opus  | 1     | green       | `config/.config/renovate.json` → `config/renovate.json` (byte-identical); conventions.md row, allowlist paragraph (two-tier wording) and Dependency-updates paragraph repathed; SKILL.md drops the `**/.config/renovate.json` glob; pack.yaml 1.0.0 → 1.0.1. DECIDED: conventions.md names the doctrine by role, not by `assets/output-tree.md` path — rule 13 refuses a bare `assets/…` citation in a landed file. DECIDED: skill `version:` left alone (tracks independently; plan named pack.yaml only). GAP: mempalace.yaml reason clause unspecified — assumed wanted, wrote the mine-discovery reason. DOCS FALSIFIED: `.claude/skills/stackgen-plugin/SKILL.md:92` (U4's); `plugins/stackgen/assets/kinds.md:463` — nobody-owned → **U4's Owns widened** to that file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |          |
| 1    | U2        | opus  | 1     | green       | output-tree.md allowlist rewritten as two marked tiers (landable; "vwf's — no pack lands them"), `renovate.json` added, (c) repointed off `.config/`, dated paragraph on why Renovate's file is at the root; check.ts adds `renovate.json` to the landable set with a doc comment on the absent vwf tier; check.test.ts gains three rule-11 cases (renovate.json accepted; CLAUDE.md and mempalace.yaml refused). DECIDED: the ":193 not on the list at all" sentence now reads "in the second tier only"; the fence is untouched. DECIDED: renovate.json reasoning is its own dated paragraph, so "the five added on 2026-09-06" stays true. DOCS FALSIFIED: kinds.md:463 (U4, widened); stackgen-plugin SKILL.md:92 (U4); CLAUDE.md Tasks bullet on rule 11 (U4). Full vitest red only in inventory.test.ts on the dprint pin — U5 re-pins.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |          |
| 1    | R1        | opus  | 1     | findings(5) | CONTRACT clean. RULINGS: U1 departed from decision 2 — conventions.md:45 claims it "never diverges" from output-tree.md while :39 keeps manifests/lockfiles in the landable tier that output-tree.md:173 excludes → U1 round 2. U2: output-tree.md:173 and :132 fold ragged (hand-folded tree) → U2 round 2. Rule 5, nobody-owned: `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:71` allowlist enumeration omits renovate.json and lists CLAUDE.md as landable → **U4's Owns widened**. Rule 5, U4's: `.claude/skills/stackgen-plugin/SKILL.md:125` "not on the list at all" → DOCS FALSIFIED to U4. Verified clean: payload byte-identical, no payload formatted, dprint check clean on scripts, no residue.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |          |
| 1    | U1        | opus  | 2     | green       | conventions.md allowlist paragraph re-aligned to output-tree.md's two tiers: landable set now the same list in the same order (incl. `eslint.config.mjs` by name, `renovate.json`); manifests and lockfiles moved out of the landable tier and stated as "not on the list at all"; closing claim weakened to "restates that contract and adds nothing to it"; doctrine still named by role (rule 13). `plugins:check` green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | e6689f7c |
| 1    | U2        | opus  | 2     | green       | output-tree.md: bullet (c)'s body and the manifests/lockfiles paragraph re-folded to the surrounding 68–76 column band; fold only, content byte-identical. check.ts and check.test.ts unchanged this round. `plugins:check` green; check.test.ts 113 passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 90fdc4d2 |
| 1    | R1        | opus  | 2     | pass        | FINDINGS 0. All three unit findings resolved (conventions.md tiers match output-tree.md entry for entry; both folds now 62–76). CONTRACT clean, RULINGS clean. Re-verified payload byte-identical, no payload formatted. Note, not a finding: U1 moved the "linter's root shim" gloss from `fnox.toml` to `eslint.config.mjs`, agreeing with output-tree.md; `fnox.toml` now unglossed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |          |
| 1    | gate      | —     | 1     | green*      | Green: `plugins:check`, `plugins:marketplace --check`, `plugins:npm-normalize-test`, `tsc -p installer`, `tsc -p scripts`, `site:check`, and the plan's renovate.json move check. Red on one cause: `plugins:inventory --check` and `pnpm vitest run` (inventory.test.ts only) — `repo-gates.md` pins `dprint@1.0.0` and `repo-hygiene.md` pins `repo-hygiene@1.0.0` while both pack.yaml files read 1.0.1 (U1/U3's ruled bumps). The pins and `inventory.md` are U5's alone by the Shared-file rule, so these two lines are red by the plan's own construction until wave 3; attributed to U5 (pending), not a failure. No `UNRESOLVED:` in any report. **GAP (orchestrator):** the pre-commit `plugins-inventory` hook fires on any `stacks/` path, so U1's and U3's commits cannot pass with their `pack.yaml` bump staged while the pins are not. Assumption: each unit's commit carries its Owns minus the `pack.yaml` version line; the two version lines stay in the worktree and ride U5's gates-and-bump commit together with the pins and the regenerated inventory — the atomic set the hook enforces. Commit order was U2 → U1 → U3: the `plugins-check` hook refused U1 first (U2's unstaged checker change was stashed by pre-commit), and U1's still-staged files then rode into U2's commit; both were soft-reset and redone with exact per-unit staging. | —        |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-10-hygiene-pack-renovate-and-allowlist
