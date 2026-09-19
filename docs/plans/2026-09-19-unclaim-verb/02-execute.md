# U2 — execute: point every stale-claim passage at `unclaim`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/execute/references/blocking.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom; the plan's Facts section and
  its decisions 1–5 — the verb's contract as this plan specifies it. Do **not**
  read `plugins/vwf/skills/plan-management/**` for the verb's wording: U1 is
  writing it in the same wave; cite the verb by name and by the contract quoted
  below.
- **Lazy-load:** nothing.

## Ruling

Decision 5, quoted:

> A session on the user's ask, like `archive` and `list`. `/vwf:execute`'s two
> refusals (row `RUNNING` under an `APPROVED` folder; a `RUNNING` requirement)
> name the verb instead of the hand reset, and the resume path in `blocking.md`,
> on finding the worktree gone, offers to invoke `unclaim` and does so on a yes.
> Execute never runs it unprompted.

The verb's contract, from decisions 1–4, so this unit cites it accurately:
`unclaim <folder>` runs in the main checkout on the integration branch; it
refuses while the worktree the folder's Status block names still exists (the
user runs `git worktree remove <path>` as proof the run is gone); it never
touches the run's branch, only reports it; it asks once, then resets the row and
the Status block to `APPROVED` and reports the commit
`docs: plan queue — <folder> unclaimed` for the caller.

## Edits

1. **`SKILL.md:139-142`** — the refusal for a folder `APPROVED` whose row reads
   `RUNNING`: replace "claimed afresh after a hand reset of the row to
   `APPROVED`, committed on the integration branch" with "claimed afresh once
   the user has asked the session to unclaim it — `plan-management`'s
   `unclaim <folder>`, which refuses while the run's worktree still exists".
   Execute itself stops here; it does not invoke the verb from this refusal.
2. **`SKILL.md:133-134`** — the `RUNNING` requirement: keep "wait for it to
   land"; add "or, when that run is gone, ask to unclaim it".
3. **`SKILL.md:884`** — the never-does bullet: "Takes a `RUNNING` row, however
   stale — a hand reset to `APPROVED` is the only release" → "… — `unclaim` on
   the user's ask, once its worktree is gone, is the only release".
4. **`blocking.md:56-72`** — the resume path. When the worktree the status line
   names does not exist: stop, report, and **offer** the reset — "the run's
   worktree is gone; unclaim `<folder>` so it can be claimed afresh?" On yes,
   invoke `plan-management unclaim <folder>` in the main checkout, commit and
   push what it reports through `/vwf:git-workflow` on the integration branch
   (`docs: plan queue — <folder> unclaimed`), relay its branch note, and end —
   the fresh claim is a new `/vwf:execute <folder>`. On no, end with the row as
   it was. Delete the sentence "No `plan-management` verb does this yet: the
   `unclaim <folder>` verb that would replace the hand edit is backlog B12." and
   the "by hand" instruction it followed.
5. **`blocking.md:52-53`** — unchanged in substance ("the row is not updated on
   a block or a pause"); add a half-sentence that the row is released only by
   `unclaim`.

## Verification

- `grep -n 'hand reset\|by hand' plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/execute/references/blocking.md`
  returns no hit about resetting a row or a Status block (a hit about landing by
  hand — the `no` landing — stays).
- `grep -n 'B12' plugins/vwf/skills/execute/references/blocking.md` returns
  nothing.
- `grep -c 'unclaim' plugins/vwf/skills/execute/SKILL.md` ≥ 3;
  `grep -c 'unclaim' plugins/vwf/skills/execute/references/blocking.md` ≥ 2.
- `mise run p:plugins:check` green.
- `mise run code:precommit` green.

## Guardrails

- Do not touch `plugins/vwf/skills/plan-management/**` (U1), any doc (U3), any
  version file (U4).
- `plugins/**/*.md` is not dprint-formatted: fold by hand at the surrounding
  width.
- Strict-YAML frontmatter: leave `SKILL.md`'s frontmatter untouched.
- Cite `plan-management` with the path style the file already uses
  (`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/SKILL.md`).
- No table cell ending in a bare asterisk; no escaped backtick inside a code
  span.
- Delete nothing; `rm` nothing.

## Commit

`feat: execute offers unclaim on a gone worktree and names it in both refusals`
— written by the orchestrator after the wave gate. `feat` is in
`.config/git-conventional-commits.yaml`.
