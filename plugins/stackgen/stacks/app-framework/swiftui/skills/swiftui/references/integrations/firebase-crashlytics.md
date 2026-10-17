# SwiftUI — crash reporting (Firebase Crashlytics)

**Wiring, configuration and anti-patterns only.** The API surface — custom
keys, logs, user ids, recorded errors, the unsent-report calls — is Context7's
at use time, and is the half that ages. This reference carries the symbol
upload, the build settings it depends on and the collection switch a per-type
lookup gives only piecemeal.

Crashlytics starts itself when `FirebaseApp.configure()` runs and reports a
crash on the next launch. A crash is only readable once the build's **dSYM**
— the debug symbols Xcode writes beside the binary — has reached Crashlytics,
so the work here is mostly the build: produce the dSYM every time, upload it
every time, and keep reports from builds nobody ships out of the dashboard.

## Setup order

1. **Add the `FirebaseCrashlytics` product** beside the shared bootstrap (see
   [Firebase Analytics](firebase-analytics.md) for the package, the
   `GoogleService-Info.plist` and `FirebaseApp.configure()`). Link Analytics as
   well: crash-free users, release velocity alerts and breadcrumbs come from
   it.
2. **Produce a dSYM for every configuration.** Set the target's Debug
   Information Format to DWARF with dSYM File for every build type; a missing
   dSYM is most often one Xcode never wrote.
3. **Add the upload Run Script build phase** to the app target, running the
   `run` script inside the SwiftPM checkout of firebase-ios-sdk (under the
   build's `SourcePackages/checkouts/`).
4. **List the script's Input Files.** Xcode 15 and later require them, and with
   User Script Sandboxing on, the script can read nothing else: the dSYM's DWARF
   file inside the dSYM folder, the built app's `Info.plist`, the built
   `GoogleService-Info.plist` (which ties the symbols to the Firebase app), and
   the app's executable (which lets the script skip a dSYM it already sent —
   the binary itself is not uploaded). Projects with the debug dylib setting on
   need the extra inputs Firebase lists for it.
5. **Decide collection per build.** Set `FirebaseCrashlyticsCollectionEnabled`
   in `Info.plist`, varied per build configuration, so development builds do
   not report; where the user must opt in, start it off and enable it from the
   consent flow. A value set from code overrides the plist, persists across
   launches, and only takes effect on the next run.

## CI symbol upload

- **Archive builds upload through the same Run Script phase**, with the same
  input files, so a CI archive needs no step of its own.
- **Upload by hand where the phase cannot run** — a dSYM regenerated after the
  fact, or a build made elsewhere: the `upload-symbols` script in the same
  checkout takes the built `GoogleService-Info.plist`, the platform and the
  dSYM directory. Run it as a CI step after the archive, over every dSYM found.
- **Check the dashboard's missing-dSYM alert** after the first release from a
  new pipeline; it is the signal that a build's symbols never arrived.

## Debugging

To confirm a device is sending reports, add `-FIRDebugEnabled` to the Run
scheme's launch arguments, force a test crash, relaunch, and look for
Crashlytics' upload line in the log. Remove the argument once confirmed.

## Per platform

- **iOS and iPadOS** — supported.
- **macOS** — supported.
- **tvOS** — supported.
- **watchOS** — not confirmed.
- **visionOS** — not confirmed.
- **CarPlay** — not confirmed.

Pass the matching platform to `upload-symbols` for a non-iOS dSYM.

## Anti-patterns

| Anti-pattern                                   | Why                                                    | Instead                                          |
| ---------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Debug Information Format without dSYM          | Nothing to upload; crashes stay unsymbolicated         | DWARF with dSYM File for every build type        |
| Run Script with no Input Files                 | Fails under Xcode 15 and User Script Sandboxing        | List every input Firebase names                  |
| Development builds reporting                   | Noise hides production crashes                         | Collection off per configuration in `Info.plist` |
| Expecting a code-set collection flag at once   | It applies from the next launch                        | Plist value for "off from the first launch"      |
| No manual upload path in CI                    | Rebuilt or externally built dSYMs never arrive         | `upload-symbols` as a CI step                    |
| Crashlytics without Analytics                  | No crash-free users, velocity alerts or breadcrumbs    | Link Analytics alongside                         |
