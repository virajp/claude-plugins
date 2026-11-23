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

- **bootstrap's repo facts** — `repo.topology` and `repo.members`, each read
  with `bootstrap config get <key> --json`
  (`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`), and, per repo, the
  tools it selects with their category and each `repo.projects.<name>`, read
  with `bootstrap describe --json`.
- **The stack adapter's menu payload** — each bundle's `tools:`, and each
  `addons.yaml` entry's `plugin`, `marketplace` and `repo`
  (`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`, the menu payload).
- **`.config/vwf.yaml`** — each `projects.<name>.repo`, and every stack
  axis: each `projects.<name>.stack.template`, `services` and `deploy`,
  plus `repo.stack.template` and, since `config_format` 19,
  each `projects.<name>.stylesheet`
  (`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, "The three axis states"), and,
  since `config_format` 25, the product-level `addons:` list.
- **Each repo's adapter lockfile** — `.claude/stackgen/lock.yaml`, the
  materialization record. Read the **slugs** its `entries:` carry and nothing
  else: which paths landed, with what hash, is the adapter's bookkeeping, and
  setup has no business reading it. An absent lockfile means nothing in that
  repo is materialized. Two exceptions: converting old rows, below, looks for
  a row of a removed kind, and removing a dropped pack reads the component
  packs the entries record (`pack/<type>/<slug>@<version>`) and the files
  recorded for them.

The pass reads nothing from `.config/stackgen.yaml`, which is the old layout's.

The axes live in the **base's** `.config/vwf.yaml` only. A member repo has no
config of its own — it carries a back-link
(`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`) — so this pass never writes
into a member's config, in any topology.

## Resolve the target repo, per project

The repo of a project is the member its `projects.<name>.repo` names, at that
member's `folder` relative to the base root. A project with no `repo` key is
the **base's**, and so is a project whose `repo` names a `folder` member: that
member is a folder of the base repo's tree, so its project lands in the base,
in the base's lockfile, with no `repo:` line, as
`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md` states. Under `repo.topology`
`repo` and `monorepo` there are no
members and everything is the base's. The `repo.stack.template` axis describes
a checkout rather than a project, so its target is the repo that declares it.
The `addons:` list belongs to the **base**: in a multi-repo product members
declare no addon, and in a single repo the repo is the base.

A member that is declared but **not on this machine** — an uncloned sibling, or
an empty submodule directory — is a blind spot, never a finding. Report it
with its checkout line (`git submodule update --init <folder>` for a
`submodule` member, the recorded `url` for a `sibling`) and skip every axis
that targets it. Nothing is written on its behalf.

## The order, per repo

The pass runs these steps per repo of the product, base first, in order:

1. [convert old lock rows](#convert-old-lock-rows);
2. [add and link the bundle tools](#add-and-link-the-bundle-tools), for the
   repo's [landing list](#build-the-landing-list);
3. [invoke the adapter](#invoke-the-adapter-once-per-entry), once per entry;
4. in the base alone, [declare the addons](#declare-the-addons).

**A declined step stops that repo's pass** with a report line naming the step;
the other repos go on. **A failed `bootstrap` or `mise` call stops that repo's
pass** with the errors it printed, as returned; the other repos go on.

## Convert old lock rows

Read the repo's `.claude/stackgen/lock.yaml`. A row
`pack/<kind>/...` whose `<kind>` is `language`, `package-manager`,
`toolchain-gate`, `design-tool` or `addon` was written before tool knowledge
and design tools, and those kinds are gone. When the lockfile holds any such
row, setup offers, before anything else in that repo, one consent naming each
row, and on a yes invokes `/stackgen:stackgen-sync` in that repo, whose
one-time conversion turns tool-pack rows into tool rows, moves a design tool
into `vwf-tools` and removes addon rows. The conversion takes no consent line
of its own, so this one is its gate; anything else the sync offers is on the
sync's own consent lines, and setup adds none. A lockfile with no such row
asks nothing, and a decline stops that repo's pass.

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

**The landing list holds bundle slugs only.** An `addons:` name is no landing
entry and goes to no `-stack-template` call: an addon is a Claude plugin the
`claude` tool declares, and [declare the addons](#declare-the-addons) is what
adds and drops it. An absent `addons:` and `[]` both mean no addon, and this
pass never writes `unresolved` there.

An empty landing list is the ordinary state of a re-run: say every pinned axis
is materialized, and move on. That sentence is what makes the pass idempotent
on a repo setup stamped minutes ago.

## Add and link the bundle tools

For each landing `(repo, slug)`, read the bundle's `tools:` from the menu
payload. Then, in that repo:

1. **Add.** Every bundle tool the repo does not select is added with
   `bootstrap add tool <t> --yes --json`. In the base, `claude` joins the list
   when `addons:` names an addon and the base does not select it. One consent
   line per repo lists every tool to add; nothing to add asks nothing.
2. **Link.** `bootstrap detect --add --yes --json` links the tools to the
   projects, on that same consent.
3. **Link what detect missed.** Only a tool whose category in
   `bootstrap describe --json` is `languages` or `package-managers` gets a
   project link; any other bundle tool only needs to be selected. For each
   such tool, when detect proposes no link of it to the project whose axis
   names the bundle, read `tools.<t>.projects` with `bootstrap config get`
   and run
   `bootstrap config set tools.<t>.projects '<JSON list>' --json` with that
   project added — an empty project folder is the usual cause. The value is
   a shell argument, quoted as Declare the addons' **Quote** step says. A
   project with no `repo.projects.<name>` is skipped here; doctor reports it.

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

`<path>` is the member's `folder` relative to the base repo root. Absent means
the current repo, so a base-targeted landing — a `folder` member's project
among them — carries no such line.

Any call may end in a `declined:` line, after what it returns. Pass each such
line, as returned, into every later `-stack-template` call of this run, in the
same payload style, whatever its target repo, `remove:` and `reconcile-claims:`
calls included. The next run starts without the line, so the offer comes back.

**Each landing is the adapter's own consent line; setup adds no consent of its
own.** The adapter lands one set and takes one commit per slug — that rule is
the adapter's and this pass does not change it. Setup does not batch two slugs
into one gate, and does not present a plan of its own in front of the
adapter's. The adapter materializes the bundle's packs, its tool knowledge,
the LSP servers and the design tool, on that same consent gate.

## Declare the addons

In the base only, after its landings. Each addon is a key
`<plugin>@<marketplace>` = `<owner/repo>` in the `claude` tool's
`plugins.project` map, built from the `plugin`, `marketplace` and `repo` of its
`addons.yaml` entry in the menu payload.

1. **`claude` first.** When the base does not select `claude` and the add step
   did not add it, this step asks its own consent to add it with
   `bootstrap add tool claude --yes --json`; `addons:` empty or absent with no
   key to drop asks nothing.
2. **Read** the map with
   `bootstrap config get tools.claude.plugins.project --json`.
3. **Edit** it: add the key of each `addons:` name; drop each key that matches
   an `addons.yaml` entry not in `addons:`; keep every other key, the user's
   own plugins among them. A key that is not `<name>@<marketplace>` — a
   name and a marketplace of letters, digits, `.`, `_` and `-`, one `@`
   between them — stops the base's pass with a report naming it; setup
   writes nothing.
4. **Quote.** `bootstrap config set` takes the value as one positional
   argument, with no stdin or file form. The map, like any `<JSON list>`
   this pass writes, comes from the repo's committed config, which a cloned
   repo controls: in the serialized JSON replace each `'` with `'\''`, then
   wrap the whole in single quotes. Never pass it unquoted or in double
   quotes.
5. **Write** the whole map back, on one consent line naming the keys it adds
   and drops, with
   `bootstrap config set tools.claude.plugins.project '<JSON object>' --json`.
   A map that would not change asks nothing and writes nothing.
6. **Install.** When `claude` is selected and this run added or dropped a key,
   `mise run setup:ai` installs the added plugins and uninstalls the dropped
   ones.

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
more — `/vwf:architecture` replaced it — has been **dropped**. An addon
dropped from `addons:` is no dropped slug: [declare the
addons](#declare-the-addons) drops its key, and no `remove:` call is made for
it.

**After every removal in this section, one more call reconciles this
machine's claims**,
made once per run in the base on each plugin named in `stacks:`, whether or not
a slug was dropped: `/<plugin>:<plugin>-stack-template reconcile-claims:`. It
takes no slug and is not a landing-list entry. A slug dropped on another
machine reaches this one by a pull, so no `remove:` call is made for it, and
this call is what lets go of its claims. It asks on its own consent and
returns one line, **removed**, **declined** or **unchanged**; setup wraps it
in no consent and no commit. A decline changes nothing, and the next run
offers it again.

**Beside the claims reconcile, on every run, the machine part of the
`config_format` `25 → 26` step.** When this machine's stack plugin manifest
holds any MCP server key, setup offers one consent that lists every such key
and the other repos `claims.json` names for it, and says it changes this
machine alone. On a yes it calls
`/<plugin>:<plugin>-stack-template remove: key <name>` once per key, passing
that consent, so the call asks no second time; each call edits only the
manifest and `claims.json`, commits nothing and returns the removed key name.
Setup then prints the removed servers for the user to install by hand, each
under its own name, if they want to keep one. Declined, nothing is written and
the next run offers it again. A manifest with no MCP server key asks nothing
and prints nothing. Each repo's own lockfile records are its `25 → 26` repo
part's, never this call's.

Setup removes a dropped slug itself, with no `remove:` call. For each of
its component packs that no slug still pinned in that repo also composes,
show the files the lockfile records for that component — its `config/`
copies — as one consent per repo.
A **generated** component of the dropped slug — a `<type>/<name>@generated`
ref that no slug still pinned in that repo also composes — has no pack: its
recorded files are the `.claude/` copies the lockfile names for that ref (its
skill, its citations), and they join the same consent. On a yes, delete those
recorded files and their lockfile entries — the slug's `local_plugin` LSP
records with them — and commit, one commit per slug; the claims reconcile then
subtracts the slug's LSP claims from this machine, since the lockfile no
longer records them.
A decline leaves everything as it stands and is reported; `/vwf:setup`
offers it again on the next run. Setup removes no bootstrap tool: the
dropped bundle's `tools:` stay selected in bootstrap, and the report names
them.

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
`projects.<name>.stack.template`, no `services`, no `deploy`, no
`repo.stack.template`, and no `projects.<name>.stylesheet` **on a project
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
it.

**A slug is never rewritten.** Not to `unresolved`, not to anything else. A pin
that was never materialized is not an unanswered question; it is an answered
one waiting on a landing, and the landing list above is what deals with it.
`[]` on a list axis is likewise left alone — it is a decision.

This is the one place setup writes `unresolved`, and it is narrow by design:
**absent axis, and nothing else.**

## The report

One block, carried back to the spine:

- one line per repo whose old lock rows were offered for conversion —
  **converted** or **declined**;
- one line per repo for the bundle tools — the tools **added**, the projects
  **linked** by `config set`, or **declined**;
- one line per entry in the landing list — the repo, the slug, and one of
  **landed**, **declined**, or **already materialized**;
- one line for the addons — the `plugins.project` keys **added** and
  **dropped**, whether `setup:ai` ran, or **declined**;
- one line per repo whose pass stopped on a failed `bootstrap` or `mise` call,
  with its errors;
- one line per dropped pack — the repo, the slug, and **removed** or
  **declined**, naming the bundle's tools that stay selected in bootstrap;
- one line per plugin for the claims reconcile — the plugin, and **removed**,
  **declined** or **unchanged**;
- one line for the MCP server cleanup when it was offered — **removed**, with
  the server names to install by hand, or **declined**;
- one line per member skipped as absent, with its checkout line;
- one line per axis written `unresolved`, naming the project and the axis;
- the sentence **"architecture decides; setup pins"**, so a reader knows where
  a slug came from and which command changes it.

A run with nothing to land and nothing to defer still reports — one line saying
every pinned axis is materialized and every axis is answered. Silence is
indistinguishable from a pass that did not run.
