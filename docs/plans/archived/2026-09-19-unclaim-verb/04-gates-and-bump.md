# U4 — Gates and bump

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `site/package.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/.claude-plugin/plugin.json`; `site/package.json`;
  `.claude/skills/release/SKILL.md:78-105` (the bump rule); the plan's Consent
  block.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md:40-47`
  (rule 1 — plain semver, no 13 or 17 component).

## Ruling

The two Release rows, quoted:

> **Release vwf publicly** — minor — `19.34.2` → `19.35.0`, a hand edit of
> `plugins/vwf/.claude-plugin/plugin.json` then
> `mise run p:plugins:marketplace`; no release step, the tag waits.

> **Release site publicly** — patch — `1.1.29` → `1.1.30`,
> `mise run p:site:version`; no release step, the tag waits.

## Edits

1. **`site/package.json`** — run bare `mise run p:site:version` **first**, on
   the clean tree (it refuses a dirty one): `1.1.29` → `1.1.30`. It stages and
   commits nothing; report under DECIDED if it does.
2. **`plugins/vwf/.claude-plugin/plugin.json`** — `version` `19.34.2` →
   `19.35.0` by hand; nothing else in the file changes.
3. **`.claude-plugin/marketplace.json`** — `mise run p:plugins:marketplace`
   regenerates it (and the gitignored dev manifest); the diff is vwf's ref,
   `vwf-v19.35.0`, and the entry's `version` field, both derived.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run code:precommit` green
- `mise run p:site:check` green
- `git status --porcelain` shows exactly the three owned paths, nothing staged.
- `python3 -c "import json;print(json.load(open('plugins/vwf/.claude-plugin/plugin.json'))['version'])"`
  prints `19.35.0`; the same over `site/package.json` prints `1.1.30`.

## Guardrails

- No tag, no release task, no commit.
- Do not touch a doc, a skill or any file outside the three owned.
- Delete nothing; `rm` nothing.

## Commit

`ops: vwf 19.35.0, site 1.1.30 — unclaim verb` — written by the orchestrator
after the wave gate. `ops` is in `.config/git-conventional-commits.yaml`.
