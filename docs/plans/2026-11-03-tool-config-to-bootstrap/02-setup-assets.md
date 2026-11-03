# U2 — setup and the vwf assets drop tool-config

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/init/SKILL.md` and
  `plugins/vwf/skills/doctor/SKILL.md` (read only, to cite them correctly),
  `plugins/stackgen/skills/stackgen-stack-template/references/bootstrap-handoff.md`
  (read only).

## Ruling

> - D4: init runs bootstrap's readme prompt, quoted word for word in init's
>   SKILL.md and attributed to bootstrap's README.md. The same prompt also
>   brings an adopted repository up to date, so /vwf:setup reshape reaches it
>   through init. init drafts no values block and asks none of the questions
>   docs/sync/ asks.
> - D5: init keeps the hygiene files, the enforcement.kept_files record in
>   .config/vwf.yaml, and the forge pass. It drops the secrets-provider pass,
>   the git landing question, the trust check, the mise run init step and the
>   _default slots.
> - D6: Shaped means the repository has .config/bootstrap.toml. Drift means
>   mise run setup:configs --dry-run shows a change. A repository with
>   .config/stackgen.yaml and no .config/bootstrap.toml is old layout: setup
>   Step 0 offers init. A .config/stackgen.yaml beside a .config/bootstrap.toml
>   is a doctor Leftovers row. init deletes .config/stackgen.yaml after a green
>   adoption.
> - D7: config_format does not change. .config/vwf.yaml keeps its keys and
>   kept_files stays. setup Step 0's old-layout detection is the migration
>   path; bootstrap's docs/sync/migrate.md maps the old keys.
> - D8: setup's materialize pass loses every tool-config call: pack,
>   pack-remove, preview and the re-derived all call. The pack values: text is
>   deleted (the values: key was removed in phase 1, bc95a7af). setup reads
>   nothing from .config/stackgen.yaml. The stackgen materializer, which
>   already hands tools to bootstrap, is the one thing the pass calls.
> - D12: optional-tools runs first; read the owned files as that plan left
>   them (config_format 25, the tools: key).
> - D16: By the exit code and the output. Exit 0 with no change listed means
>   no drift; a listed change means drift; exit 5, or any other failure, means
>   drift unknown. doctor reports unknown as a warning with the reason; setup
>   Step 0 says it could not check drift and continues as current; init treats
>   the repository as not green, keeps .config/stackgen.yaml and names the
>   repository in the report.
> - D19: A line that starts with would (would update, would remove, would
>   chmod, would set bootstrap_commit) is a change. Lines that read unchanged,
>   kept seed or skip are not. No would line and exit 0 means no drift.
>   doctor, setup, init and recall all parse it this way.
> - D20: baseline reads no forge, as doctor and recall say today; the forge
>   check stays in doctor's full mode. The dry-run writes nothing in the
>   repository; it refreshes bootstrap's own clone cache under
>   ~/.cache/bootstrap, which D17 accepts.

> - D21: Every live mention of mise run setup:all becomes mise run setup,
>   the task bootstrap ships (setup/_default). History rows keep their text.

## Edits

1. **`plugins/vwf/skills/setup/SKILL.md`**
   - 64: the repo shape belongs to bootstrap, reached through init.
   - Step 0 (111–140): shaped = `.config/bootstrap.toml` in the base and
     each member; old layout = `.config/stackgen.yaml` without it (or the
     older layouts already named) → offer init; "current" = doctor's
     baseline predicates hold, now: shaped, and `setup:configs --dry-run`
     shows no change (D19; unknown per D16). baseline reads no forge (D20).
     Remove `preview all` / `preview pack`.
   - 181: `.gitignore` and `.gitattributes` are bootstrap's.
   - The materialize pass (207–221): delete pack `values:` gathering and
     every `tool-config pack`, `pack-remove` and `all` call; the pass calls
     the stackgen materializer alone.
   - 236: secrets are bootstrap's; setup reads nothing from
     `.config/stackgen.yaml`.
   - `reshape`: runs init, whose bootstrap step also updates an adopted
     repository.
2. **`plugins/vwf/skills/setup/references/materialize.md`** — delete the
   `stackgen.yaml` reads (38–52), the `values:` and answers maps (120–147),
   "Gather the pack values", the tool-config preview/`--answers` protocol,
   the per-pack re-run, `pack-remove` and the re-derive-and-call-`all`
   section (176–300). Keep what the materializer call needs.
3. **`plugins/vwf/skills/setup/references/onboard-pipeline.md`** — the shaped
   check reads `.config/bootstrap.toml` (51–53); the baseline belongs to
   init and bootstrap.
4. **`plugins/vwf/skills/setup/references/migrate-pipeline.md`** — 30, 37–44:
   config files and `.vscode/` are bootstrap's; the `answers:` move row stays
   as history but names no live tool-config step. No new step (D7).
5. **`plugins/vwf/skills/setup/references/format-lineage.md`** — rows 22/23
   stay as history; add nothing; change no format number. Change only a
   sentence that tells a reader to run tool-config today.
6. **`plugins/vwf/skills/setup/references/memory-tree.md`** — 13: the
   `.gitignore` lines come from bootstrap's git tool.
7. Any other file under `plugins/vwf/skills/setup/` that names tool-config,
   `stackgen.yaml` as a live record, or pack `values:` — same treatment.
8. **`plugins/vwf/assets/stack-adapter.md`** — delete pack `values:` and the
   `tool-config pack --set` call (291, 375–388); 413–419: the universal
   tools are bootstrap's, shaped = `.config/bootstrap.toml`, drift =
   `setup:configs --dry-run`. Delete the secrets-provider-through-adapter
   call that init used (D5), if this file defines it.
9. **`plugins/vwf/assets/vwf-config.md`** — 33–39, 124–126, 233: keep
   `kept_files`; remove the `stackgen.yaml` single-writer and
   secrets/forge-answers text; the repo's answers live in its
   `.config/bootstrap.toml`, written by bootstrap. Migration rows 602–603,
   704–716 stay as history, without a live tool-config instruction.
   `config_format` stays as optional-tools left it.
10. **`plugins/vwf/assets/memory.md`** — 75–76: the memory ignore lines sit
    in the repo's `.gitignore`, which bootstrap's git tool syncs (name the
    repo-owned `.config/repo-sync/gitignore` part only if bootstrap's
    docs/sync says that is where repo lines go; else say `.gitignore`);
    117: bootstrap lands the config in `.config/`.
11. **`plugins/vwf/assets/stack-vocabulary.md`** — 56: delete pack `values:`.

- **D21, every owned file** — replace each live `setup:all` with
  `mise run setup` (setup and the owned assets); leave history rows as they are. Verify with
  `grep -rn "setup:all"` over the owned paths: only history rows remain.

## Verification

- `mise x -- mise run code:format` and `mise x -- mise run p:plugins:check`
  are green.
- `grep -rn -iE 'tool-config|--set ' plugins/vwf/skills/setup plugins/vwf/assets/stack-adapter.md plugins/vwf/assets/vwf-config.md plugins/vwf/assets/memory.md plugins/vwf/assets/stack-vocabulary.md`
  returns only history rows of format-lineage, migrate-pipeline and
  vwf-config.
- `grep -n 'config_format' plugins/vwf/assets/vwf-config.md` shows the
  number optional-tools left, unchanged.

## Guardrails

- Touch nothing outside the owned paths. init and doctor are other units':
  cite them, report falsified passages as `DOCS FALSIFIED:`.
- Do not bump `config_format` and do not add a migrate step (D7).
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not formatted by dprint: match the fold width by
  hand; keep each code span on one line.

## Commit

`feat: setup reads the repo shape from bootstrap and drops tool-config calls`
