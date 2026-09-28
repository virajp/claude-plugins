# U11 — Gates and pack bumps

- **Wave:** 5
- **Depends on:** U10
- **Owns:** `plugins/stackgen/stacks/inventory.md`,
  `.claude-plugin/marketplace.json`, the `version:` line of every pack U3
  edited, every `plugins/stackgen/stacks/bundles/*.md` pin naming them
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block; the U3 row of the Units table.

## Ruling

> **Release stackgen publicly** — none here — rides T1's `2.0.0`, untagged; the
> chain ships after T3.

> **Release vwf publicly** — none here — rides T1's `20.0.0`, untagged; the
> chain ships after T3.

> - Decision 11: Every pack U3 edits bumps one minor from its `pack.yaml`
>   version at run time (skipping a 13 or 17 component), with every bundle pin
>   and `inventory.md`, in one commit. No plugin version changes — T1's `2.0.0`
>   and `20.0.0` carry the chain.

## Edits

1. **Plugin versions** — confirm stackgen reads `2.0.0` and vwf `20.0.0`; any
   other value is `UNRESOLVED:`. Change neither.
2. **Pack bumps** — each `version:` line of the packs U3 edited (typescript,
   plain-css, stylex, tailwindcss, astro, html, container-image, containers,
   cloud-run, pnpm, uv, swiftpm, swiftui, flutter) up one minor; every pin
   naming them
   (`grep -l '<type>/<slug>@' plugins/stackgen/stacks/bundles/*.md`).
3. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`** —
   report the diffs under `DECIDED:`. Steps 2–3 land in one commit.
4. **The full wave gate**, with `MISE_ENV=dev` exported.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run p:plugins:shellcheck` green
- `pnpm vitest run` green
- `mise run code:precommit` green
- `mise run p:site:check` green
- `git status --porcelain` shows nothing outside the owned paths, nothing
  staged.

## Guardrails

- No tag, no release task, no commit. Touch nothing beyond the owned lines and
  files. Delete nothing.

## Commit

`ops: pack bumps — tool-config gates` — written by the orchestrator after the
wave gate.
