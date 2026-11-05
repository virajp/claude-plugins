# Resolve the tool, and delegate

## §1 — Read the inputs

vwf names one registry project per call. It passes the canvas pins that it holds
for that project from `.config/vwf.yaml`:

- The per-platform `design.projects.<project>.*` uuids.
- `design.design_system_id`, when the call is for the product's design system
  rather than a project's screens.

With no pin for a surface, report it in `notes`. Do not search the tool for
something that looks close.

One project per call: vwf iterates, and you never harvest "the product". Since
`config_format` 13 the tool is per project, so a product can design its website
in one tool and its app in another. A call that spanned projects has to resolve
two tools at once, and can get only one of them right.

## §2 — Resolve the project's design tool

Read `projects.<project>.design` in `.config/vwf.yaml`. That is the only key,
and no product-wide fallback exists.

Do not read `design.tool`, the pre-`13` key. A config that still carries it is
drift for the `12 → 13` migration of `/vwf:setup` to copy down. Reading it here
makes that migration optional, and leaves two answers to one question in the
config.

If the key is absent, take H1.

## §3 — Invoke the repo's own adapter, at a fixed name

Invoke `design-import-conversations`, and pass the inputs of §1.

Do not look for a per-tool reference inside this plugin. None exists, by design.
vwf names no design tool. The project's stack materializes the resolved tool's
adapter into the repo's own `.claude/skills/`, under a fixed name.

The name is fixed, and is never built from the config value.

If no such skill exists in the repo, take H2. If the repo's adapter returns an
empty result, take H3.
