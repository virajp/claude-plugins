# U8 — Gates

- **Wave:** 6
- **Depends on:** U7
- **Owns:** —
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Release levels, Wave gate and Gates the
  orchestrator keeps sections.

## Ruling

> - Decision E13: Every release level is `NONE`: plan 2 changes no file under
>   `plugins/`, no installer source and no page of the site manual.
> - Decision E9: A new bash table test `p:releases:test`
>   (`.config/mise/tasks/p/releases/test`) covers the U1 functions, including
>   13/17 and "highest wins". It runs in `plugins.yml` and in the verification
>   of U1 and U8, not in pre-commit.

## Edits

1. Run no generator and bump no version: no `plugin.json`, no `package.json`, no
   `.config/releases.yaml` write, no tag, no release task without `--dry-run`.
2. Pass `mise run p:releases:test` and the full wave gate. Report each line's
   result.

## Verification

- `mise run p:releases:test`.
- Every wave-gate line in index.md, with `MISE_ENV=dev`.

## Guardrails

- Edit no file. A red line is reported as `UNRESOLVED:` with the failing
  output's last lines; never fix it here.

## Commit

none — this unit edits no file; the orchestrator makes no commit for it.
