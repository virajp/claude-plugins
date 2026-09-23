# SwiftUI — state management

State is the **Observation** framework: `@Observable` models, owned with
`@State`, shared through the environment, bound with `@Bindable`. The older
`ObservableObject` / `@Published` / `@StateObject` / `@ObservedObject` family
is for code that already uses it; new state does not start there.

## Two kinds of state

- **View-local state** never leaves one view and does not outlive it — a
  toggle's expanded flag, a text field's draft, a hover or focus flag. It is a
  `@State` value property on the view. A model for this is over-engineering.
- **Feature and app state** is read or changed by more than one view, or must
  survive the view that shows it — the signed-in user, a cart, a fetched list,
  the navigation path. It lives in an `@Observable` model, never in a view's
  value properties.

## Who owns, who reads

| Situation                                  | Spelling in the view                              |
| ------------------------------------------ | ------------------------------------------------- |
| This view creates and owns the model       | `@State private var model = FeatureModel()`       |
| A parent passes the model; this view reads | a plain `let` or `var` property                   |
| This view needs bindings into the model    | `@Bindable` on the passed model                   |
| A whole subtree reads one shared model     | `.environment(model)` above, `@Environment` below |
| A value that belongs only to this view     | `@State private var` of the value type            |
| A binding a parent handed down             | `@Binding`                                        |

Three rules make the table hold:

- **Exactly one owner.** A model is created in one place and held with
  `@State` there — the app's root scene for app-wide state, the screen for
  screen state. Every other view receives it. A second `@State` holding "the
  same" model is a second model.
- **Read-only access needs no wrapper.** SwiftUI tracks every observable
  property a view's body reads, and re-evaluates that body when one changes.
  `@Bindable` is only for producing `$` bindings to hand to controls.
- **An environment model is required, not optional.** Reading an observable
  type from the environment expects it to be there and traps when it is not.
  Install it at the root the subtree hangs from; a preview installs its own.

## Where state lives

- **The model owns the source of truth for a feature**, and exposes intent
  methods — `addTapped()`, `refresh()` — rather than letting views mutate its
  properties freely. A view calls intent; the model decides.
- **Derived values are computed properties**, not stored copies kept in sync.
- **Persisted state has one home.** Data SwiftData manages is read through its
  query in the view or its context in the model — see
  [data & networking](data-and-networking.md) — never mirrored into a second
  observable array.
- **Navigation state is state.** The path a stack shows is a property of a
  model the app owns, which is what makes deep links and restoration possible —
  see [navigation](navigation.md).
- **Settings go through `@AppStorage` only for simple view preferences.**
  Anything a model or a test must read goes through a client.

## Keep observation narrow

A body re-evaluates when any observable property it read changes. So:

- Read in a view only what that view renders. A list row that reads the whole
  model re-renders on every change to the model.
- Pass a row the element it shows, not the collection it came from.
- Mark a model property `@ObservationIgnored` when views must never track it —
  a cache, a dependency, a task handle.

The rebuild cost itself is [performance](performance.md)'s.
