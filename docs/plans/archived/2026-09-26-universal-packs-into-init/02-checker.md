# U2 — The checker, the inventory and shellcheck follow the packs into init

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `scripts/src/inventory.ts`, `.config/mise/tasks/p/plugins/shellcheck`
- **Model:** opus
- **Kind:** edit
- **Read first:** `check.ts` :60–100, :420–440, :1265–1310, :1590–1610,
  :1700–1740, :1920–1935, :2000–2070, :2130–2310; `check.test.ts` :281–301,
  :477–570, :1424–1465; `inventory.ts` :60–80, :170–250; the shellcheck task
  :40–80; index.md's Facts.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md`.

## Ruling

> - Decision 1: the packs live at
>   `plugins/vwf/skills/init/packs/{mise,dprint,gitleaks,grype,pre-commit,repo-hygiene}/`,
>   pack shape kept.
> - Decision 2: the kinds `toolchain-manager`, `repo-gate`, `repo-hygiene` and
>   the `unconditional` key are retired; `inventory.ts` drops their handling.
> - Decision 7: `checkVwfIsTechnologyFree` exempts
>   `plugins/vwf/skills/init/packs/**` only. The pack walks (:432, :1272,
>   :1300), rule 15's paths and the shellcheck task walk
>   `plugins/vwf/skills/init/packs/*` beside `plugins/*/stacks/*/*`.
> - Decision 11: Any comment a unit adds is one line.

## Edits

1. **Pack walks** (:432, :1272, :1300) — also glob
   `plugins/vwf/skills/init/packs/*`; rule 13's "sibling pack" test treats that
   directory as one more pack root.
2. **Rule 15** (:1712, :1721, :1727, :1734) — the dprint `dprint.json` /
   `taplo.toml`, pre-commit global `exclude` and gitleaks paths point into
   `plugins/vwf/skills/init/packs/`; and a missing file is a finding, not the
   silent skip at :1930.
3. **Rule 14** (:1597) and `inventory.ts` (:69, :178, :247) — no `unconditional`
   column or special case; an `unconditional:` key in a bundle is a finding.
4. **Rule 10** (:2233–2310) — skip `plugins/vwf/skills/init/packs/**` for both
   the `stacks/` path refusal (:2243) and the tool-token scan.
5. **`check.test.ts`** — fixtures at the moved paths; add a case: a vwf file
   outside `init/packs/` naming a tool still fails; a missing rule-15 file
   fails.
6. **`.config/mise/tasks/p/plugins/shellcheck`** :45, :74 — also
   `plugins/vwf/skills/init/packs/*`.

## Verification

- `pnpm vitest run` green
- `pnpm exec tsc --noEmit -p scripts` green
- `MISE_ENV=dev mise run p:plugins:check` green once U1 lands (report under
  `DECIDED:` if run before)
- `MISE_ENV=dev mise run p:plugins:shellcheck` green

## Guardrails

- The orchestrator commits this unit **second** in wave 1, after U1.
- Touch nothing outside the four owned files.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: checker, inventory and shellcheck walk vwf init's packs` — written by the
orchestrator, second in wave 1.
