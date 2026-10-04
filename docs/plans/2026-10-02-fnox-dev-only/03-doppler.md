# U3 — Doppler retires

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/capability-provider/doppler/**` (deleted),
  `plugins/stackgen/stacks/bundles/doppler.md` (deleted),
  `plugins/stackgen/skills/tool-config/references/git.md`,
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/testing.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the two non-deleted owned files, top to bottom.

## Ruling

> D10 — Delete the `capability-provider/doppler` pack and `bundles/doppler.md`,
> and every passage naming it as a live option. Repos that already materialized
> it are left untouched — no migration.

## Edits

1. `rm -r plugins/stackgen/stacks/capability-provider/doppler` and
   `rm plugins/stackgen/stacks/bundles/doppler.md`.
2. **`references/git.md`** — the provider-ignore example (around `:207`, "fnox
   `fnox.local.toml`, doppler `.doppler/`"): keep the fnox example, drop
   doppler's. Change nothing else in the file.
3. **`flutter/.../testing.md`** — the `doppler run -- flutter test …` example
   (around `:94`): use `fnox exec -- flutter test …`, the same command shape.

## Verification

- `test ! -e plugins/stackgen/stacks/capability-provider/doppler && test ! -e plugins/stackgen/stacks/bundles/doppler.md`
- `grep -rn -i doppler plugins/stackgen --include='*.md' --include='*.yaml'`
  prints only `skills/tool-config/references/mise.md` (a rename-history row, out
  of scope) and passages U1, U4 own.
- `pnpm vitest run` green (no test reads the pack); the full wave gate (the
  orchestrator regenerates `inventory.md` in this unit's commit, D14).

## Guardrails

- Delete with `rm`, never `git rm`.
- Touch nothing outside Owns; `stacks/readme.md` is U1's, `inventory.md` the
  orchestrator's.
- Do not edit the flutter pack's `version:` (U9).
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`refactor: the doppler pack retires`
