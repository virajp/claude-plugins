# U3 — pack-format doctrine: the block omits, JSON does not tolerate

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/pack-format.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom, before editing.
- **Lazy-load:** none.

## Ruling

Reversal, from index.md's Goal: the doctrine passage "JSON's own last-wins rule
then makes a key a person adds after the block beat the composed one"
(`pack-format.md:129-134`) is rewritten: a hand key wins because the block
**omits** it, not because JSON tolerates the duplicate.

Decision 1 — Collision handling: "… every top-level `settings` key, every
`nesting` parent, and every extension id that is present **outside** the block
and also in the composed set is a collision. Collisions are never resolved
silently — they are asked."

Decision 2 — the three choices, keep mine / take the pack's / union — named in
one sentence; the mechanics are init's (`fragments-and-sections.md`), not this
file's.

## Edits

1. **`plugins/stackgen/assets/pack-format.md:129-134`** — replace the last-wins
   sentence with: the composing skill omits from the block any key the file
   already carries outside it, so a hand key wins without a duplicate; what
   happens to such a key is the user's choice at composition time — keep, take
   or union — recorded by the composing skill. The block still sits first, and
   everything outside it still survives byte-for-byte unless the user chose
   otherwise for that key. Cite nothing by plugin path into vwf — name "the
   composing skill", as the file does today.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "last-wins" plugins/stackgen/assets/pack-format.md` — zero hits.

## Guardrails

- Only the one file. The hygiene pack's `conventions.md:139-141` and
  `repo-hygiene.jsonc:9-11` describe fragment-vs-fragment overrides and stay.
- No doc outside it — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`docs: pack-format — a hand key wins by omission, not by duplicate` — written by
the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
