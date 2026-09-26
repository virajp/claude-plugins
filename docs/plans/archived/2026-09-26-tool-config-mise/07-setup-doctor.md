# U7 — setup and doctor use tool-config for mise

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/doctor/**`,
  `plugins/vwf/assets/stack-adapter.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `setup/SKILL.md` (Step 0 shape test :109–118, materialize pass
  :216–228); `setup/references/materialize.md` :150–250;
  `doctor/references/stack-checks.md` :270–300, :370–400, :440–610;
  `doctor/SKILL.md`; `assets/stack-adapter.md` :130–150, :260–270; index.md's
  Facts.

## Ruling

> - Decision 8: `/vwf:setup` fills a `machine_env` value with
>   `/stackgen:tool-config mise set env <KEY>=<value> for <pack>`. The stackgen
>   lock records what the skill writes as
>   `source: tool-config/<tool>@<stackgen version>`; doctor (a) and (e) read
>   that (re-testing against `tool-config/assets/<tool>/`); the missing-mise
>   finding names the skill.
> - Decision 15: Any sentence a unit adds is short.

## Edits

1. **`setup/references/materialize.md`** :170–248 — the `machine_env` fill calls
   the skill (the key names come from the pack's `pack.yaml`, never named in
   vwf); the old "file the pack landed" wording and the lock-hash gate retire.
2. **`setup/SKILL.md`** — Step 0's shape test accepts `tool-config/…` records;
   the materialize pass lets the materializer run pack `tool-config:` calls.
3. **Doctor** — (a) compares `tool-config/<tool>@<ver>` records against the
   installed stackgen version; (e) re-tests such a record against the skill's
   `assets/<tool>/` payload; the missing-toolchain finding (:276–291) names
   `/stackgen:tool-config all`, not a bundle slug. Name no tool.
4. **`assets/stack-adapter.md`** — the adapter supplies bundles; the universal
   tools are `stackgen:tool-config`'s.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green (rule 10)

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: vwf setup and doctor use stackgen:tool-config` — written by the
orchestrator after the wave gate.
