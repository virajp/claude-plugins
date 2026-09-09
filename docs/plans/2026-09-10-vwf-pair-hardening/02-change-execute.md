# U2 — change-execute: stage by Owns, and route nobody-owned docs findings

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-execute/SKILL.md`,
  `plugins/vwf/skills/change-execute/references/wave-review.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/git-workflow/SKILL.md:130-166` (step 3 —
  the staging sequence the commit step delegates to);
  `docs/plans/archived/2026-09-08-retire-repo-plan-skills/index.md` run log rows
  for R1 and U2 (the two incidents, as the record of what happened).

## Ruling

From index.md's assumed decisions, verbatim:

> **4.** **Both ends.** Unit contract and dispatch prompt: delete with plain
> `rm`, never `git rm` — a unit stages nothing. Execute step 5: stage exactly
> the unit's Owns (`git add -- <paths>`, which stages a deletion too), then
> `git diff --cached --stat` must list nothing outside them; a stray path is
> unstaged with `git reset -q HEAD -- <path>` before the commit.

> **5.** **Route to the docs unit, widen its Owns, log a GAP.** A rule-5 finding
> in a file no unit owns becomes a `DOCS FALSIFIED:` line for the docs unit; the
> orchestrator widens that unit's Owns to the passage, records the widening in
> the Units table and the run log as a GAP, and the final report lists it. The
> plan's Goal is the authority. Bounded to rule-5 — a code path nobody owns
> still blocks.

The user: *"Both ends"*; *"Route to the docs unit, widen its Owns, log a GAP"*.

## Edits

1. **`SKILL.md` §4 step 1, the dispatch prompt (`:89-96`).** Inside the quoted
   prompt, after "or commit.", add: "Delete with plain `rm`, never `git rm` —
   stage nothing."
2. **`SKILL.md` §4 step 5, the commit (`:116-119`).** Rewrite the step so it
   says, in order: stage exactly the unit's Owns —
   `git add -- <every owned
   path>`, which stages a deletion as readily as an
   edit; then read `git diff --cached --stat` and, for any path outside that
   unit's Owns, `git reset -q HEAD -- <path>` before committing — a path another
   unit staged is that unit's, and rides its own commit; then the commit with
   the unit file's line via `vwf:git-workflow` step 3. Keep the sentence about
   the short hash and the run-log row.
3. **`references/wave-review.md`, the loop.** After the "Other findings loop to
   the owning unit" bullet, add one bullet: a **rule-5 finding in a file no unit
   owns** does not loop — it becomes a `DOCS FALSIFIED:` line handed to the docs
   unit, whose Owns the orchestrator widens to that passage; the widening is
   written into the Units table's Owns cell and the run log as a GAP, and the
   final report lists it. The plan's Goal is what authorises the widening. Only
   rule 5: a finding under rules 1–4 in a nobody-owned path is still `CONTRACT:`
   or `RULINGS:` residue, handled as the loop already says.
4. **`SKILL.md` §4 step 3 (the wave review) or §6 (the final report)** — one
   clause so the report's GAP list explicitly includes "every Owns widened at
   run time, with the finding that caused it".

## Verification

- `mise run plugins:check` green.
- `grep -n 'git rm' plugins/vwf/skills/change-execute/SKILL.md` → the
  dispatch-prompt sentence only.
- `grep -n 'diff --cached' plugins/vwf/skills/change-execute/SKILL.md` → one
  hit, in step 5.
- `grep -n 'widen' plugins/vwf/skills/change-execute/references/wave-review.md`
  → at least one hit.
- Fold width matches the surrounding prose (80 columns, by hand).

## Guardrails

- Do not touch `plugins/vwf/skills/change-plan/**` (U1) — the unit contract and
  the template are U1's; you change only the dispatch prompt and the commit step
  here.
- Do not touch `plugins/vwf/skills/git-workflow/**` (U3): step 3's own staging
  sequence stays as it is; you describe what change-execute does around it.
- Strict-YAML frontmatter — do not edit it.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`fix: change-execute stages by Owns and routes nobody-owned docs findings to
the docs unit`
— written by the orchestrator after the wave gate, not by the unit.
