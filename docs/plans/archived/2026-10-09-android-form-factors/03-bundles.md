# U3 — Bundles: platforms, pins and the trade-off text

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/kotlin-compose.md`,
  `plugins/stackgen/stacks/bundles/android-library.md`,
  `plugins/stackgen/stacks/bundles/dart-flutter.md`,
  `plugins/stackgen/stacks/bundles/swift-swiftui.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** all four owned files.

## Ruling

> - Decision F1: `kotlin-compose` gets `watch` (Wear OS), `tv` (Android TV /
>   Google TV) and `auto` (Android Auto / Automotive OS). `spatial` (Android XR)
>   is out of scope.
> - Decision F5: One bundle holds all the platforms, as `swift-swiftui` does.
>   `kotlin-compose` repins to `framework/android@0.2.0` and
>   `app-framework/compose@0.2.0`. `android-library` repins to
>   `framework/android@0.2.0`.
> - Decision F6: The trade-off text in `dart-flutter.md` and `swift-swiftui.md`
>   (`:48-56`, `:94` "No Android") names the Kotlin Compose stack.

## Edits

1. **`kotlin-compose.md`** — `platforms: [mobile, tablet, watch, tv, auto]`;
   pins `framework/android@0.2.0`, `app-framework/compose@0.2.0` (the plan A
   pins stay); body: an OS-to-token table in the shape of
   `swift-swiftui.md:31-39` (phone and tablet, Wear OS, Android TV / Google TV,
   Android Auto / Automotive OS), that `auto` is declared only with `mobile`,
   and that Android XR is not covered.
2. **`android-library.md`** — pin `framework/android@0.2.0`.
3. **`dart-flutter.md`** — where the text says when to pick Flutter, add when to
   pick the native stacks instead: Kotlin Compose for Android-only or
   Android-first apps, SwiftUI for Apple-only apps.
4. **`swift-swiftui.md`** — `:48-56` (when to pick it over Flutter) also names
   Kotlin Compose; `:94` "No Android" points to the Kotlin Compose stack by
   name.

## Verification

- `mise run p:plugins:check` (rule 14: no default added).
- The full wave gate after the orchestrator regenerates the inventory (the pins
  must match U1's and U2's `0.2.0`).

## Guardrails

- Do not touch any file outside Owns; no `default:` key on any bundle.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (F8): `feat: android form factors — wear os, tv, auto`.
