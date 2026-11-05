# Read the registry, then import

## §1 — Read the registry

Read `docs/blueprint/registry.yaml`. If it does not exist, take H1.

The screen platforms are `site`, `webapp`, `desktop`, `mobile`, `tablet`, `auto`,
`watch`, `tv` and `spatial`. If no project declares one, take the
[text-only path](text-only.md).

**Format check.** Run the preflight in
`${CLAUDE_PLUGIN_ROOT}/assets/format-check.md`. If the repo's blueprint format is
behind what vwf ships, nudge `/vwf:setup`. Proceed unless a needed artifact is
missing.

**Terminal surfaces.** Read `platforms:` in `docs/blueprint/registry.yaml`. Any
project that declares `cli` makes the doc's **Terminal UX** section required, per
the terminal-ux reference of `design-system-authoring`. Always elicit it in text,
at §5. The design tool neither designs nor imports it.

## §2 — Recall

Per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, read prior design decisions and
rationale from `docs/memory/decisions/`. Read parked visual and UX points from
`docs/memory/gaps/`, the records whose slug ends in `-parked`. Skip silently if
a folder is absent.

## §3 — Preflight the design adapter

vwf does not talk to any design tool. Per
`${CLAUDE_PLUGIN_ROOT}/assets/design-adapter.md`, the tool is a per-project key,
`projects.<name>.design` in `.config/vwf.yaml`, resolved inside the adapter and
not here.

1. Name the project you are importing for. Read the `design` value of every
   project that declares a screen platform.
2. If they all agree, use that project and say which.
3. If they disagree, ask which project's tool authors the product's one design
   system. That is a product decision, so do not pick silently.
4. Confirm that the repo's own `design-import-design-system` skill exists, before
   you delegate. The project's `design:` pin, `projects.<name>.design`,
   materializes it.

Take H2, H3 or H4 on those failures. Absence of the skill is the one failure
that otherwise reads as an empty design.

The preflight exists because the failure is silent. An adapter skill set to
`disable-model-invocation: true` cannot be invoked programmatically and does not
error. So a call and a look at the result cannot tell "missing adapter" from
"empty design system".

## §4 — Delegate the import

Invoke `/vwf:import-design-system`, the design adapter. Parse its reply as a
design-system payload, per the adapter contract. Everything downstream is vwf's job: you write
`docs/blueprint/design-system.md` from the payload, gated by the
`design-system-reviewer`. The adapter never touches a blueprint doc.

**Record `source.derived`.** When the adapter reports `derived: true`, it
reconstructed the tokens from generated code rather than reading a stored design
system. Note that in the doc. A stored system is authoritative until someone
changes it. A derived one is a snapshot of one generation, and can drift the next
time a screen is regenerated.

If the payload carries a tool-side identifier, pin it under `design:` for the
next run, per the vwf-config asset. The pin is adapter-scoped, because every tool
identifies its design system differently.
