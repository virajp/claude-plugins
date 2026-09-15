# U2 — change-execute: `next`, the claim, the landing row, `ask` only

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-execute/SKILL.md`,
  `plugins/vwf/skills/change-execute/references/blocking.md`,
  `plugins/vwf/skills/change-execute/references/queue.md` (new)
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing; `index.md`'s
  Goal, Facts and Assumed decisions.
- **Lazy-load:** `plugins/vwf/skills/git-workflow/SKILL.md` (the declared
  preferences change-execute passes it, and its safety rules — no `--force`, no
  `reset --hard`, no `--no-verify`);
  `plugins/vwf/skills/backlog/SKILL.md:130-137` (the base-repo placement this
  unit mirrors); `plugins/vwf/skills/execute/SKILL.md:501-506` (the
  chain-forward offer, the analogue of `next` — read only).

## Ruling

Decision 2: "An index row carries only `APPROVED`, `RUNNING` or `COMPLETE`. The
folder's own `## Status` keeps the run detail — `BLOCKED`, `RUNNING — paused
…`,
the worktree path. `next` reads the index alone; a `RUNNING` row is opaque to it
whatever the folder says."

Decision 3: "A claim is the row set to `RUNNING`, committed and pushed on the
integration branch **before** the worktree is cut. A named
`/vwf:change-execute <folder>` on an `APPROVED` plan claims the same way; a
resume of a `RUNNING`/`BLOCKED` folder finds its row already `RUNNING` and
leaves it."

Decision 4: "Only as direct commits on the integration branch from the main
checkout, never in a worktree: change-plan's approval commit adds the row;
change-execute commits `RUNNING` at claim and `COMPLETE` after the merge lands.
The run branch never touches `docs/plans/index.md`, so two parallel landings
cannot conflict on it."

Decision 5: "When the main checkout is dirty or not on the integration branch:
`git stash push -u`, `git checkout <integration>`, `git pull --ff-only`, edit
and commit the index, push, `git checkout -` and `git stash pop`. Each step is
one plain git call."

Decision 6: "`git pull --rebase`. A clean rebase means another session changed a
different row — push again; the pick stands, since a claim only ever flips
`APPROVED` to `RUNNING` and cannot make a satisfied `requires:` unsatisfied. A
conflict on `docs/plans/index.md` means the same row — `git rebase --abort`,
drop the claim commit (`git reset --soft HEAD~1`, then restore the index file),
`git pull --ff-only`, re-pick."

Decision 7: "Candidates are `APPROVED` rows whose every `requires:` entry
resolves to a `COMPLETE` row or to a folder under `docs/plans/archived/` with no
row. Order: `Priority` ascending, then the folder's date prefix ascending, then
folder name. Nothing runnable → print each `APPROVED` row and what it waits on,
and stop. No change-plan table, or no rows → say so and stop."

Decision 8: "`next` never takes a `RUNNING` row. Resuming is
`/vwf:change-execute <folder>`; a claim whose session is gone is reset to
`APPROVED` by hand, in a commit on the integration branch."

Decision 10: "A `requires:` entry matches an index row, or an archived folder,
by its **basename** — `docs/plans/X` and `docs/plans/archived/X` name the same
plan. No skill ever re-points a `requires:` line. An entry with no row and no
folder anywhere is a refusal, named."

Decision 11: "After the merge lands (git-workflow step 4 returns), one
integration-branch commit sets the row `COMPLETE` with its `Folder` column
pointing at the archived path, then removes every `COMPLETE` row that no
`APPROVED` or `RUNNING` row's `Requires` names. Message:
`docs: plan queue — <folder> complete`. The claim commit's message is
`docs: plan queue — <folder> running`."

Decision 13: "`ask` only. change-plan's §4(b) offers no `run`; the template's
After landing table reads `ask`; change-execute stops once before every step. A
`run` in an older folder is read as `ask`."

Decision 14: "The index is the **base** repo's, as `docs/backlog.md` is; a run
in a member repo addresses the base's file."

The user's framing: "If user opens a session and executes `/change-execute
next`
then it must automatically pick next plan to execute. However, this can be done
even when another session is already executing a plan, please handle such
situation."

## Edits

1. **`references/queue.md`** (new) — the two integration-branch procedures,
   written as ordered plain git commands so the wave review can check every
   branch, and cited from SKILL.md §1 and §7:
   - **Reading the queue.** Resolve the base repo (decision 14, the way
     `backlog/SKILL.md` does). `git fetch` and read `docs/plans/index.md` at the
     integration branch's tip —
     `git show origin/<integration>:docs/plans/index.md` — never the working
     copy, which may be stale or on another branch. Parse the change-plan table
     per `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`. A `Requires` cell
     resolves each basename to a row by the basename of its `Folder` cell; with
     no row, to `docs/plans/archived/<basename>/` on disk (satisfied); with
     neither, the entry is unresolvable and the plan is refused, named. The pick
     order and the stop conditions of decision 7.
   - **Writing a row (claim or complete).** The main-checkout dance of decision
     5 — record the current branch and whether a stash was taken;
     `git checkout <integration>`; `git pull --ff-only`; edit the one row (or,
     at completion, the row plus the sweep of decision 11); stage
     `docs/plans/index.md` alone; `mise x -- git commit` with the message
     decision 11 names; `git push`. On a rejected push, decision 6 verbatim as a
     loop: rebase clean → push again; conflict → abort, drop, pull, and go back
     to the read step to re-pick (a claim) or re-apply the same row (a
     completion — a completion never re-picks; it re-applies until the push
     lands). Then `git checkout -` and `git stash pop` when a stash was taken.
     Every command is one plain call; none of `--force`, `reset --hard`,
     `--no-verify`.
   - **The sweep.** After setting a row `COMPLETE`, remove every `COMPLETE` row
     whose `Folder` basename appears in no `APPROVED` or `RUNNING` row's
     `Requires` cell. A row that something still requires stays, its `Folder`
     pointing under `archived/`.
2. **`SKILL.md`** —
   - Frontmatter `description` and `argument-hint`: the argument is a plan
     folder, its `index.md`, or `next`. Keep the scalar valid strict YAML.
   - The opening: the two ways in — a named folder, or `next`, which reads the
     base repo's `docs/plans/index.md` change-plan table and picks by priority.
     Both run the same procedure from §2 on.
   - §1, before "Resolve `$ARGUMENTS`": **`next`.** Run the read procedure of
     `references/queue.md`; on a pick, print the folder taken, its priority, and
     every other `APPROVED` row with why it was not taken (lower priority, or
     the requirement it waits on); no confirmation — the session is meant to run
     unattended. Then continue as if that folder had been named. Nothing
     runnable → the stop message of decision 7.
   - §1, the refusals: keep every existing one, and add the index checks — the
     folder's row is read at the integration branch's tip; a `RUNNING` row on an
     `APPROVED` folder is a claim another session holds → stop, name it, say a
     resume is only by the session that holds it or after a hand reset to
     `APPROVED`; no row at all for a folder whose Status is `APPROVED` → stop:
     "not in the plan index; re-run `/vwf:change-plan`'s hand-off, or add the
     row by hand". `requires:` now resolves per decision 10, through the index
     first — replace the current "any `requires:` folder whose status is not
     `COMPLETE`" check with the queue rule. A `RUNNING`/`BLOCKED` folder (a
     resume) expects its row `RUNNING` and leaves it; if the row reads
     `APPROVED` (a hand reset), claim it again.
   - §1, the claim: **before** the worktree is cut, and before the folder's own
     Status is set `RUNNING`, run the write procedure with the row set to
     `RUNNING`. This is decision 3 and 4; say plainly that this is the one edit
     the run makes in the main checkout, and why (the run branch must never
     carry the index, decision 4). The existing rule "the plan folder is edited
     in the worktree only" stays and gains the exception in the same sentence.
   - §7 Land: after git-workflow's step 4 returns from a consented merge and
     push, run the write procedure with the row set to `COMPLETE`, the `Folder`
     cell pointing at `docs/plans/archived/<basename>`, and the sweep. When the
     landing consent is `no`, the row stays `RUNNING` and the stop message says
     so — the hand merge must be followed by a hand edit of the row, or by
     `/vwf:archive <folder>`.
   - §7a and §8: collapse to one — every after-landing step is `ask`; the run
     stops once before each, reports what it would do, and waits. A step whose
     Mode reads `run` in an older folder is read as `ask`. Delete the "`run`
     steps execute unprompted" prose.
   - The status-line format in §1 and the resource-cap paragraph: unchanged in
     shape; note that the index row does not change on pause or block (decision
     2).
   - "What this skill never does": add "Edits `docs/plans/index.md` from inside
     the worktree, or edits any row but its own plan's and the `COMPLETE` sweep
     of decision 11"; "Takes a `RUNNING` row, however stale"; "Runs an
     after-landing step without asking".
3. **`references/blocking.md`** — the resume section: the index row stays
   `RUNNING` through a block and a pause; a resume does not touch it; a hand
   reset to `APPROVED` (decision 8) is what lets `next` or a named run claim it
   afresh, and the resume command line stays `/vwf:change-execute <folder>`.

## Verification

- `mise run p:plugins:check` green.
- `command grep -n '`run`step\|run steps execute\|unprompted' plugins/vwf/skills/change-execute -r`
  returns nothing.
- `command grep -c 'queue.md' plugins/vwf/skills/change-execute/SKILL.md` ≥ 2.
- `command grep -n 'pull --rebase\|rebase --abort\|reset --soft HEAD~1\|stash push -u\|stash pop\|pull --ff-only' plugins/vwf/skills/change-execute/references/queue.md`
  — every one of the six present.
- `command grep -n 'reset --hard\|--force\|--no-verify' plugins/vwf/skills/change-execute -r`
  — only in a "never" sentence, if at all.
- `command grep -n 'next' plugins/vwf/skills/change-execute/SKILL.md | head` —
  the frontmatter, the opening and §1 all name it.

## Guardrails

- Touch nothing outside the three owned files. `assets/plan-index.md` is U3's —
  cite it by path and by decision 1's column names; never create it.
  `change-plan/**` is U1's, `archive/**` U3's.
- `plugins/**/*.md` is **not** dprint-formatted: match the surrounding fold
  width by hand.
- Strict-YAML frontmatter: keep `description` and `argument-hint` valid scalars;
  a stray colon-space drops the skill silently.
- git-workflow's safety rules bind the procedures you write: no `--force`, no
  `reset --hard`, no `--no-verify`, and one plain git command per call.
- Never end a table cell in a bare asterisk; no escaped backticks inside code
  spans.
- Delete with `rm`, never `git rm`.

## Commit

`feat: change-execute — next, the plan-index claim and landing row, ask-only after landing`
— written by the orchestrator after the wave gate, not by the unit.
