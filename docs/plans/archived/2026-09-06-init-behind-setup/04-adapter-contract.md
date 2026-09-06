# U4 — the stack-adapter skills hide, and rule 9 says they must

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`,
  `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`,
  `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `.claude/skills/plugin-authoring/references/checks.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing —
  `check.ts:860-930` (rule 9) and `:790-846` (rule 8, the twin you do **not**
  change) in particular.
- **Lazy-load:** `plugins/stackgen/assets/artifact-doctrine.md` §2 (why a
  user-only adapter skill is worse than a missing one — cited by rule 8's text).

## Ruling

The user's answers in the interview: scope — *"Limit to init,
stackgen-stack-menu, stackgen-stack-template only"*; the gate delta — *"Extend
rule 9 for the adapter skills only"*, whose option text read:

> Rule 9 (stack-adapter contract) additionally requires `user-invocable: false`
> on `<plugin>-stack-menu` and `-stack-template`, so hiding becomes part of the
> adapter contract every future adapter meets. Init's own frontmatter is
> asserted by nothing beyond strict-YAML (rule 4) and `claude plugin validate` —
> it is one skill, not a contract.

From index.md's assumed decisions:

> **1.** `user-invocable: false` **and** `disable-model-invocation: false`, with
> no `paths:`. […] **skill-invoked** […] hidden from the `/` menu, reachable by
> the skill that owns the seam.

> **6.** U4 [owns `checks.md` rule 9 text], with the rule and its test, so the
> rule and its doc land in one commit.

> **9.** Both directions: an adapter skill missing `user-invocable: false`
> fails; one carrying it beside the explicit `disable-model-invocation: false`
> passes; a `user-invocable: false` skill **without** the explicit line still
> fails (the existing assertion is kept, not replaced).

## Edits

1. **`stackgen-stack-menu/SKILL.md`** and **`stackgen-stack-template/SKILL.md`**
   frontmatter: add `user-invocable: false` beside the existing
   `disable-model-invocation: false` (menu `:7`, template `:10`); keep every
   other key, including template's `argument-hint: "<slug>"`. Update each file's
   invocation blockquote (menu `:18`, template's equivalent) to name both keys
   and why: `disable-model-invocation` must stay `false` because vwf reaches the
   skill by its constructed name and a user-only skill yields an empty menu, not
   an error; `user-invocable: false` because no user types the skill — it is
   vwf's to call — and the `/` menu is shorter for it.
2. **`scripts/src/check.ts` rule 9 (`:868-928`).** For each of the two adapter
   skills of every `vwf-stack-adapter` plugin, **add** a second assertion:
   `^user-invocable:\s*false\s*$` must match the frontmatter, with a finding
   message in the same shape as the existing one (`:927`), saying the skill is
   not `user-invocable: false` and that an adapter skill is vwf's to call, not a
   user's to type. **Keep** the explicit `disable-model-invocation: false`
   assertion (`:923`) unchanged — decision 9. Update the comment at `:868-870`
   so it no longer implies that `user-invocable: false` is the wrong state for
   these skills: the explicit-line assertion still exists because absence of
   `true` is not the same as the explicit `false`, and `user-invocable: false`
   is now **also** required. The converse direction (keyword ⇄ skills) is
   unchanged. Rule 8 (`:792-845`) is **not** touched — the design-adapter skills
   are out of scope (index.md, Parked).
3. **`scripts/src/check.test.ts`.** Extend the rule 9 tests: a fixture adapter
   skill with `disable-model-invocation: false` but no `user-invocable` line
   **fails** with the new finding; one with both lines **passes**; one with
   `user-invocable: false` and no `disable-model-invocation` line still fails
   with the existing finding. Follow the file's fixture style exactly.
4. **`.claude/skills/plugin-authoring/references/checks.md:62-75`** (rule 9).
   Add the requirement in one or two sentences: both skills are
   `disable-model-invocation: false` **and** `user-invocable: false` — the first
   so vwf can call them, the second so no user is offered a skill that answers
   only a program. Keep the converse-direction paragraph. Do not touch rule 8's
   text (`:56-61`) or the retired-rules table.

## Verification

- `pnpm vitest run` green — the new cases included.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run plugins:check` green against the tree — the two stackgen skills now
  carry both lines, so the widened rule passes on the real plugins.
- `grep -c '^user-invocable: false$' plugins/stackgen/skills/stackgen-stack-menu/SKILL.md plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  → `1` each; `grep -c '^disable-model-invocation: false$'` → `1` each.
- `grep -n 'user-invocable' scripts/src/check.ts` shows the new assertion inside
  rule 9's block only (rule 8's block gains no new assertion).
- `checks.md` is dprint-formatted (`.claude/**` is): run
  `pnpm exec dprint check .claude/skills/plugin-authoring/references/checks.md`
  and fix only that file if it complains.

## Guardrails

- Touch nothing outside the five owned paths. `plugins/vwf/skills/init/SKILL.md`
  is U1's; `.claude/skills/vwf-plugin/**` and `site/**` are U6's — report as
  `DOCS FALSIFIED:` (the manual's `stackgen.md:706-707` "adapter,
  model-invocable" cells will need the new state).
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns; `dprint fmt` only on
  `checks.md`.
- Strict-YAML frontmatter on both skills; re-read after editing.
- Do not widen the rule to `plugins/vwf/skills/import-*` or to init — out of
  scope by the user's ruling.
- Write with Write/Edit, never `cat` heredocs.

## Commit

Part of wave 1's commit — written by the orchestrator after the wave gate, not
by the unit.
