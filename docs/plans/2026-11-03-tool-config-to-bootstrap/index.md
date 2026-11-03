# Plan — vwf callers move onto bootstrap; stackgen:tool-config is deleted (2026-11-03)

## Goal

After this plan lands, the vwf skills `init`, `setup`, `doctor` and
`git-workflow` use bootstrap for the repo shape, and
`plugins/stackgen/skills/tool-config/` does not exist. `init` runs bootstrap's
readme prompt. "Shaped" means `.config/bootstrap.toml`. Drift is
`mise run setup:configs --dry-run`. `git-workflow` reads `merge_model` from
`.config/bootstrap.toml`. The checker, its tests and its fixtures no longer
read the tool-config tree. This finishes backlog items B102 (phases 2 and 3)
and B103.

Phase 1 of B102 landed as `bc95a7af` (packs hand their toolchain to
bootstrap; decision record
`docs/memory/decisions/2026-10-24-packs-hand-off-to-bootstrap.md`). That
record names phase 2 (vwf `init`, `setup`, `doctor`, `git-workflow`) and
phase 3 (delete `stackgen:tool-config`, its tests, fixtures and checker
rules; miserc, `claude-status.json`, `code:count` and `code:check:all` are
lost, which the user accepted).

**Reversals**, confirmed by the user (D13): `2026-09-26-tool-config`,
`2026-09-26-tool-config-gates`, `2026-09-27-tool-config-hygiene`,
`2026-10-05-shaped-means-stackgen-yaml`, `2026-10-05-doctor-drift-by-preview`,
`2026-10-05-stackgen-yaml-replaces-vwf-answers`,
`2026-10-01-trust-is-the-users-setup-all-is-tool-configs`,
`2026-10-01-tool-config-renders-with-a-node-script`,
`2026-10-05-tool-config-templates`, checker rule 15, and the
`MERGE_MODEL_*` env reads of `git-workflow`.

This plan requires `2026-11-02-optional-tools-in-vwf-tools` (D12). That plan
edits `setup/**`, `doctor/**`, `vwf-config.md`, `check.ts`, `check.test.ts`
and the docs first. Each unit here reads its files as that plan left them.

## Facts the survey established

**bootstrap** (`~/Projects/github.com/virajp/bootstrap`, read in a fresh
clone at run time, never from a local checkout):

- The readme prompt, quoted in D4 and in U1, is in `README.md` under "Copy
  this prompt into an AI session in the consumer repository". It does the
  first adoption and also brings an adopted repository up to date.
- The values file of a repository is `.config/bootstrap.toml`
  (`docs/sync/index.md` step 3). A plugin never edits it.
- The merge model is `[branch.<branch>].merge_model`, `direct` (default) or
  `pr`, read by `code:merge:*` (`docs/sync/index.md` step 4 and its key
  table). `docs/sync/migrate.md` maps `MERGE_MODEL_DEVELOP`,
  `MERGE_MODEL_MAIN` and `MERGE_MODEL` to it.
- The done-check: `mise run setup:configs --dry-run` shows no change.
  `repo_sync --check` validates the values file only.
- `[claude.plugins.user]` and `[claude.plugins.project]` are read by
  bootstrap's `setup:ai`.

**Readers of `.config/stackgen.yaml`** after phase 1: only vwf `init`,
`setup`, `doctor` (and `recall`, through `doctor baseline`), plus the
`MERGE_MODEL_*` env that `git-workflow` reads. Nothing in `plugins/stackgen`
outside `skills/tool-config/` reads it. `stackgen-stack-template`'s
`references/bootstrap-handoff.md` and `stackgen-sync` already use
`.config/bootstrap.toml`.

**The `tool-config` hits, by owner** (line numbers from 2026-11-03, before
optional-tools ran; re-grep at run time):

- U1 — `plugins/vwf/skills/init/`: `SKILL.md` (frontmatter description,
  6, 35–63, 83, 93–100, 116, 225–250, 376–412, 487, 570–574, 609–665),
  `references/new-repo.md` (§2 the `all` call 83–135, 145, 196, 227–255,
  312, 450–566 incl. §9 trust and `mise run init`, §11(a) 623–650, 742,
  890–891), `references/existing-repo.md` (30 hits; passes 1, 6, 7, 8, 10,
  apply order 864–915, report 1006–1126), `references/readme-and-license.md`
  (8, 26, 32, 37–38, 169–171), `references/tool-configs.md` (whole file),
  `assets/hygiene/CONTRIBUTING.md` (21, 35, 38–42, 57, 72–80).
- U2 — `plugins/vwf/skills/setup/`: `SKILL.md` (64, 111–140 Step 0, 181,
  207–221 materialize, 236), `references/materialize.md` (38–52, 120–147,
  176–300), `references/onboard-pipeline.md` (43, 51–53, 191),
  `references/migrate-pipeline.md` (25–30, 37–44),
  `references/format-lineage.md` (127–128, historical rows),
  `references/memory-tree.md` (13). `plugins/vwf/assets/`:
  `stack-adapter.md` (291, 375–419), `vwf-config.md` (33–39, 124–126, 233,
  602–603, 704–716), `memory.md` (75–76, 117), `stack-vocabulary.md` (56).
- U3 — `plugins/vwf/skills/doctor/`: `SKILL.md` (48–55 baseline, 168,
  228–240 drift list), `references/stack-checks.md` (297–323, 417–419,
  453–512, 531–534, 559, 581–595, 606–659, 701–703),
  `references/harness-and-memory.md` (25).
- U4 — `plugins/vwf/skills/git-workflow/SKILL.md` (34–42, 51, 200–216),
  `references/landing.md` (18–22, 35–39, 51, 65–71),
  `references/worktree-setup.md` (37); `handoff/SKILL.md` (146);
  `mockups/SKILL.md` (171); `blueprint/references/screen-review.md` (28).
- U5 — `plugins/stackgen/skills/tool-config/` (SKILL.md, `assets/` 37
  files, `references/` 6, `scripts/` 10, `templates/` 20);
  `scripts/src/check.ts` (56 hits: import at 41, `SUBTASK_DIRS` 340,
  `TOOL_CONFIG_ASSETS` 323, `TOOL_CONFIG_TEMPLATES` 325, `TOOL_CONFIG_SKILL`
  344, `TOOL_CONFIG_ROOT_FILES` 409, `TOOL_CONFIG_ROOT_DIRS` 425,
  `TOOL_CONFIG_LANDED_SKILLS` 435, `checkPackConfigTier` 550–618,
  `packFactFaults` doc 711, retired-key entry 796, `templateNameFaults`
  826–852, `toolConfigTrees` 871, `frontmatteredDocs` 959, `isLandedPath`
  1193–1196, landed walk 1225, `landingRootOf` 1306–1311, `EXCLUSION_LISTS`
  1660–1710, `checkExclusionSets` 1949–1962); `scripts/src/check.test.ts`
  (27 hits: 400–401, 556–569, 634–657, 691, 723, 769–843, 850, the
  "exclusion sets" describe 1508–1679); `tool-config-render.test.ts`,
  `tool-config-template.test.ts`, `tool-config-values.test.ts`,
  `fixtures/tool-config/**` (harness, golden JSON, pack fixtures).
- U7 — `CLAUDE.md` (179, 181, 209, 216, 241, 246, 265, 283, 315),
  `readme.md` (129, 316–323), `.claude/docs/repo-shape.md` (11 hits),
  `.claude/docs/ci-and-releases.md` (6, 21, 34, 62, 70),
  `.claude/docs/plugins.md` (13), `.claude/skills/plugin-authoring/SKILL.md`
  (13 hits; 144 names a `tool-config-pack.test.ts` that does not exist),
  `.claude/skills/plugin-authoring/references/checks.md` (15 hits, rules 11,
  15, 16), `.claude/skills/stackgen-plugin/SKILL.md` (15 hits),
  `.claude/skills/vwf-plugin/SKILL.md` (126, 127, 143, 152, 261),
  `.claude/skills/vwf-plugin/references/dependencies.md` (33, 49, 58–59),
  `references/skills-and-agents.md` (28, 29, 41), `references/assets.md`
  (24), `site/src/content/docs/plugins/stackgen.md` (27 hits; the
  `/stackgen:tool-config` section at 919 and its synopsis 980–985, the
  conf.d table 1081–1082, the skill-table row 1422),
  `site/src/content/docs/plugins/vwf.md` (25 hits),
  `how-to/brownfield/onboard-existing-codebase.md` (81, 99, 108–109, 127),
  `how-to/greenfield/single-repo.md` (72, 103),
  `how-to/greenfield/multi-repo.md` (339),
  `plugins/stackgen/stacks/readme.md` (9, 53).

**Not owned, by ruling:** `dprint.jsonc` (17–21), `.config/pre-commit-config.yaml`
(26), `.config/linter.yaml` (33–36) are bootstrap-managed (D10);
`plugins/vwf/hooks/monitor/plan.test.ts` (25–26) holds a folder-name string
used as test data; `.config/mise/tasks/_scripts/repo-sync:1297` is mise's own
`tool_config`, a false positive; `docs/memory/` records keep their text, and
U7 only adds superseded markers.

**Gates and CI.** No mise task and no workflow names tool-config. CI
(`plugins.yml`) runs `p:plugins:check` (which runs `scripts/src/check.ts`),
`pnpm vitest run` (`vitest.config.mts` includes `scripts/src/**/*.test.ts`)
and `tsc --noEmit -p scripts`. The pre-commit hooks run the marketplace,
inventory and check tasks. `code:precommit` is a hidden task (it shows in
`mise tasks ls --hidden`, not in `mise tasks`), synced from bootstrap, and
runs `pre-commit run --all-files`. The commit
convention is `.config/git-conventional-commits.yaml`: types `feat`, `fix`,
`perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`, `wip`; no
scopes.

**Commit order inside wave 1.** U5 deletes the tree and removes the
`check.ts` import in one commit, so the checker always loads. U1 to U4 do
not touch what the checker reads, so their commits pass the pre-commit hook
in any order.

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

- Edits in the bootstrap repository. The plan uses its `readme.md` prompt and
  `docs/sync/` as they are.
- The three excludes that still name the deleted tree: root `dprint.jsonc`,
  `.config/pre-commit-config.yaml` and `.config/linter.yaml`. bootstrap
  manages them (D10); a stale exclude of a deleted path matches nothing.
- The text of old records in `docs/memory/decisions/` and
  `docs/memory/handoff/`. U7 adds superseded markers only.
- The folder-name string in `plugins/vwf/hooks/monitor/plan.test.ts`.
- The open gaps of `2026-11-01-remove-mempalace-graphify` (handoff, recall,
  doctor memory checks). They are not B102 work.
- This repo's own `.config/` files, which the user edits by hand.

## Parked

none

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-03-tool-config-to-bootstrap

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
