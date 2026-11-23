# Lovable — conventions

Prompt-to-app rather than a canvas: what comes back is generated application
code, and the import reads structure out of it.

**Read the honest caveat in the screens skill before trusting a payload.** The
mapping from generated code to a screen contract is lossier than a canvas's,
and the skill says exactly where.

**Conversations are real here**, but through a specific surface — the skill
records why `list_edits` is *not* substituted for it, which is the kind of
judgment a per-tool reference exists to carry.

The three import skills are generic, at **fixed names** in `vwf-tools` —
`design-import-screens`, `design-import-design-system` and
`design-import-conversations`. This entry's `references/<role>.md` lands
beside each as `skills/<role>/references/lovable.md`, and the role skill reads
it when the project's `design` value is `lovable`. vwf invokes those names; it
never constructs one from configuration, and it never learns which tool
answered.

## MCP servers

- `lovable` — reads the Lovable workspace, projects and generated source for
  the screens and design-system imports; install:
  https://docs.lovable.dev/integrations/lovable-mcp-server
