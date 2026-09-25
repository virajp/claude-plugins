# The GitHub Backend

The `/vwf:backlog` store on a GitHub remote is a GitHub Project — owned by the
account the base repo's `origin` names, titled with the repo's name, created by
the user from the **Team planning** template. This reference carries the `gh`
invocation behind every verb, the JSON each one reads, the one-time field
bootstrap, and the procedure for a project that does not exist yet. Every
command runs in the **base** repo; nothing is cached between runs. The skill
never runs `gh project create` — a project made that way carries no template.

## Precondition

Run before every verb, in this order; the first failure stops the verb with
its remedy.

1. `command -v gh` — absent → stop: "`gh` is not on `PATH`; install the GitHub
   CLI (`gh`) and run `gh auth login`".
2. `gh auth status --hostname <host>` — `<host>` is the base repo's `origin`
   host; a non-zero exit → stop: "`gh` is not logged in to `<host>`; run
   `gh auth login --hostname <host>`".
3. The same command's output lists the token's scopes on a line beginning
   `- Token scopes:`. `project` must appear — with the one tolerance the skill
   states, `read:project` alone for `list` and `next`. Missing → stop: "the
   `gh` token has no `project` scope; run
   `gh auth refresh --hostname <host> -s project`".

A caller's recall that hits any of the three reports
"backlog unreadable: <reason>" and continues with nothing.

## Resolving the project

    gh repo view --json owner,name --jq '[.owner.login, .name] | @tsv'

gives `<owner>` and `<repo>`. Then:

    gh project list --owner <owner> --format json --limit 100 \
      --jq '.projects[] | select(.title == "<repo>" and .closed == false)'

The match yields `number` (the project number every `gh project` subcommand
takes), `id` (the `PVT_…` node id `item-edit` takes as `--project-id`) and
`url`. Closed projects are ignored by the filter. Two open projects with the
title is a stop for the user — print both URLs and ask which to keep; the
skill never guesses. No match → the missing-project procedure for `add`, the
one-line stop for every other verb.

`gh repo view` does not expose the owner's type. Only when composing the
new-project URL, run

    gh api users/<owner> --jq .type

which answers `User` or `Organization`.

## Missing project

`add` and `/vwf:init`'s forge pass reach this; every other verb stops with "no
backlog project yet — `/vwf:backlog add` creates it".

1. Ask: "No backlog project `<repo>` exists under `<owner>`. Create it now?" —
   a no ends the verb.
2. Print the URL — `https://github.com/users/<owner>/projects/new` for a
   `User`, `https://github.com/orgs/<owner>/projects/new` for an
   `Organization` — and the two things to set on that page: the template
   **Team planning**, and the title `<repo>`, exactly. Then: "say `done` when
   the project exists".
3. On the word, re-run the resolution above. A second miss repeats step 2
   once — the title may have been mistyped — and a third miss stops: "no
   project titled `<repo>` under `<owner>`; check the title and run
   `/vwf:backlog add` again".
4. Run the field bootstrap, then continue with the `add`.

When the caller is `/vwf:init`, the verb ends after the bootstrap with no item
added — the forge pass wants the project to exist, not an entry in it. The
third-miss stop in step 3 reads the same way for init: it reports and the forge
pass continues.

## Fields

    gh project field-list <number> --owner <owner> --format json --limit 50

returns `fields[]`, each with `id`, `name` and `type`; a single-select field
also carries `options[]` with `id` and `name`. Read:

- `Status` — its `id`, and the option ids of `Backlog`, `In progress`,
  `Partially done`, `Done` and `Closed`, once the bootstrap has shaped the
  field;
- `Priority` — its `id`, and the option ids of `P0`, `P1`, `P2`;
- `Group` — its `id`, once added.

**Bootstrap** — idempotent; each step runs only when `field-list` shows the
thing missing. The Team planning template ships `Status` with the options
`Backlog`, `Ready`, `In progress`, `In review` and `Done`, and `Priority`; the
skill reshapes `Status` to its five and adds `Group`. A field an earlier
version shaped to four — `Backlog`, `In progress`, `Done`, `Closed` — is not
the five either, and takes the same steps to gain `Partially done`. The hazard
is generic: **any** replace of a single-select field's option list reissues
every option's id, the kept names included, and an item's value is bound to
the old id — so a reshape that only guards the removed options still clears
every item's Status.

`Status` not exactly the five, in seven steps:

1. `field-list` — when `Status`'s options are exactly `Backlog`,
   `In progress`, `Partially done`, `Done` and `Closed`, order ignored, skip
   to `Group`.
2. `item-list` filtered to `status == "Ready"` or `status == "In review"`:

       gh project item-list <number> --owner <owner> --format json --limit 500 \
         --jq '.items[] | select(.status == "Ready" or .status == "In review")
               | [.title, .status] | @tsv'

   When any item comes back, print each `title` and its state and stop: "these
   items sit in a Status option the bootstrap removes; move each to `Backlog`
   or `In progress` on the board, then run the verb again". The bootstrap never
   moves an item itself.
3. Snapshot every item's Status before anything is mutated — one
   `<item-id>\t<status>` line per item that has a `status` key, to a temp
   file:

       snapshot=$(mktemp)
       gh project item-list <number> --owner <owner> --format json --limit 500 \
         --jq '.items[] | select(has("status")) | [.id, .status] | @tsv' \
         > "$snapshot"

   Print the path — "Status snapshot: `$snapshot`" — before step 5 runs, so a
   run that stops part-way leaves the user the file to restore from. An item
   with no `status` key is absent from the snapshot and untouched by step 7.
4. `updateProjectV2Field` **replaces** the option list, and `field-list` does
   not print colour or description; read them first:

       gh api graphql -f query='
         query($id: ID!) {
           node(id: $id) {
             ... on ProjectV2SingleSelectField {
               options { name color description }
             }
           }
         }
       }' -F id=<status-field-id> --jq '.data.node.options'

5. Send exactly five options, in this order, inlined in the mutation text —
   `-F` passes scalars only, so the option list is written into the query:

       gh api graphql -f query='
         mutation($fieldId: ID!) {
           updateProjectV2Field(input: {
             fieldId: $fieldId
             singleSelectOptions: [
               {name: "Backlog", color: <as read>, description: "<as read>"},
               {name: "In progress", color: <as read>, description: "<as read>"},
               {name: "Partially done", color: <as read, else PURPLE>,
                description: "<as read, else Some pieces landed, more to do>"},
               {name: "Done", color: <as read>, description: "<as read>"},
               {name: "Closed", color: <as read, else GRAY>,
                description: "<as read, else Dropped without a plan>"}
             ]
           }) {
             projectV2Field {
               ... on ProjectV2SingleSelectField { id options { id name } }
             }
           }
         }' -F fieldId=<status-field-id>

   Every option step 4 returned takes the colour (an unquoted enum such as
   `GRAY`) and the description it returned, never the placeholders above;
   `Partially done` and `Closed`, when step 4 did not return them, take
   `PURPLE` with "Some pieces landed, more to do" and `GRAY` with "Dropped
   without a plan". Every option not sent — `Ready`, `In review`, anything
   else the field carried — is deleted; that is the point of the reshape. The
   stop in step 2 covers the removed options and the restore in step 7 covers
   the kept ones; neither alone is safe.
6. Run `field-list` again and read the option ids from it: a replace reissues
   every option's id, so any id read before the mutation is stale.
7. Restore from the snapshot: read it line by line, map each status name to
   the id step 6 returned for that name, and run the per-verb Status edit once
   per line. The map is a `jq` lookup over step 6's `field-list` output, held
   in `$fields`:

       fields=$(gh project field-list <number> --owner <owner> \
         --format json --limit 50)
       n=0; total=$(wc -l < "$snapshot" | tr -d ' ')
       while IFS=$'\t' read -r item status; do
         id=$(jq -r --arg s "$status" '.fields[] | select(.name == "Status")
           | .options[] | select(.name == $s) | .id' <<< "$fields")
         [ -n "$id" ] \
           || { echo "no option named $status for $item — snapshot: $snapshot"
                exit 1; }
         gh project item-edit --id "$item" --project-id <project-id> \
           --field-id <status-field-id> --single-select-option-id "$id" \
           || { echo "restore failed at $item — snapshot: $snapshot"; exit 1; }
         n=$((n + 1))
       done < "$snapshot"
       echo "restored $n of $total"

   A status name the five options do not carry, or a non-zero exit from any
   `item-edit`, stops the verb naming the item id and the snapshot path — the
   field is never left half-restored silently, and no item is skipped; the
   user re-runs the remaining lines from the file. The verb ends by printing
   "restored N of N".

`Group` absent:

    gh api graphql -f query='
      mutation($projectId: ID!) {
        createProjectV2Field(input: {
          projectId: $projectId
          dataType: TEXT
          name: "Group"
        }) {
          projectV2Field { ... on ProjectV2Field { id name } }
        }
      }' -F projectId=<project-id>

`Priority` absent — the one tolerance for a project made without the template:

    gh api graphql -f query='
      mutation($projectId: ID!) {
        createProjectV2Field(input: {
          projectId: $projectId
          dataType: SINGLE_SELECT
          name: "Priority"
          singleSelectOptions: [
            {name: "P0", color: RED, description: "Pick first"},
            {name: "P1", color: ORANGE, description: ""},
            {name: "P2", color: YELLOW, description: ""}
          ]
        }) {
          projectV2Field { ... on ProjectV2SingleSelectField { id options { id name } } }
        }
      }' -F projectId=<project-id>

A `Status` field absent altogether is not tolerated — every project has one —
and is reported as a broken project with its URL.

## Items

    gh project item-list <number> --owner <owner> --format json --limit 500

returns `items[]`. Each carries `id` (the `PVTI_…` item id `item-edit` takes
as `--id` for a field edit), `title`, `content` (`type`, `title`, `body`, and
for a draft issue its `id`, the `DI_…` id the title-and-body edit takes), and
one key per populated field, named for the field in lower case — `status`,
`priority`, `group`. A draft issue whose `Status` was never set has no
`status` key.

The id is parsed from the title with `^B([0-9]{2,}) — `, case-sensitive, the
dash the em dash the skill writes; an item whose title does not match is
"unnumbered", warned about in `list`, and never renumbered.

The **next id** is one past the highest number over two sources, zero-padded
to two digits:

- every item title in the project, whatever its status — done and closed
  included;
- every id in the `backlog:` and `backlog_pieces:` frontmatter lists of every
  plan folder directly under `docs/plans/` and `docs/plans/archived/` in the
  base repo — the `^backlog:` and `^backlog_pieces:` lines of each
  `index.md`, each `[ … ]` list split on commas, each entry matched with
  `^B([0-9]{2,})$`. Frontmatter lists only, never prose — an id cited only as
  a piece is spent as surely as a finished one:

      grep -hE '^backlog(_pieces)?:' \
          docs/plans/*/index.md docs/plans/archived/*/index.md \
        | sed 's/^backlog[a-z_]*:[[:space:]]*\[\(.*\)\].*/\1/' | tr ',' '\n' \
        | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -E '^B[0-9]{2,}$' \
        | sed 's/^B//' | sort -n | tail -1

A project starts at `B01` only when both sources are empty — so an id spent by
a retired file store, or by a project since deleted, is never reissued.

`Bnn` on the command line matches the title prefix; an id no item carries is a
stop naming it.

## Per verb

Field and option ids are the ones `field-list` returned this run.

**`add`** — three commands. Create the draft issue:

    gh project item-create <number> --owner <owner> \
      --title "Bnn — <item>" --body "<detail>" --format json --jq .id

Then set `Status` to `Backlog` explicitly — a draft item starts with none — and
`Priority` to the answer:

    gh project item-edit --id <item-id> --project-id <project-id> \
      --field-id <status-field-id> --single-select-option-id <backlog-option-id>
    gh project item-edit --id <item-id> --project-id <project-id> \
      --field-id <priority-field-id> --single-select-option-id <priority-option-id>

and, when a group was named:

    gh project item-edit --id <item-id> --project-id <project-id> \
      --field-id <group-field-id> --text "<group>"

**`move`** — the `Priority` edit above with the new option id.

**`planned`, `partial`, `done`, `close`** — the `Status` edit above with
`In progress`, `Partially done`, `Done` or `Closed`, then the body's closing
lines. The body is replaced whole: read `content.body` from `item-list`,
rewrite its closing lines, and write it back with the draft issue's own id:

    gh project item-edit --id <draft-issue-id> --title "<title, unchanged>" \
      --body "<body with the closing lines rewritten>"

The closing lines, per verb — `Planned in:` is one comma-separated line, and
each `Landed:` line sits above it:

- `planned` — add `<folder>` to the `Planned in:` line, or append
  `Planned in: <folder>` after a blank line when there is none. A folder
  already listed is not added twice. An item whose Status is `Done` or
  `Closed` asks before anything is edited.
- `partial` and `done` — remove `<folder>` from `Planned in:`, dropping the
  line when the list empties, and add `Landed: <plan title> in <folder>`
  after the last existing `Landed:` line, or, with none, above `Planned in:`
  or at the end after a blank line. `<plan title>` is the `title:` value of
  `<folder>/index.md`'s frontmatter, folded onto one line. A `done` with no
  folder rewrites no line.
- `close` — append the reason after a blank line. `close` runs the `Status`
  bootstrap first when `Closed` is absent.

**`list`, `next`** — `item-list` alone; nothing is written. `list` reads each
`Partially done` item's `content.body` and counts its lines beginning
`Landed: ` for the Status cell, and ends with the project's `url` from the
resolution. `next` filters to the candidates, then sorts by priority then id:

    gh project item-list <number> --owner <owner> --format json --limit 500 \
      --jq '.items[] | select(.status == "Backlog"
              or (.status == "Partially done"
                  and ((.content.body // "") | test("(?m)^Planned in: ")
                       | not)))'

and, when the top candidate is `Partially done`, prints its `Landed:` lines
with the body.

## Errors

Three failures the precondition does not catch, each a one-line stop:

- **Rate limit** — `gh` exits with `API rate limit exceeded`: "GitHub rate
  limit hit; retry after <the reset time the message gives>".
- **A deleted project** — the resolution found nothing where the caller
  expected ids to resolve: "no backlog project `<repo>` under `<owner>` —
  `/vwf:backlog add` creates one; the ids in this plan's `backlog:` line no
  longer resolve".
- **A renamed item** — an id the caller passed matches no title: "no item
  `Bnn` in the project; a title edited in the browser must keep its
  `Bnn — ` prefix". Nothing is renumbered.
