# U1 — The house linter, pinned as a mise tool

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, and
  `config/.config/mise/tasks/code/lint` of `package-manager/pnpm`,
  `app-framework/flutter`, `toolchain-gate/eslint`, `language/swift`,
  `app-framework/swiftui` (all under `plugins/stackgen/stacks/`)
- **Model:** opus
- **Kind:** edit
- **Read first:** the mise pack's `mise.toml` and every owned `code/lint`.
- **Lazy-load:** mise's npm backend docs through Context7 (`resolve-library-id`
  → `query-docs`) — how `npm:<pkg>` tools are declared, what they need on PATH
  (node / a package manager), and the binary name they expose.

## Ruling

> **B1** — The mise pack declares `npm:@askviraj/linter` at an exact version
> (1.1.6, re-verified against the registry at run time) in its tools; every
> `code:lint` calls `linter` directly, and `pnpm dlx` for the linter is gone.
> Rejected: exact version in each task; one `LINTER_VERSION` env var.

## Edits

1. Re-verify the latest `@askviraj/linter` version
   (`pnpm view @askviraj/linter version`). Use it if it is newer than 1.1.6, and
   say so in `DECIDED:`.
2. **mise pack `mise.toml`** — add `"npm:@askviraj/linter" = "<version>"` to the
   tools table, beside the existing tools, in the file's style. Confirm the
   binary name the package exposes (its `bin` field —
   `pnpm view @askviraj/linter bin`); the tasks call that name.
3. **Each owned `code/lint`** — replace `pnpm dlx @askviraj/linter` with the
   binary from edit 2, arguments unchanged. Keep each task's comments true.
4. **mise pack `conventions.md` / `skills/**`** — where they list the pack's
   tools, add the linter and why it is pinned here (one pin for every language
   pack's `code:lint`). Only where such a list exists.
5. If mise's npm backend needs node or a package manager that a non-JS repo
   (swift, flutter) lacks, say so in `GAP:` with what the docs say — never add a
   tool the plan does not name.

## Verification

- `mise run p:plugins:check` and `mise run p:plugins:shellcheck` pass.
- `grep -rn 'pnpm dlx @askviraj/linter' plugins/stackgen/stacks --include='*' -l`
  lists no owned file.
- `bash -n` on every edited task.

## Guardrails

- Do not touch `code/format` (U2's), the eslint pack's `SKILL.md`,
  `conventions.md` or `linter.yaml` (U3's), or any `pack.yaml` (U7's).
- Task files keep their exec bit and shebang (checker rule 11).
- Payload files under `config/` are excluded from this repo's formatter; never
  run this repo's `code:format --fix` on them.
- Write with Write/Edit, never heredocs. Delete with `rm`, never `git rm`.

## Commit

`fix: pin the house linter as a mise tool and call it from every code:lint`
