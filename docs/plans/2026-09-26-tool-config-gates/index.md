---
type: vwf-change-plan
title: tool-config gates — dprint, pre-commit, gitleaks and grype move into
  stackgen:tool-config
requires:
  - docs/plans/2026-09-26-tool-config-mise
backlog: []
backlog_pieces: [ B66, B72 ]
---

# Plan — tool-config gates — dprint, pre-commit, gitleaks and grype move into stackgen:tool-config (2026-09-26)

## Status

**RUNNING**

RUNNING since 2026-09-26 22:50 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-26-tool-config-gates

## Consent

| Action                                                                                 | Granted                                                             |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Merge to the integration branch and push on green                                      | yes                                                                 |
| After landing: `mise run p:plugins:local`                                              | run                                                                 |
| After landing: `graphify hook uninstall && pre-commit install --hook-type post-commit` | run                                                                 |
| Release stackgen publicly                                                              | none here — rides T1's `2.0.0`, untagged; the chain ships after T3  |
| Release vwf publicly                                                                   | none here — rides T1's `20.0.0`, untagged; the chain ships after T3 |
| Release site publicly                                                                  | none — not this time                                                |
| Release installer publicly                                                             | none — untouched                                                    |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, `stackgen:tool-config` owns dprint, pre-commit, gitleaks and
grype the way T1 made it own mise: their content lives in the skill, every other
pack asks for a dprint plugin, a pre-commit hook, an exclude or an ignore
through a `tool-config:` call, the `repo-gates` bundle is gone, init lands the
gates through `/stackgen:tool-config all`, and a shaped repo — this one included
— refreshes its graphify graph from a pre-commit `post-commit` hook instead of
graphify's raw git hooks.

T2 of three: T1 (`docs/plans/2026-09-26-tool-config-mise`) made the skill and
moved mise; T3 (`docs/plans/2026-09-26-tool-config-hygiene`) moves repo-hygiene,
drops `merge=graphify` and finishes init's cutover. This plan lands a piece of
B66 and a piece of B72; T3 finishes both.

**Reversals, all confirmed at the interview:**

1. The `pre-commit.d/` fragment contract
   (`plugins/vwf/skills/init/references/fragments-and-sections.md`, the merge
   markers in the pre-commit pack's config) — retired; a pack calls
   `/stackgen:tool-config pre-commit add hook … for <pack>` instead.
2. The unconditional `repo-gates` bundle — deleted; the four tools are the
   skill's.
3. The per-tool skills the four packs copied into target repos — folded into
   `references/<tool>.md`, copied nowhere.
4. The base exclusion set and `linter.yaml` ignores carrying every stack's
   entries — the base keeps the universal ones; each pack adds its own.

## Facts the survey established

- **T1 lands first**: `plugins/stackgen/skills/tool-config/` with `SKILL.md`
  (the contract: `<tool> <instruction> [for <requester>]`, `all [answers]`,
  blocks tagged `# >>> <requester>` / `# <<< <requester>`, drift asked, no hash,
  `remove <requester>`, lock `source: tool-config/<tool>@<version>`),
  `references/mise.md`, `assets/mise/.config/**` (the task library, including
  `code/graph` and `setup/precommit`). Packs carry a `tool-config:` list in
  `pack.yaml`. The checker already walks `skills/tool-config/assets/*` as a
  payload root; this repo's `.config/dprint.json` and pre-commit exclusions
  already cover it. Versions after T1: stackgen `2.0.0`, vwf `20.0.0`, untagged.
- **The four packs** (`plugins/stackgen/stacks/toolchain-gate/<tool>/`), each
  with `pack.yaml`, `conventions.md`, `skills/<tool>/SKILL.md` (copied into
  target repos) and `config/`; none has `binaries`, `lockfile`, `machine_env` or
  a `conf.d` fragment (mise pins the binaries at `latest` in the dev tools
  file):
  - dprint `1.1.2`: `.config/dprint.json`, `.config/taplo.toml`,
    `.config/vscode.d/dprint-editor.jsonc` (conditional, editor vscode), root
    `dprint.json` shim. Plugins (`dprint.json:65-74`): markdown, dockerfile,
    markup_fmt, pretty_yaml, malva, typescript, json, exec (routes `.toml` to
    taplo, :22-31). Exclude set (:5-21, the same in `taplo.toml:14-30`):
    `.build`, `.claude`, `.git`, `.turbo`, `.venv`, `Derived`, `*.xcassets`,
    `build`, `dist`, `graphify-out`, `node_modules`, `target`, `*-lock.json`,
    `*-lock.yaml`, `*.lock`.
  - pre-commit `1.1.6`: `.config/pre-commit-config.yaml`,
    `.config/git-conventional-commits.yaml` (`commitScopes: []` at :40, filled
    by init), `.config/linter.yaml` (ignores :43-52: `build`, `.dart_tool`,
    `.build`, `.swiftpm`, `DerivedData`, `Derived`, `.venv`,
    `.config/mise/locks`), `vscode.d/pre-commit.jsonc` (conditional). Config:
    `default_install_hook_types` [pre-commit, commit-msg] :20-22, global
    `exclude` :48-64, local hooks git-config :69, format :94, lint :103, sec
    :113, pre-commit-hooks :124-194, conventional-commits :203, meta :224-229,
    the `pre-commit.d` merge markers :235-240.
  - gitleaks `1.1.2`: `.config/gitleaks.toml`, `[extend] useDefault=true`,
    `[allowlist] paths` :45- (`.turbo`, `.venv`, `build`, `dist`,
    `graphify-out`, `node_modules`, `target`).
  - grype `1.0.1`: `.config/grype.yaml`, `fail-on-severity: medium` :15,
    `ignore: []` :40.
- **The bundle**: `plugins/stackgen/stacks/bundles/repo-gates.md`,
  `unconditional: true`, pins :7-10; prose in `bun.md:32`, `pnpm-turbo.md:33`,
  `pnpm-workspace.md:39`, `mise.md:55`, `repo-hygiene.md:38`.
- **The one landed fragment**:
  `stacks/package-manager/uv/config/.config/pre-commit.d/uv.yaml` (uv `0.1.0`,
  pinned by no bundle). No other pack ships a dprint plugin or a `linter.yaml`
  ignore; `linter.yaml` is read by the `code/lint` overlays of pnpm, eslint,
  flutter, swiftui and swift.
- **Tasks** read fixed paths that do not move: `code/format:30`
  (`.config/dprint.json`), `code/sec:34-35` (gitleaks, grype),
  `code/precommit:25`, `setup/precommit:13,124-126` (`pre-commit install`).
- **Checker** (`scripts/src/check.ts`): rule 11 `checkPackConfigTier` :427,
  `PACK_HOOK_FRAGMENTS` :273 parsed :510-518, `PACK_PRE_COMMIT_CONFIG` :281
  parsed :503-508, `preCommitFaults` :812, root `dprint.json` shim allowlist
  :346-348; rule 15 `checkExclusionSets` :1899-1980 over `EXCLUSION_LISTS`
  :1705-1740, which hard-codes the four pack paths — a missing file is skipped
  (:1931), so a move silently ends the check. Tests: `check.test.ts:283`,
  :521-544, rule 15 :1417-1570. `inventory.ts` reads `unconditional` at :69,
  :178, :247. The shellcheck task comment :45 names the pre-commit pack path.
- **vwf init**: fixed slugs `SKILL.md:746`, `new-repo.md:82-88` (mise → gates →
  hygiene); adoption table `tool-configs.md:36-45` (rows :38, :40-42, dprint
  note :52-56); commit scopes `SKILL.md:487-489,730`, `new-repo.md:405`,
  `existing-repo.md:874-906`; hook manager `existing-repo.md:199-221`; the
  `pre-commit.d` merge `fragments-and-sections.md:120-176`.
- **Other readers**: setup `SKILL.md:110`, `references/onboard-pipeline.md:58`;
  doctor `references/stack-checks.md:287`,
  `references/harness-and-memory.md:56`, `references/code-intelligence.md:32`;
  `plugins/vwf/assets/memory.md:249`, `plugins/vwf/assets/graphify.md:99`;
  stackgen-stack-menu `SKILL.md:29,36,39,112`; stackgen-stack-template
  `SKILL.md:165`, `references/materializer.md:116`; stackgen-sync
  `SKILL.md:39,134`; stackgen assets `pack-format.md:34,64,123,353-376,478`,
  `output-tree.md:147,256,325-326`, `kinds.md:267,301,533`, `taxonomy.md:250`.
- **Docs naming the retired names**: `site/src/content/docs/plugins/stackgen.md`
  (:336, :498, :614, :677, :695, :703, :766), `CLAUDE.md:173`,
  `.claude/docs/repo-shape.md:171`, `.claude/skills/stackgen-plugin/SKILL.md`
  (:81, :190, :254, :296, :302, :373), `.claude/skills/vwf-plugin/SKILL.md:121`,
  `.claude/skills/vwf-plugin/references/{dependencies.md:33,skills-and-agents.md:27}`,
  `.claude/skills/plugin-authoring/references/checks.md:105`.
- **graphify in this repo**: raw `post-commit` and `post-checkout` hooks from
  `graphify hook install` in `.git/hooks`; no `code/graph` task; this repo's
  `.config/pre-commit-config.yaml` has `default_install_hook_types` at :20 and
  `exclude: ^graphify-out/` at :39. The PyPI name is `graphifyy`.
- **graphify's raw hook in a shaped repo** (gap 11 of
  `docs/plans/2026-09-26-tool-config-mise`): `setup:precommit` runs
  `graphify hook uninstall` before `pre-commit install` when
  `.git/hooks/post-commit` carries `# graphify-hook-start` (U8 edit 6).
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes.

## Assumed decisions — confirm or override at review

| #  | Decision        | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Rejected                                                  | Unit     |
| -- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------- |
| 1  | Content home    | The four packs move into the skill: each `config/**` → `assets/<tool>/**` (the landed shape), `conventions.md`, `skills/<tool>/**` and `pack.yaml`'s facts → `references/<tool>.md`. The packs and `bundles/repo-gates.md` are deleted; no tool skill is copied into target repos. The `vscode.d` fragments land only when `editor=vscode`. The root `dprint.json` shim stays a dprint asset.                                                                                                              | keeping the packs as data                                 | U1 U2 U4 |
| 2  | dprint plugins  | The base carries markdown, pretty_yaml, json and exec (taplo). The rest come from calls: typescript ← `language/typescript`; malva ← `stylesheet/{plain-css,stylex,tailwindcss}`, `framework/astro`, `framework/html`; markup_fmt ← `framework/astro`, `framework/html`; dockerfile ← `deploy-target/container-image`, `cloud-service/containers`, `cloud-service/cloud-run`. A plugin several packs request is written once; the lock lists every requester and `remove` drops it only when none is left. | fewer callers (astro and html only, container-image only) | U2 U3 U8 |
| 3  | Excludes        | The base set is `.claude .git graphify-out build dist *.lock`. pnpm adds `node_modules .turbo *-lock.json *-lock.yaml`; uv adds `.venv`; swiftpm adds `.build .swiftpm`; swiftui adds `Derived DerivedData *.xcassets`; `target` is dropped. The verb `/stackgen:tool-config all add exclude [generated] <paths>` writes dprint's excludes, taplo's excludes and the pre-commit global exclude; `generated` also writes the gitleaks allowlist — so rule 15 holds by construction.                         | all fifteen entries in the base; keeping `target`         | U2 U3 U8 |
| 4  | linter.yaml     | Stays with pre-commit. Its base ignores are `build graphify-out .config/mise/locks`; flutter adds `.dart_tool`, swiftpm `.build .swiftpm`, swiftui `Derived DerivedData`, uv `.venv`, through `pre-commit add linter-ignore <paths> for <pack>`.                                                                                                                                                                                                                                                           | —                                                         | U2 U3 U8 |
| 5  | pre-commit      | `default_install_hook_types` gains `post-commit`; a local `graphify-refresh` hook at stage `post-commit` runs `mise x -- mise run code:graph`, `always_run`, `pass_filenames: false`. The `pre-commit.d` markers retire; uv's fragment becomes `pre-commit add hook … for uv` and is deleted. Commit scopes arrive as an argument (`pre-commit set scopes <a,b,…>`), never hand-filled.                                                                                                                    | landed `pre-commit.d/`                                    | U2 U3 U8 |
| 6  | gitleaks, grype | gitleaks' allowlist is written only through `all add exclude generated`; grype gets `grype add ignore <id> [reason]` and `grype remove ignore <id>`.                                                                                                                                                                                                                                                                                                                                                       | per-tool exclude verbs                                    | U2 U8    |
| 7  | init            | init lands the gates through the `/stackgen:tool-config all` call T1 introduced (`all` now lands the five tools) and fetches only the hygiene bundle through the adapter; the commit scopes it derives pass as an argument. Its adoption table (`tool-configs.md`) stays in init, each row naming the skill as the owner of the landed file. The `pre-commit.d` merge section retires.                                                                                                                     | —                                                         | U6       |
| 8  | Checker         | Rule 11 drops the `pre-commit.d` fragment parse and the whole pre-commit config parse; a file under a pack's `config/.config/pre-commit.d/` is a finding. Rule 15's `EXCLUSION_LISTS` repoint to `skills/tool-config/assets/{dprint,pre-commit,gitleaks}/`, and a missing list file is now a finding, not a skip. A pack `tool-config:` line adding an exclude through `dprint`, `pre-commit` or `gitleaks` alone, instead of `all add exclude`, is a finding. `inventory.ts` drops `repo-gates`.          | —                                                         | U5       |
| 9  | This repo       | This repo takes the graphify hook now: `post-commit` in `default_install_hook_types`, the `graphify-refresh` hook, a `code/graph` task copied from T1's `assets/mise/.config/mise/tasks/code/graph`, and `"pipx:graphifyy" = "latest"` in `.config/mise/conf.d/tools.dev.toml`. The hook swap on this machine is an after-landing step.                                                                                                                                                                    | leaving it for a reshape                                  | U12      |
| 10 | Review row      | One `Kind: review` row (U9): the checker, this repo's task and hook, and the task library's `setup/precommit`.                                                                                                                                                                                                                                                                                                                                                                                             | the wave review alone                                     | U9       |
| 11 | Pack bumps      | Every pack U3 edits bumps one minor from its `pack.yaml` version at run time (skipping a 13 or 17 component), with every bundle pin and `inventory.md`, in one commit. No plugin version changes — T1's `2.0.0` and `20.0.0` carry the chain.                                                                                                                                                                                                                                                              | bumping the plugins again                                 | U11      |
| 12 | Comments        | Any comment or sentence a unit adds is one line (B65).                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —                                                         | all      |

## New dependencies

none.

## Units

| Id  | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Depends on             | Status  | Commit   |
| --- | ---- | ---------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------- | -------- |
| U12 | 1    | [12-this-repo.md](12-this-repo.md)             | edit   | `.config/pre-commit-config.yaml`, `.config/mise/tasks/code/graph` (new), `.config/mise/conf.d/tools.dev.toml`, widened by U9: `.config/mise/mise.lock`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —                      | green   | 17c65aef |
| U5  | 1    | [05-checker.md](05-checker.md)                 | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `scripts/src/inventory.ts`, `.config/mise/tasks/p/plugins/shellcheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —                      | green   | c032583e |
| U1  | 1    | [01-move.md](01-move.md)                       | edit   | `plugins/stackgen/stacks/toolchain-gate/{dprint,pre-commit,gitleaks,grype}/**`, `plugins/stackgen/stacks/bundles/repo-gates.md`, `plugins/stackgen/skills/tool-config/assets/{dprint,pre-commit,gitleaks,grype}/**` (new), `plugins/stackgen/skills/tool-config/references/{dprint,pre-commit,gitleaks,grype}/**` (new, raw material)                                                                                                                                                                                                                                                                                                                    | —                      | green   | c55cfbe9 |
| U3  | 1    | [03-packs.md](03-packs.md)                     | edit   | the `pack.yaml` (not its `version:` line) and `config/` of `language/typescript`, `stylesheet/{plain-css,stylex,tailwindcss}`, `framework/{astro,html}`, `deploy-target/container-image`, `cloud-service/{containers,cloud-run}`, `package-manager/{pnpm,uv,swiftpm}`, `app-framework/{swiftui,flutter}`                                                                                                                                                                                                                                                                                                                                                 | —                      | green   | ba0199cd |
| U4  | 1    | [04-stackgen-skills.md](04-stackgen-skills.md) | edit   | `plugins/stackgen/skills/{stackgen-stack-template,stackgen-stack-menu,stackgen-sync}/**`, `plugins/stackgen/assets/{pack-format,output-tree,kinds,taxonomy}.md`, `plugins/stackgen/stacks/readme.md`, the prose (not the pins) of `plugins/stackgen/stacks/bundles/{bun,pnpm-turbo,pnpm-workspace,repo-hygiene}.md`                                                                                                                                                                                                                                                                                                                                      | —                      | green   | 82ac7cf9 |
| U6  | 1    | [06-init.md](06-init.md)                       | edit   | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                      | green   | 354546d5 |
| U7  | 1    | [07-setup-doctor.md](07-setup-doctor.md)       | edit   | `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/doctor/**`, `plugins/vwf/assets/{memory,graphify}.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —                      | green   | 98dc00b1 |
| U2  | 2    | [02-skill.md](02-skill.md)                     | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | U1                     | green   | d1db5033 |
| U8  | 2    | [08-assets.md](08-assets.md)                   | edit   | `plugins/stackgen/skills/tool-config/assets/{dprint,pre-commit,gitleaks,grype}/**`, `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/precommit`, the prose of `plugins/stackgen/stacks/bundles/mise.md`, widened by the scratch gate: `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/code/graph`, `plugins/stackgen/skills/tool-config/assets/mise/.config/mise.toml`                                                                                                                                                                                                                                      | U1                     | green   | 78389403 |
| U9  | 3    | [09-review.md](09-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | U5, U8, U12            | pending |          |
| U10 | 4    | [10-docs.md](10-docs.md)                       | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-26-tool-config-gates.md` (new), widened by R1 (rule 5): `plugins/stackgen/agents/stackgen-skill-reviewer.md`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`, `plugins/stackgen/stacks/toolchain-gate/{eslint,ruff}/conventions.md`, `plugins/stackgen/stacks/package-manager/uv/conventions.md`, `plugins/stackgen/stacks/package-manager/swiftpm/skills/swiftpm/SKILL.md`, widened by U9: `plugins/stackgen/stacks/package-manager/pnpm/conventions.md`, `plugins/stackgen/stacks/toolchain-gate/eslint/skills/eslint/SKILL.md` | U2, U3, U4, U6, U7, U9 | pending |          |
| U11 | 5    | [11-gates-and-bump.md](11-gates-and-bump.md)   | edit   | `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`, the `version:` line of every pack U3 edited, every `plugins/stackgen/stacks/bundles/*.md` pin naming them                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | U10                    | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                  | Why it collides                                          | Owner                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `plugins/stackgen/skills/tool-config/assets/{four tools}/**`          | U1 moves it in, U8 edits it                              | U1 (wave 1), then U8 (wave 2)                                                   |
| `plugins/stackgen/skills/tool-config/references/**`                   | U1 moves raw material in, U2 writes the references       | U1 (wave 1), then U2 (wave 2)                                                   |
| `plugins/stackgen/skills/tool-config/SKILL.md`                        | T1's contract; only the tool list and grammar grow       | U2 only                                                                         |
| bundle files: prose vs pins                                           | U4 and U8 edit prose, U11 edits pins                     | U4/U8 (waves 1–2), then U11 (wave 5)                                            |
| the edited packs' `version:` lines, their bundle pins, `inventory.md` | a version, its pins and the inventory land in one commit | U11 (wave 5); the orchestrator regenerates `inventory.md` into U1's commit only |
| `marketplace.json`                                                    | generated                                                | U11 only                                                                        |
| every human-facing doc outside `plugins/`                             | n units, one doc                                         | U10 only                                                                        |

## Waves

- **Wave 1 — U12, U5, U1, U3, U4, U6, U7.** Disjoint paths; every unit writes
  against the new paths. **Commit order: U12 first** (it owns
  `.config/pre-commit-config.yaml`; an unstaged own config aborts every commit),
  **U1 second** (with `plugins/stackgen/stacks/inventory.md` regenerated by the
  orchestrator in the same commit — the move changes it), **U3 third**, **U5
  fourth** (its new rules scan U1's paths and U3's packs, so it commits after
  both), then the rest.
- **Wave 2 — U2, U8**, inside the moved tree (disjoint: `SKILL.md` and
  `references/**` vs `assets/**`).
- **Wave 3 — U9**, review. **Wave 4 — U10**, docs. **Wave 5 — U11**, gates and
  bumps.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

every line with `MISE_ENV=dev` exported, plus the wave review, plus every report
read for `UNRESOLVED:`.

## After landing

| Step                                                                    | Mode | Notes                                                                                  |
| ----------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------- |
| `mise run p:plugins:local`                                              | run  | stages the landed plugins on this machine; picked up by a **restarted** session        |
| `graphify hook uninstall && pre-commit install --hook-type post-commit` | run  | this checkout's hook swap (decision 9), run from the main checkout with `MISE_ENV=dev` |

## Gates the orchestrator keeps

**The skill in a scratch repo**, after wave 2, isolated (`HOME` and every
`MISE_*` dir under one `mktemp -d`): follow
`plugins/stackgen/skills/tool-config/SKILL.md` and its references by hand for
`/stackgen:tool-config all repo=scratch`, then run pnpm's, typescript's and uv's
`tool-config:` calls. Pass condition: dprint's excludes, taplo's excludes and
the pre-commit global exclude state one set, and the gitleaks allowlist is a
subset of it; `dprint.json` carries the four base plugins plus a
`# >>> typescript` block; the pre-commit config has `post-commit` in its install
types, the `graphify-refresh` hook and a `# >>> uv` block;
`pre-commit validate-config .config/pre-commit-config.yaml` passes; `remove uv`
deletes only uv's blocks; a line added outside every block survives. Record in
the Run log; a failure goes back to U2 or U8.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **repo-hygiene, `.editorconfig` dropped, `merge=graphify` dropped, init's
  final cutover** — T3 (`docs/plans/2026-09-26-tool-config-hygiene`).
- **B67** (`docs/plans/2026-09-26-init-commits-the-lock`) — runs after T3.
- **B68** (a landed path changing its owning pack), **B70** (the linter pin into
  the packs), the `min_versions` gate, **B65** — later plans.
- **eslint, ruff, swiftlint, swift-format, analysis-options, tsconfig** — gate
  packs of a language, not universal tools; they stay packs.

## Parked

- B66: repo-hygiene moves into `stackgen:tool-config` and init's unconditional
  bundles retire — planned as `docs/plans/2026-09-26-tool-config-hygiene` (T3),
  which finishes it.
- B72: the `merge=graphify` line leaves the hygiene pack's `.gitattributes` — T3
  (`docs/plans/2026-09-26-tool-config-hygiene`), which finishes it.

## Gaps surfaced during execution

1. **`pre-commit add hook` argument shape** (U3, U5, wave 1) — the plan wrote
   `<repo> <id> [stage] …`; U3 assumed `key=value` pairs, U5's grammar accepts
   `<repo> <id> [anything]`. Handed to U2 to state in
   `references/pre-commit.md`.
2. **Commit-gate forge links** (U6, wave 1) — the plan does not say who fills
   them once init stops; U6 assumed the skill fills them from `origin`. Closed
   by U2 (wave 2): the skill fills them from `origin`.
3. **existing-repo pass 8** (U6, wave 1) — commit-type renames still rewrite the
   commit gate's config, which the skill now owns. Left unchanged.
4. **Root `dprint.json` on the pack-may-land tier** (U4, wave 1) —
   `output-tree.md` and `materializer.md` still list it there though the skill
   lands it; left to match the checker's allowlist.
5. **`.config/mise/locks` kept in the formatter base** (U8, wave 2) — decision
   3's base set omits it; dropping it would reverse e1697f29.
6. **Edit 7 moot** (U8, wave 2) — T1 deleted `bundles/mise.md`; no bundle names
   `repo-gates`.
7. **`graphify hook uninstall` strips `merge=graphify`** (U8, wave 2) — and
   deletes `.gitattributes` when nothing else is in it; T3's to reconcile.
8. **R2 contested** (wave 2, cap) — `references/pre-commit.md:112` places the
   convention file's marked positions inside a `pre-commit` block the file no
   longer has (U2); the linter asset's comment at `linter.yaml:31` says the
   defaults skip `graphify-out` while the base lists it (U8).
9. **U8 Owns widened** (orchestrator) —
   `assets/mise/.config/mise/tasks/code/graph` (wording falsified by the
   post-commit hook, reported by U12) and `assets/mise/.config/mise.toml`
   (failed the shipped format check as landed, found by the scratch gate).
10. **Shipped format check skips extensionless task files** (U8, wave 2) —
    dprint has no plugin for them.
11. **U9 findings on uncovered units, dropped under the one rule** (wave 3) —
    real defects no row reviews: `swiftui/pack.yaml:100` asks
    `all add exclude *.xcassets`, which the skill classes as a file glob, so
    files inside an asset catalog are no longer excluded (the old base spelled a
    directory; rule 15 cannot see it, and the grammar has no directory-glob
    spelling) (U3/U2); `init/references/existing-repo.md:190` and
    `tool-configs.md:23` send a moved brownfield gate config to a skill conflict
    row the skill does not define, losing pass 6's replace-or-keep (U6);
    `init/SKILL.md:317` still says three fixed slugs, and its description says
    bundles (U6); `doctor/references/code-intelligence.md:35` names
    `/vwf:setup reshape` as the remedy for a raw graphify hook, which only
    `setup:precommit` removes (U7).
12. **U12 Owns widened to `.config/mise/mise.lock`** (U9) — decision 9 gave no
    unit the lock entry its new pin needs.
13. **U10 Owns widened by U9** — `stacks/package-manager/pnpm/conventions.md:63`
    and `stacks/toolchain-gate/eslint/skills/eslint/SKILL.md:93` name the
    deleted pre-commit gate pack.
14. **No validation after a gate write** (U9 round 2, uncovered U2, dropped) —
    the retired init merge ran `pre-commit validate-config` and restored on
    failure; no tool-config reference validates a gate config after `add hook`
    or `remove`, so a malformed config can land with its hash recorded.
15. **graphify merge-driver config left** (U8, wave 3) — the no-graphify strip
    path leaves `merge=graphify` config in place; T3 drops it.

## Run log

| Wave | Unit               | Model | Round | Outcome      | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Commit              |
| ---- | ------------------ | ----- | ----- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 0    | preflight          | opus  | 1     | pass         | node edit; doctor: not onboarded (no .config/vwf.yaml), no blocking, as in tool-config-mise; wave gate 7/7 green; no code unit — LSP and conventions fetch skipped; no covers: — format check skipped                                                                                                                                                                                                                                                                                                                                                                        | —                   |
| 1    | U1 move            | opus  | 1     | pass         | node edit; four packs' config → assets/<tool>/, conventions+pack.yaml+SKILL.md → references/<tool>/ (skill at references/<tool>/<tool>/SKILL.md), packs and repo-gates.md removed; 22 files byte-identical; GAP none                                                                                                                                                                                                                                                                                                                                                         |                     |
| 1    | U3 packs           | opus  | 1     | pass         | node edit; 14 pack.yaml gain tool-config: lines (dprint plugins, all add exclude [generated], pre-commit linter-ignore, uv-lock-check hook); uv pre-commit.d fragment removed; DOCS FALSIFIED: stylesheet pack.yaml comment names repo-gates bundle; GAP: pre-commit add hook args unspecified — assumed key=value pairs, handed to U2                                                                                                                                                                                                                                       |                     |
| 1    | U7 setup-doctor    | opus  | 1     | pass         | node edit; setup, onboard-pipeline, doctor (SKILL §8, stack-checks, harness-and-memory, code-intelligence), graphify.md, memory.md: repo-gates → tool-config all, graphify-refresh post-commit hook, raw hook is drift; DECIDED: also setup step 5 + doctor §8 row (said no refresh hook); GAP none                                                                                                                                                                                                                                                                          |                     |
| 1    | U12 this-repo      | opus  | 1     | pass         | node edit; pre-commit: post-commit install type + graphify-refresh hook; code/graph copied from T1 asset (755); pipx:graphifyy = latest in tools.dev.toml; DOCS FALSIFIED: code/graph asset says run by hand / raw hook never installed — routed to U8; GAP none                                                                                                                                                                                                                                                                                                             |                     |
| 1    | U5 checker         | opus  | 1     | pass         | node edit; rule 11 drops pre-commit.d + whole-config parse, pre-commit.d file is a finding; rule 15 repointed, missing list a finding; tool-config grammar widened (dprint add plugin, all add exclude [generated], pre-commit add linter-ignore/hook), lone-tool exclude a finding; inventory.ts untouched (no repo-gates); check.test 160/160; GAP: pre-commit add hook shape — accepted <repo> <id> [anything]                                                                                                                                                            |                     |
| 1    | U6 init            | opus  | 1     | pass         | node edit; init fetches repo-hygiene only, gates via tool-config all with scopes=; new-repo §2/§6/§7, existing-repo §11 + passes 6-9, tool-configs Owner column, fragments-and-sections merge retired; GAP: forge links — assumed skill fills from origin (handed to U2); GAP: existing-repo pass 8 still rewrites the commit-gate config the skill now owns — left                                                                                                                                                                                                          |                     |
| 1    | U4 stackgen-skills | opus  | 1     | pass         | node edit; kinds.md retires repo-gate (eleven kinds), taxonomy, output-tree, pack-format, stack-menu, stack-template + materializer, stackgen-sync, stacks/readme, bundle prose; GAP: kinds.md change alters inventory.md kinds table — regenerate; GAP: dprint.json still on root allowlist's pack-may-land tier — left to match checker                                                                                                                                                                                                                                    |                     |
| 1    | R1                 | opus  | 1     | findings(7)  | rule-5 in nobody-owned files → U10 Owns widened (GAP): stackgen-skill-reviewer.md:70 repo-gate kind; repo-hygiene conventions.md:11; eslint/ruff/uv conventions + swiftpm SKILL.md:115 name moved repo-gate packs; loop-back: U12 pre-commit-config.yaml:104,275-277 pre-commit.d comments; U6 init SKILL.md:75 scope list/forge links; U3 uv pack.yaml:13 hook description dropped                                                                                                                                                                                          | —                   |
| 1    | U3 packs           | opus  | 2     | pass         | node edit; R1 fix: uv hook carries one-line description; stylesheet comments no longer name repo-gates                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                     |
| 1    | U6 init            | opus  | 2     | pass         | node edit; R1 fix: init SKILL.md scope list passes as scopes=, forge links the skill's                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                     |
| 1    | U12 this-repo      | opus  | 2     | pass         | node edit; R1 fix: pre-commit.d marker comments removed from this repo's config                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                     |
| 1    | R1                 | opus  | 2     | pass         | findings 7 → 0; contract and rulings clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —                   |
| 1    | gate               | opus  | 1     | pass         | wave gate 7/7 green (inventory regenerated per commit from the staged tree); commit order U12, U1, U5, U3, U4, U6, U7 — U5 before U3 since the old checker refuses U3's new tool-config verbs and U5's commit touches no plugins/ path                                                                                                                                                                                                                                                                                                                                       | —                   |
| 1    | U10 docs           | —     | —     | —            | GAP: Owns widened by R1 rule-5 findings in nobody-owned plugin files (skill-reviewer agent, repo-hygiene/eslint/ruff/uv conventions, swiftpm SKILL.md naming repo-gate packs)                                                                                                                                                                                                                                                                                                                                                                                                | —                   |
| 2    | U8 assets          | opus  | 1     | pass         | node edit; dprint base plugins/excludes, taplo/pre-commit/linter/gitleaks base sets in # >>> blocks, post-commit + graphify-refresh, pre-commit.d markers gone; setup/precommit uninstalls raw graphify hook; code/graph wording (widened Owns); GAP: .config/mise/locks kept in base (e1697f29); GAP: edit 7 moot (bundles/mise.md deleted by T1); GAP: graphify hook uninstall strips merge=graphify (T3); GAP: uv hook + exclude = two blocks in one file (to U2)                                                                                                         |                     |
| 2    | U12 this-repo      | opus  | 3     | pass         | node edit; re-copied code/graph from U8's reworded asset, cmp identical, 755                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                     |
| 2    | U8 assets          | opus  | 2     | pass         | node edit; after coordinating with U2: vscode.d/dprint-editor.jsonc formatter bindings trimmed to json/jsonc/markdown/yaml, no markers in JSON; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                        |                     |
| 2    | U2 skill           | opus  | 1     | pass         | node edit; SKILL.md: five tools, all add exclude [generated], scopes key, forge links from origin, list blocks, shared entries + lock shares:; references/{dprint,pre-commit,gitleaks,grype}.md written, raw-material dirs removed; mise.md: graph hook; DECIDED hook form pre-commit add hook <repo> <id> <stage> [key=value …] (closes gap 1), forge links from origin (closes gap 2); GAP: base editor fragment trimmed — adopted by U8                                                                                                                                   |                     |
| 2    | U8 assets          | opus  | 3     | pass         | node edit; pre-commit asset header reworded ("the hook runner") after U2's grep false positive; validate-config re-run                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                     |
| 2    | U2 skill           | opus  | 2     | pass         | node edit; blocks keyed per requester per position (uv: exclude + repos: blocks in one file), remove deletes all; pre-commit.md                                                                                                                                                                                                                                                                                                                                                                                                                                              | separators match U8 |
| 2    | R2                 | opus  | 1     | findings(5)  | U2: base block per position vs one block per file unstated (pre-commit.md:32, dprint.md:31, gitleaks.md:20); editor fragment // markers wording vs unmarked asset (dprint.md:33,185, pre-commit.md:35); graphify-refresh snippet ≠ asset (pre-commit.md:318); fold width SKILL.md:83,165, pre-commit.md:214. U8: git-conventional-commits.yaml:30,85, linter.yaml:13, dprint-editor.jsonc:18 say init / this pack fills                                                                                                                                                      | —                   |
| 2    | U8 assets          | opus  | 4     | pass         | node edit; R2 fix: git-conventional-commits scopes/forge-links comments name the skill; linter.yaml, both vscode.d fragments drop "this pack"                                                                                                                                                                                                                                                                                                                                                                                                                                |                     |
| 2    | U2 skill           | opus  | 3     | pass         | node edit; R2 fix: base follows per-position rule, blocks never nest; editor fragments unmarked asset, skill wraps // base block on landing (one place); graphify-refresh snippet copied from asset; refolds                                                                                                                                                                                                                                                                                                                                                                 |                     |
| 2    | R2                 | opus  | 2     | findings(2)  | cap reached, 5 → 2; contested: pre-commit.md:112 says marked positions sit inside the pre-commit block vs :44-45 no block (U2); assets linter.yaml:31 comment says defaults skip graphify-out vs base entry at :46 (U8)                                                                                                                                                                                                                                                                                                                                                      | —                   |
| 2    | gate               | opus  | 1     | pass         | wave gate 7/7 green; commits U8, U12 fix, U2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —                   |
| 2    | scratch gate       | opus  | 1     | pass         | orchestrator gate 6/6 pass (one exclude set, gitleaks subset, dprint base+typescript unmarked with lock keys, post-commit + graphify-refresh + uv blocks, validate-config, remove uv exact, hand line survives); defect → U2: order inside a block unstated, taplo reorder_arrays makes call-order entries fail dprint check; ambiguities: blank line between blocks (SKILL.md:169 vs examples), dir vs glob classification (SKILL.md:130), new dprint.json key position (dprint.md:188-193); GAP: T1 asset mise.toml:60 lockfile_platforms fails shipped dprint/taplo check | —                   |
| 2    | U8 assets          | opus  | 5     | pass         | node edit; scratch-gate fix, Owns widened (GAP) to assets/mise/.config/mise.toml: lockfile_platforms respaced by the shipped taplo, no value changed; every landed asset passes the shipped dprint check                                                                                                                                                                                                                                                                                                                                                                     | 79d673d7            |
| 2    | U2 skill           | opus  | 4     | pass         | node edit; scratch-gate fix: in-block order = shipped formatter's (taplo for TOML; dirs then globs alphabetical elsewhere), no blank line between blocks inside a list, *or ? = glob, add plugin URL before exec and config key alphabetical                                                                                                                                                                                                                                                                                                                                 | 8e901d4c            |
| 3    | U9 review          | opus  | 1     | pass         | node security; range d49127d6..52d019cf; engine: none high-confidence (8 candidates dropped); VERDICT approve, no findings                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —                   |
| 3    | U9 review          | opus  | 1     | findings(10) | node review; range d49127d6..52d019cf; changes-required; loop-back: U12 mise.lock lacks pipx:graphifyy (high); U5 gate-verb grammar ≠ skill (stage required, plugin names, grype add ignore); U8 code/graph no single-flight + first commit, setup/precommit comment placement, linter.yaml graphify-out comment; 3 findings on uncovered units dropped (U3 swiftui*.xcassets file-glob, U6 existing-repo:190 conflict row, U6 SKILL.md:317 three slugs) → gaps; 2 unmapped stale docs (pnpm conventions:63, eslint SKILL.md:93) → U10 Owns widened                          | —                   |
| 3    | U5 checker         | opus  | 2     | pass         | node edit; U9 fix: gate verbs follow the skill grammar (8 plugin names, exclude needs a path, hook needs repo/id/stage + known keys, grype add ignore); vitest 341/341                                                                                                                                                                                                                                                                                                                                                                                                       | 3f7b6f62            |
| 3    | U8 assets          | opus  | 6     | pass         | node edit; U9 fix: code/graph mkdir lock + pid staleness (kill -0), first commit builds; setup/precommit comment above its install; linter.yaml comment agrees with graphify-out entry                                                                                                                                                                                                                                                                                                                                                                                       | f125acc5            |
| 3    | U12 this-repo      | opus  | 4     | pass         | node edit; U9 fix, Owns widened (GAP) to .config/mise/mise.lock: graphifyy pin in { version } form + lock block (0.9.68), no other tool changed, locked dry-run passes; code/graph re-copied                                                                                                                                                                                                                                                                                                                                                                                 | 7afa4f42            |
| 3    | U9 review          | opus  | 2     | pass         | node security; range d49127d6..1e9db3e4; engine none high-confidence; approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                   |
| 3    | U9 review          | opus  | 2     | findings(5)  | node review; range d49127d6..1e9db3e4; covered 5 → 4 (converging); loop-back: U5 check.ts:712 hook pattern accepts local hook w/o name/entry/language or entry not mise x --, https w/o rev, rev on local; U5 check.ts:743 ' for <word>' guard refuses legal text; U8 code/graph:63 empty pid treated stale (race; trap deletes other run's lock) + U12 copy; U8 setup/precommit:116 raw hook kept when graphify not on PATH; 1 finding on uncovered U2 dropped → gap (no validate-config after a gate write)                                                                | —                   |
| 3    | U5 checker         | opus  | 3     | pass         | node edit; U9 r2 fix: hookFault (local needs name/entry mise x --/language=system, no rev; URL needs rev); for-suffix check per verb; vitest 343/343                                                                                                                                                                                                                                                                                                                                                                                                                         | 84383b7b            |
| 3    | U8 assets          | opus  | 7     | pass         | node edit; U9 r2 fix: empty pid = held unless lock >10 min old; trap removes only its own lock; raw graphify block stripped by awk when graphify not on PATH (post-commit + post-checkout); GAP: merge-driver config left (T3)                                                                                                                                                                                                                                                                                                                                               | 6829489a            |
| 3    | U12 this-repo      | opus  | 5     | pass         | node edit; U9 r2: code/graph re-copied, cmp identical                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 9881d4b6            |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-tool-config-gates

or let the queue pick it, by priority:

/vwf:execute next
