# U5 — docs: the manual, the how-to and the repo maps follow wave 1

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/how-to/operate/ad-hoc-change.md`,
  `.claude/skills/vwf-plugin/**`, `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `docs/memory/decisions/**` (none expected — no reversal)
- **Model:** opus
- **Read first:** `vwf:docs-sync`'s standalone mode
  (`plugins/vwf/skills/docs-sync/SKILL.md`), then the wave-1 diff
  (`git diff <develop>..HEAD -- plugins/vwf/skills`) once, then the survey list
  below.
- **Lazy-load:** the owned docs, at the cited lines.

## Ruling

This is the fixed docs unit: it runs `vwf:docs-sync` over the run's branch delta
and applies its findings plus every `DOCS FALSIFIED:` line U1–U4 returned, plus
the survey list. No reversal was confirmed, so no decisions doc is written.

## Edits

1. Run `vwf:docs-sync` in standalone mode over the branch delta; apply its
   findings.
2. Apply every `DOCS FALSIFIED:` line the orchestrator hands you from U1–U4.
3. The survey list, whichever of these docs-sync did not already name:
   - `site/src/content/docs/plugins/vwf.md` — `#vwfchange-plan` (`:1639-1698`):
     the survey now reads the commit convention and greps a retired name; the
     wave-gate sentence. `#vwfchange-execute` (`:1699-1780`, commit per green
     unit `:1727`): staging by Owns; a nobody-owned docs finding goes to the
     docs unit as a GAP. `#vwfgit-workflow` (`:1888-1904`): nothing changes in
     what it says — confirm. The init section (`:795+`): one sentence on the
     move-and-shim case if it describes the existing-repo survey at all;
     otherwise nothing.
   - `site/src/content/docs/how-to/operate/ad-hoc-change.md:62` (survey), `:109`
     (one unit one commit), `:138` — the same three facts in how-to voice.
   - `.claude/skills/vwf-plugin/SKILL.md:60-61,154-156` and
     `references/skills-and-agents.md:36,40,41` — only if a sentence there
     describes the pair's survey or commit step in a way wave 1 falsified.
   - `readme.md:222-224`, `CLAUDE.md:49-50,65` — expected untouched; confirm.
4. Nothing under `plugins/**` — those are U1–U4's and are done.

## Verification

- `mise run site:check` green (the manual's links and the markdown mirror).
- `pnpm exec dprint check CLAUDE.md readme.md .claude/docs .claude/skills/vwf-plugin`
  green (these **are** dprint's).
- `grep -rn 'git rm' site/src/content/docs/plugins/vwf.md site/src/content/docs/how-to/operate/ad-hoc-change.md`
  → only sentences that forbid it, if any.
- `mise run plugins:check` still green.

## Guardrails

- Do not touch `plugins/**` or `plugin.json` (U6).
- `readme.md` is lowercase.
- Write with Write/Edit, never `cat` heredocs.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`docs(vwf): the pair's manual and how-to follow the hardening` — written by the
orchestrator after the wave gate, not by the unit.
