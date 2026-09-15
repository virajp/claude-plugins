# U2 — bash: the three zsh task files

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/tasks/code/git-config`,
  `.config/mise/tasks/code/count`, `.config/mise/tasks/code/all`
- **Model:** opus
- **Read first:** the three files, top to bottom.
- **Lazy-load:** `.config/mise/tasks/_scripts/helpers` (the helper library every
  task sources — bash; nothing to change there).

## Ruling

From index.md's assumed decisions, verbatim:

> **4.** `code/git-config`, `code/count`, `code/all` become
> `#!/usr/bin/env bash`; `git-config`'s two `${(f)…}` splits become
> `while IFS= read -r` loops. Nothing else in them changes.

The 2026-09-09 reshape flagged these three and, by doctrine, did not rewrite
them: *"Auto-translating a shell script is how a working task becomes a subtly
broken one."* This unit is the deliberate rewrite.

## Edits

1. **All three files, line 1:** `#!/usr/bin/env zsh` → `#!/usr/bin/env bash`.
2. **`code/git-config:23` and `:32`** — `${(f)LOCAL_CONFIG}` (zsh: split on
   newlines) → a `while IFS= read -r line; do …; done <<< "$LOCAL_CONFIG"` loop
   with the same body; keep the variable names and the messages.
3. **`code/count`, `code/all`** — nothing beyond the shebang (`all:10`'s
   `[[ … ]] && … || …` is bash-valid). Run each once to confirm.

## Verification

- `grep -rn '^#!/usr/bin/env zsh' .config/mise/tasks` → nothing.
- `bash -n .config/mise/tasks/code/git-config .config/mise/tasks/code/count .config/mise/tasks/code/all`
  → clean.
- `shellcheck -x .config/mise/tasks/code/git-config .config/mise/tasks/code/count .config/mise/tasks/code/all`
  → no error-level findings (warnings that pre-date the rewrite are reported as
  `DECIDED:`, not fixed).
- `mise run code:count` exits 0 and prints the same shape as before;
  `mise run code:git-config` exits 0 (it is `always_run` in pre-commit, so a
  broken rewrite fails every commit — run it before returning).
- `pre-commit run --all-files` green.

## Guardrails

- Do not touch `code/format` (U1) or anything else under `.config/`.
- Delete with `rm`, never `git rm`; stage nothing.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`refactor: the three zsh task files are bash` — written by the orchestrator
after the wave gate, not by the unit.
