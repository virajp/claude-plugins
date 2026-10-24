# U3 — execute: the new log calls

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/execute/scripts/log.mjs` (read only; U1
  rewrites it in the same wave, so rely on this plan's rulings, not on its
  current text); `plugins/vwf/skills/plan-management/SKILL.md` (read only).

## Ruling

> - D1: The root is $VWF_LOG_ROOT, else $HOME/Library/Caches/vwf (macOS
>   only). The file is <root>/<repo>/<plan folder basename>.jsonl.
>   VWF_LOG_ROOT stays the override that the tests use. Old files in
>   /tmp/vwf/ are left alone; nothing migrates them.
> - D3: plan-management claim sets run to {"worktree": ".worktrees/<name>",
>   "log": "~/Library/Caches/vwf/<repo>/<folder basename>.jsonl"} in the
>   folder's index.json, in the claim commit, with one plan.mjs set --json.
>   <name> is the plan's name (the branch and worktree name /vwf:execute
>   uses); <repo> is the repo name log.mjs derives. The ~ is literal: no home
>   path is committed, and VWF_LOG_ROOT does not change the committed value.
>   This reverses the rule 'the index row is the one edit the run makes in
>   the main checkout' (approved 2026-10-24).
> - D7: event and run keep exit 0 and print one fixed stderr line, 'log.mjs:
>   no active run in session <id>'. When the orchestrator sees that line
>   during a run, it runs log.mjs start --mode resume --folder <folder>,
>   which appends to the same file, then repeats the call. --mode accepts
>   fresh or resume only; another value exits 2 and writes nothing.
> - D8: log.mjs start reads <folder>/index.json from the --folder path it
>   gets and appends one plan.snapshot event {folder, units} right after
>   run.start, units being the units list of that file. On resume the
>   orchestrator passes the worktree copy of the folder, on a fresh run the
>   copy it reads.
> - D9: Strict for the four new types: a missing required key, a wrong type,
>   a wrong enum value or an unknown key exits non-zero and writes nothing.
>   plan.snapshot {folder: string, units: list}. row {exactly one of unit:
>   "U<n>" or stage: a stages key; wave: int >= 1, with unit; status: the
>   unit or stage status enum of schema.mjs; rounds: int >= 0, optional;
>   commit: string, optional; range: {from, to}, optional; detail: string,
>   optional}. gap {id: "G<n>", unit: string, stage: string, text: non-empty
>   string, state: open|closed}, all required. session.end {reason: string,
>   required; clear, resume, logout, prompt_input_exit, other; an unknown
>   value is kept}. row and gap are passed on stdin as JSON in a quoted
>   heredoc (<<'EOF'): log.mjs event row and log.mjs event gap read stdin.
>   The old event types keep their free --key value fields.
> - D11: Keep both. index.json keeps units[].status, commit, rounds, range,
>   gaps and overrides; it is committed and survives a lost machine, and
>   resume and the final report keep reading it. The log gets the same facts
>   as events and is the pane's source.
> - D12: The orchestrator, after each plan.mjs set of a unit's status,
>   commit, rounds or range, or of a stage, runs log.mjs event row with the
>   JSON on stdin. After each plan.mjs append to gaps and each set of a gap's
>   state, it runs log.mjs event gap. plan.mjs does not change.
> - D20: In the folder's own repo. Under a multi-repo topology the run edit
>   is a direct commit on the integration branch of the repo that holds the
>   folder, beside the base repo's claim commit (same message). worktree is
>   relative to that repo, <repo> is that repo's name, and archive passes
>   that repo's root to prune as --repo. log.mjs derives <repo> from the git
>   common dir of the repo that contains the --folder path (start) or the
>   --repo root (prune), not from the current directory.
> - D21: The real path. claim writes the repo-relative path of the worktree
>   that this run will use: <dir>/<branch>, where <dir> is the directory
>   git-workflow's own rule picks (.worktrees wins over worktrees, the
>   default is .worktrees). Under an all override that makes several plans
>   share one worktree, it is the path of the shared worktree. D3's
>   .worktrees/<name> is the common case of this rule.
> - D22: Every row carries status, required: the unit's or the stage's
>   status after the set. A unit row also carries wave, required. The
>   changed field (commit, rounds, range or detail) is added. A row with no
>   changed field beyond status is valid (a status change).
> - D23: Replace them. The strict stdin gap event replaces the old event gap
>   --key form; it gains two optional keys, class (GAP, UNRESOLVED,
>   contested, oscillation) and source (unit, wave-review, review-row, gate,
>   acceptance, ux), and is written for each recorded gap line as the old one
>   was. Its id is G<n> for an entry of index.json's gaps, or L<n> (a
>   separate sequence, one past the highest L id in the log) for a recorded
>   line that is not an index.json gap. This amends D9's id rule. row
>   replaces event unit; a unit's kind comes from plan.snapshot. summary's
>   GAPS and unit sections read the new events.
> - D24: log.mjs gives it. When a gap event comes with no id, log.mjs reads
>   the log, takes one past the highest L id in it (L1 when none), and
>   writes that id. Such a line has state open. A G<n> gap always comes with
>   its id from index.json. The orchestrator never reads the log for an id.
>   This amends D9: id is optional on the stdin gap event, and required on
>   the written line.
> - D28: U3. plugins/vwf/skills/execute/references/preflight.md joins U3's
>   owns; at both gaps appends (:68-73, a missing LSP answer and an
>   unavailable LSP) U3 adds the event gap call, or a one-line pointer to the
>   contract in SKILL.md, as in the other references.

## Edits

1. **`plugins/vwf/skills/execute/SKILL.md`**
   - The `plan.mjs` contract (`:102-130`): after each run-fact `set` or gap
     `append`, the matching `log.mjs event row` or `event gap` call, with one
     example of each in a quoted heredoc (`<<'EOF'`).
   - `:303-308`: the log path is `run.log` of the folder (D1, D3); `start`
     also writes `plan.snapshot` (D8); remove `/tmp/vwf`.
   - `:327-350`, `:331`, `:1228`: the claim now makes two edits in the main
     checkout, the row and the folder's `run` (D3).
   - The resume route and check (`:255-271`, `:628-642`): `start --mode
     resume --folder <the worktree copy>` appends to the same file.
   - A short rule, near the log calls: on the fixed "no active run" line
     during a run, run `start --mode resume` and repeat the call (D7).
   - The final report (`:927-964`, `:950`): `summary` reports each run and
     the totals.
2. **`plugins/vwf/skills/execute/references/action-log.md`** — location and
   lifetime (`:1-27`): one file for each plan at
   `~/Library/Caches/vwf/<repo>/<folder>.jsonl`, append-only, the run id in
   `run`, `VWF_LOG_ROOT` the override, the three-day `/tmp` note replaced by
   the prune rule. The calls (`:28-67`): `plan.snapshot`, `event row` and
   `event gap` on stdin with the D9 schemas, the no-active-run rule. New
   section "Clean-up": `prune` (D5's rule, called by `archive`), the marker
   sweep at `start`, `session.end` from the `SessionEnd` hook. "Reading it":
   runs and totals.
3. **`references/edit-unit.md`, `code-unit.md`, `review-unit.md`,
   `blocking.md`, `acceptance-and-ux.md`, `preflight.md`** (D28) — at each run-fact `set` and each
   gap `append` the facts section lists, add the matching `event row` or
   `event gap` call, or a one-line pointer to the contract in `SKILL.md`.
4. **`plugins/vwf/assets/execute-stages.md`** — where it says the journal is
   the only record of each round, add that the action log carries each
   round's `row` too.

## Verification

- `grep -rn '/tmp/vwf' plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/execute/references`
  prints nothing.
- `grep -c 'event row' plugins/vwf/skills/execute/SKILL.md` is at least 1,
  and so is `grep -c 'event gap'`.
- `mise x -- mise run p:plugins:check` is green.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the owned paths; `log.mjs` is U1's and
  `plan-management` is U2's.
- `plugins/**/*.md` is not formatted: keep the 80-column fold by hand. Keep
  each code span on one line.
- Delete with `rm`, never `git rm`.

## Commit

`docs: execute writes rows, gaps and a snapshot to the plan's action log`
