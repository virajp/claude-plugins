# U4 — SwiftUI per-platform references and core integrations

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/**`,
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/integrations/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/kinds.md:798-835` (topic 12's rule:
  one artifact per integration, no API surface),
  `plugins/stackgen/assets/artifact-doctrine.md`, Flutter's
  `references/integrations/` files for shape, and — for the interaction
  contracts the platform files must honour —
  `plugins/vwf/skills/blueprint-authoring/references/ui-ux-contract.md` and
  `plugins/vwf/skills/blueprint/references/platforms.md` (read only; plan 1
  added the `watch`, `tv` and `spatial` rules there).

## Ruling

Quoted from index.md:

- **E4** — "one reference per platform (iOS/iPadOS, macOS, CarPlay, watchOS,
  tvOS, visionOS), and Apple's core integrations — widgets and complications,
  App Intents, push notifications, StoreKit, Sign in with Apple. Third-party
  integrations parked."
- **E18** — "Every unit resolves … Apple framework APIs through Context7 …
  before writing about them — never from training knowledge."

## Edits

1. **`platforms/`** — one file per platform, each naming the vwf platform token
   it realises and the interaction contract it must meet:
   - `ios-ipados.md` — `mobile` and `tablet`: size classes, iPad multitasking,
     Dynamic Type; no vendor-specific feature doctrine (plan 1's P1);
   - `macos.md` — `desktop`: windows, menus, keyboard, `Settings` scene;
   - `carplay.md` — `auto`: CarPlay templates, the in-car rules;
   - `watchos.md` — `watch`: glanceable screens, Digital Crown, complications,
     standalone versus companion apps;
   - `tvos.md` — `tv`: the focus engine, remote input, the 10-foot distance, top
     shelf;
   - `visionos.md` — `spatial`: windows, volumes, immersive spaces, gaze and
     pinch, ornaments, RealityKit boundaries.
2. **`integrations/`** — topic 12, one artifact each, wiring not API:
   `widgets-and-complications.md` (WidgetKit across iOS, macOS and watchOS),
   `app-intents.md` (App Intents, Siri, Shortcuts), `push-notifications.md`
   (APNs, entitlements, service extensions), `storekit.md` (StoreKit 2),
   `sign-in-with-apple.md` (AuthenticationServices).

## Verification

- `mise run p:plugins:check` green.
- Exactly the six `platforms/` and five `integrations/` filenames in index.md's
  shared-file rule exist.
- No file lists an API surface.

## Guardrails

- Touch nothing outside Owns — `SKILL.md` is U2's, the top-level topic files
  U3's.
- Cite no plugin path (rule 13) — the vwf files above are read for content,
  never linked.
- `plugins/**/*.md` is not formatted — keep a steady fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: native Swift stack — language, swiftui, swiftpm and gate packs, two bundles`
