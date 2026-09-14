# U7 — gates and bump

- **Wave:** 4
- **Depends on:** U6
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Read first:** `index.md`'s Consent block and Wave gate; the three version
  files.
- **Lazy-load:** `.config/mise/tasks/p/site/version` — U1's rewritten task; the
  bare invocation is a patch bump, it refuses a dirty tree, so it runs
  **first**, before any other edit in this unit;
  `.config/mise/tasks/p/plugins/marketplace`.

## Ruling

The Consent block: "Release `stackgen` publicly — minor — `1.11.0` → `1.12.0`,
by editing `plugins/stackgen/.claude-plugin/plugin.json`"; "Release `vwf`
publicly — minor — `19.24.0` → `19.25.0`, by editing
`plugins/vwf/.claude-plugin/plugin.json`"; "Release `site` publicly — patch —
`1.1.14` → `1.1.15`, by `mise run p:site:version` (bare)". "**The level
governs**: if another plan lands first and moves a base version, the
gates-and-bump unit applies the consented level (minor, minor, patch) over the
base's actual version and reports the difference as a `GAP:`." "No release step
runs in this plan."

The 13/17 rule: no component of any version this unit writes is `13` or `17`.
For the site, U1's task now does the arithmetic; for the two manifests, verify
by hand — none of the three targets is forbidden, so no skip applies.

## Edits

1. Read the three current versions first; if any differs from the Consent
   block's base, apply the level over what is there and write a `GAP:`.
2. `mise run p:site:version` — from a clean tree; confirm `site/package.json`
   moved by exactly one patch, the task exited 0 and printed no skip note.
3. `plugins/stackgen/.claude-plugin/plugin.json` — `"version": "1.12.0"` (or the
   level applied).
4. `plugins/vwf/.claude-plugin/plugin.json` — `"version": "19.25.0"` (or the
   level applied).
5. `mise run p:plugins:marketplace` — regenerates
   `.claude-plugin/marketplace.json` (and the gitignored dev manifest) with the
   new tags; stage nothing.
6. Run the full wave gate from `index.md`, every line, and report each result.

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
  shows the three targets.
- `command grep -c "stackgen-v<target>\|vwf-v<target>" .claude-plugin/marketplace.json`
  is `2`.
- `git status --porcelain` lists exactly the four owned files.

## Guardrails

- Touch nothing outside the four owned files and what the two generators write.
- Do not run `p:plugins:release`, `p:site:release` or `p:i:release`; do not run
  `p:plugins:local` — that is the orchestrator's after-landing step.
- `p:site:version` refuses a dirty tree: it is the first command, not the last.
- Delete nothing.

## Commit

`ops: bump stackgen 1.12.0, vwf 19.25.0, site 1.1.15 — loose ends` — written by
the orchestrator after the wave gate, not by the unit; the orchestrator
substitutes the versions actually reached.
