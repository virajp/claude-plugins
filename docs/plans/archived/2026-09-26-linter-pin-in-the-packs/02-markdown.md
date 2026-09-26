# U2 — The markdown pack lints markdown

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/language/markdown/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** the markdown pack's `pack.yaml` and `conventions.md`; a
  caller's `tasks/code/lint` (e.g. pnpm's, read only) for the task shape;
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  composition order (read only); index.md's Facts.

## Ruling

> - Decision 2: The markdown pack pins the linter and `node` in
>   `mise.d/tools.toml` and ships a `code:lint` for `*.md`; any other language
>   pack's `code:lint` overrides it (composition order), so markdown's only runs
>   where no other language lints. Its prose and mise's slot comment agree.
> - Decision 5: `code:lint` prints, for a missing pin or `node`, which pack pins
>   it and `MISE_ENV=dev mise run setup:all`.
> - Decision 6: The pin and `node` sit in `tools.toml`.
> - Decision 10: Any comment a unit adds is one line.

## Edits

1. **`mise.d/tools.toml`** — the linter pin (byte for byte from init's mise
   pack) and `node` (as `01-callers.md` decides it).
2. **`config/.config/mise/tasks/code/lint`** — lints `*.md` with the house
   linter (and `--fix` with file arguments, as the other callers do); keeps the
   two defaults the mise slot comment requires (shellcheck, actionlint). Confirm
   from the materializer that markdown composes before the other language packs;
   if it cannot, stop with `UNRESOLVED:`.
3. **`pack.yaml`** — declare the new payload; `version:` untouched (U7's).
4. **`conventions.md`** :20–21 — markdown's linter is this pack's, not the repo
   axis's.

## Verification

- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `MISE_ENV=dev mise run p:plugins:check` green

## Guardrails

- Payload excluded from this repo's dprint; keep exec bits.
- Touch nothing outside the markdown pack.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: the markdown pack pins and runs the linter for markdown` — written by the
orchestrator after the wave gate.
