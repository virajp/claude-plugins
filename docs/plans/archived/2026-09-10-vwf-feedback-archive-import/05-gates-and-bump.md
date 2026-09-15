# U5 — gates and bump: vwf 19.15.0, the marketplace, the full gate

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json` (generated)
- **Model:** opus
- **Read first:** index.md's Consent block.
- **Lazy-load:** `.claude/docs/ci-and-releases.md`.

## Ruling

index.md's Consent block, verbatim:

> Release `vwf` publicly — minor — → 19.15.0 (superseding the pair plan's
> 19.14.1 if that is still unreleased when this runs), by editing `version` in
> `plugins/vwf/.claude-plugin/plugin.json`, then `mise run plugins:marketplace`

Every other release row reads `none`.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — `version` → `19.15.0`,
   whatever it reads now (19.14.1 after the pair plan; 19.14.2 if the
   task-groups plan's conditional bump fired). Plain `X.Y.Z`.
2. Run `mise run plugins:marketplace` (or `p:plugins:marketplace`); stage
   `.claude-plugin/marketplace.json` (vwf's `ref` becomes `vwf-v19.15.0`).
3. Run the inventory generator — no diff expected; a diff is a `GAP:`.
4. Run the full wave gate from index.md plus the plan's own checks.

## Verification

- The eight gate lines, all green, under whichever task names
  `mise tasks --hidden` lists.
- The plan's own checks from index.md's Wave gate section, both.
- `grep -n '"version": "19.15.0"' plugins/vwf/.claude-plugin/plugin.json` → one;
  `grep -n 'vwf-v19.15.0' .claude-plugin/marketplace.json` → one.
- `git status --porcelain -- plugins/stackgen site/package.json installer/package.json`
  → empty.

## Guardrails

- Touch nothing but the two owned files.
- Do **not** run `plugins:local`, any tag, or any `*:release` task.
- Never run `git checkout`, `git restore`, `git stash`.

## Commit

`ops: bump vwf to 19.15.0 — feedback's seventh route, archive folders, hidden
import-* skills`
— written by the orchestrator after the wave gate, not by the unit.
