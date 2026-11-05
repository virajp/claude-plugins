# `next` — the runnable plan of highest priority

Invoke `plan-management next`. The pick is that skill's, per *Reading the queue*
in `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`. The
candidates are every `APPROVED` row whose requirements are satisfied, `cycle` or
`change` alike. There is no kind filter.

- **On a pick:** print what it returned. That is the folder taken, its `kind` and its
  `priority`, and every other `APPROVED` row with why it was not taken. Ask no
  confirmation — the session is meant to run unattended. Then continue with
  [folder.md](folder.md) as if that folder had been named.
- **Nothing runnable:** stop with the message the verb returns. That is each
  `APPROVED` row and what it waits on, or that the index is absent or holds no rows.
