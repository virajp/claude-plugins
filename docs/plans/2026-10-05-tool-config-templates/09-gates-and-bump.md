# U8 — Gates and bump

- **Wave:** 7
- **Depends on:** U7
- **Owns:** the `version:` line of each pack U3 edited, every bundle pin naming
  them, `plugins/stackgen/stacks/inventory.md`,
  `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> E23 — No `p:plugins:local` until plan 3; release none; packs patch once since
> `stackgen-v2.0.0`.

## Edits

1. Confirm `plugins/stackgen/.claude-plugin/plugin.json` is above
   `stackgen-v2.0.0` at the major (3.0.0) — no manifest bump; vwf untouched.
2. **Packs** — for each pack U3 edited
   (`git diff --name-only <branch base>.. -- plugins/stackgen/stacks`), compare
   its `version:` with `git show stackgen-v2.0.0:<pack.yaml>`; when equal, one
   patch (skip 13 and 17); bundle pins naming it follow.
3. `mise run p:plugins:inventory`, `mise run p:plugins:marketplace`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `DECIDED:` lines name each pack bumped or left, and why.

## Guardrails

- No tag, no `p:plugins:release`, no `p:plugins:local`.
- Pack `version:` + bundle pin + `inventory.md` land in this one commit.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump the packs that moved onto templates and subtasks`
