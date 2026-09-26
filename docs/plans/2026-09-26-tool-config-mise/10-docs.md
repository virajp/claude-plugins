# U10 — Docs

- **Wave:** 4
- **Depends on:** U2, U4, U6, U7, U9
- **Owns:** `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-26-tool-config.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  and wave-2 files; index.md's Goal and Reversals; every `DOCS FALSIFIED:` line
  U1–U8 returned; `plugins/vwf/assets/memory.md`.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

Decisions 1–11 of index.md, as the behaviour the docs now describe (quoted in
`01-move.md` to `08-mise-assets.md`). The Goal, quoted:

> After this lands, a new user-invocable stackgen skill, `stackgen:tool-config`,
> owns mise configuration: `/stackgen:tool-config mise <instruction>` writes the
> layout B1 defined, the mise pack's content lives in the skill, and every other
> pack asks for what it needs through `tool-config:` calls in its `pack.yaml`.

The decision doc `docs/memory/decisions/2026-09-26-tool-config.md` records the
skill, the three reversals, and the user's words: *"Why not simply create a
`mise` skill which knows how to setup tools and other config in various
environments and then let stackgen use that skill to add whatever is required"*.
Any sentence you add is short (B65).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns —
   expected: `.claude/skills/stackgen-plugin/**` (the skill list, the mise
   pack), `.claude/skills/plugin-authoring/references/checks.md` (rule 11),
   `.claude/docs/{plugins,repo-shape}.md`, `CLAUDE.md` (the stackgen row, the
   "three unconditional bundles" passage, rule 11), `readme.md`,
   `site/.../plugins/stackgen.md` (a `tool-config` section; the mise pack and
   `conf.d` passages), `site/.../plugins/vwf.md` (init's landing).
2. **The decision doc.**
3. **Every `DOCS FALSIFIED:` line** from U1–U8.

## Verification

- `MISE_ENV=dev mise run code:precommit` green
- `MISE_ENV=dev mise run p:plugins:check` green
- `MISE_ENV=dev mise run p:site:check` green

## Guardrails

- Dprint-formatted files: let `code:precommit` pad tables; no table cell ends in
  a bare `*`; no code span wraps a line.
- Never touch a skill, a pack or a version.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: stackgen:tool-config owns mise — manual, skills and decision` — written
by the orchestrator after the wave gate.
