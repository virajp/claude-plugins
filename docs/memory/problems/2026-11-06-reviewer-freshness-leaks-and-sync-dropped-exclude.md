PROBLEM 2026-11-05 ★3 | fresh reviewers and plan gates | a ledger reviewer read
the writer's round record and a diff, and a bootstrap sync dropped a repo
exclude so the plan gate went red on files no unit owns — name what a reviewer
reads, and keep repo excludes in bootstrap.toml | fix applied

**Source plan** `2026-11-05-change-plan-pilot`,
`2026-11-06-execute-rule-defects`

Freshness leak (pilot, gaps G7 and G8):

- The restore-check unit read `round.md`, the record of the earlier unit, before
  it compared. Its unit file did not forbid this. A re-dispatched unit then ran
  `git diff` on the skill, so it saw old and new wording together.
- Result: the user accepted the verdicts, since each check verified the quote
  of the rule. A diff carries no writer reasoning, so it does not break the
  freshness rule.
- Avoid it: a reviewer unit file names the files it reads and the files it never
  reads (the writer's round record, the unit files of the writer, the history).

Plan gate red on files no unit owns (execute-rule-defects, gap G2):

- `mise run code:precommit` failed because `end-of-file-fixer` rewrote 30 SVG
  files under `docs/design/`. Commit `e02b4ac5` (a bootstrap sync) had dropped
  the `docs/design` exclude that commit `8fee757b` added, for exports kept byte
  for byte.
- The run left the files unedited and did not land. The user restored the
  exclude on `develop` (`7296ed3f`) and the branch took it by merge.
- Cause: a bootstrap sync replaces the generated exclude line. Today the
  exclude lives in `[tools.pre-commit]` of `.config/bootstrap.toml`
  (`exclude = [ "^docs/design/" ]`). Never edit the generated line by hand.
- Avoid it: when a gate fails on files outside the unit's Owns, check the last
  sync commit first.
