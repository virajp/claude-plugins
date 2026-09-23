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

**Per-platform and integration references are added beside these** — one per
Apple platform the app ships, and one per integration it wires — each wiring
only, its API surface Context7's at use time.
