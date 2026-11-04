# The Existing-Repo Pipeline

Read this in modes **`shaped`** — a target with a `.config/bootstrap.toml` — and
**`old layout`** — a target with `.config/stackgen.yaml` or an older mise layout
and no `.config/bootstrap.toml`. Something shaped this repo before, and the job
is to reconcile `init`'s own files against what the repo now carries, without
discarding a decision somebody made on purpose. SKILL.md's Step 0 decides the
mode; this file never re-derives it. Everything else about the shape —
the root files, the task names, the helper files, the ignore file, the hooks —
is bootstrap's `docs/sync`, reached through SKILL.md's bootstrap step, and
`init` reads none of it.

**This file is also the home of the pass the other two modes borrow.** A
**`source`** or **`blank`** repo takes the [new repo](new-repo.md) landing and
runs *Missing files* below. Everything else in this file is this pipeline's.

Three phases, in order and never interleaved: **survey**, **plan**, **apply**.
The survey writes nothing in the repo. The plan is one document. The apply
touches only what the survey listed, after the bootstrap step.

**All three run across the resolved repo set, not across one repo.** The survey
runs its passes **in each repo** that resolved to this pipeline's modes. The plan
is still one document, printed once, with **one section per repo** — the base
first, then each member in resolved order. The apply touches the repos in
**members-then-base order**, so the base's gitlinks are current by the time it
commits. A repo of the set that resolved to mode `blank` or `source` takes the
[new repo](new-repo.md) pipeline in its own section of that same document, under
the same one consent; nothing about the set changes which pipeline a repo reads.

## Survey

Exhaustive before anything is printed, and it writes nothing in the repo. It
starts with one read per `shaped` repo, whether it is green, by the read
SKILL.md's bootstrap step states, its trust check included: where it is not, the
bootstrap step is a row of that repo's section, and an `old layout` repo always
carries that row. That read executes code before the one consent and refreshes
bootstrap's clone under `~/.cache/bootstrap`, as SKILL.md's *The same read is
what a survey does* states. Two read-only passes then run **per repo**: each
reads, and reports on, the repo it is running in and no other.

**An absent member is surveyed once its clone has run.** A member the resolution
found and this machine does not have has nothing on disk to read, so its section
opens with a **clone row** — the command the membership asset names for this
product's linkage (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`, *An absent
member*) — followed by the words *surveyed after the clone*. At apply time that
member's clone runs first, then the passes run inside it, then its rows print,
and only then does its own apply proceed. **Nothing is written into an absent
member before its survey has run**, which is the same rule every other repo gets
— the survey is simply later in the wall clock, not skipped.

### 1 — The readme

`README.md` → `readme.md`, as a move. **Content untouched** — this is a
rename, and every word in the file survives it. A repo already carrying
`readme.md` needs nothing; a repo carrying both is reported as a conflict for
the user rather than resolved here.

**Rename the callers too.** A moved readme that something still links under its
old spelling is a broken link that passes every check, so scan the tree for the
old name — relative links in other markdown files, a task description or help
line that names it, a manifest field or a docs config that points at it — and
list each occurrence as its own rename line, `old → new` at `file:line`, applied
with the move. A link into the file (`README.md#section`) is rewritten the same
way and keeps its anchor. Nothing is rewritten on a repo where the move itself is
not happening.

### 2 — Missing files

**Runs in every mode, over `init`'s own hygiene assets only**: the files `init`
would write. No materializer is called, and nothing a pack or bootstrap landed
reaches this pass.

Diff **the repo this pass is running in** against what the hygiene assets carry
— the same set for every repo, since the shape is per repo. Every asset that
repo lacks is a **create**, listed with where it comes from, unless
`enforcement.kept_files` already records its path. A create row may be struck
from the plan before the consent, which is a **keep**, recorded below.

**A hygiene asset the repo already has is kept**, on the already-there rule of
[hygiene assets](readme-and-license.md): **kept, never replaced, and reported as
kept** — no offer, no default to flip, and no `kept_files` entry, since nothing
was decided. **Every spelling of the licence file counts as carrying one** —
`LICENSE`, `LICENSE.md`, `LICENCE`, `COPYING` — not the one name the allowlist
happens to land: a repo licensed under any of them is licensed, and a licence
text landed beside it is a second licence. This pass finds each spelling by name,
in any mode, and it becomes that report line and nothing else.

**Recording a keep.** A struck create is a settled decline, and it is recorded in
`.config/vwf.yaml` under **`enforcement.kept_files`** — a map of
`<path>: { reason: <one line> }`. A path recorded there is not offered again by a
later run, and `/vwf:doctor` reads the same record to skip the file. The reason
travels with it, in the user's own words where they gave one. The record is
written in **every mode**, into the stub [new repo](new-repo.md)'s hygiene step
describes where the base has no config file yet. Files bootstrap writes are never
recorded here: its own `mise run setup:configs --dry-run` judges them.

**One record for the product, and it is the base's.** A member carries no
`.config/vwf.yaml` of its own — its file is the back-link, and the base's is the
product's only one — so a keep inside a member is recorded there, keyed by the
path relative to the base root with the member's path as its prefix
(`backend/CONTRIBUTING.md`), while a keep in the base keeps its plain spelling.

**That key is the one thing `init` writes into `.config/vwf.yaml`.** The
entry is written under the same single consent as everything else, merged
into whatever the block already holds, and an absent `kept_files` block reads
as empty. Where the base stopped at the bootstrap step, a member's keep has no
home on this run: it is listed under *Deferred*, and the next run offers the row
again.

## Plan

One document, printed once, carrying **one section per repo** — the base first,
then each member in resolved order. A repo's section opens with a heading naming
it and the mode it resolved to:

```text
── <repo> ── (shaped)
```

and under that heading come the sections below, in full, for that repo. An
absent member's heading carries its clone row and the survey note the Survey
describes in place of them, since its sections do not exist until the clone
has run.

Each section opens with its count; each line is `old → new` for anything that
moves or is renamed, `+ path` for anything created, and a bare path with its
reason for anything flagged. Print an empty section as `none` rather than
omitting it — a missing section reads as an oversight, and the reader cannot
tell which. Every path is spelled relative to the repo the section belongs to;
the heading is what says which repo that is.

```text
Bootstrap step               run | not needed — green
Old values file              delete .config/stackgen.yaml if the repository is green | none
Uncommitted sync             if bootstrap leaves its sync uncommitted, commit it first
Moves                  <n>
Renames                <n>
Creates                <n>
Kept                   <n>
```

Close **each repo's section** with that repo's total, **counting only what would
be applied** — `Kept` is outside it. Then close the document with one **product
total**, the per-repo totals summed, so the user reads one number before the one
consent. The conditional `Uncommitted sync` line is printed for every repo that
takes the bootstrap step, and counts for nothing until it happens. A delete line
under `Old values file` counts as one, so a green repo holding that file never
totals zero.

A **product** total of zero, with no repo taking the bootstrap step, is the
idempotent case: the document is still printed with a section per repo, each
reading nothing, the skill says **the product is shaped**, and the report prints
— then the forge pass reads the forge, and no other question is asked. **One repo
of the set reading nothing is not that case**: the plan is printed and the one
question is still asked, because another repo has work, and a section reading
nothing is how the user sees that the shaped repo was looked at rather than
skipped.

## Consent

**One question, two answers**: apply all of it, or stop. Not per file, not per
section, and **not per repo** — one yes covers every repo's section, the clone
rows included. Applying is itself answered as SKILL.md's one plan says, **commit**
or **commit and push**.

**Striking a create row is an amendment to the plan, not a third answer.** Before
answering, the user may name any create row of *Missing files* and strike it.
Doing so re-prints the whole plan with the row under `Kept`, and the same one
question follows it. So the consent stays single — one yes over one document.
`init` never walks the rows asking.

A stop is a clean exit. Print the plan again as the record of what was not
done, and name `/vwf:setup reshape` as the way to revisit it. A struck row is not
recorded anywhere by a stop: nothing was applied, so the next run offers it
afresh.

## Apply

**Repo by repo, members first and the base last**, and inside a repo in the
order SKILL.md's *The apply order* states, touching **nothing** the survey did
not list. A member cleared for cloning is cloned first, surveyed and its rows
printed; a repo of the set that resolved to mode `blank` or `source` takes the
[new repo](new-repo.md) pipeline in its turn, at the same point in the order.

- **The bootstrap step** runs first, as SKILL.md states it — once for the base,
  the prompt covering the members — and its gate decides which repos continue. A
  repo with no `.config/bootstrap.toml` after it stops there, per SKILL.md, and
  nothing below reaches it. `.config/stackgen.yaml` goes where the repo read
  green.
- **The readme move** is a `git mv`, so the history follows the file, and
  [new repo](new-repo.md)'s commit step places it. Made earlier, it would sit in
  the index and ride the sync commit. Its caller rewrites are plain edits, made
  here.
- **Creates** are `init`'s hygiene assets, copied as
  [hygiene assets](readme-and-license.md) states and exactly as
  [new repo](new-repo.md)'s *The hygiene assets* lands them — every file the plan
  lists. `init` never authors asset content from scratch.
- **After the creates, the steps every mode shares.** Run
  [new repo](new-repo.md)'s *The placeholders*, across every landed file, and
  *The readme stub, the licence and the security file* — on this pipeline each is
  nearly always the *already there* case and is reported as kept — in that order
  and **exactly as that file states them**.
- **A kept file keeps its content.** Write the record **once every keep is
  settled** — one `enforcement.kept_files.<path>: { reason }` entry per struck
  create in the **base's** `.config/vwf.yaml`, spelled as *Missing files* says,
  merged into the block rather than replacing it. Where that file does not exist,
  `init` writes the **stub** [new repo](new-repo.md)'s hygiene step names, and the
  record goes into it.
- **Then [new repo](new-repo.md)'s commit step and forge pass**, read there and
  not restated here.

### A detached member is refused before anything commits

Every repo this run resolved is read for where it stands **as the plan is
composed**, beside the survey, so the answer is a plan row and not a surprise at
commit time. The read is one command per repo, `git symbolic-ref -q HEAD`, run in
that repo's own tree: it prints the branch the repo is on, and prints nothing —
exit 1 — when HEAD is detached. A member brought in as a submodule is detached by
construction unless something checked a branch out after the clone, which is
exactly what [membership](../../../assets/membership.md)'s clone step now does; a
member cloned by hand, or checked out at a tag or a commit to look at something,
sits detached until someone moves it.

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

## Report

**The report's shape is SKILL.md's** — the file sections repeated under one
heading per repo with the base first, the git lines, and the two next-step lines
— and it is stated there once. Read it there; nothing here restates it. What this
pipeline settles is what goes in which section, filled from what was actually
applied rather than from what was planned, and every line printed under the
heading of the repo it happened in. An absent member nobody could clone, a
refused detached member and a keep with no home all belong in **Deferred**, each
with its unlock and each naming the repo it belongs to.

`Files kept` names each hygiene file the repo already carried and each struck
create, with the reason beside it. It is a section of things this run
deliberately did **not** touch, which is exactly why it is printed: a file left
alone silently reads the same as a file nobody looked at.

**The invariant, stated in the report itself:** running `init` again on a shaped
repo that reads green and holds no `.config/stackgen.yaml` produces an empty plan,
and on a shaped product an empty
section for **every** repo. If a second run finds work, it is one of four things,
and the report names which: the first run deferred something; **bootstrap moved**
— the repo no longer reads green, and the bootstrap step brings it up to date;
**the set changed** — a member joined the product, or one this machine lacked was
cloned, and that member's section is the whole of the work; or **a hygiene asset
went missing** — someone deleted a file the run had landed, and it is a create
again.

**A keep is made once**: a struck create is recorded under `kept_files`, so it is
not offered again. An existing file is never offered at all.
