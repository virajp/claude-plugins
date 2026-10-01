# Decision — the backlog's last id lives in `.config/vwf.yaml`

**Date** 2026-10-01 · **Branch** `develop` · **Plan** none — a direct edit ·
**Amends**
[`2026-09-18-backlog-on-github-projects.md`](./2026-09-18-backlog-on-github-projects.md)

## What was decided before

The backlog moved to a GitHub Project with nothing in the tree: no
`.config/vwf.yaml` key, nothing cached, the skill never editing a file or
committing. The next id was one past the highest over every item title and every
plan folder's `backlog:` and `backlog_pieces:` lists.

## Why it changed

Closing B83, the highest id, raised archiving it on the board. An archived item
may drop out of `gh project item-list`, and no plan folder named B83, so the
next `add` could have issued B83 again. Titles cannot keep an id spent once the
board stops listing the item.

## What was decided

- `add` reads and writes `backlog.last_id` in the base repo's
  `.config/vwf.yaml`. The next id is one past the highest over that key, the
  titles and the plan lists, so the old sources still act as a floor and an
  absent key is seeded by the first `add`.
- The key is optional; `config_format` stays 22. Rejected: a bump to 23 with a
  setup migration — a large edit for one key with a safe absent reading.
- `add` refuses to run with no `.config/vwf.yaml`, naming `/vwf:setup`.
  Rejected: falling back to the old rule (leaves unshaped repos unprotected) and
  writing a stub config (setup and doctor would read it as broken).
- `add` commits and pushes the config file alone through `vwf:git-workflow`, and
  refuses when that file already differs from `HEAD`. Rejected: committing
  without pushing (another clone can reissue the id), and leaving the write
  uncommitted (easily lost).
- Every other verb still touches nothing in the tree.
