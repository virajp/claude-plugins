# U6 — `/vwf:change-plan` reads the shared template, interview and index

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `plugins/vwf/skills/change-plan/**`
- **Model:** opus
- **Read first:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `references/interview.md`, `references/plan-template.md`; then
  `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/assets/plan-index.md` (as
  U1/U2 left them).
- **Lazy-load:** none.

## Ruling

Decision 2: "`/vwf:change-plan` writes `Kind: edit`."

Decision 3: "One index table … `Target repo` is … `—` for a change plan."

Decision 10: "`assets/templates/plan-folder.md` — the one folder template both
planners fill; `assets/plan-interview.md` — the one checklist …
`change-plan/references/{plan-template,interview}.md` … are deleted."

## Edits

1. **`SKILL.md`** — `description`: unchanged in substance; "the plan index"
   instead of "the plan index with a derived priority" is fine to keep as is.
   Body:
   - The intro's "`/vwf:plan`'s cycle plans are flat files in the same
     directory" (§1 recall bullet) → "folder or — before 2026-09-16 — flat file,
     since older cycle plans were flat files"; every "change-plan table" → "the
     plan index" (one table); §1's index bullet cites `assets/plan-index.md` for
     the shape and says the `Priority` column of required rows, **of either
     kind**, is what the derived priority stands on.
   - §3: "Work through [the checklist](references/interview.md)" →
     `${CLAUDE_PLUGIN_ROOT}/assets/plan-interview.md`, following its
     `*Change plans:*` notes where an item differs.
   - §6: "from [the template](references/plan-template.md)" →
     `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`; add to the rules
     list: every unit is `Kind: edit` — a change plan has no code unit in this
     release; the cycle-only sections of the template are omitted.
   - §8 step 2: "the change-plan table" → "the plan index" with the new columns:
     `Kind` `change`, `Target repo` `—`.
   - The "What this skill never does" list: "the change-plan table" → "the plan
     index".
2. **`references/interview.md`** and **`references/plan-template.md`** — `rm`.
   Remove the `## References`-style pointers to them if any remain.
3. Fold by hand — `plugins/**/*.md` is not dprint-formatted.

## Verification

- `test ! -e plugins/vwf/skills/change-plan/references/interview.md && test ! -e plugins/vwf/skills/change-plan/references/plan-template.md`.
- `grep -n 'references/interview.md\|references/plan-template.md\|change-plan table\|cycle-plan table\|flat files in the same' plugins/vwf/skills/change-plan/SKILL.md`
  prints nothing.
- `grep -n 'plan-interview.md\|plan-folder.md\|plan-index.md' plugins/vwf/skills/change-plan/SKILL.md`
  — all three cited.
- `grep -n 'Kind: edit\|Kind' plugins/vwf/skills/change-plan/SKILL.md` hits.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `plugins/vwf/skills/{plan,execute,change-execute}/**` or any
  asset.
- Delete with `rm`, never `git rm`.
- No escaped backtick inside a code span.

## Commit

`refactor: change-plan — shared template, interview and index` — written by the
orchestrator after the wave gate. Type `refactor`; no scope.
