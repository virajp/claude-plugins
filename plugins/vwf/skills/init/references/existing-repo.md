# The Existing-Repo Pipeline

Read this in mode **existing** — a target that already has a configuration
directory or a task library. Something shaped this repo before, and the job is
to reconcile it against what the packs ship without discarding a decision
somebody made on purpose.

Three phases, in order and never interleaved: **survey**, **plan**, **apply**.
The survey writes nothing. The plan is one document. The apply touches only
what the survey listed.

## Survey

Read-only, and exhaustive before anything is printed. Ten passes.

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
one, and the breakage surfaces in whatever that task was protecting.

### 5 — The helper library

The shared helper file's name lost its leading underscore, and so did its
siblings — the legacy table's last row. That is two renames, not one: the
**file**, and every `source` line naming it. A repo that renames the file and
not the sources has a task library where every task fails on its first line.
List both.

### 6 — Missing files

Diff the repo against what the three baseline bundles ship. Every file a
bundle declares and the repo lacks is a **create**, listed with the bundle it
comes from.

A file the repo *has* and a pack also owns is neither a create nor an
overwrite — list it as **already owned**, and point at the adapter's own
re-sync command, which shows the diff and takes its own consent. That command
is **user-run by design**, so `init` names it and never invokes it: seeing a
diff before accepting it is the whole reason it exists.

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
order, then slugification. A per-project task group whose segment is **not**
one of those ids is a **rename**, listed with the proposed destination — the
group was named for something other than a project, and the segment is what
tells a reader which thing a task acts on.

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

### 10 — The gate-config fills

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

One document, printed once, in six sections. Each section opens with its
count; each line is `old → new` for anything that moves or is renamed, `+
path` for anything created, and a bare path with its reason for anything
flagged. Print an empty section as `none` rather than omitting it — a missing
section reads as an oversight, and the reader cannot tell which.

```text
Moves        <n>
Creates      <n>
Renames      <n>
Rewrites (flagged, not applied)  <n>
Appends      <n>
Merges       <n>
```

Close with a single total. A plan whose total is **zero** is the idempotent
case: say the repo is already shaped, print the report, and stop without
asking anything.

## Consent

**One question, two answers**: apply all of it, or stop. Not per file, not per
section. The plan is a coherent reshaping — half of it applied leaves a repo
where the task names moved and their callers did not, which is worse than
either end state.

A stop is a clean exit. Print the plan again as the record of what was not
done, and name `/vwf:init` as the way to revisit it.

## Apply

In the plan's own order, and touching **nothing** the survey did not list.

- **Moves** use `git mv`, so the rename is in the index and the history
  follows the file. The readme move is a move like any other.
- **Creates** are the materializer's, by fixed slug, exactly as the new-repo
  pipeline fetches them. `init` never authors pack-owned content from
  scratch. It does fill the positions a pack **marked** for it — the member
  flags, the shell aliases and the per-project slots of
  [new repo](new-repo.md) §7 — and those are creates like any other, listed
  in the plan and applied here.
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
([new repo](new-repo.md) §11): stage what this run wrote, one consent with
three answers, the fixed shaping message, the branches, the forge-default
question, the push. Two differences, both from the fact that this repo already
existed:

- The first commit here is **not** before hook wiring. That is why the gate
  configuration went first: with the hooks live, the commit above is what
  makes the tree committable, and the shaping commit then runs through hooks
  that read a settled configuration.
- The branch table's first row cannot apply — this repo has commits. Create
  `develop` from `main` where `develop` is missing, `main` from `develop`
  where `main` is missing, and nothing where both exist. Then ask the same
  forge-default question, with `develop` preselected, and run the same task —
  `mise run setup:default-branch <answer>` — reporting only what it reported.

## Report

The six-section report and the two next-step lines from SKILL.md, filled from
what was actually applied rather than from what was planned. A deferred
materialization, a flagged rewrite and a reported-but-unmoved root file all
belong in **Deferred**, each with its unlock.

**The invariant, stated in the report itself, and stated with its scope:**
running `init` again on a shaped repo produces an empty plan **for the same id
source**. If a second run finds work, it is one of three things, and the report
names which: the first run deferred something; a pack moved, which the
adapter's re-sync command is for; or the **id source changed** — the repo grew
a registry, so ids that came from directories or from the repo's own name now
come from declarations, and pass 9's rename rows say so in those words.

The third is not a broken invariant. It is the re-run doctrine working: `init`
is meant to be run again as the repo learns things about itself, and the
registry is the largest thing it learns.
