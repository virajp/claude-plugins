---
type: vwf-change-plan
title: Swift package stack — language/swift, SwiftPM, swift-format and
  SwiftLint, the swift-package bundle
requires: [ docs/plans/2026-09-23-swift-stack-mechanism ]
backlog: []
---

# Plan — Swift package stack — language/swift, SwiftPM, swift-format and SwiftLint, the swift-package bundle (2026-09-23)

## Status

**RUNNING**

RUNNING since 2026-09-23 in .claude/worktrees/2026-09-23-swift-package-stack

## Consent

| Action                                            | Granted                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                       |
| Release stackgen publicly                         | minor — 1.29.0 → 1.30.0, by hand in `plugins/stackgen/.claude-plugin/plugin.json`         |
| Release site publicly                             | patch — 1.1.42 → 1.1.43, `mise run p:site:version` (bare, no positional, on a clean tree) |
| Release vwf publicly                              | none                                                                                      |
| Release installer publicly                        | none                                                                                      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

The `Release` rows are **intent, not authorisation**: no release step in any
plan of this chain (E17). The four new packs start at 0.1.0.

## Goal

After this lands, a project can pin `swift-package` — a `language-bundle` on
`packages` rooted at a new `language/swift` pack, with SwiftPM, swift-format and
SwiftLint — and stackgen materializes a working Swift package repo: resolve,
build, test, format and lint through the task vocabulary, sourcekit-lsp wired,
and doctor blocking on a missing `swift`.

Plan **2b** of the four-plan chain for B56 (see plan 2a's Goal for the chain and
why it was re-cut). It requires 2a, which added the `binaries` fact this pack
declares. The gate packs and tasks it lands are the ones plan 2c's SwiftUI pack
reuses byte for byte. No reversal.

## Facts the survey established

- **The language-bundle model.** `plugins/stackgen/assets/kinds.md:50-134`, its
  12-topic bar `:77-114` and topic-to-component map `:110-114`. The TypeScript
  library precedent: `stacks/bundles/typescript-effect.md:1-13`
  (`kind: language-bundle`, `platforms: [packages]`); the `language/typescript`
  pack is the pack model. No check compares a pack's platforms with its
  bundle's.
- **pack.yaml.** Schema `plugins/stackgen/assets/pack-format.md:151-258`, with
  2a's `binaries` fact; honest facts, `n/a` for a tool mise does not provide
  (`:389-391`). Flutter already declares **sourcekit-lsp** at
  `stacks/app-framework/flutter/pack.yaml:55-60`; the local plugin is a union
  across repos, so the same key declared differently is a conflict and skipped
  (`skills/stackgen-stack-template/references/local-plugin.md:121-132`).
- **Package-manager and gate packs.** `package-manager` and `toolchain-gate` are
  component types, not kinds, with no categories (`taxonomy.md:24,38,96-99`);
  package-manager may sit in two kinds (`taxonomy.md:238-247`). Models:
  `stacks/package-manager/pub/` (no `config/`),
  `stacks/toolchain-gate/analysis-options/` (a vscode.d fragment on
  `editor: vscode`, rules at `pack-format.md:97-149`), and
  `stacks/toolchain-gate/eslint/`. vwf keeps no closed list of `package_manager`
  values (`plugins/vwf/assets/vwf-config.md:77`).
- **Tasks.** Flutter's `config/.config/mise/tasks/code/{format,lint}` and
  `setup/deps/{install,audit,cleanup,outdated,upgrade}` are the shape: source
  `${MISE_PROJECT_ROOT}/.config/mise/tasks/_scripts/helpers` (from
  `toolchain-manager/mise`; `# shellcheck source=/dev/null`), `#MISE`/`#USAGE`
  headers, 755, shebang; `code/format` takes `--fix` and a file list.
- **Landing.** A pack's `config/` root holds `.config/`, `.github/` (no
  workflows) or `_*` only (`scripts/src/check.ts:335-382`); no pack lands
  `Package.swift` (`assets/output-tree.md:289-294`).
  `plugins/*/stacks/*/*/config/` is payload — never formatted with this repo's
  dprint.
- **Reputation.** Curated packs are copied verbatim, unvetted; the reputation
  skill does not understand SwiftPM or mise names — parked in 2d.
- **Toolchain on this machine.** Swift 6.4 with `swift format` built in;
  `swiftlint` in mise's registry (`aqua:realm/SwiftLint`).
- **Docs.** `readme.md:449-450` claims SourceKit-LSP is behind the language
  servers stackgen's packs declare — true since Flutter's pack, and more so
  after this plan. `plugins/stackgen/stacks/inventory.md` is generated.
- **Versions** (after 2a): stackgen 1.29.0, site 1.1.42, vwf 19.45.0.
- **Commit convention.** Types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes.

## Assumed decisions — confirm or override at review

Ids carried from the retired `2026-09-23-swift-native-stack` folder.

| #   | Decision         | Ruling                                                                                                                                                                                                       | Rejected                                           | Unit   |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------ |
| E1  | Bundle shape     | `swift-package` is a language-bundle on `platforms: [packages]`; the app bundle `swift-swiftui` is plan 2c's                                                                                                 | one bundle per Apple OS; one bundle for everything | U3     |
| E3  | Format and lint  | swift-format (`swift format`, from the toolchain) formats; SwiftLint (through mise) lints                                                                                                                    | SwiftFormat + SwiftLint; swift-format only         | U1, U2 |
| E6  | Binaries         | `language/swift` declares `binaries: [swift]` (the fact 2a added)                                                                                                                                            | —                                                  | U1     |
| E7  | Names            | `language/swift` in bundle `swift-package`                                                                                                                                                                   | —                                                  | U1, U3 |
| E8  | Gate packs       | One per tool: `toolchain-gate/swift-format` and `toolchain-gate/swiftlint`, each landing its config under `.config/` and a vscode.d fragment on `editor: vscode`                                             | one combined gate pack                             | U2     |
| E10 | LSP              | `sourcekit-lsp` declared byte-identical to `app-framework/flutter/pack.yaml:55-60`; `mise_tool: n/a` for toolchain-provided tools                                                                            | —                                                  | U1     |
| E11 | Config placement | Tool configs land under `.config/` (`.config/swift-format.json`, `.config/swiftlint.yml`), and the tasks pass `--configuration` / `--config`. No pack lands `Package.swift`; `swift package init` creates it | root config files                                  | U1, U2 |
| E14 | Wave-1 commit    | Wave 1 lands as **one** commit, the orchestrator running `mise run p:plugins:inventory` into it — the pre-commit inventory check refuses a commit adding a pack without the regenerated inventory            | one commit per unit                                | —      |
| E15 | Review row       | R4 covers U1 — it ships shell task scripts                                                                                                                                                                   | no review row                                      | R4     |
| E16 | Smoke test       | The orchestrator smoke-tests the package bundle in `/tmp` before landing                                                                                                                                     | none                                               | —      |
| E17 | Release          | No release step                                                                                                                                                                                              | `/release` as `ask`; as `run`                      | U6     |
| E18 | Library docs     | Units resolve SwiftLint, swift-format and SwiftPM behaviour through Context7 (`resolve-library-id` → `query-docs`) before writing about it — never from training knowledge                                   | —                                                  | U1, U2 |

## New dependencies

None in this repo. Named in the payload the packs land: **SwiftLint** (through
mise, `aqua:realm/SwiftLint`), by U1 and U2. swift-format and sourcekit-lsp ship
with the Swift toolchain.

## Units

| Id | Wave | Unit file                                          | Kind   | Owns                                                                                                                                                                  | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-language-swift.md](01-language-swift.md)       | edit   | `plugins/stackgen/stacks/language/swift/**`                                                                                                                           | —          | green   | 67e28cbe |
| U2 | 1    | [02-swiftpm-and-gates.md](02-swiftpm-and-gates.md) | edit   | `plugins/stackgen/stacks/package-manager/swiftpm/**`, `plugins/stackgen/stacks/toolchain-gate/swift-format/**`, `plugins/stackgen/stacks/toolchain-gate/swiftlint/**` | —          | green   | 67e28cbe |
| U3 | 1    | [03-bundle.md](03-bundle.md)                       | edit   | `plugins/stackgen/stacks/bundles/swift-package.md`                                                                                                                    | —          | green   | 67e28cbe |
| R4 | 2    | [04-review.md](04-review.md)                       | review | —                                                                                                                                                                     | U1         | pending |          |
| U5 | 3    | [05-docs.md](05-docs.md)                           | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`                     | all        | pending |          |
| U6 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md)       | edit   | `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                         | U5         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                          | Why it collides                                    | Owner                                                 |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`                            | several units bumping one version is a lost update | U6                                                    |
| `plugins/stackgen/stacks/inventory.md`                                                        | generated                                          | the orchestrator for the wave-1 commit (E14), then U6 |
| `.claude-plugin/marketplace.json`                                                             | generated                                          | U6                                                    |
| the four new packs' versions (0.1.0) vs the bundle pins                                       | a pin names a version                              | fixed here at 0.1.0; U1 and U2 write it, U3 pins it   |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md` | n units editing one doc                            | U5                                                    |

## Waves

- **Wave 1 — U1, U2, U3.** Disjoint pack trees and one bundle file whose pins
  this file fixes; lands as **one commit** with the regenerated inventory (E14).
- **Wave 2 — R4**, the review row over wave 1's commit.
- **Wave 3 — U5**, docs. **Wave 4 — U6**, versions and generators.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    pnpm vitest run
    pnpm tsc --noEmit -p installer
    pnpm tsc --noEmit -p scripts
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. The inventory
freshness line is red between wave 1's unit returns and the orchestrator's
regeneration (E14), and inside wave 4 between U6's edits and its regeneration —
expected; each is green before its commit.

## After landing

| Step                       | Mode | Notes                                                                                                                                                           |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed stackgen into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **Smoke test, in `/tmp`** (E16), after wave 1 and again after wave 4, outside
   the repo and any worktree: a scratch git repo; land the payload of every
   component `swift-package.md` pins plus `toolchain-manager/mise`'s helper
   library; `mise install`; `swift package init --type library`;
   `mise run setup:deps:install`; `swift build`; `swift test`;
   `mise run code:format`; `mise run code:lint`. Pass: every command exits 0.
   Network allowed for mise and SwiftPM. A failure blocks the landing and goes
   to the unit whose file failed.
2. **Tasks.** `test -x` on every file under
   `language/swift/config/.config/mise/tasks/`. Pass: all executable.
3. **LSP declaration** (E10). The `sourcekit-lsp` entry in
   `language/swift/pack.yaml` is byte-identical to
   `app-framework/flutter/pack.yaml:55-60`. Pass: no diff.
4. **Coverage and citations.** `swift-package.md`'s `platforms:` is exactly
   `packages`, with no `default: true`; a grep of every new pack's `config/` and
   `skills/` for the plugin-root token, a bare `assets/` path or a path into a
   sibling pack is empty. Pass: exact list, empty grep.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore`, `git stash` or a
formatter's `--fix` over any path outside its Owns, and never runs this repo's
dprint over a `config/` payload file.

A unit returns exactly this block and nothing else — no file contents, no diff —
kept under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **The SwiftUI app stack** — plan 2c; its doctrine per platform — plan 2d.
- **Swift on Linux / server bundles** — parked in 2d.
- **A public release** (E17).

## Parked

None new; the chain's parked items live in plan 2d.

## Run log

| Wave | Unit        | Model | Round    | Outcome                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Commit   |
| ---- | ----------- | ----- | -------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight   | —     | —        | green                   | row claimed db9da892; doctor blocking set checked directly (mise, graphify CLI, graph in the main checkout, swift 6.4 on PATH); no code unit — LSP rule and conventions fetch skipped; format check skipped (no covers:); 9/9 wave gate lines green on the integration branch                                                                                                                                                                                                                                                                      | —        |
| 0    | order       | —     | —        | green                   | W1 U1+U2+U3 edit concurrent, then orchestrator inventory regen, one commit (E14); W2 R4; W3 U5; W4 U6                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 1    | U3          | opus  | 1        | green                   | axis: project as typescript-effect; heading 'packages — Swift · package'; SwiftUI bundle named by role only. GAP: pins unchecked mid-wave — orchestrator verifies 0.1.0 before inventory regen                                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | U1          | opus  | 1        | green                   | pack.yaml, conventions, skill + 7 topic refs, 7 tasks (755). DECIDED --frozen maps to --force-resolved-versions; outdated = swift package update --dry-run; swiftlint whole tree, no --fix. GAP: swift package init output fails read-only swift format lint --strict (no trailing newline) — smoke test runs code:format --fix before read-only format                                                                                                                                                                                            | —        |
| 1    | U2          | opus  | 1        | green                   | 3 packs at 0.1.0; DECIDED kind language-bundle, axis repo for all three (after pnpm/eslint, not pub/analysis-options — unit file said name it); swift-format indent 4, lineLength 120; swiftlint off trailing_comma, opening_brace, line_length; excludes ../-relative; both vscode.d fragments                                                                                                                                                                                                                                                    | —        |
| 1    | R1          | opus  | 1        | findings(7)             | CONTRACT clean, RULINGS clean (U2 kind language-bundle/axis repo sound — matches pnpm/eslint). To U2: no mise conf.d pins swiftlint (E3 'through mise' untrue); swiftpm topic 8 supply-chain/audit + workspace n/a missing; ragged folds. To U1: code:format skips Package.swift; code:lint lacks --allow-zero-lintable-files. Docs (to U5): stackgen.md:520 vscode.d count, :1012 slot list, stackgen-plugin SKILL.md:97,:217; nobody-owned pack-format.md:13 'eight packs' → U5 Owns widened (GAP)                                               | —        |
| 1    | U1          | opus  | 2        | green                   | code:lint skips swiftlint when no .swift outside .build/ (SwiftLint 0.65.1 has no --allow-zero-lintable-files flag); code:format covers Package.swift when present; conventions + build-and-run tables updated                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | U2          | opus  | 2        | green                   | conf.d/swiftlint.toml pins aqua:realm/SwiftLint 0.65.1 (newest ls-remote; verified via mise x); swiftpm Supply chain section (topic 8) + Workspace n/a; folds fixed; no mise_tool on a gate pack (schema scopes it to languages facts)                                                                                                                                                                                                                                                                                                             | —        |
| 1    | smoke (E16) | —     | 1        | red                     | /tmp/spk-smoke: mise install, swift package init, setup:deps:install, swift build, swift test green; code:format needs the dprint gate pack's dprint.json (not in the E16 payload list — landed it plus hygiene .gitignore with a Swift section to emulate init, then format --fix and read-only format green); code:lint red — @askviraj/linter walks .build/ (4 json/no-empty-keys in SwiftPM build intermediates); it ignores .gitignore, honours .config/linter.yaml ignores, which only the eslint pack ships → to U1                         | —        |
| 1    | R1          | opus  | 2        | findings(3) — contested | round-1 all resolved; CONTRACT clean, RULINGS clean. At the 2-round cap, recorded contested: swiftlint/conventions.md:31-35 ragged fold [U2]; swift-format/conventions.md:14 81 chars [U2]; code/lint no-Swift guard ignores swiftlint excludes (.swiftpm, Derived, DerivedData, *.generated.swift) [U1, minor]                                                                                                                                                                                                                                    | —        |
| 1    | U1          | opus  | 3        | green                   | smoke fix: code:lint hands the house linter explicit targets — root files via * plus each top-level dir git check-ignore does not ignore, so .build/ is never walked (linter ignores .gitignore; linter.yaml is eslint's path). GAP: Flutter's code:lint has the same exposure (build/, .dart_tool) — outside Owns                                                                                                                                                                                                                                 | —        |
| 1    | smoke (E16) | —     | 2        | green                   | fresh /tmp/spk-smoke2 (swift-package payload + mise helpers and mise*.toml + dprint gate config + hygiene .gitignore with a Swift section — E16's list plus the unconditional baseline a real init lands, since code:format needs dprint.json): mise install, swift package init, setup:deps:install, swift build, swift test, code:format --fix, code:format, code:lint all exit 0. GAP: E16's payload list omits the baseline dprint config; read-only code:format fails on a fresh swift package init (no trailing newline) so --fix runs first | —        |
| 1    | gates       | —     | —        | green                   | tasks all 755; sourcekit-lsp block byte-identical to flutter:55-60; bundle platforms [packages], no default; citation grep empty; inventory regenerated (E14); 9/9 wave gate lines green                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | R4 security | opus  | 1        | pass                    | db9da892..80126b11; engine R4-1.security.log no findings; reviewer NO FINDINGS (eval usage_files house pattern, unpinned pnpm dlx linter pre-existing in flutter — follow-up, not U1)                                                                                                                                                                                                                                                                                                                                                              | —        |
| 2    | R4 review   | opus  | 1        | findings(6)             | db9da892..80126b11; U1: format --fix exits 0 on unfixable findings (hook/CI disagree); build-and-run.md:31-37 false claims; cleanup unguarded; whole-tree format misses Plugins/Examples/Package@swift-*; no-Swift guard ignores swiftlint excludes; nested .build walked. Engine 8, 9 dismissed by reviewer. 2 findings on uncovered units dropped (U2: .swiftpm/ claimed ignored — swiftpm/conventions.md:28, SKILL.md:89; swift-format.json:36 non-layout rules on)                                                                             | —        |
| 2    | U1          | opus  | R4 fix 1 | green                   | format: whole-tree = every .swift from git ls-files -co --exclude-standard; --fix then lint --strict. lint: house linter gets the git list as one-file globs (nested ignored .build skipped), swiftlint gets Swift subset with --force-exclude, No lintable files passes. cleanup = rm -rf .build only (dropped swift package clean). Docs tables match. Smoke2 format/lint green                                                                                                                                                                  | 16059e30 |
| 2    | R4 security | opus  | 2        | findings(2)             | db9da892..16059e30; MEDIUM (blocking, cap-exempt) code/lint:127-144 swiftlint takes git ls-files paths unprefixed — committed path --output=... writes outside the repo; LOW code/format swift format args unprefixed (no write option); INFO house linter/dprint/shfmt unprefixed names — base-pack follow-up                                                                                                                                                                                                                                     | —        |
| 2    | R4 review   | opus  | 2        | findings(5)             | db9da892..16059e30; convergence: 6 to 5, none resurfaced, so round 3 proceeds. U1: one-file globs silently skip metachar and C-quoted paths; Swift lists lack quotePath-off/-z; format hits *.generated.swift/Derived/DerivedData that swiftlint excludes; build-and-run.md:35-36 stale; non-git find prunes only ./.build. Dismissed: engine 5 (pre-commit require_serial: pre-commit pack follow-up), 8 (design preference). 1 finding on an uncovered unit dropped (U2 swift-format SKILL.md:38 stale direct command)                           | —        |
| 2    | U1          | opus  | R4 fix 2 | green                   | NUL-safe git list (quotePath off), every path ./-prefixed (S1, S2); house linter: one-file glob for plain names, plain ./path for metachar names of linted types (no linter.yaml); Swift scope drops .build/.swiftpm/Derived/DerivedData/*.generated.swift in all modes; find prunes at any depth; docs define the Swift scope. Adversarial names caught; --output=/x.swift writes nothing outside the repo                                                                                                                                        | pending  |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-23-swift-package-stack

or let the queue pick it, by priority:

/vwf:execute next
