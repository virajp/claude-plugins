# U12 — Gates

- **Wave:** 5
- **Depends on:** U11
- **Owns:** `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Plan gate section.

## Ruling

The plan gate: `mise x -- mise run code:precommit`,
`mise x -- pnpm vitest run`, `mise x -- pnpm exec tsc --noEmit -p scripts`.

The gate delta, from index.md's Plan gate section: "U3 and then U12 run
`plan.mjs validate` on each JSON sample in the template, so the template and
the script must agree."

Decision 24: "A template sample that `plan.mjs validate` rejects is a failure:
U3's Verification validates each sample, and U12 returns `UNRESOLVED:` on a
red sample, which fails the run."

## Edits

1. Run `mise x -- mise run p:plugins:marketplace`. Expect no change (the plan
   adds skills, not plugins); keep what it writes.
2. For each fenced `json` block under the `## index.json` heading of
   `plugins/vwf/assets/templates/plan-folder.md`: write it to a temporary
   folder outside the repo as `index.json`, create an empty file for each
   unit's `file` and an `index.md` with a `- <id>:` line for each
   `backlog_pieces` id, and run
   `node plugins/vwf/skills/plan-management/scripts/plan.mjs validate <tmp>/index.json`.
   Each must exit 0. A red result is an `UNRESOLVED:` line that names the
   sample and each finding: it fails the run, so the template never ships
   with a sample that the script rejects (decision 24). Do not edit the
   template; it is U3's.
3. Run each plan gate line once and report its result.

## Verification

- Each line of the plan gate is green.
- Each template sample validates.

## Guardrails

- Touch nothing but the generated file. Write temporary files under `/tmp`
  only, and remove them after.
- Bump no version.

## Commit

`ops: regenerate the marketplace manifest`
