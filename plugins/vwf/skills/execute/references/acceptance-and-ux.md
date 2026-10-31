# Acceptance & UX — Autonomous Policy

Read this when the `acceptance` or `ux` stage returns anything other than a
clean pass. A run whose both stages pass first time, or whose skip conditions
held, never needs it — the stage contracts themselves live in
`${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`. The criteria come from the
`acceptance` list of the folder's `index.json`.

Every write below is one call in the worktree to
`node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`:
`set <folder>/index.json stages.<stage>.state <state>` and
`set <folder>/index.json stages.<stage>.detail "<one line>"` for the stage's
result, `append <folder>/index.json gaps --json <entry>` for a gap. Each
`set` of a stage is followed by one `log.mjs event row`, `{"stage", "status"}`
plus its `detail`, and each `append` by one `log.mjs event gap` with its
`source` `acceptance` or `ux`, per *The plan files* in `SKILL.md`.

- **Each stage's result** goes to `stages.acceptance` and `stages.ux`, each
  set `running` as it starts — `plan.mjs` stamps its times, per *The plan
  files*: `green` on a clean pass, or once the loop below leaves no residual;
  `failed` with the residuals counted in `detail`; `skipped` with its reason
  in `detail` when its skip condition held. A resume skips a stage that
  already reads `green` or `skipped`.
- **Acceptance `FAIL` / `NOT-COVERED`, and ux findings → loop to `code`** for
  the unit that owns the flow/screen (dispatch `execute-coder` with the **tag**;
  the fix is the code, the missing E2E test, or the style/state correction),
  re-commit, re-verify the affected stage — **up to 4 rounds** (the review-cap
  rule), under the same **convergence guard**: a round that doesn't strictly
  reduce the failures, or that re-breaks a criterion an earlier round fixed,
  ends the loop early as an oscillation gap. Residuals — at the cap or at the
  guard — are documented as gaps and the run proceeds to the final report; a
  residual is never silently dropped.
- **Acceptance `n/a — no harness`**, or **ux `RENDERED: n/a` on a web slice** →
  record it as a gap (what harness/capture is missing, in the harness-contract
  vocabulary) and proceed — never scaffold infrastructure beyond the plan's own
  units.
- **Untestable criteria / unpinned states** (`SPEC/PLAN GAPS` / `SPEC GAPS`) →
  the `gaps` list of `index.json` + room `gaps`, per the gap rules.
- **A gap** from either stage is one `gaps` entry:
  `{id, unit, stage, text, state: "open"}`, the next `G<n>`, `stage`
  `acceptance` or `ux`, `unit` the unit that owns the flow or screen, or `""`
  when none does.
- **The renders of the last round are kept whatever the ux verdict** — copied
  into the main checkout's scratchpad per *Keep the renders* in the skill's
  Acceptance & UX section, so a person can see, with `/vwf:mockups renders`,
  what a residual finding looks like.
