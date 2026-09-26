# U1 — Backlog: the `partial` verb, the `Partially done` status, the `Planned in:` list

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/backlog/SKILL.md`,
  `plugins/vwf/skills/backlog/references/github.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom, before editing; the plan's
  Facts section.
- **Lazy-load:** `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md`
  (why the option-list replace needs the refusal and the snapshot-and-restore) —
  only if the bootstrap edit needs it.

## Ruling

Quoted from index.md's assumed decisions:

> **1.** `backlog:` names the ids the plan **finishes** — landing sets them
> `Done`. A new frontmatter list, `backlog_pieces:`, names the ids the plan
> lands **a piece of**. A Parked entry that belongs to an item begins with its
> id: `- Bnn: <piece>`. The last plan of a chain moves the id to `backlog:`.

> **2.** A new verb, `partial <ids> <folder>`: sets Status to the new option
> `Partially done` and records `Landed: <plan title> in <folder>` on the body.
> Rejected: `done --piece`; the names `partially-done` and `landed`.

> **3.** Five options — `Backlog`, `In progress`, `Partially done`, `Done`,
> `Closed`. The bootstrap reshapes an existing four-option field on the next
> verb, through the existing snapshot-and-restore of every item's Status.

> **4.** `Planned in:` holds a list of folders. `planned` on an item already
> `In progress` or `Partially done` appends its folder instead of asking;
> `partial` and `done` move their folder off `Planned in:` onto the `Landed:`
> line.

> **5.** A landed piece always sets `Partially done`; a later `planned` sets
> `In progress`; the finishing plan sets `Done`. Folders still pending stay on
> `Planned in:`.

> **6.** `next` ranks `Backlog` items together with `Partially done` items whose
> `Planned in:` is empty, by priority then id; naming a partial item shows its
> `Landed:` lines so the next plan starts from what remains.

> **7.** `Partially done` items are listed, not folded into the trailing count;
> their `Landed:` lines appear as a count.

> **15.** The next-id floor reads `backlog_pieces:` lists as well as `backlog:`
> lists over every plan folder, live and archived.

## Edits

1. **`SKILL.md` frontmatter** — the description gains "records a landed piece"
   (or equivalent) beside "marks items planned and done"; the argument-hint at
   :12 gains `partial` in the verb list, after `planned`.
2. **`SKILL.md` — the Status table and its prose (:70-90).** The Status row
   reads `Backlog` → `In progress` → `Partially done` → `Done`, or `Closed`. The
   body's closing lines: an item with a pending plan ends with
   `Planned in: <folder>[, <folder>…]` — a comma-separated list; an item with a
   landed piece carries one `Landed: <plan title> in <folder>` line per piece,
   above `Planned in:` when both exist; `Closed` still ends with its reason. Add
   the old-vocabulary note only if the file's translation paragraph needs it —
   `Partially done` has no older spelling.
3. **`SKILL.md` — the bootstrap paragraph.** Four options become five, in that
   order — `Partially done` added (colour and description of the unit's
   choosing, e.g. `PURPLE` / "Some pieces landed, more to do"; report the pick
   under `DECIDED:`); the refusal on `Ready`/`In review` items and the
   snapshot-and-restore stand as they are; the idempotence test compares against
   the five names.
4. **`SKILL.md` — `### planned`.** Replace the "already `In progress` under a
   different path is a question" rule: when the item is `In progress` or
   `Partially done`, append the folder to `Planned in:` (skip it when already
   listed) and set `In progress`; when the item is `Done` or `Closed`, it is
   still a question for the user.
5. **`SKILL.md` — new `### partial <ids> <folder>`,** after `planned`: sets
   Status `Partially done`, removes `<folder>` from `Planned in:` (dropping the
   line when it empties), adds `Landed: <plan title> in <folder>` — the plan
   title read from the folder's `index.md` frontmatter `title:`. An item that
   was never `In progress` still moves, and the verb says so, as `done` does.
6. **`SKILL.md` — `### done`.** It also moves `<folder>` off `Planned in:` onto
   a `Landed:` line, so a finished item's body shows every folder that landed on
   it. Its signature becomes `done <ids> <folder>` — decision 4 needs the
   folder; U2 and U3 pass it by the same ruling. An item with no `Planned in:`
   entry for that folder (work landed without a plan) still moves, as today.
7. **`SKILL.md` — `### next` and `### list`** per decisions 6 and 7.
8. **`SKILL.md` — `### add`'s id rule (:120-122)** per decision 15.
9. **`SKILL.md` — the callers table (:181-195).** Execute and
   `plan-management archive` call `done <ids> <folder>` for `backlog:` ids and
   `partial <ids> <folder>` for `backlog_pieces:` ids; the paragraph under it
   names both frontmatter lists.
10. **`references/github.md`.** The per-verb commands (:280-297) gain `partial`
    (Status edit plus the body rewrite) and the `Planned in:` list handling for
    `planned`, `partial` and `done`; the bootstrap section's option list, its
    idempotence comparison and its mutation payload carry the fifth option; the
    `next` and `list` queries per decisions 6 and 7; the id derivation
    (:242-250) greps `^backlog:` and `^backlog_pieces:`. Keep the tolerance that
    `list` and `next` alone pass on `read:project`.

## Verification

- `grep -c 'Partially done' plugins/vwf/skills/backlog/SKILL.md plugins/vwf/skills/backlog/references/github.md`
  ≥ 1 each.
- `grep -n 'backlog_pieces' plugins/vwf/skills/backlog/references/github.md`
  hits the id derivation.
- `grep -n '### partial' plugins/vwf/skills/backlog/SKILL.md` hits once.
- `mise run p:plugins:check` green; `mise run code:precommit` green.

## Guardrails

- Touch nothing outside the two owned files.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand.
- The frontmatter is strict YAML — a colon inside the description needs quoting,
  or the skill is dropped silently.
- No `gh` call against GitHub; the procedure is written, not run.
- Delete with `rm`, never `git rm`.

## Commit

`feat: backlog — the partial verb and the Partially done status` — written by
the orchestrator after the wave gate. `feat` is in
`.config/git-conventional-commits.yaml`.
