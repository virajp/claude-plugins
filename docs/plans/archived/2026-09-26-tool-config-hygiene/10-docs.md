# U10 — Docs

- **Wave:** 4
- **Depends on:** U9
- **Owns:** `.claude/**`, `CLAUDE.md`, `readme.md`, `installer/CLAUDE.md`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-27-tool-config-hygiene.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; index.md's Goal,
  reversals and decisions table; every `DOCS FALSIFIED:` line the orchestrator
  passes; `docs/memory/decisions/2026-09-26-tool-config-gates.md` for the
  decision-doc shape.

## Ruling

> **Docs ship with the change.** Any change to plugin behavior must reconcile
> `readme.md`, `CLAUDE.md`, and the manual under `site/src/content/docs/` in the
> same commit.

> Reversals 1–4 of index.md's Goal, confirmed at the interview, become one
> decision doc.

> - Decision 25: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta and apply its findings.
2. **The survey's hits** — `.claude/skills/stackgen-plugin/SKILL.md` :100-102,
   :130, :176-184, :245, :251, :286; `.claude/skills/vwf-plugin/SKILL.md`
   :129-130; `.claude/skills/vwf-plugin/references/dependencies.md` :35-44;
   `.claude/skills/vwf-plugin/references/skills-and-agents.md` :27-28;
   `.claude/skills/plugin-authoring/references/checks.md` rule 11 (:105) — the
   git verbs and the shrunk pack allowlist;
   `site/src/content/docs/plugins/stackgen.md` :344, :439, :680, :691, :765,
   :776, :1183, :1252 and its `/stackgen:tool-config` section (eight tools, the
   git, graphify, renovate verbs, template pin);
   `site/src/content/docs/plugins/vwf.md` :927, :940, :1726-1750;
   `site/src/content/docs/installer/{targets,internals,usage}.md` (no
   `hook install`; uninstall still runs `hook uninstall`); `installer/CLAUDE.md`
   likewise; `CLAUDE.md` and `readme.md` where they name the hygiene pack,
   unconditional bundles or the installer's graphify step.
3. **Every `DOCS FALSIFIED:` line** the earlier units returned.
4. **`docs/memory/decisions/2026-09-27-tool-config-hygiene.md`** (new) — the
   ask, what changed (the decisions table in prose), the four reversals, and
   "what follows": B67 next, then the gap-closing plans.

## Verification

- `MISE_ENV=dev mise run p:site:check` green
- `MISE_ENV=dev mise run code:precommit` green
- `grep -rn 'repo-hygiene\|unconditional bundle\|hook install' .claude CLAUDE.md readme.md installer/CLAUDE.md site/src/content/docs`
  returns only historical mentions in the new decision doc

## Guardrails

- `CLAUDE.md`, `readme.md`, `installer/CLAUDE.md` and `site/**` are
  dprint-formatted: widening a table cell re-pads every row; never end a table
  cell in a bare asterisk.
- No plugin file — report anything left as `GAP:`.
- No `git checkout`/`restore`.

## Commit

`docs: tool-config hygiene — git, graphify, renovate; init fetches no bundle` —
written by the orchestrator after the wave gate.
