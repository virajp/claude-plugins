# U5 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`,
  `.claude/skills/stackgen-plugin/**`, `.claude/docs/**`, `readme.md`,
  `CLAUDE.md`, `docs/memory/decisions/2026-09-23-watch-tv-spatial-platforms.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions sections, then every
  file you edit, top to bottom.

## Ruling

Quoted from index.md: D2, D3, D5, D6, D7, D8 and D11 — the whole table's rows
for those ids, which this unit restates in the manual and the decision doc. D11
in particular: "Fix the three already-stale passages the survey found, in files
this plan edits anyway."

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`), and apply its findings inside
   Owns.
2. **Apply every `DOCS FALSIFIED:` line** U1–U4 returned, as handed over by the
   orchestrator.
3. **The survey's list:**
   - `site/src/content/docs/plugins/vwf.md` — `:654,1988` the device lists gain
     the three; `:2052-2056` "**Seven platforms**" becomes the new count,
     counted from the list after the edit; `:2084,2194` examples only where they
     state the list as closed. Document the
     `design.viewports.<project>.<platform>` override where the manual describes
     the canvas pin.
   - **Stale, D11:** `vwf.md:400-401,432-433` — `web` becomes `site` or
     `webapp`, whichever the passage means; read the context.
   - `.claude/skills/vwf-plugin/references/docs-tree.md` — `:16-17` the
     per-platform `<platform>.md` files include the three; **stale, D11:**
     `:105` blueprint format **24** becomes **25**.
4. **The decision doc**
   `docs/memory/decisions/2026-09-23-watch-tv-spatial-platforms.md`, in the
   shape `plugins/vwf/assets/memory.md` gives: the three tokens and what each
   hides (D2), no pairing rule (D3), device class (D5), the interaction rules
   (D6), the viewport default and override (D7, D8), no format bump (D4), each
   with its rejected alternatives; and that it is plan 1 of 2 for B56.

## Verification

- `mise run p:site:check` green.
- `grep -nE '(six|seven|Six|Seven)[* ]+(screen )?platforms' site/src/content/docs`
  returns nothing.
- `grep -n 'blueprint.*24' .claude/skills/vwf-plugin/references/docs-tree.md`
  has no hit for the current format.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/`.
- `site/**`, `.claude/**`, `docs/**`, `readme.md` and `CLAUDE.md` are
  dprint-formatted: keep every code span on one line, never end a table cell in
  a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`docs: watch, tv and spatial platforms and device viewports — reconcile the manual`
