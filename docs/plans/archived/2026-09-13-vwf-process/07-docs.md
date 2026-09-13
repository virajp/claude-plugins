# U7 — docs

- **Wave:** 2
- **Depends on:** U1–U6
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/**`,
  `site/src/content/docs/**`, `docs/backlog.md`,
  `docs/memory/decisions/2026-09-13-vwf-process.md` (new)
- **Model:** opus
- **Read first:** `index.md`'s "Facts the survey established" and "Assumed
  decisions"; every `DOCS FALSIFIED:` line the orchestrator passes in; then run
  `vwf:docs-sync` over the branch delta
  (`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and apply its findings.
- **Lazy-load:** each doc named below, at the cited passage.

## Ruling

Decision 3: "only the sentences describing what the manifest rule asserts
change" — no "thirteen" becomes "fourteen".

Decision 11 (the user, verbatim): "`feedback` is different than `backlog`.
`backlog` is something that can't be picked up right now, `feedback` is
something that is being worked upon and might need change in `product`,
`blueprint`, `architecture`, etc. It will then follow the `plan` and `execute`
workflow."

Decision 12: "The docs unit edits `docs/backlog.md` by hand to mark B01–B03
`done` with this folder's name — the one exception to decision 8, because the
skill is not loaded in the run session."

Decision 13: the rule sentence also lives "in the release skill's three bump
slots, and in the plugin-authoring `structure.md` versions section".

Decision 7 and the goal: change-plan now commits and pushes the approved folder
at hand-off.

## Edits

Apply `docs-sync`'s findings first, then reconcile this list — every passage the
survey found, each by section, since line numbers will have moved:

1. **`.claude/skills/release/SKILL.md`** — after "The tracked version is plain
   `X.Y.Z` always … `p:plugins:check` fails a manifest that carries one" (~91):
   the rule sentence, and that the checker also refuses a 13 or 17 component. At
   the installer bump (~118) and the site bump (~172): one clause each — the
   task skips past 13 and 17 by itself, and the release task refuses one.
2. **`.claude/docs/ci-and-releases.md`** (~83–84) — extend the plain-semver
   sentence with the component rule.
3. **`.claude/docs/repo-shape.md`** (~157–158, the enumerated rule 1) — the
   manifest rule also refuses a 13 or 17 component.
4. **`.claude/skills/plugin-authoring/references/checks.md`** (~38–39, rule 1)
   and **`references/structure.md`** "## Versions" (~35–44) — same.
5. **`.claude/skills/vwf-plugin/SKILL.md`** — ~259–261 "A behaviour change also
   bumps `version` … (plain `X.Y.Z`)": add the rule. ~187–189 (change-execute
   invocation): the plan arrives committed. The "seven user-only" style counts
   at ~195–215 stay correct; verify.
6. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** — a `backlog`
   row in the skill table (~23–44), matching the `docs-sync`/`handoff` row
   shape; the change-plan row gains "commits and pushes the folder at hand-off";
   the change-execute row gains "calls `/vwf:backlog done`"; fix the stale count
   at ~11 — six user-only skills today (`archive`, `change-execute`, `mockups`,
   `recall`, `setup`, `verify`), not seven.
7. **`.claude/skills/vwf-plugin/references/docs-tree.md`** — the docs tree
   (~36–45) gains `docs/backlog.md` (owned by `/vwf:backlog`); the format
   versioning passage (~79–87) gains the rule sentence.
8. **`.claude/skills/vwf-plugin/references/assets.md`** (~22) — the `vwf-config`
   row's "17 was never issued" becomes the standing rule.
9. **`site/src/content/docs/plugins/vwf.md`** — commands table (~758–780): a
   `/vwf:backlog […]` row; a new `### /vwf:backlog` section beside
   `/vwf:change-plan` (~1964) in the shape of `### /vwf:docs-sync` (~2199–2232):
   what the backlog is and is not (decision 11), the file shape, the verbs, who
   calls it; the user-only list (~782–783): six, drop `design-system`; the docs
   tree (~399–401): `docs/backlog.md`; the feedback sentence at ~1921: the
   distinction sentence; the change-plan ending (~2030–2050): after approval the
   folder is committed and pushed on the branch, then the launch line; the
   change-execute start (~2055–2058): the folder is already on the branch.
10. **`site/src/content/docs/how-to/operate/ad-hoc-change.md`** (~133–151) —
    approving writes, commits and pushes the folder; the fresh session finds it
    on the branch. ~62–65 and ~226–228: recall reads the backlog too.
11. **`site/src/content/docs/how-to/index.md`** (~67–68) — one clause if the
    ad-hoc pair's description there states the ending.
12. **`site/src/content/docs/how-to/operate/production-feedback-loop.md`**
    (~231–244) — the distinction sentence where it says "not a backlog".
13. **`readme.md`** (~231–233) — one clause: the plan is committed and pushed at
    hand-off; the skill list, if any, gains `backlog`.
14. **`CLAUDE.md`** — ~49–50 (planned with change-plan, run in a fresh session):
    "committed and pushed at hand-off"; the Tasks section's `p:plugins:check`
    bullet: the manifest rule also refuses a 13 or 17 component; the Traps or CI
    section: the version tasks skip 13 and 17 and the release tasks refuse them;
    nothing else.
15. **`docs/backlog.md`** — rows B01, B02, B03: status `done`; each section's
    last line `Planned in: docs/plans/2026-09-13-vwf-process/` (already
    `planned` at approval; flip to `done`). Touch no other row.
16. **`docs/memory/decisions/2026-09-13-vwf-process.md`** — create, per
    `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`'s markdown-mirror shape (match the
    newest file in that directory): the three rulings that outlive this plan —
    the 13/17 component rule and its scope (decisions 1, 2, 4, 5), the backlog's
    sole-writer model and the backlog/feedback distinction (decisions 8, 10, 11,
    verbatim quotes), and change-plan committing and pushing at hand-off
    (decision 7).

## Verification

- `mise run p:site:check` green (the manual builds, links resolve).
- `mise run p:plugins:check` green (`.claude/skills/**` is scanned for nothing,
  but the site docs cite skill names).
- `command grep -rn "seven" .claude/skills/vwf-plugin/references/skills-and-agents.md site/src/content/docs/plugins/vwf.md`
  shows no user-only count of seven.
- `command grep -rln "vwf:backlog" readme.md .claude site/src/content/docs`
  lists at least `skills-and-agents.md`, `docs-tree.md`, `vwf.md`.
- `command grep -n "13" .claude/skills/release/SKILL.md .claude/docs/ci-and-releases.md .claude/skills/plugin-authoring/references/structure.md`
  shows the rule in each.

## Guardrails

- Touch nothing under `plugins/` (U1–U6 own it) and no version file (U8).
- `CLAUDE.md`, `readme.md`, `.claude/**/*.md` and the site docs **are**
  dprint-formatted: run `mise run code:format` before returning; widening a
  table cell re-pads the table — that is expected. Never end a table cell in a
  bare `*`.
- The site's link rule and the markdown mirror are in `site/CLAUDE.md`; read it
  before adding a section.
- Delete with `rm`, never `git rm`.

## Commit

`docs: backlog skill, change-plan hand-off and the 13/17 rule across the
manual and the repo docs`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`docs`; no scopes).
