# Decision — `init` adopts a brownfield task library, and `doctor` keeps it relevant

**Date** 2026-09-12 · **Branch** `2026-09-12-init-brownfield` · **Plan**
[`docs/plans/2026-09-12-init-brownfield/`](../../plans/2026-09-12-init-brownfield/index.md)
· **Reverses** two standing rules of `init`'s existing-repo pipeline — the
2026-09-10 helper decision's *unmapped call is deferred*, and the missing-files
pass's *already owned, never overwritten*

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

Every function the repo's tasks call that the pack's library does not define and
the table does not map is carried, **whole and text-unchanged**, out of the
repo's old helper file and into `_scripts/local` — repo-owned, shipped and
declared by no pack, and the one file `init` writes that no pack marked. Each
calling task gains a single `source` line for it directly after its existing
source of the helper library, spelled the way that line already spells it. The
plan carries one create for the sidecar, sub-lined per function moved, and one
rewrite per calling task. A repo that already has the sidecar gets what it lacks
appended, never duplicated. **Nothing is deferred on this account** — the one
remaining flag is a call to a function nothing defines anywhere, which was a
broken call before the run began and has no body to move.

The order is load-bearing: the sidecar is written **before** the helper file is
replaced, because the bodies it copies exist in the tree only until the replace
lands.

### Repo-only tasks — kept, listed, and noted at most

A task file under the library that no landed pack ships is the repo's own. It is
listed under `Repo-owned, kept` and **touched by nothing**: `init` does not move
it, does not rename it and does not fold it into a group of its own choosing. A
repo that wrote a task wrote it for a reason this run cannot read.

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

Every such file is compared byte for byte once the renames are accounted for.
Identical needs nothing. Different becomes one `Offered (replace / keep)` row in
the **same single plan**, carrying a fixed three-line summary — what the repo's
version adds, what it lacks, whether it references a retired name — and the
default `init` computed: **replace** where the repo's file references any
left-hand name of the legacy table, **keep** everywhere else. A file naming a
retired thing is written against a vocabulary the library no longer has, and
keeping it keeps the breakage; a file that differs only by deliberate edits is a
decision, and the default respects it.

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
are no longer unmapped calls into a library that lacks them, but calls into a
file the repo owns.

## The alternatives rejected

- **Merge the unmapped functions into the pack's helper library.** That makes
  one repo's private printer everybody's API, and the pack would grow a row per
  incident.
- **Keep deferring the unmapped call.** It is the behaviour the user named as
  the defect: a reshape that breaks a working task and files the breakage under
  *Deferred*.
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
