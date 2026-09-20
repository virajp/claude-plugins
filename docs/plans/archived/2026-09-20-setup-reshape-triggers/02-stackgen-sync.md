# U2 — stackgen-sync invokes reshape instead of describing it

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-sync/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom, before editing — the passage at
  `:82` (the survey wrote a `plugins/vwf/` path; ruling (a) re-owned this unit
  to the stackgen tree).
- **Lazy-load:** `plugins/vwf/skills/setup/SKILL.md:72-90` (`reshape` — read,
  never edit).

## Ruling

Decision 1 — Triggers: "`stackgen-sync` ends by invoking `/vwf:setup reshape`
in-session instead of describing it".

Decision 2 — Offer, not run: "Every trigger **offers** `reshape` on consent,
exactly the Step 0 way — one line naming the drifted repos and the predicate,
then the question; nothing reshapes unprompted, and a clean check says nothing."

## Edits

1. **`plugins/stackgen/skills/stackgen-sync/SKILL.md:82`** — replace "a re-run
   of init is what folds it in" with the invocation: once the sync has written,
   invoke `/vwf:setup reshape`'s shape check in-session — which offers the
   reshape on drift and says nothing when clean — and state that the sync itself
   never lays down a pack file, the reshape does. Name the skill by its command,
   `/vwf:setup reshape`, the way `architecture` names `/vwf:setup`.

## Verification

- `mise run p:plugins:check` green (rule 6 — a `${CLAUDE_PLUGIN_ROOT}` path, if
  one is used, must resolve).
- `grep -n "re-run of init" plugins/stackgen/skills/stackgen-sync/SKILL.md` —
  zero hits.
- `grep -n "setup reshape" plugins/stackgen/skills/stackgen-sync/SKILL.md` — at
  least one hit.

## Guardrails

- Only the one file. It ships in the stackgen plugin, invoked as
  `/stackgen:stackgen-sync`; name setup by its command, `/vwf:setup reshape`.
- No doc outside it — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen-sync invokes setup reshape after a sync` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
