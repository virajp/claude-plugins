# U7 — Gates and the design-tool pack bump

- **Wave:** 4
- **Depends on:** U6
- **Owns:** `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml` (the
  `version:` line only), `plugins/stackgen/stacks/bundles/claude-code.md` (the
  `design-tool/claude-code@…` pin line only),
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

> D12 — design-tool/claude-code `0.3.1` → `0.4.0`, its pin in
> `bundles/claude-code.md`, and `plugins/stackgen/stacks/inventory.md`
> regenerated — one commit. No plugin or site bump.

## Edits

1. Confirm the plugins need no bump:
   `git tag --list 'vwf-v*' 'stackgen-v*' 'site-v*'` and the manifests show
   stackgen at least one major above its latest tag, vwf at least one minor
   above, the site at least one patch above. If any does not, return
   `UNRESOLVED:` naming it — this plan authorises no plugin bump.
2. `pack.yaml` `version: 0.3.1` → `version: 0.4.0` (if the pack already moved
   past `0.3.1`, bump its minor from what it reads, skipping 13 and 17, and say
   so in `DECIDED:`).
3. `bundles/claude-code.md` pin `design-tool/claude-code@0.3.1` → the same new
   version.
4. Run `MISE_ENV=dev mise run p:plugins:inventory` to regenerate
   `plugins/stackgen/stacks/inventory.md`.
5. Run every Wave gate line with `MISE_ENV=dev` exported.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `git status --short` lists only the three owned files.

## Guardrails

- No plugin manifest edit, no `p:plugins:marketplace` write, no tag, no
  `p:plugins:release`, no `p:site:release`.
- The three files land in one commit (pack version, bundle pin, inventory).

## Commit

`ops: bump the design-tool/claude-code pack to 0.4.0`
