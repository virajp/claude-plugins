# U3 — setup merges on landing and fills machine_env in the block; doctor reports block drift

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/materialize.md`,
  `plugins/vwf/skills/doctor/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `setup/references/materialize.md` :160–250; the materialize
  pass in `setup/SKILL.md`; `doctor/references/stack-checks.md` (e) and the
  `machine_env` mentions; index.md's Facts.

## Ruling

> - Decision 3: No hash. On a later init or setup run, a block whose content
>   differs from the pack's current lines — with the repo's `machine_env` values
>   spliced into the pack's lines first — is shown to the user with take the
>   pack's / keep mine / merge, and the answer applied.
> - Decision 4: `/vwf:setup`'s materialize pass invokes init's merge for any
>   pack it lands that ships `mise.d/`. The `machine_env` fill writes the value
>   inside that pack's block in `conf.d/env.toml` (or `env.<env>.toml`).
> - Decision 11: Any sentence a unit adds is short.

## Edits

1. **`setup/SKILL.md`** materialize pass — after landing a pack with `mise.d/`,
   invoke init's "mise section blocks" merge
   (`init/references/fragments-and-sections.md`).
2. **`materialize.md`** :170–248 — "the file the pack landed" becomes the pack's
   block in `conf.d/env.toml`; the detection no longer gates on a lock hash
   (:207–212) — it reads the block; the move out of the old `[env]` table
   (:187–198) becomes a move out of any line outside the block.
3. **Doctor** — (e) treats a mise section file by block: a block differing from
   its pack's current lines (after the `machine_env` splice) is a drift finding
   pointing at `/vwf:setup reshape`; a `conf.d/<pack>.toml` still on disk is a
   shape-drift finding.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: vwf setup merges pack mise blocks and fills machine_env inside them` —
written by the orchestrator after the wave gate.
