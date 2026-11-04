# U6 — Docs

- **Read first:** `.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`
  (or the installed vwf's copy), then `git diff --stat <branch base>..HEAD`.
- **Lazy-load:** each doc a finding names.

## Ruling

The whole decisions list of `index.json` is this unit's input, R1 and R2 of
`index.md`'s Goal among it. The two reversals land here as one decision
record, `docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md`, per
`plugins/vwf/assets/memory.md`.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings,
   every `DOCS FALSIFIED:` line U1 to U5 returned, and the docs list in
   `index.md`'s *Facts the survey established* (the Context7 docs list, the
   `stackgen-lsp` hits in `readme.md:295`,
   `site/src/content/docs/plugins/stackgen.md:602` and
   `.claude/skills/stackgen-plugin/SKILL.md:214`, the notion and taste-skill
   prose).
2. In particular: `.claude/agents/target-verifier.md:113` no longer expects a
   Context7 server from vwf; `.claude/skills/vwf-plugin/SKILL.md:21,54` and
   `references/dependencies.md:77-91` say vwf declares no MCP server and
   Context7 is a stackgen `addon` pack;
   `.claude/skills/stackgen-plugin/SKILL.md`
   names `vwf-tools`, the `addon` axis, the retired `mcp_servers:` key and the
   generator's context7 halt; `CLAUDE.md`'s vwf row says vwf ships no MCP
   server, and its stackgen row names the `addon` axis; the site's
   `plugins/vwf.md` "MCP servers / Context7" section (`:4262-4296`) becomes a
   short pointer to the stackgen addon pack; `plugins/vwf.md:59`'s node and
   pnpm row says they are needed for the context7 tool when picked;
   `installer/usage.md:123` loses the dead-context7 symptom or says it
   applies only when the tool is picked; `plugins/stackgen/stacks/readme.md`
   lists the `addon/` type and moves notion there.
3. Write the decision record: R1 and R2, and every decision of `index.json` in a
   few lines each, and
   what the user must do on this machine — add `addons: [context7]` to this
   repo's `.config/vwf.yaml` by hand, and let stackgen migrate
   `stackgen-lsp`.

## Verification

- Every wave-gate line — green.
- `grep -rn 'stackgen-lsp' readme.md CLAUDE.md .claude site/src/content/docs
  plugins`
  prints only migration passages.
- `grep -rnE 'declares one (MCP )?server|one MCP server' readme.md CLAUDE.md
  .claude site/src/content/docs`
  prints nothing that says vwf declares Context7.

## Guardrails

- Touch no file under `plugins/` other than `plugins/stackgen/stacks/readme.md`;
  a falsified passage in a plugin file is a `GAP:` line, not an edit.
- `CLAUDE.md`, `readme.md` and the site docs are dprint-formatted — never end
  a table cell in a bare asterisk; keep each code span on one line.
- Do not edit `docs/plans/archived/**` or older `docs/memory/**` records.

## Commit

`docs: optional tools in vwf-tools — manual, readme and decision record`
