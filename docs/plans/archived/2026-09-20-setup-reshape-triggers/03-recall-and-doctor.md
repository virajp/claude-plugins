# U3 — recall's drift line, doctor's `baseline` invocation

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/recall/SKILL.md`,
  `plugins/vwf/skills/doctor/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/doctor/references/stack-checks.md:284-453`
  and the (g) predicate the forge-pass plan added (read, never edit — the
  predicates' definitions live there and this unit only names the subset).

## Ruling

Decision 3 — Recall nudge: "`/vwf:recall` evaluates doctor's **local** baseline
predicates — (a) through (f), file reads only, never the forge predicate (g) —
per repo of the product, and prints one line: the drifted repos, the failing
letters, and `/vwf:setup reshape`; silent when every repo is clean or when the
repo has never been shaped (no lockfile). Doctor gains a named **`baseline`**
invocation — the local predicates alone, no stack, no health, no memory checks —
which recall calls."

Decision 2 — Offer, not run: recall **prints** the line; it never invokes
`reshape` itself — the user runs it.

## Edits

1. **`plugins/vwf/skills/doctor/SKILL.md`** — a named invocation `baseline`
   (argument or mode, whichever the file's existing argument shape takes):
   evaluates predicates (a)–(f) per repo and returns the per-repo result and
   nothing else — no stack, health, memory, graphify or format checks, and never
   (g). State that it is what `/vwf:recall` calls, that it writes nothing, and
   that its output shape is one line per drifted repo with the failing letters.
   The "who calls it" passage, if one exists, gains recall.
2. **`plugins/vwf/skills/recall/SKILL.md`** — after the existing format-drift
   nudge (`:93`), a **shape-drift** line: invoke doctor's `baseline`; when it
   reports drift, print one line — the repos, the letters, and
   `/vwf:setup reshape`; when clean, or when the base has no materializer
   lockfile (never shaped), print nothing. It runs after the handoff and the
   plan index are read, before the palace recall, so a session sees it early.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "baseline" plugins/vwf/skills/doctor/SKILL.md plugins/vwf/skills/recall/SKILL.md`
  — hits in both.
- `grep -n "setup reshape" plugins/vwf/skills/recall/SKILL.md` — at least one
  hit.

## Guardrails

- Do not edit `doctor/references/stack-checks.md` — the predicates are defined
  there and this plan changes none of them.
- `setup/SKILL.md` (U1), `init/SKILL.md` (U4), `stackgen-sync/SKILL.md` (U2) are
  others'.
- No doc outside the two owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched — a change to doctor's `argument-hint` line,
  if the mode is an argument, keeps the strict-YAML quoting the file already
  uses.
- Delete with `rm`, never `git rm`.

## Commit

`feat: recall prints shape drift from doctor's baseline predicates` — written by
the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
