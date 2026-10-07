# V4 — The checker drops the editor axis; this repo drops its dead fragments

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `.config/vscode.d/`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts` at `:275-276`, `:406-408`, `:466-473`,
  `:898`, `:990-1097`; `scripts/src/check.test.ts` at
  `:457,468,486,501,541,550,562-565,588,634,1135`.

## Ruling

> E1 — Retired everywhere: … the checker's axis …

> E6 — Delete `.config/vscode.d/` (four dead fragments); keep `.vscode/`.

## Edits

1. `check.ts` — remove `PACK_EDITOR_FRAGMENTS`, the fragment walk, the `editor`
   entry of the conditional-axis vocabulary, `EDITOR_FRAGMENT_KEYS` and
   `editorFragmentFaults`. Remove `stripJsonc` only if nothing else calls it.
   Where a pack's `conditional:` now names no known axis, the existing
   unknown-axis fault applies; no new rule. The root allowlist (`:326-343`)
   stays — it is not vscode-specific.
2. `check.test.ts` — delete the editor-fragment and `editor: vscode` cases; keep
   or adapt the two-axis test to whichever axis remains; drop the
   `hygiene.jsonc` fixture (`:1135`). If no conditional axis remains at all, one
   case asserts that any `conditional:` `when:` key is refused.
3. `rm -r .config/vscode.d/` (four files). Leave `.vscode/` untouched.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `grep -n -i -E 'vscode|editor' scripts/src/check.ts` prints nothing related to
  editor configuration.
- `mise run p:plugins:check` green together with V2's pack edits after the wave.
- The full wave gate.

## Guardrails

- Do not touch `.vscode/`, this repo's `.config/pre-commit-config.yaml` or any
  other `.config/` file.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: checker drops the editor axis and fragment rules; this repo drops .config/vscode.d`
