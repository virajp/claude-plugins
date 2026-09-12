# U9 — gates and bump

- **Wave:** 4
- **Depends on:** U8
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/cloud-service/{containers,workers-ssr,workers-static-assets}/pack.yaml`,
  `plugins/stackgen/stacks/bundles/{cloudflare-containers,cloudflare-workers-ssr,cloudflare-workers-static}.md`,
  `plugins/stackgen/stacks/inventory.md` (ruling 19)
- **Model:** opus
- **Read first:** the three version files;
  `.claude/skills/release/SKILL.md:80-85` (the by-hand bump and the marketplace
  regeneration).
- **Lazy-load:** `.config/mise/tasks/p/site/version` (patch by default, no
  positional).

## Ruling

Quoted from `index.md`'s Consent block:

> Release vwf publicly — minor — `plugins/vwf/.claude-plugin/plugin.json`,
> `19.18.0` → `19.19.0`, by editing the `version` field

> Release stackgen publicly — patch —
> `plugins/stackgen/.claude-plugin/plugin.json`, `1.8.0` → `1.8.1`, by editing
> the `version` field

> Release site publicly — patch — `mise run p:site:version` (bare; patch is its
> default; it refuses a dirty tree, so U9 runs it first), `1.1.7` → `1.1.8`

> Release the three cloud-service packs — patch (ruling 19) —
> `stacks/cloud-service/{containers,workers-ssr,workers-static-assets}/pack.yaml`,
> `0.1.0` → `0.1.1`, the three bundle pins, `mise run p:plugins:inventory`; by
> U9

> This plan has **no release step**: the three versions are bumped by U9 and the
> tags wait for a later session's `/release`.

## Edits

1. **First, with a clean tree:** `mise run p:site:version` — bare, no
   positional. Confirm `site/package.json` reads `1.1.8` (or one patch step from
   whatever it holds).
2. `plugins/vwf/.claude-plugin/plugin.json` — `"version": "19.19.0"` (one minor
   step from what it holds; skip 13 and 17 in any version line).
3. `plugins/stackgen/.claude-plugin/plugin.json` — `"version": "1.8.1"`.
4. Ruling 19: `version: 0.1.1` in each of the three cloud-service `pack.yaml`
   files; the pin line `cloud-service/<name>@0.1.1` in
   `bundles/cloudflare-containers.md`, `cloudflare-workers-ssr.md` and
   `cloudflare-workers-static.md`; then `mise run p:plugins:inventory`.
5. `mise run p:plugins:marketplace` — regenerates
   `.claude-plugin/marketplace.json` with both refs renamed. Confirm the two
   `source` refs read `vwf-v19.19.0` and `stackgen-v1.8.1`.
6. Run the full wave gate and return its result.

## Verification

The full wave gate, every line green:

```text
mise run p:plugins:marketplace --check
mise run p:plugins:inventory --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

- `grep -n '"version"' plugins/vwf/.claude-plugin/plugin.json plugins/stackgen/.claude-plugin/plugin.json site/package.json`
  shows `19.19.0`, `1.8.1`, `1.1.8`.
- `grep -m1 version: plugins/stackgen/stacks/cloud-service/{containers,workers-ssr,workers-static-assets}/pack.yaml`
  shows `0.1.1` three times, and `p:plugins:inventory --check` is green.
- `git -C <worktree> status --short` after the gate shows only the owned files
  modified.

## Guardrails

- The site bump runs **before** any other edit — `pnpm version` refuses a dirty
  tree.
- The version is plain `X.Y.Z`; `p:plugins:check` fails one carrying build
  metadata.
- Do not run `p:plugins:release`, `p:i:release` or `p:site:release`.
- Do not touch any doc, skill or pack file beyond the three `pack.yaml` lines
  and the three pin lines ruling 19 names.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`ops: bump vwf 19.19.0, stackgen 1.8.1, site 1.1.8, three cloud-service packs 0.1.1`
— written by the orchestrator after the wave gate.
