# U4 — the installer stops installing graphify's raw hooks

- **Wave:** 1
- **Depends on:** —
- **Owns:** `installer/src/graphify.ts`, `installer/src/graphify.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files whole; `installer/src/uninstall.ts` (read
  only); `installer/CLAUDE.md` (read only).

## Ruling

> - Decision 18: The installer drops `graphify hook install`, keeps
>   `graphify install`; `--uninstall` keeps `graphify hook uninstall` to clean
>   old hooks.
> - Decision 25: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **`graphify.ts`** — remove the `hook install` step (:60-75) and the
   git-repository check that exists only for it; keep `graphify install`. The
   remaining comment says the graph refresh is the repo's pre-commit
   `post-commit` hook, in one line.
2. **`graphify.test.ts`** — a test asserts `hook install` is never executed; the
   hook-related cases are removed or inverted.

## Verification

- `pnpm vitest run installer` green
- `pnpm exec tsc --noEmit -p installer` green
- `grep -n 'hook", "install\|"install"\]' installer/src/graphify.ts` finds no
  hook install

## Guardrails

- `uninstall.ts` is untouched — its `graphify hook uninstall` stays.
- The installer docs (`installer/CLAUDE.md`, `site/src/content/docs/installer/`)
  are U10's: report them as `DOCS FALSIFIED:`.
- No `git checkout`/`restore`.

## Commit

`fix: installer no longer installs graphify's raw git hooks` — written by the
orchestrator after the wave gate.
