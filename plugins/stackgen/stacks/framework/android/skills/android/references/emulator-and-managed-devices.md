# Android — the SDK, the emulator and Gradle Managed Devices

## The SDK

The SDK lives at `ANDROID_HOME` — `~/.local/share/android/sdk`, set by
`.config/mise/conf.d/android/mise.toml` — and is installed by
`mise run setup:deps:install:android`, from the values the repo pins:

| Package | From |
| --- | --- |
| `platform-tools` | always — `adb` |
| `platforms;android-<COMPILE_SDK>` | the compile level |
| `emulator` | always |
| `<EMULATOR_IMAGE>;<abi>` | the image value plus the host's ABI |

No build-tools are installed: AGP downloads the version it pins on first
build. From API 37 Google publishes a platform and its system images only as
`<level>.<minor>` (`android-37.0`, `android-37.1`), so the task maps a bare
`37` or later to `<level>.0`; state a minor release (`36.1`, `37.1`) in full.

`sdkmanager` itself comes from mise (Android's command-line tools), so a fresh
machine is `mise install` then that task. Never install SDK packages by hand
into another directory, or point `ANDROID_HOME` at Android Studio's own SDK:
two SDKs drift, and the build uses whichever the shell happens to export.
Android Studio is pointed at this SDK instead, in its SDK settings.

## The emulator

For local work, create one AVD from the pinned image:

```bash
avdmanager create avd --name dev --package "${EMULATOR_IMAGE};arm64-v8a" --device pixel_8
emulator -avd dev
```

Use `x86_64` in place of `arm64-v8a` on an Intel host. The AVD is a machine
artifact under `~/.android/avd`, never committed.

## Gradle Managed Devices

The E2E run does not use a hand-made AVD. Each app module declares a managed
device, and AGP creates, boots, tests on and deletes the emulator itself:

```kotlin
android {
    testOptions {
        managedDevices {
            localDevices {
                create("e2e") {
                    device = "Pixel 8"
                    apiLevel = 36 // TARGET_SDK
                    systemImageSource = "google"
                }
            }
        }
    }
}
```

- The device is named `e2e`: `test:e2e` runs `./gradlew e2eDebugAndroidTest`
  by default. Another name is passed with `--device`.
- `apiLevel` is `TARGET_SDK`, and `systemImageSource` matches the
  `EMULATOR_IMAGE` tag — `google` for `google_apis`, `aosp` for `default` — so
  the image the install task fetched is the one AGP boots, and nothing
  downloads mid-run.
- The ATD sources (`aosp-atd`, `google-atd`) are lighter images built for
  instrumented tests; use one where it is published for the target level, and
  set `EMULATOR_IMAGE` to its id (`…;aosp_atd`, `…;google_atd`) to match.
- A **group** (`managedDevices.groups`) runs the same tests across levels or
  form factors — a phone and a tablet — as `<group>Group<Variant>AndroidTest`;
  add one when a second device is a real requirement, not by default.

Managed devices run headless. On a CI runner, which has no GPU, `test:e2e`
adds `-Pandroid.testoptions.manageddevices.emulator.gpu=swiftshader_indirect`,
the software renderer; the runner still needs hardware virtualization (KVM on
Linux).
