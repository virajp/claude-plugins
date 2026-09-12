# U3 — setup Step 0 cites the two new predicates

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/SKILL.md`. Touch nothing outside this
  list.
- **Model:** opus
- **Read first:** the owned file, top to bottom; Step 0 is `:79-108`, `reshape`
  is `:66-77`.
- **Lazy-load:** none.

## Ruling

Quoted from index.md:

> **7. Setup Step 0.** Cites predicates 5 and 6 by reference beside the four,
> never restating them.

## Edits

1. **`SKILL.md` Step 0** — where it says init is offered when the shape is
   missing or drifted "on the four baseline predicates `/vwf:doctor` owns", make
   it six, still by reference (the reference's heading, not the text). Nothing
   else.

## Verification

- `grep -n 'six' plugins/vwf/skills/setup/SKILL.md` hits in Step 0;
  `grep -n 'four baseline' …` is empty.
- `mise run p:plugins:check` green; frontmatter untouched.

## Guardrails

- One-line change. Do not touch `references/`.
- Strict-YAML frontmatter untouched.

## Commit

`docs: setup Step 0 cites doctor's six shape predicates` — written by the
orchestrator after the wave gate. Type `docs`; no scope.
