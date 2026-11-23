# Plan — R5a: stackgen bundles over bootstrap tools (2026-11-15)

## Goal

After this plan lands, stackgen ships bundles that list bootstrap `tools` and
knowledge `packs`. The 18 former tool packs are tool-knowledge entries under
`plugins/stackgen/tools/`, keyed by bootstrap tool name. The design adapters
live in `plugins/stackgen/design-tools/` and install into `vwf-tools`; the LSP
entries come from `bootstrap lsp --json`. The checker and the inventory follow
the new tree. It is the first R5 plan of
`docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`, per its
amendment of 2026-11-15 (B1-B13); R5b changes vwf.

## Facts the survey established

- `plugins/stackgen/stacks/`: 73 packs in 14 kinds, 66 bundles. A bundle is
  YAML frontmatter (`name`, `axis`, `kind`, `components`, `default`,
  `platforms`, `artifact`) plus prose (`assets/pack-format.md` about lines
  244, 322).
- Tool packs: `language` (bash, kotlin, markdown, swift, typescript),
  `package-manager` (gradle, pnpm, pub, swiftpm, uv), `toolchain-gate`
  (analysis-options, detekt, eslint, ktlint, ruff, swift-format, swiftlint,
  tsconfig). They hold 18 `conventions.md`, 14 skills (`typescript` also
  `ux-gate`) and the `pnpm` hook `npm-normalize.sh`.
- Pack data bootstrap now owns: `lsp_servers` (5 packs), `languages[].facts`
  (`lsp`, `mise_tool`, `manifest`, `binaries`; 8 packs), `package_manager`
  (5), `lockfile` (2). `harness:` (72 packs) is excused in R4b (D32) until R5.
- Task files in packs: `test/e2e` (`framework/android`), `test/golden`
  (`app-framework/compose`, `app-framework/swiftui`) — bootstrap R2e takes
  them (D8); `p/_project/deploy` (3 deploy packs) and `p/_project/icons`
  (astro, html) stay.
- Design tools: `stacks/design-tool/{claude-code,lovable,stitch}`, each with
  `design-import-screens`, `design-import-design-system`,
  `design-import-conversations`; `claude-code` also `design-session` with
  `scripts/serve.mjs`. Addon: `stacks/addon/taste-skill` (a Claude plugin).
- stackgen skills: `stackgen-stack-menu` lists bundles; `stackgen-stack-template`
  materializes a pack by copy (`references/materializer.md`) or generates
  (`references/generator.md`); `stackgen-sync` diffs `lock.yaml` against pack
  versions; `vwf-tools` is written per `references/local-plugin.md`, its LSP
  today from the pack `lsp_servers`.
- A materialization lands in `.claude/` with `.claude/stackgen/lock.yaml`;
  `config/` files land at the repo root (`assets/output-tree.md`).
- bootstrap 4.0.0 (approved, not run): `catalog --json` lists every tool
  (`name`, `category`, `description`, `questions`, `defaults`), works outside
  a repo (R1b D14, D28); `lsp --json` gives `data.servers` in the Claude
  `lspServers` shape (R2b D4); test dispatchers run `NN-<name>` parts (R1c D2).
- Checker: `scripts/src/check.ts` rules 4 (:730), 8 (:1192), 9 (:1270), 11
  (:458), 13 (:932), 14 (:1351); `scripts/src/inventory.ts`, run by
  `node scripts/src/inventory.ts [--check]`.
- Gates: `code:format`, `code:lint`, `code:precommit`, `pnpm vitest run`,
  `p:plugins:check`, `p:plugins:inventory`, `p:plugins:marketplace`. Commit
  types: the ten of `.config/git-conventional-commits.yaml`, no scopes.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version
(U5 bumps the pack versions), never runs a generator (U1 and U5 run the
inventory, U2 the marketplace; D21, D33, D36), never edits a doc it does not
own, never adds a dependency the plan does not list, never commits. A unit
deletes and moves with plain `rm` and `mv`, never `git rm` or `git mv` —
it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file; a moved tree is one line)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the
block, with two to four options; a block with no question carries the one
line `QUESTION: none`. A question is a point the plan does not decide and the
unit cannot settle inside its scope; the unit never proceeds on an
assumption.

A unit completes every edit that does not depend on an answer, never builds on
a part an answer can change, then returns all its open questions in one block.
Its edits stay uncommitted in the worktree. The orchestrator asks the user,
records each answer in `decisions`, and resumes the unit with the question ids
and answers; the resumed unit applies them and returns the whole block again.

## Out of scope

- vwf: `stack-adapter.md`, `design-adapter.md`, the materialize pass, doctor,
  architecture, `ux-gate` and the `docs/blueprint/` references: R5b (D15).
- The three test task files as bootstrap parts: bootstrap R2e (D8).
- This repo's `.config/`: the snapshot task and its hook are a hand step
  (D13).
- A plugin version bump or a tag.

## Hand step before the run

- bootstrap 4.0.0 (with R1b `catalog` and R2b `lsp`) is installed on this
  machine, as R4b already needs.

## Hand step after the run

- Add `.config/mise/tasks/p/plugins/bootstrap-tools`, which runs
  `node scripts/src/bootstrap-tools.ts "$@"`, and a pre-commit hook that runs
  it with `--check` (D13).
- Point `.config/mise/tasks/p/plugins/npm-normalize-test` and the
  `npm-normalize` lines of `.config/pre-commit-config.yaml` and
  `.config/repo-sync/pre-commit.yaml` at
  `plugins/stackgen/tools/pnpm/hooks/`, and widen the inventory hook's file
  filter to `plugins/stackgen/tools/` and `plugins/stackgen/design-tools/`
  (D23). Until then `plugins.yml` fails its `npm-normalize-test` step.

## Parked

- R5b: vwf over bundles, tool knowledge and design tools; requires this plan.
- bootstrap R2e: the `test/e2e` and `test/golden` parts of the android,
  kotlin and swift tools; the amendment of bootstrap's copy of the split
  record.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-15-stack-bundles-tools
