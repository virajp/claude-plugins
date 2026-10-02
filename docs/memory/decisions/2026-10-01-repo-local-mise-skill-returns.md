# Decision — tool-config lands a repo-local mise skill again

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-mise` · **Plan**
[`docs/plans/2026-10-01-tool-config-script-mise/`](../../plans/2026-10-01-tool-config-script-mise/index.md)
· **Supersedes** [`2026-09-26-tool-config.md`](./2026-09-26-tool-config.md) on
"no mise skill", and the retired-toolchain-pack migration in tool-config's
`references/mise.md` that deleted the repo-local mise skill

## What was decided before

When the toolchain pack retired into `stackgen:tool-config` on 2026-09-26, no
mise skill was landed in a target repo any more, and the migration deleted the
one the pack had copied.

## What changed

- **R4 / D11 — the skill is back.** `all` lands `.claude/skills/mise/SKILL.md`:
  a static template — run tasks with `mise run`, discover them with
  `mise tasks`, work under `MISE_ENV=dev`, where each config file lives, edit
  only lines outside every block, never a bare `mise use` — plus a task table
  between comment anchors that the script regenerates on every `all` and every
  pack change. Agents run the repo's tasks through it.
- **Checker.** Rule 11 lets mise's asset tree land exactly that file under
  `.claude/` (`TOOL_CONFIG_LANDED_SKILLS`) and nothing else; rule 4 parses its
  frontmatter like any shipped skill.

## The alternatives rejected

- **Static only** — the task list differs per repo, and a stale table sends an
  agent to a task that is not there.
- **Written by the model per repo** — the opposite of the script being the
  source of truth.
