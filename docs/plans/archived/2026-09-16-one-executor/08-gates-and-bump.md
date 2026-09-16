# U8 — Gates and bump

- **Wave:** 4
- **Depends on:** U6, U7
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `site/package.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`;
  `index.md`'s Consent block.
- **Lazy-load:** `.claude/skills/release/SKILL.md` (why no tag is cut here).

## Ruling

Consent block: "Release vwf publicly — minor — 19.30.0 → 19.31.0, hand edit of
`plugin.json`; not this time. Release site publicly — patch — 1.1.24 → 1.1.25,
`mise run p:site:version`; not this time."

"No release step: the bump is recorded, the tag waits for the batch."

## Edits

1. **`site/package.json`** — run `mise run p:site:version` first, on a clean
   worktree (bare — no positional; it refuses a dirty tree; writes 1.1.25, no
   tag).
2. **`plugins/vwf/.claude-plugin/plugin.json`** — `"version": "19.31.0"`.
   Neither component is 13 or 17.
3. **`.claude-plugin/marketplace.json`** — `mise run p:plugins:marketplace`
   regenerates it; stage the result.
4. Run the full wave gate and report.

## Verification

- `grep -n '"version": "19.31.0"' plugins/vwf/.claude-plugin/plugin.json` hits.
- `grep -n '"version": "1.1.25"' site/package.json` hits.
- `mise run p:plugins:marketplace -- --check` green.
- The full wave gate — all five lines green.

## Guardrails

- Do not run `p:plugins:release`, `p:site:release` or `p:i:release`.
- Do not run `p:plugins:local` — the orchestrator's after-landing `ask` step.
- Do not edit any markdown.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`ops: bump vwf 19.31.0, site 1.1.25 — one executor` — written by the
orchestrator after the wave gate. Type `ops`; no scope.
