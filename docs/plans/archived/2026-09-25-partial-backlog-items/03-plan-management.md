# U3 — Plan-management: archive's refusal and force, `partial`, the `(piece)` column

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/plan-management/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/plan-management/SKILL.md` and
  `references/plan-index.md`, top to bottom; the plan's Facts section.

## Ruling

Quoted from index.md's assumed decisions:

> **1.** `backlog:` names the ids the plan **finishes** — landing sets them
> `Done`. A new frontmatter list, `backlog_pieces:`, names the ids the plan
> lands **a piece of**. A Parked entry that belongs to an item begins with its
> id: `- Bnn: <piece>`.

> **4.** … `partial` and `done` move their folder off `Planned in:` onto the
> `Landed:` line. (So both are called with the folder.)

> **10.** `archive` refuses a folder that names an id in `backlog:` with
> `- Bnn:` Parked lines for it (or an id in both lists), naming the id and the
> lines; a force option archives anyway and calls `partial` — never `done` — for
> that id. `backlog_pieces:` ids always get `partial`. Rejected: recording it as
> a piece and archiving without refusing; force calling `done`; force asking per
> id.

> **11.** The plan index Backlog column lists both kinds; a piece id reads
> `Bnn (piece)`. Rejected: a trailing asterisk marker.

> **13.** An absent `backlog_pieces:` reads as empty.

## Edits

1. **`archive`'s completion check (`SKILL.md:247-266`).** Add the refusal of
   decision 10 beside the existing warnings; a `- Bnn:` Parked line is a line
   under `## Parked` beginning `- B`, digits, a colon. Add the force option to
   the verb — its spelling in the verb table and the argument line, e.g.
   `archive <folder> --force`; report the spelling under `DECIDED:`. Force
   overrides only this refusal, nothing else archive checks.
2. **"Close the backlog items" (`SKILL.md:306-312`).** For `backlog:` ids not
   already `Done`: `/vwf:backlog done <ids> <folder>`; for `backlog_pieces:`
   ids, and for a `backlog:` id a forced archive overrode:
   `/vwf:backlog partial <ids> <folder>`.
3. **`add` (`SKILL.md:104`, :116-118) and the column
   (`references/plan-index.md:48`).** The Backlog cell lists `backlog:` ids,
   then `backlog_pieces:` ids each suffixed `(piece)`; `—` when both are empty.
4. **The tree row (`SKILL.md:60`)** and any verb table row for archive name
   `partial` beside `done`.

## Verification

- `grep -c 'backlog_pieces' plugins/vwf/skills/plan-management/SKILL.md` ≥ 2;
  `grep -n '(piece)' plugins/vwf/skills/plan-management/references/plan-index.md`
  hits the column rule.
- `grep -n 'partial' plugins/vwf/skills/plan-management/SKILL.md` hits the
  archive's backlog step.
- `mise run p:plugins:check` green; `mise run code:precommit` green.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/plan-management/**`.
- Do not edit `docs/plans/index.md` — this repo's own index is data, and no live
  row carries a piece id.
- No table cell ending in a bare asterisk.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: plan-management — archive refuses a contradicting backlog list, lands pieces as partial`
— written by the orchestrator after the wave gate. `feat` is in
`.config/git-conventional-commits.yaml`.
