# U11 — Gates and bump

- **Wave:** 4
- **Depends on:** U9, U10
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `site/package.json`
- **Model:** opus
- **Read first:** `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`;
  `index.md`'s Consent block.
- **Lazy-load:** `.claude/skills/release/SKILL.md` (why no tag is cut here);
  `.config/mise/tasks/_scripts/local` (the 13/17 guard the site bump task
  applies).

## Ruling

Consent block: "Release vwf publicly — minor — 19.29.0 → 19.30.0, hand edit of
`plugin.json`; not this time. Release site publicly — patch — 1.1.23 → 1.1.24,
`mise run p:site:version`; not this time."

"No release step: the bump is recorded, the tag waits for the batch."

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — `"version": "19.30.0"`.
   Neither component is 13 or 17.
2. **`site/package.json`** — run `mise run p:site:version` (bare — the task
   takes no positional and refuses a dirty tree, so run it **first**, before
   step 1, on a clean worktree; it writes 1.1.24 and does not tag).
3. **`.claude-plugin/marketplace.json`** — `mise run p:plugins:marketplace`
   regenerates it from the manifest; stage the result. The dev-marketplace copy
   is gitignored and is not this unit's concern.
4. Run the full wave gate and report.

## Verification

- `grep -n '"version": "19.30.0"' plugins/vwf/.claude-plugin/plugin.json` hits.
- `grep -n '"version": "1.1.24"' site/package.json` hits.
- `mise run p:plugins:marketplace -- --check` green — the committed manifest
  matches.
- The full wave gate: `mise run p:plugins:marketplace -- --check`,
  `mise run p:plugins:inventory -- --check`, `mise run p:plugins:check`,
  `mise run code:precommit`, `mise run p:site:check` — all green.

## Guardrails

- Do not run `p:plugins:release`, `p:site:release` or `p:i:release`.
- Do not run `p:plugins:local` — that is the orchestrator's after-landing `ask`
  step, outside the worktree.
- Do not edit any markdown.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`ops: bump vwf 19.30.0, site 1.1.24 — plan folders` — written by the
orchestrator after the wave gate. Type `ops`; no scope.
