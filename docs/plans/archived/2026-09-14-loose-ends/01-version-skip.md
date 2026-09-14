# U1 — version skip in one bump

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/tasks/p/site/version`,
  `.config/mise/tasks/p/i/version`, `.config/mise/tasks/_scripts/local`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `.config/mise/tasks/p/site/release:45-60` and
  `.config/mise/tasks/p/plugins/release:70-80` — callers of `version_forbidden`,
  to confirm its signature stays untouched.

## Ruling

Decision 1: "Compute the target in bash — apply the level to the current
version, then while `version_forbidden` holds step the **same** component again
— and call `pnpm version <explicit> --no-git-tag-version` exactly once. Two new
helpers in `_scripts/local` beside `version_forbidden`:
`version_bump LEVEL CURRENT` prints the plain result of the level,
`version_next LEVEL CURRENT` prints that result stepped past any forbidden
component; the task prints `version_skip_note` when the two differ. The loop,
the ten-attempt cap and the second `pnpm version` call go." Rejected: "keep the
loop and add `--no-git-checks` to the second call".

The 13/17 rule stands as written in `CLAUDE.md`: those two integers are never
issued as any component, and it is the component that counts (`1.13.0` is
forbidden, `1.130.0` is not). `version_forbidden` already encodes that; reuse
it, do not reimplement it.

## Edits

1. **`.config/mise/tasks/_scripts/local`** — add two functions immediately after
   `version_forbidden`, in the same style (a comment block above each in the
   file's voice, `local` variables, no external tools beyond the shell).
   `version_bump LEVEL CURRENT`: strip a leading `v`, and any `+…` or `-…`
   suffix, from `CURRENT`; split into `MAJOR.MINOR.PATCH` (fail with
   `print_error` and `return 1` when it is not three integers); apply `LEVEL` —
   `major`: `MAJOR+1, 0, 0`; `minor`: `MINOR+1, 0`; `patch`: `PATCH+1`; any
   other level is an error; print the result. `version_next LEVEL CURRENT`:
   start from `version_bump`'s result, then
   `while version_forbidden "$MAJOR.$MINOR.$PATCH"; do` step the **same**
   component again (`major` → `MAJOR+1`; `minor` → `MINOR+1`; `patch` →
   `PATCH+1`); print the result. Nothing else prints. Keep `version_skip_note`
   as is.
2. **`.config/mise/tasks/p/site/version`** — replace lines `:25-47` (the first
   bump, the read-back, the loop, the cap, the second bump, the note) with: read
   `CURRENT` once (`node -p "require('./package.json').version"`),
   `PLAIN=$(version_bump "$LEVEL" "$CURRENT")`,
   `TARGET=$(version_next "$LEVEL" "$CURRENT")`, run
   `pnpm version "$TARGET" --no-git-tag-version` once, then if
   `[ "$TARGET" != "$PLAIN" ]` call `version_skip_note "$PLAIN" "$TARGET"`, and
   print the final version as the task does today. Keep the `#USAGE` flags, the
   `cd`, the `set -euo pipefail`, the source line and the file's header comment
   — rewrite the comment block at `:29-35` so it describes the compute-once
   shape rather than the loop and the cap.
3. **`.config/mise/tasks/p/i/version`** — the same change, one line up; it keeps
   bumping the root `package.json` from `MISE_PROJECT_ROOT`.
4. Read both tasks once more end to end: no `while`, no `ATTEMPTS`, exactly one
   `pnpm version` invocation in each.

## Verification

- `command grep -c "pnpm version" .config/mise/tasks/p/site/version .config/mise/tasks/p/i/version`
  prints `1` for each.
- `command grep -n "while\|ATTEMPTS" .config/mise/tasks/p/site/version .config/mise/tasks/p/i/version`
  is empty.
- `command grep -n "^version_bump\|^version_next\|^version_forbidden\|^version_skip_note" .config/mise/tasks/_scripts/local`
  shows all four.
- A scratch check the unit runs itself: in a temp dir, `git init`, write a
  `site/package.json` with `"version": "1.1.12"`, a `.config/mise/config.toml`
  with `[task_config] includes = [".config/mise/tasks"]`, copy the site task to
  `.config/mise/tasks/p/site/version` and `_scripts/local` beside it (preserve
  the relative `source` path the task uses), commit, then
  `mise run p:site:version` → `1.1.14`, exit 0, the note printed. Repeat with
  `1.1.5` → `1.1.6`, no note. Repeat with `1.12.0` and `--minor` → `1.14.0`.
  Report the three results in `DECIDED:`.
- `mise x -- shellcheck -x .config/mise/tasks/p/site/version .config/mise/tasks/p/i/version .config/mise/tasks/_scripts/local`
  clean; `mise run code:lint` green.

## Guardrails

- Do not change `version_forbidden`'s name, arguments or return contract — the
  three release tasks call it.
- Do not touch the release tasks, `deps-update.yml`, or any doc — `CLAUDE.md`
  and `.claude/docs/ci-and-releases.md` describe the old loop and are U6's.
- Do not bump any real version: run the scratch check in a temp dir only, and
  leave `site/package.json` and the root `package.json` untouched.
- BSD tools: the machine is macOS; no GNU-only flags.
- Delete with `rm`, never `git rm`; stage nothing.

## Commit

`fix: version tasks compute the 13/17 skip first and bump once` — written by the
orchestrator after the wave gate, not by the unit.
