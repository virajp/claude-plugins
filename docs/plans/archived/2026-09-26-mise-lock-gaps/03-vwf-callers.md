# U3 — vwf's callers of setup:all pass MISE_ENV=dev

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md`,
  `plugins/vwf/skills/readme/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `new-repo.md` §10 (:685-706) and §9 (:638ff);
  `worktree-setup.md` :90-120; `readme/SKILL.md` :65-115.
- **Lazy-load:** `.claude/skills/plugin-authoring/SKILL.md` if `p:plugins:check`
  flags prose.

## Ruling

Quoted from index.md's assumed decisions:

> - Decision 4: `setup:all` exits 1 when `MISE_ENV` is unset, before any step,
>   with a message naming `MISE_ENV=dev mise run setup:all`.
> - Decision 5: Every vwf passage that runs or tells a user to run `setup:all`
>   uses `MISE_ENV=dev mise run setup:all`: init's §10 bootstrap offer,
>   git-workflow's fallback, the readme skill's setup line.
> - Decision 9: Any comment a unit adds or edits is one line; a few lines only
>   where needed.

## Edits

1. **`new-repo.md` §10** — the bootstrap aggregator is run as
   `MISE_ENV=dev mise run setup:all`; say why in one sentence (it refuses an
   unset `MISE_ENV`).
2. **`worktree-setup.md`** — the fallback at :103-104 runs
   `MISE_ENV=dev mise run setup:all`; correct :109-116 so it no longer says the
   fallback re-does a tool upgrade (the last run's R2 finding: `setup:all`
   upgrades only under `--upgrade`) and states that it installs from the
   lockfile.
3. **`readme/SKILL.md`** :73, :109 — the setup command a README shows is
   `MISE_ENV=dev mise run setup:all`, with the one-line reason.

## Verification

- `mise run p:plugins:check` green
- `grep -rn "mise run setup:all" plugins/vwf/skills` shows no occurrence without
  `MISE_ENV=` except in prose that is not a command

## Guardrails

- `plugins/**/*.md` is not formatted — match the surrounding fold width by hand.
- Touch nothing outside the three owned files.
- No code span wraps a line.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`fix: vwf — init, git-workflow and readme run setup:all with MISE_ENV=dev` —
written by the orchestrator after the wave gate.
