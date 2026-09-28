# U2 — Execute: the preflight refusals and `partial` at landing

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/execute/SKILL.md` top to bottom; the
  plan's Facts section.
- **Lazy-load:** `plugins/vwf/skills/execute/references/*` — only the file
  holding the preflight checks, if the preflight lives there rather than in
  `SKILL.md` (locate it with
  `grep -ln 'preflight\|refuse' plugins/vwf/skills/execute`).

## Ruling

Quoted from index.md's assumed decisions:

> **1.** `backlog:` names the ids the plan **finishes** — landing sets them
> `Done`. A new frontmatter list, `backlog_pieces:`, names the ids the plan
> lands **a piece of**. A Parked entry that belongs to an item begins with its
> id: `- Bnn: <piece>`. The last plan of a chain moves the id to `backlog:`.

> **2.** A new verb, `partial <ids> <folder>`: sets Status to the new option
> `Partially done` and records `Landed: <plan title> in <folder>` on the body.

> **4.** … `partial` and `done` move their folder off `Planned in:` onto the
> `Landed:` line. (So both are called with the folder: `done <ids> <folder>`,
> `partial <ids> <folder>`.)

> **8.** The executor's preflight refuses a folder that (a) names an id in both
> `backlog:` and `backlog_pieces:`, (b) names an id in `backlog:` while Parked
> carries a `- Bnn:` line for it, or (c) names an id in `backlog_pieces:` with
> no `- Bnn:` Parked line for it. Rejected: a repo checker rule — user: *"The
> idea is always to fix the vwf skill and not add facade in the repos using vwf
> skill"*.

> **9.** Open gaps or consent no: `done` for the `backlog:` ids and `partial`
> for the `backlog_pieces:` ids — the same split archive uses.

> **13.** An absent `backlog_pieces:` reads as empty.

## Edits

1. **Frontmatter read (`SKILL.md:107-109`).** The executor reads
   `backlog_pieces:` beside `backlog:`; both are the ids the landing hands to
   `/vwf:backlog`, one to `done`, one to `partial`; absent is empty.
2. **Preflight.** Add the three refusals of decision 8 to the preflight's
   refusal list, in its existing shape (each names what it found and what to
   edit). A `- Bnn:` Parked line is a line under the folder's `## Parked`
   heading that begins `- B` followed by digits and a colon; other Parked prose
   is not read. Each refusal names the id and, for (b), the Parked line.
3. **Land step 3 (`SKILL.md:741-752`).** The archive path is unchanged in shape
   (`plan-management archive` does the backlog calls). The direct path, open
   gaps or consent no: `/vwf:backlog done <ids> <folder>` for `backlog:` ids,
   `/vwf:backlog partial <ids> <folder>` for `backlog_pieces:` ids.
4. **The supporting passages** — :230 (tree row), :319-321 (only calls the
   backlog at landing), :889 and :894 (the never-list) — name `partial` beside
   `done` where they name `done`, and `backlog_pieces:` beside `backlog:`.

## Verification

- `grep -c 'backlog_pieces' plugins/vwf/skills/execute/SKILL.md` ≥ 3.
- `grep -n 'partial' plugins/vwf/skills/execute/SKILL.md` hits Land step 3.
- The three refusals are present:
  `grep -n 'Parked' plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/execute/references/*`
  hits the preflight.
- `mise run p:plugins:check` green; `mise run code:precommit` green.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/execute/**` — the backlog skill is
  U1's, plan-management U3's, the template U4's.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- Do not change what the archive path does beyond naming the folder it passes.
- Delete with `rm`, never `git rm`.

## Commit

`feat: execute — refuse a contradicting backlog list, land pieces as partial` —
written by the orchestrator after the wave gate. `feat` is in
`.config/git-conventional-commits.yaml`.
