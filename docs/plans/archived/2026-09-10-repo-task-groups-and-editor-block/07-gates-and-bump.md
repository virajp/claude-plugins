# U7 — gates and bump: the conditional patches, inventory, marketplace, the full gate

- **Wave:** 3
- **Depends on:** U6
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json` (conditional),
  `plugins/stackgen/.claude-plugin/plugin.json` (conditional),
  `plugins/stackgen/stacks/inventory.md` (generated),
  `.claude-plugin/marketplace.json` (generated)
- **Model:** opus
- **Read first:** index.md's Consent block and decision 2.
- **Lazy-load:** `.claude/docs/ci-and-releases.md` (the tag families; why a
  merge ships nothing until a tag).

## Ruling

index.md's Consent block, verbatim:

> Release `vwf` publicly — patch, **conditional** — only if
> `.claude-plugin/marketplace.json`'s vwf `ref` names a tag that already exists
> (`git tag -l`); then `version` in `plugins/vwf/.claude-plugin/plugin.json`
> +0.0.1 and `mise run plugins:marketplace`. Else none: the eight edited lines
> ride the pending patch.

> Release `stackgen` publicly — patch, **conditional** — the same test on the
> stackgen `ref`; then `plugins/stackgen/.claude-plugin/plugin.json` +0.0.1 and
> `mise run plugins:marketplace`. Else none.

From index.md's assumed decisions, verbatim:

> **2.** **Rewrite them; bump only if already released.** The docs unit rewrites
> all eight. The gates unit bumps vwf/stackgen patch only if the marketplace
> pin's tag already exists; otherwise the edits ride the pending patch.

## Edits

1. **The test, per plugin.** Read the plugin's `ref` from
   `.claude-plugin/marketplace.json` (e.g. `vwf-v19.14.1`). Run
   `git fetch --tags origin` then `git tag -l '<ref>'`. A hit means that version
   is released and the eight edited lines need a new patch: bump `version` in
   that plugin's `plugin.json` by 0.0.1. No hit means the version is still
   pending: bump nothing for that plugin. Report the outcome for each as a
   `DECIDED:` line.
2. Run `mise run p:plugins:inventory`; stage `stacks/inventory.md` (its header
   line now names `p:plugins:inventory`, from U5's `inventory.ts:191`).
3. Run `mise run p:plugins:marketplace`; stage `.claude-plugin/marketplace.json`
   (no change unless a bump happened).
4. Run the full wave gate from index.md, under the new names, plus the plan's
   own checks.

## Verification

- `mise run p:plugins:check`, `mise run p:plugins:marketplace --check`,
  `mise run p:plugins:inventory --check`,
  `mise run p:plugins:npm-normalize-test`, `pnpm vitest run`,
  `pnpm exec tsc --noEmit -p installer`, `pnpm exec tsc --noEmit -p scripts`,
  `mise run p:site:check`, `pre-commit run --all-files` — all green.
- The plan's own checks from index.md's Wave gate section, all three.
- `mise run p:i:test` and `mise run p:i:build` exit 0.
- Per bumped plugin: `grep -n '"version"' <plugin.json>` shows the new value and
  `grep -n '<name>-v<new>' .claude-plugin/marketplace.json` → one hit.
- `git status --porcelain -- site/package.json installer/package.json` → empty.

## Guardrails

- Touch nothing but the four owned files.
- Do **not** run `mise run p:plugins:local`, any tag, or any `*:release` task —
  the orchestrator's after-landing steps.
- Never run `git checkout`, `git restore`, `git stash`.

## Commit

`ops: regenerate after the p: rename — conditional patch bumps` — written by the
orchestrator after the wave gate, not by the unit. If no bump and no diff, the
orchestrator records U7 `green` with the inventory commit alone.
