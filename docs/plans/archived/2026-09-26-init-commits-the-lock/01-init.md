# U1 — init locks before its ops: commit and commits the lock

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `new-repo.md` §10 and §11 (the bootstrap offer and the git
  pass: staging, the `ops:` commit, member order); `existing-repo.md`'s git
  pass; `SKILL.md`'s git-pass summary; index.md's Facts.

## Ruling

> - Decision 1: Before each repo's `ops:` commit — members first, then the base
>   — init runs `MISE_ENV=dev mise run setup:mise --lock-only` and stages
>   `.config/mise/mise.lock` and `.config/mise/locks/**` into that commit; on a
>   new repo, and on a reshape that finds no lock.
> - Decision 6: Any sentence a unit adds is short.

## Edits

1. **`new-repo.md` §11** — a step before staging: run the command in the repo;
   the two lock paths join the staged list (§11(b)'s "written / moved / renamed
   lists" gains "and the lock `setup:mise --lock-only` wrote"). A failure stops
   the git pass for that repo with the command's output, before any commit.
2. **`existing-repo.md`** git pass — the same step when `.config/mise/mise.lock`
   is absent; a present lock is never rewritten.
3. **`SKILL.md`** — the git-pass summary names the lock step in one line.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the three owned files.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`fix: vwf init commits the mise lock with the ops commit` — written by the
orchestrator after the wave gate.
