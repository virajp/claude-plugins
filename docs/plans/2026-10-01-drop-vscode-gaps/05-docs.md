# W5 — Docs

- **Wave:** 2
- **Depends on:** W1, W2, W3, W4
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/{plugin-authoring,stackgen-plugin,vwf-plugin}/**`,
  `site/src/content/docs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`
  (standalone mode); `site/src/content/docs/plugins/stackgen.md:585-595` and
  `:855-866`.

## Ruling

> G4 — Remove "a per-repo editor profile" as a `REPO_NAME` reader wherever it is
> named.

> G5 — The site manual drops "`//` in JSONC" at `stackgen.md:862`.

## Edits

1. Run `vwf:docs-sync` over the branch delta since the branch base (exclude
   `docs/plans/`) and apply its findings, plus every `DOCS FALSIFIED:` line the
   wave-1 units returned (the orchestrator appends them to this prompt). Likely
   hits: the site's account of `stackgen-sync`'s states (G3), init's pass list
   or pass 7's name in the vwf manual (G1, G2).
2. `site/src/content/docs/plugins/stackgen.md:591` — drop the editor profile as
   a `REPO_NAME` reader (G4).
3. `site/src/content/docs/plugins/stackgen.md:862` — drop "`//` in JSONC" from
   the markers sentence (G5), keeping it true.

## Verification

- `grep -rn -i 'editor profile' readme.md CLAUDE.md .claude site/src/content/docs`
  prints nothing.
- `grep -rn 'in JSONC' site/src/content/docs .claude` prints nothing.
- `mise run p:site:check` green.
- `mise run code:precommit` green (dprint re-pads tables).
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/` or `docs/plans/`; a falsified passage there is
  a `GAP:` line.
- Never end a table cell in a bare `*`; keep code spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`docs: the manual matches the drop-vscode gap fixes`
