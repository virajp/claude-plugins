# U1 — feedback: the eighth kind, build state, a named unit, the path line

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/feedback/SKILL.md`
- **Model:** opus
- **Read first:** the owned file, top to bottom, **as it is on disk** — group
  A's plan has already rewritten line 21 (the backlog distinction); keep that
  sentence.
- **Lazy-load:** `plugins/vwf/skills/blueprint/SKILL.md` 185–189 (targeted
  update by unit name), 361–366 and 435–440 (released-contract guard, stamp
  demotion), 428–433 (the architecture sub-step);
  `plugins/vwf/skills/plan/references/delta-checks.md` 8–38;
  `plugins/vwf/skills/verify/references/release-freeze.md` 22–41 (the snapshot
  paths);
  `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md`
  121–148 (the stamp's meaning); `plugins/vwf/skills/architecture/SKILL.md`
  61–63, 434–449 (update mode, the setup hand-off).

## Ruling

Decision 1: "Fill the four gaps; keep one doc edit, one offered command and one
hand-off per report."

Decision 2: "**Shape change** — signal: the fix needs a new project, a changed
stack pin, a new capability or a cross-cutting foundation before any flow can be
written. Route: `/vwf:architecture`, which hands to `/vwf:setup`'s materialize
pass itself. A report whose shape change is incidental stays a Blueprint hole
and reaches architecture through blueprint's own sub-step. Deferred: a line in
`docs/blueprint/architecture.md`'s open questions, room `gaps`."

Decision 3: "After classifying, read the owning flow's or entity's
`implementation:` stamp, and whether `docs/blueprint/apis/released/` holds the
owning project's `<project>@*.openapi.yaml` or the entity's
`entities/<entity>@*.schema.yaml`. Print one line —
`Build state:
<none/partial/complete>; contract: <unreleased/released>` — before
the route. When a released contract is touched, the route note says the change
is additive-only or expand and contract, citing blueprint's guard and plan's
delta checks by name. No config key."

Decision 4: "The route names the unit: an idea an existing flow or entity can
absorb → `/vwf:blueprint <unit>`; an idea that implies a goal `product.md` does
not serve → `/vwf:product <note>` first, then the unit. The unranked-candidate
deferral stays."

Decision 5: "Every route's summary ends with the remaining path in one line,
e.g. `then /vwf:plan <slice>, then /vwf:execute`; the hand-off in §3 stays
single."

The user's definition (2026-09-13): "`feedback` is something that is being
worked upon and might need change in `product`, `blueprint`, `architecture`,
etc. It will then follow the `plan` and `execute` workflow."

## Edits

1. **Frontmatter `description`** (2–10) — re-fold to name eight kinds: add "a
   shape change" to the intake list and "shape → architecture" to the routing
   parenthesis. Keep every other key byte-identical.
2. **§1 table** (86–94) — an eighth row, **Shape change**, after Feature idea
   and before Incident, signal per decision 2. The kinds stay one per row with
   kind and signal only, as the seventh was added on 2026-09-10.
3. **§1, after the table** — a new short paragraph, **Build state**: how the
   owning flow or entity is found (the docs already skimmed at 76–79), what is
   read (decision 3, the two snapshot globs by their documented paths), and the
   one-line output format. Metric readings and incidents with no owning unit
   print `Build state: n/a`.
4. **§2 routes** —
   - A new bullet **Shape change** after Feature idea: the doc edit is none now;
     the offered command is `/vwf:architecture` with the report's substance
     restated as the delta to ask about; note that architecture hands to
     `/vwf:setup` itself; deferred per decision 2; path line "then
     `/vwf:blueprint <unit>`, then `/vwf:plan`, then `/vwf:execute`".
   - **Feature idea** (126–130) rewritten per decision 4; keep the deferral
     sentence.
   - **Behavior bug**, **Blueprint hole**, **UX issue**: when `Build state`
     reads `contract: released`, one sentence each that the change is
     additive-only or expand and contract — blueprint's released-contract guard
     and plan's delta checks decide, feedback only says so.
   - Every route bullet (all eight) ends with its path line (decision 5): bug →
     plan, execute; hole → blueprint, plan, execute; metric → product, then the
     re-ranked slice's normal path; UX → design-system or blueprint, then plan,
     execute; idea → as decision 4, then plan, execute; incident → each action
     item's own path; not a blueprint gap → change-plan, change-execute; shape →
     architecture, blueprint, plan, execute.
5. **§3** (149–157) — unchanged except: a Shape change routing decision files to
   room `decisions` like the others (152).

## Verification

- `mise run p:plugins:check` green (rule 10: no third-party tool named; rule 4:
  strict-YAML frontmatter — the re-folded description must parse).
- `command grep -c "Shape change" plugins/vwf/skills/feedback/SKILL.md` ≥ 2.
- `command grep -n "Build state:" plugins/vwf/skills/feedback/SKILL.md` hits.
- `command grep -c "then \`/vwf:" plugins/vwf/skills/feedback/SKILL.md` ≥ 7.
- `command grep -n "vwf:architecture" plugins/vwf/skills/feedback/SKILL.md` hits
  in the table's route bullet.
- The backlog distinction sentence from group A is still present (grep
  `backlog`).

## Guardrails

- Touch nothing outside the one file; product is U2's; every doc is U3's.
- Canvas harvest (24–68) is not edited.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Cite sibling skills by command name (`/vwf:blueprint`), files by their
  documented paths, never by `${CLAUDE_PLUGIN_ROOT}` for another plugin.
- Delete with `rm`, never `git rm`.

## Commit

`feat: feedback classifies a shape change, prints build state and names the
unit and the path`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
