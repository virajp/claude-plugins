# U1 — The rewave verb and its tests

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/plan-management/scripts/lib/schema.mjs`
  (the waves rule near line 405, the depends_on rule near line 349, the waits
  rule near line 371, `isPlanIndex` near line 553) and
  `plugins/vwf/skills/plan-management/scripts/lib/path.mjs` — read only, never
  edited.

## Ruling

Quoted from the plan's decisions:

> - D1: A dedicated verb, rewave (the user's choice). Rejected: a general batch
>   verb that applies a list of set operations and validates once.
> - D2: plan.mjs rewave <file> <unit>=<wave>... with one pair or more. Each
>   unit id must name a unit of the file; each wave must be an integer of 1 or
>   more. A plan index file (docs/plans/index.json), a malformed pair, a
>   repeated unit id, or no pair is a usage error, exit 2. rewave takes no
>   --json and no other flag.
> - D3: Refuse when any of these is true: a moved unit (its wave changes) is
>   not pending; the old or the new wave entry of a moved unit exists and is
>   not pending; a wave entry that must be dropped is not pending. A refusal
>   prints one line per cause on stderr, as file: path: message, exits 1 and
>   writes nothing. A pair that does not change the unit's wave is permitted
>   and is not a move (the user's choice).
> - D4: After the moves, waves becomes W1 ... W<n> in order, n the highest
>   wave of any unit. An existing entry keeps its status, started and ended
>   unchanged. A missing entry is added as {id, status: pending, started: "",
>   ended: ""}. An entry above n is dropped (D3 refuses when it is not
>   pending). stamp() is not called, and rewave writes no time.
> - D5: It changes the document in memory, then calls the existing write(),
>   which validates the whole document and writes nothing on any finding. So a
>   depends_on that no longer names a strictly earlier wave, or a missing
>   waits above wave 1, is a validation finding, exit 1, and the file stays
>   byte for byte as it was.
> - D6: rewave changes only wave fields and the waves list. The planner first
>   runs plan.mjs set <file> units.<id>.waits "<reason>" (a non-empty waits
>   validates in wave 1), then runs rewave. The docs that name rewave state
>   this order (the user's choice).
> - D7: No. A run never renumbers waves, and the reviewer is read-only.
>   execute/SKILL.md names rewave in what it never does, and
>   plan-rulings-reviewer.md names it among the verbs it never runs. rewave is
>   a planner write: the planners use it after the first green validate, the
>   self-review and the rulings review included.
> - D8: In plan.mjs, beside set, append and remove, with no new module.
>   plan.mjs stays dependency-free: node: built-ins and its relative lib/
>   imports only.
> - D9: A describe("rewave") block in scripts/src/plan-script.test.ts with at
>   least: a move to a new top wave (waves gains pending entries with empty
>   times); a move that empties the top wave (the pending entry is dropped);
>   each D3 refusal cause (a moved unit not pending; an old wave not pending;
>   a new wave not pending; a dropped wave not pending), each exit 1 with the
>   file bytes unchanged; the D11 refusal (a move that leaves a middle wave
>   with no unit), exit 1 with the file bytes unchanged; a validation failure
>   (a depends_on that becomes same-wave) with exit 1 and the file bytes
>   unchanged; existing wave entries keep their status and times; the usage
>   errors of D2, exit 2; and the 95octane case: a 12-unit change plan made in
>   the test temp folder, all pending, at waves U1 1, U2 2, U3 3, U4 3, U5 3,
>   U6 3, U7 3, U8 4, U9 5, U10 6, U11 7, U12 8 (waves W1-W8, every unit above
>   wave 1 with a waits reason), moved by one call, rewave <file> U3=4 U4=5
>   U5=6 U6=7 U8=8 U9=9 U10=10 U11=11, after which the call exits 0, validate
>   prints valid, waves lists W1-W11, all pending, and no wave is empty (U7
>   stays in W3, U12 stays in W8 beside U8).
> - D11: Refuse it: a wave from W1 to W<n> in the result that no unit sits
>   in is a refusal, waves.W<i>: has no unit, exit 1, nothing written —
>   whether the call made it empty or the file already had it; the planner
>   fixes an old empty wave in the same call (the user's choice). It is
>   collected with the D3 refusals, after the moves.
> - D12: Reword each such passage: one field or one list entry for each
>   write, except rewave, which moves units and rebuilds waves in one write.
>   U1 adds rewave to the plan.mjs header sentence near line 38 (set, append
>   and remove validate the result before they write) and rewords
>   plan-index.md near line 18; U4 rewords skills-and-agents.md (near line
>   39), docs-tree.md (near line 56) and site vwf.md (near line 2654) (the
>   user's choice).
> - D13: The field at fault: a moved unit that is not pending prints
>   units.<id>.status; an old, new or dropped wave that is not pending prints
>   waves.W<i>.status; an empty wave prints waves.W<i>. The message names the
>   cause, for example: is green; rewave moves only pending units (the
>   user's choice). An unknown unit id is a usage error, exit 2, per D2,
>   printed as units.<id>: is not a unit of this plan.
> - D15: Yes. rewave runs only when status.state is DRAFT or APPROVED; any
>   other state (RUNNING, BLOCKED, COMPLETE, ARCHIVED) is a refusal at the
>   path status.state, exit 1, nothing written, collected with the D3
>   refusals. The per-unit and per-wave pending checks still apply (the
>   user's choice).
> - D16: One line per distinct cause: each distinct path and message pair is
>   printed once, so two moves out of one green wave print one line, and a
>   wave that is both an old wave and a dropped wave prints two lines with
>   different messages. The dropped-wave test moves the only unit out of a
>   green top wave and expects both lines at waves.W<i>.status, the old-wave
>   cause and the dropped-wave cause; the dropped-wave check stays in the code
>   (the user's choice).
> - D17: No. rewave still collects the D11 and D15 refusals and exits 1 on
>   any; with none it exits 0 and writes nothing, so the file bytes do not
>   change (the user's choice).

## Edits

1. **`plugins/vwf/skills/plan-management/scripts/plan.mjs`** — add the verb
   `rewave`:
   - The header comment (the verb list near the top) and the `USAGE` text gain
     one entry: `rewave <file> <unit>=<wave>...`, which moves each named unit
     to its wave and rebuilds `waves` as `W1 ... W<n>` in one validated write;
     it refuses a move that touches a unit or a wave that is not `pending`.
   - `parseArgs` gains a `rewave` case: the file, then one or more pairs that
     match `^[A-Za-z0-9_-]+=[1-9][0-9]*$`. No pair, a pair that does not match,
     a repeated unit id, or any flag is a usage error (exit 2).
   - The verb refuses `docs/plans/index.json` (use `isPlanIndex`) as a usage
     error, exit 2: the plan index has no waves.
   - The `switch` gains a `rewave` case that does, in order:
     1. `load(file)`.
     2. For each pair: find the unit by `id` in `units`; an unknown id is a
        usage error (D2, D13): print `units.<id>: is not a unit of this
        plan` and exit 2.
     3. Collect the refusals (D3, D11, D15). If `status.state` is not
        `DRAFT` or `APPROVED`, that is a refusal at `status.state`. Then
        collect the D3 refusals over every pair whose wave differs from the
        unit's current `wave`: the unit's `status` is not `pending`; its old
        wave entry (`W<old>`) exists and its `status` is not `pending`; its new
        wave entry (`W<new>`) exists and its `status` is not `pending`. Then set
        each moved unit's `wave`, compute `n` (the highest `wave` of any unit),
        and add a refusal for each existing wave entry above `n` whose `status`
        is not `pending`, and one for each wave from `W1` to `W<n>` that no
        unit sits in (D11), as `waves.W<i>: has no unit`. If any refusal
        exists, print each distinct path and message once (D16), at the
        path D13 names, as `report()` prints
        findings (one `file: path: message` line each), and
        exit 1 with nothing written.
     4. If no pair moved a unit, exit 0 and write nothing (D17).
     5. Rebuild `waves` per D4: for `i` from 1 to `n`, the existing entry with
        id `W<i>` unchanged, else a new pending entry with empty times. Do not
        call `stamp()`.
     6. `write(file, doc)` — which validates and writes nothing on a finding.
   - Print nothing on success, as `set` does.
   - The header comment sentence near line 38 ("`set`, `append` and
     `remove` validate the result before they write") adds `rewave`, per D12.
2. **`scripts/src/plan-script.test.ts`** — add a `describe("rewave")` block
   after the `remove` block, with the existing helpers (`plan`, `parse`,
   `bytes`, `PLAN_NOW`). The cases, each one `it`:
   - a move to a new top wave: `waves` gains the new ids as pending with empty
     times, and the unit's `wave` is set;
   - a move that empties the top wave: its pending entry is dropped;
   - existing wave entries keep their `status`, `started` and `ended` (give
     W1 a green status with times first, through `set`, then move a unit
     between two other pending waves);
   - each D3 refusal, each exit 1 with the file bytes unchanged and the
     D13 path on stderr: a moved unit not `pending`; an old wave not
     `pending`; a new wave not `pending`; a dropped wave not `pending` (the
     only unit leaves a green top wave: two lines, per D16); two moves out of
     one green wave print one line (D16);
   - a validation failure — a move that puts a unit in the same wave as a
     unit its `depends_on` names — exit 1, the file bytes unchanged;
   - a pair that does not change the wave is accepted, even when the unit or
     its wave is not `pending`; when no pair moves a unit, the call exits 0
     and the file bytes do not change (D17);
   - the usage errors, each exit 2: no pair; a malformed pair (`U1=0`,
     `U1=x`, `U1`); a repeated unit id; a flag; the plan index file;
   - an unknown unit id, exit 2;
   - the D11 refusal: a move that leaves a middle wave with no unit, and a
     file that already has an empty middle wave, each exit 1, the file bytes
     unchanged;
   - the D15 refusal: `status.state` set to `RUNNING`, exit 1, the file
     bytes unchanged; the same move succeeds on `APPROVED`;
   - the 95octane case, from D9: a 12-unit change plan, all pending, at waves
     U1 1, U2 2, U3 3, U4 3, U5 3, U6 3, U7 3, U8 4, U9 5, U10 6, U11 7, U12 8
     (waves W1-W8, every unit above wave 1 with a waits reason), moved by one
     call, `rewave <file> U3=4 U4=5 U5=6 U6=7 U8=8 U9=9 U10=10 U11=11`; the
     call exits 0, `validate` prints valid, `waves` lists W1-W11, all
     pending, and no wave is empty. Make the folder in the test (an
     `index.json` and one placeholder unit file per unit, so the `file` rule
     holds), not as a new fixture.
3. **`plugins/vwf/skills/plan-management/SKILL.md`** — the verb list (near
   lines 78-91) gains `rewave`, with the one-line description above, and says
   it validates before it writes, as `set`, `append` and `remove` do. The
   "never does" list (near line 588) names `rewave` among the permitted
   writes: every change is one `set`, `append`, `remove` or `rewave`.
   State that `rewave` is a planner write, never an executor write (D7).
4. **`plugins/vwf/skills/plan-management/references/plan-index.md`** — the
   verb sentence near lines 17-21 names all six verbs (it omits `remove`
   today), with `rewave` noted as a folder-only verb that the plan index
   refuses, and rewords the "one field or one row at a time" claim near
   line 18 per D12.

## Verification

- `mise x -- pnpm vitest run scripts/src/plan-script.test.ts` — green, the new
  block included.
- `mise x -- pnpm exec tsc --noEmit -p scripts` — green.
- `mise x -- mise run p:plugins:check` — green (plan.mjs stays shebanged,
  executable and dependency-free).
- `mise x -- mise run code:format` — green.
- `node plugins/vwf/skills/plan-management/scripts/plan.mjs` with no argument
  prints a usage text that names `rewave`.

## Guardrails

- Touch nothing outside your owned paths. Never edit `lib/schema.mjs` or
  `lib/path.mjs`: the waves rule stays as it is.
- Never run `git checkout`, `git restore` or a formatter with `--fix` on a
  path you do not own.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.
- Add no import that is not `node:` or a relative path.
- `plugins/**/*.md` is not formatted by dprint: match the fold width of the
  file by hand.

## Commit

`feat: plan.mjs rewave moves units between waves in one validated write`
