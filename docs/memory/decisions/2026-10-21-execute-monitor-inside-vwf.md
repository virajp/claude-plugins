# Decision — the `/vwf:execute` progress pane ships inside vwf

**Date** 2026-10-21 · **Branch** `2026-10-21-execute-monitor-in-vwf` · **Plan**
`docs/plans/2026-10-21-execute-monitor-in-vwf/` · **A piece of backlog item
B101**

## What was decided before

Earlier on 2026-10-21 the user chose a separate `vwf-monitor` plugin that vwf
would depend on. The pane had been built and tested that day as a prototype in
the session mods folder: a Claude Code mod, a function-hooks module written in
TypeScript. And `.claude/skills/vwf-plugin/references/assets.md` held that "a
JS/TS rewrite has no business in a language-agnostic workflow plugin".

## Two reversals

Both were confirmed by the user on 2026-10-21.

- **Reversal of the separate `vwf-monitor` plugin.** The user ruled that the
  pane must be installable only through vwf. No marketplace or manifest field
  hides a listed plugin or blocks a direct install, so a separate plugin could
  always be installed alone. The mod moves into vwf.
- **Reversal of the "no JS/TS" ruling in
  `.claude/skills/vwf-plugin/references/assets.md`.** It no longer holds for
  this hooks module. The workflow doctrine stays language-agnostic; the one
  TypeScript module is engine glue for the progress pane, not doctrine.

The two-plugin north star
(`docs/memory/decisions/2026-08-17-north-star-two-plugins.md`) stays unchanged:
vwf and stackgen are still the only plugins.

## The decisions

**Packaging (D1).** The mod is a hooks module inside vwf:
`plugins/vwf/hooks/hooks.json` gains `"modules"` beside the mempalace `hooks`
block. Rejected: a separate plugin (anyone can install it directly), and a
second internal marketplace.

**Layout (D2).**
`plugins/vwf/hooks/monitor/{register.tsx,plan.ts,plan.test.ts,pane.test.tsx,refresh.test.tsx}`,
`plugins/vwf/types/index.d.ts`, and `"types": "./types/index.d.ts"` in vwf's
manifest, in alphabetical key order. Rejected: the mod files at the top level of
`hooks/`.

**State names (D3).** The `$.state` refs use plugin `vwf` and the keys
`monitorRun`, `monitorQuiet` and `monitorViewing`; the contract declares them
under `vwf`. A `$.state` ref's plugin must be the plugin that loads the module.
Rejected: the bare keys `run`, `isQuiet` and `viewing`, which could collide with
later vwf state.

**Command (D4).** The command stays `/vwf-monitor`, and the pane id stays
`vwf-monitor`. Rejected: `/vwf:monitor`, because the engine refuses a colon in a
registered command name (letters, digits, `_` and `-` only); and a stub skill
dropped at `prompt.submit`.

**Source (D5).** The move read the prototype from the dev-mods folder; a missing
folder would have stopped the unit with nothing edited. Rejected: a copy of the
prototype in the plan folder.

**Behaviour (D6).** The behaviour stays exactly as tested; the only changes are
the renames of D3 and D4, the import paths the new layout needs, and the
manifest and hooks-file wiring. Rejected: feature work during the move. The
review added one hardening fix: plan text is stripped of terminal control
characters before it renders.

**Tests (D7).** The tests ship inside vwf, because `claude plugin test` runs
only tests inside the plugin folder. Rejected: tests outside the plugin, which
nothing runs.

**Order and chain (D10).** The plan requires nothing; priority 10. Rejected:
waiting for `2026-10-18-retire-tool-config` (priority 40).

## Known limits at landing

The pane follows only `vwf:execute-*` subagents, so it cannot follow a plan made
only of `edit` units: those run as general-purpose subagents, and the run ends
in the pane at the first idle turn. This and the defects carried over from the
prototype are the plan's open gaps.
