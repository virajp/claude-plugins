---
type: vwf-change-plan
title: setup:ai reconciles the repo's plugins at project scope through Claude's
  own commands
requires: [ docs/plans/2026-09-12-task-library ]
---

# Plan — setup:ai reconciles the repo's plugins at project scope through Claude's own commands (2026-09-12)

## Status

**RUNNING**

APPROVED 2026-09-12 by the user, after the self-review. RUNNING since 2026-09-12
in worktree `.worktrees/2026-09-12-setup-ai`.

## Consent

| Action                                            | Granted                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                     |
| After landing: `mise run p:plugins:local`         | run                                                                                                     |
| After landing: `/release`                         | ask                                                                                                     |
| Release stackgen publicly                         | minor — `plugins/stackgen/.claude-plugin/plugin.json` `1.7.0` → `1.8.0`, by editing the `version` field |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json` `19.16.0` → `19.17.0`, by editing the `version` field  |
| Release site publicly                             | patch — `mise run p:site:version patch`                                                                 |
| Release installer publicly                        | none                                                                                                    |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

The version numbers above assume plan 1 has landed and released as it recorded
(stackgen `1.7.0`, vwf `19.16.0`, mise pack `1.1.0`). If plan 1's release did
not happen, the gates-and-bump unit bumps **from whatever the files hold**, one
minor step, and reports the numbers.

## Goal

After this lands, `mise run setup:ai` installs and updates the plugins a repo
requires — `vwf`, which brings `stackgen`, plus whatever the repo's two marked
slots name — at **project** scope, through `claude plugin …` commands and
nothing else. It never touches a user-scope plugin, never re-registers a
marketplace that is already registered from any source, and so behaves the same
on a user's machine (marketplace from `virajp/claude-plugins`, tagged versions)
and on the maintainer's (marketplace from `./.dev-marketplace`, `X.Y.Z+N` staged
versions). It wires graphify when the tool is present and hints at the
statusline package when it is absent. `/vwf:init` fills the two slots from one
confirmed answer, seeded by the task's own inventory.

The framing: the user ran `/vwf:setup` on 95octane on 2026-09-12 and found the
shipped task would replace a `setup:ai` that installed the official marketplace,
ten project plugins and the statusline with one that installs `vwf` alone and
whose extra-plugin arrays nobody fills. And "`pnpx` … will break it" on the
maintainer's machine: the installer CLI is a one-shot for users, not a reconcile
step for a repo. The user's ruling: "`setup:ai` must only focus on the plugins
required for the repo and ideally not touch the user-level plugins. There might
be exceptions but rare."

**Reversal, confirmed by the user 2026-09-12 (by approving this shape):** D22 of
the 2026-09-05 init plan
(`docs/plans/archived/2026-09-05-vwf-init/index.md:281`) had the task run
`pnpx @virajp.dev/claude-plugins` at user scope by default with `--project` as
the exception. Now the task runs no installer, defaults to project scope, and
`--user` is the exception. The installer CLI is unchanged and remains the
user-facing one-shot. The docs unit writes the decisions doc.

## Facts the survey established

**The shipped task.**
`plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/ai`
(100 lines, `hide=true`, `--project` flag): guards on `claude` on PATH
(`:22-26`); builds `INSTALLER_ARGS` (`:36-40`); runs
`pnpx @virajp.dev/claude-plugins` or falls back to raw `claude plugin` commands
that swallow failure with `|| true` (`:42-55`); `EXTRA_MARKETPLACES=()` and
`EXTRA_PLUGINS=()` at `:61-65` with comments describing the row shapes
`<source>|<marketplace-name>` and `<name>@<marketplace>`; loops over them
(`:67-87`); `claude plugin update --all` (`:90`); `autoremove` at user, project
and local scope (`:93-96`). Its comment block states it is a `setup:*` task
(landed 2026-09-12, commit `26a8752f`). The task-library row is
`…/skills/mise/references/task-library.md:154`, the `setup:all` tree line
`:251`; `setup/all:51` calls it. This repo's own copy
(`.config/mise/tasks/setup/ai`, 12 lines) runs only
`pnpx @virajp.dev/claude-plugins --all`.

**The installer CLI** (`installer/src/`): flags
`--all --user --project
--uninstall --dry-run -v -h`, strict parser
(`args.ts:40-83`); marketplace source hardcoded `virajp/claude-plugins`
(`install.ts:44`), name `virajp-plugins` (`context.ts:165`); it **skips the
add** when `extraKnownMarketplaces.virajp-plugins` exists in
`~/.claude/settings.json`, by name only (`install.ts:145-152`,
`claude-settings.ts:48-53`); an installed plugin is reported "already", never
updated (`install.ts:163-172`); graphify wiring is
`graphify install --platform claude` plus its hook, soft-skipped when absent
(`graphify.ts`). It stays untouched by this plan.

**Measured hermetically (2026-09-12, `CLAUDE_CONFIG_DIR=/tmp/…`):**
`claude plugin marketplace add virajp/claude-plugins` while the name is
registered from a directory **fails, exit 1**:
`Cannot add marketplace
"virajp-plugins": its network source differs from the one declared for it in
settings`.
Re-adding the same source is a no-op, exit 0.
`claude plugin
marketplace list --json` returns an array of
`{name, source: "github"|"directory", repo|path, installLocation}`;
`~/.claude/plugins/known_marketplaces.json` carries the same keyed by name;
`~/.claude/plugins/installed_plugins.json` records installed plugins with scope
and version (this repo reads it with node at
`.config/mise/tasks/p/plugins/local:48,60-66`, and greps `marketplace list` for
`.dev-marketplace` at `:53`). `claude plugin list --json` exists
(`installer/src/version.ts:5`).

**The dev marketplace** (`.claude/docs/dev-marketplace.md`): setup is
`marketplace remove virajp-plugins`, `add ./.dev-marketplace`, then
`p:plugins:local` (`:21-26`); a machine registers one or the other, never both,
and the same name is load-bearing for vwf's `stackgen` dependency edge
(`:38-42`); `claude plugin list` showing `+N` is the tell (`:41-42`); back to
user mode is remove, add, install (`:84-88`). `p:plugins:local`
(`.config/mise/tasks/p/plugins/local`) refuses user mode (`:50-57`), restages
changed plugins under `+N` (`:89-119`), regenerates and `marketplace update`s
(`:123-124`), installs vwf if absent else updates each installed (`:128-136`).

**Standing memory rules.** The official marketplace
`anthropics/claude-plugins-official` always ships with Claude Code and is
installer-updated, so it never needs adding and cross-marketplace dependencies
on it always resolve. Probe the plugin CLI only under a throwaway
`CLAUDE_CONFIG_DIR` — Claude reuses version-keyed cache dirs without clearing,
which produced a phantom `+N` on 2026-09-03. The maintainer's laptop is a test
bed, not evidence of the installed base.

**The statusline** is `brew install virajp/tap/claude-status`, a separate
package; nothing in the repo installs it (mentions: root `CLAUDE.md` installer
section, `installer/CLAUDE.md`, `plugins/vwf/skills/execute/SKILL.md:204-205`,
`.claude/agents/target-verifier.md:297`).

**init.** `plugins/vwf/skills/init/SKILL.md` asks six questions (`:144-165`
region); the marked positions are `references/new-repo.md:138-172` (plan 1 adds
`MERGE_MODEL` and `MEMBERS` there); the existing-repo check of the same
positions is `references/existing-repo.md:229-234`. `init` names no tool
(decision 2026-09-05-vwf-init-and-the-repo-shape) but does run the task
library's tasks — plan 1 removes the last such call (`setup:default-branch`),
and this plan adds one (`setup:ai --inventory`).

**Gates, checker, commit types, docs exclusions:** as plan 1's facts section
(`docs/plans/2026-09-12-task-library/index.md`). Nothing enumerates task names;
rule 11 checks exec bit, shebang and the config parses; rule 13 refuses
plugin-path citations in payload. Commit types
`ops docs merge feat fix
refactor`, no scopes.

**Docs describing today's behaviour:**
`site/src/content/docs/plugins/stackgen.md:570-573` (`setup:ai` "installs and
reconciles the repo's agent plugins", after plan 1's edit); the root `CLAUDE.md`
"Installation (end-user)" section and `readme.md` wherever they say the
installer is what wires a repo; `installer/CLAUDE.md` "Plugin installs are a
thin wrapper" (unchanged in substance; confirm it does not claim `setup:ai` uses
it).

## Assumed decisions — confirm or override at review

| # | Decision             | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Rejected                                                                | Unit   |
| - | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ |
| 1 | No installer         | "If `setup:ai` uses claude commands then it ideally should work in both cases." The task runs no `pnpx`. It reads `claude plugin marketplace list --json`; if `virajp-plugins` is registered **from any source** it runs `claude plugin marketplace update virajp-plugins` and never `add`; else `claude plugin marketplace add virajp/claude-plugins`. The same registered-check-then-update-else-add rule applies to every extra marketplace. A failed `add` is an error, not swallowed.                                                                                                                                                                                                                                                                            | keep the installer; give the installer a source flag                    | U1     |
| 2 | Project scope        | "`setup:ai` must only focus on the plugins required for the repo and ideally not touch the user-level plugins. There might be exceptions but rare." Default scope is `project`: `claude plugin install --scope project <name>@<marketplace>` for each required plugin not yet at project scope; `claude plugin update --scope project` for each that is; `claude plugin autoremove --scope project --yes` once. User-scope entries are never installed, updated or removed. "Install at project scope anyway": a required plugin already enabled at user scope is still installed at project scope, so the repo's `.claude/settings.json` declares it. `--user` is the flag for the rare exception and flips every `--scope`.                                         | user default + `--project`; treat a user-scope copy as satisfied        | U1     |
| 3 | The two slots        | "init asks, seeded from what this machine has registered." `EXTRA_MARKETPLACES` and `EXTRA_PLUGINS` become marked positions in the pack's commented-template style (the real lines written one per row, the template comment left in place). The task gains `--inventory`: prints one line per registered marketplace other than `virajp-plugins`, `<source-ref>\|<name>`, then one line per plugin installed from any marketplace at any scope, `<name>@<marketplace>\|<scope>`, and exits 0 with nothing else on stdout. `init` runs `mise run setup:ai --inventory`, shows the rows as an MCQ (multi-select, "none" allowed), and writes the confirmed rows into the two positions. `init` never reads `settings.json` or names `claude` — D22's rejection stands. | hand-edited; a roster in `.config/vwf.yaml`; init reading settings.json | U1, U3 |
| 4 | graphify             | "setup:ai wires it directly when graphify is on PATH." After the plugins: if `graphify` is on PATH, `graphify install --platform claude` then its post-commit hook install (the same two calls the installer makes — read `installer/src/graphify.ts` for the exact hook command); else `print_yellow` the install hint and continue. Idempotent.                                                                                                                                                                                                                                                                                                                                                                                                                     | not the task's job                                                      | U1     |
| 5 | Statusline           | "Check and hint, never install." If `claude-status` is not on PATH, `print_yellow` `brew install virajp/tap/claude-status`; never run it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | install via brew; nothing                                               | U1     |
| 6 | Official marketplace | Never added by the task: it ships with Claude Code. Its plugins appear in `--inventory` rows as `<name>@claude-plugins-official` like any other and may be chosen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | add it explicitly, as 95octane's old task did                           | U1     |
| 7 | This repo adopts     | `.config/mise/tasks/setup/ai` becomes a byte copy of the pack's; both marked positions stay as shipped (this repo requires `vwf` and `stackgen` only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | leave the 12-line pnpx task                                             | U4     |
| 8 | Versions and model   | mise pack minor (`1.1.0` → `1.2.0`), stackgen minor, vwf minor, site patch, installer none. Every unit on `opus`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | patch                                                                   | U6     |

## New dependencies

none — `claude`, `graphify` and `claude-status` are all invoked, never
installed, and were already named by the task or the installer.

## Units

| Id | Wave | Unit file                                      | Owns                                                                                                                                                                                                                      | Depends on | Status  | Commit     |
| -- | ---- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ---------- |
| U1 | 1    | [01-setup-ai-task.md](01-setup-ai-task.md)     | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/ai`                                                                                                                                       | —          | green   | `f829219a` |
| U2 | 1    | [02-mise-pack-skill.md](02-mise-pack-skill.md) | `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, `.../mise/conventions.md`                                                                                                                                     | —          | green   | `a7230e9b` |
| U3 | 1    | [03-vwf-init.md](03-vwf-init.md)               | `plugins/vwf/skills/init/**`                                                                                                                                                                                              | —          | green   | `541ce382` |
| U4 | 2    | [04-own-repo-task.md](04-own-repo-task.md)     | `.config/mise/tasks/setup/ai`                                                                                                                                                                                             | U1         | pending |            |
| U5 | 3    | [05-docs.md](05-docs.md)                       | `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `installer/CLAUDE.md`, `.claude/docs/**`, `.claude/skills/**`, `docs/memory/decisions/2026-09-12-*.md`, every `DOCS FALSIFIED:` path                                | all        | pending |            |
| U6 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md)   | `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`, `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/stacks/inventory.md`, both `plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json` | U5         | pending |            |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                      | Why it collides                            | Owner   |
| ----------------------------------------------------------------------------------------- | ------------------------------------------ | ------- |
| `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`                                | version field                              | U6 only |
| `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/stacks/inventory.md`         | pin and generated file                     | U6 only |
| both `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json` | version and generated files                | U6 only |
| `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `installer/CLAUDE.md`, `.claude/**` | human-facing docs                          | U5 only |
| `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, `conventions.md`              | the pack's doctrine, describes U1's result | U2 only |

## Waves

- **Wave 1 — U1, U2, U3.** Three disjoint trees: the task file, the pack's
  skill, vwf's init.
- **Wave 2 — U4.** Copies U1's landed bytes into this repo.
- **Wave 3 — U5.** Docs, after every `DOCS FALSIFIED:` line is in.
- **Wave 4 — U6.** Version, pin, generated files, full gate.

## Wave gate

```text
mise run p:plugins:marketplace --check
mise run p:plugins:inventory --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line must
be green before wave 1. The two `--check` lines are expected to fail between
U6's edits and its regeneration only.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                             |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into this machine's dev marketplace under `X.Y.Z+N` and updates the local install; reaches nothing beyond this machine; loaded by a **restarted** session |
| `/release`                 | ask  | cuts `stackgen-v1.8.0`, `vwf-v19.17.0` and `site-v<patched>`; stops once and asks first                                                                                           |

## Gates the orchestrator keeps

**Two hermetic runs of the landed task**, after wave 1 and again before landing.
Each under `export CLAUDE_CONFIG_DIR=$(mktemp -d)` (the standing memory rule),
in a scratch repo that holds the mise pack's `config/` payload with `REPO_NAME`,
`MERGE_MODEL`, `MEMBERS` filled and `mise trust --all` run. `PATH` must carry
`claude` and `mise` and must **not** carry `claude-status` (so the hint branch
is exercised); `graphify` may be present or not — record which.

1. **User-mode machine.** Fresh config dir. `mise run setup:ai`. **Pass:** exit
   0; `claude plugin marketplace list --json` shows `virajp-plugins` with
   `source: "github"`; the scratch repo's `.claude/settings.json` lists `vwf`
   and `stackgen` under project scope; `claude plugin list --json` shows nothing
   at user scope; the output contains the `brew install` hint line; the run
   needs network. Run it twice: the second must be a no-op that exits 0.
2. **Dev-mode machine.** Fresh config dir. First
   `claude plugin marketplace add ./.dev-marketplace` from this repo's root (the
   leading `./` is not optional), then `mise run setup:ai` from the scratch
   repo. **Pass:** exit 0; the marketplace's source is still `"directory"`; no
   `marketplace add` for `virajp/claude-plugins` was attempted (the output must
   not contain "network source differs"); project-scope `vwf` and `stackgen`
   entries exist with a `+N` version.
3. **`--inventory`.** In run 2's config dir, `mise run setup:ai --inventory`
   prints zero marketplace rows (only `virajp-plugins` is registered there) and
   the installed-plugin rows, nothing else on stdout, exit 0.
4. Remove both temp dirs.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

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

- **The installer CLI** — untouched. It remains the user-facing one-shot
  (memory: "CLI plugin installs are core purpose"); the task simply stops
  depending on it.
- **`--statusline` in any form** — the statusline is a per-machine Homebrew
  package; the task hints, nothing installs it.
- **A user-scope mode beyond the `--user` flag** — the user's ruling is project
  scope with rare exceptions; the flag is the exception.

## Parked

- **A diverged `setup/ai` on a brownfield repo** — `init`'s existing-repo pass
  treats a pack file that differs from the pack's as "already owned, never
  overwritten" (`existing-repo.md:149-153`), so 95octane's old task with its
  dead `@askviraj/ai-plugins` line would survive a reshape. Plan 3
  (`init-brownfield`) decides how a diverged pack task is reconciled and how its
  marked positions are re-derived.
- **The installer skips registration by name only** (`install.ts:145-152`). It
  could read the source and warn when the registered one differs. Optional,
  installer-only, not this plan's.
- **Corporate npm cache replaying a stale installer** — moot for the task once
  it runs no `pnpx`; still bites the installer itself.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Commit                                                      |
| ---- | --------- | ----- | ----- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 0    | preflight | —     | —     | green       | all nine wave-gate lines green on the inherited branch                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                           |
| 1    | U3        | opus  | 1     | green       | question 5 = required plugins seeded by setup:ai --inventory, licence/security renumbered 6/7; also edited readme-and-license.md (in Owns); DOCS FALSIFIED: CLAUDE.md:245, .claude/skills/vwf-plugin/SKILL.md:74, site how-to/greenfield/single-repo.md:67 (six→seven questions); GAP: no report-block section for the plugin answer — empty inventory announces itself in the question                                                                                                                   | `541ce382`                                                  |
| 1    | U2        | opus  | 1     | green       | task-library.md row + new setup:ai section, config-files.md marked-position passage, SKILL.md §2 bullet, conventions.md paragraph; pack prose names no tool; GAP: documented flags/row shapes from the plan before U1 landed — needs a reconciling pass if U1 renamed anything; GAP: inventory rows carry                                                                                                                                                                                                 | scope, marked-position rows do not — assumed intended split |
| 1    | U1        | opus  | 1     | green       | task rewritten: no pnpx, project scope + --user, --inventory, check-then-update-else-add, single-scope autoremove, graphify wiring, statusline hint; jq not node; no -y on install; cd to MISE_PROJECT_ROOT first; source-ref = .repo // .path // .source; DOCS FALSIFIED: site plugins/stackgen.md:592-594 (incomplete), CLAUDE.md installer sections; GAP: inventory lists vwf/stackgen rows too — deduped against required set; GAP: graphify-absent branch not exercised (mise shim keeps it on PATH) | `f829219a`                                                  |
| 1    | R1        | opus  | 1     | findings(4) | site plugins/vwf.md:867 [U3] r5 six→seven not reported → DOCS FALSIFIED handed to U5 (in its Owns); task-library.md:357 [U2] r2 folds EXTRA_MARKETPLACES into the required plugin set → loop to U2; readme-and-license.md [U3] r1 outside unit-file list but inside index.md Owns init/** → ruled clean, index.md governs; setup/ai:56,63 [U1] r3 jq pinned dev-layer only — unit file sanctioned it, non-blocking, noted                                                                                 | —                                                           |
| 1    | U2        | opus  | 2     | green       | task-library.md:357 fixed — required set is vwf + EXTRA_PLUGINS rows alone, EXTRA_MARKETPLACES registered never installed; all four files reconciled against U1's landed file, nothing else needed; round-1 GAP closed                                                                                                                                                                                                                                                                                    | `a7230e9b`                                                  |
| 1    | R1        | opus  | 2     | findings(1) | round-1 finding cleared; U2's four files match the landed task exactly; CONTRACT clean, RULINGS clean; residual: task-library.md:268 [U2] r3 nit — setup:all tree line keeps pre-change comment, not falsified, not in unit file → contested (cap reached)                                                                                                                                                                                                                                                | —                                                           |
| 1    | gate      | —     | —     | green       | all nine wave-gate lines green after review round 2; U1 f829219a, U2 a7230e9b, U3 541ce382 committed                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                           |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-12-setup-ai
