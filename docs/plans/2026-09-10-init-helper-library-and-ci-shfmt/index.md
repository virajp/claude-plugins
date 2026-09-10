---
type: vwf-change-plan
title: init replaces a diverged helper library by the pack's table, and CI
  resolves shfmt
requires: []
---

# Plan — init helper library and CI shfmt (2026-09-10)

## Status

**RUNNING** since 2026-09-10 — worktree
`.worktrees/init-helper-library-and-ci-shfmt`, branch
`init-helper-library-and-ci-shfmt`.

Previously **APPROVED** 2026-09-10 by the user, after the shape gate, one
revision (this repo's task library left to the reshape run) and the
post-self-review yes.

## Consent

| Action                                            | Granted                                                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                          |
| After landing: `mise run plugins:local`           | run                                                                                                          |
| Release `vwf` publicly                            | none — not this time; the change ships when a later plan bumps `plugins/vwf/.claude-plugin/plugin.json`      |
| Release `stackgen` publicly                       | none — not this time; the change ships when a later plan bumps `plugins/stackgen/.claude-plugin/plugin.json` |
| Release installer publicly                        | none                                                                                                         |
| Release site publicly                             | none                                                                                                         |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, `/vwf:init`'s existing-repo pass, on finding a repo whose
`_scripts/helpers` differs from the pack's, plans a **replace** of that file
with the pack's and a **rewrite** of every repo-owned call to a retired print
name, each mapped by a legacy table the mise pack owns, so a reshape can no
longer leave a task library in which pack-authored scripts call functions the
kept library never defined. A call to a name with no row is flagged and never
rewritten, exactly as the shebang pass already does. The Plugins workflow is
green on `develop` and `main` because `mise.ci.toml` declares the two tools
`plugins:shellcheck` runs.

**This repo's own task library is not repaired here.** The user's
`/vwf:setup reshape` run on this checkout, after `plugins:local` has staged the
two plugins and a session has restarted, is both the repair and the acceptance
test of the fix. This is the user's word: *"I don't want the plan to fix this
repo's mise tasks. Just fix the `init` and I will test it on this repo."*

**One reversal, named.** Init today holds two rules the ruling overturns for the
helper library alone: a pack-owned file the repo already has is *already owned*
and never overwritten — the adapter's re-sync command shows the diff and takes
its own consent (`existing-repo.md:115-119`); and a file the survey flags is
*flagged for rewrite and never rewritten* (`:92-100`, the shebang pass). The
user, on 2026-09-10: *"You should replace the helper with the one shipped with
`init` and update all the existing tasks to use the new helper and make repo
compatible with `init`."* Confirmed as a reversal, bounded by the mapping table
(decision 3). The docs unit writes the decisions doc.

The defect this closes was produced by the 2026-09-09 `/vwf:setup reshape` on
this repo (commit `47af40c0`): pass 5 renamed `_scripts/_helpers` to `helpers`
with content kept, pass 6 created the pack's `_scripts/merge`,
`_scripts/checks`, `_scripts/placeholder` and `setup/default-branch` byte for
byte, and the result was `code:merge:*` and `setup:default-branch` dying on
`print_wait: command not found`. The approved plan
`docs/plans/2026-09-10-repo-task-groups-and-editor-block/` lists "a
`code:merge:*` change — created on 2026-09-09; correct" as out of scope; that
fact was false and is not that plan's to fix.

## Facts the survey established

**The two helper libraries.** The repo's `.config/mise/tasks/_scripts/helpers`
defines sixteen printers from `:23` plus `line_sep` at `:119`: `print_header`,
`print_header_wait`, `print_subheader`, `print_subheader_wait`, `print_green`,
`print_green_wait`, `print_yellow`, `print_yellow_wait`, `print_red`,
`print_red_wait`, `print_normal`, `print_normal_wait`, `print_newline`,
`print_warn`, `print_error`, `print_success`. The pack payload
`plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/_scripts/helpers`
defines `line_sep` at `:37` and nine printers at `:58-79`: `print_header`,
`print_subheader`, `print_success`, `print_ok`, `print_wait`, `print_warn`,
`print_yellow`, `print_newline`, `print_error`. Seven names are common; the
repo's nine extra are the retired vocabulary; the pack's two extra (`print_ok`,
`print_wait`) are what the pack's scripts call. `helpers.mjs` already matches
the pack.

**Callers in this repo** (context for the user's reshape run, not this plan's
edits): `_scripts/merge` calls `print_wait` at
`:49,156,164,177,191,200,210,
222,232,242,244` and `print_ok` at
`:79,162,170,185,197,206,217,230,238,251`; `setup/default-branch` calls
`print_wait` at `:47`, `print_ok` at `:56,62`, and defines `print_the_commands`
locally at `:35`. The only live calls to retired names are `print_normal_wait`
at `code/git-config:10,25`, `print_normal` at `code/git-config:22`,
`plugins/local:55,117`, `plugins/release:104`. `code/worktrees` defines
`print_repo` locally at `:58`. The other seven retired names are defined and
never called. Grepped across `.config/`, `.claude/`, `installer/`, `scripts/`,
`site/`, `plugins/`, `docs/`, `sunset/`, `readme.md` and `CLAUDE.md`: **no prose
mentions any retired name**; every hit is code under `.config/mise/tasks/`.

**The pack's authority.** The print vocabulary is
`plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
heading `:88`, table `:93-105`, notes to `:114` — exactly the pack's ten (nine
printers plus `line_sep`). The legacy-names table is `:505-529`, rows
`:514-524`, with `_scripts/_helpers → _scripts/helpers` at `:523` and `_checks`
at `:524`; its preamble says `/vwf:init` reads the table, and rows apply top to
bottom. `:82-86` says a repo growing its own library adds a sibling file, never
a `helpers/` directory, and says nothing about a diverged `helpers` or migrating
one. No pack task file calls a name the pack's helpers lacks. Nine packs ship
task trees under `config/.config/mise/tasks/`: `toolchain-manager/mise`,
`package-manager/{pnpm,uv}`, `app-framework/flutter`,
`toolchain-gate/{eslint,ruff}`, `capability-provider/{doppler,fnox}`,
`cloud-service/{containers,workers-ssr,workers-static-assets}`.

**Init's existing-repo pipeline.**
`plugins/vwf/skills/init/references/existing-repo.md:14` says "Ten passes". Pass
4 (shebangs) `:92-100`: *flagged for rewrite and never rewritten*, report the
file and the constructs. Pass 5 (the helper library) `:101-107`: two renames —
the file and every `source` line — and nothing about content. Pass 6 (missing
files) `:109-119`; the *already owned* paragraph `:115-119` names the adapter's
re-sync command as user-run by design. The readme conflict `:71-74` is the
wording precedent for "reported for the user rather than resolved here". The
Plan section `:231-256`: one document, six counted sections, `old → new` /
`+ path` / bare-path-with-reason line forms, the move-and-shim sub-line rule
`:238-243`, the count block `:245-252` (`Moves`, `Creates`, `Renames`,
`Rewrites (flagged, not applied)`, `Appends`, `Merges`), a single total, and the
zero-total idempotent case. The Report section `:332-349`: deferred
materializations, flagged rewrites and unmoved root files go in **Deferred**
with their unlock; the invariant is an empty plan on a second run for the same
id source. `plugins/vwf/skills/init/SKILL.md`: hard rules `:74-84` (idempotent;
a decline is a deferral, never a halt); the pipelines table `:192-200` names
files, not passes; the report block `:218-236` has six file sections plus git
(`Files written`, `Files moved`, `Tasks renamed`, `Sections appended`,
`Fragments merged`, `Deferred`).

**The sync command.** `/stackgen:stackgen-sync`, no arguments;
`plugins/stackgen/skills/stackgen-sync/SKILL.md:1-24`,
`disable-model-invocation: true` at `:11`. It diffs materialized entries against
`.claude/stackgen/lock.yaml`; **this repo has no such lockfile**, so the command
has nothing to diff here (its `/vwf:setup` proper is "not yet applicable", per
the user on 2026-09-09).

**CI shfmt.** Red since 2026-09-05: last green `develop` run 33960130467, first
red 33965160155 on merge `eb14138f`; `main` red from 33967423257. The step was
added in `ba9c2eb8`. `.github/workflows/plugins.yml:65-67` runs
`mise x shellcheck@latest shfmt@latest -- mise run plugins:shellcheck` under
`MISE_ENV: ci` (`:34`), tools installed by `jdx/mise-action@v4` at `:43-44` from
the config set, shims on PATH. `mise x` installs shfmt 3.14.1, but the **inner
`mise run` rebuilds PATH from the config-resolved toolset** and drops the ad-hoc
install; `shfmt` then hits the shim, which has no version under `MISE_ENV=ci` —
`No version is set for shim: shfmt`. `shellcheck` survives only because
ubuntu-24.04 ships `/usr/bin/shellcheck`. Declarations: `shfmt` at
`.config/mise.dev.toml:31`, `shellcheck` `:30`, `actionlint` `:29`, all
`{ version = "latest" }`; `.config/mise.toml:17-20` holds node, osv-scanner,
pnpm; `.config/mise.ci.toml` has `node.gpg_verify = false` at `:13` and an empty
`[tools]` at `:15`, the file ending there, untouched since `4a6c58bc`
(2026-06-21). No `mise.lock`. The task `.config/mise/tasks/plugins/shellcheck`
calls bare `shfmt -d` at `:133,166`; its `command -v` guard at `:59-66` is
satisfied by the shim. `site.yml:47,60,93`, `release.yml:40,58`,
`deps-update.yml:32,48` set the same env with the same action and never call
shfmt. Pre-commit runs the task at `.config/pre-commit-config.yaml:68-73` under
the dev env, green locally.

**The approved plan this one runs before.**
`docs/plans/2026-09-10-repo-task-groups-and-editor-block/` (APPROVED, not run)
owns `.config/mise/tasks/{i,plugins,site}/**` (renamed to `p/…`),
`code/git-config`, `code/count`, `code/all` (zsh → bash),
`.config/pre-commit-config.yaml`, all four workflows, `.config/mise.toml`,
`.config/mise.dev.toml`, `.gitignore`. This plan touches **none** of those;
`.config/mise.ci.toml` is outside its Owns. Its cited lines therefore hold after
this plan lands.

**Docs that describe today's behaviour.**
`site/src/content/docs/plugins/vwf.md:879-908` — the existing-repo paragraph:
"walks ten checks", "the helper library's shape" at `:881`, the six counted
sections at `:899-901`, "`Rewrites (flagged, not applied)`, which is applied by
nothing" at `:901-902`; the readme conflict `:909-915`; the report enumeration
`:950-955`; the shared helper library in the shape section `:817`.
`site/src/content/docs/plugins/stackgen.md:700-706` — the manual's copy of the
legacy table (`:706` folds `_helpers` and `_checks` into one row);
`:446-469,505` — the mise environment split, mirroring the CI doc.
`.claude/docs/ci-and-releases.md:10-16` — shellcheck and shfmt are dev-only,
"which is why `plugins.yml` runs that task under
`mise x shellcheck@latest shfmt@latest` rather than relying on the runner".
`site/src/content/docs/how-to/brownfield/onboard-existing-codebase.md:82-91`,
`migrate-old-vwf-repo.md:122`, `readme.md:111-113`, `CLAUDE.md:230,359`,
`.claude/skills/vwf-plugin/SKILL.md:65,84,164` and
`references/skills-and-agents.md:22` summarise init without a pass list —
expected untouched. The decisions doc format is
`${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (vwf).

**Gates.** `plugins:check` (thirteen rules incl. strict-YAML frontmatter and
`claude plugin validate --strict`), `plugins:marketplace --check`,
`plugins:inventory --check`, `plugins:npm-normalize-test`, `pnpm vitest run`,
`tsc -p installer`, `tsc -p scripts`, `site:check`. `plugins/**/*.md` is not
dprint-formatted — fold width matched by hand; `.config/*.toml` is taplo's via
the formatter hook; `CLAUDE.md`, `readme.md`, `.claude/**`,
`site/src/content/docs/**` and `docs/**` are dprint's. Commit convention:
`.config/git-conventional-commits.yaml` allows exactly
`ops, docs, merge, feat,
fix, refactor`; scopes unconstrained.

**Versions.** vwf 19.14.1 (`plugins/vwf/.claude-plugin/plugin.json:4`, pinned
`vwf-v19.14.1` at `.claude-plugin/marketplace.json:54`); stackgen 1.6.0 (pinned
`stackgen-v1.6.0` at `:22`). Both tags exist since 2026-09-10.

## Assumed decisions — confirm or override at review

| # | Decision                   | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Rejected                                                                                                                                                                    | Unit |
| - | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1 | CI shfmt                   | **Declare both in `mise.ci.toml`.** `shfmt` and `shellcheck` are added to `.config/mise.ci.toml`'s `[tools]`, spelled exactly as `mise.dev.toml:30-31` spells them (`{ version = "latest" }`). No workflow file changes; the now-redundant `mise x …` wrapper in `plugins.yml:65-67` stays for the task-groups plan to drop when it rewrites that line. This reverses the CI doc's rationale at `ci-and-releases.md:10-16`, which the docs unit rewrites.                                                                                                                                                                                                                                                                                                                                              | flatten the nesting in `plugins.yml` (touches a line the task-groups plan rewrites); move both to base `mise.toml` (touches two files that plan owns)                       | U1   |
| 2 | The mapping                | **Nine rows in the pack's legacy table**, applied by init: `print_normal` → `print_yellow`; `print_normal_wait` → `print_wait`; `print_green` → `print_success`; `print_green_wait` → `print_wait`; `print_yellow_wait` → `print_wait`; `print_red` → `print_error` (a red line moves to stderr — say so in the row's reason); `print_red_wait` → `print_wait`; `print_header_wait` → `print_header`; `print_subheader_wait` → `print_subheader`. `print_header`, `print_subheader`, `print_yellow`, `print_newline`, `print_warn`, `print_error`, `print_success` are unchanged and get no row. The mapping is a pack fact, so vwf's prose names no function.                                                                                                                                         | `print_red` → `print_warn` (keeps stdout, loses red); only the three names live in this repo (every other reshaped repo would flag on names this one happens not to use)    | U2   |
| 3 | Init pass 5                | **Replace, then rewrite by the table.** Pass 5 keeps its two renames, then compares the repo's `_scripts/helpers` to the pack's byte for byte. When they differ the plan carries one **replace** row (the pack's file lands over the kept one, on the same consent — its retired names listed as sub-lines) and one **rewrite** row per call site of a retired name in a repo-owned task, each `old → new` by the pack's legacy table. A call to a retired name the table has no row for is **flagged and never rewritten**, listed with its file and line, and lands in Deferred with the unlock "add the row to the pack's legacy table, or rewrite the call by hand". A pack-owned task file the repo already carries byte-identical, and every file pass 6 creates, are unaffected by the rewrite. | defer the dependent creates behind a reported conflict; let init pick the nearest function itself (the auto-translation the shebang rule forbids); create anyway and report | U3   |
| 4 | Pass count                 | **Ten stays ten.** The comparison and the rewrite are pass 5's content, not a new pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | an eleventh pass (falsifies "ten" in `existing-repo.md:14` and `vwf.md:880`)                                                                                                | U3   |
| 5 | The count block and report | The plan's count block gains two lines, `Replaces <n>` and `Rewrites (applied) <n>`, beside the existing `Rewrites (flagged, not applied)`; the report in `SKILL.md:218-236` gains `Files replaced` and `Calls rewritten` lines in the same position, each printed as `none` when empty, and a flagged call goes to `Deferred`. Idempotence holds: after the replace, a second run finds the file identical and the plan carries no row.                                                                                                                                                                                                                                                                                                                                                               | overloading the flagged line; counting replaces as creates                                                                                                                  | U3   |
| 6 | Gate delta                 | **None.** A repo does not carry a guard for its tooling's bug; the fix is in the skill. The user: *"It's stupid to do such checks. This is a bug that was not suppose to come up in the first place, it's a bug in `init` skill, not the repo."*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | a third pass in `plugins:shellcheck` asserting every `print_*` a task calls is defined                                                                                      | —    |
| 7 | The manual's legacy table  | The docs unit adds the nine print rows to the manual's copy of the table (`stackgen.md:700-706`) and splits its folded `_helpers, _checks` row into the pack's two, so the manual mirrors the pack.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | a prose sentence pointing at the pack file                                                                                                                                  | U4   |

## New dependencies

none

## Units

| Id | Wave | Unit file                                              | Owns                                                                                                                                                                                                                                   | Depends on | Status  | Commit   |
| -- | ---- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-ci-tools.md](01-ci-tools.md)                       | `.config/mise.ci.toml`                                                                                                                                                                                                                 | —          | green   | 66060fc4 |
| U2 | 1    | [02-pack-legacy-table.md](02-pack-legacy-table.md)     | `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`                                                                                                                                                | —          | green   | f724c2d4 |
| U3 | 1    | [03-init-helper-library.md](03-init-helper-library.md) | `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/skills/init/SKILL.md`                                                                                                                                              | —          | green   | 696c3094 |
| U4 | 2    | [04-docs.md](04-docs.md)                               | `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/**`, `readme.md`, `CLAUDE.md`, `docs/memory/decisions/**`, plus (widened at run time by R1 rule 5) the one passage `plugins/vwf/skills/init/references/new-repo.md:361` | U1–U3      | green   | 4ffbb959 |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md)           | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` — no diff expected in any                                           | U4         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                    | Why it collides                                       | Owner   |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json` | the versions (unchanged this plan)                    | U5 only |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`               | generated                                             | U5 only |
| `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/**`, `docs/memory/**`    | docs                                                  | U4 only |
| `plugins/vwf/skills/init/SKILL.md`                                                      | the report block (decision 5) and the pipelines table | U3 only |

## Waves

- **Wave 1 — U1, U2, U3.** One mise config file, one stackgen pack reference,
  one vwf skill tree; disjoint paths, no dependency between them. U3 cites the
  table U2 writes by its heading, not its rows, so neither reads the other's
  edit.
- **Wave 2 — U4**, the docs unit, over wave 1's delta.
- **Wave 3 — U5**, the gates unit; no bump, generators expected to be no-ops.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `mise run plugins:npm-normalize-test`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer`,
`pnpm exec tsc --noEmit -p scripts`, `mise run site:check` — plus the wave
review, plus every report read for `UNRESOLVED:`. Every line here is green on
`develop` today; the plan adds no gate line, and the checks that hold only once
a unit lands sit in that unit's Verification and are repeated in U5's.

## After landing

| Step                     | Mode | Notes                                                                                                                                                                                                                            |
| ------------------------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run plugins:local` | run  | stages stackgen and vwf into the dev marketplace under `+N` and updates this machine's install; publishes nothing; a **restarted** session picks them up. The user's `/vwf:setup reshape` on this repo comes after that restart. |

## Gates the orchestrator keeps

- **The CI replica.** From the worktree root, after wave 1:
  `MISE_ENV=ci mise x shellcheck@latest shfmt@latest -- mise run plugins:shellcheck`
  exits 0 — the exact nesting `plugins.yml:65-67` runs, which fails on `develop`
  today with `No version is set for shim: shfmt`. Repeated after every wave.
- No `target-verifier` run: no manifest, skill list, agent or frontmatter
  changes.
- Init's behaviour is **not** proven by this run. Its proof is the user's
  `/vwf:setup reshape` on this repo after landing, which must plan one replace
  of `_scripts/helpers` and six rewrites (`code/git-config:10,22,25`,
  `plugins/local:55,117`, `plugins/release:104`), and after which
  `mise run code:merge:develop` and `mise run setup:default-branch` no longer
  die on `print_wait`.

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

- **This repo's `.config/mise/tasks/**`** — the helper library, its six
  retired-name call sites, `_scripts/merge`, `setup/default-branch`. The user's
  word; the reshape run does it, and is the test.
- **A repo-side check** that every `print_*` a task calls is defined —
  decision 6.
- **`.github/workflows/*`, `.config/mise.toml`, `.config/mise.dev.toml`,
  `.config/pre-commit-config.yaml`** — the task-groups plan's Owns.
- **The pack's `helpers` payload itself** — correct; only its reference gains
  rows.
- **Any other stackgen pack** — the nine task-shipping packs are clean.

## Parked

- **Adopt the gate pack's `shellcheck` and `shfmt` hooks in this repo's
  pre-commit config.** The pack's `pre-commit-config.yaml:137-156` runs both
  with `types: [shell]` for every target repo; this repo's own config never got
  them, so `.config/mise/tasks/` has no shell gate here. Probed 2026-09-10: 15
  shellcheck findings across `code/format`, `_scripts/helpers`, `code/lint`,
  `plugins/npm-normalize-test`, `code/sec`; shfmt would rewrite
  `plugins/npm-normalize-test`, `plugins/local`, `setup/mise`, `code/worktrees`,
  `site/icons`; and the three zsh files shellcheck rejects are the task-groups
  plan's U2. Its own plan, after task-groups lands.
- **The `mise x shellcheck@latest shfmt@latest` wrapper in `plugins.yml:65-67`**
  is redundant once U1 lands; the task-groups plan rewrites that line for the
  `p:plugins:shellcheck` rename and can drop it.
- **The task-groups plan's Out of scope** calls the `code:merge:*` files
  "created on 2026-09-09; correct". This plan runs first and the user's reshape
  repairs the library, so the line is true by the time that plan runs; no edit.
- **This repo has no `.claude/stackgen/lock.yaml`**, so
  `/stackgen:stackgen-sync` has nothing to diff here; init's *already owned*
  pointer at the sync command is empty advice on a repo whose `/vwf:setup`
  proper has not run. Not this plan's; note for the plan that runs setup here.
- **`stackgen.md:706` folds `_helpers` and `_checks` into one legacy row** — the
  docs unit splits it in passing (decision 7); noted so the split is not read as
  scope creep.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Commit   |
| ---- | --------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green       | all eight wave-gate lines green on the branch point: check, marketplace --check, inventory --check, npm-normalize-test, vitest (288), tsc ×2, site:check                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | U1        | opus  | 1     | green       | DECIDED: file header sentence repaired (own edit falsified it); comment folded over three lines. GAP: unit's taplo line omits `--config .config/taplo.toml` — assumed the dprint.json:22 form, exits 0. DOCS FALSIFIED: ci-and-releases.md:10-16 (already U4's). CI replica exits 0 in ci env                                                                                                                                                                                                                                                                                                                                                | 66060fc4 |
| 1    | U2        | opus  | 1     | green       | nine rows + preamble sentence + diverged-helpers-not-a-sibling sentence. DECIDED: reason wording, ruling's row order, padding matched by hand. GAP: unit's `grep -c` counts 18 not 9 (vocabulary table matches too) — assumed "nine new". GAP: awk 80-col line cannot exclude table rows — fold rule read as prose-only. DOCS FALSIFIED: stackgen.md:700-706 (U4's, decision 7)                                                                                                                                                                                                                                                              | f724c2d4 |
| 1    | U3        | opus  | 1     | green       | existing-repo.md pass 5 compare/replace/rewrite/flag, pass 4 exception clause, pass 6 already-owned exception, Plan eight sections, Report Deferred; SKILL.md report block gains Files replaced / Calls rewritten. DECIDED: "table says so in its own rows" not "last row" (U2 appends rows); "eight-section report"; cites the pack table by heading only. GAP: report line columns aligned to the block, bare path for a replace. DOCS FALSIFIED: vwf.md:881, :899-902, :950-955 (U4's)                                                                                                                                                    | 696c3094 |
| 1    | R1        | opus  | 1     | findings(4) | CONTRACT clean, RULINGS clean. (a) ci-and-releases.md:122 wrapper rationale now false → U4; (b) ci-and-releases.md:23 + stackgen.md:450 "don't duplicate across dev/ci" contradicted by decision 1's deliberate duplication → U4; (c) plugins/vwf/skills/init/references/new-repo.md:361 "six-section report" falsified by SKILL.md's eight — nobody-owned, rule 5 → GAP: U4's Owns widened to that passage; (d) SKILL.md:81 fold orphan → U3 round 2                                                                                                                                                                                        | —        |
| 1    | U3        | opus  | 2     | green       | idempotence bullet re-folded, no words changed; checker green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 696c3094 |
| 1    | R1        | opus  | 2     | pass        | 0 findings; re-fold byte-identical in words; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 1    | gate      | —     | 1     | green       | all eight wave-gate lines green; CI replica `MISE_ENV=ci mise x shellcheck@latest shfmt@latest -- mise run plugins:shellcheck` exits 0 (60 files clean); check + replica re-run green after the round-2 re-fold                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 2    | U4        | opus  | 1     | green       | docs-sync standalone over 321c8a3b..HEAD → same set as handed, no extras, BROAD DRIFT none. ci-and-releases.md (dev/ci bullets, wrapper-redundant paragraph, :121, duplication rule keeps wording + names the owned exception); stackgen.md (nine rows, split row, replace/rewrite paragraph); vwf.md (:881, eight sections, helper-library exception paragraph, report enumeration); new-repo.md:361 (widened passage only); decisions doc written. GAP: stackgen.md:450 left alone — verbatim mirror of pack doctrine (SKILL.md:45-49, payload mise.toml:14), outside Owns; the exception is named in the CI doc where the deviation lives | —        |
| 2    | R2        | opus  | 1     | findings(1) | CONTRACT clean, RULINGS clean. stackgen.md:709 legacy row `setup:deps:{start,stop,pull,update}` does not mirror the pack's `{start,stop,pull}` (pre-existing; U4's under decision 7) → U4 round 2. stackgen.md:450 judged still true as a pack-shaped rule; exception named in the CI doc is correct                                                                                                                                                                                                                                                                                                                                         | —        |
| 2    | U4        | opus  | 2     | green       | one-token row fix, mirrors task-library.md; dprint no change; site:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 2    | R2        | opus  | 2     | pass        | 0 findings; manual legacy table row-for-row identical to the pack's (18 rows); CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 2    | gate      | —     | 1     | green       | all eight wave-gate lines green; CI replica exits 0; site:check re-run green after the round-2 row fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-10-init-helper-library-and-ci-shfmt
