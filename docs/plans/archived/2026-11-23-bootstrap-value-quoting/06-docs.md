# U6 — Docs

- **Read first:** the branch delta of waves 1 and 2, then each passage named
  below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D2:** The rule lives in a new section, `## Passing values`, of both
  `bootstrap-contract.md` copies.
- **D3, D4, D5:** Every bootstrap value is quoted, every name in a key path is
  checked, and printed commands follow the same rule.
- **D6:** Doctor's `project-folder` remedy prints no command for a project
  name that is not a valid key.

The survey found that no user-facing doc mentions the quoting rule; the
passages that name these `config set` writes describe them only in passing.

## Edits

1. Run `/vwf:docs-sync` over the branch delta of this run. Apply each finding
   inside the owned paths, and each `DOCS FALSIFIED:` line of U1 to U4.
2. **`.claude/skills/vwf-plugin/`** and **`.claude/skills/stackgen-plugin/`** —
   where a reference lists the sections of `assets/bootstrap-contract.md`, add
   `## Passing values`.
3. **`site/src/content/docs/plugins/vwf.md`** — in the doctor section, where
   the `project-folder` row and its remedy are described, add D6. Change
   nothing else unless docs-sync finds it false.
4. `CLAUDE.md` and `readme.md`: change a passage only if docs-sync finds it
   false.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all`
  pass.

## Guardrails

- Touch nothing outside the owned paths.
- Write all new prose in ASD-STE100.
- `CLAUDE.md` and `readme.md` are dprint-formatted: widening one table cell
  re-pads each row.
- Do not run `git checkout` or `git restore`.

## Commit

`docs: the Passing values rule and the doctor remedy for a bad name`
