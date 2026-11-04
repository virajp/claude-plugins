# U6 — setup, doctor, init and config_format 24

- **Read first:** every owned file you edit, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/setup/references/format-lineage.md` §the skip rule (`:24-34`) before you pick the number.

## Ruling

> D1: Remove completely: after the change no plugin names mempalace or
> graphify. The one exception is cleanup code: doctor's drift rule for
> leftovers and the config_format 24 migration in setup may name the old files
> and keys. Nothing else in any plugin names either tool.

> D3: vwf's own leftovers (the memory: key and memory.wing in
> .config/vwf.yaml, each per-tree mempalace.yaml) are removed by the setup
> migration to config_format 24, shown as numbered rows and applied on
> consent. stackgen tool-config stops shipping the graphify and mempalace
> files and has no removal code of its own; bootstrap's repo-sync owns that
> cleanup (a handoff prompt to bootstrap, written outside this plan). doctor
> reports each leftover as drift with its remedy: the setup migration for
> vwf's own, bootstrap M24 or a bootstrap remove tools instruction for the
> files.

> D4: docs/memory/ is the one store, with four folders: decisions/, gaps/ and
> problems/ (each <date>-<slug>.md) and handoff/ (<name>.md). The palace rooms
> planning, runs and doctor are dropped: the plan folder and
> docs/plans/index.json hold the planning record, index.json and the action
> log hold the run state, and doctor reports again on each run. The skills
> that filed to the palace write the same records as these files and read them
> at recall. The location rules are the ones memory.md gives the file mirror
> today (the base repo, in a multi-repo product).

> D6: execute drops its halt on a missing graphify CLI or graph and the
> code:graph step after a landing; setup drops its graph offer; tool-config
> drops .graphifyignore, the code:graph task, the graphify-refresh hook with
> the post-commit and post-merge hook types it alone uses, the graphify strip
> code in the setup/precommit asset and its re-run in setup/all, every
> graphify-out/ exclude, and the pipx:graphifyy and pipx:mempalace pins and
> MEMPALACE_* variables. python and uv stay, because pre-commit depends on
> them; only the comment that names graphify as their reason changes.

> D9: config_format 24, with a row in setup's format-lineage.md and a step in
> migrate-pipeline.md that removes the memory: block and each per-tree
> mempalace.yaml.

> D11: The config_format 24 migration removes them: one numbered row for each
> such folder that exists, deleted on consent.

(D11 answers: "What happens to docs/memory/planning/, runs/ and doctor/ in
shaped repos?")

> D17: The migrate pipeline: a plain /vwf:setup that reads stamp 23 offers the
> step. The 23 to 24 entry in assets/vwf-config.md, the row in
> format-lineage.md and the step in migrate-pipeline.md are part of the D1
> cleanup exception and may name mempalace.yaml.

> D12: It gets a suffix, -2 then -3 and so on; no record is overwritten.
> (D12 answers: a new record whose <date>-<slug>.md already exists.)

> D16: It lists the file names, reads the files whose slug or title matches
> the topic at hand, newest first, at most ten, and reads no file in full that
> does not match. (D16 answers: how much of a docs/memory/ folder a recall reads.)

> D19: Yes, always 24. A declined item stays, and doctor reports it as drift
> with its remedy; the step does not ask again on each setup. (D19 answers:
> does the stamp move to 24 when a removal row is declined, or nothing is found?)

> D20: Based on state: every /vwf:setup migrate pass offers the removal rows
> when the repo holds a memory: block, a mempalace.yaml or a
> docs/memory/planning/, runs/ or doctor/ folder, at any stamp. The stamp still
> moves one step at a time: a config held at 22 by its answers: block stays at
> 22, and moves to 24 once it is at 23. D19 applies from 23.

## Edits

1. **`plugins/vwf/assets/vwf-config.md`** — set `config_format` to 24
   (`:46`, `:49`); remove the `memory:` block and `memory.wing` (`:150-151`)
   and the "default wing" passage (`:53`), and remove `memory` from the
   ownership row "`product` / `memory`" (`:229`). Add a `23 → 24` migration entry
   beside the `22 → 23` one (`~:709`), saying it is performed by the migrate
   pipeline (D17) and what it removes (D9, D11).
2. **`plugins/vwf/skills/setup/references/format-lineage.md`** — set the
   current value to 24 (`:18`); add the 23 → 24 row: `memory:` block and every
   per-tree `mempalace.yaml` retired. Rework `:80`, `:130` and `:137-139` so
   they describe history, not a live location.
3. **`plugins/vwf/skills/setup/references/migrate-pipeline.md`** — add the
   23 → 24 step: show one numbered removal row for the `memory:` block, one
   for each `mempalace.yaml` found, and one for each of
   `docs/memory/planning/`, `docs/memory/runs/` and `docs/memory/doctor/` that
   exists (D11); apply on consent. The rows are offered by state, at any stamp
   (D20). The stamp moves to 24 whatever the answers, and also when nothing is
   found (D19), once it is at 23. Rewrite the sentence that calls a delete
   "the one delete this pass offers" (`~:44`) so it names these removals too.
   Remove the graph line `:25`.
   Also rewrite `skills/setup/SKILL.md:160` ("The latest config step,
   `22 → 23`…") so it names the step from 23 to 24.
4. **`plugins/vwf/skills/setup/SKILL.md`** (`:50`, `:308`, `:316-327`, `:354-358`)
   and **`references/onboard-pipeline.md`** (`:34-36`, `:41-45`, `:97-100`,
   `:172-178`, `:204`), **`references/claude-md.md`** (`:20`) — remove the
   `memory.wing` question, the graph offer and the declined-build note; the
   decisions filing becomes a `docs/memory/decisions/` file; recall reads
   `docs/memory/decisions/`.
5. **`plugins/vwf/skills/setup/references/memory-tree.md`** — it writes
   `mempalace.yaml` (`:19-77`) and names the graph (`:11`). Rewrite it to
   create the four `docs/memory/` folders of D4, or delete it with `rm` and
   remove every citation of it inside your owned paths if nothing remains.
6. **`plugins/vwf/skills/doctor/SKILL.md`** (`:5-7`, `:41`, `:45`, `:72-75`,
   `:157-162`, `:182`, `:201`, `:204-260`, `:279-282`) — remove the palace
   probe, the wing and room checks, the room-`doctor` recall and filing, and
   the graphify checks, with their blocking and degradation rules. Add one
   drift rule: a leftover `memory:` block, a `mempalace.yaml`, a
   `.graphifyignore`, a `code:graph` task, a `graphify-refresh` hook, a
   `post-commit` or `post-merge` pre-commit hook type that no remaining hook
   in the repo's pre-commit config uses, a `pipx:graphifyy` or
   `pipx:mempalace` pin, a `graphify-out/` exclude, a `MEMPALACE_*` variable or
   a `docs/memory/planning/`, `runs/` or `doctor/` folder is reported as drift, not blocking, each with its remedy from D3. This rule is one of the D1 exceptions; keep the names inside it.
7. **`plugins/vwf/skills/doctor/references/harness-and-memory.md`** — remove
   §7's palace checks (`:21-123`); keep a `docs/memory/` check only if it fits
   in one short rule. **`references/code-intelligence.md`** — remove the
   graphify checks (`:7`, `:13-51`); delete the file with `rm` if nothing is
   left, and remove its citations inside your owned paths.
   **`references/stack-checks.md`** (`:256`, `:310`) — remove the graph lines.
8. **`plugins/vwf/skills/init/`** — `SKILL.md:57`,
   `references/tool-configs.md:20,60,69`, `new-repo.md:136,172`,
   `existing-repo.md:85,223`, `readme-and-license.md:7,178`: remove each
   graphify mention; init writes no palace config.

## Verification

- `mise x -- mise run code:format`
- `grep -rli -E 'mempalace|graphify' plugins/vwf/skills/setup plugins/vwf/skills/doctor plugins/vwf/skills/init plugins/vwf/assets/vwf-config.md` lists only `skills/doctor/SKILL.md` (the drift rule), `skills/setup/SKILL.md` (the latest-step line), `skills/setup/references/{format-lineage,migrate-pipeline}.md` and `assets/vwf-config.md` (the 23 → 24 entry).
- `grep -n 'config_format' plugins/vwf/assets/vwf-config.md` shows 24.

## Guardrails

- Do not touch `plugins/vwf/assets/memory.md` or any other asset but `vwf-config.md`.
- Versions skip 13 and 17; 24 is allowed.
- Strict-YAML frontmatter in each `SKILL.md`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat!: setup, doctor and init drop the palace and the graph, config_format 24`
