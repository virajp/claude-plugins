# I3 — The `hygiene` tool

- **Wave:** 2
- **Depends on:** I1, I2
- **Model:** opus
- **Kind:** edit
- **Owns:** `plugins/stackgen/skills/tool-config/assets/hygiene/**` (new),
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/{index,hygiene}.mjs`,
  `scripts/src/tool-config-hygiene-files.test.ts`,
  `scripts/src/tool-config-{mise,gates,hygiene}.test.ts`,
  `scripts/src/fixtures/tool-config/**`
- **Read first:** `plugins/vwf/skills/init/assets/hygiene/**`;
  `plugins/vwf/skills/init/references/readme-and-license.md`.

## Ruling

> I4 — a `hygiene` tool lands `CONTRIBUTING.md`, `SECURITY.md`, the licence and
> the readme stub from `all` keys `--license`, `--security-contact`, `--brief`,
> recorded and drift-checked.

## Edits

1. Copy init's hygiene assets into `TC/assets/hygiene/` (the vwf copies are
   removed by I5); the security contact and the brief become `MARKED POSITION`
   anchors; licences selectable by `--license`.
2. `hygiene.mjs` — `all` lands them; a file already present is a conflict row
   (keep / overwrite), never a silent skip; `remove`; register in `index.mjs`;
   add the three `all` keys.
3. Refresh plans 1–3's suites and golden trees for the new files `all` lands.

## Verification

- `pnpm vitest run` and `pnpm exec tsc --noEmit -p scripts` green;
  `mise run p:plugins:check` green with I4's allowlist; the full wave gate.

## Commit

`feat: tool-config hygiene tool lands CONTRIBUTING, SECURITY, licence and readme stub`
