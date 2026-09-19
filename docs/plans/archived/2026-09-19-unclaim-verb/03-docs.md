# U3 — Docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `.claude/skills/vwf-plugin/references/skills-and-agents.md`,
  `site/src/content/docs/plugins/vwf.md`,
  `docs/memory/decisions/2026-09-19-unclaim-verb.md` (new), `readme.md` and
  `CLAUDE.md` (owned so docs-sync's findings have a home; the survey found
  nothing in either)
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; the
  committed `plugins/vwf/skills/plan-management/SKILL.md` and
  `references/plan-index.md`, and `plugins/vwf/skills/execute/SKILL.md` and
  `references/blocking.md` (wave 1); the plan's Facts section (the passage
  list); every `DOCS FALSIFIED:` line U1 and U2 returned;
  `docs/memory/decisions/2026-09-18-plan-management.md` (the decision-doc shape,
  and the plan that deferred this verb);
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decision-doc rules).
- **Lazy-load:** `site/CLAUDE.md` (the link rule and the gate) before touching a
  heading or an anchor in `vwf.md`.

## Ruling

Decisions 1–5 as the content the docs now describe (quoted in full in
`01-plan-management.md` and `02-execute.md`; the docs restate what a user sees,
never the procedure). The Goal's framing, quoted:

> Not a reversal: "a `RUNNING` row is never stolen" stands; `unclaim` releases a
> claim on the user's consent after the proof, it never takes one.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta (wave 1) and apply its
   findings, plus every `DOCS FALSIFIED:` line, plus the survey's list:
2. **`skills-and-agents.md:39`** — the plan-management row: "Nine verbs" → "Ten
   verbs", `unclaim` added to the enumeration after `claim` with a clause (a
   stale `RUNNING` claim reset to `APPROVED`, refused while its worktree exists,
   on consent); the refuses column keeps "never takes a `RUNNING` row" and adds
   "never removes a worktree or deletes a branch".
3. **`vwf.md` §`### /vwf:plan-management`** (`:2260-2307`) — one row in the verb
   table (`:2274-2284`) after `claim`: `unclaim <folder>` — releases a stale
   claim: refuses while the worktree the folder names exists, asks once, resets
   the row and the folder to `APPROVED`, reports the commit and the stale
   branch. In the surrounding prose, where a hand edit is described as the
   release (if it is), replace it; add one sentence that `/vwf:execute`'s resume
   path offers the verb when it finds the worktree gone. The heading and its
   anchor stay as they are.
4. **`vwf.md` §`### /vwf:execute`** — only if the section states the hand reset;
   the survey found no such passage, so a `grep -n 'by hand'` over the section
   decides. Replace with the verb where found.
5. **`docs/memory/decisions/2026-09-19-unclaim-verb.md`** — new, in the shape of
   the 2026-09-18 plan-management doc (its headings): what prompted it (B12,
   deferred by that plan for want of a liveness rule), what changed (the tenth
   verb, execute's three passages), the rulings with what each rejected
   (decisions 1–5), that it is not a reversal, the consequences for a user (a
   dead session's row is released by asking; the worktree must be removed first;
   the branch is reported), what stays outside (heartbeat, locking, branch
   deletion), and the parked list carried forward.

## Verification

- `grep -n 'Nine verbs' .claude/skills/vwf-plugin/references/skills-and-agents.md`
  returns nothing; `grep -n 'unclaim'` on the same file ≥ 1.
- `grep -c 'unclaim' site/src/content/docs/plugins/vwf.md` ≥ 2.
- `grep -rn 'hand edit\|by hand' readme.md CLAUDE.md .claude/skills/vwf-plugin site/src/content/docs/plugins/vwf.md`
  returns no hit that describes releasing a `RUNNING` row.
- `mise run code:precommit` green (twice — these trees are dprint-formatted; run
  dprint directly on the untracked decision doc first, since `code:precommit`
  misses untracked files).
- `mise run p:site:check` green.

## Guardrails

- Do not touch `plugins/**` (U1, U2), the 2026-09-18 decision doc,
  `docs/memory/handoff/`, or `docs/plans/`.
- Anchors in `vwf.md` per `site/CLAUDE.md`'s link rule.
- No table cell ending in a bare asterisk; no escaped backtick inside a code
  span.
- Delete nothing; `rm` nothing.

## Commit

`docs: unclaim verb — the manual, the skill table and the decision` — written by
the orchestrator after the wave gate. `docs` is in
`.config/git-conventional-commits.yaml`.
