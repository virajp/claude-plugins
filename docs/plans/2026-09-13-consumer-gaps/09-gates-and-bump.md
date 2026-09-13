# U9 — gates and bump

- **Wave:** 3
- **Depends on:** U8
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`
  (regenerated; expected no diff after U1)
- **Model:** opus
- **Read first:** index.md's Consent block; each owned file before editing.
- **Lazy-load:** `.claude/skills/release/SKILL.md` (what a version means here —
  read, never run a release).

## Ruling

The Consent block, verbatim:

- "Release vwf publicly — minor — `plugins/vwf/.claude-plugin/plugin.json`,
  `19.19.0` → `19.20.0`, by editing the `version` field"
- "Release stackgen publicly — minor —
  `plugins/stackgen/.claude-plugin/plugin.json`, `1.8.1` → `1.9.0`, by editing
  the `version` field"
- "Release site publicly — patch — `mise run p:site:version` (bare; patch is its
  default; it refuses a dirty tree, so U9 runs it first), `1.1.8` → `1.1.9`"
- "Release the flutter pack — minor — … `0.2.0` → `0.3.0` … by U1's commit"
  (already landed; this unit only confirms the inventory has no diff)
- "Release installer publicly — none"

"A release recorded here is intent, not authorisation. … This plan has **no
release step**: the versions are bumped by U9 and the tags wait for a later
session's `/release`."

## Edits

1. **`site/package.json`** — first, on a clean tree: `mise run p:site:version`
   (bare). Confirm `"version": "1.1.9"`. If the task refuses because the tree is
   dirty from an earlier unit's uncommitted work, stop and return `UNRESOLVED:`
   — do not pass `--no-git-checks` yourself.
2. **`plugins/vwf/.claude-plugin/plugin.json`** — `"version": "19.19.0"` →
   `"19.20.0"`.
3. **`plugins/stackgen/.claude-plugin/plugin.json`** — `"version": "1.8.1"` →
   `"1.9.0"`.
4. **`.claude-plugin/marketplace.json`** — `mise run p:plugins:marketplace`; the
   two refs read `vwf-v19.20.0` and `stackgen-v1.9.0`. The dev manifest under
   `.dev-marketplace/` is regenerated too and is gitignored.
5. **`plugins/stackgen/stacks/inventory.md`** — `mise run p:plugins:inventory`;
   expect **no diff** (U1's commit already carried it). A diff here means U1's
   regeneration was skipped — report it as `GAP:` with the diff summary and keep
   the regenerated file.

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

Plus: `command grep -rn "blueprint(\|chore(vwf)" plugins/vwf/` empty;
`command grep -rn "four platforms\|mobile, tablet, desktop and web\|flutter@0.2.0" plugins/`
empty;
`command grep -n '"version"' plugins/vwf/.claude-plugin/plugin.json plugins/stackgen/.claude-plugin/plugin.json site/package.json`
shows `19.20.0`, `1.9.0`, `1.1.9`; `p:plugins:check` confirms each plugin
version is plain `X.Y.Z`.

## Guardrails

- Run **no** release task — `p:plugins:release`, `p:i:release`, `p:site:release`
  are all outside this plan; the tags wait for `/release`.
- Do not touch any file outside Owns; a doc that still reads wrong is a
  `DOCS FALSIFIED:` line for the orchestrator, not an edit.
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- The site bump goes first, on a clean tree — the task refuses otherwise.

## Commit

`ops: bump vwf 19.20.0, stackgen 1.9.0, site 1.1.9 — consumer gaps` — written by
the orchestrator after the wave gate, not by the unit. Bare type.
