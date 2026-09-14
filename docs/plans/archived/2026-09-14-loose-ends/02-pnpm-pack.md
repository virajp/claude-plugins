# U2 — the pnpm pack's deps verbs accept pnpm 12

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/pnpm/**`, every
  `plugins/stackgen/stacks/bundles/*.md` whose `components:` pin
  `package-manager/pnpm@`, `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml`, its
  `config/.config/mise/tasks/setup/deps/{install,outdated,audit,upgrade,cleanup}`,
  its `conventions.md`, and
  `plugins/stackgen/stacks/package-manager/uv/config/.config/mise/tasks/setup/deps/{outdated,audit}`
  for the advisory precedent.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (the `version:`
  field); `.claude/skills/plugin-authoring/SKILL.md` (rule 11, the payload
  exclusion from dprint).

## Ruling

Decision 2: "`outdated` drops the `--depth 0` token and keeps every other flag;
`audit` drops `--reporter=summary` and becomes advisory with `|| true`, as the
uv pack's already is. `pack.yaml` `0.2.0` → `0.2.1` (a fix); every bundle
pinning `package-manager/pnpm@0.2.0` follows; the inventory is regenerated in
the same commit." Rejected: "audit stays blocking; a minor bump".

Decision 7: "U2 regenerates and owns `stacks/inventory.md` in wave 1."

The facts: on pnpm 12.4.1 `pnpm outdated` has `-r/--recursive`, `--long`,
`--json`, `--format`, `--reporter`, `--aggregate-output` and no `--depth`;
`pnpm audit --reporter` takes only `default|append-only|ndjson|silent`.

## Edits

1. **`…/pnpm/config/.config/mise/tasks/setup/deps/outdated`** (`:16`) — remove
   `--depth 0`; leave every other token. If the line does not already end in
   `|| true`, add it — `pnpm outdated` exits 1 whenever anything is outdated,
   and a report is not a failure.
2. **`…/pnpm/config/.config/mise/tasks/setup/deps/audit`** (`:12`) — remove
   `--reporter=summary`; end the line in `|| true`. Adjust the comment above it
   so it says the audit is advisory here and blocking in CI, in the uv pack's
   words if it has them.
3. **`…/pnpm/pack.yaml`** — `version: 0.2.1`.
4. **`…/pnpm/conventions.md`** and any `skills/**` reference in the pack — grep
   for `--depth`, `reporter=summary`, `reporter summary`; fix each mention.
5. **Bundles** —
   `command grep -ln "package-manager/pnpm@0.2.0" plugins/stackgen/stacks/bundles/*.md`
   lists them; in each, `package-manager/pnpm@0.2.0` →
   `package-manager/pnpm@0.2.1` and nothing else.
6. `mise run p:plugins:inventory` — regenerates `stacks/inventory.md`; counts
   unchanged, the pnpm row's version moves.

## Verification

- `command grep -rn "\-\-depth\|reporter=summary\|reporter summary" plugins/stackgen/stacks/package-manager/pnpm/`
  is empty.
- `command grep -rn "package-manager/pnpm@0.2.0" plugins/stackgen/stacks/bundles/`
  is empty;
  `command grep -rln "package-manager/pnpm@0.2.1" plugins/stackgen/stacks/bundles/ | wc -l`
  equals the count the first grep in edit 5 returned.
- `mise run p:plugins:inventory -- --check`, `mise run p:plugins:check`,
  `mise run p:plugins:shellcheck` green.
- Both task files still mode 755 with their bash shebang (`ls -l`, `head -1`).
- A scratch run: in a temp dir with `pnpm init`, a `.config/mise/config.toml`
  naming a task dir, and the two edited verbs copied in (with the pack's helper
  library beside them if they `source` one — read the `source` line),
  `mise run setup:deps:outdated` and `mise run setup:deps:audit` both exit 0 on
  pnpm 12.4.1. Report in `DECIDED:`.

## Guardrails

- `plugins/*/stacks/*/*/config/` is payload: no formatter, no reflow, no comment
  style "improvements" — the two flag removals and the `|| true` are the whole
  change to those files.
- Do not touch the uv, flutter or mise packs, `dart-flutter.md`, or any doc.
- Do not change `upgrade` (`pnpm self-update`, `pnpm update`), `install` or
  `cleanup` — they are correct and U4 byte-copies them.
- Delete with `rm`, never `git rm`; stage nothing.

## Commit

`fix: stackgen — pnpm pack outdated/audit accept pnpm 12; pnpm 0.2.1` — written
by the orchestrator after the wave gate, not by the unit. The pack version, the
bundle pins and the regenerated `inventory.md` land in this one commit.
