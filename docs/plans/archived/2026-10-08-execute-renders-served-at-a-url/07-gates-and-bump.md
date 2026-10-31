# U6 — Gates and bump

- **Wave:** 4
- **Depends on:** U5
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> - Decision E15: vwf `21.1.0` → `21.2.0` (minor). No tag; the release waits for
>   plan 2b. Site neither bumped nor released.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — `"version": "21.1.0"` →
   `"21.2.0"` (no 13 or 17 component). When the file reads another version, that
   is an `UNRESOLVED:` — plan 1 has not landed.
2. `mise run p:plugins:marketplace` — regenerates
   `.claude-plugin/marketplace.json`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `test -x plugins/vwf/skills/mockups/scripts/renders.mjs` — true.

## Guardrails

- No tag, no `p:plugins:release`, no `p:plugins:local`, no `p:site:version`.
- stackgen is untouched.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump vwf to 21.2.0`
