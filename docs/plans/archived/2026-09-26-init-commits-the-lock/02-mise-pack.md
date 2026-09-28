# U2 — setup:mise gains --lock-only

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/assets/mise/**`,
  `plugins/stackgen/skills/tool-config/references/mise.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `assets/mise/.config/mise/tasks/setup/mise` whole;
  `plugins/stackgen/skills/tool-config/references/mise.md` (the `setup:mise`
  verb); index.md's Facts.
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
2. **`references/mise.md`** — the `setup:mise` row lists `--lock-only`, one
   line.

## Verification

- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- any `mise` experiment runs with `HOME` and every `MISE_*` dir under one
  `mktemp -d`

## Guardrails

- Payload excluded from this repo's dprint; `plugins/**/*.md` not formatted;
  keep exec bits.
- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: setup:mise --lock-only writes a missing lock without installing` —
written by the orchestrator after the wave gate.
