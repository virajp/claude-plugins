# U4 — docs: the stackgen skill, the manual and the repo map follow wave 1

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `.claude/skills/stackgen-plugin/**`,
  `site/src/content/docs/plugins/stackgen.md`, `CLAUDE.md`, `readme.md`,
  `.claude/docs/**`, `docs/memory/decisions/**` (none expected — no reversal)
- **Model:** opus
- **Read first:** `vwf:docs-sync`'s standalone mode
  (`plugins/vwf/skills/docs-sync/SKILL.md`), then the wave-1 diff
  (`git diff <develop>..HEAD -- plugins/stackgen scripts`) once, then the survey
  list below.
- **Lazy-load:** the owned docs, at the cited lines.

## Ruling

This is the fixed docs unit: it runs `vwf:docs-sync` over the run's branch delta
and applies its findings plus every `DOCS FALSIFIED:` line U1–U3 returned, plus
the survey list. No reversal was confirmed, so no decisions doc is written.

## Edits

1. Run `vwf:docs-sync` in standalone mode over the branch delta; apply its
   findings.
2. Apply every `DOCS FALSIFIED:` line the orchestrator hands you from U1–U3.
3. The survey list, whichever docs-sync did not already name:
   - `.claude/skills/stackgen-plugin/SKILL.md:92` — `.config/renovate.json` →
     `renovate.json`; if the skill restates the root allowlist anywhere, align
     it to the two-tier wording and point at `assets/output-tree.md`.
   - `site/src/content/docs/plugins/stackgen.md:422` — "a Renovate config" stays
     true; add the path only if the surrounding list names paths.
   - `CLAUDE.md`, the `plugins:check` bullet under "Tasks" — "the `config/` root
     against the hygiene allowlist (whose two allowed directories are `.config/`
     and `.github/`)": still true; add nothing unless docs-sync finds the tier
     wording falsifies it.
   - `readme.md` — expected untouched; confirm.
4. Nothing under `plugins/**` or `scripts/**` — those are U1–U3's and are done.

## Verification

- `mise run site:check` green.
- `pnpm exec dprint check CLAUDE.md readme.md .claude/docs .claude/skills/stackgen-plugin`
  green (these **are** dprint's).
- `grep -rn '\.config/renovate\.json' .claude/ site/src/content/docs/ CLAUDE.md readme.md`
  → nothing.
- `mise run plugins:check` still green.

## Guardrails

- Do not touch `plugins/**`, `scripts/**`, or the pins and inventory (U5).
- `readme.md` is lowercase.
- Write with Write/Edit, never `cat` heredocs.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`docs(stackgen): the hygiene pack's Renovate path and the two-tier allowlist` —
written by the orchestrator after the wave gate, not by the unit.
