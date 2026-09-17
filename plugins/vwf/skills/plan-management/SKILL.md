---
name: plan-management
description: The one owner of docs/plans/ bookkeeping — the plan index
  docs/plans/index.md, every plan folder's Status block, and the move into
  docs/plans/archived/; and the one implementation of the reads on them — the
  next pick, the resolution of a folder's requires list, priority derivation,
  the listing. Invoked by /vwf:plan and /vwf:change-plan at hand-off, by
  /vwf:execute at claim, status changes and landing, and by a session when the
  user asks to archive or list plans — never typed.
argument-hint: "[add <folder> | claim <folder> | status <folder> <state> [detail] | complete <folder> | archive [folder] | next | resolve <folder> | priority <folder> | list]"
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

Three things, and nothing else, are written here:

- the **rows** of the base repo's `docs/plans/index.md` — the one table every
  vwf command reads to find a plan;
- the **Status block** at the top of every plan folder's `index.md` — the bold
  word and the one line under it;
- the **move** that retires a folder into `docs/plans/archived/`.

The rest of a plan folder stays with whoever writes it. The folder's content —
`index.md` below the Status block, and every unit file — is the planners'
(`/vwf:plan`, `/vwf:change-plan`). The Run log is `/vwf:execute`'s, written in
the worktree per unit. `docs/backlog.md` is `/vwf:backlog`'s, which this skill
calls and never edits.

**No verb commits.** Every verb writes and stops; the caller commits, and each
verb below names the commit its edit rides: the planner's approval commit for
`add`, `/vwf:execute`'s two `docs: plan queue — <folder> …` commits for
`claim` and `complete`, `/vwf:execute`'s final `docs:` commit in the worktree
for the landing's `status` and `archive`, and the git-workflow commit of the
session that asked for a standalone `archive`.

## The files

| File         | Path                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| Plan index   | `docs/plans/index.md` (base repo)                                               |
| Plan folder  | `<target-repo>/docs/plans/<date>-<name>/index.md` — the Status block at its top |
| Archived     | `<target-repo>/docs/plans/archived/`                                            |
| Folder shape | `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`                         |
| Membership   | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`                                    |
| Backlog      | `docs/backlog.md` (base repo) — closed via `/vwf:backlog`                       |
| The contract | `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`         |

The contract — `references/plan-index.md` beside this file — is the index's
shape and every procedure over it: the columns, the priority derivation,
`requires:` resolution, the pick, reading the queue, writing a row, the sweep.
The verbs below point at its sections rather than restate them.

A plan is a **folder** — `docs/plans/<date>-<name>/`, an `index.md` plus one
file per unit, shaped per the folder shape above. Two kinds exist, told apart
by the `type:` in the `index.md` frontmatter, and every verb treats them the
same unless it says otherwise:

- a **cycle plan** — `type: vwf-plan`, written by `/vwf:plan` for a blueprint
  slice. Its folder lives in the **target repo**, the member whose code it
  changes, and is archived there;
- a **change plan** — `type: vwf-change-plan`, written by `/vwf:change-plan`
  for ad-hoc work. Its folder lives in the base repo.

Either kind is **one row** in the one table of the index, and the row always
lives in the base. **Read the index, never walk the members** — under
`multi-repo` most are not on this machine, so a walk would list the product's
plans as a function of what happens to be cloned.

## Where each verb runs

The index is edited **only in the main checkout, on the integration branch** —
a run branch never touches it, which is what lets two sessions land in
parallel without a conflict on it; the contract's *Writing a row* is the
procedure, one plain git command per step. The Status block and the move are
edited **wherever the folder is** — a worktree during a run, the main checkout
otherwise. A verb that edits both, invoked from a worktree, does the folder
half and says the row is left for the landing's `complete`.

## Verbs

`$ARGUMENTS` selects one. With no argument, run `list`.

### `add <folder>`

The planner's hand-off. Read the folder's frontmatter — `type:`, `title:`,
`requires:`, `backlog:`. A folder whose Status block does not read `DRAFT` is
refused in one line: it was handed off already, or never came from a planner.
Then:

1. set the Status block to `**APPROVED**` with `APPROVED <date> by the user`
   under it;
2. derive the priority, the `priority` rule below;
3. append the row, per the contract's *The columns*: `Folder` the folder's path
   relative to its repo root, `Kind` from `type:` — `vwf-plan` is `cycle`,
   `vwf-change-plan` is `change` — `Plan` the `title:`, `Target repo` per
   membership (the member whose code a cycle plan changes under `multi-repo`;
   `—` for a change plan, and for any plan in a `repo` or `monorepo`
   topology), `Priority`, `Status` `APPROVED`, `Requires` the basenames of
   the `requires:` entries or `—`, `Backlog` the `backlog:` ids or `—`. When
   the file is absent, write the contract's *prose frame* — the intro and the
   header row — first, then the row.

The edit rides the planner's approval commit.

### `claim <folder>`

The contract's *Writing a row — the claim*: in the main checkout, on the
integration branch, pull, and set the folder's row from `APPROVED` to
`RUNNING` — the `Status` cell alone; `Kind` and `Target repo` are never
edited. Report the edit for the caller's
`docs: plan queue — <folder> running` commit and push; a rejected push is the
caller's to handle per that procedure — a clean rebase pushes again, a
conflict on the same row means another session claimed first, and the caller
re-picks or stops. A row already `RUNNING`, or absent, is refused in one line.
Edits no Status block — the worktree does not exist yet.

### `status <folder> <state> [detail]`

Rewrite **only the Status block** of the folder's `index.md`: the bold word to
`<state>` — `RUNNING`, `BLOCKED`, `COMPLETE` or `APPROVED`; `DRAFT` is the
planners' alone — and the line under it to `<detail>` as given, such as:

- `RUNNING since <ts> in <worktree>`
- `RUNNING — paused at unit <n> …`
- `BLOCKED at wave <n> — …`
- `COMPLETE <date> — <commits>`
- `RUNNING — ready to land by hand on <branch>`

Never mirrors to the index: the row carries `APPROVED`, `RUNNING` or
`COMPLETE` only, and a pause or a block is the folder's detail, not the row's
(the contract's *The columns*). Nothing else in the folder changes. Rides the
caller's next commit in whatever checkout the folder sits.

### `complete <folder>`

The contract's *Writing a row — the completion* plus *The sweep*: in the main
checkout, on the integration branch, after the merge has landed, set the
folder's row `COMPLETE`; re-point `Folder` to `docs/plans/archived/<basename>`
when that directory exists on disk in the folder's repo — the landing's
`archive` moved it — and leave it at the live path otherwise; then run the
sweep. Report the edit for the caller's
`docs: plan queue — <folder> complete` commit and push; a rejected push
re-applies the same row until it lands, and never re-picks.

### `archive [folder]`

Retire a plan folder. **Never delete** — archive.

**1. Resolve which plan(s).**

- If `<folder>` names a **directory**, read its `index.md` frontmatter. A
  `type: vwf-plan` or a `type: vwf-change-plan` is a plan folder — archive it
  whole. Any other directory (no `index.md`, or an `index.md` with another
  `type`) is **refused in one line**: say it is not a plan folder and stop. A
  path to a single file is refused the same way — a plan is never one file. Do
  not guess at a shape.
- Otherwise list the candidates and ask the user which to archive, each with
  its `Kind` shown:
  - the rows of the base repo's `docs/plans/index.md` — every `APPROVED` row is
    offered; a `RUNNING` row belongs to a live `/vwf:execute` run, so it is
    shown marked *in flight* and left out of the offer; a `COMPLETE` row is
    offered only while its `Folder` still points under `docs/plans/` — a
    landing whose gap list was empty moved the folder and re-pointed the row
    under `archived/`, so that row is not offered — it is swept, or waits on a
    `Requires`; a landing with an open gap left the folder live as the working
    record, its row `COMPLETE` at the live path, and the sweep never removes a
    row whose `Folder` is a live path, so it waits here until the move. Either
    way the plan's kind does not matter. Read the index, never walk the
    members;
  - then glance at the folders directly under `docs/plans/` of the current
    repo: any `<date>-<name>/index.md` reading either `type:` with no row is
    listed as **unindexed**, so a hand-made folder is still visible and can be
    archived.
- **A plan is archived in its own repo.** If the target repo is not present,
  offer the consent-gated clone; on decline, skip that plan and say so — moving
  a folder in a repo you do not have is not something to fake.

**2. Completion check.** Before moving, verify each plan is actually complete.
**Warn and ask to proceed** — never refuse — when any of these are unfinished:

- the folder's **Status block** does not read `COMPLETE` — `DRAFT`, `APPROVED`,
  `RUNNING` or `BLOCKED` means the run never landed. A warning, not a refusal:
  archiving an unrun plan is a legitimate thing to want;
- its **Run log** has a unit whose Outcome is not `green` — the folder is the
  record of the run, so a `failed`, `unresolved` or `skipped` row is work that
  never finished;
- for a cycle plan, the "Gaps surfaced during execution" section of its
  `index.md` has **unresolved entries**;
- an unarchived plan's `requires:` names this plan **and** this plan's Status
  block is not `COMPLETE`. An unarchived plan is any `APPROVED` or `RUNNING`
  row of the index, or any folder still sitting directly under `docs/plans/`;
  an entry names a plan by **basename**, and no skill ever re-points a
  `requires:` line. The warning is about what the dependent would read: a
  change plan satisfies a dependent's entry through its `COMPLETE` row or its
  archived folder (the contract's *Resolution*), so archiving one that never
  landed would read as satisfied to the dependent. A plan that did land is
  archived out from under nobody, so no warning fires;
- for a cycle plan, a blueprint doc named in its `covers:` frontmatter is
  **not** `implementation: complete` — the plan is being retired before what it
  covers is fully built. A cycle plan satisfies a dependent's entry only
  through those stamps, so this is the one check a dependent of it needs.

Surface what's outstanding and let the user decide whether to archive anyway.

**3. Move (never delete).** Move the whole directory —
`mv docs/plans/<date>-<name> docs/plans/archived/<date>-<name>` — unit files,
run log and all. Never a file at a time: the folder is one object, and a
half-moved one is a plan the executor cannot read. Create `archived/` if
absent. A plan never changes repo when archived — it is retired where it was
written: a cycle folder moves within its **target repo**, a change folder
within the base.

Then rewrite **only the Status block** of the moved `index.md`:

- if it already reads `COMPLETE`, **leave it** — the executor wrote that at
  landing and it is the truer record;
- otherwise set the bold word to `**ARCHIVED**` and the line under it to
  `ARCHIVED <date> — not run; was <previous status>`.

Nothing else in the folder changes — not a unit file, not the Run log, not the
Consent block.

Then **the folder's row**, per *Where each verb runs*. When this verb runs in
the main checkout, apply the landing edit to the row in the base repo's
`docs/plans/index.md` — the same edit `complete` makes: set the row's Status to
`COMPLETE` — already so on a plan `/vwf:execute` landed with open gaps and left
live — and its `Folder` to `docs/plans/archived/<basename>`, then run the
contract's *sweep* — remove every `COMPLETE` row whose `Folder` points under
`docs/plans/archived/` and that no `APPROVED` or `RUNNING` row's `Requires`
names; a `COMPLETE` row whose `Folder` is still a live path is never swept,
since its folder has not moved. A folder with no row gets none — archiving does
not start listing it. The index is the base's whatever repo the folder moved
in. When this verb runs inside a **worktree** — the landing's call — move the
folder only and report that the row is left for `complete`, since the index
never rides a run branch.

**Close the backlog items.** Either kind may carry a `backlog:` frontmatter
list. For every id on it whose row in `docs/backlog.md` does not yet read
`done`, invoke `/vwf:backlog done <ids>` — a plan can reach `archived/` without
having landed through the command that would have closed them, and a retired
plan leaving an item `planned` forever is the row nobody comes back to. Never
edit `docs/backlog.md` here: `/vwf:backlog` is its only writer, and the
caller's commit carries what it wrote.

**Guard collisions.** Before each move, check the destination does **not**
already exist. On a collision, suffix the archived name (e.g. `-2`) or ask the
user — **never overwrite**. `mv` onto an existing directory **nests** it
instead of failing, so check first. If a move fails, halt and report — do not
delete or overwrite.

**4. Report and mark archived.** Report the moved paths, the row edit made or
left for `complete`, and the commit message the caller should use —
`docs: archive plan <name>` for a standalone archive through
`/vwf:git-workflow`; at a landing the move rides `/vwf:execute`'s final
`docs:` commit. The folder's Run log is the record of the run; the mempalace
journal (room `runs`, drawer `<folder basename>`) is a mirror of it, so if
mempalace is available mark that drawer **archived**
(`mempalace_update_drawer`); skip silently otherwise.

### `next`

The contract's *The pick* and *Reading the queue*, as written there: fetch,
read the table at the integration branch's tip, resolve every `Requires` cell
by basename, take the candidates — every `APPROVED` row, `cycle` or `change`,
whose every entry is satisfied; a `RUNNING` row is never one, nor is a row
waiting on a `RUNNING` requirement — and order them by `Priority` ascending,
then the folder's date prefix, then folder name. Return the first — its
folder, `Kind` and `Priority` — with every other `APPROVED` row and why it was
not taken. Nothing runnable → return the message that procedure prints: each
`APPROVED` row and what it waits on, or that the table is absent or holds no
rows.

### `resolve <folder>`

The contract's *Resolution*, applied to one folder's `requires:` list. For each
entry, matched by **basename** against the rows and the archived folders,
the test its kind takes:

- a **cycle** requirement — every doc in that plan's `covers:` reads
  `implementation: complete` in the base repo's blueprint; its row is not the
  test;
- a **change** requirement — a `COMPLETE` row, or a folder under
  `docs/plans/archived/` with no row; an `APPROVED` or `RUNNING` row is not
  yet satisfied;
- neither a row nor a folder anywhere — **unresolvable**, named.

Return *runnable*, or the entries that block, each with the reason — the row
status, the `covers:` doc not yet complete, or the entry that resolves to
nothing. Never re-points a `requires:` line.

### `priority <folder>`

The contract's rule under *The columns*: `10 + max` over the `Priority` column
of every unarchived `requires:` row in the index, or `10` when the folder
requires none of them. Return the integer and the row it stands on. Never
asked, never hand-edited.

### `list`

Print the table, ordered by `Priority` then folder — each `RUNNING` row marked
*in flight*, each `COMPLETE` row whose `Folder` is still a live path marked
*awaiting archive* — then the folders directly under the current repo's
`docs/plans/` whose `index.md` reads either `type:` with no row, marked
*unindexed*. An empty table is a one-line answer, not an error.

## Who calls it

The index, the Status block and the archive move as plans are written, run and
retired, and the commands that do that work call this skill rather than
carrying the procedure:

| Caller                          | When                                                  | Verb                               |
| ------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| `/vwf:plan`, `/vwf:change-plan` | at the gate, deriving the folder's priority           | `priority <folder>`                |
| `/vwf:plan`, `/vwf:change-plan` | at self-review, checking `requires:`                  | `resolve <folder>`                 |
| `/vwf:plan`, `/vwf:change-plan` | at hand-off, once the folder is approved              | `add <folder>`                     |
| `/vwf:execute`                  | in its `next` mode, picking the plan                  | `next`                             |
| `/vwf:execute`                  | at preflight, on the named folder                     | `resolve <folder>`                 |
| `/vwf:execute`                  | before the worktree is cut                            | `claim <folder>`                   |
| `/vwf:execute`                  | at every Status change — start, pause, block, landing | `status <folder> <state> [detail]` |
| `/vwf:execute`                  | on a green landing with no open gap                   | `archive <folder>`                 |
| `/vwf:execute`                  | after the merge lands                                 | `complete <folder>`                |
| a session, on the user's word   | the user asks to retire a folder, or to see the queue | `archive [folder]`, `list`         |

## What this skill never does

- **Commit.** Every verb writes and stops; the caller commits, on the commit
  each verb names.
- **Edit a unit file, the Run log or any doc.** The Status block, the index
  rows and the move — nothing else in the folder, and nothing outside it.
- **Walk the members for plans.** The index is the view; a walk lists what
  happens to be cloned.
- **Re-point a `requires:` line.** An entry that resolves to nothing is named;
  the user fixes it by hand.
- **Delete a folder.** Archive moves; nothing here removes.
- **Decide whether a warning blocks.** Every completion warning asks; the user
  decides.
- **Take a `RUNNING` row.** `next` never picks one and `claim` refuses one;
  a stale claim is released only by a hand edit back to `APPROVED`, committed
  on the integration branch.
