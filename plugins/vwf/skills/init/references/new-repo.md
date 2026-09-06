# The New-Repo Pipeline

Read this in mode **new** — a target with no configuration directory and no
task library. Nothing here reads or moves a source file, so it is safe on a
repository that has code but has never been shaped.

The six questions in SKILL.md are already answered. Present the whole plan
below, get **one** consent, then apply it in this order. The order is the
contract: a step that runs early because it happens to be cheap produces a
tree the next step has to undo.

## 1 — The repository itself

Where there is none, create the repository with **`develop`** as its initial
branch, and stop there. No second branch, no commit, no remote.

`main` is created in **§11**, off the first commit, and the reason is
mechanical: a repository with no commit has an unborn HEAD, so there is
nothing for a second branch to point at. Creating `develop` first and `main`
from the first commit is also the branch model itself — work flows from a
feature branch or a worktree into `develop`, and from `develop` into `main` —
so the branch a fresh repository sits on is the one work lands in.

Where a repository already exists, leave its branches alone **here**. §11 is
what creates whichever of the two the branch model needs and the repo lacks,
after the commit question, so the branch work reads against a tree this run has
already written to.

Report what was created and what was already there. The rest of the git work —
staging, the commit, the branches, the forge default, the push — is §11, the
git pass, and that step is the only other one in this pipeline that touches
git.

## 2 — The three baselines

Materialize the three unconditional bundles by their fixed slugs, through the
stack adapter (`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`), invoking
`/<plugin>:<plugin>-stack-template <slug>` once per slug. Fetch them in the
**composition order the materializer documents** — the toolchain manager, then
the gates, then hygiene — because a later component's file wins where two
write the same path, and getting the order wrong silently lands the wrong
version of a shared file.

Each landing is the materializer's own consent line. **A decline is a
deferral, not a halt**: record what was skipped and name its unlock — run
`/vwf:setup reshape` with the write consented — then continue with the rest
of the pipeline. This is the same rule `/vwf:setup`'s tooling step follows,
and it matters most here, where a repo that has picked no stack is the normal
case rather than a fault.

## 3 — The secrets provider

Materialize the bundle whose slug the user picked at question 4, by that slug,
through the same adapter. **Last**, after the three baselines — a provider's
files are the most specific answer anything gives to the slot they overlay,
and the composition order puts them there.

A user who answered **none — decide later** gets nothing here. Record it as a
deferral whose unlock is a later `/vwf:setup reshape` run, and say plainly that
the slot the packs left for it will announce itself as unconfigured until then.

## 4 — The placeholders

Three, and no others: `<REPO_URL>`, `<YEAR>` and `<HOLDER>`. The hygiene
pack's conventions are authoritative for what each means; fill every
occurrence across every landed file, from:

| Placeholder  | Source                                                        |
| ------------ | ------------------------------------------------------------- |
| `<REPO_URL>` | the origin remote's web URL, no trailing slash                |
| `<YEAR>`     | the current year                                              |
| `<HOLDER>`   | `git config user.name`, confirmed in the plan before applying |

A placeholder whose source is missing — no origin remote, no configured name
— is **asked**, once, rather than guessed or left in place. A `<` surviving in
a landed file after this step is a bug, not a template.

## 5 — The ignore sections

Append one section per detected stack to the hygiene pack's sectioned ignore
file, per [fragments and sections](fragments-and-sections.md).

**The detected stack is what the materializer's lockfile records** — the
language, package-manager and app-framework components it lists — and nothing
else. On a repo that has picked no stack the lockfile names none, the step
appends nothing, and that is correct: the baseline sections cover what every
repo needs, and a section for a language nobody chose is a guess.

## 6 — The hook fragments

Merge every fragment the landed packs dropped into the gate config, per
[fragments and sections](fragments-and-sections.md). On a new repo this is the
first merge, so every fragment present is appended; the algorithm is the same
one a re-run uses.

## 7 — The project ids, and the three things they fill

Resolve the project ids, in this order of preference:

1. the **registry ids** in `.config/vwf.yaml`, where the file exists and names
   projects;
2. otherwise each **sub-project directory** name;
3. otherwise, for a single-project repo, the **repo's own name**.

**Source 1 is live only on a re-run.** `.config/vwf.yaml` is written by
`/vwf:setup`, which runs *after* `init`, so a first run on a fresh repo always
falls through to source 2 or 3. That is not a defect to route around — it is
why SKILL.md's re-run doctrine names the moment after the registry exists as
one of the times to run `init` again, and why a later run may resolve a
*different* id for the same project. The existing-repo pipeline reports that
as an **id source changed**, never as a pack that moved.

**Then slugify.** The resolved id is not used raw: it is slugified per the
stack adapter's `assets/ids.md`, which owns the rule and is the only place it
is written down. The reason is measured rather than stylistic, and the asset
states it: the toolchain manager reads a per-project group's directory name as
the task's **last** segment once the group's default slot collapses into it,
and strips what looks like a file extension from that segment — so an id
carrying a dot silently loses everything after it, and the task the repo shows
a user is not the task it has. The flag and alias grammars the same list fills
are the second reason. Read the asset; never re-derive the rule here.

**Then confirm, before anything is written.** The resolution order and the
slugification above are how `init` *proposes* this list, and a proposal is all
they are: SKILL.md's **question 2** shows every row — the name, the slug and
which of the three sources the name came from — and takes a replacement for any
of them, slugified by the same asset. The ids that reach the surfaces below are
the ones that question **confirmed**, carried from the answer. Nothing here
re-derives them, and nothing downstream re-derives them either.

That list is one list with **three** surfaces — the per-project task groups,
the bootstrap aggregator's **member flags**, and the **shell aliases** that
shorten them — so resolve it once and fill all three from it. A multi-repo
product's members come from the same detection `/vwf:setup` already does: the
registry's `members:` list, or the submodule names where the repo declares
them.

### The marked positions

**Three**, and with the `_default` slot below they are the four things this
section fills. Two are per-project and one is repo-level.

The toolchain pack ships the flag list and the alias list as **commented
templates in place**, each with a note saying the ids come from the registry
or the member directories — that is, from this list. Those comments are the
pack asking `init` for the one thing no pack can know, and filling them is not
authoring pack-owned content; it is answering the question the pack left open.

Write the real lines at those two positions, one per id in the resolved order,
copying the commented example's spelling exactly — the flag's own help text
shape, and the alias's own left-hand and right-hand shape — and leave the
surrounding comment in place as the record of where the list came from.

**A single-project repo has no members, so both positions stay exactly as
shipped.** There is no flag and no alias to write, the aggregator's
widen-the-scope flag is then a no-op that a caller passes without knowing the
repo's shape, and deleting either comment would cost the next run — after the
repo grows a second project — the template it fills.

**The third is the repo's own name**, `REPO_NAME`, a marked position in the
toolchain manager's environment block. It takes the **repo** slug **as question
2 confirmed it** — the name question 1 proposed, slugified, then accepted or
replaced on that list's first row — and it is written **literally**, never
derived at read time from the directory the config sits in: a linked
worktree's config root is named for the branch, so a derived value would
change identity every time somebody cut one.

That key exists because the things that vary only by repo — the per-repo
launch aliases the user keeps — belong in the **user's own global
configuration**, reading the value the repo publishes. They are not this
pipeline's to write, and `init` never writes outside the target repo. What
`init` owes is the value; what reads it is somebody else's file.

### The `_default` slot

For each id — the **slugified** id, since the group's directory name is what
the toolchain manager parses — create one `_default` slot in the task
library's per-project group. **This is the one file `init` authors rather than
copies**, and packs
cannot supply it: no pack can know a project's name. Copy the shape of a
marked slot the toolchain pack already landed — its marker comment, its
sourced helper, its always-exit-0 contract — and change what it prints. Do not
write the body from scratch; that shape belongs to the pack's conventions.
Set the exec bit, as every file in that tree carries one.

**What it prints is its own one-liner, not the shared unfilled-slot notice.**
That notice closes by telling the reader to pin the repo's stack and
materialize the packs that fill it, which is the right instruction for a slot
waiting on a stack and the wrong one here: a project that has no commands yet
is not a repo missing a stack, and sending the reader to pin one is sending
them to fix something that is not broken. So the slot keeps the marker — that
is what lists it among the repo's unfilled slots — prints **"no project tasks
yet"** through the pack's own print vocabulary, and exits 0.

## 8 — The readme stub and the licence

Per [readme and licence](readme-and-license.md). Both are placed here, after
the packs have landed, so a pack shipping either would have been caught by the
materializer's own root allowlist rather than silently overwritten.

## 9 — Bootstrap

Run the two bootstrap steps the toolchain pack documents, **in the pack's own
order** — the **trust** step first, then the task that makes every file in the
task library executable.

Both are documented in the pack's **task-library reference**, and reading it
is the step rather than a footnote to it:

- **The trust step** is its own section there, titled for the fact that
  matters — that it comes before everything else — and it names the repo
  `init` has just laid the payload into as one of the two cases it exists
  for. It carries the exact form to run and why the narrower form is wrong
  (the pack ships a config *split*, and the narrow form trusts one file of
  it), a table of what an untrusted config costs under each of the manager's
  two trust settings, and the pipeline and linked-worktree cases. The pack's
  **conventions** state the same doctrine in one paragraph, and its skill's
  bootstrap section restates it; the reference is where the detail is.
- **The executable-bit step** is in that same reference's task-file anatomy,
  which is also what explains the symptom: the manager runs a task file
  directly, so one without the bit fails as an *unknown task* rather than as
  a permission error.

**Why trust goes first, stated honestly**, because the reference's own table
is more interesting than "it would not work otherwise": under the manager's
stricter setting an untrusted config makes the second step fail outright,
while under the default it is silently auto-trusted and the step runs. What
breaks either way is **discovery** — listing the library at all — which is how
both a human and an agent find out the tasks exist, and what a later step in
this pipeline probes before deciding what to run. Neither column is a working
repo, so the order stands.

Read both there and run what they say, rather than re-implementing the steps
or re-spelling their commands here. A step those files do not document is a
step `init` does not invent.

Where the manager's own binary is not installed, this step **defers** with its
unlock — install the manager, then run `/vwf:setup reshape` — and the run
continues to the report. Everything above it has already landed on disk.

## 10 — Offer the bootstrap aggregator

**Only if §9 actually ran.** The aggregator is a task, and a task library that
was never made discoverable has no task to run — so where §9 deferred, this
step offers nothing. Repeat the deferral in one sentence, naming the same
unlock §9 named, and move on. Offering a step that cannot succeed reads as a
choice the user has, and the failure it produces looks like a broken
aggregator rather than a missing manager.

Where §9 ran, offer once, to run the task library's bootstrap aggregator now.
It is the step that installs the pinned tools, wires the gate hooks and
reaches the secrets provider, and on a fresh repository it is long — so it is
an **offer**, never automatic, and a decline needs no re-asking.

Whichever way it goes, name the task so a user who declined knows what to run.

## 11 — The git pass

The one step that touches git beyond §1, and the last thing before the report.
Everything above has landed on disk and nothing is staged; a repository shaped
and left dirty is a repository whose next command — a commit, a worktree, a
merge — meets a working tree it did not expect.

Run it in this order.

### (a) Stage exactly what this run wrote

Every path in the run's own written / moved / renamed lists, and nothing else.
Not `git add -A`: a repo that already had untracked work of its own does not
get it swept into a commit whose message says the shape was laid down.

### (b) One consent, three answers

Ask once, showing the **file count** and the **branch** first so the answer is
given against facts rather than a promise:

- **commit** — commit what was staged, locally;
- **commit and push** — the same commit, then (e);
- **leave it** — stage nothing further, write no commit, and say in the report
  that the tree is staged and waiting.

On either committing answer, make the commit with the toolchain manager's
execution wrapper — `mise x -- git commit` — as
[git-workflow](../../git-workflow/SKILL.md) spells it, and never with the
verification-skipping flag. The message is **fixed**, and it is the one a real
first run used:

```text
ops: shape the repo with the toolchain, gates and hygiene baselines
```

`ops` because the commit-message gate's closed type set is what the gate this
run just installed will read it against, and shaping a repo is operations, not
a feature.

**The new-repo first commit precedes hook wiring by construction, and that is
the whole answer to the branch guard.** The gates pack ships a hook that
refuses commits on the protected branch; it is wired only when the bootstrap
aggregator runs, and on this path §10 offers that aggregator *after* this
commit — §9 made the library discoverable and wired nothing. So the guard is
not in place yet and never sees the first commit. Nothing is disabled, nothing
is skipped, and the hook ships exactly as the pack wrote it. On an existing
repo the hooks may already be wired, which is why that pipeline commits the
gate configuration first and on its own.

### (c) The branches

Only after the commit exists, because the whole reason §1 stopped at one
branch is that a repository with no commit has nothing to branch from:

| The repository had          | Create                 | Leave checked out |
| --------------------------- | ---------------------- | ----------------- |
| no commits (§1 created it)  | `main`, from HEAD      | `develop`         |
| `main` only                 | `develop`, from `main` | as it was         |
| `develop` only              | `main`, from `develop` | as it was         |
| both                        | nothing                | as it was         |

Both branches exist afterwards, whichever way the repo arrived. That is the
branch model, and it does not depend on which one a forge calls default: work
flows from a feature branch or a worktree into `develop`, and from `develop`
into `main`. A repo missing one of the two has merge tasks that cannot run.

Where the answer at (b) was **leave it**, there is no commit to branch from on
a fresh repository — record the branch work as a deferral with its unlock (the
commit), and create nothing. On a repo that already had commits, create the
missing branch anyway: it costs nothing and it is what the merge tasks need.

### (d) The forge default

Ask which branch should be the **default branch on the remote forge**, with
`develop` preselected. Then run the toolchain pack's own task for it —
`mise run setup:default-branch <answer>` — and **report only what the task
reported.**

The task decides what is possible: where it finds a forge CLI and a remote it
sets the default; where it does not it prints the command a human can run.
`init` never inspects the forge, never names one, and never chooses between
CLIs — that knowledge is the pack's, and putting it here is exactly the naming
this skill's hard rules forbid.

Ask this even where there is no remote. The answer is a decision about the
repository, the task's printed form is a usable record of it, and re-asking
after a remote appears is a question the user has already answered.

### (e) The push

Only where (b)'s answer was **commit and push** *and* an origin remote exists.
Push `develop` and `main`, each with upstream tracking set, and report both.

No remote and a push answer is not a failure: report it as a deferral whose
unlock is adding the remote and pushing by hand, and say which branches are
waiting.

### What the report carries

Branches created, the commit's short hash, what was pushed, and the forge
task's own words. That is the git section SKILL.md's report specifies.

## 12 — The report

The six-section report and the two next-step lines, exactly as SKILL.md
specifies. A new repo's report is mostly *files written*; *files moved* and
*tasks renamed* read `none`, which is the honest shape of a tree that had
nothing to reconcile.
