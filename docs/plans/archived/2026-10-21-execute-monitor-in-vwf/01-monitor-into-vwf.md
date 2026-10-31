# U1 — The execute monitor moves into vwf

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/hooks/monitor/**` (new), `plugins/vwf/types/index.d.ts`
  (new), `plugins/vwf/hooks/hooks.json`,
  `plugins/vwf/.claude-plugin/plugin.json` (the `types` key only)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file that exists, top to bottom, and every file of
  the prototype listed in Edits 1, before editing.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/structure.md`

## Ruling

> - Decision 1: The mod is a hooks module inside vwf:
>   `plugins/vwf/hooks/hooks.json` gains `"modules"` beside the mempalace
>   `hooks` block.
> - Decision 2:
>   `plugins/vwf/hooks/monitor/{register.tsx,plan.ts,plan.test.ts,pane.test.tsx,refresh.test.tsx}`,
>   `plugins/vwf/types/index.d.ts`, and `"types": "./types/index.d.ts"` in vwf's
>   manifest, alphabetical order.
> - Decision 3: The `$.state` refs use plugin `vwf` and keys `monitorRun`,
>   `monitorQuiet`, `monitorViewing`; the contract declares them under `vwf`.
> - Decision 4: The command stays `/vwf-monitor`, and the pane id stays
>   `vwf-monitor`.
> - Decision 5: U1 reads the prototype from the dev-mods folder in the facts; if
>   the folder is missing, U1 returns `UNRESOLVED:` and edits nothing.
> - Decision 6: The behaviour stays exactly as tested; the only changes are the
>   renames of rulings 3 and 4, the import paths the new layout needs, and the
>   manifest and hooks-file wiring.
> - Decision 7: The tests ship inside vwf, because `claude plugin test` runs
>   only tests inside the plugin folder.

## Edits

The prototype root is
`/Users/virajpatel/.claude/dev-mods/1eed5b1e-4e93-45b7-9d87-9166bb78929f/vwf-monitor`,
written `<P>` below. If `<P>/hooks/register.tsx` does not exist, stop: return
`UNRESOLVED: the prototype folder is gone — the user must supply the source` and
edit nothing.

1. **Copy, byte for byte,** with `cp`, never by retyping:
   - `<P>/hooks/register.tsx` → `plugins/vwf/hooks/monitor/register.tsx`
   - `<P>/hooks/plan.ts` → `plugins/vwf/hooks/monitor/plan.ts`
   - `<P>/hooks/plan.test.ts` → `plugins/vwf/hooks/monitor/plan.test.ts`
   - `<P>/hooks/pane.test.tsx` → `plugins/vwf/hooks/monitor/pane.test.tsx`
   - `<P>/hooks/refresh.test.tsx` → `plugins/vwf/hooks/monitor/refresh.test.tsx`
   - `<P>/types/index.d.ts` → `plugins/vwf/types/index.d.ts`

   Do not copy `<P>/hooks/hooks.json`, `<P>/.claude-plugin/**` or
   `<P>/tsconfig.json`.
2. **Import paths.** The module moved one level deeper. In every copied
   `.ts`/`.tsx` file, an import from `'../types'` becomes `'../../types'`.
   Imports from `'./plan'` and from `'claude-code'` / `'claude-code/testing'`
   stay.
3. **State names (decision 3).** In `register.tsx`, each
   `atom({ plugin: 'vwf-monitor', key: … })` becomes `plugin: 'vwf'`, with the
   keys renamed `run` → `monitorRun`, `isQuiet` → `monitorQuiet`, `viewing` →
   `monitorViewing`. In `types/index.d.ts`, the `PluginState` entry
   `'vwf-monitor': { run; isQuiet; viewing }` becomes
   `vwf: { monitorRun; monitorQuiet; monitorViewing }` with the same value
   types. The TypeScript variable names in `register.tsx` (`run`, `isQuiet`,
   `viewing`) may stay.
4. **Mount targets in the tests.** In `pane.test.tsx` and `refresh.test.tsx`,
   every `$.ui.mount({ plugin: 'vwf-monitor', … })` becomes `plugin: 'vwf'`. The
   `requestId: 'vwf-monitor'` (the pane id) and every expectation on the pane id
   `'vwf-monitor'` stay (decision 4).
5. **Leave the command and the pane id** — `PANE = 'vwf-monitor'`,
   `$.command.register({ name: 'vwf-monitor', … })` and the `command.run`
   matcher `{ command: 'vwf-monitor' }` — unchanged.
6. **`plugins/vwf/hooks/hooks.json`** — add a top-level key
   `"modules": ["./monitor/register.tsx"]` after the existing `"hooks"` block.
   The `"hooks"` block stays byte-identical.
7. **`plugins/vwf/.claude-plugin/plugin.json`** — add
   `"types": "./types/index.d.ts"` in the file's alphabetical key order. Touch
   no other key; the version is nobody's.

## Verification

- `claude plugin test plugins/vwf` — green, 5 tests pass.
- `claude plugin validate --strict plugins/vwf` — passes; its report names
  `./monitor/register.tsx` with the same hooks the prototype had, and the state
  keys `vwf.monitorRun`, `vwf.monitorQuiet` and `vwf.monitorViewing`.
- `mise run p:plugins:check` — green.
- `grep -rn "plugin: 'vwf-monitor'\|plugin: \"vwf-monitor\"" plugins/vwf` — no
  hit.
- `git diff plugins/vwf/hooks/hooks.json` shows only the added `modules` key.

## Guardrails

- Touch nothing outside the Owns list. The prototype folder is read-only: never
  edit or delete a file under `<P>`.
- Do not change behaviour (decision 6): no new feature, no refactor, no
  "cleanup".
- dprint formats `.ts`, `.tsx`, `.d.ts` and `.json` at commit (double quotes);
  do not run a formatter yourself.
- No file may contain the literal text `${CLAUDE_PLUGIN_ROOT}/` with a path that
  does not exist (checker rule 6), or the bare phrase `mise use` (rule 17).
- Delete with `rm`, never `git rm`.

## Commit

`feat: the vwf:execute progress pane ships inside vwf`
