# U6 — gates and bump: vwf 19.14.1, the marketplace, the full gate

- **Wave:** 3
- **Depends on:** U5
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json` (generated)
- **Model:** opus
- **Read first:** index.md's Consent block.
- **Lazy-load:** `.claude/docs/ci-and-releases.md` (the two-stage release).

## Ruling

index.md's Consent block, verbatim:

> Release `vwf` publicly — patch — 19.14.0 → 19.14.1, by editing `version` in
> `plugins/vwf/.claude-plugin/plugin.json`, then `mise run plugins:marketplace`

Every other release row reads `none`.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — `version` `19.14.0` →
   `19.14.1`. Plain `X.Y.Z`; `plugins:check` fails build metadata.
2. Run `mise run plugins:marketplace`; stage the regenerated
   `.claude-plugin/marketplace.json` (its vwf `ref` becomes `vwf-v19.14.1`).
3. Run `mise run plugins:inventory` — no diff expected (no stackgen change); if
   one appears, stage it and return it as a `GAP:`.
4. Run the full wave gate from index.md plus the plan's own checks.

## Verification

- `mise run plugins:check`, `mise run plugins:marketplace --check`,
  `mise run plugins:inventory --check`, `mise run plugins:npm-normalize-test`,
  `pnpm vitest run`, `pnpm exec tsc --noEmit -p installer`,
  `pnpm exec tsc --noEmit -p scripts`, `mise run site:check` — all green.
- The plan's own checks from index.md's Wave gate section.
- `grep -n '"version": "19.14.1"' plugins/vwf/.claude-plugin/plugin.json` → one
  hit; `grep -n 'vwf-v19.14.1' .claude-plugin/marketplace.json` → one hit.
- `git status --porcelain -- plugins/stackgen site/package.json installer/package.json`
  → empty.

## Guardrails

- Touch nothing but the two owned files.
- Do **not** run `mise run plugins:local`, any tag, or any `*:release` task —
  those are the orchestrator's after-landing steps.
- Never run `git checkout`, `git restore`, `git stash`.

## Commit

`ops: bump vwf to 19.14.1 — the pair hardening` — written by the orchestrator
after the wave gate, not by the unit.
