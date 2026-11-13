# Plan — Execute starts with one script, without the doctor skill (2026-11-12)

## Goal

`/vwf:execute` starts with one script call. `start.mjs` does the format test,
the `next` pick or Resolve, the blocking checks, the log start and the
claim, and prints one JSON result. Execute no longer invokes the doctor skill.
The action log marks each start phase at its true boundary.

The framing: a run took a long time to start, and most of the wait was model
turns between mechanical commands. Execute used only doctor's blocking findings
and its LSP findings. The dependency audit, the one non-mechanical blocking
check, belongs to the release, where osv-scanner already gates it.

Three reversals, confirmed by the user (D13): D46 of the unpinned-bootstrap gap
(execute no longer runs the bootstrap dry-run), the audit no longer stops
execute, and execute no longer carries non-blocking doctor findings into its
gap list.

## Facts the survey established

- **Start time today** (action logs under `~/Library/Caches/vwf/claude-plugins/`):
  doctor 12 to 64 s, claim 23 to 63 s, with a model turn of 3 to 6 s between
  commands. The slow commands were doctor's `setup:configs --dry-run` and forge
  reads (39 s once) and the claim commit with pre-commit and push (13 to 24 s).
- **The late marker:** no file places a phase marker for doctor, claim,
  worktree or preflight; `action-log.md:62-63` gives only the generic rule. The
  model improvised, so `phase.end claim` came after the worktree bootstrap. No
  consumer reads phase names (`hooks/monitor/**`, `log.mjs summary` and the
  tests treat them as opaque).
- **Doctor's blocking set** (doctor `SKILL.md:243-255`, `stack-checks.md`):
  iac in another repo, mise, unknown language, binaries, pinned not
  materialized, custom pin, platform coverage, membership links and member url,
  and the critical advisory (dropped from execute). Severity conditions on
  `unresolved`: `stack-checks.md:13-49`.
- **Formats:** `.config/vwf.yaml`, the registry, `.claude/stackgen/lock.yaml`,
  `.config/vwf-membership.yaml` and template frontmatter are YAML; the
  `vwf-tools` plugin manifest and `claude plugin list --json` are JSON. No
  plugin script parses YAML today (`hooks/monitor/plan.ts:99` hand-parses
  `members:` only). Every fixture uses fake data only (D24). This repo's own
  `.config/vwf.yaml` has only `after_landing`, and no `docs/blueprint/`.
- **Unspecified rules the survey found:** the iac decline key (now D7), the
  materializing-adapter test, the mise condition, the unlisted membership file,
  a bundle with no `platforms:`, the LSP mapping (all D9), and the folder's
  missing `projects` key (D8). `claude plugin list` has `--json` and no
  `--scope` flag.
- **Script conventions:** `log.mjs` and `plan.mjs` are `#!/usr/bin/env node`
  ESM with verb dispatch, exit 0/1/2. Tests spawn them from
  `scripts/src/*.test.ts` over temp repos (`execute-log.test.ts`,
  `plan-script.test.ts`, `mockups-serve.test.ts`). Rule 16
  (`scripts/src/check.ts:250-295`): an entry script directly under `scripts/`
  needs the shebang and the executable bit; `lib/` files need neither; only
  `node:` and relative imports; the scan is textual.
- **Gates:** `code:format`, `code:lint`, `p:plugins:check`,
  `p:plugins:marketplace -- --check`, `pnpm vitest run`,
  `tsc --noEmit -p scripts`, `p:site:check`, `code:precommit`. Node is `lts`
  (26 here). Commit types: feat, fix, perf, refactor, revert, test, ops, docs,
  merge, wip; no scopes.
- **Docs that describe today's behaviour:** execute `SKILL.md:16,162`,
  `claim.md:1,29-48`, `setup.md:100-110`, `preflight.md:64,69,86,88,92,114`,
  `action-log.md:87`, `all.md:200`; doctor `SKILL.md:31,122-124,323-334`;
  `delivery-pipeline.md:120-124`; site `plugins/vwf.md:2391-2396,2421-2424,2823,3887`,
  `how-to/operate/ad-hoc-change.md:268-270`; `CLAUDE.md:64`;
  `.claude/skills/vwf-plugin/SKILL.md:87`,
  `references/skills-and-agents.md:38`; `.claude/docs/plugins.md:36-38`;
  `docs/memory/gaps/2026-11-06-unpinned-bootstrap-main-open.md:25-26`.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file — the file a package
manager or a toolchain manager writes to pin what it resolved — with Write,
Edit, `sed` or a script: a lock file changes only as the output of the CLI
that owns it, the command the stack's package-manager conventions name, and
the unit keeps what that CLI wrote. A unit whose manifest change moves a lock
file lists that lock file in its `owns` beside the manifest.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the
block, with two to four options; a block with no question carries the one
line `QUESTION: none`. A question is a point the plan does not decide and the
unit cannot settle inside its scope; the unit never proceeds on an
assumption.

A unit completes every edit that does not depend on an answer, never builds on
a part an answer can change, then returns all its open questions in one block.
Its edits stay uncommitted in the worktree. The orchestrator asks the user,
records each answer in `decisions`, and resumes the unit with the question ids
and answers; the resumed unit applies them and returns the whole block again
(the execute skill's `references/questions.md`).

## Out of scope

- Scripting `unclaim` and the completion edit: neither is on the start path
  (D17).
- The non-blocking doctor checks: drift stays doctor's job (D5).
- The dependency audit's place in `/vwf:plan`, `/vwf:setup` and the
  `pipeline/dependency-audit` text beyond the execute parenthesis: not part of
  the start of execute.

## Parked

- The LSP check of `/vwf:execute` (D22): it waits on bootstrap installing LSP
  servers. Until then a run with a `code` unit has no LSP gate. Record:
  `docs/memory/gaps/2026-11-13-execute-lsp-check-parked.md`.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-12-execute-scripted-start

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
