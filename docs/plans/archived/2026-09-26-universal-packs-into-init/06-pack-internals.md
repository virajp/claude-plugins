# U6 — The moved packs describe their new home

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/init/packs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** each moved pack's `pack.yaml`, `conventions.md` and
  `skills/**`; `grep -rn "stackgen\|stacks/" plugins/vwf/skills/init/packs` for
  the passage list.

## Ruling

> - Decision 8: The moved packs' own files follow their home: paths naming
>   `stacks/<type>/<slug>`, "stackgen" as their owner, and their `pack.yaml`
>   identity fields.
> - Decision 11: Any comment or sentence a unit adds is one line.

## Edits

1. **`pack.yaml`** of each — identity fields that encode the stackgen type or
   path (`type:`, `kind:` if they name a retired kind) follow the new home;
   nothing else in the file changes.
2. **`conventions.md` and `skills/**`** of each — "this stackgen pack",
   `stacks/<type>/<slug>` paths and "the materializer lands" become init's
   wording and `init/packs/<name>` paths.
3. **Payload files** (`config/**`) — only a comment naming stackgen as the owner
   or a `stacks/` path; no behaviour change. Keep exec bits.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green (rule 13: no landed file cites a
  plugin path)
- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `grep -rn "stackgen" plugins/vwf/skills/init/packs` shows only the
  cross-plugin contract (stackgen packs source `_scripts/helpers`)

## Guardrails

- Payload is excluded from this repo's dprint; `plugins/**/*.md` is not
  formatted — match the fold width by hand.
- Touch nothing outside `init/packs/**`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`refactor: the moved universal packs describe their home in vwf init` — written
by the orchestrator after the wave gate.
