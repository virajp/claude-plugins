# U4 — The materializer runs pack tool-config calls; stackgen drops the mise pack

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-stack-template/**`,
  `plugins/stackgen/skills/stackgen-stack-menu/**`,
  `plugins/stackgen/skills/stackgen-sync/**`,
  `plugins/stackgen/assets/{pack-format,output-tree,kinds}.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `stackgen-stack-template/SKILL.md` and
  `references/materializer.md` (the copy rules, the fragments rule :116–131,
  composition order :147–162); `stackgen-stack-menu/SKILL.md` (fixed slugs,
  kinds omitted); `stackgen-sync/SKILL.md` (:38–68, :119–134, :200–235);
  `assets/pack-format.md`, `output-tree.md`, `kinds.md` (the toolchain-manager
  kind); index.md's Facts.

## Ruling

> - Decision 5: `/stackgen:tool-config <tool> remove <requester>` deletes that
>   requester's blocks; the materializer calls it when a pack is dropped.
> - Decision 6: A pack lists its calls in `pack.yaml` under `tool-config:`, one
>   instruction per line; the materializer runs them, tagging `for <pack>`.
> - Decision 15: Any sentence a unit adds is short.

## Edits

1. **`materializer.md`** — after copying a pack, run each `tool-config:` line as
   `/stackgen:tool-config <line> for <pack>`; a pack removed from a composition
   gets `remove <pack>` for each tool it called; drop the `conf.d/<pack>.toml`
   fragment rule; the composition order no longer starts with a
   toolchain-manager pack.
2. **`stackgen-stack-template/SKILL.md`** — the `mise` slug is gone; point at
   `stackgen:tool-config` for the universal tools it owns.
3. **`stackgen-stack-menu`** — no `mise` fixed slug; the toolchain-manager kind
   is no longer offered or skipped.
4. **`stackgen-sync`** — the `machine_env` carry-over retires (the values live
   in tool-config's blocks); a pack whose `tool-config:` list changed is
   reported with "run `/vwf:setup reshape`"; files recorded with
   `source: tool-config/…` are not sync's.
5. **Assets** — `pack-format.md`: the `tool-config:` key (shape, one instruction
   per line, run at landing, removed with the pack) and `machine_env` keys set
   by a `mise … env` call; the `conf.d` fragment convention retired.
   `output-tree.md`: the mise files are written by tool-config, not copied.
   `kinds.md`: the toolchain-manager kind retired. `stacks/readme.md`: follow.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -rn "toolchain-manager/mise\|conf.d/<pack>" plugins/stackgen/skills plugins/stackgen/assets`
  prints nothing but history notes

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: the materializer runs pack tool-config calls; the mise pack retires` —
written by the orchestrator after the wave gate.
