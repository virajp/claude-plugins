# U3 — init: the plugin question and the two fills

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`. Touch nothing outside
  this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom, **as plan 1 left them** (the
  forge question is gone; `MERGE_MODEL` and `MEMBERS` are marked positions). The
  question list is `SKILL.md:144-165` region; the marked positions
  `new-repo.md:138-172`; the existing-repo check `existing-repo.md:229-234`.
- **Lazy-load:** `01-setup-ai-task.md` for the exact `--inventory` row shapes.

## Ruling

Quoted from index.md:

> **3. The two slots.** "init asks, seeded from what this machine has
> registered." … `init` runs `mise run setup:ai --inventory`, shows the rows as
> an MCQ (multi-select, "none" allowed), and writes the confirmed rows into the
> two positions. `init` never reads `settings.json` or names `claude` — D22's
> rejection stands.

## Edits

1. **`SKILL.md`** — the interview gains one question, placed after the
   project-id confirmation and before the licence: "Which plugins does this repo
   require beyond the workflow's own?" Seeded by running
   `mise run setup:ai --inventory` (the task library's task; `init` names no
   tool, and this is a task like the ones the pack ships) and showing its rows
   as a multi-select with a "none" answer. Update the question count wherever it
   is stated. Do not name `claude`, a marketplace, or a plugin by name other
   than the workflow's own.
2. **`new-repo.md`** — §138 *The marked positions*: add the two arrays in the
   task library's plugin task; the confirmed rows are written one per line at
   each position in the exact row shape the position's comment shows, the
   comment left in place. A "none" answer leaves both as shipped. When the
   inventory prints nothing (an unshaped machine), the question is still asked
   with only "none" to pick, and the report says so.
3. **`existing-repo.md`** — `:229-234`: the same two positions are checked; a
   position still carrying only the template on a repo whose answer was
   non-empty is a create; one already carrying rows is compared with the
   confirmed answer and any difference is a rewrite listed in the plan. Note the
   standing gap here in one sentence: a `setup/ai` that differs from the pack's
   byte for byte is "already owned" today and is plan 3's to reconcile — do not
   add a rule for it.

## Verification

- `grep -n 'inventory' plugins/vwf/skills/init/SKILL.md …/new-repo.md …/existing-repo.md`
  hits all three.
- `grep -rniE '\bclaude plugin\b|marketplace' plugins/vwf/skills/init` adds no
  hit beyond what exists today.
- `mise run p:plugins:check` green; frontmatter untouched.

## Guardrails

- Do not touch `git-workflow`, `doctor`, `setup`, or `plugins/vwf/assets/`.
- `init` names no tool; it runs a task by its contract name.
- Strict-YAML frontmatter untouched. Match fold width by hand.
- Delete with `rm`, never `git rm` (nothing to delete).

## Commit

`feat: init asks which plugins the repo requires and fills setup:ai's two slots`
— written by the orchestrator after the wave gate. Type `feat`; no scope.
