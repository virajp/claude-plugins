# U3 — doctor: one remedy, `/vwf:setup reshape`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/**` (`SKILL.md`,
  `references/stack-checks.md`, `references/harness-and-memory.md`,
  `references/code-intelligence.md`)
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** none.

## Ruling

The user's answer in the interview, on the remedy doctor prints for repo-shape
findings (the absent shape and the four §5 drift rows):

> `/vwf:setup reshape`, once

From index.md's assumed decisions:

> **4.** The `stack-checks.md:202-217` no-mise-config finding prints the same
> `/vwf:setup reshape` as the §5 rows.

And the reversal index.md records, which this unit's text must make true:

> `plugins/vwf/skills/doctor/references/stack-checks.md:212-215` states
> "`/vwf:setup` is not the remedy: it checks whether the repo is shaped and
> offers `/vwf:init`". Reversed: doctor prints `/vwf:setup reshape`, once, for
> the absent shape and for every §5 drift row.

## Edits

1. **`SKILL.md:172-178` (§9 severity).** The repo-shape check is still `drift`,
   never blocking. Where it names "the baseline `/vwf:init` lays down", init
   stays as the actor. Where it names the remedy, `/vwf:setup reshape`.
2. **`SKILL.md:202-206` ("One remedy, printed once").** The one remedy is
   `/vwf:setup reshape`. Keep the sentence that doctor does not apply it and
   why; recast "re-shaping a repo is `/vwf:init`'s consent to take" so the
   consent is still init's (init asks it) and the door is setup's.
3. **`SKILL.md:199-201`** (the general escape hatch nudging `/vwf:setup`) — no
   change unless it now reads as the same remedy; if a reader could confuse the
   two nudges, add the one word that separates a config-side nudge (`setup`)
   from a shape-side one (`setup reshape`).
4. **`references/stack-checks.md:202-217`** (no `.config/mise*.toml` at all).
   Remedy → `/vwf:setup reshape`. **Delete or invert** the sentence
   "`/vwf:setup` is not the remedy: it checks whether the repo is shaped and
   offers `/vwf:init`, and materializes no tooling itself" — the second half
   stays true (setup materializes nothing; init does), so keep that fact and
   drop the negation. Keep the framing that this is the coarse form of the §5
   question.
5. **`references/stack-checks.md:234-297`** ("The repo shape against its
   baseline"). `:242` "All four sub-checks carry the same remedy" →
   `/vwf:setup reshape`; `:285` and `:292` likewise; `:295-297` the closing
   sentence prints `/vwf:setup reshape` once and stops there. Sub-check (b)'s
   "id source changed" row stays word-for-word. Add nothing about how setup
   detects drift — that is setup's text (U2); doctor only says where to go.
6. **Everywhere in the owned tree**, a passage instructing a user to type
   `/vwf:init` changes per decision 5 of index.md; a passage naming init as the
   actor stays. `harness-and-memory.md` and `code-intelligence.md` are expected
   to need nothing; confirm by grep and report.

## Verification

- `mise run plugins:check` green.
- `grep -rn '/vwf:setup reshape' plugins/vwf/skills/doctor/` — hits at the §9
  severity block, the "one remedy" block, the no-mise-config finding, and the
  baseline block's closing sentence.
- `grep -rn 'is not the remedy' plugins/vwf/skills/doctor/` → nothing.
- `grep -rn '/vwf:init' plugins/vwf/skills/doctor/` — every remaining hit names
  init as the actor that lays the baseline down; none is a remedy line.
- markdownlint via the wave gate; fold width matched by hand.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/doctor/**`. Setup's detection text
  is U2's; init's is U1's; docs are U6's — report as `DOCS FALSIFIED:`.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Strict-YAML frontmatter untouched; `disable-model-invocation: false` (`:13`)
  stays.
- Rule 10: no technology named where the file does not already name one.
- Write with Write/Edit, never `cat` heredocs.

## Commit

Part of wave 1's commit — written by the orchestrator after the wave gate, not
by the unit.
