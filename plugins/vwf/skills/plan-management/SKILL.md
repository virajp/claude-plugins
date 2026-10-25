---
name: plan-management
description: The one owner of docs/plans/ bookkeeping — the plan index
  docs/plans/index.json, every plan folder's status in its index.json, and the
  move into docs/plans/archived/; and the one implementation of the reads on
  them — the next pick, the resolution of a folder's requires list, priority
  derivation, the listing. Invoked by /vwf:plan and /vwf:change-plan at
  hand-off, by /vwf:execute at claim, status changes and landing, and by a
  session when the user asks to unclaim, archive or list plans — never typed.
argument-hint: "[add <folder> | claim <folder> | unclaim <folder> | status <folder> <state> [detail] | complete <folder> | archive [folder] [--force] | next | resolve <folder> | priority <folder | requires…> | list]"
model: sonnet
user-invocable: false
disable-model-invocation: false
---

# plan-management — The Plans as a Set

> **Called by the planners and the executor, never typed.**
> `user-invocable: false` is what keeps `plan-management` out of the `/` menu,
> which is short on purpose; `disable-model-invocation: false` is what keeps
> every caller's invocation working, because a user-only skill is removed from
> the model's context entirely and the invocation would be a silent no-op
> rather than an error — the same pair `init` and the `import-*` adapters
> carry. A user who wants a folder archived or the queue listed asks in prose,
> and the session invokes the verb.

## What it owns, and what it does not

Four things, and nothing else, are written here:

- the **rows** of the base repo's `docs/plans/index.json` — the one plan index
  every vwf command reads to find a plan;
- the **status** of every plan folder — `status.state` and `status.detail` in
  the folder's `index.json`;
- the **run paths** of every plan folder — its `run`, the worktree and the
  action log a run uses, set at `claim` and reset at `unclaim`;
- the **move** that retires a folder into `docs/plans/archived/`, and the
  prune of old action logs that follows it.

The rest of a plan folder stays with whoever writes it. The folder's content —
every other key of `index.json`, the prose of `index.md`, and every unit file
— is the planners' (`/vwf:plan`, `/vwf:change-plan`). The run fields — each
unit's `status`, `commit`, `rounds` and `range`, the `gaps`, `stages` and
`overrides` lists — are `/vwf:execute`'s, written in the worktree per unit.
The backlog — a project on the base repo's forge — is `/vwf:backlog`'s, which
this skill calls and never edits.

**No verb commits.** Every verb writes and stops; the caller commits, and each
verb below names the commit its edit rides: the planner's approval commit for
`add`, `/vwf:execute`'s two `docs: plan queue — <folder> …` commits for
`claim` and `complete`, the same-shaped `… unclaimed` commit of whoever asked
for `unclaim`, `/vwf:execute`'s final `docs:` commit in the worktree for the
landing's `status` and `archive`, and the git-workflow commit of the session
that asked for a standalone `archive`.

## The files

| File         | Path                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| Plan index   | `docs/plans/index.json` (base repo)                                                       |
| Plan folder  | `<target-repo>/docs/plans/<date>-<name>/index.json` — `status` is this skill's            |
| Archived     | `<target-repo>/docs/plans/archived/`                                                      |
| The script   | `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`                           |
| Folder shape | `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`                                   |
| Membership   | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`                                              |
| Backlog      | a project on the base repo's forge, never a path — `done` or `partial` via `/vwf:backlog` |
| The contract | `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`                   |

The contract — `references/plan-index.md` beside this file — is the index's
shape and every procedure over it: the keys of a row, the priority derivation,
`requires` resolution, the pick, reading the queue, writing a row, the sweep.
The verbs below point at its sections rather than restate them.

**Every read and every write goes through the script**, called as
`node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`, written
`plan.mjs` below:

- `plan.mjs get <file> [<path>] [--raw]` reads; `<file>` may be `-`, the JSON
  on stdin;
- `plan.mjs set <file> <path> <value> [--json]` sets one field;
- `plan.mjs append <file> <path> --json <value>` adds one list entry;
- `plan.mjs remove <file> <path>` removes the one list entry the path names;
- `plan.mjs validate <file>` examines a file against its schema and prints
  `<file>: valid`.

A path is dot-separated keys, and a segment after a list chooses the entry by
its `id` — `plans.<basename>.status`, `units.U3.status`, `gaps.G2.state`. A
wrong id is an error, never a new entry. `set`, `append` and `remove`
validate before they write and write nothing on an error, so a red exit is a
verb that stops, reporting the script's stderr line. **No verb rewrites a whole file** with the
Write or Edit tool; the one exception is the empty plan index `add` creates.

A plan is a **folder** — `docs/plans/<date>-<name>/`, an `index.json` holding
every structured fact, an `index.md` holding the prose, and one file per
unit, shaped per the folder shape above. Two kinds exist, told apart by the
`type` of `index.json`, and every verb treats them the same unless it says
otherwise:

- a **cycle plan** — `type` `vwf-plan`, written by `/vwf:plan` for a blueprint
  slice. Its folder lives in the **target repo**, the member whose code it
  changes, and is archived there;
- a **change plan** — `type` `vwf-change-plan`, written by `/vwf:change-plan`
  for ad-hoc work. Its folder lives in the base repo.

Either kind is **one row** in the `plans` list of the index, and the row
always lives in the base. **Read the index, never walk the members** — under
`multi-repo` most are not on this machine, so a walk would list the product's
plans as a function of what happens to be cloned.

## Where each verb runs

The index is edited **only in the main checkout, on the integration branch** —
a run branch never touches it, which is what lets two sessions land in
parallel without a conflict on it; the contract's *Writing a row* is the
procedure, one plain git command per step — `claim`, `unclaim` and `complete`
are the verbs that edit it. `claim` and `unclaim` also edit one key of the
folder there, its `run` — the worktree and log paths, written at claim and
reset to `{}` at unclaim — in the same commit as the row: the worktree does
not exist yet at claim, and no longer exists at unclaim. A folder's `status`
and the move are edited **wherever the folder is** — a worktree during a run,
the main checkout otherwise. A verb that edits both, invoked from a worktree,
does the folder half and says the row is left for the landing's `complete`.
`unclaim` is the one verb that edits both halves in the main checkout: by its
own precondition the run's worktree no longer exists, so the folder is only
there.

## The format test

Only the JSON format is supported. **Every verb runs this test first**, before
it reads or writes anything else, on the local checkout:

- the repo is in the **old format** whenever the base repo's
  `docs/plans/index.md` exists — with or without `docs/plans/index.json`
  beside it, since a migration stopped half way is still the old format;
- a folder the verb names is in the **old format** when it holds an
  `index.md` and no `index.json`.

On the old format the verb **stops and changes nothing**, and prints the
migration message, exactly:

    This repo uses the old plan format. Migrate it with
    https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md
    — in a local clone of virajp/claude-plugins, paste "Read
    `<local path>/docs/plans/migrate.md` and follow it in this repo." — then
    run the same command again.

After the migration the same verb works on the new format.

A repo with **neither** file has no plan: `next` reports no runnable plan,
`list` reports an empty index, `add` creates the index, and a verb that needs
a row refuses with *no row*. An origin tree with no `docs/plans/index.json`
reads the same way to `next`. An **archived** folder with no `index.json` is
not the old format to this test — nothing reads it, and `resolve` takes it as
it is.

## Verbs

`$ARGUMENTS` selects one. With no argument, run `list`.

### `add <folder>`

The planner's hand-off. Refuse in one line, editing nothing:

- while the base repo's `docs/plans/index.md` exists — with the migration
  message of *The format test*: a second plan index beside the old one is
  never started;
- when `plan.mjs validate <folder>/index.json` is red — quote its findings;
- when `status.state` does not read `DRAFT`: it was handed off already, or
  never came from a planner.

Read `type`, `title`, `requires`, `backlog`, `backlog_pieces` and `gaps_of`
from the folder's `index.json`. Before step 1, examine each `gaps_of` entry
against its row, found by basename: refuse the `add` in one line, naming the
entry, unless the row's `status` is `COMPLETE` and its `gaps.open` is above
`0` — otherwise that plan has no gaps to move. An entry that matches no row —
the sweep removed it — gets no edit, and the report names it. Then:

1. set the folder's status — `set <folder>/index.json status.state APPROVED`
   and `set <folder>/index.json status.detail "APPROVED <date> by the user"`;
2. derive the priority, the `priority` rule below;
3. when the base repo's `docs/plans/index.json` is absent, write it once with
   the Write tool, exactly `{"format": 1, "plans": []}` in the script's own
   layout — two-space indent, one trailing newline;
4. `append docs/plans/index.json plans --json <row>`, with every key of the
   contract's *The row*: `id` the folder's basename, `folder` its path
   relative to its repo root, `kind` from `type` — `vwf-plan` is `cycle`,
   `vwf-change-plan` is `change` — `title`, `target_repo` per membership (the
   member whose code a cycle plan changes under `multi-repo`; `null` for a
   change plan, and for any plan in a `repo` or `monorepo` topology),
   `priority`, `status` `APPROVED`, `started` and `ended` `""`, `gaps`
   `null`, `requires` the basenames of the folder's `requires` entries,
   `backlog` and `backlog_pieces` as the folder lists them;
5. for each `gaps_of` entry that has a row,
   `set docs/plans/index.json plans.<basename>.gaps --json <value>` —
   `<basename>` the entry's basename, never the raw path — with the value
   `{"open": 0, "moved_to": [<basenames>]}` — the row's current `moved_to`
   list with this folder's basename added at its end.

The edit rides the planner's approval commit.

### `claim <folder>`

The contract's *Writing a row — the claim*: in the main checkout, on the
integration branch, pull, and set the folder's row from `APPROVED` to
`RUNNING` — `set docs/plans/index.json plans.<basename>.status RUNNING`, the
row's `status` alone — `plan.mjs` stamps the row's `started` in the same
write; `kind` and `target_repo` are never edited. Report the
edit for the caller's `docs: plan queue — <folder> running` commit and push; a
rejected push is the caller's to handle per that procedure — a clean rebase
pushes again, a conflict means another session may have claimed first, and
the caller re-picks or stops. A row already `RUNNING`, or absent, is refused
in one line.

After the row, in the same checkout, write the folder's run paths with one
`set <folder>/index.json run --json '{"worktree": "<dir>/<branch>", "log": "~/Library/Caches/vwf/<repo>/<folder basename>.jsonl"}'`:

- `worktree` is the repo-relative path of the worktree this run will use —
  `<branch>` the plan's name (the `<name>` of `docs/plans/<date>-<name>/`,
  the `<slice>` of `docs/plans/<date>-<HHMM>-<slice>/`), `<dir>` the
  directory `/vwf:git-workflow`'s own rule picks (`.worktrees` wins over
  `worktrees`; the default is `.worktrees`). Under an `all` override that
  shares one worktree across plans, it is that shared worktree's path;
- `log` is the plan's action log. `<repo>` is the basename of the directory
  that holds the git common dir of the repo holding the folder — the name
  `log.mjs` derives. The `~` is written literally: no home path is
  committed, and `VWF_LOG_ROOT` does not change the value.

Both files ride the claim commit. This reverses the older rule that the row
is the one edit the run makes in the main checkout. When the folder lives in
a member repo, the `run` edit is a direct commit on that repo's integration
branch, beside the base repo's claim commit and with the same message;
`worktree` is relative to that repo and `<repo>` is its name. The claim edits
the folder's `run` key only — its `status` is still the run's, set in the
worktree.

### `unclaim <folder>`

The reverse of `claim`, for a claim whose run is gone: the row back from
`RUNNING` to `APPROVED`, on the user's consent, once the run's worktree no
longer exists. It releases a claim; it never takes one — a `RUNNING` row is
still never stolen, and `next` still never picks one.

**Where.** The main checkout, on the integration branch, after
`git pull --ff-only` — the same procedure `claim` follows (the contract's
*Writing a row*), including the stash-if-dirty step and the push-rejection
handling.

**Precondition — the row.** The folder's row must read `RUNNING`. Anything
else is a one-line refusal naming what was found: `APPROVED` — nothing to
release; `COMPLETE` — landed, `archive` is the verb; no row — no row. A second
`unclaim` on the same folder lands on the `APPROVED` refusal.

**Precondition — liveness.** Read the folder's `status.detail` in the main
checkout. It normally names the run's worktree —
`RUNNING since <ts> in <path>` — but whether it does or not, derive the run's
worktree from `git worktree list --porcelain`: a listed path whose basename
is the folder's basename, or whose branch is named for it, or which is the
path the detail names — a run under `/vwf:execute all`'s shared worktree sits
in an `all-<date>-<HHMM>` worktree named for neither. When such a worktree is
listed, **refuse**: print the path and the one line the user runs to prove
the run is gone — `git worktree remove <path>`. Note that git refuses to
remove a dirty worktree, so nothing uncommitted is lost silently, and that a
live session in another window is exactly what this refusal protects. The
verb never removes a worktree.

**The branch.** `git branch --list <folder basename>`. When the branch
exists, the report names it and the line `git branch -D <branch>`, with the
note that a fresh `/vwf:execute` refuses to cut a worktree over an existing
branch until it is gone, and that the user decides whether its committed
units are worth keeping. The verb never deletes a branch.

**Consent.** Print what was found — the row `RUNNING`, the worktree absent,
the branch present or absent, the folder's `status.detail` — and ask once:
reset `<folder>` to `APPROVED`? A no ends the verb with nothing edited.
`unclaim` is a person's request alone: `/vwf:execute` never invokes it — its
resume path names the `unclaim <folder>` request for the person to make.

**The edits.** `set docs/plans/index.json plans.<basename>.status APPROVED`,
nothing else in the row — `plan.mjs` clears its `started` and `ended` in the
same write. The folder's status: when `status.state` already
reads `APPROVED`, leave it — at claim the status is set in the worktree, so
on the integration branch it usually still does; otherwise set
`status.state` to `APPROVED` and `status.detail` to
`APPROVED <date> — unclaimed; was: <previous detail>`. Then reset the run
paths, `set <folder>/index.json run --json '{}'`. The log file stays where it
is: a later claim writes the same `log` path, and the next run appends to it.

**The report.** The edit for the caller's
`docs: plan queue — <folder> unclaimed` commit, plus the branch note when the
branch exists. The caller commits and pushes on the integration branch, the
way `claim`'s commit lands.

### `status <folder> <state> [detail]`

Set **only the folder's status**:
`set <folder>/index.json status.state <state>` — `RUNNING`, `BLOCKED`,
`COMPLETE` or `APPROVED`; `DRAFT` is the planners' alone — then
`set <folder>/index.json status.detail <detail>` as given, such as:

- `RUNNING since <ts> in <worktree>`
- `RUNNING — paused at unit <n> …`
- `BLOCKED at wave <n> — …`
- `COMPLETE <date> — <commits>`
- `RUNNING — ready to land by hand on <branch>`

Never mirrors to the index: the row carries `APPROVED`, `RUNNING` or
`COMPLETE` only, and a pause or a block is the folder's detail, not the row's
(the contract's *The row*). Nothing else in the folder changes. Rides the
caller's next commit in whatever checkout the folder sits.

### `complete <folder>`

The contract's *Writing a row — the completion* plus *The sweep*: in the main
checkout, on the integration branch, after the merge has landed, count the
entries of the folder's `gaps` list whose `state` is `open` —
`plan.mjs get <folder>/index.json gaps` — and on the row:

- `set docs/plans/index.json plans.<basename>.status COMPLETE` — `plan.mjs`
  stamps the row's `ended` in the same write;
- `set docs/plans/index.json plans.<basename>.gaps --json <value>` with
  `{"open": <n>, "moved_to": []}`, `<n>` `0` when none is open;
- `set docs/plans/index.json plans.<basename>.folder <path>` with
  `docs/plans/archived/<basename>` when that directory exists on disk in the
  folder's repo — the landing's `archive` moved it — and leave `folder` at the
  live path otherwise;

then run the sweep. Report the edit for the caller's
`docs: plan queue — <folder> complete` commit and push; a rejected push
re-applies the same row until it lands, and never re-picks.

### `archive [folder] [--force]`

Retire a plan folder. **Never delete** — archive. `--force` overrides the one
refusal in step 2, and nothing else.

**The declared preference "do not ask".** A caller that cannot wait on a
person — `/vwf:execute` at its landing — invokes `archive <folder>` declaring
the preference *do not ask*. With it, the verb asks nothing: a completion
warning in step 2 neither archives nor asks — the verb returns each warning to
its caller and stops, the folder left live and the row as the caller set it —
and a destination collision in step 3 takes the suffix. Without it, the verb
asks as below: a person asked to archive, and is there to answer.

**1. Resolve which plan(s).**

- If `<folder>` names a **directory**, read the `type` of its `index.json`. A
  `vwf-plan` or a `vwf-change-plan` is a plan folder — archive it whole. A
  directory with an `index.md` and no `index.json` is the old format — stop
  with the migration message of *The format test*. Any other directory (no
  `index.json`, or one with another `type`) is **refused in one line**: say it
  is not a plan folder and stop. A path to a single file is refused the same
  way — a plan is never one file. Do not guess at a shape.
- Otherwise list the candidates and ask the user which to archive, each with
  its `kind` shown:
  - the rows of the base repo's `docs/plans/index.json` — every `APPROVED` row
    is offered; a `RUNNING` row belongs to a live `/vwf:execute` run, so it is
    shown marked *in flight* and left out of the offer; a `COMPLETE` row is
    offered only while its `folder` still points under `docs/plans/` — a
    landing whose gap list was empty and whose `archive` returned no
    completion warning moved the folder and re-pointed the row under
    `archived/`, so that row is not offered — it is swept, or waits on a
    `requires`; a landing with an open gap or a completion warning left the
    folder live as the working record, its row `COMPLETE` at the live path,
    and the sweep never removes a row whose `folder` is a live path, so it
    waits here until the move. Either way the plan's kind does not matter.
    Read the index, never walk the members;
  - then glance at the folders directly under `docs/plans/` of the current
    repo: any `<date>-<name>/index.json` reading either `type` with no row is
    listed as **unindexed**, so a hand-made folder is still visible and can be
    archived.
- **A plan is archived in its own repo.** If the target repo is not present,
  offer the consent-gated clone; on decline, skip that plan and say so — moving
  a folder in a repo you do not have is not something to fake.

**2. Completion check.** Before moving, verify each plan is actually complete.
**Warn and ask to proceed** — never refuse, save the one refusal below; under
*do not ask*, warn and return without moving — when any of these are
unfinished:

- the folder's `status.state` does not read `COMPLETE` — `DRAFT`, `APPROVED`,
  `RUNNING` or `BLOCKED` means the run never landed. A warning, not a refusal:
  archiving an unrun plan is a legitimate thing to want;
- a unit of its `units` list whose `status` is not `green` — one warning per
  unit, naming it and its status; the folder is the record of the run, so a
  `pending`, `running`, `failed`, `unresolved` or `skipped` unit is work that
  never finished;
- its `gaps` list has an **`open` entry** — one whose `state` is `open` —
  for either kind of plan; a `closed` entry never warns;
- an unarchived plan's `requires` names this plan **and** this plan's
  `status.state` is not `COMPLETE`. An unarchived plan is any `APPROVED` or
  `RUNNING` row of the index, or any folder still sitting directly under
  `docs/plans/`; an entry names a plan by **basename**, and no skill ever
  re-points a `requires` entry. The warning is about what the dependent would
  read: a change plan satisfies a dependent's entry through its `COMPLETE` row
  or its archived folder (the contract's *Resolution*), so archiving one that
  never landed would read as satisfied to the dependent. A plan that did land
  is archived out from under nobody, so no warning fires;
- for a cycle plan, a blueprint doc named in its `covers` list is **not**
  `implementation: complete` — the plan is being retired before what it
  covers is fully built. A cycle plan satisfies a dependent's entry only
  through those stamps, so this is the one check a dependent of it needs.

Surface what's outstanding and let the user decide whether to archive anyway.
Under *do not ask*, surface it to the caller instead: the warnings are the
verb's return, nothing moves, and the caller reports the archive request to
make later.

**The one refusal — a backlog list that contradicts itself.** Read the
`backlog` list of `index.json` — the ids the plan **finishes** — and its
`backlog_pieces` list — the ids it lands **a piece of**. A `- Bnn:` Parked
line is a line under the `## Parked` heading of the folder's `index.md` that
begins `- B`, digits, a colon. **Refuse** — not warn — a folder that:

- names an id in both `backlog` and `backlog_pieces`; or
- names an id in `backlog` while `## Parked` carries a `- Bnn:` line for it —
  the plan says it finishes the item and, in the same folder, leaves a piece
  of it behind.

The refusal names each such id and quotes its `- Bnn:` lines, and points at the
fix: move the id from `backlog` to `backlog_pieces` with two `set` calls, or
drop the Parked lines once nothing is left. Closing it `Done` would close an
item the folder itself says is open. `archive <folder> --force` archives
anyway, and every id the refusal named is then landed as a piece — `partial`,
**never** `done` (step 3's *Close the backlog items*). `--force` overrides this
refusal and nothing else: the warnings above are still shown and still asked —
or, under *do not ask*, still returned.

**3. Move (never delete).** Move the whole directory —
`mv docs/plans/<date>-<name> docs/plans/archived/<date>-<name>` — unit files,
`index.json` and all. Never a file at a time: the folder is one object, and a
half-moved one is a plan the executor cannot read. Create `archived/` if
absent. A plan never changes repo when archived — it is retired where it was
written: a cycle folder moves within its **target repo**, a change folder
within the base.

Then set **only the status** of the moved `index.json`:

- if `status.state` already reads `COMPLETE`, **leave it** — the executor
  wrote that at landing and it is the truer record;
- otherwise `set … status.state ARCHIVED` and
  `set … status.detail "ARCHIVED <date> — not run; was <previous state>"`.

Nothing else in the folder changes — not a unit file, not a run field, not
the `consent`.

Then **the folder's row**, per *Where each verb runs*. When this verb runs in
the main checkout, apply the landing edit to the row in the base repo's
`docs/plans/index.json` — the same edit `complete` makes: set the row's
`status` to `COMPLETE` — already so on a plan `/vwf:execute` landed with open
gaps and left live — its `gaps` to `{"open": <n>, "moved_to": []}` when it is
still `null`, and its `folder` to `docs/plans/archived/<basename>`, then run
the contract's *sweep* — remove every `COMPLETE` row whose `folder` points
under `docs/plans/archived/` and that no `APPROVED` or `RUNNING` row's
`requires` names; a `COMPLETE` row whose `folder` is still a live path is
never swept, since its folder has not moved. A folder with no row gets none —
archiving does not start listing it. The index is the base's whatever repo
the folder moved in. When this verb runs inside a **worktree** — the
landing's call — move the folder only and report that the row is left for
`complete`, since the index never rides a run branch.

**Close the backlog items.** Either kind carries a `backlog` list — the ids it
finishes — and a `backlog_pieces` list — the ids it lands a piece of. Two
calls, each with the folder, so the backlog moves it off the item's
`Planned in:` line onto its `Landed:` line:

- for every `backlog` id whose item does not yet read `Done`,
  `/vwf:backlog done <ids> <folder>`;
- for every `backlog_pieces` id, and for every `backlog` id a `--force`
  archive overrode, `/vwf:backlog partial <ids> <folder>` — the item goes to
  `Partially done`, never `Done`.

A plan can reach `archived/` without having landed through the command that
would have made these calls, and a retired plan leaving an item `In progress`
forever is the row nobody comes back to. Never edit the backlog here:
`/vwf:backlog` is its only writer, and its edit touches nothing in the tree,
so the archive commit carries no backlog change.

**Guard collisions.** Before each move, check the destination does **not**
already exist. On a collision, suffix the archived name (e.g. `-2`) or ask the
user — under *do not ask*, suffix — **never overwrite**. `mv` onto an
existing directory **nests** it instead of failing, so check first. If a
move fails, halt and report — do not delete or overwrite.

**4. Report and mark archived.** Report the moved paths, the row edit made or
left for `complete`, and the commit message the caller should use —
`docs: archive plan <name>` for a standalone archive through
`/vwf:git-workflow`; at a landing the move rides `/vwf:execute`'s final
`docs:` commit. The folder's `index.json` is the record of the run; the
mempalace journal (room `runs`, drawer `<folder basename>`) mirrors it, so if
mempalace is available mark that drawer **archived**
(`mempalace_update_drawer`); skip silently otherwise.

**5. Prune old logs.** Last, and only when this archive moved a folder into
`docs/plans/archived/` — the later archive of a folder a landing kept live
included — run

    node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs prune --repo <root> --days 30 --keep <folder basename>

once per moved folder, `<root>` the root of the checkout this verb runs in —
the run's worktree at a landing, the main checkout for a later archive by
hand; for a cycle folder, that checkout of its target repo. It deletes only
the action logs of archived plans whose file is more than 30 days old, never
the log of the folder just moved, and never a live plan's log. A failure is a
warning in the report, never a stop of the archive. An archive that moved
nothing runs no prune, and `/vwf:execute` never runs it itself.

### `next`

The contract's *The pick* and *Reading the queue*, as written there: fetch,
read the `plans` list at the integration branch's tip —
`git show origin/<integration>:docs/plans/index.json` piped into
`plan.mjs get - plans` — resolve every `requires` entry by basename, take the
candidates — every `APPROVED` row, `cycle` or `change`, whose every entry is
satisfied; a `RUNNING` row is never one, nor is a row waiting on a `RUNNING`
requirement — and order them by `priority` ascending, then the folder's date
prefix, then folder name. Return the first — its `folder`, `kind` and
`priority` — with every other `APPROVED` row and why it was not taken.
Nothing runnable → return the message that procedure prints: each `APPROVED`
row and what it waits on, or that the index is absent at the tip or holds no
rows.

### `resolve <folder>`

The contract's *Resolution*, applied to the `requires` list of one folder's
`index.json`. For each entry, matched by **basename** against the rows and the
archived folders, the test its kind takes:

- a **cycle** requirement — every doc in the `covers` list of that plan's
  `index.json` reads `implementation: complete` in the base repo's blueprint;
  its row is not the test;
- a **change** requirement — a `COMPLETE` row, or a folder under
  `docs/plans/archived/` with no row; an `APPROVED` or `RUNNING` row is not
  yet satisfied;
- an archived folder with **no `index.json`** — archived before the JSON
  format — satisfies the entry, for either kind, and nothing is read from it;
- neither a row nor a folder anywhere — **unresolvable**, named.

Return *runnable*, or the entries that block, each with the reason — the row
status, the `covers` doc not yet complete, or the entry that resolves to
nothing. Never re-points a `requires` entry.

### `priority <folder | requires…>`

The contract's rule under *The row*: `10 + max` over the `priority` of every
unarchived `requires` row in the index, or `10` when the plan requires none
of them. The argument is either a **folder**, whose `requires` list is read
from its `index.json`, or the **entries themselves** — folder basenames,
possibly none — for a planner at its gate, before the folder is written. Same
rule, same return either way: the integer and the row it stands on. Never
asked, never hand-edited.

### `list`

Print the rows — `plan.mjs get docs/plans/index.json plans` — ordered by
`priority` then folder, each `RUNNING` row marked *in flight*, each
`COMPLETE` row whose `folder` is still a live path marked *awaiting archive*
— then the folders directly under the current repo's `docs/plans/` whose
`index.json` reads either `type` with no row, marked *unindexed*. An absent
index or an empty `plans` list is a one-line answer, not an error.

## Who calls it

The index, the folder status and the archive move as plans are written, run
and retired, and the commands that do that work call this skill rather than
carrying the procedure:

| Caller                          | When                                                               | Verb                               |
| ------------------------------- | ------------------------------------------------------------------ | ---------------------------------- |
| `/vwf:plan`, `/vwf:change-plan` | at the gate, over the `requires` list decided at interview item 12 | `priority <requires…>`             |
| `/vwf:plan`, `/vwf:change-plan` | at self-review, checking `requires`                                | `resolve <folder>`                 |
| `/vwf:plan`, `/vwf:change-plan` | at hand-off, once the folder is approved                           | `add <folder>`                     |
| `/vwf:execute`                  | in its `next` and `all` modes, picking the plan                    | `next`                             |
| `/vwf:execute`                  | at preflight, on the named folder                                  | `resolve <folder>`                 |
| `/vwf:execute`                  | before the worktree is cut                                         | `claim <folder>`                   |
| `/vwf:execute`                  | at every status change — start, pause, block, landing              | `status <folder> <state> [detail]` |
| `/vwf:execute`                  | on a green landing with no open gap, declaring *do not ask*        | `archive <folder>`                 |
| `/vwf:execute`                  | after the merge lands                                              | `complete <folder>`                |
| a session, on the user's word   | the user asks to unclaim a stale plan                              | `unclaim <folder>`                 |
| a session, on the user's word   | the user asks to retire a folder, or to see the queue              | `archive [folder]`, `list`         |

## What this skill never does

- **Commit.** Every verb writes and stops; the caller commits, on the commit
  each verb names.
- **Edit a unit file, a run field or any doc.** The folder's `status`, the
  index rows and the move — nothing else in the folder, and nothing outside
  it.
- **Rewrite a whole file.** Every change is one `plan.mjs set`, `append` or
  `remove` — the sweep removes each row with one `remove`; only the empty
  index `add` creates is written whole.
- **Work on the old format.** *The format test* stops every verb first.
- **Walk the members for plans.** The index is the view; a walk lists what
  happens to be cloned.
- **Re-point a `requires` entry.** An entry that resolves to nothing is named;
  the user fixes it by hand.
- **Delete a folder.** Archive moves; nothing here removes.
- **Decide whether a warning blocks.** Every completion warning asks and the
  user decides — or, under *do not ask*, is returned to the caller and nothing
  moves.
- **Take a `RUNNING` row.** `next` never picks one and `claim` refuses one;
  a stale claim is released only by `unclaim`, on the user's consent, once the
  worktree it names is gone — never by a hand edit.
- **Remove a worktree or delete a branch.** `unclaim` names the commands and
  the user runs them.
