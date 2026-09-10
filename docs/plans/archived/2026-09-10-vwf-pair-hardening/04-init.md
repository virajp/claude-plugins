# U4 — init: the move-and-shim case says what the dprint pack knows

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/existing-repo.md`
- **Model:** opus
- **Read first:** the owned file, top to bottom, before editing — the
  move-and-shim subsection is `:34-51`.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-gate/dprint/skills/dprint/SKILL.md:53-57`
  and `:122-125` — the two facts, quoted, never restated from memory.

## Ruling

From index.md's assumed decisions, verbatim:

> **8.** `existing-repo.md`'s move-and-shim case gains one paragraph: the moved
> real config must lose its `includes` key (not inherited through `extends`; a
> fatal diagnostic), and dropping it can widen the file set to every extension a
> pinned plugin claims — narrow with `excludes`, never by restoring `includes`.
> Cite the dprint pack's own lines.

The fact, from the 2026-09-09 run: the moved `dprint.json` carried `includes`;
the shim failed with *"Unexpected non-string, boolean, or int property
(includes)"*; dropping `includes` widened the gate to six
`site/public/brand/*.svg` until an `excludes` entry was added.

## Edits

1. **`existing-repo.md`, after `:46-47`** ("the settings survive the move — they
   are read through the stand-in"). Add one paragraph, tool-agnostic in the
   file's own voice (the pack is "the formatter gate pack"; name no tool): the
   survey reads the pack's own conventions for what a moved config may **not**
   carry — the formatter pack states that one key is not inherited through its
   stand-in and is a fatal diagnostic when present, so the move drops it and the
   plan says so as its own line. Dropping it can **widen** what the gate covers,
   since the pack's pinned plugin list then defines the file set; the plan lists
   the files that newly enter the gate, and narrows with an exclusion, never by
   restoring the dropped key. Point at the pack's skill as the authority for
   which key and why.
2. **The plan section** (the six-section plan): the move row for this case gains
   a sub-line for the dropped key and one for each exclusion added, so the user
   sees both before the one consent.

## Verification

- `mise run plugins:check` green.
- `grep -n 'includes\|excludes\|not inherited' plugins/vwf/skills/init/references/existing-repo.md`
  → hits inside the move-and-shim subsection only.
- The paragraph names no tool:
  `grep -n -i 'dprint' plugins/vwf/skills/init/references/existing-repo.md` →
  nothing (the citation is by role — "the formatter gate pack's skill").
- Fold width matches the surrounding prose (80 columns, by hand).

## Guardrails

- Do not touch `plugins/vwf/skills/init/SKILL.md` or the other references.
- Do not touch anything under `plugins/stackgen/` — the dprint pack's lines are
  cited, not edited.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`fix: init's move-and-shim case drops the non-inherited key and narrows with
exclusions`
— written by the orchestrator after the wave gate, not by the unit.
