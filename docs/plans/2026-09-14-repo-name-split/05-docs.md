# U5 — docs, and the reversal's decisions doc

- **Wave:** 2
- **Depends on:** U1–U4
- **Owns:** `CLAUDE.md`, `readme.md`, `.claude/**`, `site/src/content/docs/**`,
  `docs/backlog.md`,
  `docs/memory/decisions/2026-09-14-repo-name-is-the-folder.md` (new)
- **Model:** opus
- **Read first:** `index.md`'s Goal (the reversal paragraph), Facts and Assumed
  decisions; every `DOCS FALSIFIED:` line the orchestrator passes in; then run
  `vwf:docs-sync` over the branch delta
  (`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and apply its findings.
- **Lazy-load:** each doc named below at the cited passage;
  `docs/memory/decisions/2026-09-13-init-walks-the-members.md` and
  `2026-09-06-project-ids-are-slugged.md` (to name what is superseded);
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decisions-doc shape; match the
  newest file in the directory).

## Ruling

The reversal, from index.md: "The 2026-09-06 decision
(`project-ids-are-slugged`) said `REPO_NAME` 'carries the same slugification
applied to the repo's own name' and was 'the whole point of deriving the id
once'; the 2026-09-13 decision (`init-walks-the-members`) said 'the project id
keeps exactly two surfaces: the `p:<id>:*` task group and `REPO_NAME`'. The user
confirmed the reversal on 2026-09-14: the two surfaces carry two different
tokens."

Decisions 1, 2, 3, 4 and 11 as written in index.md — quote them into the
decisions doc verbatim.

Group A's decision 12, applied here: the docs unit edits `docs/backlog.md` by
hand, because the backlog skill is not loaded in the run session.

## Edits

Apply `docs-sync`'s findings first, then reconcile this list by section:

1. **`CLAUDE.md`** 249–259 — the seven-questions sentence: question 1 names the
   folder and fills `REPO_NAME`; question 2 confirms every project id, proposed
   from the registry, the sub-project directory or the project's platform token,
   before any `p:<slug>:*` group or scope is written. The flags-and-aliases
   sentence (257–259) survives.
2. **`.claude/skills/vwf-plugin/SKILL.md`** 79–88 — the fills list and the
   question-2 sentence: unbundle `REPO_NAME` from the group.
3. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** 25 — the init
   row, same unbundling.
4. **`.claude/skills/stackgen-plugin/SKILL.md`** 37 — the `ids.md` row: one slug
   rule, two applications (project id → group and scope; folder name →
   `REPO_NAME`). 127 survives.
5. **`site/src/content/docs/plugins/vwf.md`** — 880–891: "Project ids are
   slugged, and each repo's own name with them" becomes two tokens, two
   surfaces; 940–953: question 1 and question 2 per the new shape, the source
   column's third value is the platform token, the collision rule, the "other"
   free entry; 1179–1183: doctor's subjects — "the repo-name key against the
   folder". 893–897, 1173–1174, 1190–1192 survive.
6. **`site/src/content/docs/plugins/stackgen.md`** — 733–762: the bullets:
   `REPO_NAME` is the repo's folder name, slugified; the `ids.md` sentence at
   759–762 becomes "governs both the project id and the repo-name slug — the
   `p:<id>:*` group and the scope list take the first, `REPO_NAME` the second".
   637 survives.
7. **`site/src/content/docs/how-to/greenfield/single-repo.md`** 63–76 — the two
   questions as the user now sees them: the folder name, then the project id
   proposed as the platform token.
8. **`readme.md`** — nothing states the rule (survey); confirm with a grep and
   leave it.
9. **`docs/backlog.md`** — row B04: status `done`; its section's last line
   `Planned in: docs/plans/2026-09-14-repo-name-split/` (already `planned` at
   approval; flip to `done`). Touch no other row.
10. **`docs/memory/decisions/2026-09-14-repo-name-is-the-folder.md`** — create.
    Title: "Decision — `REPO_NAME` is the folder, the task group is the
    project". Sections in the directory's shape: what was decided before (the
    two superseded passages, quoted, with their file names); the ruling
    (decisions 1–4 and 11 verbatim); why (the user's B04 words; this repo's own
    shape — `claude-plugins` beside `i`, `plugins`, `site`); rejected (the
    `task_group` key and format bump; the role as the token; today's order;
    leaving the overlays). Add a one-line "Superseded on this point by …" note
    at the top of the two older decision docs' `REPO_NAME` passages — they are
    under `docs/memory/decisions/`, which this unit owns.

## Verification

- `mise run p:site:check` green.
- `command grep -rn "two surfaces\|same slug fills\|the two surfaces it fills" CLAUDE.md .claude site/src/content/docs`
  shows no passage binding `REPO_NAME` to the project id.
- `command grep -rln "folder name" CLAUDE.md .claude/skills/vwf-plugin site/src/content/docs/plugins`
  lists at least `CLAUDE.md`, `vwf.md`, `stackgen.md`.
- `command ls docs/memory/decisions/2026-09-14-repo-name-is-the-folder.md`.

## Guardrails

- Touch nothing under `plugins/` (U1–U3), `.config/` (U4), or any version file
  (U6).
- `CLAUDE.md`, `readme.md`, `.claude/**/*.md` and the site docs **are**
  dprint-formatted: run `mise run code:format` before returning; never end a
  table cell in a bare `*`.
- The site's link rule and markdown mirror are in `site/CLAUDE.md`.
- Group A's plan may have changed the same passages in `CLAUDE.md`,
  `skills-and-agents.md` and `vwf.md`; edit what is on disk, not the survey's
  quoted text.
- Delete with `rm`, never `git rm`.

## Commit

`docs: REPO_NAME is the folder slug and the group is the project id — manual,
repo docs, the reversal recorded`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`docs`; no scopes).
