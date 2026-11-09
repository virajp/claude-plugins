---
name: design-system
description: >-
  Imports the product's design system from the configured design tool into
  docs/blueprint/design-system.md, and pins design.design_system_id in
  .config/vwf.yaml. Use as /vwf:design-system once the product has a UI surface;
  a product with no screen surface takes the text-only path. Not for authoring
  visual language (use the design tool).
argument-hint: "[design-system id — omit to let the adapter resolve it]"
model: sonnet

user-invocable: true
disable-model-invocation: false
metadata:
  archetype: workflow
  depends-on: [import-design-system, design-system-authoring, git-workflow, blueprint, architecture]
---

# design-system

Resolves the design system, imports it into `docs/blueprint/design-system.md`,
and pins `design.design_system_id` in `.config/vwf.yaml`. A vwf foundation,
mandatory once the product has a UI surface.

The doc is the product-wide UX and visual contract that every blueprint screen
references. A product with no screen surface at all takes the text-only path,
and elicits Terminal UX directly.

**The design tool owns design-system authoring.** The user picks or builds the
design system there, and iterates there. Which tool answers (`claude-code`,
`lovable`, `stitch`, …) is the product's choice. vwf knows only the payload
shape, per `${CLAUDE_PLUGIN_ROOT}/assets/design-adapter.md`.

**The repo doc is the offline contract.** The design-system reviewer bar, the
execute ux gate and the coder consume it without network or claude.ai auth. It is
git-versioned and greppable. It records the decisions: semantic token values,
type and spacing scales, motion principles, the accessibility standard, and
global component behaviors. The component library, the CSS framework and
design-file mechanics stay out; those are `plan`'s.

Doctrine: the `design-system-authoring` skill (foundations, color-tokens,
typography, layout-and-spacing, motion, accessibility,
components-and-anti-patterns, brand, terminal-ux, checklist).

## State

| File                                                      | Access                  | Owner               |
| --------------------------------------------------------- | ----------------------- | ------------------- |
| `docs/blueprint/registry.yaml`                            | read                    | `/vwf:architecture` |
| `docs/blueprint/design-system.md`, or the folder form     | written                 | this skill          |
| `${CLAUDE_PLUGIN_ROOT}/assets/templates/design-system.md` | read, the template      | vwf                 |
| `.config/vwf.yaml`, the `design:` block                   | read; the pin written   | per `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md` |
| `docs/memory/decisions/`, `docs/memory/gaps/`             | read; decisions written | per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`     |
| `conventions.md`                                          | written, on graduation  | the blueprint       |
| the commit                                                | made through its skill  | `/vwf:git-workflow` |

## Phases

| §   | Phase                                                                | Gate                                    | File                                    | Loads     |
| --- | -------------------------------------------------------------------- | --------------------------------------- | --------------------------------------- | --------- |
| 1–4 | Read the registry, recall, preflight the adapter, delegate the import | user, when project tools disagree       | [import.md](references/import.md)       | always    |
| 5–7 | Distill into the doc, write the doc, reviewer loop                    | user, each hole and each gap            | [doc.md](references/doc.md)             | always    |
| 8–9 | Reconcile and persist; approval gate, pin and commit                  | user, an orphan fix; explicit approval  | [land.md](references/land.md)           | always    |
| —   | Text-only path, when no project declares a screen platform            | user, which path                        | [text-only.md](references/text-only.md) | sometimes |

## Halt and pause

H2, H3 and H4 stay distinct, because each needs a different fix.

| ID | Condition                                           | Action                                                                                                                                                                                                                                                                      |
| -- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1 | `docs/blueprint/registry.yaml` does not exist       | Halt: "No registry found. Run `/vwf:architecture` first."                                                                                                                                                                                                                   |
| H2 | No `design` on any screen-platform project          | Halt: "No design tool configured. Set `projects.<name>.design` in `.config/vwf.yaml` to one of the options the design-axis stack menu offers." A config still carrying a product-wide `design.tool` is `config_format` 12 drift: nudge `/vwf:setup` rather than reading it. |
| H3 | The repo has no `design-import-design-system` skill | Halt: "the repo has no `design-import-design-system` skill. Materialize the project's `design` pin, then re-run."                                                                                                                                                           |
| H4 | `/vwf:import-design-system` returns nothing usable  | Halt: "`<tool>` returned no usable payload", with the parse error.                                                                                                                                                                                                          |
| H5 | The reviewer's gap count does not strictly decrease | Pause and ask the user.                                                                                                                                                                                                                                                     |

## Output

- `docs/blueprint/design-system.md`, or the folder form, with `status: reviewed`.
- `design.design_system_id` pinned in `.config/vwf.yaml`, in the same commit.
- A summary of what was imported or changed, and every orphan that §8 found.

## Never

- Author visual language; import it through the design adapter — the design tool
  is where visual language is judged.
- Publish the doc back, or keep a hand-edit. Change the design system in the
  design tool, and re-run this skill — drift is one-way. The design tool is the
  source, and the doc is its distillation. A hand-edit to the doc is drift.
- Take the text-only path when an adapter is missing for a product with screens;
  halt — it is the only path with no adapter. It exists only because there are no
  screens to import.
- Fill a `null` by inference; elicit it — the adapter reported it as unknown
  precisely so that it is not guessed.
- Edit a flow doc or the registry by hand; route through `/vwf:blueprint` or
  `/vwf:architecture` — each owns its docs.
