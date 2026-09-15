# U4 — the checker refuses a 13 or 17 version component

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Read first:** `scripts/src/check.ts` lines 60–160 (`SEMVER_RE` at 74,
  `check()` at 76–100, `checkManifest()` at 115–155);
  `scripts/src/check.test.ts` lines 1–130 (the `tree()` and `messages()`
  helpers, the version case at 105–120).
- **Lazy-load:** nothing else.

## Ruling

Decision 1: "A version is forbidden when any component equals 13 or 17 —
`1.13.0`, `17.0.0`, `2.1.17`, `config_format` 17. `1.130.0` and `113.0.0` are
fine."

Decision 3: "A second assertion inside the manifest rule (`checkManifest`),
beside 'is not plain semver'. Every 'thirteen rules' passage stays true; only
the sentences describing what the manifest rule asserts change."

Decision 5: "The `+N` staging counter is not a component." (The checker already
refuses build metadata outright; nothing to add for it.)

## Edits

1. **`scripts/src/check.ts`** — inside `checkManifest()`, directly after the
   plain-semver assertion (130–137), add one assertion: split the version on `.`
   into three components, strip any `-prerelease` suffix from the third, and
   fail when any component is exactly `13` or `17`. Message shape matches its
   neighbours:
   `<plugin>: version <v> has a 13 or 17 component — those
   integers are never issued`.
   Run it only when the semver test passed (a non-semver version already
   failed). Update the function's doc comment so it names both assertions. No
   new exported symbol, no new rule function, no change to `check()`'s call
   order.
2. **`scripts/src/check.test.ts`** — beside the case at 105–120, one new
   `it(...)`: manifests at `1.13.0`, `17.0.0` and `2.1.17` each produce the new
   message; manifests at `1.130.0`, `113.0.0` and `19.21.0` produce no version
   message at all. Mirror the existing fixture and `messages()` shape exactly.

## Verification

- `pnpm vitest run` green, including the new case.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green on the real tree (`19.20.0`, `1.9.0` pass).
- Scratch proof: copy `plugins/vwf/.claude-plugin/plugin.json` to a temp plugins
  root, set `"version": "1.13.0"`, and run the checker over it (the vitest case
  is the same proof — cite its name in the report).

## Guardrails

- Do not renumber, reorder or rename any rule; do not touch `checks.md` or any
  doc (U7).
- `scripts/**/*.ts` is dprint-formatted and linted by the pre-commit hooks the
  orchestrator runs; match the file's style.
- Delete with `rm`, never `git rm`.

## Commit

`feat: p:plugins:check refuses a manifest version with a 13 or 17 component` —
written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
