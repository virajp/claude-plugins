# U2 — The checker validates the three facts

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions; `scripts/src/check.ts`
  around `checkPackConfigTier` (`:415`, `:518`) and `conditionalFaults`
  (~`:556`) — how a pack's `pack.yaml` is read and how a finding is reported;
  `check.test.ts` for the fixture style; `.claude/skills/plugin-authoring/` for
  the rule list.

## Ruling

Quoted from index.md:

- **F10** — "`p:plugins:check` validates the three facts wherever a pack
  declares them: every `binaries` entry a non-empty string or a map with exactly
  `name` (string) and optional `probe` (non-empty string); `lockfile` a
  non-empty list of relative paths or globs with no `..`; every `machine_env`
  entry a map with `name` (an env-var name), `detect` and `question` (non-empty
  strings), and — when the pack ships a `conf.d` fragment — the name present in
  it. Each fault one finding naming the pack and the entry; tests in
  `check.test.ts`."
- The fact shapes are F1, F2 and F3 as index.md states them.

## Edits

1. In `check.ts`, extend the pack walk (the rule that reads `pack.yaml`, rule
   11's neighbourhood) with the three validations. Place them in the existing
   rule whose scope is a pack's `pack.yaml` rather than adding a sixteenth rule,
   unless the code makes that impossible — then report the new rule number as
   `DECIDED:` and `DOCS FALSIFIED:` every passage counting "fifteen rules". For
   `machine_env`, "present in it" means the name appears as a key of an `[env]`
   table in some `config/.config/mise/conf.d/*.toml` the pack ships.
2. In `check.test.ts`, one passing and one failing case per assertion.

## Verification

- `pnpm vitest run` and `pnpm tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green on the tree as it stands (U4 and U5 add the
  facts concurrently — if their files are mid-edit, re-run once they settle and
  report only faults in your own logic).

## Guardrails

- Touch nothing outside Owns.
- Never run `git checkout`, `git restore`, `git stash` or a formatter's `--fix`
  outside Owns.

## Commit

Wave 1 lands as one commit (F12):
`feat: pack facts — binary probes, lockfile paths, machine env`
