# Flutter — conventions

The app SDK that **owns the build**. `pubspec.yaml` declares both the Dart and
Flutter SDK constraints and configures the native package managers; the build
drives Gradle and Xcode rather than the reverse; and the scaffolder decides
which native languages exist at all.

**Dart is the primary language. Kotlin and Swift are platform edges** — they
appear only at the channel boundary, because Dart does not compile to Dalvik
bytecode and has no direct Objective-C bindings, so Flutter is hosted inside a
native component and reaches the platform through channels.

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

## The task library this pack owns

This pack ships a `config/.config/mise/tasks/` tree — the `code/format/flutter`
and `code/lint/flutter` subtasks and the five `setup/deps/<verb>/flutter`
subtasks — landing at the repo's own `.config/mise/tasks/` behind the
materializer's config consent line. Every file is named for the pack, so no
other component writes the same path: the repo's `code:format:all`,
`code:lint:all` and `setup:deps:<verb>:all`, which tool-config renders, call
each subtask by name.

**Each subtask carries only the SDK's own steps.** `code:format:flutter` runs
`dart format`, then the import sorter — sorting imports rewrites layout, so it
is a formatting act and belongs on the side of the split that can be run
read-only. `code:lint:flutter` runs `dart run dependency_validator`, then
`dart analyze --fatal-infos`. dprint, shfmt, shellcheck, actionlint and the
house linter run beside them as the universal subtasks, so neither file
carries a step that is not Flutter's.

**Both subtasks take an optional file list, and the empty case is the whole
tree.** That is the whole pre-commit story for this pack: it ships **no
fragment**, because the gate config's `format` and `lint` hooks call
`code:format:all` and `code:lint:all` with the staged files, and each passes
them on. `dart format` and the import sorter narrow to what they are given;
`dependency_validator` and `dart analyze` read more than a file list, so they
stay whole-project either way.

**`setup:deps:install:flutter` is SDK configuration and `flutter pub get` in
one task, and the reason is causal rather than tidiness.** `flutter pub get`
resolves against whichever platforms the SDK has enabled, so a fetch that ran
before `flutter config` describes a different app than the one that builds.
That is why the two cannot be separate slots: a standalone SDK-configuration
task could never usefully run apart from the fetch it constrains.

**The rest of the tasks' reasoning, kept here so the files carry one-line
warnings only.** The analyzer and `dependency_validator` do not overlap: a
dependency declared but never imported is invisible to the analyzer, an unused
import to the dependency check. `--fatal-infos` is deliberate — an info nobody
has to fix accumulates. With a file list the SDK formatters take the `lib/`
Dart files in it; with none they take `lib/` whole, never the generated
platform folders. `setup:deps:audit:flutter` is a deliberate no-op — `pub`
ships no advisory command, and the absence is stated rather than left unsaid.
`setup:deps:cleanup:flutter` deletes `pubspec.lock`, unlike every other pack's
cleanup: a lockfile written by a previous SDK pins versions the current one may
reject, and `pub get` will not re-resolve it on its own.
`setup:deps:outdated:flutter` passes `--no-transitive`, since a transitive
package moving is its direct dependency's to pick up.
`setup:deps:upgrade:flutter` passes `--major-versions`, rewriting the
constraints in `pubspec.yaml` too — without it the task would move nothing
`setup:deps:install` had not already resolved; the rewritten constraints are
the review surface. The `setup:deps:*` tasks print no header of their own:
`setup:deps:all` frames each verb.

Full judgment: the `flutter` skill's references; the native edges have their own
skills, scoped to the boundary they serve.
