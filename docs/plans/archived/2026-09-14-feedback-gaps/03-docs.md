# U3 — docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`,
  `docs/backlog.md`, `docs/memory/decisions/2026-09-14-feedback-gaps.md` (new)
- **Model:** opus
- **Read first:** `index.md`'s Goal, Facts ("Enumerations of the kinds") and
  Assumed decisions; every `DOCS FALSIFIED:` line the orchestrator passes in;
  then run `vwf:docs-sync` over the branch delta
  (`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and apply its findings.
- **Lazy-load:** each doc below at the cited passage; the newest file under
  `docs/memory/decisions/` for the decisions-doc shape;
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.

## Ruling

Decision 8: "One decisions doc records the scoping ruling (one hop kept, chain
rejected) and the eighth kind, so the next feedback plan does not re-open them."

Decisions 1–6 as written in index.md — quote 1, 2 and 3 into the decisions doc
verbatim.

Group A's decision 12, applied here: the docs unit edits `docs/backlog.md` by
hand, because the backlog skill is not loaded in the run session.

## Edits

Apply `docs-sync`'s findings first, then reconcile this list by section:

1. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** ~36 — the
   feedback row: eight kinds, the shape-change route, the build-state line; the
   product row: the argument.
2. **`.claude/skills/vwf-plugin/SKILL.md`** ~59, 191, 199 — check each mention;
   change only a passage that counts the kinds or says feedback never reaches
   architecture.
3. **`site/src/content/docs/plugins/vwf.md`** — the feedback section (heading
   ~1917): an eighth bullet **Shape change** in the kind list (~1923–1943), a
   short paragraph on the build-state line and the path line, the feature idea
   bullet reworded per decision 4; the examples (~1947–1948) gain one
   shape-change example; ~793–794 (feedback reaching architecture) is now true —
   keep, reword if it names the mechanism; the product row (~773): the new
   argument hint; the `### /vwf:product` section: one sentence on the note.
4. **`site/src/content/docs/how-to/operate/production-feedback-loop.md`** — "any
   of seven" (~188–190) and "seventh kind" (~243) become eight; a new short
   section for the shape change beside the others; one paragraph on the
   build-state line where the loop describes what feedback prints.
5. **`site/src/content/docs/how-to/operate/ad-hoc-change.md`** ~47–48 — "seven
   classes" becomes eight.
6. **`readme.md`** ~22 and **`CLAUDE.md`** ~15, ~240 — the intake sentences gain
   "a shape change" where they list what feedback takes; nothing else.
7. **`docs/backlog.md`** — row B05: status `done`; its section's last line
   `Planned in: docs/plans/2026-09-14-feedback-gaps/` (already `planned` at
   approval; flip to `done`). Touch no other row.
8. **`docs/memory/decisions/2026-09-14-feedback-gaps.md`** — create. Title:
   "Decision — feedback keeps one hop, gains a shape-change kind and a
   build-state line". Sections in the directory's shape: what was decided before
   (the 2026-09-10 seventh kind; the 2026-09-13 backlog/feedback distinction,
   cited by its group A decisions doc); the ruling (decisions 1, 2, 3 verbatim,
   4–6 summarised); why (the user's B05 words and definition); rejected
   (feedback driving the chain; a lifecycle key; a flag on every kind; closing
   B05 as covered).

## Verification

- `mise run p:site:check` green.
- `command grep -rn "seven kinds\|any of seven\|seventh kind\|seven classes" .claude site/src/content/docs readme.md CLAUDE.md`
  is empty.
- `command grep -rln "Shape change\|shape change" .claude/skills/vwf-plugin site/src/content/docs/plugins/vwf.md site/src/content/docs/how-to/operate/production-feedback-loop.md`
  lists all three.
- `command ls docs/memory/decisions/2026-09-14-feedback-gaps.md`.

## Guardrails

- Touch nothing under `plugins/` (U1, U2) or any version file (U4).
- `CLAUDE.md`, `readme.md`, `.claude/**/*.md` and the site docs **are**
  dprint-formatted: run `mise run code:format` before returning; never end a
  table cell in a bare `*`.
- The site's link rule and markdown mirror are in `site/CLAUDE.md`.
- Groups A and B may have changed neighbouring passages; edit what is on disk,
  not the survey's quoted text.
- Delete with `rm`, never `git rm`.

## Commit

`docs: feedback's eighth kind, build state and product note across the manual
and repo docs`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`docs`; no scopes).
