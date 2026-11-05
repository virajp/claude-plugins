# Reconcile, then land

## §8 — Reconcile and persist

**Impact analysis, on a re-import.** When the import renamed or removed a token
or a component behavior, grep `docs/blueprint/` for the old name. Search the flow
docs' Screens sections and References. Report every orphan, and offer to fix them
through `/vwf:blueprint`. Never edit a flow doc from here.

**Cross-cutting conventions.** A theming or dark-mode strategy, or an i18n or RTL
decision, graduates to `conventions.md`. Pure token, scale or behavior values
never do.

**Architecture reconcile.** Route a product-shape change surfaced here, such as a
new UI project, through `/vwf:architecture`. Never edit the registry by hand.

**Persist.** Write each durable decision and its rationale as one
`docs/memory/decisions/` file, per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`. Skip
what the doc captures verbatim.

## §9 — Approval gate, pin and commit

1. Summarize what was imported or changed, and wait for explicit approval.
2. Pin `design.design_system_id` in `.config/vwf.yaml`, confirmed and never
   silently.
3. Hand all git actions to `/vwf:git-workflow`. The pin rides the same commit.
   Use a bare `docs:` message whose subject names the design system.
