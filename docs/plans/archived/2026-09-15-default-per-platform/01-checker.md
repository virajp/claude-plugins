# U1 — checker: rule 14 becomes per (axis, platform)

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing — rule 14 is
  `check.ts:1265-1332`, its tests `check.test.ts:1090-1140`.
- **Lazy-load:** `plugins/stackgen/stacks/bundles/astro-ssg.md` and
  `claude-code.md` (the two real flagged shapes once U2 lands — read for the
  frontmatter shape only, never edit); `plugins/stackgen/assets/pack-format.md`
  for the bundle frontmatter keys.

## Ruling

Decision 1: "Two flagged bundles on one axis conflict iff **either declares no
`platforms:` list, or their platform lists intersect**; the finding names both
files and the platform(s) they share. An axis whose flagged bundles all declare
platforms may therefore carry one flagged bundle per platform."

Decision 5: "opus for every unit".

## Edits

1. **`scripts/src/check.ts`** — rule 14. Keep the boolean check as is (a string
   `"true"` remains a finding). Replace the per-axis grouping: collect every
   bundle whose `default` is boolean `true`, group by `axis`, and within each
   axis compare every pair. A pair is a finding when either bundle has no
   `platforms:` list (absent or empty) or the two lists share at least one
   platform. The finding message names both files, the axis, and — when both
   declare platforms — the shared platform(s); when one declares none, say that
   it declares no platforms and so covers every round on the axis. Update the
   rule's doc comment (`:1265-1273`) to state the widened rule in the same
   voice. Do not renumber the rule; do not change any other rule.
2. **`scripts/src/check.test.ts`** — rewrite the rule-14 block (`:1090-1140`) to
   four cases, each `it(...)` titled exactly:
   - `passes two flagged bundles on distinct axes` (existing case, kept)
   - `flags two flagged bundles on one axis when neither declares platforms`
     (the existing failing case, retitled)
   - `passes two flagged bundles on one axis with disjoint platforms` (project
     axis, `platforms: [site]` and `platforms: [backend]`)
   - `flags two flagged bundles on one axis when platforms intersect, or one declares none`
     (two sub-assertions: `[site, webapp]` vs `[webapp]` fails naming `webapp`;
     `[site]` vs no list fails)
   - keep the string-`"true"` case as is. Extend the `bundle(...)` fixture
     helper to accept a platforms line if it does not already.

## Verification

- `pnpm vitest run` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green on the real tree (with or without U2's flag
  landed — both states pass).
- `command grep -c "it(\"" scripts/src/check.test.ts` unchanged or +2 relative
  to the start (the block grows by two cases).

## Guardrails

- Touch nothing outside the two owned files. Do not edit any bundle, any
  `plugins/**` doc, or any repo doc — report those as `DOCS FALSIFIED:`.
- Delete with `rm`, never `git rm`.
- The tree under `scripts/` is dprint-formatted: run
  `mise run code:format --fix` over the two owned files only.
- Do not run `--fix` formatters over any other path; do not `git checkout` or
  `git restore` anything.

## Commit

`feat: checker — rule 14 default flag unique per (axis, platform)` — written by
the orchestrator after the wave gate, not by the unit.
