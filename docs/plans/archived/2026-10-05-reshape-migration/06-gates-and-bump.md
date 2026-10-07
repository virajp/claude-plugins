# U5 — Gates and bump

- **Wave:** 4
- **Depends on:** U4
- **Owns:** `site/package.json`, `plugins/*/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, pack `version:` lines and bundle pins,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> G9 — After landing `mise run p:plugins:local` (`run`); no release step; the
> site takes one patch if unmoved since its last tag.

## Edits

1. **site** — when `site/package.json` equals the highest `site-v*` tag's
   version: `mise run p:site:version`, bare, **first**, on a clean tree (it
   refuses a dirty one and takes no positional).
2. Confirm stackgen `3.0.0` and vwf `20.1.0` sit above their tags — no bump. Any
   pack this plan edited takes one patch if unmoved since `stackgen-v2.0.0`
   (none expected).
3. `mise run p:plugins:inventory`, `mise run p:plugins:marketplace`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `DECIDED:` names each project bumped or left, and why.

## Guardrails

- No tag, no `p:plugins:release`, no `p:site:release`, no `p:i:release`.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump the site for the template chain's release`
