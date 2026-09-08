# U4 — gates: no bump, the generators, the full gate, the real install

- **Wave:** 4
- **Depends on:** U3
- **Owns:** `.claude-plugin/marketplace.json` (generated — expected unchanged),
  `plugins/stackgen/stacks/inventory.md` (generated — expected unchanged). **No
  `plugin.json`.**
- **Model:** opus
- **Read first:** index.md's Consent block;
  `plugins/vwf/.claude-plugin/plugin.json` (to confirm it still reads
  `19.14.0`).
- **Lazy-load:** `.claude/docs/ci-and-releases.md` (why a tracked version is
  plain `X.Y.Z`; why nothing is released here),
  `.claude/docs/dev-marketplace.md` (why this unit does not run
  `plugins:local`).

## Ruling

index.md's Consent block:

| Action                                       | Granted |
| -------------------------------------------- | ------- |
| Merge to `develop` and push on green run     | yes     |
| Stage locally (`plugins:local`) on green run | yes     |
| Release `vwf` publicly                       | none    |
| Release `stackgen` publicly                  | none    |
| Release installer publicly                   | none    |
| Release site publicly                        | none    |

The user's answers: vwf — *"Not this time"*; site — *"Not this time"*. **No
version is bumped by this plan.** The two skills reach this machine through the
local stage (`X.Y.Z+N`, the orchestrator's step after landing) and are exercised
by `docs/plans/2026-09-08-retire-repo-plan-skills/`.

## Edits

1. **Bump nothing.** `plugins/vwf/.claude-plugin/plugin.json` stays `19.14.0`;
   `plugins/stackgen/.claude-plugin/plugin.json` untouched; `site/package.json`
   untouched; do not run `mise run site:version` or `mise run i:version`.
2. Run `mise run plugins:marketplace` and `mise run plugins:inventory`. Neither
   should produce a diff (no manifest changed, no pack changed); if one does,
   stage it and return the diff summary as a `GAP:`. A regenerated
   `.dev-marketplace/` is gitignored — leave it.
3. Run the full wave gate from index.md, `site:check` included (U3 edited
   `site/src/content/docs/**`), plus the plan's own checks under *Wave gate*.

## Verification

- `mise run plugins:check`, `mise run plugins:marketplace --check`,
  `mise run plugins:inventory --check`, `pnpm vitest run`,
  `pnpm exec tsc --noEmit -p installer`, `pnpm exec tsc --noEmit -p scripts`,
  `mise run plugins:npm-normalize-test`, `mise run site:check` — all green.
- The plan's own checks from index.md's Wave gate section, all passing.
- `grep -o '"version": *"[^"]*"' plugins/vwf/.claude-plugin/plugin.json` →
  `19.14.0`; `git status --porcelain -- '*/plugin.json' site/package.json` →
  empty.
- The orchestrator then runs **`target-verifier`** with: "vwf gained two skills,
  `skills/change-plan/` (SKILL.md + 2 references) and `skills/change-execute/`
  (SKILL.md + 2 references), and one row in
  `blueprint-authoring/references/frontmatter-and-links.md`; no version bump".
  Pass: `claude plugin validate --strict` green for vwf, the installed copy
  carries both `SKILL.md` files with parseable frontmatter, and the uninstall
  report is clean. The verifier is hermetic (`CLAUDE_CONFIG_DIR=/tmp/…`).

## Guardrails

- Touch nothing outside the two generated files; the generators write them.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter with
  `--fix` on a path outside your Owns.
- Do **not** run `mise run plugins:local` — the orchestrator's, after landing.
- Do **not** cut any tag or run any `*:release` task.
- Write with Write/Edit, never `cat` heredocs.

## Commit

`ops: regenerate after the change pair — no version bump` — written by the
orchestrator after the wave gate, not by the unit. If step 2 produced no diff,
the orchestrator records U4 `green` with no commit.
