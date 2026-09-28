# U7 — setup, doctor and the vwf assets follow the gates and the graphify hook

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/doctor/**`,
  `plugins/vwf/assets/{memory,graphify}.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** setup `SKILL.md:110`, `references/onboard-pipeline.md:58`;
  doctor `references/stack-checks.md:287`,
  `references/harness-and-memory.md:56`, `references/code-intelligence.md:32`;
  `plugins/vwf/assets/memory.md:249`, `plugins/vwf/assets/graphify.md:99`;
  index.md's Facts.

## Ruling

> - Decision 5: `default_install_hook_types` gains `post-commit`; a local
>   `graphify-refresh` hook at stage `post-commit` runs
>   `mise x -- mise run code:graph`, `always_run`, `pass_filenames: false`.
> - Decision 7: init lands the gates through the `/stackgen:tool-config all`
>   call T1 introduced (`all` now lands the five tools) and fetches only the
>   hygiene bundle through the adapter.
> - Decision 12: Any sentence a unit adds is one line (B65).

## Edits

1. **setup** — the passages naming the gates bundle or `pre-commit.d` name the
   skill instead.
2. **doctor** — `stack-checks.md:287` and `harness-and-memory.md:56` likewise;
   `code-intelligence.md:32`: the refresh hook is the pre-commit
   `graphify-refresh` hook at `post-commit`, and a raw graphify git hook is
   drift (remedy `/vwf:setup reshape`), never a pass.
3. **`graphify.md:99`** — the refresh hook is the pre-commit `post-commit` hook
   running `code:graph`; never `graphify hook install`. **`memory.md:249`** —
   stop naming the gates bundle.
4. vwf still names no tool outside rule 10's exemptions.

## Verification

- `grep -rn "graphify hook install\|repo-gates" plugins/vwf/skills/setup plugins/vwf/skills/doctor plugins/vwf/assets`
  prints only passages saying never to run it
- `MISE_ENV=dev mise run p:plugins:check` green (rule 10)

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: setup and doctor follow the gates and the graphify hook into tool-config`
— written by the orchestrator after the wave gate.
