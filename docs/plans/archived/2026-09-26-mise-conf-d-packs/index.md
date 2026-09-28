---
type: vwf-change-plan
title: mise conf.d packs — init merges each pack's mise lines into the section
  files
requires:
  - docs/plans/2026-09-26-universal-packs-into-init
backlog: [ B54 ]
backlog_pieces: []
---

# Plan — mise conf.d packs — init merges each pack's mise lines into the section files (2026-09-26)

## Status

**ARCHIVED**

ARCHIVED 2026-09-26 — not run; was APPROVED. Superseded by the user's ruling
that a stackgen mise skill composes mise config (no packs move into init);
re-planned.

## Consent

| Action                                            | Granted                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                     |
| After landing: `mise run p:plugins:local`         | run                                                                                                     |
| After landing: `/release`                         | ask                                                                                                     |
| Release vwf publicly                              | none — no bump; rides `20.0.0` from `2026-09-26-universal-packs-into-init`; tagged via `/release` (ask) |
| Release stackgen publicly                         | none — no bump; rides `2.0.0` from the same plan; tagged via `/release` (ask)                           |
| Release site publicly                             | none — not this time                                                                                    |
| Release installer publicly                        | none — untouched                                                                                        |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, the five packs that shipped a `conf.d/<pack>.toml` fragment —
pnpm, swiftlint, fnox, doppler, swiftui — keep their mise lines in `mise.d/`
inside the plugin, never landed; `/vwf:init` merges them into
`.config/mise/conf.d/<section>[.<env>].toml` between per-pack markers, and on
drift asks the user what to do. No repo carries a `conf.d/<pack>.toml` again.

The framing: B54, last piece; this plan finishes it. B1
(`docs/plans/2026-09-26-mise-conf-d-layout`) split mise config into section
files; M (`docs/plans/2026-09-26-universal-packs-into-init`) made init the owner
of the mise pack. The user on the source: *"it must not land inside the repo, it
must stay with the plugin and only be used from there to read and make edits in
the repo at the respective locations"*; on drift: *"Do we need hash ? Once the
files are created or migrated, the user may make changes as per their
requirements. Now the next time `setup` or `init` is run and finds the drift,
skill must check with user on what to do and accordingly do it"*.

Reversal, confirmed: the charter fence's payload kind (d), a provider's
`conf.d/<pack>.toml`
(`docs/memory/decisions/2026-09-05-charter-fence-opens-for-gate-configs.md:28`),
is retired — B1 began it, this plan finishes it.

## Facts the survey established

- **The five fragments** (after B1 and M, paths unchanged in stackgen):
  - `plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/conf.d/pnpm.toml`
    — `[shell_alias] npx = "pnpm dlx"`; `pack.yaml:12` conditional covers only
    `vscode.d`; `conventions.md:21-23`.
  - `plugins/stackgen/stacks/toolchain-gate/swiftlint/config/.config/mise/conf.d/swiftlint.toml`
    — `[tools]` `aqua:realm/SwiftLint`; `pack.yaml:14`; `conventions.md:29`;
    `skills/swiftlint/SKILL.md:21`.
  - `plugins/stackgen/stacks/capability-provider/fnox/config/.config/mise/conf.d/fnox.toml`
    — `[tools]` fnox; `skills/fnox/SKILL.md:18`; `conventions.md:45`.
  - `plugins/stackgen/stacks/capability-provider/doppler/config/.config/mise/conf.d/doppler.toml`
    — `[tools]` doppler, `[env]` `DOPPLER_CONFIG = "local"`, `DOPPLER_PROJECT`
    from a `config_root` template (:32–38, overrides in `mise.local.toml`);
    `tasks/setup/secrets:16,24`; `skills/doppler/SKILL.md:18`;
    `conventions.md:29,31,49`; references `pick-and-trade.md:56`,
    `access-shape.md:43-50`, `local-stack.md:35`.
  - `plugins/stackgen/stacks/app-framework/swiftui/config/.config/mise/conf.d/swiftui.toml`
    — `[env]` `XCODE_VERSION`, `SIMULATOR_PLATFORM`, `SIMULATOR_DEVICE`,
    `SIMULATOR_OS` shipped `""`, all `machine_env` (`pack.yaml:32-67`, committed
    pins); `_scripts/xcode:11,31,41-61` reads `.config/mise.toml [env]` (:54);
    `tasks/test/golden:32,86,93,106,109`; `conventions.md:49,73-81,106,125`;
    `skills/ux-gate/SKILL.md:54,69`;
    `skills/swiftui/references/build-and-signing.md:27,35`; `testing.md:88`.
- **Today's landing**: the materializer copies a fragment verbatim
  (`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:116-131`);
  `/vwf:setup` fills `machine_env` in "the file the pack landed"
  (`plugins/vwf/skills/setup/references/materialize.md:170-248`), moving a
  committed value out of `.config/mise.toml [env]` (:187–198), gated on the lock
  hash (:207–212); `stackgen-sync` carries `machine_env` values across a pack
  update (`plugins/stackgen/skills/stackgen-sync/SKILL.md:58-68,206-208`).
- **init's composition idiom**:
  `plugins/vwf/skills/init/references/fragments-and-sections.md:120-176`
  (`pre-commit.d` markers `# >>> …` / `# <<< …`, replace between markers, keep
  outside byte for byte, prune a removed fragment's pair, validate, re-record),
  :177+ (`vscode.d`). After M the mise pack is init's
  (`plugins/vwf/skills/init/packs/mise/`); its own references to provider
  fragments: `tasks/setup/secrets:16`, `skills/mise/SKILL.md:24,131-133`,
  `references/config-files.md:222,272-276`, `task-library.md:276`,
  `conventions.md:225`; `packs/repo-hygiene/conventions.md:258`;
  `init/references/new-repo.md:449`.
- **Checker**: `scripts/src/check.ts` `PACK_CONF_D` :549, `packFactFaults`
  :554–676 (globs the pack's `config/.config/mise/conf.d/*.toml`, :647–651; each
  `machine_env` name a key of an `[env]` table, :660–668; `tomlEnvKeys`
  :680–701); tests `check.test.ts:671-790` (fixture :685
  `…/conf.d/swiftui.toml`). Line numbers may have moved after M's U2.
- **Doctor**: `plugins/vwf/skills/doctor/references/stack-checks.md` (e) content
  drift :462–541 re-tests one lock entry against one pack payload — a shared
  section file with several packs' blocks does not fit that test.
- **Other mentions**: `plugins/stackgen/stacks/readme.md:64,92`;
  `plugins/stackgen/stacks/bundles/{doppler.md:35,fnox.md:48,swift-swiftui.md:67}`;
  `plugins/stackgen/assets/pack-format.md:33,58-63,243-274`;
  `plugins/stackgen/assets/output-tree.md:130,142-146`.
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes. **Versions** after M: vwf `20.0.0`, stackgen `2.0.0`, untagged.

## Assumed decisions — confirm or override at review

| #  | Decision      | Ruling                                                                                                                                                                                                                                                                                                 | Rejected                                           | Unit  |
| -- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ----- |
| 1  | Pack source   | Each pack keeps its mise lines in `mise.d/<section>[.<env>].toml` at the pack root, outside `config/`, never landed; `config/.config/mise/conf.d/<pack>.toml` is deleted.                                                                                                                              | inline in `pack.yaml`                              | U1    |
| 2  | Merge         | init reads a pack's `mise.d/` from the plugin and merges each file into `.config/mise/conf.d/<section>[.<env>].toml` between `# >>> <pack>` / `# <<< <pack>` markers: replace between markers, keep everything outside byte for byte, prune a block whose pack is no longer landed, validate the TOML. | —                                                  | U2    |
| 3  | Drift         | No hash. On a later init or setup run, a block whose content differs from the pack's current lines — with the repo's `machine_env` values spliced into the pack's lines first — is shown to the user with take the pack's / keep mine / merge, and the answer applied.                                 | a per-block hash in init's lock; a whole-file hash | U2 U3 |
| 4  | setup         | `/vwf:setup`'s materialize pass invokes init's merge for any pack it lands that ships `mise.d/`. The `machine_env` fill writes the value inside that pack's block in `conf.d/env.toml` (or `env.<env>.toml`).                                                                                          | waiting for the next reshape                       | U3    |
| 5  | Migration     | A reshape folds an existing `.config/mise/conf.d/<pack>.toml` into the section blocks (values kept) and deletes the file, as one consent row per repo.                                                                                                                                                 | —                                                  | U2    |
| 6  | Scripts       | swiftui's `_scripts/xcode` and `tasks/test/golden`, and doppler's `tasks/setup/secrets`, read the values from the environment mise exports to the task, not from a config file path.                                                                                                                   | parsing `conf.d/env.toml`                          | U1    |
| 7  | Checker       | Rule 11 reads `machine_env` names from the pack's `mise.d/env*.toml`; a pack shipping anything under `config/.config/mise/conf.d/` is a finding.                                                                                                                                                       | —                                                  | U5    |
| 8  | stackgen-sync | Never edits a mise file; a pack whose `mise.d/` changed is reported with "run `/vwf:setup reshape`". The materializer no longer has a `conf.d` fragment rule.                                                                                                                                          | sync merging the blocks                            | U4    |
| 9  | Review row    | One `Kind: review` row (U6): shell tasks and the checker change.                                                                                                                                                                                                                                       | the wave review alone                              | U6    |
| 10 | Release       | No bump; rides vwf `20.0.0` and stackgen `2.0.0`; `/release` is an `ask` step.                                                                                                                                                                                                                         | a bump; release on green                           | U8    |
| 11 | Comments      | Any comment or sentence a unit adds is one line (B65).                                                                                                                                                                                                                                                 | —                                                  | all   |
| 12 | Pack bumps    | A pack whose content changes bumps its `pack.yaml` version, every bundle pin and `inventory.md` in one commit: pnpm `0.3.1` → `0.4.0`, swiftlint `0.1.1` → `0.2.0`, fnox `1.0.0` → `1.1.0`, doppler `1.0.0` → `1.1.0`, swiftui `0.2.0` → `0.3.0`.                                                      | leaving pack versions unchanged                    | U8    |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                         | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-five-packs.md](01-five-packs.md)           | edit   | `plugins/stackgen/stacks/package-manager/pnpm/**`, `plugins/stackgen/stacks/toolchain-gate/swiftlint/**`, `plugins/stackgen/stacks/capability-provider/fnox/**`, `plugins/stackgen/stacks/capability-provider/doppler/**`, `plugins/stackgen/stacks/app-framework/swiftui/**`                | —          | pending |        |
| U2 | 1    | [02-init.md](02-init.md)                       | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/**`, `plugins/vwf/skills/init/packs/**`                                                                                                                                                                              | —          | pending |        |
| U3 | 1    | [03-setup-doctor.md](03-setup-doctor.md)       | edit   | `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/materialize.md`, `plugins/vwf/skills/doctor/**`                                                                                                                                                                    | —          | pending |        |
| U4 | 1    | [04-stackgen-skills.md](04-stackgen-skills.md) | edit   | `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/stacks/bundles/{doppler,fnox,swift-swiftui}.md` | —          | pending |        |
| U5 | 1    | [05-checker.md](05-checker.md)                 | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                          | —          | pending |        |
| U6 | 2    | [06-review.md](06-review.md)                   | review | —                                                                                                                                                                                                                                                                                            | U1, U2, U5 | pending |        |
| U7 | 3    | [07-docs.md](07-docs.md)                       | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-26-mise-conf-d-packs.md` (new)                                                                                                                                                            | U3, U4, U6 | pending |        |
| U8 | 4    | [08-gates.md](08-gates.md)                     | edit   | `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` (owned so the generators have a home)                                                                                                                                                                              | U7         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                      | Why it collides                                          | Owner                                                      |
| ------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` | generated                                                | U8 only                                                    |
| the five packs' `pack.yaml` `version:` lines, every bundle pinning them   | a version, its pins and the inventory land in one commit | U8 only (U1 and U4 edit the rest of those files in wave 1) |
| every human-facing doc outside `plugins/`                                 | n units, one doc                                         | U7 only                                                    |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Disjoint paths. Commit U1 before U5: the
  checker's new rule refuses a landed `conf.d` fragment, and U1 removes them.
- **Wave 2 — U6**, the review row. **Wave 3 — U7**, docs. **Wave 4 — U8**,
  gates.

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

| Step                       | Mode | Notes                                                                                             |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf `20.0.0` and stackgen `2.0.0`; picked up by a **restarted** session                    |
| `/release`                 | ask  | would tag `vwf-v20.0.0` and `stackgen-v2.0.0` via `p:plugins:release` — the whole B54 chain ships |

## Gates the orchestrator keeps

**A scratch repo with swiftui and doppler**, after wave 1, isolated (`HOME` and
every `MISE_*` dir under one `mktemp -d`): lay down the mise pack's files and
follow init's merge reference by hand for the swiftui and doppler `mise.d/`
files. Pass condition: `conf.d/env.toml` and `conf.d/tools.toml` carry
`# >>> swiftui` / `# >>> doppler` blocks; no `conf.d/<pack>.toml` exists; with
`XCODE_VERSION` filled in the block, `MISE_ENV=dev mise env` prints it; editing
a line inside a block and re-reading the reference identifies it as drift.
Record the result in the Run log; a failure goes back to U2.

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

- **B70** — the linter pin moving into the packs that call it (its own plan,
  which uses this plan's `mise.d/` mechanism).
- **B66** — composing the rest of the `.config/*` payload.
- **B65** — trimming existing comments.
- **Revisiting M's hash-based ownership transfer** — the user's drift rule here
  applies to merged blocks; M's transfer rule stands as ruled.

## Parked

none

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-mise-conf-d-packs

or let the queue pick it, by priority:

/vwf:execute next
