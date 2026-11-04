---
name: init
description: Hand a new or existing repo, and every member repo it has, to
  bootstrap for the repo shape — tool configs, mise, gates, hooks, branch model,
  secrets tools, Claude plugins — through bootstrap's readme prompt, then land
  init's own hygiene files, the kept_files record and the forge pass. Surveys
  the whole product, shows one plan with a section per repo, applies on one
  consent. Stack-agnostic; it writes no tool config of its own. Invoked by
  /vwf:setup — its Step 0
  offer, or /vwf:setup reshape — and never typed by a user.
model: sonnet

user-invocable: false
disable-model-invocation: false
---

# init — Shape the repo the rest of the workflow runs in

> **Called by `/vwf:setup`, never typed.** `user-invocable: false` is what keeps
> `init` out of the `/` menu, which is short on purpose;
> `disable-model-invocation: false` is what keeps setup's call working, because
> a user-only skill is removed from the model's context entirely and the
> invocation would be a silent no-op rather than an error. `/vwf:setup` is the
> only caller: its Step 0 offers `init` when the repo shape is missing or has
> drifted, and `/vwf:setup reshape` forces that offer.

`init` sets up the **base repo and every member repo the product has**;
`/vwf:setup` sets up **vwf** in the base. The two
are a pair and neither does the other's job: everything a repository needs
before it has a product is this command's to arrange, and everything about
`docs/blueprint/`, `.config/vwf.yaml` and the memory tree stays `/vwf:setup`'s
— with one key excepted, `enforcement.kept_files`, a thing only a shaping run
can know about. Run `init` first on a repo that has neither.

**bootstrap owns the repo shape.** Every universal file — the tool configs, the
mise files and the task library, the gates and hooks, the branch model, the
secrets tools, the ignore and attributes files, the Claude plugins — and each
repo's values file, `.config/bootstrap.toml`, are bootstrap's, and `init` writes
none of them. It reaches them through one step, the bootstrap step below, which
gives the session bootstrap's own readme prompt. bootstrap's `docs/sync` then
asks its own questions, including every value in that file; `init` drafts no
values block and asks none of them.

What `init` writes itself comes from one place: its own **hygiene assets** under
`${CLAUDE_PLUGIN_ROOT}/skills/init/assets/hygiene/`. Beside them it keeps one
record, `kept_files`, and it runs one pass against the forge. `init` decides
*when* those land, *what* the user is asked, and how an existing tree is
reconciled against them.

## Hard rules

- **Writes only what its hygiene assets carry, plus the fills they leave for it
  — in each of the repos Step 0 resolved.**
  Those repos are the whole of its reach: `init` never writes outside the
  repos it **resolved** as the base and its members, and a member that sits
  beside the base rather than inside it is still one of them. Within each
  repo the rule is the same one, applied to that repo's own tree.
  **Placeholders** — `<REPO_URL>`, `<YEAR>` and `<HOLDER>` — are values the
  hygiene assets template into the files they carry;
  [readme and licence](references/readme-and-license.md) is authoritative for
  them. **One key is neither**: `enforcement.kept_files` in `.config/vwf.yaml`,
  where any run — whatever mode the repo resolved — records a hygiene file the
  user chose not to land, so it is never re-offered.
  `init` writes that key and nothing else in that file — and where the file
  does not exist yet, it writes a **stub** to hold it: `config_format` and
  the `enforcement` block alone, per [new repo](references/new-repo.md)'s
  hygiene step, which `/vwf:setup`'s migration and fill passes complete later.
  A file bootstrap writes is never recorded in `kept_files`: bootstrap's own
  `mise run setup:configs --dry-run` judges it. The one other file `init`
  touches is `.config/stackgen.yaml`, the old layout's values file, deleted in
  each green repo per the bootstrap step.
- **Never application code.** Not a source file, not a test, not a directory
  of either.
- **Never a language manifest or a lockfile.** Those declare what the project
  *is*; writing one decides the project's dependencies on its behalf.
- **Never a CI workflow file.** The pipeline that runs the task names belongs
  to the repo.
- **Never `CLAUDE.md`** — that is `/vwf:setup`'s — and **never a readme beyond
  the two-line stub** below, which `/vwf:readme` then fills.
- **One consent, then apply.** The whole plan is presented once and applied on
  one yes. `init` never asks per file and never writes before the yes. The
  questions bootstrap's `docs/sync` asks are bootstrap's own, inside the
  bootstrap step.
- **A tree that is not clean stops the run.** Before the bootstrap step, `init`
  checks every repo, the base and each member. Any tree that is not clean stops
  the whole run before anything is written, and the report lists each dirty
  repo. A repo with no commit and untracked files is not clean, and the report
  says: commit your files, then re-run `/vwf:setup reshape`. A repo with no
  commit and no files is clean. `init` never cleans a tree.
- **The landing is `/vwf:git-workflow`'s.** `init` commits nothing itself and
  has no branch, merge, push or conflict rule of its own: in each repo, members
  before the base, it hands that skill the commits to make and the consent's
  answer, per [new repo](references/new-repo.md)'s commit step. A member standing
  on no branch is a **refused** row naming the branch to check out, its gitlink
  left where it was. **After the base lands comes the forge pass**, on one
  further consent for the whole product: it sets each eligible repo's default
  branch on the forge, protects its core branches there — requiring a pull
  request on whichever has `merge_model = "pr"` in that repo's
  `.config/bootstrap.toml` — and reaches the backlog skill's missing-project
  procedure for the base — those three are the only forge settings it touches.
  It never creates a remote, never pushes, and on a forge it has no CLI for, or
  a CLI it cannot log in with, it prints the by-hand list and carries on. History
  is never rewritten, nothing is force-pushed, and no verification-skipping flag
  is ever passed.
- **Idempotent.** A second run on a shaped **product** with nothing to do
  produces an **empty plan** — one section per repo, each reading nothing — and
  says the product is shaped: every repo reads green, per the bootstrap step,
  holds no `.config/stackgen.yaml` and lacks no hygiene asset. The bootstrap step
  does not run on an empty plan, and the forge pass still reads the forge.
- **A decline is a deferral, never a halt.** A declined write is recorded and
  named with its unlock — run `/vwf:setup reshape` — exactly as `/vwf:setup`'s
  tooling step already defers.

## Step 0 — Resolve the repos, then the mode of each

The repository the caller is already in is not the target; it is the way in.
`init` shapes a **product**, which is one **base repo** and every **member
repo** that base declares, and it resolves that set itself: it still takes no
arguments and reads no flag, so the repos it shapes are the ones it resolved,
never ones it was told. The same holds for each repo's **mode**: `/vwf:setup`
forks its own onboarding on whether a repo is blank or carries code, and that
fork is one input `init` **re-derives** from the tree rather than takes as an
argument — setup's fork stays setup's, for its onboard sub-paths, and the
table in step 4 is `init`'s own.

1. **The base.** Resolve it per
   `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`'s five steps — the asset owns
   them and they are not restated here — including what it does about a run
   started somewhere other than the base. A run started inside a member
   therefore walks up and runs **from the base**, shaping the whole product
   rather than the one repo the user happened to stand in. Say which step hit.

   **`init` takes one step's outcome differently, and it has to.** That
   resolution ends by declaring a repo with no `.config/vwf.yaml` to be no vwf
   repo at all — which is the right answer for every command that reads the
   file and the wrong one here, because a repo that has never been shaped is
   precisely what `init` exists for and that file is written *after* it, by
   `/vwf:setup`. So: follow the asset's hops — the superproject walk and the
   linked-worktree hop — and then, **where it would stop for want of that
   file, take the repo those hops landed in as the base.** `init` never halts
   for a missing `.config/vwf.yaml`; it halts only where the asset's hops
   leave it outside a repository altogether. A base with no config simply has
   no `members:` source, which Step 2 already handles.
2. **The members.** Two sources, and the answer is their **union**: the paths
   `.gitmodules` declares, walked recursively so a member's own members are
   members too, and the `members:` list in `.config/vwf.yaml` — the key
   `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md` owns. **Dedupe on realpath**,
   since the same repo is reachable by more than one spelling of its path.

   **A source that does not exist is not a disagreement.** Where only one of
   the two is present — the usual case, a submodule product with no
   `members:` key yet, or a sibling product with no `.gitmodules` — that
   source's list **is** the member set, whole, and every path in it is
   shaped. Requiring a second declaration nobody wrote would shape nothing on
   the products this exists for.

   Only where **both** sources are present does a path in one and not the
   other become a **membership disagreement**: report it in the plan, name
   both sources and which one carries it, and **never shape that path** — it is
   a declaration the product has not settled, and settling it by picking a
   side would write a repo into the product on `init`'s own authority.
3. **Presence.** A member is **present** when its resolved path exists **and
   is the top level of its own work tree**: asking that path for its work
   tree's top level — `rev-parse --show-toplevel`, run with that path as the
   repository — answers the path itself. Anything else is **absent**, and
   the empty directory is why the test has to be that exact: a clone made
   without recursing leaves each member as a bare directory *inside* the
   superproject's work tree, so the looser question "is this a work tree"
   answers yes about a directory with nothing in it. Presence is detected
   every run and recorded nowhere — the membership asset states why — and an
   absent member is handled below.
4. **The mode of each.** Apply the table below to **every present** resolved
   repo, on what that repo's own tree contains. A base can resolve **shaped**
   while a member resolves **source** or **blank**, and each repo's section of
   the plan says which it got. An absent member has no tree to read yet; its
   mode resolves with its survey, after the clone below.

Detect a repo's mode from that repo itself, and the first row that holds
decides:

| The repo carries                                                                                                               | Mode           |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| **`.config/bootstrap.toml`**                                                                                                   | **shaped**     |
| `.config/stackgen.yaml`, or `.config/mise/conf.d/tools.toml`, `.config/mise/conf.d/env.toml` or a root `.config/mise.dev.toml` | **old layout** |
| none of those, but a **language manifest**, a **source directory**, a **root tool config**, or a `.config/`                    | **source**     |
| none of those                                                                                                                  | **blank**      |

What each mode runs:

- **`shaped`** runs the [existing repo](references/existing-repo.md) pipeline —
  the bootstrap step where the survey reads it as not green, then the survey's
  two passes, the plan, the apply.
- **`old layout`** runs the same pipeline, and the bootstrap step always:
  bootstrap's `docs/sync` moves the old files onto its own layout, and
  `init` deletes `.config/stackgen.yaml` once the repo reads green.
- **`source`** runs the bootstrap step and the [new repo](references/new-repo.md)
  landing **plus** the existing pipeline's *Missing files* pass. A repository
  with code and no values file has never been adopted.
- **`blank`** runs the bootstrap step and the new-repo landing, with the same
  *Missing files* pass.

The evidence is the tree, never a flag, and what is **not** evidence is
`/vwf:setup`'s own definition, stated once in its onboard fork
(`${CLAUDE_PLUGIN_ROOT}/skills/setup/SKILL.md`, *onboard forks once more*): a
readme, a licence, `.gitignore`, `.gitattributes` and a docs tree make a repo
no less blank. `init`'s evidence is one item wider than setup's code test — a
**root tool config** is not code, but it is a file bootstrap's `docs/sync` will
have to migrate, so it resolves `source` here where setup calls the repo blank.
That is the two definitions doing different jobs, not disagreeing.

Say the **resolved set** in one line before doing anything else: the base, then
each member with `present` or `absent`, and each repo's mode with the evidence
that decided it. Where any repo resolved `shaped`, end that line with: the survey
runs `setup:configs --dry-run` in each shaped repo mise trusts, before any
consent: it writes nothing in the repo, refreshes `~/.cache/bootstrap` and runs
bootstrap's `main` with no pin.

### The clean-tree check

Run right after the resolved set, in every present repo, base and members:
`git status --porcelain` must print nothing. Any repo that prints something
stops the **whole run** before a question is asked or a file is written, and the
report lists each dirty repo with what the command printed and its remedy —
commit or set aside the changes, then re-run `/vwf:setup reshape`. For a repo
with no commit and untracked files, the remedy reads: commit your files, then
re-run `/vwf:setup reshape`. A repo with no commit and no files prints nothing
and is clean, and so is a path where no repository exists yet.

The check runs once more on the consent, immediately before the bootstrap step,
on the same terms: the commit step reads what bootstrap left from
`git status`, and that reading is only true of a tree that started clean.

### An absent member

A member that resolved but is not on this machine is neither a halt nor a
reason to skip it. What follows is `init`'s **own** handling, stated here in
full. `${CLAUDE_PLUGIN_ROOT}/assets/membership.md` splits the commands that
need a member's **code** from the ones that do not, and `init` is named in
neither list — it does not read a member's code, it **shapes** one. So that
asset is cited below for exactly one thing, the clone sequence, which it
owns.

**`init` makes no separate offer.** The clone is a **row in the plan**,
covered by the same one yes as everything else, so an absent member is not a
second question in front of the one consent. The row is the asset's **full**
clone sequence for the linkage in force — the clone command it spells for
that linkage, and, under submodule linkage, the branch checkout that follows
it — the remote branch whose history holds the recorded gitlink commit,
checked out at its remote tip, or, where none holds it, a branch at the
recorded commit with the member reported as diverged and deferred — never the
bare clone alone: a submodule arrives detached, and a detached member is a
repo the commit step refuses, so the checkout is what makes the member
shapeable in the same run. The row ends *then survey and shape it*.

An absent member's section holds that clone row **first** and then reads
*surveyed after the clone*: nothing can be surveyed in a directory that is not
there yet. Clone rows run first on the consent, before the bootstrap step, so
the prompt finds every member on disk. That survey runs immediately after the
clone and its checkout and before any write into that repo, opening with the
HEAD read, and its rows are printed then — so the run's output still accounts
for every row, in the order it happened, even though the plan could not.

**On a decline, nothing is cloned.** The clone rows sit inside the one plan,
so the one no that stops the plan stops them too: no directory is created, no
working tree anywhere is touched, and the member is exactly as absent
afterwards as it was before. The decline is recorded nowhere — the next run
asks again, because the usual reason to decline is *not right now*, and that
expires.

A member with **no clone source** — no url recorded under siblings, none
declared under submodules — gets no row at all. It is listed under
**Deferred**, unlock: add the clone source. Shaping it is not possible and
inventing a source for it would be a guess at somebody's remote.

## The questions

Three rounds at most, MCQ where an option set exists, per
`${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`. **A round is one round for the
whole product**, however many repos resolved: a question that differs per repo
shows one row per repo inside its single round, and never becomes a second
round. Question 2 has two dependent parts, 2a and 2b, which together are the
**third round**: they are shown against 2's answers, so they cannot share its
round.

`init` asks nothing about the repo's name, its members, its landing model or its
secrets provider: bootstrap's `docs/sync` decides those, in the values file. It
asks for **project ids** only where one of its own files uses them, and no
hygiene asset does today; a project's task group comes from `/vwf:setup`'s
materialize pass, from a pack's `p/_project/` tasks. What an id is, when one is
needed, is [new repo](references/new-repo.md)'s *The project ids*.

1. **A one-line brief.** *`blank` and `source` repos with no readme only.* What
   the repo is, in a sentence — one row per such repo. **May be empty** — an
   empty brief writes a one-line stub, and `/vwf:readme` fills the rest. A repo
   that already carries a readme has no row and keeps it, per
   [readme and licence](references/readme-and-license.md).
2. **The visibility.** `public` or `private` — **one row per repo** in the one
   round, because visibility is a fact about a repo rather than a product, and
   a private member beside a public base is ordinary enough that one answer
   for all of them would write a licence into somebody's private repo. Each
   row's default is **read from the forge** where that repo has an `origin`
   the forge CLI can answer for — [new repo](references/new-repo.md)'s forge
   pass carries the read — and is `private` where it has no origin or the read
   fails: a repo nobody has published is private until somebody says
   otherwise. The answer is written nowhere in the tree — the forge is the
   record of what a repo is — and what it decides is the shape of the two
   dependent parts below, asked as the third round once every row here is
   answered.

   **2a — The licence.** *Rows for the repos that answered `public` only.*
   MIT, Apache-2.0, or none — one row per such repo, because a licence is a
   file a repo carries and members are licensed separately often enough that
   assuming otherwise writes the wrong text into somebody's repo. The hygiene
   assets carry the two texts; **none** is a legible answer and writes no file,
   in that repo or in any other. A `private` repo gets no row and no
   `LICENSE`: a licence grants the public rights a private repo is not
   offering, and a file granting them is a claim nobody made. A repo that
   already carries a licence file keeps it whatever it answered — and every
   spelling counts as carrying one: `LICENSE`, `LICENSE.md`, `LICENCE` and
   `COPYING` alike, per [readme and licence](references/readme-and-license.md).

   **2b — The security contact.** **One row per repo**, and the row's shape
   follows that repo's visibility. A `public` repo's row is defaulted to
   **that repo's own** origin remote's advisories page where it has an origin,
   and to nothing where it does not. A `private` repo has no advisories page a
   reporter outside it can reach, so its row is a **free contact** — an email
   address or an internal URL — with no default. Declining a row writes no
   security file in that repo either way — a file naming a channel nobody
   watches is worse than none — and declining one row says nothing about the
   others.

Ask them all **before** presenting the plan, so the plan is complete and one yes
covers all of it. These questions come before the bootstrap step, whose
`docs/sync` then asks its own.

## The pipelines

Both pipelines run **per repo** — every resolved repo takes the one its own
mode selected, so a single run may execute both — and they run **members
first, the base last**, so the base commits with its record of the members
already current.

Whichever each repo takes, there is **one plan and one consent for the run**:
each repo contributes a **section** to that plan, the base's first and then
each member's in the resolved order, and the single yes covers all of them.
Two plans would be two chances to stop halfway, which is exactly the state the
one-consent rule exists to prevent.

| Read                                               | When                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| [new repo](references/new-repo.md)                 | modes **blank** and **source**; and the steps every mode shares            |
| [existing repo](references/existing-repo.md)       | modes **shaped** and **old layout**; and the passes the others borrow      |
| [hygiene assets](references/readme-and-license.md) | every mode — the stub, the licence, the security contact, the other assets |

**The one plan carries, per repo:** its mode and evidence, a clone row where it
is absent, the bootstrap step, each hygiene file it would create, **delete
`.config/stackgen.yaml` if the repository is green** where it has that file, and
**if bootstrap leaves its sync uncommitted, commit it first**. Then the one
question: **commit**, or **commit and push**. Commit means commit only, with no
push; commit and push means land and push.

### The apply order

The same order in every mode, on the one consent. The order is the contract.

1. **The clone rows**, then **the clean-tree check** once more.
2. **The bootstrap step**, below — once, for the base.
3. **The gate.** A repo with no `.config/bootstrap.toml` after the step
   **stops there**: it gets no hygiene file, no `kept_files` record, no commit,
   no push and no forge pass, and the report names it with the reason. The other
   repos continue. When the stopped step left bootstrap's files uncommitted, the
   report shows `git status --short` for that repo and says: commit or discard
   bootstrap's partial sync, then re-run `/vwf:setup reshape`. `init` never
   cleans or commits a partial sync. When the stopped repo is the base, the forge
   pass does not run.
4. **The hygiene files**, per [new repo](references/new-repo.md)'s hygiene step,
   placeholders, and readme, licence and security file sections.
5. **`kept_files`**, written into the base's `.config/vwf.yaml`.
6. **The commit step**, through `/vwf:git-workflow`, members before the base.
7. **The forge pass**, once for the product, after the base lands.
8. **The report.**

### The bootstrap step

Give the session this prompt as the instruction, **once, for the base
repository**; the prompt itself covers the submodules and the siblings. Its
source is bootstrap's `README.md`, where it sits under "Copy this prompt into an
AI session in the consumer repository". It does the first adoption, and it also
brings an adopted repository up to date, so `/vwf:setup reshape` reaches both
through this step.

```text
Make this repository, each of its git submodules and each of its sibling
repositories get their shared files from bootstrap. Clone
git@github.com:virajp/bootstrap.git with --filter=blob:none into a temporary
directory. Read docs/sync/index.md in the clone, and do its steps in sequence. Read the other
files of docs/sync/ when index.md tells you to. Apply only what is relevant to
this repository. Ask me before each choice that docs/sync/ does not decide.
```

The prompt is the consent to start. bootstrap's `docs/sync` asks its own
questions, and those answers are the user's to give there — which repos to
include among them. A member the plan refused or that has a membership
disagreement is left out at that question; should it take a sync anyway, it is
reported with `git status --short` and no commit. `init` drafts no values block
and asks none of those questions. It makes no assumption about whether the user
told `docs/sync` to commit its sync or to leave it for review; the commit step
reads which it was.

**Green, per repo, once the step ends.** Green means the repository has
`.config/bootstrap.toml` and `mise run setup:configs --dry-run` shows no change.
Here, once the step ends, that dry-run runs code inside `init`'s one consent: it
writes nothing in the repo, but the repo's own `setup:configs` task refreshes
bootstrap's clone under `~/.cache/bootstrap` and executes the `main` branch of
bootstrap from that clone with no pin, and the trust gate of mise is not tied to
file content, so it does not vouch for either.

Run that dry-run only when mise lists the repo as trusted: `mise trust --show`,
run in that repo, lists a path inside the repo, and every such line reads
`trusted`. A parent's line does not count. Otherwise do not run it: the repo is
**drift unknown**, with the reason `repo not trusted by mise`. That check is a
limit, not a safeguard: it stops only a clone mise has never run.

Read that command by its exit code and its **stderr**, where it prints each line
with the prefix `repo-sync:`:

- After that prefix, a line that starts with `would` — `would update`,
  `would remove`, `would chmod`, `would set bootstrap_commit` — is a change.
  Lines that read `unchanged`, `kept seed` or `skip` are not.
- Exit 0 and no `would` line is **no drift**: green.
- A `would` line is **drift**: not green.
- Exit 5, or any other failure, is **drift unknown**: not green.

**Then `.config/stackgen.yaml`.** In each repository, base and each member, that
has the file and is green, delete it with plain `rm`, on the line the one plan
carried for it. The deletion rides `init`'s own commit in that repository. `init`
reads no value from the file and carries none over: bootstrap's `docs/sync`
decides `[branch.*].merge_model` during adoption, members stay in
`.config/vwf.yaml`, and the forge is read live. A repository that is not green
keeps the file, and the report names it with its reason.

**The same read is what a survey does on a shaped repo.** Where every repo of the
product resolved `shaped`, reads green, holds no `.config/stackgen.yaml` and lacks
no hygiene asset, the plan is empty and the bootstrap step does not run:
`docs/sync` would ask each of its questions again to change nothing. A green repo
that still holds that file is not empty: its section carries the delete line, the
one question is asked, and the deletion rides `init`'s own commit there. Where
every repo reads green, the bootstrap step still does not run, and the survey's
read is the green the deletion goes on. A repo that reads drift, or drift unknown,
takes the step in the plan like any other, and that includes a repo that fails
the trust check, which is not run. This survey read runs before the one consent,
and no consent follows it where the plan comes out empty, as part of the explicit
`/vwf:setup` run the user started: it writes nothing in the repo, but it executes
the repo's own `setup:configs` task, which refreshes bootstrap's clone under
`~/.cache/bootstrap`, and the `main` branch of bootstrap from that clone with no
pin, and the trust gate of mise is not tied to file content. So the resolved-set
line in Step 0 prints this, whatever the plan comes to.

### The record of a keep

**`kept_files` is the one record.** A hygiene asset the repo already has is kept
by the already-there rule, and no record is written for it, since nothing was
decided. What is recorded is a decision: a **create** row for an asset the repo
lacks that the user struck from the plan before answering, per *Missing files* in
[existing repo](references/existing-repo.md). Files bootstrap writes are never
recorded in `kept_files`, in any mode: bootstrap's own `setup:configs --dry-run`
judges them.

## The report

Every run ends with the same report — the file sections, then one git section
for the whole run — each a count and its lines, and an empty section printed as
`none`. The `kept` section counts what this run deliberately left alone, which
is why it is printed at all: a file nobody touched reads the same as a file
nobody looked at.

**The file sections repeat under one heading per repo**, the base first and then
each member by its path, and every count is that repo's own. Nothing is totalled
across repos: a count a reader cannot attribute to a tree is a count they cannot
check.

```text
── <repo> ──
Bootstrap                <green | not green — <reason> | stopped — <reason>>
Old values file          .config/stackgen.yaml — deleted | kept — <reason> | none
Files written     <n>    + <path>            (one per line)
Files kept        <n>    <path> — <the reason>
Files moved       <n>    <old> → <new>
Calls rewritten   <n>    <file:line> <old> → <new>
Deferred          <n>    <what> — unlock: <what would let it happen>
```

A repo the bootstrap step stopped carries its `stopped` line and, where the step
left files uncommitted, the `git status --short` it printed and the remedy: commit
or discard bootstrap's partial sync, then re-run `/vwf:setup reshape`. A run the
clean-tree check stopped prints the dirty repos and their remedies and nothing
else.

Then a **git** section, from the commit step and the forge pass — printed **once
for the run**. The commit, the landing and the forge are **one line per repo**,
in apply order — the members, then the base; and the last two lines are the
base's alone. A member refused for standing on no branch appears under *Deferred*
instead, with the checkout as its unlock. Every line reads `none` where nothing
happened:

```text
Commit                   <repo> <hash> <subject>; <hash> <subject>
Landed            <n>    <repo> <what git-workflow did> | not landed — <its reason>
Gitlinks staged   <n>    <path>              (the base's, one per member)
Forge             <n>    <repo> default <branch>; protected <branches>; <what was left>
Backlog project          <url> | present | pending — <reason>
```

**A repo's `Commit` line names every commit the run made in that repo**, in
the order they were made, each with its short hash and its subject — one line
still, however many there were. A repo where bootstrap left its sync uncommitted
makes **two**: the sync commit first, then `init`'s own files. Any other repo with
something to land makes one, and a repo with nothing to land reads `none`. A repo
whose sync commit landed but whose second commit did not is exactly the case a
single hash would hide.

**The `Landed` line** says what `/vwf:git-workflow` did under the consent's
answer, and a repo it did not land is reported with that skill's reason.

**The `Forge` line is one per repo**, and it says what the forge pass set
there — the default branch, the branches it protected — and what it left: a
setting already present is named as left alone, never as set. A repo the pass
did not reach reads its reason instead — `pending` with the reason where it was
not eligible, `skipped` with the reason where the precondition failed or a call
was refused, `by hand` where the forge has no CLI and the list was printed. The
`Backlog project` line is the base's alone and reads the project's URL, `present`
where one already existed, or `pending` with its reason. Which branch a forge
calls default is no longer an act somebody performs there by hand: the pass sets
it, and the hygiene assets' contribution guide keeps the by-hand form for a forge
the pass cannot reach.

Then the two next-step lines, in this order and always both:

- `/vwf:readme` — fills the readme the stub only opens.
- `/vwf:setup` — brings the repo into vwf's format: `.config/vwf.yaml`, the
  docs tree, the memory tree, `CLAUDE.md`.

Print them as the last thing, and **run neither**. Each resolves its own mode
and reports what it did, which a call from here could only guess at on their
behalf.

The `/vwf:setup` line stays true whichever way `init` was reached. Through
`/vwf:setup reshape`, setup stops once `init` returns, so the line names the
next run; through setup's Step 0 offer, setup is already carrying on past it,
and the line is the record of where control goes back to.

## When it runs again

`init` is not a one-time bootstrap. It is what keeps a repo's **shape** in step
with what bootstrap ships and its hygiene in step with what the repo has since
learned about itself. A repo drifts from that shape silently: nothing fails,
until the day a task is missing or a gate reads a config nobody filled. So the
re-run is owed on a schedule of events rather than on a symptom, and the way to
ask for one is `/vwf:setup reshape`:

- **After bootstrap moves.** `mise run setup:configs --dry-run` shows a change,
  which is drift, and the bootstrap step brings the repo up to date.
- **After a member is added or removed** — or after a member is **cloned** on
  a machine that lacked it. A new member has never been shaped at all, and a
  machine that has just gained one holds a repo the last run could only record
  as absent.
- **On a fresh clone that reports drift.** Anything the previous run
  **deferred** is still deferred in the clone, and its unlock is a re-run.
- **After the forge drifts.** What the forge pass set is the forge's record,
  not the tree's, so nothing in the repo notices when it moves. `/vwf:doctor`'s
  Forge state predicate is what reads that state back. The re-run's forge pass is
  idempotent: what still holds is reported and left alone, and only what drifted
  is offered — and a repo the first run left `pending` gets its pass on the run
  where it finally lands with a push.
- **Whenever `/vwf:doctor` says so.** Doctor is what notices the drift between
  a run. Its Bootstrap drift, Branches, not-shaped and Forge state rows print
  `/vwf:setup reshape`.

Nobody has to remember that schedule. Four commands bring the user to the door
themselves, each **offering** `reshape` the Step 0 way — one line naming the
drifted repos and the failing predicate, then the question — and saying
nothing when the check is clean:

- **`/vwf:architecture`** — after it writes the registry, by invoking
  `/vwf:setup`, whose Step 0 runs the check.
- **`/vwf:setup`** — after its own materialize pass, once per run.
- **`/stackgen:stackgen-sync`** — after a sync, by invoking
  `/vwf:setup reshape` in-session.
- **`/vwf:recall`** — at session start, as printed lines from doctor's local
  baseline predicates alone, file reads only, every one but Bootstrap drift and
  Forge state; those two stay doctor's whole run and setup's Step 0. So recall
  does not report config drift: doctor's full mode does.

A run that finds nothing costs one empty plan and says the repo is shaped —
which is the answer, not a wasted run. On a product, that empty plan still
carries **a section per repo**, each reading nothing, and the run says the
**product** is shaped: a plan that named only the base would leave a reader
unable to tell a member that was checked from a member that was skipped.

Every one of those moments reaches `init` through the same door. `/vwf:setup`'s
Step 0 offers `init` whenever the repo shape is **missing or drifted**, so a
repo that reached setup first is not stranded and a repo that has fallen behind
is not left there; `/vwf:setup reshape` forces that offer and stops once `init`
returns, which is what a user runs when they want the shape reconciled and
nothing else.
