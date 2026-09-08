# U3 — gates: no bump, the generators, the full gate

- **Wave:** 3
- **Depends on:** U2
- **Owns:** `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md` (both generated — expected unchanged).
  **No `plugin.json`.**
- **Model:** opus
- **Read first:** index.md's Consent block.
- **Lazy-load:** `.claude/docs/ci-and-releases.md` (why nothing is released
  here).

## Ruling

index.md's Consent block: every release row `none`; the local stage `n/a` —
nothing under `plugins/` changes. **No version is bumped by this plan.**

## Edits

1. **Bump nothing.** No `plugin.json`, no `site/package.json`, no
   `mise run i:version` or `site:version`.
2. Run `mise run plugins:marketplace` and `mise run plugins:inventory`. Neither
   should produce a diff; if one does, stage it and return the summary as a
   `GAP:`.
3. Run the full wave gate from index.md plus the plan's own checks.

## Verification

- `mise run plugins:check`, `mise run plugins:marketplace --check`,
  `mise run plugins:inventory --check`, `pnpm vitest run`,
  `pnpm exec tsc --noEmit -p installer`, `pnpm exec tsc --noEmit -p scripts`,
  `mise run plugins:npm-normalize-test` — all green.
- The plan's own checks from index.md's Wave gate section, all passing.
- `git status --porcelain -- '*/plugin.json' site/package.json` → empty.
- `target-verifier` is **not** run — nothing under `plugins/` or `installer/`
  changed.

## Guardrails

- Touch nothing outside the two generated files.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter with
  `--fix` on a path outside your Owns.
- Do **not** run `mise run plugins:local`, any tag, or any `*:release` task.
- Write with Write/Edit, never `cat` heredocs.

## Commit

`ops: regenerate after retiring the repo plan skills — no version bump` —
written by the orchestrator after the wave gate, not by the unit. If step 2
produced no diff, the orchestrator records U3 `green` with no commit.
