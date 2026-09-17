# Execute Stages (used by /vwf:execute for `code` units and `review` rows)

The stage pipeline, per-stage subagent contracts, and shared stage rules used by
`/vwf:execute`. The invoking command owns the orchestration policy — when to
pause, how many rounds, what happens at the end; this file defines what the
stages **are**. It reads each unit's `Kind` from the folder's Units table: the
`code` stage is what a `code` unit runs; the `review` and `security` stages run
at a `review` row — a Units table row the planner placed, covering the `code`
units it covers, directly or transitively via Depends on; an `edit` unit runs
no stage — it is dispatched
with its wave and judged by the wave review — and only the shared rules marked
*every unit* reach it.

## Stages

The stage table and the five dispatch contracts in this section apply to `code`
units and `review` rows. `acceptance` and `ux` run once per plan, and only when
the plan carries `covers:` — a plan without it skips both, journaled.

| Stage      | What             | Model  | Subagent                      | Runs                                                                             |
| ---------- | ---------------- | ------ | ----------------------------- | -------------------------------------------------------------------------------- |
| code       | Write Code (TDD) | opus   | `execute-coder`               | per `code` unit                                                                  |
| review     | Code Review      | opus   | `execute-code-reviewer`       | at each `review` row, ‖ `security`, after `/code-review` over the row's scope    |
| security   | Security Review  | opus   | `execute-security-reviewer`   | at each `review` row, ‖ `review`, after `/security-review` over the row's scope  |
| acceptance | Acceptance (E2E) | sonnet | `execute-acceptance-verifier` | once, after all units                                                            |
| ux         | UX Conformance   | opus   | `execute-ux-reviewer`         | once, after `acceptance`                                                         |

`review` and `security` are **independent read-only passes over the same
range** — neither reads the other's output. They run only at a `review` row,
and the row's loop in `${CLAUDE_PLUGIN_ROOT}/skills/execute/references/review-unit.md`
is the one authority for it — its placement first in its wave, its range and
`from..to`, the file list mapped to units by the commit that last touched
each file (never Owns), the one rule for a finding on an uncovered unit's file
(security routed and the widening recorded, non-security dropped with the
dropped-count clause — applied by the orchestrator to what the reviewers
report in full), late re-runs and per-loop round counts. In outline: the
orchestrator invokes `/code-review` (high effort) and `/security-review` in
one message, waits on each with `TaskOutput` (blocking, up to 30 minutes from
invocation; an engine that errors or times out is stopped with `TaskStop` and
counted unavailable, reason kept), filters each branch-scoped output to the
row's range, and only then dispatches both reviewers in a single message so
they run concurrently, each handed its engine's filtered output in its
prompt. It merges their findings into **one** loop-back, each finding's unit
re-dispatched **by its Kind**; then the row re-runs in full, engines first.
Their gating is unchanged and stays per-stage (security and `[breaking-api]`
always fixed; other review findings capped). No `code` unit runs an engine by
itself, and the orchestrator infers no row.

`acceptance` and `ux` run **once per cycle**, after **all** units, back to back
so one boot of the local stack serves both. Each is conditional — skipped
**explicitly** (a Run log row, and stated at the final gate), never silently:

- `acceptance` — only when the folder's `index.md` "Acceptance criteria (from
  blueprint)" section carries criteria (skip on `none — no flow touched`).
- `ux` — only when the slice changes screens on a **screen platform** (`site`,
  `webapp`, `desktop`, `mobile`, `tablet`, `auto`). Every screen surface gets a real visual gate and a
  real accessibility gate, delivered by the repo's own `ux-gate` skill in
  `.claude/skills/` — never a code-only read.

Per-stage dispatch contract:

- **code** — dispatch `execute-coder` with **the unit** — its `NN-<unit>.md`
  file plus the index's assumed decisions and facts, never the whole folder —
  the **blueprint slice** it implements, the **resolved stack** — both halves:
  the `projects.<name>.stack` block from `.config/vwf.yaml` (the blueprint
  carries none) **and the `conventions:` prose** Setup step 3 fetched for each
  of its templates, which is what the code is actually written to — the project
  wing, its **unit id**, the **plan folder path** and the plan's **`covers:`
  doc names** (for its gap drawers, per `memory.md`), the **round number**,
  and any recall hits. It implements under
  strict TDD — RED → GREEN → REFACTOR for every change — and runs the suite to
  the coverage gate, returning the coverage report: `100%`, `<100%` with the
  uncovered `file:line` list, or `n/a` when the project has no coverage tooling.
  The coder never blocks on coverage — the **orchestrator decides**: a residual
  below the configured target is documented as a gap and reported at the final
  gate (never a silent pass). On a fix loop-back from a `review` row, pass
  also the two review findings **tags** (not the text): each drawer holds the
  whole row's findings across units, every finding labelled `(<unit>)`, and
  the coder recalls the drawers filtered on the plan folder path (the drawers'
  `source_file`) and fixes only the findings labelled with its own unit id.
- **review** — dispatch `execute-code-reviewer` (pass the wing, plus the
  **`review` row id** and **round number** for its recall tag
  `<row-id>/review/<round>`, the **plan folder path** it files as the
  drawer's `source_file` and the plan's **`covers:` doc names** for its gap
  drawers — row ids repeat across plans in one wing, so the path
  is what a recall filters on — the row's **scope** — the range `<from>..<to>`
  and the file list it yields, never a unit — the unit files, with their Owns,
  of every unit the row covers — its Depends on, followed transitively, the
  same set preflight counted — plus, when a unit the row covers is `code`,
  the same **resolved stack** the coders got — block and `conventions:` prose
  both; a reviewer holding less than the coder cannot tell a convention breach
  from a style preference — and the **registry**; a row covering `edit` units
  alone passes none of these, and the reviewer reviews against the unit files
  and rulings alone). It reviews the
  code in the range adversarially against the **covered units and the index's
  rulings, the blueprint, `conventions.md`, and the resolved stack**, and every
  finding names the file it is on and is labelled `(<unit>)` with the unit the
  file list's unit map gives for that file. The dispatch prompt
  **ends with a section headed `## Engine`** holding either the `/code-review`
  output verbatim or the single line `ENGINE: unavailable — <reason>`; the
  reviewer runs no engine itself and returns exactly one block. When the plan
  touches a service's API surface, also pass the **living contract**
  (`docs/blueprint/apis/<project>.openapi.yaml`) and the **latest released
  snapshot** (highest semver under `docs/blueprint/apis/released/`, when one
  exists) — the reviewer's released-contract compatibility dimension checks the
  change against both and returns an `API COMPAT:` line; a `[breaking-api]`
  finding gates like a security finding (always fixed, exempt from the round
  cap). It files its full findings to mempalace (room `problems`) and returns
  the terse findings block plus a recall tag.
- **security** — dispatch `execute-security-reviewer` (pass the wing, plus the
  **`review` row id** and **round number** for its recall tag
  `<row-id>/security/<round>`, the same **plan folder path**, **`covers:`
  doc names**, **scope** — range, file list and its unit map — and unit files
  the review contract states, and, on the same condition — a unit
  the row covers is `code` — the **registry**, the resolved stack and its
  `conventions:` prose). It threat-models the changes in the range
  against the project's declared **capabilities** in the registry, rating
  findings by exploitability and impact, every finding naming the file it is
  on and labelled `(<unit>)` the same way, from the same unit files and the
  same plan folder path as `source_file`. The dispatch prompt ends with
  the same `## Engine` section the review contract states, holding the
  `/security-review` output. It files its full findings to mempalace (room
  `problems`) and returns the terse findings block plus a recall tag.
- **acceptance** — dispatch `execute-acceptance-verifier` (pass the folder's
  `index.md` "Acceptance criteria (from blueprint)" section with each
  criterion's source flow, the registry, the wing, the **plan folder path**
  and the **`covers:` doc names** for its gap drawers, and the **slice** and
  **round number**). It
  independently maps each criterion to an E2E test (never trusting the coder's
  mapping), boots the repo's own E2E harness, runs it, and returns per-criterion
  `PASS` / `FAIL` / `NOT-COVERED` — a `FAIL` or `NOT-COVERED` loops back to
  `code` like any finding (the fix is the code **or the missing E2E test**).
  When the repo has **no E2E harness**, it returns `ACCEPTANCE: n/a` naming the
  missing capability in the harness-contract vocabulary
  (`${CLAUDE_PLUGIN_ROOT}/assets/harness.md`) — the **orchestrator decides**
  (mirror of the coverage policy): it is recorded as a gap and reported at the
  final gate. Never a silent pass. (With `plan`'s harness preflight this should
  be rare — the plan injects bootstrap units for capabilities the gates need, so
  an `n/a` here usually means the preflight was skipped or the plan predates
  it.)
- **ux** — dispatch `execute-ux-reviewer` (pass the changed screens from the
  plan's screen units, the `design-system.md` path, the owning flow docs'
  Screens section(s) (`docs/blueprint/flows/<project>/<NNN>-<flow>/index.md`),
  the project's registry entry (role and platforms), the wing, the **plan
  folder path** and the **`covers:` doc names** for its gap drawers, and the
  **slice** and **round number**). For any slice with a screen surface it
  renders the changed screens
  via the repo's own `ux-gate` skill in `.claude/skills/`, which renders each
  changed screen and runs its ecosystem's accessibility scan; violations come
  back at WCAG A/AA severity
  whatever the ecosystem, so one rule applies across every stack. The reviewer
  itself never renders. Either way it judges against the design system and the Screens
  contract and adds a code-level token/state pass. Findings loop back to `code`
  like review findings; `RENDERED: n/a` on **any** UI slice is recorded as a gap
  and reported at the final gate.

## Shared stage rules

Each rule opens with its scope: *every unit* reaches a `code` and an `edit` unit
alike (the wave review cites *Pipeline knobs* for its round cap and
*Convergence guard* for its comparison); *`code` units with `covers:`* is
blueprint-bound and never fires on a plan without one.

- **Model enforcement** — *every unit.* Dispatch each subagent on the model in
  the table, unless `.config/vwf.yaml` `pipeline.models` overrides that stage's
  tier (per the vwf-config asset). A downgrade from the shipped default is
  **stated in that stage's report and at the final gate** — a weakened review
  is never invisible. The stage itself always runs; config cannot skip it.
- **Pipeline knobs** — *every unit.* The invoking command reads
  `.config/vwf.yaml` `pipeline` for `coverage_target` (default 100; per-project
  override under `projects.<name>.coverage_target`) and `review_round_cap`
  (default 4), and reports configured-vs-default at the final gate.
- **Terse subagent output** — *every unit.* A subagent's full reply lands in
  the orchestrator's context. The pipeline agents return fixed contract blocks;
  any *other* agent spawned (e.g. `Explore` for research) must be instructed to
  return only conclusions and `file:line` pointers — never code excerpts, diffs,
  or full file/dir dumps. The orchestrator reads files itself when it needs
  their contents.
- **Loop on findings** — *every unit.* At a `review` row, a finding names a
  file and is labelled with the unit whose commit last touched it in the
  range, per the file list's unit map; the orchestrator
  re-dispatches that unit by its Kind — a `code` unit's coder with the two
  **tags**, the plan folder path and its own unit id, so it fixes only the
  findings labelled with that id; an `edit` unit per its own loop-back, the
  finding lines appended — re-commits via `/vwf:git-workflow`, then re-runs
  the row — engines first, then both reviewers. Send **both** reviewers' tags
  in a single `code`
  dispatch per unit: one merged fix pass keeps the two stages from rewriting
  each other's lines, and a round counts once even though two reviewers ran
  and several units may have been re-dispatched. A finding on a file whose
  unit the row does not cover follows the one rule in
  `references/review-unit.md`'s scope step — security routed and recorded,
  the rest dropped with the count clause. If the coder's recall
  of a tag misses (mempalace down or the drawer absent), the orchestrator
  passes the terse FINDINGS block it already holds from that reviewer's return
  — the loop never stalls on a recall miss. The invoking command sets the
  gating and round policy; `review_round_cap` is the row's cap, whatever number
  of units it covers.
- **Convergence guard** — *every unit.* A round cap bounds how long a loop
  runs; it cannot tell *converging slowly* from *not converging at all*. Before
  dispatching each new round, compare this round's findings with the previous
  round's — matching on the `file:line` + rule in the terse FINDINGS block (the
  recall tag identifies the round, not the finding). The loop is **not
  converging** when either holds:
  - the finding count did not **strictly decrease**;
  - a finding an earlier round resolved has **resurfaced**.

  Do not spend the remaining rounds proving it. Stop the loop where it stands
  and record the contested findings as an **oscillation** gap naming them and
  the rounds tried. The diagnosis is the loop — the coder trading one reviewer's
  fix against the other's, or regressing an earlier one — so it is never filed
  as "blueprint/plan was not thorough enough", which sends the reconciliation at
  the far end to rewrite a contract that was never at fault. (This is the review
  loop's form of the convergence guard `elicitation.md` §9 puts on review loops
  during authoring — same idea, different loop.)

  **Cap-exempt findings never take this exit.** Security and `[breaking-api]`
  findings must be fixed and can never be downgraded to gaps, so a guard trip on
  one is not a gap at all — it is a decision the rules do not cover, and the
  invoking command pauses on it.
- **Capture blueprint/plan gaps as they surface** — *`code` units with
  `covers:`.* A *gap* (a hole in the blueprint or plan, distinct from a code
  finding) reported by any stage is never silently worked around. The subagent
  files the full gap to mempalace room `gaps` and returns a terse pointer; the
  orchestrator mirrors that terse line into the durable, mempalace-independent
  on-disk record **the moment it surfaces** — the "Gaps surfaced during
  execution" section of the plan folder's `index.md`. Gaps do not block the
  pipeline; they are reconciled at cycle end.
- **Never silently edit the blueprint** — *`code` units with `covers:`.* Flag
  drift and offer; do not rewrite it. **Single exception:** the Reconcile step
  updates the `implementation:` frontmatter key on the docs the plan's
  `covers:` lists — a state stamp the pipeline owns, recording what the run
  landed. No other frontmatter key, and no body or schema content, may be
  touched; anything else is drift to flag.
- **The blueprint is the source of truth — code follows.** *`code` units with
  `covers:`.* When landed code contradicts the blueprint (not merely lags it),
  the pipeline never adjusts the blueprint to match: the contradiction is
  surfaced (a finding when the plan pinned it, a gap otherwise) and resolved by
  conforming the code or by the user consciously amending the contract via
  `/vwf:blueprint`.

## Run log and its journal mirror (the record the gate renders)

The plan folder's **Run log** table in `index.md` is the pipeline's checkpoint,
and the primary write. A resumed run reads it to skip finished work, and the
final gate **renders** it instead of recalling a long autonomous run from
context, which is exactly the context most likely to have been compacted or
handed off. Both uses fail the same way if the record is loose prose, so it
takes a fixed shape, in the table's columns
`Wave | Unit | Model | Round | Outcome | Detail | Commit`: for a `code` unit
and a `review` row, one row per node **execution**; for an `edit` unit, one
row per unit **report** — the dispatch's return, and a re-dispatch's — with
the wave review and every skip written the same way.

| Field     | Value                                                                                      |
| --------- | ------------------------------------------------------------------------------------------ |
| `wave`    | the unit's or `review` row's wave from the folder; `—` for `acceptance`, `ux`, `reconcile` |
| `unit`    | `<id> <title>` — the row id on a `review` row's nodes — or `acceptance`, `ux`, `reconcile` |
| `node`    | the node: `code`, `review`, `security`, `acceptance`, `ux`, or `edit`                      |
| `round`   | `1` on the first pass, incremented per fix loop                                            |
| `model`   | the tier it ran on, `(downgraded from <default>)` when config overrode it                  |
| `outcome` | `pass` / `findings(<n>)` / `fail(<n>)` / `skipped` / `blocked`                             |
| `detail`  | terse — coverage vs target, per-criterion counts, finding tags; a `review` node's range    |
| `commit`  | the commit ref for a `code` node or a landed `edit` unit; `—` otherwise                    |
| `why`     | **required** when `outcome` is `skipped` or `blocked`                                      |

`node` and `why` ride inside the `Detail` column, since the table has no column
of their own. The **journal** — mempalace room `runs`, drawer `<plan folder>` —
is written from the same data, one record per row, and is the mirror: read only
when the folder is unreachable. It is written for **every plan**, whatever its
units' Kind.

- **The record opens with the unit sequence** written at Setup — every unit
  pending — and accumulates rows beneath it. A `code` unit is done when its
  `code` node carries a commit; a `review` row is done — `green` — when its
  reviewers' last round is clean, or when its loop ended at the cap or the
  convergence guard with the residuals recorded `contested`; an `edit` unit
  is done when its report is read and the wave review passed it.
- **One row per execution, not per stage.** A `review` row whose findings
  looped three times writes three `review` rows and three `security` rows,
  each carrying the row's id in the unit cell and the row's wave, plus a
  `code` row per coder it re-dispatched under that unit's id; an `edit` unit
  dispatched twice writes two `edit` rows. The round count is then the
  highest `Round` value among that unit's rows — not the row count, since a
  review round writes several — counted **per loop** for a `review` row, its
  main loop and each late re-run reported separately, per
  `references/review-unit.md`; the convergence guard compares two rows of one
  loop — never two numbers the orchestrator is holding in its head.
- **A skip is a row.** The conditional stages' "skipped explicitly, never
  silently" rule is discharged *by the row existing*, with its `why`. A stage
  with no row did not run, and the gate reports it that way.
- **Downgrades are recorded where they happened** — on the node that ran under
  the weaker model, not summarized at the end.
- **Write on return.** Append the row to the folder when the node returns, then
  mirror it to the journal, before dispatching the next. This is the
  checkpoint: a row written late is a unit a resumed run repeats.
- **A resume reads the folder first.** The journal is consulted only when the
  folder cannot be read; when the two disagree, the worktree's commits win.
- **When mempalace is down**, the journal is simply not written — the folder
  still is, so the final gate renders as before. Only when the folder itself is
  missing rows must the gate say the report was **reconstructed**, not
  rendered. Whoever approves the merge needs to know which one they are
  reading.

## Reconcile (end of run)

Reconcile runs **before** the docs unit's wave, so that unit's delta is complete
— the human docs are the docs unit's, not this step's. Every step below is
gated on the plan's `covers:`: a plan without one skips Reconcile whole,
journaled as a `skipped` row.

1. **Architecture.** If the implementation introduced a topology change (new
   project, dependency, or capability), update the **registry block** in
   `docs/blueprint/registry.yaml` to match what was actually built — via
   `/vwf:architecture` for non-trivial changes. Edit the registry precisely; do
   not rewrite prose unless topology genuinely changed.
2. **Environment.** If the change introduced a **new secret or env var** (an
   integration key, credential, or operational variable a project now reads),
   reconcile `docs/blueprint/environment.md` — add the variable's catalog row
   (name / purpose / issuer / used-by / required / classification, **no
   value**), creating the doc from the environment template if it did not exist.
   A committed secret value or an undocumented credential is a security finding,
   not a reconciliation.
3. **Harness stamp.** If the cycle added a harness capability (a bootstrap step
   landed — e2e task, dev server, health endpoint, staging mode), update the
   `harness:` block in `.config/vwf.yaml` to match, per
   `${CLAUDE_PLUGIN_ROOT}/assets/harness.md`.
4. **Implementation stamp.** For each blueprint doc in the plan's `covers:`
   frontmatter, set its `implementation:` key to what the run actually landed —
   the single carve-out from the never-silently-edit rule (state stamp only,
   never content):
   - a **flow** is `complete` when every unit covering it landed **and**
     its Acceptance criteria all returned `PASS` (stage run, none
     `FAIL`/`NOT-COVERED`) **and** no open gap in the plan folder names it;
   - an **entity** is `complete` when its blueprint delta fully landed with no
     open gap naming it (entities are verified through flows — no acceptance
     requirement of their own);
   - anything less that still landed code is `partial`; nothing landed leaves
     the stamp untouched. Commit the stamp edits in the worktree like every
     other change and report each stamp written at the final gate.
