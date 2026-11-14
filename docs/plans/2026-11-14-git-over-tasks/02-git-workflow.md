# U2 — git-workflow reads the landing key and calls the git:* tasks

- **Read first:** the three owned files whole, and
  `plugins/vwf/assets/bootstrap-contract.md` (R3a).
- **Lazy-load:** `docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`;
  the R2a plan `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/2026-11-14-git-tasks/`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D4:** the landing model of a destination `<b>` is
  `bootstrap config get repo.branches.<b>.landing --json`: `pr`,
  `direct-merge` or `direct-commit`. `read_merge_model` and every
  `merge_model` or `[branch.*]` name go. The `git:merge:<b>` task applies the
  model itself; git-workflow reads it only to tell the user what a landing will
  do, and to refuse a direct commit where the value is not `direct-commit`.
- **D1:** a landing runs `mise x -- mise run git:merge:<b> -- <branch>`; a
  member repo's landing runs it there:
  `mise x --cd <member> -- mise run git:merge:<b> -- <branch>`. A worktree is
  made with `git:worktree:create`, set up with
  `git:worktree:setup`, and removed with `git:worktree:delete`. The main
  checkout's uncommitted changes stay uncommitted and are never part of the
  merge; a landing stops only when git refuses the checkout or the merge
  (D23). D27: if `git:worktree:delete` exits 1 and
  `gh pr view <branch> --json state` gives `MERGED`, run the `git branch -D`
  command that the task printed; otherwise report the failure and stop.
- **D3:** the integration branch is `develop` when `develop` is in
  `repo.core_branches` (`bootstrap config get repo.core_branches --json`), else
  `main`. With both, work moves feature → `develop` → `main`; with one, each
  feature lands on that branch. A core branch that exists only on `origin` gets
  a local branch that tracks `origin/<branch>`. The user's words: "If there's a
  develop branch then make changes on develop branch only and keep remote in
  sync so that other contributors don't run the same plan on their machine. In
  case develop branch does not exist and main does then use main with same
  rules".

## Edits

1. **`SKILL.md`**: about lines 36-43 and 210-231 (the merge model and
   `read_merge_model`): D4; the step that names the integration branch: D3;
   each `code:merge` name: D1.
2. **`references/landing.md`**: about lines 18-71: D1 and D4, for the base and
   for a member. The "else merge it" fallback when no merge task exists (about
   lines 36 and 52) goes: a missing task stops the landing with the contract
   asset's hint (D34).
3. **`references/worktree-setup.md`**: about lines 100-120: D1
   (`git:worktree:setup` in place of `setup:worktree`; the `have_task` probe
   names the new task).
4. **`references/protected-branch.md`** (about lines 3, 14-21, 44-63),
   **`plugins/vwf/skills/execute/references/claim.md`** (about lines 69, 77),
   **`plugins/vwf/skills/plan-management/SKILL.md`** (about line 111): the
   stash, `merge --no-ff`, the PR fallback and "develop and main" become D1, D3
   and D9 (D12): `land.mjs` calls `git:merge:<b>`, reads the result from git,
   and a dirty branch worktree gives `failed` (D23).
5. **`plugins/vwf/skills/plan-management/references/plan-index.md`** (about
   lines 302, 315, 329-330): the same, with D15 to D19 (D20).
- Each task call in prose has the `--` separator (D19).

## Verification

- `mise x -- mise run code:format` passes.
- `grep -nF 'code:merge' plugins/vwf/skills/git-workflow/SKILL.md plugins/vwf/skills/git-workflow/references/*.md`
  finds nothing.

## Guardrails

- Touch nothing outside the seven owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: git-workflow lands through bootstrap's git tasks and core branches`
