# U4 — execute and its agents

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/execute-stages.md` (U2's; read only).

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

> D6: execute drops its halt on a missing graphify CLI or graph and the
> code:graph step after a landing; setup drops its graph offer; tool-config
> drops .graphifyignore, the code:graph task, the graphify-refresh hook with
> the post-commit and post-merge hook types it alone uses, the graphify strip
> code in the setup/precommit asset and its re-run in setup/all, every
> graphify-out/ exclude, and the pipx:graphifyy and pipx:mempalace pins and
> MEMPALACE_* variables. python and uv stay, because pre-commit depends on
> them; only the comment that names graphify as their reason changes.

> D12: It gets a suffix, -2 then -3 and so on; no record is overwritten.
> (D12 answers: a new record whose <date>-<slug>.md already exists.)

> D16: It lists the file names, reads the files whose slug or title matches
> the topic at hand, newest first, at most ten, and reads no file in full that
> does not match. (D16 answers: how much of a docs/memory/ folder a recall reads.)

> D18: Into the plan index.json gaps list only. docs/memory/gaps/ holds the
> gaps found outside a run: blueprint, verify, feedback.

## Edits

1. **`plugins/vwf/skills/execute/SKILL.md`** — remove the graphify halt
   (`:372-373`), the palace working memory and journal (`:581-603`, `:792`),
   the palace recall (`:684-715`; recall reads `docs/memory/decisions/` and
   `docs/memory/gaps/` instead), the run filing (`:961-971`), the drawer
   archive (`:1075`), and the `code:graph` step after landing (`:1166-1173`).
   The run record is `index.json` and the action log, as today.
2. **`plugins/vwf/skills/execute/references/code-unit.md`** (`:25-28`, `:42`),
   **`review-unit.md`** (`:127`, `:220`, `:248`), **`blocking.md`** (`:12`),
   **`all.md`** (`:49`) — remove each palace or graph step; a gap goes to
   `index.json`'s `gaps` list.
3. **`plugins/vwf/agents/execute-coder.md`**, **`execute-code-reviewer.md`**,
   **`execute-security-reviewer.md`**, **`execute-ux-reviewer.md`**,
   **`execute-acceptance-verifier.md`**, **`execute-runner.md`** — remove every
   `mcp__plugin_vwf_mempalace__*` and `mcp__plugin_mempalace_mempalace__*` entry
   from the `tools:` frontmatter; remove the palace search and filing passages
   and the graphify passages from each body. Where an agent filed a gap or a
   finding, it returns it in its report block; say so in one line.
4. **`plugins/vwf/agents/blueprint-condenser.md`** (`:48`, `:65`) — items it
   sent to rooms `decisions` and `gaps` are returned in its report instead.
   It runs under `/vwf:blueprint`, not a plan run: `/vwf:blueprint` (U5's)
   writes them as `docs/memory/` files.

## Verification

- `mise x -- mise run code:format`
- `grep -rli -E 'mempalace|graphify|drawer|code:graph' plugins/vwf/skills/execute plugins/vwf/agents/execute-*.md plugins/vwf/agents/blueprint-condenser.md` finds nothing.
- Each agent's frontmatter still parses as strict YAML and its `tools:` list is non-empty.

## Guardrails

- Do not touch `plugins/vwf/agents/plan-surveyor.md` or `docs-sync-surveyor.md` — U5 owns them.
- Do not touch `plugins/vwf/assets/**` — U2 and U6 own them.
- Strict-YAML frontmatter: keep each `tools:` list valid after the removals.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat!: execute and its agents run without the palace and the graph`
