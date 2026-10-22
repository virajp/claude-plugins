# U1 — The mise skill becomes a stackgen plugin skill

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/mise/**` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `plugins/stackgen/skills/tool-config/templates/.claude/skills/mise/SKILL.md`,
  and one other stackgen `SKILL.md` for the frontmatter shape.
- **Lazy-load:** `.claude/skills/plugin-authoring/SKILL.md` (invocation
  frontmatter)

## Ruling

> - Decision 3: Becomes `plugins/stackgen/skills/mise/SKILL.md`, a plugin skill
>   using bootstrap's task names; nothing is copied into a repo.
> - Decision 4: "replaced with `code/check/_default` which allows to run
>   `code:check`".
> - Decision 5: "moved as flag `--upgrade` to `setup` task".

## Edits

1. **`plugins/stackgen/skills/mise/SKILL.md`** — new, from the template:
   strict-YAML frontmatter (`name: mise`, a description that triggers on
   running, adding or changing a mise task, tool pin, env value or alias); no
   `@@` tags. Rewrite for bootstrap: discover tasks with `mise tasks` (never
   assume a name); bootstrap's names — `setup` (`--upgrade` upgrades), `code`,
   `code:format`, `code:lint`, `code:check`, `code:sec`, `setup:configs`; synced
   files are bootstrap's and are never edited by hand; repo-owned content goes
   where bootstrap's sync never writes (`conf.d/_repo/`, `_scripts/local`, task
   names no tool ships); a tool pin is added through bootstrap, never with a
   bare `mise use`. Name no bootstrap file path. Cite no plugin path.

## Verification

- `mise run p:plugins:check` — green.
- `grep -nE 'setup:all|code:all|tool-config|@@' plugins/stackgen/skills/mise/SKILL.md`
  — no hit.

## Guardrails

- Do not edit or delete anything under `plugins/stackgen/skills/tool-config/` —
  U3's.
- `plugins/**/*.md` is not formatted; fold at 80 by hand.

## Commit

`feat: stackgen ships the mise skill`
