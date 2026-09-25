---
type: vwf-change-plan
title: Gate hardening — the linter pinned and scoped, dprint's paths, a serial
  lint hook, a dprint-clean hygiene payload
requires: [
  docs/plans/2026-09-25-swift-gap-closure,
]
backlog: []
---

# Plan — Gate hardening — the linter pinned and scoped, dprint's paths, a serial lint hook, a dprint-clean hygiene payload (2026-09-25)

## Status

**RUNNING**

RUNNING since 2026-09-25 18:58 in .claude/worktrees/2026-09-25-gate-hardening

## Consent

| Action                                            | Granted                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                     |
| After landing: `mise run p:plugins:local`         | run                                                                     |
| Release stackgen publicly                         | none — rides the unreleased 1.32.0 (last tag stackgen-v1.31.0); no bump |
| Release vwf publicly                              | none                                                                    |
| Release site publicly                             | none — rides the unreleased 1.1.47 (last tag site-v1.1.46); no bump     |
| Release installer publicly                        | none                                                                    |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

The `Release` rows are **intent**: no release step (B8).

## Goal

After this lands, the gates every shaped repo gets are hardened: the house
linter runs at one pinned version installed by mise and skips generated trees
through one shipped `.config/linter.yaml`; every path handed to dprint is safe
from being read as a flag; the pre-commit lint hook runs serially; and the
repo-hygiene payload passes the shipped dprint config on a fresh repo's first
`code:format`. With plan A (`2026-09-25-swift-gap-closure`), every open gap of
the three Swift-chain folders is then closed, and they can be archived.

Plan **B** of two, split at the interview; it requires A because both touch the
swift and swiftui tasks. No reversal.

## Facts the survey established

- **Linter calls, unpinned** — `pnpm dlx @askviraj/linter` with no version in
  `code/lint` of: `package-manager/pnpm` (`:96`), `app-framework/flutter`
  (`:99`), `toolchain-gate/eslint` (`:99`), `language/swift` (`:198`),
  `app-framework/swiftui` (`:198`); prose in
  `toolchain-gate/eslint/skills/eslint/SKILL.md:62,72-75`. Ruff does not call
  it. The latest published version is **1.1.6** (`pnpm view`, 2026-09-25). The
  mise pack's tool list lives in
  `toolchain-manager/mise/config/.config/mise.toml`.
- **Linter ignores** — only `toolchain-gate/eslint/config/.config/linter.yaml`
  ships the file: `version: 1`, its `ignores:` block (`:27`) commented out. The
  eslint skill auto-applies on `**/.config/linter.yaml`
  (`eslint/skills/eslint/SKILL.md:20`) and documents the file at `:11`, `:90`,
  `:117`, `:120`; `eslint/conventions.md:29` and
  `package-manager/pnpm/conventions.md:63` describe it. The linter ignores
  `.gitignore`, so flutter's `code:lint` walks `build/` and `.dart_tool/`, and
  swift's would walk `.build/` but for its git-derived target list.
- **dprint positional paths** — `code/format` passes raw `${files[@]}` with no
  `./` prefix and no `--` in `package-manager/pnpm` (`:60-64`),
  `app-framework/flutter` (`:67-71`), `toolchain-gate/ruff` (`:61-65`),
  `language/swift` (`:128-132`; its `./` covers only `swift_targets`),
  `app-framework/swiftui` (same file shape as swift) and
  `toolchain-manager/mise` (`:39-43`). A staged path beginning `-` is read as a
  flag; dprint treats positionals as globs, so `*`, `[`, `{` in a name can match
  other files.
- **pre-commit lint hook** —
  `toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml:103-110`:
  `lint` has `pass_filenames: true` and no `require_serial`, so its whole-tree
  steps repeat per partition. The only `pre-commit.d` fragment (uv) does not
  touch it.
- **repo-hygiene payload** — pack 1.2.2. `dprint check` with the dprint pack's
  config (1.1.2, `toolchain-gate/dprint/config/.config/dprint.json`,
  `markdown.textWrap: always`, no explicit `lineWidth` → default 80) reports
  `repo-hygiene/repo-hygiene/config/SECURITY.md:11-14` and
  `config/CONTRIBUTING.md:22-23`, `:31-32`, `:45-46` unformatted. The only
  placeholder is `<REPO_URL>`, alone on `SECURITY.md:7`.
- **This repo's own copies** of these payloads are left to its next
  `/vwf:setup reshape` (B6).
- **Formatting.** `plugins/**/*.md` is not dprint-formatted: fold by hand.
  `plugins/*/stacks/*/*/config/` is payload, excluded from this repo's
  formatter: format a payload file only with the **shipped** config, never this
  repo's (CLAUDE.md trap).
- **Versions.** stackgen 1.32.0 (tag stackgen-v1.31.0), site 1.1.47 (tag
  site-v1.1.46).
- **Commit convention.** Types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #  | Decision           | Ruling                                                                                                                                                                                                                                            | Rejected                                                     | Unit   |
| -- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------ |
| B1 | Linter pin         | The mise pack declares `npm:@askviraj/linter` at an exact version (1.1.6, re-verified against the registry at run time) in its tools; every `code:lint` calls `linter` directly, and `pnpm dlx` for the linter is gone                            | exact version in each task; one `LINTER_VERSION` env var     | U1, U3 |
| B2 | Linter ignores     | One `.config/linter.yaml`, shipped by the pre-commit gate pack, whose `ignores:` lists every generated tree the packs know (`build/`, `.dart_tool/`, `.build/` and the rest the packs' conventions name); the eslint pack stops shipping its copy | `linter.d` fragments composed by init; language packs append | U3     |
| B3 | dprint paths       | Every path handed to dprint is `./`-prefixed, or passed after dprint's literal/`--` form when its docs (Context7) offer one                                                                                                                       | —                                                            | U2     |
| B4 | Serial lint hook   | The pre-commit pack's `lint` hook gets `require_serial: true`                                                                                                                                                                                     | —                                                            | U3     |
| B5 | Hygiene payload    | repo-hygiene's `SECURITY.md` and `CONTRIBUTING.md` are reflowed with the dprint pack's shipped config                                                                                                                                             | —                                                            | U4     |
| B6 | This repo's copies | Plan B edits pack payloads only; this repo picks them up on its next `/vwf:setup reshape`                                                                                                                                                         | mirror by hand; a reshape as an after-landing `ask` step     | —      |
| B7 | Review row         | One review row covering U1–U3, which change shipped task scripts and hook config                                                                                                                                                                  | no review row                                                | U5     |
| B8 | Versions           | Ride the unreleased bumps: no stackgen or site bump. A changed pack is patch-bumped only if its `pack.yaml` version is unchanged since `stackgen-v1.31.0`, with every bundle pin that names it. No release step                                   | bump again; a `/release` step as `ask`                       | U7     |

## New dependencies

- `npm:@askviraj/linter` **1.1.6** as a mise tool in the mise pack (U1) —
  replaces the same package fetched unpinned by `pnpm dlx`; not a new package.

## Units

| Id | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                          | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-linter-pin.md](01-linter-pin.md)           | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, `code/lint` under `config/.config/mise/tasks/` of `package-manager/pnpm`, `app-framework/flutter`, `toolchain-gate/eslint`, `language/swift`, `app-framework/swiftui` | —          | green   | e1df8c5a |
| U2 | 1    | [02-dprint-paths.md](02-dprint-paths.md)       | edit   | `code/format` under `config/.config/mise/tasks/` of `package-manager/pnpm`, `app-framework/flutter`, `toolchain-gate/ruff`, `language/swift`, `app-framework/swiftui`, `toolchain-manager/mise` (all under `plugins/stackgen/stacks/`)                                                                                                                                        | —          | green   | e8a97ef7 |
| U3 | 1    | [03-lint-config.md](03-lint-config.md)         | edit   | `plugins/stackgen/stacks/toolchain-gate/pre-commit/**` except `pack.yaml`, `plugins/stackgen/stacks/toolchain-gate/eslint/config/.config/linter.yaml`, `plugins/stackgen/stacks/toolchain-gate/eslint/conventions.md`, `plugins/stackgen/stacks/toolchain-gate/eslint/skills/**`, `plugins/stackgen/stacks/package-manager/pnpm/conventions.md`                               | —          | green   | baae5b84 |
| U4 | 1    | [04-hygiene-payload.md](04-hygiene-payload.md) | edit   | `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/SECURITY.md`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/CONTRIBUTING.md`                                                                                                                                                                                                                            | —          | green   | 76e2703c |
| U5 | 2    | [05-review.md](05-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                             | U1, U2, U3 | pending |          |
| U6 | 3    | [06-docs.md](06-docs.md)                       | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/plugin-authoring/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                                                       | U4, U5     | pending |          |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)   | edit   | every `plugins/stackgen/stacks/*/*/pack.yaml` of a pack the branch changed, `plugins/stackgen/stacks/bundles/*.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                                                                                                                                                                                 | U6         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                          | Why it collides                                             | Owner   |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------- |
| each pack's `code/lint` vs `code/format`                                                      | two concerns in one pack; split by file                     | U1 / U2 |
| `toolchain-gate/eslint/skills/eslint/SKILL.md`                                                | carries both the linter command (B1) and `linter.yaml` (B2) | U3      |
| every `pack.yaml` and its pins in `bundles/*.md`                                              | a version and its pin move together                         | U7      |
| `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                     | generated                                                   | U7      |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md` | n units editing one doc                                     | U6      |
| this repo's own `.config/**`                                                                  | pack-owned copies; left to the next reshape (B6)            | none    |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Disjoint files: U1 the lint tasks and the mise
  pack's tools, U2 the format tasks, U3 the pre-commit pack and the eslint
  pack's linter config and prose, U4 two hygiene payload files.
- **Wave 2 — U5**, the review row over U1–U3's commits.
- **Wave 3 — U6**, docs. **Wave 4 — U7**, versions and generators.

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

plus the wave review, plus every report read for `UNRESOLVED:`. Inside wave 4
the freshness lines are red between U7's edits and its regeneration — expected.

## After landing

| Step                       | Mode | Notes                                                                                                                                                           |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed stackgen into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **No unpinned linter.**
   `grep -rn 'pnpm dlx @askviraj/linter' plugins/stackgen/stacks` is empty.
   Pass: empty.
2. **Serial lint hook.** The `lint` hook in
   `toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml` carries
   `require_serial: true`. Pass: present.
3. **One linter config.** `find plugins/stackgen/stacks -name linter.yaml`
   returns exactly the pre-commit pack's. Pass: one path.
4. **Hygiene payload is dprint-clean.** From a scratch directory holding the two
   files and the dprint pack's `dprint.json`, `dprint check` exits 0. Pass:
   exit 0.
5. **dprint paths.** In every `code/format` under `plugins/stackgen/stacks`, no
   dprint invocation receives an unprefixed file array. Pass: every call site
   passes `./`-prefixed paths or uses dprint's literal form.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore`, `git stash` or a
formatter's `--fix` over any path outside its Owns.

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

- **This repo's own `.config/` copies** — the next `/vwf:setup reshape` (B6).
- **`linter.d` fragment composition** — declined (B2).
- **Changing `@askviraj/linter` itself** — another repo.
- **An explicit `lineWidth` in the dprint pack's config** — the default is 80;
  not asked for.
- **A public release** (B8).

## Parked

- **Per-platform simulator pins** — optional `SIMULATOR_DEVICE_<PLATFORM>`-style
  pins declared through `machine_env:` (from gap-closure's Parked).
- **B63** — declare the `binaries` fact on the existing packs that need a
  non-mise binary.
- **Archiving the three Swift-chain folders** — once this plan lands, asked for
  in prose.

## Gaps surfaced during execution

- **U1 — the linter needs `node` at run time.** mise installs the `npm:` tool,
  but the binary is a Node script; swift and flutter repos pin no node. True
  before under `pnpm dlx` too, so not a regression; assumed out of scope, no
  tool added. Non-blocking.
- **U3 — the pre-commit pack's `pack.yaml` summary** names only two shipped
  files; `.config/linter.yaml` is now a third. `pack.yaml` is U7's; handed to U7
  with its bump. Non-blocking.

## Run log

| Wave | Unit      | Model | Round | Outcome               | Detail                                                                                                                                                                                                                                                                                                                                                                      | Commit   |
| ---- | --------- | ----- | ----- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green                 | wave gate 9/9 green; doctor blocking predicates clear (mise, graphify CLI, graph); no .config/vwf.yaml, no code unit — LSP and conventions steps skipped; format check skipped (no covers:)                                                                                                                                                                                 | —        |
| 1    | U4        | opus  | 1     | green                 | SECURITY.md 11-14 and CONTRIBUTING.md 22-23, 31-32, 45-46 re-wrapped with the shipped dprint config; dprint check exit 0; line breaks only                                                                                                                                                                                                                                  | 76e2703c |
| 1    | U1        | opus  | 1     | green                 | linter 1.1.6 pinned in base mise.toml [tools]; five code/lint call `linter`; lockfile passages (mise.lock now tracked) corrected in pack prose. GAP: linter needs node on PATH; swift/flutter pin no node — pre-existing under pnpm dlx, assumed out of scope                                                                                                               | e1df8c5a |
| 1    | U2        | opus  | 1     | green                 | six code/format pass dprint `./`-prefixed paths after `--` (dprint has no literal form, per Context7); swift/swiftui still byte-identical; `-x.md` repro fixed                                                                                                                                                                                                              | e8a97ef7 |
| 1    | U3        | opus  | 1     | green                 | linter.yaml moved to pre-commit pack with active ignores (build/, .dart_tool/, .build/, .swiftpm/, DerivedData/, Derived/, .venv/); eslint copy removed; lint hook require_serial; prose updated. GAP: pre-commit pack.yaml summary names two files — handed to U7                                                                                                          | baae5b84 |
| 1    | R1        | opus  | 1     | findings(4)           | fold width: mise/conventions.md:55, mise config-files.md:28 [U1]; pre-commit/conventions.md:94 [U3] — looped back. Docs: site plugins/stackgen.md:714 says eslint ships linter.yaml — DOCS FALSIFIED to U6 (already its Owns). CONTRACT clean, RULINGS clean                                                                                                                | —        |
| 1    | U1        | opus  | 2     | green                 | R1 loop-back: mise conventions.md and config-files.md lock paragraphs refolded to 80                                                                                                                                                                                                                                                                                        | e1df8c5a |
| 1    | U3        | opus  | 2     | green                 | R1 loop-back: pre-commit conventions.md "What this pack writes" paragraph refolded to 80                                                                                                                                                                                                                                                                                    | baae5b84 |
| 1    | R1        | opus  | 2     | pass                  | three fold fixes verified; 25 paths each in one Owns                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | gate      | —     | 1     | green                 | wave gate 9/9 green; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                          | —        |
| 2    | U5        | opus  | 1     | security: findings(1) | range 7606e092..ac8ccd16; engine clean; LOW (U1): npm: pin fixes top package only, transitive deps float, npm backend runs lifecycle scripts (pnpm dlx blocked them) — routed to U1; INFO only on U2/U3                                                                                                                                                                     | —        |
| 2    | U5        | opus  | 1     | review: findings(7)   | U1: HIGH default mise install refuses linter pin (29 weekly downloads, needs allow_low_downloads); MED comment claims node pinned; LOW "every code:lint" false for ruff/mise. U2: LOW comment "every path prefixed" true for dprint only. U3: LOW require_serial overstated; LOW unanchored `build/` glob. Docs site stackgen.md:714 → U6. Engine #9 dropped as speculative | —        |
| 2    | U1        | opus  | 2     | green                 | U5 fix: pin { version = "1.1.6", allow_low_downloads = true }; node note true; callers named (pnpm, eslint, flutter, swift, swiftui); lifecycle scripts allowlist-gated per mise docs, noted                                                                                                                                                                                | 746f9f52 |
| 2    | U2        | opus  | 2     | green                 | U5 fix: prefix comment scoped to dprint in four code/format; swift/swiftui already named dprint, still byte-identical                                                                                                                                                                                                                                                       | 83d30dd4 |
| 2    | U3        | opus  | 2     | green                 | U5 fix: require_serial worded as one process, partitions sequential; linter.yaml header names callers; `build/` kept unanchored (project roots at any depth), comment states cost and opt-back-in, tested                                                                                                                                                                   | cff25a41 |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-25-gate-hardening

or let the queue pick it, by priority:

/vwf:execute next
