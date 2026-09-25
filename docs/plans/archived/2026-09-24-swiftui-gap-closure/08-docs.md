# U8 — Docs

- **Wave:** 3
- **Depends on:** U1, U2, U3, U4, U5, U6, R7
- **Owns:** `site/src/content/docs/**`, `.claude/skills/**`, `.claude/docs/**`,
  `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts, Assumed decisions and Goal, then every file
  you edit.

## Ruling

Quoted from index.md: F1 (the probe form), F2 (`lockfile:`), F3 ("`/vwf:setup`'s
materialize pass … runs each `detect`, offers the value preselected … fills the
pack's marked position"), F4 (the swiftui `conf.d/swiftui.toml`), F5, F6, F7, F8
and F9, as the table states them. The G8 question is setup's, not init's.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings inside Owns.
2. **Apply every `DOCS FALSIFIED:` line** the units returned. A line naming a
   file outside Owns is returned as a `GAP:`.
3. **The survey's list:** `site/src/content/docs/plugins/stackgen.md:267`,
   `:295`, `:296-302`, `:629`, `:1066` (the binaries fact, the pack fields, the
   swiftui pin, the gate packs' exclusions);
   `site/src/content/docs/plugins/vwf.md:698`, `:723`, `:835` (doctor's binary
   and lockfile checks) and the materialize pass around `:1791` (setup's
   machine-env question);
   `.claude/skills/vwf-plugin/references/skills-and-agents.md:27-28`, `:40` and
   `references/assets.md:27`; `.claude/skills/plugin-authoring/` where it lists
   what the checker asserts (F10); `.claude/skills/stackgen-plugin/` where it
   lists pack facts; `plugins/stackgen/stacks/readme.md:58`, `:87-88`;
   `CLAUDE.md` where it enumerates the checker's rules or the facts, only if the
   edit changed what it says (keep the passage's length).

No decision doc here — plan 2d's docs unit writes the chain's one decision doc.

## Verification

- `mise run p:site:check` green.
- `grep -rni tuist site/src/content/docs .claude readme.md CLAUDE.md` (excluding
  `.claude/worktrees`) empty.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/` other than
  `plugins/stackgen/stacks/readme.md`.
- dprint-formatted files: keep every code span on one line, never end a table
  cell in a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash` or a formatter's `--fix`
  outside Owns. Delete with `rm`, never `git rm`.

## Commit

`docs: SwiftUI gap closure — reconcile the manual`
