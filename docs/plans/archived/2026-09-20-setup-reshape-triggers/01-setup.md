# U1 — setup: the shape check runs again after materialize

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom, before editing — Step 0
  (`:92-138`), `reshape` (`:72-90`), the materialize pass, step 3 (`:223`).
- **Lazy-load:** `plugins/vwf/skills/doctor/SKILL.md` (the predicates Step 0
  cites — read, never edit).

## Ruling

Decision 1 — Triggers: "Setup re-runs its Step 0 shape check **after** the
materialize pass, once per run, so a pack version moved in the run is offered
for reshape in the same session; … `architecture` is unchanged — it already
invokes setup."

Decision 2 — Offer, not run: "Every trigger **offers** `reshape` on consent,
exactly the Step 0 way — one line naming the drifted repos and the predicate,
then the question; nothing reshapes unprompted, and a clean check says nothing."

## Edits

1. **`plugins/vwf/skills/setup/SKILL.md`** — after the materialize pass (and
   before step 3's doctor run, or folded into it — pick whichever reads as one
   pass, and say which in `DECIDED:`), a **second shape check**: the same two
   questions Step 0 asks (present? current?) over every repo, evaluated against
   the lockfile the materialize pass just wrote; on drift, the Step 0 offer
   verbatim — cite Step 0's paragraph rather than restating it; on clean,
   nothing printed. Runs once per setup invocation; a `reshape` invocation
   (which is the shape pass itself) does not run it again. Step 0's own text
   gains one sentence: the check repeats after materialize, so a pack moved in
   this run is caught in this run.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "after the materialize\|second shape check\|repeats after" plugins/vwf/skills/setup/SKILL.md`
  — at least one hit.

## Guardrails

- Only the one file. `init/SKILL.md` (U4), `doctor/SKILL.md` and
  `recall/SKILL.md` (U3), `stackgen-sync/SKILL.md` (U2) are others'.
- No doc outside it — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: setup re-checks the shape after materialize` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
