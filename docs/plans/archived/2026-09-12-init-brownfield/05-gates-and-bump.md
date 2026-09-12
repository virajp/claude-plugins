# U5 — Gates and bump

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `site/package.json`. Touch nothing outside
  this list.
- **Model:** opus
- **Read first:** the `version` field of
  `plugins/vwf/.claude-plugin/plugin.json` — bump one minor step from what it
  holds.
- **Lazy-load:** none.

## Ruling

Quoted from index.md:

> **8. Versions and model.** vwf minor from whatever the file holds; site patch;
> stackgen and installer none.

## Edits

1. `plugins/vwf/.claude-plugin/plugin.json` `version` minor bump.
2. `mise run p:plugins:marketplace`.
3. `mise run p:site:version patch`.
4. Run the full wave gate and report each line.

## Verification

- Every wave-gate line green (the nine lines in index.md).
- `git diff --stat` touches only the owned paths.
- Report the two resulting version numbers in `DECIDED:`.

## Guardrails

- Bumps only. No stackgen change of any kind — `p:plugins:inventory --check`
  must pass untouched.
- Never run a release task or `p:plugins:local`.
- Delete nothing.

## Commit

`ops: vwf minor, site patch` — written by the orchestrator after the wave gate.
Type `ops`; no scope.
