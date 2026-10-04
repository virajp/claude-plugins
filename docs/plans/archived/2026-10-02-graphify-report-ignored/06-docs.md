# U6 — Docs and the decisions doc

- **Wave:** 3
- **Depends on:** U2, U3, U4, U5
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/{vwf-plugin,stackgen-plugin}/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-02-graphify-report-ignored-by-default.md`
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`
  (standalone mode); `plugins/vwf/assets/memory.md` (the decisions doc shape);
  one recent file in `docs/memory/decisions/` as a model.

## Ruling

> D1 — `graphify-out/GRAPH_REPORT.md` is ignored by default. The `ignore` mode
> asks git for `graphify-out/` alone; the `commit` mode keeps today's
> `graphify-out/*` then `!graphify-out/GRAPH_REPORT.md`, negation after its
> pattern. The "diffable in review" rationale retires.

> D8 — The reversal is recorded as
> `docs/memory/decisions/2026-10-02-graphify-report-ignored-by-default.md`.

## Edits

1. Run `vwf:docs-sync` over the branch delta since the branch base (exclude
   `docs/plans/`) and apply its findings, plus every `DOCS FALSIFIED:` line the
   wave-1 units returned (the orchestrator appends them to this prompt).
2. `site/src/content/docs/plugins/stackgen.md` — the graphify git-lines passage
   (around `:764-769` before the chain) describes both modes and the default
   (D1); the `all` flag list names `--graphify-report`.
3. The vwf manual's init question list and `vwf.yaml` `answers:` description in
   `site/src/content/docs/**` name the new question and `graphify_report`, and
   the current `config_format` reads 23.
4. `.claude/skills/vwf-plugin/references/docs-tree.md` and `assets.md` — the
   current `config_format` reads 23, and the bump count advances by one.
5. Write the decisions doc (D8): the ruling, the reversed rule and its old
   rationale, the rejected alternatives (ignore always; flag not persisted;
   hand-added negation), and the migration inference.

## Verification

- `grep -rn 'worth diffing' site/src/content/docs .claude` prints nothing.
- `grep -rn 'graphify-report\|graphify_report' site/src/content/docs` prints
  hits.
- `mise run p:site:check` green.
- `mise run code:precommit` green (dprint re-pads tables).
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/` or `docs/plans/`; a falsified passage there is
  a `GAP:` line.
- Never end a table cell in a bare `*`; keep code spans on one line.
- Delete with `rm`, never `git rm`.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: the manual and a decisions doc for graphify's report mode`
