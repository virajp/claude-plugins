PROBLEM 2026-09-05 ★3 | per-unit commits in a plan wave | pre-commit stashes
unstaged work, so a rule that scans files from other units fails the first
commit | commit the wave as one, or order the rule-adding unit last

**Source plan** `2026-09-05-cloudflare-workers-static`,
`2026-09-05-site-seo-and-markdown`.

Cause: the repo's pre-commit stashes all unstaged work before the hooks run.
A hook sees only the staged files of one unit. `plugins:check` then ran
against a tree where a new pack, its category and a widened allowlist were not
all present at once. The first attempt (unit 1 alone) failed this way.

What worked:

- Land a wave of coupled units as one commit. The plan text allowed one or two
  commits per wave and forbade `--no-verify`.
- Run `plugins:inventory` before staging, because the inventory is generated
  and a new pack makes it stale.
- A plan that adds a checker rule commits that unit after the units the rule
  scans.
- Use only commit types that the repo's commit config lists. A unit file named
  `test(site):` and pre-commit rejected it. The committed type was `ops(site):`.
- Remove untracked residue from the orchestrator's own gate runs (for example
  `site/.wrangler/` from `wrangler dev`) before the commit.
