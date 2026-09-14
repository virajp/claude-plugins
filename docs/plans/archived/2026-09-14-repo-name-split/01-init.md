# U1 — init: question 1 names the folder, question 2 names the projects

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/architecture/references/platforms.md`
  (16–32, the closed platform lists per role — quote the tokens, do not restate
  the lists); `plugins/stackgen/assets/ids.md` (the slug rule — cite, never
  restate); `plugins/vwf/skills/setup/references/format-lineage.md` (40–49, why
  `console` is not a token).

## Ruling

Decision 1: "The slugified basename of the repo's **main checkout** folder, by
`ids.md`'s slug rule, proposed by question 1 and written literally — never
derived at load time, since a linked worktree's folder is named for the branch.
A member repo names its own folder, never the base's."

Decision 2: "With a registry: the registry ids, unchanged. Without one: per
project, the primary platform token, asked in question 2 as a choice over the
role's platform list plus a free 'other' the user types; two projects that would
share a token in one repo are proposed as `<token>-<directory-slug>` each; every
row stays editable and a replacement is slugified as today."

Decision 3: "The project id is the group id and the commit scope. No
`task_group` key, no `config_format` bump."

Decision 5: "A `REPO_NAME` that is not the folder slug is shown in init's plan
as a `repo-name key: <old> → <new>` replace row, applied on the one consent;
group handling (rename, id source changed, customised id) is unchanged."

Decision 11: "The phrase for the key is 'the repo's folder name, slugified';
'the repo's own id' and 'the repo's own slug' are retired wordings wherever they
describe `REPO_NAME`."

The user's words (2026-09-13): "REPO_NAME is usually different than tasks group
id. E.g.: REPO_NAME = "95octane", task group id will be "service", "worker",
"console", etc. Ideally the recommended task group id is the project type
whereas REPO_NAME is folder name".

## Edits

Place by section; the survey's line numbers are a guide.

1. **`SKILL.md`, question 1** (the repo-name question) — state that its answer,
   slugified, is exactly what `REPO_NAME` receives, for this repo, and that a
   member repo's own folder name fills the member's key. The proposal is the
   basename of the **main checkout** (`git rev-parse --git-common-dir`'s parent
   when run from a linked worktree), never the worktree's folder.
2. **`SKILL.md`, question 2** (265–303) —
   - Remove "say on each repo's own row that its id is what that repo's
     `REPO_NAME` receives" (274–275): the repo's own row is no longer special
     and no row feeds `REPO_NAME`.
   - The source column keeps `registry` and `sub-project directory`; the third
     source becomes `type` — the platform token the user picked — replacing
     `repo's own name`. With no registry and no sub-project directory, the
     question asks, per project, its role's platform token (choice over the
     role's list, plus "other" typed free) and proposes that token as the id.
     Two projects in one repo that would share a token are proposed as
     `<token>-<directory-slug>` each. A typed replacement is slugified per
     `ids.md` as today.
   - "What §7 writes" (294–296): per-project task groups and their commit
     scopes; the repo-name key is question 1's, not this list's.
3. **`SKILL.md`** — the marked-positions list (55–62), the end-of-repo fill
   order (414–417), the re-run doctrine (517–521) and the doctor sentence
   (535–538): wherever "the repo-name key" is grouped with the ids, regroup it
   with question 1; the doctor sentence adds "the repo-name key against the
   folder".
4. **`references/new-repo.md`** —
   - §7 resolution orders (121–139): the base's third source and the member's
     third source become the platform token per decision 2, with the collision
     rule; "repo's own name" leaves both lists.
   - 141–143: "Each repo resolves its own ids and fills its own task groups; its
     `REPO_NAME` comes from question 1's folder name."
   - "Two lists fill three surfaces" (173–178) becomes three lists, three
     surfaces: project ids → task groups and commit scopes; the folder name →
     `REPO_NAME`; member repos → flags and aliases.
   - `REPO_NAME` (235–247): the folder name slugified as question 1 confirmed
     it; written literally; the launch-alias reason stays. Drop "the first row".
   - 257–261 (`MERGE_MODEL` "by the same rule `REPO_NAME` follows") — keep, the
     rule is literal-not-derived.
5. **`references/existing-repo.md`** —
   - Pass 9 (392–431): ids and groups unchanged. Add the repo-name comparison:
     the key's current value against the folder slug; a mismatch is a
     `repo-name key: <old> → <new>` replace row in the plan (decision 5);
     `unfilled` stays a create.
   - 464–465 "The repo-name key stays the id list's …" — rewrite: the key is
     question 1's, compared per the sentence above.
   - Commit scopes (572–584): still the project ids from the base registry; add
     that on a repo with no registry they are the ids question 2 confirmed.

## Verification

- `mise run p:plugins:check` green (rule 10: name no third-party tool; rule 12:
  no retired vocabulary — do not write `console` as a live token).
- `command grep -n "repo's own slug\|repo's own id" plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/*.md`
  is empty.
- `command grep -n "folder" plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/new-repo.md plugins/vwf/skills/init/references/existing-repo.md`
  shows question 1, §7's `REPO_NAME` paragraph and pass 9's replace row.
- `command grep -n "repo-name key:" plugins/vwf/skills/init/references/existing-repo.md`
  shows the replace row.

## Guardrails

- Do not touch doctor, setup or architecture (U2), `ids.md` or any pack (U3),
  any doc (U5).
- Cite `ids.md` by role ("stackgen's ids asset") as the files do today; never
  restate the slug rule.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init fills REPO_NAME from the folder and proposes the platform token as
a project id`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
