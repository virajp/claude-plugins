# U6 — gates and bump

- **Wave:** 4
- **Depends on:** U5
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Read first:** `index.md`'s Consent block and Wave gate; the three version
  files.
- **Lazy-load:** `.config/mise/tasks/p/site/version` (the bare invocation is a
  patch bump; it refuses a dirty tree — run it **first**, before any other edit
  in this unit); `.config/mise/tasks/p/plugins/marketplace`.

## Ruling

The Consent block: "Release `stackgen` publicly — minor — `1.9.0` → `1.10.0`, by
editing `plugins/stackgen/.claude-plugin/plugin.json`"; "Release `vwf` publicly
— minor — `19.21.0` → `19.22.0`, by editing
`plugins/vwf/.claude-plugin/plugin.json`"; "Release `site` publicly — patch —
`1.1.10` → `1.1.11`, by `mise run p:site:version` (bare)". "No release step runs
in this plan: the versions are bumped so the next `/release` ships them."

The 13/17 rule: no component of any version this unit writes is `13` or `17`;
none of the three targets is, so no skip applies — verify rather than assume.

## Edits

1. `mise run p:site:version` — from a clean tree; confirm `site/package.json`
   reads `1.1.11`.
2. `plugins/stackgen/.claude-plugin/plugin.json` — `"version": "1.10.0"`.
3. `plugins/vwf/.claude-plugin/plugin.json` — `"version": "19.22.0"`.
4. `mise run p:plugins:marketplace` — regenerates
   `.claude-plugin/marketplace.json` (and the gitignored dev manifest) with the
   new tags; stage nothing.
5. Run the full wave gate from `index.md`, every line, and report each result.

## Verification

- Every wave-gate line green:
  ```text
  mise run p:plugins:marketplace -- --check
  mise run p:plugins:inventory -- --check
  mise run p:plugins:check
  mise run p:plugins:shellcheck
  mise run p:plugins:npm-normalize-test
  pnpm vitest run
  pnpm exec tsc --noEmit -p installer
  pnpm exec tsc --noEmit -p scripts
  mise run p:site:check
  ```
- `command grep -n '"version"' plugins/stackgen/.claude-plugin/plugin.json plugins/vwf/.claude-plugin/plugin.json site/package.json`
  shows `1.10.0`, `19.22.0`, `1.1.11`.
- `command grep -c "stackgen-v1.10.0\|vwf-v19.22.0" .claude-plugin/marketplace.json`
  is `2`.

## Guardrails

- Touch nothing outside the four owned files and what the two generators write.
- Do not run `p:plugins:release`, `p:site:release` or `p:i:release`; do not run
  `p:plugins:local` — that is the orchestrator's after-landing step.
- `p:site:version` refuses a dirty tree: it is the first command, not the last.
- Delete nothing.

## Commit

`ops: bump stackgen 1.10.0, vwf 19.22.0, site 1.1.11 — stylesheet axis, web head`
— written by the orchestrator after the wave gate, not by the unit.
