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
  as a row in `docs/plans/index.md`;
- a **change-plan folder** — `docs/plans/<date>-<name>/`, written by
  `/vwf:change-plan`, recognised by an `index.md` whose frontmatter reads
  `type: vwf-change-plan`. It is **never** listed in `docs/plans/index.md`, and
  archiving it does not start listing it.

Everything below applies to both unless a step says otherwise.

## Doc Paths

| Doc          | Path                                                |
| ------------ | --------------------------------------------------- |
| Plan index   | `docs/plans/index.md` (base repo)                   |
| Active plans | `<target-repo>/docs/plans/`                         |
| Change plan  | `<target-repo>/docs/plans/<date>-<name>/index.md`   |
| Gap-report   | `<target-repo>/docs/plans/<plan>.gap-report.md`     |
| Archived     | `<target-repo>/docs/plans/archived/`                |
| Membership   | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`        |

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
  - the **folders** under `docs/plans/` — these are *not* in the index and never
    will be, so they are listed by walking that one directory: every
    `<date>-<name>/index.md` reading `type: vwf-change-plan` whose Status is not
    `RUNNING`. A `RUNNING` folder belongs to a live `/vwf:change-execute` run
    and is not offered. The walk is safe here because a change plan is written
    in the repo it is run from — it is not a product-wide view.
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
plan folders, and a non-archived one is any still sitting directly under
`docs/plans/`. Two of the checks do not apply: a folder has no companion
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

**`docs/plans/index.md` is never touched for a folder.** Change plans are not
listed there, by decision, and archive is not the command that starts listing
them. A folder leaves no row behind, so there is no stale row to fix.

**Guard collisions.** Before each move, check the destination does **not**
already exist. On a collision, suffix the archived name (e.g. `-2`) or ask the
user — **never overwrite**. This bites hardest on a folder: `mv` onto an
existing directory **nests** it instead of failing, so check first. If a move
fails, halt and report — do not delete or overwrite.

### 4. Report, commit & mark archived

Report the moved paths. Commit the move via `/vwf:git-workflow` (a
`docs(plan): archive <slice>` message); all git actions go through
/vwf:git-workflow. Then, if mempalace is available, mark the plan's run journal
(room `runs`, drawer `<plan>`) **archived** (`mempalace_update_drawer`); skip
silently otherwise.
