# U8 — Gates and bump (no bump)

- **Wave:** 3
- **Depends on:** U7
- **Owns:** `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md` (both generated). **No `plugin.json` is
  edited**: the consent block records `stackgen` release as none and vwf is
  untouched.
- **Model:** opus
- **Read first:** index.md's Consent block and Wave gate section.
- **Lazy-load:** `.claude/docs/ci-and-releases.md` only if a gate fails in a way
  that reads as an environment problem.

## Ruling

Quoted from index.md's Consent block:

> Release `vwf` publicly: none. Release `stackgen` publicly: none. Release
> installer publicly: none. **No `plugin.json` is bumped by this plan.**

And from the template's fixed final unit: bump per consent (nothing here), run
`mise run plugins:marketplace` and `mise run plugins:inventory`, pass the full
wave gate, run `target-verifier` because `plugins/` changed. This unit does
**not** run `mise run plugins:local` — that is the orchestrator's, after the
landing.

## Edits

1. Run `mise run plugins:marketplace` and `mise run plugins:inventory`. Both
   outputs are expected **byte-identical** to the committed files: no manifest
   changed and no bundle frontmatter changed. A diff in either is a finding to
   report, not to commit silently — name the unit that caused it.
2. Run the full wave gate:

   ```sh
   mise run plugins:check
   mise run plugins:marketplace --check
   mise run plugins:inventory --check
   pnpm vitest run
   pnpm exec tsc --noEmit -p installer
   pnpm exec tsc --noEmit -p scripts
   mise run plugins:npm-normalize-test
   mise run plugins:shellcheck
   ```

   Then the plan's own checks from index.md's Wave gate section: the four greps
   over the landed tiers must be empty outside fenced blocks and the three
   flutter-ios intra-skill links.
3. Confirm the new rules can fire:
   `pnpm vitest run scripts/src/check.test.ts
   -t "landed citations"` and
   `-t "component refs"` report their cases as run, and
   `node scripts/src/check.ts` prints `All checks passed` with the skills count
   unchanged (33) — pack skills are parsed by rule 4 but not counted unless U1
   `DECIDED:` otherwise.
4. Dispatch `target-verifier` with: "stackgen pack prose was rewritten (no
   manifest change, no version change); the checker and inventory generator
   gained rules. Prove the marketplace validates and stackgen installs
   hermetically from the working tree's dev marketplace, and that an uninstall
   leaves nothing." Its pass condition is unchanged from previous plans.

## Verification

- Every command in step 2 exits 0.
- Step 1 produced no diff.
- target-verifier reports a clean install and uninstall.

## Guardrails

- Do not bump any version. Do not edit any doc, any pack file, or `scripts/**`;
  a failure there is reported with the gate's output and the unit it traces to,
  never patched here.
- Do not run `mise run plugins:local`, `plugins:release`, `i:release` or
  `site:release`.
- No `git checkout`, `git restore` or formatter `--fix`.

## Commit

`ops: regenerate and gate — checker pack-tier coverage` — only if step 1
produced a diff (it should not); otherwise this unit has nothing to commit and
says so. Written by the orchestrator after the wave gate, not by the unit.
