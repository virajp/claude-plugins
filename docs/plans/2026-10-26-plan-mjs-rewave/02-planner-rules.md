# U2 — The planners, the template and the executor name rewave

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/plan-management/scripts/plan.mjs` (read
  only — U1 adds `rewave` to it in the same wave, so read the plan's ruling,
  not the file, for the verb's contract).

## Ruling

Quoted from the plan's decisions:

> - D1: A dedicated verb, rewave (the user's choice). Rejected: a general batch
>   verb that applies a list of set operations and validates once.
> - D2: plan.mjs rewave <file> <unit>=<wave>... with one pair or more. Each
>   unit id must name a unit of the file; each wave must be an integer of 1 or
>   more. A plan index file (docs/plans/index.json), a malformed pair, a
>   repeated unit id, or no pair is a usage error, exit 2. rewave takes no
>   --json and no other flag.
> - D3: Refuse when any of these is true: a moved unit (its wave changes) is
>   not pending; the old or the new wave entry of a moved unit exists and is
>   not pending; a wave entry that must be dropped is not pending. A refusal
>   prints one line per cause on stderr, as file: path: message, exits 1 and
>   writes nothing. A pair that does not change the unit's wave is permitted
>   and is not a move (the user's choice).
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
> - D15: Yes. rewave runs only when status.state is DRAFT or APPROVED; any
>   other state (RUNNING, BLOCKED, COMPLETE, ARCHIVED) is a refusal at the
>   path status.state, exit 1, nothing written, collected with the D3
>   refusals. The per-unit and per-wave pending checks still apply (the
>   user's choice).

## Edits

In each file, keep the existing wording; add the verb where the file lists the
permitted writes. Name the verb as `plan.mjs rewave <file> <unit>=<wave>...`
at its first mention in each file.

1. **`plugins/vwf/skills/change-plan/SKILL.md`** — §6 ("From that first
   green validate on, every change to it ... is one `plan.mjs set` or
   `plan.mjs append` call", near line 280): the permitted writes become one
   `set`, `append`, `remove` or `rewave` call. Add one sentence: to move units
   between waves — a split or a merge of waves, from the self-review or the
   rulings review — use one `rewave` call, which rebuilds `waves` with it;
   when a unit moves above wave 1, first `set` its `waits`, then `rewave`.
   §7: where the self-review says "fix inline", add that a wave change is one
   `rewave` call.
2. **`plugins/vwf/skills/plan/SKILL.md`** — the verb row near line 56 adds
   `rewave`; the after-first-validate rule near lines 418-420 gets the same
   change and the same sentence as item 1.
3. **`plugins/vwf/skills/plan/references/plan-doc.md`** — the same rule near
   lines 22-24: the same change.
4. **`plugins/vwf/assets/plan-interview.md`** — item 20 (the rulings
   review, near lines 206-218): an answer that changes the wave of a unit is
   written with one `rewave` call (after a `set` of `waits` when the unit moves
   above wave 1), never by a whole-file rewrite.
5. **`plugins/vwf/assets/templates/plan-folder.md`** — the verb list near
   lines 22-40 gains a `rewave` bullet (its syntax, the D3, D11 and D15
   refusals in one line, and that it writes no time); the creation paragraph
   near lines 42-48 says every later change is one `set`, `append`, `remove` or `rewave`. The
   `waves` key rule (near line 448) adds: a planner changes a unit's `wave`
   only with `rewave`, which keeps the list valid.
6. **`plugins/vwf/agents/plan-rulings-reviewer.md`** — the verb rule near
   lines 36-39: it never runs `set`, `append`, `remove` or `rewave`.
7. **`plugins/vwf/skills/execute/SKILL.md`** — *The plan files* (near lines
   102-116) and the "never does" list (near line 1302): the run never calls
   `rewave`; it never renumbers waves. Do not add `rewave` to the writes the
   run makes.

## Verification

- `mise x -- mise run p:plugins:check` — green.
- `mise x -- mise run code:format` — green.
- `rg -n "rewave" plugins/vwf/skills/change-plan/SKILL.md plugins/vwf/skills/plan/SKILL.md plugins/vwf/skills/plan/references/plan-doc.md plugins/vwf/assets/plan-interview.md plugins/vwf/assets/templates/plan-folder.md plugins/vwf/agents/plan-rulings-reviewer.md plugins/vwf/skills/execute/SKILL.md`
  finds at least one hit in each of the seven files.

## Guardrails

- Touch nothing outside your owned paths. Do not edit `plan.mjs`, the
  plan-management skill, the test file or any doc outside `plugins/`; U1 and
  the docs unit own them.
- Never run `git checkout`, `git restore` or a formatter with `--fix` on a
  path you do not own.
- `plugins/**/*.md` is not formatted by dprint: match the fold width of each
  file by hand (80 columns for prose), and keep each code span on one line.
- Keep each skill's YAML frontmatter strict and unchanged.

## Commit

`docs: the planners renumber waves with plan.mjs rewave`
