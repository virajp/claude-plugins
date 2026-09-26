---
name: backlog
description: The product's prioritised backlog — a project on the repo's forge,
  a GitHub Project named for the base repo under its account, holding the work
  that is agreed but cannot be picked up now, ordered so the next thing to
  start is obvious. Not a file in the tree. It adds items, lists them, names
  the next one, reprioritises, marks items planned and done, records a landed
  piece of an item a plan only partly finishes, and closes the ones dropped
  without a plan. /vwf:plan and /vwf:change-plan call it as a plan folder is
  approved, /vwf:execute as one lands, and plan-management as one is retired.
  Not the place for production feedback — that is worked now, and
  /vwf:feedback routes it into the docs and commands that fix it.
argument-hint: "[add <item> | list | next | move <id> <P0|P1|P2> | planned <ids> <folder> | partial <ids> <folder> | done <ids> [folder] | close <id>]"
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
item. A backlog item is the thing nobody is working on yet.

## The project

The backlog is a **project on the repo's forge** — for a GitHub remote, a
GitHub Project owned by the account the base repo's `origin` names and titled
with the repo's name, so `virajp/claude-plugins` keeps its backlog in the
project `claude-plugins` under `virajp`. It is **product-level**: one project
for the whole product, never one per member repo — a caller running in a member
resolves the base first, the way
`${CLAUDE_PLUGIN_ROOT}/assets/membership.md` resolves it, and reads the base's
remote. Nothing is cached and no config key names the project: every verb
resolves owner and title from the base repo's remote, then finds the project by
title. There is no file in the tree — nothing to commit, nothing to diff.

**The forge decides the backend.** The host of the base repo's `origin` is read
first:

- `github.com`, or any host `gh auth status` lists → **GitHub**, implemented in
  `${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md`, which carries
  the command per verb, the field bootstrap and the missing-project procedure;
- `gitlab.com`, or any host `glab auth status` lists → **GitLab**: every verb
  stops with "GitLab is not yet supported by /vwf:backlog" and names the parked
  shape — the repo's own issues under scoped labels `priority::` and
  `status::`, shown on an issue board, a `references/gitlab.md` beside the
  GitHub one;
- anything else → unsupported; stop and name the host.

**The precondition, checked first by every verb.** `gh` on `PATH`,
authenticated for the remote's host, with the `project` scope on its token.
Any of the three missing stops the verb with the remedy — `gh auth login` for
a missing login, `gh auth refresh -s project` for a missing scope — and a
caller's recall reports "backlog unreadable: <reason>" and continues with
nothing. The one tolerance: a token carrying `read:project` alone passes
`list` and `next`, the two verbs that write nothing, and fails every other.
There is no fallback store.

**Items are draft issues** in the project — never repo issues. Each is titled
`Bnn — <item>`; the body carries the detail the plan interview starts from.
The project's own fields carry the state:

| Field      | Values                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `Id`       | `Bnn`, the title's prefix, from `B01`, **never reused** — a closed id stays spent                 |
| `Priority` | the template's `P0` (pick first), `P1`, `P2`                                                      |
| `Status`   | `Backlog` → `In progress` → `Partially done` → `Done`, or `Closed` for one dropped without a plan |
| `Group`    | free text, or empty — a label shared by items that want one plan between them                     |

The older vocabulary an archived plan folder may still use translates once:
`open` is `Backlog`, `planned` is `In progress`, `done` is `Done`, `closed` is
`Closed`; the old `P1`/`P2`/`P3` reads as `P0`/`P1`/`P2`. The verbs below keep
their names.

The body ends with the lines that record where the item stands. An item with
a pending plan ends with `Planned in: <folder>[, <folder>…]` — a
comma-separated list of the plan folders that cover it and have not landed.
An item a plan has landed on carries one `Landed: <plan title> in <folder>`
line per landed folder, above `Planned in:` when both exist — a
`Partially done` item has at least one, and a `Done` item keeps every one. A
`Closed` item ends with the reason it was dropped.

`Partially done` is the status of an item a plan landed **a piece of**: the
plan named the id on its `backlog_pieces:` frontmatter list rather than on
`backlog:`, which names only the ids a plan **finishes**. Such an item stays
open until the plan that finishes it lands.

**The bootstrap** reshapes what the Team planning template ships, once, on the
first verb that needs it, and is idempotent. The template's `Status` field
carries `Backlog`, `Ready`, `In progress`, `In review` and `Done`; the bootstrap
reshapes it to the skill's five, in order — `Backlog` and `In progress` kept
with their colour and description, `Partially done` added, `Done` kept, `Closed`
added — and creates a `Group` text field. A field the earlier four-option
bootstrap shaped (`Backlog`, `In progress`, `Done`, `Closed`) is reshaped the
same way on the next verb, gaining `Partially done`. The reshape is a replace,
and an item sitting in a removed option would lose its Status: so when any item
is `Ready` or `In review` the bootstrap stops, names each such item, and asks
the user to move it to `Backlog` or `In progress` on the board before the verb
is re-run — it never moves an item itself. The replace also reissues the ids of
the options it keeps, and an item's value is bound to the old id: so the
bootstrap snapshots every item's Status to a temp file before the mutation and
writes each one back afterwards, by option name against the ids re-read after it
— an item is never left without the Status it had. The reference specifies the
procedure and both mutations.

**A missing project** is created by the user, not by the skill: GitHub's API
cannot instantiate a built-in template, and Team planning is one. `add`, and
`/vwf:init`'s forge pass, are the two callers that reach the missing-project
procedure: each asks consent, hands over the browser with the URL and the two
settings, waits for the word "done", re-finds the project by title and runs
the field bootstrap — init then ends there, adding no item; every other verb
reports "no backlog project yet — `/vwf:backlog add` creates it" and stops.
Neither caller runs `gh project create`. The procedure is in the reference.

## Verbs

`$ARGUMENTS` selects one. With no argument, run `list`. Every verb runs the
precondition check, resolves the project, then does its one thing with the
commands the reference gives.

### `add <item>`

Create a draft issue titled with the next unused id — one past the highest `Bnn`
over every item's title, done and closed included, and every plan folder's
`backlog:` and `backlog_pieces:` frontmatter lists, live and archived — and set
its Status to `Backlog`. Ask for the priority with a three-option question
(`P0`, `P1`, `P2`) unless the request already names one. Set `Group` only when
the user names a group; an item that stands alone leaves the field empty. Write
the body with enough detail that the plan interview starts from it rather than
from the one-line title. On a repo with no project, ask consent to create it,
hand over the browser per the reference's missing-project procedure, and add
once the project is found.

### `list`

Print a five-column table — Id, Item, Group, Priority, Status — from the
project's items, ordered by priority (`P0` first) then id. Fold `Done` and
`Closed` items into a trailing count rather than listing them, unless the user
asks for everything. A `Partially done` item is listed, never folded, and its
Status cell carries the count of its `Landed:` lines —
`Partially done (2 landed)`. An item whose title carries no `Bnn` is listed
under "unnumbered" with a warning; the skill never renumbers it. End with the
project's URL.

### `next`

Name the top item by priority then id — its id, title and body — and the
command that picks it up. The candidates are every `Backlog` item and every
`Partially done` item whose body has no `Planned in:` line, ranked together; a
`Partially done` item with a plan still pending is already being worked. When
the item named is `Partially done`, print its `Landed:` lines too, so the next
plan starts from what remains rather than from the whole item. The command:

- `/vwf:change-plan <item>` for work the blueprint does not describe;
- `/vwf:plan <slice>` when the item names a blueprint slice.

Ask which of the two it is when the item does not say. Print the group when the
item has one, since the group is usually the plan's real scope. An empty backlog
is a one-line answer, not an error.

### `move <id> <priority>`

Set one item's Priority to `P0`, `P1` or `P2`. The id does not change.

### `planned <ids> <folder>`

Set each named item's Status to `In progress` and add `<folder>` to its
`Planned in:` line — writing the line when the body has none. `<ids>` is one
id or several. An item already `In progress` or `Partially done` takes the
folder appended to its list, since several plans may cover pieces of one item;
a folder already on the list is not added twice. An item that is `Done` or
`Closed` is a question for the user, not a silent reopen.

### `partial <ids> <folder>`

Record that the plan in `<folder>` landed a piece of each named item without
finishing it. Set Status to `Partially done`, remove `<folder>` from
`Planned in:` — dropping the line when the list empties — and add
`Landed: <plan title> in <folder>`, the title read from the `title:` key of
the folder's `index.md` frontmatter. Callers pass the ids from the plan's
`backlog_pieces:` list. A folder still on `Planned in:` after the edit is
another pending piece, and the status stays `Partially done` until a later
`planned` sets it `In progress`. An item that was never `In progress` still
moves, but say so.

### `done <ids> [folder]`

Set each named item's Status to `Done`, and move `<folder>` off its
`Planned in:` line onto a `Landed: <plan title> in <folder>` line, as
`partial` does — so a finished item's body shows every folder that landed on
it. Callers pass the ids from the plan's `backlog:` list, which names only the
ids the plan finishes. An item that was never `In progress`, or whose
`Planned in:` does not name `<folder>`, still moves — work sometimes lands
without a plan folder, and a user may then omit `<folder>`, writing no
`Landed:` line — but say so.

### `close <id>`

Set the item's Status to `Closed` — adding the option to the field first when
it is absent — and ask the reason, which becomes the body's last line. A closed
item stays in the project with its id; the id is never handed to a later item.

**Ids are never renumbered, and an item is never deleted or archived by this
skill.** The project keeps every item it was given; `list` decides the reading
order.

## Who calls it

The backlog moves as plans are written and as they land, and the commands that
do that work call this skill rather than touching the project:

| Caller                    | When                                     | Verb                                            |
| ------------------------- | ---------------------------------------- | ----------------------------------------------- |
| `/vwf:plan`               | at hand-off, once the folder is approved | `planned <ids> <folder>`                        |
| `/vwf:change-plan`        | at hand-off, once the folder is approved | `planned <ids> <folder>`                        |
| `/vwf:execute`            | at landing, after the final gate         | `done <ids> <folder>`, `partial <ids> <folder>` |
| `plan-management archive` | archiving a plan whose ids are open      | `done <ids> <folder>`, `partial <ids> <folder>` |
| `/vwf:init`               | the forge pass, base repo only, last     | missing-project procedure                       |

Callers pass the ids from the plan's two frontmatter lists on the folder's
`index.md`, cycle plan and change plan alike. **`backlog:`** names the ids the
plan finishes — `done` at landing; **`backlog_pieces:`** names the ids it lands
a piece of — `partial` at landing. `planned` at hand-off takes both lists. Empty
or absent means the plan covers no backlog item and nothing is called.
`/vwf:init` is the exception: it passes no ids and calls no verb — it reaches
the missing-project procedure so the product's project exists once the repo is
shaped, reports a project already present and skips it, and prints the GitLab
"not yet supported" line and continues when the forge is GitLab.

## What this skill never does

- **Commit.** There is nothing in the tree to commit — the project is the
  store, and a caller's commit carries no backlog change.
- **Edit any file.** It edits the project and nothing on disk — not the plan it
  is told about, not a doc, not a config.
- **Invent an id, or reuse one.** Ids come from the item titles and the plan
  folders' `backlog:` and `backlog_pieces:` lists, one past the highest.
- **Keep a file copy.** The project is the one store. A session that cannot
  reach it has no backlog to read, and says so — this replaces the earlier
  rule that a file was kept so an offline session could read it.
- **Create the project itself.** The user creates it in the browser from the
  Team planning template; the skill hands over the URL and waits.
- **Open a repo issue.** Items are draft issues inside the project.
- **Decide what gets built.** `next` names the top item and the command for it;
  the user picks.
