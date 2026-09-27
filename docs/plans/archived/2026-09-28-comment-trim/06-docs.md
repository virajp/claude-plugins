# U6 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4, U5
- **Owns:** `site/src/content/docs/**`, `.claude/**` except
  `.claude/skills/plugin-authoring/**`, `CLAUDE.md`, `readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the `vwf:docs-sync` skill, then every file it or a
  `DOCS FALSIFIED:` line names, before editing.

## Ruling

> - Decision 3 — The trim rule: … Every longer explanation goes: dropped when
>   the owning reference already says it, moved into that reference … when it
>   does not.

The wave-1 units moved explanations into references they own. An explanation
that belonged to this repo's own docs was reported by U4 as a `DOCS FALSIFIED:`
line naming where it belongs; this unit writes it there.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings.
2. Apply every `DOCS FALSIFIED:` line U1–U5 returned, including U4's moved
   explanations for `.claude/docs/**` or `CLAUDE.md`.
3. Where the site or `.claude/**` quotes or describes a comment that is now gone
   (for example a header a page tells the reader to read), reconcile it.

## Verification

- `mise run p:site:check` green.
- `mise run p:plugins:check` green.

## Guardrails

- Do not edit `plugins/**` or `.claude/skills/plugin-authoring/**` — report a
  `GAP:` instead.
- `CLAUDE.md`, `readme.md`, `.claude/**` and `site/**` are dprint-formatted; run
  `mise run code:format -- <file>` over only the files you edited. Never end a
  table cell in a bare `*`.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`docs: reconcile docs with the comment trim`
