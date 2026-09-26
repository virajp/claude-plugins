# U3 — Docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `plugins/stackgen/stacks/toolchain-gate/dprint/conventions.md`,
  `plugins/stackgen/stacks/toolchain-gate/dprint/skills/**`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/skills/**`, `.claude/**`,
  `site/src/content/docs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files; index.md's Facts.

## Ruling

The Goal, quoted:

> After this lands, no formatter and no pre-commit hook rewrites a file under
> `.config/mise/locks/` — the committed sidecar tree whose digest `mise.lock`
> records — in a shaped repo or in this one.

Any sentence you add is short.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns.
2. **`pre-commit/conventions.md`** :91–92 — the sidecar exclusion now sits in
   all four lists (linter, dprint, taplo, the global `exclude`), not the linter
   alone.
3. **The dprint pack's conventions or skill** — where it lists what its excludes
   cover, add the sidecar tree.
4. **Rule 15's description**
   (`.claude/skills/plugin-authoring/references/checks.md` or the site) only if
   it enumerates the entries.

## Verification

- `mise run code:precommit` green
- `mise run p:plugins:check` green
- `mise run p:site:check` green

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand.
- Never touch a payload file or a version.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: the mise lock sidecar is excluded from every formatter list` — written by
the orchestrator after the wave gate.
