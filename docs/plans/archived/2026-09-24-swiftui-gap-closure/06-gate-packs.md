# U6 — The gate packs exclude asset catalogs

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-gate/dprint/**`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/**`,
  `plugins/stackgen/stacks/bundles/repo-gates.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions; the three lists
  (`dprint/config/.config/dprint.json:5-20`,
  `dprint/config/.config/taplo.toml:14-29`,
  `pre-commit/config/.config/pre-commit-config.yaml:48-63`); how `.build` and
  `Derived` are spelled in each; rule 15's normalisation
  (`scripts/src/check.ts:1712`, read-only); the two packs' `pack.yaml` and
  `conventions.md`; `bundles/repo-gates.md`.

## Ruling

Quoted from index.md:

- **F8** — "`*.xcassets` (normalised by rule 15) joins the dprint `excludes`,
  the taplo `exclude` and the pre-commit global `exclude`; gitleaks is unchanged
  (a subset by rule 15)."
- **F9** — "`toolchain-gate/dprint` 1.1.1 → 1.1.2; `toolchain-gate/pre-commit`
  1.1.5 → 1.1.6 … `bundles/repo-gates.md` pins dprint@1.1.2 and
  pre-commit@1.1.6."

## Edits

1. Add the asset-catalog entry to each of the three lists, in each list's own
   syntax (glob for dprint and taplo, regex for pre-commit), so that rule 15
   normalises all three to the same entry and the directory's contents at any
   depth are excluded. Place it beside the other Xcode entries.
2. `dprint/pack.yaml` `version: 1.1.2`; `pre-commit/pack.yaml` `version: 1.1.6`;
   each pack's `conventions.md`, where it lists or explains the exclusions,
   gains the asset catalogs with the reason (Xcode writes and rewrites their
   `Contents.json`).
3. `bundles/repo-gates.md` — the two pins per F9.

## Verification

- `mise run p:plugins:check` green (rule 15 included).
- The pre-commit regex matches
  `App/Assets.xcassets/AppIcon.appiconset/Contents.json` (test it with
  `python3 -c` or `grep -E`).

## Guardrails

- Touch nothing outside Owns — gitleaks is not edited.
- Never format `config/` payload with this repo's dprint.
- Never run `git checkout`, `git restore`, `git stash` or a formatter's `--fix`
  outside Owns.

## Commit

Wave 1 lands as one commit (F12):
`feat: pack facts — binary probes, lockfile paths, machine env`
