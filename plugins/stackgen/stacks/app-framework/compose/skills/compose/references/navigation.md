# Jetpack Compose — navigation & routing

The stack uses **Navigation Compose** with **type-safe routes**: one `NavHost`
in `:app`, each destination a `@Serializable` Kotlin type. Wiring — the
dependency, the serialization plugin, deep-link declarations — is
[Navigation Compose](integrations/navigation-compose.md)'s; this reference is
the route model.

## The route model

- **A route is a type, never a string.** `@Serializable data object Home`,
  `@Serializable data class Detail(val id: String)`. Arguments are the type's
  properties; a destination reads them with `toRoute<Detail>()` from its back
  stack entry, or the ViewModel reads them from `SavedStateHandle`.
- **Pass ids, never objects.** A destination takes the id of what it shows and
  loads it from the repository. A whole object in a route is serialized into
  the back stack, stale the moment it changes, and lost to a deep link.
- **One `NavHost`, feature graphs inside it.** Each feature module contributes
  an extension on `NavGraphBuilder`
  (`fun NavGraphBuilder.detailScreen(onBack: () -> Unit)`) and a
  `NavController.navigateToDetail(id)` extension; `:app` assembles them.
  Features never see the `NavController` itself — they get lambdas.
- **Nested graphs** group a flow (onboarding, checkout) so it can be popped as
  one and can scope a shared ViewModel to the graph's back stack entry.

## The back stack

- **System back pops the stack.** Never intercept back except to confirm
  discarding unsaved work, with `BackHandler`. Predictive back is on: the
  manifest opts in and transitions are the library's.
- **Navigating to a top-level destination** (a bottom-bar or rail item) uses
  `popUpTo(startDestination) { saveState = true }`, `launchSingleTop = true`
  and `restoreState = true`, so each tab keeps its own stack and re-selecting a
  tab does not stack copies.
- **After a completed flow, pop it.** Finishing sign-up navigates to home with
  `popUpTo<Onboarding> { inclusive = true }`, so back does not return into it.

## Deep links

- **Every screen a link can open is a destination with a deep link**, whose
  URI pattern maps onto the route type's properties. The manifest's intent
  filters list the same hosts, and app links are verified with the site's
  `assetlinks.json`.
- **A deep link builds a synthetic back stack** to the start destination, so
  back from a linked screen lands inside the app rather than leaving it.
- **A deep-linked screen loads its own data** from the id it was given — it
  cannot assume a previous screen fetched anything.

## Adaptive navigation

Bottom bar on a compact window, navigation rail on medium, a permanent drawer
or rail on expanded — chosen from the window size class, over the same
destinations. See [phone & tablet](platforms/phone-and-tablet.md).
