# U5 — Docs

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `site/src/content/docs/**`, `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-09-23-swift-native-stack.md`,
  `.claude/skills/stackgen-plugin/**`, `readme.md`, and any other human-facing
  passage `vwf:docs-sync` finds
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; the U1 to U4
  diffs; then each owned passage before editing it.

## Ruling

> **Goal.** The SwiftUI app-framework pack carries wiring doctrine for eleven
> more integrations — nine third-party SDKs and two Apple frameworks — so a
> SwiftUI product has the integration coverage a Flutter product has today.

> - Decision T1: Eleven files: the six Firebase files, `revenuecat.md`,
>   `image-handling.md`, `webrtc.md`, `maps-and-location.md` (MapKit and Core
>   Location), `webview.md` (`WKWebView`).
> - Decision T10: The docs unit appends a dated addendum to
>   `docs/memory/decisions/2026-09-23-swift-native-stack.md`: E4's parked
>   third-party set shipped in this plan, with T1 to T3.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1 to U4 returned.
2. `site/src/content/docs/plugins/stackgen.md:347-356` — the integration list
   gains the eleven; drop "Third-party integrations are not covered yet."
3. `plugins/stackgen/stacks/readme.md:132-135` — the same.
4. `docs/memory/decisions/2026-09-23-swift-native-stack.md` — append an addendum
   section dated 2026-10-10 at the end: E4's parked third-party set shipped in
   `docs/plans/2026-10-10-swiftui-third-party-integrations`, with T1 (the set
   and why the Dart-only three do not apply), T2 (Nuke over Kingfisher and
   `AsyncImage`) and T3 (WebRTC and LiveKit, both). Do not rewrite E4 or the
   parked list above it.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit `plugins/stackgen/stacks/app-framework/**`,
  `plugins/stackgen/stacks/bundles/**` or `inventory.md` — earlier units and U6
  own them; a falsified passage there is a `GAP:`.
- Do not edit `docs/plans/**` or other decisions docs.
- `readme.md` is dprint-formatted; keep each code span on one line and never end
  a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`docs: swiftui third-party integrations — the manual follows`
