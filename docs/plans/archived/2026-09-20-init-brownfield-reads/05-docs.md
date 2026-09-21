# U5 — docs: the brownfield lead-ins, and the decisions doc

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-20-init-brownfield-reads.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines, then
  every passage under Edits, then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`; the wave-1 files,
  only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–12, is the source of truth; quote the
landed wording. Not a reversal: the decisions doc records the tool-config table
and its three outcomes, the section merge, the hook-manager row, the five shared
post-landing steps, the hash writers, and the stub config.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-20-init-brownfield-reads.md`** — new, per
   the memory shape; mirror to the palace `decisions` room when up.
3. **`site/src/content/docs/plugins/vwf.md`** — the `### /vwf:init` brownfield
   lead-ins (`:1098` existing repo, `:1143` helper library, `:1155` function
   moves, `:1174` diverged pack file, `:1206` own tasks kept, `:1221` readme
   moved, `:1312` gate-first): a new lead-in **Root tool configs** after
   "existing repo" (the table, the three outcomes, the renovate twin), **Hook
   manager** beside the gate-first passage, `.gitignore` merge where the
   diverged-file lead-in mentions it, the five shared steps where the git pass
   is introduced, and one sentence on the hashes.
4. **`site/src/content/docs/how-to/brownfield/onboard-existing-codebase.md:86-100`**
   — the walkthrough: `:91-93` is stale twice over (plan 2's `source` mode and
   this plan's reads) — rewrite the paragraph to what the reader will see: the
   root-config rows, the hook-manager row, the merged `.gitignore`.
   **`how-to/brownfield/migrate-old-vwf-repo.md:68-74`** — the stub config
   sentence if it speaks of Deferred answers.
5. **`CLAUDE.md:262-270`** — the init paragraph: "adopts rather than flattens"
   gains the root-config offer in one clause.
6. **`.claude/skills/vwf-plugin/SKILL.md:86, 152-162`** and
   **`references/skills-and-agents.md:27-28`**.
7. **`site/src/content/docs/plugins/stackgen.md`**,
   **`.claude/skills/stackgen-plugin/**`** — where the renovate landing or the
   lockfile hash is described.
8. **`readme.md`**, **`.claude/docs/**`** — only where a hit of
   `grep -rn "replace-or-keep\|Deferred\|renovate" readme.md .claude/docs` reads
   false.
9. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- `grep -n "Root tool configs\|hook manager" site/src/content/docs/plugins/vwf.md`
  — both lead-ins present.
- grep `onboard-existing-codebase.md` for "existing-repo survey" in the
  no-`.config/` sentence — zero hits.

## Guardrails

- No edit under `plugins/**`; quote landed wording.
- Never edit a version file, a `pack.yaml` or a generated file — U6.
- Do not end a table cell in a bare asterisk; keep every code span on one line.
- The site's link rule (`site/CLAUDE.md`).
- Delete with `rm`, never `git rm`.

## Commit

`docs: init brownfield reads — root tool configs, hook manager, gitignore merge, hashes`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
