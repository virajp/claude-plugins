# U5 — plan-management works on the JSON files

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/plan-management/SKILL.md`,
  `plugins/vwf/skills/plan-management/references/plan-index.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom, and index.md's facts
  sections on the two schemas and the `plan.mjs` command line.

## Ruling

Decision 23: "The repo is in the old format whenever `docs/plans/index.md` exists, with or without `docs/plans/index.json` (a migration stopped half way). The test reads the local checkout. A repo with neither file has no plan: `next` and `all` report no runnable plan, and so does an origin tree with no `docs/plans/index.json`."

Decision 25: "The message names `https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md`. Other repos get vwf only from a release, which merges `develop` into `main`, so the URL exists by then. On this machine the staged build prints it before the release; that 404 is accepted."

Decision 20: "U1 runs alone in wave 1 (with U9, which names no plugin path).
U3 to U8 run in wave 2 and depend on U1, because rule 6 of
`p:plugins:check` fails a `${CLAUDE_PLUGIN_ROOT}` path to `plan.mjs` before
U1 commits it."

Approved ruling: "**`plan-management`** reads and writes `index.yaml` and
`docs/plans/index.yaml` (claim, unclaim, status, complete, archive, next,
resolve, priority, list)" — now `index.json` and `docs/plans/index.json`
(decision 4).

Decision 7: "A dot path; a segment after a list chooses the entry by its `id`.
The value is a string, `--json` reads it as JSON. `append <file> <list> --json <object>`
adds an entry. A wrong id is an error, never a new entry."

Decision 9: "Only the new format is supported. A repo is in the old format
whenever `docs/plans/index.md` exists, with or without `docs/plans/index.json`; a
folder is in the old format when it has `index.md` and no `index.json`.
`/vwf:execute` (a named folder, `next` and `all`) and every `plan-management`
verb examine the format first. On the old format they stop before any change
and print the migration message: the repo uses the old plan format; migrate it
with `https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md`
— in a local clone of `virajp/claude-plugins`, paste "Read
`<local path>/docs/plans/migrate.md` and follow it in this repo."; then run
the same command again. After the migration the command works on the new
format. The test reads the local checkout. A repo with neither file has no plan:
`next` and `all` report no runnable plan, and so does an origin tree with no
`docs/plans/index.json`."

Decision 11: "`plan-management add` refuses while `docs/plans/index.md`
exists, with the migration message of decision 9."

Decision 19: "An archived folder with no `index.json` satisfies a `requires`
entry, for both kinds of plan; `resolve` reads nothing from it."

Decision 12: "As in the facts: a `plans` list of rows with `id`; `gaps` is
`null` until landed, then `{open, moved_to}`."

Decision 13 (the prompt): "Read `<local path>/docs/plans/migrate.md` and
follow it in this repo."

## Edits

1. **`plugins/vwf/skills/plan-management/SKILL.md`** — every verb reads and
   writes through
   `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`:
   - the Files table: `docs/plans/index.json`, a folder's `index.json`
     (`status.state` and `status.detail` are this skill's, as the Status
     block was), the move into `docs/plans/archived/`, and `plan.mjs` itself.
   - Kind comes from `type` of `index.json`.
   - A new section before the verbs: the format test of decision 9, run
     first by every verb, with the exact migration message. On the old
     format the verb stops and changes nothing.
   - `add`: refuse while `docs/plans/index.md` exists (decision 11); run `plan.mjs validate <folder>/index.json` and refuse on red;
     refuse unless `status.state` is `DRAFT`; when `docs/plans/index.json`
     is absent, write `{"format": 1, "plans": []}` once with the Write tool;
     set `status.state` to `APPROVED` and `status.detail` to
     `APPROVED <date> by the user`; `append` the row with every key of the
     schema; for each `gaps_of` entry, refuse unless its row is `COMPLETE`
     and its `gaps.open` is above 0, then set its `gaps` to
     `{"open": 0, "moved_to": [<basenames>]}`.
   - `claim`, `unclaim`, `status`, `complete`, `archive`, `next`, `resolve`,
     `priority`, `list`: the same procedures on the JSON keys. `complete`
     counts the `gaps` entries with `state: open` and sets
     `gaps: {"open": <n>, "moved_to": []}`, and re-points `folder`.
     `archive` warns on each unit whose `status` is not `green` (in place of
     the Run log Outcome column), reads `- Bnn:` Parked lines from `index.md`
     as today, and sets `status.state` to `ARCHIVED` unless it is
     `COMPLETE`. `next` reads `git show origin/<integration>:docs/plans/index.json`
     piped into `plan.mjs get - plans`. `list` shows folders under
     `docs/plans/` with no row as *unindexed*, as today.
   - `resolve`: a change requirement needs a `COMPLETE` row or an archived
     folder; a cycle requirement reads `covers` of its `index.json`. An
     archived folder with no `index.json` satisfies the requirement for both
     kinds, and nothing is read from it (decision 19).
2. **`plugins/vwf/skills/plan-management/references/plan-index.md`** —
   rewrite for `docs/plans/index.json`: the shape (index.md's schema), each
   key's meaning (the old column meanings, moved to the keys), the row
   statuses, multi-repo placement, the sweep, the commit rules (stage
   `docs/plans/index.json`; the push-rejection loop restores it with
   `git checkout HEAD -- docs/plans/index.json`), resolution, the pick and the
   queue read. Remove the "older-shape migration" that inserts a Gaps column,
   and the prose frame of the markdown file.

## Verification

- `grep -n "docs/plans/index.md" plugins/vwf/skills/plan-management/SKILL.md plugins/vwf/skills/plan-management/references/plan-index.md`
  finds only the format test of decision 9 and the refusal of decision 11.
- `grep -n "Run log\|Status block\|frontmatter" <both owned files>` finds
  nothing.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the two owned files. `plan.mjs` is U1's; do not
  create or edit `scripts/`.
- No verb commits, as today.
- `plugins/**/*.md` is not formatted: keep lines at 80 columns by hand. Keep
  each code span on one line. Keep the frontmatter strict YAML.

## Commit

`feat: plan-management reads and writes the JSON plan files`
