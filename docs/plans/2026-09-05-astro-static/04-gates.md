# U4 — Versions bumped, generators run, full gate, real install

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` —
  the last two generated. Touch nothing outside this list. **The installer does
  not move**: consent is none.
- **Model:** inherit
- **Read first:** index.md §Consent and §Waves (the inventory caveat).
- **Lazy-load:** `.claude/skills/release/SKILL.md` for what a bump declares (the
  marketplace ref renames itself) and for the local-first stage the orchestrator
  runs after landing — not this unit.

## Ruling

The consent block: "Release `vwf` publicly — minor; Release `stackgen` publicly
— minor; Release installer publicly — none; Release site publicly — patch."
Therefore vwf `19.12.0` → `19.13.0`, stackgen `1.1.0` → `1.2.0`, site `1.1.3` →
`1.1.4`.

D14's 2026-09-05 "no release" answer is overtaken by the amendment; this unit
does move versions.

`CLAUDE.md`: "Ask the user before running `plugins:release`, `i:release` or
`site:release`" — this unit never tags, and never runs `plugins:local`; both are
the orchestrator's, after the landing.

## Edits

1. `plugins/vwf/.claude-plugin/plugin.json` — `"version": "19.13.0"` by hand;
   nothing else in the file.
2. `plugins/stackgen/.claude-plugin/plugin.json` — `"version": "1.2.0"` by hand;
   nothing else. Plain `X.Y.Z` — `plugins:check` fails a manifest carrying `+N`;
   the `1.1.0+1` staged copy lives only under `.dev-marketplace/`, which is
   gitignored and not yours.
3. `site/package.json` — `"version": "1.1.4"`. Prefer `mise run site:version`;
   if it refuses on an unclean tree (the orchestrator's run log is usually the
   unstaged file), edit the line directly and say so — the unit file names the
   direct edit as equivalent.
4. Run `mise run plugins:marketplace` and `mise run plugins:inventory`; stage
   nothing (the orchestrator commits). Report what each generator changed — the
   marketplace refs rename to `vwf-v19.13.0` and `stackgen-v1.2.0`; the
   inventory should already be current from the wave-1 commit.

## Verification

- The full wave gate, each line reported with its exit code:
  `mise run plugins:marketplace --check`, `mise run plugins:inventory --check`,
  `mise run plugins:check`, `mise run plugins:shellcheck`, `pnpm vitest run`,
  `pnpm exec tsc --noEmit -p installer`, `pnpm exec tsc --noEmit -p scripts`,
  `mise run plugins:npm-normalize-test`, `mise run site:check`.
- `git diff --stat` against the wave-2 commit shows exactly the five owned
  files, or fewer if a generator moved nothing — and then explain.
- **`target-verifier`** is dispatched by the orchestrator after this unit
  reports: a hermetic `CLAUDE_CONFIG_DIR=/tmp/…` install of the working tree's
  dev marketplace shows `stackgen@1.2.0` and `vwf@19.13.0`; the installed
  stackgen tree contains `stacks/framework/astro/pack.yaml`, all four
  `stacks/bundles/astro-*.md` and no `typescript-astro-react.md`,
  `stacks/cloud-service/workers-ssr/config/wrangler.jsonc`,
  `stacks/bundles/cloudflare-workers-ssr.md`, `assets/ids.md`, the dprint gate's
  root `dprint.json` shim under its `config/`, and at least one
  `config/.config/vscode.d/*.jsonc`; the installed vwf tree's
  `skills/init/references/new-repo.md` contains `setup:default-branch`; every
  task file under any pack's `config/.config/mise/tasks/**` survives with its
  executable bit and shebang; and uninstall leaves only Claude's own
  version-keyed cache. Never the real config dir.

## Guardrails

- Do not run `plugins:release`, `i:release`, `site:release` or `plugins:local`.
- Do not bump the installer.
- Do not edit any doc, pack, asset or skill — a failing gate is a finding routed
  back to the owning unit, not fixed here.
- Write with Write/Edit; `cat` is `bat`.

## Commit

`ops: bump vwf to 19.13.0, stackgen to 1.2.0, site to 1.1.4` — written by the
orchestrator after the wave gate, not by the unit.
