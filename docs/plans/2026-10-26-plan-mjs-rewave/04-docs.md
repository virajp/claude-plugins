# U4 — Docs

- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`, then each passage
  listed under Edits.

## Ruling

Quoted from the plan's decisions:

> - D1: A dedicated verb, rewave (the user's choice). Rejected: a general batch
>   verb that applies a list of set operations and validates once.
> - D6: rewave changes only wave fields and the waves list. The planner first
>   runs plan.mjs set <file> units.<id>.waits "<reason>" (a non-empty waits
>   validates in wave 1), then runs rewave. The docs that name rewave state
>   this order (the user's choice).
> - D7: No. A run never renumbers waves, and the reviewer is read-only.
>   execute/SKILL.md names rewave in what it never does, and
>   plan-rulings-reviewer.md names it among the verbs it never runs. rewave is
>   a planner write: the planners use it after the first green validate, the
>   self-review and the rulings review included.
> - D11: Refuse it: a wave from W1 to W<n> in the result that no unit sits
>   in is a refusal, waves.W<i>: has no unit, exit 1, nothing written —
>   whether the call made it empty or the file already had it; the planner
>   fixes an old empty wave in the same call (the user's choice). It is
>   collected with the D3 refusals, after the moves.
> - D12: Reword each such passage: one field or one list entry for each
>   write, except rewave, which moves units and rebuilds waves in one write.
>   U1 adds rewave to the plan.mjs header sentence near line 38 (set, append
>   and remove validate the result before they write) and rewords
>   plan-index.md near line 18; U4 rewords skills-and-agents.md (near line
>   39), docs-tree.md (near line 56) and site vwf.md (near line 2654) (the
>   user's choice).
> - D15: Yes. rewave runs only when status.state is DRAFT or APPROVED; any
>   other state (RUNNING, BLOCKED, COMPLETE, ARCHIVED) is a refusal at the
>   path status.state, exit 1, nothing written, collected with the D3
>   refusals. The per-unit and per-wave pending checks still apply (the
>   user's choice).

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings,
   plus every `DOCS FALSIFIED:` line U1 and U2 returned.
2. The survey found these passages, which the change falsifies:
   - **`CLAUDE.md`** near line 53: "every later change made through
     `plan.mjs set` or `append`" — name `remove` and `rewave` too.
   - **`.claude/skills/vwf-plugin/SKILL.md`** near line 72: the verb list
     `get`, `set`, `append`, `remove`, `validate` — add `rewave`.
   - **`.claude/skills/vwf-plugin/references/docs-tree.md`** near line 55:
     "every later change goes through `plan.mjs set` or `append`" — the same
     change as `CLAUDE.md`.
   - **`site/src/content/docs/plugins/vwf.md`**: near line 2484 (the planner
     writes once, then one field or one list entry — add that a wave change is
     one `rewave` call); near line 2653 ("every later change goes through
     `plan.mjs set` or `append`"); near line 2841 (a red folder is fixed with
     `plan.mjs set` or `append`); near lines 3276-3286 ("has five verbs" —
     six now, with a `rewave` paragraph: its syntax, its refusal of a unit or
     wave that is not `pending`, of an empty wave, and of a plan
     that is not `DRAFT` or `APPROVED`, and the `set waits`
     first order).
   - **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** near
     line 39: the verb list `get`, `set`, `append`, `validate` — add `remove`
     and `rewave`.
   - Per D12, reword the claim that a write changes one field or one list
     entry at a time: in `skills-and-agents.md` near line 39, `docs-tree.md`
     near line 56 and `vwf.md` near line 2654.
   - **`readme.md`** near line 249 is generic ("reads, validates and writes");
     change it only if docs-sync finds it falsified.

## Verification

- `mise x -- mise run code:format` — green.
- `mise x -- mise run p:site:check` — green.
- `rg -n "five verbs" site/src/content/docs/plugins/vwf.md` finds nothing.

## Guardrails

- Touch nothing outside your owned paths.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted; let
  `code:format` re-pad a table, never by hand.
- Never run `git checkout`, `git restore` or a formatter with `--fix` on a
  path you do not own.

## Commit

`docs: the manual names plan.mjs rewave`
