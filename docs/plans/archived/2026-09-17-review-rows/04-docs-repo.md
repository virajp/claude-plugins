# U4 — Repo docs: readme, CLAUDE.md, the vwf-plugin skill, two decision records

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/skills/vwf-plugin/**`,
  `.claude/docs/ci-and-releases.md`,
  `docs/memory/decisions/2026-09-17-review-rows.md` (new),
  `docs/memory/decisions/2026-09-17-after-landing-runs-on-recorded-consent.md`
  (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; the cited
  lines: `readme.md:238`, `:241`; `CLAUDE.md` :5, :60, :309, :372-378;
  `.claude/skills/vwf-plugin/SKILL.md` :72, :77;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md` :48, :69-70;
  `.claude/docs/ci-and-releases.md` :82-86, :286. Then the wave-1 result:
  `plugins/vwf/skills/execute/SKILL.md` frontmatter and headings,
  `references/review-unit.md`, the two agents' descriptions, the template's Kind
  paragraph.
- **Lazy-load:** `docs/memory/decisions/2026-09-16-one-executor.md` (the shape
  of a decision record and the ruling this plan reverses);
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.

## Ruling

8 — "**Reversal.** Each after-landing step carries `run` or `ask`, decided at
interview item 17 and written to the After landing table. On a green landing
execute runs every `run` step in order without a prompt and stops once before
each `ask` step. A `run` in a folder is authorisation; the 'read as `ask`'
clause goes."

9 — "A release step may be recorded `run`: the interview's release question
(item 18) is the ask. `CLAUDE.md`'s 'ALWAYS ask user before running
`p:plugins:release` …' rule gains that one exception — a plan whose After
landing table records the release as `run`, consented at its interview."

The whole assumed-decisions table of `index.md` — this unit writes the two
decision records that carry it.

## Edits

1. Run `/vwf:docs-sync` over the run's branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line the wave-1 units returned, plus the list in
   *Facts the survey established* for the owned files. Edit only what the change
   falsified.
2. **`readme.md:238`** — a code unit through TDD and coverage; the code and
   security review at the plan's review rows. `:241` — after-landing steps run
   or ask as the plan records.
3. **`CLAUDE.md`** — `:5` the hard rule gains ruling 9's exception in one
   clause; `:60` the "every after-landing step is asked for in the moment; the
   `run` mode is retired" clause becomes: each step carries `run` or `ask` as
   the interview recorded, and `/vwf:execute` runs the `run` ones on a green
   landing; `:309` the pipeline sentence names the three kinds — a `code` unit
   TDD / coverage, a `review` row the engines + review + security over the delta
   since the last row, an `edit` unit the wave review; `:372-378` the
   `p:plugins:local` sentence and the bold hard rule, per rulings 8 and 9.
4. **`.claude/skills/vwf-plugin/SKILL.md`** `:72`, `:77` — same two facts.
5. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** — `:48` the
   stage pipeline reads code → (at a review row) review ‖ security; `:69-70` the
   two reviewer rows say "over a review row's scope". Add
   `references/review-unit.md` to whatever table lists execute's references.
6. **`.claude/docs/ci-and-releases.md`** `:82-86`, `:286` — the `run` mode is
   back, on recorded consent; the hard rule's exception.
7. **`docs/memory/decisions/2026-09-17-review-rows.md`** (new) — the decision
   record in the house shape (date, branch, plan link, reverses nothing, backlog
   none): what prompted it (the user's finding that every step ran both reviews;
   the deadlock plan's parked per-step slowness), rulings 1-7 and 10 each with
   its rejected alternative, and the two items still parked.
8. **`docs/memory/decisions/2026-09-17-after-landing-runs-on-recorded-consent.md`**
   (new) — the reversal record: reverses the 2026-09-16 one-executor ruling that
   retired `run` (cite `2026-09-16-one-executor.md`); rulings 8, 9 and 11 with
   the rejected alternative; the user's words ("This step must be asked during
   planning itself and recorded in the plan. This way if execution is green, it
   can be landed in local or staging or production."); and the one caveat — the
   executor that ran this plan predates the ruling and asked once.
9. These files are dprint-formatted: `mise run code:format` over the owned paths
   only. `git add` both new records before the gate.

## Verification

- `grep -n 'run. mode is retired\|asked for in the moment' CLAUDE.md .claude/docs/ci-and-releases.md .claude/skills/vwf-plugin/SKILL.md`
  prints nothing.
- `grep -n 'review+security\|review + security pipeline' readme.md CLAUDE.md .claude/skills/vwf-plugin/SKILL.md`
  prints nothing.
- `grep -c 'review row' CLAUDE.md` ≥ 1.
- `test -f docs/memory/decisions/2026-09-17-review-rows.md && test -f docs/memory/decisions/2026-09-17-after-landing-runs-on-recorded-consent.md`.
- `mise run code:precommit` green; `mise run p:plugins:check` green.

## Guardrails

- Do not touch `site/**` (U5), `plugins/**`, `docs/plans/index.md`,
  `docs/backlog.md`, `installer/CLAUDE.md`, `site/CLAUDE.md`.
- Never `git checkout` / `git restore` / `--fix` outside Owns.
- `CLAUDE.md` and `readme.md` are dprint-formatted: widening a table cell
  re-pads every row — accept it.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk; write with the Write / Edit tools.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`docs: review rows and recorded after-landing consent — readme, CLAUDE.md, repo skills, decision records`
— written by the orchestrator after the wave gate. Type `docs`; no scope.
