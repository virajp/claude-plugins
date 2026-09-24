# U2 — SwiftUI core integrations (topic 12)

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/integrations/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/kinds.md:798-835` and `:1137-1140`,
  `plugins/stackgen/assets/artifact-doctrine.md`, and Flutter's
  `skills/flutter/references/integrations/` files for shape.

## Ruling

Quoted from index.md:

- **E4** — "… and Apple's core integrations — widgets and complications, App
  Intents, push notifications, StoreKit, Sign in with Apple. Third-party
  integrations parked."
- **E18** — "Units resolve Apple framework behaviour through Context7 … before
  writing about it — never from training knowledge."

## Edits

Topic 12, one artifact each, wiring not API:

- `widgets-and-complications.md` — WidgetKit across iOS, macOS and watchOS;
- `app-intents.md` — App Intents, Siri and Shortcuts;
- `push-notifications.md` — APNs, entitlements, service extensions;
- `storekit.md` — StoreKit 2;
- `sign-in-with-apple.md` — AuthenticationServices.

## Verification

- `mise run p:plugins:check` green.
- Exactly the five fixed `integrations/` filenames exist; none lists an API
  surface.

## Guardrails

- Touch nothing outside Owns — the router is U3's, platforms U1's.
- Cite no plugin path (rule 13).
- `plugins/**/*.md` is not formatted — keep a steady fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: SwiftUI core integrations — widgets, App Intents, push, StoreKit, Sign in with Apple`
