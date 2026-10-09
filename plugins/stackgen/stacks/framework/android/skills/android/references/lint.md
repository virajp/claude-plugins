# Android — Lint

Android Lint knows what the Kotlin tools cannot: API levels, resources, the
manifest, accessibility of views, Compose rules shipped inside the AndroidX
artifacts. It runs as `code:lint:android` — `./gradlew lint`, every Android
module — beside **ktlint** (layout) and **detekt** (Kotlin static analysis);
the three do not overlap, and none is a substitute for another.

## Configuration

In each Android module's `android {}` block:

```kotlin
lint {
    warningsAsErrors = true
    abortOnError = true
    checkDependencies = true
    lintConfig = rootProject.file("lint.xml")
}
```

- `warningsAsErrors` and `abortOnError` make the gate a gate: a warning that is
  acceptable is configured away in `lint.xml` with the reason, not left to
  scroll past.
- `checkDependencies` on the app module lints the library modules it depends
  on in one report, so a check is not skipped because it fired in a library.
- One shared `lint.xml` at the root holds every severity change, each with a
  comment naming why. A check is disabled for the repo there, or suppressed at
  one site with `@SuppressLint("Id")` / `tools:ignore="Id"` and a comment —
  never by a blanket severity drop.

## The baseline

A baseline (`baseline = file("lint-baseline.xml")`) records the findings that
existed when the gate was adopted, so an existing codebase can turn the gate on
without fixing everything first. It is **debt with a ledger**:

- Created once, by `./gradlew updateLintBaseline`, and committed.
- It only shrinks. A fix removes its entry by re-running the update task; a new
  finding is never added to it — it is fixed or suppressed at its site with a
  reason.
- A new project has no baseline at all.

## Fixes

`code:lint:android --fix` runs `lintFix`, which applies the fixes lint marks as
safe and then reports what remains. Review the diff — a safe fix is mechanical,
not necessarily right for the code around it.

## Custom checks

A rule a team keeps repeating in review becomes a lint check in a
`lint-checks` module, published to the app through `lintChecks(project(...))`.
Write one only after the rule has been stated in review three times.
