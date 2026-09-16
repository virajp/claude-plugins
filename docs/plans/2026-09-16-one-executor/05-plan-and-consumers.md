# U5 — `plan`, `archive`, `backlog`, `feedback` name one executor

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/plan/**`, `plugins/vwf/skills/archive/**`,
  `plugins/vwf/skills/backlog/**`, `plugins/vwf/skills/feedback/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the cited lines of each owned file:
  `skills/plan/SKILL.md:421`; `skills/archive/SKILL.md` :61, :66, :139 and its
  §1/§3 landing-edit passages; `skills/backlog/SKILL.md` :8, :133;
  `skills/feedback/SKILL.md:209`. Then `plugins/vwf/assets/plan-index.md`'s
  writers table and Folder re-point rule (as U1 left them).
- **Lazy-load:** none.

## Ruling

Decision 5: "When the landing's gap list is empty, the landing moves the folder
to `docs/plans/archived/`, re-points `Folder`, sets `COMPLETE` and sweeps — for
both kinds. When any gap is open, the folder stays live as the working record,
the row reads `COMPLETE` with `Folder` at the live path, and the report names
`/vwf:archive` for after reconciliation."

Decision 13: "`/vwf:change-plan` and `/vwf:plan` both end with
`/vwf:execute docs/plans/<folder>` and `/vwf:execute next` …"

## Edits

1. **`skills/plan/SKILL.md:421`** — "every other row is `/vwf:execute`'s or
   `/vwf:archive`'s". Confirm the launch line already reads `/vwf:execute` (plan
   1 wrote it); no other edit.
2. **`skills/archive/SKILL.md`** — `:61`: a `RUNNING` row is a live
   `/vwf:execute` run; `:66` and `:139`: the landing edit is `/vwf:execute`'s
   when the gap list was empty, and this skill's when the folder was left live
   (open gaps, now reconciled) — one rule, both kinds. Delete any sentence that
   distinguishes the two executors' landings.
3. **`skills/backlog/SKILL.md`** — `:8` description: one executor calls `done`
   at landing; `:133` callers table: collapse the two executor rows into one
   `/vwf:execute` row.
4. **`skills/feedback/SKILL.md:209`** — "then `/vwf:execute <folder>` in a fresh
   session".
5. Fold by hand — not dprint-formatted.

## Verification

- `grep -rn 'change-execute' plugins/vwf/skills/plan plugins/vwf/skills/archive plugins/vwf/skills/backlog plugins/vwf/skills/feedback/SKILL.md`
  prints nothing.
- `grep -c '/vwf:execute' plugins/vwf/skills/backlog/SKILL.md` ≥ 2.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `skills/{execute,change-plan,change-execute}/**` or any asset.
- No escaped backtick inside a code span.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`refactor: plan, archive, backlog, feedback — one executor` — written by the
orchestrator after the wave gate. Type `refactor`; no scope.
