# The Existing-Repo Pipeline

Read this in mode **existing** — a target that already has a configuration
directory or a task library. Something shaped this repo before, and the job is
to reconcile it against what the packs ship without discarding a decision
somebody made on purpose.

Three phases, in order and never interleaved: **survey**, **plan**, **apply**.
The survey writes nothing. The plan is one document. The apply touches only
what the survey listed.

## Survey

Read-only, and exhaustive before anything is printed. Eleven passes.

### 1 — Root files against the allowlist

The hygiene doctrine closes the repository root to a fixed set, and the
materializer enforces it as a ceiling. Every other configuration file at the
root is a **move** into the configuration directory.

**Derive the rename map from the packs' own `config/` trees**, never from a
list written here. For each landed or landable pack, the path its `config/`
tree declares *is* the destination — a root file whose basename matches one of
those declarations moves to where the pack puts it. That is what keeps this
pass correct when a pack changes where its config lives; a hardcoded map here
would go stale silently, which is the failure mode the whole tier exists to
avoid.

A root file matching **no** pack declaration and **not** on the allowlist is
**reported, not moved**. It belongs to something outside this toolkit, and
guessing a destination for it is how a tool stops finding its own config.

#### The move-and-shim case

One shape needs saying because a naive move breaks it. Where a gate pack
declares **both** a file in the configuration directory *and* a file of the
same basename at the root — the root one being a two-line stand-in that does
nothing but point at the other — the root file is not a config that failed to
move. It is the pack's answer to a tool whose config discovery is root-only
and cannot be redirected.

So: a **real** configuration file of that basename at the root moves to where
the pack's `config/` tree declares it, exactly as pass 1 says, and the pack's
stand-in takes its place at the root. Record it as a **rename** row plus the
create the stand-in already is, and say in the plan that the settings survive
the move — they are read through the stand-in.

**Not every key survives it, though, and the pack says which.** A gate pack
that ships a stand-in states, in its own skill, what the file it points at may
not carry: at least one key is *not inherited* through the pointing mechanism,
and an extended file declaring it is a fatal config diagnostic — so every bare
invocation of that tool fails, not only the one that reads the moved config.
Read that pack's skill for which key and why; it is the authority, and this
file names neither the tool nor the key on purpose. The move **drops** the
key, and the plan says so as its own line.

Dropping it **widens** what the gate covers, which is the other half of the
same trap: with the key gone, the pack's own pinned plugin list defines the
file set, so files the repo had kept out of the gate by omission now enter it.
The survey re-derives the covered set after the drop, the plan lists every
file that newly enters, and each is narrowed away with an **exclusion** —
never by restoring the dropped key, which puts the fatal diagnostic back.

Tell the two apart by content, never by name: the pack's stand-in is the file
the pack ships, byte for byte, and the survey has that file in hand. Anything
else of that basename is the repo's own and is the thing being moved.

### 2 — The readme

`README.md` → `readme.md`, as a move. **Content untouched** — this is a
rename, and every word in the file survives it. A repo already carrying
`readme.md` needs nothing; a repo carrying both is reported as a conflict for
the user rather than resolved here.

### 3 — Task names against the legacy table

The toolchain pack's task-library reference carries a **Legacy names** table —
each row a name this contract replaced and what it became. Read that table and
match every task file in the library against its left-hand column. Each hit is
a **rename**, `old → new`, with the destination path the new name implies.

The table lives in the pack, not here, and that is the point: the renaming is
a fact about the task library, so vwf's prose never has to carry a name it
would otherwise have to keep in sync.

Rename the **callers** too. A renamed task that something still invokes under
its old name is a broken repo that passes every check, so scan the task files,
the manager's configuration layers, the gate configuration and any shell
aliases for the old spelling and list each occurrence as its own rename line.

### 4 — Shebangs

Every shipped task file is bash. A task file whose shebang names a different
shell is **flagged for rewrite and never rewritten**: report the file, and
report the shell-specific syntax it uses — the constructs that would not
survive a mechanical translation — so the user can rewrite it deliberately.
Auto-translating a shell script is how a working task becomes a subtly broken
one, and the breakage surfaces in whatever that task was protecting. The one
mechanical rewrite `init` does apply is pass 5's, and it applies for the
reason this rule refuses: what it maps is written down in a table the pack
owns, not translated by `init` on the spot.

### 5 — The helper library

The shared helper file's name lost its leading underscore, and so did its
siblings — the legacy table says so in its own rows. That is two renames, not
one: the **file**, and every `source` line naming it. A repo that renames the
file and not the sources has a task library where every task fails on its
first line. List both.

Then **compare the file's content**, under its new name, against the one the
toolchain pack ships — byte for byte, the same way pass 1 tells the pack's
stand-in from the repo's own. Identical, and the pass ends here. Different,
and the repo's file is a **diverged copy** of the library every pack script
is written against: the tasks pass 6 would create call into it by name, and a
name this copy never defined fails the moment that task first prints.

So the plan carries a **replace** row for the helper file — the pack's file
over the repo's, applied on the same one consent as everything else — with a
**sub-line for every function the repo's copy defines and the pack's does
not**. Those are the retired names, and listing them is what lets the user
read what disappears before saying yes rather than after.

Each retired name then becomes **rewrite** rows: one per call site in a
repo-owned task file, `old → new` at `file:line`, the new name read from the
**Legacy names** table in the toolchain pack's task-library reference — the
same table pass 3 reads for task names, and the pack's for the same reason.
The mapping is a fact about that library, so vwf's prose carries none of it.
A rewrite replaces one token in place; nothing else on the line changes.

A call the table carries **no row for** is neither deferred nor guessed at:
the function **moves**. Every function the repo's own tasks call that the
pack's library does not define and the table does not map is carried, whole,
into `_scripts/local` — a repo-owned sidecar beside the pack's library, and
the one file in that directory no pack ships, no pack declares and `init`
never replaces.

**This reverses one line of a standing decision and leaves the rest of it
standing.** The helper file is still replaced byte for byte, and a mapped
call is still rewritten only through the pack's table — that is unchanged.
What changes is the unmapped call: *move them to a repo-owned
`_scripts/local` sidecar*, rather than defer them. A name the table never
grew a row for is usually a function this repo wrote for itself, and
deferring it breaks a task the repo already had, for the sake of a name the
pack was never going to define.

**Derive the list, then extract it verbatim.** The list is every function
name the repo's task files call, minus the names the pack's library defines,
minus the left-hand names of the legacy table. For each name left, copy its
**whole body** out of the repo's file as it stands before the replace, text
unchanged — `init` moves a definition it already has in hand and authors
nothing. A name on that list that the repo's file does not define either was
a broken call before this run began: it goes to **Rewrites (flagged, not
applied)** with its file and its line, since there is no body to move and no
row to rewrite it by.

Three kinds of row carry the move into the plan:

- one **create** for `_scripts/local`, sub-lined with one row per function
  moved into it, each named — on a repo that already has the sidecar it is a
  **rewrite** of that file instead, and the functions it lacks are added at
  the end of it. A function it already defines under the same name is left
  alone; nothing is ever written into that file twice.
- one **rewrite** per task file that calls any of them, adding a single
  `source` line for the sidecar directly after that file's existing `source`
  of the helper library — spelled the way that line already spells the
  library's path, so the sidecar is reached exactly the way the library is. A
  task already sourcing it gains no second line.
- nothing in **Deferred**. Nothing is deferred on this account.

A pack-owned task file the repo already carries byte for byte is untouched by
any of this, and so is every file pass 6 creates: both are written against
the pack's library already.

### 6 — Missing files

Diff the repo against what the three baseline bundles ship. Every file a
bundle declares and the repo lacks is a **create**, listed with the bundle it
comes from.

A file the repo *has* and a pack also owns is **compared**, byte for byte,
once pass 3's renames are accounted for. Identical, and it needs nothing.
Different, and it is **offered** — one row, two outcomes, both decided in the
plan and applied on the same single consent:

- **replace** — the pack's file lands over the repo's, and every marked
  position that file carries is then filled from the confirmed answers to
  SKILL.md's questions, exactly as [new repo](new-repo.md) §The marked
  positions fills them on a fresh landing. That is what makes a replace safe
  on a file whose positions the repo had already filled: they are re-filled,
  not lost.
- **keep** — the file is untouched and the decision is recorded, so doctor
  does not report it again and the next reshape does not re-offer it.

**The default is replace where the repo's file references any left-hand name
of the pack's legacy table**, and keep everywhere else. A file naming a
retired thing is a file written against a vocabulary the library no longer
has, and keeping it keeps the breakage; a file that differs only by edits
somebody made on purpose is a decision, and the default respects it.

Each offered row carries a **three-line summary**, and the three lines are
fixed: what the repo's version has that the pack's does not, what it lacks
that the pack's has, and whether it references a retired name. Three lines
are what a reader needs to flip a default. A full diff is what the adapter's
own re-sync command is for — `init` still names that command and never
invokes it, and it stays the way to review a file this run leaves alone.

**This reverses the rule that stood here.** A pack-owned file the repo
already had was *already owned* and was written to under no circumstance,
deferred whole to that user-run command. It read as a safe default and was a
hole instead: a diverged pack file was never reconciled, so the marked
positions inside it were never reached, and a repo drifted from the library
one file at a time with nothing reporting it. The per-file offer closes the
hole and keeps the single consent.

**Recording a kept file.** A keep is a settled decline, and it is recorded in
`.config/vwf.yaml` under **`enforcement.kept_files`** — a map of
`<path>: { reason: <one line> }`, each path spelled the way the
materializer's lockfile names that file. A path recorded there is not offered
again by a later run, and `/vwf:doctor` reads the same record to skip the
file. The reason travels with it, in the user's own words where they gave
one.

**That key is the one thing `init` writes into `.config/vwf.yaml`, and `init`
never creates the file.** The entry is written under the same single consent
as everything else, merged into whatever the block already holds, and an
absent `kept_files` block reads as empty. On a repo `/vwf:setup` has not
reached there is no file to write into: the keep still applies — the file is
left untouched — and the *record* becomes a **Deferred** line whose unlock is
*run `/vwf:setup`, then `/vwf:setup reshape`*.

**The helper library is the one file this pass never offers.** Every task
file created here sources that library, so a kept copy missing a function the
created scripts call is a repo that fails on its first print — a breakage
this run causes and a later, user-run command would be too late to prevent.
Pass 5 compares it and plans its replacement unconditionally: there is no
keep row for it, and its retired names leave through pass 5's rewrites and
its sidecar rather than through this pass's offer.

### 7 — Fragments and sections

- **Hook fragments** — for every landed pack that ships one, whether the gate
  configuration already carries its marked block. A missing one is a merge.
- **Ignore sections** — for every stack the materializer's lockfile records,
  whether the ignore file already carries that section's banner. A missing one
  is an append.

Both are detailed in [fragments and sections](fragments-and-sections.md).

### 8 — Commit types

The commit-message gate's configuration carries a closed set of ten types. Any
type present in the repo's configuration and outside that set is a **rename**,
mapped:

| Was                                                 | Is now       |
| --------------------------------------------------- | ------------ |
| `chore`, `build`, `ci`, `deps`, `config`, `release` | → `ops`      |
| `style`                                             | → `refactor` |
| `spec`, `blueprint`                                 | → `docs`     |
| `add`                                               | → `feat`     |

This maps the **configuration**, not the history. Commits already written keep
their words; rewriting history to match a config change is never something
this command does.

### 9 — Per-project groups

Resolve the project ids the way [new repo](new-repo.md) §7 does — resolution
order, then slugification — and treat what comes out as the **proposal** it is.
SKILL.md's **question 2** shows every row with its source and takes a
replacement, and it is asked before the plan is printed, so no row below is ever
computed against an id the user is about to change. The ids this pass compares
against are the **confirmed** ones.

A per-project task group whose segment is **not** one of those ids is a
**rename**, listed with the proposed destination — the group was named for
something other than a project, and the segment is what tells a reader which
thing a task acts on.

**Say which kind of rename it is.** There are two, and calling them the same
thing misleads:

- The group's segment is the value a **previous id source** resolved to — the
  repo's own name, or a directory — and the id now resolves from the
  registry. The row reads
  `id source changed: <old> → <new> (repo name → registry)`, naming both
  sources. Nothing moved and nothing was wrong; the repo grew a registry
  between the two runs, which is exactly what the re-run doctrine expects.
- The segment matches no id under any source. That is an ordinary rename, and
  the row says so.

**A customised id is neither.** Where question 2 took a replacement, the
**confirmed** slug is what a group's segment is compared against — never the
value the resolution order would have proposed on its own. A user who renamed
an id once, and confirms the same replacement on the next run, sees no row at
all: an id somebody chose is not drift, and reporting it as a rename every run
is how a deliberate choice gets undone by a plan the user approves in a hurry.

Never report either as a pack having moved. A pack that moved is the
adapter's re-sync command's business and produces a different kind of row
entirely.

Groups that already match need nothing, and a project id with no group at all
gets its `_default` slot as a create.

The other marked positions of that same id list — the bootstrap aggregator's
member flags, the shell aliases, and the repo-name key — are checked in the
same pass. A position still carrying only the pack's commented template, on a
repo that **has** members, is a create; one already carrying the right lines
needs nothing. The repo-name key is a create wherever it still holds the
pack's placeholder.

The environment block's other two positions are checked here too, and they are
not the same kind of wait:

- **`MEMBERS`** is a create on a repo whose registry declares
  **sibling** members and whose position still carries the pack's shipped
  default — that is the one shape where the task library has no other source
  for them. Under submodule linkage, and on a single-project repo, it is
  correct as shipped and produces no row.
- **`MERGE_MODEL` is never a create.** Unfilled means the shipped
  value, which is the local one, and that is a working repo rather than a hole
  — report it in the plan as *unfilled, defaults to `direct`* and leave it
  alone. The git pass asks the question; a survey pass does not pre-empt it.

The plugin task's **two lists** are checked in the same pass, against the
confirmed answer to SKILL.md's **question 5** — which is asked on an existing
repo too, seeded by the same inventory the new-repo path uses, and with the
same two rows dropped from it: the workflow's own plugin and whatever it
depends on are the task's unconditional business and are never offered, so
they never reach either position. A repo that already carries one of them at a
position is a **rewrite** that removes it, and the plan says why:

- A position still carrying **only** the pack's commented template, on a repo
  whose answer was non-empty, is a **create**.
- A position already carrying rows is **compared** with the confirmed answer,
  row for row. Any difference — a row gained, a row lost, a row respelled — is
  a **rewrite**, and the plan lists the rows on both sides, because this is
  the one position whose existing content a user may have hand-edited and the
  plan is where they get to see that before consenting.
- Identical rows need nothing, and a **none** answer against a position that
  still holds only the template produces no row either.

**A plugin task that differs from the pack's byte for byte** is one of §6's
offered files, and the offer is how its positions are reached at all. Offered
**replace**, the pack's file lands and this pass fills both positions on it
from question 5's confirmed answer, as a create. Offered **keep**, the file
stays as the repo has it and neither position is touched: a kept file is kept
whole, and writing into a position of a file somebody chose to keep is the
overwrite the keep declined. The plan says which of the two each position's
row is waiting on, so the two rows read as one decision rather than as a
contradiction.

### 10 — Repo-only tasks

Every task file in the library that **no landed pack ships** is the repo's
own. List each one as **repo-owned, kept**, and touch none of them: `init`
does not move a repo's task, does not rename it and does not fold it into a
group of its own choosing. A repo that wrote a task wrote it for a reason
this run cannot read.

Derive the set the way pass 6 derives its creates — the paths the three
baseline bundles declare, plus the secrets provider's — and take every task
file the library carries that the set does not name. `_scripts/local` is
never among them: it is pass 5's, and listing it twice reads as two files.

**One shape earns a note, and a note is all it earns.** A repo-owned task in
the `setup/` or `code/` group whose name the task-library contract's
**mandatory set** does not carry is reported with one line: those two groups
are the contract's, reserved for the set it ships, and a task the contract
does not name belongs in this repo's own per-project group unless it is a
gate every project shares. The user moves it, in a commit of their own, or
leaves it where it is — both are legitimate and neither is `init`'s to
decide.

The note goes in the plan and in the report, never as a rename row. A rename
here would be exactly the guess the shebang pass refuses: the contract can
say that a name is not one of its own, and cannot say what the repo meant by
it.

### 11 — The gate-config fills

Two positions the commit gate's packs ship **marked, with a comment saying
`init` fills them once the thing they read exists**. They are not the same
kind of wait, and the shipped comments say which is which:

- **The scope list is re-run work by construction.** Its source is the
  registry, which does not exist when `init` first shapes a repo, so the empty
  list a first run leaves is the correct state and not an unfinished one.
- **The forge links fill on *any* run where the repo has a remote** — the
  first one included, since a cloned or already-pushed repo has one from the
  start. Only a repo with no remote yet keeps them as shipped, and the next
  run after the remote is added fills them. They ship **commented out**, so
  filling them means uncommenting them too; a filled line left commented is
  the same as no link.

| The fill        | Its source                                                     | Fillable                | When it stays as shipped                       |
| --------------- | -------------------------------------------------------------- | ----------------------- | ---------------------------------------------- |
| commit scopes   | the project ids of pass 9, from the registry                   | on a re-run only        | no `.config/vwf.yaml`, or it names no projects |
| the forge links | the origin remote's URL, read with `git remote get-url origin` | on any run with a remote | no origin remote                               |

Rules for both:

- **The registry is the only scope source.** Ids resolved from directories or
  from the repo's own name are not scopes — a scope names a project somebody
  declared, and a directory that happens to exist is not a declaration. Where
  the registry is absent, leave the position exactly as the pack ships it,
  and say in the plan that the fill is waiting on `/vwf:architecture` and
  `/vwf:setup`.
- **Never delete the comment.** It is what a later run reads to find the
  position, and it is the record of where the values came from.
- **Each fill is its own plan row**, `+ <what>` with its source named, so the
  user sees a config being completed rather than a file quietly changing.
- The exact spelling of both positions — the key names, the value shape — is
  the packs', read from the shipped file in place. Nothing here re-spells it.

## Plan

One document, printed once, in ten sections. Each section opens with its
count; each line is `old → new` for anything that moves or is renamed, `+
path` for anything created, and a bare path with its reason for anything
flagged. Print an empty section as `none` rather than omitting it — a missing
section reads as an oversight, and the reader cannot tell which.

A move-and-shim row carries **sub-lines**: one for the key the move drops from
the real configuration, and one for each exclusion the drop makes necessary,
naming the files that exclusion keeps out of the gate. Both are changes to the
settings the row claims survive the move, so the user reads them before the
one consent rather than finding them in the report.

A **replace** row carries sub-lines on the same principle: one for each
function that disappears with the file being overwritten. The
`_scripts/local` row carries them too — one per function moved into the
sidecar, named, so the two lists are read side by side and every retired
function is accounted for in exactly one of them. Every **rewrite** row is
`old → new` at `file:line` — one row per call site, never one per name — so
the user counts the call sites before the one consent as plainly as the
files.

An **offered** row is the only kind with a decision in it. Each carries the
path, the three-line summary of pass 6, and a **replace / keep** column
showing the default that pass computed — and each is a row the user may flip
at the consent step below before answering. `Repo-owned, kept` is a list and
nothing else: paths, with the contract note of pass 10 on the rows that earn
one, and nothing in it is ever applied.

```text
Moves        <n>
Creates      <n>
Replaces     <n>
Offered (replace / keep)         <n>
Renames      <n>
Rewrites (applied)               <n>
Rewrites (flagged, not applied)  <n>
Repo-owned, kept                 <n>
Appends      <n>
Merges       <n>
```

Close with a single total, **counting only what would be applied** —
`Repo-owned, kept` is outside it, and so is an offered row whose decision is
keep. A plan whose total is **zero** is the idempotent case: say the repo is
already shaped, print the report with those two lists still in it, and stop
without asking anything. A repo whose only rows are files it owns and files
it decided to keep is shaped, and saying otherwise every run is how a user
stops reading the plan.

## Consent

**One question, two answers**: apply all of it, or stop. Not per file, not per
section. The plan is a coherent reshaping — half of it applied leaves a repo
where the task names moved and their callers did not, which is worse than
either end state.

**Flipping an offered row is an amendment to the plan, not a third answer.**
Each row of `Offered (replace / keep)` arrives carrying the default pass 6
computed, and before answering the user may name any of them and flip it.
Doing so re-prints the whole plan with the new decisions in place, and the
same one question follows it. So the consent stays single — one yes over one
document — and the decision a user disagrees with is still theirs to change
without answering twice about the rest. `init` never walks the rows asking.

A stop is a clean exit. Print the plan again as the record of what was not
done, and name `/vwf:setup reshape` as the way to revisit it. A flipped
default is not recorded anywhere by a stop: nothing was applied, so the next
run computes its defaults afresh.

## Apply

In the plan's own order, and touching **nothing** the survey did not list.

- **Moves** use `git mv`, so the rename is in the index and the history
  follows the file. The readme move is a move like any other.
- **Creates** are the materializer's, by fixed slug, exactly as the new-repo
  pipeline fetches them. `init` never authors pack-owned content from
  scratch. It does fill the positions a pack **marked** for it — the member
  flags, the shell aliases and the per-project slots of
  [new repo](new-repo.md) §7 — and those are creates like any other, listed
  in the plan and applied here. `_scripts/local` is the one create that is
  neither: no pack declares it, and every byte in it is carried out of the
  repo's own helper file by pass 5. **Write it before that file is
  replaced** — the bodies it holds exist in the tree only until the replace
  lands, and a sidecar written afterwards has nothing to copy from.
- **Replaced files land before the positions are filled**, and the order is
  load-bearing. A marked position is filled *in the file that will still be
  there afterwards* — fill first and the replace overwrites the fill, which
  is the quiet way a run reports work it did not do. So: every replace and
  every accepted **offered** row lands, and only then does the fill pass of
  §9 and §11 run over the tree.
- **A kept file is not written to, at all.** The keep itself needs no write;
  only its **record** does, and the offered row's keep outcome is what lists
  it. Write that record **after every keep is settled and before the fill
  pass** — one `enforcement.kept_files.<path>: { reason }` entry per kept
  file in `.config/vwf.yaml`, merged into the block rather than replacing it.
  Where that file does not exist, `init` does **not** create it: the keep
  stands and the record is the **Deferred** line §6 describes. Nothing about
  a kept file is applied here beyond leaving it alone.
- **Renames** rewrite the path for a task file, and rewrite the **text** for
  every caller. Use the editing tools for those rewrites — a stream editor's
  in-place flag is not portable across platforms, and the difference is a
  silent no-op or a stray backup file rather than an error.
- **Config-path rewrites** are the same act: a task or hook passing a
  configuration path that just moved needs the new path, and each one was
  listed as its own rename line.
- **Flagged rewrites are not applied.** They are in the report so the user can
  do them.
- **Appends and merges** run last, per
  [fragments and sections](fragments-and-sections.md), because both are
  idempotent and both read files the earlier steps may have moved.

### The gate configuration commits first, alone

An existing repo may already have its hooks wired, and that changes the order
of what follows. The commit gate reads its configuration from the working
tree, and a configuration file that is **modified but unstaged** aborts every
commit — including the one that would have staged it. So a run that touched
the gate's configuration has to close that file before it can commit anything
else.

Where this run wrote, merged into or moved any of: the gate's configuration
file, the commit-message gate's configuration, or anything under the fragment
directory — stage **those paths only** and commit them first, on their own,
with the fixed message:

```text
ops: update the pre-commit configuration
```

They travel together because they are one change: the fragment merge is what
the gate config's marked blocks hold, and the commit-message gate's
configuration is what the gate config invokes. Splitting them leaves a commit
whose hooks read a file the next commit is still going to change.

Then the rest, exactly as the new-repo pipeline's **git pass** describes it
([new repo](new-repo.md) §11): the landing-model question, stage what this run
wrote, one consent with three answers, the fixed shaping message, the branches,
the push. Two differences, both from the fact that this repo already
existed:

- The first commit here is **not** before hook wiring. That is why the gate
  configuration went first: with the hooks live, the commit above is what
  makes the tree committable, and the shaping commit then runs through hooks
  that read a settled configuration.
- The branch table's first row cannot apply — this repo has commits. Create
  `develop` from `main` where `develop` is missing, `main` from `develop`
  where `main` is missing, and nothing where both exist. Nothing after that
  touches the remote's settings on this pipeline either.

## Report

The ten-section report and the two next-step lines from SKILL.md, filled from
what was actually applied rather than from what was planned. A deferred
materialization, a flagged rewrite, a call to a function nothing defines, a
kept-file record on a repo that has no `.config/vwf.yaml` yet, and a
reported-but-unmoved root file all belong in **Deferred**, each with its
unlock. A call the legacy table could not map is **not** among them any more:
pass 5 moves its function to the sidecar, and the run reports the move.

`Files kept` names each offered file the user kept, with the reason recorded
beside it, and `Tasks kept` lists every repo-owned task pass 10 found — with
the contract note on the rows in the `setup/` or `code/` group whose name the
mandatory set does not carry. Both are sections of things this run
deliberately did **not** touch, which is exactly why they are printed: a file
left alone silently reads the same as a file nobody looked at.

**The invariant, stated in the report itself, and stated with its scope:**
running `init` again on a shaped repo produces an empty plan **for the same id
source**. If a second run finds work, it is one of three things, and the report
names which: the first run deferred something; a pack moved, which the
adapter's re-sync command is for; or the **id source changed** — the repo grew
a registry, so ids that came from directories or from the repo's own name now
come from declarations, and pass 9's rename rows say so in those words.

A **replace is applied once**, and that is part of the same invariant: the
second run reads a file byte-identical to the pack's, plans no row for it,
and rewrites no call — the names it would have mapped are gone from the tree.
An **offer is made once** for the same reason, from either end: a replaced
file is identical to the pack's next time, and a kept one is recorded, so
neither is offered again. The sidecar holds by the same rule — its functions
are no longer unmapped calls into a library that lacks them, they are calls
into a file the repo now owns.

The third is not a broken invariant. It is the re-run doctrine working: `init`
is meant to be run again as the repo learns things about itself, and the
registry is the largest thing it learns.
