# U4 — config_format 23: the graphify_report answer

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/migrate-pipeline.md`,
  `plugins/vwf/skills/setup/references/format-lineage.md`,
  `plugins/vwf/skills/setup/references/materialize.md`,
  `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom. Confirm the current
  `config_format` is still 22 before editing; if the required chain moved it,
  return `UNRESOLVED:` naming the number found.

## Ruling

> D3 — init asks one more per-repo question — commit graphify's report, default
> `ignore` — and records `answers.repos.<path>.graphify_report: ignore | commit`
> beside `update_bot`, always present. A reshape re-asks, seeded with the
> recorded value. The answer reaches tool-config `all` as
> `--graphify-report ignore|commit`; an absent flag means `ignore`.

> D4 — `config_format` 22 → 23, with a `22 → 23` migration note: a config
> without `graphify_report` gains it per repo entry — `commit` when
> `git ls-files graphify-out/GRAPH_REPORT.md` lists the file in that repo, else
> `ignore`. Neither 13 nor 17 is in play; `blueprint_format` untouched.

## Edits

1. **`assets/vwf-config.md`** — every place naming the current format (schema
   heading, `config_format:` example, the `answers:` header, and the other
   current-format mentions) reads 23; historical mentions ("since FORMAT 22")
   stay. The `answers:` schema gains `graphify_report: ignore | commit` under
   each repo entry, after `update_bot`. Add a `22 → 23` migration note after the
   `21 → 22` note, in its shape, ending with the "Nth config bump without a
   paired blueprint bump" paragraph advanced by one (count the existing list).
2. **`setup/SKILL.md`** — "The latest config step" names `22 → 23`. Where setup
   passes answers on a re-run, `graphify_report` travels with `update_bot`.
3. **`setup/references/migrate-pipeline.md`** — the stamped number reads 23; add
   the `22 → 23` entry (infer per D4) in the existing entries' shape; the
   `answers:` entry names the new key.
4. **`setup/references/format-lineage.md`** — current number 23; a lineage row
   for 23 describing the new key.
5. **`setup/references/materialize.md`** — the answers map and the missing-block
   inference carry `graphify_report` (inferred per D4).
6. **`doctor/SKILL.md`, `doctor/references/stack-checks.md`** — the answers
   drift check treats a format-23 config whose repo entry lacks
   `graphify_report` as drift, with `/vwf:setup` as the remedy; otherwise
   unchanged.

## Verification

- `grep -rn 'config_format 22\|config_format: 22\|stamped .22.' plugins/vwf/assets/vwf-config.md plugins/vwf/skills/setup`
  prints nothing current (historical mentions only).
- `grep -n 'graphify_report' plugins/vwf/assets/vwf-config.md plugins/vwf/skills/setup/references/migrate-pipeline.md`
  prints a hit in each.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Touch nothing outside Owns; init is U3's; `.claude/skills/vwf-plugin/**`
  (which also names 22) is U6's — report it as `DOCS FALSIFIED:`.
- The key is `graphify_report`, values `ignore` and `commit` — exactly.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand; keep
  code spans on one line.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: vwf config_format 23 records graphify's report mode`
