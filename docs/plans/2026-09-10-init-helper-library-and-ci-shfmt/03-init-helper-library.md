# U3 — init's pass 5 replaces a diverged helper library and rewrites its callers

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/SKILL.md`
- **Model:** opus
- **Read first:** both owned files top to bottom, with care over
  `existing-repo.md:10-16` (ten passes), `:92-107` (passes 4 and 5), `:109-119`
  (pass 6, *already owned*), `:231-256` (the Plan), `:332-349` (the Report), and
  `SKILL.md:74-84` (hard rules), `:192-200` (pipelines), `:218-236` (the report
  block).
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  `:505-529` (read-only; the legacy table you cite by its heading — U2 is adding
  rows to it in this same wave, so do not quote row contents).

## Ruling

From index.md's assumed decisions, verbatim:

> **3.** **Replace, then rewrite by the table.** Pass 5 keeps its two renames,
> then compares the repo's `_scripts/helpers` to the pack's byte for byte. When
> they differ the plan carries one **replace** row (the pack's file lands over
> the kept one, on the same consent — its retired names listed as sub-lines) and
> one **rewrite** row per call site of a retired name in a repo-owned task, each
> `old → new` by the pack's legacy table. A call to a retired name the table has
> no row for is **flagged and never rewritten**, listed with its file and line,
> and lands in Deferred with the unlock "add the row to the pack's legacy table,
> or rewrite the call by hand". A pack-owned task file the repo already carries
> byte-identical, and every file pass 6 creates, are unaffected by the rewrite.

> **4.** **Ten stays ten.** The comparison and the rewrite are pass 5's content,
> not a new pass.

> **5.** The plan's count block gains two lines, `Replaces <n>` and
> `Rewrites (applied) <n>`, beside the existing
> `Rewrites (flagged, not applied)`; the report in `SKILL.md:218-236` gains
> `Files replaced` and `Calls rewritten` lines in the same position, each
> printed as `none` when empty, and a flagged call goes to `Deferred`.
> Idempotence holds: after the replace, a second run finds the file identical
> and the plan carries no row.

The user's words this carries out: *"You should replace the helper with the one
shipped with `init` and update all the existing tasks to use the new helper and
make repo compatible with `init`."* And the reversal it is, from index.md's
Goal: the *already owned* rule (`existing-repo.md:115-119`) and the *flagged,
never rewritten* rule (`:92-100`) no longer apply to the helper library. Name
that exception where each rule is stated; do not delete either rule.

## Edits

1. **`existing-repo.md`, pass 5 (`:101-107`)** — keep the two-renames paragraph,
   then add the content comparison as the rest of the pass, in this order and in
   the pass's own voice:
   - Compare the repo's `_scripts/helpers` (after the rename) to the one the
     toolchain pack ships, byte for byte, exactly as pass 1 tells the pack's
     stand-in from the repo's own. Identical: nothing more to do, the pass ends.
     Different: the repo's file is a **diverged copy** of the library the pack's
     scripts are written against, and every pack task pass 6 would create calls
     names it may not define.
   - The plan then carries a **replace** row for `_scripts/helpers` — the pack's
     file over the repo's, applied on the one consent — with a sub-line per
     function the repo's copy defined and the pack's does not (the retired
     names), so the user reads what disappears before the consent.
   - For each retired name, every call site in a repo-owned task file becomes a
     **rewrite** row, `old → new` at `file:line`, the new name taken from the
     pack's legacy-name table (cite the table by the reference file and its
     heading, not by row contents, and say the table is the pack's and vwf names
     no function). The rewrite is one token in place; nothing else on the line
     changes.
   - A call to a retired name the table carries no row for is **flagged and
     never rewritten**: listed with file, line and name, deferred with the
     unlock "add the row to the pack's legacy table, or rewrite the call by
     hand", and the replace still lands — the flagged task is the one that
     breaks, named, rather than every pack task, silently.
   - Say why the rewrite is safe where the shebang pass's is not: a print name
     is one token with one meaning in a table the pack owns; a shell dialect is
     not.
2. **`existing-repo.md`, pass 4 (`:92-100`)** — one clause at the end of the
   paragraph: the helper-library rewrite in pass 5 is the one mechanical
   exception, for the reason given there.
3. **`existing-repo.md`, pass 6 (`:115-119`)** — the *already owned* paragraph
   gains one sentence: the helper library is the exception — pass 5 compares it
   and plans its replacement — because every pack task created here sources it,
   and a task library where the created scripts call a function the kept library
   lacks fails on its first print.
4. **`existing-repo.md`, the Plan (`:231-256`)** — the count block gains
   `Replaces <n>` after `Creates` and `Rewrites (applied) <n>` before
   `Rewrites (flagged, not applied)`, so the block reads Moves, Creates,
   Replaces, Renames, Rewrites (applied), Rewrites (flagged, not applied),
   Appends, Merges. "six sections" at `:233` becomes "eight". Add the replace
   row's sub-line rule beside the move-and-shim one at `:238-243`: a replace row
   carries one sub-line per function that disappears, and each rewrite row is
   `old → new` at `file:line`.
5. **`existing-repo.md`, the Report (`:332-349`)** — the first paragraph lists
   what belongs in Deferred; add the flagged call, with its unlock. Say in the
   invariant paragraph that a replace is applied once: the second run finds the
   file identical and plans nothing.
6. **`existing-repo.md:14`** — "Ten passes" stays; touch nothing.
7. **`SKILL.md`, the report block (`:218-236`)** — add
   `Files replaced <n>
   <path>` after `Files written` and
   `Calls rewritten <n> <file:line> <old> →
   <new>` after `Tasks renamed`,
   aligned with the block's existing columns; "six file sections" at `:220`
   becomes "eight". A flagged call is a `Deferred` line; say so in the sentence
   that already lists what Deferred holds, if one exists, else add one clause.
8. **`SKILL.md`, hard rules (`:74-84`)** — no new rule. If the idempotence rule
   needs one clause to stay true ("a replace is applied once"), add it to the
   existing bullet; do not add a bullet.

Every edit keeps the file's fold width by hand and names no formatter, no shell
tool and no function name — the pack's reference carries those. The one
function-like word allowed is `source`, already in the file.

## Verification

- `mise run plugins:check` green (strict-YAML frontmatter intact in both files;
  `claude plugin validate --strict` valid).
- `grep -c 'Ten passes' plugins/vwf/skills/init/references/existing-repo.md` →
  `1`.
- `grep -n 'Replaces\|Rewrites (applied)' plugins/vwf/skills/init/references/existing-repo.md`
  → both lines inside the count block, and the sub-line rule paragraph.
- `grep -n 'Files replaced\|Calls rewritten' plugins/vwf/skills/init/SKILL.md` →
  both, inside the report block.
- `grep -n 'print_' plugins/vwf/skills/init/**` → nothing: vwf's prose names no
  function.
- `grep -n 'dprint\|shfmt\|shellcheck' plugins/vwf/skills/init/**` → nothing new
  (vwf names no tool).
- `awk 'length > 80' plugins/vwf/skills/init/references/existing-repo.md plugins/vwf/skills/init/SKILL.md`
  lists no line you wrote.

## Guardrails

- Do not touch `plugins/stackgen/**` (U2 owns the table), any doc (U4), or
  `plugin.json` (U5).
- Do not renumber the passes; do not add a pass.
- Do not delete the *already owned* rule or the shebang rule — each gains its
  named exception and stays.
- `plugins/**/*.md` is **not** dprint-formatted: match the fold by hand.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Write with Write/Edit, never a `cat` heredoc.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on any path.

## Commit

`fix(vwf): init's helper-library pass replaces a diverged library and rewrites
its callers`
— written by the orchestrator after the wave gate, not by the unit. Type `fix`
is in `.config/git-conventional-commits.yaml`'s list; scopes are unconstrained.
