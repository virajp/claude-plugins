# U1 — init's git pass: the per-branch rows, develop first, the mainline rule

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom (locate by heading — plans 2
  and 3 re-shape both): `new-repo.md` §1 (`:21-32`), §11 (`:455-490` the
  MERGE_MODEL question, `:546-559` the commit, `:580-590` the branch table), the
  forge pass (`:612-760`, esp. `:674-690`, `:731-733`); `SKILL.md:88-110`,
  `:350`, `:417-421`.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml:118-128`
  (the position being replaced — read only; U3 edits it); `existing-repo.md`'s
  git pass (U2's — cite).

## Ruling

Decision 1 — Per-branch landing: "Two marked positions replace `MERGE_MODEL` in
the mise pack's `mise.toml`: **`MERGE_MODEL_DEVELOP`** (preselected `direct`)
and **`MERGE_MODEL_MAIN`** (preselected `pr`), values `direct` or `pr`. Init's
git pass asks one row per repo per branch — a two-column table under the
existing question. … the forge pass writes the require-PR rule per branch from
that branch's value …"

Decision 2 — Branch names: "Fixed: `develop` and `main` (the B53 answer). A repo
whose mainline is `master` or `trunk` (or any other name): the git pass creates
`main` from that mainline and `develop` from `main`, checks out `develop`,
leaves the old branch in place and reports it in the run's summary for the user
to retire; the forge default-branch row applies to the new pair."

Decision 3 — The ops commit: "Lands on **`develop`** in every mode — checked
out, or created first from the mainline per decision 2 — never on `main` or
another branch; the creation table gains the "checked out: develop" column and
loses "as it was"."

Decision 4 — Detached member, the part init's summary carries: "a detached
member is a **refused plan row** naming the branch to check out … the member's
shaping is deferred, the base's gitlink for it is not moved".

## Edits

1. **`new-repo.md` §11** — the `MERGE_MODEL` question (`:455-490`) becomes the
   two-row table of decision 1 with its preselections; the write goes to the two
   marked positions (name them exactly); the kept-file rule (`:481-490`) reads:
   a kept file carrying the legacy single key keeps it and is reported "legacy
   `MERGE_MODEL` — read as both until reshape". The branch table (`:580-590`)
   gains decision 2's mainline row and decision 3's checkout column; the commit
   step (`:546-559`) is preceded by "check out `develop`, creating it per the
   table". A one-line **HEAD read** before the pass: each repo's
   `git symbolic-ref -q HEAD`; detached → decision 4's refused row (the
   mechanics are U2's in `existing-repo.md` and `membership.md` — cite).
2. **`new-repo.md` forge pass** (`:682-690`, `:731-733`) — the require-PR rule
   is written per branch from that branch's own value.
3. **`SKILL.md:88-110`, `:350`, `:417-421`** — the summary names the two
   positions, "the ops commit lands on `develop`", the mainline rule, and the
   detached-member refusal, one clause each.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "MERGE_MODEL_DEVELOP\|MERGE_MODEL_MAIN" plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/new-repo.md`
  — hits in both; `grep -n "MERGE_MODEL\b" …` — only in the legacy sentence.
- `grep -n "as it was" plugins/vwf/skills/init/references/new-repo.md` — zero
  hits in the branch table.
- `grep -n "master\|trunk" plugins/vwf/skills/init/references/new-repo.md` — the
  mainline rule present.
- `grep -n "symbolic-ref\|detached" plugins/vwf/skills/init/references/new-repo.md`
  — the HEAD read present.

## Guardrails

- Do not edit `existing-repo.md` or `membership.md` (U2), the mise pack (U3),
  git-workflow, doctor or CONTRIBUTING (U4).
- Rule 10 — no technology token in `SKILL.md` prose.
- No doc — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init git pass — landing model per branch, ops commit on develop, mainline and detached-member rules`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
