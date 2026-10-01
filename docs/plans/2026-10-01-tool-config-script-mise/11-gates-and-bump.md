# U11 — Gates and bump

- **Wave:** 7
- **Depends on:** U10
- **Owns:** `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  the `version:` line of
  `plugins/stackgen/stacks/{app-framework/swiftui,capability-provider/doppler,capability-provider/fnox,package-manager/pnpm,toolchain-gate/swiftlint,design-tool/claude-code,ci-system/github-actions}/pack.yaml`
  and every bundle pin naming those packs,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

The Consent block's rule, quoted: *bump a project once per level since its last
release: a project whose version already sits above its last released tag at
that level is not bumped again; packs follow the same rule.* Wanted levels:
stackgen major, vwf minor, site patch, each edited pack patch. No public
release: *"Bump now, release at chain end."*

## Edits

1. Read the last released versions:
   `git tag --list 'stackgen-v*' 'vwf-v*' 'site-v*'` (highest of each), and each
   owned pack's `version:` at the last `stackgen-v*` tag
   (`git show <tag>:<path>`).
2. **site** — when `site/package.json` still equals the last `site-v*` version:
   `mise run p:site:version` (bare, patch), **first**, on the clean tree.
   Otherwise leave it.
3. **stackgen** — when its major still equals the last released major: set the
   next major (`X+1.0.0`). **vwf** — when its major.minor still equals the last
   released: set the next minor. Otherwise leave each. Skip a 13 or 17
   component.
4. **Packs** — each owned pack whose `version:` still equals its released value
   takes one patch; update every bundle pin naming it
   (`grep -rn '<type>/<slug>@' plugins/stackgen/stacks`). Expected after plan 0:
   swiftui, doppler, fnox, claude-code and github-actions bump; pnpm and
   swiftlint do not.
5. `mise run p:plugins:inventory` and `mise run p:plugins:marketplace`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `git diff --stat` touches only owned paths.
- `DECIDED:` lines name each project bumped or left, and why.

## Guardrails

- No tag, no `p:plugins:release`, no `p:site:release`.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump the packs tool-config's mise script touched`
