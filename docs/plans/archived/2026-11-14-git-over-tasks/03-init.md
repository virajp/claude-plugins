# U3 — init and readme: the landing key, git:* names, two CONTRIBUTING variants

- **Read first:** each owned file's passages named below.
- **Lazy-load:** `docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`. The plan was amended on 2026-11-18
(D36 to D42).

- **D4, D42:** every `merge_model`, `[branch.*]` or `[tools.git.branch.*]`
  name becomes the landing key `repo.branches.<b>.landing` (`pr`,
  `direct-merge`, the default, or `direct-commit`; the old value `direct` is
  gone), read and written through `bootstrap config`; a read takes the
  `data.value` of the `--json` envelope. "A pull request on whichever has
  `merge_model = "pr"`" becomes "on each core branch whose landing is `pr`".
- **D1:** `code:merge:develop` and `code:merge:main` become
  `git:merge:develop` and `git:merge:main`; `setup:worktree` becomes
  `git:worktree:setup`.
- **D3:** init's hygiene `CONTRIBUTING.md` has two variants: one for a repo
  with two core branches (`develop` and `main`) and one for a repo with one.
  init picks the variant from `repo.core_branches`. The forge pass protects
  each core branch and sets the default branch to the integration branch.

## Edits

1. **`init/SKILL.md`**: about lines 100 and 439: D4; the forge pass: D3.
2. **`init/references/new-repo.md`**: about lines 255, 375, 384-385 and 480:
   D4 and D3.
3. **`init/references/readme-and-license.md`**: about line 39: D1.
4. **`init/assets/hygiene/CONTRIBUTING.md`**: the two-branch variant (lines
   about 34-56: D1, D4). The gates-all plan may land first and change its
   daily-checks block; keep that block as it then reads. Add the one-branch
   variant beside it as `init/assets/hygiene/CONTRIBUTING-one-branch.md`, with
   the same sections and one move (`git:merge:<branch>`). Name both files in
   SKILL.md's hygiene step: init copies the chosen variant to the target repo
   as `CONTRIBUTING.md` (D47).
5. **`readme/references/steps.md`**: about lines 13 and 70: D1.
6. **`scripts/src/check.ts`** (`INIT_ROOT_ALLOWLIST`, about lines 322-326) and
   **`scripts/src/check.test.ts`**: add `CONTRIBUTING-one-branch.md` to the
   list and its doc comment, with a test that the checker accepts it (D49).
7. **`init/references/existing-repo.md`** (about lines 74-77 and 195-197) and
   **`init/references/readme-and-license.md`** (about line 5): init copies
   the chosen CONTRIBUTING variant as `CONTRIBUTING.md`, and a repo with
   `CONTRIBUTING.md` has the asset; `CONTRIBUTING-one-branch.md` never lands
   under its own name (D50).

## Verification

- `mise x -- mise run code:format --all` passes.
- K1 of `gates.keeps` finds no hit in the owned files.
- `mise x -- pnpm vitest run scripts/src/check.test.ts` passes, and
  `mise x -- mise run p:plugins:check` passes with the new file (D49).

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init names the landing key, the git tasks and one or two core branches`
