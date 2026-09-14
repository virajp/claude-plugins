# U6 — docs

- **Wave:** 3
- **Depends on:** all
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-14-flutter-does-not-cover-webapp.md` (new),
  `docs/backlog.md` (only if docs-sync finds a passage — no ids are covered)
- **Model:** opus
- **Read first:** `index.md`'s Goal, the "Docs the change falsifies" paragraph
  of its Facts, decisions 1–5; the `vwf:docs-sync` skill at
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (standalone mode, over the
  branch delta `develop..HEAD`); `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` for
  the decisions-doc shape, and one existing doc as the pattern —
  `docs/memory/decisions/2026-09-05-worktree-init-becomes-setup-worktree.md`.
- **Lazy-load:** each file a finding points at, at the pointer.

## Ruling

The reversal, confirmed: "Flutter's platform set becomes
`mobile, tablet,
desktop, auto` everywhere — pack, bundle, vwf assets, the
`pick-and-trade.md` argument rewritten to say web is not offered — and the docs
unit writes `docs/memory/decisions/2026-09-14-flutter-does-not-cover-webapp.md`
recording it."

Decision 1 (the skip loop is gone — no cap, no second bump), decision 2 (the
pnpm pack's `audit` is advisory), decision 3 (this repo's deps verbs are the
pack's). Docs describe what is true after the run, in the present tense, and
never narrate the change.

## Edits

1. Run `vwf:docs-sync` in standalone mode over `develop..HEAD`; hold its
   findings.
2. **The skip-loop passages** — `CLAUDE.md:335-339` ("skip past… bumping again
   at the same level and printing what they skipped, capped at ten attempts
   since a patch bump never clears a forbidden minor") becomes: the two version
   tasks compute the target first, stepping the bumped component past 13 and 17,
   and bump once, printing what they skipped. Same at
   `.claude/docs/ci-and-releases.md:62,87,269,276` and
   `.claude/skills/release/SKILL.md:93,133,145,193,203` — each mention of the
   loop, the cap, or "bumping again".
3. **The deps passages** —
   `site/src/content/docs/plugins/stackgen.md:723-725,735-737,855-860,887` and
   `site/src/content/docs/plugins/vwf.md:2430`: confirm each is true of the
   fixed pack (advisory audit; `--depth` gone) and edit only what is not. Say in
   `DECIDED:` which needed nothing.
4. **The Flutter passages** —
   `site/src/content/docs/how-to/greenfield/ui-with-design-tool.md:81` ("serving
   mobile, tablet, desktop, webapp and the car") and
   `site/src/content/docs/plugins/vwf.md:586` ("five surfaces from one
   codebase") → four, no web; plus every hit of
   `command grep -rn -i "flutter" readme.md CLAUDE.md .claude/ site/src/content/docs/ | command grep -i "webapp\|five\|web "`.
5. **The decisions doc** — write
   `docs/memory/decisions/2026-09-14-flutter-does-not-cover-webapp.md` in the
   pattern file's shape: date, branch, what it reverses (the five-platform
   coverage in vwf's assets and the Flutter pack; the `pick-and-trade.md`
   argument), what was decided before, what changed, why (a `webapp` is a
   stylesheet-axis project on a web stack; Flutter's web target shares none of
   that stack; the cover check already refuses the pairing once the list
   narrows), what it costs (a product that declared `webapp` on a Flutter
   project fails doctor's cover check until it re-declares; the user's words "As
   of now we will NOT support Flutter for webapp" — "as of now" is the door left
   open).
6. Apply every `DOCS FALSIFIED:` line U1–U5 returned, and docs-sync's findings.
7. `.claude/skills/stackgen-plugin/**` and `.claude/skills/vwf-plugin/**` — grep
   for "five platforms", "webapp" beside Flutter, "capped at ten", and fix.

## Verification

- `command grep -rn "capped at ten\|ten attempts\|bumping again" CLAUDE.md .claude/ readme.md site/src/content/docs/`
  is empty.
- `command grep -rn -i "flutter" readme.md CLAUDE.md .claude/ site/src/content/docs/ | command grep -i "webapp\|five surfaces\|five platforms"`
  is empty.
- `test -f docs/memory/decisions/2026-09-14-flutter-does-not-cover-webapp.md`.
- `mise run p:site:check` green; `mise run code:format` and `mise run code:lint`
  green over the owned files (`readme.md`, `CLAUDE.md`, `.claude/**` and
  `site/**` markdown are dprint-formatted; run `dprint fmt` on exactly the files
  you touched, never tree-wide).

## Guardrails

- Never end a table cell in a bare `*`; never write `npm` after a pipe; no
  escaped backticks inside code spans.
- Touch no `plugins/**` file — the manual is yours, the plugin trees are not.
- Do not edit `docs/backlog.md` unless docs-sync points at a passage in it.
- Delete with `rm`, never `git rm`; stage nothing.

## Commit

`docs: version skip in one bump, pnpm 12 deps verbs, Flutter covers four platforms`
— written by the orchestrator after the wave gate, not by the unit.
