# U1 — retire: delete the two repo skills, repoint the two skill docs

- **Wave:** 1
- **Depends on:** —
- **Owns:** delete `.claude/skills/create-plan/**` and
  `.claude/skills/execute-plan/**`; edit `.claude/skills/release/SKILL.md`
  (`:50`) and `.claude/skills/vwf-plugin/SKILL.md` (`:197`)
- **Model:** opus
- **Read first:** `.claude/skills/release/SKILL.md:40-60`,
  `.claude/skills/vwf-plugin/SKILL.md:190-200`, before editing.
- **Lazy-load:** `plugins/vwf/skills/change-execute/SKILL.md` (only to quote the
  after-landing `run` / `ask` words exactly as the shipped skill spells them).

## Ruling

The user, on the scope: *"Two chained plans now"* — plan 2 retires the repo
copies.

From index.md's Goal:

> this repo plans and runs its own changes with the vwf pair —
> `/vwf:change-plan` and `/vwf:change-execute` […] and no longer carries its own
> `.claude/skills/create-plan/`, `.claude/skills/execute-plan/` or the
> `docs-reconciler` agent they used.

From index.md's assumed decisions, verbatim:

> **1.** Deleted. `vwf:docs-sync` and its surveyor take over the docs unit; the
> surface-ownership knowledge it carried is already `CLAUDE.md`'s "Docs ship
> with the change" rule.

> **2.** The **docs unit**, after the orchestrator has dispatched the agent for
> this run's findings — so this run still gets its reconciliation and the file
> is gone in the same commit as the docs that stop naming it.

## Edits

1. **Delete** `.claude/skills/create-plan/` and `.claude/skills/execute-plan/` —
   the whole directories (`git rm -r` inside the worktree is fine; it stages
   nothing outside your Owns). Do **not** delete
   `.claude/agents/docs-reconciler.md` — that is U2's, per decision 2.
2. **`.claude/skills/release/SKILL.md:50`.** The sentence saying `/execute-plan`
   runs `plugins:local` unprompted at the end of a green run →
   `/vwf:change-execute` runs it as the plan's after-landing `run` step. Keep
   the rest of the sentence (publishes nothing, cuts no tag, restarted session)
   as it is.
3. **`.claude/skills/vwf-plugin/SKILL.md:197`.** "Delegate the sweep to the
   `docs-reconciler` agent rather than reading those files inline" → delegate
   the sweep to `vwf:docs-sync` (its surveyor agent reads the docs) rather than
   reading those files inline. Keep the sentence after it about the file's size.
   Nothing else in the file — the pair's mention in the ordering line was plan
   1's docs unit's and is already there.

## Verification

- `command ls .claude/skills/` → no `create-plan`, no `execute-plan`.
- `grep -n 'execute-plan\|create-plan' .claude/skills/release/SKILL.md` →
  nothing; `grep -c 'vwf:change-execute' .claude/skills/release/SKILL.md` → `1`.
- `grep -n 'docs-reconciler' .claude/skills/vwf-plugin/SKILL.md` → nothing;
  `grep -c 'docs-sync' .claude/skills/vwf-plugin/SKILL.md` ≥ 1.
- `pnpm exec dprint check .claude/skills/release/SKILL.md .claude/skills/vwf-plugin/SKILL.md`
  green (both are dprint's).
- `mise run plugins:check` still green (nothing under `plugins/` touched).

## Guardrails

- Touch nothing under `plugins/`, `docs/`, `site/`, `scripts/`, `installer/`;
  not `CLAUDE.md`, not `.claude/docs/**`, not `.claude/agents/**`.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Write with Write/Edit, never `cat` heredocs.

## Commit

`chore: retire the repo-level create-plan and execute-plan skills` — written by
the orchestrator after the wave gate, not by the unit.
