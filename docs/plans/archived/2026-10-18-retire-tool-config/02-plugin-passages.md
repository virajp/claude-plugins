# U2 — Plugin passages drop tool-config and take the new rule numbers

- **Wave:** 1
- **Depends on:** —
- **Owns:** every file under `plugins/` outside
  `plugins/stackgen/skills/tool-config/**` and `plugins/stackgen/skills/mise/**`
  that names tool-config or a checker rule by number
- **Model:** opus
- **Kind:** edit
- **Read first:** the output of
  `grep -rnE 'tool-config|[Rr]ules? ([4-9]|1[0-7])\b' plugins --exclude-dir=tool-config`.

## Ruling

> - Decision 6: Rules 4 and 15 go; rule 11 loses its tool-config part. Renumber
>   1 to 15: 1–3 unchanged, 5–14 → 4–13, 16 → 14, 17 → 15.

## Edits

1. For each grep hit: when it cites a **checker** rule (`p:plugins:check`,
   `checks.md`), map the number per decision 6; a citation of rule 4 or 15 is
   removed with its sentence. A hit about another kind of rule is left alone.
   Known files: `plugins/stackgen/assets/pack-format.md`,
   `plugins/stackgen/stacks/readme.md`,
   `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`,
   `plugins/vwf/skills/setup/references/format-lineage.md`,
   `plugins/vwf/assets/delivery-pipeline.md`,
   `plugins/vwf/skills/execute/references/edit-unit.md`,
   `plugins/vwf/assets/engineering-baseline.md`.
2. Every remaining passage that names `stackgen:tool-config` as current is
   rewritten: the toolchain is bootstrap's; the mise skill is `stackgen:mise`.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rn 'tool-config' plugins --exclude-dir=tool-config` — no hit that
  describes current behaviour.

## Guardrails

- Do not touch `plugins/stackgen/skills/tool-config/**` or
  `plugins/stackgen/skills/mise/**`.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.

## Commit

`docs: plugins drop tool-config and renumber checker rules`
