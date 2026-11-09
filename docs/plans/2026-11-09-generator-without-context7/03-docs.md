# U3 — Docs

- **Read first:** the facts section of `index.md` (its "Docs" list), then each
  owned doc at those lines, as plan 1 left them.
- **Lazy-load:** `plugins/vwf/skills/docs-sync/SKILL.md`,
  `plugins/vwf/assets/memory.md` (the decision record format).

## Ruling

> D1: The generator works without Context7. It never halts on it and never asks
> the user to install it. This reverses D9 of
> docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md and the
> interim D2 of plan 2026-11-09-retire-plugin-mcp-servers.

> D8: Before it returns, each edit unit runs
> mise x -- mise run code:format -- --fix <each file it changed>, on its own
> changed files only.

## Edits

1. Run `/vwf:docs-sync` over the branch delta. Apply its findings, every
   `DOCS FALSIFIED:` line U1 and U2 returned, and the list below.
2. **`CLAUDE.md`** — the stackgen row: the generator researches with Context7
   first when installed, else the official documentation; no halt.
3. **`readme.md`** — `:292-294` the same; keep the Context7 credit.
4. **`.claude/skills/stackgen-plugin/SKILL.md`** — `:31,71,91-94` (the
   "context7 halt" section goes).
5. **`site/src/content/docs/plugins/stackgen.md`** — `:214-230,947-950,984,1009-1012`.
6. **`docs/memory/decisions/2026-11-09-generator-without-context7.md`** — new
   record: D1, D2, D3, the reversals of D9 and D16 of the 2026-11-02 record and
   of plan 1's interim D2, the rejected alternatives, source plan
   `2026-11-09-generator-without-context7`, B124.

## Verification

- `mise x -- mise run p:site:check` exits 0.
- The K1 search of `index.json` finds no hit in the owned docs that says the
  generator halts on or requires Context7.

## Guardrails

- Do not edit `docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md`
  or plan 1's decision record.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted; format per
  D8.

## Commit

`docs: the generator researches without context7`

> D10 (gaps 6 to 8): U3 also edits .claude/skills/vwf-plugin/references/dependencies.md
> (93-101), site/src/content/docs/plugins/vwf.md (4059),
> site/src/content/docs/how-to/operate/choosing-your-stack.md (202-203) and
> .claude/skills/stackgen-plugin/SKILL.md (301, the passive hint, per D3 of
> this plan: add "when Context7 is installed").

> D14 (gaps 10 and 12): U3 also edits .claude/docs/plugins.md (13),
> .claude/skills/vwf-plugin/SKILL.md (22), .claude/agents/target-verifier.md
> (114), the CLAUDE.md line that says the generator needs Context7 until plan 2,
> and site/src/content/docs/plugins/stackgen.md (358, the passive hint, per D3).
