---
type: vwf-change-plan
title: Packs hand off to bootstrap
requires: []
source: [ B102 ]
backlog: []
backlog_pieces: [ B102 ]
gaps_of: []
---

# Plan — Packs hand off to bootstrap (2026-10-18)

## Status

**ARCHIVED**

ARCHIVED 2026-10-22 — not run; was APPROVED. Superseded: the B102 work is done
in place, because bootstrap shipped differently than this plan assumed.

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | yes     |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt, and `run` is the only mode. This plan has no after-landing
step: `.config/vwf.yaml`'s `after_landing:` already runs
`mise run p:plugins:local`. The staged stackgen is picked up only by a
**restarted** session, so an `all` run ends after this plan.

## Release levels

| Project  | Level | Reason                                                                                    |
| -------- | ----- | ----------------------------------------------------------------------------------------- |
| stackgen | MAJOR | The pack format loses `templates/` and `values:`; packs need bootstrap tools to be pinned |
| site     | PATCH | The manual follows the change                                                             |
| vwf      | NONE  | Not touched                                                                               |

## Goal

stackgen packs ship no payload that bootstrap owns. Each pack that needs a
toolchain declares `bootstrap_tools:` in its `pack.yaml`, and the materializer
hands those tools to bootstrap through bootstrap's `docs/sync/vwf.md` — it never
edits `.config/bootstrap.toml` itself.

Plan 1 of 3 for B102. Plan 2 moves vwf `init`, `setup`, `doctor` and
`git-workflow` onto bootstrap; plan 3 deletes `stackgen:tool-config`.

Reversals, confirmed by the user on 2026-10-18:

- `docs/memory/decisions/2026-10-05-packs-ship-templates-and-subtasks.md` —
  packs no longer ship `templates/` or gate subtasks.
- `docs/memory/decisions/2026-10-05-pack-values-and-plugin-subtasks.md` —
  `values:` and the `setup/ai/<slug>` subtask route go.
- `docs/memory/decisions/2026-10-07-fnox-development-only.md` — the fnox payload
  was kept "until bootstrap replaces it"; bootstrap replaces it now.
- `docs/memory/decisions/2026-09-26-tool-config.md`, the part about packs —
  packs no longer call `stackgen:tool-config`.

## Facts the survey established

- **bootstrap** (`github.com/virajp/bootstrap`, branch `main`, no tags): 17
  tools on `main` today — `base`, `bun`, `claude`, `cloudflare`, `docker`,
  `doppler`, `flutter`, `fnox`, `gcloud`, `github`, `gitlab`, `kotlin`, `node`,
  `pulumi`, `python`, `rust`, `vscode`. The user adds `android`, `swift` and
  `docs/sync/vwf.md` before this plan runs; the first wave-gate line refuses the
  run until they exist. A consumer selects tools in `.config/bootstrap.toml`;
  `mise run setup:configs` syncs them.
- **The handoff contract.** A plugin may run `mise run setup:configs`. To change
  `.config/bootstrap.toml`, it shallow-clones bootstrap, reads
  `docs/sync/vwf.md` in the clone, and gives it instructions. That file follows
  `docs/sync/<tool>.md` for each tool. The plugin relies on nothing else in
  bootstrap.
- **Packs with payload** (`plugins/stackgen/stacks/`): 20 ship `config/`, 8 ship
  `templates/`, one has `values:` (swiftui). Payload per pack:
  - flutter: `code/{format,lint}/flutter`,
    `setup/deps/{audit,cleanup,install,outdated,upgrade}/flutter`
  - swiftui: `test/golden`, `_scripts/xcode`, `setup/deps/*/swiftui`,
    `templates/.config/mise/conf.d/swiftui/mise.toml` (`XCODE_VERSION`)
  - compose: `test/golden`
  - fnox: `fnox.toml`, `setup/secrets`,
    `templates/.config/mise/conf.d/fnox/mise.toml`
  - containers, workers-ssr, workers-static-assets: `wrangler.jsonc`,
    `p/_project/deploy`
  - claude-code: `setup/ai/claude-code`
  - android: `test/e2e`, `code/lint/android`, `setup/deps/install/android`,
    `templates/.config/mise/conf.d/android/mise.toml`
  - astro, html: `p/_project/icons`
  - kotlin: `setup/deps/*/kotlin`,
    `templates/.config/mise/conf.d/kotlin/mise{,.dev}.toml`
  - swift: `setup/deps/*/swift`
  - pnpm: `.npmrc`, `code/format/pnpm`, `setup/deps/*/pnpm`,
    `templates/.config/mise/conf.d/pnpm/mise.dev.toml`
  - uv: `code/check/uv`, `setup/deps/*/uv`
  - detekt: `.config/detekt.yml`, `code/lint/detekt`,
    `templates/…/conf.d/detekt/mise.toml`
  - ktlint: `.config/ktlint.editorconfig`, `code/{lint,format}/ktlint`,
    `templates/…/conf.d/ktlint/mise.toml`
  - ruff: `code/{lint,format}/ruff`
  - swift-format: `.config/swift-format.json`, `code/{lint,format}/swift-format`
  - swiftlint: `.config/swiftlint.yml`, `code/lint/swiftlint`,
    `templates/…/conf.d/swiftlint/mise.toml`
- **Pack files that name tool-config, `stackgen.yaml`, `values:` or
  `templates/`:** flutter, swiftui, fnox, android, gradle, pnpm, swiftpm, uv,
  plain-css, stylex, tailwindcss, detekt, eslint, ktlint, ruff, swiftlint, the
  bundles `bun.md`, `fnox.md`, `pnpm-turbo.md`, `pnpm-workspace.md`, and
  `stacks/readme.md`.
- **stackgen files that call tool-config:**
  `assets/{pack-format,output-tree,kinds,taxonomy}.md`;
  `skills/stackgen-stack-template/SKILL.md` (:115-116, :167-169, :196-203);
  `skills/stackgen-stack-template/references/materializer.md` (:23-26, :110-182
  the `pack` call, :255 reads `forge`/`secrets` from `stackgen.yaml`, :362-416,
  :470-489 `pack-remove`); `skills/stackgen-sync/SKILL.md` (:45-47, :78-105);
  `skills/stackgen-stack-menu/SKILL.md` (:37, :89).
- **The checker** (`scripts/src/check.ts`; prose in
  `.claude/skills/plugin-authoring/references/checks.md`): rule 11
  (checks.md:107-226; check.ts constants :340-520, walk :600-870, :886 refuses
  `tool-config:` and `machine_env:` keys) governs pack `config/` and
  `templates/` and tool-config's own two trees. check.ts imports tool-config's
  `lib/cli.mjs` and `lib/render.mjs` (:46, :48) — plan 3's to remove.
  `check.test.ts` has a "pack config tier" block at :295.
- `scripts/src/tool-config-pack.test.ts` renders the real swiftui pack's
  `templates/` (:31, :69-179); it breaks once they go. The other tool-config
  tests use no real pack.
- **Gaps of live plans this plan closes** (user rulings of 2026-10-18 deferred
  them to "the tool-config removal plan"):
  `docs/plans/2026-10-09-kotlin-language-stack/index.md` :265-274 (java pin,
  ktlint config and tasks) and :318-326 (the task parts of the ktlint/detekt
  filters and `--frozen`);
  `docs/plans/2026-10-09-android-compose-stack/index.md` G1 :231-239
  (cmdline-tools pin), G7 :272-279 (the install part of
  `setup:deps:install:android`), G8 :281-299 (the two `code/lint/android`
  items). `test:*` tasks stay in this repo (Android G4 :251-256).
- **Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; scopes unrestricted.
- **In-flight work** that does not overlap this plan's Owns:
  `.worktrees/fix-mockups-gaps` (vwf mockups) and `.worktrees/init-gradle-guard`
  (vwf init) — both are plan 2's concern.

## Assumed decisions — confirm or override at review

| #  | Decision                       | Ruling                                                                                                                                                                                                                                                                                                                              | Rejected                                                          | Unit           |
| -- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------- |
| 1  | Split of B102                  | Three plans: packs (this), then vwf callers, then delete tool-config                                                                                                                                                                                                                                                                | one or two plans                                                  | —              |
| 2  | Bootstrap gaps                 | Bootstrap first: the user adds `android`, `swift` and `docs/sync/vwf.md` before the run; the first wave-gate line checks them                                                                                                                                                                                                       | remove only what bootstrap owns today; remove all now             | gate           |
| 3  | How a pack gets its tools      | A new `pack.yaml` key, `bootstrap_tools: [<tool>, …]`                                                                                                                                                                                                                                                                               | a materializer check only; prose only                             | U2, U3, U4, U5 |
| 4  | `templates/` and `values:`     | Drop the tier and the key from the pack format. Packs ship `config/` only, copied as is. swiftui's `XCODE_VERSION` moves to bootstrap's `swift` tool                                                                                                                                                                                | the materializer renders; values in `conf.d/_repo`                | U2–U6          |
| 5  | claude-code `setup/ai`         | Its plugin installs move to bootstrap's `claude` tool; the pack drops `setup/ai/claude-code` and declares `bootstrap_tools: [claude]`                                                                                                                                                                                               | rename the subtask; drop it                                       | U3             |
| 6  | Which payload leaves the packs | Bootstrap's: conf.d pins, `setup/deps/**`, `setup/ai/**`, `setup/secrets`, gate configs (`detekt.yml`, `ktlint.editorconfig`, `swiftlint.yml`, `swift-format.json`), `code/format/**`, `code/lint/**`, `code/check/**`, `.npmrc`, `fnox.toml`. Stays: `test/**`, `_scripts/xcode`, `p/_project/**`, `wrangler.jsonc`                | —                                                                 | U2, U3, U6     |
| 7  | Pack to tool map               | flutter → `flutter`; kotlin, ktlint, detekt → `kotlin`; android → `android`; swift, swiftui, swiftlint, swift-format → `swift`; pnpm, typescript → `node`; uv, ruff → `python`; fnox → `fnox`; claude-code → `claude`. No other pack gets the key                                                                                   | other names                                                       | U2, U3         |
| 8  | Handoff to bootstrap           | Plugins may run `mise run setup:configs`. To edit `.config/bootstrap.toml`, a plugin shallow-clones bootstrap, reads `docs/sync/vwf.md` in the clone and gives it instructions: `bootstrap: add tools [<tool>, …]` or `bootstrap: remove tools [<tool>, …]`, plus `reason: <why>`. It never edits `bootstrap.toml` by its own rules | the plugin edits it; the full sync process (`docs/sync/index.md`) | U4, U5         |
| 9  | Removing a pack                | Remove a tool only when no other pinned pack declares it. With no `.config/bootstrap.toml`, stop and name `/vwf:setup reshape`                                                                                                                                                                                                      | —                                                                 | U5             |
| 10 | Forge and secrets              | The materializer reads them from the tools `.config/bootstrap.toml` selects (`github`/`gitlab`; `fnox`/`doppler`), not from `stackgen.yaml`                                                                                                                                                                                         | read `stackgen.yaml`                                              | U5             |
| 11 | Checker validation             | A pinned list in `scripts/src/check.ts`: the 17 tools on bootstrap `main` plus `android` and `swift`; an unknown name fails                                                                                                                                                                                                         | shape only; read a bootstrap clone                                | U1             |
| 12 | Checker in two steps           | U1 (wave 1) accepts the key and makes `check.test.ts` independent of real pack payload; U6 (wave 3) rejects `templates/`, `values:` and bootstrap payload paths. Every wave gate stays green                                                                                                                                        | one checker unit                                                  | U1, U6         |
| 13 | The swiftui pack test          | `scripts/src/tool-config-pack.test.ts` reads the real swiftui templates, so it is deleted with them                                                                                                                                                                                                                                 | keep it until plan 3                                              | U3             |
| 14 | Review                         | One review row: the checker is tooling source                                                                                                                                                                                                                                                                                       | none                                                              | U7             |
| 15 | Live-plan gaps                 | This plan closes the Kotlin and Android gaps listed in the facts, but the folders do not go on `gaps_of:` — those rows also hold stackgen follow-up gaps                                                                                                                                                                            | `gaps_of:`                                                        | U8             |
| 16 | `_scripts/xcode`               | Kept only when a kept task (`test/golden`) sources it; otherwise deleted                                                                                                                                                                                                                                                            | always keep                                                       | U3             |
| 17 | Pack versions                  | U9 bumps the `pack.yaml` version of every changed pack (major component, skipping 13 and 17), the bundle pins, and regenerates `inventory.md`, in one commit                                                                                                                                                                        | bump in the pack units                                            | U9             |

## New dependencies

none

## Units

| Id | Wave | Unit file                                                | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                            | Depends on     | Status  | Commit |
| -- | ---- | -------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------ |
| U1 | 1    | [01-checker-accepts.md](01-checker-accepts.md)           | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `scripts/src/fixtures/**` (new fixtures only)                                                                                                                                                                                                                                                                                              | —              | pending |        |
| U2 | 2    | [02-packs-language-gates.md](02-packs-language-gates.md) | edit   | `plugins/stackgen/stacks/language/kotlin/**`, `plugins/stackgen/stacks/language/swift/**`, `plugins/stackgen/stacks/language/typescript/**`, `plugins/stackgen/stacks/toolchain-gate/**`, `plugins/stackgen/stacks/package-manager/**`, `plugins/stackgen/stacks/stylesheet/**` — `pack.yaml` `version:` lines excepted                                                                         | U1             | pending |        |
| U3 | 2    | [03-packs-app.md](03-packs-app.md)                       | edit   | `plugins/stackgen/stacks/app-framework/**`, `plugins/stackgen/stacks/framework/android/**`, `plugins/stackgen/stacks/capability-provider/fnox/**`, `plugins/stackgen/stacks/design-tool/claude-code/**`, the prose of `plugins/stackgen/stacks/bundles/{bun,fnox,pnpm-turbo,pnpm-workspace}.md`, `scripts/src/tool-config-pack.test.ts` — `pack.yaml` `version:` lines and bundle pins excepted | U1             | pending |        |
| U4 | 2    | [04-assets.md](04-assets.md)                             | edit   | `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/assets/kinds.md`, `plugins/stackgen/assets/taxonomy.md`                                                                                                                                                                                                                                   | U1             | pending |        |
| U5 | 2    | [05-materializer.md](05-materializer.md)                 | edit   | `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/skills/stackgen-stack-menu/**`                                                                                                                                                                                                                                              | U1             | pending |        |
| U6 | 3    | [06-checker-rejects.md](06-checker-rejects.md)           | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `scripts/src/fixtures/**` (new fixtures only), `.claude/skills/plugin-authoring/references/checks.md`                                                                                                                                                                                                                                      | U2, U3, U4, U5 | pending |        |
| U7 | 4    | [07-review.md](07-review.md)                             | review | —                                                                                                                                                                                                                                                                                                                                                                                               | U1, U6         | pending |        |
| U8 | 5    | [08-docs.md](08-docs.md)                                 | edit   | `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/skills/**` (except `plugin-authoring/references/checks.md`), `.claude/docs/**`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-10-18-packs-hand-off-to-bootstrap.md` (new), and any other human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to U6 and U9                                       | U7             | pending |        |
| U9 | 6    | [09-gates.md](09-gates.md)                               | edit   | the `version:` line of every changed `plugins/stackgen/stacks/**/pack.yaml`, the pins in `plugins/stackgen/stacks/bundles/*.md`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                         | U8             | pending |        |

## Shared-file rule

| File                                                | Why it collides                             | Owner                       |
| --------------------------------------------------- | ------------------------------------------- | --------------------------- |
| `plugins/stackgen/stacks/inventory.md`              | generated                                   | U9 only                     |
| `pack.yaml` `version:` lines and bundle pins        | must land in one commit with `inventory.md` | U9 only                     |
| `plugins/stackgen/stacks/bundles/*.md` prose        | U3 edits prose, U9 edits pins               | U3 prose, U9 pins           |
| `scripts/src/check.ts`, `scripts/src/check.test.ts` | two checker steps                           | U1 then U6, different waves |
| `plugins/stackgen/stacks/readme.md`                 | a human-facing doc                          | U8 only                     |
| every human-facing doc                              | many units would edit one doc               | U8 only                     |
| `plugins/stackgen/skills/tool-config/**`            | plan 3 deletes it                           | nobody — do not edit        |
| `plugins/vwf/**`                                    | plan 2's                                    | nobody — do not edit        |

## Waves

- Wave 1 — U1: the checker accepts `bootstrap_tools:` before any pack carries
  it.
- Wave 2 — U2, U3, U4, U5: four disjoint trees (two pack groups, the stackgen
  assets, the stackgen skills).
- Wave 3 — U6: the checker rejects the old shapes once no pack carries them.
- Wave 4 — U7: review of the checker changes.
- Wave 5 — U8: docs.
- Wave 6 — U9: versions, pins, inventory, full gate.

## Wave gate

```text
bash -c 'for p in docs/sync/vwf.md tools/android/tool.toml tools/swift/tool.toml; do gh api "repos/virajp/bootstrap/contents/$p" --silent || { echo "bootstrap main lacks $p"; exit 1; }; done'
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line must
be green before wave 1.

## After landing

none

## Gates the orchestrator keeps

none beyond the wave gate — the materializer is prose, and the checker is
covered by `pnpm vitest run` and `mise run p:plugins:check`.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never writes a lock file. A unit never runs `git checkout`,
`git restore` or a formatter with `--fix` on a path outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Any edit in the bootstrap repo — the user's work, done before this plan runs.
- This repo's own `.config/` — the user edits it by hand.
- `plugins/vwf/**` — plan 2.
- `plugins/stackgen/skills/tool-config/**`, its other tests and the checker's
  tool-config rules — plan 3.
- The stackgen follow-up gaps of the Kotlin, Android and os-device-frames plans
  (`pack-format.md:407`, `kinds.md`, the Compose ux-gate, the `lsp_servers`
  entry) — the stackgen gap follow-up plan.

## Parked

- B102: plan 2 — vwf `init`, `setup`, `doctor` and `git-workflow` move onto
  bootstrap through `docs/sync/vwf.md`, and `.config/stackgen.yaml` retires (a
  `config_format` story). Land `.worktrees/init-gradle-guard` and
  `.worktrees/fix-mockups-gaps` before it runs; both edit
  `plugins/vwf/skills/init/SKILL.md` or `site/src/content/docs/plugins/vwf.md`.
- B102: plan 3 — delete `plugins/stackgen/skills/tool-config/`, its tests and
  fixtures, checker rules 4, 15, 16, 17 and the tool-config part of rule 11, and
  the `check.ts` imports of its `lib/`.
- The stackgen gap follow-up plan edits `pack-format.md:407` and `kinds.md`;
  plan it after this plan lands.
- Release only after plan 3 lands. Between the plans `/vwf:setup` still calls
  tool-config `pack --set` for values no pack has.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-18-packs-hand-off-to-bootstrap

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
