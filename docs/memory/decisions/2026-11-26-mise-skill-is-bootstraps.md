# Decision — the repo-local mise skill is bootstrap's

**Date** 2026-11-26 · **Branch** `all-2026-11-27-2236` · **Plan**
`docs/plans/2026-11-26-stackgen-bootstrap-tasks/`
· **Supersedes**
[`2026-10-01-repo-local-mise-skill-returns.md`](./2026-10-01-repo-local-mise-skill-returns.md)

## What was decided before

On 2026-10-01 `stackgen:tool-config` landed a repo-local mise skill,
`.claude/skills/mise/SKILL.md`, with a task table its script regenerated. When
`tool-config` was deleted on 2026-11-03 the skill went with it, and stackgen has
landed no mise skill since.

## What changed

- **D14 — bootstrap owns the skill.** bootstrap owns the mise config and creates
  the tasks, so bootstrap owns and generates the repo-local mise skill. stackgen
  lands none. The handoff to bootstrap is a prompt file in bootstrap's
  `docs/prompts/`, written by the planner session, not by a unit (D4). stackgen
  cites the skill as `.claude/skills/mise/` and assumes nothing more about it.
- **D3 — a generated skill names no task.** The mise skill lists the tasks
  bootstrap installed, so stackgen's generator tells a generated skill to name
  none.
- **D3b — shipped skills keep their task names.** A person reviews a shipped
  skill and the checker can guard it, so the plan fixes only the wrong names and
  the stale helpers text.
- **D6 — one pointer line.** Each SKILL.md that lands in a repo's
  `.claude/skills/` (packs, tool knowledge, design tools) and names a task
  carries one line: "The repo's mise skill, .claude/skills/mise/, lists every
  task." stackgen's own skills do not get it (D31).

## The alternatives rejected

- **D14** — stackgen lands the mise skill again; no mise skill at all.
- **D3** — a generated skill names the aggregate tasks and reads part names with
  `mise tasks`; the generator writes exact part names read from
  `bootstrap describe --json`, which go stale after a renumber.
- **D3b** — shipped skills also drop bootstrap's task names and point to the
  mise skill, a large edit across about 20 entries.
- **D6** — only the generator, materializer and stackgen-plugin docs say it.
