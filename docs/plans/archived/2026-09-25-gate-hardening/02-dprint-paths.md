# U2 — dprint receives paths that cannot read as flags or globs

- **Wave:** 1
- **Depends on:** —
- **Owns:** `config/.config/mise/tasks/code/format` of `package-manager/pnpm`,
  `app-framework/flutter`, `toolchain-gate/ruff`, `language/swift`,
  `app-framework/swiftui`, `toolchain-manager/mise` (all under
  `plugins/stackgen/stacks/`)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned `code/format`.
- **Lazy-load:** dprint's CLI docs through Context7 (`resolve-library-id` →
  `query-docs`) — whether `dprint fmt` / `dprint check` accept `--` before file
  arguments, and whether positionals are globs or literal paths.

## Ruling

> **B3** — Every path handed to dprint is `./`-prefixed, or passed after
> dprint's literal/`--` form when its docs (Context7) offer one.

## Edits

1. Read dprint's docs (lazy-load). Record in `DECIDED:` which form they support.
2. **Each owned `code/format`** — where a file array reaches `dprint fmt` or
   `dprint check` (pnpm `:60-64`, flutter `:67-71`, ruff `:61-65`, swift
   `:128-132`, swiftui the same shape, mise `:39-43`), prefix each path with
   `./` unless it is already absolute or already starts with `./`, and add `--`
   before the paths when dprint supports it. One shared shape across all six
   files. In swift and swiftui, cover every array, not only `swift_targets`.
3. If dprint reads positionals as globs and offers no literal form, add one
   comment at each call site saying a file name with glob characters may match
   other files — never escape them by hand.

## Verification

- `mise run p:plugins:shellcheck` and `mise run p:plugins:check` pass.
- `bash -n` on every edited task.
- In a scratch git repo with a file named `-x.md` staged, the pnpm task's dprint
  call (run the edited script with the minimum env it needs) does not error on
  `-x.md` as an unknown flag. Report what you ran.

## Guardrails

- Do not touch `code/lint` (U1's) or any `pack.yaml` (U7's).
- Task files keep their exec bit and shebang (checker rule 11).
- Payload under `config/` is excluded from this repo's formatter; never run this
  repo's `code:format --fix` on it.
- Write with Write/Edit, never heredocs. Delete with `rm`, never `git rm`.

## Commit

`fix: code:format hands dprint prefixed paths in every pack`
