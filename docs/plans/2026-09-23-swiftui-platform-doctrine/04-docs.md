# U4 — Docs and the chain's decision doc

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/docs/**`, `readme.md`, `CLAUDE.md`,
  `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-09-23-swift-native-stack.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** this index.md, and the Assumed decisions tables of the three
  archived plans before it —
  `docs/plans/archived/2026-09-23-swift-stack-mechanism/index.md`,
  `docs/plans/archived/2026-09-23-swift-package-stack/index.md`,
  `docs/plans/archived/2026-09-23-swiftui-app-stack/index.md` — and the retired
  `docs/plans/archived/2026-09-23-swift-native-stack/index.md`, whose table is
  the chain's original. Where one of them is still live under `docs/plans/`,
  read it there.

## Ruling

Quoted from index.md:

- **S6** — "The chain's one decision doc is written here, covering plans 2a–2d."
- **E4** — the depth ruling, as the table states it.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings inside Owns.
2. **Apply every `DOCS FALSIFIED:` line** U1–U3 returned; one naming a file
   outside Owns is returned as a `GAP:`.
3. **The survey's list:** `site/src/content/docs/plugins/stackgen.md` — where
   the page describes the swiftui pack, its platform references and core
   integrations; `plugins/stackgen/stacks/readme.md` — the narrative notes the
   doctrine landed.
4. **The decision doc**
   `docs/memory/decisions/2026-09-23-swift-native-stack.md`, in the shape
   `plugins/vwf/assets/memory.md` gives: the native Swift stack's rulings
   (E1–E18 and S1–S6) with their rejected alternatives, the four-plan chain and
   why it was re-cut, and that it completes B56 with plan 1.

## Verification

- `mise run p:site:check` green.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/` other than
  `plugins/stackgen/stacks/readme.md`.
- dprint-formatted files: keep every code span on one line, never end a table
  cell in a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`docs: native Swift stack — platform doctrine, and the chain's decision record`
