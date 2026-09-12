# U6 — git-workflow: the PR landing path

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/git-workflow/SKILL.md`,
  `plugins/vwf/skills/git-workflow/references/landing.md`,
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md`. Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom. Step 4 is `SKILL.md:191-193`
  region; the "use merge, not PRs" rule is `:30`; landing.md's sequences are
  `:21-48`.
- **Lazy-load:** none.

## Ruling

Quoted from index.md:

> **9. git-workflow under `pr`.** Step 4 reads `MERGE_MODEL` with
> `mise env -s bash | grep MERGE_MODEL` (or `mise env --json`) before offering
> the three options; under `pr` the two merge options read "Push & open PR (&
> clean up / & keep worktree)" and landing.md gains the PR path: the merge task
> does the push and the PR; teardown is unchanged. The skill still names no
> forge — the task does.

> **6. `MERGE_MODEL`.** … `pr` runs the same predicates, pushes the branch …
> opens a pull request … and stops — nothing merges locally.

## Edits

1. **`SKILL.md`**
   - Core rules `:30-32`: "Use `merge` (not PRs) to land changes" becomes: the
     repo's `MERGE_MODEL` decides — `direct` lands with the merge tasks as
     before; `pr` pushes and opens a pull request through the same tasks. The
     two task names are unchanged in both modes.
   - Step 4: before the `AskUserQuestion`, read the mode:
     `MERGE_MODEL=$(mise env -s bash 2>/dev/null | sed -n 's/^export MERGE_MODEL=//p' | tr -d '"')`
     defaulting to `direct` when empty. Under `direct` the three options are as
     today. Under `pr` the second and third read **Push & open PR & clean up**
     and **Push & open PR & keep worktree**, and the text after the question
     says the task pushes, opens the PR and stops, so "clean up" removes the
     worktree while the PR is open and "keep" leaves it for review fixes. The
     merge-conflict paragraph applies only under `direct`; say so.
   - The safety rules and the commit workflow are untouched.
2. **`references/landing.md`** — add a short section **"Under `pr`"** before or
   after the two sequences: submodule members land with their own `code:merge:*`
   under their own `MERGE_MODEL` (each member is its own repo with its own
   config); the outer repo's `code:merge:develop <branch>` pushes and opens the
   PR; there is no pointer-commit-then-merge in the base under `pr` until the PR
   merges, so step 2's pointer commit still happens on the branch before the
   push; teardown per the chosen option. Do not name `gh`, `glab`, GitHub or
   GitLab.
3. **`references/worktree-setup.md`** — read; edit only if it states the
   merge-only model. Otherwise untouched.

## Verification

- `grep -n 'MERGE_MODEL' plugins/vwf/skills/git-workflow/SKILL.md plugins/vwf/skills/git-workflow/references/landing.md`
  hits both.
- `grep -niE '\bgh\b|\bglab\b|github|gitlab' plugins/vwf/skills/git-workflow`
  adds no new hit beyond what exists today (the `gh` CLI mention in the harness
  prompt is not this skill's).
- `grep -n 'not PRs' plugins/vwf/skills/git-workflow/SKILL.md` is empty.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `init` (U5) or any other skill.
- Strict-YAML frontmatter: leave the block as is.
- The skill names no tool beyond `git` and `mise`; the forge CLI lives in the
  task.
- Delete with `rm`, never `git rm` (nothing to delete).
- Match fold width by hand.

## Commit

`feat: git-workflow lands through MERGE_MODEL, with a pull-request path` —
written by the orchestrator after the wave gate. Type `feat`; no scope.
