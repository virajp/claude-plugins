# U2 — The shared folder template and the shared interview checklist

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/plan-folder.md` (new),
  `plugins/vwf/assets/plan-interview.md` (new),
  `plugins/vwf/assets/templates/plan.md` (delete)
- **Model:** opus
- **Read first:** `plugins/vwf/skills/change-plan/references/plan-template.md`
  and `plugins/vwf/skills/change-plan/references/interview.md` top to bottom
  (read only — U6 deletes them); `plugins/vwf/assets/templates/plan.md`;
  `plugins/vwf/skills/plan/SKILL.md` §§2, 5, 7, 8 and
  `references/delta-checks.md` (what a cycle plan must still carry).
- **Lazy-load:** `plugins/vwf/assets/harness.md` (the harness preflight
  vocabulary the checklist names); `plugins/vwf/assets/elicitation.md`.

## Ruling

Decision 1: "`docs/plans/<date>-<HHMM>-<slice>/` — `index.md` plus one
`NN-<unit>.md` per unit; the time component stays so two plans for one slice on
one day coexist."

Decision 2: "Every unit carries Wave, Owns, Depends-on, Model and **Kind**
(`code` or `edit`). `/vwf:plan` writes `Kind: code` on every unit;
`/vwf:change-plan` writes `Kind: edit`. **No executor switches on Kind in this
plan**."

Decision 9: "Moves to `/vwf:plan`'s stack gate: doctor's LSP finding is asked
there (install now / proceed without) and recorded as a consent row
`LSP <language>: installed / proceed without`."

Decision 10: "`assets/templates/plan-folder.md` — the one folder template both
planners fill; `assets/plan-interview.md` — the one checklist, with a short
per-planner note where an item differs … `assets/templates/plan.md` … deleted."

Decision 13: "The folder's `## Status` block (`DRAFT`, `APPROVED`, `RUNNING`,
`BLOCKED`, `COMPLETE`) is the one status. `status: draft/reviewed/stable` leaves
the frontmatter."

Decision 14: "A cycle `index.md` keeps **Slice**, **Acceptance criteria (from
blueprint)** and **Gaps surfaced during execution** beside the shared sections;
the template marks them *cycle plans only*."

## Edits

1. **`plugins/vwf/assets/templates/plan-folder.md`** (new) — the content of
   `change-plan/references/plan-template.md`, generalised to both planners:
   - The opening paragraph names both writers and both runners: written by
     `/vwf:plan` or `/vwf:change-plan`, parsed and rewritten by `/vwf:execute`
     or `/vwf:change-execute`. The folder name is
     `docs/plans/<YYYY-MM-DD>-<HHMM>-<slice>/` for a cycle plan and
     `docs/plans/<YYYY-MM-DD>-<kebab-name>/` for a change plan.
   - **Frontmatter**: `type: vwf-plan | vwf-change-plan`, `title`, `requires`,
     `backlog`, plus — cycle plans only — `covers:` (the blueprint doc(s) this
     plan implements; the list the `implementation:` stamp is written to) and
     the optional `exposure: dark`. No `status:` key.
   - **Status**, **Consent**, **Goal**, **Facts the survey established**,
     **Assumed decisions**, **New dependencies**, **Units**, **Shared-file
     rule**, **Waves**, **Wave gate**, **After landing**, **Gates the
     orchestrator keeps**, **Unit contract**, **Out of scope**, **Parked**,
     **Run log**, **Launch** — kept with their fixed shapes. Two additions to
     Consent: an `LSP <language>` row (`installed` / `proceed without`; cycle
     plans only, one per language doctor flagged) and the note that the row is
     what `/vwf:execute`'s preflight reads instead of asking.
   - The Units table gains a **Kind** column after **Unit file**, values `code`
     or `edit`, and the paragraph beneath says which planner writes which and
     that no executor switches on it yet (plan 2 does).
   - Three **cycle plans only** sections, each marked so in an HTML comment on
     its heading line: **Slice** (which flow or entity, its blueprint link, the
     chain position — from `templates/plan.md`), **Acceptance criteria (from
     blueprint)** (copied verbatim from the flow docs' Acceptance blocks, with
     the `none — no flow touched` rule — from `templates/plan.md`), and **Gaps
     surfaced during execution** (appended by the executor, one terse line per
     gap — from `templates/plan.md`). Place Slice after Goal; the other two
     after Run log. The `Current state (actual)`,
     `Target state (per
     blueprint)`, `Risks / drift` and
     `Out of scope for this cycle` content of the old template folds into
     **Facts the survey established**, **Assumed decisions** (drift rows: the
     contradiction and the conforming unit) and **Out of scope**; say so in a
     one-line comment so a reader of the old template finds where each went.
   - **Launch** names the runner by kind: `/vwf:execute <folder>` for a cycle
     plan, `/vwf:change-execute <folder>` for a change plan, each with its
     `next` line.
   - The `NN-<unit>.md` shape gains `- **Kind:** <code | edit>` after **Model**,
     and — for a `code` unit — a **Test first** line: the failing test that
     defines done (the TDD note today's step list carries).
   - The two fixed final units paragraph stays; add that for a cycle plan the
     docs unit also runs `/vwf:docs-sync` and the gates-and-bump unit is the one
     that writes the `implementation:` stamps *only when* the plan's executor
     delegates that (in this plan `execute` keeps writing stamps itself at
     Reconcile — say "see the executor").
2. **`plugins/vwf/assets/plan-interview.md`** (new) — the content of
   `change-plan/references/interview.md`, generalised:
   - Keep sections A–G and the numbering 1–19. Under each item where the two
     planners differ, add one indented line beginning `*Cycle plans:*` — the
     goal is the slice and its chain (item 1); scope is the dependency chain,
     not a split (2); reversals include a `CONTRADICTIONS:` line from the
     surveyor (4); projects come from the registry, per chain element (5); the
     concrete edits are the delta the surveyor returned, sized by the minimalism
     ladder (6); a behaviour change is always yes (7); new dependencies are
     named per unit exactly as today's §3 requires (8); open design points
     exclude anything the what-vs-how test routes to `/vwf:blueprint` (9);
     ordering is TDD order within dependency order (10); gate deltas include the
     harness bootstrap units the preflight injects (13); docs falsified is read
     from the surveyor's `HARNESS:` and drift lines (15).
   - Add item **9a. LSP servers** under C: for every language doctor reports
     without an LSP server, ask install now / proceed without; the answer is a
     consent row. `*Change plans:*` not asked — no code unit.
   - Item 12 (priority) stays "stated, never asked".
   - Item 17's "restarted session" and item 18's 13/17 note stay verbatim.
3. **`plugins/vwf/assets/templates/plan.md`** — `rm`.
4. Fold by hand — `plugins/**/*.md` is not dprint-formatted.

## Verification

- `test -f plugins/vwf/assets/templates/plan-folder.md && test -f plugins/vwf/assets/plan-interview.md && test ! -e plugins/vwf/assets/templates/plan.md`.
- `grep -n '^## Status\|^## Consent\|^## Units\|^## Wave gate\|^## After landing\|^## Run log' plugins/vwf/assets/templates/plan-folder.md`
  — six hits.
- `grep -n 'Acceptance criteria (from blueprint)\|Gaps surfaced during execution\|^## Slice' plugins/vwf/assets/templates/plan-folder.md`
  — three hits, each followed on the same line or the next by a *cycle plans
  only* marker.
- `grep -c 'Kind' plugins/vwf/assets/templates/plan-folder.md` ≥ 3;
  `grep -n 'LSP' plugins/vwf/assets/templates/plan-folder.md` hits in Consent.
- `grep -n '^9a\.\|\*Cycle plans:\*' plugins/vwf/assets/plan-interview.md` — the
  9a item plus at least ten per-planner notes.
- `grep -c 'status: draft' plugins/vwf/assets/templates/plan-folder.md` prints
  `0`.
- `git add plugins/vwf/assets/templates/plan-folder.md plugins/vwf/assets/plan-interview.md`
  before the gate — `code:precommit` misses untracked files.
- `mise run p:plugins:check` green.

## Guardrails

- Do not edit `plugins/vwf/skills/change-plan/references/*` — read them, copy
  from them; U6 deletes them.
- Do not touch `plugins/vwf/skills/plan/**` — U4 rewrites it against your
  template.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk.
- Delete with `rm`, never `git rm`.

## Commit

`feat: plan folder template and interview — shared by both planners` — written
by the orchestrator after the wave gate. Type `feat`; no scope.
