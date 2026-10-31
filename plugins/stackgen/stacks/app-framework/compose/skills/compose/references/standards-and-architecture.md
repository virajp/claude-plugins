# Jetpack Compose — standards & architecture

The app follows Android's recommended architecture: a **UI layer** and a
**data layer**, with a **domain layer** of use cases only where business logic
is shared by several ViewModels. Layers talk through coroutines and flows.

## The UI layer

- **One `ViewModel` per screen**, scoped to the screen's navigation destination.
  Never one per reusable composable, never one shared by unrelated screens.
- **It exposes one `uiState: StateFlow<<Screen>UiState>`.** The UI state is an
  immutable data class (or a sealed interface when the states are exclusive:
  loading, content, error) holding everything the screen draws. Built from a
  repository stream with
  `stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), initial)`; a
  screen with no stream holds a private `MutableStateFlow` and exposes it read
  only.
- **Events go in as method calls** — `onRefresh()`, `onItemSelected(id)` — and
  state comes out as the flow. That is unidirectional data flow: the screen
  never mutates what it was given.
- **One-off effects are state too.** A message to show or a navigation to make
  is a field in the UI state the screen consumes and then reports consumed —
  not a `SharedFlow` of events that is lost when nobody is collecting.
- **The ViewModel knows nothing of Android's UI.** No `Context`, `Activity`,
  `Resources` or `NavController` in it, and never `AndroidViewModel`. Strings
  are resource ids or a small text model the screen resolves.

## The screen

- **Two composables per screen.** A route-level `<Screen>Route` takes the
  ViewModel (`hiltViewModel()`), collects `uiState` with
  `collectAsStateWithLifecycle()` and passes plain values and lambdas down. The
  stateless `<Screen>Screen(uiState, onEvent…)` is what previews, goldens and
  UI tests call — no ViewModel, no Hilt.
- **Business logic is never in a composable.** A composable decides how state
  looks; deciding what the state is belongs to the ViewModel or below.

## The data layer

- **Repositories are the only entry to data**, even with one source. They
  expose `Flow`s for data that changes and `suspend` functions for one-shot
  operations, and they own the decision of which source answers — the Room
  database first, the network to refresh it. See
  [data & networking](data-and-networking.md).
- **Data sources are private to the data layer.** No ViewModel or composable
  touches a DAO, an HTTP client or DataStore directly.

## Dependency injection

**Hilt is the composition root.** The `Application` class is `@HiltAndroidApp`,
`MainActivity` is `@AndroidEntryPoint`, ViewModels are `@HiltViewModel` with
constructor injection, and bindings live in `@Module`s installed in the
narrowest component that fits. No service locator, no manual singletons. Setup
order and the testing wiring are [Hilt](integrations/hilt.md)'s.

## Modules

- **Start with `:app` alone**; split a feature into its own module when a second
  person or a build-time problem asks for it, not before.
- **`core:model`** holds plain Kotlin types; **`core:data`** the repositories;
  **`core:designsystem`** the theme and shared components. A feature module
  depends on core modules and never on another feature.
- **Coroutines are injected.** A dispatcher is a constructor parameter, so a
  test swaps it; `Dispatchers.IO` is never hard-coded in a repository.
