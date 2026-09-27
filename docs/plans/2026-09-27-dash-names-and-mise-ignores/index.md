---
type: vwf-change-plan
title: dash names and mise ignores — a pre-commit block for dash-named paths,
  a pinned sort-package-json, and mise local files ignored by name
requires: [ docs/plans/2026-09-26-init-commits-the-lock ]
backlog: [ B71, B73 ]
backlog_pieces: []
---

# Plan — dash names and mise ignores (2026-09-27)

## Status

**RUNNING**

RUNNING since 2026-09-28 in .worktrees/2026-09-27-dash-names-and-mise-ignores

## Consent

| Action                                            | Granted                                                                                                                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                               |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                                               |
| Release stackgen publicly                         | patch if `stackgen-v2.0.0` is tagged when the run starts (`2.0.0` → `2.0.1`, by editing `plugins/stackgen/.claude-plugin/plugin.json`), else none — rides the unreleased `2.0.0`; no release step |
| Release site publicly                             | none — not this time; the manual edits ride the site's next release                                                                                                                               |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, three things hold in every repo stackgen shapes. A commit that
stages any path whose file or folder name begins with `-` is refused by a
pre-commit hook, with a message, before any formatter or linter reads the name
as an option. The pnpm pack's `code:format` runs a mise-pinned, dev-only
sort-package-json instead of an unpinned `pnpm dlx` fetch. And the `git` tool's
`.gitignore` ignores mise's machine-local files by file name, so the local lock
mise really writes, `.config/mise.local.lock`, is ignored.

Framing: B71 asked for every code task to hand its tools `./`-prefixed paths. A
`find ~/Projects` on the maintainer's machine found **zero** files or folders
named with a leading dash, `node_modules` included; the only one ever seen was
gate-hardening's made-up `-x.sh` repro. The user ruled that handling such names
in twelve scripts is over-engineering: refuse them at the commit instead, and
leave the scripts alone.

**Reversal:** `docs/plans/2026-09-26-mise-conf-d-layout` replaced the any-depth
`mise.local.lock` pattern with hardcoded `.config/...` paths (recorded at
`docs/memory/decisions/2026-09-26-mise-conf-d-layout.md:15`), and one of those
paths was wrong. This plan goes back to bare file names, which match at any
depth, and spells out only the two paths no bare name can match. Confirmed by
the user; U3 writes the decision memo that supersedes that line.

## Facts the survey established

- **Where things live after the chain lands.** This plan requires
  `2026-09-26-init-commits-the-lock`, which requires
  `2026-09-26-tool-config-hygiene`. Hygiene deletes the whole `repo-hygiene`
  pack (its unit U7) and moves its `.gitignore` sections, verbatim, into a new
  `git` tool asset: `plugins/stackgen/skills/tool-config/assets/git/.gitignore`,
  one `# >>> git` … `# <<< git` block whose entries keep their written order.
  The mise section sits inside that block (worktree copy at `:32-40`). By the
  time this plan runs, that file exists on `develop` and
  `plugins/stackgen/stacks/repo-hygiene/` does not.
- **The mise section today** holds `.config/mise.local.toml`,
  `.config/mise.*.local.toml`, `.config/mise/config.*.local.toml`,
  `.config/mise/conf.d/*.local.toml` and `.config/mise/mise.local.lock`. mise
  writes the local lock beside `.config/mise.local.toml`, at
  `.config/mise.local.lock` — reproduced in the conf-d-layout review — so the
  real local lock is not ignored. Also, `config.*.local.toml` needs two dots and
  so misses plain `.config/mise/config.local.toml`, which mise loads.
- **What bare names cover.** A `.gitignore` pattern with no slash matches a file
  name at any depth. `mise.local.toml`, `mise.*.local.toml`, `mise.local.lock`,
  `mise.*.local.lock` cover every `.config/mise*.local.*` and root variant. They
  do **not** cover `.config/mise/conf.d/*.local.toml` (names like
  `tools.local.toml`) or `.config/mise/config*.local.toml` — those two stay
  spelled out. `config.local.toml` is never made a bare name: too generic.
- **The no-doubling rule** (hygiene decision 7, `references/git.md`) compares
  patterns after stripping a leading and trailing `/` and ignoring a `**/`
  prefix. It does not equate `mise.local.toml` with `.config/mise.local.toml`,
  so a repo that already carries the old lines also gains the bare ones —
  harmless. Changing the asset changes what the `git` block should hold, so an
  already-landed repo sees its block as drifted and takes the new content on its
  next sync; that is the intended path.
- **The pre-commit asset.**
  `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/pre-commit-config.yaml`
  has one `repo: local` block (`:64`) holding `git-config`, `format`, `lint`,
  `sec` and (until hygiene moves it) `graphify-refresh`, then the
  `pre-commit-hooks` repo (`:131`, including `check-illegal-windows-names` and
  `check-case-conflict`) and `git-conventional-commits` (`:207`). Its global
  `exclude:` (`:55`) already skips `.config/mise/locks/`. The `format` and
  `lint` hooks call `mise x -- mise run code:<task> --fix` with
  `pass_filenames: true`. The asset is documented in `references/pre-commit.md`.
- **Why dash names break the gates.** Tools read an argument beginning with `-`
  as an option: `shfmt -w -x.sh` exits 2 ("flag provided but not defined"). Only
  dprint is protected today (gate-hardening ruling B3, six `code/format`
  copies). mise itself passes `-x.sh` through to a task's `usage_files`
  unchanged (probed, mise 2026.9.14). `pre-commit run --files -x.sh` dies in
  pre-commit's argparse; `--files -- -x.sh` parses.
- **pre-commit's `language: fail`** is a built-in hook language: the hook fails
  whenever any file matches its `files:` regex, printing its `entry` as the
  message. No script, no dependency.
- **sort-package-json today.** Invoked in exactly one shipped place:
  `plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/code/format:105`,
  as `pnpm dlx sort-package-json` with no version. Its targets come from the
  staged `package.json` names (`:36-43`), or every `package.json` outside
  `node_modules` when no files are given (`:44`). No bun or npm pack exists;
  pnpm is the only pack that calls it. Prose naming it:
  `stacks/package-manager/pnpm/conventions.md:49`.
- **How a pack pins a tool.** A `tool-config:` line in its `pack.yaml`
  (`pnpm/pack.yaml:17-20` holds three today), in the form
  `mise add tool <name> <version> to <env> environment` → written to
  `conf.d/tools.<env>.toml` (`references/mise.md:374-375`). One pin per tool
  across the tools files. A task calls an npm-backend tool as
  `mise which <bin> --tool npm:<package>` (pnpm `code/lint:100`, the linter).
  Dev-only tools are guarded in the task by a `command -v shfmt` test (pnpm
  `code/format:83`), so CI and production, which do not install them, skip the
  step.
- **The mise lock sidecar** (`.config/mise/locks/`) is already excluded by
  dprint (`assets/dprint/.config/dprint.json:4`), taplo, the linter
  (`assets/pre-commit/.config/linter.yaml:50`) and pre-commit's global exclude.
- **Pack and plugin versions.** pnpm `pack.yaml` is `0.5.0` (`:4`), pinned at
  `@0.5.0` by 15 bundles (the astro-*, html, pnpm-turbo, pnpm-workspace and
  typescript-* bundles); hygiene's U7 may bump it again. stackgen is `2.0.0` in
  `plugins/stackgen/.claude-plugin/plugin.json`, unreleased — the latest tag is
  `stackgen-v1.33.0`. `plugins/stackgen/stacks/inventory.md` is generated by
  `mise run p:plugins:inventory`.
- **Gates.** `p:plugins:shellcheck` runs `shellcheck -x` and `shfmt -d` over
  every pack's task scripts and the tool-config asset trees. Nothing tests
  `.gitignore` content or hook behaviour; `scripts/src/check.ts` only allowlists
  `.gitignore` as a pack-root file.
- **Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **This repo's own copies** — `.config/mise/tasks/code/*`, `_scripts/helpers`,
  the root `.gitignore` (which has no mise section at all) — are an older
  landing and are out of scope (decision 3).
- **Docs that describe today's behaviour:**
  `site/src/content/docs/plugins/stackgen.md:315, :926, :949` (mise local
  files), wherever that page and `site/src/content/docs/how-to/**` list the
  shipped pre-commit hooks, `:282` (the swift `./`-prefix claim — still true,
  leave it), tool-config `references/git.md` (the mise-pattern prose, "every
  path mise loads a local override from"),
  `references/mise.md:39, :55, :119-123` (local-file names),
  `references/pre-commit.md` (the hook list), pnpm `conventions.md:49`. Plan
  folders and older decision memos are history and are not edited.

## Assumed decisions — confirm or override at review

| # | Decision                        | Ruling                                                                                                                                                                                                                                                                                                                                                                          | Rejected                                                                                                                             | Unit   |
| - | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 1 | One plan or two                 | One plan for B71 + B73 — two small fixes, one queue slot, one landing                                                                                                                                                                                                                                                                                                           | Two plans, each landing alone                                                                                                        | all    |
| 2 | Finishes or a piece             | Finishes both: `backlog: [B71, B73]`                                                                                                                                                                                                                                                                                                                                            | B71 as a piece, leaving this repo's copies                                                                                           | all    |
| 3 | This repo's own copies          | Out of scope: `.config/mise/tasks/**` and the root `.gitignore` are left to the next `/vwf:setup reshape`, as gate-hardening ruling B6 left them                                                                                                                                                                                                                                | Patch them in place; add the mise section to the root `.gitignore` only                                                              | U3     |
| 4 | The mise ignore patterns        | Bare names `mise.local.toml`, `mise.*.local.toml`, `mise.local.lock`, `mise.*.local.lock`, `.mise.local.toml`, `.mise.local.lock`, plus the spelled-out `.config/mise/conf.d/*.local.toml` and `.config/mise/config*.local.toml`; every other hardcoded mise path is dropped. A reversal of conf-d-layout's hardcoded paths                                                     | Keep the hardcoded paths and fix the one wrong one; the `**/` form (identical meaning, and the no-doubling rule strips `**/` anyway) | U1, U3 |
| 5 | Dash-named paths                | Block them: a `language: fail` hook in tool-config's pre-commit asset, `files: '(^\|/)-'`, with a message telling the committer to rename. No code task script is edited                                                                                                                                                                                                        | `./`-prefix every name after the files eval; a shared `helpers` function (version-skew risk); per-tool prefixing at each call site   | U1     |
| 6 | `code:precommit`                | Left as it is — the user ruled against more than the block                                                                                                                                                                                                                                                                                                                      | A `--` between `--files` and the names                                                                                               | U1     |
| 7 | sort-package-json's pin         | A mise pin, dev environment only: `mise add tool npm:sort-package-json <version> to dev environment` in pnpm's `tool-config:` list. The task resolves it with `mise which sort-package-json --tool npm:sort-package-json` and skips the step when it is not installed, as shfmt is skipped. "I don't want pinning to be done outside any ecosystem which has upgrade mechanism" | `pnpm dlx sort-package-json@<version>`; a devDependency in the target's `package.json`; `to all environments` (it is a dev tool)     | U2     |
| 8 | Which sort-package-json version | The latest release on the npm registry when U2 runs, written as an exact version and reported in `DECIDED:`                                                                                                                                                                                                                                                                     | A version fixed at plan time                                                                                                         | U2     |
| 9 | A review row                    | None: the runnable change is one shipped shell line plus a config-only hook, covered by `p:plugins:shellcheck` and the wave review                                                                                                                                                                                                                                              | One `Kind: review` row after wave 1                                                                                                  | —      |

## New dependencies

- `npm:sort-package-json` — as a **dev-only mise pin** in target repos (via the
  pnpm pack's `tool-config:` line), replacing the unpinned `pnpm dlx` fetch that
  already used it. Added by U2. Nothing is added to this repo's own toolchain.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                              | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-tool-config.md](01-tool-config.md)       | edit | `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/pre-commit-config.yaml`, `plugins/stackgen/skills/tool-config/assets/git/.gitignore`, `plugins/stackgen/skills/tool-config/references/{git,mise,pre-commit}.md`                                                    | —          | green   | 82b9028d |
| U2 | 1    | [02-pnpm-pack.md](02-pnpm-pack.md)           | edit | `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml` (the `tool-config:` list only), `plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/code/format`, `plugins/stackgen/stacks/package-manager/pnpm/conventions.md`                                      | —          | green   | e3c85d06 |
| U3 | 2    | [03-docs.md](03-docs.md)                     | edit | `site/src/content/docs/**`, `.claude/**`, `CLAUDE.md`, `readme.md`, `docs/memory/decisions/2026-09-27-mise-local-files-ignored-by-name.md` (new), widened: `plugins/stackgen/stacks/toolchain-gate/eslint/skills/eslint/SKILL.md` (the sort-package-json passages)                | U1, U2     | green   |          |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md) | edit | `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml` (the `version:` line only), the `plugins/stackgen/stacks/*/bundles/*.md` pins of the pnpm pack, `plugins/stackgen/stacks/inventory.md`, `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | U3         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                             | Why it collides                                           | Owner                                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml`         | U2 adds a `tool-config:` line; U4 may bump `version:`     | U2 (wave 1, `tool-config:` only), U4 (wave 3, `version:` only) |
| `plugins/stackgen/.claude-plugin/plugin.json`                    | a version file                                            | U4 only                                                        |
| pnpm bundle pins, `inventory.md`, `marketplace.json`             | generated or version-derived; regenerating mid-wave races | U4 only                                                        |
| `site/**`, `CLAUDE.md`, `readme.md`, `.claude/**`, decision memo | human-facing docs                                         | U3 only                                                        |
| tool-config `references/*.md`, pnpm `conventions.md`             | shipped skill doctrine describing the owning unit's edit  | U1 (tool-config), U2 (pnpm)                                    |

## Waves

- **Wave 1 — U1, U2.** Disjoint trees: U1 edits tool-config's assets and
  references only; U2 edits the pnpm pack only. Neither reads the other's
  output.
- **Wave 2 — U3.** Runs `vwf:docs-sync` over the branch delta after both edits
  have landed, so its scope is complete; writes the decision memo.
- **Wave 3 — U4.** Bumps what the consent block names, regenerates, passes the
  full gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1 — a check that holds only once a unit has landed
belongs in that unit's **Verification**, not here.

## After landing

| Step                       | Mode | Notes                                                                      |
| -------------------------- | ---- | -------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen on this machine; picked up by a **restarted** session only |

## Gates the orchestrator keeps

Both run after wave 1, in one scratch repo under `mktemp -d` (`git init`, `HOME`
pointed inside it so no global config or hook leaks in):

1. **The dash-name block.** Copy U1's
   `assets/pre-commit/.config/pre-commit-config.yaml` in, reduced to the new
   hook alone (the other hooks need a shaped repo), and run it with
   `pre-commit run --config <file> --files <names>` — or stage the files and run
   `pre-commit run --config <file>`. **Pass:** staging `-x.sh` fails and prints
   the hook's message; staging `sub/-y.md` fails; staging `x.sh` and
   `a-b/c-d.md` passes.
2. **The ignore matrix.** Copy U1's `assets/git/.gitignore` in as `.gitignore`.
   **Pass:** `git check-ignore -v` matches each of `.config/mise.local.lock`,
   `.config/mise.local.toml`, `.config/mise.dev.local.toml`,
   `.config/mise.dev.local.lock`, `.config/mise/config.local.toml`,
   `.config/mise/config.dev.local.toml`, `.config/mise/conf.d/tools.local.toml`,
   `mise.local.toml`, `.mise.local.toml`; and matches **none** of
   `.config/mise/mise.lock`, `.config/mise.toml`,
   `.config/mise/conf.d/tools.toml`, `.config/mise/locks/x/package.json`.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` over a path outside its Owns.

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

- **This repo's own `.config/` task copies and root `.gitignore`** — declined
  (decision 3): left to the next `/vwf:setup reshape`, as gate-hardening B6 left
  them. They still run unpinned `pnpm dlx` and have no mise section.
- **`./`-prefixing file names in the code task scripts** — declined (decision
  5): no dash-named file exists anywhere on the maintainer's machine; the block
  refuses new ones.
- **A `--` in `code:precommit`'s `pre-commit run --files`** — declined (decision
  6).
- **Moving the linter pin out of the mise base** — that is B70, its own item.

## Parked

- `shell_files_in_scope` in tool-config's `_scripts/helpers` runs
  `head -n 1 "${candidate}"` without `--`, so an extensionless dash-named file
  is silently dropped from the shell-file set. Moot while the block refuses such
  names; recorded so a later reader does not rediscover it.
- `code:precommit` still dies in pre-commit's argparse on a dash-named file
  (decision 6), which only matters for a file that got past the block
  (`--no-verify`, or tracked before the hook landed).
- Whether mise writes a separate local lock for `conf.d/*.local.toml` or
  `config.local.toml` was not verified; the bare `mise.*.local.lock` and the
  spelled-out paths cover every lock name observed so far.

## Gaps surfaced during execution

- **U3 Owns widened (R1, rule 5).**
  `plugins/stackgen/stacks/toolchain-gate/eslint/skills/eslint/SKILL.md:30, 60-61, 117-118`
  says `code:format` always runs sort-package-json; after U2 the step is skipped
  where the dev-only pin is not installed. No unit owned the passage; the Goal
  authorises the fix. Non-blocking.
- **U3 (GAP).** The plan cites
  `docs/memory/decisions/2026-09-26-mise-conf-d-layout.md:15` as the
  hardcoded-path line; it names only `mise.local.toml` and never lists the
  ignore paths. The new memo cites :15 as asked and also :74's open gap.

## Run log

| Wave | Unit               | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                            | Commit   |
| ---- | ------------------ | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight          | —     | 1     | pass        | doctor: no blocking (repo not onboarded — no .config/vwf.yaml, checks skipped); wave gate 5/5 green; format check skipped (no covers:); no code unit — conventions, LSP skipped; stackgen-v2.0.0 untagged → no stackgen bump                                                                                      | —        |
| 1    | U2 pnpm pack       | opus  | 1     | pass        | edit; DECIDED: sort-package-json 4.0.0 (npm latest, #8); task runs it by its `mise which` path, skipped when absent; GAP: none                                                                                                                                                                                    | e3c85d06 |
| 1    | U1 tool-config     | opus  | 1     | pass        | edit; no-dash-names hook first in `repo: local`; mise ignore set per #4; DECIDED: hook message says rename, not `./`; DOCS FALSIFIED: stackgen.md :315 :926 :949 + hook lists → U3; GAP: none                                                                                                                     | 82b9028d |
| 1    | orchestrator gates | —     | 1     | pass        | scratch repo, HOME isolated: dash block fails `-x.sh`, `sub/-y.md` (by --files and staged) with the rename message, passes `x.sh`, `a-b/c-d.md`; ignore matrix 9/9 matched, 0/4 negatives                                                                                                                         | —        |
| 1    | R1                 | opus  | 1     | findings(3) | git.md:39 fold stops early [U1] → loop; stackgen.md:711 hook list lacks no-dash-names → U3; eslint SKILL.md:30,60-61,117-118 says code:format always sorts [U2, rule 5, nobody-owned] → U3, Owns widened (GAP); CONTRACT clean; RULINGS clean; note: dev-only pin resolves only under MISE_ENV=dev, same as shfmt | —        |
| 1    | U1 tool-config     | opus  | 2     | pass        | edit; git.md paragraph re-folded to its end, wording unchanged                                                                                                                                                                                                                                                    | 82b9028d |
| 1    | R1                 | opus  | 2     | pass        | git.md:39 resolved; nothing new; CONTRACT clean; RULINGS clean. Wave gate 5/5 green                                                                                                                                                                                                                               | —        |
| —    | acceptance         | —     | 1     | skipped     | why: no covers: — no acceptance criteria                                                                                                                                                                                                                                                                          | —        |
| —    | ux                 | —     | 1     | skipped     | why: no covers: — no Screens contract                                                                                                                                                                                                                                                                             | —        |
| —    | reconcile          | —     | 1     | skipped     | why: no covers: — no stamps; no code unit — nothing to persist                                                                                                                                                                                                                                                    | —        |
| 2    | U3 docs            | opus  | 1     | pass        | edit; stackgen.md:713 hook list + :982-986 bare-name sentence; eslint SKILL.md (widened) dev-only pin wording; decision memo written; DECIDED: :315 :955 :978 not falsified; docs-sync by manual grep; GAP: conf-d-layout.md:15 names no ignore paths — memo cites :15 and the :74 open gap                       |          |
| 2    | R2                 | opus  | 1     | findings(1) | eslint SKILL.md:61 line 87 cols, past the 80 fold [U3] → loop; CONTRACT clean; RULINGS clean; no eslint bump needed (pack.yaml 0.3.3 already ahead of 0.3.1 at stackgen-v1.33.0)                                                                                                                                  | —        |
| 2    | U3 docs            | opus  | 2     | pass        | edit; eslint SKILL.md:61 `(dev)` note removed — line back to its pre-branch 81 cols; :62 carries the note                                                                                                                                                                                                         |          |
| 2    | R2                 | opus  | 2     | pass        | :61 resolved; nothing new; CONTRACT clean; RULINGS clean. Wave gate 5/5 green                                                                                                                                                                                                                                     | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-27-dash-names-and-mise-ignores

or let the queue pick it, by priority:

/vwf:execute next
