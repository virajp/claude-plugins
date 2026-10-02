---
type: vwf-change-plan
title: tool-config's gate tools move onto the script — dprint, pre-commit,
  gitleaks, grype
requires: [ docs/plans/2026-10-01-tool-config-script-mise ]
backlog: []
backlog_pieces: []
---

# Plan — tool-config's gate tools move onto the script (2026-10-01)

## Status

**RUNNING**

RUNNING since 2026-10-02 in .worktrees/2026-10-01-tool-config-script-gates

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| After landing: `/vwf:backlog close B77`           | run     |
| Release stackgen publicly                         | major   |
| Release vwf publicly                              | minor   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release rows are intent, not authorisation** — no public release step; the
chain releases at its end. The chain's bump rule applies: **bump a project once
per level since its last release** — a project whose version already sits above
its last released tag at that level is not bumped again; packs follow the same
rule. After plans 0 and 1, stackgen (`3.0.0`), vwf (`20.1.0`) and site
(`1.1.50`) are expected to be above their released tags already → no bump; each
pack this plan edits takes one patch unless plans 0–1 already bumped it. The
commands, when a bump is needed: edit
`plugins/{stackgen,vwf}/.claude-plugin/plugin.json` then
`mise run p:plugins:marketplace`; `mise run p:site:version` (bare, first, on a
clean tree); pack `version:` lines plus bundle pins then
`mise run p:plugins:inventory`.

## Goal

dprint, pre-commit, gitleaks, grype and the cross-tool `all add exclude` are
configured by tool-config's node script from templates — and `all` ends a usable
repo: every file landed, `MISE_ENV=dev mise run setup:all` run, every written
file formatted by the shipped formatter and the hook config validated, hashes
recorded. The LLM relays rows and makes `needs-edit` changes only.

**Plan 2 of the five-plan chain** agreed 2026-10-01 (0 drop-vscode, 1 engine and
mise, 2 this, 3 git/graphify/renovate, 4 init's mise steps). Requires plan 1.
Supersedes B77 — its six items are goals met here, and the item is closed as
superseded after landing.

The user's rulings, verbatim:

- on tools: *"we need to ensure that the mise commands don't install the tool,
  the tools must be pre-installed via mise only. `mise x dprint -- ...` may
  install a different version that what is mentioned in mise config so use
  `mise x -- dprint ...`. This also means that `mise install` must be run before
  executing such commands"*;
- on trust and setup: *"`mise trust` is expected to be run before hand by user,
  script must expect that this is in-place. `mise run setup:all` is the best way
  to get the repo setup. Initially it can be simply installing all mise tool &
  config but once the skill is done, `setup:all` mise task must be capable to
  setup all the things required to run/contribute in the respective repo"*.

**Reversal**, written as a decision doc by G10: `vwf:init`'s §9 runs
`mise trust --all` and §10 *offers* `setup:all`
(`plugins/vwf/skills/init/references/new-repo.md:548-615`). Now trust is the
user's prerequisite (typically `trusted_config_paths` in the global mise config)
and `setup:all` is part of `tool-config all`.

**Plan 1 is amended in the same commit** (its D1 and U1): the script never runs
as `mise x node@lts -- node`; node is pinned by this plan's G2 and the script
runs as `mise x -- node`, with `node` on `PATH` required only for the very first
`all` on a repo with no mise config.

## Facts the survey established

(`TC` = `plugins/stackgen/skills/tool-config`; line numbers are pre-chain, the
units read the files as plans 0–1 leave them.)

- **Verbs.** dprint `add plugin` from the plugin table
  (`TC/references/dprint.md:92-118,184-196`), shared plugins written once
  (`:120-122`), `remove` via the lock's `keys:` (`:35-41`). pre-commit
  `add hook` (`TC/references/pre-commit.md:212,221-267` — key whitelist and
  order `:240-249`, local hook needs `name`, an `entry` starting `mise x --`,
  `language=system`; URL hook needs `rev`; same-id conflict row `:256-260`),
  `add linter-ignore` (`:269-277`), `set scopes` (`:279-284`), commit-type
  rename rows (`:83-102` — an unmapped type proposes nothing and the person
  answers). gitleaks: only `remove` (`TC/references/gitleaks.md:92-100`). grype:
  `add ignore`, `remove ignore` (`TC/references/grype.md:45-56`), reason bar
  `:58-65`.
- **Assets.** `TC/assets/dprint/.config/{dprint.json,taplo.toml}` and the root
  `dprint.json` shim;
  `TC/assets/pre-commit/.config/{pre-commit-config.yaml,git-conventional-commits.yaml,linter.yaml}`
  — install types `:6-9`, verbose exclude block `:16-26`, `graphify-refresh`
  `:86-94`; commit scopes `MARKED POSITION`
  `git-conventional-commits.yaml:18-20`, forge-link commented template `:50-55`
  filled from `origin` (`pre-commit.md:156-172`; the same host parse in bash at
  `TC/assets/mise/.config/mise/tasks/code/git-config:15-36`);
  `TC/assets/gitleaks/.config/gitleaks.toml` allowlist block `:17-23`;
  `TC/assets/grype/.config/grype.yaml` (`ignore: []`). Plan 0 removes the vscode
  fragments and the `editor` key; plan 1 removes the `**/.config/mise/locks/`
  exclusion line.
- **Migrations**: `dprint.md:253-263`, `pre-commit.md:403-423`,
  `gitleaks.md:137-143`, `grype.md:98-101`. An unparseable file (a non-verbose
  or multi-group exclude regex, a JSONC `dprint.json`, an unknown
  fragment-marker shape) is a `needs-edit` row.
- **`all add exclude`** (`TC/SKILL.md:131-148`): dprint `excludes` (`**/<d>/`,
  `**/<g>`), taplo `exclude` (`**/<d>/**`, `**/<g>`), pre-commit global `(?x)`
  exclude (`(^|/)<d>/`, glob escaped with `*` → `[^/]*` and `$`; every
  alternative but the first opens with `|`, re-derived on every write —
  `pre-commit.md:194-205`), gitleaks `paths` with `generated` only
  (`gitleaks.md:68-74`). Rule 15 is `scripts/src/check.ts:2084-2190` over the
  asset lists only.
- **Pack entries — 22, in 14 packs**: `dprint add plugin` ×11
  (`cloud-service/containers:54`, `cloud-service/cloud-run:24`,
  `framework/html:19,20`, `framework/astro:25,26`, `stylesheet/stylex:18`,
  `stylesheet/plain-css:18`, `stylesheet/tailwindcss:18`,
  `language/typescript:49`, `deploy-target/container-image:18`);
  `all add exclude generated` ×4 (`package-manager/pnpm:20`,
  `package-manager/uv:14`, `package-manager/swiftpm:21`,
  `app-framework/swiftui:99`); `all add exclude` globs ×2
  (`package-manager/pnpm:21`, `app-framework/swiftui:100` — `*.xcassets`);
  `pre-commit add linter-ignore` ×4 (`package-manager/uv:16`,
  `package-manager/swiftpm:22`, `app-framework/flutter:69`,
  `app-framework/swiftui:101`); `pre-commit add hook` ×1
  (`package-manager/uv:17`). No pack uses gitleaks, grype or `set scopes`.
- **check.ts string grammar for these tools**: `DPRINT_PLUGINS` `:720-721`,
  `HOOK_PAIR` `:723-725`, `TOOL_CONFIG_HOOK` `:727-730`, the gate rows of
  `TOOL_CONFIG_GATE_VERBS` `:733-749`, `TOOL_CONFIG_LONE_EXCLUDE` `:763-764`,
  `hookFault` `:846-876`. The git rows `:750-758` stay until plan 3.
- **B77's six items**: (1) no `validate-config` anywhere; (2)
  `swiftui/pack.yaml:100` `*.xcassets` read as a file glob
  (`TC/SKILL.md:138-141`, `pre-commit.md:194-195`); (3) install types lack
  `post-merge` (`pre-commit-config.yaml:6-9`, `graphify-refresh` `:86-94`,
  `tasks/setup/precommit:157-163`, doctor `code-intelligence.md:32-33`); (4)
  post-stage hooks not required to `always_run` (`pre-commit.md:235-239`), grype
  reason vs `for <word>`, `HOOK_PAIR` unanchored (`check.ts:849`); (5) no fold
  rule (uv `pack.yaml:17` rewrapped by dprint), blank line before a `repos:`
  requester block undefined (`TC/SKILL.md:179-181`); (6) `pre-commit.md:142-143`
  stale.
- **vwf callers**: init passes `scopes=` to `all` (`init/SKILL.md:86-90,507`;
  `existing-repo.md:807-835`), calls `all add exclude` in a migration
  (`existing-repo.md:158-165`), runs `setup:precommit --force`
  (`existing-repo.md:267-273,1050,1122`), §9 trust and §10 offer
  (`new-repo.md:548-615`); `init/assets/hygiene/CONTRIBUTING.md:52,69`; setup
  re-runs pack lines (`setup/references/materialize.md:172-210`); doctor reads
  `commitScopes` (`stack-checks.md:430-432`) and the graph hook
  (`code-intelligence.md:32-38`).
- **Docs**: `readme.md:299`;
  `.claude/skills/stackgen-plugin/SKILL.md:178,219-223,345-354`;
  `.claude/skills/plugin-authoring/references/checks.md:183-192,264-296`;
  `site/src/content/docs/plugins/stackgen.md:233-234,509,633-638,701-763,854,1087-1099,1179`.

## Assumed decisions — confirm or override at review

| #   | Decision              | Ruling                                                                                                                                                                                                                                                              | Rejected                                            | Unit           |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------- |
| G1  | Directory globs       | A trailing `/` marks a directory, globs included (`*.xcassets/`) — excluded with everything inside. `*`/`?` without a trailing `/` is a file glob; a bare name with neither is a directory, as today.                                                               | an explicit `kind: dir\|glob` field                 | G1, G3, G5     |
| G2  | Hook config validated | Every write to the pre-commit config runs `mise x -- pre-commit validate-config`; a failure restores the file byte for byte and refuses the call.                                                                                                                   | self-check only; verbs only                         | G1, G3         |
| G3  | Tool invocation       | Tools run only as `mise x -- <tool>` (the version the repo's config pins), never `mise x <tool>@… --`. A tool not installed → the call stops with the remedy `MISE_ENV=dev mise run setup:all`.                                                                     | ad-hoc `mise x <tool>`                              | G1, G6, G7     |
| G4  | The `all` sequence    | `all` = land every file → `MISE_ENV=dev mise run setup:all` → format and validate the files it wrote → record hashes. Trust is assumed: an untrusted config stops the call with the remedy (trust the path, e.g. `trusted_config_paths` in the global mise config). | the caller runs `setup:all`; refuse until installed | G1, G7         |
| G5  | Formatter             | Engine-wide: every written file passes through `mise x -- dprint fmt --config .config/dprint.json <files>` before its hash is recorded, mise files included.                                                                                                        | the script folds itself; shorter values             | G1             |
| G6  | Post-merge refresh    | `post-merge` joins `default_install_hook_types`; `graphify-refresh` runs at `post-commit` and `post-merge`; a `post-commit` or `post-merge` hook is always written with `always_run: true`.                                                                         | —                                                   | G2, G3, G7     |
| G7  | grype ignores         | `grype add-ignore --id <id> --package <name@version> --reason <text> --expires <YYYY-MM-DD>`, all four required, written as the entry's comment.                                                                                                                    | free-text reason judged by the LLM                  | G1, G3         |
| G8  | Node                  | node is pinned in the base `conf.d/tools.dev.toml` (exact, resolved); the script runs as `mise x -- node …`; only the first `all` on a repo with no mise config needs `node` on `PATH`. Amends plan 1's D1 and U1.                                                  | node on `PATH` always; a bash rewrite               | G2, G6         |
| G9  | Pack entries          | The 22 entries become structured YAML validated by the script's schema; swiftui's becomes `*.xcassets/`; string entries for dprint, pre-commit, grype and `all` are refused in a later wave.                                                                        | —                                                   | G1, G4, G5, G8 |
| G10 | Kept                  | Rule 15 stays over the assets; the forge links are built from `origin` by the script per `code/git-config`'s host rule; one blank line between `repos:` entries, a requester block included.                                                                        | —                                                   | G3, G4         |
| G11 | Review row            | One `Kind: review` row: runnable code lands (the script and the checker).                                                                                                                                                                                           | wave review alone                                   | G9             |
| G12 | Bumps                 | Once per level since the last release, across the chain; packs too.                                                                                                                                                                                                 | every plan bumps                                    | G11            |

## New dependencies

None.

## Units

| Id  | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                    | Depends on     | Status  | Commit   |
| --- | ---- | ---------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| G1  | 1    | [01-engine.md](01-engine.md)                   | edit   | `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/*.mjs` (not `lib/tools/`), `scripts/src/tool-config-core.test.ts`, `scripts/src/tool-config-mise.test.ts`                                                                                                                                                                                                               | —              | green   | ef03d9ed |
| G2  | 1    | [02-templates.md](02-templates.md)             | edit   | `plugins/stackgen/skills/tool-config/assets/{dprint,pre-commit,gitleaks,grype}/**`, `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/conf.d/tools.dev.toml`, `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/precommit`, `scripts/src/fixtures/tool-config/mise/**`                                                                                                                              | —              | green   | bd623ec1 |
| G3  | 2    | [03-tool-modules.md](03-tool-modules.md)       | edit   | `plugins/stackgen/skills/tool-config/scripts/lib/tools/{index,dprint,pre-commit,gitleaks,grype,exclude}.mjs`, `scripts/src/tool-config-gates.test.ts`, `scripts/src/fixtures/tool-config/gates/**`, `scripts/src/tool-config-mise.test.ts`, `scripts/src/fixtures/tool-config/mise/**`                                                                                                                                                  | G1, G2         | pending |          |
| G4  | 2    | [04-checker-widen.md](04-checker-widen.md)     | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                                                                                     | G1             | pending |          |
| G5  | 3    | [05-pack-entries.md](05-pack-entries.md)       | edit   | the dprint, pre-commit and `all` entries in `plugins/stackgen/stacks/{cloud-service/containers,cloud-service/cloud-run,framework/html,framework/astro,stylesheet/stylex,stylesheet/plain-css,stylesheet/tailwindcss,language/typescript,deploy-target/container-image,package-manager/pnpm,package-manager/uv,package-manager/swiftpm,app-framework/swiftui,app-framework/flutter}/pack.yaml`; `plugins/stackgen/assets/pack-format.md` | G4             | pending |          |
| G6  | 3    | [06-stackgen-prose.md](06-stackgen-prose.md)   | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/{dprint,pre-commit,gitleaks,grype,mise}.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`                                                                                                                                                                                                               | G3             | pending |          |
| G7  | 3    | [07-vwf-prose.md](07-vwf-prose.md)             | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/{new-repo,existing-repo}.md`, `plugins/vwf/skills/init/assets/hygiene/CONTRIBUTING.md`, `plugins/vwf/skills/setup/references/materialize.md`, `plugins/vwf/skills/doctor/references/code-intelligence.md`                                                                                                                                                       | G3             | pending |          |
| G8  | 4    | [08-checker-tighten.md](08-checker-tighten.md) | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                                                                                     | G4, G5         | pending |          |
| G9  | 5    | [09-review.md](09-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                       | G3, G8         | pending |          |
| G10 | 6    | [10-docs.md](10-docs.md)                       | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{stackgen-plugin,vwf-plugin,plugin-authoring}/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-01-*.md` (new)                                                                                                                                                                                                                                               | G5, G6, G7, G9 | pending |          |
| G11 | 7    | [11-gates-and-bump.md](11-gates-and-bump.md)   | edit   | `site/package.json`, `plugins/{stackgen,vwf}/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, the `version:` line of the 14 packs in G5 and the bundle pins naming them, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                          | G10            | pending |          |

## Shared-file rule

| File                                                                               | Why it collides                                                   | Owner                                                    |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| version files, `marketplace.json`, `inventory.md`                                  | versions and generated                                            | G11 only                                                 |
| the 14 edited `pack.yaml` files                                                    | G5 rewrites entries; G11 bumps `version:`                         | G5 wave 3, G11 wave 7                                    |
| `scripts/src/check.ts`, `scripts/src/check.test.ts`                                | G4 widens, G8 tightens                                            | G4 wave 2, G8 wave 4                                     |
| `TC/assets/mise/**`                                                                | plan 1 owns the mise templates; G2 adds one pin and one task edit | G2, those two files only                                 |
| `scripts/src/tool-config-mise.test.ts`, `scripts/src/fixtures/tool-config/mise/**` | plan 1 suite affected by G1, G2, G3                               | G1 (test) and G2 (fixtures) in wave 1, G3 both in wave 2 |
| `TC/references/mise.md`                                                            | the formatter step and node pin touch mise prose                  | G6, those passages only                                  |
| every human-facing doc                                                             | n units editing one doc                                           | G10 only                                                 |

## Waves

- **Wave 1 — G1, G2.** Engine against templates: disjoint trees.
- **Wave 2 — G3, G4.** G3 needs the engine and templates; G4 imports only G1's
  schema. Disjoint paths.
- **Wave 3 — G5, G6, G7.** G5 needs G4 to validate the new entries; G6 and G7
  describe G3's interface. Stacks, stackgen skills, vwf skills — disjoint.
- **Wave 4 — G8**, refusing string entries only once G5 migrated them.
- **Wave 5 — G9**, the review row, after every unit it covers (G1, G3, G4, G8).
- **Wave 6 — G10**, docs. **Wave 7 — G11**, gates and bump.

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

| Step                       | Mode | Notes                                                                                                                          |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into the dev marketplace; a restarted session picks them up                                            |
| `/vwf:backlog close B77`   | run  | reason: `superseded by docs/plans/2026-10-01-tool-config-script-gates — all six items met by the script (G1, G2, G6, G7, G10)` |

## Gates the orchestrator keeps

The **scratch-repo run**, after wave 3 and again after G11: a temporary git
repo, an isolated `HOME`, `MISE_DATA_DIR`, `MISE_CONFIG_DIR`, `MISE_CACHE_DIR`
and `MISE_STATE_DIR`, the isolated global mise config setting
`trusted_config_paths` to the scratch path, `node` and `mise` on `PATH`, network
available:

1. `node plugins/stackgen/skills/tool-config/scripts/tool-config.mjs all --repo scratch --answers <every row ok>`
   lands every tool, runs `setup:all`, formats and validates; no `needs-edit`
   row.
2. The same `preview all` returns **no rows**.
3. `mise x -- pre-commit validate-config` and `mise x -- dprint check` pass in
   the scratch repo.
4. The script's `check` reports no drift.
5. A copy outside `trusted_config_paths` stops with the trust remedy.

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

- git, graphify and renovate, and retiring `check.ts`'s string grammar — plan 3.
- `vwf:init`'s scripted mise steps — plan 4; this plan edits only the init
  passages the trust and `setup:all` rulings and the flag grammar falsify.
- gitleaks custom rules and fingerprint allowlist entries — the user's lines,
  written by hand (`gitleaks.md:38-41,84-90`).

## Parked

- Plan 3: git, graphify and renovate onto the engine (template fetch, SHA pins);
  the remaining pack entries structured; `check.ts`'s string grammar retired.
  Closes B79 as superseded.
- Plan 4: `vwf:init`'s mise steps scripted — bootstrap, the `_default` slot,
  existing-repo passes 3, 4, 5, 8 and 9. Closes B80 as superseded.
- `/release` once plans 0–4 have all landed.

## Run log

| Wave | Unit           | Model | Round | Outcome | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Commit |
| ---- | -------------- | ----- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight      | —     | 1     | pass    | wave gate 8/8 green; doctor blocking predicates clear (mise, graphify CLI, main-checkout graph); no .config/vwf.yaml — no stack, LSP n/a (no code unit)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —      |
| 0    | preflight      | —     | 1     | skipped | conventions fetch — why: no code unit; format check — why: no covers:; mempalace down — journal skipped; sequence W1 G1,G2 → W2 G3,G4 → W3 G5,G6,G7 → W4 G8 → W5 G9 review → W6 G10 → W7 G11; note: plan 1's contested mise.mjs defects (fold duplicate keys, legacy member-flag comments) are outside this plan's Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —      |
| 1    | G2 templates   | opus  | 1     | pass    | edit; pre-commit-config.yaml: post-merge install type, graphify-refresh at post-commit + post-merge (always_run kept); tools.dev.toml: node = latest in the mise block; golden mirrors the node pin; DECIDED: node above python/uv (mise test expects uv last); setup/precommit unchanged (installs whatever install types list); no new anchors; GAP: typescript pack pins node via mise_tool: node — expected conflict row vs the dev pin, for G3/G6; DOCS FALSIFIED (post-commit-only graph refresh) → G6: TC pre-commit.md:48-50,226,361,400, mise.md:1089; → G7: doctor code-intelligence.md:35; → G10: site stackgen.md:679, vwf.md:36,952,3452,3463, installer/targets.md:72                                                                                                                                                                                                                                       | —      |
| 1    | G1 engine      | opus  | 1     | pass    | edit; new lib/run.mjs (tools only via mise x -- after mise which, missing tool → setup:all remedy, read-only trust check, setupAll); tool-config.mjs: trust check before rows, land() = write → setup:all (all only) → dprint fmt → validate-config → lock, byte-for-byte restore on fmt/validate failure, all <verb> routed to the 'all' module, remove op takes tools?; cli.mjs all <verb>, bool flags; schema.mjs GATE_VERBS, FLAG_TYPES, classifyPath, entry schema for dprint/pre-commit/grype/all; rows.mjs RefusalError extra; 31 new core cases, fake mise; vitest 467; DECIDED: dprint --allow-no-files; formatter skipped with no .config/dprint.json; exclude module registers as 'all'; GAP: G2/G3 output must be dprint-stable; GAP: setup:all failure leaves unrecorded files → conflict rows on re-run; DOCS FALSIFIED → G6: TC SKILL.md:60-61, Arguments grammar, exit-2 table, cross-tool verb paragraph | —      |
| 1    | R1 wave review | opus  | 1     | pass    | 2 notes, accepted without loop-back: (G1) grype add-ignore pack-entry schema added beyond edit 6 — fits G7/G9, G4/G5 confirm; (G1) trust check runs on every non-check call incl. preview — G4 says an untrusted config stops the call; CONTRACT clean, RULINGS clean (G8 satisfied: latest resolved at write time)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —      |
| 1    | wave gate      | —     | 1     | pass    | 8/8 green (code:precommit reformatted once, green on re-run); G1 ef03d9ed, G2 bd623ec1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-01-tool-config-script-gates

or let the queue pick it, by priority:

/vwf:execute next
