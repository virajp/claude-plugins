# U5 — gates: no bump, generators as no-ops, the full gate

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json` (generated),
  `plugins/stackgen/stacks/inventory.md` (generated) — **no diff expected in any
  of the four**
- **Model:** opus
- **Read first:** index.md's Consent block.
- **Lazy-load:** `.claude/docs/ci-and-releases.md` (the two-stage release).

## Ruling

index.md's Consent block, verbatim:

> Release `vwf` publicly — none — not this time; the change ships when a later
> plan bumps `plugins/vwf/.claude-plugin/plugin.json`
>
> Release `stackgen` publicly — none — not this time; the change ships when a
> later plan bumps `plugins/stackgen/.claude-plugin/plugin.json`

Every other release row reads `none`. **No version moves in this plan.** The
user's reshape run on this repo reads the staged `+N` copies `plugins:local`
writes after landing, which is the after-landing `run` step, not this unit's.

## Edits

1. **Touch neither `plugin.json`.** Confirm each still reads its current version
   (`19.14.1`, `1.6.0`).
2. Run `mise run plugins:marketplace` — no diff expected; if one appears, leave
   it in the working tree unstaged and return it as a `GAP:` naming what
   changed.
3. Run `mise run plugins:inventory` — no diff expected (no pack, bundle or kind
   changed; a reference file gained rows); same handling as edit 2.
4. Run the full wave gate from index.md plus every unit's Verification lines
   that hold after landing, listed below.

## Verification

- `mise run plugins:check`, `mise run plugins:marketplace --check`,
  `mise run plugins:inventory --check`, `mise run plugins:npm-normalize-test`,
  `pnpm vitest run`, `pnpm exec tsc --noEmit -p installer`,
  `pnpm exec tsc --noEmit -p scripts`, `mise run site:check` — all green.
- `MISE_ENV=ci mise x shellcheck@latest shfmt@latest -- mise run plugins:shellcheck`
  exits 0 (U1's, the CI replica).
- `grep -c '^| .print_' plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  → `9` (U2's), and the same count in
  `site/src/content/docs/plugins/stackgen.md` (U4's); the dot stands for the
  backtick opening each row's code span.
- `grep -n 'Replaces\|Rewrites (applied)' plugins/vwf/skills/init/references/existing-repo.md`
  and
  `grep -n 'Files replaced\|Calls rewritten' plugins/vwf/skills/init/SKILL.md`
  each hit (U3's).
- `grep -rn 'print_' plugins/vwf/skills/init site/src/content/docs/plugins/vwf.md`
  → nothing.
- `git status --porcelain -- plugins/*/.claude-plugin/plugin.json .claude-plugin/marketplace.json plugins/stackgen/stacks/inventory.md`
  → empty.

## Guardrails

- Touch nothing but the four owned files, and expect to touch none.
- Do **not** run `mise run plugins:local`, any tag, or any `*:release` task —
  `plugins:local` is the orchestrator's after-landing step.
- Never run `git checkout`, `git restore`, `git stash`, `git add`.

## Commit

None expected: with no bump and no generator diff, there is nothing to commit,
and the orchestrator records the unit green with an empty Commit cell. If a
generator did produce a diff and the `GAP:` stands, the orchestrator commits it
as `ops: regenerate after the init helper-library plan` — type `ops` is in
`.config/git-conventional-commits.yaml`'s list.
