# U11 — Docs and the two decision records

- **Wave:** 3
- **Depends on:** U4, U8, U9, U10
- **Owns:** `site/src/content/docs/**`, `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-09-23-swift-native-stack.md`,
  `docs/memory/decisions/2026-10-10-flutter-dependency-parity.md` (new),
  `.claude/skills/stackgen-plugin/**`, `readme.md`, and any other human-facing
  passage `vwf:docs-sync` finds
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts (with the Dependency map) and Assumed
  decisions; the U1 to U10 diffs; then each owned passage before editing it.

## Ruling

> **Goal.** The SwiftUI and Compose app-framework packs cover every dependency
> the 95octane Flutter frontend uses: each has an integration reference, a
> native answer in a topic file, or a recorded "not applicable" with its reason.

> - Decision T10: The docs unit appends a dated addendum to
>   `docs/memory/decisions/2026-09-23-swift-native-stack.md`: E4's parked
>   third-party set shipped in this plan, with T1 to T3 and T12.
> - Decision T16: The docs unit writes
>   `docs/memory/decisions/2026-10-10-flutter-dependency-parity.md` holding the
>   "Dependency map" table, with each answer re-pointed at the file that landed.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1 to U10 returned.
2. `site/src/content/docs/plugins/stackgen.md:347-356` — the SwiftUI integration
   list gains the eleven; drop "Third-party integrations are not covered yet."
   `:413-418` — the Compose list gains the thirteen.
3. `plugins/stackgen/stacks/readme.md:132-135` (SwiftUI) and `:140-143`
   (Compose) — the same.
4. `docs/memory/decisions/2026-09-23-swift-native-stack.md` — append an addendum
   section dated 2026-10-10 at the end: E4's parked third-party set shipped in
   `docs/plans/2026-10-10-swiftui-third-party-integrations`, with T1, T2, T3 and
   T12. Do not rewrite E4 or the parked list above it.
5. Write `docs/memory/decisions/2026-10-10-flutter-dependency-parity.md` in the
   shape of the other docs in that folder: the date, a link to this plan folder,
   "Completes B61 and B99", the source pubspec
   (`95octane/frontend/pubspec.yaml`), then the Dependency map from index.md
   with each answer pointing at the file that actually landed (read the diffs),
   and the rulings T11 to T16 with their rejected alternatives.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit `plugins/stackgen/stacks/app-framework/**`,
  `plugins/stackgen/stacks/bundles/**` or `inventory.md` — earlier units and U12
  own them; a falsified passage there is a `GAP:`.
- Do not edit `docs/plans/**` or any other decisions doc.
- `readme.md` is dprint-formatted; keep each code span on one line and never end
  a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`docs: swiftui and compose integrations — the manual and the parity record`
