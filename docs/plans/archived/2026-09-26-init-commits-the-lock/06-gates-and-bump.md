# U6 — Gates and bump

- **Wave:** 4
- **Depends on:** U5
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release vwf publicly** — patch if `vwf-v20.0.0` is tagged when the run
> starts (`20.0.0` → `20.0.1`, by editing
> `plugins/vwf/.claude-plugin/plugin.json`), else none — rides `20.0.0`; no
> release step.

## Edits

1. **`git tag -l vwf-v20.0.0`** — tagged: set vwf `plugin.json` `20.0.0` →
   `20.0.1`; not tagged: no edit. Any start value other than `20.0.0` is
   `UNRESOLVED:`. Report which branch ran under `DECIDED:`.
2. **`mise run p:plugins:marketplace`**; report any diff under `DECIDED:`.
3. **The full wave gate**, with `MISE_ENV=dev` exported.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run p:plugins:shellcheck` green
- `pnpm vitest run` green
- `mise run code:precommit` green
- `mise run p:site:check` green
- `git status --porcelain` shows nothing outside the owned paths, nothing
  staged.

## Guardrails

- No tag, no release task, no commit. Touch no doc, skill or pack. Delete
  nothing.

## Commit

`ops: vwf 20.0.1 — init commits the lock` — or, when no bump ran,
`ops: init commits the lock — final gate` only if a generator changed an owned
file; otherwise no commit.
