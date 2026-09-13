# U2 — the backlog skill, and one sentence in feedback

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/backlog/SKILL.md` (new),
  `plugins/vwf/skills/feedback/SKILL.md`
- **Model:** opus
- **Read first:** `plugins/vwf/skills/feedback/SKILL.md` top to bottom;
  `docs/backlog.md` (the seed — its table and per-item sections are the file
  shape this skill owns; do **not** quote its rows in the skill, several name
  tools).
- **Lazy-load:** `plugins/vwf/skills/handoff/SKILL.md` and
  `plugins/vwf/skills/docs-sync/SKILL.md` (frontmatter shape of a user-and-model
  skill); `plugins/vwf/skills/archive/SKILL.md` (a small file-editing skill's
  tone); `.claude/skills/plugin-authoring/references/checks.md` 34–120 (the
  rules that scan a skill).

## Ruling

Decision 8 (the user, verbatim): "Let only `backlog` skill be responsible to
manage the file and content, others can simply call `backlog` skill to make
changes. `change-plan`, `change-execute`, `plan`, `execute` any of them can call
`backlog`."

Decision 10: "`model: sonnet`, `effort: medium`,
`disable-model-invocation:
false`. Verbs: `add`, `list`, `next`,
`move <id> <priority>`, `planned <ids>
<folder>`, `done <ids>`, `close <id>`.
Priorities `P1`–`P3`. Statuses `open`, `planned`, `done`, `closed`. Ids `Bnn`,
sequential, never reused. The file: one table plus one `### Bnn — <title>`
section per item, as the seed. The skill never commits."

Decision 11 (the user, verbatim): "`feedback` is different than `backlog`.
`backlog` is something that can't be picked up right now, `feedback` is
something that is being worked upon and might need change in `product`,
`blueprint`, `architecture`, etc. It will then follow the `plan` and `execute`
workflow."

Decision 9: the `backlog:` frontmatter key on plans is how callers know which
ids to pass.

## Edits

1. **`plugins/vwf/skills/backlog/SKILL.md`** — create. Frontmatter (strict YAML,
   quote the argument hint): `name: backlog`; `description:` one paragraph — the
   repo's prioritised backlog, `docs/backlog.md`, for work that cannot be picked
   up now; the sole writer of that file; adds, lists, reprioritises, marks
   planned and done, closes; called by change-plan, change-execute, plan,
   execute and archive to move items as plans are written and land; not the
   place for production feedback, which `/vwf:feedback` routes into the workflow
   now;
   `argument-hint:
   "[add <item> | list | next | move <id> <priority> | planned <ids> <folder> | done <ids> | close <id>]"`;
   `model: sonnet`; `effort: medium`; `disable-model-invocation: false`. Body,
   in this order:
   - **What the backlog is, and is not** — decision 11's distinction in the
     skill's own words, one short paragraph; feedback is worked now, backlog
     waits.
   - **The file** — `docs/backlog.md` at the repo root's `docs/`, beside
     `docs/plans/`. Exact shape: a one-paragraph header; one table with columns
     `Id | Item | Group | Priority | Status`; an optional `## Groups` list;
     `## Items` with one `### Bnn — <title>` section per row carrying the
     detail. Ids `Bnn` sequential from `B01`, never reused after a close.
     Priority `P1` (first) to `P3`. Status `open` → `planned` (with the plan
     path in the section's last line, `Planned in: <path>`) → `done`; or
     `closed` for an item dropped without a plan (reason on the section's last
     line). `Group` is free text; empty is fine. Creating the file when absent
     is `add`'s job, with the header and the empty table.
   - **Verbs** — one short subsection each: `add <item>` (asks for the priority
     with a three-option question when not given; writes the row and the
     section; the group when the user names one); `list` (the table, ordered by
     priority then id, `done`/`closed` folded to a count unless asked); `next`
     (the top `open` item by priority then id, and the command that picks it up:
     `/vwf:change-plan <item>` for work outside the blueprint,
     `/vwf:plan <slice>` when the item names a blueprint slice — ask which when
     the item does not say); `move <id> <priority>`;
     `planned <ids>
     <folder>` (status `planned`, records the path);
     `done <ids>`; `close
     <id>` (asks the reason). Every verb re-sorts
     nothing and re-numbers nothing; rows keep their ids.
   - **Who calls it** — the five callers and when: change-plan at hand-off
     (`planned`), change-execute at landing (`done`), plan at approval
     (`planned`), execute at its final gate (`done`), archive when it archives a
     plan carrying ids not yet done (`done`). Callers pass the ids from the
     plan's `backlog:` frontmatter. The skill edits only `docs/backlog.md`.
   - **What this skill never does** — commits (the caller's commit, or the
     user's, carries the change); edits any other file; invents an id; reads or
     writes a mempalace room (the file is the store).
2. **`plugins/vwf/skills/feedback/SKILL.md`** lines 19–21 — keep the routing and
   the "not to a backlog" sense, but reword the sentence so it states the
   distinction: feedback is worked now and routes into the docs and commands
   that fix it; what cannot be picked up now belongs in `/vwf:backlog`. One
   sentence, no other change to this file.

## Verification

- `mise run p:plugins:check` green — the new skill is discovered (a strict-YAML
  failure drops it silently, so also
  `command grep -c "" plugins/vwf/skills/backlog/SKILL.md` is non-zero and the
  frontmatter parses: `command sed -n '1,/^---$/p' …` shows the six keys).
- Rule 10: no tool token in the new prose — the file names no framework, package
  or service.
- `command grep -n "backlog" plugins/vwf/skills/feedback/SKILL.md` shows exactly
  the reworded sentence.

## Guardrails

- Do not touch `change-plan/` (U1), the four caller skills (U3), any doc (U7) or
  `docs/backlog.md` itself (U7's, this run only).
- Do not quote `docs/backlog.md`'s rows anywhere in the skill — several name
  third-party tools and rule 10 scans vwf prose.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Delete with `rm`, never `git rm`.

## Commit

`feat: /vwf:backlog — the prioritised backlog, sole writer of docs/backlog.md` —
written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
