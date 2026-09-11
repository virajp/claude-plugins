# U1 — feedback: the seventh route, to change-plan

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/feedback/SKILL.md`
- **Model:** opus
- **Read first:** the owned file, top to bottom — the table `:86-93`, the routes
  `:95-138`, the canvas caller `:47`.
- **Lazy-load:** `plugins/vwf/skills/change-plan/SKILL.md:1-30` (its description
  and the "beside the chain" paragraph — quote its own words for what a
  non-blueprint change is).

## Ruling

From index.md's assumed decisions, verbatim:

> **1.** feedback's table gains *Not a blueprint gap — tooling, docs, CI, a
> refactor, a tree the blueprint does not describe* →
> `/vwf:change-plan
> <request>`, after Incident in both the table and the route
> list.

## Edits

1. **The classification table (`:86-93`)** — a seventh row after Incident, in
   the table's own column shape: the kind, the signal that classifies it (the
   report names no flow, entity or screen, and no metric — it names a task, a
   config, a doc, a pipeline, or a tree `docs/blueprint/` does not describe),
   and the destination `/vwf:change-plan <request>`.
2. **The route list (`:95-138`)** — a seventh bullet after Incident's, in the
   same voice as the others: what feedback hands change-plan (the report as the
   request, verbatim, plus the classification's one-line reason), and that
   change-plan then runs its own recall and survey — feedback does not
   pre-survey for it.
3. **The description in the frontmatter** — if it enumerates the routes, add the
   seventh in the same breath; strict YAML, keep the fold.
4. **`:47`** — untouched; it already says `/vwf:import-conversations`.

## Verification

- `mise run plugins:check` green (frontmatter still parses).
- `grep -n 'change-plan' plugins/vwf/skills/feedback/SKILL.md` → at least two
  hits (table and route).
- Fold width by hand.

## Guardrails

- Do not touch `change-plan/**`, `archive/**` (U2), the `import-*` skills or
  their callers (U3), any doc (U4), `plugin.json` (U5).
- Strict-YAML frontmatter.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`feat(vwf): feedback routes a non-blueprint fix to change-plan` — written by the
orchestrator after the wave gate, not by the unit.
