# U4 — the checker refuses two defaults on one axis

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `.claude/skills/plugin-authoring/references/checks.md`
- **Model:** opus
- **Read first:** `scripts/src/check.ts:1100-1165` (rule 8 — how bundles and
  design-tool packs are discovered and how a finding is shaped), the test file's
  existing rule-8 and rule-9 cases, and `checks.md:34-160` (the rule catalogue
  and its numbering).
- **Lazy-load:** `scripts/src/check.ts:76` (`check()` — where rules are called
  in order); `plugins/stackgen/assets/pack-format.md:186-200` (bundle
  frontmatter as it is today — U3 adds the key concurrently; assert on the key
  name from the ruling).

## Ruling

Quoted from `index.md`:

> **7 — Checker.** A new assertion under rule 9's neighbourhood: across
> `stacks/bundles/*.md`, **at most one bundle per axis** carries
> `default: true`, and the value is boolean. Reported with the two offending
> files.

> **1 — Slug and default.** … A bundle's frontmatter may carry `default: true`;
> … at most one per axis …

## Edits

1. **`scripts/src/check.ts`** — a new assertion, placed where the rule
   catalogue's numbering puts it (append as the next rule number after the last
   one `checks.md` lists, or fold into rule 9 if its prose is "the adapter
   surface" — pick whichever `checks.md`'s structure makes the smaller edit and
   say which in `DECIDED:`). Parse every `plugins/stackgen/stacks/bundles/*.md`
   frontmatter (reuse the parser rule 8 or the inventory generator already uses
   — do not add a YAML dependency); group by `axis`; for each axis, collect
   files whose `default` is exactly boolean `true`; a non-boolean `default` is a
   finding naming the file; two or more `true` on one axis is a finding naming
   every file. Zero flagged bundles is green.
2. **`scripts/src/check.test.ts`** — three cases in the existing fixture style:
   no bundle flagged → no finding; one flagged per axis → no finding; two
   flagged on `design` → one finding whose message names both files; plus one
   case for `default: "true"` (a string) → a finding.
3. **`.claude/skills/plugin-authoring/references/checks.md`** — the rule's entry
   in the catalogue, in the house shape (what it asserts, why, what it does not
   check), and the count in the file's opening line if it states one ("thirteen
   rules" becomes fourteen, or the rule-9 entry widens — match edit 1).

## Verification

- `pnpm vitest run` green, including the four new cases.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green on the wave-1 tree (no bundle carries the
  flag yet).
- `command grep -n 'default' scripts/src/check.ts` hits the new assertion.

## Guardrails

- Do not touch `plugins/**` — U1, U2, U3 run concurrently; U5 writes the bundle
  in wave 2.
- Do not touch `.claude/**` beyond `checks.md` — the rest is U6's.
- Do not add a dependency to `scripts/package.json`.
- Do not touch `CLAUDE.md` even where it counts the rules ("thirteen rules") —
  report it as `DOCS FALSIFIED:` for U6.
- Delete with `rm`, never `git rm`.
- `.claude/**/*.md` **is** dprint-formatted; let the formatter re-pad.
- Never end a table cell in a bare asterisk.

## Commit

`feat: checker — at most one default bundle per axis` — written by the
orchestrator after the wave gate, not by the unit. Type `feat` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
