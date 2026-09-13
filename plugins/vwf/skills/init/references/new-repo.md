# The New-Repo Pipeline

Read this in mode **new** — a target with no configuration directory and no
task library. Nothing here reads or moves a source file, so it is safe on a
repository that has code but has never been shaped.

The seven questions in SKILL.md are already answered. Present the whole plan
below, get **one** consent, then apply it in this order. The order is the
contract: a step that runs early because it happens to be cheap produces a
tree the next step has to undo.

Everything below runs **once per repo that resolved to mode new** — every such
member first, in the resolved order, then the base — under that one plan and
that one consent.

## 1 — The repository itself

"The repository" is the repo this pass is running in — the base on the base's
pass, that member on a member's.

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

**A resolved member is never created here.** "Where there is none" means a repo
that is genuinely new — in practice the base, where the run started outside any
repository at all. A member is a repo the product already declares and that
exists somewhere; one that is missing from this machine is **absent**, not
uncreated, and absence is answered by the **clone row** in the plan, not by
`git init`. Creating an empty repo at a member's path would fill that path with
something that shares nothing but a name with the repo the product means — and
the clone that should have landed there afterwards then has nowhere to go.

So: a member with a clone source is cloned by its row and shaped in this same
run, and by the time this pass runs in it the repo is on disk and already had
commits. A member with **no** clone source gets no row at all: report it as
absent and uncloneable under *Deferred*, naming the unlock — add it to the
product's membership with a source it can be cloned from, then run
`/vwf:setup reshape` — and shape nothing at that path.

Report what was created and what was already there. The rest of the git work —
the landing model, staging, the commit, the branches, the push — is §11, the
git pass, and that step is the only other one in this pipeline that touches
git. Nothing in either step reaches the remote's own settings: which branch a
forge calls default is a one-time act somebody performs there, not a step a
run repeats.

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

## 7 — The project ids, the repo name, and the positions they fill

Resolve the project ids **for the repo this pass is running in**, in this order
of preference.

On the **base**:

1. the **registry ids** in `.config/vwf.yaml`, where the file exists and names
   projects;
2. otherwise each **sub-project directory** name;
3. otherwise the project's **type** — the platform token SKILL.md's question 2
   asks for, per project, from the closed per-role lists
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/registry.yaml` carries.

On a **member**, the same three steps, with the first one reading a hop out —
the list that knows which projects live in a member is the base's:

1. the **`projects:` list on this member's entry** in the base's
   `.config/vwf.yaml`, where that file exists and declares one;
2. otherwise each **sub-project directory** name inside the member;
3. otherwise the same **type** question, asked for that member's project.

**The repo's own name is not a source, on either list.** It was the third step
until 2026-09-14 and it named the wrong thing: a task group's segment says what
a task acts **on**, and the repo is where the task lives, not what it operates
on. The repo's name has exactly one surface now — `REPO_NAME`, from question
1's folder name — and it reaches no task group.

**Two projects in one repo resolving to the same token** are proposed as
`<token>-<directory-slug>` each. A group's segment is a directory name in the
task library, so two groups cannot share one; across repos there is nothing to
resolve, since each repo's task library is its own.

Each repo resolves its own ids and fills its own task groups from them. Its
`REPO_NAME` comes from question 1's folder name and from nothing on this list.
The base's project list is never reused for a member: two repos in one product
share a blueprint, not a task vocabulary.

**Source 1 is live only on a re-run**, on either list — and it is the same file
both times. `.config/vwf.yaml` is written by `/vwf:setup`, which runs *after*
`init`, so a first run on a fresh product always falls through to source 2 or 3
in every repo. That is not a defect to route around — it is why SKILL.md's
re-run doctrine names the moment after the registry exists as one of the times
to run `init` again, and why a later run may resolve a *different* id for the
same project. The existing-repo pipeline reports that as an **id source
changed**, never as a pack that moved.

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
they are: SKILL.md's **question 2** shows every row — grouped by repo, one row
per project, each carrying the name, the slug and which source the name came
from — and takes a replacement for any of them, slugified by the same asset.
The ids that reach the surfaces below are the ones that question
**confirmed**, carried from the answer. Nothing here re-derives them, and
nothing downstream re-derives them either.

**Three lists fill three surfaces, and no two of them are the same list.** The
per-project **task groups** — and, on **every** run, the first one included,
the commit gate's **scopes** — take the **project ids** resolved above, for the
repo being shaped. A registry, where the repo has one, is where the proposal
those ids came from was read; it is not a condition on the scope fill, which
takes whatever question 2 confirmed either way — the fill itself is stated
once, for both pipelines, in [existing repo](existing-repo.md) §11. `REPO_NAME`
takes the repo's **folder name**, slugified, as question 1 confirmed it — one
value per repo, on no list at all. The bootstrap aggregator's **member flags**
and the **shell aliases** that shorten them take the **member repos** — one
flag and one alias each, in the resolved order, each named by that member's
own slug. Where that slug comes from is the pack's to say, not this section's:
its **task-library reference** states both positions come from the member list
and never from the project ids the `p:` group uses, and the shipped comments
at those positions name the member directories as where the names come from.

They are different lists because those two positions widen the scope to a
**repo**, not to a project: the flag makes the aggregator recurse into a member
and run *that* repo's own task library, which has its own project groups inside
it. A member holding three projects is one flag and one alias, not three: the
other two would name a project the aggregator has no repo to recurse into for,
and a flag that cannot resolve to a directory is a flag that fails at the moment
somebody trusts it.

The members those two positions take are the ones **this run already
resolved**, at the top of the run, and nothing here re-resolves them.

### The marked positions

**Seven**, and with the `_default` slot below they are the eight things this
section fills. Only the `_default` slot comes from the id list. Two are **per
member repo**, three are repo-level — the repo-name key among them, filled from
SKILL.md's **question 1** — and the last two are the plugin task's, filled from
SKILL.md's **question 5**, and they are written here because this is the one
section that fills a marked position.

The toolchain pack ships the flag list and the alias list as **commented
templates in place**, each with a note saying the names come from the registry
or the member directories — that is, from the members. Those comments are the
pack asking `init` for the one thing no pack can know, and filling them is not
authoring pack-owned content; it is answering the question the pack left open.

Write the real lines at those two positions, **one per resolved member repo**,
in the resolved order, copying the commented example's spelling exactly — the
flag's own help text shape, and the alias's own left-hand and right-hand shape
— and leave the surrounding comment in place as the record of where the list
came from. The name each line carries is that member's own slug, as those
comments describe it, never a project id.

**In a repo that kept the file carrying either position, write neither.** Every
marked position this section fills sits in a pack-owned file, and a repo where
that file was offered and **kept** is a repo whose file this run does not touch
— [existing repo](existing-repo.md) states the rule once, and it governs all
seven, not only the plugin task's two. The plan says which position is waiting
on which keep, so the two rows read as one decision.

**A repo with no members leaves both positions exactly as shipped** — a
single-project repo, and a member repo that declares no members of its own,
which is the ordinary case: membership is a base's to declare. There is no flag
and no alias to write, the aggregator's widen-the-scope flag is then a no-op
that a caller passes without knowing the repo's shape, and deleting either
comment would cost the next run — after the product grows a member — the
template it fills.

**A position already carrying lines named for something else is rewritten, not
appended to.** An earlier run filled these two from the *project* ids, so a
reshape finds lines naming projects where members belong. Replace the whole list
with what the members resolve to, and show it in the plan as a **rewrite** row:
a fill row would read as a position that had been sitting as shipped, and the
one thing a user needs to see here is that lines they have seen before are
going away.

**The third is the repo's folder name**, `REPO_NAME`, a marked position in the
toolchain manager's environment block. It takes **this repo's folder name,
slugified** — the basename of its main checkout, proposed by SKILL.md's
**question 1**, then accepted or replaced there — and it is written
**literally**, never derived at read time from the directory the config sits
in: a linked worktree's config root is named for the branch, so a derived value
would change identity every time somebody cut one. That is also why the
proposal reads the **main checkout's** basename rather than the working
directory's.

**No project id reaches this key**, and the two are routinely different: a repo
whose folder is `acme-shop` and whose one project is a service carries
`REPO_NAME = "acme-shop"` beside a `p/service/` group. Each repo fills its own
key from its own folder — a member names the member, never the base.

That key exists because the things that vary only by repo — the per-repo
launch aliases the user keeps — belong in the **user's own global
configuration**, reading the value the repo publishes. They are not this
pipeline's to write, and `init` never writes outside the repos it resolved as
the base and its members. What `init` owes is the value; what reads it is
somebody else's file.

That boundary is what a member run widens, and it widens by exactly one thing:
a sibling member sits outside the base's tree, so "the repo the caller is in" is
no longer the edge. The resolved set is. Nothing outside it is written, and a
path that did not come out of the resolution is not made one by being nearby.

**The fourth and fifth are repo-level too**, and the toolchain pack ships both
as marked positions in that same environment block, each with a comment saying
what it takes. Write both literally, by the same rule `REPO_NAME` follows.

`MERGE_MODEL` is how work lands: the merge tasks read it, and the pack's
comment names its two values — `direct`, the shipped one, which merges locally
and pushes, and `pr`, which pushes the branch and opens a pull request instead.
The value is **asked in §11**, inside the git pass, and written there before
that step stages — it is not a numbered question, because it is a decision
about landing and the git pass is where landing is decided. A repo whose
position is left as shipped runs on `direct`.

`MEMBERS` is the product's other repositories, as paths relative to the repo
root, in the pack's own space-separated spelling. Fill it from the **registry's
members list, and only where the product is multi-repo with sibling linkage**.
Under submodule linkage the repo's own submodule declarations are what the task
library reads, and a repo with no members has nothing to list — in both cases
the position stays exactly as shipped. The registry does not exist on a first
run, so this is re-run work by construction.

**This is the one member-shaped position the members do not always fill**, and
the asymmetry is deliberate rather than an oversight in the two above. The flag
and alias lists are written for every resolved member whatever the linkage,
because nothing else in the repo carries those names; `MEMBERS` under submodule
linkage would be a second copy of a list the version control system already
holds, and a second copy is only a way for the two to disagree.

**The sixth and seventh are the plugin task's two lists** — the further plugin
sources a repo installs from, and the plugins it installs from them — shipped
as commented templates in place like the flag and alias lists, each comment
carrying its own row shape and saying the rows come from the confirmed answer
to the plugin question. They take **question 5's confirmed rows, and only
those**: write them one per line at each position, in the exact shape that
position's comment shows, and leave the comment where it is so a later run can
re-derive the list from the same question rather than from what the file
already says.

A **none** answer — including the one an empty inventory forces — leaves both
positions exactly as shipped, for the same reason a single-project repo leaves
the member flags alone: the template is what the next run fills, and deleting
it costs that run its shape.

The workflow's own plugin is never written at either position, and neither is
whatever it depends on. The task installs both unconditionally, and its
inventory prints them anyway, like every other installed plugin — question 5
is where those two rows are **dropped**, before the question is even offered,
so an answer cannot carry them here.

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

**This pass runs inside each repo, like the rest of the pipeline — but its two
decisions are the product's.** The landing model and the commit answer are asked
**once**, by the first repo to reach this step, and every repo after it applies
the answer already given rather than asking again. Two questions per repo would
be asking the user to decide the same thing several times and letting them
answer inconsistently, which is a product whose merge tasks disagree with each
other.

Because the pipeline runs the **members first, in the resolved order, then the
base**, the repos reach this pass in that order too — and that is what lets the
base's commit record each member at the commit this run just gave it. A base
that committed first would record the members as they were before the run
touched them.

Run it in this order.

### (a) The landing model

Ask, in one round **and once for the whole product**, which way work lands:
**`direct`** — recommended, and what the toolchain pack ships — *merge locally
and push*; or **`pr`** — *push the branch and open a pull request*. Write the
answer literally at the `MERGE_MODEL` marked position §7 described, **in every
repo whose environment-block file this run lands or replaces** — each repo
carries its own block, and each one's merge tasks read their own copy — and
count it as a fill in each.

**A repo that kept that file keeps it whole**, and this pass does not reach into
it. Where the existing-repo pipeline offered the environment-block file as a
diverged pack file and the answer was **keep**, the position is not written:
[existing repo](existing-repo.md)'s kept-file rule wins here exactly as it wins
for the plugin task's two positions, and for the same reason — writing into a
position of a file somebody chose to keep is the overwrite the keep declined.
Say so on that repo's line in the report, naming the value the product chose and
the file that was kept, so a reader sees one decision rather than a repo that
silently landed on `direct`.

It is asked here rather than as one of SKILL.md's numbered questions because it
decides how work lands, which is what the rest of this pass is about; and it is
asked **before** (b) so the file it writes is in what (b) stages.

`init` does not act on the answer. The merge tasks read it, and what `pr` mode
does about opening the pull request is the pack's business — naming that is
exactly the naming this skill's hard rules forbid.

### (b) Stage exactly what this run wrote

Into this repo's own index: every path in **this repo's** written / moved /
renamed lists, and nothing else. Not `git add -A`: a repo that already had
untracked work of its own does not get it swept into a commit whose message says
the shape was laid down.

**Then one addition, in the base only, and it is the one thing `init` stages
that it did not write**: every member path whose recorded commit moved because
that member committed earlier in the run. A superproject records which commit of
each member it is pinned to; shaping a member and committing it moves that
pointer, and the moved pointers are as much this run's result as the files are.
Leaving them unstaged would leave the base half-committed — a report saying the
product is shaped over a tree that still says it is not, which is the one
outcome this whole step exists to prevent. It is stated as an exception rather
than folded into the rule above because it is one: every other path in every
index came out of this run's own lists.

The base's own paths are staged here. Its moved member pointers are staged
inside (c), after the members have committed and before the base does — they do
not exist to stage until then.

### (c) One consent, three answers

Ask once for the product, at the first repo to reach this step, showing the
**file count** and the **branch** first so the answer is given against facts
rather than a promise — and where the run shaped more than one repo, one such
line **per repo**, so what is being agreed to is the whole product. A repo whose
own pass has not run yet has no staged count to show; use the count its section
of the plan carries, and say that is what it is.

- **commit** — commit what was staged, locally;
- **commit and push** — the same commit, then (e);
- **leave it** — stage nothing further, write no commit, and say in the report,
  one line per repo, that its tree is staged and waiting.

Every repo after the first applies that answer without asking again. Each repo
gets its **own** commit, in the order the repos run — the members, then the base
— and there is no commit spanning two repos, because there is no such thing. The
base's moved member pointers are staged, per (b), after the last member has
committed and before the base commits.

A member that was absent and whose clone was declined never ran the pipeline, so
it has nothing staged and is **skipped** here. Say that on its line rather than
printing it as a repo that committed nothing — the two look identical in a
report and mean opposite things.

On either committing answer, make each commit with the toolchain manager's
execution wrapper — `mise x -- git commit` — as
[git-workflow](../../git-workflow/SKILL.md) spells it, and never with the
verification-skipping flag. The message is **fixed**, and the same in every
repo — it is the one a real first run used:

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

### (d) The branches

Only after the commit exists, because the whole reason §1 stopped at one
branch is that a repository with no commit has nothing to branch from. The table
is read against the repo this pass is running in, and the pair is created in
**every** repo that lacks it: a member is a repository, its merge tasks are its
own, and a member with one of the two missing has merge tasks that cannot run
however well the base is shaped.

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

Where the answer at (c) was **leave it**, there is no commit to branch from on
a fresh repository — record the branch work as a deferral with its unlock (the
commit), and create nothing. On a repo that already had commits, create the
missing branch anyway: it costs nothing and it is what the merge tasks need.

### (e) The push

Only where (c)'s answer was **commit and push** *and* an origin remote exists.
Push this repo's `develop` and `main`, each with upstream tracking set, and
report both.

Because each repo runs its own pass, the members push before the base does, and
that order is the one that matters: a base pushed first publishes pointers to
member commits the remote does not have, and the next person to clone it lands
on pointers that resolve to nothing.

No remote and a push answer is not a failure: report it as a deferral whose
unlock is adding the remote and pushing by hand, and say which branches are
waiting. It is that repo's deferral only — the rest of the product still pushes.

### What the report carries

The **landing model once**, since it is one answer for the product; then
branches created, the commit's short hash and what was pushed, **one line per
repo**, in the order the repos ran — the members, then the base. Then one
`Gitlinks staged <n>` line for the base, counting the member pointers (b) added
to its index, which reads `none` in a product with no members. That is the git
section SKILL.md's report specifies.

## 12 — The report

The ten-section report and the two next-step lines, exactly as SKILL.md
specifies — including how the ten sections are grouped when a run shaped more
than one repo, which is written down there and is not restated here. A new
repo's report is mostly *files written*; *files replaced*,
*files kept*, *files moved*, *tasks renamed*, *tasks kept* and *calls
rewritten* all read `none`, which is the honest shape of a tree that had
nothing to reconcile.
