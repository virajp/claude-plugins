# Decision — `init` adopts a brownfield task library, and `doctor` keeps it relevant

**Date** 2026-09-12 · **Branch** `2026-09-12-init-brownfield` · **Plan**
[`docs/plans/2026-09-12-init-brownfield/`](../../plans/2026-09-12-init-brownfield/index.md)
· **Reverses** two standing rules of `init`'s existing-repo pipeline — the
2026-09-10 helper decision's *unmapped call is deferred*, and the missing-files
pass's *already owned, never overwritten* · **Amended** at the fixture gate the
same day — the sidecar derives from definitions, and a rename collision has a
ruling, both recorded under *Ruled at the fixture gate* below

## The problem

`init` was written against a greenfield repo, where byte-for-byte is the whole
answer: nothing is there, everything the packs declare lands, and every file in
the tree afterwards is the pack's. A repo that has been alive for two years is
the opposite case, and the pipeline had no rule for most of it. The user, on
2026-09-12:

> greenfield projects/repos don't have anything so byte-to-byte works at start
> but then init needs to adopt as the project evolves and must ensure that these
> tasks are kept relevant

and, for the helper functions specifically:

> in brownfield, you have to check whether it breaks any existing functionality
> and adopt to the requirements of the repo.

Three holes, each one a place the pipeline stood still. A function the repo's
own tasks call that the pack's library never defined was **deferred**, so the
run broke a task the repo already had, for the sake of a name the pack was never
going to grow. A task file the repo wrote for itself had **no rule at all** —
"repo-owned task file" appeared once in the whole reference, as a rewrite
target. And a pack-owned file whose bytes had diverged was *already owned* and
never written to, so its marked positions were never reached and the repo
drifted from the library one file at a time with nothing reporting it.

## What was decided

### The sidecar — a reversal, stated as one

The
[2026-09-10 helper decision](2026-09-10-init-replaces-a-diverged-helper-library.md)
stands in every part but one. The helper library is still replaced byte for
byte; a mapped call is still rewritten only through the pack's legacy table;
nothing is translated on the spot. What changes is the unmapped call. The user's
words:

> Move them to a repo-owned `_scripts/local` sidecar.

Every function the repo's old helper library **defines** that the pack's does
not define and the table does not map is carried, **whole and text-unchanged**,
out of that file and into `_scripts/local` — repo-owned, shipped and declared by
no pack, and the one file `init` writes that no pack marked. Each task that
calls one gains a single `source` line for the sidecar directly after its
existing source of the helper library, spelled the way that line already spells
it; a task calling none of them gains no line. The plan carries one create for
the sidecar, sub-lined per function moved, and one rewrite per calling task — so
the two counts differ, and a function that moved with nothing calling it is one
sub-line and no rewrite. A repo that already has the sidecar gets what it lacks
appended, never duplicated. **Nothing is deferred on this account** — the one
remaining flag is a call to a function nothing defines anywhere, which was a
broken call before the run began and has no body to move.

That the list is derived from **definitions** rather than from call sites is the
amendment of 2026-09-12, recorded below; the original wording said *call*, and
the difference is functions.

The order is load-bearing: the sidecar is written **before** the helper file is
replaced, because the bodies it copies exist in the tree only until the replace
lands.

### Repo-only tasks — kept, listed, and noted at most

A task file under the library that no landed pack ships is the repo's own. It is
listed under `Repo-owned, kept` and **touched by nothing**: `init` does not move
it, does not rename it and does not fold it into a group of its own choosing. A
repo that wrote a task wrote it for a reason this run cannot read.

The set is derived **once the rename pass is accounted for**, in the same words
and for the same reason the diverged-files pass uses: the rule is the path a
file *resolves to*, never the path it sits at. A file the legacy table renames
into the set the bundles declare is the set's, not the repo's — and so is one
the collision ruling below leaves at its old path. Both already carry a row of
their own, a rename or an offer, and listing either here as well reads as two
files, one of them kept, where there is one. `_scripts/local` is never among
them either: it is the sidecar pass's, and listing it twice reads the same way.

One shape earns a note, and a note is all it earns: a repo-owned task in the
`setup/` or `code/` group whose name the task-library contract's mandatory set
does not carry is reported with one line saying those two groups are the
contract's, and that the task's home is the repo's own `p:<id>:*` group unless
it is a gate every project shares. The note goes in the plan and the report,
never as a rename row — a rename here would be exactly the guess the shebang
pass refuses. The contract can say a name is not one of its own; it cannot say
what the repo meant by it.

### Diverged pack files — the second reversal

`existing-repo.md`'s rule that a pack-owned file the repo already has is
*already owned, never overwritten* is replaced by a per-file offer. The user's
words:

> Offer replace-or-keep per file, replace re-fills the marked positions.

Every such file is compared byte for byte once the renames are accounted for —
the path it resolves to, never the path it sits at, and a file the collision
ruling below leaves at its old path reaches this pass on exactly these terms,
listed under the path it occupies now. Identical needs nothing. Different
becomes one `Offered (replace / keep)` row in the **same single plan**, carrying
a fixed three-line summary — what the repo's version adds, what it lacks,
whether it references a retired name — and the default `init` computed:
**replace** where the repo's file references any left-hand name of the legacy
table, **keep** everywhere else. A file naming a retired thing is written
against a vocabulary the library no longer has, and keeping it keeps the
breakage; a file that differs only by deliberate edits is a decision, and the
default respects it.

Replace lands the pack's file and then re-fills every marked position it carries
from the interview's confirmed answers, exactly as a fresh landing fills them —
which is what makes a replace safe on a file whose positions the repo had
already filled. Keep leaves the file alone and records the decision.

**The consent stays single.** A user may name any offered row and flip its
default before answering; doing so re-prints the whole plan with the new
decisions and asks the same one question. `init` never walks the rows asking. A
stop records nothing — the next run computes its defaults afresh.

The helper library is the one file this pass never offers: pass 5 replaces it
unconditionally, for the timing reason the 2026-09-10 decision gives.

### Recording a keep — `config_format` 18

The record needed a key, and the catalogued shape did not fit. Both the init and
the doctor units returned `UNRESOLVED` on it independently and agreed on why:
`enforcement.rules` is keyed by **rule id**, `/vwf:architecture` asserts every
entry there names a known rule, and a file path names no catalogued rule. So the
record gets a key of its own, ruled by the user on 2026-09-12 and carried in the
plan's decision table: `enforcement.kept_files`, a map of
`<path>: { reason: <one line> }`, the path as the lockfile names it.

`config_format` bumps **16 → 18**, and the skip is the user's own rule, in their
words:

> Config_format is 17 so bump it up to 18, skipping 17

> I don't like 13 and 17 so versions must skip these numbers

So **17 is never issued on either number line**, and a stamp reading 17 is
treated as 16 and migrated from there. 13 is skipped on the **blueprint** line
alone — `config_format` 13 is real, and the two stamps were never comparable.
`blueprint_format` is untouched at 24 — the third config bump to ship without a
paired blueprint bump, after 14 and 16. The migration adds `kept_files: {}` and
rewrites the stamp; there is nothing to convert, since no surface wrote the key
before 18 and an absent block already reads as empty.

`kept_files` is **the one key `init` writes into `.config/vwf.yaml`**, and
`init` never creates that file — everything else about that file stays
`/vwf:setup`'s. The entry is written under the same single consent, after every
keep is settled and before the fill pass, merged into whatever the block already
holds. On a repo `/vwf:setup` has not reached there is no file to write into:
the keep still applies, and the *record* becomes a `Deferred` line whose unlock
is *run `/vwf:setup`, then `/vwf:setup reshape`*.

### Doctor gains two predicates — four become six

The repo-shape check drifted by standing still; it now also notices a repo that
drifted by **moving**.

**(e) Content drift.** Every lockfile `entries:` record carries a `hash:` — the
content at the version this repo locked — so the check is a hash comparison
against the file on disk, not a second read of the adapter. The path set is
every record landing **outside `.claude/`**, the `config/` tier. A file whose
content no longer matches is one drift row; a recorded path that no longer
exists is the same row, worded *removed*. The row says whether it is (e) or (a),
because the fixes differ in kind: (a) is picked up by re-landing, (e) is a file
somebody meant to change. A file recorded under `enforcement.kept_files` is
**skipped** — reporting it every run would re-accuse the user of a settled
decision. **No lockfile at all reports `not checked — no lockfile`**, counted as
neither a pass nor a drift row: a repo that landed nothing cannot have drifted
from a record that does not exist, and (a) already reports the absent lockfile.

**(f) The two marked positions beside `REPO_NAME`.** `MERGE_MODEL` absent from
`.config/mise.toml`'s env block, or holding anything but `direct` or `pr`, is
one drift row — the merge tasks fall back to `direct`, so what breaks is quiet,
not loud. `MEMBERS` absent **or empty** on a product reading
`topology:
multi-repo` with `linkage: siblings` is one drift row; empty is
correct under submodule linkage and in a single-project repo, so the row is
never raised outside siblings.

Both are `drift`, neither is blocking, and both carry the same one remedy,
`/vwf:setup reshape`. Doctor still writes none of it — no branch, no key, no
scope, and no pack-owned file. `/vwf:setup`'s Step 0 cites all six by reference
and restates none of them, so the two can never drift apart.

### Ruled at the fixture gate — 2026-09-12

Two rulings landed after the rest of this decision was written, when the
95octane dry-run was read against it. Both are the user's, made at that gate.

**The sidecar is derived from what the old helper *defines*.** The original
wording derived it from what the repo's tasks *call*, and the dry-run showed
what that costs: four helper functions nothing called yet, which the byte-for-
byte replace would have removed with nothing in the plan saying so. A helper
nothing calls today is still a helper somebody wrote. So the list became every
function the repo's old helper file **defines**, minus the names the pack's
library defines, minus the left-hand names of the legacy table. Deriving from
definitions is a strict superset of deriving from calls, so the change can only
carry more across, never less, and everything else about the sidecar stands
unchanged. One case a definition list cannot see stays where it was: a call to a
name no file defines anywhere is still flagged, not moved — there is no body.

**Two or more repo files resolving to one destination is a collision, and the
pack owns the destination.** A repo carrying two or more retired names the
legacy table maps to the same current one has several files wanting a path only
one can occupy, and *the last rename wins* is a guess made silently at apply
time. 95octane is the case in hand: `setup/pnpm/upgrade` and `setup/deps/update`
both resolve to `setup:deps:upgrade`, which the pack ships. The ruling: the
destination is treated as **pack-owned** — the pack's file lands there as an
ordinary create, and each contending repo file becomes one replace-or-keep row
instead, listed under the path it occupies now, with **no rename row for
either**. The default on each is read from that file's own content, replace
where it references a retired name and keep otherwise, since two files
contending for a path says nothing about what is inside either of them. The path
then has exactly one writer, every contending file still gets its own decision
in the single plan, and nothing is applied on a guess.

The scope is narrow and deliberately so: a **single** rename whose destination a
landed pack ships is the ordinary case, handled by the rename, sidecar and
missing-files passes as they already were, and nothing here touches it.

**This ruling is not in the manual, by choice.** It is a determinacy rule for a
shape a handful of repos will ever hit, and stating it in the user-facing pages
would cost every reader attention for a case almost none of them has. The record
is here; the behaviour is in `init`'s own reference.

## The counts that moved

`init`'s existing-repo survey is **eleven** passes; its plan is **ten** counted
sections (`Offered (replace / keep)` and `Repo-owned, kept` joining the eight);
its report is **ten** file sections (`Files kept` and `Tasks kept` joining the
eight). The plan's single total counts **only what would be applied**, so an
offered row decided *keep* and the whole repo-owned list sit outside it — a repo
whose only rows are files it owns and files it chose to keep is shaped, and
saying otherwise every run is how a user stops reading the plan.

Idempotence holds from both ends: a replaced file is byte-identical next time, a
kept one is recorded, so neither is offered twice; and the sidecar's functions
are no longer unmapped names in a library that lacks them, but definitions in a
file the repo owns.

## The alternatives rejected

- **Merge the unmapped functions into the pack's helper library.** That makes
  one repo's private printer everybody's API, and the pack would grow a row per
  incident.
- **Keep deferring the unmapped call.** It is the behaviour the user named as
  the defect: a reshape that breaks a working task and files the breakage under
  *Deferred*.
- **A calls-only sidecar, with an uncalled function left to the replace** — or
  listed as `Deferred`. The first loses a body with nothing in the plan saying
  so; the second reports a loss it could simply have prevented, since the body
  is in hand.
- **Resolve a rename collision by letting the first table row win**, or by
  flagging the whole thing `Deferred` and applying nothing. The first is the
  silent guess the ruling exists to refuse; the second strands a repo on a shape
  the pipeline can decide, since the pack already owns the destination.
- **Move or rename a repo-only task automatically.** The contract can detect
  that a name is not one of its own; it cannot infer intent. `init` lists and
  notes; the user moves, in a commit of their own.
- **Always replace a diverged pack file**, or **never overwrite one**. The first
  discards deliberate edits silently; the second is the hole being closed.
- **Record a keep under `enforcement.rules`** as a settled decline, keyed
  `init/kept-file/<path>`. Rejected at the ruling: the three catalogued
  namespaces each resolve to a shipped catalog, and `/vwf:architecture` checks
  that every entry names a known rule — a path names none. The bump was the
  honest answer.
- **Park the key in its own `config_format` plan.** The plan blocked on the
  record either way, so deferring it would have shipped `init` writing a
  decision it had nowhere to put.
- **Have doctor re-read the pack's bytes through the adapter**, the way
  predicate (a) reaches a pack's version. That route reaches only the
  *installed* version, so a repo one pack version behind would be misreported as
  a local edit. The lockfile's recorded hash is the content at the version this
  repo locked, which is the question (e) actually asks.
