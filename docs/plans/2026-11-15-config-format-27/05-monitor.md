# U5 — The progress pane reads members from repo.toml

- **Read first:** `plugins/vwf/hooks/monitor/plan.ts` (`memberPaths`,
  `hostOf` and the base-repo resolution), `register.tsx` (about line 501), and
  `plan.test.ts` and `agents.test.tsx`.
- **Lazy-load:** `.claude/skills/plugin-authoring/SKILL.md` (the hooks module
  rules).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D5:** the pane reads `[members.<name>]` (`folder`) from the base repo's
  `.config/bootstrap/repo.toml`, and `[home]` (`folder`) from a member's, with
  `$.fs.read` and a small TOML read of those two tables only. It writes
  nothing. This is a recorded exception to the rule that plugins never read
  `.config/bootstrap/`.
- **D25:** a repo is a member when its `repo.toml` has a `[home]` table with
  a `folder`; else it acts as a base.
- **D17:** a folder member is part of the base repo's tree: the pane shows
  its plans as the base repo's.
- The pane no longer reads `.config/vwf-membership.yaml` or the `members` of
  `vwf.yaml`.

## Edits

1. **`plan.ts`**: D4, D5.
2. **`register.tsx`**: the read at about line 501.
3. **`plan.test.ts`**, **`agents.test.tsx`**: fixtures in the new form.

## Verification

- `claude plugin test plugins/vwf` passes.
- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside `plugins/vwf/hooks/monitor/`.
- Add no dependency.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the progress pane reads members from bootstrap's repo.toml`
