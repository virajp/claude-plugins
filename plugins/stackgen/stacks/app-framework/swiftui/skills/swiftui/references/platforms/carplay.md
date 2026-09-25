# SwiftUI — CarPlay (`auto`)

The platform file a flow's `auto.md` take is realised on. **CarPlay is not
SwiftUI.** The car's screen is drawn by the system from templates the app
fills; the app supplies content and handles selections, and has no layout,
typography or view hierarchy of its own there. This file is the one place in
the pack where the UI is not a SwiftUI view.

## Entitlement first

- **An app reaches CarPlay only with a CarPlay entitlement**, granted by Apple
  per app category — audio, communication, navigation, EV charging, parking,
  quick food ordering, fueling, driving task — and each category unlocks its
  own subset of templates. The category is a product decision the flow
  records; the entitlement request precedes any build work, and a flow whose
  in-car take needs a template its category does not allow is refused at
  design, not discovered at review.
- The entitlement lives in the app's entitlements file with the rest, per
  [build & signing](../build-and-signing.md).

## The CarPlay scene

- **CarPlay is a scene of the iOS app**, declared in the scene manifest with
  its own scene delegate. When the car connects, the delegate receives an
  interface controller and sets a root template; when the car disconnects, it
  drops every reference it took.
- **Templates only.** Lists, grids, tab bars, now-playing, point of interest,
  information and alert templates are the vocabulary; only a navigation app is
  also given a window, and only to draw its map beneath a map template.
- **The template stack is the navigation.** Selecting an item pushes a template
  or performs an action; the system caps how deep the stack may go, and the
  app designs a shallow hierarchy rather than meeting the cap.

## The same models, a different surface

- **The CarPlay scene reads the app's models**, the same ones the phone's views
  observe, through a small adapter that maps model state to template content
  and updates the template when the model changes. Business logic is never
  duplicated into the CarPlay layer.
- **Actions go through the same router** as every other entry point, per
  [navigation](../navigation.md): a selection in the car becomes a model call,
  and its result may also show on the phone.
- **The phone may be locked.** The CarPlay scene cannot rely on the phone's UI
  being on screen, on a sign-in the user has not yet done, or on anything
  that needs the user to look at the phone.

## The in-car rules

- **Glanceable, and short.** Each template shows the subset of the phone
  screen's content a driver needs in a glance; long text, dense lists and
  anything that invites reading are left on the phone.
- **Respect the driving limits the session reports.** The system tells the app
  which interfaces are limited while the car is moving and caps list lengths;
  read those limits and obey them, never hard-code a count.
- **Voice before touch.** Where the category supports it, Siri and the
  assistant cell are the primary way to act, and every spoken result is also
  shown.
- **Only the system's visual language.** The design system reaches as far as
  the templates allow — icons and the accent colour — and no further.

## The contract

An `auto` screen follows the flow's platform file: the template each in-car
screen maps to, the content subset against the phone screen, and what is
disabled while driving. The `auto` take is selective — signing in or onboarding
in the car makes no sense — so a flow that has no in-car screen has no
CarPlay code.
