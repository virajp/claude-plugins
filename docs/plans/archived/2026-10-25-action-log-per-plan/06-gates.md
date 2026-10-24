# U6 — Gates

- **Read first:** the plan's `gates` in `index.json`.

## Ruling

No version bump: the release levels in `index.json` are what `/vwf:execute`
records at landing.

> - D18: No. code:precommit declares --all as a usage flag; mise run -n
>   code:precommit --all shows that the flag reaches the task. The plan A
>   gap ruling of 2026-10-25 chose this form.
> - D25: Add mise x -- mise run p:site:check to the plan gate (astro check,
>   the build and the link checker). U5 keeps the heading 'The action log'
>   of site/src/content/docs/plugins/vwf.md, so the anchor #the-action-log
>   that plugins/mempalace.md:102 links to stays.

## Edits

1. Run `mise x -- mise run p:plugins:marketplace`. No manifest changes, so
   `.claude-plugin/marketplace.json` is expected to stay the same; keep what
   the generator writes.
2. Run every line of the plan gate and fix nothing outside this unit's
   `owns`; report a red line as `UNRESOLVED:` with its output tail.

## Verification

- `mise x -- mise run code:precommit --all`
- `mise x -- mise run p:plugins:marketplace -- --check`
- `mise x -- mise run p:plugins:check`
- `mise x -- pnpm vitest run`
- `mise x -- pnpm exec tsc --noEmit -p scripts`
- `mise x -- mise run p:site:check`

## Guardrails

- Do not bump a version. Do not edit a file outside `owns`.

## Commit

`ops: plan gates for the action log per plan`
