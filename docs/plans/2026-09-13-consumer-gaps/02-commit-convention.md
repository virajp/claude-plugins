# U2 — vwf skills write commits the pack's gate accepts

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/git-workflow/SKILL.md`,
  `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/product/SKILL.md`,
  `plugins/vwf/skills/design-system/SKILL.md`,
  `plugins/vwf/skills/blueprint/SKILL.md`,
  `plugins/vwf/skills/feedback/SKILL.md`, `plugins/vwf/skills/mockups/SKILL.md`,
  `plugins/vwf/skills/archive/SKILL.md`,
  `plugins/vwf/skills/screens/references/prompt-mode.md`,
  `plugins/vwf/skills/screens/references/import-mode.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/git-conventional-commits.yaml`
  (the ten types, `:9-24`; the scopes marked position, `:26-39`) — read, never
  edit.

## Ruling

Decision 3: "Bare `docs:` — no scope — for every blueprint-tree commit (product,
architecture, blueprint, design-system, plan, screens, archive, feedback);
`chore(vwf):` becomes `ops:` (the pack absorbs chore into ops). The "Common
types" lists in git-workflow and change-plan become the pack's ten, verbatim:
`feat`, `fix`, `perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`,
`wip`. No init change, no format bump."

The anchor, from the pack file's header: "a specification or a design document
is `docs`" and, on scopes, "a single-project repo leaves it empty and uses no
scope".

## Edits

1. **`plugins/vwf/skills/git-workflow/SKILL.md`** — `:179-180` "Common types:
   `feat`, `fix`, `refactor`, `wip`, `blueprint`, `test`, `ops`, `docs`,
   `merge`" → the pack's ten in the pack's order: "Common types: `feat`, `fix`,
   `perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`, `wip`". Add one
   clause: a specification or a design document is `docs`; there is no
   `blueprint` type. Step 4 (`:164-166`) already says the convention file is
   authoritative — leave it.
2. **`plugins/vwf/skills/change-plan/SKILL.md`** — `:72-73` the fallback list
   copied from git-workflow: the same ten, same order.
3. **`plugins/vwf/skills/product/SKILL.md`** — `:131,134,135` every
   `blueprint(product):` → `docs:`; the subject names the doc where the scope
   did (e.g. `docs: product — <what changed>`), keeping each example's subject
   otherwise intact.
4. **`plugins/vwf/skills/design-system/SKILL.md`** — `:205`
   "`blueprint(design-system):` or `docs(design-system):`" → `docs:` alone,
   subject naming the design system.
5. **`plugins/vwf/skills/blueprint/SKILL.md`** — `:535`
   "`blueprint(<flow|entity>):` or `docs(blueprint):`" → `docs:` alone, the flow
   or entity named in the subject.
6. **`plugins/vwf/skills/feedback/SKILL.md`** — `:156` "`docs:` or
   `blueprint(...)`" → `docs:` alone.
7. **`plugins/vwf/skills/mockups/SKILL.md`** — `:74`
   `chore(vwf): gitignore
   docs/scratchpad` →
   `ops: gitignore docs/scratchpad`; `:139`
   `chore(vwf):
   stamp rendered flows` → `ops: stamp rendered flows`.
8. **`plugins/vwf/skills/archive/SKILL.md`** — `:140`
   `docs(plan): archive
   <slice>` → `docs: archive plan <slice>`.
9. **`plugins/vwf/skills/screens/references/prompt-mode.md`** — `:93`
   `docs(prompts): screens brief for <flow>` →
   `docs: screens brief for
   <flow>`.
10. **`plugins/vwf/skills/screens/references/import-mode.md`** — `:77`
    `docs(prompts): fold canvas conventions` → `docs: fold canvas conventions`.

Leave every `docs: nothing contradicted` **report string** alone — it is a
report line, not a commit message. Leave `handoff/SKILL.md` (`wip:`, `ops:`) and
`init/SKILL.md` (`ops:`) alone — already conformant, and not in Owns.

## Verification

- `command grep -rn "blueprint(\|chore(vwf)\|docs(product)\|docs(design-system)\|docs(blueprint)\|docs(prompts)" plugins/vwf/`
  returns **only** hits inside `plugins/vwf/skills/architecture/SKILL.md`,
  `plugins/vwf/skills/plan/SKILL.md` and `plugins/vwf/skills/setup/SKILL.md`
  (U4's and U5's — they carry the same ruling for their own lines). After wave 1
  the same grep over `plugins/vwf/` is empty.
- `command grep -n "Common types" plugins/vwf/skills/git-workflow/SKILL.md plugins/vwf/skills/change-plan/SKILL.md`
  shows both lists carrying `perf` and `revert` and not `blueprint`.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `plugins/vwf/skills/architecture/SKILL.md`,
  `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/execute/SKILL.md`
  (U4), `plugins/vwf/skills/setup/SKILL.md` (U5), or
  `plugins/vwf/skills/init/**` (not in this plan). Their prefix lines are
  theirs.
- Do not edit the pack's `git-conventional-commits.yaml` — it is the anchor, not
  the drift.
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand.

## Commit

`fix: vwf skills write bare docs: and ops: commits the commit gate accepts` —
written by the orchestrator after the wave gate, not by the unit. Bare type;
this repo's convention file lists no scopes.
