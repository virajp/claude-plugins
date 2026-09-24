---
name: backlog
description: The product's prioritised backlog — a project on the repo's forge,
  a GitHub Project named for the base repo under its account, holding the work
  that is agreed but cannot be picked up now, ordered so the next thing to
  start is obvious. Not a file in the tree. It adds items, lists them, names
  the next one, reprioritises, marks items planned and done, and closes the
  ones dropped without a plan. /vwf:plan and /vwf:change-plan call it as a plan
  folder is approved, /vwf:execute as one lands, and plan-management as one is
  retired. Not the place for production feedback — that is worked now, and
  /vwf:feedback routes it into the docs and commands that fix it.
argument-hint: "[add <item> | list | next | move <id> <P0|P1|P2> | planned <ids> <folder> | done <ids> | close <id>]"
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

| Field      | Values                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| `Id`       | `Bnn`, the title's prefix, from `B01`, **never reused** — a closed id stays spent |
| `Priority` | the template's `P0` (pick first), `P1`, `P2`                                      |
| `Status`   | `Backlog` → `In progress` → `Done`, or `Closed` for one dropped without a plan    |
| `Group`    | free text, or empty — a label shared by items that want one plan between them     |

The older vocabulary an archived plan folder may still use translates once:
`open` is `Backlog`, `planned` is `In progress`, `done` is `Done`, `closed` is
`Closed`; the old `P1`/`P2`/`P3` reads as `P0`/`P1`/`P2`. The verbs below keep
their names.

Two statuses carry a line the body must end with. An `In progress` item ends
with `Planned in: <folder>` — the plan folder that covers it. A `Closed` item
ends with the reason it was dropped.

**The bootstrap** reshapes what the Team planning template ships, once, on the
first verb that needs it, and is idempotent. The template's `Status` field
carries `Backlog`, `Ready`, `In progress`, `In review` and `Done`; the
bootstrap trims it to the skill's four — `Backlog`, `In progress` and `Done`
kept with their colour and description, `Closed` added — and creates a `Group`
text field. The trim is a replace, and an item sitting in a removed option
would lose its Status: so when any item is `Ready` or `In review` the bootstrap
stops, names each such item, and asks the user to move it to `Backlog` or
`In progress` on the board before the verb is re-run — it never moves an item
itself. The replace also reissues the ids of the options it keeps, and an
item's value is bound to the old id: so the bootstrap snapshots every item's
Status to a temp file before the mutation and writes each one back afterwards,
by option name against the ids re-read after it — an item is never left
without the Status it had. The reference specifies the procedure and both
mutations.

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

Create a draft issue titled with the next unused id — one past the highest
`Bnn` over every item's title, done and closed included, and every plan
folder's `backlog:` frontmatter list, live and archived — and set its Status
to `Backlog`. Ask for the priority with a three-option question (`P0`, `P1`,
`P2`) unless the request already names one. Set `Group` only when the user
names a group; an item that stands alone leaves the field empty. Write the body
with enough detail that the plan interview starts from it rather than from the
one-line title. On a repo with no project, ask consent to create it, hand over
the browser per the reference's missing-project procedure, and add once the
project is found.

### `list`

Print a five-column table — Id, Item, Group, Priority, Status — from the
project's items, ordered by priority (`P0` first) then id. Fold `Done` and
`Closed` items into a trailing count rather than listing them, unless the user
asks for everything. An item whose title carries no `Bnn` is listed under
"unnumbered" with a warning; the skill never renumbers it. End with the
project's URL.

### `next`

Name the top `Backlog` item by priority then id — its id, title and body — and
the command that picks it up:

- `/vwf:change-plan <item>` for work the blueprint does not describe;
- `/vwf:plan <slice>` when the item names a blueprint slice.

Ask which of the two it is when the item does not say. Print the group when the
item has one, since the group is usually the plan's real scope. An empty backlog
is a one-line answer, not an error.

### `move <id> <priority>`

Set one item's Priority to `P0`, `P1` or `P2`. The id does not change.

### `planned <ids> <folder>`

Set each named item's Status to `In progress` and end each body with
`Planned in: <folder>`. `<ids>` is one id or several. An item already
`In progress` under a different path is a question for the user, not a silent
overwrite.

### `done <ids>`

Set each named item's Status to `Done`. An item that was never `In progress`
still moves — work sometimes lands without a plan folder — but say so.

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

| Caller                    | When                                     | Verb                      |
| ------------------------- | ---------------------------------------- | ------------------------- |
| `/vwf:plan`               | at hand-off, once the folder is approved | `planned <ids> <folder>`  |
| `/vwf:change-plan`        | at hand-off, once the folder is approved | `planned <ids> <folder>`  |
| `/vwf:execute`            | at landing, after the final gate         | `done <ids>`              |
| `plan-management archive` | archiving a plan whose ids are open      | `done <ids>`              |
| `/vwf:init`               | the forge pass, base repo only, last     | missing-project procedure |

Callers pass the ids from the plan's **`backlog:` frontmatter** — the list on
the folder's `index.md`, cycle plan and change plan alike. Empty or absent
means the plan covers no backlog item and nothing is called. `/vwf:init` is
the exception: it passes no ids and calls no verb — it reaches the
missing-project procedure so the product's project exists once the repo is
shaped, reports a project already present and skips it, and prints the GitLab
"not yet supported" line and continues when the forge is GitLab.

## What this skill never does

- **Commit.** There is nothing in the tree to commit — the project is the
  store, and a caller's commit carries no backlog change.
- **Edit any file.** It edits the project and nothing on disk — not the plan it
  is told about, not a doc, not a config.
- **Invent an id, or reuse one.** Ids come from the item titles and the plan
  folders' `backlog:` lists, one past the highest.
- **Keep a file copy.** The project is the one store. A session that cannot
  reach it has no backlog to read, and says so — this replaces the earlier
  rule that a file was kept so an offline session could read it.
- **Create the project itself.** The user creates it in the browser from the
  Team planning template; the skill hands over the URL and waits.
- **Open a repo issue.** Items are draft issues inside the project.
- **Decide what gets built.** `next` names the top item and the command for it;
  the user picks.
