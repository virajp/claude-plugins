# U2 — the runner applies the overrides it is handed

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/agents/execute-runner.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file.

## Ruling

> - Decision O2: One worktree on branch `all-<date>-<HHMM>`, brought up to date
>   from `develop` before each plan; each plan lands in turn with "keep
>   worktree"; the loop's exit removes it.
> - Decision O3: deduped after-landing steps run once, after the last landed
>   plan; release steps are excluded.
> - Decision O4: release steps a plan records `run` are held and run once after
>   the last plan.
> - Decision O6: The answers are passed to each runner in its dispatch prompt
>   and written as one `override:` line in each folder's Run log; a folder's
>   Consent block is never changed.

## Edits

1. **`execute-runner.md`** body — the dispatch prompt may carry an `Overrides:`
   block (shared worktree path and branch; steps to skip as deduped; releases to
   hold; landing yes for this folder). Apply each over the folder's Consent as
   execute's `SKILL.md` describes for an `all` override, write the `override:`
   Run log line, and report skipped and held steps in `DETAIL:`. The five-line
   return is unchanged.

## Verification

- `mise run p:plugins:check` green.

## Guardrails

- Touch nothing outside the one file; frontmatter unchanged.

## Commit

`feat: execute-runner applies the run's overrides`
