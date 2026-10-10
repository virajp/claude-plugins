# U2 — Docs: manual passage and the decision record

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `site/src/content/docs/plugins/vwf.md`,
  `docs/memory/decisions/2026-10-09-web-canvas-layout.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing. Run
  `vwf:docs-sync` over this run's branch delta first, and apply its findings
  only inside the Owns list above.
- **Lazy-load:**
  `docs/memory/decisions/2026-09-23-watch-tv-spatial-platforms.md` — for the
  header format of the decision record.

## Ruling

From index.md, decisions 1 to 6 and decision 8:

- Decision 8 — the docs unit writes
  `docs/memory/decisions/2026-10-09-web-canvas-layout.md` with rulings 1 to 6.
  Rejected: no record.
- Decisions 1 to 6, quoted in full in index.md's assumed decisions table, are
  what the record and the manual describe: the `site` and `webapp` frames
  (1440×900 browser chrome, a `width` tweak to 390×844 mobile browser), one
  frame per code, import diffs the 1440 layout, `desktop` is a neutral native
  app window, `prompt-mode.md` agrees, `design.viewports` stays device-only.

## Edits

1. **`docs/memory/decisions/2026-10-09-web-canvas-layout.md`** — new file. Use
   the header format of `2026-09-23-watch-tv-spatial-platforms.md`: Date,
   Branch, Plan (a link to `docs/plans/2026-10-09-web-canvas-layout/index.md`).
   Sections: the defect (B59: no `site` or `webapp` block, desktop described as
   browser-chrome); the decisions (rulings 1 to 6, each with its rejected
   alternative); not in scope (B58 frame sizes and OS chrome, `cli`, the import
   payload shape).
2. **`site/src/content/docs/plugins/vwf.md` ~:2319-2363** — in the conventions
   file passage, add the `site` and `webapp` frames and the `width` tweak to the
   default viewport list (~:2330), and say `desktop` renders in a native app
   window. Change only the passages this plan falsifies.
3. Every `DOCS FALSIFIED:` line U1 returned that falls inside the Owns list.
   Report one outside it under DOCS FALSIFIED again.

## Verification

- `mise run p:site:check` — green.
- `grep -n 'webapp' site/src/content/docs/plugins/vwf.md` — a match in the
  conventions passage.
- The decision record names rulings 1 to 6 and the plan path.

## Guardrails

- Do not edit any file outside the Owns list. Report a passage outside it under
  DOCS FALSIFIED.
- Do not edit `readme.md` or `CLAUDE.md` here.
- Keep the decision record's rulings identical in meaning to index.md.
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >`.

## Commit

`docs: record the web canvas layout and the native desktop frame`
