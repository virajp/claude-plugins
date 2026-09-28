# U2 — The hygiene pack follows the new mise paths

- **Wave:** 1
- **Depends on:** —
- **Owns:** the repo-hygiene pack's payload `.gitignore`, `.gitattributes` and
  `CONTRIBUTING.md` (`plugins/stackgen/stacks/repo-hygiene/**/config/…`)
- **Model:** opus
- **Kind:** edit
- **Read first:** the three owned files;
  `find plugins/stackgen/stacks -path '*repo-hygiene*' -name '.gitignore'` to
  locate them.

## Ruling

> - Decision 7: The hygiene pack gitignores `.config/mise/conf.d/*.local.toml`
>   and `.config/mise/mise.local.lock`, and its `.gitattributes` names
>   `.config/mise/mise.lock`.
> - Decision 12: Any comment a unit adds or edits is one line.

## Edits

1. **`.gitignore`** :41–46 — keep `mise.local.toml` /
   `.config/mise.*.local.toml`; add `.config/mise/conf.d/*.local.toml`; replace
   `mise.local.lock` with `.config/mise/mise.local.lock`.
2. **`.gitattributes`** :9 — `mise.lock` → `.config/mise/mise.lock`, same
   attributes.
3. **`CONTRIBUTING.md`** :31 — the `mise.toml [env]` citation names
   `.config/mise/conf.d/env.toml`.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green

## Guardrails

- Touch nothing outside the three owned files; payload is excluded from this
  repo's dprint.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: hygiene pack — gitignore and attributes for the conf.d layout` — written
by the orchestrator after the wave gate.
