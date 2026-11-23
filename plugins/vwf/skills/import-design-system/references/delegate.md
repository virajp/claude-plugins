# Resolve the tool, and delegate

## §1 — Read the inputs

vwf names the registry project whose design system is being imported. It passes
the pinned design-system id from `.config/vwf.yaml`, the key
`design.design_system_id`, when one exists.

With no pinned id, list what the tool can reach, and ask the user to choose.
Never guess.

## §2 — Resolve the project's design tool

The tool is per project, not per product. A product can author its website's
visual language with one tool and its app's with another. So resolve against the
registry project that vwf named, and never against "the product".

Read `projects.<project>.design` in `.config/vwf.yaml`. That is the only key,
and no product-wide fallback exists.

Do not read `design.tool`, the pre-`13` key. A config that still carries it is
drift for the `12 → 13` migration of `/vwf:setup` to copy down. Reading it here
makes that migration optional, and leaves two answers to one question in the
config.

If the key is absent, take H1.

## §3 — Invoke the vwf-tools role skill, with the project

Invoke `vwf-tools:design-import-design-system`. Pass the registry project name
as the first argument, then the inputs of §1.

Do not look for a per-tool reference inside this plugin. None exists, by design.
vwf names no design tool. `/vwf:setup` installs the resolved tool's reference
into the machine's local plugin `vwf-tools`, at
`~/.claude/plugins/local/vwf-tools/`, under the role skill
`design-import-design-system`, which reads that project's tool itself.

Do not look in the repo's `.claude/skills/`. A copy of
`design-import-design-system` left there by an older setup is not read.

The name is fixed, and is never built from the config value.

If `vwf-tools` has no `design-import-design-system` skill, or the call stops
because the tool's reference is absent, take H2. If the role skill returns an
empty result, take H3.
