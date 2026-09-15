---
name: archive
description: Move completed plans out of the active set into
  docs/plans/archived/ — a flat cycle plan file, or a whole change-plan folder.
  Never deletes. May be run manually or offered at the end of execute.
argument-hint: "[plan-file-or-folder]"
model: haiku
effort: low
disable-model-invocation: true
---

# archive — Retire Completed Plans

Move completed plans out of the active set. **Never delete** — archive.

Two shapes are archived, and they are not the same object:

- a **flat cycle plan** — `docs/plans/<plan>.md`, written by `/vwf:plan`, listed
  as a row in the cycle-plan table of `docs/plans/index.md`;
- a **change-plan folder** — `docs/plans/<date>-<name>/`, written by
  `/vwf:change-plan`, recognised by an `index.md` whose frontmatter reads
  `type: vwf-change-plan`. It is listed in the change-plan table of
  `docs/plans/index.md`, per `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`.

Everything below applies to both unless a step says otherwise.

## Doc Paths

| Doc          | Path                                                      |
| ------------ | --------------------------------------------------------- |
| Plan index   | `docs/plans/index.md` (base repo)                         |
| Active plans | `<target-repo>/docs/plans/`                               |
| Change plan  | `<target-repo>/docs/plans/<date>-<name>/index.md`         |
| Gap-report   | `<target-repo>/docs/plans/<plan>.gap-report.md`           |
| Archived     | `<target-repo>/docs/plans/archived/`                      |
| Backlog      | `docs/backlog.md` (base repo) — closed via `/vwf:backlog` |
| Membership   | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`              |
| Index shape  | `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`              |

---

## Pipeline

### 1. Resolve which plan(s)

- If `$ARGUMENTS` names a **plan file**, archive that one.
- If `$ARGUMENTS` names a **directory**, read its `index.md` frontmatter. Only
  `type: vwf-change-plan` is a plan folder — archive it whole. Any other
  directory (no `index.md`, or an `index.md` with another `type`) is **refused
  in one line**: say it is not a plan folder and stop. Do not guess at a shape.
- Otherwise list the candidates and ask the user which to archive — the two
  shapes side by side, change plans **marked as such**:
  - the **flat** ones from the base repo's `docs/plans/index.md` (excluding
    archived rows). **Read the index, never walk the members** — under
    `multi-repo` most are not on this machine, so a walk would list the
    product's plans as a function of what happens to be cloned
    (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`);
  - the **folders** from the change-plan table of the same file — every
    `APPROVED` row is offered; a `RUNNING` row belongs to a live
    `/vwf:change-execute` run, so it is shown marked *in flight* and left out of
    the offer. Then, since a change plan is written in the repo it is run from,
    glance at the folders directly under `docs/plans/` of the current repo:
    any `<date>-<name>/index.md` reading `type: vwf-change-plan` with no row
    is listed as **unindexed**, so a hand-made folder is still visible and can
    be archived.
- **A plan is archived in its own repo.** If the target repo is not present,
  offer the consent-gated clone; on decline, skip that plan and say so — moving
  a file in a repo you do not have is not something to fake.

### 2. Completion check

Before moving, verify each plan is actually complete. **Warn and ask to
proceed** (don't hard-halt) when any of these are unfinished:

- the plan doc's "Gaps surfaced during execution" section has **unresolved
  entries**;
- a companion `docs/plans/<plan>.gap-report.md` exists with **open** rows (a
  legacy autopilot gap-report, un-reconciled);
- an **execute run journal** (mempalace room `runs`, drawer `<plan>`) is not
  marked complete;
- an **active plan** anywhere in the product (per the index, whatever repo it
  sits in) lists this plan
  in its `requires:` frontmatter — archiving it out from under a dependent plan;
- a blueprint doc named in this plan's `covers:` frontmatter is **not**
  `implementation: complete` — the plan is being retired before what it covers
  is fully built.

Surface what's outstanding and let the user decide whether to archive anyway.
Skip the run-journal check silently if mempalace is unavailable.

**For a folder**, read `requires:` and `covers:` from its `index.md` — the same
two checks, on the same terms, so a folder another non-archived plan `requires:`
is warned on exactly as a flat plan would be. A folder's `requires:` names other
plan folders by **basename** — `docs/plans/X` and `docs/plans/archived/X` name
the same plan, and no skill ever re-points a `requires:` line — and a
non-archived one is any `APPROVED` or `RUNNING` row of the change-plan table,
or any folder still sitting directly under `docs/plans/`. Two of the checks do
not apply: a folder has no companion
gap-report, and its unfinished work lives in its own **Run log** and **Parked**
sections rather than a "Gaps surfaced during execution" one. Its completion
signal is the Status heading: `COMPLETE` means the run landed; anything else —
`DRAFT`, `APPROVED`, `BLOCKED` — means it never finished, which is a warning,
not a refusal. Archiving an unrun plan is a legitimate thing to want.

### 3. Move (never delete)

**A flat plan.** Move each `<target-repo>/docs/plans/<plan>.md` →
`<target-repo>/docs/plans/archived/<plan>.md`, and when a
companion `<plan>.gap-report.md` exists, move it **together** into the same
`archived/` directory. Create that directory if absent. A plan never changes
repo when archived — it is retired where it was written.

Then **update the row in the base repo's `docs/plans/index.md`** to read
archived, in the same commit set. The index is the product's only view of its
plans; a moved file with a stale row makes a retired plan look active
everywhere except the one repo it lives in.

**A folder.** Move the whole directory —
`mv docs/plans/<date>-<name> docs/plans/archived/<date>-<name>` — unit files,
run logs and all. Never a file at a time: the folder is one object, and a
half-moved one is a plan `/vwf:change-execute` can no longer read. There is no
gap-report companion to carry along.

Then rewrite **only the Status block** of the moved `index.md`:

- if it already reads `COMPLETE`, **leave it** — `/vwf:change-execute` wrote
  that at landing (its §7) and it is the truer record;
- otherwise set the bold word to `**ARCHIVED**` and the line under it to
  `ARCHIVED <date> — not run; was <previous status>`.

Nothing else in the folder changes — not a unit file, not the run log, not the
Consent block.

Then **apply the landing edit to the folder's row** in the change-plan table of
the base repo's `docs/plans/index.md`, the same edit `/vwf:change-execute`
makes when a run lands (`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`): set the
row's Status to `COMPLETE` and its `Folder` to the archived path, then run the
sweep — remove every `COMPLETE` row that no `APPROVED` or `RUNNING` row's
`Requires` names. The index edit rides the archive's own commit (§4). A folder
with no row gets none — archiving does not start listing it. The index is
edited on the integration branch, in the main checkout, when the archive runs
there; archiving from inside a worktree moves the folder only and leaves the
row for that branch's landing to fix, since the index never rides a run branch.

**Close the backlog items.** Either shape may carry a `backlog:` frontmatter
list. For every id on it whose row in `docs/backlog.md` does not yet read
`done`, invoke `/vwf:backlog done <ids>` — a plan can reach `archived/` without
having landed through the command that would have closed them, and a retired
plan leaving an item `planned` forever is the row nobody comes back to. Never
edit `docs/backlog.md` here: `/vwf:backlog` is its only writer, and §4's commit
carries what it wrote.

**Guard collisions.** Before each move, check the destination does **not**
already exist. On a collision, suffix the archived name (e.g. `-2`) or ask the
user — **never overwrite**. This bites hardest on a folder: `mv` onto an
existing directory **nests** it instead of failing, so check first. If a move
fails, halt and report — do not delete or overwrite.

### 4. Report, commit & mark archived

Report the moved paths. Commit the move via `/vwf:git-workflow` (a
`docs: archive plan <slice>` message); all git actions go through
/vwf:git-workflow. Then, if mempalace is available, mark the plan's run journal
(room `runs`, drawer `<plan>`) **archived** (`mempalace_update_drawer`); skip
silently otherwise.
