---
type: vwf-change-plan
title: The task library configures each gate once, and the hooks call it
requires: []
---

# Plan — The task library configures each gate once, and the hooks call it (2026-09-12)

## Status

**RUNNING**

APPROVED 2026-09-12 by the user, after the self-review. RUNNING since
2026-09-12, worktree
`/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-12-task-library`.

## Consent

| Action                                            | Granted                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                     |
| After landing: `mise run p:plugins:local`         | run                                                                                                     |
| After landing: `/release`                         | ask                                                                                                     |
| Release stackgen publicly                         | minor — `plugins/stackgen/.claude-plugin/plugin.json` `1.6.2` → `1.7.0`, by editing the `version` field |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json` `19.15.1` → `19.16.0`, by editing the `version` field  |
| Release site publicly                             | patch — `mise run p:site:version patch`                                                                 |
| Release installer publicly                        | none                                                                                                    |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, every tool a repo gates on — formatter, linter, security
scanners — is configured in exactly one place, a mise task, and the pre-commit
hooks call those tasks rather than the tools. `setup:default-branch` no longer
exists: setting a forge's default branch is a one-time act, not a task a machine
re-runs. `code:merge:develop` and `code:merge:main` obey a per-repo
`MERGE_MODEL` (`direct`, today's local merge-and-push, or `pr`, push and open a
pull request). `setup:all --all` and `code:worktrees` find a product's members
under either multi-repo linkage, not only as submodules. This repo's own
`.config/` tree takes the same shape, so its own commits prove the hook-to-task
path from the first landing onward.

The framing: `/vwf:init` lays the toolchain-manager pack's task library into a
repo byte for byte, and a survey on 2026-09-12 found the same tool configured
twice — once in a `code/*` task and once in a pre-commit hook — for dprint,
eslint, ruff, sort-package-json, dart analyze, dependency_validator and
gitleaks. The user's ruling: "these customisations must land in mise tasks and
let the pre-commit hooks use them as mise tasks." This is plan 1 of three; plan
2 (`setup:ai` on the maintainer's dev-marketplace machine and its plugin slots)
and plan 3 (brownfield rules in `init`) stand on it.

**Reversal, confirmed by the user 2026-09-12:** decision D17 of
[`2026-09-06-init-owns-the-first-commit`](../../memory/decisions/2026-09-06-init-owns-the-first-commit.md)
had `init` ask the forge default and run
`mise run setup:default-branch
<answer>` so that `init` names no forge. Now
`init`'s git pass ends at the `develop`/`main` pair and the first push; it never
touches the remote's settings. The repo-hygiene pack's CONTRIBUTING stub carries
the forge one-liner (a pack may name `gh`/`glab`; vwf prose may not). The docs
unit writes the decisions doc for this.

## Facts the survey established

**The task library.** The pack is
`plugins/stackgen/stacks/toolchain-manager/mise/`, version `1.0.1`
(`pack.yaml`), pinned only by `plugins/stackgen/stacks/bundles/mise.md:7`, with
inventory rows at `plugins/stackgen/stacks/inventory.md:94,139`. Its payload
under `config/.config/mise/tasks/` (prefix `TM` below): every task sources
`_scripts/helpers`; `_scripts/merge` is the shared merge procedure with the
pre-commit safety net at `_scripts/merge:36-80` and the push at `:85,104`;
placeholders (`#PLACEHOLDER` on line 5, source `_scripts/placeholder`, exit 0)
are `code/lint`, `setup/secrets`,
`setup/deps/{install,cleanup,upgrade,outdated,audit}`,
`setup/external/{start,stop,pull}`. `code/format` runs `dprint` and skips
without `.config/dprint.json`; `code/sec` runs `gitleaks` then `grype`;
`code/worktrees` lists `git worktree` plus `git submodule` and still prints the
retired name `worktree:init` at `TM/code/worktrees:133`; `setup/all` calls the
steps in order at `TM/setup/all:36-57` and recurses members via
`git submodule foreach` at `:64-79`; `setup/default-branch` runs `gh repo edit`
or `glab repo update` and never fails (`:54-64`). `mise.toml` carries the
`[env] REPO_NAME = "unfilled"` marked position at
`config/.config/mise.toml:96-115`; `mise.dev.toml` carries the aliases
`precommit/setup/worktrees` at `:40-42` and the commented `setup-<id>` alias
template at `:47-48`. The skill is `skills/mise/SKILL.md` (259 lines; REPO_NAME
`:146-153`, `setup:vscode` `:217`, default-branch `:223`, do-not-fill-slots
`:243-252`, `worktrees` alias `:107`), `references/config-files.md` (marked
position `:84-86`, alias template `:131-133`, alias `:130`),
`references/task-library.md` (543 lines; headings: anatomy 28 · `_scripts` 66 ·
print vocabulary 90 · Node 118 · mandatory set 143 · slots 175 · setup 200 ·
member flags 260 · deps 279 · external 317 · `setup:vscode` 327 ·
`setup:default-branch` 351 · `setup:worktree` 368 · code 384 · pre-commit
ordering 386 · merge tasks 407 · `code:count` 434 · `p:<id>` 449 · legacy 507;
rows: `setup:ai` 154, `setup:vscode` 155, default-branch 156 and 171,
`code:worktrees` 164, `code:merge:*` 165-166 and 79, tree 245-260, `_default`
472-473, legacy map 517-529), and `conventions.md` (`setup:vscode` `:88`,
default-branch `:98`).

**Overlay order.** Later packs overwrite at the same paths: manager → gate →
hygiene → package-manager/language → app-framework → capability-provider →
cloud-provider → cloud-service, later file wins, the lockfile records the winner
— `plugins/stackgen/assets/output-tree.md:237-254`,
`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:117-133`,
`plugins/stackgen/assets/kinds.md:385-388`. stackgen never merges a file
(`materializer.md:100-111`); `/vwf:init` composes `pre-commit.d/*.yaml`
fragments into the gate config by marker pairs, filename-sorted
(`plugins/vwf/skills/init/references/fragments-and-sections.md:80-130`).

**Overlays that ship a gate task** (all under `plugins/stackgen/stacks/`):
`app-framework/flutter` `code/format` (dart format + dprint), `code/lint` (dart
analyze, dependency_validator, `pnpm dlx @askviraj/linter`);
`package-manager/pnpm` `code/format` (dprint + `pnpm dlx sort-package-json`),
`code/lint` (`pnpm dlx @askviraj/linter`); `toolchain-gate/eslint` `code/lint`
(`pnpm dlx @askviraj/linter`); `toolchain-gate/ruff` `code/format` (dprint +
`uv run ruff format`), `code/lint` (`uv run ruff check`); `package-manager/uv`
ships no gate task. None carries the placeholder marker.

**Pre-commit today.** Base config
`toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`: `git-config`
→ `mise x -- mise run code:git-config --fix` (`:49`, the only hook that calls a
task); pre-commit-hooks builtins `:54-120` (large-files, case-conflict,
windows-names, two shebang checks, merge-conflict, two symlink checks,
json/toml/yaml, detect-private-key, eof, whitespace, line-ending,
no-commit-to-branch); `formatter` → `dprint fmt` (`:133`); `shellcheck`
(`:145`); `shfmt` (`:154`); `actionlint` (`:164`); `gitleaks-system` with
`.config/gitleaks.toml` (`:172-183`); `conventional-commits` (`:189`); `meta`
(`:210-219`). grype has no hook. Fragments, all `language: system` under
`mise x --`: `eslint/config/.config/pre-commit.d/eslint.yaml` (`:12` linter
`--fix`), `ruff/.../ruff.yaml` (`:14-19` ruff-check `--fix` + ruff-format),
`pnpm/.../pnpm.yaml` (`:12` sort-package-json), `flutter/.../flutter.yaml`
(`:13` dart analyze, `:21` import_sorter, `:31` dependency_validator),
`uv/.../uv.yaml` (`:13` `uv lock --check`). The pre-commit skill shows
`mise x -- <tool>` entries at
`toolchain-gate/pre-commit/skills/pre-commit/SKILL.md:96,108`.

**vwf.** `init`: `plugins/vwf/skills/init/SKILL.md` (hard rule `:43-54`: writes
only what a pack declares plus marked fills; six questions);
`references/new-repo.md` (marked positions `:138-172`; `_default` `:174-193`;
the forge step `mise run setup:default-branch` at `:332`);
`references/existing-repo.md` (legacy table `:76-90`; marked positions checked
`:229-234`; forge step `:379`; gate fills `:236-270`). `git-workflow`:
`plugins/vwf/skills/git-workflow/SKILL.md` ("use merge, not PRs" `:30`;
`code:merge:develop` `:31`; `code:merge:main` `:32`; `code:precommit`
`:134,149-151`; Step 4 `:191-193`), `references/landing.md` (`:21`, `:33-36`,
`:42-45`, `:47-48`), `references/worktree-setup.md`
(`setup:worktree`/`setup:all` probed `:99-105`). `doctor`'s four shape
predicates are `plugins/vwf/skills/doctor/references/stack-checks.md:233-298`
(the `develop`/`main` pair `:283-288`, `REPO_NAME` `:290-294`); none reads
`MERGE_MODEL` or `MEMBERS`. `init` has **no rule** for a task the repo has and
the pack lacks — plan 3's business.

**This repo's own `.config/`** is shaped to the pack (commit `e74038a6`) and has
since diverged: `.config/mise/tasks/setup/all:16` calls `setup:ai` but not
`setup:vscode`; `.config/mise.dev.toml` has no `worktrees` alias;
`.config/mise/tasks/setup/default-branch` exists;
`.config/pre-commit-config.yaml` is the gate pack's shape with the direct-tool
hooks; `CONTRIBUTING.md:27` names the merge tasks. It has no `.config/vwf.yaml`
and no harness stamp.

**Gates.**
`.config/mise/tasks/p/plugins/{marketplace,inventory,check,shellcheck,npm-normalize-test,local,release}`
and `p/site/{build,check,dev,icons,version,release}`; CI is
`.github/workflows/plugins.yml` job `validate` (`:38`; marketplace `--check`
`:53`, inventory `--check` `:56`, check `:59`, shellcheck `:67`, vitest `:96`,
npm-normalize-test `:101`, tsc `:107-108`). Checker rule 11
(`scripts/src/check.ts:405-470`) walks every file under
`config/.config/mise/tasks` for exec bit and shebang, parses every
`pre-commit.d/*.yaml` and the gate config for a top-level `repos:` list
(`:510`), and fences `.github/workflows`; rule 13 (`:860`, landed tiers `:922`)
refuses plugin-relative citations in anything a pack lands. **Nothing enumerates
task names** — no fixture, no snapshot; `check.test.ts:246` uses `code/format`
only as a synthetic path. Adding or removing a task file needs no checker
change. Payload exclusion from this repo's formatter: `.config/dprint.json:10`,
and the linter's pre-commit exclude `.config/pre-commit-config.yaml:130-140`.
Commit types: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; scopes none
(`.config/git-conventional-commits.yaml:2-9`).

**Docs describing today's behaviour** (the docs unit's list, beyond what units
report): `site/src/content/docs/plugins/stackgen.md:547` (`code/*` list),
`:552-556` (`code:all`), `:557-563` (merge tasks), `:570-573` (`setup:all`
order), `:588-589` (`setup:default-branch`), `:695-712` (legacy table);
`site/src/content/docs/plugins/vwf.md:960` (`init` runs default-branch), `:1992`
(merge tasks);
`plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/CONTRIBUTING.md:27`;
`.claude/docs/repo-shape.md` and `readme.md` wherever they name the task set
(the docs unit greps).

**Standing rules that bind every unit.** A landed pack file cites nothing by
plugin path (rule 13; decision 2026-09-08). BSD `sed` on the host; never write a
file through a heredoc after a pipe (the npm-normalize hook rewrites `npm` to
`pnpm`); `cat` is aliased to `bat`, so write files with the editing tools.
`plugins/**/*.md` is not formatted — match the surrounding fold width by hand.
The payload tier `plugins/*/stacks/*/*/config/` is excluded from this repo's
formatter on purpose; a payload file needing formatting is formatted with the
**shipped** dprint config, never this repo's. Every task file carries the exec
bit and a shebang; every hook script must be `sh`-safe if it declares `sh`.

## Assumed decisions — confirm or override at review

| #  | Decision                        | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Rejected                                              | Unit           |
| -- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------- |
| 1  | Hook shape                      | "Every gate hook calls a task." The base config carries three tool-neutral hooks, ids `format`, `lint`, `sec`, each `language: system`, `entry: mise x -- mise run code:<x> --fix` for format and lint with `pass_filenames: true`, and `entry: mise x -- mise run code:sec --staged` with `pass_filenames: false`. The `formatter`, `shellcheck`, `shfmt`, `actionlint` and `gitleaks-system` hooks are removed. Builtins, `git-config`, `conventional-commits`, `no-commit-to-branch`, `meta` stay as they are.                                                                                                                        | per-tool hooks calling tasks; fragments calling tasks | U3             |
| 2  | File-list contract              | "Optional file list, whole tree by default." `code:format`, `code:lint`, `code:sec` declare `#USAGE arg "[files]..."`; an empty list means the whole tree. Every overlay honours the list. A tool that cannot take a file list (dependency_validator, `dart analyze` on a package, `uv run ruff check` on a project) runs whole-tree when files are given, and the unit reports each such tool as `DECIDED:`.                                                                                                                                                                                                                            | whole tree always                                     | U1, U4         |
| 3  | The three tools with no task    | shellcheck and actionlint become shipped defaults inside the mise pack's `code:lint`; shfmt becomes a shipped default inside `code:format`. Each skips silently when its binary is absent or no file of its type is in scope. They read the tree as a directory, like dprint, which is why they get defaults where language linters do not.                                                                                                                                                                                                                                                                                              | stay as direct hooks with no task                     | U1             |
| 4  | `code:sec --staged`             | With `--staged`, `code:sec` runs `gitleaks protect --staged` with `.config/gitleaks.toml` and skips grype; without it, today's tree scan (`gitleaks detect` then grype).                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | gitleaks stays a direct hook                          | U1             |
| 5  | Fragments                       | Every language fragment loses its gate hooks. `eslint.yaml`, `ruff.yaml` and `pnpm.yaml` become empty and are deleted with `rm`. `flutter.yaml` is deleted too: import_sorter moves into flutter's `code/format` (it is a formatter), and dart analyze + dependency_validator already live in flutter's `code/lint`. `uv.yaml` keeps only `uv lock --check`, which is not a gate tool.                                                                                                                                                                                                                                                   | fragments whose hooks call tasks                      | U4             |
| 6  | `MERGE_MODEL`                   | `MERGE_MODEL = "direct"` is a marked position in `mise.toml`'s `[env]` block beside `REPO_NAME`, with a comment naming the two values. `_scripts/merge` reads it: `direct` is today's behaviour unchanged; `pr` runs the same predicates, pushes the branch with `--follow-tags`, opens a pull request through `gh` or `glab` (whichever is on PATH, `gh` first), else prints the branch and a "open the pull request on your forge" line, and stops — nothing merges locally. `code:merge:main` in `pr` mode opens `develop` → `main`. `init` asks the value inside its existing git-pass consent step, not as a new numbered question. | two task names (`code:pr:*`); a `--pr` flag           | U1, U5         |
| 7  | `MEMBERS`                       | `MEMBERS = ""` is a marked position in the same `[env]` block: space-separated paths relative to the repo root, filled by `init` from the registry's `members:` list (submodule products leave it empty). `_scripts/helpers` gains `members()`: when `.gitmodules` exists it prints `git submodule foreach --quiet --recursive 'echo $displaypath'`, else the words of `MEMBERS`. `setup/all`'s `--all` recursion and `code/worktrees` both call `members()`. TOML env values are strings, so a space-separated string, not an array.                                                                                                    | submodules only                                       | U1, U5         |
| 8  | Stale text                      | `code/worktrees` line 133's `worktree:init` becomes `setup:worktree`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | leave                                                 | U1             |
| 9  | git-workflow under `pr`         | Step 4 reads `MERGE_MODEL` with `mise env -s bash \| grep MERGE_MODEL` (or `mise env --json`) before offering the three options; under `pr` the two merge options read "Push & open PR (& clean up / & keep worktree)" and landing.md gains the PR path: the merge task does the push and the PR; teardown is unchanged. The skill still names no forge — the task does.                                                                                                                                                                                                                                                                 | a separate PR skill; asking the user each time        | U6             |
| 10 | Dropping `setup:default-branch` | "init stops touching the remote." The task file is removed with `rm`; the mandatory-set row, the tree line, the "not in setup:all" sentence and the section go; `init`'s two references drop the forge question and the `mise run setup:default-branch` line; the repo-hygiene CONTRIBUTING stub gains one line telling a maintainer to set the forge default branch by hand, showing the `gh` and `glab` forms.                                                                                                                                                                                                                         | init prints the command; keep the task hidden         | U1, U2, U5, U8 |
| 11 | This repo adopts the change     | One unit re-copies the changed pack files into `.config/`, fills `MERGE_MODEL = "direct"` and `MEMBERS = ""`, removes `setup/default-branch`, adds the `setup:vscode` call to `setup/all` and the `worktrees` alias, and takes the new gate config. Its own later commits then run through the task-calling hooks.                                                                                                                                                                                                                                                                                                                       | packs only, this repo drifts                          | U7             |
| 12 | Model                           | Every unit runs on `opus`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —                                                     | all            |
| 13 | Pack versions                   | Every changed pack bumps **minor**: mise `1.0.1` → `1.1.0`, pre-commit gate, eslint, ruff, pnpm, flutter, uv each `X.Y.Z` → `X.(Y+1).0`. `pack.yaml`, the bundle pins that name each and `inventory.md` land in one commit.                                                                                                                                                                                                                                                                                                                                                                                                              | patch; major                                          | U9             |

## New dependencies

none — `gh` and `glab` are what the dropped task already used; every other tool
is already in the packs.

## Units

| Id | Wave | Unit file                                        | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Depends on | Status  | Commit   |
| -- | ---- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | -------- |
| U1 | 1    | [01-mise-pack-tasks.md](01-mise-pack-tasks.md)   | `plugins/stackgen/stacks/toolchain-manager/mise/config/**` — `_scripts/helpers`, `_scripts/merge`, `code/format`, `code/lint`, `code/sec`, `code/worktrees`, `code/merge/develop`, `code/merge/main`, `setup/all`, rm `setup/default-branch`, `.config/mise.toml`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —          | green   | 49412c2c |
| U2 | 1    | [02-mise-pack-skill.md](02-mise-pack-skill.md)   | `plugins/stackgen/stacks/toolchain-manager/mise/skills/**` and `.../mise/conventions.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —          | green   | 59f22320 |
| U3 | 1    | [03-pre-commit-pack.md](03-pre-commit-pack.md)   | `plugins/stackgen/stacks/toolchain-gate/pre-commit/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —          | green   | 8c5ba53a |
| U4 | 1    | [04-language-packs.md](04-language-packs.md)     | `plugins/stackgen/stacks/toolchain-gate/eslint/**`, `toolchain-gate/ruff/**`, `package-manager/pnpm/**`, `package-manager/uv/**`, `app-framework/flutter/**` — their `pre-commit.d/*.yaml`, `code/format`, `code/lint`, and each pack's own `conventions.md`/skill where it describes those                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —          | green   | 75400797 |
| U5 | 1    | [05-vwf-init.md](05-vwf-init.md)                 | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —          | green   | 1fe33b13 |
| U6 | 1    | [06-vwf-git-workflow.md](06-vwf-git-workflow.md) | `plugins/vwf/skills/git-workflow/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —          | green   | 15849a92 |
| U7 | 2    | [07-own-repo-config.md](07-own-repo-config.md)   | `.config/mise/tasks/**`, `.config/mise.toml`, `.config/mise.dev.toml`, `.config/pre-commit-config.yaml`, `CONTRIBUTING.md`; **widened at run time (U7 round 1 UNRESOLVED):** `.config/linter.yaml` — carry the former linter hook's `^site/public/` exclude into the linter's own ignores, nothing else                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | U1, U3     | green   | f6778d15 |
| U8 | 3    | [08-docs.md](08-docs.md)                         | `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/**`, `plugins/stackgen/stacks/repo-hygiene/**` (the CONTRIBUTING stub), `docs/memory/decisions/2026-09-12-*.md`, every `DOCS FALSIFIED:` path; **widened at run time (R1 round 2, contested):** `plugins/stackgen/stacks/package-manager/pnpm/conventions.md:50` (the linter no longer narrows), and the 81-column prose lines at `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md:407,413,420,493,497`, `.../mise/conventions.md:98-100`, `.../references/config-files.md:115`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/skills/pre-commit/SKILL.md:143` — re-wrap only; **widened at run time (R2, rule 5):** `site/CLAUDE.md:38,186,191` — the linter's exclude now lives in `.config/linter.yaml`, not a pre-commit argument list; **widened at run time (U8 GAP):** `docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md` — a superseded-by pointer on D17 only | all        | green   | 84418a04 |
| U9 | 4    | [09-gates-and-bump.md](09-gates-and-bump.md)     | the six `pack.yaml`, `plugins/stackgen/stacks/bundles/*.md`, `plugins/stackgen/stacks/inventory.md`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | U8         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                    | Why it collides                                          | Owner   |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------- |
| every `pack.yaml` (mise, pre-commit, eslint, ruff, pnpm, uv, flutter)                   | version field; U1/U3/U4 edit the pack, U9 bumps it       | U9 only |
| `plugins/stackgen/stacks/bundles/*.md`                                                  | pins name the pack versions U9 sets                      | U9 only |
| `plugins/stackgen/stacks/inventory.md`                                                  | generated                                                | U9 only |
| `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json` | version files                                            | U9 only |
| `.claude-plugin/marketplace.json`                                                       | generated from the plugin manifests                      | U9 only |
| `site/package.json`                                                                     | version file                                             | U9 only |
| `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/docs/**`                 | human-facing docs                                        | U8 only |
| `plugins/stackgen/stacks/repo-hygiene/**`                                               | the CONTRIBUTING stub gains the forge line; U8 writes it | U8 only |
| `CONTRIBUTING.md` (this repo's root)                                                    | U7 mirrors the stub's new line here; U8 does not touch   | U7 only |
| `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, `conventions.md`            | the pack's own doctrine; describes U1's result           | U2 only |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5, U6.** Six disjoint trees: the mise pack's
  payload, the mise pack's skill, the pre-commit pack, the five language packs,
  vwf's init, vwf's git-workflow. Each writes from the rulings above and reads
  nothing another unit writes.
- **Wave 2 — U7.** Copies the payload U1 and U3 produced into this repo's
  `.config/`; must run after wave 1's commits so what it copies is the landed
  bytes. Its commit is the first that runs through the new hooks, and the
  standing rule applies: a modified-but-unstaged
  `.config/pre-commit-config.yaml` aborts every commit, so the orchestrator
  stages U7's whole `Owns` list in one `git add` before committing.
- **Wave 3 — U8.** Docs, after every `DOCS FALSIFIED:` line is in.
- **Wave 4 — U9.** Versions, pins, generated files, full gate.

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
be green before wave 1. `p:plugins:inventory --check` and
`p:plugins:marketplace --check` are expected to **fail between U9's edits and
its regeneration only**; U9 regenerates before it runs the gate.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                             |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into this machine's dev marketplace under `X.Y.Z+N` and updates the local install; reaches nothing beyond this machine; loaded by a **restarted** session |
| `/release`                 | ask  | cuts `stackgen-v1.7.0`, `vwf-v19.16.0` and `site-v<patched>`; stops once and asks first                                                                                           |

## Gates the orchestrator keeps

**Temp-repo materialize-and-commit**, after wave 2 and again before landing.
Hermetic per the standing memory rule: `export CLAUDE_CONFIG_DIR=$(mktemp -d)`
and a `PATH` with **no** `claude` binary, so `setup:ai` (out of scope here,
still called by `setup:all`) takes its skip branch and never reaches the
installer.

1. `mkdir` a temp dir; `git init -b develop`; copy the `config/` payload of the
   mise pack, the pre-commit gate pack, the repo-hygiene pack and the pnpm pack
   (in that order, later overwrites) into it; write `REPO_NAME = "scratch"`,
   `MERGE_MODEL = "direct"`, `MEMBERS = ""` at the marked positions;
   `mise trust --all`; `mise install`; `mise run setup:precommit`.
2. Write a badly formatted `readme.md` (double spaces, trailing whitespace, no
   final newline) and a `package.json` with keys out of order; `git add -A`;
   `git commit -m "ops: scratch"`.
3. **Pass conditions:** the commit's `format` hook output names
   `mise run code:format`; the files are rewritten (a second `git add` and
   commit succeeds clean); `mise run code:all` exits 0; `mise tasks --hidden`
   lists `code:format`, `code:lint`, `code:sec` and does **not** list
   `setup:default-branch`; `mise run code:sec --staged` exits 0 and its output
   does not mention grype; `mise run code:worktrees` exits 0 and its output does
   not contain `worktree:init`;
   `grep -c 'mise run code:' .config/pre-commit-config.yaml` is at least 4
   (git-config, format, lint, sec); `grep -L 'entry: mise x --'` over the config
   finds no `dprint`, `gitleaks`, `shellcheck`, `shfmt` or `actionlint` entry.
4. Remove the temp dir and the temp config dir.

**This repo's own commit path** — U7's commit and every commit after it is made
through the hooks U7 landed; a hook that fails to call its task fails the
commit, which is the point.

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

- **`setup/vscode` and `setup/deps/*`** — already adapt: `setup:vscode` reads
  the `vscode.d/` fragments every pack ships, and the deps verbs are slots the
  pinned package manager overlays. Nothing to change.
- **`setup:ai`** — plan 2 (`docs/plans/2026-09-12-setup-ai`, to be written): the
  maintainer's dev-marketplace machine, the `EXTRA_MARKETPLACES` /
  `EXTRA_PLUGINS` slots nobody fills, the official marketplace, the statusline.
- **Brownfield rules in `init`** — plan 3
  (`docs/plans/2026-09-12-init-brownfield`, to be written): adapting a diverged
  `_scripts/*` beyond replace-and-rewrite, and a rule for a task the repo has
  that the pack lacks.
- **CI workflows** — a pack never lands one (decision 2026-09-05, charter
  fence); the hooks-to-tasks change does not touch `.github/`.
- **The `git-workflow` skill beyond Step 4 and landing** — the worktree setup,
  the commit ritual and the safety rules are unchanged.

## Parked

- **Doctor predicates for `MERGE_MODEL` and `MEMBERS` drift** — doctor's four
  shape predicates (`stack-checks.md:233-298`) check `REPO_NAME` and the branch
  pair; the two new marked positions get no predicate in this plan. A repo that
  never filled them runs with the shipped defaults, which is safe.
- **`mise [hooks] postinstall` versus `setup:precommit`** — parked since the
  2026-09-05 init plan (`index.md:473-475`); untouched here.
- **The machine-wide task survey** — plan 4, after plans 1–3: every
  `.config/mise/tasks/**` under `~/Projects/` compared with the contract to find
  what the library is missing.
- **`grype` threshold "deliberately duplicated in config and `code:sec`"** (init
  plan run log `:485`) — with `code:sec` now the only place a hook reaches
  grype, the duplication is the `.config/grype.yaml` file plus the task's
  threshold flag; whether one of them goes is a later question.

## Run log

| Wave | Unit              | Model | Round | Outcome                  | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Commit   |
| ---- | ----------------- | ----- | ----- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight         | —     | 1     | green                    | all nine gate lines green on the branch point (marketplace, inventory, check, shellcheck, npm-normalize, vitest, tsc×2, site:check)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 1    | U6                | opus  | 1     | green                    | DECIDED: worktree-setup.md untouched; Step 4 heading → "The two landing options"; suggest keep-worktree under `pr`; a submodule set to `pr` blocks the outer pointer — report and stop. DOCS FALSIFIED: vwf.md:1992, stackgen.md:557-563. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 15849a92 |
| 1    | U3                | opus  | 1     | green                    | DECIDED: format/lint/sec in the first `repo: local` block, so `format` now runs before the builtins (reverses today's order; fixers stay no-ops); ordering comment added above the three; `sec` carries `always_run: true`; SKILL.md closes with "a pack needing a gate overlays the task, a fragment is for non-gate checks". DOCS FALSIFIED: gitleaks/conventions.md:44, gitleaks/skills/gitleaks/SKILL.md:51, .claude/docs/repo-shape.md:120. GAP: gitleaks pack in no unit's Owns — assumed U8 takes the two passages as DOCS FALSIFIED paths                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 8c5ba53a |
| 1    | U5                | opus  | 1     | green                    | DECIDED: MERGE_MODEL asked as §11(a) before staging (an ask after staging leaves the value uncommitted); question count stays six; fragments-and-sections.md, readme-and-license.md, pass 3 untouched. DOCS FALSIFIED: vwf.md:960, CLAUDE.md "Plugins" section (forge default), .claude/skills/vwf-plugin/** (U8 greps). GAP: where MEMBERS' sibling linkage comes from on a first run — assumed the registry's members list with linkage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1fe33b13 |
| 1    | U2                | opus  | 1     | green                    | DECIDED: `code:lint` stays a slot — rule restated as directory-reading tool = default, language tool = slot; MERGE_MODEL subsection at `####` after the --no-ff paragraph; `gh`/`glab` named in task-library.md pr-mode prose (pack skill may name a forge). DOCS FALSIFIED: stackgen.md:584-589, vwf.md:960. GAP: no home named for MERGE_MODEL/MEMBERS prose in config-files.md — assumed the `[env]` skeleton plus one paragraph beside the lockfile note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 59f22320 |
| 1    | U4                | opus  | 1     | green                    | DECIDED: whole-tree when files given for dependency_validator, dart analyze, `uv run ruff check` (per ruling 2, over the unit file's `ruff check <files>` bullet); uv.yaml untouched (already lock-check only); empty `pre-commit.d/` dirs rmdir'd; ruff format/dart format/sort-package-json/import_sorter filter the list to their own types and skip when empty; U1's defaults block copied verbatim. DOCS FALSIFIED: plugins/stackgen/assets/kinds.md:296-298 (not in U8 Owns), stackgen.md:413. GAP: none. Notes `p:plugins:shellcheck` red on U1's mise `code/lint` (shfmt) at return time                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 75400797 |
| 1    | U1                | opus  | 1     | green                    | DECIDED: `gitleaks git --staged` not `protect` (deprecated in v8); `--redact=50` (space form was a latent defect, fixed on the two `gitleaks dir` lines too); pr mode skips only the unpushed-commits predicate; kept `#USAGE arg "[files]" var=#true` idiom; whole-tree shell scope reads `git ls-files`; `code:sec` accepts and ignores `[files]`; unknown MERGE_MODEL reads as direct. Fact correction: `code/worktrees` never printed `worktree:init` (file is 65 lines); ruling 8 was already satisfied. DOCS FALSIFIED: task-library.md:523 (legacy map), :143-174, :351, :384-407, :472; SKILL.md:223; config-files.md:84-86; conventions.md:98 — all U2's tree, U2 already rewrote them. GAP: no shfmt/shellcheck file-selection rule — assumed `*.sh`/`*.bash` or shell shebang, `git ls-files` whole-tree; dprint step absent-config early-exit would skip shfmt — assumed warn and continue                                                                                                                                                                    | 49412c2c |
| 1    | R1                | opus  | 1     | findings(5)              | task-library.md:458,474 [U2] predicates prose false under `pr`; eslint/pnpm/flutter `code/lint` [U4] linter gets the staged subset though its cross-file rules need the whole tree (deleted fragment's `pass_filenames: false` reason dropped); `code/sec:47` [U1] `--staged` hard-fails on absent gitleaks while the tree scan warns; flutter/conventions.md:46 [U4] 88 columns; task-library.md:75 [U2] `_scripts` table lacks `shell_files_in_scope`. CONTRACT: clean. RULINGS: U1 departed #6 (pr skips the unpushed predicate) and #4 (`gitleaks git --staged` over deprecated `protect`) — both DECIDED, reviewer judges both correct; orchestrator keeps U1's behaviour and loops the prose (finding 1) to U2                                                                                                                                                                                                                                                                                                                                                      | —        |
| 1    | U1                | opus  | 2     | green                    | `code/sec` `--staged` missing-gitleaks path now warns and continues (one warn line, matching the tree scan). DECIDED: dropped the `setup:all` hint line. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U2                | opus  | 2     | green                    | task-library.md: unpushed-commits predicate scoped to `direct` with the reason; MERGE_MODEL section says "every predicate but one"; `_scripts` table row names `members()` and `shell_files_in_scope()`. DECIDED: table width held, "sourced by every task" moved below. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U4                | opus  | 2     | green                    | eslint/pnpm/flutter `code/lint`: house linter runs whole-tree when files are given (cross-file rules; same shape as dependency_validator), shellcheck/actionlint still narrowed; flutter/conventions.md re-wrapped to 80 and corrected; eslint SKILL.md example corrected. DECIDED: per ruling 2. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 1    | R1                | opus  | 2     | findings(2)              | RESOLVED: 1–5. New: pnpm/conventions.md:50 [U4] "the linter narrows" falsified by the round-2 whole-tree fix; ten 81-column prose lines (task-library.md:407,413,420,493,497; mise/conventions.md:98-100; config-files.md:115; pre-commit SKILL.md:143) [U2, U3]. CONTRACT: clean. RULINGS: clean. Loop cap reached — both recorded `contested`; GAP: U8's Owns widened to exactly those passages so they are reconciled in wave 3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 2    | U7                | opus  | 1     | unresolved→re-dispatched | CHANGED eight tasks byte-identical to the landed packs, setup/all keeps the linter `--init` step, `mise.toml`/`mise.dev.toml`/`pre-commit-config.yaml`/`CONTRIBUTING.md`. DECIDED: repo actionlint hook and linter exclude list dropped (tasks own them); 143-line `code/worktrees` replaced by the pack's. GAP: overlay `code/format` in pnpm/ruff/flutter drop the shfmt default the doctrine says an overlay keeps — a wave-1 defect, orchestrator re-dispatches U4 to fix it before U7 re-copies; grype `--fail-on medium` makes `code:sec` red on pre-existing astro/sharp vulns (parked item, commit path unaffected); `mise tasks` lists `setup:default-branch` from the main checkout leaking into the nested worktree. UNRESOLVED: whole-tree house linter rewrites `site/public/brand/social-preview.html` — the old hook excluded `^site/public/`, `.config/linter.yaml` does not, no unit owns it. Orchestrator ruling under the Goal (one place per tool): widen U7's Owns to `.config/linter.yaml` and carry the exclude over; recorded as GAP, re-dispatch | —        |
| 2    | U4                | opus  | 3     | green                    | mechanical fix: pnpm/ruff/flutter `code/format` gain the inherited shfmt default after the dprint call (`shell_files_in_scope`, `-w` under fmt else `-d`, silent when absent). DECIDED: anchored on the overlays' lowercase `action`. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 226068c1 |
| 2    | U7                | opus  | 2     | green                    | `.config/linter.yaml` ignores `site/public/**` with the old hook's reason; `code/format` re-copied from the fixed pnpm pack (cmp identical); `code/all`, `code/git-config` re-copied from the mise pack (pre-pack legacy, newly gated); shfmt/shellcheck fixes to four repo-only p:/setup tasks. Verification: `code:precommit` ×2 clean, hooks name `mise run code:*`; pack gates green. GAP: `plugins/vwf/hooks/mempalace-checkpoint.sh` fails whole-tree `code:format` (shfmt) and `code:lint` (SC2020) — no unit owns `plugins/vwf/hooks/**`, the only thing keeping `code:all` red before `code:sec`; `code:sec` whole-tree red on pre-existing grype findings (parked); `setup:default-branch` still listed — parent checkout leaking into the nested worktree                                                                                                                                                                                                                                                                                                      | f6778d15 |
| 2    | gate              | —     | 1     | green                    | all nine gate lines green on the wave-2 tree                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 2    | R2                | opus  | 1     | findings(4)              | rule 5 only: CLAUDE.md:201 ("excluded from the linter and from its pre-commit argument list" — no argument list now); site/CLAUDE.md:38,186,191 (the linter's pre-commit exclude moved into `.config/linter.yaml`) — `site/CLAUDE.md` in no unit's Owns; `.config/pre-commit-config.yaml` lost the in-hook prose on the dprint payload exclusion (rationale survives in CLAUDE.md and `dprint.json`; reviewer: no action). CONTRACT: clean. RULINGS: clean. No loop: rule-5 findings hand to U8 as DOCS FALSIFIED; GAP: U8's Owns widened to `site/CLAUDE.md:38,186,191`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | orchestrator gate | —     | 1     | green                    | temp-repo materialize-and-commit: every pass condition met — `format` hook output names `mise run code:format`, readme/package.json rewritten and the second commit clean, `code:all` 0, `mise tasks --hidden` lists format/lint/sec and not `setup:default-branch`, `code:sec --staged` 0 with no grype, `code:worktrees` 0 with no `worktree:init`, 7 `mise run code:` hooks, no direct-tool entry. GAP: the plan's four-pack list omits `toolchain-gate/dprint`, which the unconditional repo-gates bundle always lands; without it the pnpm overlay's `code/format` (which ran dprint unconditionally before this plan too) fails on the missing `.config/dprint.json` — the gate was run with the dprint pack added, hermetic (`CLAUDE_CONFIG_DIR` temp, no `claude` on PATH)                                                                                                                                                                                                                                                                                        | —        |
| 3    | U8                | opus  | 1     | green                    | docs-sync over `f18d532d..HEAD` plus every DOCS FALSIFIED line: CLAUDE.md, site/CLAUDE.md, repo-shape.md, ci-and-releases.md, vwf-plugin SKILL.md + skills-and-agents.md, stackgen-plugin SKILL.md, stackgen.md, vwf.md, how-to/greenfield/multi-repo.md, the repo-hygiene CONTRIBUTING stub (MERGE_MODEL + by-hand forge line), gitleaks pack conventions + SKILL, kinds.md, pnpm/conventions.md, the ten re-wrapped lines, new decisions doc `2026-09-12-task-library-configures-each-gate-once.md`. DECIDED: readme.md unedited (names no task, no forge step); legacy table unchanged per unit file. GAP: dprint re-padded the plan's run-log table (left); root `CONTRIBUTING.md:35` (U7's) prints `glab repo update --default-branch` but glab's flag is `--defaultBranch` — orchestrator re-dispatches U7 for the one-word fix; the 2026-09-06 decision doc gets no superseded-by pointer (outside Owns) — orchestrator widens U8's Owns to that one pointer                                                                                                       | —        |
| 3    | U7                | opus  | 3     | green                    | mechanical fix: root `CONTRIBUTING.md` `glab repo update --default-branch` → `--defaultBranch`, agreeing with the pack stub. DECIDED: kept the literal `main`. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 9bcee560 |
| 3    | gate              | —     | 1     | green                    | all nine gate lines green on the wave-3 tree                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 3    | R3                | opus  | 1     | findings(3)              | decisions/2026-09-06:91 D17 lacks the superseded-by pointer (Owns widened after U8 returned); vwf.md:969 vwf prose names `gh`/`glab` (rulings — departs the D17 reversal's forge line); pre-commit SKILL.md:143 re-wrap dropped "of its". CONTRACT: clean. RULINGS: U8 departed #10 at vwf.md:969 — looped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 3    | U8                | opus  | 2     | green                    | D17 superseded-by blockquote pointer; vwf.md:969 forge-free; pre-commit SKILL.md:143 "each of its tools" restored. DECIDED: pointer styled as the `SUPERSEDED` blockquote of 2026-08-29-devtools-survives-the-waves.md. GAP: `.claude/skills/vwf-plugin/SKILL.md:84` names `gh`/`glab` — repo-internal maintainer prose, not shipped vwf prose; left                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 84418a04 |
| 3    | R3                | opus  | 2     | pass                     | RESOLVED: 1–3. CONTRACT: clean. RULINGS: clean. No forge CLI under `plugins/vwf/**` or vwf.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-12-task-library
