# U6 — docs

- **Wave:** 3
- **Depends on:** U1–U5
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/**` except
  `.claude/skills/plugin-authoring/references/checks.md`,
  `site/src/content/docs/**`
- **Model:** opus
- **Read first:** every `DOCS FALSIFIED:` line U1–U5 returned; the survey list
  below; then each owned file you will edit, top to bottom.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (the
  procedure); `site/CLAUDE.md` (the link rule and the gate);
  `plugins/stackgen/stacks/inventory.md` (counts — copy, never type);
  `plugins/vwf/assets/design-adapter.md` (U1's brand block — quote its field
  names).

## Ruling

Quoted from `index.md`:

> **1 — Slug and default.** The pack's slug is `claude-code`. … vwf's
> architecture menu **preselects whichever entry carries it**, as a generic rule
> that names no tool.

> **2 — taste-skill.** `taste-skill@taste-skill` is a **declared requirement** …
> added at init's question 5, so the repo's `setup:ai` installs it at project
> scope …

> **3 — Canvas.** The tool's source of truth is `docs/design/<project>/`,
> **committed** …

> **4 — Logo in the contract.** The design-system payload gains an **optional
> `brand:` block** … and the design-system template an optional **Brand**
> section …

No reversal was confirmed in the interview, so this unit writes **no**
`docs/memory/decisions/` doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings.
2. Apply every `DOCS FALSIFIED:` line U1–U5 returned — including U4's line about
   `CLAUDE.md`'s rule count.
3. The survey's own list, checked whether or not docs-sync names them:
   - **`CLAUDE.md`** — the rule count in the Tasks section ("thirteen rules" and
     "Rule 13 is the newest") if U4 added a rule; the stackgen row only if it
     enumerates packs.
   - **`.claude/skills/stackgen-plugin/SKILL.md`** and `references/` — the
     design-tool pack list (four), the bundle `default:` key, the file-canvas
     variant.
   - **`.claude/skills/vwf-plugin/SKILL.md`** and `references/` — the design
     axis and adapter passages: the menu preselect rule, the Brand section;
     tool-neutral wording (this tree is not vwf prose, but keep the habit).
   - **`.claude/docs/plugins.md`** — the pack inventory.
   - **`site/src/content/docs/plugins/vwf.md`** — `/vwf:design-system` (the
     Brand section), `/vwf:architecture`'s design menu (the preselected
     default), the design axis values; the site may name the tool.
   - **`site/src/content/docs/plugins/stackgen.md`** — the design-tool pack
     list, the `claude-code` entry with its canvas, its required plugin and
     `/design-session`; the bundle `default:` key.
   - **`site/src/content/docs/how-to/**`** — any how-to that walks the design
     axis choice or the design-system import.
   - **`readme.md`** — the plugin inventory; one sentence on the terminal as a
     design tool.
4. Edit only what the change falsified. Do not improve adjacent prose.

## Verification

- `mise run p:site:check` green.
- `mise run p:plugins:check` green (rule 12 scans `.md` repo-wide).
- `command grep -rln 'claude-code' .claude/skills/stackgen-plugin/SKILL.md site/src/content/docs/plugins/stackgen.md`
  lists both.
- `command grep -n 'thirteen' CLAUDE.md` is empty if U4 added a fourteenth rule.

## Guardrails

- Do not touch `plugins/**` — landed by U1–U5.
- Do not touch `.claude/skills/plugin-authoring/references/checks.md` — U4's.
- Do not touch `docs/backlog.md` — B11 moves when H2 is planned.
- Do not touch version files or `.claude-plugin/marketplace.json` — U7's.
- Delete with `rm`, never `git rm`.
- `readme.md`, `CLAUDE.md`, `.claude/**/*.md` and the site docs **are**
  dprint-formatted: let the formatter re-pad tables.
- Never end a table cell in a bare asterisk.

## Commit

`docs: terminal design tool — the pack, the default, the brand block` — written
by the orchestrator after the wave gate, not by the unit. Type `docs` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
