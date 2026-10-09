# Jetpack Compose — platform interop

Compose is Kotlin calling Android directly: there is no channel and no bridge.
Interop here means reaching the Android framework — the `Activity`, system
services, permissions, other apps — from declarative code without leaking it
into the layers that must not know about it.

## The seams

- **`LocalContext.current`** is how a composable reaches `Context`. Use it at
  the screen edge — to launch an intent, read a resource — never pass it into a
  ViewModel or store it in state.
- **Activity results** go through `rememberLauncherForActivityResult` with the
  matching contract (`RequestPermission`, `PickVisualMedia`, `CreateDocument`…).
  The launcher is registered unconditionally in composition and launched from
  an event, never during composition.
- **System services that the app's logic needs** — connectivity, location,
  sensors — are wrapped in a data-layer class that exposes a `Flow` and is
  provided by Hilt. The ViewModel sees the flow; only the wrapper sees the
  `Context`.
- **Lifecycle** is reached with `LocalLifecycleOwner` and
  `LifecycleEventEffect` / `LifecycleStartEffect` / `LifecycleResumeEffect`,
  not by overriding `Activity` callbacks.

## Runtime permissions

1. **Declare** the permission in `AndroidManifest.xml`.
2. **Ask in context**, from the action that needs it — never at launch.
3. **Explain first** when `shouldShowRequestPermissionRationale` says so, in the
   app's own UI, then launch the request.
4. **Handle denial as a state** the screen draws: the feature degrades and
   offers the system settings page once the user has denied twice.
5. **Re-check on resume** — the user can revoke a permission in settings while
   the app is in the background.

Photo and file access prefer the system pickers (`PickVisualMedia`, the Storage
Access Framework), which need no permission at all.

## Intents and other apps

- **Implicit intents** (share, view a URL, dial) are built at the screen edge
  and launched through `Context.startActivity`, guarding
  `ActivityNotFoundException`.
- **Incoming intents and deep links** are the navigation graph's — see
  [navigation](navigation.md); `MainActivity` hands them over and holds no
  routing logic of its own.

## Views

Embedding a View (`AndroidView`) or hosting Compose inside a View hierarchy
(`ComposeView`) is outside this stack: it teaches Compose only. A third-party
component that exists only as a View is an exception the repo records with its
reason, wrapped at one seam in the design-system module — never a pattern
repeated screen by screen.

## Native code

C or C++ through the NDK and JNI is outside this stack. A library that needs it
ships as a prebuilt AAR the app depends on.
