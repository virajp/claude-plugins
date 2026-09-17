# U5 — Site docs: the vwf manual and the how-tos

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/how-to/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`;
  `site/CLAUDE.md` (the link rule, the gate); the cited lines of `vwf.md`:
  :152-154, :160, :167-176, :194-197, :204-205, :264, :811, :859, :1989-1999,
  :2001-2004, :2031-2039, :2048-2058, :2111, :2468-2476, :2816-2817; of the
  how-tos: `greenfield/single-repo.md:289`, `:441`;
  `greenfield/cli-product.md:158`, `:167`;
  `greenfield/api-only-service.md:154-155`. Then the wave-1 result: execute's
  `SKILL.md` headings, `references/review-unit.md`, the template's Kind
  paragraph and After landing block, the interview's new item.
- **Lazy-load:** `site/src/content/docs/how-to/operate/ad-hoc-change.md` (may
  describe the after-landing `ask` — check, edit only if falsified).

## Ruling

1 — "A review is a **`Kind: review` row** in the Units table: Owns `—`, Depends
on names the units it covers, Model `opus`, and a `NN-review.md` unit file
carrying only the header lines and a Scope section naming what it reviews. When
execute reaches it in wave order it runs `/code-review` and `/security-review`,
waits, then dispatches `execute-code-reviewer` and `execute-security-reviewer`
in one message with the Engine section — step 3 of today's code-unit, once, over
the row's scope."

2 — "Both planners write **one** review row, after the last code unit and before
the docs unit. An earlier row is a planner decision with its reason in the
plan's assumed-decisions table — e.g. a boundary later units build on. No code
unit triggers a review by itself."

6 — "A change plan gets **no review row by default** — the wave review stays its
only check. `/vwf:change-plan` writes one only when the change lands runnable
code (shipped shell or hook scripts, `scripts/`, `installer/`), and says why in
the decisions table."

8 — "**Reversal.** Each after-landing step carries `run` or `ask`, decided at
interview item 17 and written to the After landing table. On a green landing
execute runs every `run` step in order without a prompt and stops once before
each `ask` step. A `run` in a folder is authorisation; the 'read as `ask`'
clause goes."

## Edits

1. Run `/vwf:docs-sync` scoped to `site/src/content/docs/**` over the run's
   branch delta and apply its findings, plus every `DOCS FALSIFIED:` line the
   wave-1 units returned naming a site file, plus the cited list. Edit only what
   the change falsified.
2. **`vwf.md`, the execute section** — :152-154 and :859 reviewer models (still
   opus; say they run at review rows); :160 "every review stage still runs"
   becomes "the review runs at the plan's review rows"; :167-176 the cost
   paragraph: coder per step, review ‖ security per review row; :194-197 the
   engines run at a review row over the delta since the last one; :204-205;
   :264; :811 the execute row; :1989-1999 the stage table gains the `review`
   kind and re-scopes the two reviewer rows; :2001-2004 the wave review never
   re-raises what the review row checks; :2031-2039 "Full pipeline each code
   unit" becomes the review-row paragraph — the round cap and engines-first
   re-run now per row; :2048-2058 convergence guard re-scoped; :2111 the mermaid
   node reads code → review row (engines → review ‖ security); :2816-2817 the
   quickstart comment.
3. **`vwf.md`, the planners** — the `#vwfplan` and `#vwfchange-plan` sections
   say who writes a review row and when (rulings 2 and 6); the interview gains
   the review-placement item; :2468-2476 the after-landing bullet per ruling 8 —
   `run` or `ask`, decided at the interview; the "retired" sentence goes.
4. **How-tos** — `single-repo.md:289`, `:441`; `cli-product.md:158`, `:167`;
   `api-only-service.md:154-155`: "each unit through code, review and security"
   becomes "each code unit through TDD and coverage, and the review rows the
   plan places through code and security review"; "adversarial review happens,
   twice, inside the run" stays true only if it means the two reviewers — keep
   or reword to match.
5. Anchors: every `#vwf…` heading that other pages link to keeps its text —
   `site/CLAUDE.md`'s link rule; the link checker in `p:site:check` is the
   proof.

## Verification

- `grep -n 'Full pipeline each code unit\|every review stage still runs\|mode that once let a plan pre-authorise' site/src/content/docs/plugins/vwf.md`
  prints nothing.
- `grep -c 'review row' site/src/content/docs/plugins/vwf.md` ≥ 4.
- `grep -rn 'code, review and security\|review and security still run per unit' site/src/content/docs/how-to/`
  prints nothing.
- `mise run p:site:check` green (astro check, build, link checker over dist).
- `mise run code:precommit` green.

## Guardrails

- Do not touch `readme.md`, `CLAUDE.md`, `.claude/**` (U4), `plugins/**`,
  `site/CLAUDE.md`, `site/package.json`, `site/src/content/docs/installer/**`.
- Never `git checkout` / `git restore` / `--fix` outside Owns.
- Do not rename a heading another page anchors to.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk; write with the Write / Edit tools.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`docs: site — review rows and after-landing modes in the vwf manual and how-tos`
— written by the orchestrator after the wave gate. Type `docs`; no scope.
