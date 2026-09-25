# SwiftUI — App Intents, Siri & Shortcuts

**Wiring, platform configuration and anti-patterns only.** The API surface —
intents, parameters, entities, queries, App Shortcut phrases — is Context7's at
use time, and is the half that ages. This reference carries where the pieces
live and the order they are wired in.

App Intents is the one way the app's actions reach the system: Siri, the
Shortcuts app, Spotlight, interactive widgets and Live Activities, and the
configuration of a configurable widget. An action written once as an intent is
reachable from all of them; an action written for one of them alone is written
again for the next.

## Where the intents live

Which targets can see an intent is decided by where it is declared, so its
placement is a project decision, not a style one.

- **The intents module.** Put the intents, their entities and their queries in
  a framework target of their own (or in the shared core), declared as an App
  Intents package, and have the app's own package include it. Every target that
  needs the intents — the app, the widget extension, an App Intents extension —
  links that module; none declares its own copy.
- **Where an intent runs** is declared on the intent: in the app process, in an
  App Intents extension, or either. An intent that only reads data and returns
  a result can run in the extension without launching the app; an intent that
  must show the app's UI runs in the app.
- **Intent code calls the feature modules**, never the view layer. It is an
  entry point beside the app's scenes, and the business logic it reaches is the
  same the views reach — see
  [standards & architecture](../standards-and-architecture.md).

## Setup order

1. **Pick the actions** that make sense without the app on screen — the
   product's verbs, not its screens. Each is one intent.
2. **Model what the actions act on as entities** with a query the system can
   call, so Siri and Shortcuts can offer the user's own items as parameter
   values.
3. **Expose the few that matter as App Shortcuts** through one App Shortcuts
   provider in the app target. Their phrases are what makes an action reachable
   by voice with no setup by the user; each phrase carries the app's name, and
   the set is kept to the product's few core verbs.
4. **Refresh the shortcut parameters** whenever the entities they list change,
   so Siri's vocabulary matches the app's data.
5. **Localise every phrase and title** with the app's other strings, in the
   same change that adds them.
6. **Share the configuration intents with widgets** — a configurable widget's
   options are an intent from the same module; see
   [widgets & complications](widgets-and-complications.md).

## Per platform

App Intents and App Shortcuts are available on iOS, iPadOS, macOS, watchOS,
tvOS and visionOS. The surfaces differ from platform to platform, but the
intents module is one; a surface a platform lacks is simply not reached there.

## Anti-patterns

| Anti-pattern                                    | Why                                           | Instead                                      |
| ----------------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| Intents declared in the app target only         | The widget and the extension cannot see them  | One intents module every target links        |
| Duplicated intent types per target              | The system sees two actions; parameters drift | Declare once, include the package            |
| Business logic inside the intent's perform      | A second implementation of the feature        | Call the feature module                      |
| Every screen exposed as an App Shortcut         | Siri vocabulary diluted; phrases collide      | A few verbs; the rest reachable in Shortcuts |
| Entity list changes without a parameter refresh | Siri offers stale or missing items            | Refresh after the entities change            |
| New SiriKit custom intents                      | Superseded path                               | App Intents; migrate the old definitions     |
