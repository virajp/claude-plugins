# U2 — vwf preselects the menu entry that carries `default: true`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/stack-adapter.md`,
  `plugins/vwf/skills/architecture/references/stack-menu.md`,
  `plugins/vwf/skills/architecture/SKILL.md` (only where it restates the menu
  rule)
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:51-73`
  (the menu payload as emitted today — read for the key names, do not edit; U3
  adds the flag there concurrently); `plugins/vwf/skills/init/SKILL.md:346-352`
  (init reads the same payload filtered to capability-provider entries — read to
  confirm a default on the design axis does not reach it).

## Ruling

Quoted from `index.md`:

> **1 — Slug and default.** The pack's slug is `claude-code`. A bundle's
> frontmatter may carry `default: true`; the stackgen menu payload passes it
> through on that entry; vwf's architecture menu **preselects whichever entry
> carries it**, as a generic rule that names no tool. No config-format bump.

This unit writes the vwf half only — the generic rule. It never writes the slug.

## Edits

1. **`plugins/vwf/assets/stack-adapter.md`** — in the delegation protocol where
   the menu payload's shape is specified (`:110-119` and the payload block near
   `:183-200` and `:248-262` today), add an optional `default: true` on a
   `templates:` entry: at most one per axis; vwf preselects it; an adapter that
   emits none leaves the menu with no preselection, exactly as today. State that
   the flag is the adapter's to set and vwf never infers one.
2. **`plugins/vwf/skills/architecture/references/stack-menu.md`** — in the
   per-axis elicitation (`:46-56` and `:85-105` today): the preselected option
   is the entry carrying `default: true` when one exists, else the previous
   project's answer per the existing rule, else none. The user still picks; the
   default is what is highlighted, never what is assumed. Keep the menu closed
   as it is (`:91-95`).
3. **`plugins/vwf/skills/architecture/SKILL.md`** — only where step 3b
   (`:238-239`, `:347`) restates the menu rule; otherwise touch nothing and say
   so in `DECIDED:`.

## Verification

- `mise run p:plugins:check` green — rules 4, 6, 10, 12.
- `command grep -n 'default' plugins/vwf/assets/stack-adapter.md plugins/vwf/skills/architecture/references/stack-menu.md`
  shows the flag documented in both, in the payload block and in the elicitation
  rule.
- `command grep -rn -i 'claude-code\|taste' plugins/vwf/assets/stack-adapter.md plugins/vwf/skills/architecture`
  is empty.
- `command grep -n -i 'config_format' $(git diff --name-only)` is empty — no
  stamp moved.

## Guardrails

- Do not touch `plugins/vwf/assets/design-adapter.md`, `assets/templates/**`,
  `skills/design-system/**`, `skills/design-system-authoring/**` or
  `agents/design-system-reviewer.md` — U1's, running concurrently.
- Do not touch `plugins/stackgen/**` — U3 adds the flag to the emitter.
- Do not touch `plugins/vwf/skills/init/**` — init filters to
  capability-provider entries and the flag is axis-scoped.
- Do not name a tool or a slug.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match each file's fold width by
  hand. Strict-YAML frontmatter on `SKILL.md`.
- Never end a table cell in a bare asterisk.

## Commit

`feat: vwf — the architecture menu preselects an adapter-marked default` —
written by the orchestrator after the wave gate, not by the unit. Type `feat` is
in `.config/git-conventional-commits.yaml`; the file lists no scopes.
