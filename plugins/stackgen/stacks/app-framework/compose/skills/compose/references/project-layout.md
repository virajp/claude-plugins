# Jetpack Compose — project layout & the generated boundary

## The shape

```text
settings.gradle.kts            the build's root: modules, repositories, build-logic
build.gradle.kts               root plugins block only (apply false)
gradle.properties              Gradle and Roborazzi properties
gradle/libs.versions.toml      every version, the Compose BOM among them
gradle/wrapper/                the committed wrapper
build-logic/                   convention plugins shared by modules
app/
  build.gradle.kts             the application module
  src/main/AndroidManifest.xml
  src/main/kotlin/<package>/   MainActivity, the Application class, the nav graph
  src/main/res/                icons, strings, the launcher theme — no layouts
  src/test/                    JVM tests: ViewModels, Robolectric, goldens
  src/test/screenshots/        the committed goldens
  src/androidTest/             Compose UI tests on the emulator
  schemas/                     Room's exported schemas, committed
feature/<name>/                one module per feature, when the app grows
core/<name>/                   shared data, model, design-system modules
```

- **Kotlin sources live in `src/<set>/kotlin/`**, not `src/<set>/java/`.
- **`res/` holds no layout XML.** Strings, drawables, the launcher icon and the
  one XML theme the launcher needs before Compose draws are all it carries.
- **Feature modules depend on core modules, never on each other.** The `:app`
  module is the only one that sees every feature, because it owns the
  navigation graph that joins them.

## Generated — never edit, never commit

| Path                                | What writes it                         |
| ----------------------------------- | -------------------------------------- |
| `build/`, `**/build/`               | Gradle — every output, every report    |
| `.gradle/`, `.kotlin/`              | Gradle's and Kotlin's caches           |
| `local.properties`                  | Android Studio — the machine's SDK path |
| `.idea/` (most of it), `*.iml`      | Android Studio                         |
| `captures/`, `.cxx/`, `.externalNativeBuild/` | the profiler and the native build |
| KSP output under `build/generated/` | Hilt and Room's code generators        |

`local.properties` is the trap: Android Studio writes `sdk.dir` there on first
open, and committing it breaks every other machine. The SDK location is
`ANDROID_HOME`, which the `framework/android` pack sets.

## Committed, though a tool writes it

- **`app/schemas/`** — Room's exported schema JSON, one per database version.
  Migrations are tested against it; see [Room](integrations/room.md).
- **`src/test/screenshots/`** — the goldens. Re-recorded deliberately, reviewed
  as PNG diffs; see [testing](testing.md).
- **`gradle.lockfile`** — per the Gradle pack.
