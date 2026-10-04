# U6 — Docs and the decisions doc

- **Wave:** 3
- **Depends on:** U2, U3, U4, U5
- **Owns:** `readme.md`, `CLAUDE.md`, `installer/CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-03-setup-ai-validates-vwf.md`
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`
  (standalone mode); `plugins/vwf/assets/memory.md` (decisions doc shape);
  `docs/memory/decisions/2026-09-12-setup-ai-is-project-scope-through-claude.md`
  (the doc this one supersedes).

## Ruling

> D1 — The task reads `claude plugin list --json`; when `vwf@virajp-plugins` is
> installed at **user or project** scope it does nothing more for vwf. When it
> is at neither, it runs `pnpx @virajp.dev/claude-plugins@latest --all` — the
> installer, which registers the marketplace and installs vwf (and stackgen) at
> **user** scope. It never installs at project scope, and it continues whether
> or not it installed.

> D2 — After the vwf check, always: `claude plugin marketplace update` (every
> registered marketplace), then `claude plugin update --scope <its scope> <id>`
> for every installed plugin, then
> `claude plugin autoremove --scope project --yes`, from `MISE_PROJECT_ROOT`.

> D8 — Graphify wiring (`graphify install --platform claude`) and the
> claude-status hint leave the task.

> D11 — The reversal is recorded as
> `docs/memory/decisions/2026-10-03-setup-ai-validates-vwf.md`, naming the
> 2026-09-12 doc it supersedes.

## Edits

1. Run `vwf:docs-sync` over the branch delta since the branch base (exclude
   `docs/plans/`) and apply its findings, plus every `DOCS FALSIFIED:` line the
   earlier units returned (the orchestrator appends them to this prompt).
2. Known falsified passages (2026-10-03 line numbers): `readme.md:129-134`;
   `CLAUDE.md:271-275` and `:384-390` (the "reconcile step is the repo's own"
   paragraph: setup:ai now checks for vwf, installs it at user scope only when
   absent, and upgrades every marketplace and plugin — it no longer installs at
   project scope); `installer/CLAUDE.md:14` and `:26-30`;
   `site/src/content/docs/plugins/vwf.md:38-43` and `:1136-1140`;
   `site/src/content/docs/plugins/stackgen.md:397-398`, and its task lists at
   `:1141`, `:1160` if they say "install";
   `site/src/content/docs/how-to/greenfield/single-repo.md:84-89`;
   `site/src/content/docs/installer/targets.md:71`. Any init question-number
   citation in `.claude/skills/**` or the site that moved.
3. Write the decisions doc (D11): the ruling (D1, D2, D5, D7), the user's
   verbatim words from index.md's Goal, what it reverses and why, the rejected
   alternatives, and that it supersedes the 2026-09-12 doc. Leave the 2026-09-12
   doc unedited — decisions docs are not edited after the fact; the new doc
   names the old.

## Verification

- `grep -rnE 'at \*\*project\*\* scope|installs or updates the plugins' readme.md CLAUDE.md installer/CLAUDE.md site/src/content/docs`
  prints nothing about setup:ai.
- `mise run p:site:check` green.
- `mise run code:precommit` green (dprint re-pads tables).
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/` or `docs/plans/`; a falsified passage there is
  a `GAP:` line.
- `CLAUDE.md`, `installer/CLAUDE.md`, `readme.md` are dprint-formatted —
  widening one table cell re-pads every row.
- Never end a table cell in a bare `*`; keep code spans on one line.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: setup:ai checks for vwf and installs at user scope only`
