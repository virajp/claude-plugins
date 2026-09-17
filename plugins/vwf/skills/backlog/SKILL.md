---
name: backlog
description: The repo's prioritised backlog — docs/backlog.md, the list of work
  that is agreed but cannot be picked up now, ordered so the next thing to start
  is obvious. This skill is the only thing that edits that file. It adds items,
  lists them, names the next one, reprioritises, marks items planned and done,
  and closes the ones dropped without a plan. /vwf:plan and /vwf:change-plan
  call it as a plan folder is approved, /vwf:execute as one lands, and
  /vwf:archive as one is retired. Not the place for production
  feedback — that is worked now, and /vwf:feedback routes it into the docs and
  commands that fix it.
argument-hint: "[add <item> | list | next | move <id> <priority> | planned <ids> <folder> | done <ids> | close <id>]"
model: sonnet

disable-model-invocation: false
---

# backlog — The Prioritised List of What Waits

## What the backlog is, and is not

The backlog holds work that is **agreed but cannot be picked up now**. It waits
behind the work in flight, and its priority decides what gets picked first when
that work is done.

Production feedback is the opposite case and does not belong here. Feedback is
something being **worked now** — it may change the product doc, the blueprint or
the architecture, and it follows the `plan` and `execute` line from there.
`/vwf:feedback` owns that route end to end; nothing it intakes becomes a backlog
row. A backlog row is the thing nobody is working on yet.

## The file

`docs/backlog.md`, in the base repo's `docs/`, beside `docs/plans/index.md`
(the plan index — `assets/plan-index.md`).
The backlog is **product-level**: one file for the whole product, never one per
member repo — a caller running in a member addresses the base's file. This skill
is the only writer of it.

Its shape, in order:

- a **one-paragraph header** saying what the file is and how an item gets picked
  up;
- **one table**, columns `Id | Item | Group | Priority | Status`;
- an optional **`## Groups`** list — one bullet per group, naming the ids it
  holds and why they travel together;
- **`## Items`**, one `### Bnn — <title>` section per row, carrying the detail
  the table cell has no room for.

The vocabulary:

| Field      | Values                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| `Id`       | `Bnn`, sequential from `B01`, **never reused** — a closed id stays spent          |
| `Priority` | `P1` (pick first), `P2`, `P3`                                                     |
| `Status`   | `open` → `planned` → `done`, or `closed` for an item dropped without a plan       |
| `Group`    | free text, or empty — a label shared by items that want one plan between them     |

Two statuses carry a line the section must end with. A `planned` item ends with
`Planned in: <folder>` — the plan folder that covers it. A `closed`
item ends with the reason it was dropped.

When the file does not exist, `add` creates it — the header, the empty table,
and the `## Items` heading — and writes the first row. No other verb creates it;
they report that there is no backlog yet.

## Verbs

`$ARGUMENTS` selects one. With no argument, run `list`.

### `add <item>`

Append a row and its section. Take the next unused id — one past the highest
`Bnn` in the file, whether or not that one is still open. Ask for the priority
with a three-option question (`P1`, `P2`, `P3`) unless the request already names
one. Set `Group` only when the user names a group; an item that stands alone
leaves the cell empty. Write the section with enough detail that the plan
interview starts from it rather than from the one-line title.

### `list`

Print the table, ordered by priority then id. Fold `done` and `closed` rows into
a trailing count rather than listing them, unless the user asks for everything.

### `next`

Name the top `open` item by priority then id — its id, title and section — and
the command that picks it up:

- `/vwf:change-plan <item>` for work the blueprint does not describe;
- `/vwf:plan <slice>` when the item names a blueprint slice.

Ask which of the two it is when the item does not say. Print the group when the
item has one, since the group is usually the plan's real scope. An empty backlog
is a one-line answer, not an error.

### `move <id> <priority>`

Change one item's priority. The id does not move and the row does not change
place in the table.

### `planned <ids> <folder>`

Set each named item to `planned` and end each section with
`Planned in: <folder>`. `<ids>` is one id or several. An item already `planned`
under a different path is a question for the user, not a silent overwrite.

### `done <ids>`

Set each named item to `done`. An item that was never `planned` still moves —
work sometimes lands without a plan folder — but say so.

### `close <id>`

Set the item to `closed` and ask the reason, which becomes the section's last
line. A closed item stays in the file with its id; the id is never handed to a
later item.

**Every verb leaves the file's order alone.** Rows are never re-sorted, ids are
never renumbered, and a row is never deleted — `list` decides the reading order,
the file keeps the writing order.

## Who calls it

The backlog moves as plans are written and as they land, and the commands that
do that work call this skill rather than editing the file:

| Caller             | When                                     | Verb                     |
| ------------------ | ---------------------------------------- | ------------------------ |
| `/vwf:plan`        | at hand-off, once the folder is approved | `planned <ids> <folder>` |
| `/vwf:change-plan` | at hand-off, once the folder is approved | `planned <ids> <folder>` |
| `/vwf:execute`     | at landing, after the final gate         | `done <ids>`             |
| `/vwf:archive`     | archiving a plan whose ids are open      | `done <ids>`             |

Callers pass the ids from the plan's **`backlog:` frontmatter** — the list on
the folder's `index.md`, cycle plan and change plan alike. Empty or absent
means the plan covers no backlog item and nothing is called.

## What this skill never does

- **Commit.** The change rides on the caller's commit, or the user's. This skill
  writes the file and stops.
- **Edit any other file.** Not the plan it is told about, not a doc, not a
  config. `docs/backlog.md` alone.
- **Invent an id, or reuse one.** Ids come from the file, one past the highest.
- **Read or write a memory room.** The file is the store — a backlog that only
  exists in memory is one an offline session cannot read.
- **Decide what gets built.** `next` names the top item and the command for it;
  the user picks.
