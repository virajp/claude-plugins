# U7 — Gates and bump: pack versions only where unbumped, generators, the full gate

- **Wave:** 4
- **Depends on:** U6
- **Owns:** every `plugins/stackgen/stacks/*/*/pack.yaml` of a pack the branch
  changed, `plugins/stackgen/stacks/bundles/*.md`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Facts (Versions).

## Ruling

> **B8** — Ride the unreleased bumps: no stackgen or site bump. A changed pack
> is patch-bumped only if its `pack.yaml` version is unchanged since
> `stackgen-v1.31.0`, with every bundle pin that names it. No release step.
> Rejected: bump again; a `/release` step as `ask`.

## Edits

1. List the packs the branch changed:
   `git diff develop...HEAD --name-only -- plugins/stackgen/stacks`, grouped by
   `<type>/<slug>`, excluding `pack.yaml`, `bundles/` and `inventory.md`.
2. For each, compare its `pack.yaml` `version:` with the tag's
   (`git show stackgen-v1.31.0:<pack dir>/pack.yaml`). Equal → patch-bump it
   (skipping a 13 or 17 component) and update every `<type>/<slug>@<version>`
   pin that names it in `bundles/*.md`. Different → leave it.
3. If a `pack.yaml` lists the files it ships or its `conditional:` entries name
   a path U3 moved (`.config/linter.yaml` from eslint to pre-commit), update it
   — checker rule 11 fails a `conditional:` entry that matches no file.
4. Do **not** touch `plugins/stackgen/.claude-plugin/plugin.json`,
   `plugins/vwf/.claude-plugin/plugin.json` or `site/package.json`.
5. Run `mise run p:plugins:inventory` and `mise run p:plugins:marketplace`, then
   every Wave gate line in index.md; all must pass.

## Verification

- All nine Wave gate lines pass, both `--check` freshness lines included.
- `git diff develop...HEAD -- plugins/stackgen/.claude-plugin/plugin.json site/package.json`
  is empty.
- No version component is 13 or 17.

## Guardrails

- Never tag, release or push.
- Write with Write/Edit, never heredocs. Delete with `rm`, never `git rm`.

## Commit

`ops: gate hardening — pack versions and generated manifests`
