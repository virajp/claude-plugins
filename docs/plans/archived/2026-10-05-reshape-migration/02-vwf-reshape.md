# U2 — vwf's reshape migrates

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/**`, `plugins/vwf/skills/setup/**`,
  `plugins/vwf/skills/doctor/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** init's `SKILL.md` and `references/existing-repo.md` (the
  reshape path and plan 3's "old layout: stop"); setup's `SKILL.md` (Step 0),
  `references/migrate-pipeline.md`, `references/format-lineage.md` (the 23 row
  plan 3 added); doctor's `references/stack-checks.md` (the old-layout finding);
  `plugins/vwf/assets/vwf-config.md` (format 23, read-only here).

## Ruling

> G1 — vwf's reshape passes `--forge` and `--secrets` from `vwf.yaml`'s
> `answers:` (stackgen never reads a vwf file), then drops `answers:` and sets
> `config_format: 23`. Pack contents come back by re-running `pack` for each
> pinned pack.

> G5 — Reshape runs the migration over the base repo and every member under one
> consent, a full render each — B55's fix.

> G6 — Plan 3's "old layout: say so and stop" becomes "offer the migration":
> init's reshape path calls `all` with the forge/secrets flags; setup's migrate
> pipeline gains the 22 → 23 body; setup's Step 0 and doctor name
> `/vwf:setup reshape` as the remedy for an old layout.

## Edits

1. **init** — the old-layout branch: for each repo (base, then members in order)
   run `preview all` with `--forge`/`--secrets` from that repo's
   `answers.repos.<path>.forge` and `answers.secrets`, show every repo's rows in
   init's one consent, then run each with `--answers`; then re-run `pack` for
   each pinned pack (setup's materialize); relay `needs-edit` rows and make the
   edits they name with the person. An `older` refusal is relayed verbatim.
2. **setup** — `migrate-pipeline.md` gains the 22 → 23 body: after init's
   reshape lands `stackgen.yaml` in every repo, remove `answers:` from
   `vwf.yaml` and set `config_format: 23`; never before (the flags are read from
   it). Step 0 offers reshape for an old layout instead of stopping.
3. **doctor** — the old-layout finding's remedy is `/vwf:setup reshape`; a repo
   still carrying `answers:` at `config_format` 22 is the same finding.

## Verification

- `rg -n "say so and stop|stops rather than reshaping" plugins/vwf` prints
  nothing.
- `mise run p:plugins:check` green.

## Guardrails

- Touch nothing outside the three skill trees; `vwf-config.md` and the site are
  U4's if they need a word changed (report `DOCS FALSIFIED:`).
- `plugins/**/*.md` is not dprint-formatted: match the fold width; code spans on
  one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf setup reshape migrates every repo of a product onto the template layout`
