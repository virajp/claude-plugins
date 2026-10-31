# U3 — doctor checks the shape through bootstrap

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `SKILL.md`, `references/stack-checks.md`,
  `references/harness-and-memory.md`, `references/code-intelligence.md`.

## Ruling

> - Decision 3: Shaped means `.config/bootstrap.toml` exists.
> - Decision 5: doctor runs `mise run setup:configs --dry-run`; each change it
>   lists is a drift finding, remedy `mise run setup:configs`. A missing
>   `.config/bootstrap.toml` is a blocking finding naming `/vwf:setup reshape`.
> - Decision 6: vwf uses bootstrap's names: `setup` (was `setup:all`), `code`
>   (was `code:all`), `code:format`, `code:lint`.

## Edits

1. **`SKILL.md`** (:50, :180, :214-221) — replace the `preview all` /
   `preview pack` drift check with decision 5.
2. **`references/stack-checks.md`** — §5 (:307-319): shaped means
   `.config/bootstrap.toml` exists; a repo with `.config/stackgen.yaml` and no
   `bootstrap.toml` is a blocking finding naming `/vwf:setup reshape`
   (migration). Rewrite :417-419, :454-559, :607-608, :703.
3. **`references/harness-and-memory.md`** (:56, :91, :119),
   **`references/code-intelligence.md`** (:14, :48) — decision 6 names; no
   tool-config.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rnE 'tool-config|preview (all|pack)|setup:all|code:all' plugins/vwf/skills/doctor`
  — no hit.

## Guardrails

- Do not touch other vwf skills or `plugins/stackgen/**`.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.

## Commit

`feat: doctor checks the repo shape through bootstrap`
