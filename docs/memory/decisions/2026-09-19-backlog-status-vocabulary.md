# Decision — backlog status vocabulary: the template's own options, trimmed to four, and ids floored by the plan folders

**Date** 2026-09-19 · **Branch** `2026-09-19-backlog-status-vocabulary` ·
**Plan**
[`docs/plans/2026-09-19-backlog-status-vocabulary/`](../../plans/2026-09-19-backlog-status-vocabulary/index.md)
· **Corrects** ruling 5 of
[`2026-09-18-backlog-on-github-projects.md`](./2026-09-18-backlog-on-github-projects.md)
— the Status mapping — and its reference's "an empty project starts at `B01`"
rule · **Backlog** none covered

## What prompted it

The first run of `/vwf:backlog` against project #2 (`claude-plugins` under
`virajp`, created 2026-09-18 from the Team planning template) found that the
2026-09-18 ruling described a template that does not exist. The skill mapped
`open` → `Todo` and `planned` → `In Progress`; the template ships neither. Its
`Status` field carries **`Backlog`, `Ready`, `In progress`, `In review`,
`Done`** — five options, coloured `GREEN / BLUE / YELLOW / PURPLE / ORANGE`,
each with a description. The 2026-09-18 bootstrap added `Closed` (`GRAY`) by
replacing that list and created the `Group` text field, so the project stood at
six options with two the skill would never set and two the skill named that were
nowhere on the board.

Two facts about `updateProjectV2Field` shaped the correction: it **replaces**
the option list, deleting every option not sent back and clearing the Status of
any item that sat in one; and a replace **reissues every option id**, so ids
read before the mutation are stale.

## What changed

`/vwf:backlog` now speaks the template's vocabulary: `open` → `Backlog`,
`planned` → `In progress` (lower-case p, as the template spells it), `done` →
`Done`, `closed` → `Closed`. The bootstrap trims the `Status` field to exactly
those four, refusing while any item sits in an option it would remove. The next
id is floored by the plan folders' `backlog:` lists as well as the project's
titles. The docs and the skill table say the same. Nothing else about the skill
— the verbs, the callers, forge detection, the missing-project procedure —
moved.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **Vocabulary (1).** `open` → `Backlog`, `planned` → `In progress`, `done` →
  `Done`, `closed` → `Closed`. The bootstrap replaces the Status option list
  with exactly those four — `Backlog`, `In progress` and `Done` sent back with
  the colour and description read from the field, `Closed` as `GRAY` / "Dropped
  without a plan" — so `Ready` and `In review` are removed. Rejected: keeping
  `Ready` / `In review` as board-only states `next` prefers; ignoring them
  entirely and leaving six options on the field.
- **Trim safety (2).** Before the replacing mutation, the bootstrap lists the
  items whose Status is `Ready` or `In review`; when any exist it stops, names
  each item and its state, asks the user to move them to `Backlog` or
  `In progress` on the board, and the verb is re-run. It never moves an item
  itself. Rejected: moving `Ready` → `Backlog` and `In review` → `In progress`
  automatically, then trimming.
- **Next-id floor (3).** The next id is one past the highest number over two
  sources: every item title in the project, and every id in the `backlog:`
  frontmatter list of every plan folder under `docs/plans/` and
  `docs/plans/archived/` in the base repo — frontmatter lists only, never prose.
  `B01` only when both sources are empty. An id spent by a retired file store
  (this repo's B01–B11, whose `docs/backlog.md` was deleted on 2026-09-18) is
  therefore never reissued. Rejected: asking for a starting number on an empty
  project; a constant floor in the skill.
- **Idempotence (4).** The bootstrap mutates the Status field only when its
  option list is not exactly `Backlog`, `In progress`, `Done`, `Closed` (order
  ignored); `Group` is created only when absent. Option ids are read from
  `field-list` after any mutation, since a replace reissues them.
- **The decision docs (5).** The 2026-09-18 doc stays as written — a record of
  its day. This doc records the correction. Rejected: editing the old doc in
  place.

## What it corrects

- **2026-09-18 ruling 5** — "Status: `open` → `Todo`, `planned` → `In Progress`,
  `done` → `Done`, `closed` → `Closed` — an option the skill adds once". `Todo`
  and `In Progress` were never on the template; the bootstrap it describes added
  `Closed` beside `Ready` and `In review` rather than trimming them.
- **The reference's `B01` rule** — "An empty project starts at `B01`". A project
  created after a file store retired would have reissued B01 to a new item while
  the archived plans still cite B01–B11 in their `backlog:` lists.

## Consequences for a user

- **An existing project is trimmed on the next verb.** A project bootstrapped
  under the 2026-09-18 skill carries `Ready` and `In review`; the first verb on
  the corrected skill reshapes the field. Nothing is asked when no item sits in
  those two options.
- **An item in `Ready` or `In review` must be moved first.** The verb stops and
  names each such item; move it to `Backlog` or `In progress` on the board and
  run the verb again. The skill never chooses for you.
- **The next id on this repo's project is at least B12**, whatever the project's
  titles say — the archived plans' `backlog:` lists reach B11, and the project's
  own titles raise the floor from there.

## What stays outside

`Ready` and `In review` as states the skill uses; auto-moving items out of a
trimmed option; the GitLab backend (still parked from 2026-09-18); a release —
both bumps are recorded, the tags wait; `plan-management/SKILL.md`'s generic "In
Progress" prose, parked until that file is next touched.
