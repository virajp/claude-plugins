# Jetpack Compose — Navigation Compose

**Wiring, configuration and anti-patterns only.** The route model and the back
stack rules are [navigation](../navigation.md)'s; the `NavHost` and
`NavController` API is Context7's at use time.

## Setup order

1. **Catalog entries** for `androidx.navigation:navigation-compose` and
   `kotlinx-serialization-json`, and the Kotlin serialization compiler plugin —
   type-safe routes are `@Serializable` types.
2. **Apply the serialization plugin** in every module that declares a route.
3. **Create the `NavController` once**, with `rememberNavController()` in the
   app's root composable, and pass it to the single `NavHost` in `:app`. No
   other composable receives it.
4. **Each feature contributes a graph extension** on `NavGraphBuilder` and a
   navigate extension on `NavController`; `:app` calls them inside the
   `NavHost` block.
5. **Deep links** are declared on the destination with
   `navDeepLink<Route>(basePath)`, and the same scheme and host are declared
   as intent filters on `MainActivity` in the manifest. App links add
   `android:autoVerify="true"` and the site serves
   `/.well-known/assetlinks.json` with the signing certificate's fingerprint.
6. **Predictive back**: `android:enableOnBackInvokedCallback="true"` on the
   application in the manifest.

## Structure

- **ViewModels read route arguments from `SavedStateHandle`**
  (`toRoute<Route>()`), so they survive process death and need no argument
  plumbing through the composable.
- **A ViewModel shared by a flow** is scoped to the nested graph's back stack
  entry, obtained with `hiltViewModel(parentEntry)`.
- **R8 keeps route classes** through the serialization plugin's generated
  rules; a route that breaks only in release is a missing keep rule.

## Testing

- **Graph wiring** is tested with a `TestNavHostController` in a Compose UI
  test: navigate, then assert the current destination.
- **Deep links** are tested by launching `MainActivity` with the intent and
  asserting the screen shown and the back stack under it.

## Anti-patterns

| Anti-pattern                                  | Instead                                     |
| --------------------------------------------- | ------------------------------------------- |
| String routes with manual argument parsing    | `@Serializable` route types                 |
| `NavController` passed into features or ViewModels | navigate lambdas from `:app`           |
| Parcelable objects as arguments               | ids, loaded by the destination              |
| Deep link without a matching intent filter    | declare both, test both                     |
| A second `NavHost` for a tab                  | nested graphs in the one host               |
