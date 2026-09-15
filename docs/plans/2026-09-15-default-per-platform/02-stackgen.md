# U2 — stackgen: the contract text, the menu skill, and the flag on astro-ssg

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/stacks/readme.md`,
  `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`,
  `plugins/stackgen/stacks/bundles/astro-ssg.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/stacks/bundles/claude-code.md` (the existing
  flagged bundle — read for the frontmatter shape, never edit).

## Ruling

Decision 1: "Two flagged bundles on one axis conflict iff **either declares no
`platforms:` list, or their platform lists intersect**; the finding names both
files and the platform(s) they share. An axis whose flagged bundles all declare
platforms may therefore carry one flagged bundle per platform."

Decision 2: "vwf preselects the **one flagged entry among the entries offered on
the round** — the list it has already filtered by the project's platforms. The
menu payload shape is unchanged; the flag is still copied verbatim from the
bundle, never computed, and vwf still infers none."

Decision 3: "`astro-ssg` alone gains `default: true`. No backend, `webapp`,
`cli` or other platform's bundle is flagged by this plan."

## Edits

1. **`plugins/stackgen/assets/pack-format.md`** — `:206` (the frontmatter
   comment) and `:228-238` (the `default: true` paragraph): restate the rule as
   decision 1 — at most one flagged bundle per axis **per platform**, where a
   bundle declaring no `platforms:` covers every platform on its axis; two
   flagged bundles overlapping on a platform is the file-order nondeterminism
   the checker refuses. Keep the paragraph's voice and its "naming no tool"
   sentence.
2. **`plugins/stackgen/stacks/readme.md`** — `:126-127`: same restatement, in
   two lines.
3. **`plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`** — `:48-50`: the
   "copy, never compute" rule stands; add that more than one entry on an axis
   may carry the flag when their platforms differ, and that which one vwf
   highlights is vwf's per-round rule, not this skill's. The payload at `:74` is
   unchanged.
4. **`plugins/stackgen/stacks/bundles/astro-ssg.md`** — add `default: true` to
   the frontmatter, placed where `claude-code.md` places it. In the body, one
   sentence stating that this is the entry a `site` project's architecture round
   preselects, and that its three siblings are picked deliberately.

## Verification

- `mise run p:plugins:check` green — with or without U1 landed, since the
  project axis has no other flag.
- `mise run p:plugins:inventory -- --check` green (the flag is not an inventory
  fact).
- `command grep -c '^default: true' plugins/stackgen/stacks/bundles/astro-ssg.md`
  is `1`.
- `command grep -rn 'one per axis\|one bundle per axis' plugins/stackgen` has no
  hit without a per-platform qualification in the same sentence.

## Guardrails

- Touch nothing outside the four owned files. Report every other passage the
  edit falsifies as `DOCS FALSIFIED:` — especially
  `.claude/skills/stackgen-plugin/SKILL.md:93-98` and
  `site/src/content/docs/plugins/stackgen.md:294-299`, which U4 owns.
- `plugins/**/*.md` is **not** dprint-formatted: match the surrounding fold
  width by hand, never run a formatter over it.
- Strict-YAML frontmatter: `default: true` must be a bare boolean, not quoted.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen — default flag per (axis, platform); astro-ssg is the site default`
— written by the orchestrator after the wave gate, not by the unit.
