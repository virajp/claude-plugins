# U5 — `/vwf:execute` reads a folder, claims a row, lands per consent

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `plugins/vwf/skills/execute/**`,
  `plugins/vwf/agents/execute-coder.md`,
  `plugins/vwf/agents/execute-code-reviewer.md`,
  `plugins/vwf/agents/execute-security-reviewer.md`,
  `plugins/vwf/agents/execute-acceptance-verifier.md`,
  `plugins/vwf/agents/execute-ux-reviewer.md`,
  `plugins/vwf/agents/plan-surveyor.md`
- **Model:** opus
- **Read first:** `plugins/vwf/skills/execute/SKILL.md`,
  `references/preflight.md`, `references/acceptance-and-ux.md`; then
  `plugins/vwf/assets/plan-index.md`,
  `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/execute-stages.md` (as U1–U3 left them); then the six
  agent files.
- **Lazy-load:** `plugins/vwf/skills/change-execute/SKILL.md` §§1, 6, 7, 8 and
  `references/blocking.md` — the claim, the report from the run log, the landing
  per consent, the after-landing asks, the resume (read only; U7 edits it
  concurrently).

## Ruling

Decision 3: "One index table … `Kind` is `cycle` for `type: vwf-plan` …
`Target repo` is the member holding the code for a cycle plan."

Decision 4: "Both executors take `<folder>` or `next`; `next` reads the one
table, filtered to its own `Kind` … Both claim the row `RUNNING` with a pushed
commit in the main checkout **before** the worktree is cut."

Decision 5: "A cycle plan's `requires:` entry is satisfied when every `covers:`
doc of the required plan reads `implementation: complete` in the base repo's
blueprint — the existing test."

Decision 6: "No compatibility path. `execute` reads folders only."

Decision 7: "`execute` runs a cycle plan's units **serially in dependency
order** — one unit = one step through the existing code → review + security
pipeline. Waves are written by `/vwf:plan` and honoured as ordering only."

Decision 8: "`execute` lands per the folder's **Consent** block: the final
report is rendered from the run log; when consent says yes and every gate is
green and no gap is open, it merges and pushes without a further prompt; every
after-landing step asks. A red gate, an open blocking gap or `no` stops at the
report as before."

Decision 9: "`execute` Setup 1 halts on `blocking` only and reads the row; it
never asks."

Decision 12: "`execute` appends one row per node as it returns and mirrors it to
the mempalace journal (room `runs`); the folder is what the final report renders
and what a resume reads, the journal a copy that may be down."

Decision 14: "The acceptance verifier and `archive` read [Acceptance criteria
(from blueprint), Gaps surfaced during execution] by heading."

Decision 17: "`execute` gets `disable-model-invocation: true` — launched by a
person in a fresh session, like `change-execute`."

Decision 16: "Their prompts say *unit* where they said *plan step*; the coder is
dispatched one unit's file plus the index's rulings, not the whole plan. No
agent's tools or return block changes."

## Edits

1. **`SKILL.md` frontmatter** — `description`: an approved cycle-plan
   **folder**, run in a **fresh session**, `<folder>` or `next`; keep the
   pipeline sentence, "autonomous", the engines sentence; replace "one final
   human gate, which reviews the run and approves the merge" with "lands per the
   plan's recorded consent and stops once before every after-landing step".
   `argument-hint: "<plan-folder, its index.md, or next>"`. Set
   `disable-model-invocation: true` — it is now launched by a person in a fresh
   session, like `change-execute` (the `/vwf:plan` in-session hand-off that
   needed model invocation is gone).
2. **Halt Conditions → §1 Resolve and refuse early**, mirroring `change-execute`
   §1: `next` per `assets/plan-index.md`'s procedure filtered to `Kind` `cycle`
   — print the pick and every other candidate with why not; a named folder
   resolves to `<folder>/index.md`; read the frontmatter (`covers:`,
   `requires:`, `backlog:`) and the Status, Consent, Units, Run log blocks; read
   its row at the integration branch's tip. Refuse: `DRAFT`; `COMPLETE`; a
   `requires:` entry unsatisfied **by the cycle test** (every `covers:` doc of
   the required plan reads `implementation: complete` in the base — keep today's
   message and the "no override flag, heal via `/vwf:plan`" paragraph) or, for a
   `change` entry, by the row test; an `APPROVED` folder with no row; an
   `APPROVED` folder with a `RUNNING` row held elsewhere; a folder not on the
   integration branch (refused, never swept). `BLOCKED`/`RUNNING` → a resume
   from the folder's Run log. Keep "Finding the plan" (the index, not a walk)
   and "Halt if the target repo is absent". **Claim the row** exactly as
   `change-execute` does — the procedure in `assets/plan-index.md`, the one edit
   in the main checkout, before the worktree — then set the folder's Status
   `RUNNING` with the timestamp and worktree path.
3. **Format Check** — unchanged.
4. **Doc Paths** — `Plan` row: `<target-repo>/docs/plans/<date>-<HHMM>-<slice>/`
   (`index.md` + unit files); `Plan index` row: "its one table". Add
   `Plan template | ${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`.
5. **Autonomous Rules** — "Implement the whole plan": every **unit** in the
   Units table; "Dependencies first": the order is the Units table's Depends-on
   and Wave, serially — one unit at a time, wave by wave, never two coders at
   once in this release (say plainly that waves are ordering only here; the
   merged executor decides concurrency); keep the cycle/ambiguity fallback. "One
   plan, one worktree" unchanged. Keep every gate rule (security, breaking-api,
   review cap, convergence guard, gaps, backlog, git-workflow, memory) verbatim
   — only the word *step* becomes *unit* where it names a plan element (a
   pipeline "stage" stays a stage).
6. **Pause Conditions** — unchanged, except the resume command for every non-cap
   pause is `/vwf:execute <folder>` and reads the folder's Run log first, the
   journal second.
7. **Recall — Resume check**: the folder's Run log is what a resumed run reads;
   the journal is consulted when the folder is unreachable; the tie-break
   (worktree over any record) stays.
8. **Setup step 1 Preflight** — no longer "interactive". Halt on `blocking`
   exactly as written. For an LSP finding: read the plan's Consent
   `LSP
   <language>` row — `installed` and still missing → halt with the
   remedy (the plan was approved on a promise that did not hold);
   `proceed without` → log and continue; no row for a flagged language → treat
   as `proceed
   without`, log a `GAP:` line into *Gaps surfaced during
   execution*. Rewrite `references/preflight.md` to that rule; it asks nothing.
9. **Setup steps 2–4** — unchanged, except step 4 opens the **Run log** in the
   folder (a `pending` row per unit is not written — rows are appended as nodes
   return) and mirrors the ordered sequence to the journal.
10. **Execute loop** — per **unit**: recall; **code** — dispatch the coder with
    the unit's `NN-<unit>.md` (its ruling, Test first line, Owns, Verification)
    plus the index's Facts and Assumed decisions and the shared-file rule, not
    the whole plan; engines then reviewers unchanged; findings loop unchanged;
    gaps → the folder's *Gaps surfaced during execution* (same heading, now in
    `index.md`) and room `gaps`; commit via git-workflow; **journal** → append
    one Run log row per node as it returns
    (`Wave | Unit | Model | Round | Outcome | Detail | Commit`) and mirror it;
    commit the folder edit with the unit's commit (the folder is edited in the
    worktree, like `change-execute`). Fill the Units table's Status and Commit
    cells as `change-execute` does.
11. **Acceptance & UX** — unchanged; the acceptance skip reads the folder's
    *Acceptance criteria (from blueprint)* section.
12. **Reconcile** — unchanged (stamps, registry, environment, harness,
    docs-sync, persist); mark the Run log complete and mirror.
13. **Final gate & merge → §Final report and landing**, mirroring
    `change-execute` §§6–8: render the report **from the folder's Run log**
    (fall back to the journal, marked *reconstructed*, only when the folder
    cannot be read) — the same bullets as today (nodes by unit, coverage,
    acceptance, ux, downgrades, stamps written, the gap list with cap/guard
    marks, the worktree path). Then **land per Consent**: when the row reads
    `yes`, every wave-gate line is green, every unit is `green` or a journaled
    skip, and the gap list holds no blocking gap → `/vwf:backlog done <ids>`,
    then hand to `vwf:git-workflow` for merge and push **with the declared
    preference that consent was recorded in the plan — do not ask again**; set
    the folder `COMPLETE`, apply the completion row + sweep per
    `assets/plan-index.md` in the main checkout; move the folder to
    `docs/plans/archived/` is **not** done here — tell the user to run
    `/vwf:archive` as today. When any condition fails, or consent reads `no` →
    stop at the report with what failed and the exact resume command; the
    worktree stays committed. Keep **Fix first** and **Reject** as the two
    things a user can say at that stop. Then **after landing**: walk the After
    landing table, stop once and ask before each step. **Gap reconciliation**
    and **Chain forward** unchanged, the latter scanning the one table for
    `cycle` rows whose `Requires` names this folder.
14. **Agents** — `execute-coder.md:24,80,111`: "the unit file and the index's
    rulings" instead of "the approved plan"; return block one line per **unit**
    (the block's shape unchanged).
    `execute-code-reviewer.md:36,43,
    130-131`: "the unit" / "every unit";
    `SPEC COMPLIANCE` compares against the unit's edits.
    `execute-security-reviewer.md:73-77,92`: wording only.
    `execute-acceptance-verifier.md:25-27`: reads *Acceptance criteria (from
    blueprint)* in the folder's `index.md`. `execute-ux-reviewer.md:24`: "the
    plan's screen units". `plan-surveyor.md`: any "plan doc" → "plan folder";
    its Inputs and return lines unchanged. Tools and frontmatter of every agent
    untouched.
15. Fold by hand — `plugins/**/*.md` is not dprint-formatted.

## Verification

- `grep -n 'docs/plans/<plan>.md\|<date>-<time>\|cycle-plan table\|interactive — the user is still present\|approves the merge\|flat' plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/execute/references/*.md`
  prints nothing.
- `grep -n 'plan-index.md\|plan-folder.md' plugins/vwf/skills/execute/SKILL.md`
  — both cited.
- `grep -n 'Kind' plugins/vwf/skills/execute/SKILL.md` hits in §1 (`next`
  filters to `cycle`).
- `grep -n 'RUNNING' plugins/vwf/skills/execute/SKILL.md` hits in the claim.
- `grep -n 'Run log' plugins/vwf/skills/execute/SKILL.md` ≥ 4 hits (setup, loop,
  resume, report).
- `grep -n 'Consent' plugins/vwf/skills/execute/SKILL.md` hits in preflight (LSP
  row) and in the landing.
- `grep -n 'disable-model-invocation: true' plugins/vwf/skills/execute/SKILL.md`
  hits.
- `grep -n 'plan step' plugins/vwf/agents/execute-*.md plugins/vwf/agents/plan-surveyor.md`
  prints nothing.
- `grep -n 'Acceptance criteria (from blueprint)' plugins/vwf/agents/execute-acceptance-verifier.md plugins/vwf/skills/execute/SKILL.md`
  — both.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch
  `plugins/vwf/skills/{plan,change-plan,change-execute,archive,
  backlog}/**`
  or any asset.
- Do not change any agent's `tools:` line or its return block shape.
- No escaped backtick inside a code span; no code span beginning with `##`.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`feat: execute — runs a plan folder, claims its row, lands per consent` —
written by the orchestrator after the wave gate. Type `feat`; no scope.
