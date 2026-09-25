# U5 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/how-to/operate/ad-hoc-change.md`,
  `.claude/skills/vwf-plugin/references/skills-and-agents.md`,
  `.claude/skills/vwf-plugin/references/docs-tree.md`,
  `docs/memory/decisions/2026-09-25-partial-backlog-items.md` (new), `readme.md`
  and `CLAUDE.md` (owned so docs-sync's findings have a home; the survey found
  no passage in either that this change falsifies)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files (`plugins/vwf/skills/backlog/**`, `execute/SKILL.md`,
  `plan-management/**`, the planners, the template); the plan's Facts section
  (its docs bullet is the passage list); every `DOCS FALSIFIED:` line U1–U4
  returned; `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md` (the
  decision-doc shape); `plugins/vwf/assets/memory.md` (the decision-doc rules).
- **Lazy-load:** `site/CLAUDE.md` (the link rule and the gate) before touching a
  heading or an anchor in `vwf.md`.

## Ruling

Decisions 1–13 and 15, as the behaviour the docs now describe (quoted in full in
`01-backlog.md` to `04-planners.md`; the docs restate what a user sees, never
the procedure). The Goal, quoted:

> After this lands, a backlog item reaches `Done` only when the plan that
> finishes it lands. A plan that lands one piece of an item leaves the item open
> — Status `Partially done` — and records on it which piece landed, in which
> folder.

Not a reversal. The user's restatement at the interview, quoted for the decision
doc: *"The idea is always to fix the vwf skill and not add facade in the repos
using vwf skill"*.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta (wave 1) and apply its
   findings, plus every `DOCS FALSIFIED:` line, plus the survey's list:
2. **`vwf.md` `### /vwf:backlog` (:2910-3022)** — the Status flow gains
   `Partially done`; the verb list and examples gain `partial`; the closing
   lines describe the `Planned in:` list and the `Landed:` lines; `next` and
   `list` per decisions 6 and 7; the id rule per decision 15; the callers table
   names `partial` for `backlog_pieces:` ids. Any count of verbs is updated.
3. **`vwf.md` elsewhere** — :842 (command row, if it enumerates), the plan and
   change-plan sections (:2367-2382, :3104, :3123-3125: both lists, the
   finishes-or-piece question), execute's landing (:2672-2676: `done` and
   `partial`, the preflight refusal), the index Backlog column (:2424-2425: the
   `(piece)` suffix), plan-management's archive (:2756, :2771: the refusal and
   the force option), quick-start (:3462-3466) where it describes landing.
4. **`ad-hoc-change.md`** — :68-70, :155, :235, :281 per the same rules.
5. **`skills-and-agents.md`** — :45 (verbs and statuses: `partial`,
   `Partially done`), :35, :36, :39, :46 (the callers). **`docs-tree.md:56-61`**
   — both frontmatter lists, the `(piece)` column.
6. **`docs/memory/decisions/2026-09-25-partial-backlog-items.md`** — new, in the
   2026-09-19 doc's headings: what prompted it (B52; the B28 chain's
   hand-written warnings), what changed, the rulings with what each rejected
   (decisions 1–15), not a reversal (with the quote), the consequences for a
   user (the board's Status field gains a fifth option on the next verb; a
   folder listing an id on `backlog:` while parking pieces of it is refused;
   `archive --force` or its spelling), what stays outside (board automation,
   declined; a repo checker rule, declined).

## Verification

- `grep -n 'partial' .claude/skills/vwf-plugin/references/skills-and-agents.md`
  hits the backlog row.
- `grep -c 'Partially done' site/src/content/docs/plugins/vwf.md` ≥ 2.
- `grep -rn 'seven verbs\|Seven verbs' .claude/skills/vwf-plugin site/src/content/docs readme.md CLAUDE.md`
  returns nothing.
- `mise run code:precommit` green (twice — these trees are dprint-formatted;
  `git add -N` the new decision doc first, since `code:precommit` misses
  untracked files); `mise run p:site:check` green.

## Guardrails

- Do not touch `plugins/**` (wave 1's), older decision docs,
  `docs/memory/handoff/`, or `docs/plans/`.
- Anchors in `vwf.md` per `site/CLAUDE.md`'s link rule.
- No table cell ending in a bare asterisk; no escaped backtick inside a code
  span; keep every code span on one line.
- Delete nothing.

## Commit

`docs: partial backlog items — the manual, the skill tables and the decision` —
written by the orchestrator after the wave gate. `docs` is in
`.config/git-conventional-commits.yaml`.
