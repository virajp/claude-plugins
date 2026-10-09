# Jetpack Compose — Android TV (`tv`)

The platform file a flow's `tv.md` take is realised on, for Android TV and
Google TV. The screen is ten feet away and the input is a remote: every screen
is judged by whether it reads from the sofa and works with a D-pad alone.

## Its own module, its own library

- **The TV app is its own application module**, or its own entry point in the
  phone app, sharing the domain and data modules, per
  [project layout](../project-layout.md).
- **Compose for TV.** Components come from `androidx.tv:tv-material`
  (`androidx.tv.material3`), not the phone's `androidx.compose.material3`:
  TV Material handles D-pad focus, scales a focused item, and carries
  TV-sized typography and shapes. Leanback is not used for new screens.
- **The manifest declares the form factor**:
  `android.software.leanback` and `android.hardware.touchscreen` as
  `uses-feature` with `android:required="false"` (so one APK can serve phone
  and TV), an activity with the `LEANBACK_LAUNCHER` category, and an
  `android:banner` for the home screen row.

## Focus is the interface

- **Every interactive element is focusable**, and the focused one is obvious:
  TV Material components show focus by scale, border and glow; a custom one
  draws a focus state from the design system's tokens.
- **Focus is placed, not left to chance.** Each screen requests initial focus
  on its primary element with a `FocusRequester`; returning to a screen
  restores focus to the item the user left (`focusRestorer`); a row or grid
  keeps its focused item on screen.
- **D-pad movement is spatial.** Up, down, left and right move to the nearest
  focusable in that direction; groups that should trap or skip focus say so
  with focus properties, never by intercepting key events.
- **Back always works** and goes one level up; the home row is never a dead
  end.

## The ten-foot layout

- **Overscan-safe margins** keep content clear of the screen's edges.
- **Few items, large type.** Rows of cards (a `LazyRow` per category inside a
  `LazyColumn`) are the browse pattern; text is short and large, and nothing
  requires reading a paragraph.
- **No text entry where it can be avoided.** Search takes voice; sign-in hands
  off to a phone (a code or a QR) rather than typing a password with a remote.
- **Playback** uses Media3, and the player's controls are focusable like any
  other screen.

## Goldens

A `tv` screen's goldens render under `tv/` on a 1080p television device
qualifier (`RobolectricDeviceQualifiers.Television1080p`), landscape, inside the
TV theme. A focused state the flow pins is its own golden. See
[testing](../testing.md).

## The contract

A `tv` screen follows the flow's platform file: the content subset against the
phone screen, what holds initial focus, how D-pad movement crosses the screen,
and what is handed off to a phone. The `tv` take is selective, so a flow with
no TV screen has no TV code.
