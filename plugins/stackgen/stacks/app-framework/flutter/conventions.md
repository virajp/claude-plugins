# Flutter — conventions

The app SDK that **owns the build**. `pubspec.yaml` declares both the Dart and
Flutter SDK constraints and configures the native package managers; the build
drives Gradle and Xcode rather than the reverse; and the scaffolder decides
which native languages exist at all.

**Dart is the primary language. Kotlin and Swift are platform edges** — they
appear only at the channel boundary, because Dart does not compile to Dalvik
bytecode and has no direct Objective-C bindings, so Flutter is hosted inside a
native component and reaches the platform through channels.
`kotlin-lsp` is on `PATH` only when the repo's toolchain includes Kotlin, in
the dev environment.

**Know which directories are generated.** The SDK regenerates parts of the
native trees; a generated directory is never edited for native functionality and
never committed. App-specific native code goes to the host application, shared
native code goes into a plugin.

**One codebase, several surfaces.** A project declares whichever of `mobile`,
`tablet`, `desktop` and `auto` it ships — one project with several platforms,
never one project per surface. **A web surface is not offered by this pack** —
it is a `site` or web-application project on a web stack of its own, which
carries its own stylesheet pin.

**Single-package, always.** A Flutter app is never a monorepo.

**Flavors carry per-environment configuration**, wired through both native
projects, not through committed config files.

## The toolchain is bootstrap's

This pack ships no task. The Flutter SDK, its tasks and its gates are
bootstrap's: `mise run setup` configures the SDK and fetches the packages,
`mise run setup --upgrade` moves them, and `mise run code` runs the format
and lint gates, `mise run code:format` and `mise run code:lint` each half
alone. The pre-commit hooks that call them are bootstrap's too.

**The analyzer runs with `--fatal-infos`, and that is deliberate** — an info
nobody has to fix accumulates.

**SDK configuration and `flutter pub get` belong together, and the reason
is causal rather than tidiness.** `flutter pub get` resolves against
whichever platforms the SDK has enabled, so a fetch that ran before
`flutter config` describes a different app than the one that builds.

Full judgment: the `flutter` skill's references; the native edges have their own
skills, scoped to the boundary they serve.
