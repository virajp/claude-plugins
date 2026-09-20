# U6 — doctor skips the skipped; the repo-gates bundle stops claiming a fragment

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/stackgen/stacks/bundles/repo-gates.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `stack-checks.md` predicate (a) (pack versions) and (e)
  (content drift) and whatever passage says a lockfile-recorded path that is
  absent is drift; `bundles/repo-gates.md:21-26`.
- **Lazy-load:** `plugins/stackgen/assets/output-tree.md` (U1's — the `skipped:`
  list; cite by key name).

## Ruling

Decision 1, doctor's part: "doctor never reports a skipped path as missing; a
later run whose answer changed re-evaluates."

Decision 6, the bundle half: "`bundles/repo-gates.md:21-26` says no gate ships a
`pre-commit.d` fragment (the hook-fragment merge has no inputs from the three
bundles today)".

## Edits

1. **`stack-checks.md`** — where predicate (e) or (a) treats an absent recorded
   path as drift, one sentence: a path under the lockfile's `skipped:` list is
   intentionally absent and is not drift; a path present on disk **and** listed
   as skipped is reported as "landed by hand, skipped by condition" — drift,
   remedy reshape.
2. **`bundles/repo-gates.md:21-26`** — the claim that each gate ships a
   `.config/pre-commit.d/<gate>.yaml` is replaced by: the gate packs ship no
   hook fragment; the hook-fragment merge takes fragments from packs outside the
   three bundles (the uv pack is the one today); the site already says so.

## Verification

- `mise run p:plugins:check` green.
- `mise run p:plugins:inventory -- --check` green (the bundle file's pins are
  untouched).
- `grep -n "skipped" plugins/vwf/skills/doctor/references/stack-checks.md` —
  present at (e).
- `grep -n "pre-commit.d" plugins/stackgen/stacks/bundles/repo-gates.md` — only
  in the corrected sentence.

## Guardrails

- Do not edit the bundle's pin lines (U9's).
- No doc outside the two files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`fix: doctor treats a skipped path as absent by design; repo-gates bundle drops the fragment claim`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
