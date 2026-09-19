# U2 — Docs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `.claude/skills/vwf-plugin/references/skills-and-agents.md`,
  `site/src/content/docs/plugins/vwf.md`,
  `docs/memory/decisions/2026-09-19-backlog-trim-preserves-status.md` (new),
  `readme.md` (owned so docs-sync's findings have a home; the survey found
  nothing there)
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; the
  committed `plugins/vwf/skills/backlog/SKILL.md` and `references/github.md`
  (wave 1); the plan's Facts section (the passage list and what the API did on
  project #2); every `DOCS FALSIFIED:` line U1 returned;
  `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md` (the
  decision-doc shape, and the ruling this plan corrects);
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decision-doc rules).
- **Lazy-load:** `site/CLAUDE.md` (the link rule and the gate) before touching a
  heading or an anchor in `vwf.md`; `docs/memory/backlog/` (the dump's two file
  names, cited by the decision doc — read, never edited).

## Ruling

Decision 3, quoted:

> `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md` stays as
> written. A new
> `docs/memory/decisions/2026-09-19-backlog-trim-preserves-status.md` records
> the incident (the first run on project #2 cleared all 40 items; restored by
> body inference — `Evidence:` tail → `Done`, else `Backlog`; raw dump under
> `docs/memory/backlog/`), the corrected procedure, and that it corrects the
> earlier doc's ruling 2 and the "step 2 is what makes it safe" sentence.

Decisions 1 and 2 as the content the docs now describe (quoted in full in
`01-skill.md`; the docs restate what a user sees, never the procedure).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta (wave 1) and apply its
   findings, plus every `DOCS FALSIFIED:` line, plus the survey's list:
2. **`skills-and-agents.md:45`** — the backlog row's bootstrap clause adds that
   the trim snapshots every item's Status and restores it after the replace.
3. **`vwf.md` §`### /vwf:backlog`** (`:2472-2478`) — after the sentence on the
   `Ready`/`In review` stop, one sentence: the replace reissues every option's
   id, so the skill records each item's Status to a temp file first and writes
   it back afterwards, and stops naming the file if any write fails. The
   `### /vwf:backlog` heading and its anchor stay as they are.
4. **`docs/memory/decisions/2026-09-19-backlog-trim-preserves-status.md`** —
   new, in the shape of the 2026-09-19 vocabulary doc (its six headings): what
   prompted it (the first `list` on project #2, 40 items with no `status` key
   after the trim, the restore by body inference, the dump committed at
   `e4a1c2d4`), what changed, the rulings with what each rejected (decisions
   1–3), what it corrects (the earlier doc's ruling 2 and the reference's safety
   sentence), the consequences for a user (a trim prints a snapshot path and a
   restored count; a failed restore names both), what stays outside (the
   `Ready`/`In review` stop; a backup in the repo).

## Verification

- `grep -n 'step 2 is what makes it safe' -r readme.md .claude/skills/vwf-plugin site/src/content/docs`
  returns no hit.
- `grep -c 'snapshot\|restore' site/src/content/docs/plugins/vwf.md` ≥ 1 in the
  `/vwf:backlog` section.
- `mise run code:precommit` green (twice — these trees are dprint-formatted).
- `mise run p:site:check` green.

## Guardrails

- Do not touch `plugins/**` (U1), `CLAUDE.md`, either earlier decision doc,
  `docs/memory/backlog/`, or `docs/memory/handoff/`.
- Anchors in `vwf.md` per `site/CLAUDE.md`'s link rule.
- No table cell ending in a bare asterisk; no escaped backtick inside a code
  span.
- Delete nothing; `rm` nothing.

## Commit

`docs: backlog trim preserves Status — the manual, the skill table and the decision`
— written by the orchestrator after the wave gate. `docs` is in
`.config/git-conventional-commits.yaml`.
