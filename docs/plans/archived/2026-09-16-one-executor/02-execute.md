# U2 — `/vwf:execute` absorbs `/vwf:change-execute`

- **Wave:** 2
- **Depends on:** U1, U3
- **Owns:** `plugins/vwf/skills/execute/**`,
  `plugins/vwf/skills/change-execute/**` (delete, after reading)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/execute/SKILL.md`,
  `references/preflight.md`, `references/acceptance-and-ux.md`;
  `plugins/vwf/skills/change-execute/SKILL.md`, `references/wave-review.md`,
  `references/blocking.md` — all top to bottom, before writing anything. Then
  `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/assets/plan-index.md`,
  `plugins/vwf/assets/templates/plan-folder.md` (as U1/U3 left them).
- **Lazy-load:** `plugins/vwf/skills/git-workflow/SKILL.md` (declared
  preferences); `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (rooms);
  `.claude/skills/plugin-authoring/SKILL.md` (strict-YAML frontmatter, the fold
  trap).

## Ruling

Decision 1: "`skills/execute/` is the one executor and keeps its name;
`skills/change-execute/` is deleted whole — `SKILL.md` and its three references
— with no alias and no redirect."

Decision 2: "The executor reads each unit's `Kind` from the Units table. `code`
runs the per-unit pipeline now in `execute` (recall, coder under TDD, engines,
both reviewers, merged loop-back, gaps, commit, journal), moved verbatim into
`references/code-unit.md`. `edit` runs the dispatch and wave review now in
`change-execute` §4 and `wave-review.md`, moved into `references/edit-unit.md`.
`blocking.md` moves to `execute/references/`. `SKILL.md` keeps the shared spine:
resolve and claim, worktree, preflight, the wave loop, report, landing, after
landing, pauses."

Decision 3: "Within a wave: every `edit` unit is dispatched in one message and
awaited; then each `code` unit runs serially through its pipeline; then the wave
review, then the wave gate. Engines and reviewers never overlap across units."

Decision 4: "`R<wave>` runs after every wave, of either kind, scoped to the
contract: rulings honoured, Owns respected, cross-unit drift, docs falsified. It
is told that code-quality and security findings on a `code` unit belong to that
unit's reviewers and are not re-raised. The two-round cap, the guard and
`contested` residue stay as written."

Decision 5: "When the landing's gap list is empty, the landing moves the folder
to `docs/plans/archived/`, re-points `Folder`, sets `COMPLETE` and sweeps — for
both kinds. When any gap is open, the folder stays live as the working record,
the row reads `COMPLETE` with `Folder` at the live path, and the report names
`/vwf:archive` for after reconciliation."

Decision 6: "Present only on a cycle plan, `covers:` gates: the format check,
the stamp-based `requires:` test, the Doc Paths blueprint rows, the acceptance
and UX pass, Reconcile's stamps / registry / environment / harness steps, the
coverage / acceptance / ux / stamps bullets of the report, gap reconciliation
and chain forward. A plan without it skips each, journaled."

Decision 7: "`/vwf:doctor` runs for every plan. The stack-conventions fetch and
the LSP consent-row rule run only when the Units table holds a `code` unit.
`references/preflight.md` says so."

Decision 8: "The Run log mirrors to room `runs` for every plan; per-unit recall
before dispatch and decision persistence after run for `code` units only — an
`edit` unit's ruling is in its file."

Decision 9: "The docs unit and the gates-and-bump unit are the last two waves
for every plan, run only when nothing was skipped, exactly as `change-execute`
§4 says. `execute`'s inline docs-sync call in Reconcile goes — the docs unit
does it. The `implementation:` stamps and the registry / environment / harness
reconcile stay the orchestrator's Reconcile step, gated on `covers:`, run
**before** the docs unit's wave so its delta is complete."

Decision 10: "The report, landing and after-landing text is `change-execute`
§§6–8 — the fuller version — with `execute`'s additions: the `covers:`-gated
report bullets, `/vwf:backlog done`, the git-workflow declared preference, the
consent-withheld rule (Status stays `RUNNING`, branch ready to land by hand).
The pause taxonomy, the resource-cap hook contract and 'What does not stop the
run' are `execute`'s and apply to every plan."

Decision 11: "No Kind filter: candidates are every `APPROVED` row whose
requirements are satisfied, ordered as today; the `Kind` cell is still written
and printed with the pick."

Decision 14: "`execute`'s `description` names both kinds and the Kind switch;
`argument-hint` and `disable-model-invocation: true` unchanged."

## Edits

The new `execute/SKILL.md` is assembled from the two skills; nothing is
invented. Where the two say the same thing, keep `execute`'s wording where it is
fuller (pauses, caps, mempalace, multi-repo) and `change-execute`'s where it is
(report, landing, after landing, the orchestrator's "never reads unit work
inline" rule, "What this skill never does").

1. **`SKILL.md` frontmatter** — `description`: one executor for every plan
   folder, `<folder> | next`; `code` units through TDD / coverage / engines /
   review + security one at a time, `edit` units together under the wave review;
   acceptance, UX and the blueprint reconcile when the plan has `covers:`; the
   claim, the run log, landing per consent, `ask` steps; fresh session. Fold for
   strict YAML. `argument-hint` and `disable-model-invocation: true` unchanged.
2. **Intro** — "the plan is the contract and `index.md` the only input"
   paragraph and the "never reads unit work inline" rule from `change-execute`
   :25-27; the persona line from `execute` :40-42; "session that has done
   nothing else" once.
3. **References table** — `code-unit.md` (the `code` pipeline; read when a wave
   holds a `code` unit), `edit-unit.md` (dispatch + wave review; read when a
   wave holds an `edit` unit), `blocking.md` (on failure / resume),
   `preflight.md`, `acceptance-and-ux.md` (read when `covers:` is present and
   the stage returns short).
4. **§1 Resolve and refuse early** — `execute` :46-143 as the base. `next`:
   every `APPROVED` row with satisfied requirements, no Kind filter, print the
   pick with its `Kind` and Priority and each other candidate with why not.
   Requirement resolution per `plan-index.md` (a `cycle` entry by the stamp
   test, a `change` entry by the row test — already there). Delete the
   `type: vwf-plan` refusal from `change-execute` :73-75 and the `cycle`-only
   filter from `execute` :48-55. The claim, the `RUNNING` status line and the
   "folder not on the integration branch" refusal unchanged. Read `covers:` when
   present and hold "has covers" and "has a code unit" as two facts for every
   gate below.
5. **Format Check** — `execute` :145-151, gated on `covers:`; without it, one
   line: skipped, journaled.
6. **Doc Paths** — the plan, the index, membership, the template; the blueprint
   rows (:161-167) kept, marked *cycle plans only*.
7. **Autonomous Rules** — `execute` :192-272 with `:196-204` (the placeholder)
   replaced by decision 3's dispatch rule; the TDD / coverage / security /
   breaking-api / review-cap bullets prefixed "for a `code` unit"; add
   `change-execute`'s per-unit staging discipline (:196-204 there — stage only
   the unit's Owns, reset paths outside them) as the commit rule for every unit;
   the mempalace bullet per decision 8.
8. **Pause Conditions** — `execute` :274-340 verbatim; the "missing blueprint"
   hard halt reads "for a plan with `covers:`". Resource caps :297-323 kept in
   full; `change-execute`'s short form :306-315 dropped.
9. **Recall** — `execute` :344-371, the per-unit recall sentence scoped to
   `code` units; the Resume check reads the folder's Run log and the Units table
   (first non-`green` unit, per `blocking.md`'s Resume).
10. **Setup** — `execute` :373-457: worktree (with the multi-repo linkage text),
    then preflight: doctor for every plan, `blocking` halts; the LSP consent-row
    rule and `references/preflight.md` only with a `code` unit; stack
    conventions :422-448 only with a `code` unit; step 4 opens the Run log and,
    with `covers:`, mirrors the sequence to the journal. Rewrite
    `references/preflight.md`'s first line to say when it applies.
11. **§Waves** — the loop, from `change-execute` §4 :157-215, generalised: for
    each wave in order — dispatch every `edit` unit in one message per
    `references/edit-unit.md`; then each `code` unit one at a time per
    `references/code-unit.md`; then the wave review per `edit-unit.md`'s
    reviewer section with decision 4's scope line added to the prompt; then the
    wave gate + UNRESOLVED read + red-line attribution (:188-195); commit per
    green unit with the staging discipline; Run log rows as each returns (one
    per node for `code`, one per report for `edit`). The fixed final units
    (:206-214): their two waves run only when nothing was skipped, docs unit
    runs docs-sync + `DOCS FALSIFIED:`, gates-and-bump bumps with the consent
    block's command and regenerates.
12. **`references/code-unit.md`** (new) — `execute`'s Execute loop :459-530
    verbatim (recall, code, engines then reviewers, merged loop-back, gaps,
    commit, persist & journal), headed "One `code` unit", with the stage
    contracts still cited from `execute-stages.md`.
13. **`references/edit-unit.md`** (new) — `change-execute` :166-183 (the
    dispatch: one message, `general-purpose`, `U<n>`, per-unit Model, the
    verbatim unit prompt, no `isolation: worktree`, one re-dispatch then
    `failed`) followed by `wave-review.md` :9-66 whole (the reviewer prompt, the
    five rules, the loop, the guard), with decision 4's sentence added to the
    prompt shape: findings on a `code` unit's code quality or security belong to
    its own reviewers and are not raised here.
14. **`references/blocking.md`** — `rm` the change-execute copy after copying it
    to `execute/references/blocking.md` unchanged, except "the run" for any
    skill name.
15. **Acceptance & UX** — `execute` :532-549, gated on `covers:`; skipped and
    journaled otherwise. Placed after the last unit wave and before Reconcile.
16. **Reconcile** — `execute` :551-571 minus the docs-sync step (decision 9);
    steps 1-3 and 5 gated on `covers:`; runs before the docs unit's wave — say
    so in one sentence and move the section accordingly (Reconcile, then the
    docs wave, then the gates-and-bump wave, then the report).
17. **Final report** — `change-execute` §6 :224-241 as the base (Owns widenings,
    contested findings, versions bumped, BLOCKED rule) plus `execute`'s :584-593
    bullets (coverage, acceptance, ux, stamps, gap list with cap/guard marks)
    marked *with covers:*; rendered from the Run log, "reconstructed" only when
    the folder cannot be read.
18. **Landing** — `change-execute` §7 :243-263 as the base, with `execute`'s
    :608-628: `/vwf:backlog done <ids>`; git-workflow with the declared
    preference; then decision 5's rule for the folder move and the row; the
    consent-withheld rule from `execute` (Status `RUNNING`, ready to land by
    hand). Gap reconciliation :660-665 and Chain forward :675-679 gated on
    `covers:`; the Archive section :667-673 reduces to the "open gaps →
    `/vwf:archive` later" sentence.
19. **After landing** — `change-execute` §8 :269-304 verbatim.
20. **What does not stop the run** and **What this skill never does** — from
    both, deduplicated.
21. **Delete** `plugins/vwf/skills/change-execute/` whole with `rm -r` — after
    every copy above is in place.
22. Fold by hand — `plugins/**/*.md` is not dprint-formatted. `git add` the two
    new references before the gate.

## Verification

- `test ! -d plugins/vwf/skills/change-execute && test -f plugins/vwf/skills/execute/references/code-unit.md && test -f plugins/vwf/skills/execute/references/edit-unit.md && test -f plugins/vwf/skills/execute/references/blocking.md`.
- `grep -rn 'change-execute\|either executor\|both executors\|own kind\|in this release\|merged executor' plugins/vwf/skills/execute/`
  prints nothing.
- `grep -n 'Kind' plugins/vwf/skills/execute/SKILL.md` — hits in the waves
  section (the switch) and in §1 (the pick prints it).
- `grep -n 'covers:' plugins/vwf/skills/execute/SKILL.md` ≥ 8 hits (format
  check, requires, doc paths, acceptance, reconcile, report, gap reconciliation,
  chain forward).
- `grep -n 'code-unit.md\|edit-unit.md\|blocking.md' plugins/vwf/skills/execute/SKILL.md`
  — all three cited.
- `grep -c 'git add -- ' plugins/vwf/skills/execute/SKILL.md` ≥ 1.
- `grep -n 'not raised here\|belong to' plugins/vwf/skills/execute/references/edit-unit.md`
  hits (decision 4).
- `wc -l plugins/vwf/skills/execute/SKILL.md` — under 700; the references carry
  the pipelines.
- `mise run p:plugins:check` green — and the marketplace manifest still lists
  `execute` (a bad `description:` fold drops the skill silently).

## Guardrails

- Do not touch any asset (U1, U3),
  `skills/{plan,change-plan,archive,backlog,
  feedback}/**` (U4, U5), or
  `agents/**` (unchanged in this plan).
- Do not alter the `code` pipeline's content while moving it — the diff of
  `code-unit.md` against `execute` :459-530 should be headings and pronouns.
- No escaped backtick inside a code span; no code span beginning with `##`.
- Delete with `rm` / `rm -r`, never `git rm`.

## Commit

`feat: execute — one executor, Kind switch, change-execute retired` — written by
the orchestrator after the wave gate. Type `feat`; no scope.
