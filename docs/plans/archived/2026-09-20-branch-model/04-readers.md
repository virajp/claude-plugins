# U4 — the readers: git-workflow, doctor, CONTRIBUTING

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/git-workflow/SKILL.md`,
  `plugins/vwf/skills/git-workflow/references/landing.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/CONTRIBUTING.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `git-workflow/SKILL.md:31-35`, Step 4 `:186-225` (`:197-199`
  the read, `:206-219` the options); `landing.md` (`:21`, `:34-35`, `:58-76`);
  `stack-checks.md` predicates (c) `:375-382`, (f) `:482-493`, (g) `:509-570`;
  `CONTRIBUTING.md:23-41`.
- **Lazy-load:** the mise pack's `_scripts/merge` (U3's — cite the task names
  only).

## Ruling

Decision 1 — Per-branch landing: "… git-workflow's Step 4 reads the one for its
destination; the forge pass writes the require-PR rule per branch from that
branch's value; doctor (f) checks both. A repo still carrying `MERGE_MODEL`
alone: every reader takes it as both values, and doctor (f) reports "legacy
`MERGE_MODEL` — reshape writes the pair"."

Decision 2 — Branch names fixed; decision 3 — the ops commit on `develop`:
CONTRIBUTING's branch passage restates the flow with the per-branch model.

## Edits

1. **`git-workflow/SKILL.md`** — Step 4's read (`:197-199`) resolves the
   variable for the destination it is about to land on (`develop` for the branch
   landing, `main` for `code:merge:main`), with the legacy fallback in one line;
   `:31-35` and the options' wording (`:206-219`) say "under `direct` for this
   destination" / "under `pr` for this destination".
   **`landing.md:21, 34-35, 58-76`** — the same per-destination read where the
   pr semantics per member are described.
2. **`stack-checks.md`** — (f) `:482-493` checks both positions, each
   `direct|pr`; a lone legacy `MERGE_MODEL` is drift with the message "legacy
   `MERGE_MODEL` — reshape writes the pair"; unset → `direct` for `develop`,
   `pr` for `main`. (g) `:536-558` reads each branch's own value for the
   require-PR expectation. (c) `:375-382` unchanged.
3. **`CONTRIBUTING.md:23-41`** — `:30-32` names the two variables and what each
   branch's model means for a contributor; `:23-27` says the shaping commit
   lands on `develop`; no plugin path (rule 13).

## Verification

- `mise run p:plugins:check` green (rule 13 over CONTRIBUTING).
- `grep -n "MERGE_MODEL_DEVELOP\|MERGE_MODEL_MAIN" <each owned file>` — hits in
  all four.
- `grep -n "legacy" plugins/vwf/skills/doctor/references/stack-checks.md plugins/vwf/skills/git-workflow/SKILL.md`
  — the fallback named in both.

## Guardrails

- Do not edit `init/**` (U1, U2) or the mise pack (U3).
- `config/CONTRIBUTING.md` is payload — by hand, no formatter, no plugin path.
- No doc outside the owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` outside `config/` is not dprint-formatted: match the fold
  width by hand; strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: git-workflow, doctor and CONTRIBUTING read the landing model per branch`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
