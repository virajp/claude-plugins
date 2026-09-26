---
type: vwf-change-plan
title: linter pin in the packs — each language stack decides its linter and
  its runtime
requires:
  - docs/plans/2026-09-26-init-commits-the-lock
backlog: [ B70 ]
backlog_pieces: []
---

# Plan — linter pin in the packs — each language stack decides its linter and its runtime (2026-09-26)

## Status

**APPROVED**

APPROVED 2026-09-26 by the user

## Consent

| Action                                            | Granted                                                                                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                       |
| Release stackgen publicly                         | minor if the version in `plugins/stackgen/.claude-plugin/plugin.json` is already tagged when the run starts (by editing that file), else none — rides it; no release step |
| Release vwf publicly                              | minor if the version in `plugins/vwf/.claude-plugin/plugin.json` is already tagged when the run starts (by editing that file), else none — rides it; no release step      |
| Release site publicly                             | none — not this time                                                                                                                                                      |
| Release installer publicly                        | none — untouched                                                                                                                                                          |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, the house linter is installed only by the stacks that lint
with it, each bringing the runtime it needs; the mise base no longer pins it for
every repo; and a markdown-only repo lints its markdown.

The framing: B70, from the gate-hardening gaps: the base pin makes blank,
docs-only and uv/ruff repos install and lock a Node tool no task calls, CI's
layer (also production's) pulls it, and swift, swiftui and flutter call it
without any node. The user ruled: *"`linter` is not universal, it's dependent on
what stack is selected"* and *"The language-stack will decide which linter to be
installed"*. It uses B2's `mise.d/` mechanism
(`docs/plans/2026-09-26-mise-conf-d-packs`) and runs after
`docs/plans/2026-09-26-init-commits-the-lock`. Not a reversal of a standing
decision; it reverses the gate-hardening ruling that put the pin in the base
(B70's own premise).

## Facts the survey established

- **The pin today**:
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml:196`
  (`"npm:@askviraj/linter" = { version = "1.1.6", allow_low_downloads = true }`);
  after B1 it sits in the mise pack's `conf.d/tools.toml`, after M under
  `plugins/vwf/skills/init/packs/mise/`. Prose: mise `conventions.md:36-43`
  ("The house linter is the base's one tool"), `skills/mise/SKILL.md:93`,
  `references/config-files.md:118`; mise's `tasks/code/lint:15-35` (the slot
  comment: "The house linter is pinned in the base").
- **Callers** — `code:lint` runs
  `mise which linter --tool npm:@askviraj/linter`:
  `plugins/stackgen/stacks/package-manager/pnpm/…/tasks/code/lint:100`,
  `toolchain-gate/eslint/…/code/lint:103` (and
  `skills/eslint/SKILL.md:5,27,74`), `app-framework/flutter/…/code/lint:103`,
  `language/swift/…/code/lint:201`, `app-framework/swiftui/…/code/lint:201`.
  ruff's `code/lint` does not call it.
- **Markdown**: `plugins/stackgen/stacks/language/markdown/` holds only
  `pack.yaml` (`0.1.0`) and `conventions.md`; `conventions.md:20-21` says
  formatting, linting and link checking are repo-axis concerns, while mise's
  `code/lint` comment says a language pack wires the linter — so nothing lints
  markdown in a docs-only repo. Pinned by `bundles/claude-code-plugin.md`.
- **Pack versions today** (later plans bump some first): pnpm `0.3.1`, eslint
  `0.3.1`, flutter `0.4.1`, swift `0.1.1`, swiftui `0.2.0`, markdown `0.1.0`.
  Bundle pins: pnpm in 15 bundles, eslint in 13, flutter in `dart-flutter.md`,
  swift in `swift-package.md`, swiftui in `swift-swiftui.md`, markdown in
  `claude-code-plugin.md`.
- **Merge mechanism** after B2: init merges each landed pack's
  `mise.d/<section>[.<env>].toml` into
  `.config/mise/conf.d/<section>[.<env>].toml` between `# >>> <pack>` /
  `# <<< <pack>` markers
  (`plugins/vwf/skills/init/references/fragments-and-sections.md`, "mise section
  blocks"); drift is asked, no hash. Two blocks pinning one tool make a
  duplicate TOML key.
- **Composition order**: the materializer's order decides which pack's
  `code:lint` wins when several ship one
  (`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`,
  "later component's file wins").
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes.

## Assumed decisions — confirm or override at review

| #  | Decision        | Ruling                                                                                                                                                                                                                                                                          | Rejected                                       | Unit  |
| -- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----- |
| 1  | Who pins        | The language stack decides its linter and its runtime — the user: *"The language-stack will decide which linter to be installed"*. pnpm and eslint pin the linter in `mise.d/tools.toml`; flutter, swift and swiftui pin the linter and `node`.                                 | JS/TS stacks only; an opt-in linter pack       | U1    |
| 2  | Markdown        | The markdown pack pins the linter and `node` in `mise.d/tools.toml` and ships a `code:lint` for `*.md`; any other language pack's `code:lint` overrides it (composition order), so markdown's only runs where no other language lints. Its prose and mise's slot comment agree. | a separate P0 backlog item                     | U2    |
| 3  | Shared pin      | init's merge writes a tool that more than one landed pack pins once, in a `# >>> shared` block, with a one-line comment listing the packs that need it; the line stays while any of them is landed and is pruned when none are; differing versions across packs are asked.      | first pack in order wins; keeping the base pin | U3    |
| 4  | Base            | init's mise pack drops the linter pin from its payload; its prose stops calling it the base's one tool.                                                                                                                                                                         | —                                              | U3    |
| 5  | Readable errors | Each caller's `code:lint` prints, for a missing pin or `node`, which pack pins it and `MISE_ENV=dev mise run setup:all`, instead of mise's raw error.                                                                                                                           | —                                              | U1 U2 |
| 6  | Environment     | The pin (and `node`) sit in `tools.toml`, every environment, because CI lints.                                                                                                                                                                                                  | `tools.dev.toml` (CI would not lint)           | U1 U2 |
| 7  | Review row      | One `Kind: review` row (U5): the `code:lint` tasks change.                                                                                                                                                                                                                      | the wave review alone                          | U5    |
| 8  | Pack bumps      | pnpm, eslint, flutter, swift, swiftui and markdown each bump one minor from their `pack.yaml` version at run time (skipping a 13 or 17 component), with every bundle pin and `inventory.md`, in one commit.                                                                     | leaving pack versions unchanged                | U7    |
| 9  | Plugin versions | For each plugin: if its current version is already tagged when the run starts, bump the minor; otherwise ride it. No release step.                                                                                                                                              | always bump; `/release` as ask                 | U7    |
| 10 | Comments        | Any comment or sentence a unit adds is one line (B65).                                                                                                                                                                                                                          | —                                              | all   |

## New dependencies

none — `node` and the linter are mise tool pins, already used.

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-callers.md](01-callers.md)               | edit   | `plugins/stackgen/stacks/package-manager/pnpm/**`, `plugins/stackgen/stacks/toolchain-gate/eslint/**`, `plugins/stackgen/stacks/app-framework/flutter/**`, `plugins/stackgen/stacks/language/swift/**`, `plugins/stackgen/stacks/app-framework/swiftui/**`                          | —          | pending |        |
| U2 | 1    | [02-markdown.md](02-markdown.md)             | edit   | `plugins/stackgen/stacks/language/markdown/**`                                                                                                                                                                                                                                      | —          | pending |        |
| U3 | 1    | [03-init.md](03-init.md)                     | edit   | `plugins/vwf/skills/init/references/fragments-and-sections.md`, `plugins/vwf/skills/init/packs/mise/**`                                                                                                                                                                             | —          | pending |        |
| U5 | 2    | [05-review.md](05-review.md)                 | review | —                                                                                                                                                                                                                                                                                   | U1, U2, U3 | pending |        |
| U6 | 3    | [06-docs.md](06-docs.md)                     | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`                                                                                                                                                                                                                  | U5         | pending |        |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md) | edit   | the `version:` line of the six packs' `pack.yaml`, every `plugins/stackgen/stacks/bundles/*.md` pin naming them, `plugins/stackgen/stacks/inventory.md`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | U6         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                           | Why it collides                                          | Owner                                   |
| -------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------- |
| the six packs' `pack.yaml` `version:` lines, their bundle pins | a version, its pins and the inventory land in one commit | U7 only (U1/U2 edit the rest in wave 1) |
| both `plugin.json` files, `marketplace.json`, `inventory.md`   | version and generated files                              | U7 only                                 |
| every human-facing doc outside `plugins/`                      | n units, one doc                                         | U6 only                                 |

## Waves

- **Wave 1 — U1, U2, U3.** Disjoint pack trees and init files.
- **Wave 2 — U5**, review. **Wave 3 — U6**, docs. **Wave 4 — U7**, gates and
  bumps.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

every line with `MISE_ENV=dev` exported, plus the wave review, plus every report
read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                     |
| -------------------------- | ---- | ------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages both plugins on this machine; picked up by a **restarted** session |

## Gates the orchestrator keeps

**A scratch repo with pnpm and eslint**, after wave 1, isolated (`HOME` and
every `MISE_*` dir under one `mktemp -d`): lay down init's mise pack and follow
init's merge reference by hand for the pnpm and eslint `mise.d/` files. Pass
condition: `conf.d/tools.toml` carries the linter once, in a `# >>> shared`
block listing pnpm and eslint, and no pack block repeats it; the file parses
(`MISE_ENV=dev mise config ls` succeeds); removing eslint and re-merging keeps
the line, listing pnpm only. Record in the Run log; a failure goes back to U3.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **This repo's own linter pin** — this repo lints its TypeScript; its pin is
  its own, not a pack's.
- **A separate production environment** so CI's layer stops pulling the linter
  into deploys — not raised as a need; the pin stays in `tools.toml`.
- **B66**, **B65**.

## Parked

none

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-linter-pin-in-the-packs

or let the queue pick it, by priority:

/vwf:execute next
