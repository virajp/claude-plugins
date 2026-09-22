# U6 — docs: the answers are recorded, and G-2/G-7 are closed

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4, U5
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-22-persisted-answers.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines in
  index.md's Run log, then every passage under Edits, then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`; the wave-1 files,
  only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–9, is the source of truth; quote the
landed wording. The decisions doc records the `answers:` block and its shape,
`config_format` 21, the three callers that now pass a map, the live-forge rule
and its doctor row, sync's fourth classification, removal dropping the
`skipped:` rows, the inference rule for a format-20 config, the unchanged
materializer default, and that gaps **G-2** and **G-7** of
`2026-09-20-pack-intent-rendering` are closed by this landing while G-6 and G-8
stay open. It also records decision 9 — the editor axis persisted now, B40
parked to retire it with the axis.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-22-persisted-answers.md`** — new, per the
   memory shape its sibling files take; mirror to the palace `decisions` room
   when it is up. It **supersedes** the G-2/G-7 passages of
   `docs/memory/decisions/2026-09-20-pack-intent-rendering.md` by naming them —
   that file is the historical record and is not edited.
3. **`CLAUDE.md:307-312`** (the `answers:` map and `skipped:` sentences) and
   **`:346-354`** ("those two are the only keys `init` writes … `config_format`
   20 is the bump that added the second") — three keys, format 21, and the three
   callers that carry the map.
4. **`.claude/skills/vwf-plugin/SKILL.md:114, 135-136, 161`** — the keys init
   writes and the `answers:` map's callers; **`references/assets.md:24`** and
   **`references/docs-tree.md:119-120, 125,
   131-134`** — "currently
   `config_format` 20" and the config-only bump lineage, which gains 21.
5. **`.claude/skills/stackgen-plugin/SKILL.md:91-96`** — the paragraph saying
   the materialize pass and sync pass no answers and that a home for them is a
   follow-up plan: replaced by what landed. Also the `skipped:` and removal
   semantics under the lockfile's description, and sync's fourth classification.
6. **`site/src/content/docs/plugins/vwf.md:951-956, 1176-1186, 1656-1657`** —
   the editor-keys context, the "no remote yet → forge files on the reshape that
   follows" walkthrough (now: doctor says so, and the reshape lands them), and
   the enforcement-keys list beside the new `answers:` block;
   **`plugins/stackgen.md:424-432`** — "an axis the caller did not answer reads
   true" stays true as a default, but the three callers now answer;
   **`how-to/brownfield/migrate-old-vwf-repo.md:71`** — "the newest format, 20"
   → 21, with what the bump adds and that nothing converts.
7. **`readme.md`** — only where a grep hit reads false.
8. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green (run twice; the first may reflow).
- `grep -rn "config_format 20\|format, 20" readme.md CLAUDE.md .claude site/src/content/docs`
  — no hit calls 20 the current format.
- `grep -rn "passes no \`answers\`\|follow-up plan"
  .claude/skills/stackgen-plugin/SKILL.md` — zero hits.

## Guardrails

- No edit under `plugins/**` or `scripts/**`; quote landed wording.
- Never edit a version file or a generated file — U7's.
- `docs/plans/2026-09-20-pack-intent-rendering/**` is the historical record —
  not edited; the new decisions doc supersedes it.
- Do not end a table cell in a bare asterisk; keep every code span on one line.
- The site's link rule (`site/CLAUDE.md`).
- Delete with `rm`, never `git rm`.

## Commit

`docs: persisted answers — the four axes recorded, every caller evaluates them`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
