# U5 — the other skills and pack docs that tell a user to run `/vwf:init`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/readme/SKILL.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md`,
  `plugins/stackgen/stacks/bundles/mise.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** none.

## Ruling

The user, on the feedback that produced this plan:

> Disable user invocation of this skill and let it be invoked by `vwf:setup`
> skill.

From index.md's assumed decisions:

> **5.** Only a passage that tells a **user to type** `/vwf:init` changes (to
> `/vwf:setup reshape`, or to setup's offer). "init" as the actor that lays a
> file down stays — the skill still exists and is still named init.

## Edits

1. **`plugins/vwf/skills/readme/SKILL.md:28`** — "renaming an existing
   `README.md` is `/vwf:init`'s, as one line of a surveyed plan". init as the
   actor stays. If the sentence goes on to tell the user to run `/vwf:init`, it
   now says the rename happens when setup offers init (or on
   `/vwf:setup reshape`).
2. **`task-library.md:205`, `:470`, `:506`**; **`conventions.md:48`**;
   **`bundles/mise.md:33`** — each names init. For every hit, judge by decision
   5: a description of what init fills or lays down stays as written; an
   instruction to *run* `/vwf:init` becomes `/vwf:setup reshape`. Expect most to
   be the former. Change no other sentence.
3. Grep each owned file for `/vwf:init` after editing and read every remaining
   hit once more against decision 5.

## Verification

- `mise run plugins:check` green (rule 10: these files are pack doctrine and may
  name their own tool; do not add a name that is not already there).
- `grep -n '/vwf:init' <each owned file>` — every remaining hit describes init
  as the actor; none instructs a user to type it.
- markdownlint via the wave gate. `plugins/**/*.md` is **not** dprint's — match
  the surrounding fold width by hand. None of these paths is under a pack's
  `config/` payload tier; if you find yourself in one, stop — it is not yours.

## Guardrails

- Touch nothing outside the four owned files. `plugins/stackgen/skills/**` is
  U4's; `plugins/vwf/skills/{init,setup,doctor}/**` are U1–U3's; every doc is
  U6's — report as `DOCS FALSIFIED:`.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Do not edit `plugins/stackgen/stacks/inventory.md` — generated, U7's.
- Write with Write/Edit, never `cat` heredocs.

## Commit

Part of wave 1's commit — written by the orchestrator after the wave gate, not
by the unit.
