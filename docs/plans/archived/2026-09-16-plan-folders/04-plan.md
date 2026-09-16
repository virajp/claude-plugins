# U4 — `/vwf:plan` writes a folder the run can carry

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `plugins/vwf/skills/plan/**`
- **Model:** opus
- **Read first:** `plugins/vwf/skills/plan/SKILL.md`,
  `references/delta-checks.md`, `references/plan-doc.md` top to bottom; then
  `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/assets/plan-index.md`
  (all as U1/U2 left them).
- **Lazy-load:** `plugins/vwf/skills/change-plan/SKILL.md` §§3–8 — the procedure
  being mirrored (read only; U6 edits it concurrently);
  `plugins/vwf/skills/git-workflow/SKILL.md` (the declared-preferences
  invocation); `plugins/vwf/skills/doctor/SKILL.md` (the LSP finding).

## Ruling

Decision 1: "`docs/plans/<date>-<HHMM>-<slice>/` — `index.md` plus one
`NN-<unit>.md` per unit."

Decision 2: "`/vwf:plan` writes `Kind: code` on every unit."

Decision 4 (as it binds the planner): "Priority is derived (`10 + max` over
unarchived `requires:` rows), never asked."

Decision 9: "Moves to `/vwf:plan`'s stack gate: doctor's LSP finding is asked
there (install now / proceed without) and recorded as a consent row
`LSP <language>: installed / proceed without`. `execute` Setup 1 halts on
`blocking` only and reads the row; it never asks."

Decision 10: "`assets/templates/plan-folder.md` — the one folder template both
planners fill; `assets/plan-interview.md` — the one checklist."

Decision 11: "Mirrors `change-plan` §8: status `APPROVED`, index row,
`/vwf:backlog planned`, then commit **and push** the folder in place on the
current branch through `vwf:git-workflow` with declared preferences, then the
launch line. The in-session *Approve & execute* option is removed; *Approve &
plan next* (mid-chain) and *Approve only* stay."

Decision 13: "The folder's `## Status` block … is the one status."

Decision 14: "A cycle `index.md` keeps **Slice**, **Acceptance criteria (from
blueprint)** and **Gaps surfaced during execution** beside the shared sections."

## Edits

1. **`SKILL.md` frontmatter** — `description`: the plan is a **folder** under
   `docs/plans/<date>-<HHMM>-<slice>/` that `/vwf:execute` runs unattended in a
   fresh session; keep the chain, gap-routing, coverage-stamp and doctor
   sentences. `argument-hint` unchanged.
2. **Doc Paths table** — `Plan` row: the folder path in the target repo;
   `Plan index` row: "its one table"; `Plan template` row:
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`; add
   `Interview | ${CLAUDE_PLUGIN_ROOT}/assets/plan-interview.md`.
3. **§§1–4 unchanged in substance** (coverage gate, chain, member gate, stack
   gate, conventions, surveyor, delta, the five checks, gap routing, drift). Two
   edits inside them: in §2's stack gate, after "Blocking only", add the **LSP
   question**: for each language doctor reports without an LSP server, ask once
   (install now / proceed without — MCQ) and hold the answer for the Consent
   block; the sentence "an absent toolchain is `execute`'s question to ask"
   becomes "is asked here, once, and recorded — `execute` reads the row". In §3,
   the harness preflight's injected step becomes an injected **unit**.
4. **§5 Elicit open decisions → §5 Interview.** Work through
   `assets/plan-interview.md` top to bottom, one item per turn, following its
   `*Cycle plans:*` notes; keep the what-vs-how test and the §4 routing
   verbatim; every ruling lands in the assumed-decisions table with its rejected
   alternative; anything outside the slice goes to *Parked*. State the derived
   priority as a fact (interview item 12).
5. **§6 Setup (git-workflow)** — delete. The folder is written in place on the
   current branch (see §9); no worktree is cut by this skill. Renumber.
6. **§7 Write the plan → Write the folder.** From
   `assets/templates/plan-folder.md`: `index.md` with `type: vwf-plan`,
   `covers:`, `requires:` (folder basenames of the direct prerequisites),
   `backlog:`, the Status block `DRAFT`, the Consent block (landing, after
   landing, release intent, LSP rows), the cycle-only sections (Slice with the
   chain position; Acceptance criteria copied verbatim per
   `references/plan-doc.md`; Gaps surfaced during execution, empty), the assumed
   decisions, the units table — one unit per delta step, `Kind: code`, Wave from
   dependency order, Owns the files the step touches, Depends-on, Model `opus` —
   and one `NN-<unit>.md` per unit carrying its ruling, its **Test first** line
   (the failing test that defines done — today's TDD note), its Owns, its
   Verification (the gate lines) and its Commit line. Harness bootstrap units
   and the expand/backfill/contract units of `delta-checks.md` are units like
   any other, ordered before what depends on them. The two fixed final units
   (docs, gates-and-bump) are written as the template says. `exposure: dark` and
   the `backlog:` paragraph stay. Rewrite `references/plan-doc.md` for the
   folder: frontmatter, chain position in Slice, acceptance transcription, the
   units-per-step rule.
7. **§8 Approval gate.** Present the shape per the template's sections and offer
   **Approve & plan next** (mid-chain), **Approve only**, **Reject → Revise /
   Abandon**. Delete *Approve & execute* and the hand-into-execute sentence.
   Abandon: nothing on disk (the folder is written only on approve — move the
   write of §6 behind this gate, as `change-plan` §5–6 do: present first, write
   on approve). Persist to mempalace unchanged.
8. **§9 Commit → Hand off.** Mirror `change-plan` §8 exactly, for a cycle plan:
   set `APPROVED`; append the row to the base repo's `docs/plans/index.md` per
   `assets/plan-index.md` (`Kind` `cycle`, `Target repo` the member, or `—`);
   `/vwf:backlog planned <ids> <folder>` when `backlog:` names ids; commit and
   **push** through `vwf:git-workflow` with the declared preferences (work in
   place, no worktree; stage exactly the folder, `docs/plans/index.md` and
   `docs/backlog.md` when changed; message
   `docs: plan — <slice> — approved, awaiting execution`; push to upstream).
   Under `multi-repo` the folder and the index are two repos: two commits,
   member first, base last, both pushed. End with the launch line:
   `/vwf:execute docs/plans/<date>-<HHMM>-<slice>` and `/vwf:execute next`.
   Mid-chain: after the push, continue to the next element (§3) — each element
   is its own folder, its own row, its own commit.
9. Add a **What this skill never does** list mirroring `change-plan`'s: writes
   nothing before the gate; executes nothing; never edits `docs/backlog.md` or
   any index row but the one it appends; never merges; never asks what the
   blueprint, the surveyor or the repo already answers.
10. Fold by hand — `plugins/**/*.md` is not dprint-formatted.

## Verification

- `grep -n 'Approve & execute\|<date>-<time>-<slice>\|templates/plan.md\|status: draft\|cycle-plan table\|Keep the worktree' plugins/vwf/skills/plan/SKILL.md plugins/vwf/skills/plan/references/*.md`
  prints nothing.
- `grep -n 'plan-folder.md\|plan-interview.md\|plan-index.md' plugins/vwf/skills/plan/SKILL.md`
  — all three cited.
- `grep -n 'LSP' plugins/vwf/skills/plan/SKILL.md` hits in the stack gate.
- `grep -n 'Kind: code\|Kind' plugins/vwf/skills/plan/SKILL.md` hits.
- `grep -n 'push' plugins/vwf/skills/plan/SKILL.md` hits in the hand-off, and
  `grep -n 'never push' plugins/vwf/skills/plan/SKILL.md` prints nothing.
- `grep -n '/vwf:execute docs/plans/\|/vwf:execute next' plugins/vwf/skills/plan/SKILL.md`
  — both.
- `mise run p:plugins:check` green (strict-YAML frontmatter — a bad
  `description:` fold drops the skill silently; check the manifest lists it).

## Guardrails

- Do not touch `plugins/vwf/skills/{execute,change-plan,change-execute}/**`,
  `plugins/vwf/agents/**` or any asset — wave-1 and sibling wave-2 units own
  them.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk.
- Delete with `rm`, never `git rm`.

## Commit

`feat: plan — writes a folder, interviews, records consent, pushes at
hand-off`
— written by the orchestrator after the wave gate. Type `feat`; no scope.
