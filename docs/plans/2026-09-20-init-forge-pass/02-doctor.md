# U2 — doctor: predicate (g), forge state

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/backlog/references/github.md` §Precondition
  and §Resolving the project (the commands the predicate reuses to find the
  backlog project — read, never edit).

## Ruling

Decision 7 — Doctor predicate (g): "A seventh baseline predicate, **forge
state**: the default branch as chosen, both branches protected, the backlog
project present; evaluated per repo when the forge CLI is on PATH and logged in
to the origin host, otherwise skipped with a note; drift, not blocking, remedy
`/vwf:setup reshape` like the six. Setup Step 0 cites seven."

Decision 3 — "The forge is the record — no key in the tree": the predicate reads
the forge, never a tree file, for the default branch.

Decision 4 — the rules the predicate checks for: on both `develop` and `main`,
no force-push and no deletion; require-PR only when `MERGE_MODEL` is `pr` (read
from the repo's `mise.toml` env block as predicate (f) already does). GitHub: a
ruleset named `vwf-<branch>` **or** any ruleset/protection on the branch
carrying those rules counts as protected — the pass leaves existing protection
alone, so doctor must not flag it. GitLab: a `protected_branches` entry for the
branch.

Decision 6 — the backlog project: resolved the way the backlog skill resolves it
— by title from the base repo's remote — once per product, reported under the
base repo's section only.

Decision 11 — Vocabulary: "forge pass" is the name; the CLI is named per forge
in the references only.

## Edits

1. **`plugins/vwf/skills/doctor/references/stack-checks.md`** — after predicate
   (f) (`:284-453` is the six), add **(g) forge state** in the same shape as its
   neighbours: what it reads (the origin host, the forge CLI's auth for that
   host — the same probe the recommended forge-CLI check at `:264-280` already
   runs, reused rather than repeated), the three checks (default branch matches
   what the repo's git pass chose — read from the forge with
   `gh repo view --json defaultBranchRef` / `glab repo view`; both branches
   protected per the ruling; the backlog project present, base only), the skip
   rule (CLI absent or unauthenticated → one note line, not drift), the finding
   shape (drift, never blocking) and the one remedy `/vwf:setup reshape`. Any
   passage that says "six predicates" or "(a)–(f)" as the closed set becomes
   seven / (a)–(g).
2. **`plugins/vwf/skills/doctor/SKILL.md`** — wherever the baseline predicates
   are enumerated or counted, add (g) in one line and make the count seven; the
   forge-CLI probe's sentence that names `/vwf:backlog` gains "and predicate
   (g)".

## Verification

- `mise run p:plugins:check` green.
- `grep -n "six" plugins/vwf/skills/doctor/SKILL.md plugins/vwf/skills/doctor/references/stack-checks.md`
  — no remaining count of the baseline predicates as six.
- `grep -n "(g)" plugins/vwf/skills/doctor/references/stack-checks.md` — the
  predicate exists and names `/vwf:setup reshape` as its remedy.

## Guardrails

- Do not touch `plugins/vwf/skills/setup/**` (U4 cites seven there) or
  `plugins/vwf/skills/init/**` (U1).
- No doc outside `plugins/vwf/skills/doctor/` — report every falsified passage
  as `DOCS FALSIFIED:`.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: doctor reads the forge state as predicate (g)` — written by the
orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml`; no scopes.
