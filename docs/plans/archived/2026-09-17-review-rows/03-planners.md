# U3 — Planners: the template, the interview, `/vwf:plan`, `/vwf:change-plan`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/skills/plan/SKILL.md`,
  `plugins/vwf/skills/change-plan/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom. The cited lines:
  `plan-folder.md` :39-56 (Consent), :104-118 (Units, Kind), :142-148 (After
  landing), :185-193 (run log), :236-241 (unit header), and "The two fixed final
  units" at the end; `plan-interview.md` item 9-11 and item 17-18;
  `plan/SKILL.md:325`, `:364`; `change-plan/SKILL.md:154`, `:157-160`,
  `:218-222`.
- **Lazy-load:** `docs/plans/2026-09-17-review-rows/index.md` (this plan's After
  landing table — the first folder written with a `run` mode).

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

The user's words, 2026-09-17: "The plan generated must have triggers at the
right places to run `code-review` and `security-review`, ideally at the end of
plan but there can be before and only if really needed." And: "This step must be
asked during planning itself and recorded in the plan. This way if execution is
green, it can be landed in local or staging or production."

## Edits

1. **`plan-folder.md`, Units table and Kind paragraph** (`:104-118`) — Kind is
   `code`, `edit` or `review`. Add an example row:
   `Un-2 | last-1 |
   NN-review.md | review | — | <every code unit> | pending |`.
   The paragraph says what execute runs over each kind, that a `review` row
   covers the branch delta since the previous review row, and that `/vwf:plan`
   writes one after the last code unit and before the docs unit while
   `/vwf:change-plan` writes one only for runnable code — an earlier row needs a
   reason in the assumed-decisions table. The run-log note (`:185-193`) says a
   `review` row yields one row per round.
2. **`plan-folder.md`, unit-file shape** (`:236-241` and after) — a
   `NN-review.md` carries Wave, Depends on (the units it covers), Owns `—`,
   Model, `Kind: review`, and a Scope section (the units and the reason for this
   placement); no Edits, no Test first, no Commit. Add that shape beside the
   `NN-<unit>.md` one, or as a marked variant of it.
3. **`plan-folder.md`, Consent and After landing** (`:39-56`, `:142-148`) — the
   `After landing:` consent row reads `run` or `ask`; the Mode column accepts
   both; the sentence "Every after-landing step is an `ask` step: the run stops
   once, reports what it would do, and waits" becomes: a `run` step runs on a
   green landing without a prompt, an `ask` step stops the run once before it;
   the mode is the interview's answer, and a release step recorded `run` is
   authorised by the interview's release question. Keep the "restarted session"
   note.
4. **`plan-interview.md`** — a new item under C, after item 10 (Ordering):
   **Review placement.** Cycle plans: where the review row(s) go — default one
   after the last code unit; an earlier one only with a reason. Change plans:
   whether a row is needed at all — only when the change lands runnable code.
   Item 17 rewritten per ruling 8: each step is `run`, `ask` or dropped; `run`
   means the run lands it on green with no prompt; `ask` means the run stops
   once before it. Item 18: the release intent question doubles as the consent
   for a release step recorded `run`. Renumber nothing else — insert the review
   item as `10a` so every cross-reference to items 11-19 stays true.
5. **`plan/SKILL.md`** — `:364` "every unit `Kind: code`" becomes: every slice
   unit `Kind: code`, then one `Kind: review` row after the last code unit
   (before the docs unit) whose Depends on names every code unit, and earlier
   rows only on a ruling recorded in the decisions table; `:325` the Consent
   block's after-landing steps carry `run` or `ask`. Add to the self-review
   list: every `code` unit is covered by a later `review` row.
6. **`change-plan/SKILL.md`** — `:154` and `:218-222`: every unit `Kind: edit`;
   a `Kind: review` row is added only under ruling 6, with the reason in the
   decisions table, else "the wave review is the only check". `:157-160` (§4b):
   each step gets `run` or `ask` at the interview; the sentence "Every step has
   one mode, `ask`" and "Nothing after the landing runs unprompted" go; the
   restarted-session note stays. Add to §7 self-review: a `review` row, when
   present, names its reason.

## Verification

- `grep -n 'Kind is .code. or .edit.' plugins/vwf/assets/templates/plan-folder.md`
  prints nothing.
- `grep -c 'review' plugins/vwf/assets/templates/plan-folder.md` grows by ≥ 5
  over `develop`.
- `grep -n 'Every step has one mode\|Nothing after the landing runs unprompted' plugins/vwf/skills/change-plan/SKILL.md`
  prints nothing.
- `grep -n 'Review placement' plugins/vwf/assets/plan-interview.md` hits.
- `grep -n 'Kind: review\|Kind:`review`' plugins/vwf/skills/plan/SKILL.md` hits.
- `mise run p:plugins:check` green; `mise run code:precommit` green.

## Guardrails

- Do not touch `plugins/vwf/skills/execute/**`,
  `plugins/vwf/assets/execute-stages.md` (U1), `plugins/vwf/agents/**` (U2), any
  doc, any version file, and never this plan's own folder.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand; the
  template's fenced markdown block is what every planner copies — keep its
  column alignment.
- Frontmatter of the two skills is strict YAML — keep `description:` a single
  flow scalar.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`feat: planners write the review row and a run or ask mode per after-landing step`
— written by the orchestrator after the wave gate. Type `feat`; no scope.
