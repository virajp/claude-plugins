# Decision — backlog trim preserves Status: snapshot every item before the replace mutation, restore it after

**Date** 2026-09-19 · **Branch** `2026-09-19-backlog-trim-preserves-status` ·
**Plan**
[`docs/plans/2026-09-19-backlog-trim-preserves-status/`](../../plans/2026-09-19-backlog-trim-preserves-status/index.md)
· **Corrects** ruling 2 of
[`2026-09-19-backlog-status-vocabulary.md`](./2026-09-19-backlog-status-vocabulary.md)
— trim safety — and its reference's "step 2 is what makes it safe" sentence ·
**Backlog** none covered

## What prompted it

The first `list` on project #2 (`claude-plugins` under `virajp`) under the
vocabulary skill, later the same day it landed. The bootstrap found no item in
`Ready` or `In review`, ran the four-option replace mutation, and every one of
the project's 40 items came back from `item-list` with no `status` key —
`priority` and `group` untouched. The field had carried six options with one set
of ids; after the replace it carried four with **new** ids, the kept names
included, and an item's value is bound to the old id. The stop the earlier
ruling relied on guards the two removed options and nothing else.

The statuses were reconstructed from each item's body — an `Evidence:` tail →
`Done`, else `Backlog` — and written back with one
`item-edit --single-select-option-id` per item against the new ids: 40 calls, no
failures. The project's raw `item-list` and `field-list` after the wipe are
committed as the record, at `e4a1c2d4`, under `docs/memory/backlog/` —
`2026-09-19-project-2-items.json` and `2026-09-19-project-2-fields.json`.

## What changed

The bootstrap's Status trim is seven steps, not five: before the mutation it
snapshots every item that has a `status` key, as `<item-id>\t<status>` lines in
a `mktemp` file whose path it prints; after the mutation and the `field-list`
re-read it writes each line back, mapping the status name to the id the re-read
returned, one `item-edit` per item, and prints the count restored. A failed
write, or a name the four options do not carry, stops the verb naming the item
id and the snapshot path. The reference states the hazard generically rather
than as a property of this trim. The `Ready`/`In review` stop stays. The docs
and the skill table say the same. Nothing else about the skill moved.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **Snapshot, restore (1).** The Status steps run in this order: field-list
  (exactly the four, skip to `Group`); item-list filtered to the two removed
  options, `Ready` and `In review` (any, stop as before); snapshot every item
  with a `status` key to a temp file, path printed before the mutation; the
  colour and description query; the four-option replace; field-list re-read for
  the new ids; restore from the snapshot, one `item-edit` per line by option
  name, count printed. Any failed `item-edit` stops the verb naming the item and
  the snapshot path — the field is never left half-restored silently. An item
  with no `status` key is skipped on both sides. Rejected: a snapshot held in
  memory only (a run that dies mid-restore leaves nothing to restore from);
  refusing to trim while any item carries a Status (every real project would
  refuse).
- **The hazard, named (2).** The reference states it generically — **any**
  replace of a single-select field's option list reissues every option's id,
  kept names included, and an item's value is bound to the old id — so "step 2
  is what makes it safe" became "the stop covers the removed options and the
  restore covers the kept ones; neither alone is safe". Rejected: scoping the
  warning to the trim of `Ready`/`In review` alone.
- **The decision docs (3).** The vocabulary doc stays as written — a record of
  its day. This doc records the correction. Rejected: editing the old doc in
  place.

## What it corrects

- **Vocabulary ruling 2 (trim safety)** — the stop for `Ready`/`In review` was
  presented as what made the trim safe. It guards an item in a removed option,
  which has nowhere to be restored to; it does nothing for an item in a kept
  option, whose value dies with the old id. The stop stands; the restore is what
  covers the kept ones.
- **The reference's safety sentence** — "that is the point of the trim, and step
  2 is what makes it safe", now "the stop in step 2 covers the removed options
  and the restore in step 7 covers the kept ones; neither alone is safe".

## Consequences for a user

- **A trim prints two lines.** `Status snapshot: <path>` before the mutation and
  `restored N of N` after it. A run that stops part-way leaves the file to
  restore from by hand.
- **A failed restore names both.** The item id and the snapshot path; the
  remaining lines are re-run from the file. No item is skipped silently.
- **Project #2 is already trimmed**, so nothing on this repo exercises the new
  path until a project is next created from the template. The 40 statuses
  restored by body inference are the ones on the board today; an item whose
  inferred status is wrong is moved on the board.

## What stays outside

Dropping the `Ready`/`In review` stop — an item in a removed option has nowhere
to be restored to; a backup file written into the repo by the skill — the skill
edits nothing on disk, the snapshot is a temp file whose path is printed;
editing the vocabulary decision doc or `docs/memory/backlog/` — both are
records; the GitLab backend (still parked from 2026-09-18); a release — both
bumps are recorded, the tags wait; `plan-management/SKILL.md`'s generic "In
Progress" prose, still parked.
