# Standard Entities

The canonical entity **slugs** a product owes once the foundation or capability
that triggers them is accepted, and the data contract each one carries. Sibling
of `${CLAUDE_PLUGIN_ROOT}/assets/standard-flows.md`: that file names the
journeys a project must have, this one names the data contracts. Shared by
`/vwf:blueprint` (elicitation and the sweep's coverage gate via the
`blueprint-surveyor`) and the blueprint-authoring **flow-contract** reference,
which reads it for what an `Audit-recorded` trigger writes. Keep this the single
source of truth; the surfaces read it rather than carrying their own copy.

A **standard entity** is a data contract every product with the triggering
foundation or capability must carry. It is authored like any other entity — a
folder under `docs/blueprint/entities/<slug>/` holding `index.md` and
`schema.yaml`, written by the `entity-writer`, reviewed against the same
completeness bar — and it introduces **no new mandatory structure beyond the
entity itself**. Standard means the contract below is the starting point rather
than a blank page; it is not a special case in the sweep.

Two rules ride on it:

- **A missing standard entity is a coverage hole** — it blocks the `complete`
  stamp like any other, unless waived in `.config/vwf.yaml` under
  `enforcement.rules` (id `standard-entities/<project>/<slug>`, with a reason;
  never re-asked).
- **The contract below is the floor, not the ceiling.** A product may add
  fields, states and relationships its own flows need; it may not drop a field
  marked required here, nor relax a rule stated here.

## `audit-event`

**Trigger** — the audit foundation accepted or adapted in the registry's
`cross_cutting:` block. Its per-project signal is the **`audit-store`**
capability, which the console project declares when the foundation is accepted.

**Home project** — the console: the project holding the `operator-rbac`
capability. Where its rows live is that project's `audit-store` pin — the
**audit store**, named as a capability and never by brand, per
`${CLAUDE_PLUGIN_ROOT}/assets/capability-vocabulary.md`. What is recorded, who
may read it and how long it is kept is the `audit-log` foundation's half; the
store is the backing half.

**Fields** — the floor. Every one is a logical contract field; `schema.yaml`
carries the types, the enums and the `required:` list.

| Field           | Type                                        | Required    | What it holds                                                                                            |
| --------------- | ------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `id`            | string                                      | yes         | Identifier — format per `conventions.md#ids`.                                                            |
| `actor_id`      | string                                      | yes         | The acting principal's id.                                                                               |
| `actor_class`   | enum `customer` / `operator` / `system`     | yes         | Which kind of principal acted.                                                                           |
| `action`        | string                                      | yes         | A stable verb, taken from the Trigger & Actors row or the step that produced the event.                  |
| `target_entity` | string                                      | yes         | The entity slug the action touched.                                                                      |
| `target_id`     | string                                      | yes         | That entity's id.                                                                                        |
| `occurred_at`   | string (date-time)                          | yes         | When the action was attempted, on server time.                                                           |
| `outcome`       | enum `success` / `denied` / `failed`        | yes         | What the attempt did — a denial is recorded, not dropped.                                                |
| `reason`        | string \| null                              | conditional | Mandatory for operator moderation actions (bans, purges, permission changes); null where none is needed. |
| `trace_id`      | string \| null                              | no          | The correlating trace id, so an event resolves into the observability record without duplicating it.     |

**Rules**

1. **Append-only.** No flow may carry an update or a delete step against
   `audit-event`. The entity's Lifecycle table has one transition — into
   `recorded` — and nothing out of it.
2. **Retention purge is the one removal path**, executed as the data-retention
   foundation's purge, and the purge is **itself audit-recorded**: the event
   that records it survives the events it removed.
3. **Ids, never personal data.** `actor_id` and `target_id` reference; the event
   body copies no name, address, message text or other personal datum out of the
   entity it points at. This is what lets an event outlive the record it
   describes.
4. **The trace id links, it does not copy.** An event names the trace so an
   operator can cross to the observability record; it never carries spans, logs
   or metrics.
5. **Written on the privileged path, not per endpoint.** Every audit-recorded
   trigger and step writes exactly one event, and the write is structurally
   unavoidable — a mutation that skipped it is a defect, not a coverage gap.

**Read surface** — the `audit-history` standard flow in the same project
(`${CLAUDE_PLUGIN_ROOT}/assets/standard-flows.md`). No other flow reads
`audit-event` without an authorization entry of its own.

**Relationships** — `audit-event` points at whatever entity a given event
targets, by slug and id rather than by a resolving foreign key: the target set
is open, and an event must survive its target's deletion. Its Relationships
table therefore states that openness rather than enumerating targets.
