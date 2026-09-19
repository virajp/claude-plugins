# U2 — Docs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/**`
  (owned so docs-sync's findings have a home; the survey found no passage in any
  of them)
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; the plan's
  Facts section; every `DOCS FALSIFIED:` line U1 returned.
- **Lazy-load:** `site/CLAUDE.md` (the link rule and the gate) only if a site
  page turns out to need an edit.

## Ruling

The Goal's framing, quoted:

> Not a reversal: no decision doc, memory or drawer mandates the key; it was a
> carry-over from the reference stack.

So no decision doc is written. The survey's fact, quoted:

> No hit in `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`,
> `installer/**`, `.claude/**`, `plugins/vwf/**`, `scripts/**`. The site's
> stackgen page does not describe the `[env]` tier's contents.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta (wave 1) and apply its
   findings, plus every `DOCS FALSIFIED:` line U1 returned. The expected outcome
   is **no edit**: report `CHANGED: none` and say what docs-sync surveyed.
2. If docs-sync does find a passage describing the `[env]` tier as carrying a
   telemetry switch, edit that passage only, in place, matching its fold width.

## Verification

- `grep -rn DISABLE_TELEMETRY readme.md CLAUDE.md site/src/content/docs .claude`
  returns nothing.
- `mise run code:precommit` green.
- `mise run p:site:check` green — only when a file under `site/` changed.

## Guardrails

- Do not touch `plugins/**` (U1), `docs/plans/`, `docs/memory/`.
- `readme.md`, `CLAUDE.md` and `site/**` are dprint-formatted; `.claude/**`
  markdown is too.
- No table cell ending in a bare asterisk; no escaped backtick inside a code
  span.
- Delete nothing; `rm` nothing.

## Commit

`docs: mise pack drops DISABLE_TELEMETRY — docs reconciled` — written by the
orchestrator after the wave gate, and skipped when the unit changed nothing.
`docs` is in `.config/git-conventional-commits.yaml`.
