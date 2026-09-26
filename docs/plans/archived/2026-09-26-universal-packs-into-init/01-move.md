# U1 — Move the six universal packs into vwf init

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/**`,
  `plugins/stackgen/stacks/toolchain-gate/{dprint,gitleaks,grype,pre-commit}/**`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/**`,
  `plugins/stackgen/stacks/bundles/{mise,repo-gates,repo-hygiene}.md`,
  `plugins/vwf/skills/init/packs/**` (new), `.config/dprint.json`,
  `.config/pre-commit-config.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts (the six packs, the repo exclusions);
  `.config/dprint.json:10`; `.config/pre-commit-config.yaml:105,129,151`.

## Ruling

> - Decision 1:
>   `plugins/vwf/skills/init/packs/{mise,dprint,gitleaks,grype,pre-commit,repo-hygiene}/`,
>   pack shape kept (`pack.yaml`, `conventions.md`, `config/`, `skills/`). The
>   three bundles are deleted.
> - Decision 11: Any comment or sentence a unit adds is one line.

## Edits

1. **Move** with plain `mv` (never `git mv` — a unit stages nothing):
   `S/toolchain-manager/mise` → `plugins/vwf/skills/init/packs/mise`;
   `S/toolchain-gate/{dprint,gitleaks,grype,pre-commit}` →
   `plugins/vwf/skills/init/packs/<same>`; `S/repo-hygiene/repo-hygiene` →
   `plugins/vwf/skills/init/packs/repo-hygiene` (`S` =
   `plugins/stackgen/stacks`). Remove the now-empty `S/toolchain-manager` and
   `S/repo-hygiene` directories. Preserve every exec bit (`ls -l` a task file
   before and after).
2. **Delete** `S/bundles/{mise,repo-gates,repo-hygiene}.md` with `rm`.
3. **`.config/dprint.json`** :10 and **`.config/pre-commit-config.yaml`** :105,
   :129, :151 — every exclusion keyed to the pack payload pattern
   (`plugins/*/stacks/*/*/config/`) also matches
   `plugins/vwf/skills/init/packs/*/config/` — the payload is formatted by the
   shipped config, never this repo's.
4. Do not edit any file inside a moved pack — U6 does, in wave 2.

## Verification

- `find plugins/vwf/skills/init/packs -maxdepth 1 -mindepth 1 -type d | wc -l`
  is 6; `find plugins/vwf/skills/init/packs -type f | wc -l` is 79 (or the count
  before the move, recorded under `DECIDED:`)
- `find plugins/stackgen/stacks -path '*toolchain-manager*' -o -path '*repo-hygiene/repo-hygiene*'`
  prints nothing
- `MISE_ENV=dev mise run code:precommit` green on the two `.config` files

## Guardrails

- The orchestrator commits this unit **first** in wave 1.
- Never run a formatter over a moved payload file.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`refactor: move the universal packs from stackgen into vwf init` — written by
the orchestrator, first in wave 1.
