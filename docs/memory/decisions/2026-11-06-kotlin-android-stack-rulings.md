DECISION 2026-10-09 ★3 | kotlin and android stack | Kotlin and Android packs
follow the Swift pattern; the user ruled on the run gaps on 2026-10-18 — each
ruling keeps the doctrine true and sends tool pins to bootstrap | alt Views
interop, KMP, Kotest, Paparazzi, XR rejected

**Source plan** `2026-10-09-kotlin-language-stack`,
`2026-10-09-android-compose-stack`, `2026-10-09-android-form-factors`.

The three plans are plan A, B and C of backlog item B57. The packs and the
bundles `kotlin-library`, `android-library` and `kotlin-compose` are in the
tree. This record keeps what the tree does not say.

Scope choices and the reason:

- Compose only, with Material 3. Views/XML and Kotlin Multiplatform stay out.
- Android XR is out. The user declined it on 2026-10-09: Jetpack XR still
  moves fast. B57 finished without it.
- Renders use Roborazzi. Alternatives rejected: Paparazzi, Compose Preview
  Screenshot Testing.
- Android Auto screens return `rendered: n/a`, because Roborazzi cannot render
  Car App Library templates. Auto E2E is the phone module plus the Desktop Head
  Unit by hand. The user accepted this as the ruling on 2026-10-10.
- Tests use `kotlin.test` on JUnit 5. Kotest was rejected.

Rulings of 2026-10-18 on the run gaps:

- Compose keeps `type: app-framework`. The four-part ownership test does not
  fit, because Gradle and AGP own the build. `kinds.md` records the case: the UI
  toolkit is the root when AGP is a framework member.
- `framework/android` keeps `meta-framework`. No category names a build SDK.
- `captures/` stays unanchored in the ignore lists. Android Studio writes it
  at the Gradle root, which sits at any depth in a monorepo.
- A stack folder goes into the shared lists of bootstrap's `base` tool, not into
  a tool-config list.
- E2E runs on the managed device `e2e`; `--connected` keeps an attached device.
  The first wording (`connectedCheck`) was wrong.
- A Gradle build below a directory with `pubspec.yaml` is a platform edge of
  that Flutter project, never a sub-project.

Outside facts that were hard to find:

- `kotlin-lsp` has no GitHub release asset. It installs through the mise
  `http:` backend from `download.jetbrains.com`. The `download-cdn` archive
  URLs return 404.
- An `http:` tool has no version list before its file exists, so a `latest`
  pin cannot render it. This forced an exact pin of the Android cmdline-tools.
- `java` pinned to `latest` renders a non-LTS release. The pack pinned
  Temurin 25. Bootstrap owns the pin now.
- From API 37.1, Google publishes `google_apis` system images only as
  `_ps16k`.
- Play Instant ends in December 2025 (Context7), so the instant-apps reference
  is a retirement note.
