# U1 — vwf mints `audit-store`; the foundation and architecture point at it

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/capability-vocabulary.md`,
  `plugins/vwf/skills/product-foundations/references/audit-logs.md`,
  `plugins/vwf/skills/product-foundations/SKILL.md`,
  `plugins/vwf/skills/architecture/SKILL.md`,
  `plugins/vwf/assets/templates/registry.yaml`,
  `plugins/vwf/assets/examples/blueprint/registry.yaml`
- **Model:** opus
- **Read first:** `capability-vocabulary.md` whole; `audit-logs.md` whole;
  `product-foundations/SKILL.md` 19–80; `architecture/SKILL.md` 125–200 and
  255–300; the two registry files at the cited lines.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` 73–77 (the
  `backing_template` key);
  `plugins/vwf/skills/doctor/references/stack-checks.md` 171–192 (the provider
  check, read only — not edited);
  `plugins/vwf/skills/product-foundations/references/users.md` 14–18 (the
  compliance role).

## Ruling

Decision 1: "Mint `audit-store` as kind **B** in the vocabulary's governance
group; `audit-log` stays **F** as the product-side half (what is recorded, the
read surface, retention). Both entries state the split. Prose noun for
`audit-store`: 'audit store'."

Decision 8: "Accepting the audit foundation in 3c makes the console project (the
`operator-rbac` holder) declare `audit-store` in its `capabilities:`; doctor's
provider check then reports a missing pin as its existing non-blocking finding."

Decision 12: "The phrase for the category and the contract is 'audit'; the store
is 'the audit store'; the foundation stays 'audit logs'. No file says 'audit
trail'."

Decision 4, for the foundation's expansion paragraph only: "`audit-event` is a
standard entity … `audit-history` is a standard operator flow in the console
project, mandatory once the audit foundation is accepted".

The user's words (2026-09-13): "these can contain sensitive data so it must be
secured and accessible to ONLY authorised people. Usually part of `console`
project where authorised people can access it. We need provision for that as
independent capability (outside observability ideally)".

## Edits

1. **`capability-vocabulary.md`** — in the governance group (27–41) add the row
   `audit-store` — kind **B** — "the append-only, access-controlled store audit
   events land in; pinned on the backing axis; read only by the console
   project". Extend the `audit-log` row (40–41) with "the product-side half:
   what is recorded, the read surface, retention; its store is `audit-store`".
   In the rationale section (46–57) one paragraph on why the pair is split the
   way `distributed-tracing` (B) sits under observability (F-shaped foundation):
   the store is a pin, the recording is a contract. In the prose nouns table
   (111–124) add `audit-store` → "audit store".
2. **`audit-logs.md`** — the boundary sentence (3–5) stays. Storage (39–40): the
   store is the `audit-store` provider the console project pins on its backing
   axis; the default-in-the-primary-datastore wording becomes "the realization
   is per stack — the relational providers ride the primary datastore as an
   isolated append-only schema"; "elicit if … external or immutable store" stays
   as the open elicitation. Read surface (25–27) and Blueprint expansion
   (44–50): the read surface is the standard operator flow `audit-history` in
   the console project; the event shape is the standard entity `audit-event`;
   both cited by name, not path (U2 writes them).
3. **`product-foundations/SKILL.md`** row 41 — the audit row's summary names the
   store token and the two standard contracts in a clause.
4. **`architecture/SKILL.md`** — 3c foundations walk (269–288): when the audit
   foundation is accepted or adapted, the console project's `capabilities:`
   gains `audit-store` (decision 8), stated in one sentence beside the
   observability example at 260–267. 3b (130–138): nothing to add — the
   vocabulary asset drives the offer.
5. **`assets/templates/registry.yaml`** — the `capabilities:` comment (49) or
   the console rule comment (92–93): one clause that the console carries
   `audit-store` when the audit foundation is on. Keep the file valid YAML.
6. **`assets/examples/blueprint/registry.yaml`** — the console-shaped project's
   `capabilities:` (44) gains `audit-store` beside `audit-log`; the
   `cross_cutting:` line (63) unchanged.

## Verification

- `mise run p:plugins:check` green (rule 10: no third-party tool named in vwf
  prose — "relational", "datastore", "schema" are fine, product names are not).
- `command grep -n "audit-store" plugins/vwf/assets/capability-vocabulary.md`
  shows the row, the rationale and the noun.
- `command grep -n "audit-history\|audit-event" plugins/vwf/skills/product-foundations/references/audit-logs.md`
  hits in the read-surface and expansion sections.
- `command grep -rn "audit trail" plugins/vwf/assets/capability-vocabulary.md plugins/vwf/skills/product-foundations plugins/vwf/skills/architecture/SKILL.md`
  is empty.
- The two registry YAML files parse (`pnpm exec node -e` with a YAML parser is
  not available — eyeball indentation; the checker's rule 4 does not read them).

## Guardrails

- Do not touch `standard-flows.md`, the blueprint skill or the surveyor (U2),
  anything under `plugins/stackgen/` (U3–U5), doctor, or any doc (U6).
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf mints the audit-store capability; the audit foundation names its
store and its standard contracts`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
