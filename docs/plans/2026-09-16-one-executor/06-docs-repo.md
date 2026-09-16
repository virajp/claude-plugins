# U6 — Repo docs: readme, CLAUDE.md, the vwf-plugin skill, the decision record

- **Wave:** 3
- **Depends on:** U2, U4, U5
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/skills/vwf-plugin/**`,
  `.claude/docs/**`, `.claude/skills/release/SKILL.md`,
  `docs/memory/decisions/2026-09-16-one-executor.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; the cited
  lines: `readme.md:237-238`; `CLAUDE.md` :53-54, :57, :75, :88, :253, :303,
  :370; `.claude/skills/vwf-plugin/SKILL.md` :61, :70, :72, :204;
  `references/skills-and-agents.md` :12, :35, :44-46; `references/assets.md:15`;
  `references/docs-tree.md` :49, :51, :58; `.claude/skills/release/SKILL.md:51`;
  `.claude/docs/plugins.md:12`; `.claude/docs/ci-and-releases.md:82`. Then the
  wave-2 result: `plugins/vwf/skills/execute/SKILL.md` frontmatter and headings,
  and the three references.
- **Lazy-load:** `docs/memory/decisions/2026-09-16-plan-folders.md` (the shape
  of a decision record and the rulings this one stands on).

## Ruling

Decision 12 (as it binds `CLAUDE.md`): "The nine inbound `#vwfchange-execute`
links re-point to `#vwfexecute`."

The whole assumed-decisions table of `index.md` — this unit writes the decision
record that carries it.

## Edits

1. Run `/vwf:docs-sync` over the run's branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line the wave-2 units returned, plus the list in
   *Facts the survey established* for the owned files. Edit only what the change
   falsified.
2. **`readme.md:237-238`** — one executor: `/vwf:execute <folder>` or
   `/vwf:execute next` for both kinds.
3. **`CLAUDE.md`** — `:53-57`: the pair paragraph says both planners hand off to
   one `/vwf:execute`; "filtered to its own kind" goes. `:75` and `:88`: the
   `#vwfchange-execute` link targets become `#vwfexecute` (the link text names
   `/vwf:execute`). `:253` plugin cell: "the two planners `plan` and
   `change-plan`, one executor `execute`". `:303`, `:370`: wording.
4. **`.claude/skills/vwf-plugin/SKILL.md`** — `:61`, `:70`, `:72`: one executor;
   `:204`: the invocation-modes list drops `change-execute`.
5. **`references/skills-and-agents.md`** — `:12` the user-only list drops
   `change-execute`; `:35` the execute row names both kinds and the Kind switch;
   `:44-46` delete the `change-execute` row; the `change-plan` row says it hands
   off to `/vwf:execute`. Add the three execute references to whatever table
   lists references, if one does.
6. **`references/assets.md:15`**, **`references/docs-tree.md` :49, :51, :58** —
   one executor; docs-tree's history table gains a row: `change-execute` retired
   2026-09-16, absorbed into `execute`.
7. **`.claude/skills/release/SKILL.md:51`**, **`.claude/docs/plugins.md:12`**,
   **`.claude/docs/ci-and-releases.md:82`** — wording.
8. **`docs/memory/decisions/2026-09-16-one-executor.md`** (new) — the decision
   record in the house shape (date, branch, plan link, reverses nothing, backlog
   none): what prompted it (plan 1's Parked item; the user's wish for one
   executor without losing TDD and the reviews), the rulings 1–14 each with its
   rejected alternative, and the two items still parked.
9. These files are dprint-formatted: `mise run code:format` over the owned paths
   only. `git add` the new decision record before the gate.

## Verification

- `grep -rn 'change-execute' readme.md CLAUDE.md .claude/` prints nothing except
  the docs-tree history row.
- `grep -rn 'vwfchange-execute' readme.md CLAUDE.md .claude/` prints nothing.
- `grep -rn 'own kind\|both executors\|either executor\|two executors' readme.md CLAUDE.md .claude/`
  prints nothing.
- `test -f docs/memory/decisions/2026-09-16-one-executor.md`.
- `mise run code:precommit` green; `mise run p:plugins:check` green.

## Guardrails

- Do not touch `site/**` (U7), `plugins/**`, `docs/plans/index.md`,
  `docs/backlog.md`.
- Never `git checkout` / `git restore` / `--fix` outside Owns.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk; write with the Write tool.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`docs: one executor — readme, CLAUDE.md, repo skills, decision record` — written
by the orchestrator after the wave gate. Type `docs`; no scope.
