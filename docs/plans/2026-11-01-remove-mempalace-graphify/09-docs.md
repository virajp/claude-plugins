# U9 — Docs

- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`, then each doc a finding names.
- **Lazy-load:** `site/CLAUDE.md` (the link rule and the gate) before editing the manual.

## Ruling

> D8: site/src/content/docs/plugins/mempalace.md is deleted, and every link to
> it is removed or repointed so p:site:check stays green.

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

> D14: U9 deletes it: it describes how vwf installs mempalace, which is no
> longer true.

(D14 answers: "What happens to docs/extras/mempalace-setup.md?")

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings,
   plus every `DOCS FALSIFIED:` line U1 to U7 returned, plus the list in
   index.md's facts (*Non-plugin docs that name either tool*).
2. **`site/src/content/docs/plugins/mempalace.md`** — delete with `rm`; fix
   the links to it in `karpathy-guidelines.md:47,99`,
   `vwf.md:110,4077,4253,4363,4401`, `how-to/operate/sessions-and-handoff.md:85`,
   `how-to/greenfield/single-repo.md:50` and `readme.md:240`.
3. **The prerequisites** — remove graphify (and uv where graphify was its only
   reason) from `readme.md:68-76`, `site/src/content/docs/plugins/vwf.md:34-72`
   and `site/src/pages/index.astro:57`. Keep mise, pnpm and the rest.
4. **The memory docs** — the manual's memory passages (`vwf.md:93-110`,
   `~:4075`, `how-to/operate/sessions-and-handoff.md`) describe the
   `docs/memory/` store of D4 and the files-only handoff.
5. **The repo docs** — `CLAUDE.md`, `installer/CLAUDE.md` (the checkpoint test
   is gone; graphify leftovers note), `.claude/docs/{ci-and-releases,repo-shape,plugins}.md`,
   `.claude/agents/target-verifier.md:37,114`, `.claude/skills/vwf-plugin/`
   (SKILL.md and references dependencies, assets, skills-and-agents,
   docs-tree), `.claude/skills/stackgen-plugin/SKILL.md`,
   `.claude/skills/plugin-authoring/references/checks.md:114`.
6. **The reversal** — write `docs/memory/decisions/2026-11-01-remove-mempalace-graphify.md`
   recording that this plan reverses the 2026-08-08 "mempalace absorbed into
   vwf" ruling and the graphify integration, with the rulings D1 to D4.
7. Credits: the `readme.md:469,487` credits for MemPalace and graphify are
   removed with the tools.
8. **`package.json`** (`:17`) — remove the `"mempalace"` keyword.
9. **`docs/extras/mempalace-setup.md`** — delete with `rm` (D14).
10. **`docs/plans/migrate.md`** (`:253`) — the sentence about the mempalace
    `runs` journal goes; `index.json` and the action log are the run record.

## Verification

- `mise x -- mise run code:format`
- `mise x -- mise run p:site:check` passes (no broken link to the deleted page).
- `grep -rli -E 'mempalace|graphify' readme.md CLAUDE.md installer/CLAUDE.md .claude site/src` lists only passages that describe the removal or a cleanup step.

## Guardrails

- `CLAUDE.md`, `installer/CLAUDE.md`, `site/CLAUDE.md` and `readme.md` are
  dprint-formatted: widening one table cell re-pads every row.
- Never end a table cell in a bare asterisk.
- Keep each code span on one line.
- Do not touch `plugins/**` — the earlier units own it.

## Commit

`docs: the manual and the repo docs follow the mempalace and graphify removal`
