# H11 — Gates and bump

- **Wave:** 7
- **Depends on:** H10
- **Owns:** `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  the `version:` line of the 10 packs H5 edited and every bundle pin naming
  them, `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> H11 — Once per level since the last release, across the chain; packs too.

Wanted levels: stackgen major, vwf minor, site patch, each edited pack patch. No
public release.

## Edits

1. Read the last released versions
   (`git tag --list 'stackgen-v*' 'vwf-v*' 'site-v*'`, highest of each; each
   pack's `version:` at the last `stackgen-v*` tag via `git show <tag>:<path>`).
2. **site** — only when `site/package.json` still equals the last `site-v*`:
   `mise run p:site:version`, bare, **first**, on a clean tree.
3. **stackgen** — only when its major equals the last released major: next
   major. **vwf** — only when its major.minor equals the last released: next
   minor. Skip 13 and 17.
4. **Packs** — each of the 10 whose `version:` still equals its released value
   takes one patch; bundle pins follow.
5. `mise run p:plugins:inventory`, `mise run p:plugins:marketplace`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `DECIDED:` lines name each project bumped or left, and why.

## Guardrails

- No tag, no `p:plugins:release`, no `p:site:release`.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump the packs whose git entries moved onto the tool-config script`
