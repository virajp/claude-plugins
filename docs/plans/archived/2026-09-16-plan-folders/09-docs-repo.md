# U9 — Repo docs: readme, CLAUDE.md, the vwf-plugin skill, the decision record

- **Wave:** 3
- **Depends on:** U4, U5, U6, U7, U8
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/skills/vwf-plugin/**`,
  `.claude/docs/**`, `.claude/skills/release/SKILL.md`,
  `docs/memory/decisions/2026-09-16-plan-folders.md` (new)
- **Model:** opus
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; then every
  owned file's cited passages: `readme.md:231-239`;
  `CLAUDE.md:48-58,
  72, 84-86, 248, 296-302, 362`;
  `.claude/skills/vwf-plugin/SKILL.md:58-67,
  156-161, 198-205`;
  `.claude/skills/vwf-plugin/references/docs-tree.md:39-55,
  69-80`;
  `references/skills-and-agents.md:12, 34-38, 44-50, 65-72`;
  `references/assets.md:12, 15, 27`; `.claude/skills/release/SKILL.md:51`;
  `.claude/docs/ci-and-releases.md:82`; `.claude/docs/plugins.md:12`. Then the
  wave-2 results:
  `plugins/vwf/skills/{plan,execute,change-plan,
  change-execute,archive}/SKILL.md`
  frontmatter and section headings, and `plugins/vwf/assets/plan-index.md`.
- **Lazy-load:** `docs/memory/decisions/2026-09-13-vwf-process.md` and
  `docs/memory/decisions/2026-09-15-*.md` (the shape of a decision record);
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (where a decision doc goes).

## Ruling

Decision 6: "The docs state: a flat plan in flight is finished on the previous
vwf release, or its slice is re-run through `/vwf:plan` (stamp-heal drops what
already conforms)."

Decision 17: "`execute` gets `disable-model-invocation: true`."

The whole assumed-decisions table of `index.md` — this unit writes the decision
record that carries it.

## Edits

1. Run `/vwf:docs-sync` over the run's branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line the wave-2 units returned, plus the list in
   *Facts the survey established* for the owned files. Edit only what the change
   falsified.
2. **`readme.md:231-239`** — the paragraph: both planners write a folder;
   `/vwf:execute <folder>` and `/vwf:change-execute <folder>` each run in a
   fresh session, each with `next`; one plan index.
3. **`CLAUDE.md`** — `:48-58`: the paragraph describing the change-plan pair now
   describes both pairs: planned with `/vwf:plan` (a blueprint slice) or
   `/vwf:change-plan` (anything else), each committing and pushing the approved
   folder with its row in `docs/plans/index.md`'s **one table**; run in a fresh
   session with `/vwf:execute <folder>` / `/vwf:change-execute
   <folder>` or
   `next`, which reads that table filtered to its kind; the claim, the
   `COMPLETE`, the gate lines and the `ask` after-landing steps as written.
   `:72` table row and `:84-86` link defs: add `#vwfplan` / `#vwfexecute`
   pointers beside the change pair. `:248` plugin cell: "the guarded pair `plan`
   / `execute` and the ad-hoc pair `change-plan` / `change-execute`, writing one
   plan folder shape". `:296-302`: the ad-hoc pair "sits beside" paragraph stays
   true; add that the two pairs share the folder shape, the interview and the
   index. `:362` unchanged. `CLAUDE.md:391` names the plugin tables, not the
   index — leave it.
4. **`.claude/skills/vwf-plugin/SKILL.md`** — `:58-67`: the workflow line and
   the queue paragraph, for both pairs; `:156-161`: plan halts unchanged;
   `:198-205`: invocation modes — `execute` is now user-only
   (`disable-model-invocation: true`) like `change-execute`; `plan` and
   `change-plan` user + model.
5. **`references/docs-tree.md:39-55, 69-80`** — the `docs/plans/` passage: a
   folder per plan, either kind, `index.md` + unit files; one index table; the
   archived history table gains a row: the flat `vwf-plan` file retired
   2026-09-16, with the in-flight rule of decision 6.
6. **`references/skills-and-agents.md`** — `:12` the disable-model-invocation
   list adds `execute`; rows `:34-38, 44-46` describe folders and the shared
   shape; `:49-50` the execute-stages pointer says run log in the folder,
   journal a mirror; agent rows `:65-72` say *unit*.
7. **`references/assets.md`** — `:12, 15, 27`: add rows for
   `templates/plan-folder.md` and `plan-interview.md`; drop `templates/plan.md`;
   `plan-index.md` row: one table plus the procedure; `execute-stages.md` row:
   run log wording.
8. **`.claude/skills/release/SKILL.md:51`**,
   **`.claude/docs/ci-and-releases.md:82`**, **`.claude/docs/plugins.md:12`** —
   wording: both pairs, folders, `next` for both.
9. **`docs/memory/decisions/2026-09-16-plan-folders.md`** (new) — the decision
   record in the house shape (date, branch, plan link, reverses nothing, backlog
   none): what prompted it (the parked parity item; the gaps in `/vwf:plan`
   listed in the plan's Goal), the rulings — one section per assumed decision
   that a future plan might re-open (1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12), each
   with its rejected alternative — and the pointer to plan 2. Note explicitly
   that the `next` removal was proposed on 2026-09-16 and withdrawn the same
   day, so a later reader does not re-open it as new.
10. These files **are** dprint-formatted: run `mise run code:format` over the
    owned paths only (never `--fix` outside Owns); a widened table cell re-pads
    every row — accept it.

## Verification

- `grep -rn 'change-execute next' readme.md CLAUDE.md .claude/` — every hit sits
  in a sentence that also names `/vwf:execute next`, or is the
  `#vwfchange-execute` anchor.
- `grep -rn 'flat\|<date>-<time>-<slice>\|cycle-plan table\|change-plan table\|templates/plan.md' readme.md CLAUDE.md .claude/skills/vwf-plugin .claude/docs .claude/skills/release/SKILL.md`
  prints nothing except docs-tree.md's history row.
- `test -f docs/memory/decisions/2026-09-16-plan-folders.md` and `git add` it
  before the gate (`code:precommit` misses untracked files).
- `mise run code:precommit` green; `mise run p:plugins:check` green (it scans
  `.claude/` prose rules).

## Guardrails

- Do not touch `site/**` (U10), `plugins/**` (wave 2), `docs/plans/index.md`
  (orchestrator) or `docs/backlog.md` (`/vwf:backlog`).
- Never `git checkout` / `git restore` / `--fix` outside Owns.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk; `npm` after a pipe is rewritten by the
  hook — write with the Write tool.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`docs: plan folders — readme, CLAUDE.md, repo skills, decision record` — written
by the orchestrator after the wave gate. Type `docs`; no scope.
