# Decision — one append-only action log per plan

**Date** 2026-10-25 · **Branch** `action-log-per-plan` · **Plan**
`docs/plans/2026-10-25-action-log-per-plan` · **vwf** MINOR · **site** PATCH

## What changed

`/vwf:execute` writes one append-only JSONL log for each plan, at
`~/Library/Caches/vwf/<repo>/<plan folder basename>.jsonl`, a place macOS does
not clear. Before, it wrote one file per run under `/tmp/vwf/`, which macOS
removes after three days. No step edits or removes a line of a log; each run,
fresh or resumed, appends a new `run.start`, and every line carries its run id.
A fifth action-log hook, `SessionEnd`, closes a session. `log.mjs prune`, called
by `plan-management archive`, deletes old logs of archived plans.

This is plan B of a chain: A (`2026-10-24-plan-json-format`) → B (this) → C (the
pane replays the log).

The user's rule: "Industry standard is to never edit a log file, always append.
If a plan was parked at 12:30pm and then resumed at 2:45pm, it will have a
2:45pm entry which will superseed the 12:30pm entry."

## Reversal

**D3, approved by the user on 2026-10-24.** `plan-management claim` writes the
folder's `run` — `worktree` set to `<dir>/<branch>`, and `log` to
`~/Library/Caches/vwf/<repo>/<folder basename>.jsonl` — into the folder's
`index.json` in the claim commit. This reverses the rule "the index row is the
one edit the run makes in the main checkout". The reason: a reader (the pane)
finds a running plan's worktree and log without searching `git worktree list`
and the log root.

## The decisions, in short

1. **D1 Location.** `$VWF_LOG_ROOT`, else `$HOME/Library/Caches/vwf` (macOS
   only); file `<root>/<repo>/<folder basename>.jsonl`. Old `/tmp/vwf/` files
   are left alone.
2. **D2 One file per plan.** Append-only; each line's `run` is
   `<YYYYMMDD-HHMMSS>-<session8>`; the marker holds the log path and the run id.
3. **D3 Run paths in the folder.** Above. The `~` is literal; `VWF_LOG_ROOT`
   does not change the committed value.
4. **D4 `summary`.** Reports each run (one `run.start` to the next, the pause
   not counted) and the totals.
5. **D5 `prune`.** `log.mjs prune --repo <root> --days 30 --keep <basename>`
   deletes a log only when its folder is archived and the log is more than 30
   days old, never the `--keep` log.
6. **D6 Dead markers.** `SessionEnd` appends `session.end {reason}` and deletes
   the session's marker; `start` sweeps other sessions' markers idle for 24
   hours and the `nosession` marker; a marker that vanishes mid-read is "no
   run".
7. **D7 No active run.** `event` and `run` exit 0 with one fixed stderr line;
   the orchestrator then runs `start --mode resume` and repeats. `--mode` is
   `fresh` or `resume`, else exit 2.
8. **D8 `plan.snapshot`.** `start` appends `{folder, units}` from
   `<folder>/index.json` right after `run.start`.
9. **D9 Strict schemas** for `plan.snapshot`, `row`, `gap` and `session.end`;
   `row` and `gap` come as JSON on stdin in a quoted heredoc.
10. **D10 Enums.** `log.mjs` imports the status enums from `schema.mjs`.
11. **D11 Both records.** `index.json` keeps the run fields; the log gets the
    same facts as events and is the pane's source.
12. **D12 Row events.** The orchestrator runs `event row` after each run-fact
    `plan.mjs set`, and `event gap` after each gap append or state set;
    `plan.mjs` does not change.
13. **D13 Unclaim** sets `run` to `{}` in its own commit; the log stays.
14. **D14 Validate.** `run` is `{}` or exactly `{worktree, log}`, both
    non-empty.
15. **D15 `SessionEnd`** is registered to the same `action-log.sh`, timeout 10.
16. **D16 Review.** One review unit, security half only (edit units).
17. **D17 Waves.** U1 waits for U2's enum exports.
18. **D18** The plan gate line `mise x -- mise run code:precommit --all` needs
    no `--` separator.
19. **D19** `prune` also matches an archived `<basename>-<n>`.
20. **D20 Member repos.** The run paths go into the folder's own repo; `<repo>`
    comes from the git common dir of the repo holding the folder.
21. **D21** `run.worktree` is the real path git-workflow's rule picks, the
    shared worktree under an `all` override.
22. **D22** Every row carries `status`; a unit row also `wave`.
23. **D23** The stdin `gap` replaces the old `event gap --key` form (optional
    `class`, `source`; id `G<n>` or `L<n>`); `row` replaces `event unit`.
24. **D24** `log.mjs` assigns an `L<n>` id when none is given, state `open`.
25. **D25** `p:site:check` joins the plan gate; the heading "The action log" of
    the vwf manual page stays, for the `#the-action-log` anchor.
26. **D26** The hook writes `session.end` as exactly `{reason}`, `other` when
    absent, and imports no schema.
27. **D27** `prune` runs only after an archive moves a folder; `/vwf:execute`
    never calls it.
28. **D28** U3 adds the `event gap` calls at `preflight.md`'s gap appends.
29. **D29** `archive` passes the root of the checkout it runs in to `prune`.

## Rulings during the run (2026-10-25)

- **D30 A Bash call with no description** is logged by its program name alone —
  the first word that is not a `NAME=value` assignment — never its arguments, so
  no inline secret reaches the log. Rejected: a denylist that redacts
  secret-looking values.
- **D31 A review row's late re-run** is logged by its `review.round` events
  only; the `row` event keeps the main loop range, as `index.json` holds it.
- **D32 Convergence guard at U4 round 4.** Continue: each leading `NAME=value`
  word must match `^[A-Za-z_]\w*=[\w./:@+,%=-]*$`, the command is split on
  space, tab and newline only, and anything else logs `(command)`. Rejected:
  pausing the run; always logging `(command)`.

## Rejected

One file per run (`/tmp/vwf/`); no run paths in the folder; a non-zero exit on
no active run; a separate `SessionEnd` script; a copy of the status enums; loose
event schemas; no clean-up.
