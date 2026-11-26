# Plan — R5b: vwf over stackgen bundles, tool knowledge and design tools (2026-11-15)

## Goal

After this plan lands, vwf works over the stackgen of R5a: `/vwf:architecture`
picks or composes a bundle; `/vwf:setup` converts old lock rows, adds and
links the bundle's bootstrap tools, materializes the bundle, and declares the
addons in the `claude` tool's `plugins.project`; `/vwf:doctor` examines the
tool links, the LSP entries and the design tool in `vwf-tools`; the design
wrappers call `vwf-tools` with the project name. It is the second R5 plan of
`docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md` (Amendment
2026-11-15).

## Facts the survey established

- R5a (`docs/plans/2026-11-15-stack-bundles-tools`, approved, not run):
  bundles with `tools:` and `packs:`; tool knowledge in
  `plugins/stackgen/tools/<slug>/`; design tools in
  `plugins/stackgen/design-tools/`, installed into `vwf-tools` as
  `skills/<role>/references/<tool>.md` (D32), each role skill taking the
  project name (D27); `stackgen-stack-menu` lists bundles, repo bundles,
  design tools and `assets/addons.yaml`, and has a `compose` verb (D5);
  `stackgen-sync` converts old rows (D11); LSP from `bootstrap lsp --json`
  (D9); `ux-gate` stays in `tools/typescript/` (D15).
- R4b (`docs/plans/2026-11-15-config-format-28`): format 28; a project's
  languages are the bootstrap tools that link it; doctor's
  `unknown-language` rule is gone.
- `ux-gate` is found by its fixed name in the repo's `.claude/skills/`
  (`plugins/vwf/agents/execute-ux-reviewer.md` about line 51,
  `assets/stack-adapter.md` about lines 492-544).
- The design wrappers look for a repo skill at a fixed name and stop when it
  is absent: `skills/import-screens/references/delegate.md` about line 43,
  `skills/import-design-system/references/delegate.md` about line 30,
  `skills/import-conversations/references/delegate.md` about line 34; their
  callers are `screens/references/import-mode.md` about line 21,
  `design-system/references/import.md` about line 54 and
  `feedback/SKILL.md` about line 49. Each knows the registry project.
- Doctor's pack-data checks: `skills/doctor/scripts/lib/stack.mjs`
  (`factsOf` about line 143, binaries about 297-316, `materialized` about
  123-135) and `references/stack-checks.md` (LSP about 85-97, lockfile facts
  about 415-430, pack versions about 498, addons about 234-258).
- Setup's materialize pass: `skills/setup/references/materialize.md`
  (landing list about line 70, the stack-template call about 100-127, removal
  about 164-187); setup never calls `stackgen-sync`.
- Architecture: `skills/architecture/SKILL.md` (axis rounds about lines
  236-272) and `references/stack-menu.md` (axis table 17-27, tools round
  171-199).
- bootstrap has no `add plugin` verb. The `claude` tool declares plugins in
  `plugins.user` and `plugins.project` as
  `"<plugin>@<marketplace>" = "<owner/repo>"`; `mise run setup:ai` installs
  them, adds a missing marketplace, and uninstalls a project plugin that
  leaves the list (bootstrap `docs/plans/2026-11-14-plugins-setup-ai`, D2,
  D3).
- Gates: `code:format`, `code:lint`, `code:precommit`, `pnpm vitest run`,
  `p:plugins:check`. Commit types: the ten of
  `.config/git-conventional-commits.yaml`, no scopes.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version
(U6 bumps `tools/typescript`, D19), never runs a generator (U6 runs the
inventory, D21), never edits a doc it does not own, never adds a
dependency the plan does not list, never commits. A unit deletes with plain
`rm`, never `git rm` — it stages nothing.

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

- `ux-gate` stays in stackgen (D1); no vwf skill of that name.
- stackgen beyond `tools/typescript/` and `stacks/inventory.md` (U6) and
  `skills/` and `assets/` (U10) (D22).
- This repo's `.config/`.
- A plugin version bump or a tag.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-15-vwf-over-bundles
