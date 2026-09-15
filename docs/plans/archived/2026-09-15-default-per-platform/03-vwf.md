# U3 — vwf: the adapter contract and the menu's preselect rule

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/stack-adapter.md`,
  `plugins/vwf/skills/architecture/SKILL.md`,
  `plugins/vwf/skills/architecture/references/stack-menu.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** nothing.

## Ruling

Decision 1: "Two flagged bundles on one axis conflict iff **either declares no
`platforms:` list, or their platform lists intersect**; the finding names both
files and the platform(s) they share. An axis whose flagged bundles all declare
platforms may therefore carry one flagged bundle per platform."

Decision 2: "vwf preselects the **one flagged entry among the entries offered on
the round** — the list it has already filtered by the project's platforms. The
menu payload shape is unchanged; the flag is still copied verbatim from the
bundle, never computed, and vwf still infers none."

## Edits

1. **`plugins/vwf/assets/stack-adapter.md`** — `:187` (the payload comment) and
   `:194-198`: the adapter may flag at most one entry per axis **per platform**
   — an entry declaring no platforms covers the whole axis — and vwf preselects
   the one flagged entry among those it offers on a round. Name no tool and no
   platform by example beyond the vocabulary the file already uses.
2. **`plugins/vwf/skills/architecture/SKILL.md`** — `:248-249`: "the one
   preselection it honours is an entry the adapter's menu payload flags
   `default: true`" gains "among the entries offered on that round".
3. **`plugins/vwf/skills/architecture/references/stack-menu.md`** — `:58-62`
   (the preselection order), `:120-121`, `:164-165`: the highlighted entry is
   the flagged one **among the entries the round offers** — after the platform
   filter at `:34` — so a flag on an entry filtered out of the round highlights
   nothing there. Two flagged entries reaching one round cannot happen when the
   adapter obeys its contract; if it does happen, highlight none and fall
   through to the previous project's answer (the next rule in the order). State
   that fallback in one sentence at `:58-62` only.

## Verification

- `mise run p:plugins:check` green.
- `command grep -rn 'at most one per axis\|one per axis' plugins/vwf` has no hit
  without a per-platform qualification in the same sentence.
- `command grep -rn 'astro' plugins/vwf` is empty — vwf names no technology.

## Guardrails

- Touch nothing outside the three owned files. Report every other passage the
  edit falsifies as `DOCS FALSIFIED:` — especially
  `site/src/content/docs/plugins/vwf.md:564-568`, which U4 owns.
- `plugins/**/*.md` is **not** dprint-formatted: match the surrounding fold
  width by hand, never run a formatter over it.
- No `config_format` or `blueprint_format` change — decision 4; do not touch
  `plugins/vwf/assets/vwf-config.md`.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf — architecture menu preselects the flagged entry offered on the round`
— written by the orchestrator after the wave gate, not by the unit.
