# U5 — `scripts/src` strings: the task names in messages and comments

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/inventory.ts`, `scripts/src/marketplace.ts`,
  `scripts/src/check.ts`, `scripts/src/plugins.ts`, `scripts/src/check.test.ts`,
  `scripts/src/inventory.test.ts`, `scripts/src/marketplace.test.ts`,
  `installer/src/mempalace-checkpoint-script.test.ts`
- **Model:** opus
- **Read first:** the lines in index.md's facts (`inventory.ts:191,364`;
  `marketplace.ts:14,89,148,217,335,370,382,397-398`; `check.ts:70,283`;
  `plugins.ts:133`; `check.test.ts:106`; `inventory.test.ts:32`;
  `marketplace.test.ts:37,198`; `mempalace-checkpoint-script.test.ts:8`).
- **Lazy-load:** nothing.

## Ruling

From index.md's assumed decisions, verbatim:

> **1.** `i:*` → `p:i:*`, `plugins:*` → `p:plugins:*`, `site:*` → `p:site:*`.
> […] every functional caller and every descriptive mention outside history
> follows.

> **7.** The user-facing strings and comments naming a task are rewritten; the
> tests that assert on them follow in the same unit. No behaviour changes.

## Edits

1. Every listed line: `plugins:<x>` → `p:plugins:<x>`, `i:<x>` → `p:i:<x>`,
   `site:<x>` → `p:site:<x>`, inside strings and comments only. Nothing executes
   a task from these files — do not introduce one.
2. `inventory.ts:191` is the generator's header line for `stacks/inventory.md`;
   change the string, do **not** regenerate the file (U7 does).
3. The three test files: update the asserted strings to match.

## Verification

- `pnpm vitest run` green.
- `pnpm exec tsc --noEmit -p scripts` and `-p installer` clean.
- `pnpm exec dprint check scripts/src installer/src` green.
- `grep -rnE '\b(i|plugins|site):(build|publish|release|test|version|check|inventory|local|marketplace|npm-normalize-test|shellcheck|dev|icons)\b' scripts/src installer/src`
  → nothing.

## Guardrails

- Touch nothing outside the eight files; not `stacks/inventory.md` (U7).
- Delete with `rm`, never `git rm`; stage nothing.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`refactor(scripts): the messages name the p: task groups` — written by the
orchestrator after the wave gate, not by the unit.
