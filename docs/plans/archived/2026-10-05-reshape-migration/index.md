---
type: vwf-change-plan
title: vwf setup reshape migrates stackgen-v2.0.0 repos onto the template layout
requires: [ docs/plans/2026-10-05-vwf-callers-on-templates ]
backlog: []
backlog_pieces: []
---

# Plan — reshape migrates old-layout repos (2026-10-05)

## Status

**ARCHIVED**

ARCHIVED 2026-10-07 — not run; was APPROVED

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release stackgen publicly                         | none    |
| Release vwf publicly                              | none    |
| Release site publicly                             | none    |

**The mode recorded here is the consent.** `p:plugins:local` runs on a green
landing without a prompt; the staged plugins are picked up only by a
**restarted** session. **No release step** — user, verbatim: *"no release step,
only local release which I will first test and then ask for release"*. U5 still
leaves every project ready to release: stackgen (`3.0.0`) and vwf (`20.1.0`)
already sit above their tags; the site takes one patch via
`mise run p:site:version` (bare, first, on a clean tree) when
`site/package.json` still equals the last `site-v*` tag.

## Goal

`/vwf:setup reshape` migrates any repo shaped by `stackgen-v2.0.0` /
`vwf-v20.0.1` — the base repo and every member, in one consent — onto the
template layout plans 1–3 built: tool-config's script carries the mechanics,
`.config/vwf.yaml` moves to `config_format` 23, and **no doc, skill or site page
anywhere still describes the old model** (user: *"Ensure that all changes are
done, including docs & site"*).

**Plan 4 of the four-plan chain** — 1 `2026-10-05-tool-config-template-engine`,
2 `2026-10-05-tool-config-templates`, 3 `2026-10-05-vwf-callers-on-templates`, 4
this. Requires plan 3. `2026-10-02-fnox-dev-only` requires this plan and is
re-planned after it (Parked).

No reversal: the migration was agreed in the chain's first interview (user:
*"migration through `vwf:setup reshape`"*), and memory
`maintainer-machine-not-evidence` (migrate what released versions wrote) is
followed, not reversed.

## Facts the survey established

- **The source layout** — what `stackgen-v2.0.0`'s tool-config `all` writes.
  Read it from the tag, never from a laptop:
  `git show stackgen-v2.0.0:plugins/stackgen/skills/tool-config/...`. Its mise
  files: `.config/mise.toml` (settings plus a `RUNTIME_BLOCK` position),
  `.config/miserc.toml`, root `.config/mise.{dev,ci,test}.toml`,
  `.config/mise/conf.d/{env,env.dev,shell_alias.dev,tasks,tools,tools.dev}.toml`
  (`REPO_NAME`, `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN`, `MEMBERS` in
  `env.toml`); requester blocks `# >>> <requester>` / `# <<< <requester>` in
  section files, `.gitignore`, `.gitattributes`, `.graphifyignore`,
  `taplo.toml`, `gitleaks.toml`, `linter.yaml`, `pre-commit-config.yaml`;
  `renovate.json` on `update_bot = renovate`; pack whole-file task overlays;
  `.claude/stackgen/lock.yaml` entries with `source: tool-config/<tool>@<ver>`,
  `hash:`, `blocks:`/`keys:`/`shares:`/`templates:`.
- **The target layout** — plan 2's index.md (E1–E23, Template names) and plan
  3's (F1–F13) as landed; read the landed tree where they differ.
- **`vwf.yaml` 22** — `answers.secrets`, `answers.repos.<path>.forge`,
  `answers.repos.<path>.update_bot` (`plugins/vwf/assets/vwf-config.md` at
  `vwf-v20.0.1`); 23 drops `answers:` (plan 3 F7).
- **The scopes** — `.config/git-conventional-commits.yaml` `commitScopes:`.
- **Plan 3's stop** — init and setup report an old-layout repo and stop (plan 3
  F2); this plan turns that into the migration.
- **Multi-repo** — init's reshape already walks the base repo and every member
  under one consent (`plugins/vwf/skills/init/SKILL.md`, the member sections).
- **Docs** — `site/src/content/docs/how-to/brownfield/migrate-old-vwf-repo.md`
  (the migration how-to), `site/src/content/docs/plugins/{vwf,stackgen}.md`,
  `.claude/skills/{stackgen-plugin,vwf-plugin}/**`, `.claude/docs/**`,
  `CLAUDE.md`, `readme.md`.
- **Commit convention** — `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`.

## Assumed decisions — confirm or override at review

| #  | Decision             | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Rejected                      | Unit   |
| -- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------ |
| G1 | Where it lives       | The migration lives in tool-config's script: `all` on an old layout (no `stackgen.yaml`, old conf.d files present) returns migration rows — seed `stackgen.yaml` from `conf.d/env.toml` (`REPO_NAME`, merge models, `MEMBERS`) and `git-conventional-commits.yaml` (`commitScopes`), delete each retired file, render the new layout. vwf's reshape passes `--forge` and `--secrets` from `vwf.yaml`'s `answers:` (stackgen never reads a vwf file), then drops `answers:` and sets `config_format: 23`. Pack contents come back by re-running `pack` for each pinned pack. | the LLM moving values by hand | U1, U2 |
| G2 | Source layouts       | Only `stackgen-v2.0.0`'s layout is migrated. Any other old layout is refused (exit 2) naming the remedy: run the last release's `/vwf:setup reshape` first. Test fixtures are built by running that tag's `all` in a scratch repo.                                                                                                                                                                                                                                                                                                                                          | every historic layout         | U1     |
| G3 | The repo's own lines | Lines outside every block in the old mise section files move to `conf.d/repo/mise.toml` or `conf.d/repo/mise.<env>.toml` (same environment), one `move` row each (`ok` or `keep-existing`). In the six marked files the repo's own lines stay outside the new `tool-config` markers. A whole-owned file edited by hand is a `needs-edit` row naming its target: an extra hook becomes a `code/check/repo` subtask; a changed task becomes a repo subtask.                                                                                                                   | `conf.d/local/`               | U1     |
| G4 | Retired files        | For each file the old lock records with `source: tool-config/…` or as a pack's whole-file overlay that plan 2 replaced: content hash equals the record → `delete` row (`ok` or `keep-existing`); differs → `needs-edit` naming what replaced it (a subtask, `conf.d/repo/`, nothing for `renovate.json`); a retired-name file the lock never recorded → left, said in `notes`. Afterwards every `source: tool-config/` entry leaves the lock.                                                                                                                               | —                             | U1     |
| G5 | Members              | Reshape runs the migration over the base repo and every member under one consent, a full render each — B55's fix.                                                                                                                                                                                                                                                                                                                                                                                                                                                           | shared configs                | U2     |
| G6 | vwf's side           | Plan 3's "old layout: say so and stop" becomes "offer the migration": init's reshape path calls `all` with the forge/secrets flags; setup's migrate pipeline gains the 22 → 23 body; setup's Step 0 and doctor name `/vwf:setup reshape` as the remedy for an old layout.                                                                                                                                                                                                                                                                                                   | —                             | U2     |
| G7 | Nothing stale        | The docs unit runs docs-sync over the **whole chain's** delta (from the commit before plan 1's first unit to this branch) and a repo-wide retired-name grep that must be empty outside `docs/plans/archived/`, `docs/memory/`, `docs/plans/2026-10-0*` folders and changelogs.                                                                                                                                                                                                                                                                                              | this plan's delta only        | U4     |
| G8 | Review row           | One `review` row covering U1 (runnable script code).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | wave review only              | R      |
| G9 | Landing              | After landing `mise run p:plugins:local` (`run`); no release step; the site takes one patch if unmoved since its last tag.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `/release` run or ask         | U5     |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                        | Kind   | Owns                                                                                                                                                                                                                                                                                                | Depends on | Status  | Commit |
| -- | ---- | ------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-migration-engine.md](01-migration-engine.md) | edit   | `plugins/stackgen/skills/tool-config/scripts/lib/migrate.mjs` (new), `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs`, `scripts/src/tool-config-migrate.test.ts` (new), `scripts/src/fixtures/tool-config/migrate/**` (new) | —          | pending |        |
| U2 | 1    | [02-vwf-reshape.md](02-vwf-reshape.md)           | edit   | `plugins/vwf/skills/init/**`, `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/doctor/**`                                                                                                                                                                                                         | —          | pending |        |
| U3 | 1    | [03-stackgen-prose.md](03-stackgen-prose.md)     | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/**`, `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/assets/**`                                                                 | —          | pending |        |
| R  | 2    | [04-review.md](04-review.md)                     | review | —                                                                                                                                                                                                                                                                                                   | U1         | pending |        |
| U4 | 3    | [05-docs.md](05-docs.md)                         | edit   | `site/src/content/docs/**`, `.claude/**`, `CLAUDE.md`, `readme.md`, `docs/memory/decisions/2026-10-05-*.md` (new files only), and any passage under `plugins/**` the retired-name grep still hits after U2 and U3                                                                                   | R, U2, U3  | pending |        |
| U5 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md)     | edit   | `site/package.json`, `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, pack `version:` lines and bundle pins, `plugins/stackgen/stacks/inventory.md`                                                                                                                       | U4         | pending |        |

## Shared-file rule

| File                                               | Why it collides                    | Owner                     |
| -------------------------------------------------- | ---------------------------------- | ------------------------- |
| `tool-config.mjs`, `lib/cli.mjs`                   | the migration branch and its flags | U1 only                   |
| init, setup and doctor trees                       | one reshape story across three     | U2 only                   |
| tool-config's SKILL and references                 | the migration's user-facing rules  | U3 only                   |
| a leftover stale passage under `plugins/**`        | found only by U4's final grep      | U4, wave 3 — after U2, U3 |
| version files, `inventory.md`, `site/package.json` | version and generated files        | U5 only                   |
| this repo's own `.config/**`                       | the user edits it by hand          | nobody                    |

## Waves

- **Wave 1** — U1, U2, U3: disjoint files (the script; vwf's three skills;
  stackgen's prose). U2 and U3 describe U1's rows by G1–G4, not by reading U1's
  code.
- **Wave 2** — R. **Wave 3** — U4 (the chain-wide sweep). **Wave 4** — U5.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                                                        |
| -------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into the dev marketplace; a restarted session picks them up; the user tests a real reshape, then asks for `/release` |

## Gates the orchestrator keeps

After wave 1 and again after U5, with isolated `HOME` and every `MISE_*` dir and
`trusted_config_paths` set to the scratch paths:

1. **Unedited old repo** — a scratch git repo (with an `origin`) shaped by the
   `stackgen-v2.0.0` script (`git worktree add <tmp> stackgen-v2.0.0`, then its
   `tool-config.mjs all … --answers <all ok>`). The new script's
   `preview all --forge github --secrets none` returns migration rows and no
   `needs-edit` row; the real call with every row `ok` exits 0; the tree then
   matches a fresh `all` on an empty repo with the same values, except
   `conf.d/repo/` when the old repo had own lines; `.config/stackgen.yaml` holds
   the `REPO_NAME`, merge models and `MEMBERS` the old `env.toml` held; no
   `source: tool-config/` entry is left in the lock.
2. **Idempotent** — a second `preview all` returns no rows.
3. **Edited variant** — the same old repo with one own line in
   `conf.d/tools.toml`, an extra hook in `pre-commit-config.yaml` and an edited
   `renovate.json`: the preview carries one `move` row (to
   `conf.d/repo/mise.toml`), and one `needs-edit` row for each of the other two.
4. **Older layout** — a repo whose files match no `stackgen-v2.0.0` shape is
   refused with exit 2 naming the last-release remedy.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc outside its Owns, never adds a dependency this file
does not list, never commits, never runs `git checkout`/`git restore` or a
formatter `--fix` outside its Owns. A unit deletes with plain `rm`, never
`git rm` — it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Migrating this repo's own `.config/` — the user edits it by hand.
- Any layout older than `stackgen-v2.0.0` (G2).
- A public release — the user tests the local install first, then asks.

## Parked

- fnox: re-plan `docs/plans/2026-10-02-fnox-dev-only` through `/vwf:change-plan`
  once this plan is written — keep its rulings D1–D16 verbatim; rewrite
  `FNOX_PROFILE` into the fnox pack's
  `templates/.config/mise/conf.d/fnox/mise.toml`; `fnox.local.toml` is already
  in tool-config's universal `.gitignore` (drop that unit); drop every doppler
  unit (plan 2 deleted the pack); its `requires:` stays this folder.
- B80: items 1 (init hygiene assets have no record) and 9 (installer notice)
  stay open.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-10-05-reshape-migration

or let the queue pick it, by priority:

/vwf:execute next
