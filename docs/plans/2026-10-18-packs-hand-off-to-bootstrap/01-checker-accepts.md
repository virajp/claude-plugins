# U1 — The checker accepts `bootstrap_tools:`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`, new files under
  `scripts/src/fixtures/`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` (rule
  11), `plugins/stackgen/assets/pack-format.md`

## Ruling

> - Decision 3: A new `pack.yaml` key, `bootstrap_tools: [<tool>, …]`.
> - Decision 11: A pinned list in `scripts/src/check.ts`: the 17 tools on
>   bootstrap `main` plus `android` and `swift`; an unknown name fails.
> - Decision 12: U1 (wave 1) accepts the key and makes `check.test.ts`
>   independent of real pack payload; U6 (wave 3) rejects `templates/`,
>   `values:` and bootstrap payload paths. Every wave gate stays green.

The pinned list: `base`, `bun`, `claude`, `cloudflare`, `docker`, `doppler`,
`flutter`, `fnox`, `gcloud`, `github`, `gitlab`, `kotlin`, `node`, `pulumi`,
`python`, `rust`, `vscode`, `android`, `swift`.

## Edits

1. **`scripts/src/check.ts`** — add a `BOOTSTRAP_TOOLS` constant beside the rule
   11 constants (:340-520), with the list above and a one-line comment that it
   mirrors `tools/` on bootstrap `main` and changes by hand. In the pack walk,
   accept an optional `bootstrap_tools:` key in `pack.yaml`: a YAML list of
   strings, each in `BOOTSTRAP_TOOLS`, no duplicates. Anything else is a rule 11
   failure naming the pack and the bad entry. If the walk refuses unknown
   `pack.yaml` keys, add the key to the allowed set. Change nothing else:
   `templates/` and `values:` are still accepted in this unit.
2. **`scripts/src/check.test.ts`** — add cases: a valid list passes; an unknown
   name, a non-list value and a duplicate each fail. Where an existing case in
   the "pack config tier" block (:295) reads a real pack under
   `plugins/stackgen/stacks/`, move it onto a fixture under
   `scripts/src/fixtures/`, so that wave 2's deletions cannot break it.

## Verification

- `pnpm vitest run` — green.
- `pnpm exec tsc --noEmit -p scripts` — green.
- `mise run p:plugins:check` — green on the current tree.

## Guardrails

- Do not touch `plugins/**`, the tool-config tests or `checks.md`.
- Do not remove the tool-config imports (:46, :48) — plan 3's.
- Delete with `rm`, never `git rm`.

## Commit

`feat: accept bootstrap_tools in pack.yaml`
