# SwiftUI — visionOS (`spatial`)

The platform file a flow's `spatial.md` take is realised on. The user looks at
something and pinches to act; the app's content floats in the room beside
everything else the user has open. Every screen chooses a **surface** — a
window, a volume or an immersive space — and that choice is the flow's, per
screen.

## The three surfaces

- **A window** is a flat, resizable pane of SwiftUI content, the default and
  the right answer for most screens. It coexists with other apps' windows.
- **A volume** is a bounded three-dimensional window for content meant to be
  seen from several sides — a model, a board, a globe. Its default size is set
  on the scene, and from visionOS 2 the user can **resize** it within the
  scene's resizability — but content does **not** scale with the volume by
  default, so read the volume's size and scale the content to it, or bound the
  size to the content's. A volume coexists with other apps, too.
- **An immersive space** is unbounded content placed around the user. Opening
  one **hides every other app**, and only one immersive space may be open at a
  time, so opening is a deliberate user action and there is always a visible
  way out. Its immersion style is chosen per space: mixed (the default —
  content blended with the room), progressive (a portal the user widens with
  the Digital Crown), or full (the room replaced).

Opening a window, a volume or a space is a **scene action** — the open-window
or open-immersive-space action, awaited, its result checked — never
navigation. Navigation within a window is [navigation](../navigation.md)'s.

## Gaze and pinch

- **Look to target, pinch to act.** Standard controls already respond; a custom
  interactive view gets a hover effect so it highlights when looked at, and a
  hit area large enough to look at comfortably.
- **The app never sees where the user looks.** Gaze is private: the hover
  highlight is drawn by the system, and the app learns only of the pinch that
  follows. A design that needs to know what the user is looking at before
  they act cannot be built.
- **Direct touch is for close content.** Content within reach may be poked or
  grabbed; content at a distance is always reachable by look and pinch.

## Comfort and placement

- **Place content in front of the user, at a comfortable depth**, not above,
  behind or pressed against them; let the system place windows, and give a
  volume a size that fits the room.
- **Never move content the user did not move**, and never lock content to the
  head. Motion in an immersive space is slow and predictable.
- **Ornaments carry a window's controls** — a toolbar or tab bar attached to
  the window's edge, outside its content, so the content keeps its space.

## RealityKit boundaries

- **SwiftUI owns the app and its 2D UI; RealityKit owns 3D content.** A
  reality view is the one seam between them, inside a volume or an immersive
  space; SwiftUI views placed into the 3D scene go in as attachments.
- **The model layer does not import RealityKit.** Entities are built and
  updated from model state by the view that hosts them, the way a
  representable updates a wrapped view in
  [platform interop](../platform-interop.md); the domain stays platform-free
  and testable.
- **3D assets are resources of the target**, loaded asynchronously, never on
  the main thread's critical path — see [performance](../performance.md).

## The contract

A `spatial` screen follows the flow's platform file: gaze and pinch as the
primary input, the surface it uses, comfortable depth and placement, and
ornaments for controls at a window's edge. The `spatial` take is selective, so
a flow with no spatial screen has no visionOS code.
