# U8 — Every other skill that names a plan's shape

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `plugins/vwf/skills/archive/**`, `plugins/vwf/skills/backlog/**`,
  `plugins/vwf/skills/feedback/SKILL.md`, `plugins/vwf/skills/recall/SKILL.md`,
  `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/setup/references/onboard-pipeline.md`,
  `plugins/vwf/skills/blueprint-authoring/**`,
  `plugins/vwf/skills/docs-sync/SKILL.md`, `mempalace.yaml`
- **Model:** opus
- **Read first:** every owned file, top to bottom; then
  `plugins/vwf/assets/plan-index.md` and
  `plugins/vwf/assets/templates/plan-folder.md` (as U1/U2 left them).
- **Lazy-load:** none.

## Ruling

Decision 5: "A cycle plan's `requires:` entry is satisfied when every `covers:`
doc of the required plan reads `implementation: complete` in the base repo's
blueprint … A change entry keeps the row/archived test."

Decision 14: "The acceptance verifier and `archive` read [Acceptance criteria
(from blueprint), Gaps surfaced during execution] by heading."

Decision 15: "Handles both kinds as folders through its existing folder path;
the flat path and the `.gap-report.md` companion prose go. Its `requires:` check
uses ruling 5 per kind."

## Edits

1. **`skills/archive/SKILL.md`** — the largest edit. `:4`, `:18-23`: a plan is a
   folder of either kind (`type: vwf-plan` or `vwf-change-plan`), one row in the
   plan index; delete the flat definition and `docs/plans/<plan>.md`. `:31-38`
   doc paths: drop the `.gap-report.md` companion row (no skill writes one). §1
   resolve (`:47-64`): accept a directory with either `type:`; list candidates
   from the one table, `RUNNING` rows shown in flight; unindexed folder scan
   stays. §2 completion check (`:75-98`): for a cycle folder read *Gaps surfaced
   during execution* in its `index.md` for open rows, and its Run log for a
   non-`green` unit; `requires:` warning per kind (ruling 5). §3 move: delete
   the flat path (`:107-117`); the folder path (`:118-142`) serves both kinds —
   a cycle folder moves within its **target repo** while the row is edited in
   the base; rewrite only the Status block; the landing edit + sweep per
   `assets/plan-index.md`. `:163`: the run log is the folder's; mark the journal
   mirror if mempalace is up.
2. **`skills/backlog/SKILL.md`** — `:8`, `:60`, `:131-138`: `/vwf:plan` and
   `/vwf:change-plan` both call `planned <ids> <folder>` at hand-off;
   `/vwf:execute` and `/vwf:change-execute` both call `done <ids>` at landing;
   the `backlog:` frontmatter is read from a folder's `index.md` for either
   kind; delete "flat cycle plan".
3. **`skills/feedback/SKILL.md:209`** — wording: the change-plan route names the
   folder; nothing else.
4. **`skills/recall/SKILL.md:119-121`** — a handoff's Next prompt routes to
   `/vwf:execute <folder>`; a cap-paused run resumes from the folder's Run log.
5. **`skills/doctor/SKILL.md:241-246`** — `plan` asks the LSP question and
   records it; `execute` halts on blocking and reads the plan's consent row.
6. **`skills/setup/references/onboard-pipeline.md:23-24,164-165`** — scaffold
   `docs/plans/` and `docs/plans/archived/` unchanged; any sentence saying a
   plan is a file becomes a folder.
7. **`skills/blueprint-authoring/SKILL.md:16,61`** and
   **`references/frontmatter-and-links.md:59-60`** — the path glob
   `docs/plans/**/*.md` already matches folders; the `vwf-plan` row's
   description: a plan folder's `index.md`, in the target repo.
8. **`skills/docs-sync/SKILL.md:35,44`** — unchanged in meaning; "plan file" →
   "plan folder" if the word appears.
9. **`mempalace.yaml:71,112`** — the two room descriptions: "cycle-plan" → "plan
   folder" wording consistent with the rest of the line. YAML is `check-yaml`'d
   by pre-commit; keep the quoting.
10. Fold by hand under `plugins/`; `mempalace.yaml` is not markdown.

## Verification

- `grep -rn 'flat\|docs/plans/<plan>.md\|gap-report\|cycle-plan table\|change-plan table\|<date>-<time>' plugins/vwf/skills/archive plugins/vwf/skills/backlog plugins/vwf/skills/feedback/SKILL.md plugins/vwf/skills/recall/SKILL.md plugins/vwf/skills/doctor/SKILL.md plugins/vwf/skills/setup/references/onboard-pipeline.md plugins/vwf/skills/blueprint-authoring plugins/vwf/skills/docs-sync/SKILL.md`
  prints nothing.
- `grep -n 'cycle-plan' mempalace.yaml` prints nothing.
- `grep -n 'type: vwf-plan\|type: vwf-change-plan' plugins/vwf/skills/archive/SKILL.md`
  — both accepted.
- `grep -n 'implementation: complete' plugins/vwf/skills/archive/SKILL.md` hits
  in the `requires:` check.
- `mise run p:plugins:check` green; `mise run code:precommit` green (the YAML).

## Guardrails

- Do not touch
  `plugins/vwf/skills/{plan,execute,change-plan,change-execute}/**`,
  `plugins/vwf/agents/**` or any asset.
- Do not touch `docs/plans/index.md`.
- No escaped backtick inside a code span.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`refactor: archive, backlog and the other plan consumers read folders` — written
by the orchestrator after the wave gate. Type `refactor`; no scope.
