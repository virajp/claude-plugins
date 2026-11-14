# U3 — stackgen's plugin handoff goes through bootstrap config and setup:ai

- **Read first:** `plugins/stackgen/skills/stackgen-stack-template/references/bootstrap-handoff.md`
  whole, as R3a leaves it (the plugin steps, about lines 50-60, and
  *Removal*, about lines 94-115), and `plugins/stackgen/assets/bootstrap-contract.md`.
- **Lazy-load:** the R2c plan `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/2026-11-14-plugins-setup-ai/`
  (setup:ai's record and removal, D3 to D5).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D3:** to add a pack's plugin, the handoff runs
  `bootstrap config set tools.claude.plugins.<scope>."<plugin>@<marketplace>" '"<source>"' --json`
  (the key segment is double-quoted, R1a D49), then `mise run setup:ai`. To
  remove one, it runs `bootstrap config unset` of that key, then
  `mise run setup:ai`, which uninstalls a project-scope plugin it recorded. A
  user-scope plugin stays installed; the report says so. Both are inside the
  handoff's one consent, and the commit carries what bootstrap wrote.
- **D6:** if `bootstrap describe --json` `data.tools` does not list `claude`,
  the handoff first runs `bootstrap add tool claude --json --dry-run`, then
  `--yes`, inside the same consent.
- **D7:** if `setup:ai` exits 1 after the set, keep the written key, commit
  it into the materializer's one commit (D18), and record the plugin in the
  lockfile; report the failure, and the next
  `setup:ai` tries again. On a removal the key stays unset; R2c keeps the
  plugin in its record until an uninstall succeeds.
- **D14:** if `config set`, `config unset` or `add tool claude --yes` fails,
  stop before `setup:ai`, show bootstrap's `errors`; the handoff writes
  nothing for that plugin step (D18).
- **D17:** the subtraction read prints `null` for an unset key or a tool that
  is not selected (R1a D50): `null` is an empty list. Any non-zero exit stops
  the handoff before the consent, with bootstrap's `errors`.
- **D21:** the subtraction also drops each plugin that
  `claude plugin list --json` shows installed at that scope for this repo (`enabled` true, and user
  scope, or a `projectPath` that is this repo's main checkout or a worktree of
  it), so stackgen never takes over a hand install.
- **D19:** `materializer.md` (about lines 107-109): Claude plugins go through
  the claude tool's values and `setup:ai` (D3), not `docs/sync/vwf.md`. Change
  nothing else in that file.
- The verbs `bootstrap: add <scope> plugins […]` and
  `bootstrap: remove <scope> plugins […]`, and the key `[claude.plugins.*]`, go.
- The rule that a plugin another repo of the product claims through an `addon`
  pack is not removed stays as it is.

## Edits

1. **`bootstrap-handoff.md`**: the plugin collection and its subtraction (a
   plugin the claude tool already lists: read with
   `bootstrap config get tools.claude.plugins.<scope> --json`), the add, and
   *Removal*: D3.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned file.

## Guardrails

- Touch nothing outside the two owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen's plugin handoff goes through bootstrap config`
