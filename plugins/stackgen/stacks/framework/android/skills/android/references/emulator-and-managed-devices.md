# Android — the SDK, the emulator and Gradle Managed Devices

## The SDK

The SDK lives at `ANDROID_HOME`, which the toolchain bootstrap syncs sets, and
is installed by `mise run setup`, from the levels the build files state:

| Package | From |
| --- | --- |
| `platform-tools` | always — `adb` |
| `platforms;android-<COMPILE_SDK>` | the build's `compileSdk` |
| `emulator` | always |
| `<EMULATOR_IMAGE>;<abi>` | the image id plus the host's ABI |

`mise run setup` finds `COMPILE_SDK` and `EMULATOR_IMAGE` in the build files —
`build.gradle.kts`, `*.gradle`, `build-logic/` and `gradle/libs.versions.toml`.
The default image is `system-images;android-<targetSdk level>;google_apis`. A
repo that needs another value sets it in the `[env]` of
`.config/mise/conf.d/zz-repo/mise.<env>.toml`.

From API 37 Google publishes a platform and its system images only as
`<level>.<minor>` (`android-37.0`, `android-37.1`), so a whole level of 37 or
more becomes `<level>.0`; state a minor release (`36.1`, `37.1`) in full. From
`android-37.1` only the `google_apis_ps16k` image exists, and `mise run setup`
installs that one.

`sdkmanager` itself comes from the toolchain bootstrap syncs, so a fresh
machine is `mise run setup` alone. Never install SDK packages by hand into
another directory, or point `ANDROID_HOME` at Android Studio's own SDK: two
SDKs drift, and the build uses whichever the shell happens to export. Android
Studio is pointed at this SDK instead, in its SDK settings.

## The emulator

For local work, create one AVD from the installed image:

```bash
avdmanager create avd --name dev --package "system-images;android-37.0;google_apis;arm64-v8a" --device pixel_8
emulator -avd dev
```

Write the id `mise run setup` installed, level and all: it writes a whole
level of 37 or more as `<level>.0`, and `avdmanager` finds only an image id
that is installed. Use `x86_64` in place of `arm64-v8a` on an Intel host. The
AVD is a machine artifact under `~/.android/avd`, never committed.

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
                    apiLevel = 36 // the build's targetSdk
                    systemImageSource = "google"
                }
            }
        }
    }
}
```

- The device is named `e2e`: `test:e2e` runs `./gradlew e2eDebugAndroidTest`
  by default. Another name is passed with `--device`.
- `apiLevel` is the build's `targetSdk`, and `systemImageSource` matches the
  tag of the image `mise run setup` installs — `google` for `google_apis`,
  `aosp` for `default` — so the image already installed is the one AGP boots,
  and nothing downloads mid-run.
- The ATD sources (`aosp-atd`, `google-atd`) are lighter images built for
  instrumented tests; use one where it is published for the target level, and
  set `EMULATOR_IMAGE` to its id (`…;aosp_atd`, `…;google_atd`) in the repo's
  `[env]` to match.
- A **group** (`managedDevices.groups`) runs the same tests across levels or
  form factors — a phone and a tablet — as `<group>Group<Variant>AndroidTest`;
  add one when a second device is a real requirement, not by default.

Managed devices run headless. On a CI runner, which has no GPU, `test:e2e`
adds `-Pandroid.testoptions.manageddevices.emulator.gpu=swiftshader_indirect`,
the software renderer; the runner still needs hardware virtualization (KVM on
Linux).
