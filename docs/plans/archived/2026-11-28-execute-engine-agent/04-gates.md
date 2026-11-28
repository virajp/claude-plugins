# U4 — Gates

- **Read first:** `docs/plans/2026-11-28-execute-engine-agent/index.json`,
  the `gates` key.

## Ruling

> D6 — No review unit: the plan lands no runnable code. It changes skill
> prose, an agent definition and docs. The wave review is the check.

> D7 — No kept gate. The new agent loads only in a restarted session, so the
> first real proof is the next `/vwf:execute all` run that reaches a review
> row after a restart: the runner returns its five-line block with no manual
> resume.

## Edits

1. No file changes. The plan names no generator: the new agent is found by
   its folder, and no generated manifest lists vwf's agents.
2. Run the full wave gate over the finished tree.

## Verification

- `mise x -- mise run code:format --all` green.
- `mise x -- mise run code:lint --all` green.
- `mise x -- mise run p:plugins:check` green.
- `mise x -- mise run p:plugins:marketplace -- --check` green.

## Guardrails

- Bump no version: the plan's `release_levels` are what `/vwf:execute`
  records at landing.
- Run no after-landing step.

## Commit

None: this unit changes no file. When a generator unexpectedly changes a
file, the orchestrator commits it as `ops: regenerate after the engine-agent
change`.
