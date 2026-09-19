# U1 — The backlog skill on a forge project

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/backlog/SKILL.md`,
  `plugins/vwf/skills/backlog/references/github.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/backlog/SKILL.md` top to bottom;
  `docs/backlog.md` (the shape being replaced — read, never edited);
  `plugins/vwf/skills/plan-management/SKILL.md` and its
  `references/plan-index.md` (the verb-skill and reference shape to match);
  `plugins/vwf/skills/doctor/references/stack-checks.md:252-262` (the degraded
  tone to reuse for a missing `gh`).
- **Lazy-load:** `.claude/skills/plugin-authoring/SKILL.md` (frontmatter and
  citation rules) when unsure what `p:plugins:check` asserts over a new
  reference file.

## Ruling

Decisions 1–8 and 12–15, quoted:

> **1.** On consent the skill prints the new-project URL —
> `https://github.com/users/<owner>/projects/new` for a user,
> `https://github.com/orgs/<owner>/projects/new` for an organisation — and the
> two things to set there: the **Team planning** template and the title
> `<repo>`; then waits for the user to say it is done and re-lists by title. The
> skill never runs `gh project create`.

> **2.** The project is the one store. When `gh` is absent, unauthenticated for
> the remote's host, or without the `project` scope, every verb stops with the
> remedy — `gh auth login` or `gh auth refresh -s project` — and a caller's
> recall reports "backlog unreadable: <reason>" and continues with nothing.
> `docs/backlog.md` is never read or written again.

> **3.** Draft issues, created with `gh project item-create`; no repo issue is
> ever opened.

> **4.** The title is `Bnn — <item>`; the next number is one past the highest
> `Bnn` any item title carries, done and closed included, never reused. An item
> whose title carries no id is listed under "unnumbered", warned about, and
> never renumbered by the skill.

> **5.** Priority is the template's `P0 / P1 / P2`, `P0` first. Status: `open` →
> `Todo`, `planned` → `In Progress`, `done` → `Done`, `closed` → `Closed` — an
> option the skill adds to the Status field once, on the first verb that needs
> it, via `updateProjectV2Field`. `Group` is a text field the skill adds once
> via `createProjectV2Field`. `Planned in: <folder>` and the close reason are
> the last line of the item body.

> **6.** Every verb resolves owner and title from
> `gh repo view --json owner,name` run in the **base** repo, then
> `gh project list --owner <owner> --format json` filtered on `title == <repo>`;
> nothing is cached and no `.config/vwf.yaml` key is added. A member-repo
> session resolves the base first, as today.

> **7.** The base repo's `origin` host decides: `github.com`, or any host
> `gh auth status` lists, is GitHub; `gitlab.com`, or any host
> `glab auth status` lists, is GitLab; anything else is unsupported. GitLab
> stops every verb with "GitLab is not yet supported by /vwf:backlog" and names
> the parked shape. Unsupported stops with the host.

> **8.** `SKILL.md` keeps the verbs, the vocabulary, forge detection and the
> callers; `references/github.md` carries the `gh` command per verb, the
> field-and-option bootstrap, and the missing-project procedure, cited as
> `${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md`.

> **12.** The top item by Priority (`P0` first) then id among `Todo` items; the
> routing to `/vwf:change-plan` or `/vwf:plan` is unchanged.

> **13.** Prints a five-column table — Id, Item, Group, Priority, Status — from
> `item-list`, ordered by priority then id; `Done` and `Closed` fold into a
> trailing count unless everything is asked for; ends with the project's URL.

> **14.** The skill still never commits — there is nothing in the tree to
> commit.

> **15.** `add` on a repo with no project is the one verb that creates: it asks
> consent to create, hands over the browser (decision 1), then adds. Every other
> verb on a missing project reports "no backlog project yet — `/vwf:backlog add`
> creates it" and stops.

And the reversal, from the Goal: no file fallback — the fourth "never does"
bullet ("a backlog that only exists in memory is one an offline session cannot
read") is the sentence being overturned, and the new file says so.

## Edits

1. **`plugins/vwf/skills/backlog/SKILL.md`** — rewrite in place, keeping the
   section order (what it is / the store / verbs / who calls it / never does)
   and the frontmatter keys. Specifically:
   - **Frontmatter.** `description` says the backlog is a project on the repo's
     forge — a GitHub Project named for the base repo under its account — not a
     file; keeps the feedback sentence and the callers sentence. `argument-hint`
     unchanged except `move <id> <priority>` now takes `P0|P1|P2`.
     `model: sonnet` and `disable-model-invocation: false` unchanged.
   - **"The file" becomes "The project".** State: product-level, one project for
     the whole product, found from the **base** repo's remote (decision 6); the
     forge rule (decision 7) with the three outcomes; the item shape (decision
     3, 4) and the vocabulary table rewritten to the project's fields
     (decision 5) — `Id`, `Priority`, `Status`, `Group`, with the mapping from
     the old words (`open`/`planned`/`done`/`closed`, `P1–P3`) stated once so a
     reader of an older plan folder can translate. The two trailers move to the
     item body's last line. The bootstrap — the `Closed` option and the `Group`
     field, added once, idempotently — is named here and specified in the
     reference. The missing-project procedure (decisions 1, 15) is named here
     and specified in the reference. The precondition (decision 2) is stated
     once: `gh` present, authenticated for the host, `project` scope — with the
     remedy — and that every verb checks it first and stops.
   - **Verbs.** Same seven headings. Each says what changes in the project in
     the vocabulary above and cites the reference for the command. `add`: next
     id per decision 4; asks priority as a three-option question `P0`/`P1`/`P2`;
     Group only when named; body carries the detail; on a missing project, the
     consent-then-browser chain (decision 15). `list`: decision 13. `next`:
     decision 12. `move`: sets Priority. `planned`: Status → `In Progress`,
     body's last line `Planned in: <folder>`; an item already `In Progress`
     under a different path is a question. `done`: Status → `Done`; an item
     never planned still moves, said aloud. `close`: Status → `Closed` (adding
     the option first if absent), reason as the body's last line. The
     order-invariance paragraph becomes: ids are never renumbered and an item is
     never deleted or archived by the skill; `list` decides the reading order.
   - **"Who calls it"** — table unchanged; the sentence about ids from
     `backlog:` frontmatter unchanged.
   - **"What this skill never does"** — `Commit` (decision 14, reworded: there
     is nothing in the tree to commit); `Edit any file` (it edits the project
     and nothing on disk); `Invent an id, or reuse one` (from titles); replace
     the memory-room bullet with **`Keep a file copy`** — the project is the one
     store; a session that cannot reach it has no backlog to read, and says so;
     `Create the project itself` (decision 1); `Open a repo issue` (decision 3);
     `Decide what gets built` unchanged.
   - Fold at the neighbouring width by hand; no escaped backtick inside a code
     span; no table cell ending in a bare asterisk.
2. **`plugins/vwf/skills/backlog/references/github.md`** — new. A reference in
   the shape of `plan-management/references/plan-index.md` (a heading, a
   one-paragraph purpose, then `##` sections). Sections, each with the exact
   `gh` invocation and the JSON fields read:
   - **Precondition** — `command -v gh`; `gh auth status --hostname <host>`;
     scope check: `gh auth status` lists token scopes, `project` must appear
     (`read:project` is enough for `list`/`next`, say so); the remedy per
     failure.
   - **Resolving the project** — `gh repo view --json owner,name` in the base
     repo → `<owner>`, `<repo>`; owner type from the same call's
     `owner.__typename` is not exposed by `gh repo view`, so use
     `gh api users/<owner> --jq .type` (`User` or `Organization`) only when
     composing the new-project URL;
     `gh project list --owner <owner> --format json --limit 100` filtered on
     `.projects[] | select(.title == "<repo>")` → `number`, `id`, `url`. Two
     projects with that title is an `UNRESOLVED`-class stop for the user (name
     both URLs). Closed projects are ignored.
   - **Missing project** — the consent question, then the URL and the two
     settings (template **Team planning**, title `<repo>`), then "say done",
     then re-resolve; a second miss repeats once, then stops.
   - **Fields** — `gh project field-list <number> --owner <owner> --format json`
     → the `Status` field's `id` and its `options[]` (`Todo`, `In Progress`,
     `Done`, and `Closed` once added), the `Priority` field's `id` and options
     (`P0`, `P1`, `P2`), the `Group` field's `id`. **Bootstrap**, idempotent:
     when `Closed` is absent, `gh api graphql` with `updateProjectV2Field`
     passing the existing options plus `Closed` (the mutation replaces the
     option list — send every existing option by name, colour and description so
     none is lost); when `Group` is absent, `createProjectV2Field` with
     `dataType: TEXT`, `name: "Group"`. Give both mutations in full. When the
     project was not created from Team planning and `Priority` is absent, create
     it too with `SINGLE_SELECT` options `P0`, `P1`, `P2` — the one tolerance
     for a project made without the template.
   - **Items** —
     `gh project item-list <number> --owner <owner> --format json --limit 500` →
     `items[]` with `id`, `title`, `body`, `status`, and the field values keyed
     by field name; parse `Bnn` from the title prefix with a regex the reference
     states; the highest id rule.
   - **Per verb** — `add`:
     `gh project item-create <number> --owner <owner> --title "Bnn — <item>" --body "<detail>" --format json`
     → `id`, then
     `item-edit --id <item> --project-id <id> --field-id <priority-field> --single-select-option-id <opt>`
     and, when a group is named, `--field-id <group-field> --text "<group>"`;
     Status is set to `Todo` explicitly (a draft item starts with no status).
     `move`: the Priority `item-edit`. `planned`/`done`/`close`: the Status
     `item-edit` plus `item-edit --id --title --body` to append the last line
     (body is replaced whole — read it first, append, write). `list`/`next`:
     read-only.
   - **Errors** — the three `gh` failures the precondition did not catch (rate
     limit, a deleted project, a renamed item) and the one-line stop for each.

## Verification

- `mise run p:plugins:check` green — the new reference is cited from `SKILL.md`
  as `${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md`, and the path
  exists.
- `grep -n 'docs/backlog.md' plugins/vwf/skills/backlog/SKILL.md plugins/vwf/skills/backlog/references/github.md`
  returns nothing.
- `grep -c 'gh project' plugins/vwf/skills/backlog/references/github.md` ≥ 6;
  `grep -n 'updateProjectV2Field\|createProjectV2Field' plugins/vwf/skills/backlog/references/github.md`
  hits both.
- `grep -n '^### ' plugins/vwf/skills/backlog/SKILL.md` lists exactly the seven
  verbs.
- `grep -n 'Team planning' plugins/vwf/skills/backlog/references/github.md`
  hits;
  `grep -n 'gh project create' plugins/vwf/skills/backlog/references/github.md`
  hits only inside a sentence that says the skill never runs it.
- `mise run code:precommit` green.

## Guardrails

- Touch nothing outside the two owned files — not `docs/backlog.md` (U5 deletes
  it), not any caller (U2), not doctor (U3).
- Do not run `gh` against GitHub; the commands are written, not executed.
- Do not restate the callers' procedures; the callers table cites verbs.
- `plugins/**/*.md` is not dprint-formatted — fold by hand at the neighbouring
  width.
- Strict-YAML frontmatter: a bad key drops the skill silently — keep the
  existing keys and quoting.
- No escaped backtick inside a code span; no table cell ending in a bare
  asterisk; no pipe character inside a table cell.
- Delete nothing; `rm` nothing.

## Commit

`feat: backlog — the store is a GitHub Project, found from the base repo's forge`
— written by the orchestrator after the wave gate. `feat` is in
`.config/git-conventional-commits.yaml`.
