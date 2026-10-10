# U9 — SwiftUI router: rows for the eleven integrations

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the whole `SKILL.md`; the H1 and lead of each of the sixteen
  files in `references/integrations/`.

## Ruling

> - Decision T7: Each router gains one row per new file in its two-column Wiring
>   and Read table, after the files exist (S4). SwiftUI's lead-in drops "Apple"
>   so it reads "One per integration".

## Edits

1. **`SKILL.md:55-57`** — "One per **Apple** integration" becomes "One per
   integration"; keep the rest of the sentence.
2. **`SKILL.md:59-65`** — add eleven rows in the existing row style: the five
   Apple rows first as they are, then `maps-and-location.md` and `webview.md`,
   then the six Firebase files, then `revenuecat.md`, `image-handling.md`,
   `webrtc.md`. Each Read cell links the file in the same relative form the
   existing rows use.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- Sixteen rows; each link resolves, and each file in `references/integrations/`
  has one row.

## Guardrails

- Touch nothing outside `SKILL.md`; do not change its frontmatter (T8).
- `plugins/**/*.md` is not dprint-formatted — pad the table by hand.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: swiftui pack — route the eleven new integrations`
