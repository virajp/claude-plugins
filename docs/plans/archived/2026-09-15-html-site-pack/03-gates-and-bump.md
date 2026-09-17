# U3 — gates and bump

- **Wave:** 3
- **Depends on:** U2
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Read first:** `index.md`'s Consent block and Wave gate; the two version
  files; `plugins/vwf/.claude-plugin/plugin.json` (read only — vwf is not
  bumped).
- **Lazy-load:** `.config/mise/tasks/p/site/version` (the bare invocation is a
  patch bump; it refuses a dirty tree — run it **first**, before any other edit
  in this unit); `.config/mise/tasks/p/plugins/marketplace`.

## Ruling

The Consent block: "Release `stackgen` publicly — minor — one level over the
version the base carries at run time (`1.19.0` → `1.20.0` once
`default-per-platform` has landed), by editing
`plugins/stackgen/.claude-plugin/plugin.json`"; "Release `site` publicly — patch
— one level over the base's version (`1.1.21` → `1.1.22` once
`default-per-platform` has landed), by `mise run p:site:version` (bare)";
"Release `vwf` publicly — none".

The 13/17 rule: no component of any version this unit writes is `13` or `17`;
compute each target from the **actual** base version, step past a forbidden
component, and record the literal reached. If the literals above are stale,
apply the consented **level** and record the literal reached as a `GAP:`.

## Edits

1. `mise run p:site:version` — from a clean tree; read the resulting
   `site/package.json` version and record it.
2. `plugins/stackgen/.claude-plugin/plugin.json` — minor over the actual
   version.
3. `mise run p:plugins:marketplace` — regenerates
   `.claude-plugin/marketplace.json` (and the gitignored dev manifest) with the
   new stackgen tag; stage nothing.
4. Run the full wave gate from `index.md`, every line, and report each result.

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
  shows stackgen one minor up, vwf unchanged, site one patch up.
- `command grep -c "stackgen-v<new>" .claude-plugin/marketplace.json` is `1`.

## Guardrails

- Touch nothing outside the three owned files and what the generator writes.
  `plugins/vwf/.claude-plugin/plugin.json` is read, never edited.
- Do not run `p:plugins:release`, `p:site:release` or `p:i:release`; do not run
  `p:plugins:local` — that is the orchestrator's after-landing step.
- `p:site:version` refuses a dirty tree: it is the first command, not the last.
- Delete nothing.

## Commit

`ops: bump stackgen and site — html site pack` — written by the orchestrator
after the wave gate, not by the unit, with the literals reached substituted in.
