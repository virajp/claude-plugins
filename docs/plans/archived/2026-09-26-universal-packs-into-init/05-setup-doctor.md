# U5 — setup, doctor and the vwf assets follow init's ownership

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/{materialize,onboard-pipeline,migrate-pipeline,format-lineage}.md`,
  `plugins/vwf/skills/doctor/**`,
  `plugins/vwf/assets/{vwf-config,stack-adapter}.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `setup/SKILL.md` :55–150, :210–240;
  `setup/references/materialize.md` :140–250; `onboard-pipeline.md` :50–65;
  `migrate-pipeline.md` and `format-lineage.md` (the config_format lineage);
  `doctor/references/stack-checks.md` :270–300, :370–400, :440–610;
  `doctor/SKILL.md`; `assets/vwf-config.md`; `assets/stack-adapter.md` :130–150,
  :260–270; index.md's Facts.

## Ruling

> - Decision 4: init records what it lands in `.claude/vwf/init.lock.yaml`, the
>   stackgen entry shape, `source: init/<pack>@<vwf version>`. The stackgen lock
>   keeps only stackgen packs. Doctor (a) and (e) read both.
> - Decision 5: `.config/vwf.yaml` gains `min_versions` (keys `vwf` and
>   `stackgen`) — the plugin versions that shaped the repo, raised by each init
>   or setup run to the versions it ran with. setup, init and doctor check it
>   first: an installed version older than recorded stops the run and offers,
>   with consent, `claude plugin marketplace update virajp-plugins` then
>   `claude plugin update <name>`, then asks for a session restart.
>   `config_format` 21 → 22 with a migration.
> - Decision 11: Any sentence a unit adds is short.

## Edits

1. **`assets/vwf-config.md`** :49 — `config_format: 22`; document `min_versions`
   (who writes it, who reads it).
2. **`format-lineage.md`, `migrate-pipeline.md`** — the 21 → 22 step: add
   `min_versions` with the running versions.
3. **`setup/SKILL.md`** — the version gate as the first step; the hard rule
   (:62–69) and Step 0's shape test (:109–118) read init's lock for the
   universal tier ("the init lock records the six packs"); the offer (:137–146)
   and `reshape` (:73–96) unchanged in shape; setup raises `min_versions` at the
   end of a run.
4. **`setup/references/materialize.md`** :150–158 (the secrets answer read from
   whichever lock records the provider), :243; **`onboard-pipeline.md`** :58.
5. **Doctor** — the version gate as the first check (a mismatch is blocking,
   naming the upgrade commands); missing-mise (:276–291) names init, not the
   adapter; (a) (:378–399) compares init's lock sources against vwf's own
   `init/packs/*/pack.yaml` versions and the stackgen lock against the adapter;
   (e) (:462–512) re-tests an init record against `init/packs/<pack>` payload;
   the missing-lock note (:562–565) covers both locks.
6. **`assets/stack-adapter.md`** :140–146, :268 — the adapter supplies every
   stack except the universal tier, which init owns.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -n "config_format" plugins/vwf/assets/vwf-config.md` shows 22

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: vwf setup and doctor read init's lock and gate on min_versions` — written
by the orchestrator after the wave gate.
