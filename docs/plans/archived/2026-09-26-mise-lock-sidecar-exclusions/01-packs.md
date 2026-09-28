# U1 — The dprint and pre-commit packs exclude the mise sidecar tree

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json`,
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/taplo.toml`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** the three owned files; the pre-commit pack's
  `config/.config/linter.yaml:51-52` (read only — the entry to mirror);
  `.claude/skills/plugin-authoring/references/checks.md` rule 15.

## Ruling

> - Decision 1: The dprint pack's `dprint.json` and `taplo.toml` excludes gain
>   `**/.config/mise/locks/`; the pre-commit pack's global `exclude` gains the
>   equivalent `(^|/)\.config/mise/locks/` alternative.
> - Decision 2: Gitleaks unchanged — committed lock data is still scanned.

## Edits

1. **`dprint.json`** :18–20 — add `"**/.config/mise/locks/"` beside the lock
   globs, in the list's existing order convention.
2. **`taplo.toml`** :15–17 — the same entry.
3. **`pre-commit-config.yaml`** :62–64 — add the alternative to the global
   `exclude` regex, keeping its layout; a one-line comment only if the block
   already comments its entries.

## Verification

- `mise run p:plugins:check` green (rule 15: the three lists agree, gitleaks a
  subset)

## Guardrails

- Touch nothing outside the three owned files; never touch any `gitleaks.toml`.
- Payload is excluded from this repo's dprint: do not run this repo's formatter
  over it.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`fix: dprint and pre-commit packs exclude the mise lock sidecar tree` — written
by the orchestrator after the wave gate.
