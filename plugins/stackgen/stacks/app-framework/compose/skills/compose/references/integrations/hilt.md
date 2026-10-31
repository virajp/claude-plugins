# Jetpack Compose — Hilt

**Wiring, configuration and anti-patterns only.** Annotations' full API and
scoping details are Context7's at use time.

Hilt is the app's dependency-injection container and its composition root. It
generates its components at compile time with KSP.

## Setup order

1. **Catalog entries** for the Hilt Gradle plugin, `hilt-android`,
   `hilt-compiler`, `androidx.hilt:hilt-navigation-compose` and
   `hilt-android-testing`, plus the KSP plugin.
2. **Apply the KSP and Hilt plugins** in every module that declares an
   injected class or a module; the compiler is a `ksp(...)` dependency, never
   `kapt`.
3. **`@HiltAndroidApp` on the `Application` class**, named in the manifest's
   `android:name`. This generates the singleton component.
4. **`@AndroidEntryPoint` on `MainActivity`** — the single activity.
5. **`@HiltViewModel` with `@Inject constructor`** on each screen's ViewModel;
   the route composable obtains it with `hiltViewModel()`, which scopes it to
   the navigation destination (or a nested graph's entry, for a shared one).
6. **Modules** (`@Module @InstallIn(SingletonComponent::class)`) bind
   interfaces to implementations with `@Binds` and build third-party objects —
   the HTTP client, the Room database — with `@Provides`. One module per data
   area, in the module that owns the implementation.
7. **Test wiring**: a custom instrumentation runner returning
   `HiltTestApplication`, named in `testInstrumentationRunner`; Robolectric
   tests that need injection use `@HiltAndroidTest` with
   `@Config(application = HiltTestApplication::class)`.

## Structure

- **Scope to the narrowest component.** `@Singleton` only for what must be one
  per process (the database, the HTTP client); a ViewModel's collaborators are
  unscoped or `@ViewModelScoped`.
- **Dispatchers are bound with qualifiers** (`@IoDispatcher`), so tests replace
  them.
- **Stateless screens take no injected objects.** Only the route composable
  touches Hilt, through `hiltViewModel()`; previews and goldens never need the
  graph.

## Testing

- **`@TestInstallIn` replaces a production module** for every test in the
  module — the fake network in place of the real client.
- **`@BindValue`** on a test field binds one fake for one test class.
- **`HiltAndroidRule` runs first** (`order = 0`), before the Compose rule, and
  `inject()` is called before the test body.

## Anti-patterns

| Anti-pattern                                     | Instead                                  |
| ------------------------------------------------ | ---------------------------------------- |
| kapt for the Hilt compiler                       | KSP                                      |
| `@Singleton` on everything                       | the narrowest scope that is correct      |
| `hiltViewModel()` deep in reusable composables   | only in the route; pass state down       |
| `EntryPointAccessors` to reach a dependency from a composable | inject into the ViewModel   |
| Injecting `Context` into a ViewModel             | a data-layer wrapper that owns the `Context` |
