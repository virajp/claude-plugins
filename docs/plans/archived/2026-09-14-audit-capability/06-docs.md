# U6 — docs, and the decisions doc

- **Wave:** 3
- **Depends on:** U1–U5
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`,
  `docs/backlog.md`, `docs/memory/decisions/2026-09-14-audit-capability.md`
  (new)
- **Model:** opus
- **Read first:** `index.md`'s Goal, Facts ("Enumerations to reconcile") and
  Assumed decisions; every `DOCS FALSIFIED:` line the orchestrator passes in;
  then run `vwf:docs-sync` over the branch delta
  (`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and apply its findings.
- **Lazy-load:** each doc below at the cited passage; the newest file under
  `docs/memory/decisions/` for the shape;
  `docs/memory/decisions/2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`
  (the category decision this extends);
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.

## Ruling

Decisions 1, 2, 3, 4 and 7 as written in index.md — quote 1, 2 and 4 into the
decisions doc verbatim.

Decision 12: "The phrase for the category and the contract is 'audit'; the store
is 'the audit store'; the foundation stays 'audit logs'. No file says 'audit
trail'."

Group A's decision 12, applied here: the docs unit edits `docs/backlog.md` by
hand, because the backlog skill is not loaded in the run session.

## Edits

Apply `docs-sync`'s findings first, then reconcile this list by section:

1. **`site/src/content/docs/plugins/stackgen.md`** — the category prose
   (~36–60): the capability-provider list gains `audit`, and the seam paragraph
   names `audit-store` as a token stackgen realizes; the kind row (~193)
   unchanged unless it enumerates; where the capability providers are listed by
   name, the two audit packs.
2. **`site/src/content/docs/plugins/vwf.md`** — the backing example (~589–598)
   may gain an audit store; the console rule (~747–750): the console declares
   `audit-store` when the audit foundation is on; the foundations passage
   (~2427–2439): audit's default now names the standard entity and flow and the
   per-stack store; the blueprint section where standard flows are explained:
   `standard-entities.md` beside `standard-flows.md`, `audit-history` beside
   `signin`.
3. **`.claude/skills/vwf-plugin/references/assets.md`** (~16) — a row for
   `standard-entities.md`, beside the `standard-flows.md` row;
   `references/skills-and-agents.md` (~88): the audit foundation's clause;
   `references/docs-tree.md` (~45) if it lists the assets; `SKILL.md` (~55,
   122–137) where the assets or the vocabulary are enumerated.
4. **`.claude/skills/stackgen-plugin/SKILL.md`** (~39) — the contracts list
   gains `audit`; (~116) unchanged.
5. **`.claude/docs/plugins.md`** (~13) — if it counts packs or categories.
6. **`readme.md`** (~273–277) — points at the inventory; leave unless a count
   appears. **`CLAUDE.md`** — the stackgen row of the Plugins table if it names
   the capability providers; otherwise nothing.
7. **`docs/backlog.md`** — row B06: status `done`; its section's last line
   `Planned in: docs/plans/2026-09-14-audit-capability/` (already `planned` at
   approval; flip to `done`). Touch no other row.
8. **`docs/memory/decisions/2026-09-14-audit-capability.md`** — create. Title:
   "Decision — audit is its own capability: `audit-store`, the `audit` category,
   per-stack provider packs". Sections in the directory's shape: what was
   decided before (the F-only `audit-log` token; observability's transport
   claim; the 2026-09-06 category rule this extends); the ruling (decisions 1,
   2, 4 verbatim; 3, 6, 7, 8 summarised); why (the user's B06 words and the
   per-stack answer); rejected (reclassifying `audit-log`; one agnostic pack; a
   list-valued `capability:`; an Analytics Engine pack, with the pack's own
   trades; a lifecycle key).

## Verification

- `mise run p:site:check` green.
- `command grep -rn "audit-store" site/src/content/docs/plugins/stackgen.md site/src/content/docs/plugins/vwf.md .claude/skills/stackgen-plugin/SKILL.md`
  hits in all three.
- `command grep -n "standard-entities" .claude/skills/vwf-plugin/references/assets.md`
  hits.
- `command grep -rn "audit trail" readme.md CLAUDE.md .claude site/src/content/docs`
  is empty.
- `command ls docs/memory/decisions/2026-09-14-audit-capability.md`.

## Guardrails

- Touch nothing under `plugins/` (U1–U5) or any version file (U7).
- `CLAUDE.md`, `readme.md`, `.claude/**/*.md` and the site docs **are**
  dprint-formatted: run `mise run code:format` before returning; never end a
  table cell in a bare `*`.
- The site's link rule and markdown mirror are in `site/CLAUDE.md`.
- Groups A to C may have changed neighbouring passages; edit what is on disk.
- Delete with `rm`, never `git rm`.

## Commit

`docs: audit as its own capability — the manual, the repo maps, the decision` —
written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`docs`; no scopes).
