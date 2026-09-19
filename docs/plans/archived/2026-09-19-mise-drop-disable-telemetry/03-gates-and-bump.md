# U3 — Gates and bump

- **Wave:** 3
- **Depends on:** U2
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/.claude-plugin/plugin.json`;
  `.claude/skills/release/SKILL.md:78-105` (the bump rule); the plan's Consent
  block.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md:40-47`
  (rule 1 — plain semver, no 13 or 17 component).

## Ruling

The Release row, quoted:

> **Release stackgen publicly** — patch — `1.20.0` → `1.20.1`, a hand edit of
> `plugins/stackgen/.claude-plugin/plugin.json` then
> `mise run p:plugins:marketplace`; no release step, the tag waits.

vwf, site and installer: `none — untouched`.

## Edits

1. **`plugins/stackgen/.claude-plugin/plugin.json`** — `version` `1.20.0` →
   `1.20.1` by hand; nothing else in the file changes.
2. **`.claude-plugin/marketplace.json`** — `mise run p:plugins:marketplace`
   regenerates it (and the gitignored dev manifest); the diff is stackgen's ref,
   `stackgen-v1.20.1`, and the entry's `version` field, both derived.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run code:precommit` green
- `grep -rn DISABLE_TELEMETRY plugins/` returns nothing.
- `git status --porcelain` shows exactly the two owned paths, nothing staged.
- `python3 -c "import json;print(json.load(open('plugins/stackgen/.claude-plugin/plugin.json'))['version'])"`
  prints `1.20.1`.

## Guardrails

- No tag, no release task, no commit.
- Do not touch `plugins/vwf/**`, `site/package.json`, `installer/package.json`,
  a doc, a skill or any file outside the two owned.
- Delete nothing; `rm` nothing.

## Commit

`ops: stackgen 1.20.1 — mise pack drops DISABLE_TELEMETRY` — written by the
orchestrator after the wave gate. `ops` is in
`.config/git-conventional-commits.yaml`.
