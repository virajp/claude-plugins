# U2 — doctor checks the folder, setup names it, architecture recommends the token

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/architecture/SKILL.md`
- **Model:** opus
- **Read first:** `stack-checks.md` 260–420 (the repo-shape predicates);
  `doctor/SKILL.md` 140–190; `setup/SKILL.md` 100–120; `architecture/SKILL.md`
  140–200 (where ids are proposed and roles/platforms elicited).
- **Lazy-load:** `plugins/vwf/skills/architecture/references/platforms.md`
  16–32.

## Ruling

Decision 1: "The slugified basename of the repo's **main checkout** folder, by
`ids.md`'s slug rule, proposed by question 1 and written literally — never
derived at load time, since a linked worktree's folder is named for the branch.
A member repo names its own folder, never the base's."

Decision 3: "The project id is the group id and the commit scope. No
`task_group` key, no `config_format` bump; doctor's predicate (b) is untouched."

Decision 4: "One sentence where it proposes ids: prefer the project's primary
platform token as its id when it is unique within its repo, and on a shaped repo
seed the ids from the existing `p/<id>/` groups so a re-run of init reports no
'id source changed'."

Decision 5: "A `REPO_NAME` that is not the folder slug is shown in init's plan
as a `repo-name key: <old> → <new>` replace row … group handling … is
unchanged."

Decision 11: "The phrase for the key is 'the repo's folder name, slugified';
'the repo's own id' and 'the repo's own slug' are retired wordings wherever they
describe `REPO_NAME`."

## Edits

1. **`doctor/references/stack-checks.md`** predicate (d) (356–361) — the value
   is the slugified basename of the repo's main checkout folder (resolve the
   main checkout from a linked worktree via the common git dir); a member's key
   names the member's own folder, never the base's; a mismatch is a drift row
   whose remedy is `/vwf:setup reshape` (init's replace row, decision 5);
   `unfilled` stays the existing finding. Predicate (b) (313–331) untouched.
2. **`doctor/SKILL.md`** (148, 181–186) — where the drift enumeration says "an
   unfilled repo-name key", say "a repo-name key that is unfilled or not the
   folder's slug".
3. **`setup/SKILL.md`** Step 0 (107–117) — the description of the six
   predicates: "the toolchain manager's repo-name environment key" becomes "the
   toolchain manager's repo-name key against the folder". No predicate is
   restated (114–116 stays).
4. **`architecture/SKILL.md`** — at the point where project ids are proposed
   (near 156, the role MCQ, and wherever the id is derived from `product.md`):
   add decision 4's sentence. Name the platform token as the preferred id and
   the `p/<id>/` groups of a shaped repo as the seed; nothing about `REPO_NAME`.

## Verification

- `mise run p:plugins:check` green.
- `command grep -n "own slug\|own id" plugins/vwf/skills/doctor/references/stack-checks.md plugins/vwf/skills/doctor/SKILL.md plugins/vwf/skills/setup/SKILL.md`
  shows no hit describing `REPO_NAME`.
- `command grep -n "platform token" plugins/vwf/skills/architecture/SKILL.md`
  shows the new sentence.

## Guardrails

- Do not touch init (U1), any pack or asset (U3), any doc (U5).
- Predicate (b) and the `p/_project/` rename doctrine are not edited.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Delete with `rm`, never `git rm`.

## Commit

`feat: doctor checks REPO_NAME against the folder; architecture prefers the
platform token as a project id`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
