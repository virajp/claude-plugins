---
type: vwf-change-plan
title: hygiene pack — Renovate at a path Renovate reads, one root allowlist,
  and the dprint pin-update sentence
requires: []
---

# Plan — hygiene pack: Renovate, the root allowlist, dprint pins (2026-09-10)

## Status

**APPROVED** 2026-09-10 by the user, after the shape gate and the
post-self-review yes.

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

| Id | Wave | Unit file                                                | Owns                                                                                                                                                                                                                         | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-hygiene-pack.md](01-hygiene-pack.md)                 | `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/**`                                                                                                                                                                       | —          | pending |        |
| U2 | 1    | [02-doctrine-and-checker.md](02-doctrine-and-checker.md) | `plugins/stackgen/assets/output-tree.md`, `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                | —          | pending |        |
| U3 | 1    | [03-dprint-pack.md](03-dprint-pack.md)                   | `plugins/stackgen/stacks/toolchain-gate/dprint/**`                                                                                                                                                                           | —          | pending |        |
| U4 | 2    | [04-docs.md](04-docs.md)                                 | `.claude/skills/stackgen-plugin/**`, `site/src/content/docs/plugins/stackgen.md`, `CLAUDE.md`, `readme.md`, `.claude/docs/**`, `docs/memory/decisions/**` (none expected)                                                    | U1–U3      | pending |        |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md)             | `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/bundles/repo-hygiene.md`, `plugins/stackgen/stacks/bundles/repo-gates.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json` | U4         | pending |        |

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

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-10-hygiene-pack-renovate-and-allowlist
