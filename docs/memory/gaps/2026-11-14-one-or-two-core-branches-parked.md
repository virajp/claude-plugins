GAP 2026-11-14 ★3 | skill:git-workflow, plan-management queue.mjs,
execute start.mjs | vwf runs in a repo with develop, main or both; no
hard-coded develop | parked: the DRAFT plan 2026-11-13-one-or-two-core-branches
was retired into phase R3 of the bootstrap/plugins split

**Source** The DRAFT plan `docs/plans/2026-11-13-one-or-two-core-branches/`
(never approved, never in the plan index). The user retired it on 2026-11-14,
at the P0 interview of
`docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`,
because P0 edits the same files and R3 replaces its mechanism.

What R3 takes from it, restated against the new design:

- The work branch is `develop` if it is present, else `main`. With both,
  work moves feature → `develop` → `main`. With one branch, each feature lands
  on that branch. In R3 the list comes from `repo.toml` `core_branches`, read
  through `bootstrap config`, not from git.
- A branch is present if it exists locally or on `origin`. If only `origin`
  has it, vwf creates the local branch that tracks it.
- The user ruled: "If there's a develop branch then make changes on develop
  branch only and keep remote in sync so that other contributors don't run
  the same plan on their machine. In case develop branch does not exist and
  main does then use main with same rules".
- `queue.mjs` replaces its `INTEGRATION = "develop"` constant with one
  exported function that resolves per repository directory; `start.mjs`
  imports it.
- `init` gets two CONTRIBUTING.md variants (two branches, one branch).
- When `/vwf:blueprint` seeds `conventions.md#pipeline`, it shows the branches
  each repo has with a preselected stage/prod pair, and the user confirms.
- Doctor: a repo with neither branch is drift; one branch is not drift. The
  forge default branch is drift only when it names a branch that is not a core
  branch or does not exist.
- The merge actions are bootstrap's `git:merge:<b>` tasks in the new design,
  not `code:merge <branch>`.

The draft folder itself is kept, outside the repo, in the session scratchpad
of 2026-11-14; this record is the durable copy of its rulings.
