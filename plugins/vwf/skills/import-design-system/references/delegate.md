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

## §3 — Invoke the repo's own adapter, at a fixed name

Invoke `design-import-design-system`, and pass the inputs of §1.

Do not look for a per-tool reference inside this plugin. None exists, by design.
vwf names no design tool. The project's stack materializes the resolved tool's
adapter into the repo's own `.claude/skills/`, under a fixed name.

The name is fixed, and is never built from the config value.

If no such skill exists in the repo, take H2. If the repo's adapter returns an
empty result, take H3.
