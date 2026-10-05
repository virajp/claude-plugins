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
  (`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, "The three axis states").
- **Each repo's `.config/stackgen.yaml`** — the values file
  `/stackgen:tool-config` renders from and alone writes. Read `forge`,
  `secrets`, `node`, `external` and each `packs.<slug>` block; never edit it —
  a value changes only through the call that sets it (`all` or `pack`). A
  repo without one is a repo whose shape was deferred at Step 0: it is passed
  the live forge and nothing else, and the `all` step below skips it, since
  laying the shape down is `/vwf:init`'s.
- **Each repo's adapter lockfile** — `.claude/stackgen/lock.yaml`, the
  materialization record. Read the **slugs** its `entries:` carry and nothing
  else: which paths landed, with what hash, is the adapter's bookkeeping, and
  setup has no business reading it. An absent lockfile means nothing in that
  repo is materialized. Two exceptions: the pack steps below read the
  component packs the entries record (`pack/<type>/<slug>@<version>`), and
  the `all` step reads whether any recorded path sits under
  `.config/mise/tasks/setup/external/`.

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

Beside it — **always**, base-targeted or not — the conditional answers, in
the same payload style:

```text
answers:
  forge: <forge>
  secrets: <provider>
```

and, when a component pack of the slug declares `values:`, the values
gathered for it ([Gather the pack values](#gather-the-pack-values)):

```text
values:
  <pack slug>:
    <name, lowercased>: <value>
```

### The answers map

Those are the axes a pack's `conditional:` entries are evaluated against,
read from the **target** repo's `.config/stackgen.yaml`: `secrets` as that
file records it, `forge` read **live** from the target repo's `origin` host
— `github` or `gitlab`, else `none`, the mapping `/vwf:init` passes — so a
repo whose `origin` appeared after init is evaluated against the forge it
actually has. `none` is a legal value
on both axes and is passed as it stands: it is an answer, not an absence. A
repo with no values file passes `forge` alone. Where the live host differs
from the recorded `forge`, the `all` step below writes it; this pass never
edits the values file by hand.

**Each landing is the adapter's own consent line; setup adds no consent of its
own.** The adapter lands one set and takes one commit per slug — that rule is
the adapter's and this pass does not change it. Setup does not batch two slugs
into one gate, and does not present a plan of its own in front of the
adapter's. The adapter copies each component's `config/` payload and runs the
component's `pack` call with the `values:` above as `--set`, so the pack's
templates render on the landing that copies its subtasks.

## Gather the pack values

Some values a stack needs are facts about the **machine** that builds it, not
decisions anyone makes — a tool's installed version, a device the tests run
on. A pack declares each one its templates read as one entry of the
`values:` list in its `pack.yaml`: `name` (the template's `@@NAME@@`),
`detect` (a shell command that prints the value, exiting non-zero when it
cannot tell) and `question`.

**Which packs.** For an entry about to land, the component packs of its
slug: read the bundle's `components:` list and each component's `pack.yaml`
inside the installed adapter plugin's own tree, located from
`claude plugin list` as `/vwf:doctor`'s pack-version check locates it — vwf's
own plugin-root token names vwf and never another plugin's root. For the
re-run below, every component pack the repo's lockfile records. A pack with
no `values:` list is nothing to do.

**Per entry, in the order the pack declares them** — one question each, per
`${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`'s one decision per round:

1. **A value the repo already stores** under `packs.<slug>` in its
   `.config/stackgen.yaml` is kept and passed again, unasked: the file is
   committed, so once answered the value is the **repo's**, not the
   machine's, and another machine running setup does not move it. A person
   who wants another value re-runs `pack` with that `--set` themselves.
2. Otherwise run `detect` from the target repo's root, inside its toolchain
   environment, stopped after 30 seconds. The command is held in a variable
   and passed to the shell as **one argument** — `mise x -- sh -c "$cmd"` —
   never spliced into a quoted string, so the quotes and `$` references a
   detect command carries reach the shell intact. A zero exit with output,
   trimmed, is the value.
3. A non-zero exit, a timeout or empty output asks `question`. An empty
   answer is an answer — a platform the value does not apply to, say — and
   the question is never skipped and never answered for the person.

Every value is passed as `--set <name, lowercased>=<value>`. **The value is
data, never syntax:** the script refuses one holding a quote, a backslash,
`@@` or a control character, so setup refuses it first — a detected value
that does is asked as though `detect` failed, and a typed one is asked
again.

## Answering the skill's rows

Every call below reaches `/stackgen:tool-config` the same way, and this is
the one place the form is stated. First the call prefixed with `preview`,
which writes nothing and returns the rows the call would show, each with an
id — `r1`, `r2`, … Setup shows those rows inside its own question and takes
an answer to **every** row, spelled as the skill spells it: `ok` takes the
render, `keep-existing` leaves the file as it stands for this run. The row
for `.config/stackgen.yaml` takes `ok` alone — declining it declines the
call. Then the real call, with the answers as its **last** argument:
`--answers <id>:<answer>,…`. That is what keeps the skill from asking a
second time. A call whose answers miss a row, misname one, or name one that
changed since the preview is refused **whole** and its rows shown again — so
no call is made with a row nobody answered, and a changed tree is asked
about afresh rather than written over. A person who declines the call
outright is reported, and nothing is written. A preview that returns no row
needs no answers and makes no call.

A call the script refuses because the repo's mise config is untrusted, or
because a tool it runs is not installed, names its remedy — trust the path;
run `MISE_ENV=dev mise run setup:all` — which is the person's to take before
the call is re-run.

## Re-run each landed pack

A pack's templates render when it lands, once. A later adapter release that
changes a template, and a value a person changed, would otherwise never
reach a repo that landed the pack before it, so this step re-runs `pack` for
every landed pack on **every** run, in every mode.

**Which packs.** For each repo, every pack its adapter lockfile records as a
component — an entry sourced `pack/<type>/<slug>@<version>` — minus any a
landing above just ran, since that landing ran the call itself. Its directory
is `stacks/<type>/<slug>/` inside the installed adapter plugin's tree,
located as [Gather the pack values](#gather-the-pack-values) locates it.

**Preview, then run**, as
[Answering the skill's rows](#answering-the-skills-rows) states:
`pack --slug <slug> --dir <pack dir>` with one `--set` per `values:` entry,
gathered as above. The call is idempotent: a pack whose render matches the
repo returns **no row**, and is not mentioned beyond the report's count. A
changed template comes back as a `write` row carrying its diff, and those
rows are shown together for the repo behind one consent of this step's;
with no row, nothing is asked. A file the pack's version no longer renders is
a `delete` row. Bringing a newer pack version's `config/` payload is the
adapter's sync, not this step's.

Commit what changed in the target repo, one commit per pack, its message
naming the pack, the values filled and the files re-rendered.

## Remove a dropped pack

A slug a repo's lockfile records that no axis targeting that repo names any
more — `/vwf:architecture` replaced it — has been **dropped**. For each of
its component packs that no slug still pinned in that repo also composes,
preview `pack-remove --slug <slug>`: it deletes the pack's
`conf.d/<slug>/` folder and every subtask named `<slug>`, drops
`packs.<slug>` from the values file and re-renders the `…:all` tasks, so no
gate calls a task that is gone. Show its rows beside the files the lockfile
records for that component — its `config/` copies — as one consent per repo.
On a yes, run the call with its answers, then delete those recorded files
and their lockfile entries, and commit, one commit per slug. A decline
leaves everything as it stands and is reported; `/vwf:setup` offers it
again on the next run.

## Re-derive the repo's values

After the packs, three repo-wide values may have moved, each read against
what the repo's `.config/stackgen.yaml` stores:

- **`node`** — `true` when the repo's lockfile records a component that
  runs on Node — the Node package manager pack, the TypeScript language
  pack, the JavaScript lint gate pack — or a slug whose bundle composes that
  package manager; else `false`;
- **`external`** — `true` only when a path the lockfile records sits under
  `.config/mise/tasks/setup/external/`; else `false`;
- **`forge`** — read live from the `origin` host: `github` or `gitlab`,
  else `none` — no remote, or a host that is neither.

Any that differs from the stored value — and only those — goes to one call,
`all --node <v> --external <v> --forge <v>`, each flag present only when its
value changed: a key left out keeps what the file holds. Preview it and
answer it as above. `all` re-renders every universal file the change
reaches — `_base/`'s node tools, the `setup/external/*` tasks — and ends by
running `MISE_ENV=dev mise run setup:all`, whose output tail the script
returns: **relay it**. Nothing changed, no call. A repo with no values file
is skipped, as its inputs say. Commit what the call changed in that repo as
one commit naming the values moved.

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

- one line per entry in the landing list — the repo, the slug, and one of
  **landed**, **declined**, or **already materialized**;
- **the skips the adapter returned**, under their own heading, one line each
  — the path, the pack, and the `when:` that dropped it — listed exactly as
  `/vwf:init`'s plan lists its **Skipped** rows, so a file an answer
  dropped is visible rather than silently absent. A landing that skipped
  nothing prints no heading;
- one line per pack value filled — the repo, the pack, the name, the value,
  and whether it was **kept** from the values file, **detected** or
  **asked**;
- one line per repo for the pack re-run — the packs re-run and how many
  wrote nothing — and one line per row it showed, the pack, the file, and
  **applied** or **kept**;
- one line per dropped pack — the repo, the slug, and **removed** or
  **declined**;
- one line per repo-wide value the `all` call moved — the repo, the key,
  the value replaced and the value written — and the `setup:all` tail it
  returned;
- one line per member skipped as absent, with its checkout line;
- one line per axis written `unresolved`, naming the project and the axis;
- the sentence **"architecture decides; setup pins"**, so a reader knows where
  a slug came from and which command changes it.

A run with nothing to land and nothing to defer still reports — one line saying
every pinned axis is materialized and every axis is answered. Silence is
indistinguishable from a pass that did not run.
