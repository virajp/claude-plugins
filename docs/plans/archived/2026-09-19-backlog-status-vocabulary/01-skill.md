# U1 — The backlog skill's vocabulary, bootstrap and next-id floor

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/backlog/SKILL.md`,
  `plugins/vwf/skills/backlog/references/github.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files top to bottom; the plan's Facts section (the
  line pointers and the template's real option set).
- **Lazy-load:**
  `docs/memory/decisions/2026-09-18-backlog-on-github-projects.md` (the ruling
  being corrected — read, never edited); one archived plan's `index.md`
  frontmatter under `docs/plans/archived/` to see a `backlog:` list's exact
  shape.

## Ruling

Decisions 1–4, quoted:

> **1.** `open` → `Backlog`, `planned` → `In progress` (lower-case p, as the
> template spells it), `done` → `Done`, `closed` → `Closed`. The bootstrap
> replaces the Status option list with exactly those four — `Backlog`,
> `In progress` and `Done` sent back with the colour and description read from
> the field, `Closed` as `GRAY` / "Dropped without a plan" — so `Ready` and
> `In review` are removed.

> **2.** Before the replacing mutation, the bootstrap lists the items whose
> Status is `Ready` or `In review`; when any exist it stops, names each item and
> its state, asks the user to move them to `Backlog` or `In progress` on the
> board, and the verb is re-run. It never moves an item itself.

> **3.** The next id is one past the highest number over two sources: every item
> title in the project, and every id in the `backlog:` frontmatter list of every
> plan folder under `docs/plans/` and `docs/plans/archived/` in the base repo —
> frontmatter lists only, never prose. `B01` only when both sources are empty.
> An id spent by a retired file store is therefore never reissued.

> **4.** The bootstrap mutates the Status field only when its option list is not
> exactly `Backlog`, `In progress`, `Done`, `Closed` (order ignored); `Group` is
> created only when absent. Option ids are read from `field-list` after any
> mutation, since a replace reissues them.

## Edits

1. **`SKILL.md` — the field table** (`:75`): the `Status` row reads `Backlog` →
   `In progress` → `Done`, or `Closed` for an item dropped without a plan.
2. **`SKILL.md` — the translation** (`:79`): `open` is `Backlog`, `planned` is
   `In progress`, `done` is `Done`, `closed` is `Closed`; the priority sentence
   is unchanged.
3. **`SKILL.md` — the body lines** (`:83-84`): "An `In progress` item ends with
   …" — the option name as the template spells it.
4. **`SKILL.md` — the bootstrap paragraph** (`:87-88`): rewrite to say what the
   template ships (`Backlog`, `Ready`, `In progress`, `In review`, `Done`) and
   what the bootstrap makes of it — the field trimmed to the skill's four,
   `Closed` added, `Group` created — once, idempotent, on the first verb that
   needs it; and the trim-safety rule of decision 2 in one sentence, pointing at
   the reference for the procedure.
5. **`SKILL.md` — the verbs**: `add` sets `Backlog` (`:107-109`); `next` names
   the top `Backlog` item (`:128`); `planned` sets `In progress` and its
   already-planned check reads `In progress` (`:144-146`); `done`'s "never
   `In progress`" (`:151`). `list` is unchanged — it prints whatever Status an
   item carries.
6. **`SKILL.md` — the never-does list** (`:187-188`): the id sentence reads "Ids
   come from the item titles and the plan folders' `backlog:` lists, one past
   the highest" — decision 3 in its short form.
7. **`references/github.md` — Fields** (`:78`): the option ids read are
   `Backlog`, `In progress`, `Done` and `Closed`.
8. **`references/github.md` — Bootstrap**: replace the "`Closed` absent"
   procedure with the four-option procedure of decisions 1, 2 and 4, in this
   order: (a) `field-list` — when Status's options are exactly the four, skip to
   `Group`; (b) `item-list` filtered to `status == "Ready"` or `"In review"` —
   when any, print each `title` and its state and stop with the sentence
   decision 2 gives; (c) the colour/description query as today; (d) the
   `updateProjectV2Field` mutation with exactly four entries — `Backlog`,
   `In progress`, `Done` carrying the colour and description read, `Closed` as
   `GRAY` / "Dropped without a plan" — and say plainly that every option not
   sent is deleted, which is the point; (e) re-run `field-list` for the new
   option ids, since a replace reissues them. The `Group` and `Priority`
   procedures are unchanged.
9. **`references/github.md` — Items, the next id** (`:172-176`): the rule of
   decision 3 — the two sources, the regex on titles (unchanged), the
   frontmatter read (`^backlog:` line of each `index.md` directly under
   `docs/plans/` and `docs/plans/archived/` in the base repo, its `[ … ]` list
   split on commas, each entry matched with `^B([0-9]{2,})$`), max over both,
   plus one, zero-padded to two digits; `B01` when both are empty. Give the
   one-line shell for the frontmatter scan.
10. **`references/github.md` — Per verb**: `add` sets `Backlog` (`:190`); the
    status edits name `In progress`, `Done`, `Closed` (`:205-206`); `close` runs
    the bootstrap first when `Closed` is absent (unchanged in substance).

## Verification

- `grep -n 'Todo\|In Progress' plugins/vwf/skills/backlog/SKILL.md plugins/vwf/skills/backlog/references/github.md`
  returns no hit — the only allowed appearance of `In Progress` is none; the old
  vocabulary is not mentioned even historically.
- `grep -c 'Ready' plugins/vwf/skills/backlog/references/github.md` ≥ 2 (the
  trim and the safety check); `grep -n 'starts at' …/github.md` names both
  sources, not `B01` alone.
- `grep -n 'backlog:' plugins/vwf/skills/backlog/references/github.md` hits in
  the next-id section.
- `mise run p:plugins:check` green; `mise run code:precommit` green (run twice;
  the first pass may re-pad the plan folder's own `index.md`, which is the
  orchestrator's — leave it).

## Guardrails

- Touch nothing outside the two owned files — not the callers, not doctor, not
  the site.
- Do not run `gh` against GitHub; the commands are written, not executed.
- `plugins/**/*.md` is not dprint-formatted — fold by hand at the neighbouring
  width (≤ 80 columns).
- Strict-YAML frontmatter: keep every key and its quoting; the `description:`
  may be edited for the vocabulary but must remain one valid scalar.
- No escaped backtick inside a code span; no table cell ending in a bare
  asterisk; no pipe character inside a table cell.
- Delete nothing; `rm` nothing.

## Commit

`fix: backlog — the template's real Status options, and a next-id floor that continues a migrated numbering`
— written by the orchestrator after the wave gate. `fix` is in
`.config/git-conventional-commits.yaml`.
