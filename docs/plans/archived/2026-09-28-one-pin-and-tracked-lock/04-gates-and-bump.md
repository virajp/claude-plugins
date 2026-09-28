# U4 — Gates and bump

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release vwf publicly** — patch if `vwf-v20.0.0` is tagged when the run
> starts (`20.0.0` → `20.0.1`, by editing
> `plugins/vwf/.claude-plugin/plugin.json`), else none — rides `20.0.0`; no
> release step.
>
> **Release stackgen publicly** — patch if `stackgen-v2.0.0` is tagged when the
> run starts (`2.0.0` → `2.0.1`, by editing
> `plugins/stackgen/.claude-plugin/plugin.json`), else none — rides `2.0.0`; no
> release step.

## Edits

1. **`git ls-remote --tags origin 'vwf-v20.0.0' 'stackgen-v2.0.0'`** and
   `git tag -l` for each — a tagged one gets its patch edit, an untagged one
   none. Any start value other than `20.0.0` / `2.0.0` is `UNRESOLVED:`. Report
   which branch ran for each under `DECIDED:`.
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

`ops: vwf and stackgen patch — one pin per tool and a tracked lock` when a bump
ran; otherwise `ops: one pin per tool — final gate` only if a generator changed
an owned file; otherwise no commit.
