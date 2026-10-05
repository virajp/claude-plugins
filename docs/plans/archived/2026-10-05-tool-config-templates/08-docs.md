# U7 — Docs

- **Wave:** 6
- **Depends on:** U6
- **Owns:** `site/src/content/docs/**` except `plugins/vwf.md`; `.claude/**`
  except `.claude/skills/vwf-plugin/**` and
  `.claude/skills/plugin-authoring/references/checks.md`; `readme.md`;
  `CLAUDE.md`; `docs/memory/decisions/2026-10-05-*.md` (new files only)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`;
  `plugins/vwf/assets/memory.md` (decision doc shape); index.md's Goal and
  reversals.

## Ruling

> The ten reversals, confirmed 2026-10-05 ("yes, confirm all ten"), quoted in
> index.md's Goal — one decision doc each.

> E1–E23, quoted from index.md's Assumed decisions.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply its findings plus every
   `DOCS FALSIFIED:` line U1–U6 returned that falls inside Owns.
2. **The survey's list**: `site/src/content/docs/plugins/stackgen.md` (the verb
   reference, the mise file split, `setup:deps:*`, renovate, `.vscode`,
   `keep-existing:`, `machine_env` — rewrite to the renderer);
   `.claude/skills/stackgen-plugin/SKILL.md` (script layout incl. plan 1's
   modules, the four calls, no lock, the verb list);
   `.claude/docs/{repo-shape,ci-and-releases,plugins}.md`;
   `CLAUDE.md:164,187-188,218,241,290,393` (the tasks list, the hooks calling
   `code:{format,lint,check}:all`, renovate, the conf.d names);
   `readme.md:301-320`; the how-to pages
   `how-to/{brownfield/migrate-old-vwf-repo,brownfield/onboard-existing-codebase,greenfield/single-repo,greenfield/multi-repo,operate/choosing-your-stack}.md`.
3. **Decision docs** (new, per `memory.md`), one per reversal, each naming the
   doc it supersedes and quoting the user: `2026-10-05-tool-config-templates.md`
   (1, 2), `2026-10-05-dev-tools-latest-ci-exact.md` (3),
   `2026-10-05-mise-base-ai-pack-folders.md` (4, 10),
   `2026-10-05-universal-supersets.md` (5),
   `2026-10-05-packs-ship-templates-and-subtasks.md` (6, 9),
   `2026-10-05-vscode-settings-universal.md` (7),
   `2026-10-05-renovate-dropped.md` (8).

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`; a falsified passage there is a `GAP:`. vwf's
  docs (`site/.../plugins/vwf.md`, `.claude/skills/vwf-plugin/**`) are plan 3's.
- Never edit an existing decision doc — add new ones.
- `CLAUDE.md`, `readme.md` are dprint-formatted: widening a table cell re-pads
  every row; keep code spans on one line; never end a table cell in a bare `*`.
- Delete with `rm`, never `git rm`.

## Commit

`docs: tool-config renders from templates — site, maintainer docs, decisions`
