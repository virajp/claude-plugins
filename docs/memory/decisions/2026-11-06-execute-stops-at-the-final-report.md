DECISION 2026-11-06 ★4 | skill:execute | all-blocking gap: pause vs final report
→ final report — one stop lists every ruling together | agent that errors twice
stays a pause | alts blocking.md wins for both, SKILL.md wins for both rejected

# An all-blocking gap ends at the final report

Plan: `docs/plans/2026-11-06-execute-rule-defects`, decision D7. This reverses
the old H6 rule.

## Old rule

`plugins/vwf/skills/execute/SKILL.md` and `references/blocking.md` disagreed.

- **H6, all-blocking gap.** `SKILL.md` documented the gap and paused.
  `references/blocking.md` went to the final report.
- **H4, an agent that errors twice.** `SKILL.md` and `references/pause.md`
  paused. `references/blocking.md` treated it as an isolated block, and the run
  continued.

## New rule

- **H6 is gone.** An all-blocking gap ends at the final report, as
  `references/blocking.md` says. The other H ids keep their numbers.
- **H4 stays a pause**, as `references/pause.md` says, so
  `references/blocking.md` no longer treats a dead agent as an isolated block.

## Why

One stop lists every ruling together. An all-blocking gap is the end state of
the skip-and-continue path, so the final report already holds what the person
needs.

## Rejected

- **`references/blocking.md` wins for both.** A run that continues past a dead
  agent needs a new failure path for each agent type, and that design did not
  converge in three review rounds.
- **`SKILL.md` wins for both.** The all-blocking gap would stay a pause.
