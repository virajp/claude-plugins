# J4 — Gates and bump

- **Wave:** 4
- **Depends on:** J3
- **Owns:** `package.json` (version only)
- **Model:** opus
- **Kind:** edit

## Ruling

> J3 — Minor, bumped here, released with the chain.

## Edits

1. On a clean tree: `mise run p:i:version -- --minor` (`1.0.2 → 1.1.0`). No tag,
   no `p:i:release`.

## Verification

- The full wave gate — the run's final gate.

## Commit

`ops: bump installer to 1.1.0`
