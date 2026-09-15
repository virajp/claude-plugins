# U6 — Gates and bump

- **Wave:** 4
- **Depends on:** U5
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`,
  `plugins/stackgen/stacks/bundles/mise.md`,
  `plugins/stackgen/stacks/inventory.md`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `site/package.json`. Touch nothing outside this list.
- **Model:** opus
- **Read first:** the `version:` line of the mise `pack.yaml`, the pin in
  `bundles/mise.md`, and both `plugin.json` `version` fields — bump **from what
  they hold**, one minor step each.
- **Lazy-load:** `.config/mise/tasks/p/plugins/inventory` for what the generator
  refuses.

## Ruling

Quoted from index.md:

> **8. Versions and model.** mise pack minor (`1.1.0` → `1.2.0`), stackgen
> minor, vwf minor, site patch, installer none.

> The version numbers above assume plan 1 has landed and released as it recorded
> … If plan 1's release did not happen, the gates-and-bump unit bumps **from
> whatever the files hold**, one minor step, and reports the numbers.

## Edits

1. Mise pack `pack.yaml` `version:` minor bump; rewrite the pin in
   `bundles/mise.md` (and any other bundle that pins `toolchain-manager/mise@` —
   grep; the survey found only `mise.md:7`).
2. `mise run p:plugins:inventory`.
3. `plugins/stackgen/.claude-plugin/plugin.json` and
   `plugins/vwf/.claude-plugin/plugin.json` minor bumps.
4. `mise run p:plugins:marketplace`.
5. `mise run p:site:version patch`.
6. Run the full wave gate and report each line.

## Verification

- Every wave-gate line green (the nine lines in index.md).
- `grep -rn 'toolchain-manager/mise@' plugins/stackgen/stacks/bundles/` shows
  only the new version.
- `git diff --stat` touches only the owned paths.
- Report the four resulting version numbers in `DECIDED:`.

## Guardrails

- Bumps only. Never run a release task or `p:plugins:local`.
- Delete nothing.

## Commit

`ops: stackgen and vwf minor, site patch — the mise pack bumps minor` — written
by the orchestrator after the wave gate. Type `ops`; no scope.
