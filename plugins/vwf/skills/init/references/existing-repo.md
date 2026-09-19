# The Existing-Repo Pipeline

Read this in mode **existing** — a target that already has a configuration
directory or a task library. Something shaped this repo before, and the job is
to reconcile it against what the packs ship without discarding a decision
somebody made on purpose.

Three phases, in order and never interleaved: **survey**, **plan**, **apply**.
The survey writes nothing. The plan is one document. The apply touches only
what the survey listed.

**All three run across the resolved repo set, not across one repo.** The survey
runs its eleven passes **in each repo** that resolved to mode existing. The plan
is still one document, printed once, with **one section per repo** — the base
first, then each member in resolved order. The apply touches the repos in
**members-then-base order**, so the base's gitlinks are current by the time it
commits. A repo of the set that resolved to mode new takes the
[new repo](new-repo.md) pipeline in its own section of that same document, under
the same one consent; nothing about the set changes which pipeline a repo reads.

## Survey

Read-only, and exhaustive before anything is printed. Eleven passes, and they
run **per repo**: every pass below reads, and reports on, the repo it is
running in and no other. Where a pass needs something only the base carries,
it says so.

**An absent member is surveyed once its clone has run.** A member the resolution
found and this machine does not have has nothing on disk to read, so its section
opens with a **clone row** — the command the membership asset names for this
product's linkage (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`, *An absent
member*) — followed by the words *surveyed after the clone*. At apply time that
member's clone runs first, then the eleven passes run inside it, then its rows
print, and only then does its own apply proceed. **Nothing is written into an
absent member before its survey has run**, which is the same rule every other
repo gets — the survey is simply later in the wall clock, not skipped.

### 1 — Root files against the allowlist

The hygiene doctrine closes a repository root to a fixed set, and the
materializer enforces it as a ceiling. The root this pass reads is **the root of
the repo it is running in** — a member's own root, surveyed against the same
ceiling as the base's — and what it reads there is every **entry**: files and
directories alike, never files only. A directory at the root sits under the same
ceiling a file does, which is why the exemptions below have to name directories
by hand. Every other configuration file at that root is a **move** into that
repo's configuration directory.

**Derive the rename map from the packs' own `config/` trees**, never from a
list written here. For each landed or landable pack, the path its `config/`
tree declares *is* the destination — a root file whose basename matches one of
those declarations moves to where the pack puts it. That is what keeps this
pass correct when a pack changes where its config lives; a hardcoded map here
would go stale silently, which is the failure mode the whole tier exists to
avoid.

A root **entry** matching **no** pack declaration and **not** on the allowlist
is **reported, not moved**. It belongs to something outside this toolkit, and
guessing a destination for it is how a tool stops finding its own config.

**Four kinds of root entry are recognised and never listed at all**, and no
run reports any of them:

- **`.gitmodules`** — git's own file, on the same footing as `.git/`. It is not
  configuration this toolkit places, it cannot be moved without breaking the
  repository, and **every base repo with submodule members carries one**, so
  reporting it would put a permanent finding in the plan of exactly the products
  this pipeline now walks.
- **The editor directory the fragment convention names** — `init` composes it
  itself, out of the editor fragments the packs ship, per
  [fragments and sections](fragments-and-sections.md). A directory this run
  writes is not a stray a later pass discovers. The convention names it; this
  file does not.
- **`.claude/`** — the materializer's lockfile home, and a directory **this
  run writes**, exactly like the editor one. Every shaped repo carries it by
  definition: it is the evidence a later run reads to know the repo is shaped
  at all, so a pass that listed it would report the shape as a breach of the
  shape.
- **Every resolved member path**, in the base — a member's work tree is a
  directory at the base's root, and it is another repository, surveyed and
  shaped in its own section of this same plan. There is no configuration
  directory to move it into and nothing at the base to reconcile it against.
  The paths come from the resolution that SKILL.md's Step 0 already ran, so
  this pass has them in hand rather than guessing at a directory's nature.

None of them is a hole in the allowlist and none is patched by editing it: the
allowlist names what a **pack may land**, and all four sit outside that
question — one is git's, two are this command's own output, and the fourth is
a repository of its own.

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

**Two or more of the repo's own files can resolve to one destination path**,
and the plan has to stay determinate when they do. A repo carrying two
retired names the table maps to the same current one has two files wanting a
path only one file can occupy, and "the last rename wins" is a guess made
silently at apply time. That is the collision, and it is the only one: a
**single** rename whose destination a landed pack ships is the ordinary case
— the rename lands and passes 5 and 6 compare what arrives — and nothing here
applies to it.

Where two or more do contend, the destination is treated as what it is,
**pack-owned**: the pack's file lands there as pass 6's **create**, and each
contending repo file becomes one of pass 6's **replace-or-keep** rows
instead, listed under the path it occupies now, with **no rename row for
either**. The default on each is pass 6's own, read from that file's content
— replace where it references a left-hand name of the legacy table, keep
otherwise — since two files contending for a path says nothing about what is
inside either of them. That way the path has exactly one writer, every
contending file still gets its own decision in the plan, and nothing is
applied on a guess.

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
not**. Those are the names that leave the file, and listing them is what lets
the user read what leaves before saying yes rather than after. Each one
leaves by a route this pass names: a rewrite through the legacy table, or a
body carried into the sidecar below.

Each retired name then becomes **rewrite** rows: one per call site in a
repo-owned task file, `old → new` at `file:line`, the new name read from the
**Legacy names** table in the toolchain pack's task-library reference — the
same table pass 3 reads for task names, and the pack's for the same reason.
The mapping is a fact about that library, so vwf's prose carries none of it.
A rewrite replaces one token in place; nothing else on the line changes.

A function the table carries **no row for** is neither deferred nor guessed
at: it **moves**. Every function the repo's helper file defines that the
pack's library does not define and the table does not map is carried, whole,
into `_scripts/local` — a repo-owned sidecar beside the pack's library, and
the one file in that directory no pack ships, no pack declares and `init`
never replaces.

**This reverses one line of a standing decision and leaves the rest of it
standing.** The helper file is still replaced byte for byte, and a mapped
call is still rewritten only through the pack's table — that is unchanged.
What changes is the unmapped name: *move them to a repo-owned
`_scripts/local` sidecar*, rather than defer them. A name the table never
grew a row for is usually a function this repo wrote for itself, and
deferring it breaks a task the repo already had, for the sake of a name the
pack was never going to define.

**Derive the list from what the old file defines, then extract it verbatim.**
The list is every function the repo's helper file **defines**, minus the names
the pack's library defines, minus the left-hand names of the legacy table —
not the functions the repo's tasks happen to call. The two sets differ, and
the difference is the point: a helper nothing calls today is still a helper
somebody wrote, and a list derived from call sites drops it into the replace
with nothing in the plan saying so. Deriving from definitions is a superset
of deriving from calls, so it can only carry more across, never less. For
each name left, copy its **whole body** out of the repo's file as it stands
before the replace, text unchanged — `init` moves a definition it already has
in hand and authors nothing.

A **called** name that no file defines is the one case a definition list
cannot see, and it is not a move: a call in a repo-owned task to a function
neither the repo's helper, the pack's library nor the table accounts for was
a broken call before this run began. It goes to **Rewrites (flagged, not
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
  task already sourcing it gains no second line, and a task that calls none
  of the moved functions gains no line at all — the sidecar is sourced where
  it is used. So the create's sub-lines and the `source` rows are counted
  separately: a function moved because the old file defined it, with nothing
  calling it yet, is one sub-line and no rewrite.
- nothing in **Deferred**. Nothing is deferred on this account.

A pack-owned task file the repo already carries byte for byte is untouched by
any of this, and so is every file pass 6 creates: both are written against
the pack's library already.

### 6 — Missing files

Diff **the repo this pass is running in** against what the three baseline
bundles ship — the same three bundles for every repo of the set, since the shape
is per repo and a member gets its own full configuration tree. Every file a
bundle declares and that repo lacks is a **create**, listed with the bundle it
comes from.

A file the repo *has* and a pack also owns is **compared**, once pass 3's
renames are accounted for — and what it is compared **against** is the
materializer's lockfile, not the pack. Each `entries:` record carries a `hash:`,
the content of that file as it stood when it landed here, **the marked positions
already filled**. That is the only honest baseline: a file `init` itself filled
never matches the pack's bytes again, so comparing against the pack would
re-offer every filled file on every run and no shaped repo would ever produce an
empty plan.

- **The lockfile records the file** — compare what is on disk against that
  record's `hash:`. Identical, and it needs nothing. Different, and it is
  **offered**.
- **The lockfile records nothing for it** — the repo acquired that file some
  other way — compare against the **pack's** bytes instead, on exactly the same
  terms. There is no landing to compare to.

This is the question `/vwf:doctor`'s content-drift predicate asks, of the same
record, by the same two tests and over the same set of marked positions — so
predicate (e) and this pass agree on what is content, and a file this pass
leaves alone is a file doctor reports clean.

**A marked position's value is not content drift, and a second test is what
separates the two.** The hash comparison above is the first test and the cheap
one: a match ends it and raises no row. On a **mismatch**, run this before
offering the file:

- Take the **pack's** shipped payload for that file, at the version the
  lockfile pins — the stack adapter's pack, reachable from the plugin.
- Splice into it the repo file's **current** value at **every position
  [new repo](new-repo.md) §7 enumerates that the file carries**, owned or not,
  reading each value the way that position's own comment describes it.
- Hash the result, and compare it with the repo file's hash.

**Equal**, and the repo file is the pack's file with nothing changed outside
those positions — the divergence lies wholly inside them, this pass raises **no
row**, and where a survey pass owns one of them that pass is what shows the
change. **Unequal**, and content diverged: the replace-or-keep row below,
exactly as before.

**Every marked position is spliced, and ownership decides only who shows the
change.** A marked position is by definition where a repo-specific value lives,
so a value sitting in one is never content drift for this pass, whether or not
some pass reads it. The positions a pass does own it shows: **§9** owns the
repo-name key, the bootstrap aggregator's member flags, the shell aliases,
`MEMBERS`, and the plugin task's two agent-plugin lists; **§11** owns the commit
gate's scope list and its forge links. One edit is then one row, and it is the
owning pass's row — a `repo-name key: <old> → <new>` replace row is the whole of
what a user sees when that key is the only thing that moved, never that row plus
an offer of the file it sits in.

**A position no pass owns is spliced on exactly the same terms and produces no
row at all** — `MERGE_MODEL`, and any position a pack marks later that no pass
reads. It is a value the repo set, so there is nothing for this pass to offer
and no survey row to show; the git pass still writes `MERGE_MODEL` wherever this
run lands or replaces the environment-block file, per §11(a), exactly as before.
That is what lets one `[env]` block carry `REPO_NAME` and `MEMBERS` beside
`MERGE_MODEL` and still reconstruct equal — a folder rename on a repo running
`pr` is §9's replace row and nothing else.

**A record whose `source:` is `generated` has no pack payload**, so there is
nothing to splice into: the second test is **skipped**, and test 1's mismatch
stands on its own as content drift, offered on the replace-or-keep terms below
like any other.

An offered file is one row, two outcomes, both decided in the plan and applied
on the same single consent:

- **replace** — the pack's file lands over the repo's, and every marked
  position that file carries is then filled from the confirmed answers to
  SKILL.md's questions, exactly as [new repo](new-repo.md) §The marked
  positions fills them on a fresh landing. That is what makes a replace safe
  on a file whose positions the repo had already filled: they are re-filled,
  not lost. The landing records the file's hash **once those fills have run**,
  and that record is what the next run compares against.
- **keep** — the file's own content is untouched and the decision is
  recorded, so doctor does not report it again and the next reshape does not
  re-offer it. A keep covers the content the repo customised; it never covers
  a marked position's value, which the fill passes own in this pipeline as in
  any other and write on this run whichever way the offer was answered.

**The default is replace where the repo's file references any left-hand name
of the pack's legacy table**, and keep everywhere else. A file naming a
retired thing is a file written against a vocabulary the library no longer
has, and keeping it keeps the breakage; a file that differs only by edits
somebody made on purpose is a decision, and the default respects it.

A file that reaches this pass through **pass 3's collision rule** — its
rename dropped because another of the repo's files contended for the same
destination — is offered on exactly these terms, listed under the path it
occupies now, its default read from its own content like any other.

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

**One record for the product, and it is the base's.** A member carries no
`.config/vwf.yaml` of its own — its file is the back-link, and the base's is the
product's only one — so a keep inside a member is recorded there, keyed by the
path relative to the base root with the member's path as its prefix
(`backend/.config/…`), while a keep in the base keeps its plain spelling.

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

Resolve the project ids **of the repo this pass is running in** the way
[new repo](new-repo.md) §7 does — resolution order, then slugification, the
member case included — and treat what comes out as the **proposal** it is.
SKILL.md's **question 2** shows every row with its source and takes a
replacement, and it is asked before the plan is printed, so no row below is ever
computed against an id the user is about to change. The ids this pass compares
against are the **confirmed** ones, from this repo's own rows of that question.

A per-project task group whose segment is **not** one of those ids is a
**rename**, listed with the proposed destination — the group was named for
something other than a project, and the segment is what tells a reader which
thing a task acts on.

**Say which kind of rename it is.** There are two, and calling them the same
thing misleads:

- The group's segment is the value a **previous id source** resolved to — a
  directory, a type token, or, on a repo shaped before the repo's own name
  stopped being a source, that name — and the id now resolves from the
  registry. The row reads
  `id source changed: <old> → <new> (<old source> → registry)`, naming both
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

**The repo-name key is compared here too, and against a different thing.** It
is not on the id list — it takes this repo's **folder name, slugified**, the
basename of its main checkout. Read that name, slugify it by the same asset,
and compare it with what the key holds:

- The key still carries the pack's placeholder: a **create**, filled with the
  folder slug.
- The key holds the folder slug already: no row.
- The key holds anything else — most often a project id an earlier run wrote
  there, or the old folder name after a rename: a **replace** row reading
  `repo-name key: <old> → <new>`, counted with the other marked-position
  rewrites and applied on the same one consent as everything else in the plan.
  Show both values; the whole point of the row is that a name the user has seen
  before is going away.

Never silently rewrite it, and never leave it to `/vwf:doctor` alone: the
launch aliases in the user's own global configuration read this value, so a key
naming a folder that no longer exists fails somewhere `init` cannot see.

**What makes a position unfilled is a marker the fill removes.** The packs
mark a position in two ways, and only one of them leaves a later run a test it
can apply:

- The marker is **what the fill replaces** — a placeholder token standing in
  for the value, or a commented-out template standing in for the lines to be
  written. Filling the position takes it out of the file. Such a position is
  unfilled exactly while that marker is still there, and **filled** the moment
  it is gone, whatever replaced it.
- The marker is a **comment beside a real, working value** the pack shipped on
  purpose. That comment survives every fill, so it can never say whether the
  fill happened — and the value is a usable setting rather than a hole. Such a
  position is **filled from the moment the file landed**, and is never reported
  unfilled, including where what it holds is exactly what the pack shipped.
  Where a position of this kind does earn a row, what decides the row is
  something this run resolved, never the marker.

Never decide either by comparing a value against the one the pack ships. That
is how the second run of a shaped repo reports its own first run's work: a user
who answered the git pass wrote that answer deliberately, and a value
comparison cannot tell it apart from a position nobody has ever touched.

The other marked positions are checked in the same pass, and two of them are
**not** that id list's: the bootstrap aggregator's member flags and the shell
aliases compare against the resolved **members** — one flag and one alias per
member, per [new repo](new-repo.md) §7. A position still carrying only the
pack's commented template, on a repo that **has** members, is a create; one
already carrying exactly those lines needs nothing; one carrying lines named for
anything else — the project ids an earlier run wrote there, most often — is a
**rewrite**, with the lines on both sides listed. The **repo-name key** is on
neither list: it is compared against this repo's folder slug, by the rule pass
9 states above.

The environment block's other two positions are checked here too, and they are
not the same kind of wait:

- **`MEMBERS`** is a create on a repo whose registry declares
  **sibling** members and whose position still carries the pack's shipped
  default — that is the one shape where the task library has no other source
  for them. It is the second kind of position above, so what decides this row
  is the member list this run resolved and not an unfilled test: the pack
  ships it with a working value and marks it in a comment. Under submodule
  linkage, and on a single-project repo, it is correct as shipped and produces
  no row.
- **`MERGE_MODEL` is never a create, and never a row at all.** It is the second
  kind too — the pack ships the local landing model as a real value under its
  comment — so it is filled from the moment the file landed, and a survey pass
  has nothing to say about it however it now reads. The git pass is what asks
  the question and writes the answer, in every repo whose environment-block
  file this run lands or replaces (per [new repo](new-repo.md) §11(a)); a
  survey pass does not pre-empt it, and never reports the landing model a user
  chose — or the shipped one they kept — as a hole.

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

**A plugin task whose content differs from the pack's** is one of §6's offered
files. Offered **replace**, the pack's file lands and this pass fills both
positions on it from question 5's confirmed answer, as a create. Offered
**keep**, the repo's file stays and this pass fills both positions in it all
the same: the keep covers the content somebody customised, never a position
the pack marked for `init` to answer. A file whose *only* difference from the
record is what those two positions hold was never offered at all — §6's second
test splices them out, this pass owning and showing both — so the rows below are
what a user sees either way, and the plan says which file each one is written
into.

### 10 — Repo-only tasks

Every task file in the library that **no landed pack ships** is the repo's
own. List each one as **repo-owned, kept**, and touch none of them: `init`
does not move a repo's task, does not rename it and does not fold it into a
group of its own choosing. A repo that wrote a task wrote it for a reason
this run cannot read.

Derive the set the way pass 6 derives its creates — the paths the three
baseline bundles declare, plus the secrets provider's — and take every task
file the library carries that the set does not name — but take it only
once pass 3's renames are accounted for, in the same words pass 6 uses and
for the same reason. A file the legacy table renames into the set is the
set's, not the repo's, and so is one pass 3's collision rule left at its old
path: both already carry a row of their own — a rename, or an offer — and
listing either here as well reads as two files, one of them kept, when there
is one. So the rule is the path the file **resolves to**, never the path it
sits at: the set is what the bundles declare, and a file the table or that
rule points into the set is inside it. `_scripts/local` is never among them
either: it is pass 5's, and listing it twice reads the same way.

**The `_default` slot is exempt on the same footing, and for a nearer reason:
`init` writes it.** Pass 9 lists it as a create for a project id that has no
group of its own, so it is this command's output rather than a task the repo
authored — and no bundle declares it, because no bundle can: the id is this
repo's. Left unexempted it would come back as repo-owned and kept on **every**
run of a shaped repo, which is a permanent row for a file `init` itself put
there.

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

Two positions the commit gate's packs ship **marked, with a comment naming
what `init` fills them from**. Only one of them is a wait: the commit-scope
list is filled on every run, the first included, from the ids question 2
confirmed, while the forge links wait on the repo having a remote. The
shipped comments say which is which:

- **The scope list takes the ids question 2 confirmed**, on any run and the
  first one included. Where the base carries a registry those are its ids,
  which is the ordinary re-run case. Where it carries none, they are the ids
  that question confirmed for this repo from its other sources — a user who
  was shown every row and accepted it has declared the list, which is the
  thing a scope needs. A registry is where a proposal may be read from, never
  a condition on the fill.
- **The forge links fill on *any* run where the repo has a remote** — the
  first one included, since a cloned or already-pushed repo has one from the
  start. Only a repo with no remote yet keeps them as shipped, and the next
  run after the remote is added fills them. They ship **commented out**, so
  filling them means uncommenting them too; a filled line left commented is
  the same as no link.

| The fill        | Its source                                              | Fillable                 | When it stays as shipped                            |
| --------------- | ------------------------------------------------------- | ------------------------ | --------------------------------------------------- |
| commit scopes   | the project ids of pass 9, as question 2 confirmed them | on any run               | question 2 confirmed no id for this repo            |
| the forge links | this repo's own origin, via `git remote get-url origin` | on any run with a remote | no origin remote                                    |

**The two fills read from different places.** The scope list takes a repo's
**own** confirmed ids — the rows question 2 showed under that repo's heading —
and where the base carries a registry, that registry is what those rows resolved
from for every repo in the set: a member carries no configuration of that kind,
its file being the back-link the membership asset defines
(`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`), so a member's scopes are the
projects that one registry places in it. The forge links are genuinely **per
repo**: each repo's own origin, read inside that repo, since a member has its
own remote and filling its links from the base's would point every link in it
at another repo's forge.

Rules for both:

- **The confirmed ids are the only scope source.** A scope names a project
  somebody declared, so nothing `init` merely *inferred* reaches this position
  — never a directory listing on its own, and never the repo's name, which is
  not a project at all and is no longer an id source anywhere. What makes the
  ids declarable is question 2: every row was shown with its source and
  accepted or replaced. Where that question confirmed no id for a repo, leave
  the position exactly as the pack ships it and say in the plan that the fill
  is waiting on `/vwf:architecture` and `/vwf:setup`.
- **Never delete the comment.** It is what a later run reads to find the
  position, and it is the record of where the values came from.
- **Each fill is its own plan row**, `+ <what>` with its source named, so the
  user sees a config being completed rather than a file quietly changing.
- The exact spelling of both positions — the key names, the value shape — is
  the packs', read from the shipped file in place. Nothing here re-spells it.

## Plan

One document, printed once, carrying **one section per repo** — the base first,
then each member in resolved order. A repo's section opens with a heading naming
it and the mode it resolved to:

```text
── <repo> ── (existing)
```

and under that heading come the ten sections, in full, for that repo. An absent
member's heading carries its clone row and the survey note the Survey describes
in place of them, since its ten sections do not exist until the clone has run.

Each section opens with its count; each line is `old → new` for anything that
moves or is renamed, `+ path` for anything created, and a bare path with its
reason for anything flagged. Print an empty section as `none` rather than
omitting it — a missing section reads as an oversight, and the reader cannot
tell which. Every path is spelled relative to the repo the section belongs to;
the heading is what says which repo that is.

A move-and-shim row carries **sub-lines**: one for the key the move drops from
the real configuration, and one for each exclusion the drop makes necessary,
naming the files that exclusion keeps out of the gate. Both are changes to the
settings the row claims survive the move, so the user reads them before the
one consent rather than finding them in the report.

A **replace** row carries sub-lines on the same principle: one for each
function that leaves the file being overwritten. The `_scripts/local` row
carries them too — one per function moved into the sidecar, named, so the
two lists are read side by side and every function the replace removes is
accounted for: as a rewrite through the legacy table, or as a body in the
sidecar. Every **rewrite** row is `old → new` at `file:line` — one row per
call site, never one per name — so the user counts the call sites before the
one consent as plainly as the files.

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

Close **each repo's section** with that repo's total, **counting only what would
be applied** — `Repo-owned, kept` is outside it, and so is an offered row whose
decision is keep. Then close the document with one **product total**, the
per-repo totals summed, so the user reads one number before the one consent.

A **product** total of zero is the idempotent case: the document is still
printed with a section per repo, each reading nothing, the skill says **the
product is shaped**, and the report prints with those two lists still in it
— then stop, without asking anything. A repo whose only rows are files it owns
and files it decided to keep is shaped, and saying otherwise every run is how a
user stops reading the plan. **One repo of the set reading nothing is not that
case**: the plan is printed and the one question is still asked, because another
repo has work, and a section reading nothing is how the user sees that the
shaped repo was looked at rather than skipped.

## Consent

**One question, two answers**: apply all of it, or stop. Not per file, not per
section, and **not per repo** — one yes covers every repo's section, the clone
rows included. The plan is a coherent reshaping — half of it applied leaves a
repo where the task names moved and their callers did not, which is worse than
either end state, and a product half of whose repos moved is the same failure
one level up: the base's aggregator would name members whose libraries still
answer to the old vocabulary.

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

**Repo by repo, members first and the base last**, and inside a repo in the
plan's own order, touching **nothing** the survey did not list. The order across
repos is load-bearing for the same reason the order inside one is: a member's
apply is what moves that member's commit, and the base's gitlinks are only
current once every member has committed. A member cleared for cloning is cloned
at the top of its own turn, surveyed, its rows printed, and only then applied; a
repo of the set that resolved to mode new takes the [new repo](new-repo.md)
pipeline in its turn, at the same point in the order.

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
- **A kept file keeps its content, and the fill pass still reaches the marked
  positions inside it.** The keep itself needs no write; only its **record**
  does, and the offered row's keep outcome is what lists
  it. Write that record **after every keep is settled and before the fill
  pass** — one `enforcement.kept_files.<path>: { reason }` entry per kept file
  in the **base's** `.config/vwf.yaml`, spelled as §6 says, merged into the
  block rather than replacing it.
  Where that file does not exist, `init` does **not** create it: the keep
  stands and the record is the **Deferred** line §6 describes. Beyond that
  record and the fills §9 and §11 own, nothing about a kept file is applied
  here.
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

**This happens once per repo, not once per run.** Each repo has its own gate
configuration and its own hooks, wired into its own repository metadata, and a
commit in a member runs the member's hooks against the member's working tree. So
every repo this run touched the gate configuration of takes this commit first,
in its own turn, before its own shaping commit. Doing it once for the run would
leave every other repo's configuration modified-but-unstaged at the moment that
repo came to commit, which is the abort this subsection exists to avoid.

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
([new repo](new-repo.md) §11), which already reads across the resolved repos:
the landing-model question and the three-answer commit question asked **once**
for the whole run, each repo staging what this run wrote in it, the fixed
shaping message per repo, the commits ordered members then base with the base's
changed gitlinks staged into its own, the branches per repo, the push, and the
**forge pass** after the last push — §11(f), read there and not restated here:
the same eligibility, the same precondition, the same one consent for the
product. Its consent line on this pipeline says one more thing, because a repo
that already existed has usually been on its forge for a while: the pass is
**idempotent** — a default branch already set is set again to the same value
or to the one chosen, and a branch already protected in any form is left
exactly as it is and reported, never rewritten to the two rules. Question 6's
forge-read default applies here as everywhere, and it is here that it earns
its keep: an existing repo almost always has an `origin`, so the row arrives
proposing what the forge already says. Three differences, all from the fact
that a repo taking this pipeline already existed:

- The first commit here is **not** before hook wiring. That is why the gate
  configuration went first: with the hooks live, the commit above is what
  makes the tree committable, and the shaping commit then runs through hooks
  that read a settled configuration.
- The branch table's first row cannot apply — this repo has commits. Create
  `develop` from `main` where `develop` is missing, `main` from `develop`
  where `main` is missing, and nothing where both exist.
- A branch this run just created is one the forge has never seen protected,
  so its `Forge` line is a plain set; the branch the repo already had is the
  one the idempotence check is most likely to report as left alone.

## Report

**The report's shape is SKILL.md's** — the ten file sections repeated under one
heading per repo with the base first, the git lines, and the two next-step lines
— and it is stated there once. Read it there; nothing here restates it. What
this pipeline settles is what goes in which section, filled from what was
actually applied rather than from what was planned, and every line printed under
the heading of the repo it happened in. A deferred materialization, a flagged
rewrite, a call to a function nothing defines, a kept-file record on a product
whose base has no `.config/vwf.yaml` yet, an absent member nobody could clone,
and a reported-but-unmoved root file all belong in **Deferred**, each with its
unlock and each naming the repo it belongs to. A call the legacy table could
not map is **not** among them any more: pass 5 moves its function to the
sidecar, and the run reports the move.

`Files kept` names each offered file the user kept, with the reason recorded
beside it, and `Tasks kept` lists every repo-owned task pass 10 found — with
the contract note on the rows in the `setup/` or `code/` group whose name the
mandatory set does not carry. Both are sections of things this run
deliberately did **not** touch, which is exactly why they are printed: a file
left alone silently reads the same as a file nobody looked at.

**The invariant, stated in the report itself, and stated with its scope:**
running `init` again on a shaped repo produces an empty plan **for the same id
source**, and on a shaped product an empty section for **every** repo. If a
second run finds work, it is one of five things, and the report names which: the
first run deferred something; a pack moved, which the adapter's re-sync
command is for; the **id source changed** — the repo grew a registry, so ids
that came from directories or from a type token now come from declarations,
and pass 9's rename rows say so in those words; the **repo-name key no longer
matches the folder** — the folder was renamed, or the key was written by a run
from before the key took the folder name — which is pass 9's one replace row
and nothing else; or **the set changed** — a member joined the product, or one
this machine lacked was cloned, and that member's section is the whole of the
work.

A **replace is applied once**, and that is part of the same invariant: the
second run reads a file whose content matches the hash its landing recorded —
the fills included — plans no row for it, and rewrites no call, since the names
it would have mapped are gone from the tree. An **offer is made once** for the
same reason, from either end: a replaced file matches its own record next time,
and a kept one is recorded under `kept_files`, so neither is offered again.
**A filled position is not drift**, and that is why pass 6 compares against the
lockfile rather than the pack: the files `init` writes into are exactly the
files a pack-bytes comparison would re-offer for ever. The sidecar holds by the
same rule — its functions are no longer unmapped calls into a library that
lacks them, they are calls into a file the repo now owns.

The third and the fourth are not broken invariants. They are the re-run doctrine
working: `init` is meant to be run again as the repo learns things about itself
— the registry is the largest thing it learns — and as the product changes shape
around it.
