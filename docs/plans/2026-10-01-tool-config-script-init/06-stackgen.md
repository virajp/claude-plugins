# I6 — stackgen prose and B80's stale passages

- **Wave:** 3
- **Depends on:** I3
- **Model:** opus
- **Kind:** edit
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/{mise,hygiene}.md`,
  `plugins/stackgen/assets/{pack-format,output-tree}.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`,
  `plugins/stackgen/stacks/bundles/fnox.md`,
  `plugins/stackgen/stacks/package-manager/swiftpm/conventions.md`

## Ruling

> I1, I2, I4 as in index.md; I6 — swiftpm line ≤ 80 cols; stale passages fixed.

## Edits

1. `TC/SKILL.md`, `references/mise.md` — the two verbs and `_default`'s shape;
   new `references/hygiene.md` — what the tool lands, its keys, the LLM's part.
2. B80 item 7: `pack-format.md:40`, `output-tree.md:405`,
   `materializer.md:135-136`, `bundles/fnox.md:54-55`.
3. B80 item 6: `swiftpm/conventions.md:35` folded to ≤ 80 columns.

## Verification

- `mise run p:plugins:check` green; the full wave gate.

## Commit

`refactor: tool-config prose for task and hygiene verbs; stale passages fixed`
