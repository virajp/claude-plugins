# The plan folder template

One folder shape for both planners. `/vwf:plan` writes it for a blueprint slice
and `/vwf:change-plan` for ad-hoc work; `/vwf:execute` reads it and records the
run in it. The folder holds `index.json`, `index.md` and one `NN-<unit>.md` per
unit, and is named

- `docs/plans/<YYYY-MM-DD>-<HHMM>-<slice>/` for a **cycle plan** — the time
  component stays so two plans for one slice on one day coexist;
- `docs/plans/<YYYY-MM-DD>-<kebab-name>/` for a **change plan**.

A plan with a `review` unit gains one more thing at run time: `execute` saves
each review unit's engine output verbatim as `engine/<loop-id>-<round>.log`
inside the folder — the loop id is the unit id for the unit's main loop and
`<unit-id>-late<n>` for its n-th late re-run, n from 1 (`U7-late1`) —
committed with it, creating the subfolder on the first review unit. The
planner never writes it, and the `archive` verb of `plan-management` moves
it with the folder.

**`index.json` holds every structured fact of the plan; `index.md` holds the
prose.** `/vwf:execute` and `plan-management` read and write `index.json` only
through `plan.mjs`:

    node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs <verb> …

- `get <file> [<path>] [--raw]` prints the value at the path as JSON;
  `--raw` prints a string without quotes; no path prints the whole file.
- `set <file> <path> <value> [--json]` sets one field — a string, or JSON
  with `--json`.
- `append <file> <path> --json <value>` adds one entry to the list at the
  path; an object entry carries an `id` the list does not hold.
- `validate <file>` examines the file against its schema and prints
  `<file>: valid`, or one finding per line on stderr and exit 1.

A path is dot-separated keys; a segment after a list chooses the entry whose
`id` equals it — `units.U3.status`, `gaps.G2.state`, `consent.lsp.dart`. A
wrong id is an error, never a new entry. `set` and `append` validate the
result before they write, and write nothing on any error.

The planner **creates** `index.json` in one step: a whole-file Write with the
Write tool, then `plan.mjs validate` on it. A red validate means the creation
is not finished — the planner corrects the content, Writes the whole file
again and validates again, until it prints `<folder>/index.json: valid`. No
Edit ever touches `index.json`. From the first green validate on, every change
is one `set` or one `append` — never an Edit, never a whole-file rewrite.
`index.md` is never parsed for data, save the `- Bnn:` lines under Parked,
which `validate` matches against `backlog_pieces`.

<!-- Where the retired cycle template's sections went: "Current state (actual)"
     and "Target state (per blueprint)" fold into Facts the survey established;
     "Risks / drift" folds into `decisions`, one entry per contradiction naming
     the conforming unit; "Out of scope for this cycle" is Out of scope;
     "Delta — ordered steps" is the `units` list plus one NN-<unit>.md
     each. -->

## index.json

A change plan:

```json
{
  "format": 1,
  "type": "vwf-change-plan",
  "title": "<title>",
  "requires": [],
  "source": ["B12"],
  "backlog": ["B12"],
  "backlog_pieces": [],
  "gaps_of": [],
  "status": { "state": "DRAFT", "detail": "DRAFT 2026-09-04" },
  "consent": {
    "merge": true,
    "end_all_run": false
  },
  "gates": {
    "unit": ["mise x -- mise run code:format"],
    "wave": ["mise x -- mise run code:lint"],
    "plan": ["mise x -- mise run code:precommit"],
    "keeps": [
      { "id": "K1", "check": "<what a diff cannot prove>", "pass": "<its pass condition>" }
    ]
  },
  "after_landing": [
    { "id": "A1", "step": "<the command or skill to run>", "mode": "run", "notes": "<what it does, and what it reaches>" }
  ],
  "release_levels": [
    { "id": "api", "level": "MINOR", "reason": "<why the change earns that level>" }
  ],
  "dependencies": [],
  "units": [
    {
      "id": "U1",
      "title": "<title>",
      "wave": 1,
      "file": "01-<unit>.md",
      "kind": "edit",
      "model": "opus",
      "owns": ["<path>"],
      "depends_on": [],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0
    },
    {
      "id": "U2",
      "title": "Docs",
      "wave": 2,
      "file": "02-docs.md",
      "kind": "edit",
      "model": "opus",
      "owns": ["README.md", "CLAUDE.md", "docs/**"],
      "depends_on": ["U1"],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0
    },
    {
      "id": "U3",
      "title": "Gates",
      "wave": 3,
      "file": "03-gates.md",
      "kind": "edit",
      "model": "opus",
      "owns": ["<each generated file>"],
      "depends_on": ["U2"],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0
    }
  ],
  "shared_files": [
    { "id": "S1", "file": "<each generated file>", "why": "generated; regenerating mid-wave races", "owner": "U3" },
    { "id": "S2", "file": "<each human-facing doc>", "why": "n units editing one doc", "owner": "U2" }
  ],
  "decisions": [
    { "id": "D1", "decision": "<question>", "ruling": "<answer>", "rejected": "<alternative>", "units": ["U1"] }
  ],
  "stages": {
    "renders": { "state": "pending", "detail": "" },
    "acceptance": { "state": "pending", "detail": "" },
    "ux": { "state": "pending", "detail": "" },
    "reconcile": { "state": "pending", "detail": "" }
  },
  "gaps": [],
  "overrides": [],
  "run": {}
}
```

A cycle plan:

```json
{
  "format": 1,
  "type": "vwf-plan",
  "title": "<title>",
  "requires": ["docs/plans/2026-09-01-0910-<slice>"],
  "source": ["B7"],
  "backlog": [],
  "backlog_pieces": ["B7"],
  "gaps_of": [],
  "covers": ["docs/blueprint/flows/<project>/<NNN>-<flow>/index.md"],
  "exposure": "dark",
  "status": { "state": "DRAFT", "detail": "DRAFT 2026-09-04" },
  "consent": {
    "merge": true,
    "end_all_run": false,
    "lsp": { "dart": "installed" }
  },
  "gates": {
    "unit": ["mise x -- mise run code:format"],
    "wave": ["mise x -- mise run code:lint"],
    "plan": ["mise x -- mise run test"],
    "keeps": []
  },
  "after_landing": [],
  "release_levels": [
    { "id": "api", "level": "MINOR", "reason": "<why the change earns that level>" }
  ],
  "dependencies": [
    { "id": "N1", "package": "<name>", "purpose": "<what for>", "preferred_over": "<the existing thing>", "unit": "U1" }
  ],
  "units": [
    {
      "id": "U1",
      "title": "<title>",
      "wave": 1,
      "file": "01-<unit>.md",
      "kind": "code",
      "model": "opus",
      "owns": ["<path>"],
      "depends_on": [],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0
    },
    {
      "id": "U2",
      "title": "<title>",
      "wave": 2,
      "file": "02-<unit>.md",
      "kind": "code",
      "model": "opus",
      "owns": ["<path>"],
      "depends_on": ["U1"],
      "waits": "<the named reason: it edits a path U1 creates>",
      "status": "pending",
      "commit": "",
      "rounds": 0
    },
    {
      "id": "U3",
      "title": "Review: <what it covers>",
      "wave": 3,
      "file": "03-review.md",
      "kind": "review",
      "model": "opus",
      "owns": [],
      "depends_on": ["U1", "U2"],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0,
      "range": { "from": "", "to": "" }
    },
    {
      "id": "U4",
      "title": "Docs",
      "wave": 4,
      "file": "04-docs.md",
      "kind": "edit",
      "model": "opus",
      "owns": ["README.md", "docs/**"],
      "depends_on": ["U3"],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0
    },
    {
      "id": "U5",
      "title": "Gates",
      "wave": 5,
      "file": "05-gates.md",
      "kind": "edit",
      "model": "opus",
      "owns": ["<each generated file>"],
      "depends_on": ["U4"],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0
    }
  ],
  "shared_files": [
    { "id": "S1", "file": "<each generated file>", "why": "generated; regenerating mid-wave races", "owner": "U5" }
  ],
  "decisions": [
    { "id": "D1", "decision": "<code contradicts the blueprint: what>", "ruling": "<the conforming change>", "rejected": "<adjusting the blueprint>", "units": ["U2"] }
  ],
  "acceptance": [
    { "id": "AC1", "text": "Given <...>, when <...>, then <...>", "flow": "docs/blueprint/flows/<project>/<NNN>-<flow>/index.md" }
  ],
  "stages": {
    "renders": { "state": "pending", "detail": "" },
    "acceptance": { "state": "pending", "detail": "" },
    "ux": { "state": "pending", "detail": "" },
    "reconcile": { "state": "pending", "detail": "" }
  },
  "gaps": [],
  "overrides": [],
  "run": {}
}
```

The rules for each key — JSON has no comments, so they sit here:

- **Every key** in the samples is required, for both kinds, save the
  *cycle-only* keys `covers`, `exposure`, `acceptance` and `consent.lsp`: each
  is required on a `vwf-plan` (`exposure` optional) and a `validate` finding on
  a `vwf-change-plan`. An empty list is written `[]`. An object allows only the
  keys named here — an unknown key is a finding — save `run` and
  `consent.lsp`, which are open.
- **`id`.** Every list of objects has an `id` key, unique in that list,
  matching `^[A-Za-z0-9_-]+$`: `U<n>` for units, `D<n>` decisions, `S<n>`
  shared files, `A<n>` after-landing steps, `K<n>` kept gates, `N<n>`
  dependencies, `AC<n>` acceptance, `G<n>` gaps, `O<n>` overrides, and the
  project name for a release level.
- **`format`** is `1`. **`type`** is `vwf-plan` or `vwf-change-plan`.
- **`requires`** — the earlier plan folders this one stands on, e.g.
  `docs/plans/2026-09-01-x`. **`gaps_of`** — the landed plan folders whose
  gaps this plan takes; at hand-off `plan-management add` sets the `gaps` of
  their rows in `docs/plans/index.json` to an `open` of `0`, with this
  folder's basename in `moved_to`.
- **`source`** — the backlog ids (`Bnn`) this plan was made for, each also on
  `backlog` or `backlog_pieces`; `[]` when no backlog item asked for it.
  **`backlog`** — the ids this plan finishes; landing sets them Done.
  **`backlog_pieces`** — the ids this plan lands one piece of; landing sets
  them Partially done, and each needs a `- Bnn:` line under Parked in
  `index.md`. `validate` refuses an id on both lists, a `backlog` id with a
  `- Bnn:` line, a `backlog_pieces` id without one, and a `source` id on
  neither.
- **`covers`** *(cycle)* — the blueprint doc(s) this plan implements; the
  list the `implementation:` stamp is written to. **`exposure`** *(cycle,
  optional)* — `dark` when the slice ships behind a flag.
- **`status`** — the one status a plan has. `state` is `DRAFT`, `APPROVED`,
  `RUNNING`, `BLOCKED`, `COMPLETE` or `ARCHIVED`; `detail` is one line: when
  it changed and by what — "APPROVED 2026-09-04 by the user"; "RUNNING since
  2026-09-05 10:12 in <worktree path>"; "BLOCKED at wave 2 — U4 UNRESOLVED:
  <ruling needed>; U5 skipped (depends on U4)".
- **`consent`** — **the mode recorded here is the consent.** `merge`: may a
  fully green run merge to the integration branch and push, `true` or
  `false`. `end_all_run` is always present: `true` when the interview (item
  18a) found the plan edits a plugin the run itself loads — one installed in
  the session that runs `/vwf:execute all`, which keeps running the stale copy
  until it restarts — and the user chose to end there — `/vwf:execute all`
  then stops after this plan and reports "restart, then
  `/vwf:execute all`" — and `false` otherwise, written unasked when the plan
  touches no such plugin. `lsp` *(cycle)* holds one key per language
  `/vwf:doctor` flagged without a server, `installed` or `proceed without`,
  answered at `/vwf:plan`'s stack gate — what `/vwf:execute`'s preflight reads
  instead of asking; `{}` when none was flagged.
- **`gates`** — the exact commands confirmed in the interview, one string per
  line; `[]` for none. `unit`: `/vwf:execute` runs every line once before each
  commit it makes on a unit's behalf — the unit's own commit and each fix
  commit — and never while another unit is still editing; a red line is that
  unit's failure. `wave`: run once after each wave, plus the wave review, plus
  every report read for `UNRESOLVED:`; add the plan's own checks here. `plan`:
  run once, after the fixed final waves, over the finished tree, before the
  run is called green. Every `unit` and `wave` line must be green before wave
  1 — a check that holds only once a unit has landed belongs in that unit's
  **Verification**. `keeps`: what a diff cannot prove — a real install, a
  scratch-repo run, a smoke test — each with its pass condition.
- **`after_landing`** — the steps the orchestrator runs after the landing, in
  order, or `[]`. `mode` is always `run`: a `run` step runs on a green landing
  without a prompt, and a step the interview did not confirm `run` (item 17)
  is not in the list; `/vwf:execute` asks nothing at run time. Where a step
  stages something this session already loaded, it is picked up only by a
  **restarted** session.
- **`release_levels`** — one entry per project the units touch, `NONE`
  included. `level` is `NONE`, `PATCH`, `MINOR` or `MAJOR`, derived by the
  planner (interview item 18) — breaks users → `MAJOR`, new behaviour →
  `MINOR`, a fix → `PATCH`, no user-visible change → `NONE` — and shown at
  the gate, where the user may change it; it is never a consent. The plan
  bumps no version and releases nothing: at landing `/vwf:execute` raises each
  level in `.config/releases.yaml` — the highest wins, a key is never lowered —
  and a release is cut later, by hand. An empty list is an old-shape folder: it
  runs as written, and nothing is written to that file.
- **`dependencies`** — one entry per new package: its name, what for, the
  existing thing it was preferred over, the unit that adds it — or `[]`. A
  unit adds nothing not listed here.
- **`units`** — one entry per unit file, in wave order.
  - `title` is the text of the unit file's H1 after `U<n> — `. `file` is the
    unit file's name in the folder. `model` is `opus` by default, a named
    tier, or `inherit` for the session's model. `owns` lists explicit paths;
    the paths of one wave are disjoint.
  - `depends_on` names units of a smaller `wave`. `waits` is the named reason
    the unit is not in wave 1 — it edits a path an earlier unit creates or
    moves, or its Verification needs an earlier unit's output. Every unit sits
    in wave 1 unless it has such a reason; `waits` is `""` in wave 1, on a
    `review` unit, and on the two fixed final units (the files ending in
    `-docs.md` and `-gates.md`), and required everywhere else. A cycle plan's
    waves are ordering only — `execute` runs its units serially in dependency
    order.
  - `status` is `pending`, `running`, `green`, `failed`, `unresolved` or
    `skipped`. `commit` is the unit's last commit hash, or `""`. `rounds` is
    the highest round the unit reached. The planner writes `pending`, `""` and
    `0`; the executor sets each as the run goes, one `set` per field.
  - `kind` is `code`, `edit` or `review`. `/vwf:execute` runs a `code` unit
    through TDD, the coverage gate and its commit — the `code` units one at a
    time; an `edit` unit under the wave review — the `edit` units of a wave
    dispatched together; and a `review` unit through `/code-review` and
    `/security-review` followed by the two reviewers — one loop per unit,
    under the review round cap — over the **branch delta since the previous
    `review` unit**, or since the branch base when it is the first, and each
    later round over the fix commits of the round before it alone. The
    executor records the delta of each round in the unit's `range`
    (`from`, `to`). A review unit that covers `edit` units alone runs the
    security half only — `/security-review` and the security reviewer —
    since the wave review has already judged those units against their files.
  - A `review` unit has `owns: []` and a `range`, which no other unit has; the
    planner writes it `{"from": "", "to": ""}`. It **covers** the units its
    `depends_on` reaches, directly or transitively — so its `depends_on` names
    **at least one** unit, on a cycle plan and a change plan alike; `validate`
    refuses an empty one. Two placement rules, which preflight refuses a
    folder for breaking: the unit sits in a wave **strictly later** than every
    unit it covers — a review in the same wave as its units runs before their
    commit and reviews nothing, since it scopes by commit range; and it covers
    **every earlier-wave unit that no earlier `review` unit already covers**,
    of any kind, on a cycle plan and a change plan alike — so the commit range
    it reviews and the units it covers are the same set, and no unit lands
    between two reviews covered by neither; preflight refuses a review that
    leaves such a unit out. A finding on a file whose unit a review does not
    cover is routed to that unit all the same, whatever its stage, and is never
    dropped — the one rule, in
    `${CLAUDE_PLUGIN_ROOT}/skills/execute/references/review-unit.md`.
  - `/vwf:plan` writes `code` on every slice unit, **one** `review` unit after
    the last code unit and before the docs unit, and `edit` on the two fixed
    final units; `/vwf:change-plan` writes `edit` on every unit and a `review`
    unit only when the change lands runnable code. A `review` unit placed
    earlier than the last code unit is a planner decision — its reason is an
    entry in `decisions`. Execute infers no review: a plan with `code` units no
    later `review` unit covers is refused at preflight.
- **`shared_files`** — each file two units would touch: every generated file
  (owner: the gates unit), every human-facing doc (owner: the docs unit), and
  any other, with why it collides and the unit that owns it.
- **`decisions`** — the assumed decisions, to confirm or override at review:
  the question, the ruling, the rejected alternative, the units it reaches.
  For a cycle plan, every code-contradicts-blueprint drift is an entry: the
  contradiction as the decision, the conforming unit in `units` — the
  blueprint is never adjusted to match code silently.
- **`acceptance`** *(cycle)* — copied verbatim from the Acceptance blocks of
  the flow docs this slice touches, with the path of each flow doc in `flow`
  — the contract `execute`'s acceptance stage verifies end to end. The units
  include the E2E tests that cover each criterion (the coder implements them;
  the acceptance verifier maps and runs them). `[]` when the slice maps to no
  flow.
- **`stages`** — the four plan-level stages `renders`, `acceptance`, `ux` and
  `reconcile`, each `{state, detail}`; `state` is `pending`, `green`,
  `failed` or `skipped`, and `detail` is the reason or the result in one line.
  The planner writes each `pending`; `/vwf:execute` sets each as the stage
  runs or is skipped — on a change plan every stage that does not apply is
  `skipped` — and a resume reads them to know whether a stage already passed.
- **`gaps`** — both kinds; `[]` at approval. `execute` appends one entry per
  blueprint or plan hole as it surfaces: `unit` is the id of an existing unit,
  or `""` for a plan-level gap; `stage` names the stage that found it, or
  `""`; `text` is what the blueprint or plan under- or mis-specified and the
  assumption execution proceeded on, or how the run closed it; `state` is
  `open` or `closed`. The next id is `G<n>`, one past the highest. Only `open`
  entries count in the `gaps` of the plan's row in `docs/plans/index.json`
  and keep the folder live; a person who rules on one sets its `state` to
  `closed` and adds the ruling to its `text`. The durable,
  mempalace-independent copy; full detail lives in the mempalace `gaps` room.
  Reconciled into the blueprint (/vwf:blueprint) and a re-plan (/vwf:plan) at
  cycle end.
- **`overrides`** — `[]` at approval; an `all` run's `override:` block, one
  entry each, its lines joined by `; `. It never changes `consent`.
- **`run`** — `{}`; the planner writes it empty.

There is no run log. The executor records each unit's `status`, `commit` and
`rounds`, and a review unit's `range`, in `index.json` as the run goes, sets
`status` and the `stages`, appends to `gaps`, and mirrors each fact to the
mempalace journal. A resume reads those fields, the `gaps` list and
`git log`.

## index.md

```markdown
# Plan — <title> (<date>)

## Goal

<one paragraph: what is true after this lands. Then the framing that produced
the plan, and any reversal of a standing decision, named as one.>

## Slice <!-- cycle plans only -->

<which flow or entity this plan covers, with a link to its blueprint doc, and
the plan's chain position when it is part of a dependency chain — e.g. "Plan 2
of 3 — requires `<folder>`; required by `<folder>`". A standalone plan states
"no dependency chain". Under `exposure: "dark"`, the flag's name, owner and
removal date, and the unit that removes it.>

## Facts the survey established

<what recall and the survey found, so no unit re-derives it: counts, paths, the
gates that cover the trees, the docs that describe today's behaviour, the
dependencies each tree already has. For a cycle plan: what already exists in
the target repo against what the blueprint says should — reference blueprint
sections, do not restate them.>

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file — the file a package
manager or a toolchain manager writes to pin what it resolved — with Write,
Edit, `sed` or a script: a lock file changes only as the output of the CLI
that owns it, the command the stack's package-manager conventions name, and
the unit keeps what that CLI wrote. A unit whose manifest change moves a lock
file lists that lock file in its `owns` beside the manifest.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

<each declined item, with the reason>

## Parked

<each item raised during the interview that belongs to a later plan, with enough
context to pick it up — or "none". What remains of a backlog item this plan
lands one piece of is a line of its own that begins with the id —
`- Bnn: <piece>` — at least one per `backlog_pieces` id, naming the chained
folder where one already covers the piece; anything else is free prose. These
lines are the one part of `index.md` that is read for data: `validate` refuses
a `backlog_pieces` id with no such line and a `backlog` id with one.>

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/<date>-<name>

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
```

## NN-<unit>.md

The unit file carries no wave, dependency, owned paths, model or kind: those
are the unit's entry in `index.json`, and the orchestrator puts the `owns`
list into the dispatch prompt. Its H1 reads the same as the entry's `title`.

```markdown
# U<n> — <title>

- **Test first:** <code units only — the failing test that defines done>
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** <files to open only if an edit needs them>

## Ruling

<quoted verbatim from the plan's decisions and the user's answers — never
paraphrased>

## Edits

1. **`<path>`** — <what changes, precisely enough that two readers would make
   the same edit>
2. …

## Verification

- <the gate lines this unit must pass before returning>
- <grep-level checks specific to the edit>

## Guardrails

- Do not touch <the neighbour another unit owns>.
- Delete with `rm`, never `git rm`.
- <the trap specific to this tree — the formatter's scope, strict-YAML
  frontmatter, BSD sed, byte-copy not retype>

## Commit

`<type>: <description>` — written by the orchestrator after the unit gate and
the wave gate, not by the unit. The type, and the scope where the repo's
convention file lists any, comes from the file the survey read —
`.config/git-conventional-commits.yaml` or the repo's equivalent — never a
type that file does not allow.
```

## NN-review.md

The `review` unit's file is the H1 and a Scope section, nothing more — no
Edits, no Test first, no Verification, no Commit. The unit edits nothing and
commits nothing; a finding it raises goes back to the unit whose commit last
touched the file inside the review's range — never read from `owns` —
re-dispatched by its kind: a `code` unit's coder in fix-first mode, an `edit`
unit per the wave-review loop-back. The loop, the range, the unit map and what
becomes of a finding outside the review's coverage are
`${CLAUDE_PLUGIN_ROOT}/skills/execute/references/review-unit.md`'s; this shape
restates none of it.

```markdown
# U<n> — Review: <what it covers>

## Scope

<the units this review covers, and the branch delta it reviews — since the
previous review unit, or since the branch base when it is the first. When the
review sits earlier than the last code unit, the reason, as its entry in
`decisions` records it — e.g. a boundary later units build on.>
```

## The two fixed final units

**Docs.** A unit that runs `vwf:docs-sync` over the run's branch delta
(`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and applies its findings plus
every `DOCS FALSIFIED:` line the earlier units returned and the list from
index.md's survey facts. Docs ship with the change, so this unit is never
optional — it runs `/vwf:docs-sync` for every plan, of either kind, and the
executor runs no docs-sync of its own. A confirmed reversal from the interview
also lands here, as a
`docs/memory/decisions/<date>-<slug>.md` per
`${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.

**Gates.** Runs the generators the plan names and passes the full wave gate. It
bumps no version — the plan's `release_levels` are what `/vwf:execute` records
at landing. Its report is the run's final gate. It does not write the
`implementation:` stamps on a cycle plan's `covers` docs — those are the
executor's Reconcile step, gated on `covers` and run before the docs unit's
wave, so the docs unit's delta is complete.

It does **not** run the after-landing steps — those are the orchestrator's,
after the landing, because an after-landing step mutates the machine rather than
the tree under review, and a unit never reaches outside the worktree.
