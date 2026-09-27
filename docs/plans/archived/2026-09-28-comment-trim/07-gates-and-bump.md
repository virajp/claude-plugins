# U7 — Gates and bump

- **Wave:** 3
- **Depends on:** U6
- **Owns:** the `version:` line of every pack `pack.yaml` whose payload, hooks
  or `conventions.md` U2 or U3 changed; those packs' bundle pins under
  `plugins/stackgen/stacks/bundles/**`; `plugins/stackgen/stacks/inventory.md`;
  `plugins/stackgen/.claude-plugin/plugin.json`;
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file you will change, before editing.
- **Lazy-load:** `.claude/skills/stackgen-plugin/SKILL.md` (pack versions and
  bundle pins), `plugins/stackgen/assets/pack-format.md:438-444`.

## Ruling

> Consent — Release stackgen publicly: patch if `stackgen-v2.0.0` is tagged when
> the run starts (`2.0.0` → `2.0.1`, by editing
> `plugins/stackgen/.claude-plugin/plugin.json`), else none — rides the
> unreleased `2.0.0`; no release step. Each edited pack takes a patch bump
> unless already bumped since the last `stackgen-v*` tag.

> Consent — Release vwf publicly: none — untouched.

> Consent — Release site publicly: none — not this time.

A comment-only payload change still patch-bumps its pack, so doctor does not
report unexplained drift on every shaped repo
(`docs/memory/decisions/2026-09-13-init-walks-the-members.md:154-160`). A pack
whose `version:` already differs from the one at the latest `stackgen-v*` tag
(`git show <tag>:<pack.yaml path>`) rides that unreleased bump. No version
component may be 13 or 17 — step past either.

## Edits

1. **The packs edited** — the set is `git diff --name-only <branch base>..HEAD`
   under `plugins/stackgen/stacks/`, reduced to pack directories. For each,
   apply the rule above; when it bumps, update every bundle pin
   `<type>/<slug>@<old>` to the new version.
2. **stackgen plugin version** — `git tag -l 'stackgen-v2.0.0'`: when it exists,
   set `plugin.json` `version` to the next patch past it, skipping a 13 or 17
   component; otherwise leave it.
3. Run `mise run p:plugins:inventory` and `mise run p:plugins:marketplace`.
4. Run the full wave gate.

## Verification

- Every wave-gate line green:
  - `mise run p:plugins:marketplace -- --check`
  - `mise run p:plugins:inventory -- --check`
  - `mise run p:plugins:check`
  - `mise run p:plugins:shellcheck`
  - `mise run p:plugins:npm-normalize-test`
  - `mise run p:site:check`
- For each bumped pack,
  `grep -rn '<type>/<slug>@' plugins/stackgen/stacks/bundles` shows one version
  only, equal to its `pack.yaml`.

## Guardrails

- Each `pack.yaml`, its bundle pins and `inventory.md` land in one commit.
- Touch only the `version:` line of a `pack.yaml`; never vwf's `plugin.json`;
  never the site version.
- Touch nothing outside Owns; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`ops: pack and plugin bumps — comment trim`
