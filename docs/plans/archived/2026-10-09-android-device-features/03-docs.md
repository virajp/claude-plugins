# U3 — Docs: manual pages and the decision record

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/plugins/stackgen.md`,
  `docs/memory/decisions/2026-10-09-android-device-features.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing. Run
  `vwf:docs-sync` over this run's branch delta first, and apply its findings
  only inside the Owns list above.
- **Lazy-load:**
  `docs/memory/decisions/2026-10-09-structured-platform-features.md` — for the
  header format of the decision record.

## Ruling

From index.md, decision 8:

- Decision 8 — the docs unit writes
  `docs/memory/decisions/2026-10-09-android-device-features.md`. Its Owns list
  is fixed. A falsified passage outside it is reported in DOCS FALSIFIED, not
  edited.

## Edits

1. **`docs/memory/decisions/2026-10-09-android-device-features.md`** — new file.
   Use the header format of `2026-10-09-structured-platform-features.md`: Date,
   Branch, Plan (a link to
   `docs/plans/2026-10-09-android-device-features/index.md`). Sections: what was
   decided before (folder 1's `android:<vendor>` reserve); the decisions
   (rulings 1 to 5 from index.md, each with its rejected alternative); the
   vendor research and why no worked case ships; not in scope (worked cases,
   frame sizes, XR).
2. **`site/src/content/docs/plugins/vwf.md`** — update the passage that lists
   the `features:` scope values, so it names the two Android values on `mobile`.
   Change only the falsified passage.
3. **`site/src/content/docs/plugins/stackgen.md`** — update the passage that
   describes the Compose pack's device features, so it says the rule ships and
   no vendor worked case does. Change only the falsified passage.

## Verification

- `mise run p:site:check` — green.
- `grep -n 'android:samsung' site/src/content/docs/plugins/vwf.md` — at least
  one match.
- The decision record names the vendor research result, the rule-only outcome
  and the plan path.

## Guardrails

- Do not edit any file outside the Owns list. Report a passage outside it under
  DOCS FALSIFIED.
- Do not edit `readme.md` or `CLAUDE.md` here. Report a falsified passage in
  them under DOCS FALSIFIED.
- Keep the decision record's rulings identical in meaning to index.md.
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >`.

## Commit

`docs: record Android device-family scope values and the rule-only outcome`
