# U1 — `all` asks its run-level questions and applies them

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom — `references/all.md` first.

## Ruling

> - Decision O1: Four, asked once before the first plan: one shared worktree;
>   deduped after-landing steps; one release at the end; landing for each plan
>   recorded `no`. Each is asked only when it applies to a plan the loop will
>   reach; the shared-worktree one always.
> - Decision O2: One worktree on branch `all-<date>-<HHMM>`, brought up to date
>   from `develop` before each plan; each plan lands in turn with "keep
>   worktree"; the loop's exit removes it.
> - Decision O3: An identical after-landing step command recorded by several
>   plans runs once, after the last landed plan — on an early stop too; release
>   steps are excluded.
> - Decision O4: Each distinct release step a plan records `run` is held and
>   runs once after the last plan; on an early stop every held release stays
>   held and the exit report lists it with its command.
> - Decision O5: Before the first plan, each plan the loop will reach that
>   records merge `no` is listed and asked: land it this run, yes or no.
> - Decision O6: The answers are passed to each runner in its dispatch prompt
>   and written as one `override:` line in each folder's Run log; a folder's
>   Consent block is never changed.

## Edits

1. **`references/all.md`** — a "Run-level questions" step before the first
   dispatch: compute the plans the loop will reach (the runnable rows plus those
   whose every requirement is in that set), ask O1's questions that apply, one
   per turn, and hold the answers. After it, nothing is asked.
2. **`references/all.md`** — the loop applies O2–O5: pass the answers in each
   dispatch prompt (O6); after the last plan, or on an early stop, run the
   deduped steps (O3) and the held releases (O4, last plan only); remove the
   shared worktree at exit.
3. **`SKILL.md`** — Setup and After landing: under an `all` override, reuse the
   shared worktree and branch instead of cutting one, refresh it from `develop`,
   land with "keep worktree"; skip a deduped or held step and record it; read
   the landing override in place of the Consent row; write the `override:` Run
   log line.

## Verification

- `mise run p:plugins:check` green.
- `grep -n 'override' plugins/vwf/skills/execute/references/all.md` shows the
  four questions and the Run log line.

## Guardrails

- Do not touch `plugins/vwf/agents/` (U2) or any other skill.
- Plain `/vwf:execute <folder>` and `next` behave exactly as before.
- `plugins/**/*.md` is not formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: /vwf:execute all asks its run-level questions once, as overrides`
