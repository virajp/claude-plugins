# Android — Baseline Profiles and Macrobenchmark

A Baseline Profile lists the classes and methods the app runs on its critical
journeys — startup, the first scroll, the first navigation — so ART compiles
them ahead of time at install, rather than interpreting them on first run.
Macrobenchmark is the library that both generates that profile and measures
whether it helped. They are two modules beside the app, and one decision: an
app ships a profile once it has a startup it cares about, and measures it.

## The modules

| Module | Plugin | Holds |
| --- | --- | --- |
| `:app` | `com.android.application` + `androidx.baselineprofile` | the app; consumes the profile |
| `:baselineprofile` | `com.android.test` + `androidx.baselineprofile` | the generator and the benchmarks |

Android Studio's **Baseline Profile Generator** module template creates the
second module and wires both; prefer it to writing the wiring by hand. The
plugin and the `androidx.benchmark` libraries go in the version catalog like
any other dependency (see the **gradle** skill), never as a literal version in
a build script.

- The test module targets the app (`targetProjectPath = ":app"`) and runs on a
  device — a Gradle Managed Device, so generation is headless and repeatable
  (see [Emulator & managed devices](emulator-and-managed-devices.md)).
- The app depends on the test module through the `baselineProfile` dependency
  configuration, and on `androidx.profileinstaller`, which installs the
  profile on devices where Play does not.
- A library module can ship its own profile too, in
  `src/main/baseline-prof.txt`; it is merged into every app that uses it.

## Generating

The generator is an instrumented test using `BaselineProfileRule`: it starts
the app and walks the critical journeys with UI Automator, and the plugin
writes the result to `src/<variant>/generated/baselineProfiles/` in the app.

```bash
./gradlew :app:generateBaselineProfile
```

- The generated profile is **committed**. It is source the release build
  reads, not a build artifact; a review sees it change when the journeys do.
- Generate against a **release-like** variant — minified, as R8 will ship it —
  which the plugin arranges; never profile a debug build.
- `baselineProfile.automaticGenerationDuringBuild = true` regenerates on every
  release build. Leave it off by default — it needs a device on every release
  build — and regenerate by hand when the journeys change.

## Measuring

A Macrobenchmark test uses `MacrobenchmarkRule` with a metric —
`StartupTimingMetric` for cold start, `FrameTimingMetric` for jank — and runs
each journey under `CompilationMode.None()` and
`CompilationMode.Partial(BaselineProfileMode.Require)`. The difference is the
profile's worth; a profile that does not move the number is not covering the
journey that matters.

- Benchmarks run on a release-like build on a **real device or a stable
  emulator**; numbers from a CI emulator are noisy. Treat them as a trend,
  never as a gate that fails a merge.
- The E2E run (`test:e2e`) does not run benchmarks; they are a task of their
  own, run by hand or on a schedule.
- Restrict a run to one rule with the instrumentation argument
  `-P android.testInstrumentationRunnerArguments.androidx.benchmark.enabledRules=Macrobenchmark`
  (or `=BaselineProfile`).
