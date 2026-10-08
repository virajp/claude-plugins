# U2 — change-plan ends with the next item while items are unplanned

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom; note §2 (`:113-120`) and §8
  (about `:330-377`).

## Ruling

> - Decision H1: The scope is every item at the same priority.
> - Decision H2: An **open** item is `Backlog`, `In progress` or
>   `Partially done`. An **unplanned** item is `Backlog`, or `Partially done`
>   with no `Planned in:` line. The **check priority** is the highest priority
>   among the plan's backlog ids, or, with no id, the highest priority that has
>   an open item.
> - Decision H3: When the check finds unplanned items, the planner omits the
>   launch block. It prints those items and the command for the next one
>   (`/vwf:change-plan <item>` or `/vwf:plan <slice>`). `/vwf:execute` does not
>   change, and the user can still run it.
> - Decision H4: A new read-only verb, `/vwf:backlog unplanned [priority]`,
>   lists the unplanned items at a priority. If the backlog is unreadable, the
>   verb says so, and the planner prints the launch block as today.
> - Decision H5: Within a chain or a split, the check also counts the unplanned
>   elements of the session's own request: the launch block prints only after
>   the last element.

## Edits

1. **§2** — after a split, plan the pieces one after another in this session:
   each piece runs §3–§8, and §8's ending (below) for a piece that is not the
   last goes straight back to §3 for the next piece. Say so in one or two
   sentences.
2. **§8, the ending** — replace "Then end with exactly this, and nothing after
   it" with a check first: compute the check priority (H2) from the
   frontmatter's `backlog:` and `backlog_pieces:` ids, invoke
   `/vwf:backlog unplanned <priority>` (or with no argument when the plan has no
   id), and count the pieces of this session's request not yet planned (H5).
   Then:
   - nothing unplanned → end with the launch block, exactly as today;
   - otherwise → no launch block; print the unplanned pieces of this request
     first, then the unplanned items at the check priority, and the command for
     the next one (`/vwf:change-plan <item>`, or `/vwf:plan <slice>` when the
     item names a blueprint slice), and nothing after it;
   - the backlog unreadable → the launch block, with one line saying the backlog
     could not be read (H4).
3. **§1 recall** — one sentence: the backlog read also tells the interview which
   items share the plan's priority, which the §8 check uses.
4. Keep "Do not start executing" unchanged.

## Verification

- `mise run p:plugins:check` and `mise run code:precommit` pass.
- `grep -n "unplanned" plugins/vwf/skills/change-plan/SKILL.md` returns the §8
  check.

## Guardrails

- Do not touch any file outside Owns; the plan-folder template's `## Launch`
  section is not changed (H7).
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
  Keep the frontmatter strict YAML.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: change-plan recommends execute only when the priority is fully planned`
