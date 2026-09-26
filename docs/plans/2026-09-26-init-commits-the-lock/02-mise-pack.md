# U2 — setup:mise gains --lock-only

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/packs/mise/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `packs/mise/config/.config/mise/tasks/setup/mise` whole;
  `packs/mise/skills/mise/references/task-library.md` (the `setup:mise` row);
  index.md's Facts.
- **Lazy-load:** `mise lock --help`.

## Ruling

> - Decision 2: `setup:mise` gains `--lock-only`: write the combined lock only
>   when it is missing, then exit before installing; with a lock present, do
>   nothing. The environment-union rule lives once, in the script.
> - Decision 6: Any comment a unit adds is one line.

## Edits

1. **`tasks/setup/mise`** — `#USAGE flag "--lock-only"` (one-line help); when
   set: skip reshim, doctor and install; run the existing missing-lock branch
   (the environment union) and exit 0; refuse `--lock-only` together with
   `--upgrade` with a one-line error.
2. **`skills/mise/references/task-library.md`** — the `setup:mise` row lists
   `--lock-only`, one line.

## Verification

- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- any `mise` experiment runs with `HOME` and every `MISE_*` dir under one
  `mktemp -d`

## Guardrails

- Payload excluded from this repo's dprint; `plugins/**/*.md` not formatted;
  keep exec bits.
- Touch nothing outside `packs/mise/**`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: setup:mise --lock-only writes a missing lock without installing` —
written by the orchestrator after the wave gate.
