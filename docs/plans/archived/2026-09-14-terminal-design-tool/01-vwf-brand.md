# U1 — the `brand:` block in vwf's design-system contract

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/design-adapter.md`,
  `plugins/vwf/assets/templates/design-system.md`,
  `plugins/vwf/skills/design-system/SKILL.md`,
  `plugins/vwf/skills/design-system-authoring/SKILL.md`,
  `plugins/vwf/skills/design-system-authoring/references/brand.md` (new),
  `plugins/vwf/agents/design-system-reviewer.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:**
  `plugins/vwf/skills/design-system-authoring/references/terminal-ux.md` (the
  shape of an optional, conditionally-required section — mirror it);
  `plugins/vwf/skills/import-design-system/SKILL.md:96-105` (the return contract
  the payload flows through — read, do not edit);
  `.claude/skills/plugin-authoring/references/checks.md:106`, `:213` (rule 10:
  no technology or tool token in vwf prose).

## Ruling

Quoted from `index.md`:

> **4 — Logo in the contract.** The design-system payload gains an **optional
> `brand:` block** — logo source path, mark and wordmark variants, clear space,
> minimum size, mono and dark rules — and the design-system template an optional
> **Brand** section; `/vwf:design-system` §5 imports it when the payload carries
> it and elicits nothing for it otherwise. Other tools return no block. Optional
> means **no `blueprint_format` bump**.

## Edits

1. **`plugins/vwf/assets/design-adapter.md`** — in the design-system payload
   (`:141-186` today), add an optional `brand:` block after the existing fields,
   documented the way the others are: `logo:` (a repo-relative path to the
   source file, SVG expected), `variants:` (a list of `{ name, path, use }` —
   mark, wordmark, lockup, mono, dark, or whatever the tool returns),
   `clear_space:` (a rule in the logo's own units), `min_size:` (per variant
   where the tool states one), `rules:` (free lines — what never happens to the
   mark). State that the block is optional, that a tool with no brand concept
   omits it entirely rather than returning nulls, and that every path is
   relative to the repo root. Do not name any tool.
2. **`plugins/vwf/assets/templates/design-system.md`** — add a **Brand** section
   between Component Behaviors and Terminal UX, with an HTML comment in Terminal
   UX's style: required when the imported payload carries `brand:`; delete
   otherwise. Fields: the logo source, the variants table (name, path, use),
   clear space, minimum sizes, the rules. No format-stamp change anywhere.
3. **`plugins/vwf/skills/design-system/SKILL.md`** — in §5 distill (`:143-161`),
   one paragraph: when the payload carries `brand:`, write the Brand section
   from it verbatim in meaning, paths kept relative; when it does not, delete
   the section and elicit nothing — brand is never text-elicited. Touch §3 and
   §4 only if a sentence there enumerates the payload's blocks.
4. **`plugins/vwf/skills/design-system-authoring/references/brand.md`** (new) —
   the authoring bar for the Brand section: what a complete one states (source,
   at least one variant, clear space, a minimum size, a mono or dark rule), what
   is a realization and stays out (file formats per platform, favicon sets, app
   icons — those derive from the source elsewhere), and the code-independence
   line the sibling references hold. Add its row to the skill's reference table
   in `design-system-authoring/SKILL.md`.
5. **`plugins/vwf/agents/design-system-reviewer.md`** — the completeness
   checklist gains the Brand section as **conditional**: present and complete
   when the doc's source payload carried `brand:` (the doc's frontmatter or the
   section's own comment says which), absent otherwise; never a gap for a doc
   whose source had no brand.

## Verification

- `mise run p:plugins:check` green — rules 4, 6 (any `${CLAUDE_PLUGIN_ROOT}`
  reference resolves), 10, 12.
- `command grep -rn -i 'claude-code\|taste\|logo tool\|figma\|stitch\|lovable' plugins/vwf/assets/design-adapter.md plugins/vwf/assets/templates/design-system.md plugins/vwf/skills/design-system plugins/vwf/skills/design-system-authoring plugins/vwf/agents/design-system-reviewer.md`
  is empty beyond hits that already existed before this unit (check with
  `git diff`).
- `command grep -n 'brand' plugins/vwf/assets/design-adapter.md` shows the block
  and the word "optional" on the same or the following line.
- `command grep -n -i 'blueprint_format' $(git diff --name-only)` is empty — no
  stamp moved.

## Guardrails

- Do not touch `plugins/vwf/assets/stack-adapter.md` or
  `plugins/vwf/skills/architecture/**` — U2's, running concurrently.
- Do not touch `plugins/vwf/skills/import-*/**`, `screens/**`, `mockups/**` or
  `agents/mockup-generator.md`.
- Do not touch `plugins/stackgen/**` or `scripts/**`.
- Do not name a design tool, a plugin, or a technology anywhere in vwf prose.
- Do not bump `blueprint_format` or `config_format`.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match each file's fold width by
  hand. Strict-YAML frontmatter on `SKILL.md` and the agent file.
- Never end a table cell in a bare asterisk.

## Commit

`feat: vwf — an optional brand block in the design-system contract` — written by
the orchestrator after the wave gate, not by the unit. Type `feat` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
