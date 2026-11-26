# U5 — The design wrappers call vwf-tools

- **Read first:** `plugins/vwf/skills/import-screens/references/delegate.md`,
  `import-design-system/references/delegate.md`,
  `import-conversations/references/delegate.md`, and
  `design-system/references/import.md` (about lines 35-54).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D3:** each wrapper calls `vwf-tools:<role>` (`design-import-screens`,
  `design-import-design-system`, `design-import-conversations`) with the
  registry project name as the first argument, then its arguments as today.
  It no longer looks in the repo's `.claude/skills/`; an old copy there is
  not read.
- If `vwf-tools` has no such skill, or the call stops because the tool's
  reference is absent, the wrapper stops and names `/vwf:setup`.
- **D14:** the four `SKILL.md` files (`import-screens`, `import-design-system`,
  `import-conversations`, `design-system`) name `vwf-tools:<role>` in
  `depends-on`, in their prose and in their stop messages (H2, H3), with the
  fix `/vwf:setup`.
- `design-system/references/import.md` checks the skill in `vwf-tools`, not in
  the repo.

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat: the design wrappers call the vwf-tools role skills with the project`
