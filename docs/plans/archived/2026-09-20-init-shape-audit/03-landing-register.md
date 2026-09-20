# U3 — the landing register: every file the three bundles ship

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `docs/memory/problems/2026-09-20-init-shape-audit-landing-register.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/pack-format.md` whole (marked
  positions, placeholders, the fragment convention);
  `plugins/stackgen/stacks/bundles/mise.md`, `bundles/repo-gates.md`,
  `bundles/repo-hygiene.md` (the three unconditional bundles — confirm the names
  from `plugins/stackgen/stacks/inventory.md`); each named pack's `pack.yaml`
  and `conventions.md`; then every file under each pack's `config/` — walk the
  tree with `find`, do not sample.
- **Lazy-load:** `plugins/vwf/skills/init/references/new-repo.md` and
  `existing-repo.md` only to record which pass touches a path;
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.

## Ruling

Decision 1 — Method: "**Read-only walks** … every finding cites `file:line` in
the plugin and, where it applies, the pack file that lands."

Decision 2 — Register shape: "landed path · source pack · what init reads first
(or "nothing") · behaviour when the path exists (overwrite / keep / offer /
merge / splice / unspecified) · stack-conditional (yes / no / should be, with
why) · duplicate or conflict risk · pointer."

Decision 5 — Lens, third question: "*is this landing right for a repo whose
stack the registry names*" — for a payload file, whether its content assumes a
language, a package manager, a CI host or a forge, and whether a marked position
or a placeholder makes that assumption adjustable.

## Edits

1. **`docs/memory/problems/2026-09-20-init-shape-audit-landing-register.md`** —
   new. Sections, in order: the AAAK line; **The three bundles** — name, the
   packs each resolves to, version pins, pointers; **The register** — one row
   per landed file across all three (the mise task scripts may be grouped by
   task group with a count, every other file is its own row), with the
   decision-2 columns plus: *marked positions / placeholders* it carries, and
   *content assumptions* (a tool name, a package manager, a language, a CI host,
   a forge) with the line that makes them; **Composed and derived files** — the
   editor pair, the `.claude/` lockfile, the `README` stub, LICENSE, SECURITY.md
   — with what composes them and from what; **Assumption map** — every content
   assumption grouped by what it assumes, and whether any existing pin
   (`stacks:`, the registry, a platform token) could condition it; **Findings**
   — numbered, severity-tagged; **D2 candidates** — which files a
   config-of-intent could describe instead of copy, and which must stay byte
   payloads (hook scripts, task libraries).

## Verification

- `mise run code:precommit` green.
- The register's row count equals the number of files under the three packs'
  `config/` trees (grouped task scripts counted by their stated count) — state
  both numbers at the top of the section.
- Every row carries a pointer.
- The file opens with the AAAK line.

## Guardrails

- Write **only** the owned file; read everything else. No edit under
  `plugins/**`.
- Walk the `config/` trees with `find`, whole; a sampled register is sent back
  by the wave review.
- Name findings, not fixes.
- Do not end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`.

## Commit

`docs: init shape audit — landing register` — written by the orchestrator after
the wave gate. Type from `.config/git-conventional-commits.yaml`; no scopes.
