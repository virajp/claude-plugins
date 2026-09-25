---
name: swiftui
version: 0.1.0
category: development
description: SwiftUI app development on Apple platforms — a committed Xcode
  project, Xcode owning the build. Standards and architecture, state, UI
  composition, navigation, data, platform interop, build and signing, testing,
  and performance. Auto-applies when editing Swift or the Xcode project.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.swift"
  - "**/*.xcodeproj/project.pbxproj"
  - "**/Info.plist"
  - "**/*.entitlements"
---

# SwiftUI

The app stack, and the entry point for its Swift codebase. Read the reference
matching your task — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this stack | [Pick & trade](references/pick-and-trade.md) |
| Anything touching the Xcode project, its targets or its packages | [Project layout & the generated boundary](references/project-layout.md) |
| Module split, placement, app architecture, dependency injection | [Standards & architecture](references/standards-and-architecture.md) |
| Holding or sharing state | [State management](references/state-management.md) |
| Building views, theming, animation | [UI composition & theming](references/ui-composition.md) |
| Navigation stacks, deep links, scenes | [Navigation & routing](references/navigation.md) |
| Serialization, networking, persistence, caching | [Data & networking](references/data-and-networking.md) |
| Reaching UIKit, AppKit, Objective-C or C | [Platform interop](references/platform-interop.md) |
| Build settings, configurations, entitlements, signing | [Build, configurations & signing](references/build-and-signing.md) |
| Writing or running tests, goldens | [Testing & coverage](references/testing.md) |
| Hitches, launch time, memory, app size | [Performance & size](references/performance.md) |

## Platforms

One per Apple platform the app ships, each keyed by the vwf platform token it
realises: a flow's `<token>.md` take is built on that file. Read the one the
screen you are building runs on.

| Token | Read |
| --- | --- |
| `mobile`, `tablet` — one target for iPhone and iPad, size classes, multitasking | [iOS & iPadOS](references/platforms/ios-ipados.md) |
| `desktop` — windows, the menu bar, keyboard and pointer on a Mac | [macOS](references/platforms/macos.md) |
| `auto` — the car's system-drawn templates the app fills, not SwiftUI | [CarPlay](references/platforms/carplay.md) |
| `watch` — seconds-long wrist sessions, one thing per screen | [watchOS](references/platforms/watchos.md) |
| `tv` — a remote ten feet away, where focus is the only way in | [tvOS](references/platforms/tvos.md) |
| `spatial` — windows, volumes and immersive spaces in the room | [visionOS](references/platforms/visionos.md) |

## Integrations (topic 12)

One per Apple integration the app wires. Each is wiring only — setup order,
platform configuration, anti-patterns; its API surface is Context7's at use
time.

| Wiring | Read |
| --- | --- |
| Home Screen, Lock Screen and watch-face surfaces | [Widgets & complications](references/integrations/widgets-and-complications.md) |
| Exposing actions to Siri, Shortcuts and Spotlight | [App Intents](references/integrations/app-intents.md) |
| Remote notifications through APNs | [Push notifications](references/integrations/push-notifications.md) |
| In-app purchases and subscriptions | [StoreKit](references/integrations/storekit.md) |
| Signing users in with their Apple Account | [Sign in with Apple](references/integrations/sign-in-with-apple.md) |
