# U6 — docs: every descriptive mention follows, outside history

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4, U5
- **Owns:** `CLAUDE.md`, `installer/CLAUDE.md`, `site/CLAUDE.md`, `readme.md`,
  `.claude/docs/**`, `.claude/skills/**`, `.claude/agents/target-verifier.md`,
  `site/src/content/docs/**`, and the eight plugin-shipped lines:
  `plugins/vwf/assets/stack-adapter.md:145`,
  `plugins/vwf/vendor/mempalace/README.md:79,97`,
  `plugins/vwf/skills/blueprint-authoring/references/api-and-schema-contracts.md:93`,
  `plugins/stackgen/stacks/readme.md:272`,
  `plugins/stackgen/assets/output-tree.md:194,212`,
  `plugins/stackgen/assets/pack-format.md:94,262,276`
- **Model:** opus
- **Read first:** `vwf:docs-sync`'s standalone mode
  (`plugins/vwf/skills/docs-sync/SKILL.md`), then the wave-1 diff once, then the
  mention counts in index.md's facts.
- **Lazy-load:** each owned doc at the hits of
  `grep -rnE '\b(i|plugins|site):(build|publish|release|test|version|check|inventory|local|marketplace|npm-normalize-test|shellcheck|dev|icons)\b'`
  over your Owns.

## Ruling

This is the fixed docs unit: it runs `vwf:docs-sync` over the run's branch delta
and applies its findings plus every `DOCS FALSIFIED:` line U1–U5 returned, plus
the survey list. From index.md's assumed decisions, verbatim:

> **1.** `i:*` → `p:i:*`, `plugins:*` → `p:plugins:*`, `site:*` → `p:site:*`.
> […] every functional caller and every descriptive mention outside history
> follows.

> **2.** **Rewrite them; bump only if already released.** The docs unit rewrites
> all eight. […]

> **8.** `docs/memory/**` and `docs/plans/archived/**` are untouched.

The user, on the eight: *"Rewrite them; bump only if already released"*.

## Edits

1. Run `vwf:docs-sync` in standalone mode over the branch delta; apply its
   findings.
2. Apply every `DOCS FALSIFIED:` line the orchestrator hands you from U1–U5.
3. Every mention in your Owns, by the grep above: `i:<x>` → `p:i:<x>`,
   `plugins:<x>` → `p:plugins:<x>`, `site:<x>` → `p:site:<x>`. The counts in the
   facts section (`CLAUDE.md` 23, `ci-and-releases.md` 31, `release/SKILL.md`
   28, …) are what you should find; a large mismatch is a `GAP:`.
4. `CLAUDE.md`'s **Tasks** section names the five `plugins:*` tasks in bold and
   the site tasks — rewrite each; the release rule at the top ("ALWAYS ask user
   before running an `i:release`, `plugins:release` or `site:release` task")
   too.
5. The eight plugin-shipped lines — same rewrite; fold width by hand
   (`plugins/**/*.md` is not dprint's).
6. `readme.md` — the survey found 0 mentions; confirm.
7. **Not** `docs/memory/**`, **not** `docs/plans/archived/**`, **not** the
   non-archived plan folders' own text (this plan's index names the old groups
   on purpose, as history).

## Verification

- `grep -rnE '\b(i|plugins|site):(build|publish|release|test|version|check|inventory|local|marketplace|npm-normalize-test|shellcheck|dev|icons)\b' CLAUDE.md installer/CLAUDE.md site/CLAUDE.md readme.md .claude site/src/content/docs plugins --include='*.md'`
  → nothing (the generated `plugins/stackgen/stacks/inventory.md` is U7's —
  exclude it from the grep with `--exclude=inventory.md`).
- `pnpm exec dprint check CLAUDE.md installer/CLAUDE.md site/CLAUDE.md readme.md .claude/docs .claude/skills .claude/agents`
  green (these **are** dprint's — the Tasks table re-pads).
- `mise run p:site:check` green.
- `mise run p:plugins:check` green (rule 13 — no plugin-relative citation
  introduced).
- `git diff --stat develop -- docs/memory docs/plans/archived` → empty.

## Guardrails

- Do not touch `plugin.json`, `stacks/inventory.md`, `marketplace.json` (U7).
- Do not touch `.config/**`, `.github/**`, `.vscode/**`, `scripts/**`,
  `installer/src/**` — wave 1's, done.
- `readme.md` is lowercase.
- Write with Write/Edit, never `cat` heredocs.
- Delete with `rm`, never `git rm`; stage nothing.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`docs: every task mention names the p: groups` — written by the orchestrator
after the wave gate, not by the unit.
