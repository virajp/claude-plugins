DECISION 2026-11-12 ★4 | skill:execute, skill:doctor, skill:plan-management |
execute starts with one script call, start.mjs, and no longer runs the doctor
skill → a run spent most of its start in model turns between mechanical
commands | alt rejected: keep doctor and the claim as model steps

# Execute starts with one script, without the doctor skill

Source plan: `docs/plans/2026-11-12-execute-scripted-start/` (decisions D1 to
D48).

`/vwf:execute` starts with one call, `execute/scripts/start.mjs`: the format
test, the `next` pick or the resolve, the refusals, the log start, the blocking
checks of `doctor/scripts/checks.mjs` and the claim, printed as one JSON result.

## Three reversals (D13, confirmed by the user)

1. **Execute no longer runs the unpinned bootstrap dry-run.** D46 of
   `docs/memory/gaps/2026-11-06-unpinned-bootstrap-main-open.md` said plan and
   execute run doctor and behaviour stays. Execute no longer runs doctor, so it
   no longer runs the dry-run. Why: start speed. Rejected: keep it.
2. **A critical dependency advisory no longer stops `/vwf:execute`.** It still
   stops `/vwf:plan` and `/vwf:setup`. Why: the audit belongs to the release,
   and osv-scanner already gates it through `code:sec` and `release.yml`.
   Rejected: keep the audit in execute's start.
3. **Execute no longer carries non-blocking doctor findings into its gap
   list.** Why: drift is doctor's job (D5). Rejected: script the cheap
   non-blocking checks into gap rows.

## The rulings, in short

- D1, D2: the claim and the resolve are scripted in this plan, in one start
  script; the session and resume questions stay with the model. Rejected: a
  separate plan; checks and claim only.
- D3: code split by owner — `plan.mjs pick|resolve|claim` (logic in
  `plan-management/scripts/lib/queue.mjs`), `doctor/scripts/checks.mjs`, and
  `execute/scripts/start.mjs` over both. Rejected: all in start.mjs; several
  model calls.
- D4: an own YAML subset reader, `plan-management/scripts/lib/yaml.mjs`, that
  throws on anchors, aliases, tags and multi-document files. Rejected: a
  vendored library; `yq`.
- D6: doctor runs `checks.mjs` and reports its rows as they come; the script is
  the one source of those rules. Rejected: two cross-linked copies.
- D7: a declined `iac` extraction is
  `enforcement.rules.topology/iac-own-repo/<project>: { waived: true, reason }`.
  Rejected: a loose match on any key containing `iac`.
- D8, D23: the plan's projects come from its units' `owns`, by longest
  registry path prefix per path segment, member paths prefixed with the
  member's path. Rejected: `release_levels` ids; a new `projects` key.
- D9: the unstated rules settled once — when an axis counts as pinned, when a
  pin is materialized, the membership half, a template with no `platforms:`,
  the integration branch `develop` on `origin`, the full rejected-push loop.
  Rejected: asking each.
- D10, D42, D43: the phase `doctor` is renamed `checks`; start.mjs writes the
  `checks` and `claim` markers at their true boundaries, a fresh run's checks
  markers after the log start with `started`/`ended` fields, which
  `log.mjs summary` reads before `ts`. Rejected: leave markers to the model;
  two code paths.
- D11, D14: one security-only review unit before the docs unit; every unit of
  this change plan is `edit`. Rejected: no review unit; `code` units.
- D12, D36: solo, after U2 moved behind U4 so its citations exist. Rejected:
  teams.
- D15, D16, D17: the JSON contracts of `start.mjs`, `checks.mjs` and the queue
  verbs, exit 0/1/2. Rejected: text output.
- D18, D27, D34, D37: every row and folder value is read from the
  `origin/develop` tip; a resume is this machine's when its `run.worktree`
  exists here, and is refused when another session marker names the log.
  Rejected: refuse every `RUNNING` row; read the working copy.
- D19, D30: a member claim runs base first; a failed member push is refused
  with the unclaim request, outcome `claim-failed`, never a re-pick. Rejected:
  member first with a revert.
- D20: `--worktree` passes an `all` override's shared path. Rejected: read the
  override from the folder.
- D21: start.mjs closes the log it opened, outcome `blocked` or `claim-lost`.
  Rejected: start the log after the checks.
- D22: the LSP check is **parked** until bootstrap installs LSP servers; until
  then a run with a `code` unit has no LSP gate. Record:
  `docs/memory/gaps/2026-11-13-execute-lsp-check-parked.md`. Rejected: guess
  which `claude plugin list --json` entries mean enabled.
- D24: every fixture holds fake data only. Rejected: copies of real configs.
- D25: under `next`, a picked plan that fails a refusal stops; only a lost
  claim re-picks. Rejected: skip and re-pick.
- D26: start.mjs spawns `log.mjs` as a child process. Rejected: refactor
  `log.mjs` exports.
- D28: `/vwf:plan` keeps asking the LSP question and writing `consent.lsp`;
  execute does not read it until the parked check returns. Rejected: stop
  asking.
- D29: no reachable config, and a config with no registry, are `info` rows.
  Rejected: not-onboarded is blocking.
- D31, D32, D33: `claimed` is true only after its push lands; any other commit
  or push failure undoes the claim commit and refuses, the clean-rebase retry
  capped at 3; a conflicted stash pop keeps the claim and warns. Rejected:
  retry with a wait; refuse until the stash is resolved.
- D35: a requirement in an uncloned member is unsatisfied, with no network
  read. Rejected: a shallow fetch.
- D38: with no `stacks:` (or `stacks: []`) the materialized check passes.
  Execute's start checks stay few; a check that only catches a repo not set up
  belongs in `/vwf:doctor`
  (`2026-11-13-execute-start-checks-stay-few.md`). Rejected: blocking.
- D39, D40, D44, D47: a language is known only when the project's pinned
  template lists it, no installed plugin read. Unknown is a degradation in
  `checks.mjs` and `/vwf:doctor`, which never re-rates it; `/vwf:setup` alone
  stops on it. D40 corrects D39's "doctor keeps its full rule". Rejected:
  doctor re-rates with its full rule; blocking everywhere.
- D41, D45, D46: when an unknown language is the only stopping finding,
  start.mjs returns before the claim and execute asks continue or stop; on
  continue it re-runs with `--continue-unknown-language`. The question is
  recorded nowhere, and never asked on a resume. Rejected: claim first; record
  after the claim; ask again on a resume.
- D48: the claim takes its stash SHA from `refs/stash` right after the push,
  re-checks `stash@{n}` before the drop and warns instead of dropping on a
  mismatch. Rejected: accept the two low findings as residual.
