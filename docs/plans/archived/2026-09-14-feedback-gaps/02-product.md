# U2 — product accepts a feedback note

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/product/SKILL.md`
- **Model:** opus
- **Read first:** the owned file, top to bottom (frontmatter 1–15; update mode
  43–48; the interview's first question).
- **Lazy-load:** `plugins/vwf/skills/feedback/SKILL.md` 126–130 (the feature
  idea route that will pass the note) — read only, U1 is rewriting it.

## Ruling

Decision 1: "Fill the four gaps; keep one doc edit, one offered command and one
hand-off per report."

Decision 6: "`argument-hint: "[feedback note]"`; in update mode the note seeds
the delta questions (a pivot, a new or retired goal, a metric change, a re-rank)
and is quoted in the run's first question; create mode ignores it. Nothing else
in product changes."

Decision 4 (the caller's spelling): "an idea that implies a goal `product.md`
does not serve → `/vwf:product <note>` first, then the unit."

## Edits

1. **Frontmatter** — `argument-hint: "(no args; detects create vs update)"` (7)
   becomes
   `argument-hint: "[feedback note — optional; seeds the update
   questions]"`.
   Quote it; strict YAML.
2. **Update mode** (43–48) — one paragraph: when an argument is given, it is a
   feedback note (usually handed over by `/vwf:feedback`'s feature-idea route);
   quote it verbatim in the first question of the update interview and let it
   seed which deltas are asked first — a pivot, a new or retired goal, a metric
   change, a re-rank. The Metric readings appendix intake (45–48) is unchanged
   and still read first.
3. **Create mode** — one sentence where create is detected: an argument is
   ignored in create mode; the interview starts from nothing.

## Verification

- `mise run p:plugins:check` green (strict-YAML frontmatter).
- `command grep -n "feedback note" plugins/vwf/skills/product/SKILL.md` shows
  the hint and the update paragraph.
- `command git diff --stat -- plugins/vwf/skills/product/SKILL.md` shows one
  file; no section other than the frontmatter, update mode and the create
  sentence changes.

## Guardrails

- Touch nothing outside the one file; feedback is U1's; docs are U3's.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Delete with `rm`, never `git rm`.

## Commit

`feat: product takes a feedback note as its argument in update mode` — written
by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
