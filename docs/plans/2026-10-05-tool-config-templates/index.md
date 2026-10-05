---
type: vwf-change-plan
title: tool-config renders universal files from assets and templates; packs ship
  payload and templates
requires: [ docs/plans/2026-10-05-tool-config-template-engine ]
backlog: [ B70, B74, B76, B78, B79, B84 ]
backlog_pieces: [ B80 ]
---

# Plan — tool-config renders from assets and templates (2026-10-05)

## Status

**RUNNING**

RUNNING since 2026-10-05 09:20 in .worktrees/2026-10-05-tool-config-templates

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| Release stackgen publicly                         | none    |

No after-landing steps. **No `p:plugins:local` after this plan**: the staged
stackgen would break the session's own `/vwf:setup` and `/vwf:init`, which call
`apply-entries` and the old `all` flags until plan 3 lands. Stage once, after
plan 3. **Release none** — the chain releases after plan 4. stackgen (`3.0.0`)
already sits a major above `stackgen-v2.0.0`: no manifest bump. Each pack this
plan edits takes **one patch** unless its `version:` already moved since
`stackgen-v2.0.0` (`git show stackgen-v2.0.0:<pack.yaml>`); bundle pins follow;
then `mise run p:plugins:inventory`.

## Goal

tool-config renders every universal file a repo runs from two trees — `assets/`
(copied as they are) and `templates/` (rendered with the plan-1 engine from
`.config/stackgen.yaml`): the new mise layout (`.config/mise.toml` and
`miserc.toml`, `conf.d/_base/`, `conf.d/ai/`, `conf.d/<pack>/`), universal
supersets of every list packs used to append to, the `…:all` subtask tasks,
`.vscode/settings.json`, `claude-status.json`. Packs stop calling tool-config
through a `tool-config:` list: they ship `config/` payload and a `templates/`
folder. The script keeps rows and `--answers`; it writes no lock entries and has
no `check`. renovate and the doppler pack are gone.

**Plan 2 of the four-plan chain** (1 `2026-10-05-tool-config-template-engine`, 2
this, 3 `2026-10-05-vwf-callers-on-templates`, 4
`2026-10-05-reshape-migration`). Requires plan 1's `lib/template.mjs`,
`lib/yaml.mjs`, `lib/values.mjs`.

**Reversals, confirmed by the user 2026-10-05** ("yes, confirm all ten") — U7
writes one decision doc each:

1. `2026-10-01-tool-config-renders-with-a-node-script.md:25-29` (assets are
   working files, no second template tree, `MARKED POSITION` anchors) →
   `assets/` + `templates/` with `@@`.
2. `2026-09-26-tool-config.md:27-29, 41-43` and
   `2026-10-01-script-is-the-source-of-truth.md` D4, D5, D7 (per-requester
   blocks, lock records, the script's `check`) → one `tool-config` block in six
   files, no lock entries, drift judged by the LLM.
3. `2026-10-01-mise-lockfile-dropped-exact-pins.md` D2 and
   `2026-10-01-mise-x-runs-pinned-tools.md` G8 (every pin exact; node exact in
   `tools.dev.toml`) → dev tools `latest`; node and pnpm `latest` in `_base`.
4. `2026-09-26-mise-conf-d-layout.md:25-42` (root `mise.<env>.toml`, flat
   section files, `task.run_auto_install = false`) → `_base/`, `ai/`,
   `conf.d/<pack>/`; auto-install `true`.
5. `2026-09-26-tool-config-gates.md` and
   `2026-09-27-tool-config-hygiene.md:27-32` (the base keeps universal entries,
   packs add theirs) → universal supersets.
6. `2026-10-01-pack-entries-are-structured.md`, `2026-09-26-tool-config.md`
   items 6 and 10 (pack `tool-config:` lists, `machine_env`, `set-env`) → packs
   ship payload and templates.
7. `2026-10-01-editor-config-dropped.md` E1–E3 (B40, no editor config) → a
   universal `.vscode/settings.json`.
8. `2026-09-27-tool-config-hygiene.md:24-26` (renovate lands on `update_bot`) →
   renovate dropped.
9. `2026-09-12-task-library-configures-each-gate-once.md:40-46` (hooks call
   `code:format`, `code:lint`) → hooks call `code:{format,lint,check}:all`.
10. Memory `mise-experiments-must-isolate-home` (never ship a project-level
    `npm.package_manager`) → `npm.package_manager = "pnpm"` in `_base`.

The user's words that shape the layout, verbatim: *"`mise` is something I have
fixed in `~/Projects/github.com/virajp/bootstrap/.config`"*; *"For all `dev`
tools, use `version = "latest"` and only for tools that are used in `ci` will
have exact versions"*; *"if the repo is built with `node` (which is very high
probability) then `node` and `pnpm` must be setup in `mise.toml`. Node has very
good backward compatibility and thus `latest` won't really hurt"*; *"CI must
only run tests, like vitest or something"*; *"If there's a pack that might need
to add entry then simply add them whether or not the pack is installed"*.

## Facts the survey established

- **Reference layout** — `~/Projects/github.com/virajp/bootstrap/.config/`
  (read-only, never edited): `mise.toml` (`min_version = "2026.10.0"`,
  `[settings]`), `miserc.toml` (`env_conf_d = true`),
  `mise/conf.d/_base/mise.toml` (node, pnpm, osv-scanner, `npm.package_manager`,
  `node.compile`, `_.path`, `MEMBERS`, `MERGE_MODEL`, `REPO_NAME`),
  `_base/mise.dev.toml` (pipx/python/uv settings, python, uv, pre-commit, grype,
  gitleaks, dprint, taplo, `tasks.init` with
  `dir = "{{exec(command='git rev-parse --show-toplevel')}}"`, shell aliases,
  `UV_NO_CACHE`, `UV_NO_MANAGED_PYTHON`, `UV_PYTHON_DOWNLOADS`),
  `_base/mise.ci.toml` (`node.gpg_verify = false` with its comment),
  `ai/mise.dev.toml` (jq, yq, `pipx:mempalace`, `pipx:graphifyy`, the
  `MEMPALACE_*` env,
  `MEMPALACE_PALACE_PATH = "~/.local/share/mempalace/<repo>"`),
  `.vscode/settings.json`, `.config/claude-status.json`. Bootstrap's **task
  library is older than the shipped one** — the shipped tasks are the reference
  (user: "Newer").
- **mise conf.d folders** — mise loads folder fragments (`conf.d/<name>/`) after
  single-file fragments, alphabetically by folder name, with the same env/local
  suffix rules (docs: "conf.d folders"). Precedence between two folders pinning
  one tool is undocumented → a tool is pinned in exactly one folder.
- **Current script** — `plugins/stackgen/skills/tool-config/scripts/`, ~9.7k
  lines. Reusable: `lib/rows.mjs` (rows, answers, preview store), `lib/run.mjs`
  (Runner: mise, trust, `mise which`, setup:all), `lib/cli.mjs` (flag grammar —
  drop `apply-entries`/`check`/`all <verb>`), `tool-config.mjs` path safety
  (~161-185), `lineDiff`/`fileRows` (649-732), `land()` (953-1022: setup:all,
  formatter, validate-config), `repoRootOf`, the preview/answers/exit flow
  (~1080-1191), the pin resolver (`lib/tools/mise.mjs:577-640`). Obsolete:
  `lib/{blocks,drift,record}.mjs`, `lib/tools/*`, `lib/schema.mjs` (but
  `scripts/src/check.ts:39,65-70` imports it — U5 deletes it).
- **Plan 1 modules** — `lib/template.mjs` `render(template, values, {source})`;
  `lib/yaml.mjs` `parseYaml`; `lib/values.mjs` `readStackgen`, `deriveOrigin`,
  `loadValues(repoRoot, {pack})`, `toNames`. Not edited here.
- **Tests** — `scripts/src/tool-config-{core,gates,mise}.test.ts` (~4.1k lines)
  and `scripts/src/fixtures/tool-config/{gates,mise}/*.json` are written against
  the verbs and the lock — U2 deletes them, U4 writes new suites.
- **Checker** — `scripts/src/check.ts`: rule 11 (`checkPackConfigTier` 501-664,
  `packFactFaults` 665-834 incl. the `tool-config:` list 736-812 and
  `machine_env` 790-805, string grammar 817-854, `TOOL_CONFIG_ROOT_FILES`
  409-440, renovate paths 410-419, `update_bot` enum 876), rule 15 (exclusion
  sets 1766-2015), rule 16 (270-316), init assets walk `landedTree(..., null)`
  483-486. Tests `check.test.ts` ~399-1038, 1771. Rule docs
  `.claude/skills/plugin-authoring/references/checks.md:141-199, 270-279`.
- **Packs** — 20 `pack.yaml` carry `tool-config:`; only swiftui carries
  `machine_env` (`app-framework/swiftui/pack.yaml:37-77, 92-111`). Entries, by
  pack (paths under `plugins/stackgen/stacks/`):
  - dprint plugins: dockerfile (containers, cloud-run, container-image), malva
    (html, astro, stylex, plain-css, tailwindcss), markup_fmt (html, astro),
    typescript (typescript).
  - excludes: node_modules, .turbo (pnpm, generated); `*-lock.json`,
    `*-lock.yaml` (pnpm); .venv (uv, generated); .build, .swiftpm (swiftpm,
    generated); Derived, DerivedData (swiftui, generated); `*.xcassets/`
    (swiftui).
  - linter ignores: .venv, .build, .swiftpm, .dart_tool, Derived, DerivedData.
  - gitignore templates Node, Python, Dart, Swift, Flutter; lines
    `fnox.local.toml`, `.doppler/`. Attributes `pnpm-lock.yaml` as
    `linguist-generated`, `Package.resolved` as `linguist-generated`.
  - mise: pnpm `npm:sort-package-json` 4.0.0 dev and alias `npx = "pnpm dlx"`;
    swiftlint `aqua:realm/SwiftLint` 0.65.1 all; fnox `fnox` latest all; doppler
    (deleted here); swiftui four empty env values; claude-code
    `add-plugin taste-skill@taste-skill source=Leonxlnx/taste-skill`.
  - hook: uv `uv-lock-check` (`entry: mise x -- uv lock --check`, files
    `(^|.*/)pyproject\.toml$`).
- **Task overlays** (`config/.config/mise/tasks/**`): `code/lint` — flutter,
  swiftui, swift, pnpm, eslint (byte-identical to pnpm's), ruff; `code/format` —
  flutter, swiftui, swift (swift and swiftui byte-identical), pnpm, ruff;
  `setup/deps/{audit,cleanup,install,outdated,upgrade}` — flutter, swiftui,
  swift, pnpm, uv; `setup/secrets` — fnox, doppler; unique: `p/_project/deploy`
  (containers, workers-ssr, workers-static-assets), `p/_project/icons` (astro,
  html), `test/golden` and `_scripts/xcode` (swiftui). swift's lint calls
  swiftlint, its format swift-format; both swift bundles include
  `toolchain-gate/swiftlint` and `toolchain-gate/swift-format`.
- **B74** — `stacks/cloud-service/containers/config/wrangler.jsonc` lacks
  trailing commas (lines 27, 28, 35-37, 44, 45, 49, 50); the other two
  `wrangler.jsonc` pass.
- **Pack versions** — each pack's `version:` line (e.g. pnpm `:4` 0.6.1);
  bundles `stacks/bundles/*.md` frontmatter `components:` pins
  `<type>/<slug>@<x.y.z>`; `mise run p:plugins:inventory` regenerates
  `stacks/inventory.md`.
- **Commit convention** — types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes.
- **Gates** — `plugins.yml` (CI, `MISE_ENV=ci`) runs marketplace/inventory
  `--check`, `p:plugins:check`, `pnpm vitest run`, npm-normalize-test, tsc for
  installer and scripts. Pre-commit runs `p:plugins:check` on `^plugins/` with
  unstaged files stashed — a commit sees the other units' old files.
- **Docs that describe today's behaviour** — tool-config `SKILL.md` (594 lines)
  and `references/*.md`;
  `plugins/stackgen/assets/{pack-format,output-tree,taxonomy,kinds}.md`;
  `skills/stackgen-stack-template/{SKILL.md,references/materializer.md}`;
  `skills/stackgen-sync/SKILL.md`; `stacks/readme.md`; the conventions and
  bundle docs listed in U6; `site/src/content/docs/plugins/stackgen.md` (109
  hits); `.claude/skills/stackgen-plugin/SKILL.md`;
  `.claude/docs/{repo-shape,ci-and-releases,plugins}.md`;
  `CLAUDE.md:164,187-188,218,241,290,393`; `readme.md:301-320`; how-to pages
  `site/src/content/docs/how-to/{brownfield/migrate-old-vwf-repo,brownfield/onboard-existing-codebase,greenfield/single-repo,greenfield/multi-repo,operate/choosing-your-stack}.md`.
  vwf's docs (`plugins/vwf/**`, `site/.../plugins/vwf.md`,
  `.claude/skills/vwf-plugin/**`) are plan 3's.

## Template names

The contract between U2 (templates), U3 (pack templates) and U4 (the script that
computes them). Stored names come from `.config/stackgen.yaml` through plan 1's
`loadValues`; derived names U4 computes on every render.

| Name                                                                | Kind                          | Source                                                                                                                        |
| ------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `REPO_NAME`, `FORGE`, `SECRETS`                                     | string                        | stored                                                                                                                        |
| `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN`                           | string                        | stored, defaults `direct` / `pr`                                                                                              |
| `MEMBERS`, `SCOPES`                                                 | list                          | stored                                                                                                                        |
| `NODE`, `EXTERNAL`                                                  | bool                          | stored                                                                                                                        |
| `REPO_URL`, `PROJECT_NAME`                                          | string                        | derived from `origin` (plan 1); `PROJECT_NAME` falls back to `REPO_NAME` when there is no origin (U4)                         |
| `MEMBERS_SPACED`                                                    | string                        | derived: `MEMBERS` joined by one space                                                                                        |
| `MEMBER_ENTRIES`                                                    | list of `{path, slug}`        | derived: each member path and its slug (lowercase, `[a-z0-9-]`)                                                               |
| `CHECK_SUBTASKS`, `LINT_SUBTASKS`, `FORMAT_SUBTASKS`, `AI_SUBTASKS` | list                          | derived: leaf names of the task files under `code/check/`, `code/lint/`, `code/format/`, `setup/ai/`, excluding `all`, sorted |
| `DEPS_INSTALL_SUBTASKS` … `DEPS_CLEANUP_SUBTASKS`                   | list                          | derived: the same, under `setup/deps/<verb>/` for install, upgrade, outdated, audit, cleanup                                  |
| `TASKS`                                                             | list of `{name, description}` | derived: every task the rendered tree defines, for the mise skill's table                                                     |
| a pack's own keys (`XCODE_VERSION`, …)                              | string                        | `packs.<slug>.*`, visible only to that pack's templates                                                                       |

## Assumed decisions — confirm or override at review

| #   | Decision                  | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Rejected                                                       | Unit       |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ---------- |
| E1  | The script's surface      | `[preview] all` with `--repo-name`, `--merge-model-develop`, `--merge-model-main`, `--members`, `--scopes`, `--node`, `--external`, `--forge`, `--secrets`, `--answers` writes any given values into `.config/stackgen.yaml`, then renders every asset and template, the `_base/` and `ai/` folders and the `…:all` tasks, then the existing tail (setup:all on `all`, formatter, validate-config). `[preview] pack --slug <s> --dir <dir>` with repeatable `--set key=value` and `--answers` writes `packs.<s>` values, renders the pack's `templates/` into the repo, re-renders the `…:all` tasks. `[preview] pack-remove --slug <s>` with `--answers` deletes `conf.d/<s>/` and every subtask file named `<s>`, removes `packs.<s>`, re-renders the `…:all` tasks. `[preview] upgrade` with `--answers` moves exact pins forward, one row per pin. Retired: every per-tool verb, `apply-entries`, `check`, `remove --for`, `all add-exclude`, `--for`. The script is the only writer of `stackgen.yaml`. | callers write `stackgen.yaml` by hand                          | U4         |
| E2  | Pack templates            | A pack has `templates/` beside `config/`. The materializer copies `config/` and keeps its lock exactly as today; the script renders `templates/` to the same relative paths. The script never copies static payload.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `.tmpl` suffix in `config/`; the script copies everything      | U3, U4     |
| E3  | Pins                      | Dev-only files (`mise.dev.toml`) keep `version = "latest"`. In every mise file a CI environment loads (`mise.toml`, `mise.ci.toml`, `mise.test.toml`, universal or pack) the script resolves each `latest` to an exact version with `mise latest <tool>` at render, except `node` and `pnpm`, which stay `latest`. A pack's mise files always live in its `templates/`. `upgrade` moves the exact pins.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | hardcoded exact pins in packs; pins as template values         | U2, U3, U4 |
| E4  | mise layout               | `.config/mise.toml` holds `min_version = "2026.10.0"` and `[settings]` only; `.config/miserc.toml` holds `env_conf_d = true`; no root `mise.<env>.toml`. `conf.d/_base/mise{,.dev,.ci}.toml` and `conf.d/ai/mise.dev.toml` in every repo; `conf.d/<pack>/` per pack; `conf.d/<project>/` hand-written. Environments dev, ci, test. node, pnpm, `npm.package_manager = "pnpm"`, `node.compile = false` and `_.path = node_modules/.bin` sit in `_base/mise.toml` under `@@#if NODE@@`, else in `_base/mise.dev.toml`; `node.gpg_verify = false` in `_base/mise.ci.toml` under `NODE`.                                                                                                                                                                                                                                                                                                                                                                                                                         | root env files; flat section files                             | U2         |
| E5  | Settings                  | From bootstrap: `min_version = "2026.10.0"`, `task.run_auto_install = true`, `pipx.uvx`/`python.compile`/`python.uv_venv_auto` and the three `UV_*` env in `_base/mise.dev.toml`, `tasks.init` with `dir` = the git toplevel. Kept from the shipped files: `lockfile = false`, `minimum_release_age = "10h"`, `task.disable_spec_from_run_scripts`, `task.output`, `task.timings`, `PRE_COMMIT_HOME`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —                                                              | U2         |
| E6  | `_base` and `ai` contents | `_base/mise.toml` `[env]`: `REPO_NAME`, `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN`, `MEMBERS` (`@@MEMBERS_SPACED@@`). `_base/mise.dev.toml` tools, all `latest`: osv-scanner, python, uv, pre-commit, dprint, taplo, gitleaks, grype, shellcheck, shfmt, actionlint, `npm:@askviraj/linter` (B70), plus node/pnpm when not `NODE`; shell aliases `precommit`, `setup`, `worktrees` and one `setup-<slug>` per `MEMBER_ENTRIES`. `ai/mise.dev.toml`: bootstrap's as is, `MEMPALACE_PALACE_PATH = "~/.local/share/mempalace/@@REPO_NAME@@"` the only value. A tool is pinned in exactly one folder.                                                                                                                                                                                                                                                                                                                                                                                                             | linter pinned per pack (B70's candidate)                       | U2         |
| E7  | Universal supersets       | `.gitignore`: a curated list grouped by stack (node, python, dart/flutter, swift/xcode, secrets incl. `fnox.local.toml`, mise locals as bare `mise.local.toml` and `mise.*.local.toml` plus `**/mise.local.lock`, `graphify-out/` — B84), never upstream templates; `.gitattributes`: the base plus `pnpm-lock.yaml` as `linguist-generated` and `Package.resolved` as `linguist-generated`; the exclude set — dprint (every path as the `../X` + `**/X` pair, `includes: ["../**"]`), taplo, pre-commit `exclude`, linter ignores — with every pack exclude and ignore from the facts; the gitleaks allowlist the generated subset; dprint carries every plugin (dockerfile, malva, markup_fmt, typescript and the base's).                                                                                                                                                                                                                                                                                 | vendored upstream templates; per-pack additions                | U2         |
| E8  | Markers                   | `# >>> tool-config` / `# <<< tool-config` (`// >>> tool-config` in dprint's JSONC) wrap the rendered lines only in `.gitignore`, `.graphifyignore`, dprint's `excludes`, `linter.yaml`'s `ignores`, the gitleaks allowlist and the pre-commit global `exclude`. Lines outside are the repo's own and survive every render. Every other file is owned whole.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | per-requester blocks                                           | U2, U4     |
| E9  | Subtasks                  | `code:check:all`, `code:lint:all`, `code:format:all`, `setup:deps:<verb>:all` (install, upgrade, outdated, audit, cleanup) and `setup:ai:all` are templates calling each subtask by name, re-rendered whenever a pack adds or removes one. Universal subtasks: `code/format/dprint`, `code/format/shell` (shfmt), `code/lint/shell` (shellcheck), `code/lint/workflows` (actionlint), `code/lint/house` (the house linter), `setup/ai/base` (today's `setup/ai`). An empty `…:all` passes. The pre-commit hooks call `code:format:all`, `code:lint:all`, `code:check:all` and `code:sec`, plus `graphify-refresh`. User: "your task name then changes to `code:check:all` as `code:check` requires `check` to be a file".                                                                                                                                                                                                                                                                                    | whole-file overlays; byte-identical dedupe                     | U2, U3, U4 |
| E10 | One owner per tool        | `code/format/swift-format`, `code/lint/swift-format` — swift-format pack; `code/lint/swiftlint` — swiftlint; `code/lint/eslint` — eslint; `code/format/ruff`, `code/lint/ruff` — ruff; `code/format/dart`, `code/lint/dart` — flutter; pnpm keeps only its own steps (e.g. sort-package-json); `setup/deps/<verb>/<slug>` for flutter, swiftui, swift, pnpm, uv; `code/check/uv` (the uv lock check, for a Python project); `setup/ai/claude-code` (taste-skill). language/swift and swiftui drop their format and lint overlays. A pack subtask carries only its own tool's steps.                                                                                                                                                                                                                                                                                                                                                                                                                          | language packs own the tools                                   | U3         |
| E11 | Whole-owned files         | With no lock, a whole-owned file that differs from a fresh render is one row carrying the diff, answered `ok` (take the render) or `keep-existing`. A template that renders empty is not written; an existing copy is a delete row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | lock hashes                                                    | U4         |
| E12 | Single files              | `.vscode/settings.json` = bootstrap's, byte for byte, an asset; `.config/claude-status.json` a template with `$schema` and `projectName: "@@PROJECT_NAME@@"`; `setup/external/{pull,start,stop}` and `setup:all`'s call to them under `@@#if EXTERNAL@@`; `git-conventional-commits.yaml` takes `SCOPES` and, under `@@#if REPO_URL@@`, the links; the repo-local mise skill's task table is `@@#each TASKS@@`. pre-commit's `check-json` keeps `exclude: ^\.vscode/`; the stale vscode comment stays.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                                                              | U2         |
| E13 | Renovate removed          | `assets/renovate/`, `references/renovate.md`, the `update_bot` key and every renovate path in the script and the checker.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                              | U2, U4, U5 |
| E14 | Doppler deleted           | The doppler pack, its bundle and its `setup/secrets` overlay are deleted (`rm`). The fnox plan, re-planned after plan 4, drops its doppler units.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | convert, then delete later                                     | U3         |
| E15 | swiftui values            | `XCODE_VERSION`, `SIMULATOR_PLATFORM`, `SIMULATOR_DEVICE`, `SIMULATOR_OS` become `@@…@@` in `templates/.config/mise/conf.d/swiftui/mise.toml`; `machine_env` leaves its `pack.yaml`; the `set-env` hints in `_scripts/xcode` and `test/golden` name the new remedy (`/vwf:setup`, which plan 3 wires to `pack --set`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `machine_env` kept                                             | U3         |
| E16 | B76 and B80 item 8        | `code/graph`: a re-run marker with an atomic `mkdir` lock and no takeover — a run finding the lock held writes the marker and exits; the holder re-runs once if the marker is present when it finishes; a lock older than a timeout is cleared. Detect `.git/sequencer/` and `REVERT_HEAD` as in-progress operations. `setup/precommit`: a fallback when `graphify hook uninstall` fails, and graphify's raw hooks stripped from `.git/hooks` before `core.hooksPath` is unset.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `flock` where present                                          | U2         |
| E17 | B74                       | `stacks/cloud-service/containers/config/wrangler.jsonc` formatted with the **shipped** dprint config (`mise x -- dprint fmt --config <tool-config assets>/.config/dprint.json <file>`), never this repo's.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —                                                              | U3         |
| E18 | B78                       | Retiring `tool-config:` moots items 1, 3, 4. Item 2: the init assets walk gains a root allowlist — `CONTRIBUTING.md`, `SECURITY.md`, `licenses/`, `.github/ISSUE_TEMPLATE/`; anything else is a finding.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | won't-fix                                                      | U1         |
| E19 | Checker in two steps      | U1 widens (wave 1): accept a pack `templates/` folder, subtask paths, a pack with no `tool-config:`; add E18. U5 tightens (wave 3): refuse `tool-config:` and `machine_env` keys, validate that a pack's `templates/` uses only `@@` names from the Template names table or its own `packs.<slug>` keys, drop the `schema.mjs` import and delete it, rewrite rule 15's readers for the new asset paths. Commit order in wave 3: U4 then U5.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | one checker unit (no commit order passes pre-commit)           | U1, U5     |
| E20 | Inventory mid-run         | U3 runs `mise run p:plugins:inventory` and commits `inventory.md` with its pack edits — the one exception to "units never run generators"; U8 regenerates it after the bumps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | inventory gate red until U8                                    | U3         |
| E21 | Old suites                | U2 deletes `scripts/src/tool-config-{core,gates,mise}.test.ts` and `scripts/src/fixtures/tool-config/**`, so the wave-2 gate never runs the old script against new assets; U4 writes new suites in wave 3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | assets and script in one wave (tests read half-written assets) | U2, U4     |
| E22 | Review row                | One `review` row: runnable code lands (the script, the checker, the task scripts).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | wave review only                                               | R          |
| E23 | No staging, no release    | No `p:plugins:local` until plan 3; release none; packs patch once since `stackgen-v2.0.0`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | stage after plan 2                                             | U8         |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                                | Kind   | Owns                                                                                                                                                                                                                                                                                                                                            | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-checker-widen.md](01-checker-widen.md)               | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                             | —          | green   | f075c75f |
| U2 | 2    | [02-assets-and-templates.md](02-assets-and-templates.md) | edit   | `plugins/stackgen/skills/tool-config/assets/**`, `plugins/stackgen/skills/tool-config/templates/**`; deletes `scripts/src/tool-config-{core,gates,mise}.test.ts`, `scripts/src/fixtures/tool-config/**`; widened at run time (W1): the `assets/<tool>/` link paths only in `plugins/stackgen/skills/tool-config/SKILL.md` and `references/*.md` | U1         | green   | 188b08cc |
| U3 | 2    | [03-packs.md](03-packs.md)                               | edit   | `plugins/stackgen/stacks/**` — `pack.yaml` (not `version:`), `config/**`, `templates/**`, doppler pack and `bundles/doppler.md` (deleted), `stacks/inventory.md` (regenerated)                                                                                                                                                                  | U1         | green   | 98116003 |
| U4 | 3    | [04-script.md](04-script.md)                             | edit   | `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`, `scripts/lib/**` except `schema.mjs`, `template.mjs`, `yaml.mjs`, `values.mjs`; new `scripts/src/tool-config-*.test.ts` and `scripts/src/fixtures/tool-config/**`                                                                                                                | U2, U3     | green   | ca08c79f |
| U5 | 3    | [05-checker-tighten.md](05-checker-tighten.md)           | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs` (deleted), `.claude/skills/plugin-authoring/references/checks.md`                                                                                                                                                             | U2, U3     | green   | 31a41ade |
| R  | 4    | [06-review.md](06-review.md)                             | review | —                                                                                                                                                                                                                                                                                                                                               | U1, U4, U5 | pending |          |
| U6 | 5    | [07-stackgen-prose.md](07-stackgen-prose.md)             | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/**`, `plugins/stackgen/assets/**`, `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/stacks/**/*.md` except `inventory.md`                                                    | R          | pending |          |
| U7 | 6    | [08-docs.md](08-docs.md)                                 | edit   | `site/src/content/docs/**` except `plugins/vwf.md`, `.claude/**` except `.claude/skills/vwf-plugin/**` and `checks.md`, `readme.md`, `CLAUDE.md`, `docs/memory/decisions/2026-10-05-*.md` (new)                                                                                                                                                 | U6         | pending |          |
| U8 | 7    | [09-gates-and-bump.md](09-gates-and-bump.md)             | edit   | each edited pack's `version:` line, every bundle pin naming them, `plugins/stackgen/stacks/inventory.md`, `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                                             | U7         | pending |          |

## Shared-file rule

| File                                                | Why it collides                        | Owner                                         |
| --------------------------------------------------- | -------------------------------------- | --------------------------------------------- |
| `scripts/src/check.ts`, `check.test.ts`             | widened in wave 1, tightened in wave 3 | U1 then U5 — never the same wave              |
| `plugins/stackgen/stacks/inventory.md`              | generated                              | U3 (wave 2), U8 (wave 7)                      |
| `stacks/**/pack.yaml` `version:` lines, bundle pins | version files                          | U8 only                                       |
| `stacks/**/*.md` prose (conventions, bundle docs)   | U3 moves files, U6 rewrites the prose  | U6 — U3 only deletes `bundles/doppler.md`     |
| `scripts/src/fixtures/tool-config/**`               | deleted by U2, recreated by U4         | U2 (wave 2) then U4 (wave 3)                  |
| every human-facing doc                              | n units editing one doc                | U6 (plugins/stackgen prose), U7 (the rest)    |
| `plugins/vwf/**`                                    | plan 3's                               | nobody here — a falsified passage is a `GAP:` |
| this repo's own `.config/**`                        | the user edits it by hand              | nobody                                        |

## Waves

- **Wave 1** — U1 alone: widening first keeps every later commit's pre-commit
  `p:plugins:check` green against both the old and the new shapes.
- **Wave 2** — U2 and U3: disjoint trees (`tool-config/` vs `stacks/`); U2
  deletes the old suites so the gate never runs the old script on new assets.
- **Wave 3** — U4 and U5: disjoint files (U5 owns `schema.mjs`; U4 must not
  import it). Commit U4 first — its pre-commit still finds `schema.mjs`, which
  the widened checker imports; then U5.
- **Wave 4** — R. **Wave 5** — U6. **Wave 6** — U7. **Wave 7** — U8.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

none.

## Gates the orchestrator keeps

The **scratch-repo run**, after wave 3 and again after U8: a temporary git repo
with an `origin` remote set, an isolated `HOME`, `MISE_DATA_DIR`,
`MISE_CONFIG_DIR`, `MISE_CACHE_DIR` and `MISE_STATE_DIR`, the isolated global
mise config setting `trusted_config_paths` to the scratch path, `node` and
`mise` on `PATH`, network available (memory
`mise-experiments-must-isolate-home`):

1. `node plugins/stackgen/skills/tool-config/scripts/tool-config.mjs all --repo-name scratch --node true --answers <every row ok>`
   lands every asset and template, writes `.config/stackgen.yaml`, runs
   `setup:all`, formats and validates; no `needs-edit` row.
2. The same `preview all` returns **no rows**.
3. `mise x -- dprint check` and
   `mise x -- pre-commit validate-config --config .config/pre-commit-config.yaml`
   pass.
4. `pack --slug swiftui --dir plugins/stackgen/stacks/app-framework/swiftui --set xcode_version=16.2 …`
   renders `.config/mise/conf.d/swiftui/mise.toml` with the values, and
   `.config/mise/tasks/code/lint/all` names the swiftui-owned subtasks it
   rendered (none of language/swift's).
5. `pack-remove --slug swiftui` removes them and re-renders the `…:all` tasks.
6. `MISE_ENV=ci mise ls --current` lists exact versions for every tool, except
   node and pnpm (`latest`).

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the Template
names table, the shared-file rule, and the return block below. A unit never
bumps a version, never runs a generator (E20 is U3's one exception), never edits
a doc outside its Owns, never adds a dependency this file does not list, never
commits, never runs `git checkout`/`git restore` or a formatter `--fix` outside
its Owns. A unit deletes with plain `rm`, never `git rm` — it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file; directories may be summarised)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- vwf's callers — init's `all` flags and `stackgen.yaml` writes, setup's
  `apply-entries`/`set-env`, doctor's `check`, the materializer calling `pack`
  and recording rendered pack templates, the "shaped" signal — plan 3.
- Migrating old-layout repos — plan 4.
- This repo's own `.config/` — the user edits it by hand.
- A `ci`-run gate: CI runs tests only (user ruling); no shipped workflow runs a
  gate today.

## Parked

- B80: items 2 (doctor remedy `MISE_ENV=dev mise run setup:precommit`) and 4
  (setup's memory-tree banner) — plan 3 `2026-10-05-vwf-callers-on-templates`.
- B80: items 1 (init hygiene assets have no record) and 9 (installer notice) —
  left open on the backlog.
- fnox: re-plan `2026-10-02-fnox-dev-only` after plan 4 is written, keeping its
  rulings D1–D16, rewriting `FNOX_PROFILE` into `templates/conf.d/fnox/`,
  `fnox.local.toml` into the universal `.gitignore`, dropping the doppler units.
- Plan 3: the "shaped" signal; the materializer calling `pack`/`pack-remove` and
  recording the rendered pack templates in its lock; `update_bot` and the
  `answers` move out of `vwf.yaml`; `/vwf:setup` filling pack values with
  `pack --set`; doctor's drift judged by the LLM; vwf's prose naming retired
  verbs.

## Gaps surfaced during execution

- **G1** (scratch-repo gate, wave 3): the shipped root `dprint.json` is
  `{"extends": ".config/dprint.json"}`, and dprint 0.60.1 refuses `includes` in
  an extended config, so a bare `dprint check` (an editor's call) exits 11. The
  gates name `--config .config/dprint.json` and pass. The shim predates this
  plan; E7's `includes: ["../**"]` is what breaks it. Assumption: left as is,
  ruling needed (drop the shim, or move `includes` out).
- **G2** (scratch-repo gate, wave 3): the plan's step 3 line
  `pre-commit validate-config --config …` is unrunnable (`--config` is not an
  argument); the positional form passes. Steps 4 and 6 passed but exercised less
  than written: swiftui's templates hold no task files, and CI loads only node
  and pnpm, so no exact CI pin is rendered by `all`.

- **G3** (review row R, round 1): the plan defines no reserved slug set for
  `pack`/`pack-remove`. Assumption: the script and the checker refuse the slugs
  `all`, `ai` and `_base`; `pack-remove` never deletes a path tool-config's own
  `assets/` or `templates/` ships, so the shipped `cloud-service/workflows` pack
  keeps its slug and its removal cannot delete `code/lint/workflows`; the
  checker refuses a pack subtask whose leaf is a universal subtask leaf.
- **G4** (review row R, round 1): E11's empty-render delete row and the
  `#PLACEHOLDER` filled-slot rule conflict. Assumption: the filled slot wins — a
  hand-filled file is never offered for deletion.
- **G5** (review row R, round 1): E10 names flutter's subtasks `dart`, U1's
  leaf-equals-slug rule forces `flutter` — U3's `flutter` stands.

## Rulings during execution

- **W1** (user, 2026-10-05, wave 2): U2's Owns widens to the `assets/<tool>/`
  link paths in tool-config `SKILL.md` and `references/*.md` (paths only — U6
  still rewrites the prose); U1 loops back to make rule 15 read the flat asset
  paths, JSONC and the `../` + `**/` pairs, so wave 2 passes its gate.
- **W2** (user, 2026-10-05, wave 2): check-json keeps U2's extra
  `^\.config/dprint\.json$` exclude (E8's markers make it JSONC); its original
  comment is restored per E12.
- **W3** (user, 2026-10-05, wave 2): the orchestrator adds the template trees
  (`tool-config/templates/`, `stacks/*/*/templates/`) and the JSONC asset paths
  to this repo's own `.config/{dprint.json,linter.yaml,pre-commit-config.yaml}`
  exclusion sets, in its own `ops:` commit.
- **W4** (user, 2026-10-05, wave 2): no `code/lint/eslint` — eslint runs only
  through `@askviraj/linter`, which needs the eslint config the installer
  generates; the universal `code/lint/house` covers it. U3's GAP closed.
- **W5** (user, 2026-10-05, wave 2): fnox's `setup/secrets` overlay supersedes
  the universal placeholder `setup/secrets`. U3's GAP closed.
- **W6** (user, 2026-10-05, wave 2): doppler is gone, replaced by fnox; any
  remaining doppler mention is stale (vwf's `assets/memory.md` → plan 3).
- **W7** (user, 2026-10-05, wave 2): `linter.yaml` is generated by the installer
  only when absent, so tool-config may ship it as a static asset or a template;
  rule 15 need not compare its ignores. U1's GAP closed.
- **W8** (user, 2026-10-05, wave 3): E19's pack-template name check is
  grammar-only. A pack's own keys live in the target repo's `stackgen.yaml`, so
  the checker allows any upper-snake name there, and values.mjs refuses a
  colliding key at render. No colliding-name test case. U5's GAP closed.

## Run log

| Wave | Unit      | Model | Round | Outcome      | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Commit   |
| ---- | --------- | ----- | ----- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | —     | green        | all 7 wave gate lines green on develop e53f4a10; mise and graphify present, graph in main checkout; format check skipped (no `covers:`); stack conventions skipped (no `code` unit); order U1 → U2,U3 → U4,U5 → R → U6 → U7 → U8                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 1    | U1        | opus  | 1     | green        | templates tier walked under landed-tree rules + LANDED_TIERS; subtask leaf must equal pack slug; init asset root allowlist; 9 new tests (181 pass). DECIDED: any `setup/deps/<verb>` segment, leaf only policed; kept "pack config/ tier" wording for U5. DOCS FALSIFIED: checks.md rules 11, 13 (U5's)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | f075c75f |
| 1    | R1        | opus  | 1     | pass         | 1 rule-5 finding: `.claude/docs/repo-shape.md:165` says init asset trees walk "with no root allowlist" — within U7's Owns (`.claude/**`), handed to U7 as DOCS FALSIFIED, no loop. CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 2    | U3        | opus  | 1     | green        | 19 pack.yaml drop `tool-config:`, swiftui `machine_env` gone; mise templates for pnpm, swiftlint, fnox, swiftui (`@@XCODE_VERSION@@` + 3 SIMULATOR_*); per-pack subtasks per E10; doppler pack + bundle rm; containers wrangler.jsonc formatted (B74); inventory regenerated. DECIDED: flutter subtask leaf `flutter` (checker needs slug leaf, not `dart`); code subtasks `hide=true`; swift-format format=`--fix` in place. GAP: eslint overlay was house linter only, now universal `code/lint/house` — no `code/lint/eslint` shipped. GAP: fnox `setup/secrets` overlay kept, collides with universal `setup/secrets`. DOCS FALSIFIED: 11 conventions.md, swift bundles, stacks/readme.md, flutter testing.md, eslint/swift-format/swiftlint SKILL.md, swift build-and-run.md, swiftui standards (U6's)                                                                 |          |
| 2    | U3        | opus  | 2     | green        | aligned to U2's subtask flag contract (relayed): `setup/ai/claude-code` sources `_scripts/plugins` + `ensure_plugin`; `code/check/uv` declares `--debug` and `[files]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 98116003 |
| 2    | U2        | opus  | 1     | unresolved   | assets flattened to repo-root shape, renovate gone, `.vscode/settings.json` byte-copied, universal sets with E8 markers, hooks call `…:all`, universal subtasks + `_scripts/plugins`, E16 in `code/graph` and `setup/precommit`; templates for `_base`, `ai`, conventional commits, claude-status, mise skill, `setup/all`, `setup/external/*`, 9 `…:all` tasks; old suites rm. DECIDED: `tasks.init` in `_base/mise.toml` (CI needs it); `code/all`, `setup/deps/all` stay assets; check-json also excludes `.config/dprint.json` (JSONC with markers); graph lock clears after 30 min. UNRESOLVED: `p:plugins:check` red, 20 findings — 16 stale `assets/<tool>/` links in tool-config SKILL.md + references (U6's, wave 5), 4 rule-15 hard-coded per-tool asset paths (U5's, wave 3); U1 never widened for the flat assets, so wave 2 cannot pass its gate or pre-commit |          |
| 2    | R2        | opus  | 1     | findings(3)  | RULINGS: U2 departed from E12 — check-json `exclude` grew to `^\.vscode/` plus `^\.config/dprint\.json$` and its comment was rewritten (forced by E8's `//` markers making dprint.json JSONC); needs a ruling, not looped since U2 is blocked. Rule 5, no loop: `stacks/design-tool/claude-code/skills/design-session/SKILL.md:68` names `mise run setup:ai` → U6; `site/src/content/docs/plugins/stackgen.md:240` names `capability-provider/doppler` → U7; `plugins/vwf/assets/memory.md:161` lists `.doppler/` → GAP for plan 3. CONTRACT clean; `.vscode/settings.json` byte-identical; markers at E8's six places; every `@@` name in the table                                                                                                                                                                                                                        |          |
| 2    | U2        | opus  | 2     | green        | per W1/W2: `assets/<tool>/` link paths in tool-config SKILL.md + 7 references now read `assets/`; renovate row dropped, `references/renovate.md` rm (E13); check-json comment restored, dprint.json exclude kept. 16 link findings gone; 4 rule-15 findings remain for U1. DOCS FALSIFIED: tool-config SKILL.md/references prose (U6's)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 188b08cc |
| 2    | U1        | opus  | 2     | green        | per W1: rule 15 reads the four lists at flat `assets/.config/*` (per-tool fallback), dprint.json as JSONC, `../X` ≡ `**/X`; flat `assets/` + `templates/` walked as landed trees; shebang check skips a leading `@@#if NAME@@` guard; 184 tests pass; p:plugins:check clean. DECIDED: flat tree detected by `assets/.config` existing. GAP: linter.yaml ignores are not among rule 15's compared lists — left as is. DOCS FALSIFIED: checks.md rule 15 (U5's)                                                                                                                                                                                                                                                                                                                                                                                                               | bc8379e7 |
| 2    | R2        | opus  | 2     | pass         | W1, W2 honoured; U1's flat-tree landed walk + `@@#if` shebang skip noted as added coverage within Owns; `renovate` in `TOOL_CONFIG_ROOT_FILES` left for U5 (E13). CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |          |
| 2    | gate      | —     | —     | green        | code:precommit first red: this repo's own `.config/` parsed the template trees and the JSONC assets. Per W3 the orchestrator added them to `.config/{dprint.json,linter.yaml,pre-commit-config.yaml}` in its own `ops:` commit; then all 7 lines green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 1b696f49 |
| 3    | U5        | opus  | 1     | green        | schema.mjs import, validateEntry, entry grammar, machine_env cross-check, renovate root file, `update_bot` dropped; `tool-config:`/`machine_env:` refused naming the replacement; flat `assets/` + `templates/` only; `@@` tags checked; schema.mjs rm; 172 tests pass; checks.md rules 4, 11, 13, 15 restated. DECIDED: pack templates may use any upper-snake name, tool-config's only table names; rule 15 skips `@@` entries. GAP: colliding pack key not checkable statically (values.mjs refuses at render). DOCS FALSIFIED: `.claude/docs/repo-shape.md:188`, CLAUDE.md Tasks bullet (U7's)                                                                                                                                                                                                                                                                          |          |
| 3    | U4        | opus  | 1     | green        | script rebuilt around `all`, `pack`, `pack-remove`, `upgrade`; lock, `check`, `apply-entries`, per-tool engine gone; `land()` tail + safe paths kept; new `lib/render.mjs`, `lib/stackgen-file.mjs`, `lib/paths.mjs`; `lib/{blocks,drift,record}.mjs` + `lib/tools/**` rm; 58 new cases green. DECIDED: an exact pin already held is kept (second `all` shows no rows), only `upgrade` moves pins; render compared after a formatter pass; a filled `#PLACEHOLDER` slot never overwritten; templates render in three tiers; `TASKS` skips `_`-named folders. GAP: test helper lives under `fixtures/` (Owns)                                                                                                                                                                                                                                                                |          |
| 3    | R3        | opus  | 1     | findings(7)  | U5 `checks.md:323` rule 17 still names blocks and `conf.d/tools*.toml` → loop to U5. E19 departure (grammar-only pack-template names) and the missing colliding-name case → user ruled W8, accepted. Rule 5, no loop: `.claude/skills/stackgen-plugin/SKILL.md:37` (`lib/tools/`), `.claude/docs/repo-shape.md:272` (old test files), `.claude/skills/plugin-authoring/SKILL.md:127, 134` → U7. Gate: house linter `lib/render.mjs:11` unused `readFileSync` → loop to U4. CONTRACT clean                                                                                                                                                                                                                                                                                                                                                                                   |          |
| 3    | U5        | opus  | 2     | green        | rule 17 in `checks.md` restated for the new layout (settings-only `.config/mise.toml`; tools go in the owning `conf.d/` folder); matching comment in `check.ts`, no logic change; 172 tests pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 3    | U4        | opus  | 2     | green        | removed the unused `readFileSync` import in `lib/render.mjs`; house linter clean over the script tree, 58 tool-config tests pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 3    | R3        | opus  | 2     | pass         | rule 17 matches `checkBareMiseUse`; `render.mjs` imports all used; within Owns. CONTRACT clean, RULINGS clean. Wave gate: all 7 lines green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 3    | scratch   | —     | —     | green        | scratch-repo gate after wave 3: 1 pass (57 rows `ok`, setup:all ran, no needs-edit); 2 pass (no rows); 3 dprint/pre-commit pass with `--config .config/dprint.json` and positional validate-config — bare `dprint check` fails (G1), plan line form unrunnable (G2); 4 pass (swiftui values rendered; no swiftui task templates exist, subtask half not exercised); 5 pass; 6 pass trivially (CI loads node + pnpm only)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |          |
| 4    | R         | opus  | 1     | findings(11) | review, range e53f4a10..3b0e5526, engines: code-review 10 findings (`engine/R-1-code.log`), security 0 (`engine/R-1-security.log`, re-scoped to the range). high U3: E10 subtasks missing — new files at paths an old overlay file held were destroyed by pre-commit stash/restore before U3 committed. medium U4: reserved slugs not refused (`ai`, `all`, universal subtask names); U4: `writeFiles` no restore on ENOTDIR in an old-layout repo; U2: `code/graph` stale-lock race. low U4: upgrade aborts on one failed `mise latest`; empty render deletes a filled slot; pack-remove rows answered independently; dot-files as subtasks; member slug `all`. low U5: pack templates conf.d folder not tied to slug. low U2: check hook runs uv lock check every commit. API COMPAT n/a                                                                                  |          |
| 4    | R         | opus  | 1     | findings(2)  | security: medium U4 `pack-remove --slug workflows` deletes universal `code/lint/workflows` (actionlint gate) — no reserved-slug rule in U4 or U5; low U4 `pack` lets a template target `.git/`. VERDICT approve; both cap-exempt, fixed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |          |
| 4    | U3        | opus  | 3     | green        | R loop-back: 30 lost subtasks recreated from 188b08cc — `setup/deps/<verb>/<slug>` for flutter, swiftui, swift, pnpm, uv; `code/{format,lint}/flutter`, `code/{format,lint}/ruff`, `code/format/pnpm`; shellcheck, inventory check, plugins check green. DECIDED: `code/check/uv` already runs only where a tracked `uv.lock` sits beside a `pyproject.toml`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 946f1d07 |
| 4    | U2        | opus  | 3     | green        | R loop-back: `code/graph` lock holds its holder PID; cleared only when that PID is dead (or no PID and older than 30 min); clear is atomic via `mv` to `<lock>.dead.$$` then re-checked; shellcheck clean, 4 simulated cases pass. DECIDED: always-run `check` hook kept per E9; a failed move-back leaves the moved lock rather than deleting a live one                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 06cb2ec9 |
| 4    | U5        | opus  | 3     | green        | R loop-back: checker refuses slugs `all`, `ai`, `_base`; a pack subtask whose leaf is a universal subtask leaf (set read from tool-config `assets/` + `templates/`); any `templates/.config/mise/conf.d/` entry but one folder named for the slug; 177 tests pass; `checks.md` rule 11 restated. `cloud-service/workflows` ships no subtask, stays green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 43a85895 |
| 4    | U4        | opus  | 3     | green        | R loop-back: reserved slugs `all`, `ai`, `_base` refused; `pack-remove` never deletes a tool-config-shipped path; `pack` refuses `.git/` targets; a file/folder in the way is refused at planning, a failed write restores every file written; `upgrade` skips an unresolvable pin with a note; filled slot beats an empty-render delete (G4); answer sets deleting a task a kept file still runs are refused; subtask lists skip dot-files, `_` files, non-executables; member slug `all` refused; 12 new tests, 70 pass                                                                                                                                                                                                                                                                                                                                                   | 188cc304 |
| 4    | R         | opus  | 2     | findings(7)  | review, range e53f4a10..dc64b79f, engines: code-review 10 (`engine/R-2-code.log`; 1 docs finding dropped as U6/U7-owned), security 0 (`engine/R-2-security.log`). medium U2: dprint.json marked block last entry lacks trailing comma, splice breaks a repo exclude below the marker; medium U4: `all` stopped at trust()/setup:all never formats or validates on re-run, stale preview refuses original answers; medium U2: `code/graph` E16 timeout applies only to PID-less locks (round 1 instruction over-corrected). low U5: no refusal of pack files at tool-config-owned paths; lists hand-copied from the script; no-op alias. low U4: `valuesFrom` temp-dir re-parse, `formatted()` one dprint per file. 13 → 8 findings, converging                                                                                                                              |          |
| 4    | R         | opus  | 2     | findings(1)  | security: low U4 `.git` destination refusal is case-sensitive — `.GIT/hooks/…` lands in `.git/` on APFS. Round-1 fixes verified. VERDICT approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 4    | U2        | opus  | 4     | green        | R round 2: dprint.json block ends in a trailing comma, file named in `jsonTrailingCommaFiles`, shipped config stable over itself; `code/graph` clears any lock older than 120 min, dead PID early, atomic `mv`; holder releases, re-checks the marker, re-acquires once. GAP→U5: rule 15 JSONC reader rejects trailing commas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | edce0855 |
| 4    | U4        | opus  | 4     | green        | R round 2: `.git` refusal case-insensitive; stored preview dropped once files are written; `all` with no rows left still formats and validates every rendered file (except keep-existing) and ignores stale `--answers` with a note; formatter/validate failure restores; 4 new tests, 74 pass. DECIDED: `valuesFrom` keeps its scratch dir (values.mjs exports no validator, not U4 Owns); `formatted()` stays one dprint call per file (`--stdin` takes one file) — efficiency findings contested                                                                                                                                                                                                                                                                                                                                                                         | b438cc75 |
| 4    | U5        | opus  | 4     | green        | R round 2: refuses a pack file at a tool-config-owned path (whole file, file-where-folder, under a file) except `#PLACEHOLDER` slots; imports `RESERVED_SLUGS` (cli.mjs) and `SUBTASK_DIRS`, `PLACEHOLDER` (render.mjs), runtime test pins the rest; no-op alias and `@@` filter dropped; JSONC reader accepts trailing commas; 179 tests pass; checks.md rules 11, 15 restated. DECIDED: values.mjs exports no global-name set, list kept with a runtime equality test; `PACK_SUBTASK` limited to the five deps verbs                                                                                                                                                                                                                                                                                                                                                      | 5a69f156 |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-10-05-tool-config-templates

or let the queue pick it, by priority:

/vwf:execute next
