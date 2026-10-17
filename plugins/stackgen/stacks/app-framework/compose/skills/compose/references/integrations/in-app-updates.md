# Jetpack Compose — Play In-App Updates

**Wiring, configuration and anti-patterns only.** The update manager, update
info and install-state API is Context7's at use time.

Play In-App Updates, part of the Play Core libraries, lets the app ask Google
Play whether a newer version exists and run the update from inside the app,
rather than sending the user to the store listing. It works only for an app
installed from Google Play; the server-side minimum version below covers
everything else.

## Setup order

1. **Catalog entry** for the Play in-app updates library.
2. **Pick the flow per update**, from the signals Play returns:
   - **Flexible** — Play downloads in the background while the user keeps
     working; when the download completes, the app asks the user to restart
     and completes the install. For updates that are not critical.
   - **Immediate** — a full-screen flow the user must accept before
     continuing; Play installs and restarts the app. For critical updates.
3. **Drive the choice from data, not code.** Each release carries an update
   **priority** from 0 to 5, set when the release is published; the update
   info also reports **staleness** — the days since the device learned of the
   update. One policy in the update module maps them to a flow: the highest
   priority to immediate, a stale lower one to flexible, the rest to nothing.
4. **Check on launch and resume**, and complete a flexible update whose
   download has finished, so a downloaded update is never left uninstalled.
5. **Handle refused preconditions.** Play can refuse a flow — the install did
   not come from Play, or the flow is not allowed for this update — and the
   app falls back to the minimum-version gate, never to a crash.
6. **Wire the server-side minimum version as the fallback.** The backend
   publishes the lowest supported version code; a build below it shows a
   blocking screen linking to the Play listing. This covers sideloaded builds,
   devices where the in-app flow is unavailable, and a forced cut-off Play's
   priority cannot express.

## Structure

- **One update module in the data layer** owns the update manager and the
  policy, and exposes "update state" as a `Flow`; a top-level composable
  shows the flexible prompt, the restart prompt or the blocking screen.
- **The flows need an activity**, launched from the single activity's UI
  edge, never from a ViewModel.

## Testing

- **The policy is unit-tested** against fake update info: priority and
  staleness in, the chosen flow out.
- **The real flow needs a Play install.** A debug build or a sideload fails as
  "API not available"; test through internal app sharing or an internal test
  track, on a device with Google Play and a network.

## Per platform

- **Phone and tablet:** supported, on Android 5.0 (API 21) and higher;
  ChromeOS too. Not for apps that use APK expansion (`.obb`) files.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                     | Instead                                         |
| ------------------------------------------------ | ----------------------------------------------- |
| Immediate updates for every release              | flexible unless the priority says critical      |
| Priority thresholds scattered through screens    | one policy in the update module                 |
| A finished flexible download never installed     | complete it once the download finishes          |
| In-app updates as the only update gate           | a server-side minimum version beside it         |
| Testing the flow on a debug build                | internal app sharing or an internal test track  |
