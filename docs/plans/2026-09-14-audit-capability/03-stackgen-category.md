# U3 — stackgen: the `audit` category, its contract, observability uncoupled

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/taxonomy.md`,
  `plugins/stackgen/assets/kinds.md`,
  `plugins/stackgen/assets/contracts/audit.md` (new),
  `plugins/stackgen/assets/contracts/observability.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Read first:** `taxonomy.md` 1–30, 60–140 and 210–235; `kinds.md` 620–700;
  `contracts/observability.md` whole; `contracts/secrets.md` whole (the newest
  contract, the shape to match); `stacks/readme.md` 1–20 and 125–140.
- **Lazy-load:**
  `plugins/stackgen/stacks/cloud-service/analytics-engine/skills/cloudflare-analytics-engine/references/pick-and-trade.md`
  60–80 (the two trades the contract cites); `contracts/datastore.md` (the
  contract the audit store rides).

## Ruling

Decision 2: "One `capability-provider` pack per store under a new category
**`audit`**, each riding an existing datastore pack and claiming
`capability: audit-store`."

Decision 3: "Declined as an audit store, in the contract, citing the pack's own
trade: fixed retention and sampled totals against an audit log's completeness
and legal-basis retention."

Decision 7: "`contracts/observability.md:8–9` drops the audit-transport sentence
and points at the audit contract by role."

Decision 12: "The phrase for the category and the contract is 'audit'; the store
is 'the audit store'; the foundation stays 'audit logs'. No file says 'audit
trail'."

The taxonomy's own rules, from the survey: the category list is closed per type
and extended by an edit to the taxonomy file (`:8–11`); category doctrine lives
once at `assets/contracts/<area>.md`, capability-neutral, naming the vwf tokens
it realizes (`:218–229`); capability tokens are vwf's to mint (`:114–137`) —
`audit-store` is minted by U1 in the same wave.

## Edits

1. **`taxonomy.md`** (103–104) — the `capability-provider` list gains `audit` as
   its fifth token, after `secrets-manager`. In the categories-without-a- token
   passage (129–137) nothing changes: `audit` realizes `audit-store`. Where the
   file lists contracts by area (218–229), add the audit contract.
2. **`kinds.md`** (624–631) — the example sentence "an identity issuer, a
   telemetry sink, a workflow engine, a secrets manager" gains "an audit store".
   The six topics (659–694) unchanged.
3. **`contracts/audit.md`** — create, in `contracts/secrets.md`'s shape: the
   category's doctrine, capability-neutral, naming `audit-store` as the vwf
   token it realizes. Sections: what an audit store is and is not (append-only
   events answering "which actor is accountable"; not telemetry — one sentence
   drawing the line against the observability contract by role); the invariants
   every realization keeps — insert-only for the writing role, no update or
   delete grant to any application role, reads only by the console project's
   operator and compliance roles, retention purge as the one removal path and
   itself recorded, ids never personal data, a trace id that links to
   observability without copying; the local-stack stance — a realization that
   rides a datastore pack has that pack's local stack and declares
   `local_stack: n/a` with that reason; the realizations table — one row per
   pack under the category, the store it rides, and a column for the constraint
   that bites; and a **declined** subsection: the analytics-engine pack, with
   its own two trades quoted (sampled totals; fixed retention), against an audit
   log's completeness and legal-basis retention.
4. **`contracts/observability.md`** (8–9) — remove the audit-transport claim;
   replace with one sentence: audit is its own category with its own contract,
   and the trace id is the only link between them.
5. **`stacks/readme.md`** — the wave list (11–14) names the two audit packs with
   the other capability providers; a short paragraph beside the secrets one
   (130–134) says what the audit pair is and that each rides a datastore pack.

## Verification

- `mise run p:plugins:check` green (rule 13 does not scan `assets/`; rule 4 does
  not apply; rule 12 retired vocabulary — none introduced).
- `command grep -n "audit" plugins/stackgen/assets/taxonomy.md` shows the
  category on the capability-provider line and the contract entry.
- `command grep -n "audit" plugins/stackgen/assets/contracts/observability.md`
  shows only the pointer sentence.
- `command grep -c "audit-store" plugins/stackgen/assets/contracts/audit.md`
  ≥ 1.
- `command grep -rn "audit trail" plugins/stackgen/assets plugins/stackgen/stacks/readme.md`
  is empty.

## Guardrails

- Do not create or touch any pack, bundle or the inventory (U4, U5); do not
  touch `contracts/local-stack.md`; nothing under `plugins/vwf/` (U1, U2); no
  doc (U6).
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- The contract names no vendor except in the declined subsection, where the pack
  is cited by its directory slug.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen gains the audit category and contract; observability drops its
audit claim`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
