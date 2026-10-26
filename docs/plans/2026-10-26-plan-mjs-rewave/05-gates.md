# U5 — Gates

- **Read first:** the plan's `gates` in `index.json`.

## Ruling

Quoted from the plan's decisions:

> - D14: No. The code:precommit task declares --all as a usage flag (#USAGE
>   flag "--all" in .config/mise/tasks/code/precommit), so mise passes it to
>   the task; the template proposes this exact line, and the
>   2026-10-24-plan-json-format run passed it. The line stays as written.

No decision of this plan names a generator. The plan bumps no version: the
`release_levels` (vwf MINOR, site PATCH) are recorded by `/vwf:execute` at
landing.

## Edits

1. Run `mise x -- mise run p:plugins:marketplace`. If it changes
   `.claude-plugin/marketplace.json`, keep the change (it is yours); if not,
   change nothing.
2. Pass the full wave gate: `mise x -- mise run code:lint` and
   `mise x -- mise run p:plugins:check`.

## Verification

- `mise x -- mise run p:plugins:marketplace -- --check` — green.
- `mise x -- mise run code:lint` — green.
- `mise x -- mise run p:plugins:check` — green.

## Guardrails

- Touch nothing outside your owned paths. Bump no version.
- Never run `git checkout`, `git restore` or a formatter with `--fix` on a
  path you do not own.

## Commit

`ops: regenerate the marketplace manifest` — only when step 1 changed it.
