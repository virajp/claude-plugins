# U4 — setup Step 0 cites seven; the backlog procedure is reachable from init

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/backlog/SKILL.md`,
  `plugins/vwf/skills/backlog/references/github.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** none.

## Ruling

Decision 7 — "… drift, not blocking, remedy `/vwf:setup reshape` like the six.
Setup Step 0 cites seven."

Decision 6 — Backlog project: "init invokes the **backlog skill's
missing-project procedure** — the browser hand-over, the title rule, the field
bootstrap afterwards — and never `gh project create`; a project already present
is reported and skipped. GitLab: the skill's "not yet supported" line is printed
and the run continues; another forge: ask the user to create it by hand."

Decision 5 — the backlog step "runs once, base only, last" inside init's forge
pass; setup itself calls nothing on the forge.

Decision 11 — Vocabulary: the pass is the **forge pass**.

## Edits

1. **`plugins/vwf/skills/setup/SKILL.md`** — Step 0 (`:92-138`): the two
   passages counting "six predicates" (`:107`, `:118`) read seven, and the
   sentence describing what "current" means gains the forge state in a clause —
   default branch, protection, backlog project — naming predicate (g) by letter.
   The `reshape` section (`:72-90`) says in one sentence that the shape pass
   includes init's forge pass, idempotent on a repo already set. Nothing else in
   the file changes.
2. **`plugins/vwf/skills/backlog/SKILL.md`** — §The project, the paragraph on a
   missing project ("`add` is the one verb that asks consent, hands over the
   browser …"): widen to "`add`, and `/vwf:init`'s forge pass, are the two
   callers that reach the missing-project procedure"; every other verb still
   stops with the one-line report. The §Who calls it table, if one exists, gains
   a row for `init` naming the procedure rather than a verb. The "never runs
   `gh project create`" sentence stands.
3. **`plugins/vwf/skills/backlog/references/github.md`** — §Missing project's
   first line ("Only `add` reaches this; every other verb stops …") reads "`add`
   and `/vwf:init`'s forge pass reach this; every other verb stops …". The
   procedure's four steps are unchanged; add one sentence after step 4: when the
   caller is init, the verb ends after the bootstrap with no item added.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "six" plugins/vwf/skills/setup/SKILL.md` — no remaining count of the
  baseline predicates as six.
- `grep -n "Only .add. reaches" plugins/vwf/skills/backlog/references/github.md`
  — zero hits.
- `grep -n "forge pass" plugins/vwf/skills/setup/SKILL.md plugins/vwf/skills/backlog/SKILL.md plugins/vwf/skills/backlog/references/github.md`
  — at least one hit in each.

## Guardrails

- Do not touch `plugins/vwf/skills/init/**` (U1) or
  `plugins/vwf/skills/doctor/**` (U2).
- No doc outside the three owned files — report every falsified passage as
  `DOCS FALSIFIED:`.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched — the backlog skill's `argument-hint` and
  `model` lines stay exactly as they are.
- Delete with `rm`, never `git rm`.

## Commit

`feat: setup cites seven predicates; backlog procedure reachable from init` —
written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml`; no scopes.
