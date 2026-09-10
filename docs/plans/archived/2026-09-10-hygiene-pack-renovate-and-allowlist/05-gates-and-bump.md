# U5 — gates and bump: stackgen 1.6.1, the two pack pins, inventory, marketplace

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/stackgen/stacks/bundles/repo-hygiene.md`,
  `plugins/stackgen/stacks/bundles/repo-gates.md`,
  `plugins/stackgen/stacks/inventory.md` (generated),
  `.claude-plugin/marketplace.json` (generated)
- **Model:** opus
- **Read first:** index.md's Consent block and decision 4.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md:255-270` (why a pin and
  its pack must agree).

## Ruling

index.md's Consent block, verbatim:

> Release `stackgen` publicly — patch — 1.6.0 → 1.6.1, by editing `version` in
> `plugins/stackgen/.claude-plugin/plugin.json`, then
> `mise run plugins:marketplace`; with pack bumps repo-hygiene 1.0.0 → 1.0.1 and
> dprint 1.0.0 → 1.0.1 (each `pack.yaml`, the bundle pins, then
> `mise run plugins:inventory`)

From index.md's assumed decisions, verbatim:

> **4.** Both changed packs bump patch: repo-hygiene (payload moved) and dprint
> (its skill changed). Bundle pins follow; inventory regenerates.

U1 and U3 already wrote the two `pack.yaml` lines.

## Edits

1. **`stacks/bundles/repo-hygiene.md:7`** — `repo-hygiene/repo-hygiene@1.0.0` →
   `@1.0.1`.
2. **`stacks/bundles/repo-gates.md`** — the components list:
   `toolchain-gate/dprint@1.0.0` → `@1.0.1`. The other three gate pins are
   unchanged.
3. **`plugins/stackgen/.claude-plugin/plugin.json`** — `version` `1.6.0` →
   `1.6.1`. Plain `X.Y.Z`.
4. Run `mise run plugins:inventory`; stage `stacks/inventory.md` (the two
   version cells move).
5. Run `mise run plugins:marketplace`; stage `.claude-plugin/marketplace.json`
   (stackgen's `ref` becomes `stackgen-v1.6.1`).
6. Run the full wave gate from index.md plus the plan's own checks.

## Verification

- `mise run plugins:check`, `mise run plugins:marketplace --check`,
  `mise run plugins:inventory --check`, `mise run plugins:npm-normalize-test`,
  `pnpm vitest run`, `pnpm exec tsc --noEmit -p installer`,
  `pnpm exec tsc --noEmit -p scripts`, `mise run site:check` — all green.
- The plan's own checks from index.md's Wave gate section, both.
- `grep -n '@1.0.1' plugins/stackgen/stacks/bundles/repo-hygiene.md plugins/stackgen/stacks/bundles/repo-gates.md`
  → one hit each.
- `grep -n '"version": "1.6.1"' plugins/stackgen/.claude-plugin/plugin.json` →
  one; `grep -n 'stackgen-v1.6.1' .claude-plugin/marketplace.json` → one.
- `git status --porcelain -- plugins/vwf site/package.json installer/package.json`
  → empty.

## Guardrails

- Touch nothing but the five owned files.
- Do **not** run `mise run plugins:local`, any tag, or any `*:release` task.
- Never run `git checkout`, `git restore`, `git stash`.

## Commit

`ops(stackgen): bump to 1.6.1 — hygiene 1.0.1, dprint 1.0.1, inventory and
marketplace regenerated`
— written by the orchestrator after the wave gate, not by the unit.
