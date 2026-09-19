# U2 — Docs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `.claude/skills/vwf-plugin/references/skills-and-agents.md`,
  `site/src/content/docs/plugins/vwf.md`,
  `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md` (new),
  `readme.md` (owned so docs-sync's findings have a home; the survey found
  nothing there)
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; the
  committed `plugins/vwf/skills/backlog/SKILL.md` and `references/github.md`
  (wave 1); the plan's Facts section (the passage list); every `DOCS FALSIFIED:`
  line U1 returned;
  `docs/memory/decisions/2026-09-18-backlog-on-github-projects.md` (the
  decision-doc shape, and the ruling this plan corrects);
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decision-doc rules).
- **Lazy-load:** `site/CLAUDE.md` (the link rule and the gate) before touching a
  heading or an anchor in `vwf.md`.

## Ruling

Decision 5, quoted:

> `docs/memory/decisions/2026-09-18-backlog-on-github-projects.md` stays as
> written — a record of its day. A new
> `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md` records the
> correction: what the template really ships, the four-option vocabulary, the
> trim, and the next-id floor, citing the 2026-09-18 doc's ruling 5 as what it
> corrects.

Decisions 1–4 as the content the docs now describe (quoted in full in
`01-skill.md`; the docs restate what a user sees, never the procedure).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta (wave 1) and apply its
   findings, plus every `DOCS FALSIFIED:` line, plus the survey's list:
2. **`skills-and-agents.md:45`** — the backlog row's statuses read `Backlog` →
   `In progress` → `Done`, or `Closed`; add that the bootstrap trims the
   template's `Ready` and `In review` and that ids continue from the plan
   folders' `backlog:` lists.
3. **`vwf.md` §`### /vwf:backlog`** — `:2435` the sample comment ("the top
   Backlog item"); `:2467-2468` the Status sentence under the new vocabulary,
   with one sentence on the trim and the refusal while an item sits in a trimmed
   state; `:2489` `next` names the top `Backlog` item; wherever the section
   states the next-id rule, the two sources of decision 3.
4. **`docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md`** — new, in
   the shape of the 2026-09-18 doc: context (the first run against project #2),
   what the template really ships, the four rulings, what it corrects
   (2026-09-18 ruling 5, and the reference's `B01` rule), and the consequences
   for a user (an existing project is trimmed on the next verb; an item in
   `Ready`/`In review` must be moved first).

## Verification

- `grep -rn 'Todo\|In Progress' readme.md .claude/skills/vwf-plugin site/src/content/docs`
  returns no hit outside `docs/memory/**` and `docs/plans/**`.
- `mise run code:precommit` green (twice — these trees are dprint-formatted).
- `mise run p:site:check` green.

## Guardrails

- Do not touch `plugins/**` (U1), `CLAUDE.md` (names the backlog nowhere), the
  2026-09-18 decision doc, or `docs/memory/handoff/`.
- Anchors in `vwf.md` per `site/CLAUDE.md`'s link rule — the `### /vwf:backlog`
  heading and its anchor stay as they are.
- No table cell ending in a bare asterisk; no escaped backtick inside a code
  span.
- Delete nothing; `rm` nothing.

## Commit

`docs: backlog status vocabulary — the manual, the skill table and the decision`
— written by the orchestrator after the wave gate. `docs` is in
`.config/git-conventional-commits.yaml`.
