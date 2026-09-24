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
  Since `config_format` 21 it also carries the **`answers:`** block — the
  four conditional axes, read here and passed to every landing ("The answers
  map" below).
- **Each repo's adapter lockfile** — `.claude/stackgen/lock.yaml`, the
  materialization record. Read the **slugs** its `entries:` carry and nothing
  else: which paths landed, with what hash, is the adapter's bookkeeping, and
  setup has no business reading it. An absent lockfile means nothing in that
  repo is materialized. Three exceptions: the fallback for a config with no
  `answers:` block, which reads the pinned provider slug off it and nothing
  more; the machine-env step below, which reads the hash recorded for a
  pack's template entry before it runs that entry's `detect`; and the same
  step's re-record of the hash of each file it fills.

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

Beside it — **always**, base-targeted or not — the four answers, in the same
payload style:

```text
answers:
  forge: <forge>
  editor: <editor>
  secrets: <provider>
  update_bot: <bot>
```

### The answers map

Those are the conditional axes a pack's `conditional:` entries are evaluated
against, and they are read from the **base's** `.config/vwf.yaml`
(`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, the `answers:` block):
`editor` and `secrets` once for the product, from `answers.editor` and
`answers.secrets`; `forge` and `update_bot` from the `answers.repos:` entry
keyed by the **target** repo's member path, spelled exactly as
`enforcement.kept_files` spells one — `.` for the base. `none` is a legal
value on every axis and is passed as it stands: it is an answer, not an
absence.

**The forge is re-read live.** Before each entry is invoked, read the target
repo's `origin` host and pass **that** as the `forge` axis. The recorded
value is the record, and the fallback for a repo whose remote answers
nothing — so a repo whose `origin` appeared after init is evaluated against
the forge it actually has, with nobody remembering a reshape.

Where the live host **contradicts** the recorded value, rewrite that one
value in place — `answers.repos.<path>.forge`, that key and nothing else —
and name the rewrite in the report. It is the only config key this pass
writes: the pass writes no `answers:` block of its own and touches no other
key in one. Landing the forge-conditioned files the stale record had skipped
is the **reshape's**, not this pass's: `/vwf:doctor`'s predicate (e) reports
the staleness and names `/vwf:setup reshape`, so those files land there and
never silently mid-pass.

**A config with no `answers:` block** — a repo still at `config_format` 20 —
is not a reason to pass nothing, which would read as unanswered and land
every conditional path. Infer what init's own seeds would give, pass that
map, and **write nothing**:

- `forge` — the target repo's `origin` host, `none` where there is no
  remote;
- `editor` — a `.vscode/` directory in the target repo, or the editor binary
  on `PATH`, else `none`;
- `secrets` — the provider slug the target repo's adapter lockfile pins,
  else `none`;
- `update_bot` — a Renovate config or a Dependabot config in the target
  repo, else `none`.

Doctor's stamp check reports 20 → 21 as drift in its own right, and the
reshape that follows is what asks the two questions and writes the block.
This pass never writes one.

**Each landing is the adapter's own consent line; setup adds no consent of its
own.** The adapter lands one set and takes one commit per slug — that rule is
the adapter's and this pass does not change it. Setup does not batch two slugs
into one gate, and does not present a plan of its own in front of the
adapter's.

## Ask the machine env

Some values a stack needs are facts about the **machine** that builds it, not
decisions anyone makes — a tool's installed version, a device the tests run
on. A pack declares them in its `machine_env:` fact, which the template
payload carries as a list of `{ name, detect, question }`: `name` an
environment variable, `detect` a shell command whose stdout is the default,
`question` the prompt. The pack lands a file with a marked position named for
each `name` — typically a toolchain `conf.d` fragment's environment table —
and lands it **unfilled**; filling it is this step's.

**When it runs.** For every entry this pass **landed**, once the adapter
returns, read `machine_env` off the payload it returned. For every entry the
landing list skipped as already materialized, fetch its payload — a pure
read — and run the step the same way. A payload with no `machine_env` is
nothing to do.

**Per entry, in the order the pack declares them** — one question each, per
`${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`'s one decision per round:

1. Run `detect` from the target repo's root, inside its toolchain
   environment, stopped after 30 seconds. The command is held in a variable
   and passed to the shell as **one argument** — `mise x -- sh -c "$cmd"` —
   never spliced into a quoted string, so the quotes and `$` references a
   detect command carries reach the shell intact. Its stdout, trimmed, is the
   **detected value**; a non-zero exit, a timeout or empty output is no
   value. **The command runs only while its entry matches what the lockfile
   last recorded:** `detect` is run only when the committed template entry
   it was read from (`.claude/<adapter>/templates/<slug>.md`) still hashes to
   the value its adapter lockfile records. On a mismatch it is not run — the
   entry changed after it was recorded — and there is no detected value; the
   drift is named beside the question.
2. Ask `question`. **Which value is preselected depends only on whether the
   pack landed in this run.** On the landing run, the detected value is
   preselected. A pack whose every `machine_env` position still holds the
   value it shipped with counts as landing in this run too — an earlier
   landing was interrupted before its questions were answered, so nothing has
   been answered yet. On every later run, the position's **current value** is
   — an empty one included, shown as empty, since an empty answer is an
   answer (a platform the value does not apply to, say) — with the detected
   value beside it where the two differ. With no detected value — a failed
   `detect`, or one not run for drift — the landing run offers no default,
   and a later run still preselects the current value: only the detected
   default is withheld. Either way the person may type another, and the
   question is never skipped, and never answered for the person.
3. Write the answer into the marked position named for `name` in the file the
   pack landed, and nothing else in that file. An answer equal to the current
   value writes nothing. **The value is data, never syntax:** one containing a
   newline or any other control character, a template delimiter or expansion
   character of the tool that reads the file (for mise, which renders every
   environment value as a template and, under the pack's shell expansion,
   expands variables: `{{`, `{%`, `{#` or `$`), or a `'` together with a `"`
   or a `\` is refused and the question asked again — a detected value that
   does so is offered as no default — and every other value is written as a
   quoted string in the file's own syntax, escaped by it (for a TOML file, a
   basic string with `"` and `\` escaped), so no answer can end the string,
   add a key, or run as code when the file is loaded.

Then, once per pack whose file changed, **re-record that file's hash** in the
target repo's adapter lockfile — the same re-record `/vwf:init` makes of every
file it fills, and the one lockfile write this pass makes — so the filled
file does not read as drift on the next `/vwf:doctor`. Commit the file and
the lockfile together in the target repo, one commit per pack, its message
naming the slug and the variables filled: the answers were the consent, as
the adapter's consent line was for the landing.

The file is committed, so once answered the value is the **repo's**, not the
machine's: a later run on any machine offers the committed value
preselected, with that machine's detected value beside it where the two
differ, and keeps it unless the person there picks or types another. For
example, a mobile stack might declare its IDE version and a test device
this way.

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
  `/vwf:init`'s plan lists its **Skipped** rows, so a fragment an answer
  dropped is visible rather than silently absent. A landing that skipped
  nothing prints no heading;
- one line per recorded `forge` the live host contradicted — the repo, the
  value replaced, the value written, and `/vwf:setup reshape` as what lands
  the files the stale record skipped;
- one line per machine-env variable asked — the repo, the slug, the name, the
  value written or kept, `no default` where its `detect` produced none, and
  `detect not run — template entry drifted from its lockfile record` where
  the drift gate withheld it;
- one line per member skipped as absent, with its checkout line;
- one line per axis written `unresolved`, naming the project and the axis;
- the sentence **"architecture decides; setup pins"**, so a reader knows where
  a slug came from and which command changes it.

A run with nothing to land and nothing to defer still reports — one line saying
every pinned axis is materialized and every axis is answered. Silence is
indistinguishable from a pass that did not run.
