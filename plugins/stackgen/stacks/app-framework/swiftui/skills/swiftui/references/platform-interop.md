# SwiftUI — platform interop

SwiftUI *is* the platform's UI framework, so there is no channel to cross — a
platform API is a direct call. Interop here means three narrower things:
hosting UIKit or AppKit inside SwiftUI (and the reverse), calling Objective-C
and C, and running one codebase across OS versions and platforms that do not
all have the same API.

**Edge code appears only here.** UIKit, AppKit and Objective-C are allowed in
an app this pack shapes, but only behind the seams below. A feature screen
written in UIKit is a second architecture, not interop.

## Hosting UIKit or AppKit in SwiftUI

Wrap a UIKit view or view controller in a representable type (the AppKit
equivalents on macOS) when SwiftUI has no equivalent on the critical path.

- **One wrapper per wrapped thing**, in the module that needs it, exposing a
  SwiftUI-shaped API: values in, bindings or closures out. The UIKit type never
  leaks past the wrapper.
- **Create once, update often.** The make step builds the view; the update step
  applies the current SwiftUI state to it, and runs on every relevant change —
  so it is idempotent and cheap, and it compares before it sets anything that
  would trigger work.
- **Delegates and callbacks go through the coordinator**, which forwards events
  back as binding writes or closure calls. The wrapped view never holds the
  model.
- **Sizing is declared**, not discovered by accident: say how the wrapped view
  sizes itself in SwiftUI layout rather than relying on its intrinsic size.

## Hosting SwiftUI in UIKit or AppKit

A hosting controller wraps a SwiftUI view for a UIKit or AppKit container —
useful when a legacy screen gains a SwiftUI section, or when a system API
hands back a view controller slot. Keep it one-way: the host passes a model
in, the SwiftUI view reads it. An app this pack shapes is SwiftUI at the root,
so this direction is for migrations and system slots, not for new screens.

## Objective-C and C

- **Swift first.** New code is Swift; Objective-C appears only where an existing
  library or a system API requires it.
- **A bridging boundary per module.** A module that calls Objective-C or C does
  so through its own imports, and wraps the result in Swift types before
  anything else sees it — optionality, errors and ownership made explicit at
  that one boundary.
- **Nullability and concurrency annotations are the boundary's contract.** An
  unannotated Objective-C header imports as implicitly unwrapped and
  non-`Sendable`; annotate it, or wrap it and state the guarantees in the
  wrapper.

## Availability

The app supports a stated **minimum OS per platform**, declared once in the
project's deployment targets, and every API newer than that minimum is guarded.

- **Guard at the smallest scope.** An `#available` check around the one call
  or modifier that needs it, with the fallback beside it, so the fallback gets
  read and tested. An `@available` attribute on a whole type is for a type that
  genuinely cannot exist on the older OS.
- **A fallback is a real behaviour**, not an empty branch. If a feature cannot
  exist on the older OS, the screen that offers it says so or does not offer
  it.
- **Raise the minimum deliberately.** When the guards for an old OS outnumber
  the users on it, raising the deployment target is a product decision, made in
  one change that deletes the guards it retires.

## Platform conditions

Code that differs by platform is conditioned at compile time with `#if os(...)`
— and conditioned **narrowly**: a modifier, a single view, a client's live
implementation. A file that is mostly `#if` branches wants to be one file per
platform, selected by the target's sources. Which platforms share a target is
[pick & trade](pick-and-trade.md)'s; per-platform depth is the platform
references'.
