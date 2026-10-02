# U2 — Docs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`
  (standalone mode); `site/src/content/docs/plugins/vwf.md:3350-3358`.

## Ruling

> D3 — A new Core Rule: never create, enter or leave a worktree with a Claude
> Code tool (`EnterWorktree`, `ExitWorktree`, an agent's worktree isolation) —
> it branches from origin's default branch rather than the current one, and its
> session refuses `git`.

> D4 — The caller's declared name when it declares one (`/vwf:execute` names it
> after the plan folder); otherwise a kebab-case slug of the task, shown to the
> user and confirmed before `git worktree add`.

## Edits

1. Run `vwf:docs-sync` over the branch delta since the branch base (exclude
   `docs/plans/`) and apply its findings, plus every `DOCS FALSIFIED:` line U1
   returned (the orchestrator appends them to this prompt).
2. `site/src/content/docs/plugins/vwf.md`'s `/vwf:git-workflow` section
   (`:3350-3358`): where it describes how a worktree is cut, it says the skill
   uses `git worktree add` from the current branch and never a Claude Code
   worktree tool (D3). Add nothing if the passage stays true without it — do not
   restate the skill.
3. No other passage is expected to change; if docs-sync finds none, report
   `CHANGED: none`.

## Verification

- `grep -rn 'EnterWorktree' readme.md CLAUDE.md .claude site/src/content/docs`
  prints at most the passage this unit wrote under D3.
- `mise run p:site:check` green.
- `mise run code:precommit` green (dprint re-pads tables).
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/` or `docs/plans/`; a falsified passage there is
  a `GAP:` line.
- Never end a table cell in a bare `*`; keep code spans on one line.
- Delete with `rm`, never `git rm`.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: the manual matches git-only worktrees`
