# U8 — Gates

- **Read first:** `plugins/vwf/.claude-plugin/plugin.json` and
  `.claude-plugin/marketplace.json`.

## Ruling

> D16 — The run keeps one check, K1: claude plugin test plugins/vwf passes,
> which covers the pane.

> D33 — The plugin.json description edit moves to U8, the gates unit. U8 owns
> plugins/vwf/.claude-plugin/plugin.json and .claude-plugin/marketplace.json,
> edits the description line alone (no version), runs the generator, and both
> files ride one commit. This replaces the U7 part of D30.

> D31 — Settled by D30: the description change makes p:plugins:marketplace
> rewrite .claude-plugin/marketplace.json, so U8 commits that file. If the
> generator still changes nothing, U8 makes no commit and reports it.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — the `description` value
   only (line 12, "an autonomous execute"): reword it so that it holds for a
   run that asks the user when the plan is silent. Keep its length and its
   other claims. Change no other key, and never the `version`.
2. Run `mise x -- mise run p:plugins:marketplace`. Keep what it writes: the
   vwf entry's `description` takes the new wording, and nothing else changes.
3. Run every wave gate line and every plan gate line of `index.json` once, and
   report each with its exit code.

## Verification

- `mise x -- mise run p:plugins:marketplace -- --check` passes.
- `mise x -- mise run code:lint` and `mise x -- mise run p:plugins:check` pass.
- `mise x -- pnpm vitest run` and `mise x -- pnpm exec tsc --noEmit -p scripts`
  pass.
- `git diff --stat` shows the two owned files alone, each with its description
  line changed.

## Guardrails

- Bump no version. Edit no file by hand save the one `description` value.
- Delete with `rm`, never `git rm`.

## Commit

`ops: say in the vwf description that a run asks when the plan is silent`
