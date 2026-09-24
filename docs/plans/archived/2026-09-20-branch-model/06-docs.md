# U6 — docs: the branch model everywhere, and the decisions doc

- **Wave:** 3
- **Depends on:** R5
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`,
  `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-branch-model.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines, then
  every passage under Edits, then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`; the wave-1 files,
  only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–8, is the source of truth; quote the
landed wording. The reversal from index.md's Goal becomes one decisions doc:

"`MERGE_MODEL` — 'a marked `[env]` position, `direct|pr`, read as `direct` when
unset, filled at landing'
(`2026-09-12-task-library-configures-each-gate-once.md:68-77`) — is retired in
favour of two positions, one per branch. A repo still carrying the single key is
read as both until its next reshape, and doctor reports it as drift."

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-20-branch-model.md`** — new, per the memory
   shape: the two positions and their defaults, the readers, the legacy rule,
   the fixed names and the mainline rule, the ops commit on `develop`, the
   detached-member refusal, what B53 declined (merge method, PR requirements).
   The 2026-09-12 doc gets one `Superseded by` line at its `MERGE_MODEL`
   passage. Mirror to the palace `decisions` room when up.
3. **`CLAUDE.md:283-288`** (init's git pass — `MERGE_MODEL` → the pair),
   `:365-367` and `:471-473` (the branch model — per-branch landing in one
   clause), `:126`.
4. **`.claude/docs/ci-and-releases.md:44-49, 59-60, 69-77, 102`** — the branch
   model and `MERGE_MODEL` passages.
5. **`site/src/content/docs/plugins/vwf.md:79-80, 197, 783`**, `:1248-1252`
   (branch model), `:1255-1260` (`MERGE_MODEL` → the pair and the two-row
   question), `:1262-1284` (forge pass: require-PR per branch); the
   `### /vwf:doctor` predicate (f) passage.
6. **`site/src/content/docs/plugins/stackgen.md:615, 728, 743-752`** — the merge
   tasks and the env positions.
7. **`.claude/skills/vwf-plugin/**`**, **`.claude/skills/stackgen-plugin/**`** —
   wherever `MERGE_MODEL` is named.
8. **`readme.md`** — only where a hit of `grep -n "MERGE_MODEL" readme.md` reads
   false.
9. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- `grep -rn "MERGE_MODEL\b" readme.md CLAUDE.md .claude site/src/content/docs` —
  every remaining hit is the legacy sentence; the pair is named beside it.

## Guardrails

- No edit under `plugins/**`; quote landed wording.
- Never edit a version file, a `pack.yaml` or a generated file — U7.
- Do not end a table cell in a bare asterisk; keep every code span on one line.
- The site's link rule (`site/CLAUDE.md`).
- Delete with `rm`, never `git rm`.

## Commit

`docs: branch model — landing model per branch, ops commit on develop` — written
by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
