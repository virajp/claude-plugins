# U6 — The mise pack: `REPO_NAME`, settings, tracked locks, the merge predicate, `setup:vscode`, `setup:default-branch`, `code:count`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/**`. Touch nothing
  outside this list — not the hygiene pack's `.gitignore`, not a bundle, not an
  asset.
- **Model:** inherit
- **Read first:** `pack.yaml`, `conventions.md`, `skills/mise/SKILL.md`,
  `skills/mise/references/config-files.md` (`:8-35` the five-file split,
  `:52-54` the lockfile claim), `skills/mise/references/task-library.md`
  (`:309-317` `setup:worktree`, `:346-356` the branch model, `:367-397` the `p:`
  group and id rule, `:384-387` `_default`, `:414-417`), and under
  `config/.config/`: `mise.toml` (`:1-25` header, `:40-43` lockfile, `:73-84`
  `[tools]`, the `[settings]` and `[env]` blocks), `mise.dev.toml` (`:15-30`
  tools, `:36-48` `[shell_alias]` with the `setup-<id>` template),
  `mise.ci.toml:9`, `mise/tasks/setup/all` (`:6-17` the flags and the marked
  positions), `mise/tasks/setup/worktree` (`:13-16`, `:18-33`),
  `mise/tasks/_scripts/merge` (`:36-80` the hook pass, `:88-243` the predicates,
  `:141-147`, `:186-190`), `mise/tasks/_scripts/checks`,
  `mise/tasks/_scripts/helpers`. Then the id asset U5 writes at
  `plugins/stackgen/assets/ids.md` and the editor-fragment subsection U5 adds to
  `plugins/stackgen/assets/pack-format.md` — if either is not there yet, cite
  them by those names and say so in a `GAP:`.
- **Lazy-load:** this repo's `.config/mise/tasks/code/count` as the shape of a
  counter (it is zsh and TypeScript-only; yours is neither);
  `plugins/stackgen/stacks/cloud-service/workers-static-assets/config/.config/mise/tasks/p/_project/deploy`
  as the model of a task that guards, then acts, with `print_*` helpers.

## Ruling

D15 — the resolved id is slugified per `assets/ids.md`; `task-library.md` cites
it, never restates it.

D26 / D27 — this pack ships `config/.config/vscode.d/mise.jsonc` per the
convention in `pack-format.md`: only keys for the files and tool it ships.

D16 — "Empty repo: `git init -b develop`, first commit, `git branch main`.
Existing: create `develop` from `main` where missing. Flow is feature →
`develop` → `main` regardless of forge default." The user: "No matter which is
default branch, work must flow from feature branches/worktree to develop to
main."

D17 — "a mise task `setup:default-branch` sets it via the forge CLI it finds,
else prints the command. Init runs the task, names no forge." The user: "Ask
user which branch must be default branch in remote (GitHub/GitLab/etc) with
`develop` being default selection."

D20 — "`mise.<env>.lock` files are **tracked**, one per config declaring tools;
`.gitignore` unchanged (local lock only); all '`mise.lock`' prose corrected."
The user: "Use lock file is good for reproducability, let's start using it for
all projects, specifically brownfield projects." Measured on mise 2026.9.1:
`mise install` writes one lockfile per config file that declares tools, named
after the stem; with the shipped split (base `[tools]` empty, nine tools in
`mise.dev.toml`) the only file produced is `.config/mise.dev.lock`.

D21 — "`_scripts/merge` gains a predicate: destination branch must exist
locally, else a message — before the hook pass, never at checkout." Measured:
today `code:merge:develop` on a `main`-only repo passes every predicate, runs
the whole-tree hook pass, then dies at `git checkout develop` (`merge:186-190`).

D29 — "`setup:vscode` in the mise pack: `code --profile "$REPO_NAME"`
create-or-select, install the merged list, **prune** what is installed there and
not listed; wired into `setup:all`; silent without `code`; prints the one-time
'share settings with Default' step on first create." The user: "Per-repo profile
generated is better, however it must also clean up stale extensions."

D30 — "Pack ships `[env] REPO_NAME = "<repo>"` as a marked position; the `cc`
family lives in the global config reading `$REPO_NAME`; literal, never derived
(worktree basename trap)." `REPO_NAME` carries the slug. The user: "I can have
these commands, like cc, be configured globally and use repo-specific env
variables to change the name value."

D31 — "`all_compile = false`, `task.timings = true`,
`task.disable_spec_from_run_scripts = true` — the last verified against current
mise before shipping."

D33 (this pack's part) — `code:count`.

D34 — "`setup:external:*` = services (pitchfork/docker); `setup:deps:*` = the
repo's own packages. Unchanged, restated." The user: "`setup:external` to setup
external dependencies (using pitchfork or docker) and `setup:deps` are used to
install internal dependencies (like node modules, flutter packages, swift
package, etc)".

D37 *(assumed)* — no pack version moves in this plan; the plugin's minor carries
the change.

## Edits

1. **`config/.config/mise.toml`** — `[env]` gains `REPO_NAME`, shipped as a
   **marked position** in the voice of `setup/all:8-17`: a comment block stating
   it is filled by the orchestrator with the project id per `assets/ids.md`,
   that it is a literal and never derived from the config root (a worktree's
   root is the branch name), and that aliases which vary only by repo — the
   Claude launchers — read it from a global config rather than shipping here;
   then the live line `REPO_NAME = "unfilled"`. `[settings]` gains
   `all_compile = false` (never build a tool from source),
   `task.timings
   = true`, and `task.disable_spec_from_run_scripts = true` —
   verify the third exists under that exact name on current mise via Context7
   (`/jdx/mise`); if it does not, omit it and return a `GAP:` naming what the
   docs do say. `:40-43` lockfile comment rewritten per D20.
2. **Lockfile doctrine** — `mise.ci.toml:9`, `conventions.md:37`,
   `skills/mise/SKILL.md:88` and `:103-104`, `config-files.md:52-54`: every
   "`mise.lock`" becomes the per-config rule — one lock per config file that
   declares tools, named after its stem, written by `mise install`, **tracked**
   (only `mise.local.lock` is ignored, which the hygiene pack already does). The
   five-file table at `config-files.md:13-35` gains a lockfile row stating that
   with the shipped split the file is `mise.dev.lock`, and that a base tool
   would add `mise.lock` beside it.
3. **`config/.config/mise/tasks/setup/worktree:13-16`** — the "and nothing else"
   claim states that `mise install` honours the tracked locks and writes nothing
   new; `task-library.md:309-317` says the same.
4. **`config/.config/mise/tasks/_scripts/merge`** — a new predicate after the
   source/destination checks (`:108-117`) and before the hook pass: the
   destination branch must exist locally
   (`git show-ref --verify --quiet
   refs/heads/<dest>`); on failure
   `print_error` that the branch is missing and that this repo's branch model
   needs both `develop` and `main`, then `exit 1`. Nothing else in the file
   changes. `task-library.md:346-356` restates the predicate in one clause.
5. **`config/.config/mise/tasks/code/count`** — new, `#!/usr/bin/env bash`,
   `#MISE description="Count lines of code"`, `#MISE dir="{{ config_root }}"`,
   sourcing `helpers` like its siblings: `git ls-files -z` piped through a
   `wc -l` over the tracked text files, grouped by extension, top ten plus a
   total; no external tool. Executable bit set.
6. **`config/.config/mise/tasks/setup/vscode`** — new, same header shape,
   `#MISE hide=true` like the other `setup:*` members. Steps: exit 0 silently if
   `code` is not on `PATH`; require `REPO_NAME` non-empty and not `unfilled`,
   else `print_warn` and exit 0; read the recommendation ids from
   `.vscode/extensions.json` (strip `//` comments before parsing — `node -e`
   with a comment strip is fine, no new tool);
   `before=$(code --profile
   "$REPO_NAME" --list-extensions)`; install every
   id not in `before` (`code --profile "$REPO_NAME" --install-extension <id>`);
   uninstall every id in `before` not in the list; if `before` was empty,
   `print_warn` the one-time step: open the profile once and choose to share
   settings and keybindings with the Default profile. **Verify against the real
   `code` CLI first** — in a throwaway `--user-data-dir` and `--extensions-dir`
   — that `--profile` combines with `--list-extensions`, `--install-extension`
   and `--uninstall-extension`, and that a folder opened once under a profile
   reopens under it; report each as a measured fact in `DECIDED:`, and if any
   does not hold, return `UNRESOLVED:` with what was measured rather than
   shipping a task that cannot work.
7. **`config/.config/mise/tasks/setup/all`** — runs `setup:vscode` as its last
   member step, after the hooks are wired.
8. **`config/.config/mise/tasks/setup/default-branch`** — new, hidden,
   `#USAGE arg "<branch>"`. If `git remote get-url origin` fails: print that no
   remote exists and the two commands to run once one does, exit 0. If `gh` is
   on `PATH` and `gh repo view` succeeds:
   `gh repo edit --default-branch
   <branch>`. Else if `glab` is on `PATH` and
   `glab repo view` succeeds: `glab repo update --default-branch <branch>`. Else
   print both commands, exit 0. Verify both flags exist on current CLIs via
   Context7 (GitHub CLI, GitLab CLI) before writing them; a flag that does not
   exist is a `GAP:` with the real one substituted.
9. **`config/.config/vscode.d/mise.jsonc`** — new, per U5's convention:
   `extensions: ["hverlin.mise-vscode"]`;
   `nesting: { "mise.toml": ["mise.*.toml",
   "mise.*.lock"] }` (the split
   nests under its base); no `settings`. TOML editor keys are the dprint gate's
   (it ships the taplo config), not this pack's.
10. **`skills/mise/references/task-library.md`** — `:367-397`: the id preference
    order stays; after it, one sentence: the resolved id is slugified per
    `assets/ids.md`, and `REPO_NAME` carries the same slug. New rows for
    `code:count`, `setup:vscode`, `setup:default-branch`. Where the
    `setup:external` and `setup:deps` groups are defined, one sentence each per
    D34 — services versus the repo's own packages — so nobody renames them
    again.
11. **`conventions.md`** and **`skills/mise/SKILL.md`** — the `REPO_NAME`
    convention (one paragraph: what it is, that it is the slug, that global
    aliases read it), the editor task, the default-branch task, the lockfile
    rule; `SKILL.md:218`'s `_default` sentence unchanged.
12. **`pack.yaml`** — `version:` unchanged (D37); `summary` only if it
    enumerates tasks.

## Verification

- `mise run plugins:check` exits 0 (rule 11: exec bit and shebang on every new
  task; the fragment parses once U11 lands — say so if U11 has not).
- `mise run plugins:shellcheck` exits 0 —
  `shellcheck -x -s bash -P
  <pack>/config -e SC2034 -e SC2154` and
  `shfmt -d -i 2 -ci` over every task file you added or edited.
- `grep -rn "mise\.lock" plugins/stackgen/stacks/toolchain-manager/mise/` —
  every remaining hit is a sentence that also says "per config" or names
  `mise.dev.lock`.
- `grep -n "REPO_NAME" config/.config/mise.toml conventions.md skills/mise/SKILL.md`
  hits all three.
- In a scratch git repo (`mktemp -d`, `git init -b main`, one commit, the pack's
  `config/` tree copied in, config trusted):
  `MISE_ENV=dev mise run
  code:merge:develop` exits non-zero with your message
  **and** no hook ran (nothing was checked out, `git branch --show-current` is
  still `main`). Same scratch: `code:count` prints a total. Same scratch with
  `REPO_NAME` filled and a two-id `.vscode/extensions.json`, run `setup:vscode`
  with `code` wrapped so `--user-data-dir`/`--extensions-dir` point into the
  temp dir: both install; remove one from the file, re-run: it is uninstalled.
  Clean the temp dirs.
- `mise settings` on the scratch repo lists the three new settings without a
  warning.

## Guardrails

- Do not edit the hygiene pack's `.gitignore` (U8) — the lockfile is tracked, so
  nothing there changes anyway.
- The `p/<id>/_default` slot is authored by the orchestrator, never shipped
  here; do not add one.
- Payload files under `config/` are excluded from this repo's dprint and are
  formatted by the **shipped** config; task files are `bash`, two-space, `-ci`.
  `cat` is aliased to `bat` — Write/Edit only. BSD `sed`.
- Name no vwf command in a task's output; "the orchestrator" is the word.
- Never install anything into the real VS Code user directory during
  verification.

## Commit

`feat(stackgen): mise pack — REPO_NAME, settings, tracked locks, the merge predicate, setup:vscode and setup:default-branch`
— written by the orchestrator after the wave gate, not by the unit.
