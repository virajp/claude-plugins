# The Plan Index

`docs/plans/index.md` is the product's one view of its plans as a set. It lives
in the **base** repo, as `docs/backlog.md` does — a `repo` or `monorepo`
topology has only the base, and under `multi-repo` a command running in a
member repo addresses the base's file. Every skill that reads or writes the
file follows this contract; no skill reads a plan's status from anywhere else
when this file has a row for it.

The file holds **two tables**, and each writer edits only its own:

| Table            | Lists                                                             | Written by                                                |
| ---------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| **Cycle plans**  | the flat `docs/plans/<plan>.md` files `/vwf:plan` writes          | `/vwf:plan`, `/vwf:archive`                               |
| **Change plans** | the `docs/plans/<date>-<name>/` folders `/vwf:change-plan` writes | `/vwf:change-plan`, `/vwf:change-execute`, `/vwf:archive` |

## The prose frame

The file opens with this intro, above the tables, so a file written fresh reads
the same as one that grew. A writer creating the file writes the intro and both
table headers, then its own row; a writer finding the file writes only its own
table.

    # Plans

    The product's plans as a set — the one file every vwf command reads to find
    a plan without walking the member repos. The first table lists the flat
    cycle plans `/vwf:plan` writes, each in the repo whose code it changes; the
    second is the queue of change-plan folders, which `/vwf:change-execute
    next` reads to pick the next runnable plan.

    ## Cycle plans

    | Plan | Target repo | Status |
    | ---- | ----------- | ------ |

    ## Change plans

    | Folder | Plan | Priority | Status | Requires | Backlog |
    | ------ | ---- | -------- | ------ | -------- | ------- |

## The cycle-plan table

One row per flat cycle plan: the plan's filename, the repo whose code it
changes, and its status. `/vwf:plan` appends the row when it writes the plan;
`/vwf:archive` flips the status to `archived` in the commit that moves the file.
`/vwf:execute` reads it to find a plan and to chain forward. This contract
changes none of that — cycle plans keep their own table and their own
semantics.

## The change-plan table

Header row, exactly:

    | Folder | Plan | Priority | Status | Requires | Backlog |

| Column     | Meaning                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `Folder`   | the folder's path relative to the repo root, in a code span; moves under `docs/plans/archived/` at landing       |
| `Plan`     | the plan's `title:` from its `index.md` frontmatter                                                              |
| `Priority` | the derived integer — `10 + max(Priority of every unarchived plan in its requires:)`, or `10` when it requires none of them; never asked, never edited by hand |
| `Status`   | `APPROVED`, `RUNNING` or `COMPLETE` — nothing else                                                               |
| `Requires` | the **basenames** of the folder's `requires:` entries, or `—`                                                    |
| `Backlog`  | the ids from the folder's `backlog:` frontmatter, or `—`                                                         |

The three statuses:

- `APPROVED` — approved at hand-off and waiting to be picked up;
- `RUNNING` — claimed by a session, which may be mid-run, paused or blocked.
  The folder's own `## Status` block keeps that detail — `BLOCKED`,
  `RUNNING — paused …`, the worktree path; the index never mirrors it. A
  `RUNNING` row is opaque to every reader whatever the folder says;
- `COMPLETE` — landed, and kept only while another row's `Requires` names it.

## Writers and their edits

| Writer                 | Edit                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/vwf:change-plan`     | appends the row, `APPROVED`, in its hand-off commit                                                                                                             |
| `/vwf:change-execute`  | sets `RUNNING` at claim — before the worktree is cut; sets `COMPLETE` after the merge lands, pointing `Folder` at the archived path, then runs the **sweep**   |
| `/vwf:archive`         | applies the landing edit by hand to one folder's row, in the archive's own commit; a folder with no row gets none                                              |

The **sweep**: after a row is set `COMPLETE`, remove every `COMPLETE` row that
no `APPROVED` or `RUNNING` row's `Requires` names. A completed plan nobody
still waits on leaves the queue; its folder under `docs/plans/archived/` is the
record.

**Every edit is a direct commit on the integration branch, made in the main
checkout, never in a worktree.** The run branch never touches this file, so two
parallel landings cannot conflict on it. The two commit messages:

- the claim: `docs: plan queue — <folder> running`
- the landing: `docs: plan queue — <folder> complete`

`/vwf:change-plan`'s row rides its own approval commit, and `/vwf:archive`'s
edit rides the archive commit.

## Resolution

A `requires:` entry matches a row, or an archived folder, by its **basename**:
`docs/plans/X` and `docs/plans/archived/X` name the same plan. No skill ever
re-points a `requires:` line.

A requirement is **satisfied** when its basename resolves to a `COMPLETE` row,
or to a folder under `docs/plans/archived/` with no row (it was swept, or
archived before this contract). An entry that resolves to an `APPROVED` or
`RUNNING` row is not yet satisfied. An entry with no row and no folder anywhere
— not under `docs/plans/`, not under `docs/plans/archived/` — is a refusal,
named.

## The pick

`/vwf:change-execute next` reads this table alone:

- **candidates** are `APPROVED` rows whose every `Requires` entry is satisfied;
- **order** is `Priority` ascending, then the folder's date prefix ascending,
  then folder name;
- a `RUNNING` row is **never** taken — resuming one is
  `/vwf:change-execute <folder>`, and a claim whose session is gone is reset to
  `APPROVED` by hand, in a commit on the integration branch;
- nothing runnable → print each `APPROVED` row and what it waits on, and stop;
- no change-plan table, or no rows → say so and stop.

The claim is the row set to `RUNNING`, committed and pushed **before** the
worktree is cut; a rejected push means re-pull and re-pick.

## After landing

A plan folder's After landing table carries `ask` steps only. The `run` mode
that let a plan pre-authorise a step at plan time is retired; a `run` in an
older folder is read as `ask`.
