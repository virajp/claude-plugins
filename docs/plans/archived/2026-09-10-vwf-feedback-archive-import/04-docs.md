# U4 — docs: the manual, the how-tos and the repo map follow wave 1

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/how-to/**`, `.claude/skills/vwf-plugin/**`,
  `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `docs/memory/decisions/**` (none
  expected — no reversal)
- **Model:** opus
- **Read first:** `vwf:docs-sync`'s standalone mode
  (`plugins/vwf/skills/docs-sync/SKILL.md`), then the wave-1 diff
  (`git diff <develop>..HEAD -- plugins/vwf/skills`) once, then the survey list
  below.
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
   - `vwf.md` `### /vwf:feedback` (`:1600+`) — the seventh kind and its route;
     `:758-760` — "a future route" → present tense.
   - `vwf.md` `### /vwf:archive` (`:1562-1569`) — folders are archived whole;
     the index is not written for them.
   - `vwf.md` `:116-121` (import prose) and `:755-762` (invocation policy) — the
     three `import-*` skills are skill-invoked like `init`; the command table
     `:730-743` gains nothing (they were never rows).
   - `.claude/skills/vwf-plugin/references/skills-and-agents.md:11-13` — "one —
     init — is skill-invoked" → four, naming them; `:40` — the future-route
     sentence → now.
   - `.claude/skills/vwf-plugin/SKILL.md` — the invocation-mode paragraph, if it
     counts hidden skills.
   - `readme.md:22` — feedback's one-line description; add the route only if the
     sentence enumerates kinds.
   - `CLAUDE.md` — the workflow paragraph names `feedback`; confirm nothing
     there is falsified.
   - `site/src/content/docs/how-to/**` — any how-to that lists the `/` menu or
     the feedback kinds (docs-sync finds them).
4. Nothing under `plugins/**` — U1–U3's, done.

## Verification

- `mise run site:check` green (`mise run p:site:check` if the task-groups plan
  landed first).
- `pnpm exec dprint check CLAUDE.md readme.md .claude/docs .claude/skills/vwf-plugin`
  green.
- `grep -rn 'future' site/src/content/docs/plugins/vwf.md .claude/skills/vwf-plugin/references/skills-and-agents.md | grep -i 'change-plan\|blueprint gap'`
  → nothing.
- `mise run plugins:check` still green.

## Guardrails

- Do not touch `plugins/**` or `plugin.json` (U5).
- `readme.md` is lowercase.
- Write with Write/Edit, never `cat` heredocs.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`docs(vwf): feedback's seventh route, archive's folders, the hidden import-*
skills`
— written by the orchestrator after the wave gate, not by the unit.
