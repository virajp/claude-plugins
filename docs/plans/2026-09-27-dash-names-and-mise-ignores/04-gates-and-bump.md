# U4 — Gates and bump

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml` (the
  `version:` line only), every bundle pin of the pnpm pack under
  `plugins/stackgen/stacks/*/bundles/*.md`,
  `plugins/stackgen/stacks/inventory.md`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file you will change, before editing.
- **Lazy-load:** `.claude/skills/plugin-authoring/SKILL.md`,
  `.claude/skills/stackgen-plugin/SKILL.md` (pack versions and bundle pins).

## Ruling

> Consent — Release stackgen publicly: patch if `stackgen-v2.0.0` is tagged when
> the run starts (`2.0.0` → `2.0.1`, by editing
> `plugins/stackgen/.claude-plugin/plugin.json`), else none — rides the
> unreleased `2.0.0`; no release step.

> Consent — Release site publicly: none — not this time.

The pnpm pack changed (U2). Its version bumps one **minor** only when its
current `version:` is the one already released — the version the pnpm
`pack.yaml` carries at the latest `stackgen-v*` tag
(`git show <tag>:plugins/stackgen/stacks/package-manager/pnpm/pack.yaml`). When
it already differs from that tag, it rides the unreleased bump and is not bumped
again. No version component may be 13 or 17 — step past either.

## Edits

1. **stackgen plugin version** — `git tag -l 'stackgen-v2.0.0'`: when it exists,
   set `plugins/stackgen/.claude-plugin/plugin.json` `version` to the next patch
   past it, skipping a 13 or 17 component; otherwise leave it.
2. **pnpm pack version** — apply the rule above. When it bumps, update every
   bundle pin `package-manager/pnpm@<old>` to the new version.
3. Run `mise run p:plugins:inventory` and `mise run p:plugins:marketplace`,
   keeping their output.
4. Run the full wave gate.

## Verification

- Every wave-gate line green:
  - `mise run p:plugins:marketplace -- --check`
  - `mise run p:plugins:inventory -- --check`
  - `mise run p:plugins:check`
  - `mise run p:plugins:shellcheck`
  - `mise run p:site:check`
- `grep -rn 'package-manager/pnpm@' plugins/stackgen/stacks/*/bundles` shows one
  version only, equal to `pack.yaml`'s.

## Guardrails

- pack.yaml, its bundle pins and `inventory.md` land in one commit.
- Do not touch the site version — its release is `none`.
- Touch nothing outside Owns; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`ops: pack and plugin bumps — dash names and mise ignores`
