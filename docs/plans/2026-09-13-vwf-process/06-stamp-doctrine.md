# U6 — the format-stamp doctrine states the rule

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/skills/setup/references/format-lineage.md`
- **Model:** opus
- **Read first:** `vwf-config.md` lines 30–50 and 240–260 and 540–560;
  `format-lineage.md` lines 1–45.
- **Lazy-load:** nothing else.

## Ruling

Decision 1: "A version is forbidden when any component equals 13 or 17 —
`1.13.0`, `17.0.0`, `2.1.17`, `config_format` 17."

Decision 4: the rule covers "`config_format` and `blueprint_format`".

Decision 5: "`vwf-v19.17.0` predates the rule and stays real, as does
`config_format` 13."

Decision 13: the rule sentence lives "in `vwf-config.md`'s bump instruction, in
`format-lineage.md`'s skip paragraph".

## Edits

1. **`vwf-config.md`** at the bump instruction (251–252, "`config_format`
   versions this file's own schema; bump it … when a key's shape changes") — add
   one sentence: a bump never lands on 13 or 17; those integers are never issued
   on any vwf version line, so 12 goes to 14 and 16 to 18. Leave the 16 → 18
   migration note at 548–552 as it is (it already says 17 is never issued).
2. **`format-lineage.md`** paragraph at 25–30 ("Both lines skip 17, and the
   blueprint line also skips 13 …") — rewrite it as a standing rule plus its
   history: from `config_format` 18 and `blueprint_format` 24 onward, neither
   line issues 13 or 17; a repo stamped 13 or 17 on either line is treated as
   the integer below it. Keep the historical facts exactly: `config_format` 13
   is real and was issued; `blueprint_format` 13 was skipped; 17 was never
   issued on either line. Keep the fold and tone of the surrounding text.

## Verification

- `mise run p:plugins:check` green.
- `command grep -n "never issued" plugins/vwf/assets/vwf-config.md plugins/vwf/skills/setup/references/format-lineage.md`
  shows the new sentence in each file.

## Guardrails

- Do not touch `plugins/vwf/assets/blueprint-format` (the integer stays 24) or
  `format-check.md`.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Delete with `rm`, never `git rm`.

## Commit

`docs: format stamps state that 13 and 17 are never issued` — written by the
orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`docs`; no scopes).
