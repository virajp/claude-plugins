# U5 — the `after_landing:` key

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom, before editing.

## Ruling

> - Decision D11: A new optional key in `.config/vwf.yaml`, `after_landing:`, is
>   a list of commands. The user edits it by hand. `/vwf:execute` runs these
>   commands after every green landing, after the plan's own After landing rows,
>   as `run` steps. A command that the plan also lists runs once. The key is
>   additive: `config_format` stays 23.
> - Decision D12: In an `all` run, the `after_landing:` commands are steps like
>   the plan rows, so the "Deduped after-landing steps" override applies to them
>   too.

## Edits

1. **Schema block (`## Schema (config_format 23)`)** — add an optional top-level
   key with a comment, for example
   `after_landing: [] # hand-edited — commands /vwf:execute runs after every green landing, after the plan's own steps`.
   The heading stays `config_format 23`.
2. **Semantics table (about `:218-235`)** — add a row: `after_landing` — written
   by the user (hand-edited) — read by `execute` (and by `change-plan` and
   `plan`, which do not propose a listed command as a plan step).
3. **Reading rules** — add a bullet in the style of the `design.viewports`
   bullet: the key is a list of shell commands; absent or empty means none;
   `/vwf:execute` runs them after each green landing, after the plan's rows,
   each once, a failure stopping the rest; never on a landing that did not
   merge; under `all`, the Deduped override covers them. The key is additive, so
   it needed no `config_format` bump.

## Verification

- The full wave gate, notably `mise run code:precommit`.
- `grep -n "after_landing" plugins/vwf/assets/vwf-config.md` returns the schema
  line, the semantics row and the reading rule.

## Guardrails

- Do not touch any file outside Owns. Do not change `config_format` anywhere.
- `plugins/**/*.md` is not formatted by dprint: match the fold width and the
  semantics table padding by hand.
- Keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: vwf config gains after_landing default steps`
