---
type: vwf-change-plan
title: mise pack drops DISABLE_TELEMETRY from the generated mise.toml
requires: []
backlog: [ B48 ]
---

# Plan — mise pack drops DISABLE_TELEMETRY from the generated mise.toml (2026-09-19)

## Status

**RUNNING**

RUNNING since 2026-09-19T16:12Z in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-19-mise-drop-disable-telemetry

## Consent

| Action                                            | Granted                                                                                                                                                         |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                             |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                             |
| Release stackgen publicly                         | patch — `1.20.0` → `1.20.1`, a hand edit of `plugins/stackgen/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step, the tag waits |
| Release vwf publicly                              | none — untouched                                                                                                                                                |
| Release site publicly                             | none — untouched                                                                                                                                                |
| Release installer publicly                        | none — untouched                                                                                                                                                |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, a repo shaped by `/vwf:init` gets a `.config/mise.toml` whose
`[env]` sets nothing about telemetry, and the mise skill no longer documents
`DISABLE_TELEMETRY`. The `[env]` tier of the base `mise.toml` then holds only
the marked positions (`REPO_NAME`, `MERGE_MODEL`, `MEMBERS`) and the sentence
that introduced the key as the example of "what is identical everywhere" is
reworded to name no example.

Backlog item B48. Not a reversal: no decision doc, memory or drawer mandates the
key; it was a carry-over from the reference stack.

## Facts the survey established

- Exactly three passages carry the key, all in the mise pack:
  - `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml:94`
    — `DISABLE_TELEMETRY = 1` under `[env]`, below a two-line comment ("Names
    shared with the variants; the VALUES live per layer. Only what is the same
    everywhere belongs here.") and above the `REPO_NAME` marked position.
  - `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/config-files.md:82`
    — the same line inside the quoted `mise.toml` block, under a one-line
    comment ("Only what is identical in every environment.").
  - `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md:145` —
    "`mise.toml` `[env]` — only what is identical everywhere
    (`DISABLE_TELEMETRY`), plus **`REPO_NAME`**: …".
- No hit in `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`,
  `installer/**`, `.claude/**`, `plugins/vwf/**`, `scripts/**`. The site's
  stackgen page does not describe the `[env]` tier's contents.
- This repo's own `.config/mise.toml` already lacks the key — the pack is behind
  the repo; nothing outside `plugins/` changes.
- The pack is `toolchain-manager/mise` at `1.2.2` (`pack.yaml:6`), pinned once,
  in `plugins/stackgen/stacks/bundles/mise.md:7`, and listed twice in the
  generated `plugins/stackgen/stacks/inventory.md` (`:103`, `:152`). The
  generator refuses a bundle pin the pack no longer carries, so the pack bump,
  the pin and the regenerated inventory must land in **one commit**.
- `plugins/**/*.md` is not dprint-formatted; `plugins/*/stacks/*/*/config/` is
  excluded from every formatter as payload. The taplo config does not reach the
  payload either.
- Gates covering the tree: `p:plugins:marketplace --check`,
  `p:plugins:inventory --check`, `p:plugins:check` (rule 11 walks the pack's
  `config/` tier), `code:precommit`. No test fixture hashes the payload.
- stackgen plugin is `1.20.0`; vwf `19.35.0`; site `1.1.30` — the last two
  untouched.
- Commit types allowed: `ops docs merge feat fix refactor`; no scopes.
- Plan index holds no active row → priority 10.

## Assumed decisions — confirm or override at review

| # | Decision                           | Ruling                                                                                                                                                                                                                                | Rejected                                                      | Unit |
| - | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---- |
| 1 | The `[env]` sentence in `SKILL.md` | Reword `SKILL.md:145` to name no example: the `[env]` tier of `mise.toml` holds only what is identical everywhere — today that is nothing but the marked positions — and the sentence continues with `REPO_NAME` unchanged            | keep an abstract example in the parenthesis                   | U1   |
| 2 | Pack version                       | `toolchain-manager/mise` bumps **patch**, `1.2.2` → `1.2.3` — a payload line removed, no new marked position; the bundle pin in `bundles/mise.md` follows, and U1 runs `mise run p:plugins:inventory` so the three land in one commit | minor; leaving the pack unbumped (the payload's hash changes) | U1   |
| 3 | Review row                         | None — a removed TOML line and two prose edits are read, not executed                                                                                                                                                                 | a `Kind: review` row                                          | —    |
| 4 | Wave gate                          | `p:site:check` left out — the site tree is untouched and no site version moves                                                                                                                                                        | keep it for parity with the last plans                        | —    |
| 5 | Payload comment                    | The two-line comment above the removed line stays (it introduces the tier; the marked-position comment below stands alone); the one-line comment in `config-files.md:81` stays for the same reason                                    | delete the comments with the key                              | U1   |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                     | Depends on | Status  | Commit        |
| -- | ---- | -------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------------- |
| U1 | 1    | [01-mise-pack.md](01-mise-pack.md)           | edit | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/config-files.md`, `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`, `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/stacks/inventory.md` | —          | green   | 34d383af      |
| U2 | 2    | [02-docs.md](02-docs.md)                     | edit | `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/**` (expected no-op)                                                                                                                                                                                                                                                                                                      | U1         | green   | — (no change) |
| U3 | 3    | [03-gates-and-bump.md](03-gates-and-bump.md) | edit | `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                                                         | U2         | pending |               |

## Shared-file rule

| File                                              | Why it collides                                       | Owner   |
| ------------------------------------------------- | ----------------------------------------------------- | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`     | the plugin version                                    | U3 only |
| `.claude-plugin/marketplace.json`                 | generated from the plugin manifests                   | U3 only |
| `plugins/stackgen/stacks/inventory.md`            | generated from the stacks tree; must ride U1's commit | U1 only |
| `readme.md`, `CLAUDE.md`, `site/**`, `.claude/**` | human-facing docs                                     | U2 only |

## Waves

- Wave 1: U1 alone — the pack edit, the pack bump, the pin and the inventory.
- Wave 2: U2 alone — docs-sync over wave 1's delta; expected to find nothing.
- Wave 3: U3 alone — the stackgen bump and the marketplace regeneration.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                       |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen at `1.20.1+N` into the dev marketplace and updates this machine's install; publishes nothing, cuts no tag; a **restarted** session loads it |

## Gates the orchestrator keeps

none beyond the wave gate — U3's verification greps `plugins/` for the key and
requires zero hits.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits — with the one exception this plan names: U1 runs
`mise run p:plugins:inventory`, per decision 2. A unit deletes with plain `rm`,
never `git rm` — it stages nothing.

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

- This repo's own `.config/mise.toml` — already carries no `DISABLE_TELEMETRY`;
  nothing to change.
- Any other `[env]` key of the payload, and the `mise.dev.toml` / `mise.ci.toml`
  / `mise.test.toml` variants — the request names one key.
- A public release of stackgen — the bump lands, the tag waits for the next
  `/release`.

## Parked

none

## Run log

| Wave | Unit      | Model | Round | Outcome | Detail                                                                                                                                                                                                                                                                   | Commit   |
| ---- | --------- | ----- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight | —     | —     | green   | doctor: no `.config/vwf.yaml`, no project scoped; mise, graphify CLI and the main checkout's graph present, no blocking finding; no `code` unit — LSP rule and conventions fetch skipped; format check skipped (no `covers:`); wave gate 4/4 green on the inherited tree | —        |
| 1    | U1        | opus  | 1     | green   | six owned files changed; DECIDED none; GAP: `git diff --stat` showed the plan folder's own index.md too — the orchestrator's status/run-log edit re-padded by the format hook, not the unit's; verification 5/5 green                                                    | 34d383af |
| 1    | R1        | opus  | 1     | pass    | findings 0; CONTRACT clean; RULINGS clean; payload diff exactly one deleted line, SKILL.md refolded within surrounding width, no telemetry prose anywhere outside plugins/                                                                                               | —        |
| 2    | U2        | opus  | 1     | green   | CHANGED none — docs-sync surveyed develop..HEAD against readme.md, CLAUDE.md, installer/CLAUDE.md, site/CLAUDE.md, .claude/**, site/src/content/docs/**: no falsified passage; DECIDED none; GAP only the folder's own re-padding; commit skipped per the unit file      | —        |
| 2    | R2        | opus  | 1     | pass    | findings 0; CONTRACT clean; RULINGS clean; no edit matches the survey fact                                                                                                                                                                                               | —        |
| 3    | U3        | opus  | 1     | green   | plugin.json 1.20.0 → 1.20.1; marketplace.json regenerated (ref stackgen-v1.20.1); DECIDED none; GAP none; verification 7/7 green                                                                                                                                         | —        |
| 3    | R3        | opus  | 1     | pass    | findings 0; CONTRACT clean; RULINGS clean; vwf/site/installer versions untouched                                                                                                                                                                                         | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-19-mise-drop-disable-telemetry

or let the queue pick it, by priority:

/vwf:execute next
