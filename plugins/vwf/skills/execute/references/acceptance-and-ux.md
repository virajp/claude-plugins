# Acceptance & UX (once, after all unit waves)

`execute-stages.md` below means `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`.

With `covers`, run the `acceptance` and `ux` stages back to back, when every unit wave is
done (or skipped per the gap rules). Their contracts are in `execute-stages.md`.

Skip each per its condition, with its `stages` entry set `skipped` and its `why`, never
silent:

- `acceptance` when the folder's `acceptance` list is `[]`: no flow touched.
- `ux` when the plan changes no screens in a UI project.

On anything short of a clean pass, follow the autonomous policy below. It holds the
loop-to-`code` rule and its 4-round cap under the convergence guard, the `n/a` cases, and
the spec-gap routing. Two rules hold whatever it says:

- A residual is **never silently dropped**.
- Infrastructure is **never scaffolded beyond the plan's own units**.

Every loop-back here lands after the last `review` row. Each fix re-runs the row covering its
unit over the fix delta before the stages re-verify — *Late loop-backs re-run the last row* in
[review-unit.md](review-unit.md).

Without `covers`, skip both stages. Set `stages.acceptance`, `stages.ux` and `stages.renders`
each `skipped` with that `why`, each logged. A plan with no blueprint slice has no acceptance
criteria and no Screens contract to verify against.

## Recording the stages

Record both stages in `stages` with `plan.mjs set`, each followed by its `row` event:

- `stages.<stage>.state` `running` as each starts.
- `green` or `failed` as each execution returns, with its result as `detail`.
- `skipped` with its `why` when the condition did not hold.

A resumed run reads `stages` to know whether they already passed, and runs a stage that reads
`green` or `skipped` no more. The report states each skip from its `detail`, not from
recollection.

## Keep the renders

After the ux stage's last round, before the landing:

1. Take the `RENDER: <project> <code> <platform> <state> <file>` lines that round's reviewer
   returned.
2. Set `stages.renders` `running`.
3. Run the script once per project the stage reviewed. Pipe each run, on stdin, only the lines
   whose first field is that project:

   ```sh
   node ${CLAUDE_PLUGIN_ROOT}/skills/mockups/scripts/renders.mjs --worktree <worktree> --main <main checkout> --project <project> --plan <folder>
   ```

The script copies each image into the main checkout's
`docs/scratchpad/<project>/renders/<platform>/<route>/`, as `index.png` or `index--<state>.png`. It
overwrites only the screens and states it was given. It records them in that platform's
`__renders/renders.json`. There it prunes each entry, and its image, whose code left the platform's
route map or whose route changed.

A line it cannot copy — another project, an unknown code, a missing or non-PNG file, a failed copy — is
one `SKIPPED:` stdout line. The rest are copied, and stdout ends with one `COPIED: <n>` line.

Set `stages.renders`: `state` `green`, `detail` the `COPIED:` count and each `SKIPPED:` line. Log the
same as its `row` event.

With no `RENDER:` line, or `RENDERED: n/a`, run no copy: `stages.renders` reads `skipped` with that
reason.

The copy writes only into the main checkout's gitignored `docs/scratchpad/`. It is not a git edit, and it
never blocks the landing. A non-zero exit of the script is a gap, recorded with its stderr, and the run
continues.

## The autonomous policy

Read this when the `acceptance` or `ux` stage returns anything other than a clean pass. A run whose both
stages pass first time, or whose skip conditions held, never needs it. The stage contracts themselves are
in `execute-stages.md`. The criteria come from the `acceptance` list of the folder's `index.json`.

Every write below is one call in the worktree to
`node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`:
`set <folder>/index.json stages.<stage>.state <state>` and
`set <folder>/index.json stages.<stage>.detail "<one line>"` for the stage's result,
`append <folder>/index.json gaps --json <entry>` for a gap. Follow each `set` of a stage with one
`log.mjs event row`, `{"stage", "status"}` plus its `detail`. Follow each `append` with one
`log.mjs event gap` with its `source` `acceptance` or `ux`, per [the plan files](plan-files.md).

- **Each stage's result** goes to `stages.acceptance` and `stages.ux`, each set `running` as it starts.
  `plan.mjs` stamps its times, per [the plan files](plan-files.md). The final state is one of these:
  - `green` on a clean pass, or once the loop below leaves no residual.
  - `failed` with the residuals counted in `detail`.
  - `skipped` with its reason in `detail` when its skip condition held.

  A resume skips a stage that already reads `green` or `skipped`.
- **Acceptance `FAIL` / `NOT-COVERED`, and ux findings → loop to `code`** for the unit that owns the flow or
  screen. Dispatch `execute-coder` with the **finding lines** the stage returned; the fix is the code, the
  missing E2E test, or the style or state correction. Re-commit, and re-verify the affected stage, **up to 4
  rounds** (the review-cap rule), under the same **convergence guard**. A round can fail to strictly reduce the failures, or re-break a criterion an earlier round fixed. Either
  ends the loop early as an oscillation gap. Document residuals, at the cap or at the guard, as gaps, and proceed to the final report. A residual is
  never silently dropped.
- **Acceptance `n/a — no harness`**, or **ux `RENDERED: n/a` on a web slice** → record it as a gap, and
  proceed. The gap names what harness or capture is missing, in the harness-contract vocabulary. Never scaffold infrastructure
  beyond the plan's own units.
- **Untestable criteria / unpinned states** (`SPEC/PLAN GAPS` / `SPEC GAPS`) → the `gaps` list of `index.json`,
  per the gap rules.
- **A gap** from either stage is one `gaps` entry: `{id, unit, stage, text, state: "open"}`, the next `G<n>`.
  Its `stage` is `acceptance` or `ux`. Its `unit` is the unit that owns the flow or screen, or `""` when none
  does.
- **The renders of the last round are kept whatever the ux verdict**, copied per *Keep the renders* above. So a
  person can see, with `/vwf:mockups renders`, what a residual finding looks like.
