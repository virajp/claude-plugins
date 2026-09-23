# U5 — Docs

- **Wave:** 5
- **Depends on:** U7, U8, U9, U10, U11, R12
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts, Assumed decisions and *Amendment
  2026-09-24*, then every file you edit.

## Ruling

Quoted from index.md: E1, E5, E7 and E9 as the table states them, and the
amendment's **E2′** ("a committed `.xcodeproj`, created once by a person in
Xcode; no project generator"), **E6′** (`XCODE_VERSION` in mise `[env]`, checked
by every building task), **E11′**, **E20**, **E24** ("`/vwf:init` maps a root
`*.xcodeproj` directory to swift … repo-hygiene drops its Tuist `Derived/`
clause") and **E25** (the `Derived` exclusions stay). No doc describes Tuist as
part of any shipped stack.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings inside Owns.
2. **Apply every `DOCS FALSIFIED:` line** the units returned — U1–U3 and U7–U11
   — and R1's three: `choosing-your-stack.md:46` (the project-axis coverage
   names only flutter and swift-package), `plugins/stackgen.md:1037` (the
   task-supplier list leaves out `app-framework/swiftui`),
   `plugins/stackgen/stacks/readme.md:72` ("the one bundle whose root is not a
   language"). A line naming a file outside Owns is returned as a `GAP:`.
3. **The survey's list:** `site/src/content/docs/plugins/stackgen.md` — the
   `app-framework` kind's archetype text gains SwiftUI beside Flutter (the
   `native-ui` category's first pack), the bundle described, the Tuist wording
   at `:670` and `:688` corrected (`Derived` stays a generic generated-tree
   name, E25; the repo-hygiene Tuist clause is gone), any count re-counted;
   `site/src/content/docs/plugins/vwf.md:1060` — init's stack read maps a
   `*.xcodeproj` to swift; `choosing-your-stack.md` — the native Swift app
   option beside Flutter; `.claude/skills/stackgen-plugin/` — the `native-ui`
   example; `.claude/skills/vwf-plugin/references/skills-and-agents.md` — any
   Tuist wording in the `init` row; `plugins/stackgen/stacks/readme.md` — the
   narrative gains the SwiftUI app stack.

No decision doc here — plan 2d's docs unit writes the chain's one decision doc.

## Verification

- `mise run p:site:check` green;
  `grep -rn 'swift-swiftui' site/src/content/docs` hits;
  `grep -rni tuist site/src/content/docs .claude readme.md CLAUDE.md` empty.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/` other than
  `plugins/stackgen/stacks/readme.md`.
- dprint-formatted files: keep every code span on one line, never end a table
  cell in a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`docs: SwiftUI app stack — reconcile the manual`
