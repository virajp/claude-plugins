# U1 — The log script and the hooks

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/plan-management/scripts/lib/schema.mjs`
  (read only, for the status enums); `scripts/src/check.ts:279-317` (rule 16).

## Ruling

> - D1: The root is $VWF_LOG_ROOT, else $HOME/Library/Caches/vwf (macOS
>   only). The file is <root>/<repo>/<plan folder basename>.jsonl.
>   VWF_LOG_ROOT stays the override that the tests use. Old files in
>   /tmp/vwf/ are left alone; nothing migrates them.
> - D2: One append-only file for each plan. No step edits or removes a line
>   of a log. Each start (fresh or resume) appends a new run.start. Each line
>   carries a run id <YYYYMMDD-HHMMSS>-<session8> (local time, the existing
>   stamp()) in its run field, in log.mjs and in action-log.mjs. The marker
>   holds the log path and the run id.
> - D4: summary reports each run and the totals. A run is the part of the
>   file from one run.start to the next. The pause, from a run's last line to
>   the next run.start, is not counted.
> - D5: A new verb log.mjs prune --repo <root> --days 30 --keep <folder
>   basename>. It deletes a log only when its plan folder is under
>   <root>/docs/plans/archived/ and the log's mtime is more than 30 days old.
>   It never deletes the log named by --keep. Every plan-management archive
>   calls it after the move, with --keep set to the folder it archives. A
>   live plan paused for 30 days keeps its log. prune touches only <log
>   root>/<repo>/*.jsonl.
> - D6: (1) A SessionEnd hook appends session.end {reason} to the session's
>   log, then deletes the session's own marker. (2) log.mjs start sweeps the
>   markers of other sessions whose log has not changed for 24 hours, and
>   always the nosession marker; it never touches a log. (3) log.mjs and
>   action-log.mjs treat a marker that disappears during the read as 'no
>   run', so a gate's exit code is never lost (no exists-then-read: read and
>   catch ENOENT).
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
> - D10: log.mjs imports them from
>   plugins/vwf/skills/plan-management/scripts/lib/schema.mjs with a relative
>   path (rule 16 permits it). U2 exports the two enums as named exports if
>   they are not exported yet, and does not change their values.
> - D15: hooks.json registers SessionEnd to the same action-log.sh, with
>   timeout 10 (the runtime gives a plugin hook 1.5 s). action-log.sh keeps
>   its fast exit when active/ is empty. action-log.mjs handles SessionEnd:
>   it reads the session's marker, appends session.end {reason}, then deletes
>   the marker. The payload has session_id and reason.
> - D17: No. U1 waits for U2: U1 sits in wave 2 and depends on U2, because
>   it imports the named status-enum exports that U2 adds to schema.mjs. The
>   review is wave 3, docs wave 4, gates wave 5.
> - D19: prune treats a log <basename>.jsonl as archived when
>   <root>/docs/plans/archived/<basename> or
>   <root>/docs/plans/archived/<basename>-<n> (n a decimal number, the
>   archive name-clash suffix) is a directory. The other D5 conditions stay.
> - D20: In the folder's own repo. Under a multi-repo topology the run edit
>   is a direct commit on the integration branch of the repo that holds the
>   folder, beside the base repo's claim commit (same message). worktree is
>   relative to that repo, <repo> is that repo's name, and archive passes
>   that repo's root to prune as --repo. log.mjs derives <repo> from the git
>   common dir of the repo that contains the --folder path (start) or the
>   --repo root (prune), not from the current directory.
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
> - D26: A fixed shape in the hook. action-log.mjs writes exactly {reason}
>   beside the fields append adds, with reason the payload's reason as a
>   string, or other when it is absent. The hook imports no schema and stays
>   fast. A vitest case asserts the written line against log.mjs's
>   session.end schema.
> - D29: The root of the checkout where archive runs: the run's worktree at
>   landing, the main checkout for a later archive by hand. Both give the
>   same <repo> name, because log.mjs derives it from the git common dir
>   (D20), and both hold docs/plans/archived/ as of that moment; the folder
>   that this archive moved is --keep anyway.

## Edits

1. **`plugins/vwf/skills/execute/scripts/log.mjs`**
   - `ROOT` (`:53`): `$VWF_LOG_ROOT`, else `join(homedir(), "Library",
     "Caches", "vwf")`. Update the header comment (`:9`, `:19-23`) to the new
     layout and verbs.
   - `start`: the file is `<ROOT>/<repo>/<basename(folder)>.jsonl`; create
     the directory; never truncate an existing file (append only). Make the
     run id `<stamp()>-<SESSION.slice(0, 8)>`. Write the marker as two lines,
     the log path then the run id. Validate `--mode` (`fresh` or `resume`,
     default `fresh`; another value exits 2 before any write). Before the
     write, sweep `<ROOT>/active/`: remove the `nosession` marker, and remove
     each other session's marker whose log file (its first line) has an
     mtime more than 24 hours old or is missing; never remove or edit a log.
     Append `run.start` (the existing fields), then `plan.snapshot`
     `{folder, units}` read from `<folder>/index.json` with `JSON.parse`; if
     that file is absent or unreadable, exit 2 and write nothing.
   - `active()`: read the marker in one `readFileSync` inside `try`; an
     `ENOENT` (or an empty marker) is "no run". Return the path and the run
     id. Remove every exists-then-read.
   - `append`: write the `run` field from the marker's run id, not from the
     file name.
   - The "no active run" warning of `event`, `run` and `end`: one fixed text,
     `log.mjs: no active run in session <id>`, on stderr, exit 0 (`run` still
     exits with the command's code).
   - `event row`, `event gap`: read one JSON object from stdin; validate it
     against the D9 schema; on a bad object print the finding to stderr, exit
     1 and write nothing. `plan.snapshot` and `session.end` use the same
     schema check where `log.mjs` writes them. Import the unit and stage
     status enums from `../../plan-management/scripts/lib/schema.mjs` (D10),
     by the names U2 exported (D17: U2 landed in wave 1). Do not edit it.
     Apply D22 to `row` (`status` always required, `wave` required on a unit
     row) and D23 to `gap` (optional `class` and `source` with their enums;
     `id` `G<n>` or `L<n>`). Remove the old `event gap --key …` form and the
     old `event unit` form: `event gap` and `event unit` with `--key` pairs
     exit 2 and write nothing. `summary`'s GAPS section and unit rows read
     the new `gap` and `row` events, and a unit's kind from `plan.snapshot`.
   - `summary <file>`: split the file into runs at each `run.start`; report
     each run (its run id, mode, start, its own span from its `run.start` to
     its last line, and the existing sections for that run), then the totals
     over all runs, with the pauses not counted. Keep it a text report.
   - New verb `prune --repo <root> --days <n> --keep <basename>`: for each
     `<ROOT>/<repo name>/*.jsonl`, where `<repo name>` is derived from
     `<root>` the same way `start` derives it, delete the file only when
     `<root>/docs/plans/archived/<basename>` or `…/<basename>-<n>` is a
     directory (D19), the basename is
     not `--keep`, and the mtime is more than `<n>` days old. Print each
     deleted path. Delete nothing else. A missing `--repo` or `--days` exits
     2. Add it to the verb map and the usage text.
2. **`plugins/vwf/hooks/action-log.sh`** — the root default becomes
   `$HOME/Library/Caches/vwf` (`:18`). Keep the fast exit.
3. **`plugins/vwf/hooks/action-log.mjs`** — the root as in edit 1 (`:8`,
   `:33`); read the marker in one `try`, `ENOENT` is "no run"; take the log
   path and the run id from the marker and write `run` from the run id. Add a
   `SessionEnd` branch: append `session.end {reason}` (the payload's
   `reason`, kept as it is), then delete this session's marker. Keep every
   other branch unchanged.
4. **`plugins/vwf/hooks/hooks.json`** — add a `SessionEnd` entry that runs
   `action-log.sh` with timeout 10, in the same shape as the four action-log
   entries.
5. **`scripts/src/execute-log.test.ts`** — update the cases to the new file
   layout and marker; add cases for: a second `start` appends to the same
   file with a new run id; `--mode bad` exits 2; `plan.snapshot` after
   `run.start`; `event row` and `event gap` from stdin, a valid one written
   and an invalid one (unknown key, wrong enum, both `unit` and `stage`)
   exiting non-zero with the file unchanged; a `row` with no `status` and a
   unit `row` with no `wave` refused (D22); a `gap` with `class` and
   `source` written, a bad `class` refused, an `L<n>` id written (D23); the
   old `event gap --class …` and `event unit --status …` forms exit 2 (D23); a marker removed before the read
   counts as no run and `run` keeps the command's exit code; the sweep
   removes `nosession` and a stale marker and leaves a fresh one and every
   log; `prune` deletes an old archived log, keeps a fresh one, a live
   plan's old one and the `--keep` one; a `SessionEnd` payload appends
   `session.end` and removes the marker; `summary` over two runs reports two
   runs and totals without the pause.

## Verification

- `mise x -- pnpm vitest run scripts/src/execute-log.test.ts` is green.
- `mise x -- mise run p:plugins:check` is green (rule 16 for `log.mjs`, the
  hook check for `hooks.json`).
- `mise x -- mise run code:format` is green.
- `grep -rn '/tmp/vwf' plugins/vwf/skills/execute/scripts plugins/vwf/hooks`
  prints nothing.

## Guardrails

- Touch nothing outside the owned paths. Do not edit `schema.mjs`: U2 owns it.
- `log.mjs` and the hooks use `node:` builtins only; no new dependency.
- Never truncate, rewrite or delete a log line; `prune` deletes whole files
  only, and only under its rule.
- The SessionEnd branch must finish fast: no network, no git call.
- Delete with `rm`, never `git rm`.
- Do not run `git checkout`, `git restore` or a formatter `--fix` outside
  the owned paths.

## Commit

`feat: one append-only action log per plan, with prune and session end`
