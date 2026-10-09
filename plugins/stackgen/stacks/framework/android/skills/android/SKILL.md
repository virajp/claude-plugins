---
name: android
version: 0.1.0
category: development
description: Android build framework — the Android Gradle plugin and the
  android {} block, the SDK levels, AndroidManifest.xml, build types and
  flavors, Android Lint and its baseline, R8, the emulator and Gradle Managed
  Devices, AAR library modules and their publishing, and instrumented UI tests
  on the emulator. Auto-applies when editing an Android manifest, resource,
  keep rule, lint config or module build script.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/AndroidManifest.xml"
  - "**/src/*/res/**"
  - "**/build.gradle.kts"
  - "**/proguard-rules.pro"
  - "**/consumer-rules.pro"
  - "**/lint.xml"
  - "**/lint-baseline.xml"
---

# Android

The build framework under every Android module. Each topic is its own
reference — **read the one matching your task**, not all of them.

AGP owns an Android module's build: its SDK levels, its manifest merge, its
variants, its shrinking, its tests on a device. The judgment here is about
keeping those decisions in one place and keeping the gates honest. API
reference is not here — look a DSL property up when you need it.

| Doing | Read |
| --- | --- |
| The `android {}` block, the SDK levels, build types and flavors | [Build configuration](references/build-configuration.md) |
| The manifest, permissions, components, the merge | [Manifest](references/manifest.md) |
| Android Lint, its config and its baseline | [Lint](references/lint.md) |
| Release shrinking, keep rules | [R8](references/r8.md) |
| The SDK install, the emulator, Gradle Managed Devices | [Emulator & managed devices](references/emulator-and-managed-devices.md) |
| An AAR library module and publishing it | [Library modules](references/library-modules.md) |
| Instrumented UI tests on the emulator — the E2E run | [UI tests](references/ui-tests.md) |
| Wear OS, Android TV, Android Auto, Automotive OS — the manifest and devices | [Form factors](references/form-factors.md) |
| A Baseline Profile and Macrobenchmark | [Baseline profiles](references/baseline-profiles.md) |
| A Play Feature Delivery module | [Dynamic features](references/dynamic-features.md) |
| An instant app — retired | [Instant apps](references/instant-apps.md) |

For the Kotlin baseline, see the **kotlin** skill; for the build scripts, the
version catalog and the lockfile, **gradle**; for Compose, the UX gate and the
goldens, **compose**; for formatting and static analysis, **ktlint** and
**detekt**.
