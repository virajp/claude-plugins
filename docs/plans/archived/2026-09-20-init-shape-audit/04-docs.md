# U4 — docs: the ranked summary, the palace mirror, docs-sync

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `docs/memory/problems/2026-09-20-init-shape-audit.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the three walk files
  (`docs/memory/problems/2026-09-20-init-shape-audit-{greenfield,brownfield,landing-register}.md`)
  whole; `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`;
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** the wave-1 units' `DECIDED:` and `GAP:` lines as the
  orchestrator hands them over.

## Ruling

Decision 3 — Where it lives:
"`docs/memory/problems/2026-09-20-init-shape-audit.md` — the one-page summary
ranking every finding by severity and naming the D2 candidates — written by the
docs unit; each opens with the AAAK line the memory shape asks for, and the docs
unit files the four as drawers in the palace `problems` room when the server is
up."

Decision 5 — Lens: "The request's two asks — greenfield stack detection, a
config-of-intent instead of copying — are answered in the summary as D2
candidates, not decided here."

## Edits

1. **`docs/memory/problems/2026-09-20-init-shape-audit.md`** — new, one page:
   the AAAK line; **What was audited** (three links, the method, the lens, the
   user's three observations); **Findings, ranked** — every numbered finding
   from the three files merged into one list ordered blocks-a-user →
   surprises-a-user → cosmetic, each one line with its source file and number;
   **What the repo already had that init ignored** — the subset of findings
   answering the user's first observation, as a short table (path · what a repo
   has · what init does); **D2 candidates** — the union of the three files'
   candidate lists, deduplicated, each with the findings it would close and a
   one-line note on whether it is a greenfield read, a brownfield
   read-before-land, or a config-of-intent question; **Not a finding** — what
   the walks confirmed already works (the sidecar, the kept-task list, the
   diverged-file offer, the editor collision round), so D2 does not re-plan it.
2. Run `vwf:docs-sync` over the branch delta; apply any finding (expected: none
   — no behaviour changed).
3. File the four `docs/memory/problems/2026-09-20-init-shape-audit*.md` as
   drawers in the palace `problems` room for this repo's wing when the server is
   up (`mempalace_add_drawer`, one per file, the file's AAAK line as the
   drawer's first line); skip silently when it is not, and say so in `DECIDED:`.

## Verification

- `mise run code:precommit` green.
- Every finding number in the three walk files appears exactly once in the
  ranked list — count them.
- Every D2 candidate names at least one finding.
- The file opens with the AAAK line.

## Guardrails

- Write **only** the owned file; the three walk files are U1–U3's and are not
  edited here — a defect in one is a `GAP:` line, not a fix.
- No edit under `plugins/**`, `site/**`, `readme.md`, `CLAUDE.md`, `.claude/**`
  — nothing here falsifies them; docs-sync confirms.
- Do not decide a fix; rank and name.
- Do not end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`.

## Commit

`docs: init shape audit — ranked summary and D2 candidates` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
