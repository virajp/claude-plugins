# U2 — the standard entity `audit-event` and the standard flow `audit-history`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/standard-flows.md`,
  `plugins/vwf/assets/standard-entities.md` (new),
  `plugins/vwf/skills/blueprint/SKILL.md`,
  `plugins/vwf/agents/blueprint-surveyor.md`,
  `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`,
  `plugins/vwf/assets/templates/conventions.md`
- **Model:** opus
- **Read first:** `standard-flows.md` whole (the shape of a standard flow entry,
  `signin` at 78–84, `home` at 97–98); `blueprint/SKILL.md` 140–200 (coverage
  conditions, targeted update) and 260–280 (the foundations bullet);
  `agents/blueprint-surveyor.md` 70–90; `flow-contract.md` 45–60 and 140–155;
  `templates/conventions.md` 50–60.
- **Lazy-load:** `plugins/vwf/assets/templates/entity.md` and `schema.yaml` (the
  entity doc and schema shape a standard entity must be writable into);
  `plugins/vwf/skills/product-foundations/references/audit-logs.md` 15–29 (the
  event shape and the PII rule — read only, U1 edits it);
  `plugins/vwf/skills/product-foundations/references/users.md` 14–18.

## Ruling

Decision 4: "`audit-event` is a standard entity: actor (id and class), action,
target (entity and id), timestamp, outcome, reason, trace id; append-only,
retention purge the only removal; ids not PII. `audit-history` is a standard
operator flow in the console project, mandatory once the audit foundation is
accepted; Authorization: operator roles read; the compliance role alone for
events referencing retained post-deletion data. The surveyor treats both as
coverage conditions."

Decision 5: "A new asset `plugins/vwf/assets/standard-entities.md`, the first
entry `audit-event`, cited beside `standard-flows.md` wherever the blueprint
skill and the surveyor cite that one."

Decision 12: "The phrase … the store is 'the audit store'; the foundation stays
'audit logs'. No file says 'audit trail'."

## Edits

1. **`standard-entities.md`** — create, in the voice and section shape of
   `standard-flows.md`: a lead paragraph (what a standard entity is: a data
   contract every product with the triggering foundation or capability must
   carry, written by the entity-writer like any other, never new mandatory
   structure beyond the entity itself); then the `audit-event` entry — trigger:
   the audit foundation accepted or adapted; the fields per decision 4 with
   their types and which are required; the rules: append-only (no update or
   delete path in any flow; retention purge is the one removal, and it is itself
   audit-recorded), ids never personal data, the trace id links to observability
   without copying it; its home project: the console (`operator-rbac` holder);
   its store: the project's `audit-store` pin. Name the prose noun "audit
   store".
2. **`standard-flows.md`** — a new entry `audit-history`, placed with the
   operator flows: trigger: the audit foundation accepted or adapted; project:
   the console; actors: operator roles, the compliance role; Authorization
   column values per decision 4; the Screens it must pin at minimum — a
   filterable list over `audit-event` (by actor, target, action, time) and one
   event's detail; what it never does — edit, delete, export without an
   audit-recorded step of its own. It requires `signin` and `home` the way the
   other operator flows do. One sentence in the lead paragraph that
   `standard-entities.md` is this file's sibling.
3. **`blueprint/SKILL.md`** — the foundations bullet (267–276): the audit
   foundation now expands into the standard entity and the standard flow, cited
   by asset name beside the anchor and the columns; the coverage conditions
   (149–168): a product with the audit foundation on is not complete until
   `audit-event` and `audit-history` exist, in the same sentence shape as the
   `signin` condition. Nothing else.
4. **`agents/blueprint-surveyor.md`** (80–81) — beside "auth capabilities →
   signin": the audit foundation or an `audit-store` capability → the
   `audit-history` flow and the `audit-event` entity, read from the two assets.
5. **`flow-contract.md`** (51–56) — the `Audit-recorded` column's sentence
   gains: a `yes` in that column means an `audit-event` row, per the standard
   entity. (147–152) unchanged.
6. **`templates/conventions.md`** (56, the `#audit` anchor) — one clause
   pointing at the standard entity as the event shape, so the anchor stops
   restating it.

## Verification

- `mise run p:plugins:check` green (rule 6: root-relative references resolve —
  cite the new asset by the same form the skill cites `standard-flows.md`; rule
  10: no third-party tool).
- `command ls plugins/vwf/assets/standard-entities.md`.
- `command grep -n "audit-history" plugins/vwf/assets/standard-flows.md plugins/vwf/skills/blueprint/SKILL.md plugins/vwf/agents/blueprint-surveyor.md`
  hits in all three.
- `command grep -n "standard-entities" plugins/vwf/skills/blueprint/SKILL.md plugins/vwf/agents/blueprint-surveyor.md plugins/vwf/assets/standard-flows.md`
  hits in all three.
- `command grep -rn "audit trail" plugins/vwf/assets/standard-flows.md plugins/vwf/assets/standard-entities.md`
  is empty.

## Guardrails

- Do not touch the vocabulary, the foundation reference or architecture (U1),
  anything under `plugins/stackgen/` (U3–U5), or any doc (U6) — the
  `.claude/skills/vwf-plugin/references/assets.md` row for the new asset is
  U6's, report it as `DOCS FALSIFIED:`.
- Do not edit `agents/blueprint-reviewer.md` or `entity-writer.md`; if a
  reviewer line must change for the new conditions, return it as a `GAP:`.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Delete with `rm`, never `git rm`.

## Commit

`feat: audit-event standard entity and audit-history standard operator flow;
blueprint and the surveyor require them`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
