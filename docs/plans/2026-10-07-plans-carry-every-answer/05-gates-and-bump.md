# U5 — Gates and bump

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> - Decision D12: vwf `20.1.0` → `21.0.0` (major); release none; the site is
>   neither bumped nor released.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — `"version": "20.1.0"` →
   `"21.0.0"` (no 13 or 17 component).
2. `mise run p:plugins:marketplace` — regenerates
   `.claude-plugin/marketplace.json`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `grep -rnE 'ask step|run / ask|or .ask.|recorded .ask.|intent, not authorisation' plugins/vwf`
  — report every hit; only `skills/init/SKILL.md:740`, `:816` and execute's
  "stops once at the end" may remain.

## Guardrails

- No tag, no `p:plugins:release`, no `p:plugins:local`, no `p:site:version`.
- stackgen is untouched.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump vwf to 21.0.0`
