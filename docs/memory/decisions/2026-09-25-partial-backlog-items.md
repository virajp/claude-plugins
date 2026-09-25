# Decision — partial backlog items: a plan that lands one piece leaves its item Partially done

**Date** 2026-09-25 · **Branch** `2026-09-25-partial-backlog-items` · **Plan**
[`docs/plans/2026-09-25-partial-backlog-items/`](../../plans/2026-09-25-partial-backlog-items/index.md)
· **Extends**
[`2026-09-19-backlog-status-vocabulary.md`](./2026-09-19-backlog-status-vocabulary.md)
— the Status field gains a fifth option — and
[`2026-09-18-backlog-on-github-projects.md`](./2026-09-18-backlog-on-github-projects.md)
— the verbs gain `partial` · **Backlog** B52

## What prompted it

B52. A plan covering one piece of an item listed the whole id on its `backlog:`
line, and both places that turn that list into `Done` — the executor's landing
and `plan-management archive` — checked nothing but "the list is non-empty". So
the first plan of a chain that landed would close an item the rest of the chain
had not yet built.

The B28 chain showed it. All nine 2026-09-20 plans listed B28 on `backlog:`;
eight carried a hand-written Parked warning that the landing's `done` "may need
the item moved back by hand", and the branch-model landing declined B28's `done`
by judgement. The item survived because people read the warnings, not because
anything enforced them.

## What changed

A backlog item reaches `Done` only when the plan that **finishes** it lands. A
plan that lands one piece of an item leaves the item open — Status
`Partially done` — and records on it which piece landed, in which folder.

- Plan folders carry two lists: `backlog:` (the ids the plan finishes) and
  `backlog_pieces:` (the ids it lands a piece of). A Parked entry that belongs
  to an item begins `- Bnn: <piece>`.
- `/vwf:backlog` gains `partial <ids> <folder>`; `done` reads
  `done <ids> [folder]`. The Status field has five options. An item's
  `Planned in:` line is a list, and each landing adds a
  `Landed: <plan title> in <folder>` line.
- `/vwf:execute` refuses, on a fresh run, a folder whose lists contradict its
  Parked lines, and lands `done` for `backlog:` and `partial` for
  `backlog_pieces:`.
- `plan-management archive` refuses a self-contradicting folder;
  `archive <folder> --force` archives it and lands the id as a piece. The index
  Backlog cell writes a piece id `Bnn (piece)`.
- The planners ask, per recalled id, whether the plan finishes it or lands a
  piece.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **How a plan says it lands one piece (1).** `backlog:` names the ids the plan
  finishes; a new list, `backlog_pieces:`, names the ids it lands a piece of; a
  Parked entry for an item begins `- Bnn: <piece>`; the last plan of a chain
  moves the id to `backlog:`. Rejected: splitting the item into new ids first (a
  `split` verb); scanning Parked prose for ids, where a passing mention would
  block a `Done`.
- **The verb (2).** `partial <ids> <folder>` sets `Partially done` and records
  `Landed: <plan title> in <folder>` on the body. Rejected: `done --piece` (a
  verb called `done` that does not finish); the names `partially-done` and
  `landed`.
- **The Status field (3).** Five options — `Backlog`, `In progress`,
  `Partially done`, `Done`, `Closed`. The bootstrap reshapes an existing
  four-option field on the next verb, through the existing snapshot-and-restore
  of every item's Status. Rejected: a piece leaving the item `In progress`.
- **Several plans on one item (4).** `Planned in:` holds a list of folders;
  `planned` on an item already `In progress` or `Partially done` appends its
  folder instead of asking; `partial` and `done` move their folder off
  `Planned in:` onto a `Landed:` line. Rejected: one folder on the line, asking
  on every further `planned`.
- **Status after a piece lands (5).** A landed piece always sets
  `Partially done`; a later `planned` sets `In progress`; the finishing plan
  sets `Done`. Folders still pending stay on `Planned in:`. Rejected:
  `Partially done` only when `Planned in:` is empty.
- **`next` (6).** Ranks `Backlog` items together with `Partially done` items
  whose `Planned in:` is empty, by priority then id; a partial item named shows
  its `Landed:` lines. Rejected: `Backlog` only.
- **`list` (7).** `Partially done` items are listed, not folded into the
  trailing count, their `Landed:` lines shown as a count —
  `Partially done (2 landed)`. Rejected: folding them with `Done` and `Closed`.
- **Where the consistency check lives (8).** The executor's preflight refuses a
  folder that names an id on both lists, an id on `backlog:` with a `- Bnn:`
  Parked line, or an id on `backlog_pieces:` with none — on a fresh run only; a
  resume runs what its folder says. Rejected: a repo checker rule.
- **Landing without the archive (9).** Open gaps or consent `no`: `done` for the
  `backlog:` ids and `partial` for the `backlog_pieces:` ids — the split archive
  uses.
- **Archive on a self-contradicting folder (10).** `archive` refuses a folder
  that names an id on `backlog:` with `- Bnn:` Parked lines for it, or an id on
  both lists, naming the id and quoting the lines; `archive <folder> --force`
  archives anyway and calls `partial`, never `done`, for that id.
  `backlog_pieces:` ids always get `partial`. Rejected: recording it as a piece
  without refusing; force calling `done`; force asking per id.
- **The index Backlog column (11).** Lists both kinds; a piece id reads
  `Bnn (piece)`. Rejected: a trailing asterisk marker, since a table cell ending
  in one oscillates between the formatter and the linter.
- **The planners (12).** For each recalled id the interview asks whether this
  plan finishes it or lands a piece; a piece plan writes what remains as
  `- Bnn: <piece>` Parked lines, at least one per piece id, naming the chained
  folder where one already covers the piece. Rejected: Parked lines optional,
  the remainder living only in the item body.
- **Older folders (13).** An absent `backlog_pieces:` reads as empty; the
  plan-folder template carries no format version, so nothing is bumped.
- **Review row (14).** None: every edit is markdown and nothing runnable ships.
  Rejected: a `Kind: review` row.
- **The id floor (15).** The next id reads `backlog_pieces:` lists as well as
  `backlog:` lists over every plan folder, live and archived. Rejected:
  `backlog:` only, since an id cited only as a piece could be reissued.

## Not a reversal

It makes the repo's own rule — an id goes on `backlog:` only on the plan that
finishes the item — the skills' rule. The user restated the standing "fix the
source, not a guard" rule at the interview: *"The idea is always to fix the vwf
skill and not add facade in the repos using vwf skill"* — so the check lives in
the executor's preflight and in `archive`, never in a repo gate.

## Consequences for a user

- **The board's Status field gains a fifth option on the next verb.** A project
  trimmed to four under the 2026-09-19 skill is reshaped by the first verb the
  new skill runs; every item keeps the Status it had.
- **A folder listing an id on `backlog:` while parking pieces of it is refused**
  — by `/vwf:execute` on a fresh run, and by `archive`. Move the id to
  `backlog_pieces:`, or drop the `- Bnn:` lines once nothing is left.
- **`archive <folder> --force`** archives a refused folder anyway and records
  the id as a piece, never `Done`.
- **An item's body now records its history** — the folders still pending on
  `Planned in:`, one `Landed:` line per folder that landed on it.

## What stays outside

Board automation — GitHub sub-issues linking an item to its pieces — declined:
sub-issues exist only between repository issues, and items are draft issues by
ruling 3 of the 2026-09-18 decision. A repo checker rule over plan folders —
declined, per the quote above. Rewriting archived plans or older decision docs
that count the old verbs or describe the four-option field — records of their
day. A retro audit of the board against the archived plans runs after landing,
in a restarted session, on the user's word.
