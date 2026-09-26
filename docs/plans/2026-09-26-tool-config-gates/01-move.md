# U1 — Move the four gate packs into the tool-config skill

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-gate/{dprint,pre-commit,gitleaks,grype}/**`,
  `plugins/stackgen/stacks/bundles/repo-gates.md`,
  `plugins/stackgen/skills/tool-config/assets/{dprint,pre-commit,gitleaks,grype}/**`
  (new),
  `plugins/stackgen/skills/tool-config/references/{dprint,pre-commit,gitleaks,grype}/**`
  (new, raw material)
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `find plugins/stackgen/stacks/toolchain-gate/{dprint,pre-commit,gitleaks,grype} -type f`;
  index.md's Facts.

## Ruling

> - Decision 1: The four packs move into the skill: each `config/**` →
>   `assets/<tool>/**` (the landed shape), `conventions.md`, `skills/<tool>/**`
>   and `pack.yaml`'s facts → `references/<tool>.md`. The packs and
>   `bundles/repo-gates.md` are deleted; no tool skill is copied into target
>   repos. The `vscode.d` fragments land only when `editor=vscode`. The root
>   `dprint.json` shim stays a dprint asset.

## Edits

1. **Move** with plain `mv`, preserving exec bits, for each tool in dprint,
   pre-commit, gitleaks, grype: the pack's `config/` contents →
   `plugins/stackgen/skills/tool-config/assets/<tool>/` (so
   `config/.config/dprint.json` lands at `assets/dprint/.config/dprint.json` and
   the root shim at `assets/dprint/dprint.json`); `conventions.md`, `pack.yaml`
   and `skills/<tool>` →
   `plugins/stackgen/skills/tool-config/references/<tool>/` (raw material U2
   folds into `references/<tool>.md` in wave 2).
2. **Delete** the four emptied pack directories and
   `plugins/stackgen/stacks/bundles/repo-gates.md` with `rm`. Leave
   `plugins/stackgen/stacks/toolchain-gate/` in place — its other packs stay.
3. Edit no moved file's content — U2 and U8 do, in wave 2.

## Verification

- `ls plugins/stackgen/stacks/toolchain-gate` lists none of the four
- the moved file count equals the count before the move (report under
  `DECIDED:`)
- `MISE_ENV=dev mise run p:plugins:check` green (the old rule 15 skips the moved
  files until U5 repoints it)

## Guardrails

- The orchestrator commits this unit **second** in wave 1, after U12, and runs
  `MISE_ENV=dev mise run p:plugins:inventory` into the same commit (the move
  changes `inventory.md`).
- Never run a formatter over a moved payload file.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`refactor: move the four gate packs into stackgen:tool-config` — written by the
orchestrator, second in wave 1.
