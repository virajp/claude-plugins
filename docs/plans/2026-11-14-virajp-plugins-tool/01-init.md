# U1 — init adds the virajp-plugins tool to the base repo

- **Read first:** the three owned files, as R3a and R3b leave them (the
  bootstrap step, the apply order, the reshape pass), and
  `plugins/vwf/assets/bootstrap-contract.md`.
- **Lazy-load:** the R2c plan in the bootstrap repo,
  `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/2026-11-14-plugins-setup-ai/`
  (or its archived path): the `virajp-plugins` tool.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D1:** in the base repo only, after the bootstrap step, `init` runs
  `bootstrap add tool virajp-plugins --json --dry-run`, shows the plan, and
  inside its one consent runs it again with `--yes`. A pending question is
  asked and given as `--answer`, as the bootstrap step does. Member repos do
  not get the tool.
- **D9:** first read `bootstrap catalog --json`. If it has no
  `virajp-plugins` tool, skip the add and give a warning.
- **D2:** a reshape (`/vwf:setup reshape`) adds the tool when the base repo's
  `bootstrap describe --json` `data.tools` does not list it, and is otherwise
  unchanged. The init plan shows the add as one row of the base repo's section.

## Edits

1. **`init/SKILL.md`**: the apply order and the bootstrap step: D1; the plan
   rows: D1, D2.
2. **`init/references/new-repo.md`**: the bootstrap step: D1; about line 125
   ("The ignore file is bootstrap's git tool"): vwf's lines come from the
   `virajp-plugins` tool (D16).
3. **`init/references/existing-repo.md`**: the reshape pass: D2.

## Verification

- `mise x -- mise run code:format` passes.
- `grep -nF 'add tool virajp-plugins' plugins/vwf/skills/init/SKILL.md` finds
  the step.

## Guardrails

- Touch nothing outside the three owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init adds the virajp-plugins tool to the base repo`
