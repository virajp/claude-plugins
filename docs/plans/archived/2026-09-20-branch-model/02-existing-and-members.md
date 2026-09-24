# U2 — the existing pipeline's git pass, and the members' checkout

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/assets/membership.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `existing-repo.md`'s git pass (locate by heading; today
  `:330-333`, `:558-563` the MERGE_MODEL fill, `:889-911` the forge-pass
  reference and the branch restatement `:905-907`); `membership.md:120-130` (the
  clone step, `:126` `git submodule update --init`).
- **Lazy-load:** `new-repo.md` §11 (U1's — cite the table and the HEAD read by
  name).

## Ruling

Decision 1 — the existing pipeline's fill of the two positions and the legacy
rule: "A repo still carrying `MERGE_MODEL` alone: every reader takes it as both
values, and doctor (f) reports "legacy `MERGE_MODEL` — reshape writes the
pair"."

Decision 3 — The ops commit: "Lands on **`develop`** in every mode — checked
out, or created first from the mainline per decision 2 — never on `main` or
another branch".

Decision 4 — Detached member: "Before the git pass, read each member's HEAD
(`git symbolic-ref -q HEAD`); a detached member is a **refused plan row** naming
the branch to check out (`develop`, or the mainline), the member's shaping is
deferred, the base's gitlink for it is not moved; `assets/membership.md`'s clone
step checks out the member's default branch after `submodule update --init` so a
member cloned by the run is never detached."

## Edits

1. **`existing-repo.md`** — the MERGE_MODEL fill (`:558-563`, `:330-333`) fills
   the two positions and states the legacy rule for a kept file; the branch
   restatement (`:905-907`) points at U1's table (cite) and says the ops commit
   is made on `develop` after checking it out; before the gate-first commit, the
   HEAD read of decision 4: a detached member is a refused row, its shaping
   deferred, its gitlink untouched, the reason and the checkout command in the
   report.
2. **`membership.md:126`** — after `git submodule update --init`, check out the
   member's default branch (`origin/HEAD`'s target, else `develop`, else `main`)
   so the member is on a branch; one sentence on why (a detached member cannot
   take the shaping commit).

## Verification

- `mise run p:plugins:check` green.
- `grep -n "MERGE_MODEL_DEVELOP\|MERGE_MODEL_MAIN" plugins/vwf/skills/init/references/existing-repo.md`
  — present at the fill.
- `grep -n "detached" plugins/vwf/skills/init/references/existing-repo.md plugins/vwf/assets/membership.md`
  — hits in both.

## Guardrails

- Do not edit `SKILL.md` or `new-repo.md` (U1), the mise pack (U3), or
  git-workflow/doctor/CONTRIBUTING (U4).
- No doc — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: existing pipeline fills the per-branch model; a detached member is refused; clones check out a branch`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
