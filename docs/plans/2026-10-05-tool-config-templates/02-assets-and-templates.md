# U2 — Assets and templates

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/skills/tool-config/assets/**`,
  `plugins/stackgen/skills/tool-config/templates/**` (new); deletes
  `scripts/src/tool-config-core.test.ts`,
  `scripts/src/tool-config-gates.test.ts`,
  `scripts/src/tool-config-mise.test.ts` and
  `scripts/src/fixtures/tool-config/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every file under
  `plugins/stackgen/skills/tool-config/assets/`;
  `~/Projects/github.com/virajp/bootstrap/.config/{mise.toml,miserc.toml,claude-status.json}`,
  `~/Projects/github.com/virajp/bootstrap/.config/mise/conf.d/{_base,ai}/*.toml`,
  `~/Projects/github.com/virajp/bootstrap/.vscode/settings.json` (read-only —
  never edit bootstrap);
  `plugins/stackgen/skills/tool-config/scripts/lib/template.mjs` (the engine's
  syntax); index.md's **Template names** table.
- **Lazy-load:** the pack `config/` trees named in index.md's facts, for the
  exclude/ignore lists.

## Ruling

> E4 — `.config/mise.toml` holds `min_version = "2026.10.0"` and `[settings]`
> only; `.config/miserc.toml` holds `env_conf_d = true`; no root
> `mise.<env>.toml`. `conf.d/_base/mise{,.dev,.ci}.toml` and
> `conf.d/ai/mise.dev.toml` in every repo; `conf.d/<pack>/` per pack;
> `conf.d/<project>/` hand-written. Environments dev, ci, test. node, pnpm,
> `npm.package_manager = "pnpm"`, `node.compile = false` and
> `_.path = node_modules/.bin` sit in `_base/mise.toml` under `@@#if NODE@@`,
> else in `_base/mise.dev.toml`; `node.gpg_verify = false` in
> `_base/mise.ci.toml` under `NODE`.

> E5 — From bootstrap: `min_version = "2026.10.0"`,
> `task.run_auto_install = true`,
> `pipx.uvx`/`python.compile`/`python.uv_venv_auto` and the three `UV_*` env in
> `_base/mise.dev.toml`, `tasks.init` with `dir` = the git toplevel. Kept from
> the shipped files: `lockfile = false`, `minimum_release_age = "10h"`,
> `task.disable_spec_from_run_scripts`, `task.output`, `task.timings`,
> `PRE_COMMIT_HOME`.

> E6 — `_base/mise.toml` `[env]`: `REPO_NAME`, `MERGE_MODEL_DEVELOP`,
> `MERGE_MODEL_MAIN`, `MEMBERS` (`@@MEMBERS_SPACED@@`). `_base/mise.dev.toml`
> tools, all `latest`: osv-scanner, python, uv, pre-commit, dprint, taplo,
> gitleaks, grype, shellcheck, shfmt, actionlint, `npm:@askviraj/linter` (B70),
> plus node/pnpm when not `NODE`; shell aliases `precommit`, `setup`,
> `worktrees` and one `setup-<slug>` per `MEMBER_ENTRIES`. `ai/mise.dev.toml`:
> bootstrap's as is,
> `MEMPALACE_PALACE_PATH = "~/.local/share/mempalace/@@REPO_NAME@@"` the only
> value. A tool is pinned in exactly one folder.

> E7 — `.gitignore`: a curated list grouped by stack (node, python,
> dart/flutter, swift/xcode, secrets incl. `fnox.local.toml`, mise locals as
> bare `mise.local.toml` and `mise.*.local.toml` plus `**/mise.local.lock`,
> `graphify-out/` — B84), never upstream templates; `.gitattributes`: the base
> plus `pnpm-lock.yaml` as `linguist-generated` and `Package.resolved` as
> `linguist-generated`; the exclude set — dprint (every path as the `../X` +
> `**/X` pair, `includes: ["../**"]`), taplo, pre-commit `exclude`, linter
> ignores — with every pack exclude and ignore from the facts; the gitleaks
> allowlist the generated subset; dprint carries every plugin.

> E8 — `# >>> tool-config` / `# <<< tool-config` (`// >>> tool-config` in
> dprint's JSONC) wrap the rendered lines only in `.gitignore`,
> `.graphifyignore`, dprint's `excludes`, `linter.yaml`'s `ignores`, the
> gitleaks allowlist and the pre-commit global `exclude`. Every other file is
> owned whole.

> E9 — `code:check:all`, `code:lint:all`, `code:format:all`,
> `setup:deps:<verb>:all` and `setup:ai:all` are templates calling each subtask
> by name. Universal subtasks: `code/format/dprint`, `code/format/shell`
> (shfmt), `code/lint/shell` (shellcheck), `code/lint/workflows` (actionlint),
> `code/lint/house` (the house linter), `setup/ai/base` (today's `setup/ai`). An
> empty `…:all` passes. The pre-commit hooks call `code:format:all`,
> `code:lint:all`, `code:check:all` and `code:sec`, plus `graphify-refresh`.

> E12 — `.vscode/settings.json` = bootstrap's, byte for byte, an asset;
> `.config/claude-status.json` a template with `$schema` and
> `projectName: "@@PROJECT_NAME@@"`; `setup/external/{pull,start,stop}` and
> `setup:all`'s call to them under `@@#if EXTERNAL@@`;
> `git-conventional-commits.yaml` takes `SCOPES` and, under `@@#if REPO_URL@@`,
> the links; the repo-local mise skill's task table is `@@#each TASKS@@`.

> E13 — `assets/renovate/`, `references/renovate.md`, the `update_bot` key and
> every renovate path in the script and the checker.

> E16 — `code/graph`: a re-run marker with an atomic `mkdir` lock and no
> takeover — a run finding the lock held writes the marker and exits; the holder
> re-runs once if the marker is present when it finishes; a lock older than a
> timeout is cleared. Detect `.git/sequencer/` and `REVERT_HEAD` as in-progress
> operations. `setup/precommit`: a fallback when `graphify hook uninstall`
> fails, and graphify's raw hooks stripped from `.git/hooks` before
> `core.hooksPath` is unset.

> E21 — U2 deletes `scripts/src/tool-config-{core,gates,mise}.test.ts` and
> `scripts/src/fixtures/tool-config/**`, so the wave-2 gate never runs the old
> script against new assets.

User, verbatim: *"Keep `dev`, `ci` and `test` environments"*; *"stackgen's
tool-config lands `_base` and `ai/` into every repo"*; *"use bootstrap's
settings.json as is"*; *"`pnpm` is the default package manager and stays with
`node`"*.

## Edits

1. **Flatten the trees.** `assets/` and `templates/` each mirror the repo root
   directly (no per-tool subfolder): e.g. `assets/.config/dprint.json`,
   `templates/.config/mise/conf.d/_base/mise.toml`. Move every current asset to
   its new home; `rm` the old per-tool folders, `assets/renovate/` and the root
   `assets/mise/.config/mise.{dev,ci,test}.toml` and
   `conf.d/{env,env.dev,shell_alias.dev,tasks,tools,tools.dev}.toml`.
2. **`assets/`** — static, universal: `.config/mise.toml`,
   `.config/miserc.toml`, `.config/dprint.json`, `.config/taplo.toml`,
   `.config/gitleaks.toml`, `.config/grype.yaml`,
   `.config/pre-commit-config.yaml`, `.config/linter.yaml`, `.gitignore`,
   `.gitattributes`, `.graphifyignore`, `.vscode/settings.json`, root
   `dprint.json`, and every task file that carries no value (`_scripts/*`,
   `code/{count,git-config,graph,precommit,sec,worktrees}`, `code/merge/*`,
   `code/format/{dprint,shell}`, `code/lint/{shell,workflows,house}`,
   `setup/{mise,precommit,secrets,worktree}`, `setup/ai/base`). Every
   `MARKED POSITION` anchor and every `# >>> <tool>` requester block is gone;
   E8's six positions carry `tool-config` markers instead.
3. **`templates/`** — `.config/mise/conf.d/_base/{mise,mise.dev,mise.ci}.toml`,
   `.config/mise/conf.d/ai/mise.dev.toml`,
   `.config/git-conventional-commits.yaml`, `.config/claude-status.json`,
   `.claude/skills/mise/SKILL.md`, `.config/mise/tasks/setup/all`,
   `setup/external/{pull,start,stop}` (whole body under `@@#if EXTERNAL@@`), and
   the `all` task of each of `code/{check,lint,format}`,
   `setup/deps/{install,upgrade,outdated,audit,cleanup}`, `setup/ai` — each an
   `@@#each <X>_SUBTASKS@@` loop running `mise run <prefix>:@@.@@` with the file
   arguments passed through, and a one-line "nothing to run" when the list is
   empty. Use only names from the Template names table.
4. **Split the old tasks into subtasks**: today's `code/format` body becomes
   `code/format/dprint` and `code/format/shell`; `code/lint` becomes
   `code/lint/{shell,workflows,house}` (the house linter run that pack overlays
   used to carry, now universal); `setup/ai` becomes `setup/ai/base`.
5. **Pre-commit** — hooks `format`, `lint`, `check` (new, `always_run`,
   `pass_filenames: false`, `mise x -- mise run code:check:all`) and `sec`;
   `format`/`lint` call `code:format:all --fix` / `code:lint:all --fix`.
   `check-json` keeps `exclude: ^\.vscode/`.
6. **B76 / B80 item 8** in `code/graph` and `setup/precommit` per E16.
7. **Delete** the three old suites and `scripts/src/fixtures/tool-config/**`
   with `rm`.

## Verification

- `rg -n "MARKED POSITION|# >>> (mise|dprint|pre-commit|git|graphify|gitleaks|grype)\b" plugins/stackgen/skills/tool-config/assets plugins/stackgen/skills/tool-config/templates`
  prints nothing.
- `rg -n "renovate" plugins/stackgen/skills/tool-config/assets plugins/stackgen/skills/tool-config/templates`
  prints nothing.
- Every `@@NAME@@` in `templates/` is in the Template names table:
  `rg -o "@@[#/]?(if |each )?[A-Z_]+@@" -r '$0' plugins/stackgen/skills/tool-config/templates | sort -u`
  reviewed against it.
- `shellcheck` over every task file under `assets/` passes; `node -e` rendering
  each template with plan 1's `render` and a sample value set succeeds (no
  leftover `@@`).
- `mise run p:plugins:check` green; the wave gate green with the old suites
  gone.

## Guardrails

- Touch nothing outside Owns — not `scripts/**` (U4), not `stacks/**` (U3), not
  `check.ts`.
- `assets/**` and `templates/**` are dprint-excluded in this repo; never format
  them with this repo's config.
- Never `cat > file <<EOF` (cat is bat; the npm hook rewrites `npm` after a
  pipe) — use the Write tool.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config ships universal assets and templates for the new mise layout`
