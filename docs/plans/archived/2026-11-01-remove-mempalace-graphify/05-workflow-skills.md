# U5 — Workflow skills and the surveyor agents

- **Read first:** every owned file you edit, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (U2 rewrites it in the same wave; work from the rulings below).

## Ruling

> D1: Remove completely: after the change no plugin names mempalace or
> graphify. The one exception is cleanup code: doctor's drift rule for
> leftovers and the config_format 24 migration in setup may name the old files
> and keys. Nothing else in any plugin names either tool.

> D4: docs/memory/ is the one store, with four folders: decisions/, gaps/ and
> problems/ (each <date>-<slug>.md) and handoff/ (<name>.md). The palace rooms
> planning, runs and doctor are dropped: the plan folder and
> docs/plans/index.json hold the planning record, index.json and the action
> log hold the run state, and doctor reports again on each run. The skills
> that filed to the palace write the same records as these files and read them
> at recall. The location rules are the ones memory.md gives the file mirror
> today (the base repo, in a multi-repo product).

> D5: Every agent loses its mempalace tool grants (both the plugin_vwf_ and
> plugin_mempalace_ prefixes) and every graphify query. An agent that filed a
> gap or a finding to the palace returns it as a line in its report instead;
> the orchestrator records it in the plan's index.json. The agents keep their
> file reads.

> D12: It gets a suffix, -2 then -3 and so on; no record is overwritten.
> (D12 answers: a new record whose <date>-<slug>.md already exists.)

> D16: It lists the file names, reads the files whose slug or title matches
> the topic at hand, newest first, at most ten, and reads no file in full that
> does not match. (D16 answers: how much of a docs/memory/ folder a recall reads.)

## Edits

For each skill, a palace **recall** becomes a read of the matching
`docs/memory/` folder (decisions, gaps or problems), and a palace **filing**
becomes one file written to that folder per memory.md. A recall or filing for
the dropped rooms (`planning`, `runs`, `doctor`) is removed. A graph step is
removed.

1. **`plugins/vwf/skills/architecture/`** — recall `:93-97`, filing `:425-428`, graph `:99-106`.
2. **`plugins/vwf/skills/blueprint/`** — recall `:248-252`, filing `:473`, `references/density-pass.md:18-20`. The `blueprint-condenser` agent (U4's) now returns its decisions and gaps in its report: `/vwf:blueprint` writes each as a `docs/memory/decisions/` or `docs/memory/gaps/` file.
3. **`plugins/vwf/skills/blueprint-authoring/`** — `references/density.md:59,84`, `references/frontmatter-and-links.md:43`.
4. **`plugins/vwf/skills/change-plan/`** — recall `:86-88` (the `planning` room goes; `decisions` and `gaps` become the folders).
5. **`plugins/vwf/skills/design-system/`** — recall `:80-84`, filing `:208`, graph `:32`.
6. **`plugins/vwf/skills/feedback/`** — recall `:82`, filing `:139-216` (gaps, problems, decisions become files), graph `:78-79`.
7. **`plugins/vwf/skills/mockups/`** — recall `:245-249`, filing `:362`.
8. **`plugins/vwf/skills/plan/`** — recall `:100-103`, `:311-315`, filing `:394-397` (the `planning` room goes), graph `:244-246`.
9. **`plugins/vwf/skills/plan-management/`** — the `mempalace_update_drawer` archive step `:499-501` goes.
10. **`plugins/vwf/skills/product/`** — recall `:65-69`, filing `:127-129`.
11. **`plugins/vwf/skills/screens/`** — `references/prompt-mode.md:64-66`, `references/import-mode.md:119`.
12. **`plugins/vwf/skills/verify/`** — recall `:79-81`, filing `:123-158`.
13. **`plugins/vwf/agents/plan-surveyor.md`** (`:35-40`, `:57`), **`docs-sync-surveyor.md`** (`:34-38`, `:51`) — remove the graph-first orientation; the survey reads files.

## Verification

- `mise x -- mise run code:format`
- `grep -rli -E 'mempalace|graphify|drawer' <each owned path>` finds nothing.
- Each changed `SKILL.md` frontmatter still parses as strict YAML.

## Guardrails

- Do not touch `plugins/vwf/skills/{execute,handoff,recall,setup,doctor,init}/` — U3, U4 and U6 own them.
- Do not touch `plugins/vwf/assets/**`.
- The line numbers are from the survey; a line may have moved, so find the passage.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat!: the workflow skills keep their memory in docs/memory files`
