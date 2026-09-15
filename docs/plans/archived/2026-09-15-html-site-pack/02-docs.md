# U2 — docs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/readme.md`,
  `.claude/skills/stackgen-plugin/**`, `.claude/docs/**`, `CLAUDE.md`,
  `readme.md`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-15-html-site-pack.md`
- **Model:** opus
- **Read first:** `index.md`'s Goal, Facts and Assumed decisions; every
  `DOCS FALSIFIED:` line the orchestrator passes from U1; the landed
  `plugins/stackgen/stacks/framework/html/conventions.md` and
  `stacks/bundles/html.md` (read only — describe them, never edit them); then
  each owned file the survey pointed at.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`;
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`;
  `docs/memory/decisions/2026-09-06-astro-four-modes-four-bundles.md` and
  `docs/memory/decisions/2026-09-15-default-per-platform.md` (the records the
  new one cites).

## Ruling

Decision 10: "U2 writes `docs/memory/decisions/2026-09-15-html-site-pack.md` per
`assets/memory.md`: the pack, the one-bundle reversal, decisions 1, 3, 7 and 8
with their rejected alternatives, and the parked mechanism."

The Goal's reversal, to be recorded as one: "the first ruling was 'both, as two
bundles' (`html-static` with no build, `html-vite` with Vite); the user then
generalised to **one bundle**, `html`, with Vite as dev server and the build
shape a documented choice."

Decisions 1–8 as the facts the docs describe — quoted in `index.md`; describe,
never restate differently.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta; apply its findings within
   the owned paths.
2. The passages the survey found:
   - `site/src/content/docs/plugins/stackgen.md:67-79` — the "Four bundles on
     one pack" section stays about Astro; add one paragraph after it: the `site`
     platform's fifth entry, `html`, on the `framework/html` pack, and what
     picks it over `astro-ssg`. `:93`, `:117`, `:148` — recheck each "four" and
     "all four bundles": still true when it counts Astro's bundles, falsified
     when it counts the site platform's. `:214-218` — "Three framework packs
     ship today" becomes four, naming `html`.
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md:57-64` — "A
     `site` project picks between four Astro bundles" becomes five entries,
     `astro-ssg` preselected, `html` for a hand-authored page tree.
   - `plugins/stackgen/stacks/readme.md:281-283` — "the third `framework/` pack,
     beside effect and astro" gains `html` as the fourth, with its category
     `document`.
   - `.claude/skills/stackgen-plugin/SKILL.md` — the pack inventory prose: the
     framework packs, the bundle count if stated, the `document` category.
   - `readme.md`, `.claude/docs/plugins.md`, `CLAUDE.md` — check for a
     framework-pack or site-bundle count; edit only what is falsified.
3. Every `DOCS FALSIFIED:` line U1 returned.
4. **`docs/memory/decisions/2026-09-15-html-site-pack.md`** — new, per
   `assets/memory.md`'s decision shape: what was decided before (Astro's four
   bundles were the site platform's whole menu; the stylesheet axis of
   2026-09-14), what changed (the pack, the bundle, the `document` token), the
   reversal (two bundles → one, and why: one dependency either way, the build
   shape is a doctrine choice), why Vite over `sirv-cli`/caddy/ `live-server`,
   decisions 7 and 8 with their rejected alternatives, and the parked
   stylesheet-compatibility mechanism with its agreed design copied from
   `index.md`'s Parked list.

## Verification

- `mise run p:site:check` green.
- `mise run p:plugins:check` green.
- `command grep -rn 'three framework packs\|Three framework packs\|four Astro bundles\|between four' site/src/content/docs plugins/stackgen/stacks/readme.md .claude readme.md CLAUDE.md`
  — every remaining hit is one that counts Astro's own bundles, read each.
- `command test -f docs/memory/decisions/2026-09-15-html-site-pack.md`.

## Guardrails

- Touch nothing outside the owned paths; never edit
  `plugins/stackgen/stacks/framework/**`, `stacks/bundles/**`, `assets/**` — a
  wrong passage there is a `GAP:` naming file and line.
- `plugins/stackgen/stacks/readme.md` is **not** dprint-formatted — fold by
  hand. `CLAUDE.md`, `readme.md`, `.claude/**` and `site/**` markdown **are**:
  run `mise run code:format --fix` over the files you edited only.
- Never end a table cell in a bare asterisk; no escaped backticks inside code
  spans.
- Delete with `rm`, never `git rm`.

## Commit

`docs: html site pack — manual, repo docs, decision record` — written by the
orchestrator after the wave gate, not by the unit.
