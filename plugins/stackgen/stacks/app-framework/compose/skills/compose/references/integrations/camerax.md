# Jetpack Compose — CameraX

**Wiring, configuration and anti-patterns only.** The use-case and provider API
is Context7's at use time.

CameraX wraps the camera stack in lifecycle-aware use cases — preview, image
capture, image analysis, video capture — that behave the same across devices.

## Setup order

1. **Ask whether a system intent is enough.** A single photo or a document
   pick needs no camera code: `ActivityResultContracts.TakePicture` or the photo
   picker. CameraX is for an in-app camera experience.
2. **Catalog entries** for `camera-core`, `camera-camera2`, `camera-lifecycle`,
   and the Compose viewfinder artifact (`camera-compose`); add `camera-video` or
   ML analysis artifacts only when used.
3. **Declare `android.permission.CAMERA`** (and `RECORD_AUDIO` for video with
   sound) in the manifest, and the camera as a non-required feature unless the
   app is useless without one.
4. **Request the permission in context**, per
   [platform interop](../platform-interop.md); draw a denied state.
5. **Bind use cases to the lifecycle** with the process camera provider, from a
   data- or UI-edge controller class — never from a ViewModel, which must not
   hold the `LifecycleOwner` or `Context`.
6. **Show the preview with the Compose viewfinder** (`CameraXViewfinder` fed by
   the preview use case's surface requests), not an embedded View.

## Structure

- **One camera controller per screen**, created and released with the screen's
  lifecycle; rebinding on configuration change is CameraX's job.
- **Captured files go to app-specific storage or MediaStore**, written off the
  main thread; the screen receives a URI through its state.
- **Image analysis drops frames it cannot keep up with**
  (`STRATEGY_KEEP_ONLY_LATEST`) and closes every `ImageProxy`, or the stream
  stalls.
- **Front, back and external cameras are queried, not assumed** — tablets and
  emulators may have only one.

## Testing

- **Goldens render the camera screen's chrome** with a placeholder in place of
  the viewfinder; there is no camera under Robolectric.
- **Capture paths are tested on the emulator**, whose virtual camera produces a
  synthetic scene.

## Anti-patterns

| Anti-pattern                                | Instead                                   |
| ------------------------------------------- | ----------------------------------------- |
| Camera bound from a ViewModel               | a lifecycle-owned controller at the UI edge |
| An unclosed `ImageProxy` in analysis        | close it in `finally`                     |
| `CAMERA` requested at app launch            | request from the action that needs it     |
| An in-app camera for a single photo         | the `TakePicture` contract                |
