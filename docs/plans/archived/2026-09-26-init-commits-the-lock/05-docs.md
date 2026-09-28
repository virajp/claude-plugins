# U5 — Docs

- **Wave:** 3
- **Depends on:** U1, U4
- **Owns:** `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files; index.md's Goal; every `DOCS FALSIFIED:` line U1–U3 returned.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

The Goal, quoted:

> After this lands, the `ops:` commit of a newly shaped or reshaped repo already
> carries `.config/mise/mise.lock` and its `.config/mise/locks/` sidecar, so the
> repo's first CI run — `locked = true` — finds every tool locked.

Any sentence you add is short (B65).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns —
   expected: the init git-pass description in `site/.../plugins/vwf.md` and
   `CLAUDE.md`'s init paragraph (the `ops:` commit carries the lock).
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

`docs: init's ops commit carries the mise lock` — written by the orchestrator
after the wave gate.
