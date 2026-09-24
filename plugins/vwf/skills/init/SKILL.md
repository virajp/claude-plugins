---
name: init
description: Bootstrap a new repo, or reshape an existing one and every member
  repo it has, to the standard layout — every tool config under .config/, the
  toolchain manager's file split and its task library, the repo gates, the
  hygiene files and a secrets provider — materialized from the stack adapter's
  three unconditional bundles. Surveys the whole product, shows one plan with a
  section per repo, applies on one consent. Stack-agnostic; it orchestrates the
  packs and writes no tool config of its own. Invoked by /vwf:setup — its Step 0
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
before it has a product — the config layout, the task vocabulary, the gates,
the ignore set, a licence — is this command's, and everything about
`docs/blueprint/`, `.config/vwf.yaml` and the memory tree stays `/vwf:setup`'s
— with three keys excepted, `enforcement.kept_files`, which records a
pack-owned file the user chose to keep, `enforcement.editor_keys`, which
records what the user chose for an editor key the hand section already
carried, and `answers`, which records the four conditional answers this run
asked or read; all three are things only a shaping run can know about.
Run `init` first on a repo that has neither.

Nothing here knows what the repo is written in, and that is the design. Every
file `init` lays down comes from a pack the **stack adapter** materializes
(`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`); `init` decides *when* the
packs land, *what* the user is asked, and how an existing tree is reconciled
against what they ship. If this skill ever names a tool, that naming is the
bug — say "the toolchain pack", "the gates pack", "the hygiene pack", "the
secrets provider pack", "the task-name contract", "the legacy-name table".

## Hard rules

- **Writes only what a pack declares, plus the fills those packs leave for
  it — in each of the repos Step 0 resolved.** Those repos are the whole of
  its reach: `init` never writes outside the repos it **resolved** as the base
  and its members, and a member that sits beside the base rather than inside
  it is still one of them. Within each repo the rule is the same one, applied
  to that repo's own tree. There are two kinds of fill and the distinction is
  the whole rule.
  **Placeholders** — `<REPO_URL>`, `<YEAR>` and `<HOLDER>` — are values a pack
  templated into a file it ships; the hygiene pack's conventions are
  authoritative for them. **Marked positions** are the commented slots a pack
  ships *because no pack can know a repo's project ids, its name, its remote,
  its languages or which other packs landed beside it*: the bootstrap
  aggregator's member flags, the shell aliases, the per-project task groups,
  the repo-name key, the landing-model key and the member-path key, the
  toolchain config's runtime block and path entries, the commit gate's scope
  list and forge links, the plugin task's two agent-plugin lists, and the
  composed editor block.
  Filling one is exactly `init`'s job and is not authoring pack content — what
  the rule forbids is inventing pack-owned content from scratch, at a path or
  a position no pack marked.
  **One file is neither, and it is the only file**: the repo-owned
  `_scripts/local` sidecar the existing-repo pipeline writes. No pack declares
  it, no pack ships it and `init` never replaces it — and nothing in it is
  authored, since every function it holds is carried verbatim out of the
  repo's own helper file. It is a **move**, wearing a create's row. **Three
  keys are neither either**: `enforcement.kept_files` in `.config/vwf.yaml`,
  where any run — whatever mode the repo resolved — records a pack-owned file
  the user chose to keep so it is never re-offered, `enforcement.editor_keys`
  beside it, where any run records the answer for an editor key the hand
  section already carried so it is never re-asked, and the top-level
  `answers` block, where any run records the four conditional answers it
  holds — the editor and the secrets provider once for the product, the forge
  and the update bot per repo — so every later caller of the materializer
  evaluates a `when:` against the same values rather than against nothing.
  `init` writes those three keys and nothing else in that file — and where
  the file does not exist yet, it writes a **stub** to hold them:
  `config_format`, the `enforcement` block and the `answers` block alone, per
  [new repo](references/new-repo.md) §2, which `/vwf:setup`'s migration and
  fill passes complete later. A keep, a collision answer or a conditional
  answer is therefore always recorded, never deferred for want of the file.
- **Never application code.** Not a source file, not a test, not a directory
  of either.
- **Never a language manifest or a lockfile.** Those declare what the project
  *is*; writing one decides the project's dependencies on its behalf.
- **Never a CI workflow file.** The packs state which task names the pipeline
  must run; the pipeline that runs them belongs to the repo.
- **Never `CLAUDE.md`** — that is `/vwf:setup`'s — and **never a readme beyond
  the two-line stub** below, which `/vwf:readme` then fills.
- **One consent, then apply.** The whole plan is presented once and applied on
  one yes. `init` never asks per file and never writes before the yes.
- **The git pass is the one exception, and it is at the end.** `init` shapes a
  tree and then closes it: it reads where each repo stands first — a member
  standing on no branch is a **refused** row naming the branch to check out,
  its shaping deferred and its gitlink left where it was — asks how work lands
  in this product, **one row per repo per branch**, `develop` and `main`, each
  `direct` or `pr`, written to that repo's two marked positions
  `MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN`, checks out `develop`,
  creating whichever of `develop` and `main` the branch model needs and the
  repo lacks, stages what this run wrote and asks **one question with three
  answers** — commit, commit and push, leave it — commits with a fixed `ops:`
  message when told to — **the ops commit lands on `develop` in every mode**,
  never on `main` or whatever branch the repo stood on — and pushes **only**
  on the commit-and-push answer. A repo whose mainline — read from
  `origin/HEAD`, else the branch it is on — is named something else gets
  `main` created from it and `develop` from `main`, the old branch left in
  place and reported for the user to retire. Both questions are asked
  **once**, in one round each — the landing table carrying every repo's rows
  — and applied to every resolved repo: the members commit first, and the
  base then commits the run's files **plus** the moved gitlinks, which it
  deliberately stages so the base's record of its members is not left a
  commit behind. Push is a second decision
  inside one question, never an assumed consequence of committing. **After the
  push comes the forge pass**, on one further consent for the whole product:
  it sets each pushed repo's default branch on the forge, protects `develop`
  and `main` there — requiring a pull request on whichever of the two has its
  landing model set to `pr` — and reaches the backlog skill's missing-project
  procedure for the base — those three are the only forge settings it touches.
  It never creates a remote, never pushes without the push answer, and on a
  forge it has no CLI for, or a CLI it cannot log in with, it prints the
  by-hand list and carries on. History is never rewritten, nothing is
  force-pushed, and no verification-skipping flag is ever passed. Both
  pipelines describe the pass; [new repo](references/new-repo.md) §11 is where
  it is written down, the forge pass at §11(f).
- **Idempotent, for the same id source.** A second run on a shaped **product**
  produces an **empty plan** — one section per repo, each reading nothing —
  and says the product is shaped. Every step below is written to be
  re-runnable, and a file replaced on one run is identical to the pack's on
  the next, so it is replaced once. The one legitimate exception is a run
  whose **project ids now come from a different source** — a registry the
  repo did not have before — which the existing-repo pipeline reports in
  those words, per repo.
- **A decline is a deferral, never a halt.** Materialization is consent-gated;
  a declined write is recorded and named with its unlock — run
  `/vwf:setup reshape` — exactly as `/vwf:setup`'s tooling step already defers.

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

Detect a repo's mode from that repo itself — three modes, and the first row
that holds decides:

| The repo carries                                                                                                      | Mode       |
| --------------------------------------------------------------------------------------------------------------------- | ---------- |
| the stack adapter's **lockfile** — written when a pack first landed                                                   | **shaped** |
| no lockfile, but a **language manifest**, a **source directory**, a **root tool config**, or a `.config/` without one | **source** |
| none of those                                                                                                         | **blank**  |

What each mode runs:

- **`shaped`** runs the [existing repo](references/existing-repo.md) pipeline
  whole — the eleven survey passes, the plan, the apply. Some earlier landing
  exists and the survey is the honest path.
- **`source`** runs the [new repo](references/new-repo.md) landing **plus** the
  read-before-land passes of the existing pipeline that have something to
  read: pass 1, the root survey, and pass 6, the replace-or-keep offer over
  what the materializer reports as already there; pass 3, the renames, and
  pass 5, the helper library and its sidecar, only where a task library
  exists. A repository with code but no lockfile has never been shaped, and
  shaping it as if it were empty is what lands a pack's file over one the
  repo already wrote.
- **`blank`** runs the new-repo landing alone. Nothing here is read, because
  there is nothing to read.

The evidence is the tree, never a flag, and what is **not** evidence is
`/vwf:setup`'s own definition, stated once in its onboard fork
(`${CLAUDE_PLUGIN_ROOT}/skills/setup/SKILL.md`, *onboard forks once more*): a
readme, a licence, `.gitignore`, `.gitattributes` and a docs tree make a repo
no less blank. `init`'s evidence is one item wider than setup's code test — a
**root tool config** is not code, but it is a file pass 1 has to read before a
pack lands beside it, so it resolves `source` here where setup calls the repo
blank. That is the two definitions doing different jobs, not disagreeing.

Say the **resolved set** in one line before doing anything else: the base, then
each member with `present` or `absent`, and each repo's mode with the evidence
that decided it.

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
repo the git pass refuses, so the checkout is what makes the member shapeable
in the same run. The row ends *then survey and shape it*.

An absent member's section holds that clone row **first** and then reads
*surveyed after the clone*: nothing can be surveyed in a directory that is not
there yet. That survey runs at **apply** time, immediately after the clone and
its checkout and before any write into that repo, opening with the git pass's
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

## Which plugin the adapter resolves to

Every adapter call below is `/<plugin>:<plugin>-<skill>`, and `<plugin>` comes
from the roster in `.config/vwf.yaml` — a key `/vwf:setup` writes **after**
`init` has run. So on the repo `init` exists for, that file usually is not
there yet — or is only the stub `init` itself leaves, which carries no roster
— and the name cannot be read out of it. Resolve it this way, and say in one
line which branch was taken:

1. **The roster, where the config already has one.** A repo that has been
   through `/vwf:setup` names its adapter plugins there; use that list in its
   order, exactly as every other vwf command does.
2. **Otherwise discover, never construct.** The adapter contract fixes both
   skill names, so an installed plugin either ships `<plugin>-stack-menu` and
   `<plugin>-stack-template` or it does not — list the installed plugins and
   take the ones that ship both. This is a **check**, not an assembled guess,
   which is the same reason the three slugs below are fixed.
3. **Exactly one** is the answer. **More than one** is a real choice between
   materializers and is asked, in one round, before anything is fetched.
4. **None** is a halt, with the install command. Every file `init` lays down
   comes from a pack; with no adapter installed there is nothing to
   materialize, and continuing would print an empty plan that reads exactly
   like an already-shaped repo.

`init` never writes the roster key itself — that is `/vwf:setup`'s, and a key
written here would record a decision nobody was asked for.

## The stack read

`init` learns what a repo is written in **once per repo**, before the plan,
and everything downstream that depends on a language reads that one answer.
Three sources, read in this order, and the **first hit per language wins** —
a later source never overrides an earlier one, it only adds a language the
earlier ones did not name:

1. **The pins**, where `.config/vwf.yaml` exists: each project's `stack.*`
   axes and its `languages` list, the keys
   `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md` owns.
2. **The lockfile's components** — a `shaped` repo's, the language,
   package-manager and app-framework entries the materializer recorded when
   they landed.
3. **The manifests**, in `source` mode only: a language manifest at the root
   and in every sub-project directory (defined beside question 2 below), read
   by this table and by nothing looser:

   | Manifest found                          | Language |
   | --------------------------------------- | -------- |
   | `package.json`                          | node     |
   | `pyproject.toml` or `requirements.txt`  | python   |
   | `pubspec.yaml`                          | dart     |
   | `go.mod`                                | go       |
   | `Cargo.toml`                            | rust     |
   | `Package.swift`                         | swift    |
   | a root `*.xcodeproj` directory          | swift    |

   A file not in this table is not a manifest, whatever it looks like — the
   one directory it admits is an Xcode project at the top of the directory
   being read, never deeper, whose dependency list lives inside it — and a
   language the table does not name is proposed in the plan rather than
   guessed.

**One vocabulary, whatever the source.** The read's answer is a set drawn
from the six keys in that table's `Language` column — `node`, `python`,
`dart`, `go`, `rust`, `swift` — and nothing else, so the hygiene table and
the runtime positions key on one spelling. Sources 1 and 2 do not speak it
natively: a config `languages` token and a lockfile component slug (a
`language/…`, `package-manager/…` or `app-framework/…` entry) are each
**mapped onto one key first**, by the table the hygiene pack keeps under
*Which template a detected language takes* in its conventions — the adapter
owns that mapping, and `init` restates none of it — so a pin and a manifest
that name the same language collapse to one hit, and "first hit per language"
counts keys, never raw tokens. A token or slug that table maps to no key is
proposed in the plan on the same terms as an unlisted manifest, never guessed
and never carried through as its own language.

A `blank` repo reads nothing — there is no pin, no lockfile and no manifest —
and lands no language section. Say in one line, per repo, which source
answered and what it found.

**What the read drives**, and it is the only thing that drives them:

- the **ignore sections** [new repo](references/new-repo.md) §5 appends —
  one per language the read produced, resolved through the hygiene pack's own
  table, so a `source` repo with a manifest gets its language's section on the
  **first** run rather than after some later pin. The read carries **one more
  component** here, and it is not a language: the **secrets provider slug**
  question 4 picked, passed as it is, so the provider row that same table
  keeps resolves beside the language rows — a provider whose files keep
  something machine-local gets its ignore section only in a repo that runs
  it, and a **none** answer carries nothing;
- the **two runtime positions** the toolchain pack marks in its base config
  — `RUNTIME_BLOCK` and `PATH_ENTRIES` — which §5 fills from the same read,
  one runtime's lines per language and the path entry empty where no language
  needs one;
- the **sub-project proposals** question 2 shows, where no registry names
  them.

## The questions

Nine in all, each one round, MCQ where an option set exists, per
`${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`. **A round is one round for the
whole product**, however many repos resolved: a question that differs per repo
shows one row per repo inside its single round, and never becomes a second
round. Two of them — 1 and 3 — are asked for the repos that resolved to mode
**blank** or **source** only, because a `shaped` repo already answers them;
the other seven are asked whatever the modes are. Question 6 has two dependent
parts, 6a and 6b, which together are the **seventh round**: they are shown
against 6's answers, so they cannot share its round. Questions 7 and 8 — the
editor and the update bot — are the **eighth and ninth rounds**, and they are
the two whose answers reach the materializer rather than a file: together
with two answers the run already holds — the forge, read from each repo's
origin host, and the provider slug question 4 picked — they are what the
materializer's conditional evaluation step evaluates a pack's `when:` against,
one value per axis, `forge`, `editor`, `secrets` and `update_bot`.

1. **The repo name.** *`blank` and `source` repos only.* Asked in one round
   listing every repo that resolved to either, each proposed from that repo's
   **folder name** — the basename of its **main checkout**, which on a run
   started in a linked worktree is the parent of that repo's common git
   directory (`rev-parse --git-common-dir`) and never the worktree's own
   directory, since that one is named for a branch. A run where every repo
   resolved `shaped` skips it.

   **What this question settles is `REPO_NAME`.** The answer, slugified by the
   stack adapter's `assets/ids.md` exactly as question 2's replacements are, is
   what that repo's repo-name key receives — written **literally**, never
   derived at read time. Each repo's key takes **its own** folder name: a
   member names the member's folder, never the base's. No project id reaches
   this key, and no answer here reaches a task group.
2. **The ids, confirmed.** The one question asked before a single `p:<slug>:*`
   task group or its commit scope is written, in any repo. Show one list,
   **grouped by repo** — the base's group first, then one per member in the
   resolved order — and inside each group one row per project `init` will
   create a task group for *in that repo*. Give each row three things: the
   **name** as the repo spells it, the **id** that name slugifies to, and the
   **source** the name came from, in the words
   [new repo](references/new-repo.md) §7 resolves them by: the registry, a
   sub-project directory, or the project's **type**.

   **A sub-project directory is defined here, once**, and every other mention
   in this skill and its references means this. Where a registry exists, the
   sub-project directories are the registry's `projects[].path` list, and
   nothing else in the tree is one. Where none does — a first run — the term
   is live in **`source` mode only**, and means a non-root directory that
   carries its **own language manifest** from the stack read's table, or that
   a **workspace file** at the root enumerates as a member (the file names are
   in [new repo](references/new-repo.md) §7). `docs/`, `scripts/`, `.config/`,
   `.github/` and any dot-directory never qualify, whatever they carry. A
   `blank` repo proposes none, since it has no manifest to find one by.

   **The type source is a choice, not a reading.** Where a repo has neither a
   registry nor sub-project directories as defined above, there is no name in
   the tree to propose from — the repo's own name was the old answer and it is
   the wrong one, since a task group names what a task acts **on**. So ask,
   per project in that repo and inside this same round, which **platform
   token** is that project's primary surface — `service`, `worker`, `webapp`,
   `site`, `cli`, `iac` and the rest — and propose the token it picks as the
   id. The options are the closed per-role platform lists
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/registry.yaml` carries, narrowed to
   the project's role where a registry names one and offered as their union
   where nothing does, plus a free **other** the user types. Offer **only** the
   tokens that asset lists. **Word the free option as an invitation, not as a
   fallback** — *other — type any id you want* — so a user who likes none of
   the tokens can see that typing their own is an ordinary answer. A spelling
   the vocabulary has **retired** — `console` among them — is on no list and
   is never offered; setup's `references/format-lineage.md` is where each
   retired spelling is recorded against what replaced it, and a user who wants
   one types it as **other**.

   **Two projects in one repo that pick the same token** are proposed as
   `<token>-<directory-slug>` each, both rows shown that way — an id is a
   directory name in the task library, and two groups cannot be one directory.
   Across repos there is no collision to resolve: each repo's task library is
   its own.

   **A member's projects come from the base first.** Where the base config's
   `members:` list declares that member's `projects`, those are its projects;
   otherwise that member's own sub-project directories, as defined above;
   otherwise the type question above, asked for the member's one project. The
   order is the same declaration-before-detection order §7 already uses,
   applied one repo down.

   Naming the source is the point of showing the list: a row a user disagrees
   with is usually a row whose source they did not expect, and the source is
   the only thing that explains where the name came from.

   The answer is **accept the list**, or a replacement for any row — and the
   round must **say so where the user reads it**, not only here. Spell the
   accept option *accept these ids*, and offer beside it *replace one or more
   — type the ids you want*, so the free-text path is visible on the question
   itself: a user who has to guess that a proposed list is editable will take
   the list. A replacement is slugified by the same rule the proposed ids were
   — the stack adapter's `assets/ids.md`, which owns it — and is shown once
   more for acceptance **only if slugifying changed what was typed**; a
   replacement that is already its own slug is taken silently. Read the asset;
   never restate the rule here.

   What this question settles is what the plan shows and what §7 writes in
   each repo — the per-project task groups and, on **every** run including
   the first, the commit gate's scopes, one per confirmed id. A registry,
   where the repo has one, is only where this question's proposal was read
   from; the scopes take the ids it confirmed either way, and a repo with no
   registry fills them on its first run like any other. Nothing downstream
   re-derives an id. Four things are **not** this question's. The
   **repo-name key** is question 1's: it takes the repo's folder name,
   slugified, and no row of this list reaches it. The bootstrap aggregator's
   **member flags** and the aliases that shorten them come from the resolved
   **member repos**, one of each per member, never from a project id — they
   widen the run to another repo, which is what a member is. `MEMBERS` is
   filled from the resolved members where the linkage is siblings, and stays
   exactly as shipped where the repo's own submodule declarations are what
   the task library reads. And the landing pair — `MERGE_MODEL_DEVELOP` and
   `MERGE_MODEL_MAIN` — is asked in the git pass.
3. **A one-line brief.** *`blank` and `source` repos only.* What the repo is,
   in a sentence — one row per repo that resolved to either, in the same round
   question 1 listed them in. **May be empty** — an empty brief writes a
   one-line stub, and `/vwf:readme` fills the rest. A `source` repo that
   already carries a readme keeps it, whatever the row says, per
   [readme and licence](references/readme-and-license.md).
4. **The secrets provider.** Answered **once** and written into every repo: a
   product keeps its secrets in one place, and a member on a different
   provider is a decision nobody made by answering this. Fetch the adapter's
   menu once
   (`/<plugin>:<plugin>-stack-menu`) and **filter** it to the entries on the
   backing axis whose kind is *capability provider*. Those two fields are
   what the payload actually carries; it has no field meaning *secrets*, and
   that kind covers capabilities that have nothing to do with them. So the
   filter narrows and the **question** decides: offer the filtered set in the
   menu's own order, plus **none — decide later**, and ask which of them
   **holds this product's secrets** — naming the capability in the question is
   what a wrong entry cannot satisfy. The options are the adapter's bundle
   list, never a name written here: `init` presents what the menu carries and
   never proposes a default of its own.

   An entry that turns out to fill no secrets slot is not something `init`
   can detect, and it does not pretend to: the slot the packs left stays
   unfilled, announces itself, and is reported exactly as a **none** answer
   is reported.
5. **The agent plugins this product requires.** Answered **once** and written
   into every repo, for the same reason question 4 is: the inventory it is
   seeded from is the **machine's**, not a repo's, so asking per repo would
   offer the same rows again and invite a difference nobody wants.
   The task library ships one task that reconciles them, and beyond the
   workflow's own — which that task always installs, with whatever it depends
   on — no pack can know which others a repo needs. So ask, **seeded by the
   machine itself**: run that
   task's inventory mode, `setup:ai --inventory`, named by the task-name
   contract like every other task `init` reaches for, and it prints the plugin
   sources registered on this machine, one row each, then the plugins already
   installed from any of them, one row each, and nothing else.

   **Drop two rows before offering anything.** The task prints *every*
   installed plugin, so the workflow's own plugin and whatever it depends on
   appear there like any other — and they are the two the task installs
   unconditionally. `init` removes those rows from what it offers. They are
   not a choice, and an MCQ that lists them either invites a user to deselect
   something that gets installed regardless, or writes a row that duplicates
   what the task already does.

   Offer what is left as a **multi-select** — the sources and the plugins in
   the two groups the task printed them in — plus **none**, which is the
   ordinary answer for a repo that needs nothing beyond the workflow. The rows
   are shown verbatim, in the task's own order; `init` neither reorders them
   nor proposes one of its own, and a row the user does not pick is simply not
   written.

   An inventory that prints nothing, or whose every row was dropped, is not an
   error — it is an unshaped machine, or one whose plugins all arrived with
   the workflow. Ask the question anyway, with **none** as the only thing to
   pick, and say in the question itself which of the two it was — so the
   answer is recorded rather than assumed, and a user who expected rows
   learns why there are none.

   What this question settles is what [new repo](references/new-repo.md) §7
   writes into the plugin task's two marked positions — never the workflow's
   own plugin or its dependency, which are dropped above and stay the task's
   unconditional business.
6. **The visibility.** `public` or `private` — **one row per repo** in the one
   round, because visibility is a fact about a repo rather than a product, and
   a private member beside a public base is ordinary enough that one answer
   for all of them would write a licence into somebody's private repo. Each
   row's default is **read from the forge** where that repo has an `origin`
   the forge CLI can answer for — [new repo](references/new-repo.md) §11(f)
   carries the read — and is `private` where it has no origin or the read
   fails: a repo nobody has published is private until somebody says
   otherwise. The answer is written nowhere in the tree — the forge is the
   record of what a repo is — and what it decides is the shape of the two
   dependent parts below, asked as the seventh round once every row here is
   answered.

   **6a — The licence.** *Rows for the repos that answered `public` only.*
   MIT, Apache-2.0, or none — one row per such repo, because a licence is a
   file a repo carries and members are licensed separately often enough that
   assuming otherwise writes the wrong text into somebody's repo. The hygiene
   pack ships the two texts; **none** is a legible answer and writes no file,
   in that repo or in any other. A `private` repo gets no row and no
   `LICENSE`: a licence grants the public rights a private repo is not
   offering, and a file granting them is a claim nobody made. A repo that
   already carries a licence file keeps it whatever it answered — and every
   spelling counts as carrying one: `LICENSE`, `LICENSE.md`, `LICENCE` and
   `COPYING` alike, per [readme and licence](references/readme-and-license.md).

   **6b — The security contact.** **One row per repo**, and the row's shape
   follows that repo's visibility. A `public` repo's row is defaulted to
   **that repo's own** origin remote's advisories page where it has an origin,
   and to nothing where it does not. A `private` repo has no advisories page a
   reporter outside it can reach, so its row is a **free contact** — an email
   address or an internal URL — with no default. Declining a row writes no
   security file in that repo either way — a file naming a channel nobody
   watches is worse than none — and declining one row says nothing about the
   others.
7. **The editor.** Answered **once** for the product: is the editor the
   packs' editor fragments are written for — the one the fragment convention
   in the stack adapter's `assets/pack-format.md` names — the editor used
   here? **Yes** or **no**. The default is **yes** where any resolved repo
   carries that editor's own settings directory — the directory the
   convention's two output files sit in — or where its command-line binary is
   on `PATH`, and **no** otherwise; the question says which of the two
   decided it. One answer for all the repos, because an editor is a fact
   about the people working the product rather than about any one tree, and
   a product whose members compose editor settings while its base does not is
   a state nobody asked for.

   What this question settles is the `editor` axis the materializer's
   conditional evaluation step reads: a **yes** passes the axis value the
   convention names for that editor, and every pack file conditioned on it —
   every editor fragment — lands; a **no** passes `none` on that axis —
   `init`'s no-match value, which no `when:` names on this axis — so those
   files are **skipped**, listed in the plan under their own heading, and
   the editor merge in
   [fragments and sections](references/fragments-and-sections.md) then has no
   fragment to read and composes nothing. The answer **is** written into the
   tree — under `answers.editor` in `.config/vwf.yaml`, once for the product —
   so a later caller of the materializer evaluates the axis against the same
   value rather than against nothing. A reshape still asks, seeded by the
   recorded value where there is one and by the two reads above where there is
   not.
8. **The update bot.** **One row per repo** in the one round: which hosted
   dependency-update service watches this repo — the one whose policy file
   the hygiene pack ships, the other one, or **none**. The options are the
   axis values the materializer's conditional evaluation step accepts on
   `update_bot`, plus **none**; [new repo](references/new-repo.md) §2 spells
   them. Each row is **seeded from the survey**: a repo already carrying a
   policy file under any spelling the [tool-config
   table](references/tool-configs.md)'s row for that service lists is
   preselected to that service — the survey's pass-1 evidence is the answer,
   and the row says which file decided it — and a repo carrying
   neither is preselected to the service whose policy the hygiene pack ships,
   since that is what an unanswered run has always landed. It is per repo
   because the policy is a file each repo carries and a member watched by a
   different service than its base is ordinary.

   What this question settles is the `update_bot` axis: the row's answer is
   passed as that repo's value, so the hygiene pack's policy file lands only
   where the answer names the service it configures, and is **skipped** —
   listed in the plan under the same heading — where the answer is the other
   service or **none**. On this axis alone, **none** is not `init`'s
   no-match value but one of the three answers a pack may name in a `when:`,
   so a file a pack conditions on it lands exactly when no bot was picked. A
   repo whose own policy file the yield rule keeps is
   unchanged by the answer: the pack's file was never going to land there.

Ask all nine **before** presenting the plan, so the plan is complete and one
yes covers all of it. The plan's summary then says, per repo, the four values
the materializer receives in its `answers:` map, beside `repo:` — the forge
from the origin host, the editor, the provider slug from question 4, the
update bot, each carrying `none` where the answer was none or nothing could be
read, since an axis the map leaves out lands every path conditioned on it —
and lists every path a condition skipped under its own **Skipped** heading,
one line per path naming the axis that decided it, so a file that did not land
is a file the reader can see was not landed rather than one that was missed.

The same four values are **recorded**, in every mode, as part of the pass that
writes the config — the top-level `answers:` block of the base's
`.config/vwf.yaml`, whose shape is
`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`'s: `editor` and `secrets` once
for the product, `repos:` keyed by the member path exactly as
`enforcement.kept_files` keys one (`.` for the base), each entry carrying
`forge` and `update_bot`. Every key is always present and `none` is the
spelling of no answer, exactly as the map passed to the materializer spells
it. The record is written on a repo whose config already exists as much as
into the stub, and the plan carries it as one row.

## The pipelines

Both pipelines run **per repo** — every resolved repo takes the one its own
mode selected, so a single run may execute both — and they run **members
first, the base last**, so the base commits with its record of the members
already current.

Whichever each repo takes, there is **one plan and one consent for the run**:
each repo contributes a **section** to that plan, the base's first and then
each member's in the resolved order, and the single yes covers all of them.
Two plans would be two chances to stop halfway, which is exactly the state the
one-consent rule exists to prevent — one repo renamed into the contract while
its neighbours still call the old names.

| Read                                                           | When                                                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [new repo](references/new-repo.md)                             | modes **blank** and **source** — and the git pass                             |
| [existing repo](references/existing-repo.md)                   | mode **shaped**; and the passes **source** borrows, cited there by number     |
| [fragments and sections](references/fragments-and-sections.md) | every mode — the three merge algorithms                                       |
| [readme and licence](references/readme-and-license.md)         | every mode — the stub and the files                                           |

**The existing-repo pipeline adopts rather than flattens**, and three rules
carry that — rules the `source` mode borrows for what its tree already holds,
and whose third **every mode runs**. A function the repo's own helper library
**defines** that the pack's does not and its legacy table does not map is
**moved**, whole, into a repo-owned `_scripts/local` sidecar — never deferred,
never guessed at, and never lost to the replace merely because nothing calls
it yet. A task file no pack ships is **kept and listed**, with a note where it
sits in a group the task-name contract reserves — `init` moves none of them.
And a pack-owned file whose **content** has diverged is **offered**, replace
or keep, one row in the same single plan, where a replace re-fills every
marked position that file carries and a keep is recorded so it is not asked
again — a keep covering the content the repo customised and never a marked
position's value, which the fills own either way. **That offer is not the
shaped mode's alone**: every path the materializer's dry-run reports as a
conflict — a file at a pack's path that no lockfile records — is one such row,
in `blank` and `source` mode too, shown before the consent and recorded under
`enforcement.kept_files` on a keep exactly as the existing pipeline's pass 6
records it. A `blank` repo rarely has one; when it does, it is never a silent
skip. **What counts as diverged is two tests**: the
file's hash against the lockfile's record, and, on a mismatch, the pack's
payload with the repo's current values spliced in at **every** position
[new repo](references/new-repo.md) §7 enumerates that the file carries, owned
or not. A file diverging only inside those positions
is not offered at all — where a pass owns one it shows the row, and where none
does, as with the two landing-model positions, there is simply no row. A
record sourced `generated` has no payload to splice into, so the second test
is skipped and the mismatch stands.

Whichever pipeline runs, the same work happens in the same order at the end of
each repo, after that mode's landing and before the git pass. **Five steps are
shared by every mode**, and they are written down once, in
[new repo](references/new-repo.md), cited by section from wherever a pipeline
reaches them: the **secrets provider** (§3), the **placeholders** (§4), the
**readme stub, licence and security files** (§8), the **bootstrap** (§9) and
the **aggregator offer** (§10) — the existing pipeline runs them from its
post-landing paragraph, the new-repo pipeline in its numbered order, and no
mode skips one or asks its question twice. Beside them the **fills** the packs
marked — the project ids and their surfaces, the repo-name key from question
1's folder name, the commit gate's scopes from those same confirmed ids and its
forge links where a remote exists, the two runtime positions from the stack
read — then the **three merges** (ignore sections, the first of them from the
same read, hook fragments, editor fragments), then the **git pass**, whose
questions were asked once for the run and whose commit is that repo's own.
Between the merges and the git pass, `init` **re-records the lockfile hash** of
every file it filled, appended to or merged, so nothing it wrote reads as drift
on the next run. The editor merge reads the existing file
whole, and a key the hand section already carries that the packs also compose
is a **collision**: asked in one round inside the plan — keep mine, take the
pack's, or union where the value is an object — recorded under
`enforcement.editor_keys` so it is never asked twice, and never resolved by
the file carrying the key twice. The report comes last, once, when every
repo is done.

Both pipelines materialize the same three baselines. They are fetched by the
**fixed slugs** `mise`, `repo-gates` and `repo-hygiene` — fixed, never
constructed: a name assembled from configuration is one that can silently
resolve to nothing, which is the rule the `ux-gate` and design-adapter seams
already follow. The secrets provider is fetched by whichever slug the user
picked at question 4. **Every fetch carries the four answers** as its
`answers:` map — the forge, the editor, the provider slug, the update bot —
so the materializer's conditional evaluation step can decide a pack's
conditional files. That map is the `answers:` block the config records, with
the **forge refreshed from `origin`** on every run: the recorded forge is the
record and the fallback for a repo whose remote cannot be read at all, and a
recorded forge that no longer matches the live host is **rewritten in place**
— that one value, nothing else — and said so in the run's own report. A pack
with no `when:` lands whole, as it always has, and a
file a condition skips is the plan's **Skipped** row, never a deferral:
nothing is waiting on a later run, the repo simply is not the kind the file
was for.

Their landing is consent-gated by the materializer, and their presence in a
lockfile is what tells a later run — or `/vwf:setup` — that a repo is shaped
at all. **The lockfile is per repo**, like everything else a pack lands: each
member carries its own, so a member is shaped or not on its own evidence and
the base's lockfile never speaks for it.

## The report

Every run ends with the same report — the thirteen file sections, then one
git section for the whole run — each a count and its lines, and an empty
section printed as `none`. A replace and a rewrite are counted only where they
were applied. The two `kept` sections count what this run deliberately left
alone, which is why they are printed at all: a file nobody touched reads the
same as a file nobody looked at. Three sections mirror the three plan rows the
existing pipeline's pass 1 produces — the root tool configs, the hook manager
and the projects — and each prints the decision the row carried: a root tool
config the way it went, a hook manager kept or switched, a project directory
with the id question 2 confirmed, listed here **once** and nowhere else.

**The thirteen file sections repeat under one heading per repo**, the base
first and then each member by its path, and every count is that repo's own —
a run over four repos prints fifty-two sections. Nothing is totalled across
repos: a count a reader cannot attribute to a tree is a count they cannot
check.

```text
── <repo> ──
Files written     <n>    + <path>            (one per line)
Files replaced    <n>    <path>              (one per line)
Files kept        <n>    <path> — <the reason recorded>
Files moved       <n>    <old> → <new>
Root tool configs <n>    <path> — moved → <new> | kept both | deleted
Hook manager      <n>    <manager found> — kept | switched
Projects          <n>    <directory> — <id>
Tasks renamed     <n>    <old> → <new>
Tasks kept        <n>    <path>              (repo-owned; + the contract note)
Calls rewritten   <n>    <file:line> <old> → <new>
Sections appended <n>    <name>
Fragments merged  <n>    <name>
Deferred          <n>    <what> — unlock: <what would let it happen>
```

Then a **git** section, from the pass that just ran — printed **once for the
run**, since the pass asked its questions once. The landing model, branches,
the commit, the push and the forge are **one line per repo**, in apply order
— the members, then the base — the landing line carrying that repo's two
values, one per branch; and the last two lines are the base's alone. A
`Branches created` line also names a mainline of another name the run left
beside the pair, for the user to retire; a member refused for standing on no
branch appears under *Deferred* instead, with the checkout as its unlock.
Every line reads `none` where nothing happened:

```text
Landing model            <repo> develop <value>; main <value>   (one per repo)
Branches created  <n>    <repo> <name>; <old> left     (one per repo)
Commit                   <repo> <hash> <subject>; <hash> <subject>
Pushed            <n>    <repo> <branch> → origin
Gitlinks staged   <n>    <path>              (the base's, one per member)
Forge             <n>    <repo> default <branch>; protected <branches>; <what was left>
Backlog project          <url> | present | pending — <reason>
```

**A repo's `Commit` line names every commit the run made in that repo**, in
the order they were made, each with its short hash and its subject — one line
still, however many there were. A `shaped` repo makes **two**: the gate
configuration commits first and alone, so the hooks the rest of the run trips
are the ones the repo just accepted, and the shape commit follows. A `blank`
or `source` repo makes one. A repo where the answer was **leave it** reads
`not committed`, and a repo whose gate commit landed but whose shape commit
did not is exactly the case a single hash would hide.

**The `Forge` line is one per repo**, and it says what the forge pass set
there — the default branch, the branches it protected — and what it left: a
setting already present is named as left alone, never as set. A repo the pass
did not reach reads its reason instead — `pending` where the answer was
**commit** or **leave it**, `skipped` with the reason where the precondition
failed or a call was refused, `by hand` where the forge has no CLI and the
list was printed. The `Backlog project` line is the base's alone and reads the
project's URL, `present` where one already existed, or `pending` with its
reason. Which branch a forge calls default is no longer an act somebody
performs there by hand: the pass sets it, and the hygiene pack's contribution
guide keeps the by-hand form for a forge the pass cannot reach.

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

`init` is not a one-time bootstrap. It is what keeps a repo's **shape** — its
configuration layout, its task vocabulary, its gates, its hygiene — in step
with what the packs ship and with what the repo has since learned about itself.
A repo drifts from that shape silently: nothing fails, until the day a task is
missing or a gate reads a config nobody filled. So the re-run is owed on a
schedule of events rather than on a symptom, and the way to ask for one is
`/vwf:setup reshape`:

- **After the registry exists.** `/vwf:architecture` declares the projects and
  `/vwf:setup` writes the config that names them. That is the moment the
  project ids gain their real source, so a per-project task group may need to
  move and the commit gate's scope list — already filled from the ids the first
  run confirmed — may need to move with it. The run reports it as an **id
  source changed**, and it is expected work rather than drift. The
  repo-name key does not move with it: its source is the repo's folder name,
  which a registry says nothing about.
- **After a repo's folder is renamed.** The repo-name key is written literally,
  so a rename leaves it naming the old folder and the launch aliases that read
  it pointing at a name nobody uses. The run offers the new value as a replace
  row and changes nothing else.
- **After a stack pack's version moves.** New files, new fragments, new marked
  positions. The plan shows what the repo lacks; the adapter's own re-sync
  command is what shows a diff for a file the repo already has.
- **After a member is added or removed** — or after a member is **cloned** on
  a machine that lacked it. A new member has never been shaped at all, and a
  machine that has just gained one holds a repo the last run could only record
  as absent. The base's own fills move too: the aggregator's member flags and
  their aliases are one per member, so the set changing is work for the base
  as well as for the member.
- **On a fresh clone that reports drift.** Anything the previous run
  **deferred** — an offline ignore section, a missing toolchain binary, a
  declined materialization — is still deferred in the clone, and its unlock is
  a re-run.
- **After the forge drifts.** What the forge pass set is the forge's record,
  not the tree's, so nothing in the repo notices when it moves. `/vwf:doctor`'s
  baseline predicate **(g)** is what reads that state back, and it is the
  seventh reason its finding names `/vwf:setup reshape`. The re-run's forge
  pass is idempotent: what still holds is reported and left alone, and only
  what drifted is offered — and a repo the first run left `pending` gets its
  pass on the run where its push finally happens.
- **Whenever `/vwf:doctor` says so.** Doctor is what notices the drift between
  a run: adapter lockfile against installed packs, registry ids against the
  scope list and the task groups, the repo-name key against the folder, a
  missing branch, the forge state. Its finding prints `/vwf:setup reshape`,
  once, as the one remedy for every shape row.

Nobody has to remember that schedule. Four commands bring the user to the door
themselves, each **offering** `reshape` the Step 0 way — one line naming the
drifted repos and the failing predicate, then the question — and saying
nothing when the check is clean:

- **`/vwf:architecture`** — after it writes the registry, by invoking
  `/vwf:setup`, whose Step 0 runs the check.
- **`/vwf:setup`** — after its own materialize pass, once per run, so a pack
  version the run itself moved is offered in the same session.
- **`/stackgen:stackgen-sync`** — after a sync, by invoking
  `/vwf:setup reshape` in-session.
- **`/vwf:recall`** — at session start, as one printed line from doctor's
  local baseline predicates alone, (a) through (f); the forge predicate (g)
  stays doctor's whole run and setup's Step 0.

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
