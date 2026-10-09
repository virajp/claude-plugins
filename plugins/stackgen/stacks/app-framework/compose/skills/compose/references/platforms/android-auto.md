# Jetpack Compose — Android Auto & Automotive OS (`auto`)

The platform file a flow's `auto.md` take is realised on. **The car is not
Compose.** Android Auto (projected from the phone) and Android Automotive OS
(built into the car) draw the screen themselves from templates the app fills
through the Car App Library (`androidx.car.app`). The app supplies content and
handles selections, and has no layout, typography or composable of its own
there. This file is the one place in the pack where the UI is not Compose.

## Category first

- **An app reaches the car only in a supported category** — media, messaging,
  navigation, point of interest (parking, charging, fuel), internet of things,
  weather, video on Automotive OS — and each category unlocks its own subset
  of templates. The category is a product decision the flow records; a flow
  whose in-car take needs a template its category does not allow is refused at
  design, not discovered at review.
- **The manifest declares it.** A `CarAppService` with the
  `androidx.car.app.CarAppService` action and the category's
  `androidx.car.app.category.*` entry; the `androidx.car.app.minCarApiLevel`
  meta-data; and, for Android Auto, the `com.google.android.gms.car.application`
  meta-data pointing at an `automotive_app_desc.xml` that uses `template`.
  An Automotive OS build also declares
  `android.hardware.type.automotive`.

## Service, session, screens

- **A `CarAppService` creates a `Session`**, and the session creates the first
  `Screen`. Each `Screen` returns one template from `onGetTemplate()` and
  calls `invalidate()` when its content changes.
- **Templates only.** List, grid, pane, message, search, sign-in, map and
  navigation templates are the vocabulary; only a navigation app also draws a
  map surface.
- **The screen stack is the navigation.** Selecting an item pushes a `Screen`
  through the `ScreenManager`; the host caps the depth, and the app designs a
  shallow hierarchy rather than meeting the cap.

## The same models, a different surface

- **A `Screen` reads the app's repositories**, the same ones the phone's
  ViewModels observe, through a small adapter that maps state to template
  content. Business logic is never duplicated into the car layer.
- **Actions go through the same domain calls** as every other entry point, and
  their result may also show on the phone. The phone's UI may be locked or
  off: the car never relies on it.

## The in-car rules

- **Glanceable and short.** Each template shows the subset of the phone
  screen's content a driver needs in a glance.
- **Obey the host's limits.** List lengths and what is available while driving
  come from the host through `ConstraintManager`; read them, never hard-code a
  count.
- **Voice before touch** where the category supports it.
- **Only the host's visual language.** The design system reaches as far as the
  templates allow — icons and the accent colour — and no further.

## Testing — no goldens

Roborazzi cannot render a Car App Library template: the host draws it, not the
app. A `Screen` is unit-tested with `androidx.car.app:app-testing`
(`TestCarContext` and `ScreenController`), asserting the template it returns;
it is driven by hand on the Desktop Head Unit or the Automotive OS emulator.
The `ux-gate` reports `auto` screens as not rendered, with that reason. See
[testing](../testing.md).

## The contract

An `auto` screen follows the flow's platform file: the template each in-car
screen maps to, the content subset against the phone screen, and what is
disabled while driving. The `auto` take is selective — signing up or
onboarding in the car makes no sense — so a flow with no in-car screen has
no car code.
