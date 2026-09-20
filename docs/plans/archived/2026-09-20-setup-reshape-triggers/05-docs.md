# U5 — docs: the reshape triggers, and the decisions doc

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/repo-shape.md`,
  `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-20-setup-reshape-triggers.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines as
  the orchestrator hands them over, then every passage under Edits, then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decisions-doc
  shape); the wave-1 files, only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–5, is the source of truth; quote the
landed skill wording. Not a reversal; the decisions doc records the trigger set
and the `baseline` invocation as the standing shape, and closes the 2026-09-06
open half — "config-side drift as a mode signal" — by naming recall's line as
that signal.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-20-setup-reshape-triggers.md`** — new, per
   the memory shape: the four triggers, offer-not-run, doctor's `baseline`
   subset and why (g) is excluded at recall, and the note that the 2026-09-06
   `init-behind-setup` doc's open half is closed by this.
3. **`CLAUDE.md`** — the setup/init paragraph (`:266-300`): the sentence
   "`setup` … offers `init` once for the whole product when any repo's shape is
   missing or drifted" gains "— at Step 0 and again after its materialize pass —
   and `stackgen-sync` and `/vwf:recall` bring the same offer" in the file's own
   fold.
4. **`.claude/skills/vwf-plugin/SKILL.md`** and
   **`references/skills-and-agents.md`** — the setup, doctor, recall and
   stackgen-sync rows wherever they describe when reshape is reached; the
   workflow-ordering passage if it names the doors.
5. **`site/src/content/docs/plugins/vwf.md`** — `### /vwf:init` "When it runs
   again" (`:1253-1257` region) and the doctor/reshape passage; `### /vwf:setup`
   (Step 0 and reshape); `### /vwf:doctor` (the `baseline` invocation);
   `### /vwf:recall` (the drift line); `### /vwf:stackgen-sync`.
6. **`site/src/content/docs/how-to/brownfield/onboard-existing-codebase.md`**
   and **`how-to/operate/**`** wherever a page tells the reader to "run
   `/vwf:setup reshape` after …" — the instruction stays true but gains that the
   commands now offer it.
7. **`.claude/docs/repo-shape.md`** and **`readme.md`** — only where a hit of
   `grep -rn "reshape" readme.md .claude/docs` reads false after the change.
8. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- `grep -rn "re-run of init is what folds" readme.md CLAUDE.md .claude site/src/content/docs`
  — zero hits.
- `grep -rn "baseline" site/src/content/docs/plugins/vwf.md` — at least one hit
  under the doctor section.

## Guardrails

- No edit under `plugins/**`; quote landed wording.
- Never edit a version file or a generated file — U6.
- Do not end a table cell in a bare asterisk.
- The site's link rule (`site/CLAUDE.md`).
- Delete with `rm`, never `git rm`.

## Commit

`docs: setup reshape triggers — after materialize, stackgen-sync, recall` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
