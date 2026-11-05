---
name: blueprint-authoring
version: 0.1.0
category: development
description: Authoring discipline for vwf blueprints — the code-independence
  line that keeps a blueprint a durable technical contract, plus the per-entity,
  cross-entity/integration, and UI/UX completeness bars. Auto-applies when
  editing any docs/blueprint file.
license: MIT
user-invocable: false
disable-model-invocation: false
allowed-tools: Read Grep Glob Edit Write
paths:
  - "docs/blueprint/**/*.md"
  - "docs/plans/**/*.md"
  - "docs/plans/**/index.json"
metadata:
  archetype: doctrine
---

# Blueprint Authoring

A blueprint is the **whole product's desired end state as a technical contract**.
It is detailed enough that `plan` and `execute` *decide* instead of asking or
assuming. Read the reference matching the surface you are pinning down.

## Routing

| Doing                                                                                                      | Read                                                                                      | Loads     |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------- |
| Sorting any decision into blueprint, plan or execute. **Read first**                                       | [Contract vs realization](references/contract-vs-realization.md)                          | always    |
| Fitting a doc to its line budget, the delete test and the anti-patterns. **Read with the sort**            | [Density](references/density.md)                                                          | always    |
| Writing a flow: sections, screen home rule, jobs, sequence diagram, acceptance, `flows/index.md`           | [Flow contract](references/flow-contract.md)                                              | sometimes |
| Writing a `plugin` flow: host, invocation surface, what the host supplies, gates, artifacts                | [Plugin contract](references/plugin-contract.md)                                          | sometimes |
| Writing an entity: lifecycle, invariants, relationships, `Used by:`, the schema link                       | [Entity contract](references/entity-contract.md)                                          | sometimes |
| Writing `schema.yaml` or `apis/<project>.openapi.yaml`: path-typing, released-snapshot additive rule       | [API & schema contracts](references/api-and-schema-contracts.md)                          | sometimes |
| Deciding a screen on its flow: navigation, interaction patterns, state UX, forms                           | [UI / UX contract](references/ui-ux-contract.md)                                          | sometimes |
| Writing `environment.md`: inventory, classification, no values, the config-mechanism line                  | [Environment & secrets](references/environment-catalog.md)                                | sometimes |
| Writing frontmatter or links: the OKF profile, the `type` vocabulary, `implementation:`, typed links       | [Frontmatter & links](references/frontmatter-and-links.md)                                | sometimes |
| Checking a surface against the sort test and its completeness bar (also the reviewer's bar)                | [Quick reference](references/quick-reference.md)                                          | sometimes |
| Copying the shape of a format-valid bundle: flows, entities, apis, conventions, design-system, environment | [Worked example](${CLAUDE_PLUGIN_ROOT}/assets/examples/blueprint/entities/order/index.md) | sometimes |

## Rules that don't wait

- Record each decision that has **more than one reasonable answer** AND is **true
  regardless of how the code is written today**. Everything else belongs to
  `plan` (code-aware realization) or `execute` (mechanical) — this line governs
  the whole skill.
- To a plan folder under `docs/plans/**`, apply only
  [Frontmatter & links](references/frontmatter-and-links.md) (the `type`
  vocabulary and resolving typed links) — none of the entity doctrine applies.
- Do not apply the entity completeness bars to `design-system.md` — the
  `docs/blueprint/**` glob matches it, but `design-system-authoring` governs it.

A plan folder is an `index.json` whose `type` is `vwf-plan` or `vwf-change-plan`,
not an `index.md` with frontmatter, plus its prose `index.md` and unit files.

## Neighbours

- For API contract depth (resources, methods, errors, pagination, idempotency,
  versioning), use the `rest-api-design` skill. Do not restate it here.
- For `design-system.md`, use the `design-system-authoring` skill.
