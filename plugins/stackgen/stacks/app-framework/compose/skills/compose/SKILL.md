---
name: compose
version: 0.1.0
category: development
description: Jetpack Compose app development on Android — Material 3, a
  ViewModel with StateFlow per screen, Hilt, Navigation Compose and Room.
  Standards and architecture, state, UI composition and theming, navigation,
  data, accessibility, previews, platform interop, build variants, testing and
  goldens, and performance. Auto-applies when editing the app's Kotlin or its
  Android manifest.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.kt"
  - "**/AndroidManifest.xml"
---

# Jetpack Compose

The app stack, and the entry point for its Kotlin codebase's UI and app layers.
The language itself — null safety, coroutines, the build — is the `kotlin`
skill's. Read the reference matching your task — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this stack | [Pick & trade](references/pick-and-trade.md) |
| Modules, source sets, what is generated and never committed | [Project layout & the generated boundary](references/project-layout.md) |
| Layers, the ViewModel, unidirectional data flow, dependency injection | [Standards & architecture](references/standards-and-architecture.md) |
| Holding state in a composable, hoisting it, recomposition | [State management](references/state-management.md) |
| Layouts, Material 3 theming, animation | [UI composition & theming](references/ui-composition.md) |
| Semantics, TalkBack, touch targets, font scale | [Accessibility](references/accessibility.md) |
| Routes, the back stack, deep links | [Navigation & routing](references/navigation.md) |
| Repositories, persistence, networking, offline | [Data & networking](references/data-and-networking.md) |
| Permissions, activity results, system services, the Android framework | [Platform interop](references/platform-interop.md) |
| Build types, flavours, the Compose compiler, shrinking | [Build & variants](references/build-and-variants.md) |
| `@Preview` functions and what they are for | [Previews](references/previews.md) |
| Writing or running tests, goldens, emulator tests | [Testing & coverage](references/testing.md) |
| Jank, recomposition counts, startup, app size | [Performance & size](references/performance.md) |
| A home-screen app widget with Jetpack Glance | [Glance widgets](references/glance-widgets.md) |

## Platforms

One per Android surface the app ships, each keyed by the vwf platform token it
realises: a flow's `<token>.md` take is built on that file.

| Token | Read |
| --- | --- |
| `mobile`, `tablet` — one app for phones, foldables and tablets, window size classes | [Phone & tablet](references/platforms/phone-and-tablet.md) |
| `watch` — Wear OS: Compose for Wear OS, rotary input, tiles and complications | [Wear OS](references/platforms/wear-os.md) |
| `tv` — Android TV and Google TV: Compose for TV, D-pad focus, the ten-foot layout | [Android TV](references/platforms/android-tv.md) |
| `auto` — Android Auto and Automotive OS: Car App Library templates, not Compose | [Android Auto](references/platforms/android-auto.md) |

## Integrations (topic 12)

One per Jetpack library the app wires. Each is wiring only — setup order,
configuration, anti-patterns; its API surface is Context7's at use time.

| Wiring | Read |
| --- | --- |
| Dependency injection across the app, ViewModels and tests | [Hilt](references/integrations/hilt.md) |
| The local database, its schema and migrations | [Room](references/integrations/room.md) |
| The navigation graph, routes and deep links | [Navigation Compose](references/integrations/navigation-compose.md) |
| Small key-value or typed settings | [DataStore](references/integrations/datastore.md) |
| Deferrable work that must survive process death | [WorkManager](references/integrations/workmanager.md) |
| Large lists loaded page by page | [Paging](references/integrations/paging.md) |
| The camera preview, capture and analysis | [CameraX](references/integrations/camerax.md) |
