# U11 — repo-hygiene: drop the Tuist clause

- **Wave:** 3
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`,
  `plugins/stackgen/stacks/bundles/repo-hygiene.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `repo-hygiene/conventions.md:100-145`, the pack's `pack.yaml`,
  the bundle, and index.md's *Amendment 2026-09-24*.

## Ruling

Quoted from index.md: **E24** — "repo-hygiene drops its Tuist `Derived/` clause
(pack 1.2.1 → 1.2.2, bundle pin follows)"; **E25** — "the `Derived` exclusions
in the gate configs and the Swift task scripts stay".

## Edits

1. `conventions.md` — the swift row of the language-section table becomes
   `Swift.gitignore` alone; the paragraph at `:134-140` drops the Tuist
   `Derived/` explanation and the `Project.swift` / `Tuist.swift` detection
   wording, and says a Swift repo's generated trees (`.build/`, `xcuserdata/`)
   are upstream `Swift.gitignore`'s. If the payload `config/` carries Tuist
   logic, report it as `GAP:` — this unit owns only the three files above.
2. `pack.yaml` — `version: 1.2.2`.
3. `bundles/repo-hygiene.md` — pin `repo-hygiene/repo-hygiene@1.2.2`.

## Verification

- `mise run p:plugins:check` green; `grep -ni tuist` over the pack is empty.
- The inventory freshness line is red until the orchestrator regenerates it into
  the wave-3 commit (E27) — expected.

## Guardrails

- Touch nothing outside Owns — never `config/` payload, never another pack.
- Match the surrounding fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.

## Commit

Wave 3 lands as one commit (E27):
`refactor: swiftui stack — a committed Xcode project in place of Tuist`
