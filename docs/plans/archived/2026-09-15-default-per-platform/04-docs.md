# U4 — docs

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `CLAUDE.md`, `readme.md`, `.claude/docs/**`,
  `.claude/skills/plugin-authoring/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-15-default-per-platform.md`
- **Model:** opus
- **Read first:** `index.md`'s Facts and Assumed decisions; every
  `DOCS
  FALSIFIED:` line the orchestrator passes from U1–U3; then each owned
  file the survey pointed at, top to bottom.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`;
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decision-record shape);
  `docs/memory/decisions/2026-09-06-astro-four-modes-four-bundles.md` (the
  record the new decision cites).

## Ruling

Decision 6: "The docs unit writes
`docs/memory/decisions/2026-09-15-default-per-platform.md` per
`assets/memory.md`, recording rule 1 and its rejected alternatives, and citing
the 2026-09-06 astro decision as the bundle it makes default."

Decision 1 (the rule the docs restate): "Two flagged bundles on one axis
conflict iff **either declares no `platforms:` list, or their platform lists
intersect**; the finding names both files and the platform(s) they share. An
axis whose flagged bundles all declare platforms may therefore carry one flagged
bundle per platform."

Decision 3: "`astro-ssg` alone gains `default: true`."

## Edits

1. Run `vwf:docs-sync` over the run's branch delta; apply its findings within
   the owned paths.
2. The passages the survey found, each restated per decision 1:
   - `CLAUDE.md:169-173` (the rule-14 sentence in the Tasks list)
   - `.claude/docs/repo-shape.md:209-213`
   - `.claude/skills/plugin-authoring/references/checks.md:192-200`
   - `.claude/skills/stackgen-plugin/SKILL.md:93-98`
   - `site/src/content/docs/plugins/vwf.md:564-568`
   - `site/src/content/docs/plugins/stackgen.md:294-299`
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md:57-64` — the
     four-Astro-bundles passage states that `astro-ssg` is the entry the round
     preselects
   - `readme.md:294` — check whether the design-axis sentence still reads true;
     edit only if falsified
3. Every `DOCS FALSIFIED:` line U1–U3 returned.
4. **`docs/memory/decisions/2026-09-15-default-per-platform.md`** — new, per
   `assets/memory.md`'s decision shape: what was decided before (per-axis,
   written 2026-09-15 with the design axis the only flagged one), what changed
   (decision 1, the flag on `astro-ssg`), why (a per-axis flag on the project
   axis preselects a site stack on backend rounds), the alternatives rejected
   (index.md's decision 1 and 2 rejected columns), and that the plain-HTML site
   pack plan stands on it.

## Verification

- `mise run p:site:check` green.
- `mise run p:plugins:check` green (the `.claude/skills/**` prose is scanned).
- `command grep -rn 'one per axis\|one bundle per axis\|at most one entry per axis\|at most one bundle per axis' CLAUDE.md readme.md .claude site/src/content/docs`
  has no hit without a per-platform qualification in the same sentence.
- `command test -f docs/memory/decisions/2026-09-15-default-per-platform.md`.

## Guardrails

- Touch nothing outside the owned paths; never edit `plugins/**` — a passage
  there that is still wrong is a `GAP:` naming the file and line.
- `CLAUDE.md`, `readme.md`, `.claude/**` and `site/**` markdown **are**
  dprint-formatted: run `mise run code:format --fix` over the files you edited
  only, and expect table re-padding in `CLAUDE.md`.
- Never end a table cell in a bare asterisk; no escaped backticks inside code
  spans.
- Delete with `rm`, never `git rm`.

## Commit

`docs: default flag per (axis, platform) — manual, repo docs, decision record` —
written by the orchestrator after the wave gate, not by the unit.
