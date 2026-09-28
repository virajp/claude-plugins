# U3 — Docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `site/src/content/docs/**`, `.claude/**`, `CLAUDE.md`, `readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files; index.md's Goal and Facts; every `DOCS FALSIFIED:` line U1 and U2
  returned.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

The Goal, quoted:

> After this lands, three things hold. tool-config's docs say graphify needs
> both python and uv. When tool-config lands its base mise block and a tool the
> block pins is already pinned in the repo, the person is asked which version to
> keep — the repo's or the base's `latest` — and the winner is pinned once, in
> the tools file for the environments that need it. And init never leaves
> `.config/mise/mise.lock` or `.config/mise/locks/` ignored, and its Lock report
> line reads `none` when the lock step changed nothing.

> - Decision 1: graphify requires python and uv, and every passage that names
>   its needs says both.
> - Decision 8: Any sentence a unit adds is one line.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns.
   Expected, from the survey: `site/src/content/docs/plugins/vwf.md` :58-66 (the
   prerequisite table — graphify needs python and uv, add the python row) and
   :194 (python beside graphify and uv); the Lock line at :1463-1466 (states
   staged, `none`, deferred, failed — no *lock ignored*; the ignore fix);
   `site/src/content/docs/plugins/stackgen.md` on tool-config's conflict rows
   and one-pin rule.
2. **Every `DOCS FALSIFIED:` line** from U1 and U2.

## Verification

- `MISE_ENV=dev mise run code:precommit` green (a second run when the first
  re-pads)
- `MISE_ENV=dev mise run p:site:check` green

## Guardrails

- Dprint-formatted files: let `code:precommit` pad tables; no code span wraps a
  line; no `|` inside a table cell.
- Never touch a skill, a pack or a version.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: one pin per tool and a tracked mise lock` — written by the orchestrator
after the wave gate.
