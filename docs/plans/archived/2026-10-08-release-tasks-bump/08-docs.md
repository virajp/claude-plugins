# U7 — Docs

- **Wave:** 5
- **Depends on:** R1
- **Owns:** `.claude/skills/release/**`, `.claude/docs/ci-and-releases.md`,
  `.claude/docs/repo-shape.md`, `.claude/docs/dev-marketplace.md`,
  `.claude/docs/installer/packaging.md`, `CLAUDE.md`, `site/CLAUDE.md`,
  `installer/CLAUDE.md`,
  `docs/memory/decisions/2026-10-08-release-tasks-bump.md`, and any other
  human-facing passage `vwf:docs-sync` finds outside `plugins/`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (the decisions-doc shape)

## Ruling

> **Goal.** `p:plugins:release`, `p:i:release`, `p:site:release` and a new
> `p:release` read `.config/releases.yaml`. They bump each project from its last
> tag, commit the bump and the cleared keys on `develop`, merge to `main`, and
> then tag. No person and no plan bumps a version by hand.

> - Decision E1: Each task runs from `develop`. It bumps, clears its keys,
>   commits on `develop`, pushes, merges `develop`→`main` with
>   `code:merge:main`, tags on `main`, pushes the tag, and goes back to
>   `develop`.
> - Decision E2: The three tasks stay. Each reads and clears only its own keys.
>   A new `p:release` runs all three with one bump commit and one merge, and
>   then tags each. `/release` calls `p:release`.
> - Decision E3: The base is always the last tag. The level is the highest of
>   the recorded level and the level that an untagged manifest implies when
>   compared with that tag.
> - Decision E7: The workflow commits the dependency update on `develop`, raises
>   `installer: PATCH`, and runs `p:i:release --ci`. `p:i:version` leaves the
>   workflow.
> - Decision E9: A new bash table test `p:releases:test` runs in `plugins.yml`,
>   not in pre-commit.
> - Decision E10: Plan 2 creates `.config/vwf.yaml` with only
>   `after_landing: [mise run p:plugins:local]`.

The three reversals in index.md's Goal are confirmed; they land as a decisions
doc here.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U6 returned.
2. **`.claude/skills/release/SKILL.md`** — the ritual becomes: on `develop`,
   clean, run `mise run p:release -- --dry-run`, show it, ask, then
   `mise run p:release`; or one task alone. Remove the hand-bump steps
   (`:83-89`, `:129-134`, `:184-194`, `:102`) and "no commit" (`:123-127`); keep
   the ask-first rule (`:12-16`), the note format, the CI facts, the push order,
   the tag rulesets. State that the bump is computed per E3 and that 13 and 17
   are skipped by the guard. Update "Before cutting" (`:279-284`).
3. **`.claude/docs/ci-and-releases.md`** — `:72-81` ("That is why no release
   task commits") → the new model and why a commit on `develop` plus a merge
   keeps `main` merge-only; `:50-58`, `:88-92`, `:119`, `:196-201`
   (`deps-update` per E7), `:232`, `:283-306` (the three rituals → `p:release`).
4. **`.claude/docs/repo-shape.md:299-306`, `:310-317`** — the tasks list gains
   `p:release` and `p:releases:test`; the sidecar holds the release-level
   functions too.
5. **`.claude/docs/dev-marketplace.md:14`, `:117`**,
   **`.claude/docs/installer/packaging.md:95`** — any hand-bump step → the
   recorded level and `/release`.
6. **`CLAUDE.md`** — the Tasks list gains `p:release` and `p:releases:test`; CI
   & Releases: "No release task commits: all three tag what has already landed"
   → the new sequence; a tracked plugin version moves only at release; the 13/17
   paragraph names the release tasks as the place the skip happens; mention
   `.config/releases.yaml` and that `/vwf:execute` writes it; mention
   `.config/vwf.yaml`'s `after_landing:` runs `p:plugins:local` after every
   landing. Keep the ask-first rule. dprint formats this file: a widened table
   cell re-pads every row.
7. **`site/CLAUDE.md:105-106`, `:115-125`** — the release model per E1/E2.
8. **`installer/CLAUDE.md`** — any hand-bump text → `p:i:release` per E1.
9. **`docs/memory/decisions/2026-10-08-release-tasks-bump.md`** — a new
   decisions doc per `plugins/vwf/assets/memory.md`: the three reversals, E1–E3,
   E5, E7, E10, each with its rejected alternative, and a pointer to this folder
   and to `2026-10-08-release-levels-recorded`.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.
- `grep -rn "no release task commits\|never bumps or commits" CLAUDE.md .claude site/CLAUDE.md installer/CLAUDE.md`
  returns nothing.

## Guardrails

- Never edit under `plugins/`, `.config/` or `.github/` — earlier units own
  them; a falsified passage there is a `GAP:`.
- Do not edit old decision docs or `graphify-out/**`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: release tasks bump — the ritual and the repo docs follow`
