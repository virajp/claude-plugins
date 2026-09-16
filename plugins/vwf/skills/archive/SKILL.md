---
name: archive
description: Move completed plans out of the active set into
  docs/plans/archived/ — a whole plan folder, cycle plan or change plan alike.
  Never deletes. May be run manually or offered at the end of execute.
argument-hint: "[plan-folder]"
model: haiku
effort: low
disable-model-invocation: true
---

# archive — Retire Completed Plans

Move completed plans out of the active set. **Never delete** — archive.

A plan is a **folder** — `docs/plans/<date>-<name>/`, an `index.md` plus one
file per unit, shaped per
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`. Two kinds exist, told
apart by the `type:` in the `index.md` frontmatter, and they are archived the
same way:

- a **cycle plan** — `type: vwf-plan`, written by `/vwf:plan` for a blueprint
  slice. Its folder lives in the **target repo**, the member whose code it
  changes;
- a **change plan** — `type: vwf-change-plan`, written by `/vwf:change-plan`
  for ad-hoc work. Its folder lives in the base repo.

Either kind is one row in the one table of `docs/plans/index.md`, per
`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`. Everything below applies to both
unless a step says otherwise.

## Doc Paths

| Doc          | Path                                                      |
| ------------ | --------------------------------------------------------- |
| Plan index   | `docs/plans/index.md` (base repo)                         |
| Active plans | `<target-repo>/docs/plans/`                               |
| Plan folder  | `<target-repo>/docs/plans/<date>-<name>/index.md`         |
| Archived     | `<target-repo>/docs/plans/archived/`                      |
| Backlog      | `docs/backlog.md` (base repo) — closed via `/vwf:backlog` |
| Membership   | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`              |
| Index shape  | `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`              |
| Folder shape | `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`   |

---

## Pipeline

### 1. Resolve which plan(s)

- If `$ARGUMENTS` names a **directory**, read its `index.md` frontmatter. A
  `type: vwf-plan` or a `type: vwf-change-plan` is a plan folder — archive it
  whole. Any other directory (no `index.md`, or an `index.md` with another
  `type`) is **refused in one line**: say it is not a plan folder and stop. A
  path to a single file is refused the same way — a plan is never one file. Do
  not guess at a shape.
- Otherwise list the candidates and ask the user which to archive, each with
  its `Kind` shown:
  - the rows of the base repo's `docs/plans/index.md` — every `APPROVED` row is
    offered; a `RUNNING` row belongs to a live `/vwf:execute` or
    `/vwf:change-execute` run, so it is shown marked *in flight* and left out
    of the offer; a `COMPLETE` row is offered only while its `Folder` still
    points under `docs/plans/` — `/vwf:execute` lands a cycle plan by writing
    the row `COMPLETE` and leaves the move to this skill, and the sweep never
    removes a row whose `Folder` is a live path, so it waits here until the
    move; `/vwf:change-execute` moves and re-points at landing, so a
    `COMPLETE` row already under `archived/` is not offered — it is swept, or
    waits on a `Requires`. **Read the index, never walk the
    members** — under `multi-repo` most are not on this machine, so a walk
    would list the product's plans as a function of what happens to be cloned
    (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`);
  - then glance at the folders directly under `docs/plans/` of the current
    repo: any `<date>-<name>/index.md` reading either `type:` with no row is
    listed as **unindexed**, so a hand-made folder is still visible and can be
    archived.
- **A plan is archived in its own repo.** If the target repo is not present,
  offer the consent-gated clone; on decline, skip that plan and say so — moving
  a folder in a repo you do not have is not something to fake.

### 2. Completion check

Before moving, verify each plan is actually complete. **Warn and ask to
proceed** (don't hard-halt) when any of these are unfinished:

- the folder's **Status block** does not read `COMPLETE` — `DRAFT`, `APPROVED`,
  `RUNNING` or `BLOCKED` means the run never landed. A warning, not a refusal:
  archiving an unrun plan is a legitimate thing to want;
- its **Run log** has a unit whose Outcome is not `green` — the folder is the
  record of the run, so a `failed`, `unresolved` or `skipped` row is work that
  never finished;
- for a cycle plan, the "Gaps surfaced during execution" section of its
  `index.md` has **unresolved entries**;
- an **active plan** anywhere in the product (per the index, whatever repo it
  sits in) lists this plan in its `requires:` frontmatter — archiving it out
  from under a dependent plan;
- for a cycle plan, a blueprint doc named in its `covers:` frontmatter is
  **not** `implementation: complete` — the plan is being retired before what it
  covers is fully built.

Surface what's outstanding and let the user decide whether to archive anyway.

The `requires:` check reads `requires:` from every unarchived plan's `index.md`.
An entry names a plan folder by **basename** — `docs/plans/X` and
`docs/plans/archived/X` name the same plan, and no skill ever re-points a
`requires:` line — and a non-archived plan is any `APPROVED` or `RUNNING` row of
the index, or any folder still sitting directly under `docs/plans/`. What the
dependent loses depends on the **kind of the plan being archived**, per
`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`:

- a **change plan** satisfies a dependent's entry through its `COMPLETE` row or
  its archived folder, so archiving one that never landed would read as
  satisfied to the dependent — warn on that;
- a **cycle plan** satisfies a dependent's entry only when every doc in its
  `covers:` reads `implementation: complete` in the base repo's blueprint; the
  row and the folder are not the test. Archiving changes nothing for the
  dependent — the warning is the `covers:` check above.

### 3. Move (never delete)

Move the whole directory —
`mv docs/plans/<date>-<name> docs/plans/archived/<date>-<name>` — unit files,
run log and all. Never a file at a time: the folder is one object, and a
half-moved one is a plan neither executor can read. Create `archived/` if
absent. A plan never changes repo when archived — it is retired where it was
written: a cycle folder moves within its **target repo**, a change folder within
the base.

Then rewrite **only the Status block** of the moved `index.md`:

- if it already reads `COMPLETE`, **leave it** — the executor wrote that at
  landing and it is the truer record;
- otherwise set the bold word to `**ARCHIVED**` and the line under it to
  `ARCHIVED <date> — not run; was <previous status>`.

Nothing else in the folder changes — not a unit file, not the Run log, not the
Consent block.

Then **apply the landing edit to the folder's row** in the base repo's
`docs/plans/index.md`, the same edit `/vwf:change-execute` makes when a run
lands (`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`): set the row's Status to
`COMPLETE` — already so on a cycle plan `/vwf:execute` landed — and its
`Folder` to `docs/plans/archived/<basename>`, then run the sweep — remove
every `COMPLETE` row whose `Folder` points under `docs/plans/archived/` and
that no `APPROVED` or `RUNNING` row's `Requires` names; a `COMPLETE` row whose
`Folder` is still a live path is never swept, since its folder has not moved.
The index edit rides the archive's own commit (§4). A folder with no row gets
none — archiving does not start listing it. The index is the base's whatever
repo the folder moved in, and it is edited on the integration branch, in the
main checkout, when the archive runs there; archiving from inside a worktree
moves the folder only and leaves the row for that branch's landing to fix,
since the index never rides a run branch.

**Close the backlog items.** Either kind may carry a `backlog:` frontmatter
list. For every id on it whose row in `docs/backlog.md` does not yet read
`done`, invoke `/vwf:backlog done <ids>` — a plan can reach `archived/` without
having landed through the command that would have closed them, and a retired
plan leaving an item `planned` forever is the row nobody comes back to. Never
edit `docs/backlog.md` here: `/vwf:backlog` is its only writer, and §4's commit
carries what it wrote.

**Guard collisions.** Before each move, check the destination does **not**
already exist. On a collision, suffix the archived name (e.g. `-2`) or ask the
user — **never overwrite**. `mv` onto an existing directory **nests** it instead
of failing, so check first. If a move fails, halt and report — do not delete or
overwrite.

### 4. Report, commit & mark archived

Report the moved paths. Commit the move via `/vwf:git-workflow` (a
`docs: archive plan <name>` message); all git actions go through
/vwf:git-workflow. The folder's Run log is the record of the run; the mempalace
journal (room `runs`, drawer `<folder basename>`) is a mirror of it, so if
mempalace is available mark that drawer **archived**
(`mempalace_update_drawer`); skip silently otherwise.
