# U6 — Gates and bump

- **Wave:** 3
- **Depends on:** U5
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `site/package.json` — owned so the final
  gate has a home; expected unchanged
- **Model:** opus
- **Kind:** edit
- **Read first:** the plan's Consent block.

## Ruling

The Release rows, quoted:

> **Release vwf publicly** — none — rides the unreleased `19.46.0` (last tag
> `vwf-v19.45.1`); no bump, no release step, the tag waits.

> **Release site publicly** — none — rides the unreleased `1.1.47` (last tag
> `site-v1.1.46`); no bump, no release step, the tag waits.

> **Release installer publicly** — none — untouched.

## Edits

1. **No version edit.** Confirm `plugins/vwf/.claude-plugin/plugin.json` reads
   `19.46.0` and `site/package.json` reads `1.1.47`; if either reads otherwise,
   stop with `UNRESOLVED:` — the consent names those versions.
2. **`mise run p:plugins:marketplace`** — run it; the diff is expected empty. A
   non-empty diff is reported under `DECIDED:` with its cause.
3. **The full wave gate**, below.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run code:precommit` green
- `mise run p:site:check` green
- `git status --porcelain` shows nothing outside the three owned paths, and
  nothing staged.

## Guardrails

- No tag, no release task, no commit.
- Do not touch a doc, a skill or any file outside the three owned.
- Delete nothing.

## Commit

`ops: partial backlog items — final gate` — only if a generator changed an owned
file; otherwise no commit. Written by the orchestrator after the wave gate.
`ops` is in `.config/git-conventional-commits.yaml`.
