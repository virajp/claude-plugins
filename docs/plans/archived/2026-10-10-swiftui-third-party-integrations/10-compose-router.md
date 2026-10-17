# U10 — Compose router: rows for the thirteen integrations

- **Wave:** 2
- **Depends on:** U5, U6, U7
- **Owns:**
  `plugins/stackgen/stacks/app-framework/compose/skills/compose/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the whole `SKILL.md`; the H1 and lead of each of the twenty
  files in `references/integrations/`.

## Ruling

> - Decision T7: Each router gains one row per new file in its two-column Wiring
>   and Read table, after the files exist (S4). Compose's lead-in drops "Jetpack
>   library" so it reads "One per library the app wires".

## Edits

1. **`SKILL.md`, the lead-in of the "Integrations (topic 12)" section (about
   `:56`)** — "One per Jetpack library the app wires" becomes "One per library
   the app wires"; keep the rest.
2. **The Wiring and Read table (about `:59-67`)** — add thirteen rows in the
   existing row style: the seven Jetpack rows first as they are, then
   `maps-and-location.md`, `webview.md`, the six Firebase files,
   `credential-manager.md`, `revenuecat.md`, `image-handling.md`, `webrtc.md`,
   `in-app-updates.md`. Each Read cell links the file in the same relative form
   the existing rows use.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- Twenty rows; each link resolves, and each file in `references/integrations/`
  has one row.

## Guardrails

- Touch nothing outside `SKILL.md`; do not change its frontmatter (T8).
- `plugins/**/*.md` is not dprint-formatted — pad the table by hand.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: compose pack — route the thirteen new integrations`
