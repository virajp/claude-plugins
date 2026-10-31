# Jetpack Compose — state & recomposition

Compose redraws by **recomposition**: when a `State` a composable read changes,
that composable runs again. Everything here follows from that.

## Where state lives

| State                                          | Lives in                                       |
| ---------------------------------------------- | ---------------------------------------------- |
| What the screen shows — data, loading, errors  | the screen's `ViewModel`, as `StateFlow`       |
| UI element state — scroll, expansion, focus    | the composable, `remember` / `rememberSaveable` |
| Several elements' shared UI logic              | a plain state-holder class, `remember`ed       |
| What survives process death                    | `rememberSaveable`, or `SavedStateHandle` in the ViewModel |

- **Hoist state to the lowest common owner** of everything that reads and
  writes it, and no higher. A stateless composable takes `value` and
  `onValueChange`; the caller owns the state.
- **`remember` survives recomposition, not configuration change.**
  `rememberSaveable` survives rotation and process death, for small, saveable
  values only — an id, a query string — never a list of loaded data.
- **Collect flows with `collectAsStateWithLifecycle()`**, which stops when the
  screen is not visible. Plain `collectAsState()` keeps collecting in the
  background.

## Recomposition rules

- **Composables are idempotent and side-effect free.** They may run in any
  order, many times, or be skipped. Never write to a variable, start a request
  or log analytics in a composable's body.
- **Side effects go through effect APIs.** `LaunchedEffect(key)` for work tied
  to a key's lifetime, `DisposableEffect` for something to undo,
  `rememberCoroutineScope()` for work an event starts, `SideEffect` to publish
  to non-Compose code after a successful composition.
- **Read state as late as possible.** Passing a lambda (`{ scrollState.value }`)
  instead of the value defers the read to the layout or draw phase, so a scroll
  does not recompose the whole tree.
- **`derivedStateOf`** when a frequently changing state feeds a rarely changing
  result — "is the first item scrolled off" from the scroll offset.

## Stability

Compose skips a composable whose parameters are all **stable and equal**.

- **UI state classes are immutable** — `val` fields, read-only collections.
  With strong skipping (the default in current Compose compilers) unstable
  parameters are compared by identity, so a new list instance with the same
  contents still recomposes; produce new state only when it changed.
- **Prefer `kotlinx.collections.immutable`** or `@Immutable` data classes for
  lists that cross many composables.
- Measuring before fixing is [performance](performance.md)'s.

## Anti-patterns

| Anti-pattern                                   | Instead                                     |
| ---------------------------------------------- | ------------------------------------------- |
| `mutableStateOf` in a ViewModel for screen data | one `StateFlow` of UI state                |
| A `MutableList` in state, mutated in place     | a new immutable list, or `mutableStateListOf` |
| Network call in a composable body              | an event to the ViewModel                   |
| `LaunchedEffect(Unit)` reading a changing value | key the effect on that value               |
| Passing the ViewModel down the tree            | pass state and lambdas                      |
