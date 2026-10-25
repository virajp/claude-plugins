# U5 — Gates

- **Read first:** the plan's `gates` in `index.json`.

## Ruling

No version bump: the release levels in `index.json` are what `/vwf:execute`
records at landing.

## Edits

1. Run `mise x -- mise run p:plugins:marketplace`. No manifest changes, so
   `.claude-plugin/marketplace.json` is expected to stay the same; keep what
   the generator writes.
2. Run every line of the plan gate and fix nothing outside this unit's
   `owns`; report a red line as `UNRESOLVED:` with its output tail.

## Verification

- `mise x -- mise run code:precommit --all`
- `mise x -- mise run p:plugins:marketplace -- --check`
- `mise x -- mise run p:plugins:check`
- `claude plugin test plugins/vwf`
- `claude plugin validate --strict plugins/vwf`
- `mise x -- mise run p:site:check`

## Guardrails

- Do not bump a version. Do not edit a file outside `owns`.

## Commit

`ops: plan gates for the pane that replays the log`
