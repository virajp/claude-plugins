# U8 — Docs

- **Wave:** 5
- **Depends on:** U7
- **Owns:** `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`,
  `.claude/skills/**` (except `plugin-authoring/references/checks.md`),
  `.claude/docs/**`, `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-10-18-packs-hand-off-to-bootstrap.md` (new), and
  any other human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to
  U6 and U9
- **Model:** opus
- **Kind:** edit
- **Read first:** `index.md` of this folder — the Goal, the reversals and the
  decisions table.

## Ruling

> - Decision 15: This plan closes the Kotlin and Android gaps listed in the
>   facts, but the folders do not go on `gaps_of:` — those rows also hold
>   stackgen follow-up gaps.

The four reversals in the Goal, confirmed by the user on 2026-10-18.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line U1 to U6 returned.
2. **`docs/memory/decisions/2026-10-18-packs-hand-off-to-bootstrap.md`** — new,
   per `plugins/vwf/assets/memory.md`: decisions 3 to 11 of `index.md`, the four
   reversals by file name, and the user's handoff words quoted from
   `05-materializer.md`.
3. Known passages: `site/src/content/docs/plugins/stackgen.md` (pack
   `templates/`, `values:`, pack subtasks; the pack format), the
   `.claude/skills/stackgen-plugin/` skill, `.claude/docs/repo-shape.md`,
   `CLAUDE.md` (the stackgen row: "a pack ships `config/` payload … and a
   `templates/` folder the script renders"), `plugins/stackgen/stacks/readme.md`
   (:126). Leave the passages that describe `stackgen:tool-config` itself or the
   vwf skills — plans 2 and 3 own them.
4. Do not edit the live plan folders under `docs/plans/`; record decision 15 in
   the decisions doc only.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rnE 'values:|templates/' site/src/content/docs/plugins/stackgen.md` —
  no hit that describes a pack tier.

## Guardrails

- `CLAUDE.md`, `readme.md` and `site/**` are dprint-formatted; never end a table
  cell in a bare asterisk; keep each code span on one line.
- Do not edit `docs/plans/**`.

## Commit

`docs: packs take their toolchains from bootstrap`
