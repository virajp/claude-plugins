# U2 — Skill and asset prose for the scripted start

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `docs/plans/2026-11-12-execute-scripted-start/index.json`
  `decisions` (the contracts D15, D16, D17), `plugins/vwf/skills/git-workflow/references/worktree-setup.md`.

## Ruling

> D2: "one start script. It also does the format test and the next pick. The
> session question and the resume questions (open QUESTION gaps and unanswered
> question events) stay with the model, because they ask the user."

> D5: "Drop them. The run's gap list no longer carries doctor rows. The LSP
> gaps that preflight.md writes itself (unavailable; no consent.lsp key) stay."

> D6: "Doctor runs the script. For the findings checks.mjs covers, doctor calls
> it and reports its rows; the prose points to the script as the source and
> keeps the reasons."

> D7: "enforcement.rules.topology/iac-own-repo/<project>: { waived: true,
> reason: <one line> }. vwf-config.md, the topology assets and setup's decline
> step name exactly that key; setup writes it."

> D10: "The phase doctor is renamed checks. start.mjs writes phase.start and
> phase.end for checks and for claim itself, each at its true boundary.
> setup.md gets explicit log lines for phase.start/phase.end of worktree and of
> preflight."

> D13 (2): "A critical dependency advisory no longer stops /vwf:execute; it
> still stops /vwf:plan and /vwf:setup."

> D18: "When the row at the tip reads RUNNING, read run.worktree from the main
> checkout copy. If that worktree exists on this machine, read status, gaps
> and the log from the worktree copy of the folder: mode resume [...] If it
> does not exist, result refused" (folder.md's resume text says this).

> D19: "Base first: the row in the base is the claim. Then the member commit of
> the folder run key runs the same procedure in the member checkout [...] If
> the member push still fails, claim returns {claimed: false, reason} and
> start.mjs returns refused; the message names the failure and the
> plan-management unclaim <folder> request" (plan-index.md and
> plan-management SKILL.md say this).

> D20: "start.mjs and plan.mjs claim take --worktree <repo-relative path>.
> Without it, the default <dir>/<plan name> applies. all.md says the runner
> passes the shared path from the override."

> D21: "start.mjs closes it. On blocked: event stop, then end --outcome
> blocked. On a lost claim [...]: event stop, then end --outcome claim-lost.
> [...] action-log.md adds claim-lost to its outcome list."

> D22: "Until then checks.mjs and start.mjs check no LSP. The lsp key is
> dropped from the D15 and D16 contracts and D9 (e) is void. preflight.md
> loses its LSP rule and gets one line: the LSP check waits on the bootstrap
> work (docs/memory/gaps/2026-11-13-execute-lsp-check-parked.md). A run with a
> code unit proceeds without an LSP gate until then."

> D25: "Stop with refused, naming the picked folder and the refusal, the same
> as a named folder. Only a lost claim re-picks (D15)." (next.md says this.)

> D28: "Keep asking. /vwf:plan keeps its LSP question and keeps writing
> consent.lsp, so the answer is ready when the parked check returns. U2 owns
> plugins/vwf/skills/plan/SKILL.md and plugins/vwf/assets/plan-interview.md
> and changes only the passages that say execute reads the key: they say
> execute does not read it until the parked work lands
> (docs/memory/gaps/2026-11-13-execute-lsp-check-parked.md)." The passages:
> `plan/SKILL.md:184-186`, `plan-interview.md:88-90`.

> D30: "[a member push failure] Result refused under next and under a named
> folder alike [...] no re-pick. Log: event stop, then end --outcome
> claim-failed. action-log.md adds claim-failed to its outcome list."

> D34 (U2 part): "G5: U2 owns plugins/vwf/assets/templates/plan-folder.md and
> changes only lines 380-383 under D28." (Edit 4's "leave `consent.lsp` in
> the template alone" means: keep the key; fix only that passage.)

> D36: "Move U2 after U4 [...] Execution mode becomes solo (D12 amended)." U2
> runs in wave 4, so `start.mjs`, `checks.mjs` and the new `plan.mjs` verbs
> exist: read them and describe what they do.

> D37 (U2 parts): "G3: U2 owns
> plugins/vwf/skills/setup/references/migration-and-consent.md and names the
> D7 key at line 24. G4: D22 governs preflight.md; the LSP sentence of D5 is
> void."

D15, D16 and D17 in `index.json` are the contracts this prose describes; quote
their verbs, flags, keys and exit codes exactly.

## Edits

1. **`execute/SKILL.md`** — `depends-on`: drop `doctor`. The phase-table row
   "Start the log, run doctor, claim the row" becomes "Start: one script call
   (format test, pick, Resolve, checks, log start, claim)", pointing at
   `claim.md`. The format test text says `start.mjs` runs it; the session
   question stays first and stays the model's.
2. **`execute/references/claim.md`** — rewrite as the start step: the one call
   `node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/start.mjs <folder|next>`,
   its JSON result per D15, and what the model does for each `result`: `ready`
   continues to Setup; `refused`, `blocked` and `nothing` print `message` and
   the findings with their remedies, and stop. On `ready` with `mode` `resume`
   and a non-empty `open_questions`, ask each per `questions.md` before Setup.
   Keep the reasons the old text gave (why the checks run before the claim; why
   the two main-checkout edits; why the run branch never carries the index).
   Keep *The folder's status* section. Drop the `/vwf:doctor` invocation, the
   "Keep the report" line and the audit.
3. **`execute/references/setup.md`** — step 2 drops the LSP reading and the
   doctor report (no "doctor already ran", no "everything else doctor
   reports"); it says the LSP check waits on the parked bootstrap work (D22). Add
   explicit `log.mjs event phase.start --phase worktree` before step 1 and
   `phase.end --phase worktree` after it, and the same pair for `preflight`
   around step 2 and its gate lines.
4. **`execute/references/preflight.md`** — remove *The LSP rule (Setup step
   2)* and put the one D22 line in its place; a "doctor reports unknown" line
   becomes the start result's `findings` row; line 92's carry-into-gap-list
   sentence is removed (D5); line 114's note names `checks.mjs`. Leave
   `consent.lsp` in the plan-folder template alone: `/vwf:plan` still writes it.
5. **`execute/references/action-log.md`** — the phase list starts `checks`,
   `claim`, `worktree`, `preflight`; say `start.mjs` writes the first two.
6. **`execute/workflows/folder.md`** — Resolve is `start.mjs`: list what it
   refuses, in the same words, as the script's refusals, and keep the resume
   rules the model still applies (the open questions). The line 28 contrast
   "Unlike `plan` and `doctor`" may stay.
7. **`execute/workflows/next.md`, `execute/workflows/all.md`** — the pick is
   `start.mjs next` (a run) or `plan.mjs pick` (the loop's re-pick). `all.md`
   line 200 drops `/vwf:doctor` from the preferences a runner passes.
8. **`plan-management/SKILL.md`, `references/plan-index.md`** — the `claim`,
   `next` pick and resolution are now the verbs `plan.mjs claim`, `pick` and
   `resolve` (D17); the procedure text stays as the rule the verbs implement.
   Unclaim and completion stay model procedures.
9. **`doctor/SKILL.md`** — the Callers paragraph: `/vwf:execute` no longer
   runs doctor; it runs `checks.mjs` through `start.mjs`. Line 31 and lines
   122-124 lose execute. Add a short section naming
   `node ${CLAUDE_PLUGIN_ROOT}/skills/doctor/scripts/checks.mjs` as the source
   of the D16 findings, which doctor runs and reports. The audit stays, its
   callers now `/vwf:plan` and `/vwf:setup`.
10. **`doctor/references/stack-checks.md`** — for each D16 finding, point to the
    script as its implementation and keep the reason. Lines 31, 223, 299, 309,
    318, 369: a "setup and execute halt" phrase stays true (execute halts
    through `start.mjs`); reword only where it says doctor halts execute. Name
    the D7 key where it says "a decline written under `enforcement:`".
11. **`setup/SKILL.md`** — the iac decline step writes the D7 key; line 319
    still holds.
12. **Assets** — `delivery-pipeline.md` around line 120: the parenthesis
    becomes "halting `/vwf:plan` and `/vwf:setup`". `vwf-config.md`: document
    the D7 rule id beside the other `enforcement.rules` ids.
    `topologies/repo.md`, `monorepo.md`, `multi-repo.md`: name the D7 key where
    they say the decline is recorded. `stack-vocabulary.md`,
    `capability-vocabulary.md`, `membership.md`: reword only a passage that
    says doctor halts execute; leave "execute halts" where it stays true.

## Verification

- `grep -rn "doctor" plugins/vwf/skills/execute` hits only the `folder.md`
  contrast line and `checks.mjs` mentions.
- `grep -rn "iac-own-repo" plugins/vwf` hits `vwf-config.md`, `setup/SKILL.md`,
  `stack-checks.md` and the topology assets.
- `mise x -- mise run p:plugins:check` is green.

## Guardrails

- Touch nothing outside `owns`; never edit the scripts (U1, U3, U4) or a
  human-facing doc (U6).
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- Skill frontmatter is strict YAML; keep `depends-on` a valid flow list.
- No plugin-relative path citation in a pack payload (not touched here).

## Commit

`docs: execute starts with one script; doctor runs the checks script`
