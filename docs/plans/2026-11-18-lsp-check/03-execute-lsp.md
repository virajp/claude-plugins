# U3 — Execute stops a code-unit plan on an LSP row

- **Read first:** every owned file, top to bottom, before editing. In
  `start.mjs`, read the checks phase (about lines 595-680), where `findings` is
  filtered (about line 633).
- **Lazy-load:** U1's `lsp-check` rows in `plugins/vwf/skills/doctor/scripts/lib/`,
  only to see their exact shape.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D1:** The doctor checks make one row for each missing server: `rule` `lsp-check`, `severity` `degraded`, `project` `null`, `subject` the server,
  `message` the line, `remedy` the fix. `/vwf:doctor` and `start.mjs` get the
  same rows.
- **D2:** The user ruled: `/vwf:execute` must stop if the target repo does not
  have `code:lsp:check`, or if the check fails, and the user fixes it before
  the run continues. Those cases are also `lsp-check` rows, with `subject`
  `code:lsp:check`.
- **D4:** The user ruled: only a plan with a code unit stops. `start.mjs`
  passes on every `lsp-check` row in `findings`. When `has_code_unit` is true and an
  `lsp-check` row is present, the result is `blocked` before the claim, and the
  message names each server and its remedy. When the plan has no code unit,
  the run continues, and the final report lists the `lsp-check` rows.
- **D7:** The tests use a stub `mise` on a temporary `PATH`, with fixture
  output of `code:lsp:check`.
- **D14:** On a resume blocked by an `lsp-check` row, `start.mjs` calls
  `stop()`, a stop event plus a log end, as it does for a blocking row. On a
  fresh run it returns `blocked` with no log start and no claim.
- **D15:** U3 also owns `execute/references/claim.md` and `final-report.md`.
- **D17:** The rule name is `lsp-check`, which no R5b row shares. `start.mjs`
  stops only on `lsp-check` rows; the R5b rows stay as R5b rules them.
- **D18:** The LSP stop comes first. `start.mjs` returns `blocked` on the
  `lsp-check` row before the unknown-language question, and its message also
  names the unknown-language rows.
- **D19:** A fresh run with a blocking row and an `lsp-check` row takes the
  present blocking path (log start, then `stop()`), and the message names both
  kinds of row.
- **D22:** The default `mise` stub of `execute-start.test.ts` (about lines
  50-58) lists `code:lsp:check` in `tasks ls --hidden` and passes it, and
  `MISE_FAIL` spares the LSP calls, so the present tests keep their results.
- **D23:** For a plan with no code unit, `start.mjs` writes one free event
  `lsp-check` per row to the plan's action log, after the log start, with the
  keys `subject`, `message` and `remedy`. The final report reads those events.
  U3 also owns `execute/references/action-log.md` and names the event there.
- **D24:** Each start, fresh or resume, writes the `lsp-check` events of its
  own check. The final report reads only the `lsp-check` events after the last
  log start, so a server that the user fixed leaves the report.
- **D12:** This reverses the parked rule (`installed` stops, `proceed without`
  writes a gap). No consent applies.

## Edits

1. **`plugins/vwf/skills/execute/scripts/start.mjs`** — the `findings` filter
   (about line 633) also keeps each row with `rule` `lsp-check`, and no other
   degraded row (D17). A fresh run and a resume both apply D4: with
   `has_code_unit` and an `lsp-check` row, a fresh run returns `blocked` with
   no log start and no claim, before the unknown-language question (D18); a
   resume calls `stop()` (D14). The message is
   `<folder>: LSP check: <subject> — <remedy>; …`. Update the header comment
   (about lines 16-31) so that `findings` also holds the `lsp-check` rows.
2. **`scripts/src/execute-start.test.ts`** — add cases: a plan with a code unit
   and an `lsp-check` row → `blocked`, no claim; a resume of such a plan →
   `stop()` (D14); a plan of edit units with an `lsp-check` row → `ready`, with
   the row in `findings`; an `lsp-check` row and an unknown-language row →
   `blocked` on the LSP, the message names both (D18); a degraded row with
   another rule (R5b's) → no block (D17); no `lsp-check` row → no change. The
   assertion `not.toHaveProperty("lsp")` (about line 421) stays true.
5. **`plugins/vwf/skills/execute/references/claim.md`** — where it says that
   `findings` holds the blocking and unknown-language rows (about line 67),
   add the `lsp-check` rows, and describe the `blocked` result that they cause
   for a plan with a code unit (D4, D18).
6. **`plugins/vwf/skills/execute/references/final-report.md`** — a plan with
   no code unit lists each `lsp-check` event of the action log that comes
   after the last log start (D23, D24), with its remedy.
7. **`start.mjs`, again (D23)** — when the run continues with `lsp-check` rows
   (a plan with no code unit), write one free event `lsp-check` per row to the
   plan's action log, after the log start, with the keys `subject`, `message`
   and `remedy`, the same way `start.mjs` writes its other events. Add a test
   case for it in `execute-start.test.ts`.
8. **`plugins/vwf/skills/execute/references/action-log.md`** — name the
   `lsp-check` event, its keys, and that the final report reads it.
3. **`plugins/vwf/skills/execute/references/preflight.md`** — replace "The LSP
   check (Setup step 2)" (about lines 68-71): the start checks already ran
   `code:lsp:check`; a plan with a code unit never reaches this step with an
   `lsp-check` row, because `start.mjs` stopped it; for a plan of edit units, the
   `lsp-check` rows go to the final report. Change the line above (about line 64) to
   match. Remove the mention of the parked gap and of `consent.lsp`.
4. **`plugins/vwf/skills/execute/references/setup.md`** — replace the parked
   passage (about lines 116-118) with one sentence that points to the start
   check and D4.

## Verification

- `mise x -- pnpm vitest run scripts/src/execute-start.test.ts` passes.
- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all`
  pass.
- `command grep -rn 'lsp-check-parked\|consent.lsp' plugins/vwf/skills/execute`
  has no hit.

## Guardrails

- Touch nothing outside the owned paths. The doctor checks belong to U1.
- Do not write a gap for an `lsp-check` row: the run stops, or the row goes to the
  final report.
- Delete with `rm`, never `git rm`. Do not run a formatter with `--fix`, and
  do not run `git checkout` or `git restore`.
- `plugins/**/*.md` is not formatted: keep the fold width by hand.

## Commit

`feat: execute stops a code-unit plan when code:lsp:check fails`
