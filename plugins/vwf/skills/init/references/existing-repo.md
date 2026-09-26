# The Existing-Repo Pipeline

Read this in mode **`shaped`** — a target whose materializer lockfile exists.
Something shaped this repo before, and the job is to reconcile it against what
the packs ship without discarding a decision somebody made on purpose.
SKILL.md's Step 0 decides the mode; this file never re-derives it.

**This file is also the home of the passes the other two modes borrow.** A
**`source`** repo — no lockfile, but something in the tree — takes the
[new repo](new-repo.md) landing and, before it lands, runs the passes below
that have something to read: pass 1's root survey, pass 6's offer over every
path the materializer reports as a conflict, and passes 3 and 5 only where a
task library already exists. A **`blank`** repo runs pass 6's offer alone, over
the same conflict list. Each borrowed pass says, in its own opening, which
modes run it and on what input; everything else in this file is the `shaped`
pipeline's.

Three phases, in order and never interleaved: **survey**, **plan**, **apply**.
The survey writes nothing. The plan is one document. The apply touches only
what the survey listed.

**All three run across the resolved repo set, not across one repo.** The survey
runs its eleven passes **in each repo** that resolved to mode `shaped`. The plan
is still one document, printed once, with **one section per repo** — the base
first, then each member in resolved order. The apply touches the repos in
**members-then-base order**, so the base's gitlinks are current by the time it
commits. A repo of the set that resolved to mode `blank` or `source` takes the
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

**Runs in `shaped` and in `source`, over the repo's root entries; a `blank`
repo has no root entry this pass would read and skips it.** In `source` mode
its rows open that repo's section of the plan, ahead of the new-repo landing's.

The hygiene doctrine closes a repository root to a fixed set, and the
materializer enforces it as a ceiling. The root this pass reads is **the root of
the repo it is running in** — a member's own root, surveyed against the same
ceiling as the base's — and what it reads there is every **entry**: files and
directories alike, never files only. A directory at the root sits under the same
ceiling a file does, which is why the exemptions below have to name directories
by hand. Every other configuration file at that root is a **move** into that
repo's configuration directory.

**Derive the rename map from the packs' own `config/` trees**, never from a
list written here. For each landed or landable pack, the **full path** its
`config/` tree declares *is* the destination — a root entry whose path, taken
whole, matches one of those declarations moves to where the pack puts it —
plus every **root spelling** the [tool-config table](tool-configs.md) lists for
the tool that declaration configures, which the *root tool configs* step below
reads. That is what keeps this pass correct when a pack changes where its
config lives; a hardcoded map here would go stale silently, which is the
failure mode the whole tier exists to avoid.

**Two things the map never holds.** A **task-file basename**: the task library
is excluded from the map whole, so a root file that happens to share a name
with a shipped task is not that task and is never moved into the library — the
library's files are pass 3's, pass 10's and the materializer's, by full path.
An entry the repo's **`.gitignore` ignores**: a root entry the ignore file
already excludes is build output or a local artefact, not configuration, and
is skipped without a row.

**A `handed` spelling is in neither.** A root file the table's `handed` row
lists — the toolchain manager's own root config — is not a stray, and it is
not a plan row of this pass either: it enters no rename map, gets no move,
keep or delete row, and is reported nowhere by init. The tool-config skill's
migration folds it, and that call's rows cover it, per the toolchain
migration below, whose rows init's survey preview returns.

A root **entry** matching **no** pack declaration, none of the table's
spellings and **not** on the allowlist is **reported, not moved**. It belongs
to something outside this toolkit, and guessing a destination for it is how a
tool stops finding its own config. **One kind of unmatched directory is not a
stray**: a directory holding its own language manifest or source — the
sub-project SKILL.md's Step 0 and question 2 already resolved as a project —
is listed **once**, under the plan's **Projects** heading and the report's,
and never under Deferred. It is where a project lives, not a file that failed
to move.

**Five kinds of root entry are recognised and never listed at all**, and no
run reports any of them:

- **`.git/`** — exempt **by name**, never by implication. It is the repository
  itself, no pack declares anything inside it, and the one thing this run reads
  from it is the hook-manager step's `core.hooksPath`.
- **`.gitmodules`** — git's own file, on the same footing as `.git/`. It is not
  configuration this toolkit places, it cannot be moved without breaking the
  repository, and **every base repo with submodule members carries one**, so
  reporting it would put a permanent finding in the plan of exactly the products
  this pipeline now walks.
- **The editor directory the fragment convention names** — `init` composes it
  itself, out of the editor fragments the packs ship, per
  [fragments and sections](fragments-and-sections.md). A directory this run
  writes is not a stray a later pass discovers. The convention names it; this
  file does not. Exempt from this pass is not unread: the composition step
  itself reads both editor files whole, and a key somebody added there by
  hand that the packs also compose is surfaced **there**, as a collision row
  in this repo's section — pass 7 says where.
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
allowlist names what a **pack may land**, and all five sit outside that
question — two are git's, two are this command's own output, and the fifth is
a repository of its own.

#### The move-and-shim case

One shape needs saying because a naive move breaks it. Where
`/stackgen:tool-config` or a pack lands **both** a file in the configuration
directory *and* a file of the same basename at the root — the root one being a
two-line stand-in that does nothing but point at the other — the root file is
not a config that failed to move. It is the owner's answer to a tool whose
config discovery is root-only and cannot be redirected.

So: a **real** configuration file of that basename at the root moves to where
its owner lands it, exactly as pass 1 says, and the owner's stand-in takes its
place at the root. Record it as a **rename** row plus the create the stand-in
already is, and say in the plan that the settings survive the move — they are
read through the stand-in.

**Not every key survives it, though, and the owner says which.** An owner that
ships a stand-in states, in its own reference, what the file it points at may
not carry: at least one key is *not inherited* through the pointing mechanism,
and an extended file declaring it is a fatal config diagnostic — so every bare
invocation of that tool fails, not only the one that reads the moved config.
Read that owner's reference for which key and why; it is the authority, and
this file names neither the tool nor the key on purpose. The move **drops**
the key, and the plan says so as its own line.

Dropping it **widens** what the gate covers, which is the other half of the
same trap: with the key gone, the owner's pinned plugin list defines the file
set, so files the repo had kept out of the gate by omission now enter it. The
survey re-derives the covered set after the drop, the plan lists every file
that newly enters, and each is narrowed away with an **exclusion** —
`/stackgen:tool-config all add exclude <paths>`, on the one consent — never by
restoring the dropped key, which puts the fatal diagnostic back.

Tell the two apart by content, never by name: the stand-in is the file its
owner ships, byte for byte, and the survey has that file in hand. Anything
else of that basename is the repo's own and is the thing being moved.

#### Root tool configs

The move-and-shim case is one tool's; this step is the same shape for every
tool a pack or `/stackgen:tool-config` ships, and it is what reads a
brownfield repo's own gate before the shipped one lands over it. The
[tool-config table](tool-configs.md) carries one row per such tool — the
tool, its known root spellings, the `.config/` path its owner lands, that
owner, and the merge shape. For each row but a `handed` one, whose
file the toolchain migration below covers, look for every spelling at
the root **and inside `.github/`** — the one allowlisted directory a tool's
discovery also reads, and which the allowlist survey above reads as a single
entry, so a policy file inside it is never seen by that survey at all. Each
hit is one **plan row**, `root tool config`, with three outcomes, decided in
the plan and applied on the one consent:

- **move** — the default. The repo's file becomes the `.config/` copy at the
  path the table names, as a `git mv`, and is then **offered through pass 6
  under that path**, against the pack's file — so what the repo wrote is read
  and compared before anything lands over it, and a keep there keeps it.
  That is the table's `move-and-offer` shape. Where the table's owner is
  `/stackgen:tool-config`, the offer is that skill's conflict row in its
  preview, not pass 6's.
- **keep both** — the repo's file stays where it is and the owner's lands in
  `.config/`. The row says that the tool's own root-first discovery reads the
  root file and that the gate, which passes the `.config/` path explicitly,
  does not — and the report lists it under Deferred as **unread by the
  gate**, its unlock a later reshape choosing the move.
- **delete** — only on the user's explicit pick at the consent step, never a
  default and never proposed. The row records it as a move with no
  destination.

**A twin the pack itself lands at the root** is the one case with no move: a
tool whose discovery is root-only, so the pack's own file already sits at the
root — the dependency-update policy is the case the table names. Where the
repo carries that tool's policy under another of the table's spellings, or
inside `.github/`, the **repo's file wins**: the pack's is **not** landed, the
row reads `kept, pack file not landed`, and nothing moves. Two policies for
one tool is how one of them is silently ignored.

#### The toolchain migration

A repo whose lockfile records the toolchain manager's bundle slug — the one
`/stackgen:tool-config all` replaced — or whose toolchain files predate the
skill's layout, is migrated by that call, never by a pass here. The skill
reads the old files, a root manager config — the spellings the tool-config
table's `handed` row lists — and each pack's old fragment among them, and
its survey preview returns the rows: what it folds, what it moves, and every
block that differs, as take theirs / keep mine / merge. `init` prints those
rows in the repo's section under **Tool-config rows**, the one consent
covers them, and the real call carries the answers, per
[new repo](new-repo.md) §2. A repo already on the skill's layout, with
nothing drifted, gets no row.

#### The hook manager

Read, in the repo this pass runs in, the local `core.hooksPath`
(`git config --local core.hooksPath`), a `.husky/` directory, and a
`lefthook.yml` or `.lefthook.yml` at the root. Any hit means the repo's hooks
are wired to something other than the gate `/stackgen:tool-config` lands, and
it is one **plan row**, `switch hook manager to pre-commit`, whose **default
is keep**.
A hook manager somebody installed is a decision on the same footing as a
diverged file, and switching it silently is how a team's existing hooks stop
running the morning after a reshape.

- **keep** — the gate-first commit below runs under the **installed** hooks,
  and this run does **not** invoke `setup:precommit`. The plan says so, and
  the report names the manager it found and that the shipped gate
  configuration is landed but not wired. Where the aggregator offer of
  [new repo](new-repo.md) §10 is then accepted, the task it reaches refuses
  the foreign manager without `--force` and names it — so nothing switches by
  that route either.
- **switch** — the run invokes **`setup:precommit --force`**, the task
  library's flag for exactly this, which unsets the local `core.hooksPath`
  and takes the hooks over — as its **last shaping step**, after every other
  apply row and before the gate-first commit, and says so in the plan and in
  the report. A `core.hooksPath` set outside the repo is the task's own
  by-hand line, repeated under Deferred.

No hit, and the row is not printed: the hooks are the gate's already, or not
wired yet, and the aggregator is what wires them as on any repo.

### 2 — The readme

`README.md` → `readme.md`, as a move. **Content untouched** — this is a
rename, and every word in the file survives it. A repo already carrying
`readme.md` needs nothing; a repo carrying both is reported as a conflict for
the user rather than resolved here.

**Rename the callers too**, the way pass 3 renames a task's. A moved readme
that something still links under its old spelling is a broken link that
passes every check, so scan the tree for the old name — relative links in
other markdown files, a task description or help line that names it, a
manifest field or a docs config that points at it — and list each occurrence
as its own rename line, `old → new` at `file:line`, applied with the move. A
link into the file (`README.md#section`) is rewritten the same way and keeps
its anchor. Nothing is rewritten on a repo where the move itself is not
happening.

### 3 — Task names against the legacy table

**Precondition: a task library exists** — every `shaped` repo, and a `source`
repo that already carries one; without a library there is nothing to rename.

The tool-config skill's toolchain reference carries a **Legacy names** table —
each row a name this contract replaced and what it became. Read that table and
match every task in the library against its left-hand column. Each hit is a
**rename**, `old → new`, with the destination path the new name implies.

**A task is a task file or an inline `[tasks.*]` table**, and this pass reads
both. Every configuration file the toolchain manager reads — the skill's split
under `.config/`, and any root file the toolchain migration will fold — may
declare tasks inline, and a repo that grew up without the task library
usually did. An inline task is matched against the legacy table like a file
is; a hit is a **rename** into the library — the file the new name implies,
its body carried across verbatim under the shipped shebang and the helper
`source` line, and the inline table removed — and a miss is pass 10's, kept
inline where it sits. Passes 4 and 10 read the same set, so a task is never
invisible for being a table rather than a file.

**A root manager config is the skill's to fold**, per pass 1's toolchain
migration, never a move here. Its inline tasks are still this pass's: read
them as inline tasks before the skill's call removes the file.

The table lives in the skill, not here, and that is the point: the renaming is
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
An **inline task** pass 3 read has no shebang of its own; it runs under the
shell the manager's own setting names, so read that setting, and where it is
not bash flag the task on the same terms, naming the setting as the shebang.
Auto-translating a shell script is how a working task becomes a subtly broken
one, and the breakage surfaces in whatever that task was protecting. The one
mechanical rewrite `init` does apply is pass 5's, and it applies for the
reason this rule refuses: what it maps is written down in a table the pack
owns, not translated by `init` on the spot.

### 5 — The helper library

**Precondition: a task library exists** — the same one pass 3 states; a repo
with no helper file to compare has no sidecar to write.

The shared helper file's name lost its leading underscore, and so did its
siblings — the legacy table says so in its own rows. That is two renames, not
one: the **file**, and every `source` line naming it. A repo that renames the
file and not the sources has a task library where every task fails on its
first line. List both.

Then **compare the file's content**, under its new name, against the one the
tool-config skill lands — byte for byte, the same way pass 1 tells the pack's
stand-in from the repo's own. Identical, and the pass ends here. Different,
and the repo's file is a **diverged copy** of the library every pack script
is written against: the tasks pass 6 would create call into it by name, and a
name this copy never defined fails the moment that task first prints.

So the plan carries a **replace** row for the helper file — the skill's file
over the repo's, landed by its call on the same one consent — with a
**sub-line for every function the repo's copy defines and the pack's does
not**. Those are the names that leave the file, and listing them is what lets
the user read what leaves before saying yes rather than after. Each one
leaves by a route this pass names: a rewrite through the legacy table, or a
body carried into the sidecar below.

Each retired name then becomes **rewrite** rows: one per call site in a
repo-owned task file, `old → new` at `file:line`, the new name read from the
**Legacy names** table in the skill's toolchain reference — the same table
pass 3 reads for task names, and the skill's for the same reason.
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

**Runs in every mode, and the mode decides what reaches it.** In `shaped` the
input is the survey's own diff below — every pack-owned path the repo carries.
In `blank` and `source` the input is the **materializer's conflict list**: the
paths its dry-run reports as already present and recorded in no lockfile, which
[new repo](new-repo.md) §2 hands here instead of deferring. In **every mode**
the input also carries each root tool config pass 1's tool-config step
**moved**, under the `.config/` path it now occupies — the move is what puts
the repo's file where the pack's would land, and this pass is what reads it
before the pack's does; the [tool-config table](tool-configs.md) names the
path. Either way, a path offered to this pass takes the compare,
the default rule, the outcomes and the `kept_files` record exactly as written
below — one row per path, in the plan, before the one consent.

Diff **the repo this pass is running in** against what the remaining baseline
bundles ship — the same bundles for every repo of the set, since the shape
is per repo and a member gets its own full configuration tree. Every file a
bundle declares and that repo lacks is a **create**, listed with the bundle it
comes from.

**A path the tool-config skill owns never reaches this pass.** Its lockfile
record reads `source: tool-config/…`, and the skill's own call shows its
creates and drift rows, per pass 1's toolchain migration.

A path offered to this pass — a file the repo *has* and a pack also owns, once
pass 3's renames are accounted for — is **compared**, and what it is compared
**against** is the materializer's lockfile, not the pack. Each `entries:`
record carries a `hash:`, the content of that file as it stood when it landed
here, **the marked positions already filled**. That is the only honest
baseline: a file `init` itself filled never matches the pack's bytes again, so
comparing against the pack would re-offer every filled file on every run and no
shaped repo would ever produce an empty plan.

- **The lockfile records the file** — compare what is on disk against that
  record's `hash:`. Identical, and it needs nothing. Different, and it is
  **offered**.
- **The lockfile records nothing for it** — the repo acquired that file some
  other way — compare against the **pack's** bytes instead, on exactly the same
  terms, and **after the fills**, never raw: take the pack's payload with the
  placeholders of [new repo](new-repo.md) §4 filled from this run's sources,
  the way a landing would leave it. The raw payload carries `<REPO_URL>`, so
  a file that is exactly what a landing would have written
  reads as diverged against it and is re-offered on every run. There is no
  landing to compare to, and this is the nearest thing. Every path the
  conflict list hands here in `blank` or `source` mode is this case, since
  neither mode has a lockfile yet: a conflict carrying those post-fill bytes
  already needs nothing, and every other one is offered.

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
- Splice into it the repo file's **current** value at **every marked
  position the file carries** — any a pack payload still ships — reading
  each value the way that position's own comment describes it.
- Hash the result, and compare it with the repo file's hash.

**Equal**, and the repo file is the pack's file with nothing changed outside
those positions — the divergence lies wholly inside them, this pass raises **no
row**, and where a survey pass owns one of them that pass is what shows the
change. **Unequal**, and content diverged: the replace-or-keep row below,
exactly as before.

**Every marked position is spliced, and ownership decides only who shows the
change.** A marked position is by definition where a repo-specific value lives,
so a value sitting in one is never content drift for this pass. One edit is
then one row, the owning pass's, never that row plus an offer of the file it
sits in. The positions in files the tool-config skill owns — the commit
gate's scopes and forge links among them — are not spliced here: those files
never reach this pass.

**A record whose `source:` is `generated` has no pack payload**, so there is
nothing to splice into: the second test is **skipped**, and test 1's mismatch
stands on its own as content drift, offered on the replace-or-keep terms below
like any other.

An offered file is one row, two outcomes, both decided in the plan and applied
on the same single consent:

- **replace** — the pack's file lands over the repo's, and every marked
  position that file carries is then filled from the confirmed answers to
  SKILL.md's questions, exactly as a fresh landing fills them. That
  is what makes a replace safe on a file whose positions the repo had
  already filled: they are re-filled, not lost — and `init` then **records
  the file's post-fill hash in the lockfile**, under that path's `entries:`
  record, once those fills have run.
  The materializer's hash is the landing's, taken before any fill; this one
  overwrites it, and it is what the next run compares against.
- **keep** — the file's own content is untouched and the decision is
  recorded, so doctor does not report it again and the next reshape does not
  re-offer it. A keep covers the content the repo customised; it never covers
  a marked position's value, which the fill passes own in this pipeline as in
  any other and write on this run whichever way the offer was answered — and
  `init` then **records the file's post-fill hash in the lockfile** too,
  under the same record, creating the record where the lockfile had none.
  The keep is written into `kept_files` so the file is never re-offered; the
  hash is written so that a fill this run made inside it is not the drift
  `/vwf:doctor` reports the next morning.

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
one. The record is written in **every mode** — a keep over a conflict in
`blank` or `source` is recorded on the same terms as one in `shaped`, into
the stub SKILL.md describes where the base has no config file yet.

**One record for the product, and it is the base's.** A member carries no
`.config/vwf.yaml` of its own — its file is the back-link, and the base's is the
product's only one — so a keep inside a member is recorded there, keyed by the
path relative to the base root with the member's path as its prefix
(`backend/.config/…`), while a keep in the base keeps its plain spelling.

**That key is one of the three things `init` writes into `.config/vwf.yaml` —
the others are `enforcement.editor_keys`, the editor merge's, and the
top-level `answers` block, the four conditional answers this run asked or
read.** The entry is written under the same single consent as everything
else, merged into whatever the block already holds, and an absent
`kept_files` block reads as empty. On a repo `/vwf:setup` has not reached
there is no file yet, and `init` writes the **stub** SKILL.md describes —
`config_format`, the `enforcement` block and the `answers` block, nothing
else — so the record has a home on the run that made it; `/vwf:setup`'s own
passes complete the file later. Nothing about a keep is deferred on this
account.

**The `answers` block is recorded on this pipeline exactly as it is on the
other**, and a reshape is where a product that has never carried one gains
it: a config stamped at the format before the block existed has no `answers:`
to read, so this run asks its two questions seeded as
[new repo](new-repo.md) §2 describes and writes the block whole — `editor`
and `secrets` once for the product, `repos:` keyed by the member path exactly
as `kept_files` keys one, each entry carrying `forge` and `update_bot`. A
config that already carries the block is rewritten from this run's answers on
the same terms, and the forge is the live `origin` host rather than the
recorded value wherever the remote can be read.

**The helper library never reaches this pass either**: the skill lands it.
Every task file the run creates sources that library, so a kept copy
missing a function the created scripts call is a repo that fails on its
first print — a breakage this run causes and a later, user-run command
would be too late to prevent. Pass 5 compares it and plans the skill's
replacement unconditionally: there is no keep row for it, and its retired
names leave through pass 5's rewrites and its sidecar rather than through an
offer.

**Three hygiene files are never offered either, from the other end.** The
readme, the licence file and the security file take the already-there rule of
[readme and licence](readme-and-license.md): one the repo carries is **kept,
never replaced, and reported as kept** — no offer, no default to flip, and no
`kept_files` entry, since nothing was decided. **Every spelling of the licence
file counts as carrying one** — `LICENSE`, `LICENSE.md`, `LICENCE`, `COPYING`
— not the one name the allowlist happens to land: a repo licensed under any of
them is licensed, and a pack file landed beside it is a second licence. A
conflict the materializer reports on one of those paths, in any mode, becomes
that report line and nothing else, and a licence under one of the other
spellings, which the materializer would not report as a conflict, is found by
this pass by name and treated the same way.

### 7 — Fragments and sections

- **Ignore sections** — for every language the stack read produced
  (SKILL.md's *The stack read*), whether the ignore file already carries that
  section's banner. A missing one is an append.
- **Editor fragments** — whether each of the two editor files carries the
  block, which is a merge where it does not; and, read from the file whole,
  every key **outside** the block that the composed set also carries. Each is
  a **collision** — one sub-line under that file's merge row in `Merges`,
  reading `file · key · hand value · pack value · choice`, its choice the
  answer `enforcement.editor_keys` records where it records one and **keep**
  otherwise. A sub-line with no record is what the collision round asks
  about, before the plan is printed; a `take` or `union` sub-line names the
  hand lines it removes.

Both are detailed in
[fragments and sections](fragments-and-sections.md); a pack's hook is
`/stackgen:tool-config`'s block, never a merge here.

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

**A type in neither column is asked, never guessed.** The table maps the
spellings this toolkit has met; a repo may carry one it has not — `wip`,
`hotfix`, a team's own word — and picking a destination for it silently is a
rename the user reads about after their next commit is refused. Ask once per
such type, before the plan is printed, with the closed set of ten as the
choices plus **keep as is**; a mapped answer is a rename row like the table's,
and *keep as is* leaves the type in the configuration outside the closed set,
listed in the plan as kept with the answer beside it. `init` records no
answer for it — the three keys it writes are pass 6's, pass 7's and the
`answers` block — so a kept type is asked about again on the next run it is
still there, which is one question, and the honest price of not growing a
fourth record.

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

**The skill's positions are compared by the skill.** This pass computes the
values `/stackgen:tool-config all` takes, per [new repo](new-repo.md) §2 —
the folder slug for `repo`, the resolved members, the landing pair the repo
already carries, question 5's confirmed rows, §11's scope list — and passes
them to the skill's `preview all` in the survey, per [new repo](new-repo.md)
§2. The skill compares each with what its file holds and returns the row: a
`repo-name key: <old> → <new>` replace, member flags and aliases rewritten
from project ids to members, a plugin list gaining or losing rows, a scope
list that moved. `init` prints those rows in this repo's section under
**Tool-config rows**, asks each conflict or drift row inside the plan, and
the one consent covers them.

The folder slug is this repo's main checkout basename, slugified by the same
asset. Never leave a rename to `/vwf:doctor` alone: the launch aliases in the
user's own global configuration read that key, so a key naming a folder that
no longer exists fails somewhere `init` cannot see.

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

### 10 — Repo-only tasks

Every task in the library that **neither the skill nor a landed pack ships**
is the repo's own — a task file, or an inline `[tasks.*]` table in any of the
manager's configuration files, read as pass 3 reads them. List each one as
**repo-owned, kept**, an inline one with the file and table it sits in, and
touch none of them: `init` does not move a repo's task, does not rename it,
does not turn a table into a file and does not fold it into a group of its
own choosing. A repo that wrote a task wrote it for a reason this run cannot
read.

Derive the set the way pass 6 derives its creates — the paths the skill
lands and the remaining bundles declare, plus the secrets provider's — and
take every task file the library carries that the set does not name — but
take it only
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

### 11 — The commit-scope argument

The commit gate's configuration is `/stackgen:tool-config`'s, and `init` fills
no position in it. What stays `init`'s is **deriving the scope list**, which
it passes to `/stackgen:tool-config all` as `scopes=`, per
[new repo](new-repo.md) §2; the forge links are the skill's own, read from
the repo's origin.

- **The scope list takes the ids question 2 confirmed**, on any run and the
  first one included. Where the base carries a registry those are its ids,
  which is the ordinary re-run case. Where it carries none, they are the ids
  that question confirmed for this repo from its other sources — a user who
  was shown every row and accepted it has declared the list, which is the
  thing a scope needs. A registry is where a proposal may be read from, never
  a condition on the fill.
- **Each repo passes its own** confirmed ids — the rows question 2 showed
  under that repo's heading. Where the base carries a registry, that registry
  is what those rows resolved from for every repo in the set: a member
  carries no configuration of that kind, its file being the back-link the
  membership asset defines (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`), so
  a member's scopes are the projects that one registry places in it.
- **The confirmed ids are the only scope source.** A scope names a project
  somebody declared, so nothing `init` merely *inferred* reaches this
  argument — never a directory listing on its own, and never the repo's
  name, which is not a project at all and is no longer an id source
  anywhere. Where question 2 confirmed no id for a repo, pass `scopes=` and
  say in the plan that the scopes are waiting on `/vwf:architecture` and
  `/vwf:setup`.
- **A changed list is the skill's row**, shown in the repo's section under
  **Tool-config rows**, never a row of `init`'s.

## Plan

One document, printed once, carrying **one section per repo** — the base first,
then each member in resolved order. A repo's section opens with a heading naming
it and the mode it resolved to:

```text
── <repo> ── (shaped)
```

and under that heading come the thirteen sections, in full, for that repo. An
absent member's heading carries its clone row and the survey note the Survey
describes in place of them, since its sections do not exist until the clone
has run.

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

An **offered** row is one of three kinds with a decision in it. Each carries
the path, the three-line summary of pass 6, and a **replace / keep** column
showing the default that pass computed — and each is a row the user may flip
at the consent step below before answering. A **root tool config** row is the
second kind: the path found, the `.config/` path the table names, and a
**move / keep both / delete** column defaulting to move — flipped the same
way, and `delete` reachable only by that flip; the pack-twin case prints as
`kept, pack file not landed` with no column, since nothing is decided. The
**hook manager** row is the third, one at most per repo: the manager found,
and a **keep / switch** column defaulting to keep. `Repo-owned, kept` is a
list and nothing else: paths, an inline task with its file and table, with
the contract note of pass 10 on the rows that earn one, and nothing in it is
ever applied. `Projects` is a list on the same terms: each sub-project
directory pass 1 recognised, once, with the id question 2 confirmed for it —
printed so the reader sees why that directory is in none of the other
sections, and applied nowhere.

An editor **merge** row carries a **collision sub-line** per key the hand
section and the composed set share — `file · key · hand value · pack value ·
choice`, per pass 7 — and the choice is not a default to flip at consent: it
is the recorded answer, or the one the collision round took before the plan
was printed. A `take` or `union` sub-line lists the hand lines the apply
removes, since those are the one edit outside the block and the user reads
them before the one consent rather than after.

**Tool-config rows** are the skill's own, printed as its `preview all`
returns them, each under its `r<n>` id — each drift row with its take
theirs / keep mine / merge choice, each conflict row with its two answers —
and settled on the same one consent, which becomes the real call's
`answers=`.

```text
Moves        <n>
Root tool configs (move / keep both / delete)  <n>
Hook manager (keep / switch)     <n>
Tool-config rows                 <n>
Creates      <n>
Replaces     <n>
Offered (replace / keep)         <n>
Renames      <n>
Rewrites (applied)               <n>
Rewrites (flagged, not applied)  <n>
Repo-owned, kept                 <n>
Projects                         <n>
Appends      <n>
Merges       <n>
```

Close **each repo's section** with that repo's total, **counting only what would
be applied** — `Repo-owned, kept` and `Projects` are outside it, and so are an
offered row whose decision is keep, a root tool config row whose decision is
keep both, and a hook-manager row whose decision is keep. Then close the
document with one **product total**, the per-repo totals summed, so the user
reads one number before the one consent.

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

**Flipping a decision row is an amendment to the plan, not a third answer.**
Each row of `Offered (replace / keep)`, of `Root tool configs` and the
`Hook manager` row arrives carrying the default its pass computed, and before
answering the user may name any of them and set it — replace or keep; move,
keep both or delete; keep or switch. Doing so re-prints the whole plan with
the new decisions in place — a root tool config flipped to move gains its
pass 6 offer row on the re-print, one flipped to keep both loses it — and the
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
repo of the set that resolved to mode `blank` or `source` takes the
[new repo](new-repo.md) pipeline in its turn, at the same point in the order.

- **Moves** use `git mv`, so the rename is in the index and the history
  follows the file. The readme move is a move like any other, and so is a
  root tool config's — it runs **before** the creates, so the repo's file is
  already at its `.config/` path when the shipped one would land there, and
  pass 6's offer — or the skill's conflict row, where the tool-config table
  names the skill the owner — is what decides between them. A root tool
  config the user picked **delete** for is removed with plain `rm` here.
- **`/stackgen:tool-config all`** runs next, with the arguments pass 9
  computed and `answers=` carrying every row its survey preview returned —
  `ok` for each create, write, fold, move or delete row, the user's pick
  for each conflict or drift row — per [new repo](new-repo.md) §2, so the
  skill asks nothing. It lands the toolchain files and the gates, and folds
  the old ones, per pass 1's toolchain migration.
  `_scripts/local` is written **before** it, since the call replaces the
  helper file.
- **Creates** are the materializer's, by fixed slug, exactly as the new-repo
  pipeline fetches them — every file the plan lists, less the pack twin a
  root tool config row said is **not landed**. `init` never authors
  pack-owned content from scratch. It does write the per-project
  `_default` slots of [new repo](new-repo.md) §7 — creates like any other,
  listed in the plan and applied here. `_scripts/local` is
  the one create that is neither: no pack declares it, and every byte in it
  is carried out of the repo's own helper file by pass 5. **Write it before
  that file is replaced** — the bodies it holds exist in the tree only until
  the replace lands, and a sidecar written afterwards has nothing to copy
  from.
- **After the landing, the steps every mode shares.** Once the creates and
  the replaces are on disk, run [new repo](new-repo.md) **§3** (the secrets
  provider, by the slug question 4 confirmed), **§4** (the three
  placeholders, across every landed *and replaced* file), **§8** (the readme
  stub, the licence and the security file — on this pipeline each is nearly
  always the *already there* case and is reported as kept), **§9** (the two
  bootstrap steps, the trust step first) and **§10** (the aggregator offer),
  in that order and **exactly as that file states them** — read there, not
  restated here. They were the new-repo landing's alone, and the questions
  that feed them were asked in every mode all along; a shaped repo that
  answered them and had nothing run on the answers was the hole. The fill
  passes below run after §4 so a placeholder and a marked position never
  race for one line.
- **Replaced files land before the positions are filled**, and the order is
  load-bearing. A marked position is filled *in the file that will still be
  there afterwards* — fill first and the replace overwrites the fill, which
  is the quiet way a run reports work it did not do. So: every replace and
  every accepted **offered** row lands, and only then does the fill pass of
  §9 run over the tree.
- **A kept file keeps its content, and the fill pass still reaches the marked
  positions inside it.** The keep itself needs no write; only its **record**
  does, and the offered row's keep outcome is what lists
  it. Write that record **after every keep is settled and before the fill
  pass** — one `enforcement.kept_files.<path>: { reason }` entry per kept file
  in the **base's** `.config/vwf.yaml`, spelled as §6 says, merged into the
  block rather than replacing it.
  Where that file does not exist, `init` writes the **stub** §6 names, and
  the record goes into it. Beyond that record, the fills §9 owns, and
  the re-hash below, nothing about a kept file is applied here. The
  collision round's answers are written at the same point and on the same
  terms — one `enforcement.editor_keys.<file>.<key>` entry per answer, the
  file spelled as `kept_files` spells its paths, merged into the block, into
  the same stub where the file is absent.
- **Renames** rewrite the path for a task file, and rewrite the **text** for
  every caller. Use the editing tools for those rewrites — a stream editor's
  in-place flag is not portable across platforms, and the difference is a
  silent no-op or a stray backup file rather than an error.
- **Config-path rewrites** are the same act: a task or hook passing a
  configuration path that just moved needs the new path, and each one was
  listed as its own rename line.
- **Flagged rewrites are not applied.** They are in the report so the user can
  do them.
- **Appends and merges** run after all of the above, per
  [fragments and sections](fragments-and-sections.md), because both are
  idempotent and both read files the earlier steps may have moved. The
  ignore file's is the **section merge** that reference describes — the
  repo's file kept whole, each missing banner section appended, patterns
  compared normalised — and never a whole-file replace or a keep.
- **The hook-manager switch**, where its row was flipped to switch, is the
  **last shaping step**: `setup:precommit --force`, per pass 1, after every
  file above is in its final place and before anything is committed.
- **The re-hash is the last step before the git pass**, and it writes only
  the lockfile. Every file this run **filled, appended to or merged** — the
  slots §9 wrote, the placeholders §4 filled, the ignore sections, the
  editor block — plus every file pass 6
  **replaced or kept**, is hashed as it now stands and that hash recorded
  under its `entries:` record in the materializer's lockfile, creating the
  record for a kept file that had none. The materializer's own hash is the
  landing's, taken before any of this ran; left standing it would report
  every fill this run made as content drift the next morning, in
  `/vwf:doctor` and in the next reshape's pass 6 alike. So the writers are
  three and named: the materializer at landing, pass 6's two outcomes after
  the fills, and this step over everything the run touched after that. A
  file a pack task rewrites later, under its own update flag, reads as drift
  until the next reshape offers it and a keep re-records it — by design. A
  `tool-config/…` record is the skill's to write, and this step skips it.

### A detached member is refused before anything commits

Every repo this run resolved is read for where it stands **before the git pass
begins** — as the plan is composed, beside the survey, so the answer is a plan
row and not a surprise at commit time. The read is one command per repo,
`git symbolic-ref -q HEAD`, run in that repo's own tree: it prints the branch
the repo is on, and prints nothing — exit 1 — when HEAD is detached. A member
brought in as a submodule is detached by construction unless something checked
a branch out after the clone, which is exactly what
[membership](../../../assets/membership.md)'s clone step now does; a member
cloned by hand, or checked out at a tag or a commit to look at something, sits
detached until someone moves it.

**A detached member is a refused plan row.** A commit made on a detached HEAD
belongs to no branch: nothing lists it, the merge tasks cannot reach it, and
the next checkout in that repo leaves it behind — so the shaping commit would
be lost the moment anyone touched the member. The row states the member, the
reason in one line, and the command that fixes it — `git checkout develop`
where the member has a `develop`, else its mainline (`main`, or whatever branch
the member's `origin/HEAD` names, `master` or `trunk` included) — and refuses
that member for this run: its section of the plan is shown as deferred, its
apply is skipped whole, nothing is staged in it, and the base does **not**
stage a gitlink for it, since its recorded commit did not move. The report
repeats the row under that member's heading, the command included, and the
next run — after the checkout — picks the member up as any other. It is the
one refusal in this pipeline that a user clears with a single command, which
is why it is refused rather than worked around: checking a branch out on
someone's behalf is a state change in a repo they may be mid-way through. A
member the clone step reports as **diverged** — its recorded commit on no
remote branch — takes the same row, with the divergence as its reason and
its own unlock: fetch, land the recorded commit on the member's `develop` by
hand — a merge or a rebase, never a force — and re-run.

The base is read on the same terms, though it is the repo the run was invoked
in and almost always on a branch. A detached base halts the whole run at the
plan with the same line — there is nothing a shaping run can commit into a
repository that no branch is tracking.

### The gate configuration commits first, alone

An existing repo may already have its hooks wired, and that changes the order
of what follows. The commit gate reads its configuration from the working
tree, and a configuration file that is **modified but unstaged** aborts every
commit — including the one that would have staged it. So a run that touched
the gate's configuration has to close that file before it can commit anything
else.

**Which hooks this commit runs under is the hook-manager row's answer.** On
**keep** — the default — the commit runs under the foreign manager pass 1
found, whose hooks read their own configuration and not the file this commit
stages, so the commit is committable but proves nothing about the shipped
gate; the plan and the report both say so. Where no row was printed, the
hooks are the gate's or not yet wired, and the commit runs as it always has.
On **switch**, the last shaping step above has already run
`setup:precommit --force`, so this commit is the first one through the
shipped gate, reading the file it stages — which is the point of committing
it alone.

**This happens once per repo, not once per run.** Each repo has its own gate
configuration and its own hooks, wired into its own repository metadata, and a
commit in a member runs the member's hooks against the member's working tree. So
every repo this run touched the gate configuration of takes this commit first,
in its own turn, before its own shaping commit. Doing it once for the run would
leave every other repo's configuration modified-but-unstaged at the moment that
repo came to commit, which is the abort this subsection exists to avoid.

**It lands on `develop`, like every commit this run makes — so the branch work
comes first, then the checkout, and only then is anything staged.** Do this
repo's branch work — the bullet below, the new-repo table's rows read against
a repo that has commits — and check `develop` out, so the gate commit and the
shaping commit after it sit on the branch work flows through. A repo that was
on `main` when the run started is on `develop` from here on, and the report
says so; a repo that was on `develop` already stays put.

Where this run — `/stackgen:tool-config all` included — wrote or moved either
of the gate's configuration file and the commit-message gate's configuration,
stage **those paths only** and commit them first, on their own, with the fixed
message:

```text
ops: update the pre-commit configuration
```

They travel together because they are one change: the commit-message gate's
configuration is what the gate config invokes. Splitting them leaves a commit
whose hooks read a file the next commit is still going to change.

Then the rest, exactly as the new-repo pipeline's **git pass** describes it
([new repo](new-repo.md) §11), which already reads across the resolved repos:
the landing-model question — one row per repo per branch, `develop` and
`main`, each `direct` or `pr`, written to `MERGE_MODEL_DEVELOP` and
`MERGE_MODEL_MAIN` per §11(a) — and the three-answer commit question asked
**once** for the whole run, each repo staging what this run wrote in it, the
fixed shaping message per repo, the commits ordered members then base with the
base's changed gitlinks staged into its own — each made on `develop`, checked
out above — the push, and the
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
- The branches come **before** the commits, not after — this repo has
  commits, so there is something to branch from already, and the commits have
  to land on `develop`. A missing local `develop` or `main` is created from
  its **remote-tracking branch** where one exists — `origin/develop`,
  `origin/main` — never fabricated from the other local branch; only with no
  such remote branch does §11(d)'s table apply, read with its first row set
  aside: create `develop` from `main` where `develop` is missing, `main` from
  `develop` where `main` is missing, and nothing where both exist. A repo
  whose mainline is neither — `master`, `trunk`, or any other name, read from
  `origin/HEAD` or from the branch the repo is on — gets `main` created from
  that mainline and `develop` from `main`; the old branch is left exactly
  where it is, and the report names it as the one to retire by hand, since
  the merge tasks and the forge pass now name the pair alone. Every row ends
  with `develop` checked out — the table's "checked out" column reads
  `develop` for every row, never "as it was". Git refuses the checkout for
  two reasons, and either way that repo takes §11(c)'s **leave it** outcome
  on its own — nothing committed, its line in the report saying the tree is
  written and waiting — rather than a commit on the wrong branch. One: a file
  this run wrote differs between the branch the repo was on and `develop`;
  the unlock is the checkout itself, once the user has set that file aside.
  Two: `develop` is checked out in **another worktree** of the same repo —
  the main checkout, or a linked one under the tree's own worktree directory,
  which is what a repo shaped by these packs looks like — and git holds a
  branch in one tree at a time; the report names the worktree that holds
  `develop`, and the unlock is running the shaping from that tree. A run
  already on `develop`, in whichever tree, needs no switch at all.
- A branch this run just created is one the forge has never seen protected,
  so its `Forge` line is a plain set; the branch the repo already had is the
  one the idempotence check is most likely to report as left alone.

## Report

**The report's shape is SKILL.md's** — the thirteen file sections repeated
under one heading per repo with the base first, the git lines, and the two
next-step lines — and it is stated there once. Read it there; nothing here restates it. What
this pipeline settles is what goes in which section, filled from what was
actually applied rather than from what was planned, and every line printed under
the heading of the repo it happened in. A deferred materialization, a flagged
rewrite, a call to a function nothing defines, an absent member nobody could
clone, a root tool config kept both ways and so unread by the gate, a
`core.hooksPath` set outside the repo, and a reported-but-unmoved root file
all belong in **Deferred**, each with its unlock and each naming the repo it
belongs to. Three things are **not** among them any more: a call the legacy
table could not map — pass 5 moves its function to the sidecar, and the run
reports the move; a **directory that holds a project**, which is listed once
under **Projects**, with its confirmed id, and nowhere else; and a kept-file
record on a product whose base has no `.config/vwf.yaml`, since the stub
gives it a home on the same run.

**The report names the four answers recorded**, per repo, beside the values
the plan said would be passed — so a reshape on a product whose config
carried no `answers:` block visibly gains one, and a forge the run rewrote
because the live `origin` host contradicted the record is a line of its own
rather than a silent edit.

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
second run reads a file whose content matches the hash the re-hash recorded —
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
