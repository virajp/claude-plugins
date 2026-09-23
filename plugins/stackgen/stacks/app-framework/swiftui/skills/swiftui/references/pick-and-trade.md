# SwiftUI — pick & trade

## When it is the answer

**When every surface the product ships to is Apple's.** iPhone, iPad, Mac,
CarPlay, Apple Watch, Apple TV and Vision Pro share one language, one UI
framework and one toolchain. A product whose platforms all sit inside that set
gets native controls, native accessibility and day-one access to new platform
API from one codebase — the leverage a cross-platform SDK promises, without the
layer in between.

**When the interface should feel like the platform's own.** SwiftUI maps onto
the system's controls, typography, navigation and input model. A product whose
value is feeling like a system app — respecting Dynamic Type, the focus engine
on tvOS, the Digital Crown on watchOS, windows and ornaments on visionOS — gets
that behaviour by default rather than by imitation.

**When the app lives in platform integration.** HealthKit, widgets, App
Intents, Live Activities, background tasks, the camera pipeline: each is a
direct call here, never a channel. The deeper the product sits in the platform,
the stronger this case.

**When install size matters.** The UI framework ships with the OS. There is no
engine in the artifact, so the floor is the app's own code and assets — see
[performance & artifact size](performance.md).

## When it stops being the answer

**When Android is a surface at all.** SwiftUI does not run there. A product
that must reach Android either builds that app a second time or pins a
cross-platform stack for both. Weigh it honestly: two native apps cost two
teams' worth of features, specs and bugs, drifting a little each round. If
Android is a first-class surface from day one, a cross-platform SDK is usually
the cheaper path; if it is a later, smaller surface, native Apple first is
defensible.

**When there is a web surface.** This pack does not target the web. A product
with one pins a web stack for that project, beside this one.

**When the UI is the brand, pixel for pixel, everywhere.** A design that must
look identical on every platform is fighting a framework whose controls adapt
per platform. SwiftUI can draw custom surfaces, but a product that overrides
every control is paying for adaptivity it does not want.

## SwiftUI versus UIKit or AppKit

**SwiftUI is the default for new screens.** It is declarative, composes across
every Apple platform, and is where new platform API lands first — several
surfaces (widgets, watchOS complications, visionOS volumes) are SwiftUI-only.

**UIKit or AppKit is an interop tool, not a second architecture.** Reach for it
when a control or behaviour SwiftUI does not offer yet is on the critical path —
a text engine with fine-grained editing control, a mature third-party component
that ships only as a view controller, a collection layout SwiftUI cannot
express. Wrap it at one seam and keep the app SwiftUI-first — see
[platform interop](platform-interop.md). An app that drops to UIKit screen by
screen has two UI architectures and the review cost of both.

## One multiplatform target or one per platform

A single target can declare several destinations; separate targets per platform
are the other shape.

- **One target, several destinations** fits platforms whose UI is the same
  product at different sizes — iPhone, iPad and Mac usually are. Platform
  differences are conditions inside shared views.
- **A target per platform** fits a surface whose product shape differs —
  watch, tv, spatial and auto are almost always here. Each gets its own app
  target and shares feature modules underneath, not views.

The rule: **share the model and the features, not the screen.** A view that
branches on the platform in every other line wants to be two views over one
model. Layout of the targets is [project layout](project-layout.md)'s.

## The trade nobody states up front

**The Xcode version is a dependency.** A Swift language mode, an SDK and the
simulators all come from the installed Xcode, and a new OS release moves them
yearly. The project pins the Xcode it accepts and fails fast on any other —
see [build & signing](build-and-signing.md) — and the yearly upgrade is
planned work, not a surprise.
