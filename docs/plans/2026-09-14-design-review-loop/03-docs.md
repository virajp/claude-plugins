# U3 — docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`
- **Model:** opus
- **Read first:** every `DOCS FALSIFIED:` line U1 and U2 returned; the survey
  list below; then each owned file you will edit, top to bottom.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (the
  procedure); `site/CLAUDE.md` (the link rule and the gate);
  `plugins/stackgen/stacks/design-tool/claude-code/conventions.md` (U2's output
  — copy the layout and the loop from here).

## Ruling

Quoted from `index.md`:

> **3 — Canvas layout.** Screens at
> `docs/design/<project>/screens/<flow>--<platform>/<CODE>.html` plus a stitched
> `index--<platform>.html` … Comments **committed** at
> `docs/design/<project>/comments/<flow>--<platform>.yaml` …

> **5 — Session modes.** `design-session` gains `screens <flow>` … and
> `review <flow>` … The adapters read the canvas …

> **7 — Security.** Loopback only, no auth, no TLS — a review server for one
> person on one machine.

No reversal was confirmed in the interview, so this unit writes **no**
`docs/memory/decisions/` doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings.
2. Apply every `DOCS FALSIFIED:` line U1 and U2 returned.
3. The survey's own list, checked whether or not docs-sync names them:
   - **`.claude/skills/stackgen-plugin/SKILL.md`** and `references/` — the
     `claude-code` entry: screens and review now, the server, the loopback rule;
     the pack version.
   - **`site/src/content/docs/plugins/stackgen.md`** — the same entry for users:
     the two new `design-session` modes, the canvas layout, the review loop in
     four lines, that comments are committed.
   - **`site/src/content/docs/plugins/vwf.md`** — only where H1 wrote that the
     terminal tool's screens or conversations adapters return nothing yet.
   - **`site/src/content/docs/how-to/**`** — a how-to that walks a design round,
     if one exists; otherwise nothing new.
   - **`readme.md`** — one sentence, if the terminal tool is mentioned.
   - **`CLAUDE.md`** — only if it enumerates the pack's skills; otherwise
     untouched.
4. Edit only what the change falsified. Do not improve adjacent prose.

## Verification

- `mise run p:site:check` green.
- `mise run p:plugins:check` green (rule 12 scans `.md` repo-wide).
- `command grep -rn -i 'later plan\|not yet' site/src/content/docs/plugins/stackgen.md`
  shows no hit about the terminal tool's screens or review.

## Guardrails

- Do not touch `plugins/**` — landed by U1 and U2.
- Do not touch `docs/backlog.md` — the backlog skill owns it; the archive step
  moves B11.
- Do not touch version files or `.claude-plugin/marketplace.json` — U4's.
- Delete with `rm`, never `git rm`.
- `readme.md`, `CLAUDE.md`, `.claude/**/*.md` and the site docs **are**
  dprint-formatted: let the formatter re-pad tables.
- Never end a table cell in a bare asterisk.

## Commit

`docs: design review loop — screens, the review server, the comment round` —
written by the orchestrator after the wave gate, not by the unit. Type `docs` is
in `.config/git-conventional-commits.yaml`; the file lists no scopes.
