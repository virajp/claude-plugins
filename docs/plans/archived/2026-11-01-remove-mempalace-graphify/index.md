# Plan — Remove mempalace and graphify from every plugin (2026-11-01)

## Goal

After this plan lands, neither vwf nor stackgen needs, ships or names
mempalace or graphify, except the cleanup code of D1. vwf's memory is the file
store under `docs/memory/`, and `/vwf:handoff` and `/vwf:recall` work from
files only.

**Reversals.** This undoes the 2026-08-08 ruling "mempalace absorbed into vwf"
(the plugin dropped, its skills vendored, its auto-save reimplemented in vwf),
and the graphify integration added after it. It also changes part of the
user's first ruling on shaped repos: stackgen tool-config gets no removal rows;
bootstrap owns that cleanup (D3).

## Facts the survey established

- **mempalace in vwf:**
  - `plugin.json:44-52` is the `mcpServers.mempalace` entry; `:12` the description.
  - `hooks/hooks.json` PreCompact `:7` and Stop `:18`.
  - `hooks/mempalace-checkpoint.sh` and `mempalace-precompact.sh` are tested by `installer/src/mempalace-checkpoint-script.test.ts`.
  - `vendor/mempalace/` (LICENSE, README), `skills/mempalace/`, `skills/mempalace-recall/`.
  - `assets/memory.md` (381 lines) defines the two stores, wing, room, `mempalace.yaml` and the recall and filing rules. It is cited by the five execute agents, assets `elicitation`, `execute-stages`, `graphify`, `membership`, `templates/plan-folder.md:694`, and the skills architecture, blueprint, change-plan, design-system, doctor, execute, feedback, handoff, mockups, plan, product, setup and verify.
  - Agents granting palace tools: execute-coder, execute-code-reviewer, execute-security-reviewer, execute-ux-reviewer, execute-acceptance-verifier (grant and use); execute-runner (grant only); blueprint-condenser (sends to rooms, no grant).
  - Filing or recall steps: architecture :93-97 :425-428; blueprint :248-252 :473, `references/density-pass.md:18-20`; `blueprint-authoring/references/density.md:59,84`; change-plan :86-88; design-system :80-84 :208; doctor :157-162 :279-282; execute SKILL.md :581-603 :684-715 :792 :961-971 :1075, `references/code-unit.md:25-28,42`, `review-unit.md:127,220,248`, `blocking.md:12`; feedback :82 :139-216; mockups :245-249 :362; plan :100-103 :311-315 :394-397; plan-management :499-501; product :65-69 :127-129; `screens/references/prompt-mode.md:64-66`, `import-mode.md:119`; setup :354-358, `references/onboard-pipeline.md:97`; verify :79-81 :123-158.
  - handoff writes a drawer :146-161 after resolving the wing :92-105, with a disk fallback :165-168; `docs/memory/handoff/next.md` already at :7-8 :43-44 :172-194. recall resolves the wing :47-57, reads drawers :65-75, falls back to disk :78-86; rooms read at :98 :113. `assets/templates/handoff.md:3,28`.
  - doctor: `SKILL.md:5-7,45,72,204-260`; `references/harness-and-memory.md` §7 :21-123 (per-tree `mempalace.yaml` :29-39, wing :59-65, seven rooms :67-84, mirror :88-90, server probe :97-113, `MEMPALACE_PALACE_PATH` :117-120).
  - setup: `SKILL.md:50,358`; `references/memory-tree.md` writes `mempalace.yaml` :19-77; `references/onboard-pipeline.md:34,41-45,204` asks `memory.wing`.
  - `config_format` is 23 (`assets/vwf-config.md:46,49`, `skills/setup/references/format-lineage.md:18`); `memory.wing` at `vwf-config.md:150-151`. Lineage rows to rework: `format-lineage.md:80,130,137-139`; migration in `migrate-pipeline.md:31`. `blueprint_format` stays 25.
  - Templates: `entity.md:123`, `flow.md:173`, `plan-folder.md:494,523`, `handoff.md:3,28`.
  - `vendor/andrej-karpathy-skills/README.md:8` and `NOTICE.md:46` compare karpathy's vendoring with mempalace's.
- **graphify:**
  - stackgen tool-config assets: `.graphifyignore`; `.config/mise/tasks/code/graph`; `.config/pre-commit-config.yaml` hook types :9-10, hook :111-120, exclude :35; `.config/mise/tasks/setup/precommit:23-84` strip code; `graphify-out/` excludes in `.gitignore:27-28`, `.config/dprint.json:18-19`, `.config/taplo.toml:24`, `.config/linter.yaml:20`, `.config/gitleaks.toml:31`, `.vscode/settings.json:72`.
  - tool-config templates: `conf.d/ai/mise.dev.toml` (`pipx:mempalace`, `pipx:graphifyy` :13, `MEMPALACE_*` env), `conf.d/_base/mise.dev.toml:21` comment, `tasks/setup/all:44-46`.
  - tool-config references: `references/graphify.md` (whole), `SKILL.md:4,50-51,268`, `pre-commit.md:23,50,71,195-211`, `mise.md:50,94-95,344,395-408,523-527`, `git.md:58`, `gitleaks.md:51`, `dprint.md:89`. The node script has no graphify reference.
  - stackgen elsewhere: `stackgen-stack-template/references/generator.md:42`, `assets/taxonomy.md:50-51`. No pack under `stacks/` names it.
  - vwf: `assets/graphify.md` cited by plan-surveyor :35-40,57, docs-sync-surveyor :34-38,51, execute-coder :75-81, execute-code-reviewer :88-95, execute-security-reviewer :67-73, execute-acceptance-verifier :46-47, and the skills plan :244-246, architecture :99-106, feedback :78-79, doctor :73-75, setup :316, `setup/references/onboard-pipeline.md:99-100,178`, `doctor/references/code-intelligence.md:7`. doctor `SKILL.md:7,41,182,201`, `references/code-intelligence.md` (CLI :13-19, graph :21-30, hook :35-42, staleness :43-45, ignore :46-51), `stack-checks.md:256,310`. setup `SKILL.md:308,316-327`, `onboard-pipeline.md:35-36,172-178`, `migrate-pipeline.md:25`, `memory-tree.md:11`. execute `SKILL.md:372-373,1166-1173`, `references/all.md:49`. init `references/tool-configs.md:20,60,69`, `new-repo.md:136,172`, `existing-repo.md:85,223`, `readme-and-license.md:7,178`, `SKILL.md:57`. `membership.md:196-199`, `topologies/multi-repo.md:146`, `templates/project-claude.md:68-69`. Passing mentions: `design-system/SKILL.md:32`, `setup/references/claude-md.md:20`, `blueprint-authoring/references/frontmatter-and-links.md:43`.
- **Checker and tests:** `scripts/src/check.ts:415-424` lists `.graphifyignore` in `TOOL_CONFIG_ROOT_FILES` (an allowlist: an extra entry is harmless); `:1958` and `:2230` are comments. `check.test.ts:395,421-425,653-660,786-797,1874`; `tool-config-render.test.ts:224-243`; `fixtures/tool-config/all-node.golden.json` carries the graphifyy pin and the setup:all text.
- **Bootstrap** (separate repo) already removed graphify and mempalace in its migration M24; its `remove tools` instruction exists. It is not edited by this plan.
- **Non-plugin docs that name either tool:** `readme.md`, `CLAUDE.md`, `installer/CLAUDE.md`, `.claude/docs/{ci-and-releases,repo-shape,plugins}.md`, `.claude/agents/target-verifier.md`, `.claude/skills/vwf-plugin/` (SKILL.md and references dependencies, assets, skills-and-agents, docs-tree), `.claude/skills/stackgen-plugin/SKILL.md`, `.claude/skills/plugin-authoring/references/checks.md:114`, the manual (`plugins/mempalace.md` a whole 389-line page, order 3; `vwf.md`, `stackgen.md`, `karpathy-guidelines.md`, `installer/{usage,targets,internals,index}.md`, `how-to/greenfield/{single-repo,multi-repo}.md`, `how-to/operate/sessions-and-handoff.md`, `how-to/brownfield/{onboard-existing-codebase,migrate-old-vwf-repo}.md`), and `site/src/pages/index.astro:57`.
- **The installer source** names neither tool; only its test and `installer/CLAUDE.md` do.
- **Gates:** `code:format`, `code:lint`, `code:precommit` (declares `--all`), `p:plugins:check`, `p:plugins:marketplace`, `p:site:check`; CI `plugins.yml` runs vitest and `tsc --noEmit -p installer` and `-p scripts`. The pre-commit hook "Marketplace manifest matches the plugin manifests" runs on each commit.
- **Commit convention:** types ops, docs, merge, feat, fix, refactor; no scopes.
- **The palace was blocked by managed policy** in the planning session; recall was skipped.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file — the file a package
manager or a toolchain manager writes to pin what it resolved — with Write,
Edit, `sed` or a script: a lock file changes only as the output of the CLI
that owns it, the command the stack's package-manager conventions name, and
the unit keeps what that CLI wrote. A unit whose manifest change moves a lock
file lists that lock file in its `owns` beside the manifest.

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

- This repo's own config: `.config/**`, `.graphifyignore`, `.gitattributes`,
  `.gitignore`. The user edits them by hand.
- The bootstrap repo. It already dropped both tools (M24).
- Palace data on disk (`~/.local/share/mempalace/`). Nothing deletes user data.
- This repo's own `mempalace.yaml`, `docs/memory/planning/` and
  `.vscode/settings.json` (its `.graphifyignore` nesting): the repo's own
  shape, cleared by the user, or by the config_format 24 migration when
  `/vwf:setup` next runs here.
- `docs/design/site/**`: the design export, committed byte-for-byte; its
  prerequisite text names graphify and stays as the record of the design.
- `.claude/settings.local.json`: the user's local settings, with a permission
  string that names mempalace. The user edits it.
- Making either tool optional, or keeping a hard-dependency-free integration:
  the user ruled "remove completely".

## Parked

- Bootstrap: per-tool uninstall steps that `repo-sync` runs when a tool leaves
  `bootstrap.yaml`, with graphify and mempalace as the first cases. A handoff
  prompt for the bootstrap agent, written in the planning session outside this
  plan. Also a stale `code:graph` line in bootstrap's `docs/design/mise.md:356`.
- The user's `~/.claude/CLAUDE.md` has a graphify section; it is the user's
  file, not a plugin's.
- This repo's own graphify and mempalace config (see Out of scope), to clear by
  hand after the plan lands.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-01-remove-mempalace-graphify

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
