# U10 — Docs

- **Wave:** 4
- **Depends on:** U2, U3, U4, U6, U7, U9
- **Owns:** `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-26-tool-config-gates.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  and wave-2 files; index.md's Goal, Reversals and Facts (the "Docs naming the
  retired names" line); every `DOCS FALSIFIED:` line U1–U8 and U12 returned;
  `plugins/vwf/assets/memory.md`.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

Decisions 1–9 of index.md, as the behaviour the docs now describe (quoted in
`01-move.md` to `08-assets.md` and `12-this-repo.md`). The Goal, quoted:

> After this lands, `stackgen:tool-config` owns dprint, pre-commit, gitleaks and
> grype the way T1 made it own mise: their content lives in the skill, every
> other pack asks for a dprint plugin, a pre-commit hook, an exclude or an
> ignore through a `tool-config:` call, the `repo-gates` bundle is gone, init
> lands the gates through `/stackgen:tool-config all`, and a shaped repo — this
> one included — refreshes its graphify graph from a pre-commit `post-commit`
> hook instead of graphify's raw git hooks.

The decision doc records the four reversals, the base-vs-pack split of excludes
and dprint plugins, and the graphify hook. Any sentence you add is short (B65).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns —
   expected: `site/src/content/docs/plugins/stackgen.md` (:336, :498, :614,
   :677, :695, :703, :766), `CLAUDE.md:173` and the rule 11 / rule 15 passages
   under Tasks, `.claude/docs/repo-shape.md:171`,
   `.claude/skills/stackgen-plugin/SKILL.md` (:81, :190, :254, :296, :302,
   :373), `.claude/skills/vwf-plugin/SKILL.md:121`,
   `.claude/skills/vwf-plugin/references/dependencies.md:33`,
   `.claude/skills/vwf-plugin/references/skills-and-agents.md:27`,
   `.claude/skills/plugin-authoring/references/checks.md:105`,
   `site/src/content/docs/plugins/vwf.md` (init's landing).
2. **The decision doc.**
3. **Every `DOCS FALSIFIED:` line** from U1–U8 and U12.

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

`docs: stackgen:tool-config owns the gates — manual, skills and decision` —
written by the orchestrator after the wave gate.
