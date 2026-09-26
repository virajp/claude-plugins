# U6 — Docs

- **Wave:** 3
- **Depends on:** U5
- **Owns:** `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files; index.md's Goal; every `DOCS FALSIFIED:` line U1–U3 returned.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

The Goal, quoted:

> After this lands, the house linter is installed only by the stacks that lint
> with it, each bringing the runtime it needs; the mise base no longer pins it
> for every repo; and a markdown-only repo lints its markdown.

The user: *"The language-stack will decide which linter to be installed"*. Any
sentence you add is short (B65).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns —
   expected: the mise and markdown passages in `site/.../plugins/stackgen.md`
   and `vwf.md`, and any "base linter" mention.
2. **Every `DOCS FALSIFIED:` line** from U1–U3.

## Verification

- `MISE_ENV=dev mise run code:precommit` green
- `MISE_ENV=dev mise run p:site:check` green

## Guardrails

- Dprint-formatted files: let `code:precommit` pad tables; no code span wraps a
  line.
- Never touch a skill, a pack or a version.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: the linter comes with the stack that uses it` — written by the
orchestrator after the wave gate.
