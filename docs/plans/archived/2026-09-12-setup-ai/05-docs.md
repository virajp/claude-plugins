# U5 — Docs

- **Wave:** 3
- **Depends on:** U1–U4
- **Owns:** `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`,
  `installer/CLAUDE.md`, `.claude/docs/**`, `.claude/skills/**`,
  `docs/memory/decisions/2026-09-12-*.md`, and every path an earlier unit
  reported under `DOCS FALSIFIED:`. Touch nothing outside this list.
- **Model:** opus
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (vwf's),
  every `DOCS FALSIFIED:` line, then the list below.
- **Lazy-load:** `docs/plans/archived/2026-09-05-vwf-init/index.md:281` for
  D22's wording; `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` for the decisions-doc
  shape.

## Ruling

Quoted from index.md:

> **Reversal, confirmed by the user 2026-09-12 (by approving this shape):** D22
> of the 2026-09-05 init plan had the task run `pnpx @virajp.dev/claude-plugins`
> at user scope by default with `--project` as the exception. Now the task runs
> no installer, defaults to project scope, and `--user` is the exception. The
> installer CLI is unchanged and remains the user-facing one-shot. The docs unit
> writes the decisions doc.

Plus rulings 1–7 as the facts the docs now state.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta; apply its findings.
2. Apply every `DOCS FALSIFIED:` line from U1–U4.
3. The survey's list:
   - `site/src/content/docs/plugins/stackgen.md:570-573` — the `setup:ai`
     sentence: project scope, `claude plugin` commands, both marketplace modes,
     the two slots `init` fills, graphify, the statusline hint.
   - `site/src/content/docs/plugins/vwf.md` — wherever `init`'s questions are
     enumerated, add the plugin question; wherever `/vwf:setup` or the
     installation flow says the installer wires a repo, say the installer is the
     one-shot and `setup:ai` is the repo's reconcile.
   - Root `CLAUDE.md` "Installation (end-user)" and `readme.md` — confirm they
     describe the installer only; add one sentence pointing at
     `mise run setup:ai` as what a shaped repo runs to declare its plugins at
     project scope.
   - `installer/CLAUDE.md` — confirm nothing claims `setup:ai` calls it; if a
     passage does, correct it.
   - `.claude/docs/repo-shape.md`, `.claude/skills/stackgen-plugin/**`,
     `.claude/skills/vwf-plugin/**` — grep for `setup:ai`, `code:ai`,
     `pnpx @virajp.dev/claude-plugins` in a task context, and reconcile.
4. **Decisions doc**
   `docs/memory/decisions/2026-09-12-setup-ai-is-project-scope-through-claude.md`
   per `assets/memory.md`: the D22 reversal named as a reversal with the user's
   two quoted rulings, the two-mode rule (never re-add a registered
   marketplace), the slots and their seeding, graphify, the statusline.

## Verification

- `grep -rn 'pnpx @virajp.dev/claude-plugins' site/src/content/docs readme.md CLAUDE.md .claude`
  shows only installer-context passages.
- `mise run p:site:check` green.
- `mise x -- mise run code:precommit` twice, clean on the second.
- `test -f docs/memory/decisions/2026-09-12-setup-ai-is-project-scope-through-claude.md`.

## Guardrails

- Do not touch version files, generated files, `pack.yaml` (U6), or
  `plugins/**`.
- Site frontmatter is strict YAML; relative `.md` links only inside the
  collection.
- Delete with `rm`, never `git rm`.

## Commit

`docs: setup:ai is project scope through claude's own commands; init asks the plugin question`
— written by the orchestrator after the wave gate. Type `docs`; no scope.
