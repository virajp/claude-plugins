# The New-Repo Pipeline

Read this in mode **blank** and in mode **source** — the two modes of
SKILL.md's three whose repo carries no stack-adapter lockfile, so nothing has
landed there yet. Mode **shaped** is [existing repo](existing-repo.md)'s. A
`blank` repo runs this landing alone. A `source` repo — one with a language
manifest, a source directory, a root tool config or a `.config/` without the
lockfile — runs this landing **plus** the read-before-land passes below, so a
tree that already holds something is read before a pack lands beside it.
Nothing here reads or moves a source file in either mode.

The seven questions in SKILL.md are already answered. Present the whole plan
below, get **one** consent, then apply it in this order. The order is the
contract: a step that runs early because it happens to be cheap produces a
tree the next step has to undo.

Everything below runs **once per repo that resolved to `blank` or `source`** —
every such member first, in the resolved order, then the base — under that one
plan and that one consent.

## What `source` mode borrows

A `source` repo runs four of the existing pipeline's survey passes, by their
numbers in [existing repo](existing-repo.md), before this pipeline's §2 and
inside the same one plan: **pass 1**, the root files against the allowlist,
always — a root tool config is exactly what that pass exists to read; **pass
6**, the replace-or-keep offer, always, over every path §2 below hands it;
**pass 3**, the task names against the legacy table, and **pass 5**, the helper
library and its `_scripts/local` sidecar, **only where a task library exists**
— a `.config/` that carries one is `source` evidence like any other, and a task
library nobody surveyed is one the landing would flatten. The other passes read
files only a landing leaves behind and have nothing to read here. Their rows
sit in that repo's section of the plan beside this pipeline's, in pass order,
and their outcomes take the same report lines the existing pipeline gives them.

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
the landing model, staging, the commit, the branches, the push, and the forge
pass after it — is §11, the git pass, and that step is the only other one in
this pipeline that touches git. Nothing in **this** step reaches a remote:
`init` never creates one, and what it sets on the forge is §11(f)'s alone —
the default branch, the protection on `develop` and `main`, and the backlog
project, on their own consent, and nothing else the forge holds.

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

**Every conflict the dry-run lists is a row, in every mode.** The
materializer's dry-run names each target path that already exists and that no
lockfile of this repo records — a file the repo wrote itself — as a
**conflict**, never a write. In this pipeline each of those becomes a
**pass-6 row**: the replace-or-keep offer, its three-line summary, its default
rule and its record are [existing repo](existing-repo.md) §6's, run over that
path exactly as that pass runs it over a diverged file, and a keep is recorded
under `enforcement.kept_files` as §6 records one — in the base's config, the
member's path as prefix. The rows are shown **before** the one consent, one
per conflict, so a `blank` repo that happens to hold one such file — and a
`source` repo, which usually does — never has it silently skipped and never
has it silently overwritten. Three root files are not offered at all: a
readme, a licence and a security file the repo already carries are kept on
the already-there rule in [readme and licence](readme-and-license.md), and
reported as kept.

**The record has a home in every mode, because `init` makes one.** Where no
`.config/vwf.yaml` exists in the base — the ordinary case on a first run, since
`/vwf:setup` is what writes the file in full — `init` writes a **stub** there,
in the plan as one create row, carrying exactly two blocks and nothing else:
`config_format`, at the value `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`'s
schema heading names, and `enforcement`, holding `kept_files` and
`editor_keys`. No roster, no product name, no project — every other key is
`/vwf:setup`'s, and its migration and fill passes complete the stub on the run
that follows, reading the two blocks it finds as their own. So a keep, and an
editor-key answer under §6's collision rule, is always **recorded**, in a
member's turn as much as the base's; there is no Deferred line for either
record, and nothing is re-asked on the next reshape for want of the file.

## 3 — The secrets provider

Runs in **every mode** — a `shaped` repo reaches it from
[existing repo](existing-repo.md)'s post-landing paragraph, after that
pipeline's landing and before the git pass, on exactly the terms below.

Materialize the bundle whose slug the user picked at question 4, by that slug,
through the same adapter. **Last**, after the three baselines — a provider's
files are the most specific answer anything gives to the slot they overlay,
and the composition order puts them there.

A user who answered **none — decide later** gets nothing here. Record it as a
deferral whose unlock is a later `/vwf:setup reshape` run, and say plainly that
the slot the packs left for it will announce itself as unconfigured until then.

## 4 — The placeholders

Runs in **every mode**, after the mode's landing and before the git pass —
the `shaped` pipeline reaches it from
[existing repo](existing-repo.md)'s post-landing paragraph — over every file
this run landed or replaced, in whichever mode it landed.

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

**Two occurrences of `<REPO_URL>` are the security contact's, not the repo
URL's.** In the hygiene pack's `SECURITY.md` that token is the whole reporting
channel, and it takes question 6b's answer as typed — a URL or an email —
spliced by the contact procedure in [readme and licence](readme-and-license.md)
rather than filled here. The issue-template chooser's *Report a vulnerability*
entry follows the same answer: its `url:` takes the contact where the contact
is a URL, and the whole entry is **removed** where the contact is an email or
the row was declined, since that link must be a web address. Every other
occurrence is the origin URL, per the table.

## 5 — The ignore sections, and the two runtime positions

Append one section per language to the hygiene pack's sectioned ignore file,
per [fragments and sections](fragments-and-sections.md).

**The languages are what SKILL.md's stack read produced** — the pins where a
config exists, else the lockfile's language, package-manager and app-framework
components, else, in `source` mode, the manifests its table names at the root
and in every sub-project directory — and nothing else. The read is one answer
per repo, taken before the plan; this step does not re-read. Whatever the
source, that answer is spelled in the read's six language keys — a pin token
or a lockfile component slug was mapped onto one key by the hygiene pack's
own table before it counted, so no raw slug reaches this step. Each language
it produced resolves to a template through that same table, the
algorithm's step 1, and a `source` repo carrying a `package.json` therefore
gets the node section on its **first** run, not after some later pin. A
`blank` repo's read produced nothing, the step appends nothing, and that is
correct: the baseline sections cover what every repo needs, and a section for
a language nobody has is a guess.

### The two runtime positions

The toolchain pack's base config carries **two marked positions** the stack
read fills, in the same file the environment block sits in: `RUNTIME_BLOCK`,
the per-runtime settings, and `PATH_ENTRIES`, the project-local binaries the
shell finds without a runner prefix. The pack's comment at each position
names the lines each runtime takes; this step writes, from the same read §5
used, **one runtime's lines per language the read produced** at the first,
and at the second the entry a language needs — **left empty** where no
language the read produced needs one. A `blank` repo fills both as empty,
which is exactly what the pack ships; nothing is invented for a runtime the
repo does not have. Both are marked positions, so a filled value is what the
hash splice in [existing repo](existing-repo.md) §6 ignores — filling them is
never content drift, and they are re-filled on every run the read changes,
keep or no keep, like every other position §7 enumerates.

## 6 — The hook fragments

Merge every fragment the landed packs dropped into the gate config, per
[fragments and sections](fragments-and-sections.md). On a new repo this is the
first merge, so every fragment present is appended; the algorithm is the same
one a re-run uses.

## 7 — The project ids, the repo name, and the positions they fill

The fills this section enumerates run in **every mode**, but on a `shaped`
repo [existing repo](existing-repo.md)'s **pass 9** already owns them — it
surveys each marked position, shows the row, and applies the fill by this
section's rules — so the existing pipeline does not run this section a second
time after its landing; it reaches §3, §4, §8, §9 and §10 from its post-landing
paragraph and takes the fills from its own pass. A `blank` or `source` repo
runs this section as written.

Resolve the project ids **for the repo this pass is running in**, in this order
of preference.

On the **base**:

1. the **registry ids** in `.config/vwf.yaml`, where the file exists and names
   projects;
2. otherwise each **sub-project directory** name — the term SKILL.md's
   question 2 defines once, and the definition below spells the files for;
3. otherwise the project's **type** — the platform token SKILL.md's question 2
   asks for, per project, from the closed per-role lists
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/registry.yaml` carries.

On a **member**, the same three steps, with the first one reading a hop out —
the list that knows which projects live in a member is the base's:

1. the **`projects:` list on this member's entry** in the base's
   `.config/vwf.yaml`, where that file exists and declares one;
2. otherwise each **sub-project directory** name inside the member, by the
   same definition;
3. otherwise the same **type** question, asked for that member's project.

**The sub-project directory, by file.** SKILL.md's question 2 owns the
definition: with a registry, its `projects[].path` list; without one, in
`source` mode only, a non-root directory that carries its own language
manifest from the stack read's table, or that a workspace file at the root
enumerates as a member — and `docs/`, `scripts/`, `.config/`, `.github/` and
any dot-directory never qualify. The workspace files that enumerate members
are these, read for the member paths or globs they list and nothing else:

```text
pnpm-workspace.yaml     the `packages:` globs
melos.yaml              the `packages:` globs
Cargo.toml              a `[workspace]` table's `members`
go.work                 its `use` directives
```

A glob is expanded against the tree and each directory it matches is one
sub-project; a directory the glob matches that carries no manifest is still
one, since the workspace file is the declaration. A `blank` repo has none of
these files and proposes no sub-project.

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
both times. `.config/vwf.yaml`'s projects are written by `/vwf:setup`, which
runs *after* `init` — the stub §2 leaves names none — so a first run on a
fresh product always falls through to source 2 or 3 in every repo. That is not
a defect to route around — it is why SKILL.md's
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

**Nine**, and with the `_default` slot below they are the ten things this
section enumerates. Only the `_default` slot comes from the id list. Two are
**per member repo**, three are repo-level — the repo-name key among them,
filled from SKILL.md's **question 1** — two are the plugin task's, filled from
SKILL.md's **question 5**, and the last two are the toolchain config's
**runtime positions**, filled from the stack read by **§5** and enumerated
here because this is the one section that lists every marked position, so the
splice below reaches them.

**The pack's payload is where each one is marked**, by a comment and nothing
else: a `MARKED POSITION` block above the value, for the seven that sit in the
toolchain manager's config and task files, and the commented template itself
for the flag and alias lists, which stands where those lines go. There is no
marker syntax a tool could enumerate, so the set is exactly the positions this
section lists — read it from here, never from the payload.

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

**A keep on the file carrying a position does not stop the fill.** Every marked
position this section fills sits in a pack-owned file, and where the
existing-repo pipeline offered that file and the answer was **keep**, the
repo's own content stays and the position is written anyway: a keep covers the
content somebody customised, never a marked position's value, which these fills
own in either pipeline. [existing repo](existing-repo.md) §6 states that once,
together with the second test that keeps it consistent — on a hash mismatch it
splices the repo's current values, at every position this section enumerates
that the file carries, into the pack's payload, and a file diverging only
inside them is never offered. That splice reaches all ten; the fill on a kept
file governs **eight** of them — the two runtime positions §5 fills among
them — and not only the plugin task's two. `MERGE_MODEL_DEVELOP` and
`MERGE_MODEL_MAIN` are the ninth and tenth, and they are §11(a)'s: the git
pass writes them only in a repo whose environment-block file this run lands or
replaces, so a kept file keeps the values those positions already hold — or
the one legacy `MERGE_MODEL` key an older file carries in their place. Being
spliced like the rest is what stops §6 reading those values as content; no
survey pass owns them, so no pass shows a row for them either.

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

**The fourth, fifth and sixth are repo-level too**, and the toolchain pack
ships all three as marked positions in that same environment block, each with a
comment saying what it takes. `MEMBERS` is written here, literally, by the same
rule `REPO_NAME` follows. `MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN` are
**not written by this section at all**: §11(a) asks for them inside the git
pass and writes them there, in every repo whose environment-block file this run
lands or replaces and nowhere else.

The pair is how work lands, **one value per long-lived branch**: the merge
task for `develop` reads the first, the one for `main` reads the second, and
the pack's comment names the two values each takes — `direct`, which merges
locally and pushes, and `pr`, which pushes the branch and opens a pull request
instead. The values are **asked in §11**, inside the git pass, and written there
before that step stages — not as a numbered question, because they are a
decision about landing and the git pass is where landing is decided. A repo
whose positions are left as shipped runs on the pack's defaults, `direct` into
`develop` and `pr` into `main`. An older file carrying the single legacy key
`MERGE_MODEL` is read as both values until a reshape writes the pair.

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

**The seventh and eighth are the plugin task's two lists** — the further plugin
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

**The ninth and tenth are the two runtime positions** — `RUNTIME_BLOCK` and
`PATH_ENTRIES` in the toolchain pack's base config — and they are **§5's** to
fill, from the stack read, not this section's. They are listed here for the
one reason the landing pair is: the splice above has to know every position a
file carries, and a value at either of them is a fill, never content.

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

## 8 — The readme stub, the licence and the security file

Runs in **every mode**, after the mode's landing and before the git pass —
the `shaped` pipeline reaches it from
[existing repo](existing-repo.md)'s post-landing paragraph — since questions
3, 6a and 6b are asked whatever the mode, and a repo shaped years ago is as
entitled to its answers as a blank one.

Per [readme and licence](readme-and-license.md) — the stub, the licence
question 6a answered, and the security contact 6b answered, each on that
reference's already-there rule, so a file the repo carries is kept and
reported rather than written over. All three are placed here, after the packs
have landed, so a pack shipping any of them would have been caught by the
materializer's own root allowlist rather than silently overwritten.

## 9 — Bootstrap

Runs in **every mode**, after the mode's landing and before the git pass —
the `shaped` pipeline reaches it from
[existing repo](existing-repo.md)'s post-landing paragraph. On a repo whose
config was trusted and whose task files carried the bit already, both steps
change nothing and say so; a task file this run created, replaced or renamed
is exactly what the second step exists for, in every mode.

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

Runs in **every mode**, after the mode's landing and before the git pass —
the `shaped` pipeline reaches it from
[existing repo](existing-repo.md)'s post-landing paragraph — and it is an
offer there too: a reshape that moved a pin or landed a provider has tools to
install and hooks to wire exactly as a first run does.

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

**This pass runs inside each repo, like the rest of the pipeline — but its
questions are asked once, for the product.** The landing model and the commit
answer are asked in **one round each**, by the first repo to reach this step —
the landing table listing every repo's rows at once, the commit answer one
answer for all — and every repo after it applies what that round already gave
rather than asking again. A question re-asked per repo would be asking the
user to sit through the same round several times; what varies by repo is
carried as rows of the one table, answered together, so a product whose repos
land differently is decided in one sitting and read back in one report. The
forge pass, (f), is the same shape one step later: it runs **after every repo
has pushed**, and asks its one consent for the whole product.

Because the pipeline runs the **members first, in the resolved order, then the
base**, the repos reach this pass in that order too — and that is what lets the
base's commit record each member at the commit this run just gave it. A base
that committed first would record the members as they were before the run
touched them.

**Before the pass, one read per repo: where it stands.** In each resolved repo
that already has commits, `git symbolic-ref -q HEAD` names the branch checked
out. A repo that answers is on a branch, and (d) takes it from there. A repo
that answers nothing is **detached**, and a detached member is a **refused
plan row**, not a repo that commits: the row names the branch to check out —
`develop` where the member has it, else its mainline — that member's shaping
is deferred under *Deferred* with that checkout as the unlock, and the base's
gitlink for it is **not** moved. A commit on a detached HEAD belongs to no
branch and is lost the moment somebody checks one out, which is worse than not
committing. The mechanics — the read's place before the gate-first commit, the
row's wording — are [existing repo](existing-repo.md)'s, and the clone step in
`${CLAUDE_PLUGIN_ROOT}/assets/membership.md` checks the member out on its
default branch so a member this run cloned never arrives detached.

Run it in this order.

### (a) The landing model

Ask, in one round **and once for the whole product**, which way work lands on
each of the two long-lived branches — **one row per repo per branch**, in the
order the repos run, each row taking one of two values: **`direct`** — *merge
locally and push*; or **`pr`** — *push the branch and open a pull request*.
Only a repo whose environment-block file this run lands or replaces gets rows;
a repo keeping that file is listed under the table with what it keeps, per the
next paragraph.

| Repo     | Branch    | Preselected | Position              |
| -------- | --------- | ----------- | --------------------- |
| `<repo>` | `develop` | `direct`    | `MERGE_MODEL_DEVELOP` |
| `<repo>` | `main`    | `pr`        | `MERGE_MODEL_MAIN`    |

The preselections are what the toolchain pack ships, and they are the same
for every repo: work into `develop` is the day's landing and needs no reviewer
between a green branch and the integration line, while `main` takes nothing
but `develop` and is where a review gate earns its keep. A repo may answer
differently from its siblings — each repo carries its own block, and each
one's merge tasks read their own copy. Write each row's answer literally at
that repo's marked position §7 described, and count each as a fill.

**A repo that kept that file keeps the values those positions hold**, and what
decides that is the kind of position it is, not the keep. The landing model is a
real, working value under its comment — filled from the moment the file landed,
as [existing repo](existing-repo.md) §9 says of that kind — so it is written
where this run **lands or replaces** the environment-block file and nowhere
else, and a kept file is neither. The file's other two positions — `REPO_NAME`
and `MEMBERS` — are a different matter: §7 fills those, keep or no keep. Say so
on that repo's line in the report, naming the values it keeps and the file
that was kept, so a reader sees one decision rather than a repo that silently
landed on the pack's defaults. A kept file that still carries the
single legacy key `MERGE_MODEL` keeps it too, and its line reads **"legacy
`MERGE_MODEL` — read as both until reshape"**: every reader takes the one value
for both branches, and a run that replaces the file is what writes the pair.

It is asked here rather than as one of SKILL.md's numbered questions because it
decides how work lands, which is what the rest of this pass is about; and it is
asked **before** (b) so the file it writes is in what (b) stages.

`init` does not act on the answers. The merge tasks read them, and what `pr`
mode does about opening the pull request is the pack's business — naming that
is exactly the naming this skill's hard rules forbid.

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

On either committing answer, first **check out `develop`, creating it per
(d)'s table** — the ops commit lands on `develop` in every mode, never on
`main` and never on whatever branch the repo happened to be standing on; the
table's *Create* column is what makes `develop` exist to check out, and the
mainline row is why a repo arriving on `master` or `trunk` still commits on
`develop`. Then make each commit with the toolchain manager's execution
wrapper — `mise x -- git commit` — as
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

The table is read against the repo this pass is running in, and the pair is
created in **every** repo that lacks it: a member is a repository, its merge
tasks are its own, and a member with one of the two missing has merge tasks
that cannot run however well the base is shaped. The rows split by when they
run: a repo that already had commits takes its row **before** (c)'s commit,
because that commit lands on `develop` and `develop` has to exist first; a
fresh repository takes the first row **after** the commit, because the whole
reason §1 stopped at one branch is that a repository with no commit has
nothing to branch from.

| The repository had                   | Create                                             | Checked out |
| ------------------------------------ | -------------------------------------------------- | ----------- |
| no commits (§1 created it)           | `main`, from HEAD, after the commit                | `develop`   |
| `main` only                          | `develop`, from `main`                             | `develop`   |
| `develop` only                       | `main`, from `develop`                             | `develop`   |
| both                                 | nothing                                            | `develop`   |
| neither — a mainline of another name | `main`, from that mainline; `develop`, from `main` | `develop`   |

Both branches exist afterwards and `develop` is checked out, whichever way the
repo arrived. That is the branch model, and it does not depend on which one a
forge calls default: work flows from a feature branch or a worktree into
`develop`, and from `develop` into `main`. The names are **fixed** — the merge
tasks, the commit gate's branch guard and the forge pass all spell them — which
is why the last row exists: a repo whose mainline is `master`, `trunk` or any
other name gets the pair created beside it, the old branch is **left in
place**, untouched and unreported to the forge, and the run's summary names it
on that repo's `Branches created` line as *`<name>` left — retire by hand* so
the user decides when it goes. The mainline is the branch the repo stood on at
the HEAD read above; where it stood on some branch that is neither, and `main`
or `develop` exists, the row for what exists applies and the odd branch is
simply not the mainline.

Where the answer at (c) was **leave it**, there is no commit to branch from on
a fresh repository — record the branch work as a deferral with its unlock (the
commit), and create nothing. On a repo that already had commits, create the
missing branches anyway and check out `develop`: it costs nothing and it is
what the merge tasks need.

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

### (f) The forge pass

The one step that writes to the forge, and it runs **once for the product,
after the last repo has pushed** — the base's push, in the order above. It
sets three things and no fourth: each repo's **default branch**, the
**protection** on its `develop` and `main`, and the product's **backlog
project**. Everything else the forge holds — who may push, who reviews,
required checks, the repo's description, its visibility — is nobody's here.
The pass never creates a remote and never pushes: a repo reaches it already
pushed or does not reach it at all.

**Eligibility.** A repo takes the pass only where (c)'s answer was **commit
and push** and (e) actually pushed it. A repo whose answer was **commit** or
**leave it**, or that had no remote, is listed as `pending` on its `Forge`
line with that reason, and nothing is set for it — a default branch on a forge
that does not have the branch yet is a setting the next push has to undo. A
run that pushed nothing skips the whole step in one line.

**The precondition, per repo**, is the same shape the backlog skill's is
(`${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md` §Precondition),
and a miss here is **never a stop**: report the reason on that repo's `Forge`
line, print the by-hand list below for it, and continue with the next repo.

1. The forge, from the `origin` host: `github.com` or any host
   `gh auth status` lists is GitHub; `gitlab.com` or any host
   `glab auth status` lists is GitLab; anything else has no CLI here and takes
   the by-hand list outright.
2. The CLI on `PATH` — `command -v gh`, `command -v glab`.
3. Logged in to that host — `gh auth status --hostname <host>`,
   `glab auth status --hostname <host>`. On GitHub the token needs the `repo`
   scope, which is what the same command's `Token scopes:` line shows.
4. **Admin on the repo is not tested up front.** A ruleset write without it
   is refused by the forge, and that refusal is reported on the `Forge` line
   the same way a failed login is — reason named, by-hand list printed, run
   continuing.

**The visibility default, read at question 6.** The same precondition is what
lets question 6 propose a default before the plan, and the read is this — run
in each repo that has an `origin`, at question time, and never again:

```text
gh repo view --json visibility --jq .visibility          → PUBLIC | PRIVATE | INTERNAL
glab repo view --output json --jq .visibility            → public | private | internal
```

`INTERNAL` and `internal` propose `private`. No `origin`, a forge with no
CLI, a precondition miss or a failed read all propose `private` — and the
question says which of them it was, so a user who expected `public` learns
why they did not get it. The value is only a **default**: the row is still
answered, and what the forge says is never written anywhere in the tree.

**The plan for the pass, and its one consent.** Before writing anything,
build the per-repo table and show it once: the repo, the default branch it
will set, the protection it will add to each of `develop` and `main`, and,
for each of those, whether the forge already carries one — then the backlog
line for the base. One question, apply or stop; a stop prints the same table
as the by-hand list and the run continues to the report. The table is built
from these reads, in this order:

- **The default branch.** One row per repo, **`develop` preselected** and
  `main` the other. The branch model does not depend on the answer — work
  flows into `develop` and from there into `main` either way — but a forge
  opens pull requests, shows a landing page and clones against its default,
  and `develop` is where that traffic belongs on a product whose `main` takes
  nothing but merges. Nothing in the tree records the answer: the forge is
  the record, and doctor's predicate (g) reads it back from there.
- **The protection, both branches, always**: no force-push and no deletion.
  Then **per branch, from that branch's own value** — `MERGE_MODEL_DEVELOP`
  for `develop`, `MERGE_MODEL_MAIN` for `main`, as (a) wrote them, or the
  legacy `MERGE_MODEL` for both where a kept file still carries it: where the
  value is **`pr`**, additionally **require a pull request**, with no approval
  count, because the landing model says that branch lands through a request,
  so a direct push to it is exactly what the forge should refuse. Where it is
  `direct` the merge tasks push the merge themselves, and a
  require-pull-request rule would refuse the model the user just chose. The
  pack's defaults give `main` the rule and `develop` not. A repo whose pair
  was created beside a mainline of another name gets the rows for `develop`
  and `main` alone; the old branch is neither set default nor protected.
- **The idempotence check, per branch.** A branch that is already protected
  in any form is **left exactly as it is** and reported as such — never
  merged with, never replaced, however different its rules are from the two
  above. On GitHub: a ruleset named `vwf-<branch>` in
  `gh api repos/{owner}/{repo}/rulesets`, any rule at all in
  `gh api repos/{owner}/{repo}/rules/branches/<branch>`, or a classic
  protection answering at
  `gh api repos/{owner}/{repo}/branches/<branch>/protection`. On GitLab: the
  branch's name in `glab api projects/:id/protected_branches`. The default
  branch is set regardless — it is one value, and setting it to what it
  already is changes nothing.

**The writes, per forge.** Each is one call per repo or per branch; their
exact text is here so nothing is improvised at apply time.

GitHub — the default branch, then one **ruleset** per branch, named
`vwf-<branch>`, through the rulesets endpoint and never the classic
protection one:

```text
gh repo edit --default-branch <branch>

gh api repos/{owner}/{repo}/rulesets --method POST --input - <<'JSON'
{
  "name": "vwf-<branch>",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/<branch>"], "exclude": [] } },
  "rules": [
    { "type": "non_fast_forward" },
    { "type": "deletion" },
    { "type": "pull_request",
      "parameters": { "required_approving_review_count": 0,
                      "dismiss_stale_reviews_on_push": false,
                      "require_code_owner_review": false,
                      "require_last_push_approval": false,
                      "required_review_thread_resolution": false } }
  ]
}
JSON
```

The third rule is present **only where that branch's value is `pr`**; where
it is `direct` the `rules` list is the first two — so under the pack's
defaults the `vwf-main` ruleset carries three rules and `vwf-develop` two. The
payload is passed as a file or on standard input, never assembled from `-f`
fields — a nested object does not survive that.

GitLab — the default branch, then one **protected branch** per branch, with
force-push refused; a protected branch cannot be deleted, which is the second
rule for free:

```text
glab repo update --defaultBranch <branch>

glab api projects/:id/protected_branches --method POST \
  -f name=<branch> -F allow_force_push=false \
  -F push_access_level=<level> -F merge_access_level=30
```

`<level>` is read per branch from that branch's value: `30` under `direct` —
developers may push, which is what the merge tasks do — and `0` under `pr`,
where nobody pushes to the branch directly and it takes merges alone, which
is how GitLab spells *require a merge request*.

Any other forge: print the table as the by-hand list and set nothing.

**The backlog project, base only, last.** It is the backlog skill's, and
`init` never runs `gh project create` or anything like it — a project made
that way carries no template. What `init` does is **invoke that skill's
missing-project procedure by name**
(`${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md` §Missing project):
the skill's own precondition — which needs the `project` scope this pass did
not — the browser hand-over with the URL and the two settings, the title rule,
the wait for the word, the re-find, and the field bootstrap afterwards, all
exactly as that reference spells them. Before invoking it, resolve the project
as that reference does; one **present** is reported `present` and skipped.
On GitLab, print the skill's own "not yet supported" line on the `Backlog
project` line and continue. On another forge, ask the user to create it by
hand and say so on the line. A decline inside the procedure, or a precondition
miss on the `project` scope, reads `pending` with its reason — the next
`/vwf:backlog add` reaches the same procedure.

**The by-hand list** is what a repo gets wherever the pass could not act for
it — no CLI for the forge, a failed precondition, a refused call, or the
consent declined. It is the same table, printed for that repo alone, in the
words a person applies on the forge's settings pages: set the default branch
to `<branch>`; on `develop` and on `main`, refuse force-pushes and deletion,
and require a pull request on whichever of the two has its landing model set
to `pr`; and, for the base, create the backlog project per the backlog skill.
The hygiene pack's `CONTRIBUTING.md`, at the repo's root, carries the same
by-hand form of the default-branch line, so the list points there rather than
restating it.

### What the report carries

The **landing model**, each repo's pair on its line — `develop` and `main`
each with theirs, or the kept value it keeps; then branches created (and, on
that line, a mainline of another name left for the user to retire), the
commit's short hash, what was pushed and what the forge pass set — all **one
line per repo**, in the order the repos ran — the members, then the base. A
member refused for standing detached takes its *Deferred* line instead, naming
the branch to check out. Then one `Gitlinks staged <n>` line for the base,
counting the member pointers (b) added to its index, which reads `none` in a
product with no members, and one `Backlog project` line, the base's alone.
That is the git section SKILL.md's report specifies.

## 12 — The report

The thirteen-section report and the two next-step lines, exactly as SKILL.md
specifies — including how the sections are grouped when a run shaped more
than one repo, which is written down there and is not restated here. A
`blank` repo's report is mostly *files written*; *files replaced*,
*files kept*, *files moved*, *tasks renamed*, *tasks kept* and *calls
rewritten* all read `none`, which is the honest shape of a tree that had
nothing to reconcile. A `source` repo's report carries whatever the borrowed
passes did — a root config moved by pass 1, a conflict kept or replaced by
pass 6, and, where a task library existed, what passes 3 and 5 renamed and
moved — on the same lines the existing pipeline prints them on.
