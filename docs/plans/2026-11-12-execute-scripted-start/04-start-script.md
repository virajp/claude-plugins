# U4 — The execute start script

- **Read first:** `plugins/vwf/skills/execute/scripts/log.mjs` top to bottom,
  `plugins/vwf/skills/execute/workflows/folder.md` (read only; U2 owns it, and
  its pre-change text is the refusal list to implement),
  `plugins/vwf/skills/execute/SKILL.md` *The format test*.
- **Lazy-load:** `plugins/vwf/skills/plan-management/scripts/lib/queue.mjs`
  (U1), `plugins/vwf/skills/doctor/scripts/lib/index.mjs` (U3),
  `scripts/src/execute-log.test.ts`.

## Ruling

> D15: "node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/start.mjs
> <folder|next>, run from any directory inside the base repo or a member; it
> resolves the base per membership.md. It prints one JSON object on stdout and
> nothing else there; progress and warnings go to stderr. Keys: result (ready,
> refused, blocked, nothing), mode (fresh, resume or null), folder, kind,
> priority, has_code_unit, has_covers, projects, findings (each {rule,
> severity, project, subject, message, remedy}), lsp (each {language, project,
> state: present, missing or unavailable}), open_questions (resume only: the
> open QUESTION gap ids and the question events with no answer), claim (the
> D17 claim result, {claimed: true, commit} or {claimed: false, reason}, or
> null), message (one line for the user). Exit 0
> on ready, 1 on refused, blocked or nothing, 2 on a usage or internal error.
> The order: format test; for next, the pick; Resolve and the fresh-run
> refusals; log start (fresh or resume); phase checks; on any blocking row,
> result blocked and no claim; phase claim when the mode is fresh or the
> resume's row reads APPROVED. On a lost claim under next: log end with outcome
> claim-lost, then re-pick; under a named folder: result refused."

> D2: "one start script. It also does the format test and the next pick. The
> session question and the resume questions (open QUESTION gaps and unanswered
> question events) stay with the model, because they ask the user."

> D3: "execute/scripts/start.mjs imports both, adds the format test, the log
> start and the phase markers, and prints one JSON result."

> D5: "The run's gap list no longer carries doctor rows." (start.mjs returns
> only the blocking rows a run acts on; it writes no gap.)

> D22 (overrides the LSP parts of D15): "Until then checks.mjs and start.mjs
> check no LSP. The lsp key is dropped from the D15 and D16 contracts". So the
> result has no `lsp` key.

> D8: "From the units' owns: match each owns path to the registry project
> whose path is the longest prefix of it. No match, or no registry, gives the
> base repo's own scope."

> D18: "The worktree is the evidence. When the row at the tip reads RUNNING,
> read run.worktree from the main checkout copy. If that worktree exists on
> this machine, read status, gaps and the log from the worktree copy of the
> folder: mode resume, and log start uses --folder <the worktree copy>. If it
> does not exist, result refused with the folder.md message: another session
> is running it; re-run once it lands, or make the plan-management unclaim
> request when that run is gone."

> D20: "start.mjs and plan.mjs claim take --worktree <repo-relative path>.
> Without it, the default <dir>/<plan name> applies." (start.mjs passes the
> flag through to claim.)

> D21: "start.mjs closes it. On blocked: event stop, then end --outcome
> blocked. On a lost claim (a named folder, or before a re-pick under next):
> event stop, then end --outcome claim-lost. A refusal before the log start
> writes nothing to the log."

> D23: "Prefix each owns path with the member path from members: (relative to
> the base), then match against the registry paths. A folder in the base uses
> its owns as they are."

> D24: "Use ONLY fake data. Every fixture of U1, U3 and U4 holds invented
> names, paths, hosts and URLs, shaped on the schemas; no file is copied from
> a real repo."

> D25: "Stop with refused, naming the picked folder and the refusal, the same
> as a named folder. Only a lost claim re-picks (D15)."

> D26: "start.mjs spawns node log.mjs start|event|end ... as a child process
> and captures its stdout and stderr; a non-zero exit is a warning on
> start.mjs stderr. log.mjs does not change, and U4 does not own it."

> D27: "Every row and folder value (status, units, run.worktree, requires)
> comes from the origin/develop tip through git show. The local working-copy
> folder is used only as the --folder of a fresh log start; when it is absent
> or its index.json differs from the tip, result refused: check out develop
> and pull, then re-run. A resume log start uses the worktree copy (D18).
> start.mjs switches no branch outside the claim."

> D30: "Not a lost claim: the row is this session's and RUNNING. Result
> refused under next and under a named folder alike, with the
> plan-management unclaim <folder> request in the message; no re-pick. Log:
> event stop, then end --outcome claim-failed."

> D32: "start.mjs returns refused under next and a named folder alike, with
> no re-pick; its log closes with event stop and end --outcome claim-failed."
> (A claim failure other than a same-row conflict.)

> D33: "The claim already landed: return {claimed: true, commit, warning}.
> [...] The warning, and start.mjs message, name the stash (vwf plan queue
> <folder>) and say to apply it by hand. The run continues in its own
> worktree." (result stays ready.)

> D34 (U4 parts): "G2: the row and run.worktree come from the origin/develop
> tip (D27); on a resume, status, gaps and units come from the worktree copy
> (D18). G3: an APPROVED row is always a fresh run; the tip copy of a folder
> reads APPROVED after an unclaim. G4: a member folder is read from the member
> origin/develop tip, the fresh log start uses the member working copy, an
> uncloned member is the absent-target-repo refusal. [...] G7: U1 and U4 add
> the D20 --worktree flag to edits and tests."

> D37 (U4 parts): "G2: the claim result has a kind field: {claimed: false,
> kind: lost|member-failed|failed, reason}; start.mjs reads kind, never
> reason. [...] G5: the D8 match is by path segment; a project at the repo
> root (.) matches every path as the shortest prefix. G6: [...] [] means
> repo-level checks only; start.mjs always passes the D8 list. G7: start.mjs
> refuses a resume when another session marker under active/ names this plan
> log. G8: the D27 comparison parses both copies as JSON and compares values."

> D10: "start.mjs writes phase.start and phase.end for checks and for claim
> itself, each at its true boundary."

## Edits

1. **`execute/scripts/log.mjs`** — no change; it is not in `owns` (D26).
2. **`execute/scripts/start.mjs`** (new, `#!/usr/bin/env node`, executable:
   `chmod +x`) — implement D15 in this order:
   - **Format test:** old format when the base's `docs/plans/index.md` exists,
     or a named folder holds `index.md` and no `index.json`: `refused` with the
     migration message of `SKILL.md`.
   - **Pick** (`next`): `pick` from `lib/queue.mjs`; nothing → `nothing`.
   - **Resolve:** `plan.mjs validate` logic (import `lib/schema.mjs`); the row
     at the tip of `origin/develop`; `resolve`; then every refusal of
     `folder.md` *Act on the status and the row*, *The fresh-run refusals*,
     *The folder is already committed* and the absent-target-repo halt, each
     with the same message text. `BLOCKED` or `RUNNING` status → `mode`
     `resume`, with its own refusal (a non-green `code` unit no review row
     covers) and `open_questions` read from the folder's `gaps` and the action
     log.
   - **Log start:** spawn `node log.mjs start --folder <f> --mode <m>` (D26).
     Every log call below is the same kind of child process.
   - **Checks:** `phase.start --phase checks`; `runChecks` with the D8
     projects; `phase.end --phase checks`. Any `blocking` row → `blocked`, no
     claim.
   - **Claim:** `phase.start --phase claim`; `claim` from `lib/queue.mjs`;
     `phase.end --phase claim`. Skip when the resume's row already reads
     `RUNNING`.
3. **`scripts/src/execute-start.test.ts`** (new) and
   **`scripts/src/fixtures/execute-start/**`** — temp base repos with a bare
   `origin`, `$VWF_LOG_ROOT` and `CLAUDE_CODE_SESSION_ID` set. Cases: each
   refusal; `nothing`; a fresh `ready` (row `RUNNING` pushed, `run` set, log
   holds `run.start`, then `phase.start`/`phase.end` for `checks` and for
   `claim`, in that order); `blocked` with no claim; a resume (no claim,
   `open_questions` filled); a lost claim under `next` re-picks. Stub `mise`
   on a temp `PATH`.

## Verification

- `mise x -- pnpm vitest run scripts/src/execute-start.test.ts scripts/src/execute-log.test.ts`
- `mise x -- pnpm exec tsc --noEmit -p scripts`
- `mise x -- mise run p:plugins:check`

## Guardrails

- Touch nothing outside `owns`. Do not copy U1's or U3's logic; import it.
- A log call never stops the run: a failed log write is a warning on stderr.
- Never `--force`, `reset --hard` or `--no-verify`.
- Write files with the Write tool, never `cat > file`. The Bash tool runs fish.

## Commit

`feat: execute start script — format test, pick, resolve, checks and claim`
