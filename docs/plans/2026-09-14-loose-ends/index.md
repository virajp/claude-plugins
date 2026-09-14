---
type: vwf-change-plan
title: loose ends — version skip in one bump, setup:worktree green, Flutter is
  not a webapp
requires: []
backlog: []
---

# Plan — loose ends — version skip in one bump, setup:worktree green, Flutter is not a webapp (2026-09-14)

## Status

**RUNNING** since 2026-09-14 16:41 — worktree
`.worktrees/2026-09-14-loose-ends`, branch `2026-09-14-loose-ends`. Approved
2026-09-14 by the user, after self-review.

## Consent

| Action                                            | Granted                                                                                                                                                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                                   |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                                                   |
| Release `stackgen` publicly                       | minor — `1.11.0` → `1.12.0`, by editing `plugins/stackgen/.claude-plugin/plugin.json`; tagged by a later `/release`, not this run                                                                     |
| Release `vwf` publicly                            | minor — `19.24.0` → `19.25.0`, by editing `plugins/vwf/.claude-plugin/plugin.json`; tagged by a later `/release`, not this run                                                                        |
| Release `site` publicly                           | patch — `1.1.14` → `1.1.15`, by `mise run p:site:version` (bare — no positional, refuses a dirty tree, so it runs first; this is U1's rewritten task, exercised live); deployed by a later `/release` |
| Release `installer` publicly                      | none — untouched                                                                                                                                                                                      |

The numbers above are the base's at approval. **The level governs**: if another
plan lands first and moves a base version, the gates-and-bump unit applies the
consented level (minor, minor, patch) over the base's actual version and reports
the difference as a `GAP:` — the last run hit exactly this.

**A release recorded here is intent, not authorisation.** No release step runs
in this plan: the versions are bumped so the next `/release` ships them, and
that release is asked for then. The one `run` step publishes nothing and cuts no
tag; it stages the two plugins into this machine's dev marketplace, which a
**restarted** session picks up.

## Goal

After this lands, a version bump on this repo (`p:site:version`, `p:i:version`)
computes its target first, steps past 13 and 17 at the bumped level, and calls
`pnpm version` exactly once — no loop, no cap, no forbidden number ever written
to disk. `setup:worktree` bootstraps a fresh worktree of this repo green with
`pnpm-lock.yaml` untouched, because this repo's `setup/deps/*` tasks become the
pnpm pack's, and the pnpm pack's `outdated` and `audit` no longer pass flags
pnpm 12 rejects. And Flutter covers four platforms — `mobile`, `tablet`,
`desktop`, `auto` — so a Flutter project never declares `webapp` and is never
asked the stylesheet round.

The framing: the three loose ends the `2026-09-14-web-frontend-surface` run
reported. One folder because the three trees are disjoint and two of the fixes
move stackgen packs, which one bump ships. **One reversal**: Flutter's
five-platform coverage, stated in vwf's assets and argued for in the Flutter
pack's `pick-and-trade.md`, becomes four; the docs unit records it as
`docs/memory/decisions/2026-09-14-flutter-does-not-cover-webapp.md`.

## Facts the survey established

**The version tasks.** `.config/mise/tasks/p/site/version` and
`.config/mise/tasks/p/i/version` are near-identical, 49 lines each, repo-only
(no stackgen pack ships either). Site: first bump
`pnpm version "${LEVEL}" --no-git-tag-version` at `:25`, read-back
`node -p "require('./package.json').version"` at `:27` and `:45`, the skip loop
`:36-47` (`while version_forbidden "$VERSION"`), the ten-attempt cap `:39-42`,
the second `pnpm version … >/dev/null` at `:44`, `version_skip_note` at `:46`;
`cd` into `site` at `:12`. The `i` task is the same one line up (`:24`, `:26`,
`:36-47`, `:39`, `:44`, `:46`) and bumps the **root** `package.json`
(`@virajp.dev/claude-plugins`, `1.0.1`) from `MISE_PROJECT_ROOT` — not
`installer/package.json`, which sits at `0.0.0`; `deps-update.yml:85` runs it
unattended. Both declare only `--minor` / `--major` flags (`:5-6`), patch by
default (`:14-20`), no positional. The guards live in
`.config/mise/tasks/_scripts/local`: `version_forbidden VERSION` (`:35-53`)
strips `v`, `+…`, `-…`, splits on `.`, returns 0 when any component is exactly
`13` or `17`; `version_skip_note SKIPPED NEW` (`:60-62`) prints the warning.
Callers: the two version tasks (`:37`, `:46` each), `p/i/release:50`,
`p/site/release:51`, `p/plugins/release:74` — the release tasks refuse a
forbidden version before building a tag name. The defect: pnpm 12 implements
`version` natively with a clean-tree check, so the second call inside the loop
fails `ERR_PNPM_UNCLEAN_WORKING_TREE` on the tree the first call dirtied,
leaving `1.1.13` on disk and exiting 1. pnpm 12.4.1's `pnpm version` accepts an
explicit semver, `--no-git-tag-version`, and `--no-git-checks`. No package has a
`version` script.

**setup:worktree.** This repo's landed `.config/mise/tasks/setup/worktree`
(`:24` submodules, `:27` `mise install`, `:30` `setup:secrets`, `:36`
`mise run setup:deps:install --frozen`) and `setup/deps/all` are byte-identical
to the mise pack's. The five verbs are **not**: `setup/deps/install` (`:1-18`)
declares no `--frozen` flag, so the flag is an unread positional, and chains
`cleanup` (`:8`) → `upgrade` (`:11`) → `outdated` (`:14`) → `audit` (`:17`);
`deps/cleanup:15` runs `find . -name pnpm-lock.yaml -exec rm -rf` — this is
where the frozen intent is lost; `deps/upgrade:9` runs
`pnpm self-update latest-11` (pnpm is 12.4.1, pinned `latest` in
`.config/mise.toml:20`) and `:12` `pnpm install … --recursive` unfrozen, which
re-resolves the deleted lock; `deps/outdated:9` passes `--depth 0` (`|| true`
present); `deps/audit:9` passes `--reporter=summary` with no `|| true` — the
hard failure that fails `install` and then `worktree`. These bodies predate the
packs (last changed in `47af40c0`, 2026-09-09). The pnpm pack
(`plugins/stackgen/stacks/package-manager/pnpm`, `pack.yaml:4` version `0.2.0`)
ships
`config/.config/mise/tasks/setup/deps/{install,outdated,audit,upgrade,cleanup}`:
its `install` declares `--frozen` (`:6`) and maps it to `--frozen-lockfile`
(`:20-22`), its `cleanup` deletes no lockfile, its `upgrade` runs
`pnpm self-update` (`:25`) and `pnpm update --recursive --latest` (`:28`) — but
its `outdated:16` carries `--depth 0` and its `audit:12` `--reporter=summary`,
both invalid on pnpm 12 (`outdated` has `-r`, `--long`, `--json`, `--format`,
`--reporter`, `--aggregate-output`, no `--depth`; `audit --reporter` takes only
`default|append-only|ndjson|silent`). The mise pack's own deps verbs
(`toolchain-manager/mise`, `1.2.2`) name no package manager; the uv pack's
`audit:21` is `… || true` and its `outdated:15` `… || true`; the flutter pack's
use `flutter pub outdated` and warn that pub has no audit. The pnpm pack is
pinned `package-manager/pnpm@0.2.0` by every `typescript-*`, `pnpm-*` bundle
(`grep -rn "package-manager/pnpm@" plugins/stackgen/stacks/bundles/` lists
them). This repo has no `.claude/stackgen/lock.yaml` and no `.config/vwf.yaml`,
so `/vwf:init` has nothing to compare the diverged copies against; adopting the
pack's files is a plain overwrite. The standing decision
`docs/memory/decisions/2026-09-05-worktree-init-becomes-setup-worktree.md:15-17`
already says the body ends in `setup:deps:install --frozen`. The failure has
been worked around by hand on four runs since 2026-09-13.

**Flutter and `webapp`.** The platform vocabulary is a closed per-role list
(`plugins/vwf/skills/architecture/references/platforms.md:18-19`, mirrored at
`assets/templates/registry.yaml:34-35`; `site` vs `webapp` at
`platforms.md:59-60`). The only rule tying a framework to platforms is the
covering rule, `assets/stack-adapter.md:202-207`: a project's pinned template's
`platforms:` must cover every platform the project declares; architecture offers
only covering templates; doctor reports non-cover as blocking
(`skills/doctor/references/stack-checks.md:221-231`). So the ruling is enforced
by narrowing the Flutter pack's list — no new vwf rule, no new doctor finding.
Passages saying Flutter covers the web: the pack
`plugins/stackgen/stacks/app-framework/flutter/pack.yaml:3` (summary "across
mobile, tablet, desktop, web and in-car"), `:5` (version `0.3.0`), `:10`
(`platforms: [mobile, tablet, desktop, webapp, auto]`); `conventions.md:18-20`;
`skills/flutter/references/pick-and-trade.md:6,38-42` (argues Flutter web is an
acceptable trade); the bundle `stacks/bundles/dart-flutter.md:8-13`
(`platforms:` with `webapp`), `:17` (H1 "mobile · tablet · desktop · webapp ·
auto"), `:23-27` ("one template, five platforms… web"); the generated
`stacks/inventory.md:34`. vwf side: `assets/stack-adapter.md:195-196`,
`assets/vwf-config.md:74`, `assets/templates/registry.yaml:45-46`,
`agents/architecture-writer.md:115-117`,
`skills/architecture/references/platforms.md:23-25`,
`skills/setup/references/topology-detection.md:98-100`,
`assets/topologies/repo.md:30-31`. Manual:
`site/src/content/docs/how-to/greenfield/ui-with-design-tool.md:81`,
`site/src/content/docs/plugins/vwf.md:586`. Code-note mentions of Flutter web
that assert no platform (`flutter/references/ui-composition.md:177,377`,
`integrations/image-handling.md:11`, `firebase-auth.md:13`,
`platform-interop.md:122`) are U3's to judge. The stylesheet condition "site or
webapp" is already consistent everywhere (`stack-menu.md:124-126` excludes "a
native app"; `ui-with-design-tool.md:83-85` has Centwise declare `mobile`
alone). The `2026-09-13-consumer-gaps` decision (`:111`) ruled a platform-list
widening is a minor pack bump.

**Docs the change falsifies** (every hit has an owner). The skip loop:
`CLAUDE.md:335-339` ("skip past… bumping again… capped at ten attempts"),
`.claude/docs/ci-and-releases.md:62,87,269,276`,
`.claude/skills/release/SKILL.md:93,133,145,193,203` (U6). The deps tasks:
`site/src/content/docs/plugins/stackgen.md:723-725` (install honours
`--frozen`), `:735-737` (worktree body), `:855-860`, `:887`,
`site/src/content/docs/plugins/vwf.md:2430` (U6) — most are already true and
need only confirming;
`plugins/vwf/skills/git-workflow/references/worktree-setup.md:95-116` and the
pnpm pack's `conventions.md:6` stay true. Flutter: the two manual passages
above, plus whatever `.claude/skills/{vwf,stackgen}-plugin/` says about
Flutter's platforms (U6).

**Gates, convention, versions.** Wave gate lines as in every plan this month.
Rule 11 (`scripts/src/check.ts:418-515`) asserts exec bit and shebang on every
`config/.config/mise/tasks/**` file; `p:plugins:shellcheck` runs `shellcheck -x`
and `shfmt -d -i 2 -ci` over them. This repo's own `.config/mise/tasks/**` are
covered by the `lint` pre-commit hook (`code:lint`). Commit types
(`.config/git-conventional-commits.yaml`): `ops`, `docs`, `merge`, `feat`,
`fix`, `refactor`; no scopes. stackgen `1.11.0`, vwf `19.24.0`, site `1.1.14`,
root package `1.0.1`. No dependency is needed.

## Assumed decisions — confirm or override at review

| # | Decision            | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                                              | Unit   |
| - | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| 1 | The skip, once      | Compute the target in bash — apply the level to the current version, then while `version_forbidden` holds step the **same** component again — and call `pnpm version <explicit> --no-git-tag-version` exactly once. Two new helpers in `_scripts/local` beside `version_forbidden`: `version_bump LEVEL CURRENT` prints the plain result of the level, `version_next LEVEL CURRENT` prints that result stepped past any forbidden component; the task prints `version_skip_note` when the two differ. The loop, the ten-attempt cap and the second `pnpm version` call go | keep the loop and add `--no-git-checks` to the second call            | U1     |
| 2 | The pnpm pack       | `outdated` drops the `--depth 0` token and keeps every other flag; `audit` drops `--reporter=summary` and becomes advisory with `\|\| true`, as the uv pack's already is. `pack.yaml` `0.2.0` → `0.2.1` (a fix); every bundle pinning `package-manager/pnpm@0.2.0` follows; the inventory is regenerated in the same commit                                                                                                                                                                                                                                               | audit stays blocking; a minor bump                                    | U2     |
| 3 | This repo adopts    | `.config/mise/tasks/setup/deps/{install,outdated,audit,upgrade,cleanup}` become **byte copies** of the pnpm pack's fixed files (`cp`, then `diff -q` empty), mode 755 preserved. `install` thereby honours `--frozen`, `cleanup` stops deleting `pnpm-lock.yaml`, `upgrade` loses `self-update latest-11`                                                                                                                                                                                                                                                                 | patch the copies by hand; leave them for a later `/vwf:setup reshape` | U4     |
| 4 | Flutter is four     | Flutter pack `platforms: [mobile, tablet, desktop, auto]`; the summary, `conventions.md` and the `dart-flutter` bundle say four; `pick-and-trade.md` says the web is not offered — a web surface is a `site` or `webapp` project on its own stack. Pack `0.3.0` → `0.4.0` (the inverse of the consumer-gaps widening ruling); the bundle pin and the inventory follow                                                                                                                                                                                                     | `1.0.0`                                                               | U3     |
| 5 | No new rule         | Every vwf passage naming Flutter's five platforms says four; the platform vocabulary itself is unchanged (`webapp` stays a valid frontend platform for other stacks); doctor's existing cover check is what refuses a Flutter project declaring `webapp`                                                                                                                                                                                                                                                                                                                  | a new doctor finding kind; a framework-to-platform table in vwf       | U5     |
| 6 | Code notes          | A Flutter-pack reference that mentions Flutter's web build as a code fact (an API that behaves differently on web) is left alone; one that asserts the project ships a web surface is rewritten. U3 reads each of the four listed hits and reports which it took                                                                                                                                                                                                                                                                                                          | rewrite all; touch none                                               | U3     |
| 7 | Inventory ownership | U2 regenerates and owns `stacks/inventory.md` in wave 1, U3 in wave 2, so each pack bump lands with its pins and its inventory in one commit                                                                                                                                                                                                                                                                                                                                                                                                                              | one unit for both packs                                               | U2, U3 |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                        | Owns                                                                                                                                                                                                                                                                                                                                                                                         | Depends on | Status  | Commit     |
| -- | ---- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ---------- |
| U1 | 1    | [01-version-skip.md](01-version-skip.md)         | `.config/mise/tasks/p/site/version`, `.config/mise/tasks/p/i/version`, `.config/mise/tasks/_scripts/local`                                                                                                                                                                                                                                                                                   | —          | green   | `a9ba27ef` |
| U2 | 1    | [02-pnpm-pack.md](02-pnpm-pack.md)               | `plugins/stackgen/stacks/package-manager/pnpm/**`, every `plugins/stackgen/stacks/bundles/*.md` whose components pin `package-manager/pnpm@`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                         | —          | green   | `072ea478` |
| U5 | 1    | [05-vwf-flutter-four.md](05-vwf-flutter-four.md) | `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/assets/templates/registry.yaml`, `plugins/vwf/assets/topologies/repo.md`, `plugins/vwf/agents/architecture-writer.md`, `plugins/vwf/skills/architecture/references/platforms.md`, `plugins/vwf/skills/setup/references/topology-detection.md`, `plugins/vwf/assets/examples/blueprint/registry.yaml` | —          | green   | `a9a1eceb` |
| U3 | 2    | [03-flutter-pack.md](03-flutter-pack.md)         | `plugins/stackgen/stacks/app-framework/flutter/**`, `plugins/stackgen/stacks/bundles/dart-flutter.md`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                | U2         | green   | `9f35d03d` |
| U4 | 2    | [04-adopt-deps.md](04-adopt-deps.md)             | `.config/mise/tasks/setup/deps/install`, `.config/mise/tasks/setup/deps/outdated`, `.config/mise/tasks/setup/deps/audit`, `.config/mise/tasks/setup/deps/upgrade`, `.config/mise/tasks/setup/deps/cleanup`                                                                                                                                                                                   | U2         | green   | `705e6e2b` |
| U6 | 3    | [06-docs.md](06-docs.md)                         | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-14-flutter-does-not-cover-webapp.md` (new), `docs/backlog.md`                                                                                                                                                                                                                             | all        | pending |            |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)     | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                              | U6         | pending |            |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                           | Why it collides                                                 | Owner                                                                              |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`        | version                                                         | U7 only                                                                            |
| `site/package.json`                                                                            | version — bumped by U1's rewritten task, live                   | U7 only                                                                            |
| `.claude-plugin/marketplace.json`                                                              | generated from the manifests                                    | U7 only                                                                            |
| `plugins/stackgen/stacks/inventory.md`                                                         | generated with the pack pins; must land with them in one commit | U2 in wave 1, U3 in wave 2                                                         |
| `plugins/stackgen/stacks/bundles/*.md`                                                         | pins                                                            | the `package-manager/pnpm@` pinners are U2's; `dart-flutter.md` is U3's — disjoint |
| `.config/mise/tasks/_scripts/local`                                                            | the guard functions                                             | U1 only                                                                            |
| `.config/mise/tasks/setup/deps/*`                                                              | byte copies of U2's committed output                            | U4 only, in wave 2                                                                 |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`, `docs/memory/decisions/**` | human-facing docs and the decisions doc                         | U6 only                                                                            |
| `docs/backlog.md`                                                                              | no ids covered                                                  | U6 only, and only if docs-sync finds a passage                                     |

## Waves

- **Wave 1 — U1, U2, U5.** Three disjoint trees: this repo's version tasks, the
  pnpm pack with its pins and inventory, vwf's Flutter platform passages.
- **Wave 2 — U3, U4.** U3 bumps the Flutter pack on top of U2's inventory
  commit; U4 byte-copies U2's committed pack files into this repo. Disjoint
  paths.
- **Wave 3 — U6.** Docs, over the whole branch delta, plus the decisions doc.
- **Wave 4 — U7.** Bumps — the site bump running U1's task live — the generator,
  the full gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line is
green before wave 1. `p:plugins:inventory -- --check` is expected red on the
wave-1 tree until U2's commit regenerates it, and again on the wave-2 tree until
U3's — the orchestrator commits each with its regenerated inventory before
re-running the gate, per the shared-file rule.

## After landing

| Step                       | Mode | Notes                                                                                                                                                              |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | Stages `stackgen` and `vwf` into this machine's dev marketplace as `X.Y.Z+N` and updates the local install. Publishes nothing; a **restarted** session picks it up |

No release step. The bumped versions ship with the next `/release`.

## Gates the orchestrator keeps

- **`setup:worktree` is green.** After wave 2, from the run's worktree, cut a
  scratch worktree of the branch (`git worktree add /tmp/<x> <branch>`), run
  `mise run setup:worktree` there. Pass: exit 0, and
  `git -C /tmp/<x> status --porcelain` is empty (the lockfile did not move).
  Remove the scratch worktree afterwards. Needs network for `pnpm install`.
- **The skip table.** After wave 1, copy `.config/mise/tasks/p/site/version` and
  `.config/mise/tasks/_scripts/local` into a temp dir beside a scratch
  `site/package.json` and a `.config/mise/config.toml` naming that task dir,
  `git init` it (the task refuses a dirty tree, so commit the scratch first),
  and run `mise run p:site:version` four times against a fresh scratch each:
  `1.1.12` patch → `1.1.14` with the skip note printed; `1.1.16` patch →
  `1.1.18` with the note; `1.12.0` with `--minor` → `1.14.0` with the note;
  `1.1.5` patch → `1.1.6` with no note. Each run exits 0 and `package.json` is
  rewritten exactly once.
- **Flutter names no webapp.**
  `command grep -rn "webapp" plugins/stackgen/stacks/app-framework/flutter/ plugins/stackgen/stacks/bundles/dart-flutter.md`
  is empty after wave 2, and
  `command grep -rn "webapp" plugins/vwf/assets/stack-adapter.md plugins/vwf/assets/vwf-config.md plugins/vwf/assets/templates/registry.yaml plugins/vwf/agents/architecture-writer.md plugins/vwf/skills/architecture/references/platforms.md plugins/vwf/skills/setup/references/topology-detection.md plugins/vwf/assets/topologies/repo.md | command grep -i flutter`
  is empty after wave 1.
- **The live bump.** U7's `mise run p:site:version` runs U1's rewritten task on
  the real tree: `site/package.json` reads `1.1.15` afterwards and the task
  printed no skip note.
- **Pack copies match.** After wave 2, for each of the five verbs,
  `diff -q .config/mise/tasks/setup/deps/<verb> plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/setup/deps/<verb>`
  is silent and both are mode 755.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a plugin or site version,
never runs a generator (U2 and U3 excepted, for the inventory alone, per
decision 7), never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter `--fix`
over a path outside its Owns.

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

- **`p:i:version` bumping the root `package.json`** rather than
  `installer/package.json` — the root is the published package; the behaviour is
  correct and untouched.
- **The uv, flutter and mise packs' own deps verbs** — none passes a pnpm flag;
  untouched.
- **A `--check` mode for the version tasks** — not asked.
- **`setup:deps:all` in a worktree** — the worktree path is `install --frozen`
  alone by the standing decision; `all` (cleanup, install, upgrade, outdated,
  audit) stays what `setup:all` runs.
- **The pnpm pack's `upgrade` body** (`pnpm self-update`,
  `pnpm update
  --recursive --latest`) — untouched; this repo receives it as a
  byte copy.
- **A framework-to-platform table in vwf** — declined with decision 5; the
  covering rule already does the work.

## Parked

none.

## Run log

<written by /vwf:change-execute; empty at approval>

| Wave | Unit                   | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Commit     |
| ---- | ---------------------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 0    | preflight              | —     | —     | green       | all nine gate lines green on the branch tree                                                                                                                                                                                                                                                                                                                                                                                                                                           | —          |
| 1    | U5                     | opus  | 1     | green       | 7 files; DECIDED: examples/blueprint/registry.yaml untouched (no Flutter project in it); five→four only where the count named the platform list                                                                                                                                                                                                                                                                                                                                        | `a9a1eceb` |
| 1    | U2                     | opus  | 1     | green       | pnpm pack 0.2.0→0.2.1, 14 bundle pins, inventory regenerated; DECIDED: audit comment takes the uv framing (code:sec is the blocking check), no new flags, edit 4 no-op; DOCS FALSIFIED (pre-existing): pnpm conventions.md:62-66 verb list omits upgrade and says cleanup deletes the lockfile — U6                                                                                                                                                                                    | `072ea478` |
| 1    | U1                     | opus  | 1     | green       | version_bump + version_next in _scripts/local, both tasks call pnpm version once; DECIDED: version_next refuses up front when the level cannot clear the forbidden component (replaces the cap), 10# on the incremented component; GAP: plan named no non-termination guard after deleting the cap — assumption: refuse before writing; DOCS FALSIFIED: CLAUDE.md:335-339 (cap, "two functions" now four), ci-and-releases.md, release/SKILL.md — U6                                   | `a9ba27ef` |
| 1    | gate:skip-table        | —     | —     | green       | scratch repos: 1.1.12→1.1.14 note, 1.1.16→1.1.18 note, 1.12.0 --minor→1.14.0 note, 1.1.5→1.1.6 no note; each exit 0, package.json rewritten once                                                                                                                                                                                                                                                                                                                                       | —          |
| 1    | gate:flutter-vwf-grep  | —     | —     | green       | webapp∩flutter grep over the seven vwf files is empty                                                                                                                                                                                                                                                                                                                                                                                                                                  | —          |
| 1    | R1                     | opus  | 1     | findings(3) | architecture-writer.md:118 and platforms.md:24-26 [U5] fold width not rejoined after webapp dropped → U5 round 2; site/docs/plugins/vwf.md:586 "five surfaces" [rule 5, U6-owned] → DOCS FALSIFIED handed to U6; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                         | —          |
| 1    | U5                     | opus  | 2     | green       | refolded architecture-writer.md:115-119 and platforms.md:23-30 whole paragraphs at 79 cols, wording unchanged                                                                                                                                                                                                                                                                                                                                                                          | `a9a1eceb` |
| 1    | R1                     | opus  | 2     | findings(1) | round-1 folds resolved; only the rule-5 vwf.md:586 line remains — U6-owned, handed as DOCS FALSIFIED, does not loop; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                     | —          |
| 1    | gate                   | —     | —     | green       | all nine lines green on the wave-1 tree                                                                                                                                                                                                                                                                                                                                                                                                                                                | —          |
| 2    | U4                     | opus  | 1     | green       | five verbs byte-copied from the pack, mode 755, diff -q silent; install --frozen exited 0 with the lockfile untouched; GAP: the old cleanup also deleted .astro caches and the pack's does not — assumption: byte copy is the ruling, left as the pack's scope                                                                                                                                                                                                                         | `705e6e2b` |
| 2    | U3                     | opus  | 1     | green       | flutter pack 0.3.0→0.4.0, four platforms, dart-flutter pin, inventory regenerated; DECIDED: four code-note hits left (API facts), platform-interop.md:115-138 rewritten (build-and-serve instructions for web); GAP: edit 2's literal `webapp` token conflicts with the orchestrator grep — wrote "web-application"; GAP: flutter deps/install:34 `flutter config --enable-web` unlisted, left as-is (dev target for -d chrome)                                                        | `9f35d03d` |
| 2    | gate:flutter-pack-grep | —     | —     | green       | webapp grep over flutter/ and dart-flutter.md is empty                                                                                                                                                                                                                                                                                                                                                                                                                                 | —          |
| 2    | gate:pack-copies       | —     | —     | green       | all five deps verbs diff -q silent against the pack, both sides 755                                                                                                                                                                                                                                                                                                                                                                                                                    | —          |
| 2    | R2                     | opus  | 1     | findings(4) | choosing-your-stack.md:49 [rule 5, U6-owned] → DOCS FALSIFIED handed to U6; flutter deps/install:34 `--enable-web` [U3 completeness] and navigation.md:56,102 web-support reasons [U3 rulings/decision 6] → U3 round 2; cleanup .astro [U4] GAP confirmed, byte-copy ruling holds, final report; RULINGS: U3 wrote "web-application" for the ruling's `webapp` — forced by the plan's own flutter-tree grep gate; GAP: the gate governs over the sentence's token, recorded not looped | —          |
| 2    | U3                     | opus  | 2     | green       | dropped `--enable-web` from the flutter deps/install payload; navigation.md:56,102 pin reasons rewritten (decision 6: pin reasons assert a web surface), :22-29 framework facts left                                                                                                                                                                                                                                                                                                   | `9f35d03d` |
| 2    | R2                     | opus  | 2     | pass        | round-1 findings resolved; RULINGS residual is the recorded webapp-token GAP only                                                                                                                                                                                                                                                                                                                                                                                                      | —          |
| 2    | gate                   | —     | —     | green       | all nine lines green on the wave-2 tree                                                                                                                                                                                                                                                                                                                                                                                                                                                | —          |
| 2    | gate:setup-worktree    | —     | —     | green       | scratch worktree of the branch: setup:worktree exit 0, git status --porcelain empty (frozen install, 549 packages reused)                                                                                                                                                                                                                                                                                                                                                              | —          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-loose-ends
