---
name: init
description: Bootstrap a new repo, or reshape an existing one, to the standard
  layout — every tool config under .config/, the toolchain manager's file split
  and its task library, the repo gates, the hygiene files and a secrets provider
  — materialized from the stack adapter's three unconditional bundles. Surveys,
  shows one plan, applies on one consent. Stack-agnostic; it orchestrates the
  packs and writes no tool config of its own. Invoked by /vwf:setup — its Step 0
  offer, or /vwf:setup reshape — and never typed by a user.
model: sonnet
effort: high
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

`init` sets up the **base repo**; `/vwf:setup` sets up **vwf** in it. The two
are a pair and neither does the other's job: everything a repository needs
before it has a product — the config layout, the task vocabulary, the gates,
the ignore set, a licence — is this command's, and everything about
`docs/blueprint/`, `.config/vwf.yaml` and the memory tree stays `/vwf:setup`'s.
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
  it.** There are two kinds of fill and the distinction is the whole rule.
  **Placeholders** — `<REPO_URL>`, `<YEAR>` and `<HOLDER>` — are values a pack
  templated into a file it ships; the hygiene pack's conventions are
  authoritative for them. **Marked positions** are the commented slots a pack
  ships *because no pack can know a repo's project ids, its name, its remote
  or which other packs landed beside it*: the bootstrap aggregator's member
  flags, the shell aliases, the per-project task groups, the repo-name key,
  the commit gate's scope list and forge links, and the composed editor block.
  Filling one is exactly `init`'s job and is not authoring pack content — what
  the rule forbids is inventing pack-owned content from scratch, at a path or
  a position no pack marked.
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
  tree and then closes it: it stages what this run wrote and asks **one
  question with three answers** — commit, commit and push, leave it — commits
  with a fixed `ops:` message when told to, creates whichever of `develop` and
  `main` the branch model needs and the repo lacks, asks which branch the
  remote forge should default to, and pushes **only** on the commit-and-push
  answer. Push is a second decision inside one question, never an assumed
  consequence of committing. History is never rewritten, nothing is
  force-pushed, and no verification-skipping flag is ever passed. Both
  pipelines describe the pass; [new repo](references/new-repo.md) §11 is where
  it is written down.
- **Idempotent, for the same id source.** A second run on a shaped repo
  produces an **empty plan** and says so. Every step below is written to be
  re-runnable. The one legitimate exception is a run whose **project ids now
  come from a different source** — a registry the repo did not have before —
  which the existing-repo pipeline reports in those words.
- **A decline is a deferral, never a halt.** Materialization is consent-gated;
  a declined write is recorded and named with its unlock — run
  `/vwf:setup reshape` — exactly as `/vwf:setup`'s tooling step already defers.

## Step 0 — Resolve the mode

The target is the repository the caller is already in: `init` takes no
arguments, reads no flag and never operates on another directory. Shaping a
different repository means running `/vwf:setup` there.

Detect the mode from the target itself:

| The target                                                | Mode         |
| --------------------------------------------------------- | ------------ |
| no `.config/` directory **and** no task-library directory | **new**      |
| anything else                                             | **existing** |

The signal is deliberately narrow. A repository with source, a readme and a
licence but no configuration layout has never been shaped, and treating it as
new is right — nothing in the **new** pipeline touches source. The moment
either marker is present, some earlier shaping exists and the survey is the
honest path.

Say which mode resolved and why, in one line, before doing anything else.

## Which plugin the adapter resolves to

Every adapter call below is `/<plugin>:<plugin>-<skill>`, and `<plugin>` comes
from the roster in `.config/vwf.yaml` — a file `/vwf:setup` writes **after**
`init` has run. So on the repo `init` exists for, that file usually is not
there yet and the name cannot be read out of it. Resolve it this way, and say
in one line which branch was taken:

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

## The questions

Six in all, each one round, MCQ where an option set exists, per
`${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`. Two of them — 1 and 3 — are
asked on a **new repo only**, because an existing repo already answers them;
the other four are asked on any repo.

1. **The repo name.** *New repo only.* Proposed from the target directory's
   basename.
2. **The ids, confirmed.** The one question asked before a single `p:<slug>:*`
   task group, member flag, shell alias or repo-name key is written. Show one
   list — the repo's own name first, then one row per project `init` will
   create a task group for — and give each row three things: the **name** as
   the repo spells it, the **id** that name slugifies to, and the **source**
   the name came from, in the words [new repo](references/new-repo.md) §7
   resolves them by: the registry, a sub-project directory, or the repo's own
   name. Say on the repo's row that its id is what `REPO_NAME` receives.

   Naming the source is the point of showing the list: a row a user disagrees
   with is usually a row whose source they did not expect, and the source is
   the only thing that explains where the name came from.

   The answer is **accept the list**, or a replacement for any row. A
   replacement is slugified by the same rule the proposed ids were — the stack
   adapter's `assets/ids.md`, which owns it — and is shown once more for
   acceptance **only if slugifying changed what was typed**; a replacement that
   is already its own slug is taken silently. Read the asset; never restate the
   rule here.

   What this question settles is what the plan shows and what §7 writes — the
   per-project task groups, the aggregator's member flags, the shell aliases
   and `REPO_NAME`. Nothing downstream re-derives an id.
3. **A one-line brief.** *New repo only.* What the repo is, in a sentence.
   **May be empty** — an empty brief writes a one-line stub, and `/vwf:readme`
   fills the rest.
4. **The secrets provider.** Fetch the adapter's menu once
   (`/<plugin>:<plugin>-stack-menu`) and **filter** it to the entries on the
   backing axis whose kind is *capability provider*. Those two fields are
   what the payload actually carries; it has no field meaning *secrets*, and
   that kind covers capabilities that have nothing to do with them. So the
   filter narrows and the **question** decides: offer the filtered set in the
   menu's own order, plus **none — decide later**, and ask which of them
   **holds this repo's secrets** — naming the capability in the question is
   what a wrong entry cannot satisfy. The options are the adapter's bundle
   list, never a name written here: `init` presents what the menu carries and
   never proposes a default of its own.

   An entry that turns out to fill no secrets slot is not something `init`
   can detect, and it does not pretend to: the slot the packs left stays
   unfilled, announces itself, and is reported exactly as a **none** answer
   is reported.
5. **The licence.** MIT, Apache-2.0, or none. The hygiene pack ships the two
   texts; **none** is a legible answer and writes no file.
6. **The security-contact URL.** Defaulted to the origin remote's advisories
   page where an origin exists. Declining writes no security file — a file
   naming a channel nobody watches is worse than none.

Ask them **before** presenting the plan, so the plan is complete and one yes
covers all of it.

## The pipelines

| Read                                                           | When                              |
| -------------------------------------------------------------- | --------------------------------- |
| [new repo](references/new-repo.md)                             | mode **new** — and the git pass   |
| [existing repo](references/existing-repo.md)                   | mode **existing**                 |
| [fragments and sections](references/fragments-and-sections.md) | both — the three merge algorithms |
| [readme and licence](references/readme-and-license.md)         | both — the stub and the files     |

Whichever pipeline runs, the same work happens in the same order at the end:
the **fills** the packs marked — the project ids and their surfaces, the
repo-name key, the commit gate's scopes and forge links where their sources
exist — then the **three merges** (ignore sections, hook fragments, editor
fragments), then the **git pass**, then the report.

Both pipelines materialize the same three baselines. They are fetched by the
**fixed slugs** `mise`, `repo-gates` and `repo-hygiene` — fixed, never
constructed: a name assembled from configuration is one that can silently
resolve to nothing, which is the rule the `ux-gate` and design-adapter seams
already follow. The secrets provider is fetched by whichever slug the user
picked at question 4.

Their landing is consent-gated by the materializer, and their presence in its
lockfile is what tells a later run — or `/vwf:setup` — that the repo is shaped
at all.

## The report

Every run ends with the same report — six file sections, then the git section
— each a count and its lines, and an empty section printed as `none`:

```text
Files written     <n>    + <path>            (one per line)
Files moved       <n>    <old> → <new>
Tasks renamed     <n>    <old> → <new>
Sections appended <n>    <name>
Fragments merged  <n>    <name>
Deferred          <n>    <what> — unlock: <what would let it happen>
```

Then a **git** section, from the pass that just ran — four lines, each `none`
where nothing happened:

```text
Branches created  <n>    <name>
Commit                   <short hash> <the fixed message>   (or: not committed)
Pushed            <n>    <branch> → origin
Forge default            <what the task reported, verbatim>
```

The forge line is the task's own words and never a paraphrase: whether the
default was set or a command was printed for a human to run is the task's
finding, and re-stating it here is how a printed command gets quietly reported
as a completed change.

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
  project ids gain their real source, the commit gate's scope list becomes
  fillable, and a per-project task group may need to move. The run reports it
  as an **id source changed**, and it is expected work rather than drift.
- **After a stack pack's version moves.** New files, new fragments, new marked
  positions. The plan shows what the repo lacks; the adapter's own re-sync
  command is what shows a diff for a file the repo already has.
- **On a fresh clone that reports drift.** Anything the previous run
  **deferred** — an offline ignore section, a missing toolchain binary, a
  declined materialization — is still deferred in the clone, and its unlock is
  a re-run.
- **Whenever `/vwf:doctor` says so.** Doctor is what notices the drift between
  a run: adapter lockfile against installed packs, registry ids against the
  scope list and the task groups, a missing branch. Its finding prints
  `/vwf:setup reshape`, once, as the one remedy for every shape row.

A run that finds nothing costs one empty plan and says the repo is shaped —
which is the answer, not a wasted run.

Every one of those moments reaches `init` through the same door. `/vwf:setup`'s
Step 0 offers `init` whenever the repo shape is **missing or drifted**, so a
repo that reached setup first is not stranded and a repo that has fallen behind
is not left there; `/vwf:setup reshape` forces that offer and stops once `init`
returns, which is what a user runs when they want the shape reconciled and
nothing else.
