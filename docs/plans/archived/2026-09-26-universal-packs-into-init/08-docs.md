# U8 — Docs

- **Wave:** 4
- **Depends on:** U3, U4, U5, U7
- **Owns:** `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-26-universal-packs-into-init.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  and wave-2 files; index.md's Goal, Reversals and Facts; every
  `DOCS FALSIFIED:` line U1–U6 returned; the five reversed sources;
  `plugins/vwf/assets/memory.md`.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

Decisions 1–8 of index.md, as the behaviour the docs now describe (quoted in
full in `01-move.md` to `06-pack-internals.md`). The Goal, quoted:

> After this lands, the six universal packs — mise, dprint, gitleaks, grype,
> pre-commit, repo-hygiene — live in vwf at
> `plugins/vwf/skills/init/packs/<name>/`, and `/vwf:init` alone lands them and
> records them in its own lock.

The five reversals in index.md's Goal become one decision doc,
`docs/memory/decisions/2026-09-26-universal-packs-into-init.md`, linking each
reversed source as superseded and quoting the user: *"Let's move `mise` to
`init` ownership so that it can completely own"*. Any sentence you add is short
(B65).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns.
2. **The Facts' doc passages** — `.claude/skills/stackgen-plugin/SKILL.md` (:31,
   :81, :223), `.claude/skills/vwf-plugin/SKILL.md` (:50, :120–130),
   `.claude/skills/vwf-plugin/references/dependencies.md` (:19–20, :31–39),
   `.claude/skills/plugin-authoring/references/checks.md` (:13, :59, rule 10,
   rule 15), `.claude/docs/plugins.md:13`, `CLAUDE.md` (:156, :271, :285,
   :522–524 and the vwf row "names no technology"), `readme.md` (:157–165,
   :305), `site/.../plugins/stackgen.md` (24 hits: :334–341, :432–434, :675–766,
   :1114–1128), `site/.../plugins/vwf.md` (8 hits).
3. **The decision doc.**
4. **Every `DOCS FALSIFIED:` line** from U1–U6.

## Verification

- `MISE_ENV=dev mise run code:precommit` green
- `MISE_ENV=dev mise run p:plugins:check` green
- `MISE_ENV=dev mise run p:site:check` green

## Guardrails

- `CLAUDE.md`, `readme.md` and `site/**` are dprint-formatted — let
  `code:precommit` pad tables; no table cell ends in a bare `*`; no code span
  wraps a line.
- Never touch a skill, a pack or a version.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: the universal packs move into vwf init — manual, skills and decision` —
written by the orchestrator after the wave gate.
