# J1 — Remove graphify from the installer

- **Wave:** 1
- **Depends on:** —
- **Owns:** `installer/src/**`
- **Model:** opus
- **Kind:** edit

## Ruling

> J1 — No graphify step; the skills own graphify.

> J2 — `--uninstall` lists no graphify item; repo files are the repo's.

## Edits

1. `rm installer/src/graphify.ts installer/src/graphify.test.ts`; drop the
   import and step in `index.ts:46,184-185`; help text `args.ts:146`.
2. `uninstall.ts` — remove the `graphify-hook` removal kind and the
   graphify-hook, graph and `.graphifyignore` items (`:124-125,149,291-322`) and
   their helpers; update `uninstall.test.ts`.
3. Comments at `index.ts:10`, `progress.ts:6`, `receipt.ts:14`, `report.ts:35`,
   `uninstall.ts:37`, `version.ts:19` — no graphify.

## Verification

- `grep -rn -i graphify installer/src` prints nothing.
- `pnpm vitest run installer` and `pnpm exec tsc --noEmit -p installer` green;
  the full wave gate.

## Commit

`refactor: installer installs plugins only — graphify wiring removed`
