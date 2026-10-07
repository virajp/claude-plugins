# U3 — Docs

- **Wave:** 3
- **Depends on:** R
- **Owns:** `.claude/skills/stackgen-plugin/**`, `readme.md`, `CLAUDE.md`,
  `.claude/docs/**`, `site/src/content/docs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`.

## Ruling

> D1–D8, quoted from index.md's Assumed decisions — the modules exist; nothing
> calls them yet.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply its findings plus every
   `DOCS FALSIFIED:` line U1 and U2 returned.
2. **The survey's list**: `.claude/skills/stackgen-plugin/SKILL.md:32-36` — the
   script layout gains `lib/template.mjs`, `lib/yaml.mjs` and `lib/values.mjs`,
   one line each, stated as not yet called by the script.
3. No user-facing doc changes: nothing a user runs behaves differently. No
   decision doc — the chain's decision docs land with plan 2 and plan 3, which
   make the reversals.

## Verification

- `mise run code:precommit` green.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`; a falsified passage there is a `GAP:` line.
- Keep code spans on one line; never end a table cell in a bare `*`.
- Delete with `rm`, never `git rm`.

## Commit

`docs: name tool-config's template engine and values loader in the maintainer map`
