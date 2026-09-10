# U3 — git-workflow: `have_task` sees hidden tasks

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/git-workflow/references/worktree-setup.md`
- **Model:** opus
- **Read first:** the owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/git-workflow/SKILL.md:135-152` (step 3.1
  reuses the probe by name — confirm nothing there restates the command).

## Ruling

From index.md's assumed decisions, verbatim:

> **6.** `have_task` probes `mise tasks --hidden`. One token; the pack hides 20
> tasks including `setup:precommit` and `setup:mise`.

> **7.** **Dropped.** `worktree-setup.md` 2a/2b stay as they are — the fallback
> exists and every run finds it. The user: *"Why are we creating this docs? It's
> already covered in git-workflow"*.

## Edits

1. **`references/worktree-setup.md:99`** — the `have_task` definition:
   `mise tasks 2>/dev/null` → `mise tasks --hidden 2>/dev/null`. Nothing else on
   the line changes.
2. **Nothing else.** Sections 2a and 2b are untouched (decision 7).

## Verification

- `mise run plugins:check` green.
- `grep -n 'mise tasks --hidden' plugins/vwf/skills/git-workflow/references/worktree-setup.md`
  → exactly one hit.
- `grep -rn 'mise tasks 2>' plugins/vwf/skills/git-workflow/` → nothing.
- `mise tasks --hidden 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx setup:precommit`
  exits 0 in this repo (proves the flag lists a hidden task).

## Guardrails

- Do not touch `SKILL.md` or `references/landing.md`; do not touch 2a/2b's
  prose.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`fix: git-workflow's have_task probes hidden mise tasks` — written by the
orchestrator after the wave gate, not by the unit.
