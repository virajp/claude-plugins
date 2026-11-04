# The Materialize Pass

Read this once per `/vwf:setup` run, in **every** mode. It is the one step that
turns a pin into a landed stack.

**Architecture decides; setup pins.** `/vwf:architecture` is what presents the
menu, chooses a slug and writes it to an axis — it materializes nothing. This
pass is what lands whatever is already a slug and has never been materialized
in the repo that slug belongs to. That is also why `/vwf:architecture` invokes
`/vwf:setup` again at its end: a pin the adapter never materialized is exactly
what this pass exists to find, and the user is never asked to remember a
second command.

## When it runs

The pass reads and writes `.config/vwf.yaml`, so it runs on a config that is
already current — never before one exists:

- in `onboard` and `migrate`, immediately **after** the spine's step 2 (the
  config write) and **before** step 3's doctor gate, so a landing that
  happened is visible to the check that reports what did not;
- in `current`, on the config already there, before that mode's report and
  exit. Leaving it out of `current` would strand the whole handoff: a repo
  `/vwf:architecture` just wrote pins into has both stamps current, resolves
  to `current`, and would otherwise never reach this pass at all.

A run that halted earlier — an unparseable config, a bundle that failed
validation — never reaches it, which is correct: there is nothing trustworthy
to read.

## Inputs

- **`.config/vwf.yaml`** — `topology`, `linkage`, `members:`, and every stack
  axis: each `projects.<name>.stack.template`, `backing_template` and
  `deploy_template`, plus `repo.stack.template` and, since `config_format` 19,
  each `projects.<name>.stylesheet`
  (`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, "The three axis states"), and,
  since `config_format` 25, the product-level `addons:` list.
- **Each repo's adapter lockfile** — `.claude/stackgen/lock.yaml`, the
  materialization record. Read the **slugs** its `entries:` carry and nothing
  else: which paths landed, with what hash, is the adapter's bookkeeping, and
  setup has no business reading it. An absent lockfile means nothing in that
  repo is materialized. One exception: removing a dropped pack, below, reads
  the component packs the entries record (`pack/<type>/<slug>@<version>`) and
  the files recorded for them.

The pass reads nothing from `.config/stackgen.yaml`, which is the old layout's.

The axes live in the **base's** `.config/vwf.yaml` only. A member repo has no
config of its own — it carries a back-link
(`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`) — so this pass never writes
into a member's config, in any topology.

## Resolve the target repo, per project

The repo of a project is the member whose `projects:` lists it, at that
member's `path` relative to the base root. A project no member lists is the
**base's**. Under `topology: repo` and `topology: monorepo` there are no
members and everything is the base's. The `repo.stack.template` axis describes
a checkout rather than a project, so its target is the repo that declares it.
Every `addons:` slug targets the **base**: in a multi-repo product members get
no `addon` pin, and in a single repo the repo is the base.

A member that is declared but **not on this machine** — an uncloned sibling, or
an empty submodule directory — is a blind spot, never a finding. Report it
with its checkout line (`git submodule update --init <path>` under `submodule`
linkage, the recorded `url` under `siblings`) and skip every axis that targets
it. Nothing is written on its behalf.

## Build the landing list

For every axis that holds a **slug** — a scalar axis whose value is a slug, and
every element of a list axis — whose target repo's lockfile does **not** name
that slug, record one entry `(repo, slug)`. Then:

- **dedupe by slug within a repo**: two projects in one repo pinned to the same
  slug are one landing, not two;
- **order by registry order** of the first project that needed the slug, so a
  run reads in the order the product is described in;
- **`unresolved` is skipped silently** — it is the absence of a decision, and
  there is nothing to land. It is not reported as a landing that did not
  happen;
- **`[]` on a list axis is a decision, not a landing** — the project ships
  through nothing / talks to no backing service, and that is complete.

**`addons:` joins the list as one more list axis, with one difference: its
slugs are fetched on every run.** Each element is an entry `(base, slug)`, in
list order after the project axes. A slug the base's lockfile already names is
still passed to the adapter's template skill below, because the pick is
committed and the servers land per machine, so another person's first run has
something to do. An absent `addons:` and `[]` both mean no tool: nothing is
landed, and this pass never writes `unresolved` there.

An empty landing list is the ordinary state of a re-run: say every pinned axis
is materialized, and move on. That sentence is what makes the pass idempotent
on a repo setup stamped minutes ago.

## Invoke the adapter, once per entry

For each entry in order, invoke the stack adapter's template skill exactly as
the delegation protocol spells it
(`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`):

`/<plugin>:<plugin>-stack-template <slug>`, passing the principles-catalog
asset paths — `${CLAUDE_PLUGIN_ROOT}/assets/principles/index.md` and its
entries — and, **when the target is not the current repo**, one further line in
the same payload style:

```text
repo: <path>
```

`<path>` is the member's `path` relative to the base repo root. Absent means
the current repo, so a base-targeted landing carries no such line.

Any call may end in a `declined:` line, after what it returns. Pass each such
line, as returned, into every later `-stack-template` call of this run, in the
same payload style, whatever its target repo, `remove:` and `reconcile-claims:`
calls included. The next run starts without the line, so the offer comes back.

**Each landing is the adapter's own consent line; setup adds no consent of its
own.** The adapter lands one set and takes one commit per slug — that rule is
the adapter's and this pass does not change it. Setup does not batch two slugs
into one gate, and does not present a plan of its own in front of the
adapter's. The adapter copies each component's `config/` payload and hands the
tools the component needs to bootstrap, on that same consent gate.

## Record the payload's OS map

A project-axis template payload may carry an `os:` map — which OS the template
targets on each platform (`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`, the
template payload). Setup copies it into the base's `.config/vwf.yaml` as
`projects.<name>.stack.os`, for **every** project pinned to that slug, the way
the stack block's other keys record what the template is:

- **filtered to the platforms the project declares** in the registry — a
  platform the template serves but this project does not ship is dropped, and
  the order of each list is kept, its first entry being the primary frame;
- **absent in the payload means the key is not written** — no OS known, the
  generic canvas frame — and an empty map after the filter is not written
  either;
- **an existing `stack.os` is replaced** with what the payload says, since it
  is the template's fact, not a choice anyone made — a person who wants other
  frames sets the list form of `design.viewports` instead, which outranks it.

It runs for each entry this pass lands, from the payload the landing returns,
and on **every** run for a project-axis pin already materialized whose
`stack.os` is absent, from the payload the adapter's template skill reads back
from the materialized entry — a fetch that lands nothing and asks no
consent — so a repo materialized before the key existed gains its frames on its
next `/vwf:setup`. The write is part of the pass's config write; the key is
additive and moves no `config_format`.

## Remove a dropped pack

A slug a repo's lockfile records that no axis targeting that repo names any
more — `/vwf:architecture` replaced it — has been **dropped**. `addons:`
counts as an axis targeting the base, so a slug removed from it is dropped
there, and a slug still listed is not dropped by a move off another axis.

**A slug dropped from `addons:` leaves through one call**, made for each such
slug in the base: `/<plugin>:<plugin>-stack-template remove: <slug>`, the
removal path for the `addon` axis in
`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`. Setup deletes no file for it.
The call shows its own plan on its own consent, takes
out everything the lockfile records for the slug and commits once, returning
**removed** or **declined**. A declined slug stays recorded, so the next run
offers it again.

**After the `remove:` calls, one more call reconciles this machine's claims**,
made once per run in the base on each plugin named in `stacks:`, whether or not
a slug was dropped: `/<plugin>:<plugin>-stack-template reconcile-claims:`. It
takes no slug and is not a landing-list entry. An addon dropped on another
machine reaches this one by a pull, so no `remove:` call is made for it, and
this call is what lets go of it. It asks on its own consent and returns one
line, **removed**, **declined** or **unchanged**; setup wraps it in no consent
and no commit. A decline changes nothing, and the next run offers it again.

Every other dropped slug is setup's own. For each of
its component packs that no slug still pinned in that repo also composes,
show the files the lockfile records for that component — its `config/`
copies — as one consent per repo.
A **generated** component of the dropped slug — a `<type>/<name>@generated`
ref that no slug still pinned in that repo also composes — has no pack: its
recorded files are the `.claude/` copies the lockfile names for that ref (its
skill, its citations), and they join the same consent. On a yes, delete those
recorded files and their lockfile entries, and commit, one commit per slug.
A decline leaves everything as it stands and is reported; `/vwf:setup`
offers it again on the next run. A tool bootstrap selected for the pack leaves
through the bootstrap delta of `/stackgen:stackgen-sync`.

## A declined landing

Record it in the report as **"declined — pin stays; `/vwf:setup` offers it
again"**, and touch the pin **not at all**. The decline is not a reason to
rewrite an axis: the user declined the landing, not the decision.

What happens next depends on which mode the pass ran in, and the difference is
only in **when** the block lands, never in whether it does:

- **In `onboard` and `migrate`**, the doctor gate at the spine's step 3
  immediately follows. It reports the slug as **pinned, not materialized**,
  which is blocking, so the spine halts and reverts the stamp exactly as it
  does for any other blocking finding.
- **In `current`**, there is no spine and no stamp to revert — the mode reports
  and exits. The decline is reported and the pin stays, and the block is what
  `/vwf:doctor` reports the moment it is run, and what the next spine run of
  `/vwf:setup` halts on. Nothing is silently past the gate; the gate is simply
  not in this run's path.

Either way it is the designed path, not a surprise: a repo that declined its
stack is a repo the rest of the workflow cannot build in, and
`/vwf:setup` offers the landing again on every run until it is taken.

## Write `unresolved` on an absent axis

After the landings, every stack axis that is **absent** — no
`projects.<name>.stack.template`, no `backing_template`, no `deploy_template`,
no `repo.stack.template`, and no `projects.<name>.stylesheet` **on a project
whose registry entry declares a `site` or a `webapp` platform** — is written as
the bare scalar `unresolved`, and the run continues.

The `stylesheet` axis is the one with a condition on it, and the condition is
what keeps it honest: on a project declaring neither of those two platforms the
axis **does not apply**, so an absent key is correct and writing `unresolved`
there would invent a question nobody has to answer.

**Absent means a missing key in a block that exists**, never a missing block. A
config with no `projects:` and no `repo:` at all is the **structure-pending**
state a blank repo is returned in — nobody has described a project yet, so
there is no axis to defer. Writing `unresolved` there would invent a project.
Grow no block here: fill axes inside the blocks the pipeline wrote.

An absent axis on a repo `/vwf:architecture` has not run on
records nothing at all about whether anyone was asked; `unresolved` says
plainly that the question is open and names `/vwf:architecture` as what closes
it. Where `template` is now `unresolved`, write `languages: []` with it — the
one legal empty on a project whose stack is undecided.

**A slug is never rewritten.** Not to `unresolved`, not to anything else. A pin
that was never materialized is not an unanswered question; it is an answered
one waiting on a landing, and the landing list above is what deals with it.
`[]` on a list axis is likewise left alone — it is a decision.

This is the one place setup writes `unresolved`, and it is narrow by design:
**absent axis, and nothing else.**

## The report

One block, carried back to the spine:

- one line per entry in the landing list, `addons:` slugs included — the repo,
  the slug, and one of **landed**, **declined**, or **already materialized**;
- one line per dropped pack — the repo, the slug, and **removed** or
  **declined**;
- one line per plugin for the claims reconcile — the plugin, and **removed**,
  **declined** or **unchanged**;
- one line per member skipped as absent, with its checkout line;
- one line per axis written `unresolved`, naming the project and the axis;
- the sentence **"architecture decides; setup pins"**, so a reader knows where
  a slug came from and which command changes it.

A run with nothing to land and nothing to defer still reports — one line saying
every pinned axis is materialized and every axis is answered. Silence is
indistinguishable from a pass that did not run.
