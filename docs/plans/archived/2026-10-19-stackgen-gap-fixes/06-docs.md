# U5 — Docs and the decision record

- **Wave:** 3
- **Depends on:** U1, U2, U3, U4, R1
- **Owns:** `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`,
  `.claude/skills/**`, `.claude/docs/**`, `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-10-19-stackgen-gap-fixes.md` (new), and any other
  human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to U4 and U6
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; the U1 to U4
  diffs and their `DOCS FALSIFIED:` lines; then each owned passage before
  editing it.

## Ruling

> **Goal.** After the plan lands, every 2026-10-18 ruling that falls to this
> repo for the three live folders `2026-10-09-android-compose-stack`,
> `2026-10-09-kotlin-language-stack` and `2026-10-10-os-device-frames` is true
> in the packs and the docs, so all three folders can be archived.

One reversal, confirmed by the user on 2026-10-18: Android G3 was ruled on
2026-10-10 as "keep `app-framework` for Compose, the reason stays in
`conventions.md`". The 2026-10-18 ruling also records the Compose case in the
four-part test of `kinds.md` (D1).

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1 to U4 returned.
2. **`site/src/content/docs/plugins/stackgen.md`** — the passages on the
   Android, Compose and Kotlin packs that the diffs falsified: the environment
   field (D4), goldens on Linux CI (D3), the explicit qualifiers (D8), the
   version-catalog manifest (D9), the STRICT lock rule (D11), and
   `test:e2e --connected` with `--variant` (D7).
3. **`plugins/stackgen/stacks/readme.md`** — the `test:e2e` sentence ("…or
   `connectedCheck` under `-- --connected`"): D7.
4. **`site/src/content/docs/plugins/vwf.md`** — the short frame table copy: any
   size U4 corrected, and one sentence that the full tables cite their sources.
5. **`docs/memory/decisions/2026-10-19-stackgen-gap-fixes.md`** (new), in the
   shape of the other docs in that folder: the date, the branch, a link to this
   plan folder, the three folders whose gaps it takes. Then: the reversal above,
   named as a reversal; the decisions D1 to D17 with their rejected
   alternatives; the frame sources U4 found, with their URLs; and Out of scope
   from index.md (the bootstrap inputs in item B03).

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit a file in the Owns of U1 to U4 or U6 — a falsified passage there is
  reported as `UNRESOLVED:` naming the unit, not fixed here.
- `site/src/content/docs/**/*.md` and `docs/**/*.md` are formatted by dprint:
  keep each code span on one line, and never end a table cell in a bare `*`.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns. Delete
  with `rm`, never `git rm`.

## Commit

`docs: reconcile the manual with the stackgen gap fixes and record the decisions`
