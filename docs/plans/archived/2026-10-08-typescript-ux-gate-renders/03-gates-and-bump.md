# U3 — Gates and bump

- **Wave:** 3
- **Depends on:** U2
- **Owns:** `plugins/stackgen/stacks/language/typescript/pack.yaml`, the 13
  bundle files
  `plugins/stackgen/stacks/bundles/{astro-csr,astro-hybrid,astro-ssg,astro-ssr,html,typescript-cloudflare-agents,typescript-effect,typescript-effect-cli,typescript-effect-hono,typescript-effect-temporal,typescript-hono-refine,typescript-parseargs-cli,typescript-pulumi}.md`,
  `plugins/stackgen/stacks/inventory.md`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Facts.

## Ruling

> - Decision F4: `language/typescript` `0.3.1` → `0.4.0` (minor), the 13 bundle
>   pins, and `inventory.md`, in one commit; stackgen `3.0.0` → `3.1.0` (minor).
> - Decision F6: No release. The user cuts vwf and stackgen by hand with
>   `/release`.

## Edits

1. `pack.yaml` — `version: 0.3.1` → `version: 0.4.0`.
2. Each of the 13 bundles — `language/typescript@0.3.1` →
   `language/typescript@0.4.0`.
3. `mise run p:plugins:inventory` — regenerates `inventory.md`.
4. `plugins/stackgen/.claude-plugin/plugin.json` — `"version": "3.0.0"` →
   `"3.1.0"` (no 13 or 17 component).
5. `mise run p:plugins:marketplace` — regenerates
   `.claude-plugin/marketplace.json`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `grep -rn 'language/typescript@0.3.1' plugins/stackgen/stacks` — no hit.

## Guardrails

- No tag, no `p:plugins:release`, no `p:plugins:local`, no `p:site:version`.
- vwf is untouched.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump the typescript pack to 0.4.0 and stackgen to 3.1.0`
