# U1 — Execute core: the review row replaces the per-unit review; `run` steps run

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/execute/references/code-unit.md`,
  `plugins/vwf/skills/execute/references/edit-unit.md`,
  `plugins/vwf/skills/execute/references/review-unit.md` (new),
  `plugins/vwf/assets/execute-stages.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom. Then the cited lines in
  `index.md`'s Facts: `SKILL.md` :5-8, :29-42, :209-216, :221-262, :496-511,
  :596-600, :686-689, :710-718, :772-773; `code-unit.md` :3-8, :26-60, :69-78;
  `edit-unit.md` :1-10, :40-56, :71-104; `execute-stages.md` :17-34, :65-89,
  :131-134, :142-158, :192-240.
- **Lazy-load:** `plugins/vwf/assets/templates/plan-folder.md` (U3 changes it in
  the same wave — read it for today's shape only, never edit it);
  `plugins/vwf/agents/execute-code-reviewer.md` (U2's; the dispatch contract you
  write must match its inputs).

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

3 — "A review row reviews the **branch delta since the previous review row, or
the branch base** when it is the first."

4 — "A finding names a file; the orchestrator maps it to the unit whose Owns
holds it and re-dispatches that unit's coder in fix-first mode; then the row
re-runs in full, engines first. `pipeline.review_round_cap`, the convergence
guard and the `contested` exit apply to the row unchanged. A finding on a file
no unit owns is the orchestrator's `GAP:`."

5 — "The run journal's node value `review` names the row; the unit cell carries
the row id; `wave` is the row's wave. Recall tags become
`<row-id>/review/<round>` and `<row-id>/security/<round>`."

7 — "A plan with `code` units and no review row covering them is **refused at
preflight**, naming the uncovered units and the fix: add a row and re-approve.
Execute runs what is written and infers no node."

8 — "**Reversal.** Each after-landing step carries `run` or `ask`, decided at
interview item 17 and written to the After landing table. On a green landing
execute runs every `run` step in order without a prompt and stops once before
each `ask` step. A `run` in a folder is authorisation; the 'read as `ask`'
clause goes."

10 — "A code unit stays TDD → coverage → commit; the `edit` wave review is
unchanged; the acceptance and UX passes stay after the last unit, hence after
the final review row."

The user's words, 2026-09-17: "it's executing `code-review` and
`security-review` at each step which is waste. The plan generated must have
triggers at the right places … ideally at the end of plan but there can be
before and only if really needed." And on after-landing: "This step must be
asked during planning itself and recorded in the plan. This way if execution is
green, it can be landed in local or staging or production."

## Edits

1. **`references/review-unit.md`** (new) — the review row's procedure, in the
   shape of `code-unit.md`: (a) the scope — the branch delta since the previous
   review row that reached `green`, else the branch base — and how the
   orchestrator computes the range; (b) step "engines": one message invoking
   `/code-review` (high effort) and `/security-review` over that range via
   Skill, the `TaskOutput` wait with its 30-minute cap and the `ENGINE:`
   fallback line, moved verbatim from `code-unit.md:26-47`; (c) step
   "reviewers": both agents in one message with the Engine section, the round
   number, and the scope as a file list, not a unit; (d) the loop per ruling 4 —
   the file → Owns → unit map, the coder re-dispatched in fix-first mode for
   exactly the findings on its files, the row re-run in full, engines first,
   under `pipeline.review_round_cap`, the convergence guard and `contested`; a
   file no unit owns is a `GAP:` line in the run log; (e) the run-log rows per
   ruling 5; (f) what the row never does — edit, commit, stage. A review row has
   no commit of its own: the fix commits belong to the units fixed.
2. **`references/code-unit.md`** — the code unit becomes TDD → coverage →
   commit. Delete step 3 and the merged loop-back (:26-60) except the `ENGINE:`
   fallback wording, which moves to `review-unit.md`. The one-at-a-time rule
   (:3-8) stays as an ordering rule; "engines and reviewers never overlap" goes
   with the engines. The run-log rows (:69-78) shrink to the `code` node. Say in
   one clause that the unit's review happens at the review row that covers it.
3. **`references/edit-unit.md`** — :40-56 the wave reviewer's "code quality and
   security already ran" becomes "… run at the review row that covers the code
   units, never here"; :71-104 a code unit looped back by the wave review
   re-enters `code-unit.md` from step 2 — it no longer re-runs engines, and the
   next review row covers the fix.
4. **`SKILL.md`** — description :5-8 and intro :29-42: the three kinds of unit
   (`code`, `edit`, `review`) and what runs over each; the stage-subagent list
   says the two reviewers run at review rows. Waves :209-216 and :496-511: a
   review row is dispatched in wave order like any unit, after the units it
   depends on, and never concurrently with a code unit; "Full pipeline every
   code unit" :221-235 becomes the review-row paragraph pointing at
   `references/review-unit.md`; the security / breaking-API gate :236-243 fires
   at the review row; the round cap, convergence guard and wave-review cap
   :244-262 keep their names and values, re-scoped to the row. Fix-first
   :686-689: re-runs the owning unit's coder, then the covering review row.
   Preflight (§1, near :46-145): add the refusal of ruling 7 — a plan with
   `code` units and no `review` row whose Depends on (transitively) covers each
   of them halts before the claim, naming the uncovered units.
5. **`SKILL.md` After landing :710-718** — heading and body per ruling 8: read
   the table; a `run` step runs in order on a green landing with no prompt, an
   `ask` step stops once and waits; the "`run` in an older folder is read as
   `ask`" sentence and "nothing recorded there authorises anything now" go.
   Never-list :772-773: the bullet "Treats a `run` mode … as a step's
   authorisation" goes; the bullet above it becomes "Runs an `ask` step without
   the in-the-moment yes". A folder with no Mode column or an unknown mode is
   still refused at preflight — keep whatever refusal exists, or add it as one
   line.
6. **`assets/execute-stages.md`** — stage table :17-24: review and security rows
   read "at each `review` row, ‖, after `/code-review` | `/security-review` over
   the row's scope"; :25-34 engines-first prose re-scoped; dispatch contracts
   :65-89 take a scope (file list + range) instead of a unit, recall tags per
   ruling 5; :131-134 knobs unchanged; :142-158 the loop per ruling 4; the
   journal :192-240 — `node` value `review` (and `security` where the journal
   splits them) carries the row id in the unit cell, `wave` is the row's wave —
   reconcile with :206-208.
7. Every passage in the owned files that says "per unit", "every code unit",
   "the unit's review" or names the engines beside the coder — grep the five
   files for `engine`, `review`, `security`, `per unit`, `per-unit` — reads the
   new shape after this unit returns.

## Verification

- `grep -n 'read as .ask\|mode that let a plan pre-authorise' plugins/vwf/skills/execute/SKILL.md`
  prints nothing.
- `grep -n 'never overlap\|Full pipeline every code unit' plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/execute/references/code-unit.md`
  prints nothing.
- `grep -c 'review-unit.md' plugins/vwf/skills/execute/SKILL.md` ≥ 1.
- `grep -n 'code-review\|security-review' plugins/vwf/skills/execute/references/code-unit.md`
  prints nothing.
- `test -f plugins/vwf/skills/execute/references/review-unit.md`.
- `mise run p:plugins:check` green (strict-YAML frontmatter on `SKILL.md`
  intact); `mise run code:precommit` green after `git add` of the new file.

## Guardrails

- Do not touch `plugins/vwf/agents/**` (U2), `plugins/vwf/assets/templates/**`,
  `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/skills/plan/**`,
  `plugins/vwf/skills/change-plan/**` (U3), any doc, any version file.
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width by
  hand. No `--fix` outside Owns.
- Frontmatter is strict YAML — a bad edit drops the skill silently. Keep the
  `description:` a single flow scalar.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk; write with the Write / Edit tools.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`feat: execute — code and security review run at the plan's review rows; run steps run on recorded consent`
— written by the orchestrator after the wave gate. Type `feat`; no scope.
