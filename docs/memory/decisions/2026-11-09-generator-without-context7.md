DECISION 2026-11-09 ★4 | plugins:stackgen | the stackgen generator works
without Context7: Context7 first when Context7 is installed, else WebFetch
of the official documentation, WebSearch and the package registries; it never
halts on or asks for Context7; the pack hints add "when Context7 is
installed; else the official documentation" | reverses D9 and D16 of
2026-11-02-optional-tools-in-vwf-tools and the interim D2 of
2026-11-09-retire-plugin-mcp-servers | alts rejected below

# Decision — The stackgen generator works without Context7

**Date** 2026-11-09 · **Plan**
`docs/plans/2026-11-09-generator-without-context7` · **Backlog** B124

## Why

Once the user owns every MCP server
([2026-11-09-mcp-servers-owned-by-user](2026-11-09-mcp-servers-owned-by-user.md)),
a generator that stops until the user installs Context7 makes an optional tool
a hard dependency. The official documentation and the package registries are
reachable without any MCP server, and every fact keeps its citation either way.

## Decisions

- **D1. The generator works without Context7.** It never halts on it and never
  asks the user to install it.
- **D2. The order of the research sources.** Context7 first when Context7 is
  installed. Without it: `WebFetch` of the official documentation, `WebSearch`
  to find the right page, and the package registries for names and versions.
  Every fact keeps its citation (URL and fetch date), as before. The thin rule
  applies to the run's primary source; the registries are always read. With no
  Context7 and no `WebFetch` there is no research source, and the generator
  halts before writing anything, naming no install step.
- **D3. The passive pack hints.** Each Context7 hint keeps the Context7 name and
  adds "when Context7 is installed; else the official documentation".
  Provenance citations of the form "Context7 `/<library>`, read `<date>`" stay
  unchanged. Each pack edited takes a patch bump.

## Reversals

The old records are not edited; each reversed decision is listed here.

- **D9 of 2026-11-02-optional-tools-in-vwf-tools** (the generator halts when no
  Context7 server is reachable) — reversed: no halt on Context7.
- **D16 of 2026-11-02-optional-tools-in-vwf-tools** (the hints stay, the sweep
  is parked) — reversed: the hints are swept under D3.
- **Interim D2 of plan 2026-11-09-retire-plugin-mcp-servers** (the generator
  asks the user to install Context7 and waits) — reversed: it asks for nothing.

## Rejected

- Keep Context7 required and only ask the user; drop this plan.
- The live page or the registry decides every fact, Context7 a first look only.
- Reword the hints with no tool named; delete the hints.

## Parked

- `execute-coder` has no web tools, so a hint's "else the official
  documentation" is out of its reach —
  [2026-11-09-execute-coder-no-web-tools](../gaps/2026-11-09-execute-coder-no-web-tools.md).
