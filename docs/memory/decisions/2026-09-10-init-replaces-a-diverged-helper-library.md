# Decision — `init` replaces a diverged helper library, and rewrites the calls by the pack's table

**Date** 2026-09-10 · **Branch** `init-helper-library-and-ci-shfmt` · **Plan**
[`docs/plans/2026-09-10-init-helper-library-and-ci-shfmt/`](../../plans/2026-09-10-init-helper-library-and-ci-shfmt/index.md)
· **Reverses**, for one file, two standing rules of `init`'s existing-repo
pipeline — the shebang pass's *flagged and never rewritten* and the
missing-files pass's *already owned, never overwritten*

## The problem

The `/vwf:setup reshape` run on this repo on 2026-09-09 (commit `47af40c0`) did
exactly what `init` was written to do, and left the repo broken. Pass 5, **The
helper library**, renamed `_scripts/_helpers` to `_scripts/helpers` and kept its
contents — sixteen printers written against an older vocabulary. Pass 6,
**Missing files**, then created the toolchain pack's `_scripts/merge`,
`_scripts/checks`, `_scripts/placeholder` and `setup/default-branch` byte for
byte, each written against the pack's library of nine printers. Seven names are
common to both. The pack's two others are the ones its scripts call, and the
kept library never defined them, so `code:merge:*` and `setup:default-branch`
died on `print_wait: command not found` — tasks created by that run, breaking on
their first print.

Neither pass was wrong on its own terms. Pass 5 renamed and did not translate;
pass 6 kept a file the repo already had. Together they produced a task library
whose newest files call functions its helper library does not have, and nothing
in the run reported it.

## What was decided

The user, on 2026-09-10:

> You should replace the helper with the one shipped with `init` and update all
> the existing tasks to use the new helper and make repo compatible with `init`.

The ruling, from the plan's decision 3:

> **Replace, then rewrite by the table.** Pass 5 keeps its two renames, then
> compares the repo's `_scripts/helpers` to the pack's byte for byte. When they
> differ the plan carries one **replace** row (the pack's file lands over the
> kept one, on the same consent — its retired names listed as sub-lines) and one
> **rewrite** row per call site of a retired name in a repo-owned task, each
> `old → new` by the pack's legacy table. A call to a retired name the table has
> no row for is **flagged and never rewritten**, listed with its file and line,
> and lands in Deferred with the unlock "add the row to the pack's legacy table,
> or rewrite the call by hand". A pack-owned task file the repo already carries
> byte-identical, and every file pass 6 creates, are unaffected by the rewrite.

**The bound is the table, not `init`'s judgement.** The mapping lives in the
toolchain pack's task-library reference, under **Legacy names** — the same table
pass 3 reads for task names — and it gained nine `print_*` rows for this. That
is what makes the rewrite legitimate where the shebang pass's would not be:
nothing is translated on the spot, and a name the table does not carry is
flagged rather than guessed at. The mapping is a fact about that library, so
vwf's own prose names no function.

**Two rules are reversed for this one file, and only this one.** The shebang
pass still flags and never rewrites; the missing-files pass still treats a
pack-owned file the repo already has as *already owned*, deferring to the
adapter's user-run re-sync command. The helper library is carved out of both
because of **timing**: every task file pass 6 creates sources it, so a kept copy
missing a function those files call is a breakage *this run causes*, and a later
user-run command is too late to prevent it.

**Ten passes stay ten**, and the counts grow instead. The plan document is now
eight sections — `Replaces` and `Rewrites (applied)` join
`Rewrites (flagged, not applied)` — and the report gains `Files replaced` and
`Calls rewritten`. Idempotence holds by construction: after the replace, the
second run finds the file byte-identical to the pack's, plans no row, and
rewrites no call, because the names it would have mapped are gone from the tree.

**This repo is not repaired by the change.** The user's `/vwf:setup reshape` run
on this checkout is both the repair and the acceptance test — it must plan one
replace and six rewrites, after which the merge and default-branch tasks stop
dying on a missing printer.

## The alternatives rejected

- **Defer the dependent creates behind a reported conflict.** It trades a loud
  break for a quiet gap: the repo ends the run without the merge tasks it came
  for, and the report's Deferred section is where that fact goes to be
  forgotten.
- **Let `init` pick the nearest function itself.** That is precisely the
  auto-translation the shebang rule refuses, applied to a surface where the
  wrong guess is silent — a line printed in the wrong colour, or on the wrong
  stream, reads as working.
- **Create the files anyway and report the mismatch.** The report would be
  accurate and the repo would still be broken; a run that knows the breakage it
  is about to cause should not cause it.
- **Only map the three retired names this repo happens to call.** Every other
  reshaped repo would then flag on names that have an obvious mapping, and the
  table would grow one row per incident. All nine retired names are mapped.
- **A repo-side gate** asserting every `print_*` a task calls is defined. The
  user: *"It's stupid to do such checks. This is a bug that was not suppose to
  come up in the first place, it's a bug in `init` skill, not the repo."* A repo
  does not carry a guard for its tooling's bug; the fix belongs in the skill.
