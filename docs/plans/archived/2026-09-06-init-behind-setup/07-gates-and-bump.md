# U7 — gates and bump: vwf 19.14.0, stackgen 1.2.1, the generators, the real install

- **Wave:** 3
- **Depends on:** U6
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json` (generated),
  `plugins/stackgen/stacks/inventory.md` (generated)
- **Model:** opus
- **Read first:** both `plugin.json` files; index.md's Consent block.
- **Lazy-load:** `.claude/docs/ci-and-releases.md` (why a tracked version is
  plain `X.Y.Z`), `.claude/docs/dev-marketplace.md` (why this unit does not run
  `plugins:local`).

## Ruling

index.md's Consent block:

| Action                      | Granted |
| --------------------------- | ------- |
| Release `vwf` publicly      | minor   |
| Release `stackgen` publicly | patch   |
| Release installer publicly  | none    |
| Release site publicly       | none    |

The user's answers: vwf — *"minor → 19.14.0"*; stackgen — *"patch → 1.2.1"*;
site — *"not this time"*.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — `"version": "19.13.0"` →
   `"19.14.0"`. Plain `X.Y.Z`; no build metadata (`plugins:check` fails one).
2. **`plugins/stackgen/.claude-plugin/plugin.json`** — `"1.2.0"` → `"1.2.1"`.
3. **`site/package.json`** — **not** touched; the site is not released this
   plan. Do not run `mise run site:version`.
4. Run `mise run plugins:marketplace` and `mise run plugins:inventory`; stage
   the regenerated files. If the dev manifest under `.dev-marketplace/` exists
   in this worktree it is regenerated too and is gitignored — leave it.
5. Run the full wave gate (index.md's list, `site:check` included since U6
   edited `site/src/content/docs/**`).

## Verification

- `mise run plugins:check`, `mise run plugins:marketplace --check`,
  `mise run plugins:inventory --check`, `pnpm vitest run`,
  `pnpm exec tsc --noEmit -p installer`, `pnpm exec tsc --noEmit -p scripts`,
  `mise run plugins:npm-normalize-test`, `mise run site:check` — all green.
- The plan's own checks from index.md's Wave gate section, all passing.
- `grep -o '"version": *"[^"]*"' plugins/vwf/.claude-plugin/plugin.json` →
  `19.14.0`; stackgen → `1.2.1`; `.claude-plugin/marketplace.json` pins
  `vwf-v19.14.0` and `stackgen-v1.2.1` refs.
- The orchestrator then runs **`target-verifier`** with: "vwf `init/SKILL.md`
  and stackgen `stackgen-stack-{menu,template}/SKILL.md` gained
  `user-invocable: false` beside `disable-model-invocation: false`; init lost
  `argument-hint`; check.ts rule 9 widened; versions vwf 19.14.0, stackgen
  1.2.1". Pass: `claude plugin validate --strict` green for every plugin, the
  installed copies of the three skills carry both keys, and the uninstall report
  is clean. The verifier is hermetic (`CLAUDE_CONFIG_DIR=/tmp/…`).

## Guardrails

- Touch nothing outside the four owned files; the generators write the two
  generated ones.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter with
  `--fix` on a path outside your Owns.
- Do **not** run `mise run plugins:local` — the orchestrator's, after landing.
- Do **not** cut any tag or run any `*:release` task.
- Write with Write/Edit, never `cat` heredocs.

## Commit

`ops: bump vwf to 19.14.0, stackgen to 1.2.1` — written by the orchestrator
after the wave gate, not by the unit.
