# G10 — Docs

- **Wave:** 6
- **Depends on:** G5, G6, G7, G9
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`,
  `.claude/skills/plugin-authoring/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-01-*.md` (new files only)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`;
  `plugins/vwf/assets/memory.md`.

## Ruling

> G1–G10, quoted from index.md's Assumed decisions.

User, verbatim: *"the tools must be pre-installed via mise only … use
`mise x -- dprint ...`"*; *"`mise trust` is expected to be run before hand by
user … `mise run setup:all` is the best way to get the repo setup."*

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply its findings plus every
   `DOCS FALSIFIED:` line G1–G8 returned.
2. **The survey's list**: `readme.md:299`;
   `.claude/skills/stackgen-plugin/SKILL.md` (the verb list, rule 15 and
   `all add exclude`); `.claude/skills/plugin-authoring/references/checks.md`
   (the string grammar now refused for these tools, rule 15);
   `site/src/content/docs/plugins/stackgen.md` (gates, plugins, excludes,
   linter-ignore, hooks, grype ignores, the `all` sequence); `CLAUDE.md` and
   `.claude/docs/` passages on trust, `setup:all` and the hooks.
3. **Decision docs** (new files, per `memory.md`):
   `2026-10-01-mise-x-runs-pinned-tools.md` (G3, G8, the user's words),
   `2026-10-01-trust-is-the-users-setup-all-is-tool-configs.md` (G4 — supersedes
   init's §9 trust step and §10 offer), `2026-10-01-gate-tools-on-the-script.md`
   (G1, G2, G5, G6, G7).

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`; a falsified passage there is a `GAP:` line.
- Never edit an existing decision doc — add new ones.
- Keep code spans on one line; never end a table cell in a bare `*`.
- Delete with `rm`, never `git rm`.

## Commit

`docs: the gate tools run on the tool-config script — trust first, setup:all inside all`
