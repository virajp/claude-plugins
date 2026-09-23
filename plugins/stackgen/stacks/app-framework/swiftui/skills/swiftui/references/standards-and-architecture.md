# SwiftUI — standards & app architecture

The language baseline — Swift 6 language mode, typed errors, the public-API
discipline — is the **swift** skill's, and applies here unchanged. This file is
what an *app* adds on top: where logic lives, how features are cut, and how a
feature gets the things it depends on.

## Swift 6 strict concurrency, in an app

Strict concurrency stays on; a diagnostic is a real race. What an app adds:

- **The UI is main-actor work.** Views, and the models views read, are
  isolated to the main actor. Mark a view model `@MainActor` and let the
  compiler carry that isolation to every caller.
- **Work leaves the main actor behind an `async` call.** Decoding a large
  payload, image processing, a database migration: the model awaits a
  function that runs elsewhere — a client, an actor — and assigns the result
  back on the main actor. The model never does the heavy work inline.
- **A view starts async work with the `task` modifier**, whose lifetime is the
  view's: SwiftUI cancels it when the view leaves or changes identity. An
  unstructured `Task { }` in a view is work nobody cancels.
- **Values cross isolation; models do not.** What a client returns is a
  `Sendable` value type. An observable model is main-actor state, and is never
  handed to a background task.

## The architecture: feature modules, observable models, views

Three layers, one direction of dependency:

1. **Views** render state and forward user intent. A view holds no business
   logic — no network call, no persistence, no decision a test would want to
   check. If a branch in a view's body encodes a product rule, the rule
   belongs in the model and the view reads its result.
2. **Models** — one `@Observable` class per screen or feature — own the
   feature's state and its actions. They are plain classes a test can create
   and drive without rendering anything.
3. **Clients** are the seams to the outside world: the API, persistence, the
   clock, the keychain, analytics, every platform service. A client is a
   small value type of closures (or a protocol), with a live implementation and
   substitutes for tests and previews.

A feature module holds its models, its views and its tests. It depends on the
core module and on clients, never on another feature's internals — features
talk through the model types they export, or through navigation state the app
owns. The app target is the **composition root**: it builds the root models,
installs the root scene, and decides which feature a deep link opens.

Business logic is not allowed in: views, `App` or `Scene` types, view modifiers,
and extension targets. An extension — a widget, an intent — calls the same
feature or core module the app does.

## Dependency injection: swift-dependencies

The pack's DI is **swift-dependencies** (Point-Free), which the app adds
through SwiftPM in `Tuist/Package.swift`; no pack lands the dependency.

- **Every client is registered as a dependency** with a live value, a test
  value and, where it matters for previews, a preview value. The test value is
  *unimplemented* by default — the library fails a test that reaches a live
  dependency it did not override — which is the property that keeps tests
  off the network.
- **Models read dependencies through the `@Dependency` property wrapper**,
  marked `@ObservationIgnored` so a dependency is never tracked as observable
  state.
- **Never construct a client inside a model.** A model that creates its own
  `URLSession`, file manager or date is untestable at exactly the point that
  matters.
- **SwiftUI's environment is for view concerns** — the theme, size class,
  locale, the model a subtree reads. It is not a service locator for clients:
  a model has no environment, and a client passed down the view tree is a
  dependency that skipped its test value.

How the overrides are used in tests and previews is [testing](testing.md)'s.

## Module boundaries

- `internal` by default; a module's `public` surface is what its dependants
  genuinely need — the model's intent methods and read state, the view that
  hosts the feature.
- No feature imports another feature. Shared needs move down into core, or
  become a client.
- The design-system views — the ones that apply the semantic tokens — live in
  core, and no feature restyles a primitive locally. See
  [UI composition](ui-composition.md).

## Style

- One primary type per file, named for it.
- A view's `body` reads top to bottom as layout. Extract a subview the moment
  a section has its own state or its own reason to change — a subview struct,
  not a helper method returning `some View`, so SwiftUI can skip it
  (see [performance](performance.md)).
- Previews are part of the view: every screen-level view has one per
  meaningful state, fed by preview dependencies, never by the network.
- The format and lint gates are swift-format and SwiftLint through the repo's
  `code:format` and `code:lint` tasks; a rule is disabled in configuration with
  a reason, never inline without one.
