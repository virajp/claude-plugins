# U1 — The five calling packs pin the linter (and node where they lack it)

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/pnpm/**`,
  `plugins/stackgen/stacks/toolchain-gate/eslint/**`,
  `plugins/stackgen/stacks/app-framework/flutter/**`,
  `plugins/stackgen/stacks/language/swift/**`,
  `plugins/stackgen/stacks/app-framework/swiftui/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** each pack's `mise.d/` (if any), `pack.yaml` and
  `config/.config/mise/tasks/code/lint`; init's mise pack `conf.d/tools.toml`
  for the current linter pin line (read only); index.md's Facts.

## Ruling

> - Decision 1: The language stack decides its linter and its runtime — the
>   user: *"The language-stack will decide which linter to be installed"*. pnpm
>   and eslint pin the linter in `mise.d/tools.toml`; flutter, swift and swiftui
>   pin the linter and `node`.
> - Decision 5: Each caller's `code:lint` prints, for a missing pin or `node`,
>   which pack pins it and `MISE_ENV=dev mise run setup:all`, instead of mise's
>   raw error.
> - Decision 6: The pin (and `node`) sit in `tools.toml`, every environment,
>   because CI lints.
> - Decision 10: Any comment a unit adds is one line.

## Edits

1. **`mise.d/tools.toml`** of each pack (create where absent) — the linter pin,
   copied byte for byte from init's mise pack (same version and options); for
   flutter, swift, swiftui also `node` at the version the pnpm pack's runtime
   uses (or `lts` if none is pinned — record it under `DECIDED:`).
2. **`tasks/code/lint`** of each — before `mise which linter …`, check the pin
   and `node` resolve; on failure print the one-line message of decision 5 and
   exit non-zero.
3. **Prose** in each pack (`conventions.md`, `skills/**`) that says the linter
   comes from the base — the pack pins it.

## Verification

- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `MISE_ENV=dev mise run p:plugins:check` green

## Guardrails

- Payload excluded from this repo's dprint; `plugins/**/*.md` not formatted;
  keep exec bits. Do not edit a `pack.yaml` `version:` line (U7's).
- Touch nothing outside the five pack trees.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: the linter-calling packs pin the linter and their runtime` — written by
the orchestrator after the wave gate.
