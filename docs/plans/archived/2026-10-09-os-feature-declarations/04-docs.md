# U4 — Docs: manual pages and the decision record

- **Wave:** 3
- **Depends on:** U1, U2, U3
- **Owns:** `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/plugins/stackgen.md`,
  `docs/memory/decisions/2026-10-09-structured-platform-features.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing. Run
  `vwf:docs-sync` over this run's branch delta first, and apply its findings
  only inside the Owns list above.
- **Lazy-load:**
  `docs/memory/decisions/2026-09-23-watch-tv-spatial-platforms.md` — for the
  header format of the decision record.

## Ruling

From index.md, decision 10 and the confirmed reversal:

- Decision 10 — the docs unit writes the decision record for the reversal and
  updates the site pages. Its Owns list is fixed. A falsified passage outside it
  is reported in DOCS FALSIFIED, not edited.
- Reversal, confirmed by the user on 2026-10-09 — the prose-only rule for OS and
  vendor differences becomes a structured `features:` entry. No vendor token is
  added.

## Edits

1. **`docs/memory/decisions/2026-10-09-structured-platform-features.md`** — new
   file. Use the header format of `2026-09-23-watch-tv-spatial-platforms.md`:
   Date, Branch, Plan (a link to
   `docs/plans/2026-10-09-os-feature-declarations/index.md`). Sections: what was
   decided before (the prose-only rule, with its file:line sources); the
   decisions (rulings 1 to 6 from index.md, each with its rejected alternative);
   the reversal and who confirmed it; not in scope (Android, frame sizes, XR).
2. **`site/src/content/docs/plugins/vwf.md`** — update the passage that
   describes platform deviations, so it names the `features:` list and its three
   keys. Change only the passages this plan falsifies.
3. **`site/src/content/docs/plugins/stackgen.md`** — update the passage that
   says device and OS features are out of scope for the SwiftUI pack. It now
   says a declared feature is built behind an availability guard. Change only
   the falsified passage.

## Verification

- `mise run p:site:check` — green.
- `grep -n 'features:' site/src/content/docs/plugins/vwf.md` — at least one
  match.
- `grep -n 'out of scope' site/src/content/docs/plugins/stackgen.md` — no match
  for the device-feature statement.
- The decision record names the reversal, the confirmation date and the plan
  path.

## Guardrails

- Do not edit any file outside the Owns list. Report a passage outside it under
  DOCS FALSIFIED.
- Do not edit `readme.md` or `CLAUDE.md` here. If docs-sync finds a falsified
  passage in them, report it under DOCS FALSIFIED.
- Keep the decision record's rulings identical in meaning to index.md.
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >`.

## Commit

`docs: record structured OS-specific feature declarations`
