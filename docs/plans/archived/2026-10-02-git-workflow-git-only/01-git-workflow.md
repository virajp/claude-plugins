# U1 — git-workflow drives worktrees through git alone

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/git-workflow/**` — `SKILL.md`,
  `references/worktree-setup.md`, `references/landing.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/execute/SKILL.md:486-491` (how execute
  names its branch) — only to word decision 4's caller example.

## Ruling

> D1 — The worktree tools only — `EnterWorktree`, `WorktreeCreate`, a
> `/worktree` command, a `--worktree` flag, `ExitWorktree`. `AskUserQuestion`
> stays for the Step 1 and Step 4 prompts; it is not git work.

> D2 — Removed. `git worktree add` is the only creation path, and the sub-steps
> renumber: 2b → 2a, 2c → 2b, 2d → 2c, every citation in `GW/` updated to match.

> D3 — A new Core Rule: never create, enter or leave a worktree with a Claude
> Code tool (`EnterWorktree`, `ExitWorktree`, an agent's worktree isolation) —
> it branches from origin's default branch rather than the current one, and its
> session refuses `git`.

> D4 — The caller's declared name when it declares one (`/vwf:execute` names it
> after the plan folder); otherwise a kebab-case slug of the task, shown to the
> user and confirmed before `git worktree add`.

> D5 — `git worktree remove <path>`, run from the main checkout — where landing
> already runs the outer merge.

> D6 — The frontmatter line gains `AskUserQuestion`, so it matches the body.

> D7 — The bootstrap step runs its tasks as `mise x -- mise run <task>`,
> matching the rest of the skill.

## Edits

1. **`references/worktree-setup.md`**
   - Delete Step 2a "Native Worktree Tools (preferred)" (`:10-17`) whole,
     including any sentence that prefers native tools over raw git (D2).
   - Renumber the remaining sub-steps: 2b → 2a (the `git worktree add` path), 2c
     → 2b (submodules), 2d → 2c (mise bootstrap). Update every "Step 2c" / "Step
     2d" reference in this file to the new label (`:13` goes with the deleted
     step; `:61` becomes "proceed to Step 2b").
   - Before the `git worktree add` block (`:50-56`), define `$BRANCH_NAME` per
     D4: the name the caller declared; otherwise a kebab-case slug derived from
     the task, shown to the user and confirmed before the worktree is cut. Add
     "branch name" to the list of preferences a caller may declare if this file
     lists them.
   - The bootstrap step (old 2d, `:92-128`): every `mise run <task>` becomes
     `mise x -- mise run <task>` (D7), including any `have_task` probe that
     shells out to `mise`.
   - Keep the `cd "$path"` and the permission-error fallback unchanged.
2. **`references/landing.md`** — cleanup step 4 (`:42-44`): drop the native-tool
   branch and the `ExitWorktree` example; the step is
   `git worktree remove <path>`, run from the main checkout (D5). Leave the
   stale-worktree sweep (`:46-49`) as it is.
3. **`SKILL.md`**
   - Frontmatter: the `allowed-tools` value gains `AskUserQuestion` after
     `Bash Read` (D6), keeping the frontmatter strict YAML.
   - Core Rules (`:15-47`): add the D3 rule as one bullet, naming
     `EnterWorktree`, `ExitWorktree` and an agent's worktree isolation, with
     both reasons. This is the only place the skill may name those tools.
   - Update "Step 2d" at `:27` and `:145` to "Step 2c" (D2).
   - Step 2's summary (`~:127-132`), if it lists 2a–2d, lists the three new
     sub-steps.
   - Declared preferences (`:48-57`): add the branch name as a declarable
     preference (D4).

## Verification

- `grep -rnE 'EnterWorktree|ExitWorktree|WorktreeCreate|--worktree' plugins/vwf/skills/git-workflow/`
  prints only the D3 Core Rule line(s) in `SKILL.md`.
- `grep -rnE 'Step 2d|Native Worktree|native tool' plugins/vwf/skills/git-workflow/`
  prints nothing.
- `grep -nE '^\s*mise run' plugins/vwf/skills/git-workflow/references/worktree-setup.md`
  prints nothing (every bootstrap call is `mise x -- mise run`).
- `mise run p:plugins:check` green (strict-YAML frontmatter).
- The full wave gate.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/git-workflow/`; a falsified passage
  elsewhere is a `DOCS FALSIFIED:` line.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  (80 columns) by hand.
- Keep every code span on one line; never end a table cell in a bare `*`.
- Do not change Step 1 or Step 4's numbering, the commit sequence, or the merge
  model — callers cite them.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`refactor: git-workflow drives worktrees through git alone`
