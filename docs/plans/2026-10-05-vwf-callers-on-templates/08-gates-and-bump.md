# U7 — Gates and bump

- **Wave:** 5
- **Depends on:** U6
- **Owns:** the swiftui pack's `version:` line and every bundle pin naming it,
  `plugins/stackgen/stacks/inventory.md`,
  `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> F13 — After landing `mise run p:plugins:local` (`run`); release none; no
> manifest bump.

## Edits

1. Confirm vwf `20.1.0` is above `vwf-v20.0.1` at the minor and stackgen `3.0.0`
   above `stackgen-v2.0.0` at the major — no manifest bump.
2. swiftui: compare its `version:` with
   `git show stackgen-v2.0.0:plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`;
   when equal (plan 2 did not bump it), one patch, skipping 13 and 17, and its
   bundle pins follow.
3. `mise run p:plugins:inventory`, `mise run p:plugins:marketplace`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `DECIDED:` names each project bumped or left, and why.

## Guardrails

- No tag, no release. `p:plugins:local` is the orchestrator's after-landing
  step, not this unit's.
- Pack `version:` + bundle pin + `inventory.md` in this one commit.

## Commit

`ops: bump what the vwf-callers plan edited, if anything`
