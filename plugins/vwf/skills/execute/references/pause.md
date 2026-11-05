# Pause Conditions

These are the **only** stops before the final report. The conditions are the Halt
and pause table in `SKILL.md`. Do not guess past one.

## On any pause

1. Make sure that the worktree is committed.
2. Append the folder's `gaps`.
3. State precisely what is needed.
4. Log the stop and end the action log, per [the action log](action-log.md).
5. **Emit the exact resume command**, and stop.

The resume command is always `/vwf:execute <folder>`, run by a person in a fresh
session. This holds after a **resource-cap** pause too. There, a bare `/vwf:handoff`
wrote the reserved `next` handoff first. `/vwf:recall next` may point the person at
that command but never launches it — the run must start in a fresh context. The resume
reads the folder's `index.json` and `git log`, per the Resume check in
[setup.md](setup.md).

## Detail of the conditions

**Subagent death (H4)**. Commit what is safe. Record the unit as **blocked**: its
`status` set `failed`, its `why` in its `row` event's `detail` and in one `gaps` entry.
Then pause, and never proceed on a dead stage.

**Resource caps (H5)**. A repo may **tighten** the caps, never loosen them, through
`.config/vwf.yaml` `pipeline.execute_caps`; the hook honors the lower value.

**Non-converging cap-exempt finding (H7)**. The fix is not holding, or keeps trading
against another finding. These can never be downgraded to gaps, so the loop has nowhere to
exit to. Pause with the finding, the rounds tried, and what each round changed.

**Uncovered decision (H8)**. Commit what is safe, append the gap, report the ruling the
folder needs, and give the resume command. Never ask.

### The resource-cap signal

A command cannot measure its own context window: those figures reach the session only on
the statusline payload. So an external `PostToolUse` hook **delivers this signal**. It
reads the figures and injects a cap directive.

`claude-status` provides one (`brew install virajp/tap/claude-status`, **macOS on Apple
silicon only**). For autonomous runs, install it, or this pause will not fire. On any
other platform it cannot be installed at all, so plan long runs around a pause that will
never arrive.

On the injected cap directive:

1. Finish setting the unit fields for every report already in hand.
2. Commit what is green.
3. Invoke
   `plan-management status <folder> RUNNING "RUNNING — paused at unit <n> for context"`.
   The index row stays `RUNNING` — a pause is the folder's detail, not the queue's.
4. Run `/vwf:handoff` with no argument, to snapshot state as the reserved `next` handoff.
5. Stop with the launch line `/vwf:execute <folder>`.

The person re-runs it in a fresh session. `/vwf:recall next` surfaces the handoff and the
launch line, but cannot invoke this skill.

**The contract vwf states, for whoever provides the hook:**

- Read `<cwd>/.config/vwf.yaml` → `pipeline.execute_caps`, and apply it **tighten-only**.
  A value above the shipped default is ignored: config may lower a cap, never raise one.
- Name `/vwf:handoff` and `/vwf:execute <folder>` in the directive, since those make the
  pause resumable.

vwf never invokes the hook, and cannot detect its absence. A hook that skips the config
read leaves `pipeline.execute_caps` a key nothing honors.
