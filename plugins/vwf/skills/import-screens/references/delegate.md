# Resolve the tool, and delegate

## §1 — Read the inputs

`$ARGUMENTS` is `<flow> <platform>`. The flow is the flow folder name,
`<NNN>-<flow-slug>`. The platform is one of `mobile`, `tablet`, `desktop`,
`auto`, `watch`, `tv`, `spatial`, `site` or `webapp`.

vwf also passes the registry project that the flow belongs to, plus the canvas
pins that the tool needs. It passes the per-project, per-platform canvas pin of
the `design:` block through without interpreting it. Which pins matter is the
adapter's business, not vwf's.

In place of the raw `design.viewports` value, vwf passes the platform's resolved
frames, per the Layout block of the conventions template:

- The OS list in order, the primary first. It comes from the `design.viewports`
  list, else `projects.<project>.stack.os.<platform>`, else it is empty.
- Each OS with its size.
- When the list is empty, the one generic frame and its size.

Read the primary frame. The other values of a `device` tweak are never extra
screens.

## §2 — Resolve the project's design tool

The tool is per project, not per product. One product can design its website
with one tool and its mobile app with another. So resolve against the registry
project that vwf named, and never against "the product".

Read `projects.<project>.design` in `.config/vwf.yaml`. That is the only key,
and no product-wide fallback exists.

Do not read `design.tool`, the pre-`13` key. A config that still carries it is
drift for the `12 → 13` migration of `/vwf:setup` to copy down. Reading it here
makes that migration optional, and leaves two answers to one question in the
config.

If the key is absent, take H1.

## §3 — Invoke the vwf-tools role skill, with the project

Invoke `vwf-tools:design-import-screens`. Pass the registry project name as the
first argument, then the inputs of §1.

Do not look for a per-tool reference inside this plugin. None exists, by design.
vwf names no design tool. `/vwf:setup` installs the resolved tool's reference
into the machine's local plugin `vwf-tools`, at
`~/.claude/plugins/local/vwf-tools/`, under the role skill
`design-import-screens`, which reads that project's tool itself.

Do not look in the repo's `.claude/skills/`. A copy of `design-import-screens`
left there by an older setup is not read.

The name is fixed, and is never built from the config value.

If `vwf-tools` has no `design-import-screens` skill, or the call stops because
the tool's reference is absent, take H2. If the role skill returns an empty
result, take H3.
