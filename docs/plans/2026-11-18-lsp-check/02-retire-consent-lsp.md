# U2 — Retire consent.lsp

- **Read first:** every owned file, top to bottom, before editing.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D5:** The user ruled: retire `consent.lsp`. `/vwf:plan` no longer asks the
  LSP question (interview item 9a is removed) and writes no `consent.lsp`. The
  validator makes `consent.lsp` optional on a cycle plan and still refuses it
  on a change plan; an old folder that has it stays valid, and no script reads
  it. The template drops the key from its sample and its rules.

- **D21:** Remove the sentence "An absent toolchain is asked here, once, and
  recorded." with the LSP passage of `plan/SKILL.md`. A missing toolchain is a
  doctor row, and the blocking rows already stop `/vwf:plan`.

The reason: a missing server, a missing `code:lsp:check` task or a failed
check now always stops a plan with a code unit (D2, D4), so the answer
`proceed without` has no effect.

## Edits

1. **`plugins/vwf/skills/plan-management/scripts/lib/schema.mjs`** — the `lsp`
   entry of `consent` (about line 83) stays `cycle: true` with its enum, but is
   optional: a cycle plan without it is valid. Update the header comment
   (about lines 6-8): `consent.lsp` is an old, optional key that no script
   reads.
2. **`plugins/vwf/skills/plan-management/scripts/plan.mjs`** — the comment
   example `consent.lsp.dart` (about line 47) becomes an example of another
   path, for example `consent.merge`.
3. **`scripts/src/plan-script.test.ts`** — keep the test that refuses a bad
   value (about lines 830-831) and the test that refuses the key on a change
   plan (about lines 882-884). Add a test: a cycle plan without
   `consent.lsp` is valid. Remove `consent.lsp` from any cycle fixture that is
   built in the test file only to satisfy the old rule, when the test does not
   examine the key.
4. **`plugins/vwf/skills/plan/SKILL.md`** — remove the LSP question (about
   lines 182-191) and the mentions of `consent.lsp` (about lines 356, 383,
   408). Where the text explains it, say in one sentence that `/vwf:execute`
   stops a plan with a code unit when bootstrap's `code:lsp:check` reports a
   missing server, and the user fixes it before the run.
5. **`plugins/vwf/assets/plan-interview.md`** — remove item 9a. Do not
   renumber the other items.
6. **`plugins/vwf/assets/templates/plan-folder.md`** — remove `"lsp"` from the
   cycle sample (about line 195), the `consent.lsp.dart` path example (about
   line 45, use another path), and the `lsp` text of the `consent` rule (about
   lines 380-385). In the rule on cycle-only keys (about lines 323-327), say
   that `consent.lsp` is an old, optional cycle key that no script reads and
   that a planner no longer writes.

7. **`plugins/vwf/skills/plan/references/plan-doc.md`** (D15) — the `consent`
   text (about lines 68-70) names `lsp` with `installed` or `proceed without`:
   remove the `lsp` part.

## Verification

- `mise x -- pnpm vitest run scripts/src/plan-script.test.ts` passes.
- `node plugins/vwf/skills/plan-management/scripts/plan.mjs validate docs/plans/2026-11-18-lsp-check/index.json`
  prints `valid`.
- `command grep -rnE 'consent\.lsp|proceed without|9a' plugins/vwf/skills/plan plugins/vwf/assets`
  has no hit outside the template rule that names the old key.
- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all`
  pass.

## Guardrails

- Touch nothing outside the owned paths. The doctor and execute files belong to
  U1 and U3.
- Do not edit any folder under `docs/plans/`: old folders keep their
  `consent.lsp`.
- Delete with `rm`, never `git rm`. Do not run a formatter with `--fix`, and
  do not run `git checkout` or `git restore`.
- `plugins/**/*.md` is not formatted: keep the fold width by hand.

## Commit

`feat: retire consent.lsp; the LSP question leaves /vwf:plan`
