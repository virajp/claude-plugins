# Decision — backlog on GitHub Projects: the store moves from docs/backlog.md to a forge project

**Date** 2026-09-18 · **Branch** `2026-09-18-backlog-on-github-projects` ·
**Plan**
[`docs/plans/2026-09-18-backlog-on-github-projects/`](../../plans/2026-09-18-backlog-on-github-projects/index.md)
· **Reverses** the offline argument of ruling 3 in
[`2026-09-13-vwf-process.md`](./2026-09-13-vwf-process.md) — "a backlog that
exists only in memory is one an offline session cannot read" · **Backlog** none
covered; B12 is re-added to the new project after landing

## What prompted it

The user asked for the backlog to live where a team already looks — the forge's
project board — with the project named for the repo, under the repo's account,
created on consent from the Team planning template when missing; and,
mid-interview, for a repo hosted on GitLab to be considered. `docs/backlog.md`
was a file only vwf sessions read; a project is what the rest of a team opens.

## What changed

`/vwf:backlog` keeps the product's backlog in a **GitHub Project** — owned by
the account the base repo's `origin` names, titled with the repo's name —
instead of in `docs/backlog.md`. Items are draft issues titled `Bnn — <item>`;
the project's own Status and Priority fields carry the state, plus one `Closed`
status option and one `Group` text field the skill adds on first use. The skill
detects the forge from the base repo's remote host: GitHub is implemented in
`skills/backlog/references/github.md`; a GitLab remote stops with "not yet
supported" and the parked shape. When the project does not exist, the skill asks
consent, hands the user the browser — GitHub's API cannot instantiate a built-in
template, and Team planning is one — waits for their word, and re-detects the
project by title. `/vwf:doctor` reports a `gh` that is absent, unauthenticated
or without the `project` scope as a degradation with the remedy. The seven
verbs, the `Bnn` ids the plans carry in `backlog:` and the plan index's Backlog
column, and the five callers are unchanged in shape; the planners' and the
executor's staging lines that named `docs/backlog.md` are dropped. This repo's
own `docs/backlog.md` (B01–B11 `done`, B12 `open`) is deleted; B01–B11 stay in
git history and in the archived plans' `backlog:` lists.

## The reversal

The 2026-09-13 decision rejected a mempalace room as the store because a backlog
that exists only in memory is one an offline session cannot read. A GitHub
Project has the same property — it needs network and a `project`-scoped `gh`
token — and this plan accepts it with **no file fallback**: when `gh` cannot
reach the project, every verb stops with the remedy and a caller's recall reads
nothing and says so. The trade is deliberate: a backlog nobody outside a vwf
session looks at is worth less than one that is occasionally unreadable.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **A missing project (1).** On consent the skill prints the new-project URL —
  `users/<owner>/projects/new` or `orgs/<owner>/projects/new` — and the two
  things to set there, the Team planning template and the title `<repo>`; waits
  for the user to say it is done; re-lists by title. The skill never runs
  `gh project create`. Rejected: replicating the template's fields by API (views
  cannot be); a plain project with no template.
- **No fallback (2).** The project is the one store. `gh` absent,
  unauthenticated for the remote's host, or without the `project` scope stops
  every verb with the remedy — `gh auth login` or `gh auth refresh -s project` —
  and a caller's recall reports "backlog unreadable: <reason>" and continues
  with nothing; a token carrying `read:project` alone still passes `list` and
  `next`. Rejected: keeping `docs/backlog.md` as a read-only mirror — two
  stores, stale on any UI edit.
- **Item kind (3).** Draft issues via `gh project item-create`; no repo issue is
  ever opened. Rejected: repo issues added to the project.
- **The id (4).** The title is `Bnn — <item>`; the next number is one past the
  highest any title carries, done and closed included, never reused. A title
  without an id is listed as unnumbered, warned about, never renumbered.
  Rejected: a custom `Id` field; the opaque `PVTI_…` node id.
- **Vocabulary (5).** Priority is the template's `P0 / P1 / P2`. Status: `open`
  → `Todo`, `planned` → `In Progress`, `done` → `Done`, `closed` → `Closed` — an
  option the skill adds once via `updateProjectV2Field`. `Group` is a text field
  added once via `createProjectV2Field`. `Planned in: <folder>` and the close
  reason are the body's last line. Rejected: the skill's own `Backlog status` /
  `Backlog priority` fields beside the template's.
- **Finding the project (6).** Every verb resolves owner and title from
  `gh repo view` in the base repo, then `gh project list` filtered on the title;
  nothing is cached, no `.config/vwf.yaml` key is added, `config_format` stays
  `19`. Rejected: a `forge:` config key.
- **The forge (7).** The base repo's `origin` host decides: `github.com` or any
  host `gh auth status` lists is GitHub; `gitlab.com` or any host `glab` lists
  is GitLab, which stops every verb with "not yet supported" and names the
  parked shape; anything else is unsupported and named. Rejected: GitHub-only
  with no detection; both backends in one plan.
- **The skill's shape (8).** `SKILL.md` keeps the verbs, the vocabulary, forge
  detection and the callers; `references/github.md` carries the `gh` command per
  verb, the field bootstrap and the missing-project procedure; a later
  `references/gitlab.md` slots beside it. Rejected: one file.
- **Doctor (9).** One paragraph after the `rtk` one in stack-checks: `gh` on
  `PATH`, `gh auth status` green for the base remote's host, the `project` scope
  — each miss a degradation with its remedy, never blocking, reported every run;
  on a GitLab remote the same three for `glab`. Rejected: blocking (every vwf
  repo would need a forge account); no doctor check.
- **This repo's file (10).** `rm docs/backlog.md`; B12 is re-added after
  landing. Rejected: keeping it as frozen history; migrating all twelve.
- **The `next` verb (12).** The top `Todo` item by priority then id; the routing
  to `/vwf:change-plan` or `/vwf:plan` is unchanged.
- **`list` (13).** A five-column table — Id, Item, Group, Priority, Status —
  ordered by priority then id, `Done` and `Closed` folded into a trailing count,
  ending with the project's URL.
- **Commit (14).** The skill still never commits — nothing in the tree to
  commit; the callers' staging lines that named the file are dropped.
- **The `add` consent chain (15).** `add` on a repo with no project is the one
  verb that creates: it asks consent, hands over the browser, then adds. Every
  other verb reports "no backlog project yet — `/vwf:backlog add` creates it"
  and stops. Rejected: every verb creating.

## Parked

- **GitLab backend — `references/gitlab.md`.** Shape agreed at the interview:
  the repo's own issues carry scoped labels `priority::P0|P1|P2` and
  `status::todo|in-progress|done|closed`, a `group::<name>` label where one is
  named, shown on an Issue Board; `glab issue create/list/update` per verb;
  `Bnn` stays a title prefix; a missing board is created by `glab` (GitLab has
  no template gate to hand to the browser); doctor's `glab` probe already lands
  here; self-hosted hosts resolve through `glab auth status`. Needs its own plan
  and a GitLab repo to prove it on.
- **B12 — `unclaim <folder>`** — stays the next backlog item, re-added after
  landing.

## What stays outside

Creating the project by API (impossible with the Team planning template); a file
mirror of the project; migrating B01–B11; a release (both bumps are recorded,
the tags wait); a `forge:` config key and a `config_format` bump; earlier
decision docs and `handoff/next.md`, which describe `docs/backlog.md` as it was;
the stackgen mise-pack `merge` script's unrelated `gh pr create`.
