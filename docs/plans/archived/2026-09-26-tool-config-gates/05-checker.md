# U5 — The checker and the inventory follow the gates into tool-config

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `scripts/src/inventory.ts`, `.config/mise/tasks/p/plugins/shellcheck`
- **Model:** opus
- **Kind:** edit
- **Read first:** `check.ts` — `PACK_HOOK_FRAGMENTS` :273,
  `PACK_PRE_COMMIT_CONFIG` :281, the dprint shim allowlist :346-348,
  `checkPackConfigTier` :427-520, `preCommitFaults` :812, `EXCLUSION_LISTS`
  :1705-1740, `checkExclusionSets` :1899-1980; `check.test.ts` :283, :521-544,
  :1417-1570; `inventory.ts` :69, :178, :247; the shellcheck task :45;
  index.md's Facts.

## Ruling

> - Decision 8: Rule 11 drops the `pre-commit.d` fragment parse and the whole
>   pre-commit config parse; a file under a pack's
>   `config/.config/pre-commit.d/` is a finding. Rule 15's `EXCLUSION_LISTS`
>   repoint to `skills/tool-config/assets/{dprint,pre-commit,gitleaks}/`, and a
>   missing list file is now a finding, not a skip. A pack `tool-config:` line
>   adding an exclude through `dprint`, `pre-commit` or `gitleaks` alone,
>   instead of `all add exclude`, is a finding. `inventory.ts` drops
>   `repo-gates`.
> - Decision 12: Any comment a unit adds is one line.

## Edits

1. **Rule 11** — remove the fragment and whole-config parses and their
   constants; a pack file under `config/.config/pre-commit.d/` is a finding
   naming it. The dprint shim allowlist follows the shim to
   `skills/tool-config/assets/dprint/dprint.json` (or retires if the walk no
   longer needs it — say which under `DECIDED:`).
2. **Rule 15** — the four `EXCLUSION_LISTS` paths become
   `plugins/stackgen/skills/tool-config/assets/dprint/.config/{dprint.json,taplo.toml}`,
   `…/assets/gitleaks/.config/gitleaks.toml`,
   `…/assets/pre-commit/.config/pre-commit-config.yaml`; a missing file is one
   finding naming the path.
3. **The exclude-verb rule** — a `tool-config:` line in any pack whose tool is
   `dprint`, `pre-commit` or `gitleaks` and whose verb adds an exclude is a
   finding naming the pack and the line (the `pre-commit add linter-ignore` verb
   is not an exclude and passes).
4. **`inventory.ts`** — no `repo-gates` bundle; an `unconditional` list may hold
   one entry (hygiene) until T3.
5. **`check.test.ts`** — fixtures: a pack with a `pre-commit.d` file fails; a
   missing rule-15 file fails; `dprint add exclude x` in a pack fails;
   `all add exclude x` passes; rule-15 paths updated.
6. **Shellcheck task** :45 — the comment names the new pre-commit asset path.

## Verification

- `pnpm vitest run` green
- `pnpm exec tsc --noEmit -p scripts` green
- `MISE_ENV=dev mise run p:plugins:check` and `p:plugins:shellcheck` green once
  U1 and U3 land

## Guardrails

- The orchestrator commits this unit **fourth** in wave 1, after U12, U1 and U3
  — its new rules scan their files.
- Touch nothing outside the four owned files.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: checker and inventory follow the gates into tool-config` — written by the
orchestrator, fourth in wave 1.
