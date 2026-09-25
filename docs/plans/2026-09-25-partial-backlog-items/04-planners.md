# U4 — Planners: finishes or a piece, `backlog_pieces:`, `- Bnn:` Parked lines

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/plan/SKILL.md`,
  `plugins/vwf/skills/plan/references/plan-doc.md`,
  `plugins/vwf/assets/plan-interview.md`,
  `plugins/vwf/assets/templates/plan-folder.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom; the plan's Facts section.

## Ruling

Quoted from index.md's assumed decisions:

> **1.** `backlog:` names the ids the plan **finishes** — landing sets them
> `Done`. A new frontmatter list, `backlog_pieces:`, names the ids the plan
> lands **a piece of**. A Parked entry that belongs to an item begins with its
> id: `- Bnn: <piece>`. The last plan of a chain moves the id to `backlog:`.

> **12.** For each id the recall matched, the interview asks whether this plan
> finishes it or lands a piece; a finishing id goes on `backlog:`, a piece id on
> `backlog_pieces:`, and a piece plan writes what remains as `- Bnn: <piece>`
> Parked lines — at least one per piece id — naming the chained folder where one
> already covers the piece. Rejected: Parked lines optional.

> **13.** An absent `backlog_pieces:` reads as empty. The plan-folder template
> carries no format version, so nothing is bumped.

> **8.** (context — U2's) The executor's preflight refuses a folder that names
> an id in both lists, an id in `backlog:` with a `- Bnn:` Parked line, or an id
> in `backlog_pieces:` with none.

## Edits

1. **`assets/templates/plan-folder.md`** — frontmatter (:39): `backlog:`'s
   comment reads "ids (Bnn) this plan finishes — landing sets them Done"; a new
   key follows it, `backlog_pieces: []`, whose comment reads "ids (Bnn) this
   plan lands one piece of — landing sets them Partially done; each needs a Bnn
   line under Parked". The `## Parked` placeholder (:220-223) states the
   `- Bnn: <piece>` line form for a piece of a backlog item, beside free prose
   for anything else, and that the executor refuses the folder per decision 8.
2. **`assets/plan-interview.md`** — a checklist item in section A, after the
   scope check (or wherever the numbering reads best — keep existing numbers
   stable by using a letter suffix such as `2a`, as `9a` and `10a` do): for each
   backlog id the recall matched, does this plan finish it or land a piece?
   Section F (Parked, :151-155) gains the `- Bnn:` rule.
3. **`skills/change-plan/SKILL.md`** — recall (:51-60) notes each id and whether
   the plan finishes it; §6's frontmatter rule (:226-227) names both lists; the
   Parked definition (:119-122) and "Out of scope and Parked are explicit"
   (:277) carry the `- Bnn:` rule; §7 self-review gains a line: every
   `backlog_pieces:` id has a `- Bnn:` Parked line, no id sits on both lists, no
   `backlog:` id has one; hand-off (:317-319) calls `planned` for the ids of
   both lists.
4. **`skills/plan/SKILL.md` and `skills/plan/references/plan-doc.md`** — the
   same for the cycle planner: the `backlog:` rule (:397-400, plan-doc :19-21),
   the frontmatter key list (:372), recall (:98-106), Parked (:325),
   self-review, hand-off (:449-451).

## Verification

- `grep -c 'backlog_pieces' plugins/vwf/assets/templates/plan-folder.md plugins/vwf/skills/change-plan/SKILL.md plugins/vwf/skills/plan/SKILL.md plugins/vwf/assets/plan-interview.md`
  ≥ 1 each.
- `grep -n -- '- Bnn:' plugins/vwf/assets/templates/plan-folder.md plugins/vwf/assets/plan-interview.md`
  hits each.
- `mise run p:plugins:check` green; `mise run code:precommit` green.

## Guardrails

- Touch nothing outside the five owned files.
- Inside `plan-folder.md`, the index.md shape sits in a fenced block the
  executor parses — keep every heading and column order exactly; add the key,
  change no other.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand. Keep
  every code span on one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: planners — backlog_pieces and the - Bnn: Parked line` — written by the
orchestrator after the wave gate. `feat` is in
`.config/git-conventional-commits.yaml`.
