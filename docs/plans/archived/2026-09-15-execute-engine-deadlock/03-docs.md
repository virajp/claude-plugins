# U3 — docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`
- **Model:** opus
- **Read first:** every `DOCS FALSIFIED:` line U1 and U2 returned; the survey
  list below; then each owned file you will edit, top to bottom.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (the
  procedure); `site/CLAUDE.md` (the link rule and the gate); the edited
  `plugins/vwf/skills/execute/SKILL.md` step 3 and
  `plugins/vwf/agents/execute-code-reviewer.md` step 1 (quote their wording,
  never re-derive it).

## Ruling

Quoted from `index.md`:

> **1 — Who runs the engines.** The orchestrator invokes `/code-review` (high
> effort) and `/security-review` itself, in one message, after the coder
> returns; waits on both with `TaskOutput`; then dispatches both reviewers in
> one message with each engine's output in its prompt. The reviewers run no
> engine.

> **2 — Reviewer turn shape.** A reviewer is single-turn: manual dimensions,
> merge with the engine text in its prompt, return one block.

No reversal was confirmed in the interview, so this unit writes **no**
`docs/memory/decisions/` doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings.
2. The passages the survey identified, whatever docs-sync reports:
   - **`site/src/content/docs/plugins/vwf.md:195-197`** ("leans on review
     engines") — now: execute runs the two engines itself and hands their
     findings to the reviewers, which fall back to their manual dimensions when
     an engine is unavailable. One or two sentences; do not describe
     `TaskOutput` or the 30-minute cap to a user.
   - **`site/src/content/docs/plugins/vwf.md:1889-1894`** (the `/vwf:execute`
     bullet) — the sequence reads `code → engines → review ‖ security`; the
     findings-loop and 4-round text stays.
   - **`site/src/content/docs/plugins/vwf.md:205-210`, `:168-177`, `:325`** —
     check each; they describe the loop's shape and the model tiering, and are
     expected to stay true. Edit only what U1/U2's wording falsified.
   - **`.claude/skills/vwf-plugin/references/skills-and-agents.md:69-70`** — the
     two agent rows; if either gist names the engine as the agent's own, fix it.
   - **`readme.md:57-62`**, **`how-to/greenfield/single-repo.md:282-284`**,
     **`how-to/greenfield/cli-product.md:167`** — expected unchanged; confirm.
3. Every `DOCS FALSIFIED:` line U1 and U2 returned.

## Verification

- `mise run p:site:check` green (the link checker runs over the built site).
- `command grep -rn 'as its engine' readme.md CLAUDE.md .claude site/src/content/docs`
  is empty.
- `command grep -n 'code → review → security' site/src/content/docs/plugins/vwf.md`
  is empty.

## Guardrails

- Touch nothing under `plugins/` — U1 and U2 own the plugin text, and the bump
  is U4's.
- `readme.md`, `CLAUDE.md`, `site/CLAUDE.md` **are** dprint-formatted; widening
  a table cell re-pads every row. Run `mise run code:format --fix` on the files
  you edited only.
- Never end a table cell in a bare asterisk (formatter/linter oscillation).
- Delete with `rm`, never `git rm`.

## Commit

`docs: execute runs the review engines — manual and agent table reconciled` —
written by the orchestrator after the wave gate, not by the unit. Type `docs` is
in `.config/git-conventional-commits.yaml`; the file lists no scopes.
