# U5 — docs: the three modes everywhere, and the decisions doc

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-20-init-mode-seam.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines as
  the orchestrator hands them over, then every passage under Edits, then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`; the wave-1 files,
  only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–8, is the source of truth; quote the
landed wording. Not a reversal: the decisions doc records the three modes, the
stack read and its order, the sub-project definition, and that the "adopt, not
flatten" doctrine now covers `source` and `blank` through pass 6.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-20-init-mode-seam.md`** — new, per the
   memory shape: the three modes and their evidence; the stack read's order and
   the manifest table; the two marked positions; the sub-project definition;
   conflicts offered in every mode; the `stacks:` roster now in the schema
   without a bump. Mirror to the palace `decisions` room when up.
3. **`CLAUDE.md:264-276`, `:306-308`** — the init paragraph: "seven questions"
   stands; the sentence on `existing` vs new becomes the three modes in one
   clause; `:275` "sub-project directory" cites the definition.
4. **`.claude/skills/vwf-plugin/SKILL.md:94-96, 116-118, 131`** and
   **`references/skills-and-agents.md:27-28`** — the init and setup rows.
5. **`site/src/content/docs/plugins/vwf.md`** — `:818` (table row), the
   `### /vwf:init` lead-ins "mode per repo" (`:1009-1016`), "existing repo"
   (`:1098`), the blank/code fork row (`:1471`), `:964, 1035, 1038`
   (sub-project); a new lead-in **The stack read** after "which repos".
6. **`site/src/content/docs/how-to/greenfield/single-repo.md:58-67, 99-101`**
   and **`how-to/brownfield/onboard-existing-codebase.md:81-100`** — the
   walkthroughs name the mode the reader's repo will get (`:91-92`: a source
   repo without `.config/` is `source`, not the existing survey).
7. **`site/src/content/docs/plugins/stackgen.md`** and
   **`.claude/skills/stackgen-plugin/**`** — where the mise pack's runtime block
   or the hygiene ignore table is described.
8. **`readme.md`**, **`.claude/docs/**`** — only where a hit of
   `grep -rn "new pipeline\|existing pipeline\|sub-project directory\|keep ONLY" readme.md .claude/docs`
   reads false.
9. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- `grep -rn "no \`.config/\` and no\|two markers" site/src/content/docs
  CLAUDE.md` — no page still states the two-marker rule as current.
- `grep -rn "sub-project directory" site/src/content/docs CLAUDE.md .claude` —
  every hit cites or sits beside the definition.

## Guardrails

- No edit under `plugins/**`; quote landed wording.
- Never edit a version file, a `pack.yaml` or a generated file — U6.
- Do not end a table cell in a bare asterisk; keep every code span on one line.
- The site's link rule (`site/CLAUDE.md`).
- Delete with `rm`, never `git rm`.

## Commit

`docs: init mode seam — blank, source, shaped; the stack read` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
