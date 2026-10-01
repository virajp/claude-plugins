---
type: vwf-change-plan
title: tool-config's mise row moves onto a node script and templates
requires: [ docs/plans/2026-10-01-drop-vscode ]
backlog: []
backlog_pieces: []
---

# Plan — tool-config's mise row moves onto a node script and templates (2026-10-01)

## Status

**APPROVED**

APPROVED 2026-10-01 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| After landing: `/vwf:backlog close B75`           | run     |
| Release stackgen publicly                         | major   |
| Release vwf publicly                              | minor   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The staged plugins from `p:plugins:local` are picked up
only by a **restarted** session.

**Release rows are intent, not authorisation.** U11 bumps the versions; no
public release step is recorded on this plan. The user ruled for the whole
chain: bump now, release at the end of the chain — `/release` is offered once
plans 0–4 have all landed — and **bump a project once per level since its last
release**: a project whose version already sits above its last released tag at
that level is not bumped again; packs follow the same rule.

Plan 0 (`2026-10-01-drop-vscode`) lands first and takes stackgen
`2.0.0 → 3.0.0`, vwf `20.0.1 → 20.1.0`, site `1.1.49 → 1.1.50`, and patches pnpm
and swiftlint among its 8 packs. So this plan, applying the rule:

- stackgen — major wanted (pack schema and exact pins); already `3.0.0` above
  the released `2.0.0` → **no bump**, unless the tree shows otherwise, in which
  case edit `plugins/stackgen/.claude-plugin/plugin.json` to the next major and
  run `mise run p:plugins:marketplace`.
- vwf — minor wanted; already `20.1.0` → **no bump**, by the same test.
- site — patch wanted; already `1.1.50` → **no bump**, by the same test
  (`mise run p:site:version`, bare, first, if it is needed).
- packs: swiftui, doppler, fnox, claude-code and github-actions take one patch
  each; pnpm and swiftlint were patched by plan 0 → no bump. Bundle pins follow;
  `mise run p:plugins:inventory` regenerates.

None of these reaches a 13 or 17 component.

## Goal

Creating a repo's mise configuration, and applying every pack's mise request,
produces identical files and rows on every run, from a shipped node script that
fills templates. A greenfield repo needs no LLM; the LLM relays rows and
answers, and makes the `needs-edit` changes a brownfield repo raises.

This is **plan 1 of a five-plan chain** the user agreed on 2026-10-01: plan 0
(`2026-10-01-drop-vscode`) removes the vscode configuration from both plugins;
plan 1, this one, builds the script's engine and moves mise onto it; plan 2
moves dprint, pre-commit, gitleaks and grype; plan 3 moves git, graphify and
renovate; plan 4 scripts `vwf:init`'s mise steps. The user's framing: *"There
are many items which are static and mechanical: These must be taken care by
scripts (bash or node only, don't use python) with placeholders/comments marking
positions for different inserts. Some items will really need LLM and only those
must be done using LLM."* And on goals: *"Idea is to have the goal achieved but
done differently."*

**Four reversals**, each confirmed by the user and written as a decision doc by
U10:

- **R1 — rendering and a skill-time script.** Was:
  `docs/memory/decisions/2026-09-20-pack-intent-rendering.md:172-174` ruled
  template rendering "a later plan if ever", and stackgen's artifact doctrine
  (§4) says only packs ship executable scripts. Now: tool-config ships a node
  script that renders templates at skill time.
- **R2 — the script is the source of truth.** Was:
  `2026-09-26-tool-config-gates.md:43-44` put each tool's doctrine in
  `references/<tool>.md` for the LLM to follow. Now, in the user's words: *"The
  script does the initial job of creating the config, LLM knows how to edit the
  config if needed. A greenfield work will not need LLM, brownfield will likely
  need."*
- **R3 — the mise lockfile is gone.** Was: `2026-09-28-lock-files-tracked.md`
  ruled one tracked `.config/mise/mise.lock`. The user removed it in commits
  `34b938ab` and `c285438c` (2026-09-30): *"Mise lock is completed gone. It's
  creating more problems and slows down the whole install process. However, this
  introduces version pinning."*
- **R4 — the repo-local mise skill is back.** Was: `references/mise.md:521-523`
  — the migration deletes the repo-local mise skill the retired toolchain pack
  copied. Now tool-config lands one again, and agents run the repo's tasks
  through it.

## Facts the survey established

- **tool-config today** (`plugins/stackgen/skills/tool-config/`, below `TC`):
  `SKILL.md` (370 lines) plus eight references (2,859 lines total;
  `references/mise.md` is 1,158) and `assets/<tool>/` trees laid out as they
  land. About 80% of the operations are mechanical; the rest is the user's
  answer to a row, the `merge` combination, a template name for an unmapped
  language, and network fetches (git's templates — plan 3).
- **The mise assets** (`TC/assets/mise/`): `miserc.toml`, `mise.toml`,
  `mise.{dev,ci,test}.toml`,
  `conf.d/{env,env.dev,tools,tools.dev,tasks,shell_alias.dev}.toml`,
  `vscode.d/mise.jsonc` (plan 0 removes it), and the task library under
  `mise/tasks/` (`_scripts/{checks,helpers,helpers.mjs,merge,placeholder}`,
  `code/*`, `setup/*`).
- **Marked positions are comment anchors above a working default**, never
  tokens: `conf.d/env.toml:4-15` (`REPO_NAME`, the merge pair, `MEMBERS`,
  `PATH_ENTRIES`), `mise.toml:28` (`RUNTIME_BLOCK`), `tasks/setup/ai:59-67`
  (`EXTRA_MARKETPLACES`, `EXTRA_PLUGINS`), `conf.d/shell_alias.dev.toml:8-9` and
  `tasks/setup/all:9-10` (commented append templates). `/vwf:doctor`'s splice
  test reads the `MARKED POSITION` comments
  (`plugins/vwf/skills/doctor/references/stack-checks.md:500-526`).
- **The lock is already gone in the assets.**
  `TC/assets/mise/.config/mise.toml:11` is `lockfile = false`; `mise.ci.toml` no
  longer sets `locked = true`; `tasks/setup/mise` is `mise reshim`, doctor,
  install and `mise upgrade --local` — no `--lock-only`, no `mise lock`. The
  prose still describes the lock:
  `TC/references/mise.md:42,97,116-117,175-200,482-493,668,716-729,789-798`;
  `TC/references/dprint.md:134`; `TC/references/pre-commit.md:109`;
  `TC/references/git.md:139,268`; the exclusion line `**/.config/mise/locks/` in
  `TC/assets/dprint/.config/{taplo.toml:8,dprint.json:4}`,
  `TC/assets/pre-commit/.config/{pre-commit-config.yaml:20,linter.yaml:11-12}`;
  `TC/assets/mise/.config/mise/conf.d/tools.toml:5`;
  `plugins/vwf/skills/init/SKILL.md:129,691`;
  `plugins/vwf/skills/init/references/new-repo.md:709-752`;
  `plugins/vwf/skills/init/references/existing-repo.md:1155-1159`;
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md:116-117`. init's
  §11(b) probe `mise tasks info setup:mise` for `--lock-only` therefore always
  reads *lock deferred* today.
- **Callers.** The materializer
  (`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:335-342,381-387,429-431`)
  previews each pack line, applies with `answers=`, removes a dropped pack;
  `vwf:init` (`references/new-repo.md:82-120`); `vwf:setup`
  (`references/materialize.md:170-310`, machine values through `set env`);
  `vwf:doctor` re-runs the block drift compare per `tool-config/…` record
  (`stack-checks.md:548-561`).
- **Pack mise entries**: 11 lines in 5 packs —
  `stacks/app-framework/swiftui/pack.yaml` (4),
  `stacks/capability-provider/doppler/pack.yaml` (3, one wrapped over two
  lines), `stacks/capability-provider/fnox/pack.yaml` (1),
  `stacks/package-manager/pnpm/pack.yaml` (2),
  `stacks/toolchain-gate/swiftlint/pack.yaml` (1). Shapes used: add tool to the
  dev or all environments; add env `KEY=<value>` to all environments (quoted,
  bare and Tera-template values); add alias to the dev environment.
  `machine_env:` appears only in swiftui. The grammar doc is
  `plugins/stackgen/assets/pack-format.md:245-288`.
- **`mise use` occurrences under `plugins/`**:
  `plugins/vwf/skills/doctor/references/stack-checks.md:103`,
  `plugins/vwf/skills/doctor/references/code-intelligence.md:14`,
  `plugins/stackgen/stacks/design-tool/claude-code/conventions.md:66`,
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md:216`.
  Outside `plugins/`: `site/src/content/docs/plugins/{vwf,mempalace}.md`.
- **The checker** (`scripts/src/check.ts`, 100 KB) already parses the pack line
  grammar (`:700-763`, `toolConfigCall` `:776`, `hookFault`) and the exclusion
  lists (`:1879-2000`, `checkExclusionSets` `:2107`). Rule 6 (`:1228-1255`)
  refuses a `${CLAUDE_PLUGIN_ROOT}` path outside its own plugin — vwf may never
  cite the script's path. Rule 11 treats each `TC/assets/<tool>/` tree as a
  landed repo root with an allowlist (`TOOL_CONFIG_ROOT_FILES`, `:351`) — a
  `.claude/skills/mise/SKILL.md` asset needs that allowlist widened. Known
  shebangs: `#!/usr/bin/env bash|node|python3` (`:296-300`).
- **No gate covers a skill-time script today.** `p:plugins:shellcheck` covers
  pack task trees and `TC/assets/*/.config/mise/tasks` only; vitest collects
  `{installer,scripts}/src/**/*.test.ts` only (`vitest.config.mts`); dprint has
  no JS plugin. The precedent for testing a shipped script is
  `installer/src/mempalace-checkpoint-script.test.ts:1-12` — a suite under
  `src/` that spawns the plugin script in temp dirs.
- **Runtimes.** mise is required by init already (`new-repo.md:589-591`); node
  is not guaranteed (swift and flutter repos pin none); there is no python
  anywhere in the repo and the user has banned it.
- **Versions**: stackgen `2.0.0`, vwf `20.0.1`, site `1.1.49`.
- **Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; `commitScopes: []`.
- **Gates in CI** (`.github/workflows/plugins.yml`): marketplace `--check`,
  inventory `--check`, `p:plugins:check`, `p:plugins:shellcheck`,
  `pnpm vitest run`, `npm-normalize-test`, `tsc --noEmit -p installer` and
  `-p scripts`.
- **Backlog.** The user ruled this plan is not from the backlog and carries no
  id; it supersedes B75. B75's ten items were dispositioned one by one: 1 and 3
  moot (lock gone); 2, 4, 6, 7, 8, 9 achieved here; 5 achieved as the `mise use`
  ban; 10 dropped with plan 0's vscode removal.

## Assumed decisions — confirm or override at review

| #   | Decision                 | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                                              | Unit                   |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| D1  | Script language          | Node, one ESM entry `TC/scripts/tool-config.mjs` plus modules under `TC/scripts/lib/`, built-ins only, zero npm dependencies. Run as `node` from `PATH`, never `mise x node@lts --`; amended 2026-10-01 — plan 2 pins node and runs the script as `mise x -- node`.                                                                                                                                                         | bash (fragile JSON, BSD sed, no jq); python (banned by the user)      | U1                     |
| D2  | Pinning                  | Every pin written is an exact version. A requested `latest` is resolved by the script with `mise latest <tool>` at write time and written as the exact version.                                                                                                                                                                                                                                                             | exact versions hardcoded in templates; major/minor prefixes           | U3                     |
| D3  | Pack verbs               | The script applies every pack mise verb (add tool, add env, set env, add alias, remove), so a greenfield repo plus its packs needs no LLM.                                                                                                                                                                                                                                                                                  | the LLM applies pack lines; packs ship their own fragments            | U3                     |
| D4  | Machinery kept           | Block markers, preview rows with `answers=`, and the `.claude/stackgen/lock.yaml` record all stay, in today's shapes.                                                                                                                                                                                                                                                                                                       | markers and lock record only, no preview or drift                     | U1                     |
| D5  | Drift                    | Drift is "render what this block should be, compare with the file" — exposed as a script `check` command that `/vwf:doctor` calls, replacing the prose word-compare rules.                                                                                                                                                                                                                                                  | today's word-outside-quotes compare implemented as written            | U1, U7                 |
| D6  | Template markers         | Comment anchors, as today: `MARKED POSITION` comments and `# >>> <requester>` / `# <<< <requester>` blocks. Assets stay valid working files; no second template tree.                                                                                                                                                                                                                                                       | a tokenised `templates/` tree; anchors plus tokens                    | U2                     |
| D7  | Brownfield split         | The script emits conflict rows for what it can decide (legacy `MERGE_MODEL`, a tool pinned at another version, a person's own line, a parseable old pack fragment) and a `needs-edit` row for the rest (a root mise config to split, a `merge` answer, an unparseable file), naming the file and the target layout. The LLM makes that edit per a short section of `references/mise.md`, then re-runs the script's `check`. | the script does all brownfield work; the LLM does all brownfield work | U1, U3, U6             |
| D8  | Command line             | Flag-style: e.g. `tool-config.mjs mise add-tool --name <n> --version <v> --env dev --for <pack>`; `tool-config.mjs preview all --repo <slug> …`; `--answers r1:ok,r2:keep-existing`.                                                                                                                                                                                                                                        | today's word grammar parsed unchanged                                 | U1                     |
| D9  | Pack entry shape         | A pack's `tool-config:` entry for mise becomes structured YAML, e.g. `- {tool: mise, verb: add-tool, name: swiftlint, version: "0.59", env: dev}`, validated by `check.ts` against one schema the script exports.                                                                                                                                                                                                           | flag strings in `pack.yaml`                                           | U4, U5, U8             |
| D10 | Migration scope          | Plan 1 migrates only the mise entries. The non-mise entries keep the string grammar until plans 2–3, and `check.ts` accepts both shapes meanwhile.                                                                                                                                                                                                                                                                          | migrate all 45 entries now                                            | U4, U5, U8             |
| D11 | Repo-local mise skill    | `all` lands `.claude/skills/mise/SKILL.md` into the repo: a static template (run tasks with `mise run`, discover with `mise tasks`, `MISE_ENV=dev`, where each config file lives, never bare `mise use`) plus a task table the script regenerates on every `all` and every pack change, between comment anchors.                                                                                                            | static only; written by the LLM per repo                              | U3, U4                 |
| D12 | Moving pins forward      | `tool-config.mjs mise upgrade` re-resolves every pin with `mise latest`, returns one row per changed pin (old → new, whose block), writes on answers. Dev only.                                                                                                                                                                                                                                                             | renovate only; both                                                   | U3                     |
| D13 | `mise use` ban           | Bare `mise use` is forbidden: a tool is entered into the config first, then installed with `mise install`. Stated in the repo-local skill and `references/mise.md`; doctor's remedies say so; a checker rule fails any `mise use` under `plugins/**`.                                                                                                                                                                       | doctrine only, no checker rule                                        | U2, U3, U5, U6, U7, U8 |
| D14 | Lock removal             | Every lock passage, the `lock` verb, the lock half of `upgrade`, `lockfile_platforms`, the `**/.config/mise/locks/` exclusion line in all four base lists, and init's §11(b) lock step are removed in this plan, not left for plan 4 — the init step fails on every run today.                                                                                                                                              | leave init's lock step for plan 4                                     | U2, U6, U7             |
| D15 | B75 items 2 and 4        | The script's migration skips every `*.local.*` file (item 2), and hoists a non-base tool pinned in two env files into `conf.d/tools.toml` (item 4).                                                                                                                                                                                                                                                                         | —                                                                     | U3                     |
| D16 | B75 items 8 and 9        | `tasks/setup/worktree` guards its install on `MISE_ENV` (item 8); `tasks/setup/all` enters each member with `(cd <member> && mise run …)` in a subshell, so the member's own miserc is read (item 9).                                                                                                                                                                                                                       | —                                                                     | U2                     |
| D17 | B75 items 6 and 7        | `vwf:readme` runs only `MISE_ENV=dev mise run setup:all`, no `mise install` before it (item 6); the github-actions reference installs the pinned tools before running tasks, with no lock (item 7).                                                                                                                                                                                                                         | —                                                                     | U6, U7                 |
| D18 | Mixed `all` until plan 3 | Until plans 2–3 land, tool-config's `all` = the script for mise, then the existing prose for the other seven tools; the rows of both are returned as one numbered set.                                                                                                                                                                                                                                                      | —                                                                     | U6                     |
| D19 | Review row               | One `Kind: review` row after the code units: the plan lands runnable code (a node script and checker source).                                                                                                                                                                                                                                                                                                               | wave review alone                                                     | U9                     |
| D21 | Bumps in the chain       | A project is bumped once per level since its last release, across plans 0–4; packs too.                                                                                                                                                                                                                                                                                                                                     | every plan bumps; only the last plan bumps                            | U11                    |
| D20 | mise absent              | The script stops with the install remedy when `mise` is not on `PATH` — resolving `latest` needs it.                                                                                                                                                                                                                                                                                                                        | write the unresolved `latest`                                         | U1                     |

## New dependencies

None. The script uses node built-ins only; its tests use the repo's existing
vitest.

## Units

| Id  | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                             | Depends on     | Status  | Commit |
| --- | ---- | ---------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------ |
| U1  | 1    | [01-engine.md](01-engine.md)                   | edit   | `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/{cli,blocks,rows,record,drift,schema}.mjs`, `scripts/src/tool-config-core.test.ts`                                                                                                                                                                               | —              | pending |        |
| U2  | 1    | [02-mise-templates.md](02-mise-templates.md)   | edit   | `plugins/stackgen/skills/tool-config/assets/mise/.config/**`, and the `**/.config/mise/locks/` line only in `plugins/stackgen/skills/tool-config/assets/dprint/.config/{taplo.toml,dprint.json}` and `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/{pre-commit-config.yaml,linter.yaml}`                                                                        | —              | pending |        |
| U3  | 2    | [03-mise-module.md](03-mise-module.md)         | edit   | `plugins/stackgen/skills/tool-config/scripts/lib/tools/{index,mise}.mjs`, `plugins/stackgen/skills/tool-config/assets/mise/.claude/skills/mise/SKILL.md` (new), `scripts/src/tool-config-mise.test.ts`, `scripts/src/fixtures/tool-config/mise/**`                                                                                                                               | U1, U2         | pending |        |
| U4  | 2    | [04-checker.md](04-checker.md)                 | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                              | U1             | pending |        |
| U5  | 3    | [05-pack-entries.md](05-pack-entries.md)       | edit   | the mise entries in `plugins/stackgen/stacks/{app-framework/swiftui,capability-provider/doppler,capability-provider/fnox,package-manager/pnpm,toolchain-gate/swiftlint}/pack.yaml`, `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/stacks/design-tool/claude-code/conventions.md`, `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md` | U4             | pending |        |
| U6  | 3    | [06-stackgen-prose.md](06-stackgen-prose.md)   | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/{mise,dprint,pre-commit,git}.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`, `plugins/stackgen/stacks/ci-system/github-actions/skills/github-actions/references/toolchain.md`                                                                 | U3             | pending |        |
| U7  | 3    | [07-vwf-prose.md](07-vwf-prose.md)             | edit   | `plugins/vwf/skills/doctor/**`, `plugins/vwf/skills/readme/SKILL.md`, `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/{new-repo,existing-repo}.md`, `plugins/vwf/skills/setup/references/materialize.md`, `plugins/vwf/skills/git-workflow/references/worktree-setup.md`                                                                                 | U3             | pending |        |
| U8  | 4    | [08-checker-tighten.md](08-checker-tighten.md) | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                              | U4, U5, U7     | pending |        |
| U9  | 5    | [09-review.md](09-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                                | U3, U8         | pending |        |
| U10 | 6    | [10-docs.md](10-docs.md)                       | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{stackgen-plugin,vwf-plugin,plugin-authoring}/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-01-*.md`                                                                                                                                                                                              | U5, U6, U7, U9 | pending |        |
| U11 | 7    | [11-gates-and-bump.md](11-gates-and-bump.md)   | edit   | `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, the `version:` line of the seven edited packs (swiftui, doppler, fnox, pnpm, swiftlint, claude-code, github-actions) and the bundle pins naming them, `plugins/stackgen/stacks/inventory.md`                                    | U10            | pending |        |

## Shared-file rule

| File                                                                                  | Why it collides                                            | Owner                                                |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `plugins/{stackgen,vwf}/.claude-plugin/plugin.json`, `site/package.json`              | version files                                              | U11 only                                             |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`             | generated                                                  | U11 only                                             |
| the five `pack.yaml` files with mise entries                                          | U5 rewrites their mise entries; U11 bumps their `version:` | U5 in wave 3 (entries), U11 in wave 7 (version)      |
| `scripts/src/check.ts`, `scripts/src/check.test.ts`                                   | U4 widens, U8 tightens                                     | U4 in wave 2, U8 in wave 4                           |
| `TC/assets/mise/**`                                                                   | templates and the new repo-local skill asset               | U2 `.config/**` in wave 1, U3 `.claude/**` in wave 2 |
| `TC/assets/{dprint,pre-commit}/**` exclusion files                                    | other tools' assets carrying mise's lock line              | U2, that one line only                               |
| `TC/references/{dprint,pre-commit,git}.md`                                            | other tools' references carrying mise lock passages        | U6, those passages only                              |
| every human-facing doc (`readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, decisions) | n units editing one doc                                    | U10 only                                             |

## Waves

- **Wave 1 — U1, U2.** The script's engine and the mise templates own disjoint
  trees (`TC/scripts/**` against `TC/assets/mise/.config/**` plus one exclusion
  line in four other asset files).
- **Wave 2 — U3, U4.** U3 needs U1's engine and U2's templates; U4 imports only
  U1's exported schema. Owned paths are disjoint (`TC/scripts/lib/tools/**`, the
  new repo-local skill asset and their tests, against `scripts/src/check*.ts`).
  The skill asset lands in this wave, not wave 1, because checker rule 11's
  asset allowlist refuses it until U4 widens it — both in one wave keeps every
  wave gate green.
- **Wave 3 — U5, U6, U7.** U5 needs U4's checker to validate the new entry
  shape; U6 and U7 describe U3's finished interface. Disjoint trees: stacks and
  `pack-format.md`, stackgen skills, vwf skills. U5 and U7 also remove every
  bare `mise use` under `plugins/`.
- **Wave 4 — U8**, checker tightening: refusing string mise entries and bare
  `mise use` lands only after wave 3 removed both, so no wave gate is red.
- **Wave 5 — U9**, the review row, strictly after every unit it covers (U1, U3,
  U4, U8).
- **Wave 6 — U10**, docs. **Wave 7 — U11**, gates and bump.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                 |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into the dev marketplace and updates this machine's install; a **restarted** session picks them up                                            |
| `/vwf:backlog close B75`   | run  | reason: `superseded by docs/plans/2026-10-01-tool-config-script-mise — items 1, 3 moot (lock gone); 2, 4, 5–9 achieved here; 10 dropped with plan 0's vscode removal` |

## Gates the orchestrator keeps

The **scratch-repo run**, after wave 3 and again after U11, in a temporary git
repo with an isolated `HOME`, `MISE_DATA_DIR`, `MISE_CONFIG_DIR`,
`MISE_CACHE_DIR` and `MISE_STATE_DIR` (a scratch `mise install` once rewrote the
global mise state):

1. `node plugins/stackgen/skills/tool-config/scripts/tool-config.mjs all --repo scratch --answers <every row ok>`
   lands the mise tree, `.claude/skills/mise/SKILL.md` and the `lock.yaml`
   records; every pin requested as `latest` is written as an exact version.
2. The same `preview all --repo scratch` returns **no rows**.
3. `mise trust --all && mise tasks` lists `setup:all`.
4. The script's `check` reports no drift.
5. `grep -rn 'mise use' plugins/` prints nothing.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` on any path outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

Keep the block under 1,500 characters.

## Out of scope

- **B70** (the linter pin leaves the mise base) and **B68** (a landed path
  changing its owning pack) — the user left both open.
- **This repo's own `.config/`** still carries `**/.config/mise/locks/` in its
  dprint, taplo and pre-commit excludes. Harmless and not shipped; touching the
  repo's own pre-commit config mid-run aborts commits (an unstaged own config
  refuses every commit). Left for a reshape of this repo.
- **The other seven tools' behaviour** — only their mise lock passages and the
  one exclusion line change here; everything else is plans 2–3.

## Parked

- Plan 0 — `docs/plans/2026-10-01-drop-vscode`: remove the vscode configuration
  from vwf, stackgen and the docs (the `editor` answer, every `vscode.d/*.jsonc`
  fragment, init's `fragments-and-sections.md`, `setup:vscode`); finishes B40.
  Plan 1 requires it.
- Plan 2: dprint, pre-commit, gitleaks and grype move onto the engine, with
  `all add exclude`; their pack entries move to the YAML schema. Closes B77 as
  superseded (after-landing step).
- Plan 3: git, graphify and renovate move onto the engine (template fetch, SHA
  pins); the remaining pack entries move to the schema and `check.ts` drops the
  string grammar. Closes B79 as superseded.
- Plan 4: `vwf:init`'s mise steps scripted — bootstrap (`mise trust --all`,
  `mise run init`), the `_default` slot, existing-repo passes 3, 4, 5, 8 and 9.
  Closes B80 as superseded.
- `/release` once plans 0–4 have all landed — stackgen, vwf and site together.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-01-tool-config-script-mise

or let the queue pick it, by priority:

/vwf:execute next
