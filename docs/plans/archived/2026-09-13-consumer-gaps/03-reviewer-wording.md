# U3 — reviewer checklist items read the same fast and slow

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/agents/product-reviewer.md`,
  `plugins/vwf/agents/blueprint-reviewer.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/product/references/validation.md:23-24`
  (the source rule — read, never edit);
  `plugins/vwf/assets/templates/product.md:107-108` (the table shape).

## Ruling

Decision 4: "The product-reviewer item is rewritten trigger-first: "Evidence is
required **only** once Status is `validated` or `invalidated`; a row still
`untested` correctly carries `—` and is **not** a gap." The three
blueprint-reviewer items at `:49-52`, `:93-95`, `:233-235` are rewritten the
same way — trigger first, the non-gap case stated explicitly — with no change in
meaning."

The source rule to stay consistent with (`validation.md:23-24`): "`Status` moves
`untested → validated | invalidated`; the `Evidence` cell is a link or one-line
source, required the moment status leaves `untested`."

Why: the agent returned the gap "all 5 rows have Status `untested` but Evidence
is `—`; the checklist requires an `untested` row to carry Evidence" — the
opposite of its own rule — and reported it had cross-checked the checklist. The
compressed "a row whose status left `untested` carries Evidence" inverts under a
quick read.

## Edits

1. **`plugins/vwf/agents/product-reviewer.md`** — the "Validation vocabulary"
   item (`:45-50`). Keep the item's label and its first clauses (free text
   outside the vocabulary is a gap; no row has an empty Status). Replace the
   final clause "and a row whose status left `untested` carries Evidence" with
   the trigger-first form: "Evidence is required **only** once Status is
   `validated` or `invalidated` — a missing Evidence cell on such a row is a
   gap; a row still `untested` correctly carries `—` and is **not** a gap." Keep
   the neighbours' shape (bold label, assertion, "… is a gap").
2. **`plugins/vwf/agents/blueprint-reviewer.md`** — three items, each rewritten
   so the trigger condition leads and the non-gap case is explicit, meaning
   unchanged:
   - `:49-52` — the sentence ending "is a gap unless the orchestrator passed a
     matching waiver": lead with the waiver — "Where the orchestrator passed a
     matching waiver, <the thing> is **not** a gap; without one it is."
   - `:93-95` — "complete whether it states a peak rate + p95 budget or carries
     the default token … only a missing cell is a gap": lead with the one gap
     case — "**Only a missing cell is a gap**: a cell that states a peak rate
     and a p95 budget, or that carries the default token, is complete."
   - `:233-235` — the deviation-note/waiver pair: split the double negative into
     two positive sentences — "A deviation note with a matching waiver, and a
     waiver with a matching doc note, are both complete. A deviation note
     **without** its waiver is a gap, and so is a waiver with no matching doc
     note." Touch nothing else in the file; `:221-224` (the stateDiagram item)
     is not in the ruling.

## Verification

- `command grep -n "left \`untested\`"
  plugins/vwf/agents/product-reviewer.md`is empty;`command grep -n "is
  \*\*not\*\* a gap" plugins/vwf/agents/product-reviewer.md` hits once.
- `command grep -c "is \*\*not\*\* a gap\|are both complete\|Only a missing cell is a gap" plugins/vwf/agents/blueprint-reviewer.md`
  is at least 3.
- `mise run p:plugins:check` green (rule 4: the agent frontmatter still parses;
  rule 7: agent cross-references unchanged).

## Guardrails

- Do not touch `design-system-reviewer.md`, `blueprint-coherence-reviewer.md` or
  any other agent — the survey found them clean.
- Do not edit `validation.md` or the product template — they are the anchor.
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand.

## Commit

`fix: reviewer checklist items lead with their trigger — untested rows carry no evidence`
— written by the orchestrator after the wave gate, not by the unit. Bare type.
