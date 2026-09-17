# U3 — The planners, `backlog` and the assets call the verbs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/plan/SKILL.md`,
  `plugins/vwf/skills/plan/references/plan-doc.md`,
  `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/assets/plan-interview.md`,
  `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/templates/project-claude.md`,
  `plugins/vwf/assets/membership.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom;
  `plugins/vwf/skills/plan-management/SKILL.md` (U1's, committed).
- **Lazy-load:** `plugins/vwf/skills/plan-management/references/plan-index.md`
  when a replaced passage cites a section of the old asset by name.

## Ruling

Decisions 4, 5, 9 and 11, quoted:

> **4.** The skill never commits; the caller does — … the planners their
> approval commit.

> **5.** `assets/plan-index.md` moves to
> `skills/plan-management/references/plan-index.md` …;
> `assets/templates/plan-folder.md` stays an asset — the planners still write
> folders.

> **9.** Gap-kept, hand-merged and never-run folders are retired when a user
> asks in prose; the session invokes `archive <folder>` …

> **11.** … `rm -r skills/archive` and `rm assets/plan-index.md` are U5's, after
> every citation has moved.

## Edits

Every citation of `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` becomes
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`; every
`/vwf:archive` becomes the `archive` verb of `plan-management`, reached by
asking in prose; every place a planner edits the index or the Status block
itself becomes an invocation of the verb.

1. **`skills/plan/SKILL.md`** — `:51` (Doc Paths: the index row cites the
   references path); `:321-324` (the derivation is stated from
   `plan-management priority <folder>` — the arithmetic may stay as the
   explanation, the verb is what runs); `:424-426` (self-review: `resolve` for
   the `requires:` check, `priority` for the arithmetic); `:432-443` (hand-off
   steps 1–2 collapse to `plan-management add <folder>`, which sets `APPROVED`
   and appends the row; the file-creation sentence and "every other row is …" go
   — the verb owns both); `:455-458` (still stages `docs/plans/index.md` in the
   approval commit — decision 4); `:497-498` ("never does": never edits the
   index or the Status block itself; `add` is the one verb it calls on them).
2. **`skills/plan/references/plan-doc.md:10-22`** — the Status block is
   rewritten by `plan-management` on the executor's behalf; `requires:` is never
   re-pointed (unchanged).
3. **`skills/change-plan/SKILL.md`** — `:58-65` (the index read cites the
   references path); `:197-202` (priority via the verb, as in plan); `:291-293`
   (self-review via `resolve` and `priority`); `:300-310` (hand-off steps 1–2 →
   `plan-management add <folder>`); `:322-325` (staging unchanged); `:354-355`
   ("never does", as in plan). The description at `:10` still says the row is
   added with a derived priority.
4. **`skills/backlog/SKILL.md`** — `:9` (description: "… and `plan-management`
   as one is retired"); `:35` (the index cites the references path); `:133` (the
   callers row: `plan-management archive` → `done <ids>`).
5. **`assets/plan-interview.md:99-104`** (item 12) — the derivation is
   `plan-management priority`; the arithmetic stays as the explanation of what
   the verb returns.
6. **`assets/templates/plan-folder.md:17`** — "the `archive` verb of
   `plan-management` moves it with the folder".
7. **`assets/templates/project-claude.md:10-15`** — the workflow line ends at
   `/vwf:execute <folder>`; add a clause that a landed plan is archived by the
   run, and a folder left live is archived by asking. No `/vwf:archive`.
8. **`assets/membership.md:114`** — the docs-only command list names
   `plan-management` in `/vwf:archive`'s place; `:148-150` cites the references
   path.

## Verification

- `grep -rn 'vwf:archive\|assets/plan-index' plugins/vwf/skills/plan plugins/vwf/skills/change-plan plugins/vwf/skills/backlog plugins/vwf/assets`
  returns nothing.
- `grep -c 'plan-management' plugins/vwf/skills/plan/SKILL.md` ≥ 3 and the same
  for `change-plan/SKILL.md`.
- `mise run p:plugins:check` green.
- `mise run code:precommit` green.

## Guardrails

- Touch nothing outside the eight owned files — not `skills/execute/` (U2, same
  wave), not `skills/plan-management/`, not `skills/archive/`, not
  `assets/plan-index.md` (U5 deletes both).
- `assets/plan-index.md` is **not** yours to edit even though it sits in
  `assets/` — it is on its way out; leave it byte-identical.
- Do not restate a verb's procedure; cite the verb.
- `plugins/**/*.md` is not dprint-formatted — fold by hand at the neighbouring
  width.
- No escaped backtick inside a code span; no table cell ending in a bare `*`.
- Delete nothing; `rm` nothing.

## Commit

`refactor: planners, backlog and assets — the plan index through plan-management`
— written by the orchestrator after the wave gate. `refactor` is in
`.config/git-conventional-commits.yaml`.
